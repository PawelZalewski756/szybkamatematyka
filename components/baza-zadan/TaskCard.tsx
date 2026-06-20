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
  latwy: "text-emerald-400/90",
  sredni: "text-amber-400/90",
  trudny: "text-rose-400/90",
} as const;

export function TaskCard({ task }: TaskCardProps) {
  const { isSolved } = useSolvedTasks();
  const solved = isSolved(task.id);

  return (
    <Link
      href={`/baza-zadan/${task.id}`}
      className={`flex h-full flex-col rounded-2xl border p-4 transition ${
        solved
          ? "border-emerald-500/25 bg-emerald-500/[0.04] hover:border-emerald-500/40"
          : "border-white/[0.08] bg-[#111820]/60 hover:border-teal-500/25 hover:bg-[#141c2b]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-slate-400">
            {CATEGORY_LABELS[task.category]}
          </span>
          <span className={DIFFICULTY_STYLES[task.difficulty]}>
            {DIFFICULTY_LABELS[task.difficulty]}
          </span>
        </div>
        {solved && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
            aria-label="Rozwiązane"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-white">
        {task.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500">
        {task.prompt}
      </p>
    </Link>
  );
}
