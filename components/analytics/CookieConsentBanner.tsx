"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useConsent } from "@/components/analytics/use-consent";

/**
 * Baner zgód. Pokazujemy go tylko poza aktywną rozgrywką, żeby nie zasłaniał
 * odpowiedzi w minigrach.
 *
 * Baner jest `fixed`, więc rezerwujemy mu miejsce w `main` przez zmienną
 * `--consent-banner-space` - wcześniej zasłaniał dół strony (przyciski planu,
 * opcje zadania) i wyglądało to jak zepsuta nawigacja.
 */
export function CookieConsentBanner() {
  const consent = useConsent();
  const pathname = usePathname();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  const hidden =
    consent.decided ||
    (pathname.startsWith("/minigry/") && pathname !== "/minigry");

  useEffect(() => {
    const root = document.documentElement;
    if (hidden) {
      root.style.setProperty("--consent-banner-space", "0px");
      return;
    }

    const update = () => {
      const height = ref.current?.offsetHeight ?? 0;
      root.style.setProperty("--consent-banner-space", `${height + 12}px`);
    };

    update();
    const observer = new ResizeObserver(update);
    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      root.style.setProperty("--consent-banner-space", "0px");
    };
  }, [hidden, expanded]);

  if (hidden) return null;

  return (
    <aside
      ref={ref}
      aria-label="Zgoda na pliki cookies"
      className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[110] mx-auto max-w-md rounded-2xl border border-surface-border bg-surface/95 p-3 shadow-xl backdrop-blur print:hidden lg:bottom-4 lg:right-4 lg:left-auto lg:mx-0"
    >
      <p className="text-sm font-bold text-foreground">Cookies i reklamy</p>
      <p className="mt-1 text-[11px] leading-snug text-muted">
        Analityka i reklamy Google.{" "}
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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                consent.save({ analytics: true, marketing: true })
              }
              className="rounded-lg bg-accent px-2.5 py-1.5 text-[11px] font-bold text-on-accent"
            >
              Akceptuję wszystkie
            </button>
            <button
              type="button"
              onClick={() =>
                consent.save({ analytics: false, marketing: false })
              }
              className="rounded-lg border border-surface-border px-2.5 py-1.5 text-[11px] font-bold text-foreground"
            >
              Tylko niezbędne
            </button>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="px-1.5 py-1.5 text-[11px] font-semibold text-muted underline underline-offset-2"
            >
              Dostosuj
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
