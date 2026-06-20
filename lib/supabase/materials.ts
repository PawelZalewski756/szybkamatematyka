import { getSupabase } from "@/lib/supabase";
import type { ExamType, Material } from "@/types/database";

export type MaterialRow = {
  id: string;
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  video_url: string | null;
  created_at: string | null;
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
    created_at: row.created_at ?? undefined,
  };
}

const MATERIAL_SELECT =
  "id, exam_type, category, topic, title, content, video_url, created_at";

export async function fetchMaterialByTopic(
  examType: ExamType,
  category: string,
  topic: string,
): Promise<Material | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("materials")
    .select(MATERIAL_SELECT)
    .eq("exam_type", examType)
    .eq("category", category)
    .eq("topic", topic)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapMaterial(data as MaterialRow);
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
