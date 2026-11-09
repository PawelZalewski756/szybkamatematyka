import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import {
  describeTelegramCommandError,
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

const USERS_PER_PAGE = 20;

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

async function getProfileNames(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userIds: string[],
) {
  if (userIds.length === 0) return new Map<string, { name: string; xp: number; lastPlayed: string }>();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nick, nickname, xp, last_played_date")
    .in("id", userIds);
  if (error) throw new Error(`Could not load user profiles: ${error.message}`);
  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      {
        name: profile.nick || profile.nickname || "",
        xp: Number(profile.xp) || 0,
        lastPlayed: profile.last_played_date ? String(profile.last_played_date) : '',
      },
    ]),
  );
}

function getAuthUserName(
  user: { id: string; user_metadata: Record<string, unknown> },
  profileNames: Map<string, { name: string; xp: number; lastPlayed: string }>,
): string {
  const metadataName =
    typeof user.user_metadata.nick === "string"
      ? user.user_metadata.nick
      : typeof user.user_metadata.nickname === "string"
        ? user.user_metadata.nickname
        : "";
  return (profileNames.get(user.id)?.name || metadataName || "bez nicku")
    .replace(/[\r\n]/g, " ")
    .slice(0, 80);
}

async function buildCommandReply(command: string, args: string[]): Promise<string> {
  if (command === "help") {
    return [
      "Komendy administratora:",
      "/stats - użytkownicy, nowe konta i zadania",
      "/new - ostatnie rejestracje",
      "/users [strona] - lista wszystkich użytkowników",
      "/top - ranking XP",
      "/szybkaproba - statystyki szybkiej próby",
      "/health - sprawdzenie połączenia",
      "/pomoc - pokaż tę listę",
    ].join("\n");
  }

  const supabase = getSupabaseAdmin();

  if (command === "stats") {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const [users, newUsers, solved] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(since).toISOString()),
      supabase
        .from("solved_tasks")
        .select("task_id", { count: "exact", head: true })
        .gte("solved_at", new Date(since).toISOString()),
    ]);
    if (users.error) throw new Error(`Could not count profiles: ${users.error.message}`);
    if (solved.error) throw new Error(`Could not count solved tasks: ${solved.error.message}`);
    return [
      "Statystyki (ostatnie 7 dni)",
      `Użytkownicy łącznie: ${users.count ?? 0}`,
      `Nowe konta: ${newUsers.count ?? 0}`,
      `Rozwiązane zadania: ${solved.count ?? 0}`,
    ].join("\n");
  }

  if (command === "szybkaproba") {
    const { data, error } = await supabase.rpc("get_quick_trial_stats");
    if (error) {
      throw new Error(`Could not load quick trial stats: ${error.message}`);
    }

    const stats = data?.[0];
    if (!stats) return "Brak zarejestrowanych odpowiedzi.";
    return [
      "Szybka próba - łącznie",
      `Sesje z odpowiedzią: ${stats.unique_sessions}`,
      `Wszystkie próby: ${stats.total_attempts}`,
      `Poprawne odpowiedzi: ${stats.correct_attempts}`,
      `Błędne odpowiedzi: ${stats.incorrect_attempts}`,
    ].join("\n");
  }

  if (command === "new") {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) throw new Error(`Could not load recent users: ${error.message}`);
    const recent = [...data.users]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10);
    if (!recent.length) return "Brak zarejestrowanych użytkowników.";
    const profileNames = await getProfileNames(
      supabase,
      recent.map((user) => user.id),
    );
    return [
      "Ostatnie rejestracje:",
      ...recent.map((user) => {
        const name = getAuthUserName(user, profileNames);
        const date = new Date(user.created_at).toLocaleDateString("pl-PL");
        return `• ${name} - ${date}`;
      }),
    ].join("\n");
  }

  if (command === "users") {
    const requestedPage = args[0] ? Number(args[0]) : 1;
    if (
      !Number.isSafeInteger(requestedPage) ||
      requestedPage < 1 ||
      requestedPage - 1 > Math.floor(Number.MAX_SAFE_INTEGER / USERS_PER_PAGE)
    ) {
      return "Podaj numer strony, np. /users 2.";
    }

    const { data, error } = await supabase.auth.admin.listUsers({
      page: requestedPage,
      perPage: USERS_PER_PAGE,
    });
    if (error) throw new Error(`Could not load users: ${error.message}`);
    if (!data.users.length) {
      return requestedPage === 1
        ? "Brak zarejestrowanych użytkowników."
        : "Nie ma takiej strony.";
    }

    const profileNames = await getProfileNames(
      supabase,
      data.users.map((user) => user.id),
    );
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    if (countError) throw new Error(`Could not count profiles: ${countError.message}`);
    const totalUsers = data.total || count || data.users.length;
    const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));

    const firstUserNumber = (requestedPage - 1) * USERS_PER_PAGE + 1;
    return [
      `Wszyscy użytkownicy - strona ${requestedPage}/${totalPages}`,
      `Wyświetlam ${firstUserNumber}–${firstUserNumber + data.users.length - 1} z ${totalUsers}:`,
      ...data.users.map((user, index) => {
        const name = getAuthUserName(user, profileNames);
        const date = new Date(user.created_at).toLocaleDateString("pl-PL");
        const email = (user.email || "brak e-maila")
          .replace(/[\r\n]/g, " ")
          .slice(0, 60);
        const lastActive = [user.last_sign_in_at, profileNames.get(user.id)?.lastPlayed]
          .filter((v): v is string => Boolean(v))
          .map((v) => new Date(v))
          .filter((d) => !Number.isNaN(d.getTime()))
          .sort((a, b) => b.getTime() - a.getTime())[0];
        const lastLogin = lastActive
          ? lastActive.toLocaleDateString("pl-PL")
          : "nigdy";
        const xp = profileNames.get(user.id)?.xp ?? 0;
        return `${firstUserNumber + index}. ${name} · ${email} · ${xp} XP · rej. ${date} · log. ${lastLogin}`;
      }),
      data.nextPage !== null
        ? `Następna strona: /users ${requestedPage + 1}`
        : "To ostatnia strona.",
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
        const name = (user.nick || user.nickname || "bez nicku")
          .replace(/[\r\n]/g, " ")
          .slice(0, 80);
        return `${index + 1}. ${name} - ${user.xp ?? 0} XP`;
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
    "/stats - użytkownicy, nowe konta i zadania",
    "/new - ostatnie rejestracje",
    "/users [strona] - lista wszystkich użytkowników",
    "/top - ranking XP",
    "/szybkaproba - statystyki szybkiej próby",
    "/health - sprawdzenie połączenia",
    "/pomoc - pokaż tę listę",
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
    const reply = await buildCommandReply(command.name, command.args);
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
