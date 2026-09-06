"use client";

import {
  examTypeForKey,
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
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchProfileAllowEmpty } from "@/lib/supabase/profiles";
import { fetchSolvedTaskIds } from "@/lib/supabase/solved-tasks";
import {
  fetchTasksForTree,
  type TaskTreeRow,
} from "@/lib/supabase/tasks";
import {
  fetchMaterialSummariesForExam,
  type MaterialTopicSummary,
} from "@/lib/supabase/materials";
import { mergeTheorySummaries } from "@/lib/trening/seed/theory-index";
import type { TheoryTier } from "@/lib/trening/theory-content";
import type { ExamType } from "@/types/database";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  Target,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PATH_BANNER_KEY = "sm_trening_path_banner_v1";
const ONBOARDING_XP_MAX = 100;

const taskTreeCache = new Map<ExamType, Promise<TaskTreeRow[]>>();
const materialSummaryCache = new Map<ExamType, Promise<MaterialTopicSummary[]>>();
const solvedTaskCache = new Map<string, Promise<Set<string>>>();

function cachedTaskTree(examType: ExamType): Promise<TaskTreeRow[]> {
  const existing = taskTreeCache.get(examType);
  if (existing) return existing;

  const request = fetchTasksForTree(examType);
  taskTreeCache.set(examType, request);
  request.catch((error) => {
    if (taskTreeCache.get(examType) === request) taskTreeCache.delete(examType);
    console.warn("[szybka-matma] fetchTasksForTree:", error);
  });
  return request;
}

function cachedMaterialSummaries(
  examType: ExamType,
): Promise<MaterialTopicSummary[]> {
  const existing = materialSummaryCache.get(examType);
  if (existing) return existing;

  const request = fetchMaterialSummariesForExam(examType);
  materialSummaryCache.set(examType, request);
  request.catch((error) => {
    if (materialSummaryCache.get(examType) === request) {
      materialSummaryCache.delete(examType);
    }
    console.warn("[szybka-matma] fetchMaterialSummariesForExam:", error);
  });
  return request;
}

