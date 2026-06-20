import { spClassLevel, type LearningPath } from "@/lib/learning-path";

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

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

export function lcm(a: number, b: number): number {
  return Math.abs((a * b) / gcd(a, b));
}

export function buildNumericOptions(
  correct: number,
  count = 4,
  spread = 12,
): number[] {
  const options = new Set<number>([correct]);

  const traps: number[] = [
    correct + 1,
    correct - 1,
    correct + 2,
    correct - 2,
    correct + 10,
    correct - 10,
    Math.round(correct * 1.1),
    Math.round(correct * 0.9),
  ].filter((v) => v >= 0 && v !== correct);

  for (const trap of traps) {
    if (options.size >= count) break;
    options.add(trap);
  }

  while (options.size < count) {
    const delta = randomInt(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = correct + delta;
    if (candidate >= 0 && candidate !== correct) options.add(candidate);
  }
  return shuffle([...options]);
}

export function spDifficulty(path: LearningPath): {
  min: number;
  max: number;
} {
  const level = spClassLevel(path);
  if (level === null) return { min: 2, max: 12 };
  if (level <= 2) return { min: 1, max: 10 };
  if (level <= 4) return { min: 2, max: 15 };
  if (level <= 6) return { min: 3, max: 20 };
  return { min: 5, max: 30 };
}
