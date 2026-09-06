import { findAvatarUrlInStorage } from "@/lib/supabase/avatar";
import { getSupabase, getSupabaseOrNull } from "@/lib/supabase";
import { isPostgrestUndefinedColumnError } from "@/lib/supabase/errors";
import { calculateLevel } from "@/lib/levelSystem";
import { gameScoreToXp } from "@/lib/minigry/account-progress";
import { notifyProfileUpdated } from "@/lib/profile-sync";
import {
  FREE_SUBSCRIPTION,
  isProStatus,
  normalizeSubscriptionStatus,
  type SubscriptionSnapshot,
  type SubscriptionStatus,
} from "@/lib/subscription/status";
import { getPlanById, type SubscriptionPlanId } from "@/lib/subscription/plans";
import {
  isSchoolClassPath,
  normalizeSchoolClass,
  type SchoolClassPath,
} from "@/lib/learning-path";
import type { PostgrestError } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  nick: string;
  xp: number;
  minigryXp: number;
  level: number;
  streak: number;
  lastPlayedDate: string | null;
  avatarUrl: string | null;
  lastNickUpdate: string | null;
  /** Klasa ucznia (migracja add_profile_school_class). */
  schoolClass?: SchoolClassPath | null;
  /** Subskrypcja odczytywana osobnym, ograniczonym zapytaniem dla właściciela. */
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlanId | null;
  subscriptionCurrentPeriodEnd?: string | null;
  subscriptionCancelAtPeriodEnd?: boolean;
};

export class NickTakenError extends Error {
  constructor() {
    super("nick_taken");
    this.name = "NickTakenError";
  }
}

export class NickCooldownError extends Error {
  constructor(public readonly messagePl: string) {
    super("nick_cooldown");
    this.name = "NickCooldownError";
  }
}

const NICK_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type ProfileRow = {
  id: string;
  nick?: string | null;
  nickname?: string | null;
  xp?: number | null;
  minigry_xp?: number | null;
  level?: number | null;
  streak?: number | null;
  last_played_date?: string | null;
  avatar_url?: string | null;
  last_nick_update?: string | null;
  subscription_status?: string | null;
  subscription_plan?: string | null;
  subscription_current_period_end?: string | null;
  subscription_cancel_at_period_end?: boolean | null;
  school_class?: string | null;
};

const CORE_SELECT = "id, nick, nickname, xp, level";
const MINIGRY_SELECT = `${CORE_SELECT}, minigry_xp`;
const STREAK_SELECT = `${MINIGRY_SELECT}, streak, last_played_date`;
const AVATAR_SELECT = `${MINIGRY_SELECT}, avatar_url`;
const FULL_SELECT = `${STREAK_SELECT}, avatar_url`;
const NICK_UPDATE_SELECT = `${FULL_SELECT}, last_nick_update`;
const SCHOOL_CLASS_SELECT = `${NICK_UPDATE_SELECT}, school_class`;

/** Ścieżka bez minigry_xp (kolumna często brakuje w starszych bazach). */
const STREAK_NO_MINIGRY_SELECT = `${CORE_SELECT}, streak, last_played_date`;
const AVATAR_NO_MINIGRY_SELECT = `${STREAK_NO_MINIGRY_SELECT}, avatar_url`;
const NICK_NO_MINIGRY_SELECT = `${AVATAR_NO_MINIGRY_SELECT}, last_nick_update`;
const SCHOOL_NO_MINIGRY_SELECT = `${NICK_NO_MINIGRY_SELECT}, school_class`;
const SCHOOL_BARE_SELECT = `${CORE_SELECT}, school_class`;

const PROFILE_SELECT_FALLBACK_CHAIN = [
  SCHOOL_CLASS_SELECT,
  NICK_UPDATE_SELECT,
  FULL_SELECT,
  AVATAR_SELECT,
  STREAK_SELECT,
  SCHOOL_NO_MINIGRY_SELECT,
  NICK_NO_MINIGRY_SELECT,
  AVATAR_NO_MINIGRY_SELECT,
  STREAK_NO_MINIGRY_SELECT,
  SCHOOL_BARE_SELECT,
  CORE_SELECT,
] as const;

