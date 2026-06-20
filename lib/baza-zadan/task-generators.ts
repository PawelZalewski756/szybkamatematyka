/** Pomocniki do generowania zadań z poprawnymi, całkowitymi wynikami. */

import { answersEquivalent } from "@/lib/math/answer-equiv";

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function integerChoices(correct: number, count = 4): {
  choices: string[];
  correctIndex: number;
} {
  const correctStr = String(correct);
  const set = new Set<string>([correctStr]);
  const deltas = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
  for (const d of deltas) {
    if (set.size >= count) break;
    const v = correct + d;
    if (v >= 0) set.add(String(v));
  }
  let choices = shuffle([...set]).slice(0, count);
  if (!choices.includes(correctStr)) choices[0] = correctStr;
  choices = shuffle(choices);
  return {
    choices,
    correctIndex: choices.indexOf(correctStr),
  };
}

/** Buduje unikalne opcje MC — bez równoważnych duplikatów (np. 1/2 i 2/4). */
export function uniqueChoices(
  correct: string,
  wrongs: string[],
  count = 4,
): { choices: string[]; correctIndex: number } {
  const kept: string[] = [correct];
  for (const w of wrongs) {
    if (kept.length >= count) break;
    if (!kept.some((k) => answersEquivalent(k, w))) kept.push(w);
  }
  let filler = 1;
  while (kept.length < count) {
    const candidate = `${correct}+${filler}`;
    if (!kept.some((k) => answersEquivalent(k, candidate))) kept.push(candidate);
    filler += 1;
  }
  const choices = shuffle(kept.slice(0, count));
  const correctIndex = choices.findIndex((c) => answersEquivalent(c, correct));
  return { choices, correctIndex: correctIndex >= 0 ? correctIndex : 0 };
}

const PERCENTS = [5, 10, 15, 20, 25, 50] as const;
const PRICE_PERCENTS = [10, 20, 25, 50] as const;

/** Np. 20% z 30 = 6 — zawsze wynik całkowity. */
export function exactPercentOf(seed: number): {
  pct: number;
  base: number;
  value: number;
} {
  const pct = PERCENTS[seed % PERCENTS.length];
  const g = gcd(pct, 100);
  const step = 100 / g;
  const mult = 1 + (Math.floor(seed / PERCENTS.length) % 15);
  const base = step * mult;
  const value = (base * pct) / 100;
  return { pct, base, value };
}

/** Np. 15 z 60 = 25% — zawsze wynik całkowity. */
export function exactWhatPercent(seed: number): {
  part: number;
  total: number;
  pct: number;
} {
  const pct = PERCENTS[seed % PERCENTS.length];
  const mult = 1 + (Math.floor(seed / PERCENTS.length) % 12);
  const total = 100 * mult;
  const part = pct * mult;
  return { part, total, pct };
}

/** Cena po podwyżce o X% — wynik całkowity w złotówkach. */
export function exactPriceAfterIncrease(seed: number): {
  price: number;
  pct: number;
  newPrice: number;
} {
  const pct = PRICE_PERCENTS[seed % PRICE_PERCENTS.length];
  const step = 100 / gcd(100 + pct, 100);
  const mult = 1 + (Math.floor(seed / PRICE_PERCENTS.length) % 12);
  const price = step * mult * 5;
  const newPrice = (price * (100 + pct)) / 100;
  return { price, pct, newPrice };
}

/** Średnia arytmetyczna czterech liczb całkowitych. */
export function exactAverage(seed: number): {
  nums: number[];
  avg: number;
} {
  const avg = 3 + (seed % 14);
  const nums = [avg - 3, avg - 1, avg + 1, avg + 3];
  return { nums, avg };
}

/** Cena po obniżce — wynik całkowity. */
export function exactPriceAfterDiscount(seed: number): {
  price: number;
  pct: number;
  newPrice: number;
} {
  const pct = PRICE_PERCENTS[seed % PRICE_PERCENTS.length];
  const step = 100 / gcd(100 - pct, 100);
  const mult = 2 + (Math.floor(seed / PRICE_PERCENTS.length) % 10);
  const price = step * mult * 10;
  const newPrice = (price * (100 - pct)) / 100;
  return { price, pct, newPrice };
}
