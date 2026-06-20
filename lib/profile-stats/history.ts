/**
 * Lekki tracker dziennej aktywności w localStorage — additywny, bez Supabase.
 * Zapisuje migawkę przy wizycie profilu / aktywności; wykres korzysta też z
 * profiles.last_played_date jako dodatkowego sygnału.
 */

import { todayDateString } from "@/lib/supabase/profiles";

const STORAGE_PREFIX = "szybka-matma-profile-activity";
const MAX_STORED_DAYS = 60;

export type StoredActivityDay = {
  date: string;
  active: boolean;
  solvedCount: number;
  xp: number;
};

type ActivityStore = {
  days: Record<string, StoredActivityDay>;
};

function storageKey(userId: string | null): string {
  return userId
    ? `${STORAGE_PREFIX}:${userId}`
    : `${STORAGE_PREFIX}:guest`;
}

function loadStore(userId: string | null): ActivityStore {
  if (typeof window === "undefined") return { days: {} };
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { days: {} };
    const parsed = JSON.parse(raw) as ActivityStore;
    if (!parsed?.days || typeof parsed.days !== "object") return { days: {} };
    return { days: parsed.days };
  } catch {
    return { days: {} };
  }
}

function saveStore(userId: string | null, store: ActivityStore): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = trimOldDays(store.days);
    localStorage.setItem(storageKey(userId), JSON.stringify({ days: trimmed }));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Usuwa wpisy starsze niż MAX_STORED_DAYS względem dziś. */
export function trimOldDays(
  days: Record<string, StoredActivityDay>,
  today: string = todayDateString(),
): Record<string, StoredActivityDay> {
  const cutoff = new Date(`${today}T12:00:00`);
  cutoff.setDate(cutoff.getDate() - MAX_STORED_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const next: Record<string, StoredActivityDay> = {};
  for (const [date, entry] of Object.entries(days)) {
    if (date >= cutoffStr) next[date] = entry;
  }
  return next;
}

/** Zwraca daty YYYY-MM-DD dla ostatnich `count` dni (włącznie z dziś). */
export function dateStringsForLastDays(
  count: number,
  today: string = todayDateString(),
): string[] {
  const result: string[] = [];
  const end = new Date(`${today}T12:00:00`);
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

const DAY_LABELS = ["nd.", "pn.", "wt.", "śr.", "cz.", "pt.", "sb."];

/** Krótka etykieta osi X dla wykresu. */
export function shortDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const weekday = DAY_LABELS[d.getDay()] ?? "";
  return `${weekday} ${day}.${month}`;
}

export type ActivityPointInput = {
  date: string;
  active: boolean;
  label: string;
};

/**
 * Buduje serię aktywności dla wykresu. Dzień uznajemy za aktywny, gdy
 * zapis w localStorage ma active=true LUB date === lastPlayedDate z profilu.
 */
export function buildActivitySeries(
  storedDays: Record<string, StoredActivityDay>,
  lastPlayedDate: string | null,
  dayCount: number,
  today: string = todayDateString(),
): ActivityPointInput[] {
  const dates = dateStringsForLastDays(dayCount, today);
  return dates.map((date) => {
    const stored = storedDays[date];
    const active = Boolean(stored?.active) || date === lastPlayedDate;
    return { date, active, label: shortDayLabel(date) };
  });
}

/** Czy jakikolwiek dzień w serii jest aktywny lub istnieje zapis w store. */
export function hasAnyActivityData(
  storedDays: Record<string, StoredActivityDay>,
  lastPlayedDate: string | null,
  dayCount: number,
  today: string = todayDateString(),
): boolean {
  if (lastPlayedDate) return true;
  const dates = dateStringsForLastDays(dayCount, today);
  return dates.some((d) => storedDays[d]?.active);
}

/**
 * Rejestruje dzisiejszą aktywność (migawka KPI + flaga active).
 * Wołaj przy wizycie profilu lub po rozwiązaniu zadania.
 */
export function recordDailySnapshot(
  userId: string | null,
  snapshot: {
    solvedCount: number;
    xp: number;
    lastPlayedDate?: string | null;
  },
  today: string = todayDateString(),
): Record<string, StoredActivityDay> {
  if (typeof window === "undefined") return {};

  const store = loadStore(userId);
  const wasActiveToday =
    snapshot.lastPlayedDate === today || store.days[today]?.active;

  store.days[today] = {
    date: today,
    active: true,
    solvedCount: Math.max(0, snapshot.solvedCount),
    xp: Math.max(0, snapshot.xp),
  };

  if (snapshot.lastPlayedDate && snapshot.lastPlayedDate !== today) {
    const prev = store.days[snapshot.lastPlayedDate];
    if (!prev?.active) {
      store.days[snapshot.lastPlayedDate] = {
        date: snapshot.lastPlayedDate,
        active: true,
        solvedCount: prev?.solvedCount ?? 0,
        xp: prev?.xp ?? 0,
      };
    }
  }

  if (!wasActiveToday) {
    store.days[today].active = true;
  }

  saveStore(userId, store);
  return store.days;
}

/** Wczytuje zapisane dni aktywności (bez rejestracji wizyty). */
export function loadActivityDays(
  userId: string | null,
): Record<string, StoredActivityDay> {
  return loadStore(userId).days;
}