function readNick(row: ProfileRow): string {
  return (row.nick ?? row.nickname ?? "").trim();
}

function readSubscriptionPlan(row: ProfileRow): SubscriptionPlanId | null {
  const raw = row.subscription_plan?.trim();
  if (!raw) return null;
  const plan = getPlanById(raw);
  return plan ? plan.id : null;
}

function readSchoolClass(row: ProfileRow): SchoolClassPath | null {
  const raw = row.school_class?.trim();
  if (!raw) return null;
  return isSchoolClassPath(raw) ? raw : normalizeSchoolClass(raw);
}

function mapRow(row: ProfileRow): Profile {
  const xp = Number(row.xp) || 0;
  const hasSubscription = row.subscription_status !== undefined;
  const hasSchoolClass = row.school_class !== undefined;
  return {
    id: row.id,
    nick: readNick(row),
    xp,
    minigryXp: Number(row.minigry_xp) || 0,
    level: calculateLevel(xp),
    streak: Number(row.streak) || 0,
    lastPlayedDate: row.last_played_date ?? null,
    avatarUrl: row.avatar_url?.trim() || null,
    lastNickUpdate: row.last_nick_update ?? null,
    ...(hasSchoolClass ? { schoolClass: readSchoolClass(row) } : {}),
    ...(hasSubscription
      ? {
          subscriptionStatus: normalizeSubscriptionStatus(
            row.subscription_status,
          ),
          subscriptionPlan: readSubscriptionPlan(row),
          subscriptionCurrentPeriodEnd:
            row.subscription_current_period_end ?? null,
          subscriptionCancelAtPeriodEnd: Boolean(
            row.subscription_cancel_at_period_end,
          ),
        }
      : {}),
  };
}

function polishUnit(
  value: number,
  one: string,
  few: string,
  many: string,
): string {
  const abs = Math.abs(value);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (abs === 1) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function canChangeNick(lastNickUpdate: string | null): boolean {
  if (!lastNickUpdate) return true;
  const elapsed = Date.now() - new Date(lastNickUpdate).getTime();
  return elapsed >= NICK_CHANGE_COOLDOWN_MS;
}

export function nickChangeCooldownMessage(
  lastNickUpdate: string | null,
): string | null {
  if (!lastNickUpdate || canChangeNick(lastNickUpdate)) return null;

  const unlockAt =
    new Date(lastNickUpdate).getTime() + NICK_CHANGE_COOLDOWN_MS;
  const remainingMs = Math.max(0, unlockAt - Date.now());
  const totalHours = Math.ceil(remainingMs / (1000 * 60 * 60));

  if (totalHours >= 24) {
    const days = Math.ceil(totalHours / 24);
    const unit = polishUnit(days, "dzień", "dni", "dni");
    return `Nick możesz zmienić dopiero za ${days} ${unit}`;
  }

  const hours = Math.max(1, totalHours);
  const unit = polishUnit(hours, "godzinę", "godziny", "godzin");
  return `Nick możesz zmienić dopiero za ${hours} ${unit}`;
}

export function avatarUrlFromUserMetadata(user: User): string | null {
  const url = user.user_metadata?.avatar_url;
  if (typeof url === "string" && url.trim()) return url.trim();
  return null;
}

/** DB ma pierwszeństwo; metadata tylko gdy brak avatar_url w wierszu. */
export function mergeProfileAvatarFromMetadata(
  profile: Profile,
  user: User | null | undefined,
): Profile {
  if (profile.avatarUrl || !user || user.id !== profile.id) return profile;
  const metaUrl = avatarUrlFromUserMetadata(user);
  if (!metaUrl) return profile;
  return { ...profile, avatarUrl: metaUrl };
}

async function resolveUserForMetadata(
  userId: string,
  user?: User | null,
): Promise<User | null> {
  if (user?.id === userId) return user;
  const supabase = getSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user?.id === userId ? data.user : null;
}

async function fetchAvatarUrlFromDb(userId: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle()
    .retry(false);

  if (error) {
    if (isPostgrestUndefinedColumnError(error as PostgrestError, "avatar_url")) {
      return null;
    }
    console.warn("[szybka-matma] fetchAvatarUrlFromDb:", error);
    return null;
  }

  const url = data?.avatar_url;
  if (typeof url === "string" && url.trim()) return url.trim();
  return null;
}

async function enrichProfileAvatar(
  profile: Profile,
  userId: string,
  user?: User | null,
): Promise<Profile> {
  if (profile.avatarUrl) return profile;

  const resolved = await resolveUserForMetadata(userId, user);
  const fromMetadata = mergeProfileAvatarFromMetadata(profile, resolved);
  if (fromMetadata.avatarUrl) return fromMetadata;

  const fromDb = await fetchAvatarUrlFromDb(userId);
  if (fromDb) return { ...profile, avatarUrl: fromDb };

  const fromStorage = await findAvatarUrlInStorage(userId);
  if (fromStorage) return { ...profile, avatarUrl: fromStorage };

  return profile;
}

export async function persistAvatarUrlToUserMetadata(
  avatarUrl: string,
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });
  if (error) {
    console.warn("[szybka-matma] Nie zapisano avatar_url w user_metadata:", error);
    return false;
  }
  return true;
}

