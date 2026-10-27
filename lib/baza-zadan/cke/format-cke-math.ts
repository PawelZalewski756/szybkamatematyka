/**
 * Normalizacja treści zadań CKE do Markdown + LaTeX (KaTeX).
 *
 * Arkusze z OCR/HTML mają:
 *   - litery matematyczne Unicode (𝐴, 𝑥, 𝑷),
 *   - rozstrzelone nawiasy `f( x )`, potęgi `x 2`, indeksy `a 1`,
 *   - symbole ≤ ≥ − bez `$...$`,
 *   - czasem urwany HTML (czyszczone w cleanCkeTaskMarkup).
 *
 * Funkcja jest defensywna: nie rusza istniejących `$...$` / `$$...$$`
 * ani markdownowych obrazków i nie wciąga liter z polskich słów.
 */

import { cleanCkeTaskMarkup } from "@/lib/baza-zadan/cke/parse-abcd";

const IMG_PLACEHOLDER = "\uE000CKEIMG";
const MATH_PLACEHOLDER = "\uE000CKEMATH";

/** Litery, dla których `x 2` traktujemy jako potęgę. */
const POWER_BASES = new Set(["x", "y", "z", "m", "n", "t", "r", "k"]);

/** Litery, dla których `a 1` / `a n` traktujemy jako indeks dolny. */
const SUB_BASES = new Set([
  "a",
  "b",
  "c",
  "d",
  "p",
  "q",
  "s",
  "S",
  "u",
  "v",
  "w",
]);

function protectSegments(
  text: string,
  pattern: RegExp,
  prefix: string,
): { text: string; parts: string[] } {
  const parts: string[] = [];
  const out = text.replace(pattern, (match) => {
    const i = parts.length;
    parts.push(match);
    return `${prefix}${i}\uE001`;
  });
  return { text: out, parts };
}

function restoreSegments(
  text: string,
  parts: string[],
  prefix: string,
): string {
  return text.replace(
    new RegExp(`${prefix}(\\d+)\uE001`, "g"),
    (_m, i: string) => parts[Number(i)] ?? "",
  );
}

function oddDollarBefore(whole: string, offset: number): boolean {
  const before = whole.slice(0, offset);
  return ((before.match(/\$/g) ?? []).length) % 2 === 1;
}

function normalizeUnicodeMath(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/ƒ/g, "f")
    .replace(/⁄/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/×/g, "\\times")
    .replace(/·/g, "\\cdot")
    .replace(/÷/g, "\\div");
}

/** Zacieśnia typowe rozstrzelone fragmenty OCR. */
function compactSpacedMath(text: string): string {
  let out = text;

  // ( a n ) → (a_n)
  out = out.replace(
    /\(\s*([a-zA-Z])\s+([a-zA-Z0-9]+)\s*\)/g,
    (_m, base: string, idx: string) => `(${base}_{${idx}})`,
  );

  // f( x ) / g ( x ) → f(x)
  out = out.replace(
    /\b([a-zA-Z])\s*\(\s*([a-zA-Z0-9+\-]+)\s*\)/g,
    (_m, f: string, x: string) => `${f}(${x})`,
  );

  // ( x + 3 ) → (x+3) tylko spacje przy krawędzi nawiasu
  out = out.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");

  // | AB |
  out = out.replace(/\|\s*([A-Za-z]{1,6})\s*\|/g, (_m, seg: string) => `|${seg}|`);

  // Potęgi / indeksy: x 2, a 4
  out = out.replace(
    /\b([a-zA-Z])\s+(\d+)\b/g,
    (full, base: string, exp: string) => {
      if (POWER_BASES.has(base)) return `${base}^{${exp}}`;
      if (SUB_BASES.has(base) || SUB_BASES.has(base.toLowerCase())) {
        return `${base}_{${exp}}`;
      }
      return full;
    },
  );

  // a n
  out = out.replace(
    /\b([abcpqsS])\s+([nkmi])\b/g,
    (_m, base: string, idx: string) => `${base}_{${idx}}`,
  );

  // Współczynnik: 2 x → 2x, 4 x^{2} → 4x^{2} (tylko pojedyncza litera, nie "7 oraz")
  out = out.replace(
    /\b(\d+)\s+([a-zA-Z](?:_\{[^}]+\}|\^\{[^}]+\})?)(?![a-zA-ZĄąĆćĘęŁłŃńÓóŚśŹźŻż])/g,
    "$1$2",
  );

  // Znak przy liczbie: "- 1" → "-1" (tylko unarny minus przed cyfrą)
  out = out.replace(/(^|[=<>+\-(\s])-\s+(\d)/g, "$1-$2");

  // 4 / 7 → \frac{4}{7} (tylko czyste ułamki liczbowe)
  out = out.replace(
    /(?<!\$)\b(\d+)\s*\/\s*(\d+)\b(?!\$)/g,
    (_m, a: string, b: string) => `\\frac{${a}}{${b}}`,
  );

  return out;
}

