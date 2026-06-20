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

function buildOptions(correct: number): number[] {
  const options = new Set<number>([correct]);
  while (options.size < 4) {
    const delta = randomInt(-9, 9);
    const candidate = Math.max(0, correct + (delta === 0 ? randomInt(1, 4) : delta));
    if (candidate !== correct) options.add(candidate);
  }
  return shuffle([...options]);
}

export function generateMnozenieQuestion(path: LearningPath): MnozenieQuestion {
  const { min, max } = factorRange(path);
  const a = randomInt(min, max);
  const b = randomInt(min, max);
  const correct = a * b;

  return {
    id: `${a}x${b}`,
    prompt: `${a} × ${b}`,
    correct,
    options: buildOptions(correct),
  };
}
