"use client";

import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { parseSolutionSteps } from "@/lib/baza-zadan/parse-solution-steps";
import {
  formatSolutionForDisplay,
  isSolutionPlaceholder,
} from "@/lib/gemini/format-solution";

type SolutionDisplayProps = {
  raw: string;
};

export function SolutionDisplay({ raw }: SolutionDisplayProps) {
  const formatted = formatSolutionForDisplay(raw);
  if (!formatted || isSolutionPlaceholder(formatted)) return null;

  const { steps, answer } = parseSolutionSteps(formatted);

  if (steps.length <= 1 && !answer) {
    return (
      <div className="mt-2">
        <TheoryMarkdown content={formatted} variant="solution" />
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3">
      <ol className="list-none space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-black text-emerald-300 ring-1 ring-emerald-500/25"
              aria-hidden
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <TheoryMarkdown content={step} variant="solution" />
            </div>
          </li>
        ))}
      </ol>
      {answer ? (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 sm:px-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">
            Odpowiedź
          </p>
          <div className="mt-1">
            <TheoryMarkdown content={answer} variant="solution" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
