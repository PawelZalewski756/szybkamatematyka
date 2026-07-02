"use client";

import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import {
  parseTheorySections,
  SECTION_KIND_LABEL,
  type TheorySection,
  type TheorySectionKind,
} from "@/lib/trening/theory-sections";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Lightbulb,
  ListChecks,
  PenLine,
  Shapes,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

const KIND_ICON: Record<TheorySectionKind, LucideIcon> = {
  exam: GraduationCap,
  overview: BookOpen,
  core: Lightbulb,
  example: PenLine,
  traps: AlertTriangle,
  practice: ClipboardList,
  answers: CheckCircle2,
  review: ListChecks,
  diagram: Shapes,
  other: BookOpen,
};

const KIND_BORDER: Record<TheorySectionKind, string> = {
  exam: "border-orange-400/50",
  overview: "border-sky-400/40",
  core: "border-emerald-400/40",
  example: "border-amber-400/45",
  traps: "border-red-400/40",
  practice: "border-violet-400/40",
  answers: "border-zinc-400/30",
  review: "border-teal-400/40",
  diagram: "border-cyan-400/35",
  other: "border-white/15",
};

const KIND_BADGE: Record<TheorySectionKind, string> = {
  exam: "bg-orange-500/15 text-orange-200",
  overview: "bg-sky-500/15 text-sky-200",
  core: "bg-emerald-500/15 text-emerald-200",
  example: "bg-amber-500/15 text-amber-100",
  traps: "bg-red-500/15 text-red-200",
  practice: "bg-violet-500/15 text-violet-200",
  answers: "bg-zinc-500/15 text-zinc-300",
  review: "bg-teal-500/15 text-teal-200",
  diagram: "bg-cyan-500/15 text-cyan-200",
  other: "bg-white/10 text-zinc-300",
};

function TheorySectionCard({ section }: { section: TheorySection }) {
  const Icon = KIND_ICON[section.kind];
  const isAnswers = section.kind === "answers";

  return (
    <section
      id={section.id}
      className={`scroll-mt-24 rounded-2xl border bg-white/[0.03] p-5 sm:p-6 ${KIND_BORDER[section.kind]}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${KIND_BADGE[section.kind]}`}
        >
          <Icon className="h-3 w-3" aria-hidden />
          {SECTION_KIND_LABEL[section.kind]}
        </span>
      </div>
      <h3 className="text-lg font-black text-white sm:text-xl">{section.title}</h3>
      <div className="mt-3">
        {isAnswers ? (
          <details className="group rounded-xl border border-white/10 bg-black/20">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-zinc-300 marker:content-none">
              <span className="text-orange-300 group-open:hidden">
                Pokaż odpowiedzi ▼
              </span>
              <span className="hidden text-orange-300 group-open:inline">
                Ukryj odpowiedzi ▲
              </span>
            </summary>
            <div className="border-t border-white/10 px-4 pb-4 pt-2">
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
    <div className="space-y-5">
      {sections.map((section) => (
        <TheorySectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}

export { parseTheorySections };
