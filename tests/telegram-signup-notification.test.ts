import { describe, expect, it } from "vitest";
import {
  formatSignupNotification,
  isRecentSignup,
} from "@/lib/telegram/signup-notification";

describe("formatSignupNotification", () => {
  it("includes the new account details without allowing newlines in fields", () => {
    const message = formatSignupNotification({
      nickname: "Kasia\nAdmin",
      email: "kasia@example.com",
      schoolLevel: "srednia",
      createdAt: "2026-11-01T12:00:00.000Z",
      emailConfirmed: false,
    });

    expect(message).toContain("Nick: Kasia Admin");
    expect(message).toContain("E-mail: kasia@example.com");
    expect(message).toContain("Poziom nauki: Szkoła średnia");
    expect(message).toContain(
      "Potwierdzenie e-maila: oczekuje na potwierdzenie",
    );
    expect(message.split("\n")).toHaveLength(6);
  });
});

describe("isRecentSignup", () => {
  const now = Date.parse("2026-11-01T12:00:00.000Z");
  const tenMinutes = 10 * 60 * 1000;

  it("accepts recent accounts and rejects stale or future timestamps", () => {
    expect(
      isRecentSignup("2026-11-01T11:55:00.000Z", now, tenMinutes),
    ).toBe(true);
    expect(
      isRecentSignup("2026-11-01T11:45:00.000Z", now, tenMinutes),
    ).toBe(false);
    expect(
      isRecentSignup("2026-11-01T12:05:00.000Z", now, tenMinutes),
    ).toBe(false);
  });
});
