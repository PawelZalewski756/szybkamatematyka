import type { Task } from "@/types/database";

const LABELS: Record<Task["difficulty"], string> = {
  1: "Łatwe",
  2: "Średnie",
  3: "Trudne",
};

type DifficultyBadgeProps = {
  difficulty: Task["difficulty"];
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const tone =
    difficulty === 1
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
      : difficulty === 2
        ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
        : "border-red-500/40 bg-red-500/15 text-red-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone}`}
      title={`Trudność ${difficulty}/3`}
    >
      <span aria-hidden>{"★".repeat(difficulty)}</span>
      <span>{LABELS[difficulty]}</span>
    </span>
  );
}
