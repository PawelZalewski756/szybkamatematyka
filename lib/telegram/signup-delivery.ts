import { createClient } from "@supabase/supabase-js";
import { parseTelegramAdminIds } from "@/lib/telegram/admin-bot";
import {
  formatSignupNotification,
  isRecentSignup,
} from "@/lib/telegram/signup-notification";
import { normalizeLearningPath } from "@/lib/learning-path";

const MAX_SIGNUP_AGE_MS = 10 * 60 * 1000;

export type SignupDeliveryResult = {
  status: number;
  body: Record<string, unknown>;
};

function getAdminSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
): Promise<void> {
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
  const result = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    description?: string;
  };
  if (!response.ok || result.ok !== true) {
    throw new Error(
      `Telegram sendMessage failed with status ${response.status}${
        result.description ? `: ${result.description}` : ""
      }.`,
    );
  }
}

/**
 * Wysyła administratorom powiadomienie o nowym koncie. Idempotencja opiera się
 * na tabeli signup_notification_deliveries; gdy tabeli brakuje (niezastosowana
 * migracja), powiadomienie i tak jest wysyłane, żeby nie gubić rejestracji.
 */
export async function deliverSignupNotification(
  userId: string,
): Promise<SignupDeliveryResult> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminIds = parseTelegramAdminIds(
    process.env.TELEGRAM_ADMIN_IDS || process.env.ADMIN_TELEGRAM_ID,
  );
  const supabase = getAdminSupabase();

  if (!botToken || adminIds.size === 0 || !supabase) {
    const missing: string[] = [];
    if (!botToken) missing.push("TELEGRAM_BOT_TOKEN");
    if (adminIds.size === 0) {
      missing.push("TELEGRAM_ADMIN_IDS lub ADMIN_TELEGRAM_ID");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && !process.env.SUPABASE_URL?.trim()) {
      missing.push("NEXT_PUBLIC_SUPABASE_URL");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      missing.push("SUPABASE_SERVICE_ROLE_KEY");
    }
    console.error(
      `[telegram-signup] Brak konfiguracji: ${missing.join(", ")}.`,
    );
    return {
      status: 503,
      body: {
        error: "Signup notifications are not configured.",
        missing,
      },
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.admin.getUserById(userId);
  if (userError) {
    console.error("[telegram-signup] Could not verify new account:", userError);
    return { status: 502, body: { error: "Could not verify the new account." } };
  }
  if (!user) {
    return { status: 404, body: { error: "Account not found." } };
  }
  if (!isRecentSignup(user.created_at, Date.now(), MAX_SIGNUP_AGE_MS)) {
    return { status: 202, body: { delivered: false, reason: "account is not recent" } };
  }

  const metadata = user.user_metadata ?? {};
  const schoolLevel =
    typeof metadata.school_level === "string"
      ? normalizeLearningPath(metadata.school_level)
      : null;
  const text = formatSignupNotification({
    nickname:
      (typeof metadata.nick === "string" && metadata.nick) ||
      (typeof metadata.nickname === "string" && metadata.nickname) ||
      "",
    email: user.email ?? "",
    schoolLevel,
    createdAt: user.created_at,
    emailConfirmed: Boolean(user.email_confirmed_at),
  });

  const failures: string[] = [];
  for (const adminId of adminIds) {
    const { error: claimError } = await supabase
      .from("signup_notification_deliveries")
      .insert({ user_id: user.id, telegram_admin_id: adminId });

    if (claimError?.code === "23505") continue;
    const claimed = !claimError;
    if (claimError) {
      console.error(
        "[telegram-signup] Could not claim notification delivery (wysyłam mimo to):",
        claimError,
      );
    }

    try {
      await sendTelegramMessage(botToken, adminId, text);
    } catch (error) {
      console.error("[telegram-signup] Telegram delivery failed:", error);
      failures.push(adminId);

      if (claimed) {
        const { error: releaseError } = await supabase
          .from("signup_notification_deliveries")
          .delete()
          .eq("user_id", user.id)
          .eq("telegram_admin_id", adminId);
        if (releaseError) {
          console.error(
            "[telegram-signup] Could not release failed delivery claim:",
            releaseError,
          );
        }
      }
    }
  }

  if (failures.length > 0) {
    return {
      status: 502,
      body: { error: "Could not deliver all signup notifications." },
    };
  }
  return { status: 200, body: { delivered: true } };
}
