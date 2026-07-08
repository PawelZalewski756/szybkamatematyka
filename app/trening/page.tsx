"use client";

import {
  examTypeForKey,
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";
import { buildTreningTreeFromTasks } from "@/lib/trening/dynamic-tree";
import type {
  CategoryWithProgress,
  ExamWithProgress,
  TrainingTopicWithProgress,
} from "@/lib/trening/progress";
import { buildTopicHref } from "@/lib/trening/slugs";
import { EmptyState } from "@/components/feedback/EmptyState";
import { fetchProfileAllowEmpty } from "@/lib/supabase/profiles";
import { fetchSolvedTaskIds } from "@/lib/supabase/solved-tasks";
import { fetchTasksForTree } from "@/lib/supabase/tasks";
import { fetchMaterialSummariesForExam } from "@/lib/supabase/materials";
import type { TheoryTier } from "@/lib/trening/theory-content";
import type { TopicStatus } from "@/types/database";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Play,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PATH_BANNER_KEY = "sm_trening_path_banner_v1";
const ONBOARDING_XP_MAX = 100;

function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function topicMatchesQuery(
  categoryName: string,
  categoryId: string,
  topicName: string,
  topicId: string,
  query: string,
): boolean {
  if (!query) return true;
  const haystack = normalizeSearchText(
    `${categoryName} ${categoryId} ${topicName} ${topicId}`,
  );
  return haystack.includes(query);
}

function filterExamByQuery(
  exam: ExamWithProgress,
  rawQuery: string,
): ExamWithProgress {
  const query = normalizeSearchText(rawQuery);
  if (!query) return exam;

  const categories = exam.categories
    .map((category) => {
      const categoryMatches = topicMatchesQuery(
        category.name,
        category.id,
        "",
        "",
        query,
      );
      const topics = category.topics.filter((topic) =>
        topicMatchesQuery(
          category.name,
          category.id,
          topic.name,
          topic.id,
          query,
        ),
      );
      if (categoryMatches) return category;
      if (topics.length > 0) return { ...category, topics };
      return null;
    })
    .filter((c): c is CategoryWithProgress => c !== null);

  return { ...exam, categories };
}

function countTopics(exam: ExamWithProgress): number {
  return exam.categories.reduce((n, c) => n + c.topics.length, 0);
}

type TopicCardFilter = "all" | "incomplete" | "completed";
type TopicSort = "az" | "progress";

function filterTopicsByStatus(
  exam: ExamWithProgress,
  filter: TopicCardFilter,
): ExamWithProgress {
  if (filter === "all") return exam;

  const categories = exam.categories
    .map((category) => {
      const topics = category.topics.filter((topic) => {
        if (topic.total === 0) return false;
        if (filter === "completed") return topic.status === "completed";
        return topic.status !== "completed";
      });
      if (topics.length === 0) return null;
      return { ...category, topics };
    })
    .filter((c): c is CategoryWithProgress => c !== null);

  return { ...exam, categories };
}

function sortTopicsInExam(
  exam: ExamWithProgress,
  sort: TopicSort,
): ExamWithProgress {
  const categories = exam.categories.map((category) => {
    const topics = [...category.topics];
    if (sort === "az") {
      topics.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    } else {
      topics.sort(
        (a, b) =>
          b.percent - a.percent ||
          a.name.localeCompare(b.name, "pl"),
      );
    }
    return { ...category, topics };
  });
  return { ...exam, categories };
}

function findFirstPlayableTopic(
  exam: ExamWithProgress,
  examKey: SelectedExam,
): string | null {
  for (const category of exam.categories) {
    for (const topic of category.topics) {
      if (topic.total > 0) {
        return buildTopicHref(examKey, category.id, topic.id);
      }
    }
  }
  return null;
}

type SelectedExam = TreningExamKey;

const EXAM_OPTIONS: { key: SelectedExam; label: string }[] = [
  { key: "matura_podstawowa", label: "Matura Podstawowa" },
  { key: "8_klasa", label: "Egzamin 8-klasisty" },
];

function ExamSwitcher({
  selected,
  onChange,
}: {
  selected: SelectedExam;
  onChange: (exam: SelectedExam) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Wybór egzaminu"
      className="mx-auto flex w-full max-w-lg rounded-xl border border-white/[0.08] bg-white/[0.03] p-1"
    >
      {EXAM_OPTIONS.map((opt) => {
        const isActive = selected === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition sm:text-sm ${
              isActive
                ? "bg-teal-500/15 text-teal-200"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function TopicStatusIcon({ status }: { status: TopicStatus }) {
  if (status === "completed") {
    return (
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-emerald-400"
        aria-label="Ukończone"
      />
    );
  }
  if (status === "available") {
    return (
      <Play
        className="h-5 w-5 shrink-0 text-teal-400"
        aria-label="Dostępne"
      />
    );
  }
  return (
    <span className="text-xs font-medium text-slate-600" aria-label="Wkrótce">
      Wkrótce
    </span>
  );
}

function theoryLabel(tier: TheoryTier): string | null {
  if (tier === "none") return null;
  if (tier === "comprehensive" || tier === "full") return "Teoria";
  return "Teoria (skrót)";
}

function TopicCard({
  examKey,
  category,
  topic,
  highlighted,
  theoryTier,
}: {
  examKey: SelectedExam;
  category: CategoryWithProgress;
  topic: TrainingTopicWithProgress;
  highlighted?: boolean;
  theoryTier: TheoryTier;
}) {
  const isComingSoon = topic.status === "coming_soon";
  const isCompleted = topic.status === "completed";
  const canPlay = topic.total > 0;
  const href = buildTopicHref(examKey, category.id, topic.id);
  const progressLabel = `${topic.solved}/${topic.total}`;
  const theory = theoryLabel(theoryTier);

  const cardInner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <TopicStatusIcon status={topic.status} />
        {theory && (
          <span className="text-xs text-slate-500">{theory}</span>
        )}
      </div>
      <h3
        className={`mt-3 text-base font-semibold leading-snug sm:text-lg ${
          isCompleted
            ? "text-emerald-200"
            : isComingSoon
              ? "text-slate-600"
              : "text-white"
        }`}
      >
        {topic.name}
      </h3>
      {canPlay ? (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-slate-500">
            <span>Postęp</span>
            <span>{progressLabel}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-300"
              style={{ width: `${topic.percent}%` }}
            />
          </div>
        </div>
      ) : (
        <span className="mt-4 text-xs text-slate-600">Brak zadań</span>
      )}
    </>
  );

  const cardClass =
    "flex h-full flex-col rounded-xl border p-5 transition " +
    (highlighted
      ? "border-teal-500/30 bg-teal-500/5"
      : isComingSoon
        ? "cursor-default border-white/[0.05] bg-white/[0.02] text-slate-600"
        : isCompleted
          ? "border-emerald-500/20 bg-emerald-500/[0.03]"
          : "surface-card hover:border-teal-500/20");

  if (!canPlay) {
    return <div className={cardClass}>{cardInner}</div>;
  }

  return (
    <Link href={href} className={`${cardClass} block`}>
      {cardInner}
    </Link>
  );
}

function CategorySection({
  examKey,
  category,
  highlightTopicHref,
  theoryByTopic,
}: {
  examKey: SelectedExam;
  category: CategoryWithProgress;
  highlightTopicHref?: string | null;
  theoryByTopic: Map<string, TheoryTier>;
}) {
  return (
    <section className="mt-12 first:mt-10">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            {category.name}
          </h2>
        </div>
        <div className="w-full max-w-xs sm:max-w-[14rem]">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Postęp działu</span>
            <span>{category.progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-teal-500"
              style={{ width: `${category.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.topics.map((topic) => {
          const href = buildTopicHref(examKey, category.id, topic.id);
          return (
            <TopicCard
              key={topic.id}
              examKey={examKey}
              category={category}
              topic={topic}
              highlighted={
                !!highlightTopicHref && highlightTopicHref === href
              }
              theoryTier={theoryByTopic.get(`${category.id}:${topic.id}`) ?? "none"}
            />
          );
        })}
      </div>
    </section>
  );
}

function emptyExamFor(key: SelectedExam): ExamWithProgress {
  return buildTreningTreeFromTasks([], new Set(), TRAINING_CURRICULUM[key]);
}

export default function TreningPage() {
  const [selectedExam, setSelectedExam] =
    useState<SelectedExam>("matura_podstawowa");
  const [exam, setExam] = useState<ExamWithProgress>(() =>
    emptyExamFor("matura_podstawowa"),
  );
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<TopicCardFilter>("all");
  const [topicSort, setTopicSort] = useState<TopicSort>("az");
  const [showPathBanner, setShowPathBanner] = useState(false);
  const [pathBannerHref, setPathBannerHref] = useState<string | null>(null);
  const [theoryByTopic, setTheoryByTopic] = useState<Map<string, TheoryTier>>(
    new Map(),
  );

  const loadProgress = useCallback(async (examKey: SelectedExam) => {
    setLoading(true);
    try {
      const examType = examTypeForKey(examKey);
      const [tasks, materialSummaries] = await Promise.all([
        fetchTasksForTree(examType),
        fetchMaterialSummariesForExam(examType).catch(() => []),
      ]);
      let solvedIds = new Set<string>();

      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        solvedIds = await fetchSolvedTaskIds(user.id);
      }

      setExam(
        buildTreningTreeFromTasks(tasks, solvedIds, TRAINING_CURRICULUM[examKey]),
      );

      const theoryMap = new Map<string, TheoryTier>();
      for (const summary of materialSummaries) {
        theoryMap.set(`${summary.category}:${summary.topic}`, summary.tier);
      }
      setTheoryByTopic(theoryMap);
    } catch {
      setExam(emptyExamFor(examKey));
      setTheoryByTopic(new Map());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProgress(selectedExam);
  }, [selectedExam, loadProgress]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput), 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (loading) return;
    try {
      if (localStorage.getItem(PATH_BANNER_KEY)) return;
    } catch {
      return;
    }

    let cancelled = false;

    void (async () => {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const solvedIds = await fetchSolvedTaskIds(user.id);
      if (solvedIds.size > 0 || cancelled) return;

      const profile = await fetchProfileAllowEmpty(user.id);
      const xp = profile?.xp ?? 0;
      if (xp >= ONBOARDING_XP_MAX || cancelled) return;

      const href = findFirstPlayableTopic(exam, selectedExam);
      if (!href || cancelled) return;

      setPathBannerHref(href);
      setShowPathBanner(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, exam, selectedExam]);

  const dismissPathBanner = () => {
    try {
      localStorage.setItem(PATH_BANNER_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowPathBanner(false);
  };

  const handleExamChange = (key: SelectedExam) => {
    setSelectedExam(key);
    setExam(emptyExamFor(key));
    setTheoryByTopic(new Map());
    setSearchInput("");
    setDebouncedQuery("");
    setTopicFilter("all");
    setTopicSort("az");
  };

  const filteredExam = useMemo(() => {
    const searched = filterExamByQuery(exam, debouncedQuery);
    const statusFiltered = filterTopicsByStatus(searched, topicFilter);
    return sortTopicsInExam(statusFiltered, topicSort);
  }, [exam, debouncedQuery, topicFilter, topicSort]);

  const matchedTopicCount = useMemo(
    () => countTopics(filteredExam),
    [filteredExam],
  );

  const examSubtitle =
    selectedExam === "matura_podstawowa"
      ? "Matura podstawowa — działy i tematy z bazy zadań. Postęp z areny."
      : "Egzamin ósmoklasisty — działy i tematy z bazy zadań. Postęp z areny.";

  const overallProgress = useMemo(() => {
    const cats = exam.categories;
    if (cats.length === 0) return 0;
    const totalTasks = cats.reduce(
      (sum, c) => sum + c.topics.reduce((s, t) => s + t.total, 0),
      0,
    );
    const solvedTasks = cats.reduce(
      (sum, c) => sum + c.topics.reduce((s, t) => s + t.solved, 0),
      0,
    );
    if (totalTasks === 0) return 0;
    return Math.round((solvedTasks / totalTasks) * 100);
  }, [exam.categories]);

  const availableTopics = useMemo(
    () =>
      exam.categories.reduce(
        (n, c) => n + c.topics.filter((t) => t.total > 0).length,
        0,
      ),
    [exam.categories],
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="page-container relative z-10 flex w-full flex-1 flex-col py-8 sm:py-12">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trening
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
            {examSubtitle}
          </p>
        </header>

        <div className="mx-auto mt-6 w-full max-w-lg px-1">
          <ExamSwitcher selected={selectedExam} onChange={handleExamChange} />
        </div>

        <div className="mx-auto mt-6 w-full max-w-lg px-1">
          <label className="sr-only" htmlFor="trening-search">
            Szukaj tematu
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              aria-hidden
            />
            <input
              id="trening-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Szukaj działu lub tematu…"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/25"
            />
          </div>
          {debouncedQuery.trim() && !loading && (
            <p className="mt-2 text-center text-xs text-slate-500">
              Znaleziono {matchedTopicCount}{" "}
              {matchedTopicCount === 1
                ? "temat"
                : matchedTopicCount >= 2 && matchedTopicCount <= 4
                  ? "tematy"
                  : "tematów"}
            </p>
          )}
        </div>

        <div className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-3 px-1 xl:max-w-4xl">
          <div
            role="group"
            aria-label="Filtr tematów"
            className="flex flex-wrap justify-center gap-2"
          >
            {(
              [
                { id: "all" as const, label: "Wszystkie" },
                { id: "incomplete" as const, label: "Nieukończone" },
                { id: "completed" as const, label: "Ukończone" },
              ] as const
            ).map((opt) => {
              const active = topicFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTopicFilter(opt.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-teal-500/30 bg-teal-500/10 text-teal-200"
                      : "border-white/[0.08] bg-white/[0.02] text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div
            role="group"
            aria-label="Sortowanie tematów"
            className="flex flex-wrap justify-center gap-2"
          >
            {(
              [
                { id: "az" as const, label: "A-Z" },
                { id: "progress" as const, label: "Postęp ↓" },
              ] as const
            ).map((opt) => {
              const active = topicSort === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTopicSort(opt.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-teal-500/30 bg-teal-500/10 text-teal-200"
                      : "border-white/[0.08] bg-white/[0.02] text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {showPathBanner && pathBannerHref && !loading && (
          <div className="mx-auto mt-6 flex max-w-lg items-start gap-3 surface-card px-4 py-3.5">
            <p className="min-w-0 flex-1 text-sm text-slate-300">
              Zacznij od pierwszego tematu —{" "}
              <Link
                href={pathBannerHref}
                className="font-medium text-teal-400 hover:text-teal-300"
              >
                przejdź do lekcji
              </Link>
            </p>
            <button
              type="button"
              onClick={dismissPathBanner}
              className="shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-white/[0.05] hover:text-slate-300"
              aria-label="Zamknij podpowiedź"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mx-auto mt-8 flex max-w-lg items-center gap-3 surface-card px-5 py-4">
          <GraduationCap className="h-8 w-8 shrink-0 text-teal-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">{exam.shortLabel}</p>
            <p className="truncate text-base font-semibold text-white">{exam.label}</p>
            <p className="mt-1 text-xs text-slate-500">
              {loading ? (
                <Loader2 className="inline h-3 w-3 animate-spin" />
              ) : (
                <>
                  Postęp {overallProgress}% · {availableTopics} tematów
                </>
              )}
            </p>
          </div>
          <BookOpen className="h-7 w-7 shrink-0 text-slate-600" aria-hidden />
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          </div>
        ) : (
          <div>
              {exam.categories.length === 0 ? (
                <p className="mt-16 text-center text-sm text-zinc-500">
                  Brak zadań w bazie dla tego egzaminu. Uruchom{" "}
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">
                    npm run seed:trening-tasks
                  </code>{" "}
                  lub dodaj zadania w Supabase.
                </p>
              ) : filteredExam.categories.length === 0 ? (
                <EmptyState
                  className="mt-16"
                  icon={Search}
                  title={
                    debouncedQuery.trim()
                      ? "Brak pasujących tematów"
                      : topicFilter === "completed"
                        ? "Brak ukończonych tematów"
                        : topicFilter === "incomplete"
                          ? "Wszystko ukończone!"
                          : "Brak tematów do wyświetlenia"
                  }
                  description={
                    debouncedQuery.trim()
                      ? `Nie znaleziono tematów dla „${debouncedQuery.trim()}”. Spróbuj innej frazy.`
                      : topicFilter === "completed"
                        ? "Rozwiąż zadania w arenie, aby ukończyć pierwsze tematy."
                        : topicFilter === "incomplete"
                          ? "Wszystkie aktywne tematy są ukończone — gratulacje! 🎉"
                          : "Zmień filtr lub wyszukiwanie, aby zobaczyć tematy."
                  }
                />
              ) : (
                filteredExam.categories.map((category) => (
                  <CategorySection
                    key={category.id}
                    examKey={selectedExam}
                    category={category}
                    highlightTopicHref={
                      showPathBanner ? pathBannerHref : null
                    }
                    theoryByTopic={theoryByTopic}
                  />
                ))
              )}
          </div>
        )}
      </div>
    </div>
  );
}
