/**
 * Audyt odpowiedzi w zadaniach.
 *
 * Dwa tryby:
 *   tsx scripts/auditTaskAnswers.ts --file zadania.json
 *   tsx scripts/auditTaskAnswers.ts --db
 *
 * Opcje:
 *   --json raport.json   zapisuje listę podejrzanych zadań
 *   --sql poprawki.sql   generuje propozycje UPDATE dla pewnych poprawek
 *   --verbose            wypisuje wszystkie sprawdzone rodziny
 *
 * Skrypt niczego nie zapisuje do bazy. Służy do wyłapywania zadań, w których
 * klucz odpowiedzi nie zgadza się z treścią, oraz do walidacji w pipeline
 * generowania (kod wyjścia 1, gdy są błędy).
 */
import { readFile, writeFile } from "node:fs/promises";

type TaskRow = {
  id: string;
  content: string;
  options?: string[] | null;
  correct_answer: string;
  topic?: string | null;
  exam_type?: string | null;
  difficulty?: number | null;
};

type CheckResult =
  | { kind: "ok"; category: string; value: number; expected: number }
  | {
      kind: "mismatch";
      category: string;
      value: number;
      expected: number;
      digits: number;
    }
  | {
      kind: "inconsistent";
      category: string;
      value: number;
      expected: number;
      note: string;
    }
  | { kind: "malformed"; category: string; note: string }
  | { kind: "precision"; category: string; note: string }
  | { kind: "unchecked"; category: string; note?: string };

const ZERO_WIDTH = /[\u200b\u200c\u200d\ufeff]/g;

function clean(value: unknown): string {
  return String(value ?? "")
    .replace(ZERO_WIDTH, "")
    .replace(/\u00a0|\u202f/g, " ")
    .replace(/\{,\}/g, ",")
    .replace(/−|–|—/g, "-")
    .replace(/·|×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\\[,;! ]/g, "")
    .replace(/\\cdot|\\times/g, "*")
    .replace(/\\div/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

function num(value: string | undefined | null): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

/* ------------------------------------------------------------------ */
/* Parser wyrażeń: liczby, + - * / ^, nawiasy, sqrt/log/abs/root/pi.   */
/* ------------------------------------------------------------------ */

type Token =
  | { type: "num"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" };

const FUNCTIONS = new Set(["sqrt", "log", "abs", "root", "cbrt"]);

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  const s = input;
  const isValueEnd = (t: Token | undefined) =>
    t?.type === "num" || t?.type === "rparen" || t?.type === "ident";

  while (i < s.length) {
    const ch = s[i];
    if (ch === " ") {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j += 1;
      const raw = s.slice(i, j);
      const value = Number(raw);
      if (!Number.isFinite(value)) return null;
      if (isValueEnd(tokens[tokens.length - 1])) tokens.push({ type: "op", value: "*" });
      tokens.push({ type: "num", value });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j += 1;
      const name = s.slice(i, j).toLowerCase();
      if (name === "pi") {
        if (isValueEnd(tokens[tokens.length - 1])) tokens.push({ type: "op", value: "*" });
        tokens.push({ type: "num", value: Math.PI });
        i = j;
        continue;
      }
      if (!FUNCTIONS.has(name)) return null;
      // funkcja: 2sqrt(...) -> 2*sqrt(...)
      if (isValueEnd(tokens[tokens.length - 1])) tokens.push({ type: "op", value: "*" });
      tokens.push({ type: "ident", value: name });
      i = j;
      continue;
    }
    if (/[+\-*/^]/.test(ch)) {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }
    if (ch === "(") {
      const prev = tokens[tokens.length - 1];
      if (prev?.type === "num" || prev?.type === "rparen") {
        tokens.push({ type: "op", value: "*" });
      }
      tokens.push({ type: "lparen" });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i += 1;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "comma" });
      i += 1;
      continue;
    }
    return null;
  }
  return tokens;
}

function realRoot(value: number, degree: number): number | null {
  if (degree === 0) return null;
  if (value < 0 && Math.abs(degree % 2) === 1) {
    return -Math.pow(-value, 1 / degree);
  }
  return Math.pow(value, 1 / degree);
}