/** Skleja sąsiednie wyspy `$a$ $b$` / `$a$$b$` w jedno `$a b$`. */
function mergeAdjacentMath(text: string): string {
  let out = text;
  for (let i = 0; i < 6; i++) {
    const next = out.replace(/\$([^$]+?)\$\s*\$([^$]+?)\$/g, (_m, a: string, b: string) => {
      const left = a.trim();
      const right = b.trim();
      // Sklejaj tylko gdy prawa strona to kontynuacja matematyki.
      if (!/^([=<>+\-\\|(a-zA-Z0-9α-ω]|\\le|\\ge|\\frac|\\times|\\cdot)/.test(right)) {
        return `$${left}$ $${right}$`;
      }
      const joiner =
        /[+\-=*/<>|(]$/.test(left) || /^[+\-=*/<>|(\\)]/.test(right) ? "" : " ";
      return `$${left}${joiner}${right}$`;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

function latexifySymbols(expr: string): string {
  return expr
    .replace(/≤/g, "\\le ")
    .replace(/≥/g, "\\ge ")
    .replace(/≠/g, "\\ne ")
    .replace(/±/g, "\\pm ")
    .replace(/∞/g, "\\infty ")
    .replace(/√\s*/g, "\\sqrt")
    .replace(/°/g, "^{\\circ}")
    .replace(/\b(sin|cos|tg|ctg|log|ln)(?=[\\(\sα-ωa-zA-Z0-9])/g, (_m, fn: string) => {
      if (fn === "tg") return "\\operatorname{tg}";
      if (fn === "ctg") return "\\operatorname{ctg}";
      return `\\${fn}`;
    })
    .replace(/\s*=\s*/g, " = ")
    .replace(/\s*\+\s*/g, " + ")
    // Unarny minus: "- 3" → "-3"; binarny: "x - 2" → "x - 2"
    .replace(/(^|[=+(\s])-\s+/g, "$1-")
    .replace(/([^\s=+\-(])\s*-\s*(?=\S)/g, "$1 - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Owija w `$...$` wyspy z operatorem (=, +, nierówność…),
 * startując tylko od bezpiecznego tokenu (nie ze środka polskiego słowa).
 */
function wrapMathIslands(text: string): string {
  // Atom: ułamek, |AB|, f(x), (…), -3x, 2, α — z opcjonalnym unarnym minusem.
  const atom =
    String.raw`(?:-?\\frac\{[^}]+\}\{[^}]+\}|\|[A-Za-z]{1,6}\||-?\d+(?:[.,]\d+)?[a-zA-Z](?:_\{[^}]+\}|\^\{[^}]+\})?|[a-zA-Z](?:_\{[^}]+\}|\^\{[^}]+\})?(?:\([^)]*\))?|\([^)]{1,40}\)|\-?\d+(?:[.,]\d+)?|[α-ω])`;
  const op = String.raw`(?:[=<>+\-*/]|\\le|\\ge|\\ne|\\times|\\cdot|\\pm)`;
  // Operator albo juxtapozycja nawiasów: (x+3)(x-2)
  const island = new RegExp(
    `(?<![A-Za-z0-9ĄąĆćĘęŁłŃńÓóŚśŹźŻż])${atom}(?:\\s*${op}\\s*${atom}|(?=\\()${atom})+`,
    "g",
  );

  return text.replace(island, (match, offset: number, whole: string) => {
    if (oddDollarBefore(whole, offset)) return match;
    const trimmed = match.trim();
    if (trimmed.startsWith("$") && trimmed.endsWith("$")) return match;
    return `$${latexifySymbols(trimmed)}$`;
  });
}

/** Samotne tokeny: f(x), a_{n}, x^{2}, |AB|, \frac{a}{b}. */
function wrapLoneTokens(text: string): string {
  const token =
    /(?<!\$)(?<![A-Za-z0-9ĄąĆćĘęŁłŃńÓóŚśŹźŻż\\])(?:\\frac\{[^}]+\}\{[^}]+\}|[a-zA-Z](?:_\{[^}]+\}|\^\{[^}]+\})+(?:\([^)]*\))?|[a-zA-Z]\([^)]*\)|\|[A-Za-z]{1,6}\|)(?!\$)/g;

  return text.replace(token, (match, offset: number, whole: string) => {
    if (oddDollarBefore(whole, offset)) return match;
    if (match.startsWith("$")) return match;
    return `$${latexifySymbols(match)}$`;
  });
}

function wrapSimpleInequalities(text: string): string {
  return text.replace(
    /(?<!\$)(?<![A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż])([a-zA-Z])\s*(≤|≥|<|>)\s*(-?\d+)\b(?!\$)/g,
    (_m, v: string, op: string, n: string) => {
      const mapped =
        op === "≤" ? "\\le" : op === "≥" ? "\\ge" : op;
      return `$${v} ${mapped} ${n}$`;
    },
  );
}

/**
 * Główny formatter: HTML junk → Unicode → kompakt OCR → `$...$`.
 */
export function formatCkeMathText(input: string): string {
  if (!input) return "";

  let out = cleanCkeTaskMarkup(input);
  if (!out) return "";

  const images = protectSegments(
    out,
    /!\[[^\]]*\]\([^)]+\)/g,
    IMG_PLACEHOLDER,
  );
  out = images.text;

  const existingMath = protectSegments(
    out,
    /\$\$[\s\S]+?\$\$|\$[^$\n]+\$/g,
    MATH_PLACEHOLDER,
  );
  out = existingMath.text;

  out = normalizeUnicodeMath(out);
  out = compactSpacedMath(out);
  out = wrapMathIslands(out);
  out = wrapLoneTokens(out);
  out = wrapSimpleInequalities(out);
  out = mergeAdjacentMath(out);

  out = restoreSegments(out, existingMath.parts, MATH_PLACEHOLDER);
  out = restoreSegments(out, images.parts, IMG_PLACEHOLDER);

  return out.replace(/[^\S\n]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** True, gdy treść nadal wygląda na zepsuty HTML scrapera. */
export function hasCkeHtmlGarbage(text: string): boolean {
  return (
    /<[a-zA-Z][^>]*>/.test(text) ||
    /<[a-zA-Z][^<>]*$/.test(text.trim()) ||
    /&(?:fnof|frasl|lang|rang|raquo|alpha|ge|radic);/i.test(text) ||
    /&#\d+;/.test(text)
  );
}
