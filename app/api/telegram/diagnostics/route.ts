import { timingSafeEqual } from "node:crypto";
import { parseTelegramAdminIds } from "@/lib/telegram/admin-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function matchesSecret(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

async function telegramApi(
  token: string,
  method: string,
): Promise<{ ok?: boolean; result?: Record<string, unknown> }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/${method}`,
      { cache: "no-store", signal: AbortSignal.timeout(8_000) },
    );
    return (await response.json()) as {
      ok?: boolean;
      result?: Record<string, unknown>;
    };
  } catch {
    return { ok: false };
  }
}

/**
 * Diagnostyka bota bez konieczności działania webhooka.
 *
 *   curl -H "Authorization: Bearer $TELEGRAM_SETUP_SECRET" \
 *     https://szybkamatematyka.pl/api/telegram/diagnostics
 */
export async function GET(request: Request): Promise<Response> {
  const setupSecret = process.env.TELEGRAM_SETUP_SECRET?.trim();
  if (!setupSecret) {
    return Response.json(
      { error: "TELEGRAM_SETUP_SECRET is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (
    !matchesSecret(
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null,
      setupSecret,
    )
  ) {
    return Response.json(
      { error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const adminIds = parseTelegramAdminIds(
    process.env.TELEGRAM_ADMIN_IDS || process.env.ADMIN_TELEGRAM_ID,
  );
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  const [bot, webhook] = token
    ? await Promise.all([
        telegramApi(token, "getMe"),
        telegramApi(token, "getWebhookInfo"),
      ])
    : [{ ok: false }, { ok: false }];

  let expectedWebhookUrl: string | null = null;
  if (siteUrl) {
    try {
      expectedWebhookUrl = new URL("/api/telegram/webhook", siteUrl).toString();
    } catch {
      expectedWebhookUrl = null;
    }
  }

  return Response.json(
    {
      ok: Boolean(token && webhookSecret && adminIds.size > 0),
      config: {
        botToken: Boolean(token),
        webhookSecret: Boolean(webhookSecret),
        setupSecret: true,
        adminIds: adminIds.size,
        serviceRole: Boolean(
          process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
        ),
        siteUrl: siteUrl || null,
      },
      bot: bot.result ?? null,
      webhook: webhook.result ?? null,
      expectedWebhookUrl,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