const AVATAR_COLUMN_WARN_KEY = "sm_avatar_url_column_warned";

export function warnAvatarColumnMissingOnce(): void {
  if (typeof sessionStorage !== "undefined") {
    if (sessionStorage.getItem(AVATAR_COLUMN_WARN_KEY)) return;
    try {
      sessionStorage.setItem(AVATAR_COLUMN_WARN_KEY, "1");
    } catch {
      /* ignore */
    }
  }
  console.warn(
    "[szybka-matma] Kolumna profiles.avatar_url niedostępna — awatar zapisany w user_metadata. " +
      "Aby trafił do rankingu, uruchom w Supabase SQL Editor: supabase/migrations/add_avatar_url_only.sql",
  );
}

export function profileFromUserFallback(user: User): Profile {
  const metaNick = nickFromUserMetadata(user);
  return {
    id: user.id,
    nick: metaNick ?? `gracz_${user.id.replace(/-/g, "").slice(0, 8)}`,
    xp: 0,
    minigryXp: 0,
    level: 1,
    streak: 0,
    lastPlayedDate: null,
    avatarUrl: avatarUrlFromUserMetadata(user),
    lastNickUpdate: null,
  };
}

function profileWritePayload(nick: string) {
  const normalized = normalizeNick(nick);
  return { nick: normalized, nickname: normalized };
}

export function normalizeNick(raw: string): string {
  return raw.trim();
}

export function profileNeedsOnboarding(profile: Profile | null): boolean {
  if (!profile?.nick?.trim()) return true;
  if (profile.schoolClass === undefined) return false;
  if (!profile.schoolClass) return true;
  return false;
}

