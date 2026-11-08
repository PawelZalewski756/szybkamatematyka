"use client";

import {
  mergeExamProgress,
  type CategoryWithProgress,
  type ExamWithProgress,
  type TrainingTopicWithProgress,
} from "@/lib/trening/progress";
import { buildTopicHref } from "@/lib/trening/slugs";
import type { TheoryTier } from "@/lib/trening/theory-content";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  type NextTrainingTopic,
  type SelectedExam,
} from "@/lib/trening/catalog";

export const EXAM_OPTIONS: { key: SelectedExam; label: string }[] = [
  { key: "matura_podstawowa", label: "Matura podstawowa" },
  { key: "8_klasa", label: "Egzamin 8-klasisty" },
];

export function ExamSwitcher({
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

export function TopicRow({
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
    (canOpen ? "hover:border-accent/60 hover:bg-surface-hover" : "opacity-50");

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
          {canPlay
            ? `${statusLabel} · ${topic.solved}/${topic.total}`
            : statusLabel}
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

export function theoryLabel(tier: TheoryTier): string | null {
  if (tier === "none") return null;
  if (tier === "comprehensive" || tier === "full") return "Teoria";
  return "Skrót";
}

export function polishCount(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  if (count === 1) return `${count} ${one}`;
  if (count >= 2 && count <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}

export type CategoryMetrics = {
  playableTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  totalTasks: number;
  solvedTasks: number;
  progress: number;
};

export function getCategoryMetrics(
  category: CategoryWithProgress,
): CategoryMetrics {
  const playableTopics = category.topics.filter((topic) => topic.total > 0);
  const completedTopics = playableTopics.filter(
    (topic) => topic.status === "completed",
  ).length;
  const inProgressTopics = playableTopics.filter(
    (topic) => topic.solved > 0 && topic.status !== "completed",
  ).length;
  const totalTasks = playableTopics.reduce(
    (sum, topic) => sum + topic.total,
    0,
  );
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

export function categoryStatus(metrics: CategoryMetrics): string {
  if (metrics.playableTopics === 0) return "Wkrótce";
  if (metrics.progress === 100) return "Ukończony";
  if (metrics.inProgressTopics > 0 || metrics.completedTopics > 0) {
    return "W toku";
  }
  return "Do zrobienia";
}

export function TrainingOverview({
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
          <span className="font-bold tabular-nums text-accent">
            {progress}%
          </span>
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

export function NextStepCard({
  nextTopic,
  overallProgress,
}: {
  nextTopic: NextTrainingTopic;
  overallProgress: number;
}) {
  const hasStarted = overallProgress > 0 || nextTopic.topic.solved > 0;
  const progress = Math.max(0, Math.min(100, nextTopic.topic.percent));
  const focusLabel =
    overallProgress === 100
      ? "Powtórka"
      : hasStarted
        ? "Następny krok"
        : "Zacznij tutaj";
  const focusAction =
    overallProgress === 100 ? "Powtórz temat" : "Otwórz temat";

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
          <span className="font-semibold text-foreground">
            Postęp tego tematu
          </span>
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

export function DepartmentNavigation({
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
                    <span className="truncate text-sm font-bold">
                      {category.name}
                    </span>
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

export function DepartmentPanel({
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
            <strong className="text-foreground">
              {metrics.playableTopics}
            </strong>{" "}
            z zadaniami
          </span>
          <span>
            <strong className="text-foreground">
              {metrics.completedTopics}
            </strong>{" "}
            ukończonych
          </span>
          {metrics.inProgressTopics > 0 && (
            <span>
              <strong className="text-foreground">
                {metrics.inProgressTopics}
              </strong>{" "}
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
          {topicsVisible
            ? "Ukryj tematy"
            : `Pokaż tematy (${category.topics.length})`}
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

export function TrainingListSkeleton() {
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

export function emptyExamFor(key: SelectedExam): ExamWithProgress {
  return mergeExamProgress(key, new Map(), new Map());
}
