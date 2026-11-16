import { getSupabaseAccessToken } from "@/lib/supabase";

export type PlatformSolvedStats = {
  ok: true;
  available: true;
  generatedAt: string;
  totals: { allTime: number; last7: number; last30: number };
  students: number;
  averagePerStudent: number;
  topStudents: { id: string; name: string; solved: number }[];
  daily: { date: string; count: number }[];
  truncated: boolean;
};

export type PlatformSolvedStatsUnavailable = {
  ok: false;
  available: false;
  code: string;
  error: string;
  detail?: string;
};

export type PlatformSolvedStatsResult =
  | PlatformSolvedStats
  | PlatformSolvedStatsUnavailable;

/**
 * Pobiera statystyki zadań dla całej platformy z endpointu admina
 * (service_role po stronie serwera). Brak konfiguracji nie jest błędem -
 * zwracamy wtedy `available: false` z powodem do pokazania w UI.
 */
export async function fetchPlatformSolvedStats(): Promise<PlatformSolvedStatsResult> {
  const token = await getSupabaseAccessToken();
  if (!token) {
    return {
      ok: false,
      available: false,
      code: "unauthorized",
      error: "Sesja wygasła. Zaloguj się ponownie.",
    };
  }

  const response = await fetch("/api/admin/solved-stats", {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | PlatformSolvedStatsResult
    | null;

  if (!response.ok) {
    return {
      ok: false,
      available: false,
      code: `http_${response.status}`,
      error:
        payload && "error" in payload
          ? payload.error
          : "Nie udało się pobrać statystyk zadań.",
    };
  }

  if (!payload) {
    return {
      ok: false,
      available: false,
      code: "invalid_response",
      error: "Serwer zwrócił nieprawidłową odpowiedź.",
    };
  }

  return payload;
}