export function nickFromUserMetadata(user: User): string | null {
  const meta = user.user_metadata;
  if (typeof meta?.nick === "string" && meta.nick.trim()) {
    return normalizeNick(meta.nick);
  }
  if (typeof meta?.nickname === "string" && meta.nickname.trim()) {
    return normalizeNick(meta.nickname);
  }
  return null;
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function calculateStreak(
  lastPlayedDate: string | null,
  currentStreak: number,
): { streak: number; lastPlayedDate: string } {
  const today = todayDateString();

  if (!lastPlayedDate) {
    return { streak: 1, lastPlayedDate: today };
  }

  if (lastPlayedDate === today) {
    return { streak: Math.max(1, currentStreak), lastPlayedDate: today };
  }

  const last = new Date(`${lastPlayedDate}T12:00:00`);
  const now = new Date(`${today}T12:00:00`);
  const diffDays = Math.round(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 1) {
    return { streak: Math.max(1, currentStreak) + 1, lastPlayedDate: today };
  }

  return { streak: 1, lastPlayedDate: today };
}

async function selectProfile(
  userId: string,
  columns: string,
): Promise<{ row: ProfileRow | null; error: PostgrestError | null }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select(columns)
    .eq("id", userId)
    .maybeSingle()
    .retry(false);

  return {
    row: (data as ProfileRow | null) ?? null,
    error: error as PostgrestError | null,
  };
}

async function selectProfileWithFallback(
  userId: string,
): Promise<{ row: ProfileRow | null; error: PostgrestError | null }> {
  let lastError: PostgrestError | null = null;

  for (const columns of PROFILE_SELECT_FALLBACK_CHAIN) {
    const result = await selectProfile(userId, columns);
    if (!result.error) return result;
    if (!isPostgrestUndefinedColumnError(result.error)) {
      return { row: null, error: result.error };
    }
    lastError = result.error;
  }

  return { row: null, error: lastError };
}

async function updateAndSelectProfile(
  userId: string,
  patch: Record<string, unknown>,
): Promise<{ row: ProfileRow | null; error: PostgrestError | null }> {
  const supabase = getSupabase();
  let lastError: PostgrestError | null = null;

  for (const columns of PROFILE_SELECT_FALLBACK_CHAIN) {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select(columns)
      .single()
      .retry(false);

    if (!error) {
      return { row: (data as unknown as ProfileRow) ?? null, error: null };
    }
    const pgError = error as PostgrestError;
    if (!isPostgrestUndefinedColumnError(pgError)) {
      return { row: null, error: pgError };
    }
    lastError = pgError;
  }

  return { row: null, error: lastError };
}

async function insertAndSelectProfile(
  payload: Record<string, unknown>,
): Promise<{ row: ProfileRow | null; error: PostgrestError | null }> {
  const supabase = getSupabase();
  let lastError: PostgrestError | null = null;

  for (const columns of PROFILE_SELECT_FALLBACK_CHAIN) {
    const { data, error } = await supabase
      .from("profiles")
      .insert(payload)
      .select(columns)
      .single()
      .retry(false);

    if (!error) {
      return { row: (data as unknown as ProfileRow) ?? null, error: null };
    }
    const pgError = error as PostgrestError;
    if (!isPostgrestUndefinedColumnError(pgError)) {
      return { row: null, error: pgError };
    }
    lastError = pgError;
  }

  return { row: null, error: lastError };
}

export async function fetchProfile(
  userId: string,
  user?: User | null,
): Promise<Profile | null> {
  const { row, error } = await selectProfileWithFallback(userId);

  if (error) {
    console.error("[szybka-matma] fetchProfile failed:", error);
    return null;
  }
  if (!row) return null;

  const profile = mapRow(row);
  if (!profile.nick) return null;
  return enrichProfileAvatar(profile, userId, user);
}

export async function isNickTaken(
  nick: string,
  exceptUserId?: string,
): Promise<boolean> {
  const supabase = getSupabase();
  const normalized = normalizeNick(nick);

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("nick", normalized)
    .retry(false);

  if (error) throw error;
  const rows = data ?? [];
  return rows.some((row) => row.id !== exceptUserId);
}

