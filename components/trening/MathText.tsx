"use client";

import {
  ensureMathDelimiters,
  normalizeMathText,
  splitMathText,
} from "@/lib/math/render-math-text";
import { KATEX_OPTIONS } from "@/lib/math/katex-macros";
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
    ...KATEX_OPTIONS,
  });
}

const IMAGE_MD = /!\[([^\]]*)\]\(([^)\s]+)\)/g;

/**
 * Liczby w tekstach zadań są często zapisane jako $169$.
 * KaTeX renderuje je wtedy w kroju szeryfowym i w rozmiarze 1.21em, przez co
 * wyglądają jak indeks górny i odstają od zdania. Dla samej liczby wystarczy
 * zwykły tekst, więc pomijamy KaTeX.
 */
const PLAIN_NUMBER = /^\d+(?:[.,\s]\d+)*$/;

/** Tekst z obrazkami markdown (opcje typu ![...](...)) - renderuje <img> zamiast surowego zapisu. */
function renderTextWithImages(text: string, keyBase: number) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(IMAGE_MD)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(<Fragment key={`${keyBase}-t${k++}`}>{text.slice(last, idx)}</Fragment>);
    out.push(
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={`${keyBase}-i${k++}`}
        src={m[2]}
        alt={m[1] && m[1] !== "Rysunek do zadania" ? m[1] : "Opcja odpowiedzi"}
        loading="lazy"
        className="mx-auto inline-block max-h-28 max-w-full rounded bg-white object-contain p-1 align-middle"
      />,
    );
    last = idx + m[0].length;
  }
  if (last === 0) return text;
  if (last < text.length) out.push(<Fragment key={`${keyBase}-t${k++}`}>{text.slice(last)}</Fragment>);
  return out;
}

/** Krótki tekst z LaTeX ($...$) - np. opcje ABCD. */
export function MathText({ content, className, as: Tag = "span" }: MathTextProps) {
  const nodes = useMemo(
    () =>
      splitMathText(ensureMathDelimiters(normalizeMathText(content))).map(
        (part, index) => {
        if (part.kind === "text") {
          return <Fragment key={index}>{renderTextWithImages(part.text, index)}</Fragment>;
        }

        if (part.kind === "inline" && PLAIN_NUMBER.test(part.latex)) {
          return <Fragment key={index}>{part.latex}</Fragment>;
        }

        const html = renderLatex(part.latex, part.kind === "display");
        return (
          <span
            key={index}
            className={
              part.kind === "display"
                ? "katex-display my-2 block max-w-full overflow-x-auto"
                : // Inline math musi zostać zwykłym elementem inline. Wcześniej
                  // `inline-block` + `overflow-x-auto` tworzył scrollowaną ramkę:
                  // przeglądarka brała jej dolną krawędź jako linię bazową, więc
                  // wzór „unosił się” nad tekstem, a na ułamkach pojawiał się
                  // poziomy suwak. Dla wzorów w linii nie ma scrolla - mają
                  // wyglądać jak fragment zdania.
                  "inline align-baseline [&_.katex]:text-[1em]"
            }
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }),
    [content],
  );

  return <Tag className={className}>{nodes}</Tag>;
}
