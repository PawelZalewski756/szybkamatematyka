import type { ExamType, Material } from "@/types/database";
import { normalizeCkeMaterialKey } from "@/lib/trening/cke-slug-normalize";
import { SEED_MATERIALS } from "@/lib/trening/seed/materials";
import { seedTheoryTierForTopic } from "@/lib/trening/seed/theory-index";
import type { TheoryTier } from "@/lib/trening/theory-content";
import { fetchMaterialByTopic } from "@/lib/supabase/materials";

const SEED_ID_PREFIX = "seed:";

function seedMaterialKey(examType: ExamType, category: string, topic: string) {
  return `${SEED_ID_PREFIX}${examType}:${category}:${topic}`;
}

/** Materiał z lokalnego seeda (Phase 3a) — fallback gdy Supabase nie ma wiersza. */
export function resolveSeedMaterial(
  examType: ExamType,
  category: string,
  topic: string,
): Material | null {
  const normalized = normalizeCkeMaterialKey(examType, category, topic);
  const draft = SEED_MATERIALS.find(
    (m) =>
      m.exam_type === normalized.examType &&
      m.category === normalized.category &&
      m.topic === normalized.topic,
  );
  if (!draft) return null;

  return {
    id: seedMaterialKey(normalized.examType, normalized.category, normalized.topic),
    exam_type: draft.exam_type,
    category: draft.category,
    topic: draft.topic,
    title: draft.title,
    content: draft.content,
    video_url: draft.video_url,
  };
}

export function seedTheoryTier(
  examType: ExamType,
  category: string,
  topic: string,
): TheoryTier {
  const normalized = normalizeCkeMaterialKey(examType, category, topic);
  return seedTheoryTierForTopic(
    normalized.examType,
    normalized.category,
    normalized.topic,
  );
}

/** Supabase → seed (tylko po stronie serwera). */
export async function resolveMaterialByTopic(
  examType: ExamType,
  category: string,
  topic: string,
): Promise<Material | null> {
  const fromDb = await fetchMaterialByTopic(examType, category, topic);
  if (fromDb) return fromDb;
  return resolveSeedMaterial(examType, category, topic);
}
