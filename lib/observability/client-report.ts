"use client";

/**
 * Raport błędów z przeglądarki — bez stacków i bez danych formularzy.
 * Serwer sam zdecyduje, czy przekazać zdarzenie do Sentry.
 */

function errorPayload(error: unknown): { message: string; digest?: string } {
  const message =
    error instanceof Error
      ? error.message.slice(0, 300)
      : typeof error === "string"
        ? error.slice(0, 300)
        : "client error";
  let digest: string | undefined;
  if (typeof error === "object" && error !== null && "digest" in error) {
    const raw = (error as { digest?: unknown }).digest;
    if (raw != null) digest = String(raw).slice(0, 80);
  }
  return { message, digest };
}

export function reportClientError(error: unknown, source = "client"): void {
  try {
    console.error(error);
    const payload = { ...errorPayload(error), source };
    void fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* monitoring never blocks UI */
    });
  } catch {
    /* ignore */
  }
}
