import { describe, expect, it } from "vitest";
import {
  canChangeNick,
  nickChangeCooldownMessage,
} from "@/lib/supabase/profiles";

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

function daysAgo(days: number): string {
  return new Date(NOW - days * DAY).toISOString();
}

describe("karencja zmiany nicku", () => {
  it("brak daty lub data nieczytelna nie blokuje zmiany", () => {
    expect(canChangeNick(null)).toBe(true);
    expect(canChangeNick("nie-data")).toBe(true);
    expect(nickChangeCooldownMessage(null)).toBeNull();
    expect(nickChangeCooldownMessage("nie-data")).toBeNull();
  });

  it("karencja minęła po 7 dniach", () => {
    expect(canChangeNick(daysAgo(8))).toBe(true);
    expect(nickChangeCooldownMessage(daysAgo(8))).toBeNull();
  });

  it("pokazuje pozostałe dni i dokładną datę odblokowania", () => {
    const message = nickChangeCooldownMessage(daysAgo(2));
    expect(message).toContain("za 5 dni");
    // Data w formacie pl-PL, np. „21 listopada 2026”.
    expect(message).toMatch(/\d{1,2} [a-ząćęłńóśźż]+ \d{4}/);
  });

  it("ostatnie godziny karencji pokazuje w godzinach", () => {
    const message = nickChangeCooldownMessage(
      new Date(NOW - 6 * DAY - 20 * 60 * 60 * 1000).toISOString(),
    );
    expect(message).toContain("godzin");
  });
});
