"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useConsent } from "@/components/analytics/use-consent";

/**
 * Baner zgód. Pokazujemy go tylko poza aktywną rozgrywką, żeby nie zasłaniał
 * odpowiedzi w minigrach.
 */
export function CookieConsentBanner() {
  const consent = useConsent();
  const pathname = usePathname();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (consent.decided) return null;
  if (pathname.startsWith("/minigry/") && pathname !== "/minigry") return null;

  return (
    <aside
      aria-label="Zgoda na pliki cookies"
      className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[110] mx-auto max-w-md rounded-2xl border border-surface-border bg-surface/95 p-4 shadow-xl backdrop-blur print:hidden lg:bottom-4 lg:right-4 lg:left-auto lg:mx-0"
    >
      <p className="text-sm font-bold text-foreground">Cookies i reklamy</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Analityka liczy anonimowe wejścia, a reklamy Google mierzą skuteczność
        kampanii.{" "}
        <Link href="/polityka-prywatnosci" className="underline">
          Szczegóły
        </Link>
      </p>

      {expanded ? (
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Analityka (anonimowe wejścia)
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Reklamy Google
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => consent.save({ analytics, marketing })}
              className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-on-accent"
            >
              Zapisz wybór
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-lg border border-surface-border px-3 py-2 text-xs font-bold text-foreground"
            >
              Wróć
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                consent.save({ analytics: true, marketing: true })
              }
              className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-on-accent"
            >
              Akceptuję wszystkie
            </button>
            <button
              type="button"
              onClick={() =>
                consent.save({ analytics: false, marketing: false })
              }
              className="rounded-lg border border-surface-border px-3 py-2 text-xs font-bold text-foreground"
            >
              Tylko niezbędne
            </button>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="px-2 py-2 text-xs font-semibold text-muted underline underline-offset-2"
            >
              Dostosuj
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
