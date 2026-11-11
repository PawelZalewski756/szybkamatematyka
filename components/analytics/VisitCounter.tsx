"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const CONSENT_KEY = "sm-analytics-consent";
const VISITOR_ID_KEY = "sm-analytics-visitor-id";
const SESSION_SENT_KEY = "sm-analytics-session-sent";
const CONSENT_EVENT = "sm-analytics-consent-changed";

type Consent = "unknown" | "accepted";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

function getConsent(): Consent {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" ? value : "unknown";
  } catch {
    return "accepted";
  }
}

function getServerConsent(): Consent {
  return "accepted";
}

function getVisitorId(): string | null {
  try {
    const stored = window.localStorage.getItem(VISITOR_ID_KEY);
    if (stored) return stored;
    const id = window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    return null;
  }
}

export function VisitCounter() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribe, getConsent, getServerConsent);


  useEffect(() => {
    if (consent !== "accepted" || !pathname) return;
    try {
      if (window.localStorage.getItem(CONSENT_KEY) !== "accepted") return;
      if (window.sessionStorage.getItem(SESSION_SENT_KEY)) return;
      const visitorId = getVisitorId();
      if (!visitorId) return;
      window.sessionStorage.setItem(SESSION_SENT_KEY, "1");
      void fetch("/api/analytics/pageview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitorId, path: pathname }),
        keepalive: true,
      }).catch(() => {
        window.sessionStorage.removeItem(SESSION_SENT_KEY);
      });
    } catch {
      // Brak dostepu do pamieci przegladarki: nie liczymy odwiedzin.
    }
  }, [consent, pathname]);

  function accept() {
    try {
      window.localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // Bez dostepu do pamieci przegladarki nie liczymy odwiedzin.
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }

  if (consent !== "unknown") return null;

  return (
    <aside
      aria-label="Informacja o liczniku wejść"
      className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[100] mx-auto max-w-sm rounded-xl border border-surface-border bg-surface/95 p-3 shadow-xl backdrop-blur lg:bottom-3 lg:right-3 lg:left-auto lg:mx-0"
    >
      <p className="text-xs leading-relaxed text-foreground">
        Liczymy anonimowe wejścia na stronę. Nie zbieramy danych osobowych.
      </p>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={accept}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-background"
        >
          OK
        </button>
      </div>
    </aside>
  );
}
