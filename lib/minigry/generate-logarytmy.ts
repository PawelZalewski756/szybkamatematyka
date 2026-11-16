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

function fromTemplate(
  template: QuestionTemplate,
  showCorrect: boolean,
): Question {
  return {
    equation: showCorrect ? template.true : template.false,
    isCorrect: showCorrect,
  };
}

export function generateLogarytmyQuestion(): Question {
  const showCorrect = Math.random() < 0.5;

  // Większość pytań losujemy parametrycznie (baza × wykładnik), a bank
  // zostawiamy jako uzupełnienie dla typowych przypadków.
  if (Math.random() < 0.75) {
    const base = randomInt(2, 5);
    const exp = randomInt(1, 5);
    const arg = base ** exp;
    let trapValue = exp + randomInt(1, 2) * (Math.random() < 0.5 ? -1 : 1);
    if (trapValue === exp || trapValue < 0) trapValue = exp + randomInt(1, 3);

    return {
      equation: showCorrect
        ? `$\\log_{${base}}(${arg}) = ${exp}$`
        : `$\\log_{${base}}(${arg}) = ${trapValue}$`,
      isCorrect: showCorrect,
    };
  }

  return fromTemplate(pickRandom(LOG_BANK), showCorrect);
}
