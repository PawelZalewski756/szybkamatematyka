import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import {
  countUsersCreatedSince,
  listAllAuthUsers,
  paginateUsers,
  sortUsersByCreatedAtDesc,
} from "@/lib/telegram/admin-users";
import {
  describeTelegramCommandError,
  isTelegramAdmin,
  parseTelegramAdminIds,
  parseTelegramCommand,
} from "@/lib/telegram/admin-bot";
import { reconcileSignupNotifications } from "@/lib/telegram/signup-delivery";

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
    signal: AbortSignal.timeout(8_000),
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
  let { data, error } = (await supabase
    .from("profiles")
    .select("id, nick, nickname, xp, last_played_date, last_seen_at")
    .in("id", userIds)) as { data: Record<string, unknown>[] | null; error: { message: string } | null };
  if (error) {
    // migracja last_seen_at może nie być jeszcze uruchomiona
    ({ data, error } = (await supabase
      .from("profiles")
      .select("id, nick, nickname, xp, last_played_date")
      .in("id", userIds)) as { data: Record<string, unknown>[] | null; error: { message: string } | null });
  }
  if (error) throw new Error(`Could not load user profiles: ${error.message}`);
  return new Map(
    (data ?? []).map((profile) => [
      String(profile.id),
      {
        name: String(profile.nick || profile.nickname || ""),
        xp: Number(profile.xp) || 0,
        lastPlayed: [profile.last_seen_at, profile.last_played_date]
          .filter(Boolean)
          .map(String)
          .sort()
          .pop() ?? '',
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
      "/visits [dni] - wejścia i unikalni odwiedzający",
      "/health - sprawdzenie połączenia",
      "/pomoc - pokaż tę listę",
    ].join("\n");
  }

  const supabase = getSupabaseAdmin();

  if (command === "stats") {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const authUsers = await listAllAuthUsers(supabase);
    const newUsers = countUsersCreatedSince(authUsers.users, since);
    const [profiles, solved] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("solved_tasks")
        .select("task_id", { count: "exact", head: true })
        .gte("solved_at", new Date(since).toISOString()),
    ]);
    if (profiles.error) {
      throw new Error(`Could not count profiles: ${profiles.error.message}`);
    }
    if (solved.error) throw new Error(`Could not count solved tasks: ${solved.error.message}`);
    return [
      "Statystyki (ostatnie 7 dni)",
      `Konta (Auth): ${authUsers.total}`,
      `Profile w bazie: ${profiles.count ?? 0}`,
      `Nowe konta: ${newUsers}`,
      `Rozwiązane zadania (trening): ${solved.count ?? 0}`,
      "Baza zadań: postęp jest zapisany lokalnie w przeglądarce, poza Supabase.",
      ...(authUsers.truncated
        ? ["Uwaga: lista kont jest obcięta do 20 000 użytkowników."]
        : []),
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

  if (command === "reconcile") {
    const result = await reconcileSignupNotifications(24);
    return [
      "Odratnianie powiadomień (24 h)",
      `Sprawdzone konta: ${result.scanned}`,
      `Wysłane: ${result.delivered}`,
      `Pominięte: ${result.skipped}`,
      `Błędy: ${result.failed}`,
      ...result.errors.slice(0, 3),
    ].join("\n");
  }

  if (command === "new") {
    const authUsers = await listAllAuthUsers(supabase);
    const recent = sortUsersByCreatedAtDesc(authUsers.users).slice(0, 10);
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
      ...(authUsers.truncated
        ? ["Uwaga: lista kont jest obcięta do 20 000 użytkowników."]
        : []),
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

    const authUsers = await listAllAuthUsers(supabase);
    const pageData = paginateUsers(
      sortUsersByCreatedAtDesc(authUsers.users),
      requestedPage,
      USERS_PER_PAGE,
    );
    if (requestedPage > pageData.totalPages) {
      return `Nie ma takiej strony. Ostatnia strona: ${pageData.totalPages}.`;
    }
    if (!pageData.users.length) {
      return "Brak zarejestrowanych użytkowników.";
    }

    const profileNames = await getProfileNames(
      supabase,
      pageData.users.map((user) => user.id),
    );
    const firstUserNumber = (pageData.page - 1) * USERS_PER_PAGE + 1;
    return [
      `Wszyscy użytkownicy - strona ${pageData.page}/${pageData.totalPages}`,
      `Wyświetlam ${firstUserNumber}–${firstUserNumber + pageData.users.length - 1} z ${pageData.total}:`,
      ...pageData.users.map((user, index) => {
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
          : user.email_confirmed_at
            ? "nigdy"
            : "nigdy (e-mail niepotwierdzony)";
        const xp = profileNames.get(user.id)?.xp ?? 0;
        return `${firstUserNumber + index}. ${name} · ${email} · ${xp} XP · rej. ${date} · log. ${lastLogin}`;
      }),
      pageData.page < pageData.totalPages
        ? `Następna strona: /users ${pageData.page + 1}`
        : "To ostatnia strona.",
      ...(authUsers.truncated
        ? ["Uwaga: lista kont jest obcięta do 20 000 użytkowników."]
        : []),
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

  if (command === "visits") {
    const days = args[0] ? Number(args[0]) : 7;
    if (!Number.isSafeInteger(days) || days < 1 || days > 3650) {
      return "Podaj okres od 1 do 3650 dni, np. /visits 30.";
    }
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const [allTime, period] = await Promise.all([
      supabase.rpc("get_page_view_stats", { p_since: null }),
      supabase.rpc("get_page_view_stats", { p_since: since }),
    ]);
    if (allTime.error) throw new Error(`Could not load visit stats: ${allTime.error.message}`);
    if (period.error) throw new Error(`Could not load visit stats: ${period.error.message}`);
    const total = allTime.data?.[0];
    const recent = period.data?.[0];
    return [
      `Wejścia (ostatnie ${days} dni)`,
      `Unikalni odwiedzający: ${recent?.unique_visitors ?? 0}`,
      `Wejścia: ${recent?.total_views ?? 0}`,
      "Łącznie:",
      `Unikalni odwiedzający: ${total?.unique_visitors ?? 0}`,
      `Wejścia: ${total?.total_views ?? 0}`,
      "Liczone anonimowo, tylko za zgodą odwiedzającego.",
    ].join("\n");
  }

  if (command === "health") {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) throw new Error(`Supabase health check failed: ${error.message}`);

    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const adminIds = parseTelegramAdminIds(
      process.env.TELEGRAM_ADMIN_IDS || process.env.ADMIN_TELEGRAM_ID,
    );
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
      process.env.SUPABASE_URL?.trim() ||
      "";
    let supabaseHost = "brak";
    try {
      supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "brak";
    } catch {
      supabaseHost = "nieprawidłowy URL";
    }
    const profiles = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });
    const auth = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    const lines = [
      "✅ Bot odpowiada, Supabase działa.",
      `Supabase: ${supabaseHost}`,
      `Konta Auth: ${
        auth.error ? `błąd (${auth.error.message})` : auth.data.total
      }`,
      `Profile w bazie: ${profiles.count ?? 0}`,
      `Administratorzy: ${adminIds.size}${
        adminIds.size > 0 ? ` (${[...adminIds].join(", ")})` : ""
      }`,
      `TELEGRAM_BOT_TOKEN: ${token ? "jest" : "brak"}`,
      `SUPABASE_SERVICE_ROLE_KEY: ${
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ? "jest" : "brak"
      }`,
    ];

    if (token) {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/getWebhookInfo`,
        { cache: "no-store", signal: AbortSignal.timeout(8_000) },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        result?: {
          url?: string;
          pending_update_count?: number;
          last_error_message?: string;
        };
      };
      if (payload.ok && payload.result) {
        lines.push(`Webhook: ${payload.result.url || "brak"}`);
        lines.push(
          `Oczekujące aktualizacje: ${payload.result.pending_update_count ?? 0}`,
        );
        if (payload.result.last_error_message) {
          lines.push(
            `Ostatni błąd webhooka: ${payload.result.last_error_message.slice(0, 200)}`,
          );
        }
        if (!payload.result.url) {
          lines.push(
            "Webhook nie jest ustawiony. Uruchom POST /api/telegram/setup.",
          );
        }
      } else {
        lines.push("Nie udało się pobrać getWebhookInfo.");
      }
    }

    return lines.join("\n");
  }

  return [
    "Komendy administratora:",
    "/stats - użytkownicy, nowe konta i zadania",
    "/new - ostatnie rejestracje",
    "/reconcile - wyślij brakujące powiadomienia o rejestracjach",
    "/users [strona] - lista wszystkich użytkowników",
    "/top - ranking XP",
    "/szybkaproba - statystyki szybkiej próby",
    "/visits [dni] - wejścia i unikalni odwiedzający",
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
