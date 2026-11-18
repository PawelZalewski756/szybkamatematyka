import { describe, it, expect } from "vitest";
import {
  effectiveSubscriptionStatus,
  isGiftPro,
  isPro,
  isProStatus,
  normalizeSubscriptionStatus,
  FREE_SUBSCRIPTION,
  type SubscriptionSnapshot,
} from "@/lib/subscription/status";

describe("isProStatus", () => {
  it("active i trialing dają dostęp Pro", () => {
    expect(isProStatus("active")).toBe(true);
    expect(isProStatus("trialing")).toBe(true);
  });

  it("pozostałe statusy nie dają dostępu Pro", () => {
    expect(isProStatus("free")).toBe(false);
    expect(isProStatus("past_due")).toBe(false);
    expect(isProStatus("canceled")).toBe(false);
    expect(isProStatus("incomplete")).toBe(false);
  });

  it("null/undefined → brak dostępu", () => {
    expect(isProStatus(null)).toBe(false);
    expect(isProStatus(undefined)).toBe(false);
  });
});

describe("isPro", () => {
  it("aktywna migawka → Pro", () => {
    const snap: SubscriptionSnapshot = {
      status: "active",
      planId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      source: "stripe",
    };
    expect(isPro(snap)).toBe(true);
  });

  it("migawka FREE → nie Pro", () => {
    expect(isPro(FREE_SUBSCRIPTION)).toBe(false);
  });

  it("null/undefined → nie Pro", () => {
    expect(isPro(null)).toBe(false);
    expect(isPro(undefined)).toBe(false);
  });
});

describe("normalizeSubscriptionStatus - mapowanie statusów Stripe", () => {
  it("mapuje statusy 1:1", () => {
    expect(normalizeSubscriptionStatus("active")).toBe("active");
    expect(normalizeSubscriptionStatus("trialing")).toBe("trialing");
    expect(normalizeSubscriptionStatus("past_due")).toBe("past_due");
  });

  it("warianty anulowania → canceled", () => {
    expect(normalizeSubscriptionStatus("canceled")).toBe("canceled");
    expect(normalizeSubscriptionStatus("cancelled")).toBe("canceled");
    expect(normalizeSubscriptionStatus("unpaid")).toBe("canceled");
    expect(normalizeSubscriptionStatus("incomplete_expired")).toBe("canceled");
  });

  it("incomplete i paused → incomplete", () => {
    expect(normalizeSubscriptionStatus("incomplete")).toBe("incomplete");
    expect(normalizeSubscriptionStatus("paused")).toBe("incomplete");
  });

  it("nieznane / puste / null → free", () => {
    expect(normalizeSubscriptionStatus("cokolwiek")).toBe("free");
    expect(normalizeSubscriptionStatus("")).toBe("free");
    expect(normalizeSubscriptionStatus(null)).toBe("free");
    expect(normalizeSubscriptionStatus(undefined)).toBe("free");
  });

  it("jest niewrażliwy na wielkość liter i białe znaki", () => {
    expect(normalizeSubscriptionStatus("  ACTIVE  ")).toBe("active");
    expect(normalizeSubscriptionStatus("Trialing")).toBe("trialing");
  });
});


describe("Pro przyznane ręcznie", () => {
  it("gift wygasa po subscription_current_period_end", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const future = new Date(Date.now() + 60_000).toISOString();

    expect(effectiveSubscriptionStatus("active", "gift", past)).toBe("free");
    expect(effectiveSubscriptionStatus("active", "gift", future)).toBe("active");
    expect(effectiveSubscriptionStatus("active", "manual", past)).toBe("free");
  });

  it("płatne Pro Stripe nie wygasa lokalnie", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(effectiveSubscriptionStatus("active", "stripe", past)).toBe("active");
  });

  it("isGiftPro rozpoznaje gift i manual", () => {
    const base: SubscriptionSnapshot = {
      ...FREE_SUBSCRIPTION,
      status: "active",
      planId: "pro",
    };
    expect(isGiftPro({ ...base, source: "gift" })).toBe(true);
    expect(isGiftPro({ ...base, source: "manual" })).toBe(true);
    expect(isGiftPro({ ...base, source: "stripe" })).toBe(false);
  });
});
