import {
  buildChoices,
  gcd,
  int,
  num,
  numericQuestion,
  pick,
  shuffle,
} from "@/lib/sprawdziany/helpers";
import { SPRAWDZIAN_TOPICS } from "@/lib/sprawdziany/topics";
import type {
  ClosedTask,
  Figure,
  OpenTask,
  Rng,
  SchemeStep,
  TaskDraft,
  TrueFalseTask,
} from "@/lib/sprawdziany/types";

export { gcd, int, num, pick, shuffle };

export const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [6, 8, 10],
  [9, 12, 15],
  [7, 24, 25],
] as const;

export function open(data: {
  points: number;
  prompt: string;
  parts?: string[];
  figure?: Figure;
  key: string;
  scheme: SchemeStep[];
  solution: string[];
}): TaskDraft<OpenTask> {
  return { kind: "open", ...data };
}

export function trueFalse(data: {
  prompt: string;
  statements: { text: string; truth: boolean }[];
  figure?: Figure;
  solution: string[];
}): TaskDraft<TrueFalseTask> {
  return {
    kind: "tf",
    points: data.statements.length,
    ...data,
  };
}

/** Zadanie zamknięte z odpowiedzią liczbową; błędne odpowiedzi z typowych pomyłek. */
export function closedNumber(
  rng: Rng,
  data: {
    prompt: string;
    correct: number;
    wrongs: readonly number[];
    solution: string[];
    figure?: Figure;
    format?: (n: number) => string;
  },
): TaskDraft<ClosedTask> {
  const q = numericQuestion(rng, {
    prompt: data.prompt,
    correct: data.correct,
    wrongs: data.wrongs,
    explanation: "",
    format: data.format,
  });
  return {
    kind: "closed",
    points: 1,
    prompt: data.prompt,
    figure: data.figure,
    choices: q.choices,
    correctIndex: q.correctIndex,
    solution: data.solution,
  };
}

export function closedText(
  rng: Rng,
  data: {
    prompt: string;
    correct: string;
    wrongs: readonly string[];
    solution: string[];
    figure?: Figure;
  },
): TaskDraft<ClosedTask> {
  const { choices, correctIndex } = buildChoices(
    rng,
    data.correct,
    data.wrongs,
  );
  return {
    kind: "closed",
    points: 1,
    prompt: data.prompt,
    figure: data.figure,
    choices,
    correctIndex,
    solution: data.solution,
  };
}

/** Zadanie zamknięte z puli generatorów tematu (1 pkt). */
export function closedFromTopic(
  topicId: string,
  schoolClass: number,
  level?: 1 | 2 | 3,
): (rng: Rng) => TaskDraft<ClosedTask> {
  return (rng) => {
    const topic = SPRAWDZIAN_TOPICS.find((t) => t.id === topicId);
    if (!topic) throw new Error(`Brak tematu ${topicId}`);
    let pool = topic.templates.filter(
      (t) => !t.classes || t.classes.includes(schoolClass),
    );
    const byLevel = level ? pool.filter((t) => t.level === level) : pool;
    if (byLevel.length > 0) pool = byLevel;
    const q = pick(rng, pool).generate(rng);
    return {
      kind: "closed",
      points: 1,
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: q.correctIndex,
      solution: [q.explanation],
    };
  };
}

/** Wyciąga największy kwadrat spod pierwiastka: 48 -> "4√3", 36 -> "6", 7 -> "√7". */
export function simplifySqrt(n: number): string {
  let outside = 1;
  let inside = n;
  for (let k = Math.floor(Math.sqrt(n)); k >= 2; k--) {
    if (inside % (k * k) === 0) {
      outside *= k;
      inside /= k * k;
      break;
    }
  }
  if (inside === 1) return String(outside);
  return `${outside === 1 ? "" : outside}√${inside}`;
}

export function isSquare(n: number): boolean {
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

export function sup(n: number): string {
  return String(n)
    .split("")
    .map((d) => (d === "-" ? "⁻" : SUP[Number(d)]))
    .join("");
}

export const cm = (n: number) => `${num(n)} cm`;
export const zl = (n: number) => `${num(n)} zł`;

/** Wyrażenie ax + b z poprawnymi znakami. */
export function lin(a: number, b: number, v = "x"): string {
  const head = a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`;
  if (a === 0) return String(b);
  if (b === 0) return head;
  return `${head} ${b > 0 ? "+" : "-"} ${Math.abs(b)}`;
}

export function randInt(rng: Rng, min: number, max: number, not: number[] = []) {
  for (let i = 0; i < 50; i++) {
    const v = int(rng, min, max);
    if (!not.includes(v)) return v;
  }
  return min;
}
