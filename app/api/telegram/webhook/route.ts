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
const AUTH_USERS_PER_PAGE = 1000;

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

async function getAllAuthUsers(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PER_PAGE,
    });
    if (error) throw new Error(`Could not load registered users: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < AUTH_USERS_PER_PAGE) return users;
  }
}

async function getProfileNames(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userIds: string[],
) {
  if (userIds.length === 0) return new Map<string, string>();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nick, nickname")
    .in("id", userIds);
  if (error) throw new Error(`Could not load user profiles: ${error.message}`);
  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      profile.nick || profile.nickname || "",
    ]),
  );
}

function getAuthUserName(user: {
  id: string;
  user_metadata: Record<string, unknown>;
}, profileNames: Map<string, string>): string {
  const metadataName =
    typeof user.user_metadata.nick === "string"
      ? user.user_metadata.nick
      : typeof user.user_metadata.nickname === "string"
        ? user.user_metadata.nickname
        : "";
  return (profileNames.get(user.id) || metadataName || "bez nicku")
    .replace(/[\r\n]/g, " ")
    .slice(0, 80);
}

async function buildCommandReply(command: string, args: string[]): Promise<string> {
  if (command === "help") {
    return [
      "Komendy administratora:",
      "/stats — użytkownicy, nowe konta i zadania",
      "/new — ostatnie rejestracje",
      "/users [strona] — lista wszystkich użytkowników",
      "/visits [dni] — odsłony i unikalni odwiedzający",
      "/funnel [dni] — odwiedziny, rejestracje i pierwsze zadanie",
      "/top — ranking XP",
      "/health — sprawdzenie połączenia",
      "/pomoc — pokaż tę listę",
    ].join("\n");
  }

  const supabase = getSupabaseAdmin();

  if (command === "stats") {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const [users, authUsers, solved] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      getAllAuthUsers(supabase),
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
      `Nowe konta: ${authUsers.filter((user) => Date.parse(user.created_at) >= since).length}`,
      `Rozwiązane zadania: ${solved.count ?? 0}`,
    ].join("\n");
  }

  if (command === "visits") {
    const days = args[0] ? Number(args[0]) : 7;
    if (!Number.isSafeInteger(days) || days < 1 || days > 3650) {
      return "Podaj okres od 1 do 3650 dni, np. /visits 30.";
    }
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const [allTime, period, sources, hours] = await Promise.all([
      supabase.rpc("get_page_view_stats", { p_since: null }),
      supabase.rpc("get_page_view_stats", { p_since: since }),
      supabase.rpc("get_traffic_source_stats", { p_since: since }),
      supabase.rpc("get_visit_hour_stats", { p_since: since }),
    ]);
    if (allTime.error) throw new Error(`Could not load visit stats: ${allTime.error.message}`);
    if (period.error) throw new Error(`Could not load visit stats: ${period.error.message}`);
    if (sources.error) throw new Error(`Could not load traffic sources: ${sources.error.message}`);
    if (hours.error) throw new Error(`Could not load visit hours: ${hours.error.message}`);
    const totals = allTime.data?.[0];
    const recent = period.data?.[0];
    return [
      `Odwiedziny (ostatnie ${days} dni)`,
      `Odsłony: ${recent?.total_views ?? 0}`,
      `Unikalni odwiedzający: ${recent?.unique_visitors ?? 0}`,
      "Łącznie od uruchomienia licznika:",
      `Odsłony: ${totals?.total_views ?? 0}`,
      `Unikalni odwiedzający: ${totals?.unique_visitors ?? 0}`,
      "Źródła odwiedzin:",
      ...((sources.data ?? []).length
        ? sources.data.map(
            (source: {
              source: string;
              unique_visitors: number;
              views: number;
            }) => {
              const label = source.source.startsWith("utm:")
                ? `Kampania ${source.source.slice(4)}`
                : source.source.startsWith("referrer:")
                  ? source.source.slice(9)
                  : "Wejścia bezpośrednie";
              return `• ${label}: ${source.unique_visitors} osób / ${source.views} odsłon`;
            },
          )
        : ["• Brak danych o źródłach"]),
      "Najczęstsze godziny (czas polski):",
      ...((hours.data ?? []).length
        ? hours.data
            .slice()
            .sort(
              (
                first: { total_views: number },
                second: { total_views: number },
              ) => second.total_views - first.total_views,
            )
            .slice(0, 5)
            .map(
              (hour: {
                local_hour: number;
                total_views: number;
                unique_visitors: number;
              }) =>
                `• ${String(hour.local_hour).padStart(2, "0")}:00 — ${hour.total_views} odsłon / ${hour.unique_visitors} osób`,
            )
        : ["• Brak danych"]),
      "Pomiar anonimowy; działa od wdrożenia i tylko po zgodzie na analitykę.",
    ].join("\n");
  }

  if (command === "funnel") {
    const days = args[0] ? Number(args[0]) : 7;
    if (!Number.isSafeInteger(days) || days < 1 || days > 3650) {
      return "Podaj okres od 1 do 3650 dni, np. /funnel 30.";
    }
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const [funnelResult, sourcesResult] = await Promise.all([
      supabase.rpc("get_funnel_stats", { p_since: since }),
      supabase.rpc("get_source_funnel_stats", { p_since: since }),
    ]);
    if (funnelResult.error) {
      throw new Error(`Could not load conversion funnel: ${funnelResult.error.message}`);
    }
    if (sourcesResult.error) {
      throw new Error(`Could not load source funnel: ${sourcesResult.error.message}`);
    }
    const data = funnelResult.data;
    const funnel = data?.[0];
    if (!funnel) return "Brak danych lejka. Statystyki zaczną się zbierać po zgodzie na analitykę.";
    const visitors = Number(funnel.unique_visitors) || 0;
    const registrations = Number(funnel.registrations) || 0;
    const firstTaskSolvers = Number(funnel.first_task_solvers) || 0;
    const percentage = (count: number) =>
      visitors > 0 ? `${((count / visitors) * 100).toFixed(1)}% odwiedzających` : "brak odwiedzających";
    return [
      `Lejek (ostatnie ${days} dni)`,
      `Unikalni odwiedzający: ${visitors}`,
      `Odsłony: ${funnel.total_views ?? 0}`,
      `Sesje: ${funnel.sessions ?? 0}`,
      `Powracający: ${funnel.returning_visitors ?? 0}`,
      `Rejestracje: ${registrations} (${percentage(registrations)})`,
      `Rozwiązali pierwsze zadanie: ${firstTaskSolvers} (${percentage(firstTaskSolvers)})`,
      "Skuteczność źródeł UTM (odwiedzający / rejestracje / zadanie):",
      ...((sourcesResult.data ?? []).length
        ? sourcesResult.data.map(
            (source: {
              source: string;
              unique_visitors: number;
              registrations: number;
              first_task_solvers: number;
            }) =>
              `• ${source.source}: ${source.unique_visitors} / ${source.registrations} / ${source.first_task_solvers}`,
          )
        : ["• Brak oznaczonych wejść z kampanii UTM"]),
      "Dane liczone anonimowo, wyłącznie po zgodzie na analitykę.",
    ].join("\n");
  }

  if (command === "new") {
    const users = (await getAllAuthUsers(supabase))
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, 10);
    if (!users.length) return "Brak zarejestrowanych użytkowników.";
    const profileNames = await getProfileNames(
      supabase,
      users.map((user) => user.id),
    );
    return [
      "Ostatnie rejestracje:",
      ...users.map((user) => {
        const name = getAuthUserName(user, profileNames);
        const date = new Date(user.created_at).toLocaleDateString("pl-PL");
        return `• ${name} — ${date}`;
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
      `Wszyscy użytkownicy — strona ${requestedPage}/${totalPages}`,
      `Wyświetlam ${firstUserNumber}–${firstUserNumber + data.users.length - 1} z ${totalUsers}:`,
      ...data.users.map((user, index) => {
        const name = getAuthUserName(user, profileNames);
        const date = new Date(user.created_at).toLocaleDateString("pl-PL");
        return `${firstUserNumber + index}. ${name} — ${date}`;
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
    "/users [strona] — lista wszystkich użytkowników",
    "/visits [dni] — odsłony i unikalni odwiedzający",
    "/funnel [dni] — odwiedziny, rejestracje i pierwsze zadanie",
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
