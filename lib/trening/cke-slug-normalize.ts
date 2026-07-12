import type { ExamType } from "@/types/database";

/** Stare exam_type / slugi sprzed drzewa CKE → kanoniczne. */
const LEGACY_EXAM_TYPES: Record<string, ExamType> = {
  egzamin_8_klasisty: "8_klasa",
};

/** Klucz: `${category}:${topic}` w starym układzie. */
const LEGACY_TOPIC_BY_EXAM: Partial<
  Record<ExamType, Record<string, { category: string; topic: string }>>
> = {
  matura_podstawowa: {
    "algebra:potegi": { category: "liczby_rzeczywiste", topic: "potegi" },
    "algebra:logarytmy": { category: "liczby_rzeczywiste", topic: "logarytmy" },
    "algebra:procenty": { category: "liczby_rzeczywiste", topic: "procenty" },
    "algebra:wartosc_bezwzgledna": {
      category: "liczby_rzeczywiste",
      topic: "wartosc_bezwzgledna",
    },
    "algebra:notacja_wykladnicza": {
      category: "liczby_rzeczywiste",
      topic: "notacja_wykladnicza",
    },
    "algebra:kolejnosc_dzialan": {
      category: "liczby_rzeczywiste",
      topic: "kolejnosc_dzialan",
    },
  },
  "8_klasa": {
    "arytmetyka:ulamki": { category: "liczby", topic: "ulamki" },
    "arytmetyka:procenty": { category: "liczby", topic: "procenty" },
    "arytmetyka:pierwiastki": { category: "liczby", topic: "pierwiastki" },
  },
};

export function normalizeExamType(examType: string): ExamType {
  return (LEGACY_EXAM_TYPES[examType] ?? examType) as ExamType;
}

export function legacyExamTypesFor(examType: ExamType): ExamType[] {
  const legacy = Object.entries(LEGACY_EXAM_TYPES)
    .filter(([, canonical]) => canonical === examType)
    .map(([legacyType]) => legacyType as ExamType);
  return [examType, ...legacy];
}

export function normalizeCkeTopicSlug(
  examType: ExamType,
  category: string,
  topic: string,
): { category: string; topic: string } {
  const mapped = LEGACY_TOPIC_BY_EXAM[examType]?.[`${category}:${topic}`];
  return mapped ?? { category, topic };
}

export function normalizeCkeMaterialKey(
  examType: string,
  category: string,
  topic: string,
): { examType: ExamType; category: string; topic: string } {
  const normalizedExam = normalizeExamType(examType);
  const normalizedTopic = normalizeCkeTopicSlug(
    normalizedExam,
    category,
    topic,
  );
  return {
    examType: normalizedExam,
    ...normalizedTopic,
  };
}

/** Kanoniczny slug → możliwe legacy w DB (do odczytu zadań/materiałów). */
export function legacyDbSlugsForCkeTopic(
  examType: ExamType,
  category: string,
  topic: string,
): { category: string; topic: string }[] {
  const slugs = [{ category, topic }];
  const map = LEGACY_TOPIC_BY_EXAM[examType];
  if (!map) return slugs;

  for (const [legacyKey, canonical] of Object.entries(map)) {
    if (canonical.category === category && canonical.topic === topic) {
      const [legacyCategory, legacyTopic] = legacyKey.split(":");
      if (legacyCategory && legacyTopic) {
        slugs.push({ category: legacyCategory, topic: legacyTopic });
      }
    }
  }
  return slugs;
}
