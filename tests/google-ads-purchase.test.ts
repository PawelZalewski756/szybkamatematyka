import { afterEach, describe, expect, it, vi } from "vitest";

function createSessionStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe("google-ads purchase conversion", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("używa domyślnej etykiety konwersji zakupu", async () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION", "");
    vi.resetModules();
    const { buildPurchaseConversion } = await import(
      "@/lib/analytics/purchase"
    );

    expect(
      buildPurchaseConversion({
        sessionId: "cs_test_1",
        amountTotalMinorUnits: 2900,
        currency: "pln",
      }),
    ).toEqual({
      sendTo: "AW-18540137652/cQaICLWAwrsdELSZ0IhFt",
      transactionId: "cs_test_1",
      value: 29,
      currency: "PLN",
    });
  });

  it("odrzuca nieprawidłową etykietę konwersji", async () => {
    vi.resetModules();
    const { buildPurchaseConversion } = await import(
      "@/lib/analytics/purchase"
    );

    expect(
      buildPurchaseConversion(
        {
          sessionId: "cs_test_1",
          amountTotalMinorUnits: 2900,
          currency: "pln",
        },
        "AW-18540137652",
      ),
    ).toBeNull();
  });

  it("przelicza grosze na złote i normalizuje walutę", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION",
      "AW-18540137652/AbC_dEf",
    );
    vi.resetModules();
    const { buildPurchaseConversion } = await import(
      "@/lib/analytics/purchase"
    );

    expect(
      buildPurchaseConversion({
        sessionId: "  cs_test_2  ",
        amountTotalMinorUnits: 24900,
        currency: "pln",
        planId: "roczny",
      }),
    ).toEqual({
      sendTo: "AW-18540137652/AbC_dEf",
      transactionId: "cs_test_2",
      value: 249,
      currency: "PLN",
    });
  });

  it("odrzuca sesję bez identyfikatora", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION",
      "AW-18540137652/AbC_dEf",
    );
    vi.resetModules();
    const { buildPurchaseConversion } = await import(
      "@/lib/analytics/purchase"
    );

    expect(
      buildPurchaseConversion({
        sessionId: "   ",
        amountTotalMinorUnits: 2900,
        currency: "pln",
      }),
    ).toBeNull();
  });

  it("liczy wartość w złotych z zaokrągleniem", async () => {
    vi.resetModules();
    const { toMajorUnits } = await import("@/lib/analytics/purchase");

    expect(toMajorUnits(2900)).toBe(29);
    expect(toMajorUnits(24900)).toBe(249);
    expect(toMajorUnits(1999)).toBe(19.99);
    expect(toMajorUnits(0)).toBe(0);
    expect(toMajorUnits(-500)).toBe(0);
    expect(toMajorUnits(null)).toBe(0);
    expect(toMajorUnits(Number.NaN)).toBe(0);
  });

  it("normalizuje kod waluty do ISO 4217", async () => {
    vi.resetModules();
    const { normalizeCurrency } = await import("@/lib/analytics/purchase");

    expect(normalizeCurrency("pln")).toBe("PLN");
    expect(normalizeCurrency(" usd ")).toBe("USD");
    expect(normalizeCurrency(null)).toBe("PLN");
    expect(normalizeCurrency("zł")).toBe("PLN");
  });

  it("wysyła komplet pól wymaganych przez Google Ads", async () => {
    vi.resetModules();
    const { sendPurchaseConversion } = await import(
      "@/lib/analytics/purchase"
    );
    const gtag = vi.fn();

    sendPurchaseConversion(gtag, {
      sendTo: "AW-18540137652/AbC_dEf",
      transactionId: "cs_test_3",
      value: 29,
      currency: "PLN",
    });

    expect(gtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: "AW-18540137652/AbC_dEf",
      value: 29,
      currency: "PLN",
      transaction_id: "cs_test_3",
    });
  });

  it("wysyła konwersję tylko raz dla tej samej sesji", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION",
      "AW-18540137652/AbC_dEf",
    );
    vi.resetModules();
    const gtag = vi.fn();
    vi.stubGlobal("window", {
      sessionStorage: createSessionStorage(),
      gtag,
    });
    const { trackPurchaseConversion } = await import(
      "@/lib/analytics/purchase"
    );
    const input = {
      sessionId: "cs_dup_1",
      amountTotalMinorUnits: 2900,
      currency: "pln",
    };

    trackPurchaseConversion(input, { gtag, timeoutMs: 5, intervalMs: 1 });
    trackPurchaseConversion(input, { gtag, timeoutMs: 5, intervalMs: 1 });

    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("nie rzuca, gdy tag nie jest jeszcze załadowany", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION",
      "AW-18540137652/AbC_dEf",
    );
    vi.resetModules();
    const { trackPurchaseConversion } = await import(
      "@/lib/analytics/purchase"
    );

    expect(() =>
      trackPurchaseConversion({
        sessionId: "cs_no_tag",
        amountTotalMinorUnits: 2900,
        currency: "pln",
      }),
    ).not.toThrow();
  });
});
