export const PRODUCT_EVENTS = [
  "training_open",
  "training_answer",
  "review_start",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENTS)[number];

export function isProductEventName(value: string): value is ProductEventName {
  return (PRODUCT_EVENTS as readonly string[]).includes(value);
}

/** Anonimowy licznik — bez user id i bez cookies. */
export function trackProductEvent(event: ProductEventName): void {
  if (typeof fetch === "undefined") return;
  try {
    void fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => {
      /* ignore */
    });
  } catch {
    /* ignore */
  }
}
