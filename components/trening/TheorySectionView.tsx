"use client";

import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { TopicSummaryCard } from "@/components/trening/TopicSummaryCard";
import type { TopicSummary } from "@/lib/trening/summaries";
import {
  parseTheorySections,
  type TheorySection,
} from "@/lib/trening/theory-sections";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

function SectionRow({
  section,
  open,
  onToggle,
}: {
  section: TheorySection;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
}) {
  return (
    <details
      id={section.id}
      open={open}
      onToggle={(event) => onToggle(section.id, event.currentTarget.open)}
      className="group scroll-mt-24"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 marker:content-none">
        <span
          aria-hidden
          className="h-5 w-1 shrink-0 rounded-full bg-accent"
        />
        <span className="min-w-0 flex-1 text-sm font-bold text-foreground">
          {section.title}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-surface-border px-4 pb-4 pt-3">
        <TheoryMarkdown content={section.body} />
      </div>
    </details>
  );
}

type TheorySectionViewProps = {
  content: string;
  summary?: TopicSummary | null;
};

export function TheorySectionView({ content, summary }: TheorySectionViewProps) {
  const sections = useMemo(() => parseTheorySections(content), [content]);
  const lessonSections = sections.filter(
    (section) => !(summary && section.kind === "diagram"),
  );

  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const allOpen =
    lessonSections.length > 0 &&
    lessonSections.every((section) => openIds.has(section.id));

  const handleToggle = (id: string, open: boolean) => {
    setOpenIds((previous) => {
      const next = new Set(previous);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = () => {
    setOpenIds(
      allOpen
        ? new Set()
        : new Set(lessonSections.map((section) => section.id)),
    );
  };

  return (
    <div className="space-y-8">
      {summary ? (
        <TopicSummaryCard id="podsumowanie-tematu" summary={summary} />
      ) : null}

      {lessonSections.length > 0 ? (
        <section aria-label="Pełna lekcja" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-overline">Pełna lekcja</p>
              <p className="mt-1 text-xs text-muted">
                Rozwiń sekcję, której potrzebujesz.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              className="btn-ghost px-3 py-2 text-xs font-bold"
            >
              {allOpen ? "Zwiń wszystko" : "Rozwiń wszystko"}
            </button>
          </div>

          <div className="divide-y divide-surface-border overflow-hidden rounded-lg border border-surface-border">
            {lessonSections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                open={openIds.has(section.id)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export { parseTheorySections };
