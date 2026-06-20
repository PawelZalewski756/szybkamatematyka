"use client";

import { useSubscription } from "@/lib/subscription/use-subscription";

export type RequireProState = {
  /** Czy trwa ustalanie statusu (pokaż loader, nie pokazuj paywalla). */
  loading: boolean;
  isLoggedIn: boolean;
  /** Czy dostęp do treści Pro jest dozwolony. */
  allowed: boolean;
  /** Powód braku dostępu — przydatny do dopasowania komunikatu/CTA. */
  reason: "ok" | "loading" | "not_logged_in" | "needs_pro";
  refresh: () => Promise<void>;
};

/**
 * Lekki hook bramkujący: zwraca `allowed` gdy użytkownik ma aktywne Pro.
 * Gotowy do użycia w dowolnym miejscu, np.:
 *
 *   const { allowed, reason } = useRequirePro();
 *   if (!allowed) return <ProGate />;
 *
 * NIE bramkuje niczego sam — to czysta logika; renderowanie zostawiamy
 * komponentom (np. <ProGate>).
 */
export function useRequirePro(): RequireProState {
  const { loading, isLoggedIn, isPro, refresh } = useSubscription();

  const reason: RequireProState["reason"] = loading
    ? "loading"
    : isPro
      ? "ok"
      : isLoggedIn
        ? "needs_pro"
        : "not_logged_in";

  return {
    loading,
    isLoggedIn,
    allowed: isPro,
    reason,
    refresh,
  };
}
