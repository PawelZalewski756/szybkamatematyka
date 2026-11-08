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
  description: string;
  /** Numery klas szkoły podstawowej, w których temat pojawia się na sprawdzianach. */
  classes: readonly number[];
  templates: readonly QuestionTemplate[];
};

/** Rysunek towarzyszący zadaniu; etykiety są dowolnym tekstem (np. "6 cm", "x"). */
export type Figure =
  | { kind: "right-triangle"; a: string; b: string; c: string }
  | {
      kind: "triangle";
      /** Kąty przy wierzchołkach A, B, C (pusty tekst = bez opisu). */
      angles: [string, string, string];
      /** Kąt zewnętrzny przy wierzchołku B. */
      exterior?: string;
    }
  | {
      kind: "isosceles";
      base: string;
      arm: string;
      height?: string;
      apexAngle?: string;
      baseAngle?: string;
    }
  | { kind: "triangle-height"; base: string; height: string }
  | { kind: "rectangle"; w: string; h: string; diagonal?: string }
  | {
      kind: "parallelogram";
      base?: string;
      side?: string;
      height?: string;
      angle?: string;
    }
  | { kind: "trapezoid"; top: string; bottom: string; height: string }
  | { kind: "rhombus"; d1: string; d2: string; side?: string }
  | { kind: "box"; a: string; b: string; c: string; diagonal?: string }
  | {
      kind: "pyramid";
      base: string;
      height?: string;
      wall?: string;
      edge?: string;
    }
  | {
      kind: "coordinate";
      points: { label: string; x: number; y: number }[];
      connect?: boolean;
    };

export type SchemeStep = { points: number; text: string };

type TaskBase = {
  id: string;
  number: number;
  points: number;
  prompt: string;
  figure?: Figure;
  /** Rozwiązanie krok po kroku (do klucza odpowiedzi). */
  solution: string[];
};

export type ClosedTask = TaskBase & {
  kind: "closed";
  choices: string[];
  correctIndex: number;
};

export type TrueFalseTask = TaskBase & {
  kind: "tf";
  statements: { text: string; truth: boolean }[];
};

export type OpenTask = TaskBase & {
  kind: "open";
  /** Podpunkty a), b), c) wyświetlane pod treścią. */
  parts?: string[];
  /** Końcowa odpowiedź wzorcowa. */
  key: string;
  scheme: SchemeStep[];
};

export type SheetTask = ClosedTask | TrueFalseTask | OpenTask;

export type TaskDraft<T extends SheetTask = SheetTask> = T extends SheetTask
  ? Omit<T, "id" | "number">
  : never;

export type SheetChapter = {
  id: string;
  schoolClass: number;
  title: string;
  description: string;
  durationMin: number;
  /** Generatory zadań w kolejności na arkuszu. */
  slots: readonly ((rng: Rng) => TaskDraft)[];
};

export type Sheet = {
  chapterId: string;
  schoolClass: number;
  title: string;
  group: "A" | "B";
  seed: number;
  durationMin: number;
  tasks: SheetTask[];
  maxPoints: number;
};