function evaluateExpression(input: string): number | null {
  const tokens = tokenize(input);
  if (!tokens || tokens.length === 0) return null;
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];
  const take = (): Token | undefined => tokens[pos++];

  function parseExpression(): number | null {
    let left = parseTerm();
    if (left === null) return null;
    while (peek()?.type === "op" && (peek() as { value: string }).value.match(/^[+-]$/)) {
      const op = (take() as { value: string }).value;
      const right = parseTerm();
      if (right === null) return null;
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm(): number | null {
    let left = parseUnary();
    if (left === null) return null;
    while (peek()?.type === "op" && (peek() as { value: string }).value.match(/^[*/]$/)) {
      const op = (take() as { value: string }).value;
      const right = parseUnary();
      if (right === null) return null;
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  function parseUnary(): number | null {
    const token = peek();
    if (token?.type === "op" && (token.value === "+" || token.value === "-")) {
      take();
      const value = parseUnary();
      if (value === null) return null;
      return token.value === "-" ? -value : value;
    }
    return parsePower();
  }

  function parsePower(): number | null {
    const base = parsePrimary();
    if (base === null) return null;
    const token = peek();
    if (token?.type === "op" && token.value === "^") {
      take();
      const exponent = parseUnary();
      if (exponent === null) return null;
      return Math.pow(base, exponent);
    }
    return base;
  }

  function parsePrimary(): number | null {
    const token = take();
    if (!token) return null;
    if (token.type === "num") return token.value;
    if (token.type === "lparen") {
      const value = parseExpression();
      if (value === null || take()?.type !== "rparen") return null;
      return value;
    }
    if (token.type === "ident") {
      if (take()?.type !== "lparen") return null;
      const args: number[] = [];
      if (peek()?.type !== "rparen") {
        for (;;) {
          const arg = parseExpression();
          if (arg === null) return null;
          args.push(arg);
          if (peek()?.type === "comma") {
            take();
            continue;
          }
          break;
        }
      }
      if (take()?.type !== "rparen") return null;
      if (token.value === "sqrt") return args.length === 1 ? Math.sqrt(args[0]) : null;
      if (token.value === "cbrt") return args.length === 1 ? realRoot(args[0], 3) : null;
      if (token.value === "root") return args.length === 2 ? realRoot(args[0], args[1]) : null;
      if (token.value === "abs") return args.length === 1 ? Math.abs(args[0]) : null;
      if (token.value === "log") {
        if (args.length === 1) return Math.log(args[0]);
        if (args.length === 2) return Math.log(args[0]) / Math.log(args[1]);
      }
      return null;
    }
    return null;
  }

  const result = parseExpression();
  return pos === tokens.length && result !== null && Number.isFinite(result) ? result : null;
}

/* ------------------------------------------------------------------ */
/* Konwersja LaTeX -> wyrażenie                                       */
/* ------------------------------------------------------------------ */

const SUPERSCRIPT: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
};
const SUBSCRIPT: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
};

function latexToExpression(raw: string): string {
  let s = clean(raw)
    .replace(/\$\$/g, "")
    .replace(/\$/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/\\text\{[^}]*\}|\\mathrm\{[^}]*\}/g, " ");

  s = s.replace(/([0-9])([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_m, base: string, sup: string) =>
    `${base}^${sup.split("").map((c) => SUPERSCRIPT[c] ?? "").join("")}`,
  );
  s = s.replace(/log([₀₁₂₃₄₅₆₇₈₉]+)/gi, (_m, sub: string) =>
    `log_${sub.split("").map((c) => SUBSCRIPT[c] ?? "").join("")}`,
  );

  // liczby mieszane: 1\frac{2}{5}
  for (let i = 0; i < 5; i += 1) {
    s = s.replace(/(\d+)\s*\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1+(($2)/($3)))");
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "(($1)/($2))");
  }

  s = s.replace(/\\sqrt\[(\d+)\]\{([^{}]*)\}/g, "root($2,$1)");
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)");
  s = s.replace(/\\sqrt/g, "sqrt");

  // przecinki dziesiętne zamieniamy PRZED logarytmami, żeby nie zjadać
  // przecinka między argumentami log(x, podstawa).
  s = s.replace(/(\d),(\d)/g, "$1.$2");

  // log_a(b) / \log_{a} b / log_a b -> log(b,a)
  s = s.replace(/\\log_\{?(\d+)\}?\s*\(?([^)\s,]+)\)?/g, "log($2,$1)");
  s = s.replace(/\blog_(\d+)\s*\(?([^)\s,]+)\)?/g, "log($2,$1)");

  s = s.replace(/\\cdot|\\times/g, "*").replace(/\\div/g, "/").replace(/\\pi/g, "pi");
  s = s.replace(/\^/g, "^").replace(/\{/g, "(").replace(/\}/g, ")");
  s = s.replace(/\[/g, "(").replace(/\]/g, ")");
  s = s.replace(/:/g, "/");
  for (let i = 0; i < 4; i += 1) {
    s = s.replace(/\|([^|]*)\|/g, "abs($1)");
  }
  s = s.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2");
  s = s.replace(/\)\s*\(/g, ")*(");
  s = s.replace(/\)\s*([a-zA-Z])/g, ")*$1");
  s = s.replace(/(?<![a-zA-Z])([a-zA-Z])\s*\(/g, "$1*(");
  return s.replace(/\s+/g, "");
}

