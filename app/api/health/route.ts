import { isServiceRoleConfigured } from "@/lib/stripe/service-supabase";
import { getServerSentryDsn } from "@/lib/observability/sentry-dsn";
import { isStripeConfigured, isStripeWebhookConfigured } from "@/lib/stripe/config";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { readRequestId, requestIdHeaders } from "@/lib/observability/request-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function envFlag(value: boolean): "configured" | "missing" {
  return value ? "configured" : "missing";
}

/**
 * GET /api/health
 * Publiczny status procesu — bez sekretów i bez pingowania zewnętrznych API.
 */
export async function GET(request: Request) {
  const requestId = readRequestId(request);
  const checks = {
    supabase: envFlag(isSupabaseConfigured()),
    serviceRole: envFlag(isServiceRoleConfigured()),
    gemini: envFlag(Boolean(process.env.GEMINI_API_KEY?.trim())),
    sentry: envFlag(Boolean(getServerSentryDsn())),
    stripe: envFlag(isStripeConfigured()),
    stripeWebhook: envFlag(isStripeWebhookConfigured()),
  };

  const degraded = checks.supabase === "missing";
  const body = {
    ok: !degraded,
    status: degraded ? "degraded" : "ok",
    service: "szybkamatematyka",
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    checks,
  };

  return Response.json(body, {
    status: 200,
    headers: requestIdHeaders(requestId),
  });
}
