import { CKE_EGZAMIN_8 } from "@/lib/trening/cke-egzamin-8";
import {
  CKE_MATURA_PODSTAWOWA,
  type CkeCategoryDef,
  type CkeTopicDef,
} from "@/lib/trening/cke-matura-podstawowa";
import type { ExamType } from "@/types/database";

export function getCkeCategoriesForExam(
  examType: ExamType,
): CkeCategoryDef[] | null {
  if (examType === "matura_podstawowa") {
    return CKE_MATURA_PODSTAWOWA.categories;
  }
  if (examType === "8_klasa") {
    return CKE_EGZAMIN_8.categories;
  }
  return null;
}

export function findCkeTopicLabel(
  examType: ExamType,
  categorySlug: string,
  topicSlug: string,
): string | null {
  const categories = getCkeCategoriesForExam(examType);
  if (!categories) return null;

  const category = categories.find((c) => c.slug === categorySlug);
  return category?.topics.find((t) => t.slug === topicSlug)?.name ?? null;
}

export function findCkeCategoryLabel(
  examType: ExamType,
  categorySlug: string,
): string | null {
  const categories = getCkeCategoriesForExam(examType);
  if (!categories) return null;
  return categories.find((c) => c.slug === categorySlug)?.name ?? null;
}

export function listCkeTopicsForExam(examType: ExamType): {
  category: string;
  topic: string;
  categoryName: string;
  topicName: string;
}[] {
  const categories = getCkeCategoriesForExam(examType);
  if (!categories) return [];

  return categories.flatMap((category) =>
    category.topics.map((topic: CkeTopicDef) => ({
      category: category.slug,
      topic: topic.slug,
      categoryName: category.name,
      topicName: topic.name,
    })),
  );
}