/* ------------------------------------------------------------------ */
/* Parsowanie odpowiedzi                                              */
/* ------------------------------------------------------------------ */

function parseAnswer(raw: string): number | "malformed" | null {
  const text = clean(raw)
    .replace(/\$/g, "")
    .replace(/\\%/g, "%")
    .replace(/%/g, "")
    .replace(/°/g, "")
    .replace(/\bzł\b/g, "")
    .replace(/\s*(cm|m|kg|g|km\/h|porcji|punktów)\s*$/gi, "")
    .trim();

  if (!text) return null;
  if (/a nie|lub|albo/i.test(text)) return "malformed";
  const opens = (text.match(/\(/g) ?? []).length;
  const closes = (text.match(/\)/g) ?? []).length;
  if (opens !== closes) return "malformed";
  if ((text.match(/=/g) ?? []).length > 1) return "malformed";
  if (text.startsWith("[") || text.includes("≠")) return null;

  const afterEquals = text.match(/=\s*([-+]?\d+(?:[.,]\d+)?)/);
  const candidate = afterEquals ? afterEquals[1] : text;

  // ułamek zwykły
  const fraction = candidate.match(/^([-+]?\d+)\s*\/\s*([-+]?\d+)$/);
  if (fraction) {
    const den = Number(fraction[2]);
    if (!den) return null;
    return Number(fraction[1]) / den;
  }

  const value = evaluateExpression(latexToExpression(candidate));
  if (value !== null) return value;

  const firstNumber = candidate.match(/[-+]?\d+(?:[.,]\d+)?/);
  if (firstNumber) {
    const parsed = Number(firstNumber[0].replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function close(a: number, b: number, digits: number): boolean {
  const tolerance = digits > 0 ? 0.5 * 10 ** -digits + 1e-6 : 1e-6;
  return Math.abs(Number(a.toFixed(digits)) - b) <= tolerance;
}

/* ------------------------------------------------------------------ */
/* Walidatory rodzin                                                  */
/* ------------------------------------------------------------------ */

type Computed = { value: number; digits?: number; category: string; precise?: number; exact?: string };

function template(content: string): Computed | null {
  let m: RegExpMatchArray | null;

  if ((m = content.match(/^([\d.,]+)\s*%\s*z liczby ([\d.,]+)/))) {
    const p = num(m[1]);
    const n = num(m[2]);
    if (p !== null && n !== null) return { value: (p * n) / 100, digits: 2, category: "procent" };
  }
  if ((m = content.match(/^([\d.,]+)\s*%\s*z ([\d.,]+) uczniów/))) {
    const p = num(m[1]);
    const n = num(m[2]);
    if (p !== null && n !== null) return { value: (p * n) / 100, digits: 2, category: "procent" };
  }
  if ((m = content.match(/^Uprość \$([\d.,]+)\^\{?([\d.,]+)\}? \* ([\d.,]+)\^\{?([\d.,]+)\}?\$/))) {
    const a = num(m[1]);
    const b = num(m[2]);
    const c = num(m[3]);
    const d = num(m[4]);
    if (a !== null && b !== null && c !== null && d !== null) {
      const value = a ** b * c ** d;
      const exact = !Number.isSafeInteger(value) && Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c) && Number.isInteger(d)
        ? (BigInt(a) ** BigInt(b) * BigInt(c) ** BigInt(d)).toString()
        : undefined;
      return { value, digits: 0, category: "potegi", exact };
    }
  }
  if ((m = content.match(/^Oblicz \$([\d.,]+)\^\{?([\d.,]+)\}? \* ([\d.,]+)\^\{?([\d.,]+)\}?\$/))) {
    const a = num(m[1]);
    const b = num(m[2]);
    const c = num(m[3]);
    const d = num(m[4]);
    if (a !== null && b !== null && c !== null && d !== null) {
      const value = a ** b * c ** d;
      const exact = !Number.isSafeInteger(value) && Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c) && Number.isInteger(d)
        ? (BigInt(a) ** BigInt(b) * BigInt(c) ** BigInt(d)).toString()
        : undefined;
      return { value, digits: 0, category: "potegi", exact };
    }
  }
  if ((m = content.match(/^Oblicz \$x\^2\+?([-+]?\d*)x\+?([-+]?\d+)\$ dla \$x=([-+]?\d+)\$/))) {
    const b = m[1] === "" || m[1] === "+" ? 1 : num(m[1]);
    const c = num(m[2]);
    const x = num(m[3]);
    if (b !== null && c !== null && x !== null) {
      return { value: x * x + b * x + c, digits: 0, category: "wielomian" };
    }
  }
  if ((m = content.match(/^Oblicz \$([-+]?\d*)x\+?([-+]?\d+)\$ dla \$x=([-+]?\d+)\$/))) {
    const a = m[1] === "" || m[1] === "+" ? 1 : num(m[1]);
    const b = num(m[2]);
    const x = num(m[3]);
    if (a !== null && b !== null && x !== null) {
      return { value: a * x + b, digits: 0, category: "funkcja_liniowa" };
    }
  }
  if ((m = content.match(/^Rozwiąż \$x\+?([-+]?\d+)=([-+]?\d+)\$/))) {
    const b = num(m[1]);
    const c = num(m[2]);
    if (b !== null && c !== null) return { value: c - b, digits: 0, category: "rownania" };
  }
  if ((m = content.match(/^Rozwiąż \$([-+]?\d*)x\+?([-+]?\d+)=([-+]?\d+)\$/))) {
    const a = m[1] === "" || m[1] === "+" ? 1 : num(m[1]);
    const b = num(m[2]);
    const c = num(m[3]);
    if (a && b !== null && c !== null) return { value: (c - b) / a, digits: 0, category: "rownania" };
  }
  if ((m = content.match(/^Wykres \$y=([-+]?\d*)x\+?([-+]?\d+)\$: wartość dla \$x=([-+]?\d+)\$/))) {
    const a = m[1] === "" || m[1] === "+" ? 1 : num(m[1]);
    const b = num(m[2]);
    const x = num(m[3]);
    if (a !== null && b !== null && x !== null) {
      return { value: a * x + b, digits: 0, category: "funkcja_liniowa" };
    }
  }
  if ((m = content.match(/^Oblicz \$\\log_\{?(\d+)\}?\s*(\d+)\$/))) {
    const base = num(m[1]);
    const arg = num(m[2]);
    if (base && arg) return { value: Math.log(arg) / Math.log(base), digits: 0, category: "logarytmy" };
  }
  if ((m = content.match(/^Kostka (\d+)-ścienna: P\(wynik ≤ (\d+)\)/))) {
    const n = num(m[1]);
    const k = num(m[2]);
    if (n && k) return { value: k / n, digits: 4, category: "prawdopodobienstwo" };
  }
  if ((m = content.match(/^P\(czerwona\) przy (\d+) z (\d+) kulach/))) {
    const k = num(m[1]);
    const n = num(m[2]);
    if (k && n) return { value: k / n, digits: 4, category: "prawdopodobienstwo" };
  }
  if ((m = content.match(/^\$\\frac\{(\d+)\}\{(\d+)\}\+\\frac\{(\d+)\}\{(\d+)\}\$/))) {
    const a = num(m[1]);
    const b = num(m[2]);
    const c = num(m[3]);
    const d = num(m[4]);
    if (a && b && c && d) return { value: a / b + c / d, digits: 2, category: "ulamki" };
  }
  if ((m = content.match(/^Średnia z ([\d,\s]+)$/))) {
    const values = m[1].split(",").map((x) => num(x.trim())).filter((x): x is number => x !== null);
    if (values.length) {
      return { value: values.reduce((sum, x) => sum + x, 0) / values.length, digits: 2, category: "statystyka" };
    }
  }
  if ((m = content.match(/^Pole trójkąta: podstawa (\d+), wysokość (\d+)/))) {
    const a = num(m[1]);
    const h = num(m[2]);
    if (a && h) return { value: (a * h) / 2, digits: 0, category: "planimetria" };
  }
  if ((m = content.match(/^Przeciwprostokątna: przyprostokątne (\d+) i (\d+)/))) {
    const a = num(m[1]);
    const b = num(m[2]);
    if (a && b) return { value: Math.hypot(a, b), digits: 1, category: "planimetria" };
  }
  if ((m = content.match(/^Pole prostokąta (\d+)[×*](\d+)/))) {
    const a = num(m[1]);
    const b = num(m[2]);
    if (a && b) return { value: a * b, digits: 0, category: "planimetria" };
  }
  if ((m = content.match(/^Pole kwadratu o boku (\d+)/))) {
    const a = num(m[1]);
    if (a) return { value: a * a, digits: 0, category: "planimetria" };
  }
  if ((m = content.match(/^Obwód kwadratu o boku (\d+)/))) {
    const a = num(m[1]);
    if (a) return { value: 4 * a, digits: 0, category: "planimetria" };
  }
  if ((m = content.match(/^Układ: \$x\+y=([-+]?\d+)\$, \$x-y=([-+]?\d+)\$\. Wartość \$x\$:/))) {
    const a = num(m[1]);
    const b = num(m[2]);
    if (a !== null && b !== null) return { value: (a + b) / 2, digits: 0, category: "uklady_rownan" };
  }
  if ((m = content.match(/^Pole powierzchni sześcianu o krawędzi (\d+)/))) {
    const a = num(m[1]);
    if (a) return { value: 6 * a * a, digits: 0, category: "stereometria" };
  }
  if ((m = content.match(/^Objętość prostopadłościanu (\d+)[×*](\d+)[×*](\d+)/))) {
    const a = num(m[1]);
    const b = num(m[2]);
    const c = num(m[3]);
    if (a && b && c) return { value: a * b * c, digits: 0, category: "stereometria" };
  }
  if ((m = content.match(/^Obwód prostokąta (\d+)[×*](\d+)/))) {
    const a = num(m[1]);
    const b = num(m[2]);
    if (a && b) return { value: 2 * (a + b), digits: 0, category: "planimetria" };
  }
  if ((m = content.match(/^Objętość walca \$r=([\d.,]+)\$, \$h=([\d.,]+)\$, \$\\pi\\approx ([\d,]+)\$/))) {
    const r = num(m[1]);
    const h = num(m[2]);
    const pi = num(m[3]);
    if (r && h && pi) {
      const prompt = pi * r * r * h;
      const precise = Math.PI * r * r * h;
      return { value: prompt, digits: 0, category: "stereometria", precise };
    }
  }
  if ((m = content.match(/^Obwód koła \$r=([\d.,]+)\$, \$\\pi\\approx ([\d,]+)\$/))) {
    const r = num(m[1]);
    const pi = num(m[2]);
    if (r && pi) return { value: 2 * pi * r, digits: 0, category: "planimetria" };
  }
  if ((m = content.match(/^Trójkąt prostokątny: ostry (\d+)°\. Drugi ostry:/))) {
    const a = num(m[1]);
    if (a !== null) return { value: 90 - a, digits: 0, category: "planimetria" };
  }
  if ((m = content.match(/^Odległość \$\(([-+]?\d+),([-+]?\d+)\)\$ i \$\(([-+]?\d+),([-+]?\d+)\)\$/))) {
    const [x1, y1, x2, y2] = [num(m[1]), num(m[2]), num(m[3]), num(m[4])];
    if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
      return { value: Math.hypot(x2 - x1, y2 - y1), digits: 1, category: "geometria_analityczna" };
    }
  }
  if ((m = content.match(/^Dla \$f\(x\)=([^$]+)\$ oblicz \$f\(([-+]?\d+)\)\$/))) {
    const expr = latexToExpression(m[1]).replace(/\+-/g, "-").replace(/--/g, "+");
    const x = num(m[2]);
    if (x !== null) {
      const value = evaluateExpression(`(${expr})`.replace(/x/g, `(${x})`));
      if (value !== null) return { value, digits: 0, category: "funkcja" };
    }
  }
  return null;
}

