export type MathTextPart =
  | { kind: "text"; text: string }
  | { kind: "inline"; latex: string }
  | { kind: "display"; latex: string };

/**
 * Dzieli tekst na fragmenty zwykłe i LaTeX ($...$, $$...$$).
 * Używane w opcjach ABCD i krótkich etykietach - bez pełnego markdown.
 */
export function splitMathText(input: string): MathTextPart[] {
  const parts: MathTextPart[] = [];
  let i = 0;

  while (i < input.length) {
    if (input.startsWith("$$", i)) {
      const end = input.indexOf("$$", i + 2);
      if (end !== -1) {
        parts.push({ kind: "display", latex: input.slice(i + 2, end).trim() });
        i = end + 2;
        continue;
      }
    }

    if (input[i] === "$" && input[i + 1] !== "$") {
      const end = input.indexOf("$", i + 1);
      if (end !== -1) {
        parts.push({ kind: "inline", latex: input.slice(i + 1, end).trim() });
        i = end + 1;
        continue;
      }
    }

    const nextDollar = input.indexOf("$", i + 1);
    const end = nextDollar === -1 ? input.length : nextDollar;
    const text = input.slice(i, end);
    if (text) parts.push({ kind: "text", text });
    i = end;
  }

  return parts;
}

export function containsMathDelimiters(text: string): boolean {
  return /\$(?!\$)/.test(text) || /\$\$/.test(text);
}

const PLAIN_NUMBER_MATH = /(^|[^$])\$(\d+(?:[.,\u00A0 ]\d+)*)\$(?!\$)/g;

/**
 * Zamienia $169$ na 169. Sama liczba nie potrzebuje KaTeX-a, a w nim wychodzi
 * większa (1.21em) i w kroju szeryfowym, więc odstaje od zdania.
 */
export function unwrapPlainNumberMath(text: string): string {
  return text.replace(PLAIN_NUMBER_MATH, "$1$2");
}

/** Usuwa „A. ” z początku opcji - UI i tak pokazuje literę w badge. */
export function stripChoiceLabelPrefix(option: string): string {
  return option.replace(/^[A-Da-d]\.\s*/, "");
}
