import {
  getServiceSupabaseOrNull,
  isServiceRoleConfigured,
} from "@/lib/stripe/service-supabase";
import { verifyAdminRequest } from "@/lib/supabase/admin";
import { fetchSolvedStats } from "@/lib/supabase/solved-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOP_STUDENTS = 10;

type ProfileNameRow = {
  id: string;
  nick?: string | null;
  nickname?: string | null;
};

/**
 * GET /api/admin/solved-stats
 *
 * Statystyki rozwiązanych zadań dla CAŁEJ platformy. `solved_tasks` ma RLS
 * „tylko własne wiersze”, więc zwykły klient sesji widzi wyłącznie swoje
 * rozwiązania. Tutaj liczymy kluczem service_role po weryfikacji admina.
 */
export async function GET(request: Request): Promise<Response> {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json(
      { error: auth.error },
      { status: auth.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!isServiceRoleConfigured()) {
    return Response.json(
      {
        ok: false,
        available: false,
        code: "service_not_configured",
        error:
          "Brak SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych - nie da się policzyć zadań wszystkich uczniów.",
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = getServiceSupabaseOrNull();
  if (!supabase) {
    return Response.json(
      {
        ok: false,
        available: false,
        code: "service_not_configured",
        error: "Klient service_role nie został utworzony.",
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const stats = await fetchSolvedStats(supabase);
    const topIds = [...stats.perUser.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_STUDENTS)
      .map(([id]) => id);

    let names = new Map<string, string>();
    if (topIds.length > 0) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nick, nickname")
        .in("id", topIds);
      if (error) {
        console.error("[admin-solved-stats] profiles read failed", error);
      } else {
        names = new Map(
          ((data ?? []) as ProfileNameRow[]).map((row) => [
            row.id,
            (row.nick || row.nickname || "").trim() || "bez nicku",
          ]),
        );
      }
    }

    const topStudents = [...stats.perUser.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_STUDENTS)
      .map(([id, solved]) => ({
        id,
        name: names.get(id) ?? "bez nicku",
        solved,
      }));

    return Response.json(
      {
        ok: true,
        available: true,
        generatedAt: new Date().toISOString(),
        totals: {
          allTime: stats.total,
          last7: stats.last7,
          last30: stats.last30,
        },
        students: stats.students,
        averagePerStudent:
          stats.students > 0
            ? Math.round((stats.total / stats.students) * 10) / 10
            : 0,
        topStudents,
        daily: stats.daily,
        truncated: stats.truncated,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[admin-solved-stats] aggregation failed", error);
    const missingTable = /solved_tasks/i.test(message);
    return Response.json(
      {
        ok: false,
        available: false,
        code: missingTable ? "solved_tasks_missing" : "aggregation_failed",
        error: missingTable
          ? "Tabela solved_tasks nie istnieje. Uruchom supabase/migrations/init_solved_tasks.sql."
          : "Nie udało się policzyć statystyk zadań.",
        detail: message.slice(0, 300),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }
}
