import { describe, expect, it } from "vitest";
import { consumeMemoryRateLimit } from "@/lib/rate-limit";

describe("consumeMemoryRateLimit", () => {
  it("wpuszcza żądania aż do limitu, potem blokuje do końca okna", () => {
    const key = `test-${Math.random()}`;
    const now = 1_700_000_000_000;
    const first = consumeMemoryRateLimit(key, 2, 60_000, now);
    const second = consumeMemoryRateLimit(key, 2, 60_000, now + 10);
    const third = consumeMemoryRateLimit(key, 2, 60_000, now + 20);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSec).toBeGreaterThan(0);
    expect(third.source).toBe("memory");
  });

  it("resetuje okno po upływie czasu", () => {
    const key = `test-${Math.random()}`;
    const now = 2_000_000_000_000;
    consumeMemoryRateLimit(key, 1, 1000, now);
    const blocked = consumeMemoryRateLimit(key, 1, 1000, now + 10);
    const afterWindow = consumeMemoryRateLimit(key, 1, 1000, now + 1001);
    expect(blocked.allowed).toBe(false);
    expect(afterWindow.allowed).toBe(true);
  });
});
