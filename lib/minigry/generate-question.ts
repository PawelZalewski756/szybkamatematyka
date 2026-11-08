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

function fromTemplate(
  template: QuestionTemplate,
  showCorrect: boolean,
): Question {
  return {
    equation: showCorrect ? template.true : template.false,
    isCorrect: showCorrect,
  };
}

/** Szkoła podstawowa - klasy 1–5, prostsze pytania */
const PODSTAWOWA_BANK = {
  dodawanie: [
    { true: "$3 + 4 = 7$", false: "$3 + 4 = 8$" },
    { true: "$5 + 2 = 7$", false: "$5 + 2 = 6$" },
    { true: "$9 + 1 = 10$", false: "$9 + 1 = 11$" },
    { true: "$6 + 3 = 9$", false: "$6 + 3 = 8$" },
    { true: "$7 + 5 = 12$", false: "$7 + 5 = 11$" },
    { true: "$8 + 7 = 15$", false: "$8 + 7 = 14$" },
  ],
  odejmowanie: [
    { true: "$10 - 3 = 7$", false: "$10 - 3 = 6$" },
    { true: "$9 - 4 = 5$", false: "$9 - 4 = 4$" },
    { true: "$12 - 5 = 7$", false: "$12 - 5 = 8$" },
    { true: "$15 - 6 = 9$", false: "$15 - 6 = 8$" },
    { true: "$20 - 8 = 12$", false: "$20 - 8 = 11$" },
  ],
  mnozenie: [
    { true: "$2 \\times 3 = 6$", false: "$2 \\times 3 = 5$" },
    { true: "$4 \\times 5 = 20$", false: "$4 \\times 5 = 19$" },
    { true: "$3 \\times 7 = 21$", false: "$3 \\times 7 = 20$" },
    { true: "$6 \\times 2 = 12$", false: "$6 \\times 2 = 11$" },
    { true: "$5 \\times 5 = 25$", false: "$5 \\times 5 = 20$" },
    { true: "$9 \\times 3 = 27$", false: "$9 \\times 3 = 26$" },
  ],
  porownania: [
    { true: "$5 > 3$", false: "$5 > 8$" },
    { true: "$12 < 15$", false: "$12 < 9$" },
    { true: "$7 = 7$", false: "$7 = 8$" },
    { true: "$4 + 2 > 5$", false: "$4 + 2 > 7$" },
    { true: "$10 - 2 < 9$", false: "$10 - 2 < 7$" },
  ],
} as const;

/** Egzamin 8-klasisty - prostsze zagadnienia */
const EGZAMIN_8_BANK = {
  ulamki: [
    {
      true: "$\\frac{1}{2} + \\frac{1}{2} = 1$",
      false: "$\\frac{1}{2} + \\frac{1}{2} = \\frac{1}{4}$",
    },
    {
      true: "$\\frac{1}{4} + \\frac{1}{4} = \\frac{1}{2}$",
      false: "$\\frac{1}{4} + \\frac{1}{4} = 1$",
    },
    {
      true: "$\\frac{2}{3} \\times 3 = 2$",
      false: "$\\frac{2}{3} \\times 3 = 6$",
    },
    {
      true: "$\\frac{3}{4} - \\frac{1}{4} = \\frac{1}{2}$",
      false: "$\\frac{3}{4} - \\frac{1}{4} = 1$",
    },
    {
      true: "$1\\frac{1}{2} = \\frac{3}{2}$",
      false: "$1\\frac{1}{2} = \\frac{2}{3}$",
    },
    {
      true: "$\\frac{3}{5} + \\frac{2}{5} = 1$",
      false: "$\\frac{3}{5} + \\frac{2}{5} = \\frac{2}{5}$",
    },
  ],
  procenty: [
    { true: "$50\\%$ z $20 = 10$", false: "$50\\%$ z $20 = 15$" },
    { true: "$25\\%$ z $80 = 20$", false: "$25\\%$ z $80 = 25$" },
    { true: "$10\\%$ z $50 = 5$", false: "$10\\%$ z $50 = 50$" },
    { true: "$20\\%$ z $30 = 6$", false: "$20\\%$ z $30 = 8$" },
    { true: "$100\\%$ z $17 = 17$", false: "$100\\%$ z $17 = 0$" },
    { true: "$75\\%$ z $40 = 30$", false: "$75\\%$ z $40 = 20$" },
  ],
  potegi: [
    { true: "$2^{3} = 8$", false: "$2^{3} = 6$" },
    { true: "$5^{2} = 25$", false: "$5^{2} = 10$" },
    { true: "$3^{2} \\times 3 = 27$", false: "$3^{2} \\times 3 = 81$" },
    { true: "$10^{2} = 100$", false: "$10^{2} = 20$" },
    { true: "$4^{2} \\div 4 = 4$", false: "$4^{2} \\div 4 = 8$" },
    { true: "$2^{4} = 16$", false: "$2^{4} = 8$" },
  ],
  pierwiastki: [
    { true: "$\\sqrt{16} = 4$", false: "$\\sqrt{16} = 8$" },
    {
      true: "$\\sqrt{9} + \\sqrt{4} = 5$",
      false: "$\\sqrt{9} + \\sqrt{4} = 3$",
    },
    { true: "$\\sqrt{25} = 5$", false: "$\\sqrt{25} = 12$" },
    { true: "$\\sqrt{36} = 6$", false: "$\\sqrt{36} = 18$" },
    { true: "$\\sqrt{49} = 7$", false: "$\\sqrt{49} = 14$" },
    {
      true: "$\\sqrt{4 + 5} = 3$",
      false: "$\\sqrt{4} + \\sqrt{5} = 3$",
    },
  ],
} as const;

