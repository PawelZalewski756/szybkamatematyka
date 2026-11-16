"use client";

import { CONSENT_STORAGE_KEY, LEGACY_CONSENT_STORAGE_KEY } from "@/lib/analytics/consent";

/** Czyści zapisaną zgodę i pokazuje baner ponownie po odświeżeniu. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          window.localStorage.removeItem(CONSENT_STORAGE_KEY);
          window.localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);
        } catch {
          // Brak dostępu do pamięci - nic nie szkodzi, baner i tak się pokaże.
        }
        window.location.reload();
      }}
      className="mt-3 inline-flex rounded-lg border border-surface-border px-3 py-2 text-sm font-semibold text-foreground transition hover:border-accent/50 hover:text-accent"
    >
      Zmień zgodę na cookies
    </button>
  );
}
