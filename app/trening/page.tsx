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
import { useLearningPath } from "@/components/LearningPathProvider";
import { examKeyForLearningPath } from "@/lib/trening/next-topic";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Search,
  X,
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
  const statusLabel = isComingSoon
    ? "Wkrótce"
    : !canPlay
      ? "Teoria dostępna"
    : isCompleted
      ? "Ukończone"
      : topic.solved > 0
        ? "W toku"
        : "Do zrobienia";

  const rowClass =
    "group flex min-h-16 items-center gap-3 border-l-2 border-transparent px-4 py-3.5 text-sm transition " +
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
        <span className="block truncate">{topic.name}</span>
        <span className="mt-1 block text-xs text-muted sm:hidden">
          {canPlay ? `${statusLabel} · ${topic.solved}/${topic.total}` : statusLabel}
        </span>
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
          className="hidden w-24 shrink-0 sm:block"
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
          <span className="mt-1 block text-right text-xs text-muted">
            {statusLabel}
          </span>
        </div>
      )}
      <span className="shrink-0 tabular-nums text-xs text-muted">
        {canPlay
          ? `${topic.solved}/${topic.total}`
          : isComingSoon
            ? "Wkrótce"
            : "Teoria"}
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

type CategoryMetrics = {
  playableTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  totalTasks: number;
  solvedTasks: number;
  progress: number;
};

function getCategoryMetrics(category: CategoryWithProgress): CategoryMetrics {
  const playableTopics = category.topics.filter((topic) => topic.total > 0);
  const completedTopics = playableTopics.filter(
    (topic) => topic.status === "completed",
  ).length;
  const inProgressTopics = playableTopics.filter(
    (topic) => topic.solved > 0 && topic.status !== "completed",
  ).length;
  const totalTasks = playableTopics.reduce((sum, topic) => sum + topic.total, 0);
  const solvedTasks = playableTopics.reduce(
    (sum, topic) => sum + topic.solved,
    0,
  );

  return {
    playableTopics: playableTopics.length,
    completedTopics,
    inProgressTopics,
    totalTasks,
    solvedTasks,
    progress: Math.max(0, Math.min(100, category.progressPercent)),
  };
}

