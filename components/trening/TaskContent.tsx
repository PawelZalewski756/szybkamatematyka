"use client";

import { ContentImage } from "@/components/baza-zadan/ContentImage";
import { MathText } from "@/components/trening/MathText";
import { splitTaskContent } from "@/lib/baza-zadan/cke/matura-task-content";
import { getTaskMathChoices } from "@/lib/math/task-math-layout";
import type { MathTextPart } from "@/lib/math/render-math-text";
import { Fragment, useMemo } from "react";

type TaskContentProps = {
  content: string;
};

function MathParts({ parts }: { parts: MathTextPart[] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.kind === "text") {
          return <Fragment key={index}>{part.text}</Fragment>;
        }
        const content =
          part.kind === "display" ? `$$${part.latex}$$` : `$${part.latex}$`;
        return <MathText key={index} content={content} />;
      })}
    </>
  );
}

/** Treść zadania - LaTeX ($...$) + obrazki SVG z Gemini. */
export function TaskContent({ content }: TaskContentProps) {
  const mathChoices = useMemo(() => getTaskMathChoices(content), [content]);
  const parts = useMemo(() => splitTaskContent(content), [content]);

  if (mathChoices) {
    return (
      <div className="space-y-4 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
        <div className="whitespace-pre-line">
          <MathParts parts={mathChoices.before} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mathChoices.choices.map((latex, index) => (
            <div
              key={index}
              className="flex min-h-[4.5rem] items-center justify-center rounded-xl border border-surface-border bg-surface px-4 py-3 text-center"
            >
              <MathText content={`$$${latex}$$`} />
            </div>
          ))}
        </div>
        {mathChoices.after.length > 0 ? (
          <div className="whitespace-pre-line">
            <MathParts parts={mathChoices.after} />
          </div>
        ) : null}
      </div>
    );
  }

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