export async function createProfile(
  userId: string,
  nick: string,
): Promise<Profile> {
  const base = {
    id: userId,
    ...profileWritePayload(nick),
    xp: 0,
    level: 1,
  };

  let { row, error } = await insertAndSelectProfile({
    ...base,
    streak: 0,
    last_played_date: null,
  });

  if (error && isPostgrestUndefinedColumnError(error)) {
    ({ row, error } = await insertAndSelectProfile(base));
  }

  if (error) {
    console.error("[szybka-matma] createProfile failed:", error);
    return {
      id: userId,
      nick: normalizeNick(nick),
      xp: 0,
      minigryXp: 0,
      level: 1,
      streak: 0,
      lastPlayedDate: null,
      avatarUrl: null,
      lastNickUpdate: null,
    };
  }

  return mapRow(row as ProfileRow);
}

function isUniqueViolation(error: PostgrestError | null): boolean {
  return error?.code === "23505";
}

export async function updateProfileNick(
  userId: string,
  nick: string,
  options?: { lastNickUpdate?: string | null },
): Promise<Profile> {
  if (options?.lastNickUpdate !== undefined) {
    const cooldownMsg = nickChangeCooldownMessage(options.lastNickUpdate);
    if (cooldownMsg) throw new NickCooldownError(cooldownMsg);
  }

  // Normalizacja nicku odbywa się spójnie w profileWritePayload() (ten sam tor
  // zapisu co createProfile), więc nie liczymy jej tu osobno — wcześniejsza
  // lokalna zmienna `normalized` była martwa.
  const patch: Record<string, unknown> = {
    ...profileWritePayload(nick),
    last_nick_update: new Date().toISOString(),
  };

  let { row, error } = await updateAndSelectProfile(userId, patch);

  if (error && isPostgrestUndefinedColumnError(error, "last_nick_update")) {
    ({ row, error } = await updateAndSelectProfile(
      userId,
      profileWritePayload(nick),
    ));
  }

  if (error) {
    if (isUniqueViolation(error)) throw new NickTakenError();
    console.error("[szybka-matma] updateProfileNick failed:", error);
    throw error;
  }

  if (!row) {
    throw new Error("updateProfileNick: brak wiersza po aktualizacji");
  }

  return mapRow(row);
}

export async function updateProfileSchoolClass(
  userId: string,
  schoolClass: SchoolClassPath,
): Promise<Profile> {
  const patch: Record<string, unknown> = { school_class: schoolClass };

  const { row, error } = await updateAndSelectProfile(userId, patch);

  if (error && isPostgrestUndefinedColumnError(error, "school_class")) {
    console.warn(
      "[szybka-matma] Kolumna profiles.school_class niedostępna — uruchom migrację add_profile_school_class.sql",
    );
    const { row: current } = await selectProfileWithFallback(userId);
    if (!current) throw new Error("updateProfileSchoolClass: brak profilu");
    return mapRow(current);
  }

  if (error) {
    console.error("[szybka-matma] updateProfileSchoolClass failed:", error);
    throw error;
  }

  if (!row) {
    throw new Error("updateProfileSchoolClass: brak wiersza po aktualizacji");
  }

  return mapRow(row);
}

export async function completeProfileOnboarding(
  userId: string,
  nick: string,
  schoolClass: SchoolClassPath,
  options?: { lastNickUpdate?: string | null },
): Promise<Profile> {
  if (options?.lastNickUpdate !== undefined) {
    const cooldownMsg = nickChangeCooldownMessage(options.lastNickUpdate);
    if (cooldownMsg) throw new NickCooldownError(cooldownMsg);
  }

  const patch: Record<string, unknown> = {
    ...profileWritePayload(nick),
    school_class: schoolClass,
    last_nick_update: new Date().toISOString(),
  };

  let { row, error } = await updateAndSelectProfile(userId, patch);

  if (error && isPostgrestUndefinedColumnError(error, "school_class")) {
    ({ row, error } = await updateAndSelectProfile(userId, {
      ...profileWritePayload(nick),
      last_nick_update: new Date().toISOString(),
    }));
  }

  if (error && isPostgrestUndefinedColumnError(error, "last_nick_update")) {
    ({ row, error } = await updateAndSelectProfile(userId, {
      ...profileWritePayload(nick),
      school_class: schoolClass,
    }));
  }

  if (error && isPostgrestUndefinedColumnError(error, "last_nick_update")) {
    ({ row, error } = await updateAndSelectProfile(
      userId,
      profileWritePayload(nick),
    ));
  }

  if (error) {
    if (isUniqueViolation(error)) throw new NickTakenError();
    console.error("[szybka-matma] completeProfileOnboarding failed:", error);
    throw error;
  }

  if (!row) {
    throw new Error("completeProfileOnboarding: brak wiersza po aktualizacji");
  }

  return mapRow(row);
}

