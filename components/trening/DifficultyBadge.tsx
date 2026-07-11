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
      ? "border-success/40 bg-success/15 text-success"
      : difficulty === 2
        ? "border-accent/40 bg-accent/15 text-accent"
        : "border-danger/40 bg-danger/15 text-danger";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${tone}`}
      title={`Trudność ${difficulty}/3`}
    >
      <span aria-hidden>{"★".repeat(difficulty)}</span>
      <span>{LABELS[difficulty]}</span>
    </span>
  );
}