function genericExpression(content: string): Computed | null {
  let body: string | null = null;
  const match = content.match(/Oblicz wartość wyrażenia:?\s*(.+)$/);
  if (match) body = match[1];
  else if (/^\$[^$]+\$$/.test(content) && !/[ąćęłńóśźż]{4,}/i.test(content)) body = content;
  if (!body) return null;

  const withoutSuffix = body
    .replace(/\s+Wynik zapisz.*$/i, "")
    .replace(/\s+używając.*$/i, "")
    .replace(/\s+dla\s+.*$/i, "")
    .trim()
    .replace(/\.$/, "");

  // podstawienie zmiennych: "dla a = -3 i b = 5"
  const substitutions = [...content.matchAll(/([a-zA-Z])\s*=\s*(-?\d+)/g)];
  let expression = latexToExpression(withoutSuffix);
  for (const [, name, value] of substitutions) {
    expression = expression.replace(new RegExp(`\\b${name}\\b`, "g"), `(${value})`);
  }
  const value = evaluateExpression(expression);
  if (value === null) return null;
  return { value, digits: 2, category: "wyrazenia" };
}

/* ------------------------------------------------------------------ */
/* Audyt                                                              */
/* ------------------------------------------------------------------ */

function auditTask(task: TaskRow): CheckResult {
  const content = clean(task.content);

  if (content.startsWith("Oblicz wartość wyrażenia")) {
    const computed = genericExpression(content);
    if (!computed) return { kind: "unchecked", category: "wyrazenia", note: "nie udało się sparsować" };
    const expected = parseAnswer(task.correct_answer);
    if (expected === "malformed") {
      return { kind: "malformed", category: "wyrazenia", note: String(task.correct_answer) };
    }
    if (expected === null) return { kind: "unchecked", category: "wyrazenia", note: "brak liczby w odpowiedzi" };
    if (close(computed.value, expected, computed.digits ?? 0)) {
      return { kind: "ok", category: computed.category, value: computed.value, expected };
    }
    return {
      kind: "mismatch",
      category: computed.category,
      value: computed.value,
      expected,
      digits: computed.digits ?? 0,
    };
  }

  const computed = template(content);
  if (!computed) return { kind: "unchecked", category: "szablon" };

  const expected = parseAnswer(task.correct_answer);
  if (expected === "malformed") {
    return { kind: "malformed", category: computed.category, note: String(task.correct_answer) };
  }
  if (expected === null) return { kind: "unchecked", category: computed.category };

  if (computed.exact) {
    const stored = clean(task.correct_answer).replace(/\$/g, "").replace(/\s/g, "");
    if (stored === computed.exact) {
      return { kind: "ok", category: computed.category, value: computed.value, expected };
    }
    return { kind: "precision", category: computed.category, note: `dokładnie ${computed.exact}` };
  }

  // Walec: treść podaje π≈3,14, a klucz bywa liczony z dokładnego π.
  const precise = (computed as Computed & { precise?: number }).precise;
  if (precise !== undefined && !close(computed.value, expected, computed.digits ?? 0) && close(precise, expected, 0)) {
    return {
      kind: "inconsistent",
      category: computed.category,
      value: computed.value,
      expected,
      note: "klucz policzony z π, a treść podaje π≈3,14",
    };
  }

  if (close(computed.value, expected, computed.digits ?? 0)) {
    return { kind: "ok", category: computed.category, value: computed.value, expected };
  }
  return {
    kind: "mismatch",
    category: computed.category,
    value: computed.value,
    expected,
    digits: computed.digits ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/* I/O                                                                */
/* ------------------------------------------------------------------ */

async function loadFromFile(path: string): Promise<TaskRow[]> {
  const raw = JSON.parse(await readFile(path, "utf8")) as unknown;
  if (Array.isArray(raw)) return raw as TaskRow[];
  throw new Error("Plik musi zawierać tablicę zadań.");
}

async function loadFromDb(): Promise<TaskRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY.");
  const rows: TaskRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    const response = await fetch(
      `${url}/rest/v1/tasks?select=id,content,options,correct_answer,topic,exam_type,difficulty&order=id&limit=1000&offset=${offset}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
    const batch = (await response.json()) as TaskRow[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(4)));
}

function toFraction(value: number): string | null {
  if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 1e-9) {
    return String(Math.round(value));
  }
  for (let denominator = 1; denominator <= 1000; denominator += 1) {
    const numerator = Math.round(value * denominator);
    if (Math.abs(value - numerator / denominator) < 1e-9) {
      return `${numerator}/${denominator}`;
    }
  }
  return null;
}

function optionFor(task: TaskRow, result: Extract<CheckResult, { kind: "mismatch" }>): string | null {
  for (const option of task.options ?? []) {
    const parsed = parseAnswer(option);
    if (parsed !== null && parsed !== "malformed" && close(result.value, parsed, 2)) {
      return option;
    }
  }
  return null;
}

function sqlFor(task: TaskRow, result: Extract<CheckResult, { kind: "mismatch" }>): string {
  const options = task.options ?? [];
  if (options.length > 0) {
    const option = optionFor(task, result);
    if (!option) {
      return `-- RĘCZNIE (zadanie wyboru): ${task.id} — poprawna wartość ${result.value.toFixed(4)} nie występuje w opcjach; popraw opcje lub usuń zadanie. -- ${task.content.slice(0, 60)}`;
    }
    return `update public.tasks set correct_answer = '${option.replace(/'/g, "''")}' where id = '${task.id}'; -- ${task.content.slice(0, 80)}`;
  }
  const exact = toFraction(result.value);
  if (!exact) {
    return `-- RĘCZNIE: ${task.id} — wynik ${result.value.toFixed(10)} nie jest prostym ułamkiem; popraw treść lub usuń zadanie. -- ${task.content.slice(0, 70)}`;
  }
  return `update public.tasks set correct_answer = '${exact}' where id = '${task.id}'; -- ${task.content.slice(0, 80)}`;
}

