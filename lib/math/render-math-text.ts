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

/**
 * Część zadań w bazie ma sklejone komendy LaTeX: `\times` trafiło do kolumny
 * jako TAB + "imes", `\frac` jako FF + "rac", `\right` jako CR + "ight",
 * a `\begin` jako BS + "egin". KaTeX dostaje wtedy "imes" zamiast ×.
 * Naprawiamy to przy renderowaniu, tylko wewnątrz $...$ i tylko dla znanych
 * komend, żeby nie ruszać zwykłych znaków kontrolnych w tekście.
 */
const ESCAPED_LETTER: Record<number, string> = {
  0x08: "b",
  0x09: "t",
  0x0a: "n",
  0x0b: "v",
  0x0c: "f",
  0x0d: "r",
};

const LATEX_COMMANDS: Record<string, readonly string[]> = {
  t: [
    "times", "text", "textbf", "textit", "textrm", "textnormal", "textcolor",
    "textstyle", "theta", "tan", "tanh", "tau", "to", "top", "triangle",
    "therefore", "thickapprox", "thinspace", "tfrac", "tbinom", "tilde",
    "trapezium", "triangleq", "twoheadrightarrow",
  ],
  f: ["frac", "forall", "flat", "frown", "fbox", "footnotesize"],
  r: [
    "right", "rho", "rightarrow", "rightleftharpoons", "rceil", "rfloor",
    "rm", "rvert", "rVert", "rangle", "raisebox",
  ],
  b: [
    "begin", "beta", "bmod", "bullet", "because", "bot", "big", "Big",
    "bigg", "Bigg", "bigcup", "bigcap", "binom", "backslash", "bar",
    "boldsymbol", "bm", "boxed", "breve", "bigtriangleup",
  ],
  v: [
    "vdots", "varepsilon", "varphi", "varrho", "varsigma", "vartheta",
    "vec", "vee", "varnothing", "vert", "vline", "vspace",
  ],
  n: [
    "neq", "not", "nu", "nabla", "nleq", "ngeq", "notin", "nexists",
    "nearrow", "nwarrow", "nolimits", "newline", "nonumber", "nparallel",
    "nmid", "nsubseteq", "nsupseteq", "nrightarrow", "nleftarrow",
  ],
};

function findMathRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("$$", i)) {
      const end = text.indexOf("$$", i + 2);
      if (end !== -1) {
        ranges.push([i + 2, end]);
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "$" && text[i + 1] !== "$") {
      const end = text.indexOf("$", i + 1);
      if (end !== -1) {
        ranges.push([i + 1, end]);
        i = end + 1;
        continue;
      }
    }
    i += 1;
  }
  return ranges;
}

export function repairEscapedLatex(text: string): string {
  if (!/[\u0008-\u000d]/.test(text)) return text;

  const ranges = findMathRanges(text);
  if (ranges.length === 0) return text;

  let out = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const letter = ESCAPED_LETTER[code];
    const inMath = ranges.some(([start, end]) => i >= start && i < end);
    if (!letter || !inMath) {
      out += text[i];
      continue;
    }

    const rest = text.slice(i + 1);
    const candidates = (LATEX_COMMANDS[letter] ?? []).filter((command) =>
      rest.startsWith(command.slice(1)),
    );
    if (candidates.length === 0) {
      out += code === 0x0a ? "\n" : " ";
      continue;
    }

    candidates.sort((a, b) => b.length - a.length);
    out += `\\${letter}`;
  }

  return out;
}
