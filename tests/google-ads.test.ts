import { afterEach, describe, expect, it, vi } from "vitest";

describe("google-ads config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("używa domyślnego ID konta Ads", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_ID", "");
    vi.resetModules();
    const { GOOGLE_ADS_ID, isGoogleAdsConfigured } = await import(
      "@/lib/analytics/google-ads"
    );
    expect(GOOGLE_ADS_ID).toBe("AW-18540137652");
    expect(isGoogleAdsConfigured()).toBe(true);
  });

  it("pozwala nadpisać ID zmienną środowiskową", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_ID", "AW-999");
    vi.resetModules();
    const { GOOGLE_ADS_ID, isGoogleAdsConfigured } = await import(
      "@/lib/analytics/google-ads"
    );
    expect(GOOGLE_ADS_ID).toBe("AW-999");
    expect(isGoogleAdsConfigured()).toBe(true);
  });
});
