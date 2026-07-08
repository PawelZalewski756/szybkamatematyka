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
      <p className="text-xs font-medium text-muted">Spis treści</p>
      <ol className="mt-3 space-y-1">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-3" : undefined}>
            <a
              href={`#${heading.id}`}
              className={`block rounded-md px-2 py-1 text-sm transition hover:bg-surface-hover hover:text-brand ${
                heading.level === 2 ? "font-medium text-foreground" : "text-muted"
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
