import { normalizeReferralCode } from "@/lib/referral/codes";

/**
 * Kod polecający trzymamy w localStorage, żeby przetrwał przejście
 * z linku na stronę rejestracji (i ewentualne odświeżenie). 30 dni to
 * rozsądne okno na decyzję o założeniu konta.
 */
export const REFERRAL_STORAGE_KEY = "sm-referral";
export const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type StoredReferral = {
  code: string;
  expiresAt: number;
};

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Czysta funkcja - łatwa do testów bez `window`. */
export function parseStoredReferral(
  raw: string | null,
  now: number = Date.now(),
): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredReferral>;
    const code = normalizeReferralCode(parsed.code);
    if (!code) return null;
    if (typeof parsed.expiresAt !== "number" || parsed.expiresAt <= now) {
      return null;
    }
    return code;
  } catch {
    return null;
  }
}

export function storeReferralCode(
  code: string,
  now: number = Date.now(),
): boolean {
  const normalized = normalizeReferralCode(code);
  const storage = getStorage();
  if (!normalized || !storage) return false;

  try {
    storage.setItem(
      REFERRAL_STORAGE_KEY,
      JSON.stringify({ code: normalized, expiresAt: now + REFERRAL_TTL_MS }),
    );
    return true;
  } catch {
    return false;
  }
}

export function readReferralCode(now: number = Date.now()): string | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(REFERRAL_STORAGE_KEY);
    const code = parseStoredReferral(raw, now);
    if (!code) storage.removeItem(REFERRAL_STORAGE_KEY);
    return code;
  } catch {
    return null;
  }
}

export function clearReferralCode(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // Brak dostępu do localStorage - nic nie szkodzi.
  }
}
