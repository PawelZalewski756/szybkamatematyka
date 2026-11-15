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

/** \(...\) i \[...\] na $...$ - spotykane w części treści z bazy. */
function normalizeDelimiters(text: string): string {
  if (!text.includes("\\(") && !text.includes("\\)") && !text.includes("\\[") && !text.includes("\\]")) {
    return text;
  }
  return text
    .replace(/\\\[/g, () => "$$")
    .replace(/\\\]/g, () => "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");
}

/** Naprawia "egin{cases}" (urwane \begin) i "ight)" (urwane \right). */
function fixBrokenCommands(text: string): string {
  let out = text
    .replace(/(^|[^\\A-Za-z])[ \t]*egin\{/g, "$1\\begin{")
    .replace(/(^|[^\\A-Za-z])[ \t]*rac\{/g, "$1\\frac{")
    .replace(/(^|[^\\A-Za-z])[ \t]*ight(?=[)\]])/g, "$1 \\right");

  // W cases "\\" (łamanie wiersza) zapisało się jako "\ " - przywracamy.
  out = out.replace(
    /(\\begin\{cases\}[\s\S]*?\\end\{cases\})/g,
    (block) =>
      block.replace(/(^|[^\\])\\[ \t]+/g, (_match, prefix: string) => `${prefix}\\\\ `),
  );
  return out;
}

/** Dokłada brakujący $, gdy delimiter został urwany. */
function fixDollarParity(text: string): string {
  const dollars = (text.match(/\$/g) ?? []).length;
  if (dollars % 2 === 0) return text;
  if (text.startsWith("$$") && !text.endsWith("$$")) {
    return `$${text.slice(2)}`;
  }
  return `${text}$`;
}

/**
 * Normalizuje treść zadania przed renderowaniem: delimitery, sklejone komendy,
 * brakujące dolary. Idempotentna, nie zmienia tekstu bez potrzeby.
 */
export function normalizeMathText(text: string): string {
  if (typeof text !== "string" || !text) return text;
  let out = normalizeDelimiters(text);
  out = repairEscapedLatex(out);
  out = fixBrokenCommands(out);
  out = fixSplitDisplayDollars(out);
  out = out.replace(/\\textbf\{([^{}]*)\}/g, "$1");
  return fixDollarParity(out);
}

const UNIT_WORDS =
  /^(cm|mm|dm|km|m|kg|g|mg|l|ml|s|min|h|godz|zł|metr|metra|metry|metrów|centymetr|centymetra|centymetrów|decymetr|decymetra|kilometr|kilometra|stopień|stopnia|stopni|stopnie|cal|cala|cali)$/i;

const UNIT_SEARCH =
  /(?:^|\s)(?:cm|mm|dm|km|m|kg|g|mg|l|ml|s|min|h|godz|zł|metr|metra|metry|metrów|centymetr|centymetra|centymetrów|decymetr|decymetra|kilometr|kilometra|stopień|stopnia|stopni|stopnie|cal|cala|cali)\b/i;

/** Sklejone $ $ (z $$) wracają do $$, gdy stoją na granicy białych znaków. */
function fixSplitDisplayDollars(text: string): string {
  if (!/\$\s+\$/.test(text)) return text;
  let out = text.replace(/\$\s+\$\s+\$(?=\s)/g, () => "$$");
  out = out.replace(/\$\s+\$(?=\s)/g, () => "$$");
  out = out.replace(/\s\$\s+\$$/, () => " $$");
  return out;
}

/**
 * Opcje i odpowiedzi w bazie często są zapisane bez $, np. "x \\in \\langle 2, 3 \\rangle".
 * Jeśli segment jest wzorem, opakowujemy go w $...$. Gdy do wzoru doklejona jest
 * jednostka ("15\\sqrt{2} metrów"), w $...$ idzie sam wzór, a jednostka zostaje tekstem.
 */
function wrapFormulaSegment(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || !/\\[A-Za-z]+/.test(trimmed)) return text;
  if (trimmed.includes("\\text{")) return text;

  const words =
    trimmed.replace(/\\[A-Za-z]+/g, " ").match(/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{2,}/g) ?? [];

  if (words.length === 0) return `$${trimmed}$`;
  if (!words.every((word) => UNIT_WORDS.test(word))) return text;

  const unitIndex = trimmed.search(UNIT_SEARCH);
  if (unitIndex > 0) {
    const formula = trimmed.slice(0, unitIndex).trimEnd();
    const rest = trimmed.slice(formula.length);
    if (/\\[A-Za-z]+/.test(formula)) return `$${formula}$${rest}`;
  }
  return text;
}

export function ensureMathDelimiters(text: string): string {
  const parts = splitMathText(text);
  let changed = false;
  const out = parts
    .map((part) => {
      if (part.kind === "text") {
        const wrapped = wrapFormulaSegment(part.text);
        if (wrapped !== part.text) changed = true;
        return wrapped;
      }
      return part.kind === "display" ? `$$${part.latex}$$` : `$${part.latex}$`;
    })
    .join("");
  return changed ? out : text;
}

const TABLE_DELIMITER = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;

function tableCellCount(line: string): number {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").length;
}

/**
 * GFM nie parsuje tabeli, gdy wiersz nagłówka ma inną liczbę komórek niż
 * separator (np. `| |` nad `|:---|:---:|:---:|`). Wtedy cała tabela pokazuje
 * się jako surowy tekst. Uzupełniamy brakujące komórki nagłówka.
 */
export function fixMarkdownTables(text: string): string {
  if (!text.includes("|")) return text;
  const lines = text.split("\n");
  let changed = false;

  for (let i = 1; i < lines.length; i++) {
    if (!TABLE_DELIMITER.test(lines[i])) continue;
    const header = lines[i - 1];
    if (!header.includes("|")) continue;

    const expected = tableCellCount(lines[i]);
    const actual = tableCellCount(header);
    if (expected === actual) continue;

    const next = lines[i + 1] ?? "";
    if (expected === 3 && /\|\s*P\s*\|\s*F\s*\|?\s*$/.test(next)) {
      lines[i - 1] = "| | P | F |";
    } else {
      const cells = header
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
      while (cells.length < expected) cells.push("");
      lines[i - 1] = `| ${cells.join(" | ").trimEnd()} |`;
    }
    changed = true;
  }

  return changed ? lines.join("\n") : text;
}
