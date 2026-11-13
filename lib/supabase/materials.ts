import { getSupabase } from "@/lib/supabase";
import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";
import {
  legacyDbSlugsForCkeTopic,
  legacyExamTypesFor,
  normalizeCkeMaterialKey,
} from "@/lib/trening/cke-slug-normalize";
import {
  classifyTheoryContent,
  type TheoryTier,
} from "@/lib/trening/theory-content";
import type { ExamType, Material } from "@/types/database";

export type MaterialTopicSummary = {
  category: string;
  topic: string;
  tier: TheoryTier;
};

export type MaterialRow = {
  id: string;
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  video_url: string | null;
};

function mapMaterial(row: MaterialRow): Material {
  return {
    id: row.id,
    exam_type: row.exam_type,
    category: row.category,
    topic: row.topic,
    title: row.title,
    content: row.content,
    video_url: row.video_url,
  };
}

const MATERIAL_SELECT =
  "id, exam_type, category, topic, title, content, video_url";

export async function fetchMaterialByTopic(
  examType: ExamType,
  category: string,
  topic: string,
): Promise<Material | null> {
  const supabase = getSupabase();

  const tryFetch = async (
    et: ExamType,
    cat: string,
    top: string,
  ): Promise<Material | null> => {
    const { data, error } = await supabase
      .from("materials")
      .select(MATERIAL_SELECT)
      .eq("exam_type", et)
      .eq("category", cat)
      .eq("topic", top)
      .order("id", { ascending: false })
      .limit(1)
      .retry(false);

    if (error) throw error;
    const row = data?.[0];
    if (!row) return null;
    return mapMaterial(row as MaterialRow);
  };

  const canonical = await tryFetch(examType, category, topic);
  if (canonical) return canonical;

  for (const slug of legacyDbSlugsForCkeTopic(examType, category, topic)) {
    if (slug.category === category && slug.topic === topic) continue;
    const legacy = await tryFetch(examType, slug.category, slug.topic);
    if (legacy) return legacy;
  }

  for (const et of legacyExamTypesFor(examType)) {
    if (et === examType) continue;
    const legacy = await tryFetch(et, category, topic);
    if (legacy) return legacy;
  }

  return null;
}

export async function fetchMaterialSummariesForExam(
  examType: ExamType,
): Promise<MaterialTopicSummary[]> {
  const supabase = getSupabase();
  const examTypes = legacyExamTypesFor(examType);

  const { rows, error } = await fetchAllPages<{
    exam_type: string;
    category: string;
    topic: string;
    content: string;
  }>((from, to) =>
    supabase
      .from("materials")
      .select("exam_type, category, topic, content")
      .in("exam_type", examTypes)
      .range(from, to)
      .retry(false),
  );

  if (error) throw error;

  const byKey = new Map<string, TheoryTier>();
  for (const row of rows) {
    const normalized = normalizeCkeMaterialKey(
      String(row.exam_type),
      String(row.category),
      String(row.topic),
    );
    if (normalized.examType !== examType) continue;
    const tier = classifyTheoryContent(String(row.content ?? ""));
    const key = `${normalized.category}:${normalized.topic}`;
    const prev = byKey.get(key);
    if (!prev || tierRank(tier) > tierRank(prev)) {
      byKey.set(key, tier);
    }
  }

  return [...byKey.entries()].map(([key, tier]) => {
    const [category, topic] = key.split(":");
    return { category: category!, topic: topic!, tier };
  });
}

function tierRank(tier: TheoryTier): number {
  if (tier === "comprehensive") return 3;
  if (tier === "full") return 2;
  if (tier === "basic") return 1;
  return 0;
}

export async function fetchAllMaterials(): Promise<Material[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("materials")
    .select(MATERIAL_SELECT)
    .order("exam_type")
    .order("category")
    .order("topic");

  if (error) throw error;
  return (data ?? []).map((row) => mapMaterial(row as MaterialRow));
}

export async function fetchMaterialById(id: string): Promise<Material | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("materials")
    .select(MATERIAL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapMaterial(data as MaterialRow);
}

export type MaterialUpsertInput = {
  id?: string;
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  video_url: string | null;
};

/**
 * Zapis materiałów: polityki RLS dopuszczają INSERT/UPDATE/DELETE tylko dla
 * zalogowanego administratora (`public.is_admin()`), więc klient używa sesji
 * użytkownika z panelu /admin.
 */
export async function upsertMaterial(
  input: MaterialUpsertInput,
): Promise<Material> {
  const supabase = getSupabase();
  const payload = {
    exam_type: input.exam_type,
    category: input.category.trim(),
    topic: input.topic.trim(),
    title: input.title.trim(),
    content: input.content,
    video_url: input.video_url?.trim() || null,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("materials")
      .update(payload)
      .eq("id", input.id)
      .select(MATERIAL_SELECT)
      .single();

    if (error) throw error;
    return mapMaterial(data as MaterialRow);
  }

  const { data, error } = await supabase
    .from("materials")
    .insert(payload)
    .select(MATERIAL_SELECT)
    .single();

  if (error) throw error;
  return mapMaterial(data as MaterialRow);
}

export async function deleteMaterial(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw error;
}
