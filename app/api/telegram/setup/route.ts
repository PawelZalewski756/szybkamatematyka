import { timingSafeEqual } from "node:crypto";
import { normalizeTelegramBotToken } from "@/lib/telegram/send";

export const runtime = "nodejs";

function matchesSecret(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function POST(request: Request): Promise<Response> {
  const setupSecret = process.env.TELEGRAM_SETUP_SECRET?.trim();
  const botToken = normalizeTelegramBotToken(process.env.TELEGRAM_BOT_TOKEN);
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (!setupSecret || !botToken || !webhookSecret || !siteUrl) {
    return Response.json({ error: "Telegram setup is not configured." }, { status: 503 });
  }

  if (!matchesSecret(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null, setupSecret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let origin: URL;
  try {
    origin = new URL(siteUrl);
  } catch {
    return Response.json({ error: "Invalid site URL." }, { status: 500 });
  }
  if (origin.protocol !== "https:") {
    return Response.json({ error: "Telegram webhook requires HTTPS." }, { status: 500 });
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: new URL("/api/telegram/webhook", origin).toString(),
      secret_token: webhookSecret,
      allowed_updates: ["message"],
    }),
    cache: "no-store",
  });
  const result = (await response.json()) as { ok?: boolean; description?: string };
  if (!response.ok || !result.ok) {
    console.error("Telegram setWebhook failed:", result.description ?? response.status);
    return Response.json({ error: "Telegram rejected webhook setup." }, { status: 502 });
  }

  return Response.json({ ok: true, message: "Telegram webhook is configured." });
}

type TelegramWebhookInfo = {
  ok?: boolean;
  description?: string;
  result?: {
    url?: string;
    has_custom_certificate?: boolean;
    pending_update_count?: number;
    last_error_date?: number;
    last_error_message?: string;
    max_connections?: number;
    allowed_updates?: string[];
  };
};

/**
 * GET /api/telegram/setup
 *
 * Diagnostyka: co Telegram naprawdę wie o webhooku (adres, liczba oczekujących
 * aktualizacji, ostatni błąd dostarczenia). Wymaga tego samego sekretu co POST,
 * więc nie da się jej wywołać publicznie.
 */
export async function GET(request: Request): Promise<Response> {
  const setupSecret = process.env.TELEGRAM_SETUP_SECRET?.trim();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!setupSecret || !botToken) {
    return Response.json({ error: "Telegram setup is not configured." }, { status: 503 });
  }

  if (
    !matchesSecret(
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null,
      setupSecret,
    )
  ) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
    { cache: "no-store" },
  );
  const payload = (await response.json()) as TelegramWebhookInfo;

  if (!response.ok || !payload.ok) {
    return Response.json(
      { error: payload.description ?? "Telegram getWebhookInfo failed." },
      { status: 502 },
    );
  }

  const info = payload.result ?? {};
  const adminIds = (process.env.TELEGRAM_ADMIN_IDS ?? process.env.ADMIN_TELEGRAM_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id));

  return Response.json({
    ok: true,
    webhookUrl: info.url || null,
    webhookConfigured: Boolean(info.url),
    pendingUpdates: info.pending_update_count ?? 0,
    allowedUpdates: info.allowed_updates ?? [],
    lastError: info.last_error_message ?? null,
    lastErrorAt: info.last_error_date
      ? new Date(info.last_error_date * 1000).toISOString()
      : null,
    // Diagnostyka konfiguracji - bez ujawniania sekretów.
    adminIdsConfigured: adminIds.length,
    webhookSecretConfigured: Boolean(
      process.env.TELEGRAM_WEBHOOK_SECRET?.trim(),
    ),
    serviceRoleConfigured: Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    ),
  });
}
