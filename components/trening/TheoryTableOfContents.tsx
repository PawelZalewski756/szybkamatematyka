"use client";

import {
  SECTION_KIND_LABEL,
  type TheorySectionKind,
} from "@/lib/trening/theory-sections";
import type { MarkdownHeading } from "@/lib/trening/theory-content";
import { ListTree } from "lucide-react";

type TheoryTableOfContentsProps = {
  headings: MarkdownHeading[];
};

const KIND_DOT: Partial<Record<TheorySectionKind, string>> = {
  exam: "bg-orange-400",
  overview: "bg-sky-400",
  core: "bg-emerald-400",
  example: "bg-amber-400",
  traps: "bg-red-400",
  practice: "bg-violet-400",
  answers: "bg-zinc-400",
  review: "bg-teal-400",
};

export function TheoryTableOfContents({ headings }: TheoryTableOfContentsProps) {
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Spis treści lekcji"
      className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md lg:sticky lg:top-24"
    >
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300/90">
        <ListTree className="h-3.5 w-3.5" aria-hidden />
        Spis treści · {headings.length} modułów
      </p>
      <ol className="mt-3 space-y-1.5">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? "pl-3" : undefined}
          >
            <a
              href={`#${heading.id}`}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold transition hover:bg-white/10 hover:text-orange-200 ${
                heading.level === 2 ? "text-zinc-200" : "text-zinc-400"
              }`}
            >
              {heading.kind && KIND_DOT[heading.kind] && (
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOT[heading.kind]}`}
                  aria-hidden
                />
              )}
              <span className="min-w-0 flex-1 truncate">{heading.text}</span>
              {heading.kind && heading.kind !== "other" && (
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                  {SECTION_KIND_LABEL[heading.kind]}
                </span>
              )}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
