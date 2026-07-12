"use client";

import {
  examTypeForKey,
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";
import { countsFromTasks, solvedCountsFromTasks } from "@/lib/trening/dynamic-tree";
import {
  mergeExamProgress,
  type CategoryWithProgress,
  type ExamWithProgress,
  type TrainingTopicWithProgress,
} from "@/lib/trening/progress";
import { buildTopicHref } from "@/lib/trening/slugs";
import { EmptyState } from "@/components/feedback/EmptyState";
import { fetchProfileAllowEmpty } from "@/lib/supabase/profiles";
import { fetchSolvedTaskIds } from "@/lib/supabase/solved-tasks";
import { fetchTasksForTree } from "@/lib/supabase/tasks";
import { fetchMaterialSummariesForExam } from "@/lib/supabase/materials";
import type { TheoryTier } from "@/lib/trening/theory-content";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
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
      className="flex w-full max-w-md gap-4 border-b border-surface-border text-sm"
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
            className={`border-b-2 pb-2 font-medium transition ${
              isActive
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function TopicRow({
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
  const theory = theoryLabel(theoryTier);

  const rowClass =
    "flex items-center gap-3 px-1 py-3 text-sm transition " +
    (highlighted
      ? "bg-surface-hover"
      : canPlay
        ? "hover:bg-surface-hover"
        : "opacity-50");

  const inner = (
    <>
      <span className="flex w-4 shrink-0 justify-center">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-success" aria-label="Ukończone" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1 font-normal text-foreground">{topic.name}</span>
      {theory && (
        <span className="hidden shrink-0 text-xs text-muted sm:inline">{theory}</span>
      )}
      <span className="shrink-0 tabular-nums text-xs text-muted">
        {canPlay ? `${topic.solved}/${topic.total}` : isComingSoon ? "Wkrótce" : "—"}
      </span>
      {canPlay && (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      )}
    </>
  );

  if (!canPlay) {
    return <div className={rowClass}>{inner}</div>;
  }

  return (
    <Link href={href} className={rowClass}>
      {inner}
    </Link>
  );
}

function theoryLabel(tier: TheoryTier): string | null {
  if (tier === "none") return null;
  if (tier === "comprehensive" || tier === "full") return "Teoria";
  return "Skrót";
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
    <section className="mt-10">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">{category.name}</h2>
        <span className="text-xs text-muted">{category.progressPercent}%</span>
      </div>

      <div className="divide-y divide-surface-border border-y border-surface-border">
        {category.topics.map((topic) => {
          const href = buildTopicHref(examKey, category.id, topic.id);
          return (
            <TopicRow
              key={topic.id}
              examKey={examKey}
              category={category}
              topic={topic}
              highlighted={!!highlightTopicHref && highlightTopicHref === href}
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
        mergeExamProgress(
          examKey,
          countsFromTasks(tasks, examType),
          solvedCountsFromTasks(tasks, solvedIds, examType),
        ),
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

  const topicCount = useMemo(() => countTopics(exam), [exam]);

  const topicsWithTasks = useMemo(
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
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Trening
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
            {examSubtitle}
          </p>
          {!loading && (
            <p className="mt-2 text-sm text-muted">
              {exam.label} · postęp {overallProgress}% · {topicCount} tematów
              {topicsWithTasks < topicCount && (
                <span className="text-muted">
                  {" "}
                  ({topicsWithTasks} z zadaniami)
                </span>
              )}
            </p>
          )}
        </header>

        <div className="mt-8 max-w-2xl">
          <ExamSwitcher selected={selectedExam} onChange={handleExamChange} />
        </div>

        <div className="mt-6 max-w-md">
          <label className="sr-only" htmlFor="trening-search">
            Szukaj tematu
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              id="trening-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Szukaj działu lub tematu…"
              className="input-field w-full py-2.5 pl-10 pr-4 text-sm"
            />
          </div>
          {debouncedQuery.trim() && !loading && (
            <p className="mt-2 text-xs text-muted">
              Znaleziono {matchedTopicCount}{" "}
              {matchedTopicCount === 1
                ? "temat"
                : matchedTopicCount >= 2 && matchedTopicCount <= 4
                  ? "tematy"
                  : "tematów"}
            </p>
          )}
        </div>

        <div className="mt-4 flex max-w-2xl flex-col gap-3">
          <div role="group" aria-label="Filtr tematów" className="flex flex-wrap gap-4 text-sm">
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
                  className={`transition ${
                    active
                      ? "font-semibold text-accent underline underline-offset-4"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div role="group" aria-label="Sortowanie tematów" className="flex flex-wrap gap-4 text-sm">
            {(
              [
                { id: "az" as const, label: "A–Z" },
                { id: "progress" as const, label: "Postęp" },
              ] as const
            ).map((opt) => {
              const active = topicSort === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTopicSort(opt.id)}
                  className={`transition ${
                    active
                      ? "font-semibold text-accent underline underline-offset-4"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {showPathBanner && pathBannerHref && !loading && (
          <div className="mt-6 max-w-md border border-surface-border bg-surface px-4 py-3 text-sm text-muted">
            Zacznij od pierwszego tematu —{" "}
            <Link href={pathBannerHref} className="link-plain">
              przejdź do lekcji
            </Link>
            <button
              type="button"
              onClick={dismissPathBanner}
              className="ml-3 text-muted hover:text-foreground"
              aria-label="Zamknij"
            >
              <X className="inline h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-16">
            <Loader2 className="h-7 w-7 animate-spin text-muted" />
          </div>
        ) : (
          <div className="mt-10 max-w-2xl">
              {exam.categories.length === 0 ? (
                <p className="mt-16 text-center text-sm text-muted">
                  Brak zadań w bazie dla tego egzaminu. Uruchom{" "}
                  <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">
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