/** Matura - trudniejsze zagadnienia */
const MATURA_BANK = {
  logarytmy: [
    { true: "$\\log_{2}(8) = 3$", false: "$\\log_{2}(8) = 2$" },
    { true: "$\\log_{10}(100) = 2$", false: "$\\log_{10}(100) = 10$" },
    { true: "$\\log_{3}(27) = 3$", false: "$\\log_{3}(27) = 9$" },
    { true: "$\\log_{2}(16) = 4$", false: "$\\log_{2}(16) = 8$" },
    { true: "$\\log_{5}(25) = 2$", false: "$\\log_{5}(25) = 5$" },
    { true: "$\\log_{2}(2) = 1$", false: "$\\log_{2}(2) = 2$" },
  ],
  wzory: [
    {
      true: "$(a + b)^{2} = a^{2} + 2ab + b^{2}$",
      false: "$(a + b)^{2} = a^{2} + b^{2}$",
    },
    {
      true: "$(a - b)^{2} = a^{2} - 2ab + b^{2}$",
      false: "$(a - b)^{2} = a^{2} - b^{2}$",
    },
    {
      true: "$a^{2} - b^{2} = (a - b)(a + b)$",
      false: "$a^{2} - b^{2} = (a - b)^{2}$",
    },
    {
      true: "$(x + 3)^{2} = x^{2} + 6x + 9$",
      false: "$(x + 3)^{2} = x^{2} + 9$",
    },
    { true: "$(2x)^{2} = 4x^{2}$", false: "$(2x)^{2} = 2x^{2}$" },
    {
      true: "$(x + 1)(x - 1) = x^{2} - 1$",
      false: "$(x + 1)(x - 1) = x^{2} + 1$",
    },
  ],
  funkcje: [
    {
      true: "$f(x) = 2x,\\ f(3) = 6$",
      false: "$f(x) = 2x,\\ f(3) = 5$",
    },
    {
      true: "$f(x) = x^{2},\\ f(4) = 16$",
      false: "$f(x) = x^{2},\\ f(4) = 8$",
    },
    {
      true: "$f(x) = x + 5,\\ f(0) = 5$",
      false: "$f(x) = x + 5,\\ f(0) = 0$",
    },
    {
      true: "$f(x) = -x,\\ f(-2) = 2$",
      false: "$f(x) = -x,\\ f(-2) = -2$",
    },
    {
      true: "$f(x) = 3x - 1,\\ f(2) = 5$",
      false: "$f(x) = 3x - 1,\\ f(2) = 6$",
    },
    {
      true: "$f(x) = x^{2} - 1,\\ f(1) = 0$",
      false: "$f(x) = x^{2} - 1,\\ f(1) = 2$",
    },
  ],
  potegi: [
    {
      true: "$2^{3} \\times 2^{4} = 2^{7}$",
      false: "$2^{3} \\times 2^{4} = 2^{12}$",
    },
    { true: "$(3^{2})^{3} = 3^{6}$", false: "$(3^{2})^{3} = 3^{5}$" },
    {
      true: "$5^{6} \\div 5^{2} = 5^{4}$",
      false: "$5^{6} \\div 5^{2} = 5^{3}$",
    },
    { true: "$(2^{4})^{2} = 2^{8}$", false: "$(2^{4})^{2} = 2^{6}$" },
    {
      true: "$2^{-1} = \\frac{1}{2}$",
      false: "$2^{-1} = -2$",
    },
    { true: "$10^{0} = 1$", false: "$10^{0} = 0$" },
  ],
  algebra: [
    {
      true: "$x^{2} \\cdot x^{3} = x^{5}$",
      false: "$x^{2} \\cdot x^{3} = x^{6}$",
    },
    {
      true: "$-(x - 2) = -x + 2$",
      false: "$-(x - 2) = -x - 2$",
    },
    {
      true: "$\\sqrt{9} + \\sqrt{16} = 7$",
      false: "$\\sqrt{9} + \\sqrt{16} = 5$",
    },
    {
      true: "$\\sqrt{9 + 16} = 5$",
      false: "$\\sqrt{9} + \\sqrt{16} = 5$",
    },
    { true: "$4x - x = 3x$", false: "$4x - x = 4$" },
    {
      true: "$3(x + 2) = 3x + 6$",
      false: "$3(x + 2) = 3x + 2$",
    },
  ],
} as const;

