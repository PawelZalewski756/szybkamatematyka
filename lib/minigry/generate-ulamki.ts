export type UlamkiAnswer = "left" | "right" | "equal";

export type UlamkiQuestion = {
  id: string;
  left: string;
  right: string;
  correct: UlamkiAnswer;
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function formatFraction(num: number, den: number): string {
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return String(n);
  // QuizEquation zamieni \frac na czytelny stacked ułamek (bez KaTeX).
  return `\\frac{${n}}{${d}}`;
}

function randomFraction(maxDen = 12): { num: number; den: number; value: number } {
  const den = randomInt(2, maxDen);
  const num = randomInt(1, den - 1);
  return { num, den, value: num / den };
}

export function generateUlamkiQuestion(): UlamkiQuestion {
  const left = randomFraction();
  let right = randomFraction();
  let attempts = 0;

  while (left.value === right.value && attempts < 8) {
    right = randomFraction();
    attempts++;
  }

  const diff = left.value - right.value;
  const correct: UlamkiAnswer =
    Math.abs(diff) < 0.0001 ? "equal" : diff > 0 ? "left" : "right";

  if (correct !== "equal" && Math.random() < 0.15) {
    const shared = randomFraction();
    return {
      id: `${shared.num}/${shared.den}=`,
      left: formatFraction(shared.num, shared.den),
      right: formatFraction(shared.num, shared.den),
      correct: "equal",
    };
  }

  return {
    id: `${left.num}/${left.den}-${right.num}/${right.den}`,
    left: formatFraction(left.num, left.den),
    right: formatFraction(right.num, right.den),
    correct,
  };
}
