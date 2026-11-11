"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

const CONSENT_KEY = "sm-analytics-consent";
const VISITOR_ID_KEY = "sm-analytics-visitor-id";
const SESSION_SENT_KEY = "sm-analytics-session-sent";
const CONSENT_EVENT = "sm-analytics-consent-changed";

type Consent = "unknown" | "accepted" | "rejected";

function subscribe(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

function getConsent(): Consent {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : "unknown";
  } catch {
    return "rejected";
  }
}

function getServerConsent(): Consent {
  // Nie pokazuj niczego podczas SSR, dopoki nie znamy wyboru.
  return "rejected";
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
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (consent !== "accepted" || !pathname) return;
    try {
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

  function choose(choice: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(CONSENT_KEY, choice);
      if (choice === "rejected") {
        window.localStorage.removeItem(VISITOR_ID_KEY);
        window.sessionStorage.removeItem(SESSION_SENT_KEY);
      }
    } catch {
      // Ignoruj - wybor obowiazuje tylko do zamkniecia strony.
    }
    setChanging(false);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }

  const showPrompt = consent === "unknown" || changing;

  if (!showPrompt) {
    return (
      <button
        type="button"
        onClick={() => setChanging(true)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-3 z-[90] rounded-full border border-surface-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-muted opacity-70 hover:opacity-100 lg:bottom-3"
      >
        Prywatność
      </button>
    );
  }

  return (
    <aside
      aria-label="Zgoda na anonimowy licznik wejść"
      className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[100] mx-auto max-w-sm rounded-xl border border-surface-border bg-surface/95 p-3 shadow-xl backdrop-blur lg:bottom-3 lg:right-3 lg:left-auto lg:mx-0"
    >
      <p className="text-xs leading-relaxed text-foreground">
        Chcemy sprawdzić, ilu osobom podoba się ta strona. Możemy policzyć, że
        tu byłeś? Nie zbieramy imienia ani żadnych danych o Tobie.
      </p>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => choose("rejected")}
          className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
        >
          Nie
        </button>
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-background"
        >
          Tak
        </button>
      </div>
    </aside>
  );
}
