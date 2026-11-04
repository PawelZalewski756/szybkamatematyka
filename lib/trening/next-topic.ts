import {
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";
import { buildTopicHref } from "@/lib/trening/slugs";
import type { ExamType } from "@/types/database";

export type NextTopic = {
  href: string;
  name: string;
  categoryName: string;
};

function examKeyFromType(examType: ExamType): TreningExamKey | null {
  if (examType === "matura_podstawowa" || examType === "8_klasa") {
    return examType;
  }
  return null;
}

/** Następny temat w kolejności programu CKE (przechodzi też do kolejnego działu). */
export function getNextTopic(
  examType: ExamType,
  categorySlug: string,
  topicSlug: string,
): NextTopic | null {
  const key = examKeyFromType(examType);
  if (!key) return null;

  const flat = TRAINING_CURRICULUM[key].categories.flatMap((category) =>
    category.topics.map((topic) => ({ category, topic })),
  );
  const index = flat.findIndex(
    ({ category, topic }) => category.id === categorySlug && topic.id === topicSlug,
  );
  const next = index >= 0 ? flat[index + 1] : undefined;
  if (!next) return null;

  return {
    href: buildTopicHref(key, next.category.id, next.topic.id),
    name: next.topic.name,
    categoryName: next.category.name,
  };
}

export type LearningPathKey = "sp" | "srednia";

export function examKeyForLearningPath(path: LearningPathKey): TreningExamKey {
  return path === "sp" ? "8_klasa" : "matura_podstawowa";
}

/** Pierwszy temat egzaminu — punkt startu dla nowego użytkownika. */
export function getFirstTopic(examKey: TreningExamKey): NextTopic | null {
  const category = TRAINING_CURRICULUM[examKey].categories.find(
    (c) => c.topics.length > 0,
  );
  const topic = category?.topics[0];
  if (!category || !topic) return null;
  return {
    href: buildTopicHref(examKey, category.id, topic.id),
    name: topic.name,
    categoryName: category.name,
  };
}
