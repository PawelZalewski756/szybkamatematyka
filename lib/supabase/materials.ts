import { getSupabase } from "@/lib/supabase";
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

  // limit(1): przy duplikatach slugów bierzemy jeden wiersz (najwyższy id).
  const { data, error } = await supabase
    .from("materials")
    .select(MATERIAL_SELECT)
    .eq("exam_type", examType)
    .eq("category", category)
    .eq("topic", topic)
    .order("id", { ascending: false })
    .limit(1);

  if (error) throw error;
  const row = data?.[0];
  if (!row) return null;
  return mapMaterial(row as MaterialRow);
}

export async function fetchMaterialSummariesForExam(
  examType: ExamType,
): Promise<MaterialTopicSummary[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("materials")
    .select("category, topic, content")
    .eq("exam_type", examType);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    category: String(row.category),
    topic: String(row.topic),
    tier: classifyTheoryContent(String(row.content ?? "")),
  }));
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
