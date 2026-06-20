import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import type { Task } from "@/lib/baza-zadan/types";
import Link from "next/link";

type TaskCardProps = {
  task: Task;
};

const DIFFICULTY_STYLES = {
  latwy: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  sredni: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  trudny: "bg-red-500/20 text-red-300 border-red-500/30",
} as const;

export function TaskCard({ task }: TaskCardProps) {
  const { isSolved } = useSolvedTasks();
  const solved = isSolved(task.id);

  return (
    <Link
      href={`/baza-zadan/${task.id}`}
      className={`group relative flex flex-col rounded-2xl border p-5 transition-all ${
        solved
          ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
          : "border-white/10 bg-zinc-900/80 hover:border-cyan-500/40 hover:bg-zinc-800/90 hover:shadow-lg hover:shadow-cyan-500/10"
      }`}
    >
      {solved && (
        <span
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/20 text-sm text-emerald-300"
          aria-label="Rozwiązane"
          title="Rozwiązane"
        >
          ✓
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-xs font-bold text-violet-300">
          {CATEGORY_LABELS[task.category]}
        </span>
        <span
          className={`rounded-md border px-2 py-0.5 text-xs font-bold ${DIFFICULTY_STYLES[task.difficulty]}`}
        >
          {DIFFICULTY_LABELS[task.difficulty]}
        </span>
        {task.solutionSteps && task.solutionSteps.length > 0 && (
          <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs font-bold text-indigo-300">
            Krok po kroku
          </span>
        )}
      </div>
      <h3 className="mt-3 break-words text-lg font-black text-white group-hover:text-cyan-200 line-clamp-2">
        {task.title}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-zinc-400">
        {task.prompt}
      </p>
      <span
        className={`mt-4 text-sm font-bold ${solved ? "text-emerald-400" : "text-cyan-400"}`}
      >
        {solved ? "Rozwiązane ✓" : "Rozwiąż →"}
      </span>
    </Link>
  );
}
