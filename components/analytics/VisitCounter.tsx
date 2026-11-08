"use client";

import { isCountablePath } from "@/lib/analytics/visit-counter";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Anonimowy licznik wejść: wysyła tylko ścieżkę strony. Nic nie zapisuje
 * w przeglądarce i nie przesyła identyfikatora odwiedzającego.
 */
export function VisitCounter() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !isCountablePath(pathname)) return;
    try {
      void fetch("/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
        credentials: "omit",
      }).catch(() => undefined);
    } catch {
      // brak licznika nie może psuć strony
    }
  }, [pathname]);

  return null;
}
