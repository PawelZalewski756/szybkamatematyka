/**
 * Zgody na pliki cookies i technologie reklamowe.
 *
 * Trzymamy je w jednym miejscu, żeby analityka i Google Ads korzystały z tej
 * samej decyzji użytkownika. Dopóki nie ma zapisanej zgody, tag reklamowy nie
 * jest w ogóle ładowany - samo ukrycie skryptu byłoby niewystarczające.
 */

export type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

export type ConsentSnapshot = ConsentState & {
  /** Czy użytkownik podjął już decyzję (wtedy nie pokazujemy banera). */
  decided: boolean;
};

export const CONSENT_STORAGE_KEY = "sm-consent-v2";
export const LEGACY_CONSENT_STORAGE_KEY = "sm-analytics-consent";
export const CONSENT_EVENT = "sm-consent-changed";

const SERVER_SNAPSHOT: ConsentSnapshot = {
  decided: true,
  analytics: false,
  marketing: false,
};

let cached: ConsentSnapshot | null = null;

function parseStoredConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const analytics = (parsed as { analytics?: unknown }).analytics === true;
    const marketing = (parsed as { marketing?: unknown }).marketing === true;
    return { analytics, marketing };
  } catch {
    return null;
  }
}

export function readConsent(): ConsentSnapshot {
  if (cached) return cached;

  try {
    const stored = parseStoredConsent(
      window.localStorage.getItem(CONSENT_STORAGE_KEY),
    );
    if (stored) {
      cached = { ...stored, decided: true };
      return cached;
    }

    // Stara zgoda dotyczyła wyłącznie analityki - nie rozszerzamy jej na reklamy.
    if (
      window.localStorage.getItem(LEGACY_CONSENT_STORAGE_KEY) === "accepted"
    ) {
      cached = { decided: true, analytics: true, marketing: false };
      return cached;
    }

    cached = { decided: false, analytics: false, marketing: false };
    return cached;
  } catch {
    // Brak dostępu do localStorage: bezpiecznie udajemy brak zgody.
    cached = { decided: true, analytics: false, marketing: false };
    return cached;
  }
}

export function getServerConsent(): ConsentSnapshot {
  return SERVER_SNAPSHOT;
}

export function saveConsent(state: ConsentState): void {
  cached = { ...state, decided: true };
  try {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ analytics: state.analytics, marketing: state.marketing }),
    );
    window.localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);
  } catch {
    // Bez dostępu do pamięci zgoda obowiązuje tylko w tej sesji.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function subscribeConsent(onChange: () => void): () => void {
  const handleChange = () => {
    cached = null;
    onChange();
  };
  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === CONSENT_STORAGE_KEY ||
      event.key === LEGACY_CONSENT_STORAGE_KEY
    ) {
      cached = null;
      onChange();
    }
  };
  window.addEventListener(CONSENT_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}
