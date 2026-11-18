import type { CatalogTask } from "@/lib/baza-zadan/catalog-task";
import { formatPkt } from "@/lib/baza-zadan/cke/exam-points";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { Check } from "lucide-react";
import Link from "next/link";

type TaskCardProps = {
  task: CatalogTask;
};

const DIFFICULTY_STYLES = {
  latwy: "text-success",
  sredni: "text-accent",
  trudny: "text-danger",
} as const;

/**
 * Karta zadania w katalogu. Pierwszy plan to treść zadania, a nie techniczny
 * tytuł - uczeń wybiera zadanie po tym, co ma policzyć.
 */
export function TaskCard({ task }: TaskCardProps) {
  const { isSolved } = useSolvedTasks();
  const solved = isSolved(task.id);
  const hasSeparatePrompt =
    task.prompt.trim().length > 0 && task.prompt.trim() !== task.title.trim();

  return (
    <Link
      href={`/baza-zadan/${task.id}`}
      className={`group flex h-full flex-col rounded-xl border px-4 py-3.5 transition ${
        solved
          ? "border-success/30 bg-success/[0.05] hover:border-success/50"
          : "border-surface-border bg-surface hover:border-accent/35 hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          {CATEGORY_LABELS[task.category]}
          <span className="mx-1.5 font-normal text-surface-border">·</span>
          <span className={DIFFICULTY_STYLES[task.difficulty]}>
            {DIFFICULTY_LABELS[task.difficulty]}
          </span>
        </p>
        {solved ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
            aria-label="Rozwiązane"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : null}
      </div>

      <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-accent">
        {task.title}
      </h3>

      {hasSeparatePrompt ? (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {task.prompt}
        </p>
      ) : null}

      {(task.isExam || task.hasSolution || task.examLabel) && (
        <p className="mt-auto pt-2 text-[11px] leading-snug text-muted">
          {task.isExam ? `${formatPkt(task.points)} · ` : ""}
          {task.hasSolution ? "krok po kroku" : ""}
          {task.examLabel ? ` · ${task.examLabel}` : ""}
        </p>
      )}
    </Link>
  );
}
