"use client";

import { TaskCard } from "@/components/baza-zadan/TaskCard";
import { useSolvedTasks } from "@/components/SolvedTasksProvider";
import type { TaskGroupSection } from "@/lib/baza-zadan/catalog";
import { useMemo, useState } from "react";

type TaskSectionBlockProps = {
  section: TaskGroupSection;
  defaultOpen?: boolean;
  /** null = pokaż wszystkie zadania w sekcji */
  previewLimit?: number | null;
};

export function TaskSectionBlock({
  section,
  defaultOpen = true,
  previewLimit = 9,
}: TaskSectionBlockProps) {
  const { isSolved } = useSolvedTasks();
  const [open, setOpen] = useState(defaultOpen);
  const solvedInSection = useMemo(
    () => section.tasks.filter((t) => isSolved(t.id)).length,
    [section.tasks, isSolved],
  );
  const visible =
    previewLimit === null
      ? section.tasks
      : section.tasks.slice(0, previewLimit);
  const rest =
    previewLimit === null ? 0 : section.tasks.length - visible.length;

  return (
    <section className="rounded-2xl border border-surface-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {section.emoji}
          </span>
          <div className="min-w-0">
            <h3 className="break-words text-lg font-black text-foreground">
              {section.label}
            </h3>
            <p className="break-words text-sm text-muted">
              {section.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
            {section.tasks.length} zadań
          </span>
          {solvedInSection > 0 && (
            <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold text-success">
              ✓ {solvedInSection}
            </span>
          )}
          <span
            className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-surface-border px-5 pb-5 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
          {rest > 0 && (
            <p className="mt-4 text-center text-sm text-muted">
              + {rest} więcej w tym dziale - użyj filtra działu lub wyszukiwarki
            </p>
          )}
        </div>
      )}
    </section>
  );
}
