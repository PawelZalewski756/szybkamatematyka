/**
 * Formatowanie równań quizowych (minigry / pojedynki / wyzwania) BEZ KaTeX.
 * KaTeX w szybkich grach psuje layout (overflow, skala, „dziwne” ułamki).
 * Trening i CKE nadal używają MathText/KaTeX.
 */

export type QuizMathPart =
  | { kind: "text"; text: string }
  | { kind: "frac"; num: string; den: string };

const SUPER: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "−": "⁻",
};

const VULGAR: Record<string, string> = {
  "1/2": "½",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/4": "¼",
  "3/4": "¾",
  "1/5": "⅕",
  "2/5": "⅖",
  "3/5": "⅗",
  "4/5": "⅘",
  "1/6": "⅙",
  "5/6": "⅚",
  "1/8": "⅛",
  "3/8": "⅜",
  "5/8": "⅝",
  "7/8": "⅞",
};

/** Zdejmuje otaczające `$...$` / `$$...$$`. */
export function stripMathDelimiters(input: string): string {
  let s = input.trim();
  if (s.startsWith("$$") && s.endsWith("$$") && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith("$") && s.endsWith("$") && s.length >= 2) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function toSuperscript(raw: string): string {
  return [...raw].map((ch) => SUPER[ch] ?? ch).join("");
}

/**
 * Konwertuje LaTeX / tekst z generatorów minigier na części do ładnego UI.
 * Obsługuje: \frac, \times, \div, \sqrt, ^{n}, \%, zwykły tekst.
 */
export function parseQuizMath(input: string): QuizMathPart[] {
  // Usuwamy WSZYSTKIE `$` — generatory czasem mieszają kilka segmentów
  // (`$75\%$ z $40 = 30$`), a KaTeX i tak tu nie używamy.
  let s = input.replace(/\$\$/g, "").replace(/\$/g, "").trim();

  // Najpierw zamień komendy niebędące ułamkami — ułatwia parsing \frac.
  s = s
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\cdot/g, "·")
    .replace(/\\pm/g, "±")
    .replace(/\\leq/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\%/g, "%")
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(/\\mathrm\{([^{}]*)\}/g, "$1")
    .replace(/\\operatorname\{([^{}]*)\}/g, "$1")
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\!/g, "")
    .replace(/\\circ/g, "°")
    .replace(/\\bmod/g, " mod ")
    .replace(/\\dfrac/g, "\\frac")
    .replace(/~/g, " ");

  // \sqrt{...} → √(...) lub √n
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, (_m, inner: string) => {
    const t = inner.trim();
    return /^\d+$/.test(t) ? `√${t}` : `√(${t})`;
  });
  s = s.replace(/\\sqrt\s+(\d+)/g, "√$1");

  // a^{b} → aᵇ
  s = s.replace(/\^\{([^{}]+)\}/g, (_m, exp: string) => toSuperscript(exp.trim()));
  s = s.replace(/\^(\d+)/g, (_m, exp: string) => toSuperscript(exp));

  const parts: QuizMathPart[] = [];
  // \frac MUSI być przed catch-all usuwaniem \command — inaczej zostanie „frac”.
  const fracRe = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = fracRe.exec(s)) !== null) {
    if (match.index > last) {
      pushText(parts, finalizePlainCommands(s.slice(last, match.index)));
    }
    const num = match[1].trim();
    const den = match[2].trim();
    const vulgar = VULGAR[`${num}/${den}`];
    if (vulgar) {
      parts.push({ kind: "text", text: vulgar });
    } else {
      parts.push({ kind: "frac", num, den });
    }
    last = match.index + match[0].length;
  }
  if (last < s.length) {
    pushText(parts, finalizePlainCommands(s.slice(last)));
  }

  if (parts.length === 0) {
    pushText(parts, finalizePlainCommands(s));
  }

  return mergeAdjacentText(parts);
}

/** Pozostałe komendy LaTeX → unicode / goły tekst (po wycięciu \frac). */
function finalizePlainCommands(raw: string): string {
  return raw
    .replace(/\\infty/g, "∞")
    .replace(/\\([a-zA-Z]+)/g, "$1");
}

function pushText(parts: QuizMathPart[], raw: string) {
  const text = cleanupPlain(raw);
  if (text) parts.push({ kind: "text", text });
}

function cleanupPlain(raw: string): string {
  return raw
    .replace(/\{([^{}]+)\}/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/\s*([=<>≤≥≠+×÷·−-])\s*/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();
}

function mergeAdjacentText(parts: QuizMathPart[]): QuizMathPart[] {
  const out: QuizMathPart[] = [];
  for (const part of parts) {
    const prev = out[out.length - 1];
    if (part.kind === "text" && prev?.kind === "text") {
      prev.text = `${prev.text}${part.text}`.replace(/\s+/g, " ");
    } else {
      out.push(part.kind === "text" ? { ...part } : part);
    }
  }
  return out;
}

/** Płaski string (np. do logów / porównań) — ułamki jako a/b. */
export function quizMathToPlainString(input: string): string {
  return parseQuizMath(input)
    .map((p) => (p.kind === "text" ? p.text : `${p.num}/${p.den}`))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
