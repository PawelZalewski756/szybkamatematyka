"use client";

import { splitMathText } from "@/lib/math/render-math-text";
import katex from "katex";
import { Fragment, useMemo } from "react";

type MathTextProps = {
  content: string;
  className?: string;
  as?: "span" | "div";
};

function renderLatex(latex: string, displayMode: boolean): string {
  return katex.renderToString(latex, {
    displayMode,
    throwOnError: false,
    strict: "ignore",
  });
}

/** Krótki tekst z LaTeX ($...$) — np. opcje ABCD. */
export function MathText({ content, className, as: Tag = "span" }: MathTextProps) {
  const nodes = useMemo(
    () =>
      splitMathText(content).map((part, index) => {
        if (part.kind === "text") {
          return <Fragment key={index}>{part.text}</Fragment>;
        }

        const html = renderLatex(part.latex, part.kind === "display");
        return (
          <span
            key={index}
            className={
              part.kind === "display"
                ? "katex-display my-2 block max-w-full overflow-x-auto"
                : "inline-block max-w-full overflow-x-auto align-baseline [&_.katex]:text-inherit"
            }
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }),
    [content],
  );

  return <Tag className={className}>{nodes}</Tag>;
}