function generateEgzamin8Procedural(showCorrect: boolean): Question {
  const kind = randomInt(0, 2);

  if (kind === 0) {
    const pairs = [
      {
        mixed: "1\\frac{1}{2}",
        trueVal: "\\frac{3}{2}",
        falseVal: "\\frac{2}{3}",
      },
      {
        mixed: "2\\frac{1}{4}",
        trueVal: "\\frac{9}{4}",
        falseVal: "\\frac{6}{4}",
      },
      {
        mixed: "1\\frac{1}{3}",
        trueVal: "\\frac{4}{3}",
        falseVal: "\\frac{2}{3}",
      },
    ] as const;
    const { mixed, trueVal, falseVal } = pickRandom(pairs);
    return {
      equation: showCorrect
        ? `$${mixed} = ${trueVal}$`
        : `$${mixed} = ${falseVal}$`,
      isCorrect: showCorrect,
    };
  }

  if (kind === 1) {
    const base = randomInt(10, 40);
    const pct = pickRandom([10, 20, 25, 50] as const);
    const result = (base * pct) / 100;
    const correct = `$${pct}\\%$ z $${base} = ${result}$`;
    const trap = `$${pct}\\%$ z $${base} = ${result + randomInt(2, 8)}$`;
    return {
      equation: showCorrect ? correct : trap,
      isCorrect: showCorrect,
    };
  }

  const base = randomInt(2, 6);
  const exp = randomInt(2, 4);
  const correct = `$${base}^{${exp}} = ${base ** exp}$`;
  const trap = `$${base}^{${exp}} = ${base ** exp + randomInt(1, 3)}$`;
  return {
    equation: showCorrect ? correct : trap,
    isCorrect: showCorrect,
  };
}

function generateMaturaProcedural(showCorrect: boolean): Question {
  const kind = randomInt(0, 2);

  if (kind === 0) {
    const logPairs = [
      { base: 2, arg: 8, result: 3 },
      { base: 2, arg: 16, result: 4 },
      { base: 3, arg: 27, result: 3 },
      { base: 5, arg: 25, result: 2 },
    ] as const;
    const { base, arg, result } = pickRandom(logPairs);
    const correct = `$\\log_{${base}}(${arg}) = ${result}$`;
    const trap = `$\\log_{${base}}(${arg}) = ${result + 1}$`;
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
    const correct = `$f(x) = ${a}x,\\ f(${x}) = ${correctVal}$`;
    const trap = `$f(x) = ${a}x,\\ f(${x}) = ${trapVal}$`;
    return {
      equation: showCorrect ? correct : trap,
      isCorrect: showCorrect,
    };
  }

  const m = randomInt(2, 5);
  const n = randomInt(2, 5);
  const base = randomInt(2, 7);
  const correct = `$${base}^{${m}} \\times ${base}^{${n}} = ${base}^{${m + n}}$`;
  const trap = `$${base}^{${m}} \\times ${base}^{${n}} = ${base}^{${m * n}}$`;
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
