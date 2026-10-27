import type { Question } from "@/lib/minigry/generate-question";

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

const LOG_BANK: readonly QuestionTemplate[] = [
  { true: "$\\log_{2}(8) = 3$", false: "$\\log_{2}(8) = 2$" },
  { true: "$\\log_{10}(100) = 2$", false: "$\\log_{10}(100) = 10$" },
  { true: "$\\log_{3}(27) = 3$", false: "$\\log_{3}(27) = 9$" },
  { true: "$\\log_{2}(16) = 4$", false: "$\\log_{2}(16) = 8$" },
  { true: "$\\log_{5}(25) = 2$", false: "$\\log_{5}(25) = 5$" },
  { true: "$\\log_{2}(2) = 1$", false: "$\\log_{2}(2) = 2$" },
  { true: "$\\log_{4}(64) = 3$", false: "$\\log_{4}(64) = 4$" },
  { true: "$\\log_{3}(9) = 2$", false: "$\\log_{3}(9) = 3$" },
];

const LOG_PAIRS = [
  { base: 2, arg: 8, result: 3 },
  { base: 2, arg: 16, result: 4 },
  { base: 3, arg: 27, result: 3 },
  { base: 5, arg: 25, result: 2 },
  { base: 2, arg: 32, result: 5 },
  { base: 4, arg: 16, result: 2 },
] as const;

function fromTemplate(
  template: QuestionTemplate,
  showCorrect: boolean,
): Question {
  return {
    equation: showCorrect ? template.true : template.false,
    isCorrect: showCorrect,
  };
}

function generateProcedural(showCorrect: boolean): Question {
  const { base, arg, result } = pickRandom(LOG_PAIRS);
  const correct = `$\\log_{${base}}(${arg}) = ${result}$`;
  const trap = `$\\log_{${base}}(${arg}) = ${result + randomInt(1, 3)}$`;
  return {
    equation: showCorrect ? correct : trap,
    isCorrect: showCorrect,
  };
}

export function generateLogarytmyQuestion(): Question {
  const showCorrect = Math.random() < 0.5;
  return Math.random() < 0.4
    ? generateProcedural(showCorrect)
    : fromTemplate(pickRandom(LOG_BANK), showCorrect);
}
