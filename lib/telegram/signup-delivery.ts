import { createClient } from "@supabase/supabase-js";
import { parseTelegramAdminIds } from "@/lib/telegram/admin-bot";
import {
  formatSignupNotification,
  isRecentSignup,
} from "@/lib/telegram/signup-notification";
import { normalizeLearningPath } from "@/lib/learning-path";
import {
  describeTelegramFailure,
  normalizeTelegramBotToken,
  sendTelegramMessage,
} from "@/lib/telegram/send";

const MAX_SIGNUP_AGE_MS = 10 * 60 * 1000;

export type SignupDeliveryResult = {
  status: number;
  body: Record<string, unknown>;
};

/**
 * Migawka użytkownika potrzebna do powiadomienia. `/api/signup` ma ją już po
 * `auth.signUp`, więc nie musi drugi raz pytać Auth Admin API (i nie zależy od
 * `SUPABASE_SERVICE_ROLE_KEY` tylko po to, żeby wysłać wiadomość).
 */
export type SignupNotificationUser = {
  id: string;
  email?: string | null;
  created_at: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

export type DeliverSignupNotificationOptions = {
  /** Dane nowego konta, jeśli wywołujący już je ma. */
  user?: SignupNotificationUser;
  /** Pomiń tabelę idempotencji (np. brak service role). */
  skipIdempotency?: boolean;
  /** Maksymalny wiek konta (domyślnie 10 min). Cron używa 7 dni. */
  maxAgeMs?: number;
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

function readNick(metadata: Record<string, unknown>): string {
  return (
    (typeof metadata.nick === "string" && metadata.nick) ||
    (typeof metadata.nickname === "string" && metadata.nickname) ||
    ""
  );
}

function toUserSnapshot(user: {
  id: string;
  email?: string | null;
  created_at: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): SignupNotificationUser {
  return {
    id: user.id,
    email: user.email ?? null,
    created_at: user.created_at,
    email_confirmed_at: user.email_confirmed_at ?? null,
    user_metadata: user.user_metadata ?? null,
  };
}

/**
 * Wysyła administratorom powiadomienie o nowym koncie. Idempotencja opiera się
 * na tabeli signup_notification_deliveries; gdy tabeli brakuje (niezastosowana
 * migracja) albo nie ma service role, powiadomienie i tak jest wysyłane, żeby
 * nie gubić rejestracji.
 */
export async function deliverSignupNotification(
  userId: string,
  options: DeliverSignupNotificationOptions = {},
): Promise<SignupDeliveryResult> {
  const botToken = normalizeTelegramBotToken(process.env.TELEGRAM_BOT_TOKEN);
  const adminIds = parseTelegramAdminIds(
    process.env.TELEGRAM_ADMIN_IDS || process.env.ADMIN_TELEGRAM_ID,
  );
  const supabase = getAdminSupabase();

  const missing: string[] = [];
  if (!botToken) missing.push("TELEGRAM_BOT_TOKEN");
  if (adminIds.size === 0) missing.push("TELEGRAM_ADMIN_IDS");
  if (!options.user && !supabase) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) {
    const configuredAdmins =
      process.env.TELEGRAM_ADMIN_IDS ?? process.env.ADMIN_TELEGRAM_ID ?? "";
    if (adminIds.size === 0 && configuredAdmins.trim()) {
      console.error(
        "[telegram-signup] TELEGRAM_ADMIN_IDS jest ustawione, ale nie zawiera żadnego numerycznego ID:",
        configuredAdmins,
      );
    }
    console.error(
      "[telegram-signup] Brak konfiguracji:",
      missing.join(", "),
    );
    return {
      status: 503,
      body: {
        error: "Signup notifications are not configured.",
        missing,
      },
    };
  }

  let user = options.user;
  if (!user) {
    if (!supabase) {
      return {
        status: 503,
        body: { error: "Supabase admin client is not configured." },
      };
    }
    const {
      data: { user: fetchedUser },
      error: userError,
    } = await supabase.auth.admin.getUserById(userId);
    if (userError) {
      console.error("[telegram-signup] Could not verify new account:", userError);
      return { status: 502, body: { error: "Could not verify the new account." } };
    }
    if (!fetchedUser) {
      return { status: 404, body: { error: "Account not found." } };
    }
    user = toUserSnapshot(fetchedUser);
  }

  if (
    !isRecentSignup(
      user.created_at,
      Date.now(),
      options.maxAgeMs ?? MAX_SIGNUP_AGE_MS,
    )
  ) {
    console.info(
      "[telegram-signup] Pominięto powiadomienie - konto starsze niż limit:",
      user.id,
      user.created_at,
    );
    return {
      status: 202,
      body: { delivered: false, reason: "account is not recent" },
    };
  }

  const metadata = user.user_metadata ?? {};
  const schoolLevel =
    typeof metadata.school_level === "string"
      ? normalizeLearningPath(metadata.school_level)
      : null;
  const text = formatSignupNotification({
    nickname: readNick(metadata),
    email: user.email ?? "",
    schoolLevel,
    createdAt: user.created_at,
    emailConfirmed: Boolean(user.email_confirmed_at),
  });

  const failures: Array<{ adminId: string; error: string }> = [];
  let delivered = 0;

  for (const adminId of adminIds) {
    // Najpierw sprawdzamy, czy to powiadomienie już poszło. Wpis potwierdzenia
    // zapisujemy DOPIERO po udanej wysyłce: wcześniejszy "claim przed sendem"
    // zostawiał trwały wpis, gdy funkcję ucięło na limicie czasu - i cron
    // uznawał konto za powiadomione, mimo że wiadomość nigdy nie wyszła.
    if (!options.skipIdempotency && supabase) {
      const { data: alreadySent, error: checkError } = await supabase
        .from("signup_notification_deliveries")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("telegram_admin_id", adminId)
        .maybeSingle();

      if (checkError) {
        console.error(
          "[telegram-signup] Nie udało się sprawdzić idempotencji (wysyłam mimo to):",
          checkError,
        );
      } else if (alreadySent) {
        // Już wysłane wcześniej - nie duplikujemy.
        continue;
      }
    }

    const result = await sendTelegramMessage(botToken, adminId, text);
    if (!result.ok) {
      const description = describeTelegramFailure(
        result.status,
        result.description,
      );
      console.error(
        `[telegram-signup] Telegram delivery to ${adminId} failed: ${description}`,
      );
      failures.push({ adminId, error: description });
      continue;
    }

    delivered += 1;

    if (!options.skipIdempotency && supabase) {
      const { error: confirmError } = await supabase
        .from("signup_notification_deliveries")
        .insert({ user_id: user.id, telegram_admin_id: adminId });
      if (confirmError && confirmError.code !== "23505") {
        console.error(
          "[telegram-signup] Nie udało się zapisać potwierdzenia wysyłki:",
          confirmError,
        );
      }
    }
  }

  if (failures.length > 0) {
    return {
      status: 502,
      body: {
        error: "Could not deliver all signup notifications.",
        delivered,
        failures,
      },
    };
  }

  if (delivered > 0) {
    console.info(
      `[telegram-signup] Powiadomienie o koncie ${user.id} wysłane do ${delivered} administratora/ów.`,
    );
  }

  return {
    status: 200,
    body: { delivered: true, recipients: delivered },
  };
}