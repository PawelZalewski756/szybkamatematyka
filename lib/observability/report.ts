import { checkRateLimit } from "@/lib/security/rate-limit";
import { sendTelegramMessage } from "@/lib/telegram/send";

/**
 * Alert o błędzie serwera na Telegram administratora.
 *
 * Zamiast pełnego Sentry (kolejna zależność i koszt) mamy minimum:
 * błąd 5xx w krytycznych endpointach trafia do administratora, a nie tylko
 * do logów Vercel, których nikt nie czyta. Alerty są dławione: maksymalnie
 * jeden na kontekst na 5 minut na instancję, żeby pętla błędów nie zalała czatu.
 *
 * Gdy brak `TELEGRAM_BOT_TOKEN` lub `TELEGRAM_ADMIN_IDS`, funkcja tylko loguje.
 * Nie rzuca - raportowanie błędu nie może przykryć oryginalnego błędu.
 */
const ALERT_WINDOW_MS = 5 * 60_000;
const MAX_MESSAGE_LENGTH = 1_200;

function adminChatIds(): string[] {
  return (process.env.TELEGRAM_ADMIN_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function reportServerError(
  context: string,
  error: unknown,
): Promise<void> {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === "string"
        ? error
        : "Nieznany błąd";

  console.error(`[${context}]`, error);

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIds = adminChatIds();
  if (!token || chatIds.length === 0) return;

  const limit = checkRateLimit(`alert:${context}`, {
    limit: 1,
    windowMs: ALERT_WINDOW_MS,
  });
  if (!limit.allowed) return;

  const text = [
    `Błąd serwera: ${context}`,
    new Date().toISOString(),
    message.slice(0, MAX_MESSAGE_LENGTH),
  ].join("\n");

  await Promise.all(
    chatIds.map((chatId) => sendTelegramMessage(token, chatId, text)),
  ).catch((sendError) => {
    console.error("[reportServerError] Telegram send failed:", sendError);
  });
}
