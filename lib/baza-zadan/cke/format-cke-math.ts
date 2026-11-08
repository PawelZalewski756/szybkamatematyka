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
    .replace(/[−–-]/g, "-")
    .replace(/[∡∠]/g, "\\angle ")
    .replace(/×/g, "\\times")
    .replace(/·/g, "\\cdot")
    .replace(/÷/g, "\\div")
    // Stopnie przed owijaniem, żeby weszły do wyspy matematycznej.
    .replace(/(\d)\s*°/g, "$1^{\\circ}")
    // Sklejony OCR: "≥ 0z niewiadomą" → "≥ 0 z niewiadomą"
    .replace(/([=<>≤≥])\s*(-?\d+)([a-ząćęłńóśźż])/gi, "$1 $2 $3");
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

  // Potęgi ASCII: a^2 → a^{2}
  out = out.replace(/\b([a-zA-Z])\^(\d+)\b/g, "$1^{$2}");

  // 3a 2 → 3a^{2} (litera sklejona ze współczynnikiem → potęga, nie indeks)
  out = out.replace(
    /(\d)([a-zA-Z])\s+(\d+)\b/g,
    (_m, coeff: string, base: string, exp: string) =>
      `${coeff}${base}^{${exp}}`,
  );

  // Potęgi / indeksy: x 2, a 4 (tylko samotna litera - nie środek polskiego słowa)
  out = out.replace(
    /(?<![A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż])([a-zA-Z])\s+(\d+)(?![A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż])/g,
    (full, base: string, exp: string, offset: number, whole: string) => {
      if (base === "z") {
        // „z 150” can be ordinary Polish text, so require a nearby math operator.
        const before = whole.slice(0, offset);
        const after = whole.slice(offset + full.length);
        const hasMathContext =
          /[A-Za-z0-9)]\s*[=+\-*/<>≤≥]\s*$/.test(before) ||
          /^\s*(?:[=<>≤≥]|[+*/-]\s*(?:\\(?:frac|sqrt|times|cdot)|\d|[A-Za-z](?![A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż])|\())/.test(after);
        if (!hasMathContext) return full;
      }
      if (POWER_BASES.has(base)) return `${base}^{${exp}}`;
      if (SUB_BASES.has(base) || SUB_BASES.has(base.toLowerCase())) {
        return `${base}_{${exp}}`;
      }
      return full;
    },
  );

  // a n / a k - bez litery „i” (polskie „a i b” = „a oraz b”)
  out = out.replace(
    /\b([abcpqsS])\s+([nkm])\b/g,
    (_m, base: string, idx: string) => `${base}_{${idx}}`,
  );

  // sin50° / cos 20 → sin 50 / cos 20 (żeby weszło do jednej wyspy z °)
  out = out.replace(
    /\b(sin|cos|tg|ctg|log|ln)\s*(\d+)/gi,
    (_m, fn: string, n: string) => `${fn} ${n}`,
  );

  // sin 2 20° → sin^{2} 20° (OCR potęgi funkcji trygonometrycznej)
  out = out.replace(
    /\b(sin|cos|tg|ctg)\s+2\s+(\d+(?:\^\{\\circ\})?)/gi,
    (_m, fn: string, rest: string) => `${fn}^{2} ${rest}`,
  );

  // Współczynnik: 2 x → 2x, tylko gdy dalej operator/koniec (nie "0 z niewiadomą")
  out = out.replace(
    /\b(\d+)\s+([a-zA-Z](?:_\{[^}]+\}|\^\{[^}]+\})?)(?=\s*[+\-=<>≤≥).,]|\s*$)/g,
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
    .replace(/\b(sin|cos|tg|ctg|log|ln)(?=[\\(^(\sα-ωa-zA-Z0-9])/g, (_m, fn: string) => {
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
  // Atom: ułamek, |AB|, f(x), ax, -3x, sin 50^{\circ}, 90^{\circ}, (…), α.
  const atom =
    String.raw`(?:-?\\frac\{[^}]+\}\{[^}]+\}|\\angle\s*[A-Za-z]{1,6}|\|[A-Za-z\\angle\s]{1,12}\||-?\d+(?:[.,]\d+)?[a-zA-Z]+(?:_\{[^}]+\}|\^\{[^}]+\})?|(?:sin|cos|tg|ctg|log|ln)(?:\^\{[^}]+\})?\s+\d+(?:\^\{\\circ\})?|[a-zA-Z]{1,3}(?:_\{[^}]+\}|\^\{[^}]+\})?(?:\([^)]*\))?|\([^)]{1,80}\)|\-?\d+(?:[.,]\d+)?(?:\^\{\\circ\})?|[α-ω])`;
  const op = String.raw`(?:[=<>≤≥+\-*/]|\\le|\\ge|\\ne|\\times|\\cdot|\\pm)`;
  // Operator albo juxtapozycja nawiasów: (x+3)(x-2)
  const island = new RegExp(
    `(?<![A-Za-z0-9ĄąĆćĘęŁłŃńÓóŚśŹźŻż])${atom}(?:\\s*${op}\\s*${atom}|(?=\\()${atom})+(?![A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż])`,
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
    /(?<!\$)(?<![A-Za-z0-9ĄąĆćĘęŁłŃńÓóŚśŹźŻż])([a-zA-Z](?:[a-zA-Z])?(?:\([^)]*\))?)\s*(≤|≥|<|>)\s*(-?\d+)\b(?!\$)/g,
    (_m, v: string, op: string, n: string) => {
      const mapped =
        op === "≤" ? "\\le" : op === "≥" ? "\\ge" : op;
      return `$${v} ${mapped} ${n}$`;
    },
  );
}

/**
 * Owija samotne zmienne w typowym kontekście polskim:
 * „funkcji P”, „długość x”, „niewiadomą x”.
 */
function wrapContextualVariables(text: string): string {
  return text.replace(
    /(?<!\$)\b(funkcji|funkcja|długość|długości|niewiadomą|niewiadoma|wyraz|wyrazy|współczynnik|argument|podstawa|podstawy|krawędzi|krawędź)\s+([A-Za-z])\b(?!\$)/gi,
    (_m, word: string, v: string) => `${word} $${v}$`,
  );
}

/** Kąty i stopnie: |∠ACB| = |∠BGF| = 90° oraz samotne 90°. */
function wrapAnglesAndDegrees(text: string): string {
  let out = text.replace(
    /(?<!\$)((?:\|\\angle\s*[A-Za-z]{1,6}\|\s*=\s*)+)(\d+)\s*(?:\^\{\\circ\}|°)?(?!\$)/g,
    (_m, chain: string, deg: string) => {
      const left = chain
        .replace(/\s*=\s*/g, " = ")
        .replace(/\s*=\s*$/, "")
        .trim();
      return `$${left} = ${deg}^{\\circ}$`;
    },
  );

  // α = 180° - 2β (bez \b - greka nie jest „word char” bez flagi u)
  out = out.replace(
    /(?<!\$)([α-ω])\s*=\s*(\d+)\s*(?:\^\{\\circ\}|°)\s*-\s*(\d+)\s*([α-ω])(?!\$)/g,
    (_m, a: string, deg: string, coef: string, b: string) =>
      `$${a} = ${deg}^{\\circ} - ${coef}${b}$`,
  );

  // m = sin 50° / sin^{2} 20° / cos 20° jako całość (nie wewnątrz nawiasów)
  out = out.replace(
    /(?<!\$)(?:([a-zA-Z])\s*=\s*)?\b((?:sin|cos|tg|ctg)(?:\^\{[^}]+\})?\s+\d+)\s*(?:\^\{\\circ\}|°)(?!\$)/gi,
    (match, lhs: string | undefined, body: string, offset: number, whole: string) => {
      if (oddDollarBefore(whole, offset)) return match;
      const before = whole.slice(0, offset);
      const open = (before.match(/\(/g) ?? []).length;
      const close = (before.match(/\)/g) ?? []).length;
      if (open > close) return match;
      const expr = lhs ? `${lhs} = ${body}^{\\circ}` : `${body}^{\\circ}`;
      return `$${latexifySymbols(expr)}$`;
    },
  );

  out = out.replace(
    /(?<!\$)(?<![A-Za-z0-9\\])(\d+)\s*(?:\^\{\\circ\}|°)(?!\$)/g,
    (match, deg: string, offset: number, whole: string) => {
      if (oddDollarBefore(whole, offset)) return match;
      const before = whole.slice(Math.max(0, offset - 16), offset);
      if (/(?:sin|cos|tg|ctg|log|ln)(?:\^\{[^}]+\})?\s*$/i.test(before)) {
        return match;
      }
      return `$${deg}^{\\circ}$`;
    },
  );
  return out;
}

