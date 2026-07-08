"use client";

import type { MarkdownHeading } from "@/lib/trening/theory-content";

type TheoryTableOfContentsProps = {
  headings: MarkdownHeading[];
};

export function TheoryTableOfContents({ headings }: TheoryTableOfContentsProps) {
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Spis treści lekcji"
      className="surface-card p-4 lg:sticky lg:top-24"
    >
      <p className="text-xs font-medium text-slate-500">Spis treści</p>
      <ol className="mt-3 space-y-1">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-3" : undefined}>
            <a
              href={`#${heading.id}`}
              className={`block rounded-md px-2 py-1 text-sm transition hover:bg-white/[0.05] hover:text-teal-200 ${
                heading.level === 2 ? "font-medium text-slate-300" : "text-slate-500"
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
