import {
  splitMathText,
  type MathTextPart,
} from "@/lib/math/render-math-text";

export type TaskMathChoices = {
  before: MathTextPart[];
  choices: string[];
  after: MathTextPart[];
};

/**
 * Wykrywa treść typu "pytanie + 3-4 wyrażenia w display math".
 * Takie zadania (np. "która liczba jest największa?") wyglądają dużo lepiej
 * jako zwarta siatka 2x2 niż jako cztery wyśrodkowane bloki jeden pod drugim.
 */
export function getTaskMathChoices(content: string): TaskMathChoices | null {
  if (content.includes("![")) return null;

  const parts = splitMathText(content);
  const displayIndexes = parts
    .map((part, index) => (part.kind === "display" ? index : -1))
    .filter((index) => index >= 0);

  if (displayIndexes.length < 3 || displayIndexes.length > 4) return null;

  const first = displayIndexes[0]!;
  const last = displayIndexes[displayIndexes.length - 1]!;
  const between = parts.slice(first, last + 1);

  // Między wyrażeniami może być tylko biały znak. Jeśli jest tam tekst,
  // to nie jest lista wyborów, tylko np. rozwiązanie krok po kroku.
  if (between.some((part) => part.kind === "text" && part.text.trim())) {
    return null;
  }

  return {
    before: parts.slice(0, first),
    choices: displayIndexes.map((index) => {
      const part = parts[index];
      return part && part.kind === "display" ? part.latex : "";
    }),
    after: parts.slice(last + 1),
  };
}
