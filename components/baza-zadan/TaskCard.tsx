import type { CatalogTask } from "@/lib/baza-zadan/catalog-task";
import { formatPkt } from "@/lib/baza-zadan/cke/exam-points";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from "@/lib/baza-zadan/labels";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import { MathText } from "@/components/trening/MathText";
import {
  findMarkdownImages,
  replaceMarkdownImages,
} from "@/lib/math/markdown-images";
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
  const titleImages = findMarkdownImages(task.displayTitle);
  // Na karcie nie ma miejsca na pełny rysunek - pokazujemy sam tekst i
  // znacznik, że zadanie ma grafikę (rysunek jest na stronie zadania).
  const displayTitle = titleImages.length
    ? replaceMarkdownImages(task.displayTitle, () => " ")
        .replace(/\s+/g, " ")
        .trim()
    : task.displayTitle;
  const promptImages = findMarkdownImages(task.prompt);
  const promptPreview = promptImages.length
    ? replaceMarkdownImages(task.prompt, () => " ")
        .replace(/\s+/g, " ")
        .trim()
    : task.prompt;
  const hasSeparatePrompt =
    promptPreview.trim().length > 0 &&
    promptPreview.trim() !== displayTitle.trim();
  const hasFigure = titleImages.length > 0 || promptImages.length > 0;

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

      <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-accent [&_.katex]:text-[1em]">
        <MathText content={displayTitle} />
      </h3>

      {hasSeparatePrompt ? (
        <MathText
          as="div"
          content={promptPreview}
          className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted [&_.katex]:text-[1em]"
        />
      ) : null}

      {hasFigure ? (
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
          z rysunkiem
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
