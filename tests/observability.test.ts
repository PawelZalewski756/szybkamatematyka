import { describe, expect, it } from "vitest";
import { parseSentryDsn } from "@/lib/observability/sentry-dsn";
import { sanitizeLogValue } from "@/lib/observability/logger";
import { isProductEventName } from "@/lib/metrics/product-events";

describe("parseSentryDsn", () => {
  it("czyta klasyczny DSN i buduje URL koperty", () => {
    const parsed = parseSentryDsn(
      "https://abc123@o123.ingest.sentry.io/456",
    );
    expect(parsed).toEqual({
      publicKey: "abc123",
      host: "o123.ingest.sentry.io",
      projectId: "456",
      envelopeUrl: "https://o123.ingest.sentry.io/api/456/envelope/",
    });
  });

  it("odrzuca pusty i zepsuty DSN", () => {
    expect(parseSentryDsn("")).toBeNull();
    expect(parseSentryDsn("not-a-url")).toBeNull();
  });
});

describe("sanitizeLogValue", () => {
  it("maskuje sekrety", () => {
    const sanitized = sanitizeLogValue({
      password: "tajne",
      token: "abc",
      message: "ok",
    }) as Record<string, unknown>;
    expect(sanitized.password).toBe("[redacted]");
    expect(sanitized.token).toBe("[redacted]");
    expect(sanitized.message).toBe("ok");
  });
});

describe("isProductEventName", () => {
  it("wpuszcza tylko znane zdarzenia", () => {
    expect(isProductEventName("training_open")).toBe(true);
    expect(isProductEventName("user_email")).toBe(false);
  });
});
