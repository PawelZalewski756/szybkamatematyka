export type Rng = () => number;

/** 1 = podstawa, 2 = typowe zadanie ze sprawdzianu, 3 = trudniejsze. */
export type TemplateLevel = 1 | 2 | 3;

export type GeneratedQuestion = {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type QuestionTemplate = {
  id: string;
  level: TemplateLevel;
  /** Zawęża szablon do wybranych klas; domyślnie dziedziczy z tematu. */
  classes?: readonly number[];
  generate: (rng: Rng) => GeneratedQuestion;
};

export type SprawdzianTopic = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  /** Numery klas szkoły podstawowej, w których temat pojawia się na sprawdzianach. */
  classes: readonly number[];
  templates: readonly QuestionTemplate[];
};

export type SprawdzianQuestion = GeneratedQuestion & {
  id: string;
  topicId: string;
  level: TemplateLevel;
};

export type SprawdzianResult = {
  id: string;
  date: string;
  schoolClass: number;
  total: number;
  correct: number;
  durationSec: number;
  byTopic: Record<string, { correct: number; total: number }>;
};
