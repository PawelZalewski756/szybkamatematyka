import { beforeEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  clientIp,
  resetRateLimit,
} from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it("przepuszcza do limitu i blokuje kolejne żądanie", () => {
    const options = { limit: 2, windowMs: 60_000, now: 1_000 };

    expect(checkRateLimit("ip:1", options).allowed).toBe(true);
    expect(checkRateLimit("ip:1", options).allowed).toBe(true);
    const blocked = checkRateLimit("ip:1", options);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("liczy klucze niezależnie", () => {
    const options = { limit: 1, windowMs: 60_000, now: 1_000 };

    expect(checkRateLimit("a", options).allowed).toBe(true);
    expect(checkRateLimit("b", options).allowed).toBe(true);
    expect(checkRateLimit("a", options).allowed).toBe(false);
  });

  it("resetuje się po upływie okna", () => {
    const first = checkRateLimit("ip:2", {
      limit: 1,
      windowMs: 1_000,
      now: 1_000,
    });
    expect(first.allowed).toBe(true);

    const blocked = checkRateLimit("ip:2", {
      limit: 1,
      windowMs: 1_000,
      now: 1_500,
    });
    expect(blocked.allowed).toBe(false);

    const afterWindow = checkRateLimit("ip:2", {
      limit: 1,
      windowMs: 1_000,
      now: 2_500,
    });
    expect(afterWindow.allowed).toBe(true);
  });

  it("zwraca retryAfterSeconds dodatnie przy blokadzie", () => {
    const result = checkRateLimit("ip:3", {
      limit: 0,
      windowMs: 30_000,
      now: 5_000,
    });

    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(30);
  });
});

describe("clientIp", () => {
  it("bierze pierwszy adres z x-vercel-forwarded-for", () => {
    const request = new Request("http://localhost", {
      headers: { "x-vercel-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIp(request)).toBe("1.2.3.4");
  });

  it("bierze pierwszy adres z x-forwarded-for", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" },
    });
    expect(clientIp(request)).toBe("9.9.9.9");
  });

  it("fallback na x-real-ip, potem 'unknown'", () => {
    const real = new Request("http://localhost", {
      headers: { "x-real-ip": "8.8.8.8" },
    });
    expect(clientIp(real)).toBe("8.8.8.8");

    expect(clientIp(new Request("http://localhost"))).toBe("unknown");
  });
});
