/**
 * Wspólna warstwa wysyłki wiadomości Telegrama.
 *
 * W projekcie są trzy miejsca, które wołają `sendMessage` (powiadomienia o
 * zakupie, o nowym koncie i bot administracyjny). Trzymamy je w jednym miejscu,
 * żeby każdy błąd Telegrama miał czytelny opis i żeby łatwo było podmienić
 * transport w testach.
 */

export type TelegramSendResult =
  | { ok: true }
  | {
      ok: false;
      status: number;
      description: string;
      retryAfter?: number;
    };

/**
 * Token z BotFather nie zawiera prefiksu `bot`, ale łatwo go dokleić przy
 * kopiowaniu. Normalizujemy, żeby URL nie był `.../botbot123:ABC/...`.
 */
export function normalizeTelegramBotToken(value: string | undefined): string {
  return (value ?? "").trim().replace(/^bot/i, "");
}

/** Czytelny opis błędu Telegrama - trafia do logów i panelu diagnostyki. */
export function describeTelegramFailure(
  status: number,
  description: string,
): string {
  const detail = description.trim();

  if (status === 401) {
    return "Nieprawidłowy TELEGRAM_BOT_TOKEN (Telegram zwrócił 401).";
  }
  if (status === 403) {
    return "Bot nie może napisać do administratora (403). Odbiorca musi najpierw wysłać /start do bota na prywatnym czacie.";
  }
  if (status === 400 && /chat not found/i.test(detail)) {
    return "Telegram nie zna tego chat_id (400 chat not found). Sprawdź TELEGRAM_ADMIN_IDS - musi to być numeryczne ID czatu prywatnego, nie nazwa użytkownika.";
  }
  if (status === 429) {
    return "Telegram ograniczył wysyłkę (429). Spróbuj ponownie później.";
  }
  if (detail) return `Telegram ${status}: ${detail}`;
  return `Telegram zwrócił błąd ${status}.`;
}

/** Wysyła wiadomość i zwraca wynik zamiast rzucać wyjątkiem. */
export async function sendTelegramMessage(
  token: string,
  chatId: string | number,
  text: string,
): Promise<TelegramSendResult> {
  const normalizedToken = normalizeTelegramBotToken(token);
  if (!normalizedToken) {
    return { ok: false, status: 400, description: "Brak tokenu bota." };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${normalizedToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          description?: string;
          parameters?: { retry_after?: number };
        }
      | null;

    if (response.ok && payload?.ok === true) return { ok: true };

    return {
      ok: false,
      status: response.status,
      description:
        payload?.description?.trim() || `HTTP ${response.status} bez opisu.`,
      retryAfter: payload?.parameters?.retry_after,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      description:
        error instanceof Error ? error.message : "Nieznany błąd sieci.",
    };
  }
}
