/**
 * Przyznaje Pro ręcznie (gift) na podaną liczbę dni.
 *
 *   npx tsx scripts/grantPro.ts user@example.com --days=30 --reason="rekompensata za zgłoszenie błędu"
 *   npx tsx scripts/grantPro.ts a@example.com b@example.com --days=30
 *
 * Zasady:
 * - nie nadpisuje aktywnej płatnej subskrypcji Stripe,
 * - oznacza źródło jako `gift`, więc użytkownik nie dostanie przycisku
 *   „Zarządzaj subskrypcją” i nie może anulować czegoś, czego nie kupił,
 * - wydłuża istniejący gift od daty końca, a nie od dziś,
 * - wymaga migracji `20261118134000_pro_source.sql`.
 */
import dotenv from "dotenv";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const argv = process.argv.slice(2);
const daysArg = argv.find((arg) => arg.startsWith("--days="));
const reasonArg = argv.find((arg) => arg.startsWith("--reason="));
const days = Math.max(1, Math.min(365, Number(daysArg?.split("=")[1] ?? 30)));
const reason =
  reasonArg?.split("=").slice(1).join("=").trim() ||
  "rekompensata za zgłoszenie błędu";
const emails = argv
  .filter((arg) => !arg.startsWith("--"))
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

if (emails.length === 0) {
  console.error(
    "Usage: npx tsx scripts/grantPro.ts user@email.com [user2@email.com] [--days=30] [--reason=...]",
  );
  process.exit(1);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Brak NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY w .env.local",
    );
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const results: Array<Record<string, unknown>> = [];
  for (const email of emails) {
    const { data: listed, error: listErr } = await sb.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) throw listErr;

    const user = listed.users.find(
      (candidate) => candidate.email?.toLowerCase() === email,
    );
    if (!user) {
      results.push({ email, status: "NO_USER" });
      continue;
    }

    const { data: profile, error: profileErr } = await sb
      .from("profiles")
      .select(
        "subscription_status, subscription_current_period_end, stripe_subscription_id, pro_source",
      )
      .eq("id", user.id)
      .maybeSingle();
    if (profileErr) throw profileErr;

    const hasPaidStripe =
      Boolean(profile?.stripe_subscription_id) &&
      (profile?.subscription_status === "active" ||
        profile?.subscription_status === "trialing");
    if (hasPaidStripe) {
      results.push({ email, status: "SKIPPED_ALREADY_PAID", userId: user.id });
      continue;
    }

    const now = Date.now();
    const currentEnd = profile?.subscription_current_period_end
      ? Date.parse(profile.subscription_current_period_end)
      : Number.NaN;
    const isGift = profile?.pro_source === "gift";
    const base =
      isGift && Number.isFinite(currentEnd) && currentEnd > now
        ? currentEnd
        : now;
    const periodEnd = new Date(base + days * 24 * 60 * 60 * 1000);

    const { data, error } = await sb
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_plan: "pro",
        subscription_current_period_end: periodEnd.toISOString(),
        subscription_cancel_at_period_end: false,
        pro_source: "gift",
        pro_granted_reason: reason,
      })
      .eq("id", user.id)
      .select(
        "id, nick, subscription_status, subscription_plan, subscription_current_period_end, pro_source, pro_granted_reason",
      )
      .single();

    if (error) {
      results.push({
        email,
        status: "UPDATE_FAILED",
        userId: user.id,
        error: error.message,
      });
      continue;
    }

    results.push({
      email,
      status: "GRANTED",
      userId: user.id,
      days,
      periodEnd: periodEnd.toISOString(),
      profile: data,
    });
  }

  console.log(JSON.stringify({ days, reason, results }, null, 2));
  if (results.some((result) => result.status === "UPDATE_FAILED")) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
