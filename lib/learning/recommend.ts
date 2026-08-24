import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import {
  learningPathFromSchoolClass,
  matchesLearningPath,
  type SchoolClassPath,
} from "@/lib/learning-path";
import {
  masteryBand,
  masteryKey,
  masteryScore,
  type TopicMasteryRecord,
} from "@/lib/learning/mastery";
import {
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";
import type { ExamWithProgress, TrainingTopicWithProgress } from "@/lib/trening/progress";
import { buildTopicHref } from "@/lib/trening/slugs";

export type NextActionKind =
  | "review"
  | "weak_topic"
  | "next_topic"
  | "control_sheet";

export type NextAction = {
  kind: NextActionKind;
  title: string;
  reason: string;
  href: string;
};

function dueLabel(count: number): string {
  if (count === 1) return "1 zaległa powtórka";
  if (count >= 2 && count <= 4) return `${count} zaległe powtórki`;
  return `${count} zaległych powtórek`;
}

function orderedTopics(
  examKey: TreningExamKey,
  exam: ExamWithProgress,
): Array<{
  categoryId: string;
  categoryName: string;
  topic: TrainingTopicWithProgress;
}> {
  const progress = new Map<string, TrainingTopicWithProgress>();
  for (const category of exam.categories) {
    for (const topic of category.topics) {
      progress.set(`${category.id}:${topic.id}`, topic);
    }
  }

  const base = TRAINING_CURRICULUM[examKey];
  return base.categories.flatMap((category) =>
    category.topics.map((topic) => {
      const withProgress = progress.get(`${category.id}:${topic.id}`);
      return {
        categoryId: category.id,
        categoryName: category.name,
        topic: withProgress ?? {
          ...topic,
          total: 0,
          solved: 0,
          percent: 0,
          status: "coming_soon" as const,
        },
      };
    }),
  );
}

function controlSheetHref(
  examKey: TreningExamKey,
  schoolClass: SchoolClassPath,
): string | null {
  const kind = examKey === "8_klasa" ? "egzamin-8" : "matura";
  const path = learningPathFromSchoolClass(schoolClass);
  const match =
    EXAM_SHEETS.find(
      (sheet) =>
        sheet.kind === kind && matchesLearningPath(path, sheet.forPaths),
    ) ?? EXAM_SHEETS.find((sheet) => sheet.kind === kind);
  if (!match) {
    return examKey === "8_klasa" || examKey === "matura_podstawowa"
      ? "/trening/arkusze"
      : null;
  }
  return `/baza-zadan/arkusz/${match.id}`;
}

export function recommendNextAction(input: {
  examKey: TreningExamKey;
  exam: ExamWithProgress;
  mastery: TopicMasteryRecord[];
  dueCount: number;
  schoolClass: SchoolClassPath;
  now?: number;
}): NextAction {
  const now = input.now ?? Date.now();

  if (input.dueCount > 0) {
    return {
      kind: "review",
      title: "Zrób zaległe powtórki",
      reason: `${dueLabel(input.dueCount)} — wróć do nich, zanim otworzysz nowy temat.`,
      href: "/powtorki",
    };
  }

  const byKey = new Map(
    input.mastery.map((row) => [
      masteryKey(row.examType, row.category, row.topic),
      row,
    ]),
  );
  const topics = orderedTopics(input.examKey, input.exam);
  const examType = TRAINING_CURRICULUM[input.examKey].examType;

  for (const entry of topics) {
    if (entry.topic.total <= 0) continue;
    const record = byKey.get(
      masteryKey(examType, entry.categoryId, entry.topic.id),
    );
    if (!record || record.attempts < 3) continue;
    const score = masteryScore(record, now);
    if (masteryBand(score, record.attempts) !== "weak") continue;
    return {
      kind: "weak_topic",
      title: entry.topic.name,
      reason: `Ten temat jest potrzebny dalej, a opanowanie wynosi ${score}%. Ćwiczenia wrócą tu, zanim pójdziesz kolejnym działem.`,
      href: buildTopicHref(input.examKey, entry.categoryId, entry.topic.id),
    };
  }

  for (const entry of topics) {
    if (entry.topic.total <= 0) continue;
    if (entry.topic.solved >= entry.topic.total) continue;
    return {
      kind: "next_topic",
      title: entry.topic.name,
      reason: `Kolejny temat na ścieżce ${input.exam.label}.`,
      href: buildTopicHref(input.examKey, entry.categoryId, entry.topic.id),
    };
  }

  const sheetHref = controlSheetHref(input.examKey, input.schoolClass);
  return {
    kind: "control_sheet",
    title: "Arkusz kontrolny",
    reason:
      "Tematy z tej ścieżki są domknięte. Sprawdź się na mieszanym arkuszu.",
    href: sheetHref ?? "/trening/arkusze",
  };
}
