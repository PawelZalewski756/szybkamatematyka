"use client";

import { useLayoutEffect } from "react";

const RESET_PATH = "/login/nowe-haslo";

/**
 * Gdy Supabase nie ma adresu resetu na liście dozwolonych przekierowań, odsyła
 * link na Site URL (stronę główną) z tokenami w hashu. Przekazujemy je dalej
 * na stronę ustawiania nowego hasła.
 */
export function RecoveryRedirect() {
  useLayoutEffect(() => {
    const { pathname, hash, search } = window.location;
    if (pathname === RESET_PATH) return;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    if (params.get("type") === "recovery" && params.get("access_token")) {
      window.location.replace(`${RESET_PATH}${hash}`);
      return;
    }
    if (
      new URLSearchParams(search).get("type") === "recovery" &&
      new URLSearchParams(search).get("code")
    ) {
      window.location.replace(`${RESET_PATH}${search}`);
    }
  }, []);

  return null;
}
