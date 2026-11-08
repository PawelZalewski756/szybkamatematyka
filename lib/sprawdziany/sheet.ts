import {
  BRYLY_CHAPTER,
  PITAGORAS_CHAPTER,
  POTEGI_CHAPTER,
} from "@/lib/sprawdziany/chapters-8";
import {
  KATY_CHAPTER,
  POLA_6_CHAPTER,
  PROCENTY_CHAPTER,
  ROWNANIA_CHAPTER,
} from "@/lib/sprawdziany/chapters-7";
import type {
  Rng,
  Sheet,
  SheetChapter,
  SheetTask,
} from "@/lib/sprawdziany/types";

export const SHEET_CHAPTERS: readonly SheetChapter[] = [
  POLA_6_CHAPTER,
  ROWNANIA_CHAPTER,
  KATY_CHAPTER,
  PROCENTY_CHAPTER,
  PITAGORAS_CHAPTER,
  BRYLY_CHAPTER,
  POTEGI_CHAPTER,
];

export function getAvailableClasses(): number[] {
  return [...new Set(SHEET_CHAPTERS.map((c) => c.schoolClass))].sort(
    (a, b) => a - b,
  );
}

export function getChaptersForClass(schoolClass: number): SheetChapter[] {
  return SHEET_CHAPTERS.filter((c) => c.schoolClass === schoolClass);
}

export function mulberry32(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

/** Grupa A i B mają ten sam układ zadań, ale inne dane liczbowe. */
export function buildSheet(options: {
  chapterId: string;
  group?: "A" | "B";
  seed: number;
}): Sheet | null {
  const chapter = SHEET_CHAPTERS.find((c) => c.id === options.chapterId);
  if (!chapter) return null;
  const group = options.group ?? "A";
  const rng = mulberry32(options.seed + (group === "B" ? 104_729 : 0));
  const tasks = chapter.slots.map(
    (slot, index) =>
      ({
        ...slot(rng),
        id: `z${index + 1}`,
        number: index + 1,
      }) as SheetTask,
  );
  return {
    chapterId: chapter.id,
    schoolClass: chapter.schoolClass,
    title: chapter.title,
    group,
    seed: options.seed,
    durationMin: chapter.durationMin,
    tasks,
    maxPoints: tasks.reduce((sum, t) => sum + t.points, 0),
  };
}

export type SheetAnswers = {
  closed: Record<string, number | undefined>;
  tf: Record<string, (boolean | null)[] | undefined>;
  open: Record<string, string | undefined>;
};

export const EMPTY_ANSWERS: SheetAnswers = { closed: {}, tf: {}, open: {} };

export function autoPoints(task: SheetTask, answers: SheetAnswers): number {
  if (task.kind === "closed") {
    return answers.closed[task.id] === task.correctIndex ? task.points : 0;
  }
  if (task.kind === "tf") {
    const given = answers.tf[task.id] ?? [];
    return task.statements.reduce(
      (sum, s, i) => sum + (given[i] === s.truth ? 1 : 0),
      0,
    );
  }
  return 0;
}

export type SheetGrade = { value: 1 | 2 | 3 | 4 | 5 | 6; label: string };

const GRADE_SCALE: { value: SheetGrade["value"]; label: string; from: number }[] =
  [
    { value: 6, label: "celujący", from: 96 },
    { value: 5, label: "bardzo dobry", from: 86 },
    { value: 4, label: "dobry", from: 70 },
    { value: 3, label: "dostateczny", from: 50 },
    { value: 2, label: "dopuszczający", from: 30 },
    { value: 1, label: "niedostateczny", from: 0 },
  ];

export function gradeForPercent(percent: number): SheetGrade {
  const row = GRADE_SCALE.find((g) => percent >= g.from)!;
  return { value: row.value, label: row.label };
}

/** Skala ocen w punktach: dolna granica każdej oceny dla danej liczby punktów. */
export function gradeTable(maxPoints: number) {
  return GRADE_SCALE.map((g) => ({
    ...g,
    minPoints: g.from === 0 ? 0 : Math.ceil((maxPoints * g.from) / 100),
  })).reverse();
}

export function percentOf(points: number, maxPoints: number): number {
  return maxPoints === 0 ? 0 : Math.round((points / maxPoints) * 1000) / 10;
}

export function gradeForPoints(points: number, maxPoints: number): SheetGrade {
  const row = [...gradeTable(maxPoints)]
    .reverse()
    .find((g) => points >= g.minPoints)!;
  return { value: row.value, label: row.label };
}
