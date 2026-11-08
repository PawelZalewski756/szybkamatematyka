import { calculateLevel } from "@/lib/levelSystem";
import { getSupabase } from "@/lib/supabase";
import { isPostgrestUndefinedColumnError } from "@/lib/supabase/errors";
import type { PostgrestError } from "@supabase/supabase-js";

export type LeaderboardTab = "all" | "minigry" | "pojedynki";

export type LeaderboardEntry = {
  rank: number;
  id: string;
  nick: string;
  /** Wartość wyświetlana/sortująca dla danej zakładki (XP lub rating pojedynków). */
  xp: number;
  level: number;
  avatarUrl: string | null;
  /** Dodatkowy wiersz opisu (np. „12 wygr. · 80%" dla zakładki Pojedynki). */
  subtitle?: string;
};

type LeaderboardRow = {
  id: string;
  nick?: string | null;
  nickname?: string | null;
  xp?: number | null;
  minigry_xp?: number | null;
  level?: number | null;
  avatar_url?: string | null;
  duel_rating?: number | null;
  duel_wins?: number | null;
  duel_played?: number | null;
};

const LEADERBOARD_SELECT =
  "id, nick, nickname, xp, minigry_xp, level, avatar_url";

const LEADERBOARD_SELECT_FALLBACK =
  "id, nick, nickname, xp, level, avatar_url";

// Zakładka „Pojedynki": potrzebujemy globalnego xp (do poziomu konta),
// ratingu (sortowanie/wyświetlanie) oraz wygranych/rozegranych (opis).
const LEADERBOARD_SELECT_DUEL =
  "id, nick, nickname, xp, level, avatar_url, duel_rating, duel_wins, duel_played";

function readNick(row: LeaderboardRow): string {
  return (row.nick ?? row.nickname ?? "").trim() || "Użytkownik";
}

function scoreForTab(row: LeaderboardRow, tab: LeaderboardTab): number {
  if (tab === "pojedynki") {
    return Number(row.duel_rating) || 0;
  }
  if (tab === "minigry") {
    return Number(row.minigry_xp) || 0;
  }
  return Number(row.xp) || 0;
}

function duelSubtitle(row: LeaderboardRow): string {
  const wins = Number(row.duel_wins) || 0;
  const played = Number(row.duel_played) || 0;
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;
  return `${wins} wygr. · ${winRate}%`;
}

function mapEntry(
  row: LeaderboardRow,
  rank: number,
  tab: LeaderboardTab,
): LeaderboardEntry {
  const xp = scoreForTab(row, tab);
  // Poziom: dla „all"/„minigry" liczony z prezentowanej wartości (xp/minigry_xp),
  // dla „pojedynki" z globalnego xp konta (rating nie jest XP, więc poziom
  // pokazujemy jako realny poziom gracza, nie wyliczony z ratingu).
  const level =
    tab === "pojedynki" ? calculateLevel(Number(row.xp) || 0) : calculateLevel(xp);
  return {
    rank,
    id: row.id,
    nick: readNick(row),
    xp,
    level,
    avatarUrl: row.avatar_url?.trim() || null,
    ...(tab === "pojedynki" ? { subtitle: duelSubtitle(row) } : {}),
  };
}

function orderColumn(tab: LeaderboardTab): string {
  if (tab === "pojedynki") return "duel_rating";
  return tab === "minigry" ? "minigry_xp" : "xp";
}

function selectForTab(tab: LeaderboardTab): string {
  return tab === "pojedynki" ? LEADERBOARD_SELECT_DUEL : LEADERBOARD_SELECT;
}

