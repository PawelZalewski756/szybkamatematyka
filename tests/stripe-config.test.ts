import { afterEach, describe, expect, it, vi } from "vitest";

describe("resolveSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("używa NEXT_PUBLIC_SITE_URL bez końcowego slasha", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://szybkamatematyka.pl/");
    const { resolveSiteUrl } = await import("@/lib/stripe/config");
    expect(resolveSiteUrl("http://ignored.example")).toBe(
      "https://szybkamatematyka.pl",
    );
  });

  it("spada na origin żądania, potem localhost", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const { resolveSiteUrl } = await import("@/lib/stripe/config");
    expect(resolveSiteUrl("https://preview.example")).toBe(
      "https://preview.example",
    );
    expect(resolveSiteUrl(null)).toBe("http://localhost:3000");
  });
});

describe("isStripeConfigured", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("wymaga niepustego STRIPE_SECRET_KEY", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    const { isStripeConfigured } = await import("@/lib/stripe/config");
    expect(isStripeConfigured()).toBe(false);

    vi.stubEnv("STRIPE_SECRET_KEY", "  sk_test_x  ");
    vi.resetModules();
    const again = await import("@/lib/stripe/config");
    expect(again.isStripeConfigured()).toBe(true);
  });
});