export async function fetchProfileAllowEmpty(
  userId: string,
  user?: User | null,
): Promise<Profile | null> {
  const { row, error } = await selectProfileWithFallback(userId);

  if (error) {
    console.error("[szybka-matma] fetchProfileAllowEmpty failed:", error);
    return null;
  }
  if (!row) return null;

  const profile = mapRow(row);
  return enrichProfileAvatar(profile, userId, user);
}

export async function ensureUserProfile(user: User): Promise<Profile> {
  const existing = await fetchProfileAllowEmpty(user.id, user);
  if (existing) return existing;

  const metaNick = nickFromUserMetadata(user);
  if (metaNick) {
    try {
      const created = await createProfile(user.id, metaNick);
      return mergeProfileAvatarFromMetadata(created, user);
    } catch {
      /* profil może już istnieć */
    }
  }

  return {
    id: user.id,
    nick: "",
    xp: 0,
    minigryXp: 0,
    level: 1,
    streak: 0,
    lastPlayedDate: null,
    avatarUrl: avatarUrlFromUserMetadata(user),
    lastNickUpdate: null,
  };
}

export async function awardArenaXp(
  profile: Profile,
  xpAmount: number,
): Promise<Profile & { leveledUp: boolean; previousLevel: number; xpEarned: number }> {
  const withXp = applyXpGain(profile, xpAmount);

  const { row, error } = await updateAndSelectProfile(profile.id, {
    xp: withXp.xp,
    level: withXp.level,
  });

  if (error) {
    console.warn("[szybka-matma] awardArenaXp — zapis XP:", error);
    notifyProfileUpdated(withXp);
    return {
      ...withXp,
      leveledUp: withXp.leveledUp,
      previousLevel: withXp.previousLevel,
      xpEarned: xpAmount,
    };
  }

  const saved = mapRow(row as ProfileRow);
  notifyProfileUpdated(saved);
  return {
    ...saved,
    leveledUp: withXp.leveledUp,
    previousLevel: withXp.previousLevel,
    xpEarned: xpAmount,
  };
}

export async function saveProfileAfterGame(
  profile: Profile,
  roundScore: number,
): Promise<
  Profile & {
    leveledUp: boolean;
    previousLevel: number;
    xpEarned: number;
    /**
     * Czy zmiany trafiły do bazy. `false` oznacza, że zwrócony profil jest tylko
     * lokalnie zaktualizowany (zapis do DB się nie powiódł) — UI nie powinien
     * sugerować, że XP zostało zachowane w chmurze. Pole dodane additywnie, więc
     * dotychczasowi wywołujący ignorujący je działają bez zmian.
     */
    persisted: boolean;
  }
