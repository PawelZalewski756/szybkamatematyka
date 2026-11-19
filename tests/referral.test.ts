import { isDisposableEmail } from "@/lib/auth/disposable-email-domains";
import {
  normalizeReferralCode,
  referralFromSearch,
} from "@/lib/referral/codes";
import { referralProgress } from "@/lib/referral/progress";
import {
  parseStoredReferral,
  REFERRAL_TTL_MS,
} from "@/lib/referral/storage";
import { describe, expect, it } from "vitest";

describe("normalizeReferralCode", () => {
  it("normalizuje spacje i wielkość liter", () => {
    expect(normalizeReferralCode("  ABC12345  ")).toBe("abc12345");
  });

  it("odrzuca kod o złej długości lub ze znakami specjalnymi", () => {
    expect(normalizeReferralCode("abc")).toBeNull();
    expect(normalizeReferralCode("abcdefghijklm")).toBeNull();
    expect(normalizeReferralCode("abc-def")).toBeNull();
    expect(normalizeReferralCode(123)).toBeNull();
  });
});

describe("referralFromSearch", () => {
  it("wyciąga kod z query stringa", () => {
    expect(referralFromSearch("?foo=1&ref=ABC12345")).toBe("abc12345");
  });

  it("zwraca null, gdy kodu nie ma lub jest niepoprawny", () => {
    expect(referralFromSearch("")).toBeNull();
    expect(referralFromSearch("?ref=zly!")).toBeNull();
  });
});

describe("parseStoredReferral", () => {
  const now = 1_700_000_000_000;

  it("zwraca kod, dopóki nie minęło 30 dni", () => {
    const raw = JSON.stringify({
      code: "abc12345",
      expiresAt: now + REFERRAL_TTL_MS,
    });
    expect(parseStoredReferral(raw, now)).toBe("abc12345");
  });

  it("odrzuca wygasły lub uszkodzony wpis", () => {
    expect(
      parseStoredReferral(
        JSON.stringify({ code: "abc12345", expiresAt: now - 1 }),
        now,
      ),
    ).toBeNull();
    expect(parseStoredReferral("{zly-json", now)).toBeNull();
    expect(parseStoredReferral(null, now)).toBeNull();
  });
});

describe("isDisposableEmail", () => {
  it("rozpoznaje znane domeny tymczasowe i ich subdomeny", () => {
    expect(isDisposableEmail("uczen@10minutemail.com")).toBe(true);
    expect(isDisposableEmail("uczen@sub.mailinator.com")).toBe(true);
    expect(isDisposableEmail("UCZEN@YOPMAIL.COM")).toBe(true);
  });

  it("przepuszcza zwykłe domeny", () => {
    expect(isDisposableEmail("uczen@gmail.com")).toBe(false);
    expect(isDisposableEmail("uczen@example.org")).toBe(false);
  });
});

describe("referralProgress", () => {
  it("liczy tylko zakwalifikowane i nagrodzone osoby", () => {
    expect(
      referralProgress({
        pending: 5,
        qualified: 1,
        rewarded: 0,
        rewardedAt: null,
      }),
    ).toEqual({ counted: 1, target: 2, remaining: 1, rewardGranted: false });
  });

  it("kończy progres na 2/2 i oznacza nagrodę", () => {
    expect(
      referralProgress({
        pending: 1,
        qualified: 0,
        rewarded: 2,
        rewardedAt: "2026-11-19T00:00:00.000Z",
      }),
    ).toEqual({ counted: 2, target: 2, remaining: 0, rewardGranted: true });
  });

  it("nie przekracza celu przy większej liczbie poleceń", () => {
    expect(
      referralProgress({
        pending: 0,
        qualified: 4,
        rewarded: 0,
        rewardedAt: null,
      }).counted,
    ).toBe(2);
  });
});
