import { getSupabaseOrNull } from "@/lib/supabase";
import { normalizeLearningPath } from "@/lib/learning-path";
import type { DuelConfig, DuelResult } from "@/lib/pojedynki/duel-types";
import { duelRoomCode } from "@/lib/pojedynki/duel-config";

/**
 * Persystencja pokojów pojedynku w Supabase (tabela `duel_rooms`, migracja
 * 20260529140000_init_duel_rooms.sql). Pozwala udostępniać KRÓTKI kod pokoju
 * (np. ABCDE) i grać async cross-device.
 *
 * WAŻNE: cały moduł jest „best-effort". Gdy Supabase nie jest skonfigurowany
 * lub tabela nie istnieje (brak migracji), każda funkcja zwraca null/false,
 * a UI degraduje się do przenośnego kodu offline (duel-storage). Dzięki temu
 * feature działa BEZ backendu.
 */

export type DuelRoom = {
  code: string;
  config: DuelConfig;
  hostName: string;
  hostResult: DuelResult | null;
  guestName: string | null;
  guestResult: DuelResult | null;
  status: "open" | "finished";
};

type DuelRoomRow = {
  code: string;
  slug: string;
  path: string;
  seed: number;
  question_count: number;
  host_name: string;
  host_result: DuelResult | null;
  guest_name: string | null;
  guest_result: DuelResult | null;
  status: string;
};

function rowToRoom(row: DuelRoomRow): DuelRoom | null {
  const path = normalizeLearningPath(row.path);
  if (!path) return null;
  return {
    code: row.code,
    config: {
      slug: row.slug,
      path,
      seed: Number(row.seed),
      questionCount: row.question_count,
    },
    hostName: row.host_name,
    hostResult: row.host_result,
    guestName: row.guest_name,
    guestResult: row.guest_result,
    status: row.status === "finished" ? "finished" : "open",
  };
}

/**
 * Tworzy pokój async w Supabase z wynikiem hosta. Zwraca kod pokoju lub null,
 * gdy backend niedostępny (wtedy UI używa przenośnego kodu offline).
 */
export async function createDuelRoom(
  config: DuelConfig,
  hostName: string,
  hostResult: DuelResult,
): Promise<string | null> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return null;

  const code = duelRoomCode(config);
  const { error } = await supabase.from("duel_rooms").upsert(
    {
      code,
      slug: config.slug,
      path: config.path,
      seed: config.seed,
      question_count: config.questionCount,
      host_name: hostName,
      host_result: hostResult,
      status: "open",
    },
    { onConflict: "code" },
  );

  if (error) return null;
  return code;
}

/** Pobiera pokój po kodzie. Zwraca null, gdy nie istnieje lub backend nieaktywny. */
export async function fetchDuelRoom(code: string): Promise<DuelRoom | null> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("duel_rooms")
    .select(
      "code, slug, path, seed, question_count, host_name, host_result, guest_name, guest_result, status",
    )
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (error || !data) return null;
  return rowToRoom(data as DuelRoomRow);
}

/** Zapisuje wynik gościa (po rozegraniu async). Zwraca true gdy się powiodło. */
export async function submitGuestResult(
  code: string,
  guestName: string,
  guestResult: DuelResult,
): Promise<boolean> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return false;

  const { error } = await supabase
    .from("duel_rooms")
    .update({
      guest_name: guestName,
      guest_result: guestResult,
      status: "finished",
    })
    .eq("code", code.trim().toUpperCase());

  return !error;
}
