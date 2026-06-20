export type ChoiceQuestion = {
  id: string;
  prompt: string;
  headline: string;
  options: number[];
  correct: number;
};

export type TrueFalseQuestion = {
  id: string;
  equation: string;
  isCorrect: boolean;
};

export type CompareSide = "left" | "right" | "equal";

export type CompareQuestion = {
  id: string;
  left: string;
  right: string;
  correct: CompareSide;
};
