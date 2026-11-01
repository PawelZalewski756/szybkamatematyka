import { createClient } from "@supabase/supabase-js";
import {
  parseTelegramAdminIds,
} from "@/lib/telegram/admin-bot";
import {
  formatSignupNotification,
  isRecentSignup,
} from "@/lib/telegram/signup-notification";
import { normalizeLearningPath } from "@/lib/learning-path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIGNUP_AGE_MS = 10 * 60 * 1000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
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
  const result = (await response.json()) as { ok?: boolean };
  if (!response.ok || result.ok !== true) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}.`);
  }
}

export async function POST(request: Request): Promise<Response> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const adminIds = parseTelegramAdminIds(
    process.env.TELEGRAM_ADMIN_IDS || process.env.ADMIN_TELEGRAM_ID,
  );
  const supabase = getAdminSupabase();

  if (!botToken || adminIds.size === 0 || !supabase) {
    return Response.json(
      { error: "Signup notifications are not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const userId =
    typeof payload === "object" &&
    payload !== null &&
    "userId" in payload &&
    typeof payload.userId === "string"
      ? payload.userId
      : "";
  if (!UUID_PATTERN.test(userId)) {
    return Response.json({ error: "Invalid user ID." }, { status: 400 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.admin.getUserById(userId);
  if (userError) {
    console.error("[telegram-signup] Could not verify new account:", userError);
    return Response.json(
      { error: "Could not verify the new account." },
      { status: 502 },
    );
  }
  if (!user) {
    return Response.json({ error: "Account not found." }, { status: 404 });
  }
  if (!isRecentSignup(user.created_at, Date.now(), MAX_SIGNUP_AGE_MS)) {
    return Response.json(
      { delivered: false, reason: "account is not recent" },
      { status: 202 },
    );
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
    if (claimError) {
      console.error("[telegram-signup] Could not claim notification delivery:", claimError);
      return Response.json(
        { error: "Could not record notification delivery." },
        { status: 503 },
      );
    }

    try {
      await sendTelegramMessage(botToken, adminId, text);
    } catch (error) {
      console.error("[telegram-signup] Telegram delivery failed:", error);
      failures.push(adminId);

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

  if (failures.length > 0) {
    return Response.json(
      { error: "Could not deliver all signup notifications." },
      { status: 502 },
    );
  }

  return Response.json(
    { delivered: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
