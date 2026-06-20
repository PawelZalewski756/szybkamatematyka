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
  { true: "log₂(8) = 3", false: "log₂(8) = 2" },
  { true: "log₁₀(100) = 2", false: "log₁₀(100) = 10" },
  { true: "log₃(27) = 3", false: "log₃(27) = 9" },
  { true: "log₂(16) = 4", false: "log₂(16) = 8" },
  { true: "log₅(25) = 2", false: "log₅(25) = 5" },
  { true: "log₂(2) = 1", false: "log₂(2) = 2" },
  { true: "log₄(64) = 3", false: "log₄(64) = 4" },
  { true: "log₃(9) = 2", false: "log₃(9) = 3" },
];

const LOG_PAIRS = [
  { label: "log₂", arg: 8, result: 3 },
  { label: "log₂", arg: 16, result: 4 },
  { label: "log₃", arg: 27, result: 3 },
  { label: "log₅", arg: 25, result: 2 },
  { label: "log₂", arg: 32, result: 5 },
  { label: "log₄", arg: 16, result: 2 },
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
  const { label, arg, result } = pickRandom(LOG_PAIRS);
  const correct = `${label}(${arg}) = ${result}`;
  const trap = `${label}(${arg}) = ${result + randomInt(1, 3)}`;
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
