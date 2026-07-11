/** Modele z osobnymi limitami RPD (per model) — rotacja przy limicie dziennym. */

const DEFAULT_THEORY_MODEL_CHAIN = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
] as const;

export function getTheoryModelChain(): string[] {
  const fallback = process.env.GEMINI_MODEL_FALLBACK?.trim();
  if (fallback) {
    return fallback
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }

  const primary = process.env.GEMINI_MODEL?.trim();
  if (primary && !DEFAULT_THEORY_MODEL_CHAIN.includes(primary as (typeof DEFAULT_THEORY_MODEL_CHAIN)[number])) {
    return [primary, ...DEFAULT_THEORY_MODEL_CHAIN];
  }

  return [...DEFAULT_THEORY_MODEL_CHAIN];
}

/** Wyciąga nazwę modelu z komunikatu błędu quota (jeśli jest). */
export function parseQuotaModelFromError(message: string): string | null {
  const match =
    message.match(/"model"\s*:\s*"([^"]+)"/) ??
    message.match(/model:\s*([a-z0-9.-]+)/i);
  return match?.[1] ?? null;
}
