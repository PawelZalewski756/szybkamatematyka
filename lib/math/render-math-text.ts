import {
  normalizeMathText,
  scanMathSegments,
  type MathSegment,
} from "@/lib/math/normalize-math-text";

export type MathTextPart = MathSegment;

/**
 * Dzieli tekst na fragmenty zwykłe i LaTeX ($...$, $$...$$).
 * Używane w opcjach ABCD i krótkich etykietach - bez pełnego markdown.
 *
 * Przed podziałem treść przechodzi przez `normalizeMathText`, więc uszkodzone
 * dane (zjedzone `\times`, niedomknięte `$`) renderują się poprawnie także
 * wtedy, gdy w bazie leży już zepsuty wiersz.
 */
export function splitMathText(input: string): MathTextPart[] {
  return scanMathSegments(normalizeMathText(input));
}

export function containsMathDelimiters(text: string): boolean {
  return /\$(?!\$)/.test(text) || /\$\$/.test(text);
}

/** Usuwa „A. ” z początku opcji - UI i tak pokazuje literę w badge. */
export function stripChoiceLabelPrefix(option: string): string {
  return option.replace(/^[A-Da-d]\.\s*/, "");
}
