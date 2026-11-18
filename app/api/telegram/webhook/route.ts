import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import {
  describeTelegramCommandError,
  isTelegramAdmin,
  parseTelegramCommand,
} from "@/lib/telegram/admin-bot";
import { normalizeTelegramBotToken } from "@/lib/telegram/send";
import {
  findUserIdByIdentifier,
  grantProToUser,
} from "@/lib/subscription/grant-pro";
import { fetchSolvedStats } from "@/lib/supabase/solved-stats";

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
const DAY_MS = 24 * 60 * 60 * 1000;

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

const plNumber = new Intl.NumberFormat("pl-PL");

type SafeCount = { value: number | null; error: string | null };

/** Liczy wiersze tak, żeby jeden brakujący obiekt nie wywalał całej komendy. */
async function safeCount(
  query: PromiseLike<{
    count: number | null;
    error: { message: string } | null;
  }>,
): Promise<SafeCount> {
  try {
    const { count, error } = await query;
    if (error) return { value: null, error: error.message };
    return { value: count ?? 0, error: null };
  } catch (error) {
    return {
      value: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function formatCount(result: SafeCount, emptyLabel = "brak danych"): string {
  if (result.error || result.value === null) return emptyLabel;
  return plNumber.format(result.value);
}

const HELP_TEXT = [
  "Komendy administratora:",
  "/stats - użytkownicy, nowe konta i rozwiązane zadania",
  "/new - ostatnie rejestracje",
  "/users [strona] - użytkownicy z liczbą rozwiązanych zadań",
  "/top - ranking XP",
  "/solved - ile zadań zapisano w solved_tasks (diagnostyka)",
  "/pro <nick|email> [dni] [powód] - przyznaj Pro ręcznie",
  "/szybkaproba - statystyki szybkiej próby",
  "/visits [dni] - wejścia i unikalni odwiedzający",
  "/health - sprawdzenie połączenia",
  "/pomoc - pokaż tę listę",
].join("\n");

async function buildCommandReply(command: string, args: string[]): Promise<string> {
  if (command === "help") {
    return HELP_TEXT;
  }

  const supabase = getSupabaseAdmin();

  if (command === "stats") {
    // Najpierw RPC liczące auth.users (nie tylko profiles). To naprawia
    // przypadek, w którym nowe konto było w /users, ale /stats pokazywał 0.
    const platform = await supabase.rpc("get_platform_stats");
    const platformRow = (
      Array.isArray(platform.data) ? platform.data[0] : platform.data
    ) as
      | {
          users_total?: number | string;
          users_new_7d?: number | string;
          users_new_24h?: number | string;
          profiles_total?: number | string;
          solved_total?: number | string;
          solved_7d?: number | string;
          active_users_7d?: number | string;
        }
      | null
      | undefined;

    if (!platform.error && platformRow) {
      return [
        "Statystyki platformy",
        `Użytkownicy łącznie: ${plNumber.format(Number(platformRow.users_total ?? 0))}`,
        `Nowe konta (7 dni): ${plNumber.format(Number(platformRow.users_new_7d ?? 0))}`,
        `Nowe konta (24 h): ${plNumber.format(Number(platformRow.users_new_24h ?? 0))}`,
        `Profile: ${plNumber.format(Number(platformRow.profiles_total ?? 0))}`,
        `Rozwiązane zadania łącznie: ${plNumber.format(Number(platformRow.solved_total ?? 0))}`,
        `Rozwiązane zadania (7 dni): ${plNumber.format(Number(platformRow.solved_7d ?? 0))}`,
        `Aktywni uczniowie (7 dni): ${plNumber.format(Number(platformRow.active_users_7d ?? 0))}`,
      ].join("\n");
    }

    const since7 = new Date(Date.now() - 7 * DAY_MS).toISOString();
    const since7Ms = Date.parse(since7);
    let authUsersTotal = 0;
    let authUsersNew7 = 0;
    for (let page = 1; page <= 20; page += 1) {
      const { data: authPage, error: authError } =
        await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (authError || !authPage) break;
      authUsersTotal = authPage.total || authUsersTotal + authPage.users.length;
      for (const user of authPage.users) {
        const createdAt = Date.parse(user.created_at);
        if (Number.isFinite(createdAt) && createdAt >= since7Ms) {
          authUsersNew7 += 1;
        }
      }
      if (authPage.users.length < 1000) break;
    }

    const [users, newUsers, solvedTotal, solved7] = await Promise.all([
      safeCount(
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ),
      safeCount(
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7),
      ),
      safeCount(
        supabase
          .from("solved_tasks")
          .select("user_id", { count: "exact", head: true }),
      ),
      safeCount(
        supabase
          .from("solved_tasks")
          .select("user_id", { count: "exact", head: true })
          .gte("solved_at", since7),
      ),
    ]);

    if (users.error) {
      throw new Error(`Could not count profiles: ${users.error}`);
    }

    const lines = [
      "Statystyki platformy",
      `Użytkownicy łącznie: ${authUsersTotal || formatCount(users)}`,
      `Nowe konta (7 dni): ${authUsersNew7 || formatCount(newUsers)}`,
      `Rozwiązane zadania łącznie: ${formatCount(
        solvedTotal,
        "brak tabeli solved_tasks",
      )}`,
      `Rozwiązane zadania w 7 dni: ${formatCount(solved7)}`,
    ];

    const failedSolved = solvedTotal.error ?? solved7.error;
    if (failedSolved) {
      lines.push(
        "",
        describeTelegramCommandError(
          new Error(`solved_tasks: ${failedSolved}`),
        ),
      );
    }

    return lines.join("\n");
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

  if (command === "solved") {
    const stats = await fetchSolvedStats(supabase);
    if (stats.total === 0) {
      return [
        "Brak wierszy w solved_tasks.",
        "Zapisywane są tylko rozwiązania zalogowanych użytkowników.",
        "Gość zapisuje postęp lokalnie; po zalogowaniu historia jest dosyłana,",
        "ale tylko z tej przeglądarki.",
      ].join("\n");
    }

    const top = [...stats.perUser.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nick, nickname")
      .in("id", top.map(([id]) => id));
    const names = new Map(
      (profiles ?? []).map((profile) => [
        String(profile.id),
        String(profile.nick || profile.nickname || "bez nicku"),
      ]),
    );

    return [
      "Rozwiązane zadania (solved_tasks):",
      `Łącznie: ${plNumber.format(stats.total)}`,
      `Ostatnie 7 dni: ${plNumber.format(stats.last7)}`,
      `Uczniowie z rozwiązaniami: ${plNumber.format(stats.students)}`,
      "",
      "Top 10:",
      ...top.map(
        ([id, count], index) =>
          `${index + 1}. ${names.get(id) ?? "bez nicku"} - ${plNumber.format(count)}`,
      ),
      stats.truncated ? "Uwaga: agregacja ucięta do 200 000 wierszy." : "",
    ]
      .filter(Boolean)
      .join("\n");
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

    // Liczba rozwiązanych zadań per uczeń. Używamy tego samego agregatora co
    // panel admina (`fetchSolvedStats`), a nie `count` per uczeń - dzięki temu
    // /users i /admin/analityka pokazują dokładnie te same liczby.
    const requestedIds = data.users.map((user) => user.id);
    const solvedCounts = new Map<string, number>();
    let solvedCountError: string | null = null;
    let solvedTotalValue = 0;

    try {
      const stats = await fetchSolvedStats(supabase);
      solvedTotalValue = stats.total;
      for (const id of requestedIds) {
        solvedCounts.set(id, stats.perUser.get(id) ?? 0);
      }
    } catch (error) {
      solvedCountError =
        error instanceof Error ? error.message : String(error);
    }

    const solvedTotal = {
      value: solvedCountError ? null : solvedTotalValue,
      error: solvedCountError,
    };

    const firstUserNumber = (requestedPage - 1) * USERS_PER_PAGE + 1;
    const lines = [
      `Wszyscy użytkownicy - strona ${requestedPage}/${totalPages}`,
      `Wyświetlam ${firstUserNumber}–${firstUserNumber + data.users.length - 1} z ${totalUsers}:`,
      `Rozwiązane zadania łącznie: ${formatCount(
        solvedTotal,
        "brak tabeli solved_tasks",
      )}`,
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
          : user.email_confirmed_at
            ? "nigdy"
            : "nigdy (e-mail niepotwierdzony)";
        const xp = profileNames.get(user.id)?.xp ?? 0;
        const solved = solvedCounts.get(user.id);
        const solvedLabel =
          solved === undefined
            ? "zadania: ?"
            : `zadania: ${plNumber.format(solved)}`;
        return `${firstUserNumber + index}. ${name} · ${email} · ${solvedLabel} · ${xp} XP · rej. ${date} · log. ${lastLogin}`;
      }),
      data.nextPage !== null
        ? `Następna strona: /users ${requestedPage + 1}`
        : "To ostatnia strona.",
    ];

    if (solvedCountError) {
      lines.push(
        "",
        describeTelegramCommandError(new Error(`solved_tasks: ${solvedCountError}`)),
      );
    }

    return lines.join("\n");
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

  if (command === "pro") {
    const rawIdentifier = args[0]?.trim() ?? "";
    const identifier = rawIdentifier.replace(/^@/, "");
    if (!identifier) {
      return [
        "Użycie: /pro <nick|email> [dni] [powód]",
        "Przykład: /pro vlad 30 rekompensata za zgłoszenie błędu",
        "Domyślnie: 30 dni, źródło gift, bez subskrypcji Stripe.",
      ].join("\n");
    }

    const daysArg = args[1] && /^\d+$/.test(args[1]) ? Number(args[1]) : 30;
    const days = Math.max(1, Math.min(365, daysArg));
    const reason =
      (args[1] && /^\d+$/.test(args[1]) ? args.slice(2) : args.slice(1))
        .join(" ")
        .trim() || "rekompensata przyznana przez administratora";

    const found = await findUserIdByIdentifier(supabase, identifier);
    if (!found) {
      return `Nie znalazłem konta dla „${identifier}”. Podaj dokładny nick albo e-mail.`;
    }

    const grant = await grantProToUser(supabase, {
      ...found,
      days,
      reason,
    });

    if (grant.status === "skipped_paid") {
      return [
        `ℹ️ ${grant.nick}${grant.email ? ` (${grant.email})` : ""} ma aktywne płatne Pro Stripe.`,
        "Nie nadpisałem subskrypcji — gift nie jest potrzebny.",
      ].join("\n");
    }

    if (grant.status === "failed") {
      return `❌ Nie udało się przyznać Pro: ${grant.error}`;
    }

    if (grant.status === "not_found") {
      return `Nie znalazłem konta dla „${identifier}”.`;
    }

    const end = new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "long",
      timeZone: "Europe/Warsaw",
    }).format(new Date(grant.periodEnd));

    return [
      "✅ Pro przyznane",
      `Użytkownik: ${grant.nick}${grant.email ? ` (${grant.email})` : ""}`,
      `Okres: ${grant.days} dni (do ${end})`,
      `Źródło: gift (bez subskrypcji Stripe)`,
      `Powód: ${reason}`,
      grant.extended ? "Gift wydłużony od poprzedniej daty końca." : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (command === "health") {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    if (error) throw new Error(`Supabase health check failed: ${error.message}`);
    return "✅ Bot działa, połączenie z Supabase jest poprawne.";
  }

  return HELP_TEXT;
}

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const botToken = normalizeTelegramBotToken(process.env.TELEGRAM_BOT_TOKEN);
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
