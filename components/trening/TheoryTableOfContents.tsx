"use client";

import type { MarkdownHeading } from "@/lib/trening/theory-content";
import { ListTree } from "lucide-react";

type TheoryTableOfContentsProps = {
  headings: MarkdownHeading[];
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
        Spis treści
      </p>
      <ol className="mt-3 space-y-1.5">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? "pl-3" : undefined}
          >
            <a
              href={`#${heading.id}`}
              className={`block rounded-lg px-2 py-1 text-sm font-semibold transition hover:bg-white/10 hover:text-orange-200 ${
                heading.level === 2 ? "text-zinc-200" : "text-zinc-400"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
