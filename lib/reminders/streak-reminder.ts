import { todayDateString } from "@/lib/supabase/profiles";

/** Godzina (lokalna), od której obowiązuje okno „wieczorne”. */
export const STREAK_REMINDER_EVENING_HOUR = 18;

export type StreakReminderProfile = {
  streak: number;
  lastPlayedDate: string | null;
};

/** Czy profil kwalifikuje się do przypomnienia o serii. */
export function needsStreakReminder(
  profile: StreakReminderProfile,
  today: string = todayDateString(),
): boolean {
  return profile.streak >= 1 && profile.lastPlayedDate !== today;
}

/** Jednorazowe przypomnienie dziennie — nie powtarzaj tego samego dnia. */
export function canShowDailyReminder(
  lastReminderDate: string | null,
  today: string = todayDateString(),
): boolean {
  return lastReminderDate !== today;
}

/** Czy teraz jest okno wieczorne (po STREAK_REMINDER_EVENING_HOUR). */
export function isEveningReminderWindow(
  now: Date,
  eveningHour: number = STREAK_REMINDER_EVENING_HOUR,
): boolean {
  return now.getHours() >= eveningHour;
}

/**
 * Czy wyświetlić przypomnienie teraz.
 * - `onPageVisit`: przy wejściu / nawigacji — zawsze (jeśli spełnione warunki profilu).
 * - bez nawigacji: tylko po godzinie wieczornej (timer w otwartej karcie).
 */
export function shouldTriggerStreakReminder(
  onPageVisit: boolean,
  now: Date = new Date(),
  eveningHour: number = STREAK_REMINDER_EVENING_HOUR,
): boolean {
  return onPageVisit || isEveningReminderWindow(now, eveningHour);
}

export function streakReminderMessage(streak: number): {
  title: string;
  body: string;
} {
  const daysLabel =
    streak === 1 ? "1 dnia" : streak >= 2 && streak <= 4 ? `${streak} dni` : `${streak} dni`;
  return {
    title: "Nie strać serii!",
    body: `Nie strać serii ${daysLabel}! Ćwicz dziś, żeby utrzymać passę.`,
  };
}

/** Milisekundy do najbliższej pełnej godziny wieczornej (18:00) tego dnia. */
export function msUntilEveningWindow(
  now: Date = new Date(),
  eveningHour: number = STREAK_REMINDER_EVENING_HOUR,
): number | null {
  const target = new Date(now);
  target.setHours(eveningHour, 0, 0, 0);
  if (now.getTime() >= target.getTime()) return null;
  return target.getTime() - now.getTime();
}
