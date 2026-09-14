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
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type NextTrainingTopic = {
  href: string;
  categoryName: string;
  topic: TrainingTopicWithProgress;
};

function findNextTrainingTopic(
  exam: ExamWithProgress,
  examKey: SelectedExam,
): NextTrainingTopic | null {
  let firstPlayable: NextTrainingTopic | null = null;

  for (const category of exam.categories) {
    for (const topic of category.topics) {
      if (topic.total > 0) {
        const candidate = {
          href: buildTopicHref(examKey, category.id, topic.id),
          categoryName: category.name,
          topic,
        };
        firstPlayable ??= candidate;
        if (topic.solved < topic.total) return candidate;
      }
    }
  }

  return firstPlayable;
}

type SelectedExam = TreningExamKey;

const EXAM_OPTIONS: { key: SelectedExam; label: string }[] = [
  { key: "matura_podstawowa", label: "Matura podstawowa" },
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
    <div>
      <p className="mb-2 text-caption">Wybierz ścieżkę</p>
      <div
        role="tablist"
        aria-label="Wybór egzaminu"
        className="inline-flex w-full rounded-xl border border-surface-border bg-background/45 p-1 text-sm sm:w-auto"
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
              className={`min-w-0 flex-1 rounded-lg px-3 py-2.5 text-left font-semibold transition sm:min-w-44 ${
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
    </div>
  );
}

function TopicRow({
  examKey,
  category,
  topic,
  theoryTier,
}: {
  examKey: SelectedExam;
  category: CategoryWithProgress;
  topic: TrainingTopicWithProgress;
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
    (canOpen
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
        <span
          aria-label={theory}
          title={theory}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent"
        >
          <BookOpen className="h-3 w-3" aria-hidden />
          <span className="hidden sm:inline">{theory}</span>
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
  theoryByTopic,
}: {
  examKey: SelectedExam;
  category: CategoryWithProgress;
  theoryByTopic: Map<string, TheoryTier>;
}) {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const playableTopics = category.topics.filter(
    (topic) => topic.total > 0,
  ).length;
  const progress = Math.max(0, Math.min(100, category.progressPercent));
  const visibleTopics = showAllTopics
    ? category.topics
    : category.topics.slice(0, 4);
  const hiddenTopicCount = category.topics.length - visibleTopics.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
      <div className="border-b border-surface-border bg-surface-hover/30 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-foreground sm:text-lg">
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
        {visibleTopics.map((topic) => {
          return (
            <TopicRow
              key={topic.id}
              examKey={examKey}
              category={category}
              topic={topic}
              theoryTier={theoryByTopic.get(`${category.id}:${topic.id}`) ?? "none"}
            />
          );
        })}
      </div>

      {hiddenTopicCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAllTopics(true)}
          className="w-full border-t border-surface-border px-4 py-3 text-left text-xs font-bold text-accent transition hover:bg-surface-hover"
        >
          Pokaż jeszcze {hiddenTopicCount}{" "}
          {hiddenTopicCount === 1
            ? "temat"
            : hiddenTopicCount >= 2 && hiddenTopicCount <= 4
              ? "tematy"
              : "tematów"}
        </button>
      )}
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
    <section className="mt-7 border-y border-surface-border py-4 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-overline">Postęp ścieżki</p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {exam.label}
            <span className="ml-2 font-normal text-muted">
              · {topicCount} tematów · {topicsWithTasks} z zadaniami
            </span>
          </p>
        </div>
        <p className="text-sm font-bold text-accent">
          {overallProgress}% <span className="font-normal text-muted">ukończone</span>
        </p>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-surface-hover"
        role="progressbar"
        aria-label={`Ogólny postęp treningu: ${progress}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div className="progress-accent" style={{ width: `${progress}%` }} />
      </div>

      <p className="mt-2 text-xs text-muted">
        {overallProgress === 0
          ? "Wybierz pierwszy temat i zacznij od krótkiej teorii."
          : overallProgress === 100
            ? "Ścieżka ukończona — możesz wrócić do wybranych tematów."
            : "Każdy rozwiązany temat przybliża Cię do celu."}
      </p>
    </section>
  );
}

function NextStepCard({
  nextTopic,
  overallProgress,
}: {
  nextTopic: NextTrainingTopic;
  overallProgress: number;
}) {
  const hasStarted = overallProgress > 0 || nextTopic.topic.solved > 0;

  return (
    <Link
      href={nextTopic.href}
      className="group mt-6 flex flex-col gap-4 rounded-2xl border border-accent/35 bg-accent-soft/35 p-4 transition hover:border-accent/70 hover:bg-accent-soft/55 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="icon-chip h-10 w-10 shrink-0">
          <BookOpen className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-overline">
            {hasStarted ? "Następny krok" : "Zacznij tutaj"}
          </p>
          <h2 className="mt-1 truncate text-base font-extrabold text-foreground sm:text-lg">
            {nextTopic.topic.name}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {nextTopic.categoryName} · {nextTopic.topic.total} zadań
            {nextTopic.topic.solved > 0
              ? ` · ${nextTopic.topic.solved}/${nextTopic.topic.total} rozwiązanych`
              : ""}
          </p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-accent">
        Otwórz temat
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </span>
    </Link>
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

  const nextTopic = useMemo(
    () => findNextTrainingTopic(sortTopicsInExam(exam, "az"), selectedExam),
    [exam, selectedExam],
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
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Trening
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
              {examSubtitle}
            </p>
          </div>
          <ExamSwitcher
            selected={selectedExam}
            onChange={handleExamChange}
          />
        </header>

        <TrainingOverview
          exam={exam}
          overallProgress={overallProgress}
          topicCount={topicCount}
          topicsWithTasks={topicsWithTasks}
        />

        {!loading && nextTopic && (
          <NextStepCard
            nextTopic={nextTopic}
            overallProgress={overallProgress}
          />
        )}

        <section className="mt-8" aria-label="Przeglądanie tematów">
          <div className="flex flex-col gap-4 border-y border-surface-border py-4 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
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
              <p className="mt-2 text-xs text-muted" aria-live="polite">
                {loading
                  ? "Ładowanie tematów…"
                  : debouncedQuery.trim()
                    ? `Znaleziono ${matchedTopicCount} ${
                        matchedTopicCount === 1
                          ? "temat"
                          : matchedTopicCount >= 2 && matchedTopicCount <= 4
                            ? "tematy"
                            : "tematów"
                      }`
                    : `${matchedTopicCount} tematów`}
              </p>
            </div>

            <div
              role="group"
              aria-label="Filtr tematów"
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-caption mr-1">Pokaż</span>
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

            <label className="flex items-center gap-2 lg:shrink-0">
              <span className="text-caption">Sortuj</span>
              <select
                id="topic-sort"
                aria-label="Sortowanie tematów"
                value={topicSort}
                onChange={(e) => setTopicSort(e.target.value as TopicSort)}
                className="input-field min-w-28 py-2.5 text-sm"
              >
                <option value="az">A–Z</option>
                <option value="progress">Postęp</option>
              </select>
            </label>
          </div>
        </section>

        <div className="mt-6">
          {loading ? (
            <TrainingListSkeleton />
          ) : exam.categories.length === 0 ? (
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
            <div className="grid items-start gap-5 xl:grid-cols-2">
              {filteredExam.categories.map((category) => (
                <CategorySection
                  key={category.id}
                  examKey={selectedExam}
                  category={category}
                  theoryByTopic={theoryByTopic}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
