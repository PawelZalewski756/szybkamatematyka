export type ChoiceValue = number | string;

export type ChoiceQuestion = {
  id: string;
  prompt: string;
  headline: string;
  options: ChoiceValue[];
  correct: ChoiceValue;
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