/** Nawiasy z matematyką: (1 - cos 20°) zanim wyspa oderwie wnętrze. */
function wrapParenMath(text: string): string {
  return text.replace(/\(([^$\n()]{1,80})\)/g, (full, inner: string, offset: number, whole: string) => {
    if (oddDollarBefore(whole, offset)) return full;
    if (
      !/[+\-=<>≤≥*/]|\\times|\\cdot|\\le|\\ge|\bsin\b|\bcos\b|\btg\b|\bctg\b|\d\^\{\\circ\}/.test(
        inner,
      )
    ) {
      return full;
    }
    return `$${latexifySymbols(`(${inner.trim()})`)}$`;
  });
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
  // Kąty / trig+° / nawiasy przed wyspami - inaczej `$m = sin$` odrywa stopnie.
  out = wrapAnglesAndDegrees(out);
  out = wrapParenMath(out);
  out = wrapMathIslands(out);
  out = wrapLoneTokens(out);
  out = wrapSimpleInequalities(out);
  out = wrapContextualVariables(out);
  out = mergeAdjacentMath(out);

  out = restoreSegments(out, existingMath.parts, MATH_PLACEHOLDER);
  out = restoreSegments(out, images.parts, IMG_PLACEHOLDER);

  // OCR wykładnicze: $f(x) = a$ x → $f(x) = a^{x}$
  out = out.replace(
    /\$([^$]*?=\s*[a-zA-Z])\$\s*x\b/g,
    (_m, body: string) => `$${body}^{x}$`,
  );
  // $(gdzie $a > 0$ i a\ne 1)$ / $$a > 0$$ → $(gdzie a > 0 i a \ne 1)$
  out = out.replace(
    /\$\(\s*gdzie\s*\$+([^$]+?)\$+\s*i\s*([^)]+?)\)\$/gi,
    (_m, cond: string, rest: string) =>
      `$(gdzie ${cond.trim()} i ${rest
        .trim()
        .replace(/\\ne/g, "\\ne ")
        .replace(/\s+/g, " ")})$`,
  );
  out = out.replace(/\ba\\ne\b/g, "a \\ne ");
  // Przypadkowe $$…$$ na krótkim inline (nie display) → $…$
  out = out.replace(/\$\$([^$\n]{1,48})\$\$/g, (_m, body: string) => `$${body}$`);

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