function main(): void {
  void (async () => {
    const args = process.argv.slice(2);
    const file = args.includes("--file") ? args[args.indexOf("--file") + 1] : null;
    const useDb = args.includes("--db");
    const jsonPath = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;
    const sqlPath = args.includes("--sql") ? args[args.indexOf("--sql") + 1] : null;
    const verbose = args.includes("--verbose");

    if (!file && !useDb) {
      console.error("Użycie: tsx scripts/auditTaskAnswers.ts --file zadania.json | --db [--json raport.json] [--sql poprawki.sql]");
      process.exit(2);
    }

    const tasks = file ? await loadFromFile(file) : await loadFromDb();
    const counts = { ok: 0, mismatch: 0, inconsistent: 0, malformed: 0, precision: 0, unchecked: 0 };
    const problems: Array<{ task: TaskRow; result: CheckResult }> = [];
    const byCategory = new Map<string, { ok: number; bad: number; unchecked: number }>();

    for (const task of tasks) {
      const result = auditTask(task);
      counts[result.kind] += 1;
      const stats = byCategory.get(result.category) ?? { ok: 0, bad: 0, unchecked: 0 };
      if (result.kind === "ok") stats.ok += 1;
      else if (result.kind === "unchecked") stats.unchecked += 1;
      else stats.bad += 1;
      byCategory.set(result.category, stats);
      if (result.kind !== "ok" && result.kind !== "unchecked") problems.push({ task, result });
    }

    const checked = tasks.length - counts.unchecked;
    console.log(`Zadania: ${tasks.length}`);
    console.log(`Sprawdzone: ${checked} (${Math.round((checked / tasks.length) * 100)}%)`);
    console.log(`  ok: ${counts.ok}`);
    console.log(`  błędna odpowiedź: ${counts.mismatch}`);
    console.log(`  niespójne (π): ${counts.inconsistent}`);
    console.log(`  zła forma odpowiedzi: ${counts.malformed}`);
    console.log(`  duże liczby (do ręcznej weryfikacji): ${counts.precision}`);
    console.log(`  niezweryfikowane: ${counts.unchecked}`);

    if (verbose) {
      console.log("\nRodziny:");
      for (const [category, stats] of [...byCategory].sort((a, b) => b[1].bad - a[1].bad)) {
        if (stats.bad || stats.ok > 0) {
          console.log(`  ${category.padEnd(24)} ok=${stats.ok} bad=${stats.bad} unchecked=${stats.unchecked}`);
        }
      }
    }

    console.log("\nProblemy:");
    for (const { task, result } of problems.slice(0, 40)) {
      if (result.kind === "mismatch") {
        console.log(`  MISMATCH ${task.id.slice(0, 8)} klucz=${task.correct_answer} liczy=${formatNumber(result.value)} | ${task.content.slice(0, 90)}`);
      } else if (result.kind === "inconsistent") {
        console.log(`  PI       ${task.id.slice(0, 8)} klucz=${task.correct_answer} z3,14=${formatNumber(result.value)} | ${task.content.slice(0, 90)}`);
      } else if (result.kind === "malformed") {
        console.log(`  MALFORM  ${task.id.slice(0, 8)} klucz=${result.note} | ${task.content.slice(0, 90)}`);
      }
    }
    if (problems.length > 40) console.log(`  … i ${problems.length - 40} więcej`);

    if (jsonPath) {
      await writeFile(
        jsonPath,
        JSON.stringify(
          problems.map(({ task, result }) => ({
            id: task.id,
            topic: task.topic,
            content: clean(task.content),
            stored: task.correct_answer,
            kind: result.kind,
            category: result.category,
            value: "value" in result ? result.value : undefined,
            note: "note" in result ? result.note : undefined,
          })),
          null,
          1,
        ),
        "utf8",
      );
      console.log(`\nRaport JSON: ${jsonPath}`);
    }

    if (sqlPath) {
      const lines = problems
        .filter((p): p is { task: TaskRow; result: Extract<CheckResult, { kind: "mismatch" }> } => p.result.kind === "mismatch")
        .map(({ task, result }) => sqlFor(task, result));
      await writeFile(
        sqlPath,
        `-- Propozycje poprawek wygenerowane przez auditTaskAnswers.ts\n-- Sprawdź ręcznie przed uruchomieniem.\n\n${lines.join("\n")}\n`,
        "utf8",
      );
      console.log(`SQL: ${sqlPath} (${lines.length} poprawek)`);
    }

    if (counts.mismatch + counts.inconsistent + counts.malformed > 0) process.exitCode = 1;
  })().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(2);
  });
}

main();
