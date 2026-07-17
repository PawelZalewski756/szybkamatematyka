import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import type { Task } from "@/lib/baza-zadan/types";
import { Check } from "lucide-react";
import Link from "next/link";

type TaskCardProps = {
  task: Task;
};

const DIFFICULTY_STYLES = {
  latwy: "text-success",
  sredni: "text-accent",
  trudny: "text-danger",
} as const;

export function TaskCard({ task }: TaskCardProps) {
  const { isSolved } = useSolvedTasks();
  const solved = isSolved(task.id);

  return (
    <Link
      href={`/baza-zadan/${task.id}`}
      className={`flex h-full flex-col rounded-xl border px-4 py-3 transition ${
        solved
          ? "border-success/30 bg-success/[0.05] hover:border-success/50"
          : "border-surface-border bg-surface hover:border-accent/35 hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {task.title}
        </h3>
        {solved ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
            aria-label="Rozwiązane"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-muted">
        <span>{CATEGORY_LABELS[task.category]}</span>
        <span className="mx-1.5 text-surface-border">·</span>
        <span className={DIFFICULTY_STYLES[task.difficulty]}>
          {DIFFICULTY_LABELS[task.difficulty]}
        </span>
      </p>
    </Link>
  );
}
