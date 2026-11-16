import { getServiceSupabaseOrNull, isServiceRoleConfigured } from "@/lib/stripe/service-supabase";
import { verifyUserRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const USER_TABLES = [
  "solved_tasks",
  "review_schedule",
  "daily_challenges",
  "duel_results",
  "user_achievements",
] as const;

/**
 * GET /api/account/export
 *
 * Zwraca kopię danych konta w JSON (RODO - prawo do przenoszenia danych).
 * Nie eksportujemy identyfikatorów płatności ani wewnętrznych kluczy Stripe.
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyUserRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    if (!isServiceRoleConfigured()) {
      return Response.json(
        {
          error: "Eksport danych jest chwilowo niedostępny (brak konfiguracji).",
          code: "service_not_configured",
        },
        { status: 503 },
      );
    }

    const supabase = getServiceSupabaseOrNull();
    if (!supabase) {
      return Response.json(
        { error: "Eksport danych jest chwilowo niedostępny." },
        { status: 503 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id, created_at, nick, nickname, xp, minigry_xp, level, streak, last_played_date, avatar_url, school_class, subscription_status, subscription_plan, subscription_current_period_end",
      )
      .eq("id", auth.user.id)
      .maybeSingle();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("[account-export] profile read failed", profileError);
      return Response.json(
        { error: "Nie udało się przygotować eksportu. Spróbuj ponownie." },
        { status: 500 },
      );
    }

    const exports: Record<string, unknown> = {};
    const missing: string[] = [];

    for (const table of USER_TABLES) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", auth.user.id);

      if (error) {
        // Tabela może nie istnieć w starszej instalacji - nie blokujemy całości.
        missing.push(table);
        exports[table] = [];
        continue;
      }
      exports[table] = data ?? [];
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      account: { email: auth.user.email ?? null },
      profile: profile ?? null,
      ...exports,
      ...(missing.length > 0 ? { unavailable: missing } : {}),
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": 'attachment; filename="szybka-matematyka-dane.json"',
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("[account-export] unexpected error", error);
    return Response.json(
      { error: "Nieoczekiwany błąd. Spróbuj ponownie." },
      { status: 500 },
    );
  }
}
