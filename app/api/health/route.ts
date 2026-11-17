import { isStripeConfigured } from "@/lib/stripe/config";
import { isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Lekki healthcheck dla monitoringu zewnętrznego (uptime). Zwraca tylko
 * informację, czy integracje są skonfigurowane - nigdy wartości sekretów.
 */
export function GET(): Response {
  return Response.json(
    {
      ok: true,
      service: "szybka-matematyka",
      timestamp: new Date().toISOString(),
      integrations: {
        supabase: isSupabaseConfigured(),
        stripe: isStripeConfigured(),
        resend: Boolean(process.env.RESEND_API_KEY?.trim()),
        gemini: Boolean(process.env.GEMINI_API_KEY?.trim()),
        telegram: Boolean(
          process.env.TELEGRAM_BOT_TOKEN?.trim() &&
            process.env.TELEGRAM_ADMIN_IDS?.trim(),
        ),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
