"use client";

import { SolutionSteps } from "@/components/baza-zadan/SolutionSteps";
import { TaskTresc } from "@/components/baza-zadan/TaskTresc";
import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import { useState } from "react";

export type ArchiveSheetTaskData = {
  id: string;
  number: string;
  category: string;
  points: number;
  open: boolean;
  prompt: string;
  choices: string[];
  explanation: string;
  steps: string[];
  examLabel?: string;
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function ArchiveTaskCard({ task }: { task: ArchiveSheetTaskData }) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-surface-border bg-surface">
      <div className="border-b border-surface-border px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-accent px-2.5 py-1 text-sm font-black text-on-accent">
            Zad. {task.number}
          </span>
          <span className="rounded-lg border border-surface-border bg-surface-hover px-2 py-0.5 text-xs font-semibold text-muted">
            {task.category}
          </span>
          <span className="text-xs font-semibold text-muted">
            {task.points} pkt
          </span>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <TaskTresc tresc={task.prompt} />

        {!task.open && task.choices.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {task.choices.map((choice, index) => (
              <li key={index} className="flex items-baseline gap-2">
                <span className="font-semibold text-foreground">
                  {LETTERS[index] ?? index + 1})
                </span>
                <TaskTresc tresc={choice} />
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          onClick={() => setShowSolution((v) => !v)}
          className={`mt-5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
            showSolution
              ? "border border-surface-border bg-surface-hover text-muted"
              : "border border-success/30 bg-success/10 text-success hover:bg-success/15"
          }`}
        >
          {showSolution ? "Ukryj rozwiązanie" : "Pokaż rozwiązanie"}
        </button>

        {showSolution ? (
          <div className="mt-4 border-l-2 border-success/40 pl-4">
            {task.explanation.trim() ? (
              <div className="text-sm text-muted">
                <TheoryMarkdown
                  content={formatCkeMathText(task.explanation)}
                  variant="solution"
                />
              </div>
            ) : null}
            {task.steps.length > 0 ? (
              <SolutionSteps steps={task.steps} examLabel={task.examLabel} />
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ArchiveSheetTasks({ tasks }: { tasks: ArchiveSheetTaskData[] }) {
  return (
    <div className="mt-8 space-y-5">
      {tasks.map((task) => (
        <ArchiveTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
