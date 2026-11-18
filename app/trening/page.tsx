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
import { ExamCountdown } from "@/components/trening/ExamCountdown";
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
import { useLearningPath } from "@/components/LearningPathProvider";
import { firstTaskHref } from "@/lib/trening/first-task";
import { examKeyForLearningPath } from "@/lib/trening/next-topic";
import { getClassPlan } from "@/lib/trening/class-plan";
import {
  loadSchoolClass,
  subscribeLearningPath,
} from "@/lib/learning-path";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

const taskTreeCache = new Map<ExamType, Promise<TaskTreeRow[]>>();
const materialSummaryCache = new Map<ExamType, Promise<MaterialTopicSummary[]>>();

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

type NextTrainingTopic = {
  href: string;
  categoryId: string;
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
          categoryId: category.id,
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

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function ExamSwitcher({
  selected,
  onChange,
}: {
  selected: SelectedExam;
  onChange: (exam: SelectedExam) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-caption">Wybierz egzamin</p>
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
  const isCompleted = topic.status === "completed";
  const href = buildTopicHref(examKey, category.id, topic.id);
  const theory = theoryLabel(theoryTier);
  const progress = Math.max(0, Math.min(100, topic.percent));

  const inner = (
    <>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
        {isCompleted ? (
          <CheckCircle2
            className="h-4 w-4 text-success"
            aria-label="Ukończone"
          />
        ) : (
          <span
            className="h-1.5 w-1.5 rounded-full bg-surface-border transition-colors group-hover:bg-accent"
            aria-hidden
          />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
        {topic.name}
      </span>
      {theory ? (
        <span
          aria-label={theory}
          title={theory}
          className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-accent sm:inline-flex"
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
        </span>
      ) : null}
      <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted">
        {canPlay ? `${topic.solved}/${topic.total}` : "Teoria"}
      </span>
      <span
        className="hidden h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-surface-hover sm:block"
        role="progressbar"
        aria-label={`Postęp tematu ${topic.name}: ${progress}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span
          className="progress-accent block h-full"
          style={{ width: `${progress}%` }}
        />
      </span>
      <ChevronRight
        className={`h-4 w-4 shrink-0 text-muted ${
          canOpen ? "" : "opacity-0"
        }`}
        aria-hidden
      />
    </>
  );

  if (!canOpen) {
    return (
      <div className="flex min-h-12 items-center gap-3 px-1 py-2.5 opacity-50 sm:px-2">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group flex min-h-12 items-center gap-3 px-1 py-2.5 transition hover:bg-surface-hover/60 sm:px-2"
    >
      {inner}
    </Link>
  );
}

function theoryLabel(tier: TheoryTier): string | null {
  if (tier === "none") return null;
  if (tier === "comprehensive" || tier === "full") return "Teoria";
  return "Skrót";
}

function polishCount(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  if (count === 1) return `${count} ${one}`;
  if (count >= 2 && count <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}

function getCategoryMetrics(category: CategoryWithProgress) {
  const playableTopics = category.topics.filter((topic) => topic.total > 0);
  const completedTopics = playableTopics.filter(
    (topic) => topic.status === "completed",
  ).length;
  const totalTasks = playableTopics.reduce((sum, topic) => sum + topic.total, 0);
  const solvedTasks = playableTopics.reduce(
    (sum, topic) => sum + topic.solved,
    0,
  );

  return {
    completedTopics,
    totalTasks,
    solvedTasks,
    progress: Math.max(0, Math.min(100, category.progressPercent)),
  };
}

function StartCard({
  nextTopic,
  overallProgress,
  solvedTasks,
  totalTasks,
  firstTaskHrefValue,
}: {
  nextTopic: NextTrainingTopic;
  overallProgress: number;
  solvedTasks: number;
  totalTasks: number;
  firstTaskHrefValue: string;
}) {
  const focusLabel =
    overallProgress === 100
      ? "Powtórka"
      : nextTopic.topic.solved > 0
        ? "Następny krok"
        : "Zacznij tutaj";

  return (
    <section
      aria-label="Twój następny krok"
      data-testid="training-next-step"
      className="mt-6 overflow-hidden rounded-r-2xl border-y border-r border-accent/35 border-l-4 border-l-accent bg-accent-soft/30"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="text-overline text-accent">{focusLabel}</p>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
            {nextTopic.topic.name}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {nextTopic.categoryName} · {nextTopic.topic.total} zadań ·{" "}
            {nextTopic.topic.solved}/{nextTopic.topic.total} rozwiązanych
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <Link
            href={nextTopic.href}
            className="btn-chunky px-4 py-2.5 text-sm sm:px-5"
          >
            Otwórz temat
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={firstTaskHrefValue}
            data-testid="first-task-cta"
            className="text-center text-xs font-semibold text-muted underline-offset-4 hover:text-accent hover:underline"
          >
            albo pierwsze zadanie (2 min) →
          </Link>
        </div>
      </div>

      <div className="border-t border-accent/20 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 text-xs">
          <span className="font-semibold text-foreground">
            Postęp: <span className="text-accent">{overallProgress}%</span>{" "}
            <span className="font-normal text-muted">
              ({solvedTasks}/{totalTasks} zadań)
            </span>
          </span>
          <ExamCountdown />
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-background/60"
          role="progressbar"
          aria-label={`Postęp egzaminu: ${overallProgress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={overallProgress}
        >
          <div className="progress-accent" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>
    </section>
  );
}

function DepartmentButton({
  category,
  index,
  active,
  onSelect,
}: {
  category: CategoryWithProgress;
  index: number;
  active: boolean;
  onSelect: (categoryId: string) => void;
}) {
  const metrics = getCategoryMetrics(category);

  return (
    <button
      type="button"
      data-testid={`training-department-${category.id}`}
      aria-pressed={active}
      onClick={() => onSelect(category.id)}
      className={`w-full border-l-2 px-3 py-2.5 text-left transition ${
        active
          ? "border-accent bg-accent-soft/55 text-foreground"
          : "border-transparent text-muted hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
            active ? "bg-accent text-on-accent" : "bg-surface-hover text-muted"
          }`}
        >
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-bold">{category.name}</span>
            <span className="shrink-0 text-xs tabular-nums text-accent">
              {metrics.progress}%
            </span>
          </span>
          <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-surface-hover">
            <span
              className="block h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${metrics.progress}%` }}
            />
          </span>
        </span>
      </div>
    </button>
  );
}

function DepartmentNavigation({
  categories,
  activeCategoryId,
  onSelect,
}: {
  categories: CategoryWithProgress[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <nav
      data-testid="training-department-navigation"
      aria-label="Działy treningu"
      className="min-w-0 border-y border-surface-border py-3 lg:sticky lg:top-5"
    >
      <p className="px-1 pb-2 text-sm font-extrabold text-foreground">Działy</p>
      <div className="space-y-0.5">
        {categories.map((category, index) => (
          <DepartmentButton
            key={category.id}
            category={category}
            index={index}
            active={category.id === activeCategoryId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </nav>
  );
}

function MobileDepartmentList({
  examKey,
  categories,
  activeCategoryId,
  theoryByTopic,
  onSelect,
}: {
  examKey: SelectedExam;
  categories: CategoryWithProgress[];
  activeCategoryId: string | null;
  theoryByTopic: Map<string, TheoryTier>;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <nav
      data-testid="training-department-navigation"
      aria-label="Działy treningu"
      className="min-w-0 space-y-0.5 border-y border-surface-border py-3"
    >
      {categories.map((category, index) => (
        <div key={category.id}>
          <DepartmentButton
            category={category}
            index={index}
            active={category.id === activeCategoryId}
            onSelect={onSelect}
          />
          {category.id === activeCategoryId && (
            <div className="mt-2">
              <DepartmentPanel
                examKey={examKey}
                category={category}
                theoryByTopic={theoryByTopic}
              />
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

function DepartmentPanel({
  examKey,
  category,
  theoryByTopic,
}: {
  examKey: SelectedExam;
  category: CategoryWithProgress;
  theoryByTopic: Map<string, TheoryTier>;
}) {
  const metrics = getCategoryMetrics(category);

  return (
    <section
      data-testid="training-department-panel"
      aria-labelledby={`training-department-heading-${category.id}`}
      className="min-w-0"
    >
      <div className="flex items-start justify-between gap-4 border-b border-surface-border pb-3">
        <div className="min-w-0">
          <h2
            id={`training-department-heading-${category.id}`}
            className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl"
          >
            {category.name}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {polishCount(category.topics.length, "temat", "tematy", "tematów")} ·{" "}
            {metrics.solvedTasks}/{metrics.totalTasks} zadań ·{" "}
            {metrics.completedTopics} ukończonych
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${
            metrics.progress === 100
              ? "bg-success/15 text-success"
              : "bg-accent-soft text-accent"
          }`}
        >
          {metrics.progress}%
        </span>
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-hover"
        role="progressbar"
        aria-label={`Postęp działu ${category.name}: ${metrics.progress}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={metrics.progress}
      >
        <div
          className="progress-accent"
          style={{ width: `${metrics.progress}%` }}
        />
      </div>

      <div
        id={`training-topics-${category.id}`}
        data-testid="training-topic-list"
        className="mt-3 divide-y divide-surface-border"
      >
        {category.topics.map((topic) => (
          <TopicRow
            key={topic.id}
            examKey={examKey}
            category={category}
            topic={topic}
            theoryTier={theoryByTopic.get(`${category.id}:${topic.id}`) ?? "none"}
          />
        ))}
      </div>
    </section>
  );
}

function TrainingListSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(210px,0.34fr)_minmax(0,1fr)]">
      <div className="h-80 animate-pulse border-y border-surface-border py-5">
        <div className="h-5 w-24 rounded bg-surface-hover" />
        <div className="mt-3 h-3 w-44 rounded bg-surface-hover" />
        <div className="mt-7 space-y-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-12 rounded-xl bg-surface-hover" />
          ))}
        </div>
      </div>
      <div className="h-80 animate-pulse border-y border-surface-border py-5 sm:py-7">
        <div className="h-3 w-28 rounded bg-surface-hover" />
        <div className="mt-3 h-7 w-2/3 rounded bg-surface-hover" />
        <div className="mt-4 h-3 w-1/2 rounded bg-surface-hover" />
        <div className="mt-8 h-2 rounded-full bg-surface-hover" />
        <div className="mt-7 h-12 w-40 rounded-xl bg-surface-hover" />
      </div>
    </div>
  );
}

function emptyExamFor(key: SelectedExam): ExamWithProgress {
  return mergeExamProgress(key, new Map(), new Map());
}

export default function TreningPage() {
  const { path: learningPath, setPath: setLearningPath } = useLearningPath();
  const schoolClass = useSyncExternalStore(
    subscribeLearningPath,
    loadSchoolClass,
    () => "klasa-8" as const,
  );
  const classPlan = useMemo(() => getClassPlan(schoolClass), [schoolClass]);
  const [selectedExam, setSelectedExam] =
    useState<SelectedExam>("matura_podstawowa");
  const [exam, setExam] = useState<ExamWithProgress>(() =>
    emptyExamFor("matura_podstawowa"),
  );
  const [loading, setLoading] = useState(true);
  const [pathInitialized, setPathInitialized] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [theoryByTopic, setTheoryByTopic] = useState<Map<string, TheoryTier>>(
    new Map(),
  );
  const isMobile = useIsMobile();
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
          // Teoria z seeda zostaje dostępna, gdy opcjonalne zapytanie do CMS zawiedzie.
        });

      void (async () => {
        try {
          const { getSupabase } = await import("@/lib/supabase");
          const {
            data: { session },
          } = await getSupabase().auth.getSession();
          if (!session?.user) return;

          // Bez cache na poziomie modułu: po powrocie z areny lista musi być
          // świeża, inaczej tematy zostają na 0/5 do przeładowania strony.
          const solvedIds = await fetchSolvedTaskIds(session.user.id);
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
    if (!pathInitialized) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProgress(selectedExam);
  }, [pathInitialized, selectedExam, loadProgress]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput), 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const syncedPathRef = useRef<string | null>(null);
  useEffect(() => {
    // Po hydratacji `useSyncExternalStore` może najpierw zwrócić snapshot
    // serwerowy (`sp`), a dopiero potem wartość z localStorage (`srednia`).
    if (syncedPathRef.current === learningPath) return;
    syncedPathRef.current = learningPath;
    const key = examKeyForLearningPath(learningPath);
    setSelectedExam(key);
    setExam(emptyExamFor(key));
    setPathInitialized(true);
  }, [learningPath]);

  const handleExamChange = (key: SelectedExam) => {
    if (key === "8_klasa") setLearningPath("sp");
    else if (key === "matura_podstawowa") setLearningPath("srednia");
    setSelectedExam(key);
    setExam(emptyExamFor(key));
    setTheoryByTopic(new Map());
    // Bez tego między zmianą egzaminu a pobraniem liczników drzewo renderuje
    // się z zerami i wszystkie działy dostają etykietę „Wkrótce”.
    setLoading(true);
    setSearchInput("");
    setDebouncedQuery("");
    setSelectedCategoryId(null);
  };

  // Trening pokazuje zawsze cały zakres egzaminu (wszystkie działy i tematy
  // z podstawy programowej). Plan klasy jest tylko podpowiedzią „co w tym
  // roku”, a nie filtrem - wcześniej wybór klasy (np. Liceum 3) ukrywał
  // funkcję kwadratową, wielomiany i kilkadziesiąt innych tematów.
  const visibleExam = exam;

  const filteredExam = useMemo(
    () => filterExamByQuery(visibleExam, debouncedQuery),
    [visibleExam, debouncedQuery],
  );

  const matchedTopicCount = useMemo(
    () => countTopics(filteredExam),
    [filteredExam],
  );

  const nextTopic = useMemo(
    () => findNextTrainingTopic(visibleExam, selectedExam),
    [visibleExam, selectedExam],
  );

  const activeCategory = useMemo(
    () =>
      filteredExam.categories.find(
        (category) => category.id === selectedCategoryId,
      ) ??
      filteredExam.categories.find(
        (category) => category.id === nextTopic?.categoryId,
      ) ??
      filteredExam.categories[0] ??
      null,
    [filteredExam.categories, nextTopic, selectedCategoryId],
  );

  // Na telefonie panel otwiera się dopiero po kliknięciu działu (albo po
  // wyszukaniu) - inaczej strona startuje z rozwiniętymi 14 tematami.
  const mobileCategoryId =
    selectedCategoryId ??
    (debouncedQuery.trim() ? (activeCategory?.id ?? null) : null);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId((current) =>
      isMobile && current === categoryId ? null : categoryId,
    );
  };

  const examSubtitle =
    selectedExam === "matura_podstawowa"
      ? "Matura podstawowa - cały zakres CKE, temat po temacie."
      : "Egzamin ósmoklasisty - cała podstawa programowa, temat po temacie.";

  const progressSummary = useMemo(() => {
    const categories = visibleExam.categories;
    const totalTasks = categories.reduce(
      (sum, category) =>
        sum + category.topics.reduce((s, topic) => s + topic.total, 0),
      0,
    );
    const solvedTasks = categories.reduce(
      (sum, category) =>
        sum + category.topics.reduce((s, topic) => s + topic.solved, 0),
      0,
    );

    return {
      totalTasks,
      solvedTasks,
      percent:
        totalTasks > 0 ? Math.round((solvedTasks / totalTasks) * 100) : 0,
    };
  }, [visibleExam.categories]);

  const topicCount = useMemo(() => countTopics(visibleExam), [visibleExam]);

  const isSearching = debouncedQuery.trim().length > 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="page-container relative z-10 flex w-full flex-1 flex-col py-8 sm:py-12">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Trening
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted sm:text-base">
              {examSubtitle}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <Link
                href="/plan-klasy"
                className="font-semibold text-accent transition hover:underline"
              >
                Plan dla klasy: {classPlan.label}
              </Link>
              <Link
                href="/diagnostyka"
                className="font-semibold text-accent transition hover:underline"
              >
                Diagnoza startowa
              </Link>
            </p>
          </div>
          <ExamSwitcher selected={selectedExam} onChange={handleExamChange} />
        </header>

        {!loading && nextTopic && (
          <StartCard
            nextTopic={nextTopic}
            overallProgress={progressSummary.percent}
            solvedTasks={progressSummary.solvedTasks}
            totalTasks={progressSummary.totalTasks}
            firstTaskHrefValue={firstTaskHref(learningPath)}
          />
        )}

        <section
          className="mt-8"
          aria-label="Przeglądanie tematów"
          data-testid="training-browse"
        >
          <div className="flex flex-col gap-3 border-b border-surface-border pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-extrabold text-foreground">Tematy</h2>
              <span className="text-xs text-muted" aria-live="polite">
                {loading
                  ? "Ładowanie…"
                  : isSearching
                    ? `Znaleziono ${polishCount(
                        matchedTopicCount,
                        "temat",
                        "tematy",
                        "tematów",
                      )}`
                    : `${topicCount} tematów`}
              </span>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <label className="sr-only" htmlFor="trening-search">
                Szukaj tematu
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                id="trening-search"
                type="search"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setSelectedCategoryId(null);
                }}
                placeholder="Szukaj tematu…"
                className="input-field w-full py-2 pl-9 pr-9 text-sm"
              />
              {searchInput ? (
                <button
                  type="button"
                  aria-label="Wyczyść wyszukiwanie"
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedQuery("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition hover:bg-surface-hover hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5" data-testid="training-results">
            {loading ? (
              <TrainingListSkeleton />
            ) : exam.categories.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted">
                Brak zadań w bazie dla tego egzaminu. Uruchom{" "}
                <code className="rounded bg-surface px-1.5 py-0.5 text-foreground">
                  npm run seed:trening-tasks
                </code>{" "}
                lub dodaj zadania w Supabase.
              </p>
            ) : filteredExam.categories.length === 0 ? (
              <EmptyState
                className="mt-10"
                icon={Search}
                title="Brak pasujących tematów"
                description={`Nie znaleziono tematów dla „${debouncedQuery.trim()}”. Spróbuj innej frazy.`}
              />
            ) : isMobile ? (
              <MobileDepartmentList
                examKey={selectedExam}
                categories={filteredExam.categories}
                activeCategoryId={mobileCategoryId}
                theoryByTopic={theoryByTopic}
                onSelect={handleCategorySelect}
              />
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(210px,0.34fr)_minmax(0,1fr)]">
                <DepartmentNavigation
                  categories={filteredExam.categories}
                  activeCategoryId={activeCategory?.id ?? null}
                  onSelect={handleCategorySelect}
                />
                {activeCategory && (
                  <DepartmentPanel
                    examKey={selectedExam}
                    category={activeCategory}
                    theoryByTopic={theoryByTopic}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
