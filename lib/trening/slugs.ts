import { formatTreningLabel } from "@/lib/trening/dynamic-tree";
import {
  findCkeCategoryLabel,
  findCkeTopicLabel,
} from "@/lib/trening/cke-curriculum";
import {
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";
import type { ExamType } from "@/types/database";

/** Segment URL egzaminu → klucz curriculum. */
const EXAM_PARAM_TO_KEY: Record<string, TreningExamKey> = {
  matura: "matura_podstawowa",
  matura_podstawowa: "matura_podstawowa",
  "egzamin-osmoklasisty": "8_klasa",
  egzamin_osmoklasisty: "8_klasa",
  egzamin_8_klasisty: "8_klasa",
  "8_klasa": "8_klasa",
};

const EXAM_TYPE_TO_SLUG: Record<ExamType, string | null> = {
  matura_podstawowa: "matura",
  matura_rozszerzona: null,
  "8_klasa": "egzamin-osmoklasisty",
};

const EXAM_SLUG_TO_TYPE: Record<string, ExamType> = {
  matura: "matura_podstawowa",
  matura_podstawowa: "matura_podstawowa",
  "egzamin-osmoklasisty": "8_klasa",
  egzamin_osmoklasisty: "8_klasa",
  egzamin_8_klasisty: "8_klasa",
  "8_klasa": "8_klasa",
};

export function examKeyFromParam(param: string): TreningExamKey | null {
  return EXAM_PARAM_TO_KEY[param] ?? null;
}

export function examSlugFromType(examType: ExamType): string | null {
  return EXAM_TYPE_TO_SLUG[examType] ?? null;
}

export function examTypeFromParam(param: string): ExamType | null {
  return EXAM_SLUG_TO_TYPE[param] ?? null;
}

export function examParamFromKey(examKey: TreningExamKey): string {
  const examType = TRAINING_CURRICULUM[examKey].examType;
  return examSlugFromType(examType) ?? examKey;
}

export function decodeSlug(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function buildTopicHref(
  examKey: TreningExamKey,
  categorySlug: string,
  topicSlug: string,
): string {
  const examSegment = examParamFromKey(examKey);
  return `/trening/${examSegment}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(topicSlug)}`;
}

/** @deprecated Użyj `buildTopicHref`. */
export function buildArenaHref(
  examKey: TreningExamKey,
  categoryId: string,
  topicId: string,
): string {
  return buildTopicHref(examKey, categoryId, topicId);
}

export function topicDisplayName(
  examKey: TreningExamKey,
  categorySlug: string,
  topicSlug: string,
): string {
  const examType = TRAINING_CURRICULUM[examKey].examType;
  return (
    findCkeTopicLabel(examType, categorySlug, topicSlug) ??
    formatTreningLabel(topicSlug)
  );
}

export function categoryDisplayName(
  examKey: TreningExamKey,
  categorySlug: string,
): string {
  const examType = TRAINING_CURRICULUM[examKey].examType;
  return (
    findCkeCategoryLabel(examType, categorySlug) ??
    formatTreningLabel(categorySlug)
  );
}
