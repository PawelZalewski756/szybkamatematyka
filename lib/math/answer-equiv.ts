/**
 * Porównywanie odpowiedzi matematycznych — ułamki (ASCII i Unicode),
 * liczby całkowite, ułamki dziesiętne, proste wyrażenia po lewej stronie „=”.
 */

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 1 / 2,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅕": 1 / 5,
  "⅖": 2 / 5,
  "⅗": 3 / 5,
  "⅘": 4 / 5,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
};

const MIXED_FRACTION =
  /^(\d+)([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/u;

const ASCII_FRACTION = /^(-?\d+)\s*\/\s*(-?\d+)$/;

const EPS = 1e-9;

function nearlyEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPS;
}

function parseExactInteger(raw: string): bigint | null {
  const text = stripAnswerUnits(raw).replace(/\s+/g, "");
  if (!/^-?\d+$/.test(text)) return null;

  try {
    return BigInt(text);
  } catch {
    return null;
  }
}

/** Usuwa jednostki i zbędne znaki z końca odpowiedzi. */
export function stripAnswerUnits(text: string): string {
  return text
    .trim()
    .replace(/\s*(cm²|cm³|cm|m²|m|kg|g|°|°C|°F|zł|%|ml|l)\s*$/iu, "")
    .trim();
}

/** Parsuje pojedynczą liczbę / ułamek (bez operatorów). */
export function parseNumericToken(raw: string): number | null {
  const text = stripAnswerUnits(raw).replace(/\s+/g, "");
  if (!text) return null;

  const mixed = text.match(MIXED_FRACTION);
  if (mixed) {
    const whole = Number(mixed[1]);
    const frac = UNICODE_FRACTIONS[mixed[2]];
    if (frac === undefined || !Number.isFinite(whole)) return null;
    return whole + frac;
  }

  if (UNICODE_FRACTIONS[text] !== undefined) return UNICODE_FRACTIONS[text];

  const ascii = text.match(ASCII_FRACTION);
  if (ascii) {
    const num = Number(ascii[1]);
    const den = Number(ascii[2]);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
    return num / den;
  }

  const normalized = text.replace(",", ".");
  if (/^-?\d+(\.\d+)?$/.test(normalized)) {
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

/** Proste wyrażenie: liczby, + − × ÷ × ·, nawiasy, ułamki Unicode. */
export function evaluateSimpleExpression(expr: string): number | null {
  let s = expr.trim().replace(/×/g, "*").replace(/·/g, "*").replace(/÷/g, "/");
  s = s.replace(/(\d)([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/gu, "$1+$2");
  s = s.replace(/([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])(\d)/gu, "$1+$2");

  for (const [char, val] of Object.entries(UNICODE_FRACTIONS)) {
    s = s.split(char).join(`(${val})`);
  }

  s = s.replace(/(\d+)\/(\d+)/g, "($1/$2)");
  s = s.replace(/−/g, "-");

  if (!/^[\d+\-*/().\s]+$/.test(s)) return null;

  try {
    const result = Function(`"use strict"; return (${s});`)() as unknown;
    return typeof result === "number" && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

/** Czy dwa stringi oznaczają tę samą wartość liczbową (np. 1/2 i 0,5). */
export function answersEquivalent(a: string, b: string): boolean {
  const na = stripAnswerUnits(a);
  const nb = stripAnswerUnits(b);
  if (na.toLowerCase() === nb.toLowerCase()) return true;

  const exactA = parseExactInteger(na);
  const exactB = parseExactInteger(nb);
  if (exactA !== null && exactB !== null) return exactA === exactB;

  const va = parseNumericToken(na) ?? evaluateSimpleExpression(na);
  const vb = parseNumericToken(nb) ?? evaluateSimpleExpression(nb);
  if (va !== null && vb !== null) return nearlyEqual(va, vb);

  return false;
}

/**
 * Sprowadza twierdzenie zapisane w LaTeXu ($...$, \frac, \times …)
 * do postaci, którą rozumie evaluateSimpleExpression / parseNumericToken.
 */
export function latexClaimToPlain(claim: string): string {
  let s = claim.trim().replace(/\$\$/g, "").replace(/\$/g, "");
  s = s.replace(/\\frac\{(-?\d+)\}\{(-?\d+)\}/g, "($1)/($2)");
  s = s.replace(/\\times/g, "*");
  s = s.replace(/\\div/g, "/");
  s = s.replace(/\\cdot/g, "*");
  s = s.replace(/\\%/g, "");
  s = s.replace(/\\text\{[^}]*\}/g, " ");
  s = s.replace(/\\mathrm\{[^}]*\}/g, " ");
  s = s.replace(/−/g, "-");
  return s.replace(/\s+/g, " ").trim();
}

/** Czy twierdzenie typu „7+8=15” lub „½+½=1” (także w LaTeXu) jest prawdziwe. */
export function isNumericClaimTrue(claim: string): boolean | null {
  const trimmed = latexClaimToPlain(claim);
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx <= 0) return null;

  const lhs = trimmed.slice(0, eqIdx).trim();
  const rhs = trimmed.slice(eqIdx + 1).trim();
  const left = evaluateSimpleExpression(lhs);
  const right = parseNumericToken(rhs) ?? evaluateSimpleExpression(rhs);
  if (left === null || right === null) return null;
  return nearlyEqual(left, right);
}

/** Indeks poprawnej odpowiedzi — pierwszy równoważny correctIndex, fallback na exact match. */
export function resolveCorrectChoiceIndex(
  choices: string[],
  correctIndex: number,
): number {
  if (correctIndex < 0 || correctIndex >= choices.length) return correctIndex;
  const target = choices[correctIndex];
  for (let i = 0; i < choices.length; i++) {
    if (answersEquivalent(choices[i], target)) return i;
  }
  return correctIndex;
}

/** Wykrywa duplikaty równoważne w opcjach MC. */
export function findEquivalentChoiceGroups(choices: string[]): number[][] {
  const groups: number[][] = [];
  const used = new Set<number>();

  for (let i = 0; i < choices.length; i++) {
    if (used.has(i)) continue;
    const group = [i];
    for (let j = i + 1; j < choices.length; j++) {
      if (answersEquivalent(choices[i], choices[j])) group.push(j);
    }
    if (group.length > 1) {
      group.forEach((idx) => used.add(idx));
      groups.push(group);
    }
  }
  return groups;
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Porównanie odpowiedzi: najpierw równoważność liczbowa, potem tekstowa. */
export function checkAnswerMatch(given: string, expected: string): boolean {
  if (answersEquivalent(given, expected)) return true;
  return normalizeAnswer(given) === normalizeAnswer(expected);
}
