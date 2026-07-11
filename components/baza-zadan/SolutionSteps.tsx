import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";

type SolutionStepsProps = {
  steps: readonly string[];
  examLabel?: string;
};

export function SolutionSteps({ steps, examLabel }: SolutionStepsProps) {
  if (steps.length === 0) return null;

  return (
    <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-accent">
        Rozwiązanie krok po kroku
        {examLabel ? ` · ${examLabel}` : ""}
      </p>
      <ol className="mt-3 list-decimal space-y-4 pl-5 marker:font-bold marker:text-accent">
        {steps.map((step, i) => (
          <li key={i} className="text-sm text-foreground">
            <TheoryMarkdown content={step} />
          </li>
        ))}
      </ol>
    </div>
  );
}