> {
  const xpEarned = gameScoreToXp(roundScore);
  const withXp = applyXpGain(profile, xpEarned);
  const { streak, lastPlayedDate } = calculateStreak(
    profile.lastPlayedDate,
    profile.streak,
  );

  const minigryXp = profile.minigryXp + xpEarned;

  const fullUpdate = {
    xp: withXp.xp,
    level: withXp.level,
    minigry_xp: minigryXp,
    streak,
    last_played_date: lastPlayedDate,
  };

  let { row, error } = await updateAndSelectProfile(profile.id, fullUpdate);

  if (error && isPostgrestUndefinedColumnError(error)) {
    ({ row, error } = await updateAndSelectProfile(profile.id, {
      xp: withXp.xp,
      level: withXp.level,
      streak,
      last_played_date: lastPlayedDate,
    }));
    if (error && isPostgrestUndefinedColumnError(error, "minigry_xp")) {
      ({ row, error } = await updateAndSelectProfile(profile.id, {
        xp: withXp.xp,
        level: withXp.level,
      }));
    }
  }

  const resultBase = {
    ...withXp,
    minigryXp,
    streak,
    lastPlayedDate,
    leveledUp: withXp.leveledUp,
    previousLevel: withXp.previousLevel,
    xpEarned,
  };

  if (error) {
    console.warn("[szybka-matma] saveProfileAfterGame — zapis XP bez streak:", error);
    notifyProfileUpdated(resultBase);
    return { ...resultBase, persisted: false };
  }

  const saved = {
    ...mapRow(row as ProfileRow),
    streak,
    lastPlayedDate,
  };
  notifyProfileUpdated(saved);
  return {
    ...saved,
    leveledUp: withXp.leveledUp,
    previousLevel: withXp.previousLevel,
    xpEarned,
    persisted: true,
  };
}

/**
 * Nagroda za ukończenie dziennego wyzwania: dolicza XP i podbija wspólną serię
 * aktywności (profiles.streak / last_played_date) tą samą logiką co minigry,
 * więc nie powstaje konkurencyjny licznik. Idempotentne w obrębie dnia
 * (calculateStreak nie podbija serii, gdy last_played_date == dziś).
 */
export async function awardDailyChallenge(
  profile: Profile,
  xpAmount: number,
): Promise<
  Profile & { leveledUp: boolean; previousLevel: number; xpEarned: number }
> {
  const xpEarned = Math.max(0, Math.round(xpAmount));
  const withXp = applyXpGain(profile, xpEarned);
  const { streak, lastPlayedDate } = calculateStreak(
    profile.lastPlayedDate,
    profile.streak,
  );

  let { row, error } = await updateAndSelectProfile(profile.id, {
    xp: withXp.xp,
    level: withXp.level,
    streak,
    last_played_date: lastPlayedDate,
  });

  if (error && isPostgrestUndefinedColumnError(error)) {
    ({ row, error } = await updateAndSelectProfile(profile.id, {
      xp: withXp.xp,
      level: withXp.level,
    }));
  }

  const resultBase = {
    ...withXp,
    streak,
    lastPlayedDate,
    leveledUp: withXp.leveledUp,
    previousLevel: withXp.previousLevel,
    xpEarned,
  };

  if (error) {
    console.warn("[szybka-matma] awardDailyChallenge — zapis bez streak:", error);
    notifyProfileUpdated(resultBase);
    return resultBase;
  }

  const saved = { ...mapRow(row as ProfileRow), streak, lastPlayedDate };
  notifyProfileUpdated(saved);
  return {
    ...saved,
    leveledUp: withXp.leveledUp,
    previousLevel: withXp.previousLevel,
    xpEarned,
  };
}

/** Wyciąga migawkę subskrypcji z profilu (z bezpiecznymi domyślnymi). */
export function subscriptionSnapshotFromProfile(
  profile: Profile | null | undefined,
): SubscriptionSnapshot {
  if (!profile) return FREE_SUBSCRIPTION;
  return {
    status: profile.subscriptionStatus ?? "free",
    planId: profile.subscriptionPlan ?? null,
    currentPeriodEnd: profile.subscriptionCurrentPeriodEnd ?? null,
    cancelAtPeriodEnd: profile.subscriptionCancelAtPeriodEnd ?? false,
  };
}

/**
 * Lekkie zapytanie o własną subskrypcję. Nie czyta prywatnych kolumn przez
 * PostgREST — migracja udostępnia wyłącznie funkcję RPC ograniczoną do auth.uid().
 */
