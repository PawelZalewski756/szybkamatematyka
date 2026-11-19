import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminRequest } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
 * GET /api/cron/referrals
 *
 * Raz dziennie kwalifikuje polecenia: konto zaproszonego musi mieć >= 7 dni
 * i >= 3 rozwiązane zadania. Dopiero wtedy zapraszający zbiera punkty i po
 * dwóch osobach dostaje 30 dni Pro. Idempotentne - można wołać wielokrotnie.
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
      { error: "Brak konfiguracji Supabase." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase.rpc("qualify_referrals");
  if (error) {
    console.error("[referrals] qualify failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | { qualified?: number; rewarded?: number }
    | undefined;

  return Response.json({
    ok: true,
    qualified: Number(row?.qualified) || 0,
    rewarded: Number(row?.rewarded) || 0,
  });
}
