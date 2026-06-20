import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";

type SolutionStepsProps = {
  steps: readonly string[];
  examLabel?: string;
};

export function SolutionSteps({ steps, examLabel }: SolutionStepsProps) {
  if (steps.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-indigo-300">
        Rozwiązanie krok po kroku
        {examLabel ? ` · ${examLabel}` : ""}
      </p>
      <ol className="mt-3 list-decimal space-y-4 pl-5 marker:font-bold marker:text-indigo-300">
        {steps.map((step, i) => (
          <li key={i} className="text-sm text-zinc-200">
            <TheoryMarkdown content={step} />
          </li>
        ))}
      </ol>
    </div>
  );
}
