/** Modele z osobnymi limitami RPD (per model) - rotacja przy limicie dziennym. */

const DEFAULT_THEORY_MODEL_CHAIN = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
] as const;

export function getTheoryModelChain(): string[] {
  const primary = process.env.GEMINI_MODEL?.trim();
  const fallback = process.env.GEMINI_MODEL_FALLBACK?.trim();
  const configuredFallbacks =
    fallback
      ?.split(",")
      .map((model) => model.trim())
      .filter(Boolean) ?? [];

  return [
    ...new Set([
      ...(primary ? [primary] : []),
      ...configuredFallbacks,
      ...DEFAULT_THEORY_MODEL_CHAIN,
    ]),
  ];
}

/** Wyciąga nazwę modelu z komunikatu błędu quota (jeśli jest). */
export function parseQuotaModelFromError(message: string): string | null {
  const match =
    message.match(/"model"\s*:\s*"([^"]+)"/) ??
    message.match(/model:\s*([a-z0-9.-]+)/i);
  return match?.[1] ?? null;
}
