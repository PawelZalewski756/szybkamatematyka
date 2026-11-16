import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getBearerToken } from "@/lib/supabase/admin";
import { verifyUserRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tabele z danymi użytkownika. Wszystkie mają kolumnę `user_id` i politykę RLS
 * `select own`, więc eksport nie potrzebuje klucza service_role - wystarczy
 * token zalogowanego użytkownika.
 */
const USER_TABLES = [
  "solved_tasks",
  "review_schedule",
  "daily_challenges",
  "duel_results",
  "user_achievements",
] as const;

/**
 * Kolumny profilu widoczne dla gracza. Celowo bez pól subskrypcji - te nie są
 * objęte grantami kolumnowymi (dane płatności nie mogą wyciekać przez
 * PostgREST); status planu dokładamy osobno z funkcji get_my_subscription().
 */
const PROFILE_COLUMN_SETS = [
  "id, created_at, nick, nickname, xp, minigry_xp, level, streak, last_played_date, avatar_url, school_class, hearts, last_nick_update",
  "id, created_at, nick, nickname, xp, minigry_xp, level, streak, last_played_date, avatar_url",
  "id, created_at, nick, nickname, xp, level, streak, last_played_date",
  "id, nick, xp, level",
] as const;

function getUserSupabase(request: Request): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const token = getBearerToken(request);
  if (!url || !anonKey || !token) return null;

  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * GET /api/account/export
 *
 * Zwraca kopię danych konta w JSON (RODO - prawo do przenoszenia danych).
 * Działa bez SUPABASE_SERVICE_ROLE_KEY: czyta wyłącznie własne wiersze w
 * granicach RLS. Nie eksportujemy identyfikatorów płatności ani kluczy Stripe.
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyUserRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = getUserSupabase(request);
    if (!supabase) {
      return Response.json(
        { error: "Brak konfiguracji Supabase dla eksportu danych." },
        { status: 503 },
      );
    }

    let profile: Record<string, unknown> | null = null;
    let profileError: string | null = null;
    for (const columns of PROFILE_COLUMN_SETS) {
      const { data, error } = await supabase
        .from("profiles")
        .select(columns)
        .eq("id", auth.user.id)
        .maybeSingle();

      if (!error) {
        profile = (data as Record<string, unknown> | null) ?? null;
        profileError = null;
        break;
      }
      if (error.code === "PGRST116") {
        profile = null;
        profileError = null;
        break;
      }
      profileError = error.message;
    }

    if (profileError) {
      console.error("[account-export] profile read failed", profileError);
    }

    const exports: Record<string, unknown[]> = {};
    const unavailable: string[] = [];

    for (const table of USER_TABLES) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", auth.user.id);

      if (error) {
        // Tabela może nie istnieć w starszej instalacji - nie blokujemy całości.
        unavailable.push(table);
        exports[table] = [];
        continue;
      }
      exports[table] = data ?? [];
    }

    // Status planu jest w kolumnach dostępnych tylko przez funkcję SQL.
    let subscription: Record<string, unknown> | null = null;
    try {
      const { data, error } = await supabase.rpc("get_my_subscription");
      if (!error && data) {
        const row = Array.isArray(data) ? data[0] : data;
        subscription =
          row && typeof row === "object"
            ? {
                status: (row as Record<string, unknown>).subscription_status ?? null,
                plan: (row as Record<string, unknown>).subscription_plan ?? null,
                currentPeriodEnd:
                  (row as Record<string, unknown>)
                    .subscription_current_period_end ?? null,
                cancelAtPeriodEnd:
                  (row as Record<string, unknown>)
                    .subscription_cancel_at_period_end ?? null,
              }
            : null;
      }
    } catch {
      // Brak funkcji w starszej bazie nie może psuć eksportu.
    }

    const payload = {
      formatVersion: 2,
      exportedAt: new Date().toISOString(),
      account: {
        id: auth.user.id,
        email: auth.user.email ?? null,
        createdAt: auth.user.created_at ?? null,
        lastSignInAt: auth.user.last_sign_in_at ?? null,
        emailConfirmed: Boolean(auth.user.email_confirmed_at),
      },
      profile,
      subscription,
      ...exports,
      summary: {
        solvedTasks: exports.solved_tasks.length,
        reviews: exports.review_schedule.length,
        dailyChallenges: exports.daily_challenges.length,
        duels: exports.duel_results.length,
        achievements: exports.user_achievements.length,
      },
      ...(unavailable.length > 0 ? { unavailable } : {}),
    };

    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="szybka-matematyka-dane-${stamp}.json"`,
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
