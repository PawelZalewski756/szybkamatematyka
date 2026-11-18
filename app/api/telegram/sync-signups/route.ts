import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { deliverSignupNotification } from "@/lib/telegram/signup-delivery";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_PER_RUN = 100;

function matchesSecret(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function getAdminSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * GET /api/telegram/sync-signups
 *
 * Backfill powiadomień o kontach, które powstały bez wysłanej wiadomości
 * (np. rejestracja przerwana, `after()` ucięty, konto z dashboardu Supabase).
 * Uruchamiane przez Vercel Cron co 15 minut (Vercel Pro); idempotencja w
 * signup_notification_deliveries zapobiega duplikatom.
 */
export async function GET(request: Request): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret) {
    const header = request.headers.get("authorization");
    const bearer = header?.startsWith("Bearer ")
      ? header.slice("Bearer ".length).trim()
      : null;
    const explicit = request.headers.get("x-cron-secret");
    if (
      !matchesSecret(bearer, cronSecret) &&
      !matchesSecret(explicit, cronSecret)
    ) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }
  } else {
    const auth = await verifyAdminRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return Response.json(
      { error: "Brak NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  // Bez tabeli idempotencji cron mógłby wysyłać to samo powiadomienie
  // co 15 minut (Vercel Pro). Lepiej zatrzymać się i poprosić o migrację.
  const { error: idempotencyError } = await supabase
    .from("signup_notification_deliveries")
    .select("user_id")
    .limit(1);
  if (idempotencyError) {
    return Response.json(
      {
        error:
          "Brak tabeli signup_notification_deliveries — uruchom migrację 20261101200000_signup_telegram_notifications.sql.",
      },
      { status: 503 },
    );
  }

  const cutoff = Date.now() - MAX_AGE_MS;
  const candidates: Array<{ id: string; email: string | null; created_at: string }> = [];

  for (let page = 1; page <= 5 && candidates.length < MAX_PER_RUN; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) {
      return Response.json(
        { error: `Nie udało się odczytać kont: ${error.message}` },
        { status: 502 },
      );
    }
    const users = data.users ?? [];
    if (users.length === 0) break;

    for (const user of users) {
      const createdAt = Date.parse(user.created_at);
      if (Number.isFinite(createdAt) && createdAt >= cutoff) {
        candidates.push({
          id: user.id,
          email: user.email ?? null,
          created_at: user.created_at,
        });
      }
    }
    if (users.length < 1000) break;
  }

  const results: Array<{ userId: string; status: number; delivered: boolean }> = [];
  for (const user of candidates.slice(0, MAX_PER_RUN)) {
    const result = await deliverSignupNotification(user.id, {
      maxAgeMs: MAX_AGE_MS,
    }).catch((error) => ({
      status: 500,
      body: { error: String(error) },
    }));
    results.push({
      userId: user.id,
      status: result.status,
      delivered: result.status === 200,
    });
  }

  return Response.json(
    {
      ok: true,
      checked: candidates.length,
      attempted: results.length,
      delivered: results.filter((result) => result.delivered).length,
      results,
      checkedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
