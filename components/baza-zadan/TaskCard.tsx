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
      className={`card-raised flex h-full flex-col p-4 ${
        solved
          ? "border-success/30 bg-success/[0.06] hover:border-success/50"
          : "border-surface-border bg-surface hover:border-accent/40 hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          <span className="rounded-md bg-surface-hover px-2 py-0.5 text-muted">
            {CATEGORY_LABELS[task.category]}
          </span>
          <span className={DIFFICULTY_STYLES[task.difficulty]}>
            {DIFFICULTY_LABELS[task.difficulty]}
          </span>
        </div>
        {solved && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
            aria-label="Rozwiązane"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-foreground">
        {task.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">
        {task.prompt}
      </p>
    </Link>
  );
}
