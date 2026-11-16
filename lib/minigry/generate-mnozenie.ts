import { spClassLevel, type LearningPath } from "@/lib/learning-path";

export type MnozenieQuestion = {
  id: string;
  prompt: string;
  correct: number;
  options: number[];
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function factorRange(path: LearningPath): { min: number; max: number } {
  const level = spClassLevel(path);
  if (level === null) return { min: 2, max: 12 };
  if (level <= 2) return { min: 1, max: 5 };
  if (level <= 4) return { min: 1, max: 10 };
  if (level <= 6) return { min: 2, max: 10 };
  return { min: 2, max: 12 };
}

function buildOptions(a: number, b: number, correct: number): number[] {
  const candidates = [
    correct + a,
    correct - a,
    correct + b,
    correct - b,
    a + b,
    correct + 1,
    correct - 1,
    correct + 10,
    correct - 10,
  ].filter((value) => value >= 0 && value !== correct);

  const options = [correct];
  for (const value of shuffle([...new Set(candidates)])) {
    if (options.length >= 4) break;
    if (!options.includes(value)) options.push(value);
  }

  let offset = 2;
  while (options.length < 4) {
    const value = correct + offset;
    offset += 1;
    if (!options.includes(value)) options.push(value);
  }

  return shuffle(options);
}

export function generateMnozenieQuestion(path: LearningPath): MnozenieQuestion {
  const { min, max } = factorRange(path);
  const a = randomInt(min, max);
  const b = randomInt(min, max);
  const correct = a * b;

  return {
    id: `${a}x${b}`,
    prompt: `$${a} \\times ${b}$`,
    correct,
    options: buildOptions(a, b, correct),
  };
}
