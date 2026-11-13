"use client";

import { latexToPlainText } from "@/lib/math/normalize-math-text";
import { splitMathText } from "@/lib/math/render-math-text";
import katex from "katex";
import { Fragment, useMemo } from "react";

type MathTextProps = {
  content: string;
  className?: string;
  as?: "span" | "div";
};

/**
 * Renderuje formułę albo zwraca `null`, gdy KaTeX jej nie rozumie.
 * Wtedy pokazujemy czytelny tekst (`5 × 3`) zamiast czerwonego błędu
 * z surowym LaTeX-em, który wygląda jak zepsute zadanie.
 */
function renderLatex(latex: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: true,
      strict: "ignore",
    });
  } catch {
    return null;
  }
}

const IMAGE_MD = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
const BOLD_MD = /\*\*([^*\n]+)\*\*/g;

/** Tekst z obrazkami markdown (opcje typu ![...](...)) - renderuje <img> zamiast surowego zapisu. */
function renderTextWithImages(text: string, keyPrefix: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(IMAGE_MD)) {
    const idx = m.index ?? 0;
    if (idx > last) {
      out.push(
        <Fragment key={`${keyPrefix}-t${k++}`}>{text.slice(last, idx)}</Fragment>,
      );
    }
    out.push(
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={`${keyPrefix}-i${k++}`}
        src={m[2]}
        alt={m[1] && m[1] !== "Rysunek do zadania" ? m[1] : "Opcja odpowiedzi"}
        loading="lazy"
        className="mx-auto inline-block max-h-28 max-w-full rounded bg-white object-contain p-1 align-middle"
      />,
    );
    last = idx + m[0].length;
  }
  if (last === 0) return text;
  if (last < text.length) {
    out.push(<Fragment key={`${keyPrefix}-t${k++}`}>{text.slice(last)}</Fragment>);
  }
  return out;
}

/**
 * Tekst z lekkim markdownem (`**pogrubienie**`), bez pełnego parsera.
 * Wyjaśnienia zadań i odpowiedzi AI używają `**Odpowiedź:**`, co wcześniej
 * renderowało się z widocznymi gwiazdkami.
 */
function renderRichText(text: string, keyPrefix: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const match of text.matchAll(BOLD_MD)) {
    const start = match.index ?? 0;
    if (start > last) {
      out.push(
        <Fragment key={`${keyPrefix}-t${k++}`}>
          {renderTextWithImages(text.slice(last, start), `${keyPrefix}-t${k}`)}
        </Fragment>,
      );
    }
    out.push(
      <strong key={`${keyPrefix}-b${k++}`} className="font-bold">
        {renderTextWithImages(match[1], `${keyPrefix}-b${k}`)}
      </strong>,
    );
    last = start + match[0].length;
  }
  if (last === 0) return renderTextWithImages(text, keyPrefix);
  if (last < text.length) {
    out.push(
      <Fragment key={`${keyPrefix}-t${k++}`}>
        {renderTextWithImages(text.slice(last), `${keyPrefix}-t${k}`)}
      </Fragment>,
    );
  }
  return out;
}

/** Krótki tekst z LaTeX ($...$) - np. opcje ABCD. */
export function MathText({ content, className, as: Tag = "span" }: MathTextProps) {
  const nodes = useMemo(
    () =>
      splitMathText(content).map((part, index) => {
        if (part.kind === "text") {
          return (
            <Fragment key={index}>
              {renderRichText(part.text, `p${index}`)}
            </Fragment>
          );
        }

        const html = renderLatex(part.latex, part.kind === "display");
        if (html === null) {
          return (
            <Fragment key={index}>{latexToPlainText(part.latex)}</Fragment>
          );
        }
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
