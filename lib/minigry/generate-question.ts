import type { QuestionTrack } from "@/lib/learning-path";

export type Question = {
  equation: string;
  isCorrect: boolean;
};

type QuestionTemplate = {
  true: string;
  false: string;
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

const SUPERSCRIPT_DIGITS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function toSuperscript(value: number): string {
  return String(value)
    .split("")
    .map((digit) => SUPERSCRIPT_DIGITS[Number(digit)] ?? digit)
    .join("");
}

function fromTemplate(
  template: QuestionTemplate,
  showCorrect: boolean,
): Question {
  return {
    equation: showCorrect ? template.true : template.false,
    isCorrect: showCorrect,
  };
}

/** Szkoła podstawowa — klasy 1–5, prostsze zadania */
const PODSTAWOWA_BANK = {
  dodawanie: [
    { true: "3 + 4 = 7", false: "3 + 4 = 8" },
    { true: "5 + 2 = 7", false: "5 + 2 = 6" },
    { true: "9 + 1 = 10", false: "9 + 1 = 11" },
    { true: "6 + 3 = 9", false: "6 + 3 = 8" },
    { true: "7 + 5 = 12", false: "7 + 5 = 11" },
    { true: "8 + 7 = 15", false: "8 + 7 = 14" },
  ],
  odejmowanie: [
    { true: "10 − 3 = 7", false: "10 − 3 = 6" },
    { true: "9 − 4 = 5", false: "9 − 4 = 4" },
    { true: "12 − 5 = 7", false: "12 − 5 = 8" },
    { true: "15 − 6 = 9", false: "15 − 6 = 8" },
    { true: "20 − 8 = 12", false: "20 − 8 = 11" },
  ],
  mnozenie: [
    { true: "2 × 3 = 6", false: "2 × 3 = 5" },
    { true: "4 × 5 = 20", false: "4 × 5 = 19" },
    { true: "3 × 7 = 21", false: "3 × 7 = 20" },
    { true: "6 × 2 = 12", false: "6 × 2 = 11" },
    { true: "5 × 5 = 25", false: "5 × 5 = 20" },
    { true: "9 × 3 = 27", false: "9 × 3 = 26" },
  ],
  porownania: [
    { true: "5 > 3", false: "5 > 8" },
    { true: "12 < 15", false: "12 < 9" },
    { true: "7 = 7", false: "7 = 8" },
    { true: "4 + 2 > 5", false: "4 + 2 > 7" },
    { true: "10 − 2 < 9", false: "10 − 2 < 7" },
  ],
} as const;

/** Egzamin 8-klasisty — prostsze zagadnienia */
const EGZAMIN_8_BANK = {
  ulamki: [
    { true: "½ + ½ = 1", false: "½ + ½ = 1/4" },
    { true: "¼ + ¼ = ½", false: "¼ + ¼ = 1" },
    { true: "⅔ × 3 = 2", false: "⅔ × 3 = 6" },
    { true: "¾ − ¼ = ½", false: "¾ − ¼ = 1" },
    { true: "1½ = 3/2", false: "1½ = 2/3" },
    { true: "⅗ + ⅖ = 1", false: "⅗ + ⅖ = 2/5" },
  ],
  procenty: [
    { true: "50% z 20 = 10", false: "50% z 20 = 15" },
    { true: "25% z 80 = 20", false: "25% z 80 = 25" },
    { true: "10% z 50 = 5", false: "10% z 50 = 50" },
    { true: "20% z 30 = 6", false: "20% z 30 = 8" },
    { true: "100% z 17 = 17", false: "100% z 17 = 0" },
    { true: "75% z 40 = 30", false: "75% z 40 = 20" },
  ],
  potegi: [
    { true: "2³ = 8", false: "2³ = 6" },
    { true: "5² = 25", false: "5² = 10" },
    { true: "3² × 3 = 27", false: "3² × 3 = 81" },
    { true: "10² = 100", false: "10² = 20" },
    { true: "4² ÷ 4 = 4", false: "4² ÷ 4 = 8" },
    { true: "2⁴ = 16", false: "2⁴ = 8" },
  ],
  pierwiastki: [
    { true: "√16 = 4", false: "√16 = 8" },
    { true: "√9 + √4 = 5", false: "√9 + √4 = 3" },
    { true: "√25 = 5", false: "√25 = 12" },
    { true: "√36 = 6", false: "√36 = 18" },
    { true: "√49 = 7", false: "√49 = 14" },
    { true: "√(4 + 5) = 3", false: "√4 + √5 = 3" },
  ],
} as const;

/** Matura — trudniejsze zagadnienia */
const MATURA_BANK = {
  logarytmy: [
    { true: "log₂(8) = 3", false: "log₂(8) = 2" },
    { true: "log₁₀(100) = 2", false: "log₁₀(100) = 10" },
    { true: "log₃(27) = 3", false: "log₃(27) = 9" },
    { true: "log₂(16) = 4", false: "log₂(16) = 8" },
    { true: "log₅(25) = 2", false: "log₅(25) = 5" },
    { true: "log₂(2) = 1", false: "log₂(2) = 2" },
  ],
  wzory: [
    { true: "(a + b)² = a² + 2ab + b²", false: "(a + b)² = a² + b²" },
    { true: "(a − b)² = a² − 2ab + b²", false: "(a − b)² = a² − b²" },
    { true: "a² − b² = (a − b)(a + b)", false: "a² − b² = (a − b)²" },
    { true: "(x + 3)² = x² + 6x + 9", false: "(x + 3)² = x² + 9" },
    { true: "(2x)² = 4x²", false: "(2x)² = 2x²" },
    { true: "(x + 1)(x − 1) = x² − 1", false: "(x + 1)(x − 1) = x² + 1" },
  ],
  funkcje: [
    { true: "f(x) = 2x, f(3) = 6", false: "f(x) = 2x, f(3) = 5" },
    { true: "f(x) = x², f(4) = 16", false: "f(x) = x², f(4) = 8" },
    { true: "f(x) = x + 5, f(0) = 5", false: "f(x) = x + 5, f(0) = 0" },
    { true: "f(x) = −x, f(−2) = 2", false: "f(x) = −x, f(−2) = −2" },
    { true: "f(x) = 3x − 1, f(2) = 5", false: "f(x) = 3x − 1, f(2) = 6" },
    { true: "f(x) = x² − 1, f(1) = 0", false: "f(x) = x² − 1, f(1) = 2" },
  ],
  potegi: [
    { true: "2³ × 2⁴ = 2⁷", false: "2³ × 2⁴ = 2¹²" },
    { true: "(3²)³ = 3⁶", false: "(3²)³ = 3⁵" },
    { true: "5⁶ ÷ 5² = 5⁴", false: "5⁶ ÷ 5² = 5³" },
    { true: "(2⁴)² = 2⁸", false: "(2⁴)² = 2⁶" },
    { true: "2⁻¹ = ½", false: "2⁻¹ = −2" },
    { true: "10⁰ = 1", false: "10⁰ = 0" },
  ],
  algebra: [
    { true: "x² · x³ = x⁵", false: "x² · x³ = x⁶" },
    { true: "−(x − 2) = −x + 2", false: "−(x − 2) = −x − 2" },
    { true: "√9 + √16 = 7", false: "√9 + √16 = 5" },
    { true: "√(9 + 16) = 5", false: "√9 + √16 = 5" },
    { true: "4x − x = 3x", false: "4x − x = 4" },
    { true: "3(x + 2) = 3x + 6", false: "3(x + 2) = 3x + 2" },
  ],
} as const;

function generateEgzamin8Procedural(showCorrect: boolean): Question {
  const kind = randomInt(0, 2);

  if (kind === 0) {
    const pairs = [
      { mixed: "1½", trueVal: "3/2", falseVal: "2/3" },
      { mixed: "2¼", trueVal: "9/4", falseVal: "6/4" },
      { mixed: "1⅓", trueVal: "4/3", falseVal: "2/3" },
    ] as const;
    const { mixed, trueVal, falseVal } = pickRandom(pairs);
    return {
      equation: showCorrect ? `${mixed} = ${trueVal}` : `${mixed} = ${falseVal}`,
      isCorrect: showCorrect,
    };
  }

  if (kind === 1) {
    const base = randomInt(10, 40);
    const pct = pickRandom([10, 20, 25, 50] as const);
    const result = (base * pct) / 100;
    const correct = `${pct}% z ${base} = ${result}`;
    const trap = `${pct}% z ${base} = ${result + randomInt(2, 8)}`;
    return {
      equation: showCorrect ? correct : trap,
      isCorrect: showCorrect,
    };
  }

  const base = randomInt(2, 6);
  const exp = randomInt(2, 4);
  const b = String(base);
  const correct = `${b}${toSuperscript(exp)} = ${base ** exp}`;
  const trap = `${b}${toSuperscript(exp)} = ${base ** exp + randomInt(1, 3)}`;
  return {
    equation: showCorrect ? correct : trap,
    isCorrect: showCorrect,
  };
}

function generateMaturaProcedural(showCorrect: boolean): Question {
  const kind = randomInt(0, 2);

  if (kind === 0) {
    const logPairs = [
      { label: "log₂", arg: 8, result: 3 },
      { label: "log₂", arg: 16, result: 4 },
      { label: "log₃", arg: 27, result: 3 },
      { label: "log₅", arg: 25, result: 2 },
    ] as const;
    const { label, arg, result } = pickRandom(logPairs);
    const correct = `${label}(${arg}) = ${result}`;
    const trap = `${label}(${arg}) = ${result + 1}`;
    return {
      equation: showCorrect ? correct : trap,
      isCorrect: showCorrect,
    };
  }

  if (kind === 1) {
    const x = randomInt(2, 5);
    const a = randomInt(2, 4);
    const correctVal = a * x;
    const trapVal = correctVal + randomInt(1, 3);
    const correct = `f(x) = ${a}x, f(${x}) = ${correctVal}`;
    const trap = `f(x) = ${a}x, f(${x}) = ${trapVal}`;
    return {
      equation: showCorrect ? correct : trap,
      isCorrect: showCorrect,
    };
  }

  const m = randomInt(2, 5);
  const n = randomInt(2, 5);
  const base = randomInt(2, 7);
  const b = String(base);
  const correct = `${b}${toSuperscript(m)} × ${b}${toSuperscript(n)} = ${b}${toSuperscript(m + n)}`;
  const trap = `${b}${toSuperscript(m)} × ${b}${toSuperscript(n)} = ${b}${toSuperscript(m * n)}`;
  return {
    equation: showCorrect ? correct : trap,
    isCorrect: showCorrect,
  };
}

function pickFromBank(
  bank: Record<string, readonly QuestionTemplate[]>,
  showCorrect: boolean,
): Question {
  const categories = Object.keys(bank) as (keyof typeof bank)[];
  const category = pickRandom(categories);
  return fromTemplate(pickRandom(bank[category]), showCorrect);
}

export function generateQuestion(track: QuestionTrack): Question {
  const showCorrect = Math.random() < 0.5;

  if (track === "podstawowa") {
    return pickFromBank(PODSTAWOWA_BANK, showCorrect);
  }

  if (track === "egzamin-8-klasisty") {
    return Math.random() < 0.35
      ? generateEgzamin8Procedural(showCorrect)
      : pickFromBank(EGZAMIN_8_BANK, showCorrect);
  }

  return Math.random() < 0.35
    ? generateMaturaProcedural(showCorrect)
    : pickFromBank(MATURA_BANK, showCorrect);
}
