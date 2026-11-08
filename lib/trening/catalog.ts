import { type TreningExamKey } from "@/lib/trening/curriculum";
import {
  type CategoryWithProgress,
  type ExamWithProgress,
  type TrainingTopicWithProgress,
} from "@/lib/trening/progress";
import { buildTopicHref } from "@/lib/trening/slugs";

export type SelectedExam = TreningExamKey;

export function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
    .replace(/ł/g, "l");
}

export function topicMatchesQuery(
  categoryName: string,
  categoryId: string,
  topicName: string,
  topicId: string,
  query: string,
): boolean {
  if (!query) return true;
  const haystack = normalizeSearchText(
    `${categoryName} ${categoryId} ${topicName} ${topicId}`,
  );
  return haystack.includes(query);
}

export function filterExamByQuery(
  exam: ExamWithProgress,
  rawQuery: string,
): ExamWithProgress {
  const query = normalizeSearchText(rawQuery);
  if (!query) return exam;

  const categories = exam.categories
    .map((category) => {
      const categoryMatches = topicMatchesQuery(
        category.name,
        category.id,
        "",
        "",
        query,
      );
      const topics = category.topics.filter((topic) =>
        topicMatchesQuery(
          category.name,
          category.id,
          topic.name,
          topic.id,
          query,
        ),
      );
      if (categoryMatches) return category;
      if (topics.length > 0) return { ...category, topics };
      return null;
    })
    .filter((c): c is CategoryWithProgress => c !== null);

  return { ...exam, categories };
}

export function countTopics(exam: ExamWithProgress): number {
  return exam.categories.reduce((n, c) => n + c.topics.length, 0);
}

export type TopicCardFilter = "all" | "incomplete" | "completed";
export type TopicSort = "az" | "progress";

export function filterTopicsByStatus(
  exam: ExamWithProgress,
  filter: TopicCardFilter,
): ExamWithProgress {
  if (filter === "all") return exam;

  const categories = exam.categories
    .map((category) => {
      const topics = category.topics.filter((topic) => {
        if (topic.total === 0) return false;
        if (filter === "completed") return topic.status === "completed";
        return topic.status !== "completed";
      });
      if (topics.length === 0) return null;
      return { ...category, topics };
    })
    .filter((c): c is CategoryWithProgress => c !== null);

  return { ...exam, categories };
}

export function sortTopicsInExam(
  exam: ExamWithProgress,
  sort: TopicSort,
): ExamWithProgress {
  const categories = exam.categories.map((category) => {
    const topics = [...category.topics];
    if (sort === "az") {
      topics.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    } else {
      topics.sort(
        (a, b) => b.percent - a.percent || a.name.localeCompare(b.name, "pl"),
      );
    }
    return { ...category, topics };
  });
  return { ...exam, categories };
}

export type NextTrainingTopic = {
  href: string;
  categoryId: string;
  categoryName: string;
  topic: TrainingTopicWithProgress;
};

export function findNextTrainingTopic(
  exam: ExamWithProgress,
  examKey: SelectedExam,
): NextTrainingTopic | null {
  let firstPlayable: NextTrainingTopic | null = null;

  for (const category of exam.categories) {
    for (const topic of category.topics) {
      if (topic.total > 0) {
        const candidate = {
          href: buildTopicHref(examKey, category.id, topic.id),
          categoryId: category.id,
          categoryName: category.name,
          topic,
        };
        firstPlayable ??= candidate;
        if (topic.solved < topic.total) return candidate;
      }
    }
  }

  return firstPlayable;
}
