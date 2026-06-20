import { describe, it, expect } from "vitest";
import {
  canShowDailyReminder,
  isEveningReminderWindow,
  msUntilEveningWindow,
  needsStreakReminder,
  shouldTriggerStreakReminder,
  streakReminderMessage,
  STREAK_REMINDER_EVENING_HOUR,
} from "@/lib/reminders/streak-reminder";
import { todayDateString } from "@/lib/supabase/profiles";

function localDateString(deltaDays: number): string {
  const today = todayDateString();
  const d = new Date(`${today}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function atLocalHour(hour: number): Date {
  const d = new Date();
  d.setHours(hour, 30, 0, 0);
  return d;
}

describe("needsStreakReminder", () => {
  const today = todayDateString();
  const yesterday = localDateString(-1);

  it("false gdy streak 0", () => {
    expect(needsStreakReminder({ streak: 0, lastPlayedDate: yesterday }, today)).toBe(
      false,
    );
  });

  it("false gdy grano dziś", () => {
    expect(needsStreakReminder({ streak: 5, lastPlayedDate: today }, today)).toBe(
      false,
    );
  });

  it("true gdy streak >= 1 i ostatnia gra nie dziś", () => {
    expect(needsStreakReminder({ streak: 3, lastPlayedDate: yesterday }, today)).toBe(
      true,
    );
    expect(needsStreakReminder({ streak: 1, lastPlayedDate: yesterday }, today)).toBe(
      true,
    );
  });
});

describe("canShowDailyReminder", () => {
  const today = todayDateString();

  it("true gdy brak poprzedniego przypomnienia", () => {
    expect(canShowDailyReminder(null, today)).toBe(true);
  });

  it("false gdy przypomnienie już dziś", () => {
    expect(canShowDailyReminder(today, today)).toBe(false);
  });

  it("true gdy ostatnie przypomnienie wczoraj", () => {
    expect(canShowDailyReminder(localDateString(-1), today)).toBe(true);
  });
});

describe("shouldTriggerStreakReminder", () => {
  it("przy wejściu na stronę — zawsze", () => {
    expect(shouldTriggerStreakReminder(true, atLocalHour(10))).toBe(true);
    expect(shouldTriggerStreakReminder(true, atLocalHour(20))).toBe(true);
  });

  it("bez nawigacji — tylko po godzinie wieczornej", () => {
    expect(
      shouldTriggerStreakReminder(false, atLocalHour(STREAK_REMINDER_EVENING_HOUR - 1)),
    ).toBe(false);
    expect(
      shouldTriggerStreakReminder(false, atLocalHour(STREAK_REMINDER_EVENING_HOUR)),
    ).toBe(true);
  });
});

describe("isEveningReminderWindow", () => {
  it("true od STREAK_REMINDER_EVENING_HOUR w górę", () => {
    expect(isEveningReminderWindow(atLocalHour(STREAK_REMINDER_EVENING_HOUR))).toBe(true);
    expect(isEveningReminderWindow(atLocalHour(STREAK_REMINDER_EVENING_HOUR - 1))).toBe(
      false,
    );
  });
});

describe("msUntilEveningWindow", () => {
  it("null gdy już po godzinie wieczornej", () => {
    expect(msUntilEveningWindow(atLocalHour(STREAK_REMINDER_EVENING_HOUR + 1))).toBeNull();
  });

  it("dodatnie ms przed godziną wieczorną", () => {
    const ms = msUntilEveningWindow(atLocalHour(STREAK_REMINDER_EVENING_HOUR - 2));
    expect(ms).not.toBeNull();
    expect(ms!).toBeGreaterThan(0);
    expect(ms!).toBeLessThan(2 * 60 * 60 * 1000 + 1000);
  });
});

describe("streakReminderMessage", () => {
  it("zawiera liczbę dni serii", () => {
    expect(streakReminderMessage(5).body).toContain("5 dni");
    expect(streakReminderMessage(1).body).toContain("1 dnia");
  });
});