function cachedSolvedTaskIds(userId: string): Promise<Set<string>> {
  const existing = solvedTaskCache.get(userId);
  if (existing) return existing;

  const request = fetchSolvedTaskIds(userId);
  solvedTaskCache.set(userId, request);
  request.catch((error) => {
    if (solvedTaskCache.get(userId) === request) solvedTaskCache.delete(userId);
    console.warn("[szybka-matma] fetchSolvedTaskIds:", error);
  });
  return request;
}

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
      className="grid w-full max-w-md grid-cols-2 gap-1 rounded-xl border border-surface-border bg-background/45 p-1 text-sm"
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
            className={`rounded-lg px-3 py-2.5 text-left font-semibold transition ${
              isActive
                ? "bg-accent text-on-accent shadow-sm"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
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
  const hasTheory = theoryTier !== "none";
  const canPlay = topic.total > 0;
  const canOpen = canPlay || hasTheory;
  const isComingSoon = !canOpen;
  const isCompleted = topic.status === "completed";
  const href = buildTopicHref(examKey, category.id, topic.id);
  const theory = theoryLabel(theoryTier);
  const progress = Math.max(0, Math.min(100, topic.percent));

  const rowClass =
    "group flex min-h-14 items-center gap-3 border-l-2 border-transparent px-4 py-3.5 text-sm transition " +
    (highlighted
      ? "border-accent bg-accent-soft/40"
      : canOpen
        ? "hover:border-accent/60 hover:bg-surface-hover"
        : "opacity-50");

  const inner = (
    <>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        {isCompleted ? (
          <CheckCircle2
            className="h-4 w-4 text-success"
            aria-label="Ukończone"
          />
        ) : (
          <span
            className="h-2 w-2 rounded-full bg-surface-border transition-colors group-hover:bg-accent"
            aria-hidden
          />
        )}
      </span>
      <span className="min-w-0 flex-1 font-normal text-foreground">
        {topic.name}
      </span>
      {theory && (
        <span className="inline-flex shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
          {theory}
        </span>
      )}
      {canPlay && (
        <div
          className="hidden w-16 shrink-0 sm:block"
          role="progressbar"
          aria-label={`Postęp tematu: ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-hover">
            <div
              className="progress-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <span className="shrink-0 tabular-nums text-xs text-muted">
        {canPlay
          ? `${topic.solved}/${topic.total}`
          : isComingSoon
            ? "Wkrótce"
            : null}
      </span>
      {canOpen && (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      )}
    </>
  );

  if (!canOpen) {
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
  const playableTopics = category.topics.filter(
    (topic) => topic.total > 0,
  ).length;
  const progress = Math.max(0, Math.min(100, category.progressPercent));

  return (
    <section className="card-raised overflow-hidden xl:mt-0">
      <div className="border-b border-surface-border bg-surface-hover/30 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-overline">Dział</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              {category.name}
            </h2>
          </div>
          <span className="shrink-0 text-sm font-bold tabular-nums text-accent">
            {category.progressPercent}%
          </span>
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-hover"
          role="progressbar"
          aria-label={`Postęp działu ${category.name}: ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="progress-accent" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted">
          {playableTopics}{" "}
          {playableTopics === 1
            ? "temat z zadaniami"
            : playableTopics >= 2 && playableTopics <= 4
              ? "tematy z zadaniami"
              : "tematów z zadaniami"}
        </p>
      </div>

      <div className="divide-y divide-surface-border">
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

function TrainingOverview({
  exam,
  overallProgress,
  topicCount,
  topicsWithTasks,
}: {
  exam: ExamWithProgress;
  overallProgress: number;
  topicCount: number;
  topicsWithTasks: number;
}) {
  const progress = Math.max(0, Math.min(100, overallProgress));

  return (
    <section className="card-raised relative mt-8 overflow-hidden border-accent/25 bg-accent-soft/25 p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-overline">Aktualna ścieżka</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              {exam.label}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Wybierz dział, otwórz temat i przejdź od krótkiej teorii do zadań.
            </p>
          </div>
          <div className="flex items-baseline gap-2 sm:flex-col sm:items-end sm:gap-0">
            <span className="text-3xl font-extrabold tracking-tight text-accent">
              {overallProgress}%
            </span>
            <span className="text-xs font-semibold text-muted">ukończonego treningu</span>
          </div>
        </div>

        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-background/70"
          role="progressbar"
          aria-label={`Ogólny postęp treningu: ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="progress-accent" style={{ width: `${progress}%` }} />
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-surface-border bg-surface/70 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Target className="h-3.5 w-3.5 text-accent" aria-hidden />
              Postęp
            </dt>
            <dd className="mt-1 text-lg font-extrabold text-foreground">
              {overallProgress}%
            </dd>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface/70 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <BookOpen className="h-3.5 w-3.5 text-accent" aria-hidden />
              Tematy
            </dt>
            <dd className="mt-1 text-lg font-extrabold text-foreground">
              {topicCount}
            </dd>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface/70 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent" aria-hidden />
              Aktywne
            </dt>
            <dd className="mt-1 text-lg font-extrabold text-foreground">
              {topicsWithTasks}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function TrainingListSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="card-raised overflow-hidden">
          <div className="border-b border-surface-border bg-surface-hover/30 p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
            <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-surface-hover" />
            <div className="mt-4 h-1.5 animate-pulse rounded-full bg-surface-hover" />
          </div>
          <div className="divide-y divide-surface-border">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center gap-3 px-4 py-4">
                <div className="h-2 w-2 animate-pulse rounded-full bg-surface-hover" />
                <div className="h-4 flex-1 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-10 animate-pulse rounded bg-surface-hover" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function emptyExamFor(key: SelectedExam): ExamWithProgress {
  return mergeExamProgress(key, new Map(), new Map());
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
  const loadRequestRef = useRef(0);

  const loadProgress = useCallback(async (examKey: SelectedExam) => {
    const requestId = ++loadRequestRef.current;
    const examType = examTypeForKey(examKey);
    setLoading(true);
    setTheoryByTopic(
      new Map(
        mergeTheorySummaries(examType, []).map((summary) => [
          `${summary.category}:${summary.topic}`,
          summary.tier,
        ]),
      ),
    );

    try {
      const tasks = await cachedTaskTree(examType);
      if (requestId !== loadRequestRef.current) return;

      const taskCounts = countsFromTasks(tasks, examType);
      setExam(mergeExamProgress(examKey, taskCounts, new Map()));
      setLoading(false);

      void cachedMaterialSummaries(examType)
        .then((materialSummaries) => {
          if (requestId !== loadRequestRef.current) return;

          const theoryMap = new Map<string, TheoryTier>();
          for (const summary of mergeTheorySummaries(
            examType,
            materialSummaries,
          )) {
            theoryMap.set(`${summary.category}:${summary.topic}`, summary.tier);
          }
          setTheoryByTopic(theoryMap);
        })
        .catch(() => {
          // Seed theory remains available when the optional CMS request fails.
        });

      void (async () => {
        try {
          const { getSupabase } = await import("@/lib/supabase");
          const {
            data: { session },
          } = await getSupabase().auth.getSession();
          if (!session?.user) return;

          const solvedIds = await cachedSolvedTaskIds(session.user.id);
          if (requestId !== loadRequestRef.current) return;

          setExam(
            mergeExamProgress(
              examKey,
              taskCounts,
              solvedCountsFromTasks(tasks, solvedIds, examType),
            ),
          );
        } catch (error) {
          console.warn("[szybka-matma] hydrate training progress:", error);
        }
      })();
    } catch {
      if (requestId !== loadRequestRef.current) return;
      setExam(emptyExamFor(examKey));
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
    if (!isSupabaseConfigured()) return;
    try {
      if (localStorage.getItem(PATH_BANNER_KEY)) return;
    } catch {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const { getSupabase } = await import("@/lib/supabase");
        const {
          data: { session },
        } = await getSupabase().auth.getSession();
        const user = session?.user;
        if (!user || cancelled) return;

        const solvedIds = await cachedSolvedTaskIds(user.id);
        if (solvedIds.size > 0 || cancelled) return;

        const profile = await fetchProfileAllowEmpty(user.id);
        const xp = profile?.xp ?? 0;
        if (xp >= ONBOARDING_XP_MAX || cancelled) return;

        const href = findFirstPlayableTopic(exam, selectedExam);
        if (!href || cancelled) return;

        setPathBannerHref(href);
        setShowPathBanner(true);
      } catch (error) {
        console.warn("[szybka-matma] training path banner:", error);
      }
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
      ? "Matura podstawowa — działy i tematy dopasowane do bazy zadań."
      : "Egzamin ósmoklasisty — działy i tematy dopasowane do bazy zadań.";

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
        </header>

        <TrainingOverview
          exam={exam}
          overallProgress={overallProgress}
          topicCount={topicCount}
          topicsWithTasks={topicsWithTasks}
        />

        <div className="page-with-sidebar mt-6 sm:mt-8">
          <aside className="page-sidebar space-y-4">
            <div className="card-raised space-y-5 p-4 sm:p-5">
              <div>
                <ExamSwitcher
                  selected={selectedExam}
                  onChange={handleExamChange}
                />
              </div>

              <div>
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

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-caption">Pokaż</p>
                  <div
                    role="group"
                    aria-label="Filtr tematów"
                    className="flex flex-wrap gap-2"
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
                        className={`filter-chip ${
                          active ? "filter-chip-active" : ""
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-caption">Sortuj</p>
                  <div
                    role="group"
                    aria-label="Sortowanie tematów"
                    className="flex flex-wrap gap-2"
                  >
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
                          className={`filter-chip ${
                            active ? "filter-chip-active" : ""
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {showPathBanner && pathBannerHref && !loading && (
              <div className="card-raised border-accent/30 bg-accent-soft/30 px-4 py-3 text-sm text-muted">
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
          </aside>

          <div className="min-w-0">
        {loading ? (
          <TrainingListSkeleton />
        ) : (
          <div className="space-y-10 xl:grid xl:grid-cols-2 xl:gap-x-10 xl:gap-y-10 xl:space-y-0">
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
                          ? "Wszystkie aktywne tematy są ukończone — możesz przejść do powtórek."
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
      </div>
    </div>
  );
}
