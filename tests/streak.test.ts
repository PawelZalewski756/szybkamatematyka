import { describe, it, expect } from "vitest";
import { calculateStreak, todayDateString } from "@/lib/supabase/profiles";

/** Lokalny YYYY-MM-DD przesunięty o `delta` dni względem dziś (tak jak moduł). */
function localDateString(deltaDays: number): string {
  const today = todayDateString();
  const d = new Date(`${today}T12:00:00`);
  d.setDate(d.getDate() + deltaDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("calculateStreak", () => {
  it("brak poprzedniej daty → seria 1 od dziś", () => {
    const result = calculateStreak(null, 0);
    expect(result.streak).toBe(1);
    expect(result.lastPlayedDate).toBe(todayDateString());
  });

  it("ostatnia gra dziś → seria bez zmian (min. 1)", () => {
    const today = todayDateString();
    expect(calculateStreak(today, 3)).toEqual({ streak: 3, lastPlayedDate: today });
    expect(calculateStreak(today, 0)).toEqual({ streak: 1, lastPlayedDate: today });
  });

  it("ostatnia gra wczoraj → seria +1", () => {
    const yesterday = localDateString(-1);
    const result = calculateStreak(yesterday, 4);
    expect(result.streak).toBe(5);
    expect(result.lastPlayedDate).toBe(todayDateString());
  });

  it("luka większa niż 1 dzień → reset do 1", () => {
    const weekAgo = localDateString(-7);
    const result = calculateStreak(weekAgo, 10);
    expect(result.streak).toBe(1);
    expect(result.lastPlayedDate).toBe(todayDateString());
  });
});
