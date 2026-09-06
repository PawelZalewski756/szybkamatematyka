import { TopicPageClient } from "@/components/trening/TopicPageClient";
import {
  findCkeCategoryLabel,
  findCkeTopicLabel,
} from "@/lib/trening/cke-curriculum";
import { formatTreningLabel } from "@/lib/trening/dynamic-tree";
import { decodeSlug, examTypeFromParam } from "@/lib/trening/slugs";
import { resolveSeedMaterial } from "@/lib/trening/resolve-material";
import type { ExamType, Material } from "@/types/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    exam: string;
    category: string;
    topic: string;
  }>;
};

const EXAM_LABELS: Record<ExamType, string> = {
  matura_podstawowa: "matura podstawowa",
  matura_rozszerzona: "matura rozszerzona",
  "8_klasa": "egzamin ósmoklasisty",
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { exam, category, topic } = await params;
  const examType = examTypeFromParam(exam);

  if (!examType) {
    return {
      title: "Trening tematyczny",
      description: "Zadania z matematyki pogrupowane po działach i tematach.",
    };
  }

  const examLabel = EXAM_LABELS[examType];
  const categorySlug = decodeSlug(category);
  const topicSlug = decodeSlug(topic);
  const categoryLabel =
    findCkeCategoryLabel(examType, categorySlug) ??
    formatTreningLabel(categorySlug);
  const topicLabel =
    findCkeTopicLabel(examType, categorySlug, topicSlug) ??
    formatTreningLabel(topicSlug);

  return {
    title: `${topicLabel} — trening (${examLabel})`,
    description: `Zadania z tematu „${topicLabel}” (dział: ${categoryLabel}) pod ${examLabel}. Ćwicz, zdobywaj EXP i utrwalaj materiał krok po kroku.`,
    alternates: {
      canonical: `/trening/${exam}/${category}/${topic}`,
    },
  };
}

export default async function TreningTopicPage({ params }: PageProps) {
  const { exam, category, topic } = await params;
  const examType = examTypeFromParam(exam);

  if (!examType) {
    notFound();
  }

  const categorySlug = decodeSlug(category);
  const topicSlug = decodeSlug(topic);
  const label =
    findCkeTopicLabel(examType, categorySlug, topicSlug) ??
    formatTreningLabel(topicSlug);

  const backHref = "/trening";

  const initialMaterial: Material | null | undefined =
    resolveSeedMaterial(examType, categorySlug, topicSlug) ?? undefined;

  return (
    <TopicPageClient
      examType={examType}
      category={categorySlug}
      topic={topicSlug}
      topicLabel={label}
      backHref={backHref}
      initialMaterial={initialMaterial}
    />
  );
}
