import { verifyAdminRequest } from "@/lib/supabase/admin";
import { parseTelegramAdminIds } from "@/lib/telegram/admin-bot";
import {
  describeTelegramFailure,
  normalizeTelegramBotToken,
  sendTelegramMessage,
} from "@/lib/telegram/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramApiResponse = {
  ok: boolean;
  result?: Record<string, unknown>;
  description?: string;
};

async function callTelegram(
  token: string,
  method: string,
): Promise<TelegramApiResponse> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const payload = (await response.json().catch(() => null)) as
      | TelegramApiResponse
      | null;
    return {
      ok: Boolean(response.ok && payload?.ok),
      result: payload?.result,
      description: payload?.description ?? `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      description: error instanceof Error ? error.message : "Błąd sieci.",
    };
  }
}

/**
 * POST /api/telegram/diagnostics
 * Admin-only. Sprawdza konfigurację bota i opcjonalnie wysyła testową
 * wiadomość do każdego administratora.
 *
 * Body: { sendTest?: boolean }
 */
export async function POST(request: Request): Promise<Response> {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // Puste body jest poprawne - tryb tylko do odczytu.
  }
  const sendTest =
    typeof body === "object" &&
    body !== null &&
    "sendTest" in body &&
    (body as { sendTest?: unknown }).sendTest === true;

  const token = normalizeTelegramBotToken(process.env.TELEGRAM_BOT_TOKEN);
  const adminIds = [
    ...parseTelegramAdminIds(
      process.env.TELEGRAM_ADMIN_IDS || process.env.ADMIN_TELEGRAM_ID,
    ),
  ];
  const config = {
    botToken: Boolean(token),
    adminIds: adminIds.length,
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    siteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    webhookSecret: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET?.trim()),
  };

  if (!token) {
    return Response.json({
      ok: false,
      checkedAt: new Date().toISOString(),
      config,
      error: "Brak TELEGRAM_BOT_TOKEN.",
    });
  }

  const me = await callTelegram(token, "getMe");
  const bot = me.ok
    ? {
        ok: true,
        id: me.result?.id ?? null,
        username: me.result?.username ?? null,
      }
    : { ok: false, error: me.description ?? "getMe failed" };

  const webhookInfo = await callTelegram(token, "getWebhookInfo");
  const webhook = webhookInfo.ok
    ? {
        ok: true,
        url: String(webhookInfo.result?.url ?? ""),
        pendingUpdates: Number(webhookInfo.result?.pending_update_count ?? 0),
        lastError: String(webhookInfo.result?.last_error_message ?? ""),
      }
    : {
        ok: false,
        error: webhookInfo.description ?? "getWebhookInfo failed",
      };

  const admins: Array<{ id: string; ok: boolean; error?: string }> = [];
  if (sendTest && adminIds.length > 0) {
    const text = [
      "Test powiadomień Szybka Matematyka",
      `Data: ${new Intl.DateTimeFormat("pl-PL", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "Europe/Warsaw",
      }).format(new Date())}`,
      "Jeśli to widzisz, wysyłka do tego administratora działa.",
    ].join("\n");

    for (const adminId of adminIds) {
      const result = await sendTelegramMessage(token, adminId, text);
      admins.push(
        result.ok
          ? { id: adminId, ok: true }
          : {
              id: adminId,
              ok: false,
              error: describeTelegramFailure(result.status, result.description),
            },
      );
    }
  }

  const ok =
    bot.ok &&
    (webhook.ok || !config.webhookSecret) &&
    (!sendTest || admins.every((admin) => admin.ok)) &&
    (!sendTest || adminIds.length > 0);

  return Response.json({
    ok,
    checkedAt: new Date().toISOString(),
    config,
    bot,
    webhook,
    admins,
    ...(sendTest && adminIds.length === 0
      ? { error: "Brak TELEGRAM_ADMIN_IDS - nie ma do kogo wysłać testu." }
      : {}),
  });
}
