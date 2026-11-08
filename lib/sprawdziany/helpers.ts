import type { GeneratedQuestion, Rng } from "@/lib/sprawdziany/types";

export function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** Ułamek w postaci skróconej: "3/4" lub liczba całkowita "2". */
export function frac(n: number, d: number): string {
  const g = gcd(n, d);
  const nn = n / g;
  const dd = d / g;
  return dd === 1 ? String(nn) : `${nn}/${dd}`;
}

/** Liczba po polsku: przecinek dziesiętny, bez zbędnych zer. */
export function num(n: number): string {
  return String(Number(n.toFixed(4))).replace(".", ",");
}

/** Buduje cztery unikalne odpowiedzi; brakujące uzupełnia z `fillers`. */
export function buildChoices(
  rng: Rng,
  correct: string,
  wrongs: readonly string[],
  fillers: readonly string[] = [],
): { choices: string[]; correctIndex: number } {
  const kept = [correct];
  for (const w of [...wrongs, ...fillers]) {
    if (kept.length >= 4) break;
    if (!kept.includes(w)) kept.push(w);
  }
  if (kept.length < 4) {
    throw new Error(`Za mało unikalnych odpowiedzi dla: ${correct}`);
  }
  const choices = shuffle(rng, kept);
  return { choices, correctIndex: choices.indexOf(correct) };
}

/** Odpowiedzi liczbowe — błędne z typowych pomyłek, reszta jako sąsiednie wartości. */
export function numericQuestion(
  rng: Rng,
  data: {
    prompt: string;
    correct: number;
    wrongs: readonly number[];
    explanation: string;
    format?: (n: number) => string;
    deltas?: readonly number[];
  },
): GeneratedQuestion {
  const fmt = data.format ?? num;
  const deltas = data.deltas ?? [1, -1, 2, -2, 10, -10, 3, -3];
  const { choices, correctIndex } = buildChoices(
    rng,
    fmt(data.correct),
    data.wrongs.filter((w) => w !== data.correct).map(fmt),
    deltas.map((d) => fmt(data.correct + d)),
  );
  return {
    prompt: data.prompt,
    choices,
    correctIndex,
    explanation: data.explanation,
  };
}

/** Odpowiedzi tekstowe (ułamki, wyrażenia) — wymagają jawnych błędnych wariantów. */
export function textQuestion(
  rng: Rng,
  data: {
    prompt: string;
    correct: string;
    wrongs: readonly string[];
    fillers?: readonly string[];
    explanation: string;
  },
): GeneratedQuestion {
  const { choices, correctIndex } = buildChoices(
    rng,
    data.correct,
    data.wrongs,
    data.fillers,
  );
  return {
    prompt: data.prompt,
    choices,
    correctIndex,
    explanation: data.explanation,
  };
}