function categoryStatus(metrics: CategoryMetrics): string {
  if (metrics.playableTopics === 0) return "Wkrótce";
  if (metrics.progress === 100) return "Ukończony";
  if (metrics.inProgressTopics > 0 || metrics.completedTopics > 0) {
    return "W toku";
  }
  return "Do zrobienia";
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
  const progressMessage =
    overallProgress === 0
      ? "Zacznij od jednego tematu — reszta ścieżki poczeka."
      : overallProgress === 100
        ? "Ścieżka ukończona — możesz wrócić do wybranych tematów."
        : "Każdy rozwiązany temat przybliża Cię do celu.";

  return (
    <section
      className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-surface-border py-3"
      aria-label="Podsumowanie postępu"
    >
      <div className="min-w-52 flex-1">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-foreground">{exam.label}</span>
          <span className="font-bold tabular-nums text-accent">{progress}%</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-hover"
          role="progressbar"
          aria-label={`Ogólny postęp treningu: ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="progress-accent" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted">{progressMessage}</p>
      </div>
      <div className="text-xs text-muted">
        <span className="font-bold text-foreground">{topicCount}</span> tematów
      </div>
      <div className="text-xs text-muted">
        <span className="font-bold text-foreground">{topicsWithTasks}</span>{" "}
        aktywnych
      </div>
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
  const progress = Math.max(
    0,
    Math.min(100, nextTopic.topic.percent),
  );
  const focusLabel =
    overallProgress === 100
      ? "Powtórka"
      : hasStarted
        ? "Następny krok"
        : "Zacznij tutaj";
  const focusAction = overallProgress === 100 ? "Powtórz temat" : "Otwórz temat";

  return (
    <Link
      href={nextTopic.href}
      data-testid="training-next-step"
      className="group mt-6 block overflow-hidden rounded-r-2xl border-y border-r border-accent/35 border-l-4 border-l-accent bg-accent-soft/30 transition hover:bg-accent-soft/50"
    >
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="min-w-0">
            <p className="text-overline text-accent">{focusLabel}</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
              {nextTopic.topic.name}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              {nextTopic.categoryName} · {nextTopic.topic.total} zadań
              {nextTopic.topic.solved > 0
                ? ` · ${nextTopic.topic.solved}/${nextTopic.topic.total} rozwiązanych`
                : ""}
            </p>
          </div>
        </div>
        <span className="btn-chunky shrink-0 px-4 py-2.5 text-sm sm:px-5">
          {focusAction}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
      <div className="border-t border-accent/20 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="font-semibold text-foreground">Postęp tego tematu</span>
          <span className="tabular-nums text-muted">
            {nextTopic.topic.solved}/{nextTopic.topic.total} zadań · {progress}%
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-background/60"
          role="progressbar"
          aria-label={`Postęp tematu ${nextTopic.topic.name}: ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="progress-accent" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </Link>
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
      className="border-y border-surface-border py-3 lg:sticky lg:top-5"
    >
      <div className="flex items-baseline justify-between gap-3 px-1 pb-2">
        <h2 className="text-sm font-extrabold text-foreground">Działy</h2>
        <p className="text-xs text-muted">Wybierz obszar</p>
      </div>
      <div className="space-y-1">
        {categories.map((category, index) => {
          const metrics = getCategoryMetrics(category);
          const active = category.id === activeCategoryId;
          return (
            <button
              key={category.id}
              type="button"
              data-testid={`training-department-${category.id}`}
              aria-pressed={active}
              aria-label={`${category.name}, ${categoryStatus(metrics)}, ${metrics.progress}% postępu`}
              onClick={() => onSelect(category.id)}
              className={`w-full border-l-2 px-3 py-3 text-left transition ${
                active
                  ? "border-accent bg-accent-soft/55 text-foreground"
                  : "border-transparent text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                    active
                      ? "bg-accent text-on-accent"
                      : "bg-surface-hover text-muted"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-bold">{category.name}</span>
                    <span className="shrink-0 text-xs tabular-nums text-accent">
                      {metrics.progress}%
                    </span>
                  </span>
                  <span className="mt-1 block text-xs">
                    {polishCount(
                      metrics.playableTopics,
                      "temat",
                      "tematy",
                      "tematów",
                    )}{" "}
                    · {categoryStatus(metrics)}
                  </span>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-surface-hover">
                    <span
                      className="block h-full rounded-full bg-accent transition-[width]"
                      style={{ width: `${metrics.progress}%` }}
                    />
                  </span>
                </span>
                <ChevronRight
                  className={`mt-1 h-4 w-4 shrink-0 ${
                    active ? "text-accent" : "text-muted"
                  }`}
                  aria-hidden
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DepartmentPanel({
  examKey,
  category,
  theoryByTopic,
  topicsVisible,
  onToggleTopics,
}: {
  examKey: SelectedExam;
  category: CategoryWithProgress;
  theoryByTopic: Map<string, TheoryTier>;
  topicsVisible: boolean;
  onToggleTopics: () => void;
}) {
  const metrics = getCategoryMetrics(category);
  const topicsId = `training-topics-${category.id}`;

  return (
    <section
      data-testid="training-department-panel"
      aria-labelledby={`training-department-heading-${category.id}`}
      className="overflow-hidden border-y border-surface-border"
    >
      <div className="py-4 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-overline">Wybrany dział</p>
            <h2
              id={`training-department-heading-${category.id}`}
              className="mt-1 text-lg font-extrabold tracking-tight text-foreground sm:text-xl"
            >
              {category.name}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {polishCount(
                category.topics.length,
                "temat",
                "tematy",
                "tematów",
              )}{" "}
              w dziale · {metrics.totalTasks} zadań do rozwiązania
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
          className="mt-5 h-2 overflow-hidden rounded-full bg-surface-hover"
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

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>
            <strong className="text-foreground">{metrics.playableTopics}</strong>{" "}
            z zadaniami
          </span>
          <span>
            <strong className="text-foreground">{metrics.completedTopics}</strong>{" "}
            ukończonych
          </span>
          {metrics.inProgressTopics > 0 && (
            <span>
              <strong className="text-foreground">{metrics.inProgressTopics}</strong>{" "}
              w toku
            </span>
          )}
        </div>

        <button
          type="button"
          aria-expanded={topicsVisible}
          aria-controls={topicsId}
          onClick={onToggleTopics}
          className="btn-ghost mt-5 px-3 py-2 text-sm font-bold"
        >
          {topicsVisible ? "Ukryj tematy" : `Pokaż tematy (${category.topics.length})`}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              topicsVisible ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
      </div>

      {topicsVisible && (
        <div
          id={topicsId}
          data-testid="training-topic-list"
          className="border-t border-surface-border"
        >
          <div className="flex items-center justify-between gap-3 bg-surface-hover/30 px-3 py-3 text-xs text-muted sm:px-4">
            <span>Tematy i ich stan</span>
            <span className="tabular-nums">
              {metrics.solvedTasks}/{metrics.totalTasks} rozwiązanych
            </span>
          </div>
          <div className="divide-y divide-surface-border">
            {category.topics.map((topic) => (
              <TopicRow
                key={topic.id}
                examKey={examKey}
                category={category}
                topic={topic}
                theoryTier={
                  theoryByTopic.get(`${category.id}:${topic.id}`) ?? "none"
                }
              />
            ))}
          </div>
        </div>
      )}
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
            <div key={item} className="h-14 rounded-xl bg-surface-hover" />
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null,
  );
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

  const pathSyncedRef = useRef(false);
  useEffect(() => {
    if (pathSyncedRef.current || !learningPath) return;
    pathSyncedRef.current = true;
    const key = examKeyForLearningPath(learningPath);
    if (key !== "matura_podstawowa") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedExam(key);
      setExam(emptyExamFor(key));
    }
  }, [learningPath]);

  const handleExamChange = (key: SelectedExam) => {
    if (key === "8_klasa") setLearningPath("sp");
    else if (key === "matura_podstawowa") setLearningPath("srednia");
    setSelectedExam(key);
    setExam(emptyExamFor(key));
    setTheoryByTopic(new Map());
    setSearchInput("");
    setDebouncedQuery("");
    setTopicFilter("all");
    setTopicSort("az");
    setSelectedCategoryId(null);
    setExpandedCategoryId(null);
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

  const hasFilterIntent =
    Boolean(debouncedQuery.trim()) ||
    topicFilter !== "all" ||
    topicSort !== "az";

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

  const topicsVisible = Boolean(
    activeCategory &&
      (expandedCategoryId === activeCategory.id || hasFilterIntent),
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setExpandedCategoryId(null);
  };

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

        {!loading && nextTopic && (
          <NextStepCard
            nextTopic={nextTopic}
            overallProgress={overallProgress}
          />
        )}

        <TrainingOverview
          exam={exam}
          overallProgress={overallProgress}
          topicCount={topicCount}
          topicsWithTasks={topicsWithTasks}
        />

        <section
          className="mt-8"
          aria-label="Przeglądanie tematów"
          data-testid="training-browse"
        >
          <div className="border-y border-surface-border py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-overline">Tematy</p>
                <h2 className="mt-1 text-lg font-extrabold text-foreground">
                  Wybierz dział
                </h2>
              </div>
              <span className="rounded-full bg-surface-hover px-2.5 py-1 text-xs font-bold text-muted">
                {matchedTopicCount} tematów
              </span>
            </div>

            <details className="group mt-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-t border-surface-border pt-3 text-sm font-semibold text-muted transition hover:text-foreground marker:content-none">
                <span className="inline-flex items-center gap-2">
                  <Search className="h-4 w-4" aria-hidden />
                  Znajdź temat lub filtruj
                </span>
                <ChevronDown
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                <label className="sr-only" htmlFor="trening-search">
                  Szukaj tematu
                </label>
                <div className="relative mt-4">
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
                    className="input-field w-full py-2.5 pl-10 pr-10 text-sm"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      aria-label="Wyczyść wyszukiwanie"
                      onClick={() => {
                        setSearchInput("");
                        setDebouncedQuery("");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted" aria-live="polite">
                  {loading
                    ? "Ładowanie tematów…"
                    : debouncedQuery.trim()
                      ? `Znaleziono ${polishCount(
                          matchedTopicCount,
                          "temat",
                          "tematy",
                          "tematów",
                        )}`
                      : `${matchedTopicCount} tematów`}
                </p>
                </div>

                <div className="flex flex-col gap-3 lg:min-w-[22rem]">
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

                <label className="flex items-center gap-2 lg:self-end">
                  <span className="text-caption">Sortuj</span>
                  <select
                    id="topic-sort"
                    aria-label="Sortowanie tematów"
                    value={topicSort}
                    onChange={(e) => setTopicSort(e.target.value as TopicSort)}
                    className="input-field min-w-32 py-2.5 text-sm"
                  >
                    <option value="az">A–Z</option>
                    <option value="progress">Postęp</option>
                  </select>
                </label>
                </div>
              </div>
            </details>
          </div>
        </section>

        <div className="mt-6" data-testid="training-results">
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
                  topicsVisible={topicsVisible}
                  onToggleTopics={() =>
                    setExpandedCategoryId((current) =>
                      current === activeCategory.id ? null : activeCategory.id,
                    )
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
