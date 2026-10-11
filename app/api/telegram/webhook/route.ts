import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import {
  describeTelegramCommandError,
  escapeTelegramText,
  isTelegramAdmin,
  parseTelegramCommand,
} from "@/lib/telegram/admin-bot";

export const runtime = "nodejs";

type TelegramUpdate = {
  message?: {
    chat?: { id?: number; type?: string };
    date?: number;
    from?: { id?: number };
    text?: string;
  };
};

function matchesSecret(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Telegram sendMessage failed with status ${response.status}.`);
  }
  const result = (await response.json()) as { ok?: boolean };
  if (!result.ok) throw new Error("Telegram sendMessage returned an error.");
}

function getSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase server configuration for Telegram bot.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function buildCommandReply(command: string): Promise<string> {
  if (command === "help") {
    return [
      "Komendy administratora:",
      "/stats — użytkownicy, nowe konta i zadania",
      "/new — ostatnie rejestracje",
      "/top — ranking XP",
      "/health — sprawdzenie połączenia",
      "/pomoc — pokaż tę listę",
    ].join("\n");
  }

  const supabase = getSupabaseAdmin();

  if (command === "stats") {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [users, newUsers, solved] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabase
        .from("solved_tasks")
        .select("task_id", { count: "exact", head: true })
        .gte("solved_at", since),
    ]);
    const error = users.error || newUsers.error || solved.error;
    if (error) throw new Error(`Could not load bot stats: ${error.message}`);
    return [
      "Statystyki (ostatnie 7 dni)",
      `Użytkownicy łącznie: ${users.count ?? 0}`,
      `Nowe konta: ${newUsers.count ?? 0}`,
      `Rozwiązane zadania: ${solved.count ?? 0}`,
    ].join("\n");
  }

  if (command === "new" || command === "users") {
    const { data, error } = await supabase
      .from("profiles")
      .select("nick, nickname, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(`Could not load recent users: ${error.message}`);
    if (!data?.length) return "Brak zarejestrowanych użytkowników.";
    return [
      "Ostatnie rejestracje:",
      ...data.map((user) => {
        const name = escapeTelegramText(user.nick || user.nickname || "bez nicku");
        const date = new Date(user.created_at).toLocaleDateString("pl-PL");
        return `• ${name} — ${date}`;
      }),
    ].join("\n");
  }

  if (command === "top") {
    const { data, error } = await supabase
      .from("profiles")
      .select("nick, nickname, xp")
      .order("xp", { ascending: false })
      .limit(10);
    if (error) throw new Error(`Could not load leaderboard: ${error.message}`);
    if (!data?.length) return "Brak danych rankingu.";
    return [
      "Ranking XP:",
      ...data.map((user, index) => {
        const name = escapeTelegramText(user.nick || user.nickname || "bez nicku");
        return `${index + 1}. ${name} — ${user.xp ?? 0} XP`;
      }),
    ].join("\n");
  }

  if (command === "health") {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) throw new Error(`Supabase health check failed: ${error.message}`);
    return "✅ Bot działa, połączenie z Supabase jest poprawne.";
  }

  return [
    "Komendy administratora:",
    "/stats — użytkownicy, nowe konta i zadania",
    "/new — ostatnie rejestracje",
    "/top — ranking XP",
    "/health — sprawdzenie połączenia",
    "/pomoc — pokaż tę listę",
  ].join("\n");
}

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!webhookSecret || !botToken) {
    return Response.json({ error: "Telegram bot is not configured." }, { status: 503 });
  }

  if (
    !matchesSecret(
      request.headers.get("x-telegram-bot-api-secret-token"),
      webhookSecret,
    )
  ) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return Response.json({ error: "Invalid update." }, { status: 400 });
  }

  const message = update.message;
  const senderId = message?.from?.id;
  const chatId = message?.chat?.id;
  if (
    !message ||
    message.chat?.type !== "private" ||
    typeof senderId !== "number" ||
    typeof chatId !== "number" ||
    senderId !== chatId ||
    !isTelegramAdmin(
      senderId,
      process.env.TELEGRAM_ADMIN_IDS,
      process.env.ADMIN_TELEGRAM_ID,
    )
  ) {
    return Response.json({ ok: true });
  }

  const command = parseTelegramCommand(message.text ?? "");
  if (!command) return Response.json({ ok: true });

  try {
    const reply = await buildCommandReply(command.name);
    await sendTelegramMessage(botToken, chatId, reply);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Telegram admin command failed:", error);
    await sendTelegramMessage(
      botToken,
      chatId,
      describeTelegramCommandError(error),
    );
    return Response.json({ ok: true });
  }
}
