"use client";

import { ContentImage } from "@/components/baza-zadan/ContentImage";
import { MathText } from "@/components/trening/MathText";
import { splitTaskContent } from "@/lib/baza-zadan/cke/matura-task-content";
import { useMemo } from "react";

type TaskContentProps = {
  content: string;
};

/** Treść zadania — LaTeX ($...$) + obrazki SVG z Gemini. */
export function TaskContent({ content }: TaskContentProps) {
  const parts = useMemo(() => splitTaskContent(content), [content]);

  return (
    <div className="space-y-3 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
      {parts.map((part, index) => {
        if (part.type === "image") {
          return (
            <ContentImage
              key={`img-${index}`}
              src={part.src}
              alt={part.alt}
            />
          );
        }

        return (
          <MathText
            key={`text-${index}`}
            as="div"
            content={part.content}
            className="[&_.katex]:text-foreground"
          />
        );
      })}
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
