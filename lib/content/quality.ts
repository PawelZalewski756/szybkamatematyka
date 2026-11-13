/**
 * Higiena treści zadań: duplikaty, niewidoczne znaki, uszkodzone opcje.
 *
 * Funkcje są czyste (bez Supabase), więc można ich używać w skryptach
 * naprawczych, audytach i testach.
 */

import { answersEquivalent, parseNumericToken } from "@/lib/math/answer-equiv";

const INVISIBLE_RE = /[\u200B-\u200D\uFEFF]/g;
const INVALID_OPTION_RE =
  /^(?:nan|infinity|-infinity|\+infinity|undefined|null|n\/a|-|—|–)$/i;

/** Usuwa ZWSP/ZWNJ/ZWJ/BOM - frequent artefakt generatorów. */
export function stripInvisibleChars(text: string): string {
  return text.replace(INVISIBLE_RE, "");
}

/** Liczba niewidocznych znaków (do wyboru „najczystszego” duplikatu). */
export function countInvisibleChars(text: string): number {
  return (text.match(INVISIBLE_RE) ?? []).length;
}

/** Klucz porównywania treści: bez niewidocznych znaków, zbitych spacji i wielkości liter. */
export function contentKey(text: string): string {
  return stripInvisibleChars(text).replace(/\s+/g, " ").trim().toLowerCase();
}

/** Czy opcja jest artefaktem („NaN”, „undefined”, pusta, sama kreska)? */
export function isInvalidOption(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return INVALID_OPTION_RE.test(trimmed);
}

function formatOptionNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(4))).replace(".", ",");
}

function fractionCandidates(numerator: number, denominator: number): string[] {
  const candidates = [
    `${numerator + 1}/${denominator}`,
    `${numerator}/${denominator + 1}`,
    `${numerator + 1}/${denominator + 1}`,
  ];

  if (denominator > 1) candidates.push(`${numerator}/${denominator - 1}`);
  if (numerator > 1) candidates.push(`${numerator - 1}/${denominator}`);
  if (denominator - numerator > 0 && denominator - numerator !== numerator) {
    candidates.push(`${denominator - numerator}/${denominator}`);
  }
  if (numerator !== 0) candidates.push(`${denominator}/${numerator}`);

  return candidates.filter((candidate) => {
    const match = /^(\d+)\/(\d+)$/.exec(candidate);
    if (!match) return false;
    return Number(match[1]) > 0 && Number(match[2]) > 0;
  });
}

/** Propozycje dystraktorów pasujących formatem do poprawnej odpowiedzi. */
export function optionCandidates(correct: string): string[] {
  const trimmed = correct.trim();
  const fraction = /^(-?\d+)\s*\/\s*(-?\d+)$/.exec(trimmed);
  if (fraction) {
    return fractionCandidates(Number(fraction[1]), Number(fraction[2]));
  }

  const numeric = parseNumericToken(trimmed);
  if (numeric !== null) {
    return [
      formatOptionNumber(numeric + 1),
      formatOptionNumber(numeric - 1),
      formatOptionNumber(numeric + 2),
      formatOptionNumber(numeric * 2),
      formatOptionNumber(numeric / 2),
      formatOptionNumber(-numeric),
    ].filter(Boolean);
  }

  // Odpowiedź nieliczbowa (np. „x < 3”) - nie zgadujemy treści, dokładamy
  // neutralne wartości, żeby zebrać cztery unikalne opcje.
  return ["1", "2", "3", "4"];
}

/**
 * Naprawia listę opcji MC: usuwa artefakty („NaN”), duplikaty równoważne
 * (np. 2/4 i 1/2) i dopełnia brakujące opcje dystraktorami, zachowując
 * poprawną odpowiedź. Nie zmienia kolejności poprawnych opcji.
 */
export function repairChoiceOptions(
  correct: string,
  options: string[],
  desired = 4,
): string[] {
  const correctValue = correct.trim();
  const result: string[] = [];

  const add = (candidate: string): void => {
    const value = candidate.trim();
    if (!value || isInvalidOption(value)) return;
    if (result.some((existing) => answersEquivalent(existing, value))) return;
    result.push(value);
  };

  const valid = options.filter((option) => !isInvalidOption(option));
  const hasCorrect = valid.some((option) => answersEquivalent(option, correctValue));
  if (!hasCorrect && correctValue) add(correctValue);

  for (const option of valid) add(option);

  for (const candidate of optionCandidates(correctValue)) {
    if (result.length >= desired) break;
    add(candidate);
  }

  let fallback = 1;
  while (result.length < desired && fallback <= 50) {
    add(String(fallback));
    fallback += 1;
  }

  return result.slice(0, desired);
}

export type DuplicateTaskRow = {
  id: string;
  content: string;
  correct_answer: string;
};

/**
 * Grupuje dokładne duplikaty: ta sama treść (po normalizacji) i ta sama
 * odpowiedź w obrębie tego samego klucza (np. temat). Zwraca tylko grupy > 1.
 */
export function findDuplicateTaskGroups<T extends DuplicateTaskRow>(
  tasks: T[],
  keyOf: (task: T) => string,
): T[][] {
  const groups = new Map<string, T[]>();

  for (const task of tasks) {
    const key = `${keyOf(task)}::${contentKey(task.content)}::${contentKey(
      task.correct_answer,
    )}`;
    const group = groups.get(key);
    if (group) group.push(task);
    else groups.set(key, [task]);
  }

  return [...groups.values()].filter((group) => group.length > 1);
}

/**
 * Wybiera rekord do zostawienia: najmniej niewidocznych znaków, potem
 * najkrótsza treść, potem najmniejsze id (stabilnie między uruchomieniami).
 */
export function pickDuplicateKeeper<T extends DuplicateTaskRow>(group: T[]): T {
  return [...group].sort((a, b) => {
    const invisible =
      countInvisibleChars(a.content) - countInvisibleChars(b.content);
    if (invisible !== 0) return invisible;
    const length = a.content.length - b.content.length;
    if (length !== 0) return length;
    return a.id.localeCompare(b.id);
  })[0]!;
}
