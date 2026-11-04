"use client";

import { parseQuizMath } from "@/lib/math/quiz-plain-math";
import { useMemo } from "react";

type QuizEquationProps = {
  content: string;
  className?: string;
  as?: "span" | "div";
};

function Fraction({ num, den }: { num: string; den: string }) {
  return (
    <span
      className="mx-[0.12em] inline-flex flex-col items-center justify-center align-middle text-[0.58em] font-extrabold leading-none"
      aria-label={`${num}/${den}`}
    >
      <span className="px-[0.15em] tabular-nums">{num}</span>
      <span
        className="my-[0.12em] w-full border-t-2 border-current"
        aria-hidden
      />
      <span className="px-[0.15em] tabular-nums">{den}</span>
    </span>
  );
}

/**
 * Równanie quizowe bez KaTeX — czytelne, bez overflowów i „dziwnych” skal.
 * Wejście może być plain albo w starym formacie `$...$` / `\frac{}{}`.
 */
export function QuizEquation({
  content,
  className,
  as: Tag = "span",
}: QuizEquationProps) {
  const parts = useMemo(() => parseQuizMath(content), [content]);

  return (
    <Tag
      className={
        className ??
        "inline-flex max-w-full flex-wrap items-center justify-center gap-x-[0.15em] text-inherit"
      }
    >
      {parts.map((part, i) =>
        part.kind === "text" ? (
          <span key={i} className="whitespace-pre-wrap tabular-nums">
            {part.text}
          </span>
        ) : (
          <Fraction key={i} num={part.num} den={part.den} />
        ),
      )}
    </Tag>
  );
}
