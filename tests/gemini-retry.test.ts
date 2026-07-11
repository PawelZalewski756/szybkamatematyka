import { describe, expect, it } from "vitest";
import {
  formatGeminiWaitLabel,
  getGeminiRetryWaitMs,
  isDailyQuotaExhausted,
  isRetryableGeminiError,
  parseGeminiRetryDelayMs,
} from "@/lib/gemini/gemini-retry";

describe("parseGeminiRetryDelayMs", () => {
  it("parses retry in Xs from API message", () => {
    const ms = parseGeminiRetryDelayMs(
      '429 ResourceExhausted: Please retry in 42.5s.',
    );
    expect(ms).toBe(Math.ceil(42.5 * 1000) + 2500);
  });

  it("parses retryDelay JSON field", () => {
    const ms = parseGeminiRetryDelayMs('{"retryDelay":"120s"}');
    expect(ms).toBe(120_000 + 2500);
  });

  it("parses minutes", () => {
    const ms = parseGeminiRetryDelayMs("try again in 2 min");
    expect(ms).toBe(120_000 + 2500);
  });

  it("returns null when no delay hint", () => {
    expect(parseGeminiRetryDelayMs("network error")).toBeNull();
  });
});

describe("getGeminiRetryWaitMs", () => {
  it("prefers parsed delay over fallback for rate limits", () => {
    expect(getGeminiRetryWaitMs("retry in 10s", 99)).toBe(10_000 + 2500);
  });

  it("ignores short retry hint when daily quota is exhausted", () => {
    const msg =
      '429 Quota exceeded GenerateRequestsPerDayPerProjectPerModel-FreeTier Please retry in 33s';
    expect(getGeminiRetryWaitMs(msg, 1)).toBeGreaterThan(30 * 60_000);
  });
});

describe("isDailyQuotaExhausted", () => {
  it("detects daily free tier quota from API message", () => {
    expect(
      isDailyQuotaExhausted(
        "GenerateRequestsPerDayPerProjectPerModel-FreeTier quota exceeded",
      ),
    ).toBe(true);
    expect(isDailyQuotaExhausted("retry in 5s")).toBe(false);
  });
});

describe("formatGeminiWaitLabel", () => {
  it("formats seconds and minutes", () => {
    expect(formatGeminiWaitLabel(45_000)).toBe("45 s");
    expect(formatGeminiWaitLabel(90_000)).toBe("1.5 min");
  });
});

describe("isRetryableGeminiError", () => {
  it("detects quota and parsed retry messages", () => {
    expect(isRetryableGeminiError("429 quota exceeded")).toBe(true);
    expect(isRetryableGeminiError("retry in 5s")).toBe(true);
    expect(isRetryableGeminiError("invalid JSON from model")).toBe(false);
  });
});
