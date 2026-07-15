import { buildTopicHref } from "@/lib/trening/slugs";
import {
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";

export type TreningSitemapEntry = {
  path: string;
  examKey: TreningExamKey;
  categorySlug: string;
  topicSlug: string;
  topicLabel: string;
};

/** Wszystkie publiczne URL-e tematów treningowych (do sitemap i SEO). */
export function getTreningTopicUrls(): TreningSitemapEntry[] {
  const entries: TreningSitemapEntry[] = [];

  for (const examKey of Object.keys(TRAINING_CURRICULUM) as TreningExamKey[]) {
    const exam = TRAINING_CURRICULUM[examKey];
    for (const category of exam.categories) {
      for (const topic of category.topics) {
        entries.push({
          path: buildTopicHref(examKey, category.id, topic.id),
          examKey,
          categorySlug: category.id,
          topicSlug: topic.id,
          topicLabel: topic.name,
        });
      }
    }
  }

  return entries;
}
