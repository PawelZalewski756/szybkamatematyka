"use client";

import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";

type TaskContentProps = {
  content: string;
};

/** Treść zadania — markdown + LaTeX + SVG/data-URI z Gemini. */
export function TaskContent({ content }: TaskContentProps) {
  return (
    <div className="text-base font-semibold leading-relaxed text-foreground sm:text-lg">
      <TheoryMarkdown content={content} variant="compact" />
    </div>
  );
}

/** Inline SVG gdy treść zawiera surowy blok (legacy). */
export function TaskFigure({ svg, caption }: { svg: string; caption?: string }) {
  return (
    <figure className="mb-4 flex flex-col items-center rounded-xl border border-surface-border bg-surface p-3">
      <div
        className="max-h-[min(280px,45vh)] w-full overflow-hidden [&_svg]:mx-auto [&_svg]:max-h-full [&_svg]:w-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption ? (
        <figcaption className="mt-2 text-center text-xs text-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
