"use client";

import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { parseTheorySections, type TheorySection } from "@/lib/trening/theory-sections";
import { useMemo } from "react";

function TheorySectionBlock({ section }: { section: TheorySection }) {
  const isAnswers = section.kind === "answers";

  return (
    <section id={section.id} className="scroll-mt-24 border-t border-surface-border pt-8 first:border-t-0 first:pt-0">
      <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
      <div className="mt-3">
        {isAnswers ? (
          <details className="group rounded-lg border border-surface-border bg-background">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-muted marker:content-none">
              <span className="group-open:hidden">Pokaż odpowiedzi</span>
              <span className="hidden group-open:inline">Ukryj odpowiedzi</span>
            </summary>
            <div className="border-t border-surface-border px-4 pb-4 pt-2">
              <TheoryMarkdown content={section.body} />
            </div>
          </details>
        ) : (
          <TheoryMarkdown content={section.body} />
        )}
      </div>
    </section>
  );
}

type TheorySectionViewProps = {
  content: string;
};

export function TheorySectionView({ content }: TheorySectionViewProps) {
  const sections = useMemo(() => parseTheorySections(content), [content]);

  return (
    <div>
      {sections.map((section) => (
        <TheorySectionBlock key={section.id} section={section} />
      ))}
    </div>
  );
}

export { parseTheorySections };
