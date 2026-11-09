import { parseTelegramAdminIds } from "@/lib/telegram/admin-bot";

function line(value: string, maxLength: number): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export type PurchaseNotificationDetails = {
  email: string;
  planLabel: string;
  amountTotal: number | null;
  currency: string | null;
  createdAt: Date;
};

export function formatPurchaseNotification(
  details: PurchaseNotificationDetails,
): string {
  const amount =
    details.amountTotal !== null && details.currency
      ? new Intl.NumberFormat("pl-PL", {
          style: "currency",
          currency: details.currency.toUpperCase(),
        }).format(details.amountTotal / 100)
      : "brak";
  const date = new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(details.createdAt);

  return [
    "Nowy zakup",
    `Plan: ${line(details.planLabel, 80) || "nieznany"}`,
    `Kwota: ${amount}`,
    `E-mail: ${line(details.email, 200) || "brak"}`,
    `Data: ${date}`,
  ].join("\n");
}

/** Wysyła wiadomość do wszystkich adminów. Nigdy nie rzuca błędu. */
export async function notifyAdminsTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminIds = parseTelegramAdminIds(
    process.env.TELEGRAM_ADMIN_IDS || process.env.ADMIN_TELEGRAM_ID,
  );
  if (!token || adminIds.size === 0) return;

  await Promise.all(
    [...adminIds].map(async (chatId) => {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text }),
            cache: "no-store",
            signal: AbortSignal.timeout(8_000),
          },
        );
        if (!response.ok) {
          console.error("[telegram-notify] sendMessage status", response.status);
        }
      } catch (error) {
        console.error("[telegram-notify] sendMessage failed:", error);
      }
    }),
  );
}