export async function fetchSubscriptionSnapshotForUser(
  userId: string,
): Promise<SubscriptionSnapshot> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return FREE_SUBSCRIPTION;

  void userId;
  const { data, error } = await supabase.rpc("get_my_subscription");

  if (error) {
    console.error("[szybka-matma] fetchSubscriptionSnapshotForUser:", error);
    return FREE_SUBSCRIPTION;
  }

  const row = (
    Array.isArray(data) ? data[0] : data
  ) as ProfileRow | null | undefined;
  if (!row) return FREE_SUBSCRIPTION;

  return {
    status: normalizeSubscriptionStatus(row.subscription_status),
    planId: readSubscriptionPlan(row),
    currentPeriodEnd: row.subscription_current_period_end ?? null,
    cancelAtPeriodEnd: Boolean(row.subscription_cancel_at_period_end),
  };
}

/** Czy użytkownik z danym profilem ma aktywny dostęp Pro. */
export function profileIsPro(profile: Profile | null | undefined): boolean {
  return isProStatus(profile?.subscriptionStatus);
}

export function applyXpGain(
  profile: Profile,
  pointsEarned: number,
): Profile & { leveledUp: boolean; previousLevel: number } {
  const previousLevel = calculateLevel(profile.xp);
  const xp = profile.xp + Math.max(0, pointsEarned);
  const level = calculateLevel(xp);

  return {
    ...profile,
    xp,
    level,
    leveledUp: level > previousLevel,
    previousLevel,
  };
}

export type UpdateProfileAvatarResult = {
  profile: Profile;
  /** true gdy zapis w profiles.avatar_url lub w user_metadata */
  persisted: boolean;
};

export async function updateProfileAvatarUrl(
  userId: string,
  avatarUrl: string,
): Promise<UpdateProfileAvatarResult> {
  const supabase = getSupabase();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId)
    .retry(false);

  if (
    updateError &&
    isPostgrestUndefinedColumnError(updateError as PostgrestError, "avatar_url")
  ) {
    const { row, error: selectError } = await selectProfileWithFallback(userId);
    if (selectError) {
      console.error("[szybka-matma] updateProfileAvatarUrl select failed:", selectError);
    }
    const base = row
      ? mapRow(row)
      : {
          id: userId,
          nick: "",
          xp: 0,
          minigryXp: 0,
          level: 1,
          streak: 0,
          lastPlayedDate: null,
          avatarUrl: null,
          lastNickUpdate: null,
        };
    const profile = { ...base, avatarUrl };
    const metaOk = await persistAvatarUrlToUserMetadata(avatarUrl);
    if (metaOk) warnAvatarColumnMissingOnce();
    notifyProfileUpdated(profile);
    return { profile, persisted: metaOk };
  }

  if (updateError) {
    console.error("[szybka-matma] updateProfileAvatarUrl failed:", updateError);
    throw updateError;
  }

  const { row, error: selectError } = await selectProfileWithFallback(userId);
  if (selectError || !row) {
    console.error("[szybka-matma] updateProfileAvatarUrl select after update:", selectError);
    const profile = {
      id: userId,
      nick: "",
      xp: 0,
      minigryXp: 0,
      level: 1,
      streak: 0,
      lastPlayedDate: null,
      avatarUrl,
      lastNickUpdate: null,
    };
    notifyProfileUpdated(profile);
    return { profile, persisted: true };
  }

  const saved = { ...mapRow(row), avatarUrl: row.avatar_url?.trim() || avatarUrl };
  notifyProfileUpdated(saved);
  return { profile: saved, persisted: true };
}

export async function updateProfileProgress(
  userId: string,
  xp: number,
  level: number,
): Promise<Profile> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .update({ xp, level })
    .eq("id", userId)
    .select(CORE_SELECT)
    .single()
    .retry(false);

  if (error) throw error;
  return mapRow(data as ProfileRow);
}
