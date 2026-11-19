/**
 * Kody polecające: 6–12 znaków, małe litery i cyfry.
 * Kod trafia do linku `/login?ref=...`, więc trzymamy go krótki i bez znaków
 * specjalnych (łatwe kopiowanie i brak problemów z URL).
 */
export const REFERRAL_CODE_PATTERN = /^[a-z0-9]{6,12}$/;

export function normalizeReferralCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toLowerCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

/** Wyciąga `?ref=` z dowolnego query stringa (także `?foo=1&ref=abc`). */
export function referralFromSearch(search: string): string | null {
  try {
    return normalizeReferralCode(new URLSearchParams(search).get("ref"));
  } catch {
    return null;
  }
}
