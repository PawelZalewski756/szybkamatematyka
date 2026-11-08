const STORAGE_KEY = "sm_streak_reminder_prefs";

export type StreakReminderPrefs = {
  /** Użytkownik włączył powiadomienia przeglądarki (opt-in). */
  notificationsEnabled: boolean;
  /** Baner prośby o zgodę został zamknięty - nie pokazuj ponownie. */
  promptDismissed: boolean;
  /** Ostatnia data (YYYY-MM-DD), w której wysłano / pokazano przypomnienie dzienne. */
  lastReminderDate: string | null;
};

const DEFAULT_PREFS: StreakReminderPrefs = {
  notificationsEnabled: false,
  promptDismissed: false,
  lastReminderDate: null,
};

function readRaw(): StreakReminderPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_PREFS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<StreakReminderPrefs>;
    return {
      notificationsEnabled: Boolean(parsed.notificationsEnabled),
      promptDismissed: Boolean(parsed.promptDismissed),
      lastReminderDate:
        typeof parsed.lastReminderDate === "string"
          ? parsed.lastReminderDate
          : null,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function loadStreakReminderPrefs(): StreakReminderPrefs {
  return readRaw();
}

export function saveStreakReminderPrefs(
  patch: Partial<StreakReminderPrefs>,
): StreakReminderPrefs {
  const next = { ...readRaw(), ...patch };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* quota / private mode */
    }
  }
  return next;
}

export function markDailyReminderShown(today: string): StreakReminderPrefs {
  return saveStreakReminderPrefs({ lastReminderDate: today });
}