async function fetchLeaderboardRows(
  limit: number,
  tab: LeaderboardTab,
): Promise<LeaderboardRow[]> {
  const supabase = getSupabase();
  const column = orderColumn(tab);

  const full = await supabase
    .from("profiles")
    .select(selectForTab(tab))
    .gt(column, 0)
    .order(column, { ascending: false })
    .limit(limit)
    .retry(false);

  let rows: LeaderboardRow[] | null =
    (full.data as unknown as LeaderboardRow[]) ?? null;
  let error = full.error as PostgrestError | null;

  // Zakładka „Pojedynki": gdy migracja duel jeszcze nie uruchomiona (brak kolumn
  // duel_*), ranking jest po prostu pusty — NIE wpadamy w fallback do xp, by nie
  // pokazać błędnie posortowanej listy.
  if (tab === "pojedynki") {
    if (error) {
      if (isPostgrestUndefinedColumnError(error)) return [];
      throw error;
    }
    return rows ?? [];
  }

  if (
    error &&
    tab === "minigry" &&
    isPostgrestUndefinedColumnError(error, "minigry_xp")
  ) {
    const fallback = await supabase
      .from("profiles")
      .select(LEADERBOARD_SELECT_FALLBACK)
      .gt("xp", 0)
      .order("xp", { ascending: false })
      .limit(limit)
      .retry(false);
    rows = (fallback.data as LeaderboardRow[]) ?? null;
    error = fallback.error as PostgrestError | null;
  } else if (error && isPostgrestUndefinedColumnError(error)) {
    const fallback = await supabase
      .from("profiles")
      .select(LEADERBOARD_SELECT_FALLBACK)
      .gt("xp", 0)
      .order("xp", { ascending: false })
      .limit(limit)
      .retry(false);
    rows = (fallback.data as LeaderboardRow[]) ?? null;
    error = fallback.error as PostgrestError | null;
  }

  if (error) throw error;
  return rows ?? [];
}

export async function fetchTopLeaderboard(
  limit = 20,
  tab: LeaderboardTab = "all",
): Promise<LeaderboardEntry[]> {
  const rows = await fetchLeaderboardRows(limit, tab);
  return rows.map((row, index) => mapEntry(row, index + 1, tab));
}

export type MyLeaderboardRank = {
  rank: number;
  entry: LeaderboardEntry;
  inTop20: boolean;
};

export async function fetchMyLeaderboardRank(
  userId: string,
  topLimit = 20,
  tab: LeaderboardTab = "all",
): Promise<MyLeaderboardRank | null> {
  const supabase = getSupabase();

  const full = await supabase
    .from("profiles")
    .select(selectForTab(tab))
    .eq("id", userId)
    .maybeSingle()
    .retry(false);

  let me: LeaderboardRow | null =
    (full.data as unknown as LeaderboardRow) ?? null;
  let meError = full.error as PostgrestError | null;

  // Pojedynki: brak kolumn duel_* (migracja nieuruchomiona) → brak pozycji.
  if (tab === "pojedynki") {
    if (meError) {
      if (isPostgrestUndefinedColumnError(meError)) return null;
      throw meError;
    }
    if (!me) return null;

    const myScore = scoreForTab(me, tab);
    if (myScore <= 0) return null;
    const { count, error: countError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("duel_rating", myScore)
      .retry(false);

    if (countError) {
      if (isPostgrestUndefinedColumnError(countError)) return null;
      throw countError;
    }

    const rank = (count ?? 0) + 1;
    const entry = mapEntry(me, rank, tab);
    return { rank, entry, inTop20: rank <= topLimit };
  }

  if (meError && isPostgrestUndefinedColumnError(meError)) {
    const fallback = await supabase
      .from("profiles")
      .select(LEADERBOARD_SELECT_FALLBACK)
      .eq("id", userId)
      .maybeSingle()
      .retry(false);
    me = (fallback.data as LeaderboardRow) ?? null;
    meError = fallback.error as PostgrestError | null;
  }

  if (meError) throw meError;
  if (!me) return null;

  const myScore = scoreForTab(me, tab);
  if (myScore <= 0) return null;
  const column = orderColumn(tab);

  const { count, error: countError } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gt(column, myScore)
    .retry(false);

  if (
    countError &&
    tab === "minigry" &&
    isPostgrestUndefinedColumnError(countError, "minigry_xp")
  ) {
    const fallbackCount = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("xp", myScore)
      .retry(false);
    if (fallbackCount.error) throw fallbackCount.error;
    const rank = (fallbackCount.count ?? 0) + 1;
    const entry = mapEntry(me, rank, tab);
    return { rank, entry, inTop20: rank <= topLimit };
  }

  if (countError) throw countError;

  const rank = (count ?? 0) + 1;
  const entry = mapEntry(me, rank, tab);
  const inTop20 = rank <= topLimit;

  return { rank, entry, inTop20 };
}
