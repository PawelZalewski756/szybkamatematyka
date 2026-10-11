"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  clearStoredAnalyticsIdentity,
  getOrCreateVisitorId,
  trackAnalyticsEvent,
} from "@/lib/analytics/client";
import {
  getAnalyticsReferrerDomain,
  getAnalyticsSource,
} from "@/lib/analytics/page-view";

const CONSENT_KEY = "sm-analytics-consent";
const CONSENT_EVENT = "sm-analytics-consent-changed";

type Consent = "unknown" | "accepted" | "rejected";

function subscribeToConsent(onChange: () => void) {
  window.addEventListener(CONSENT_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_EVENT, onChange);
}

function getConsentSnapshot(): Consent {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : "unknown";
  } catch {
    return "unknown";
  }
}

function getServerConsentSnapshot(): Consent {
  return "unknown";
}

export function PageViewAnalytics() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );
  const [editingConsent, setEditingConsent] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (consent !== "accepted" || editingConsent || !pathname) return;
    if (lastTrackedPath.current === pathname) return;
    const isLandingPage = lastTrackedPath.current === null;
    lastTrackedPath.current = pathname;

    let visitorId: string;
    try {
      const id = getOrCreateVisitorId();
      if (!id) return;
      visitorId = id;
    } catch (error) {
      console.error("Could not initialize anonymous analytics:", error);
      return;
    }

    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        visitorId,
        path: pathname,
        source: getAnalyticsSource(window.location.search),
        referrerDomain: isLandingPage
          ? getAnalyticsReferrerDomain(
              document.referrer,
              window.location.hostname,
            )
          : null,
      }),
      keepalive: true,
    }).then((response) => {
      if (!response.ok) {
        console.error("Page-view tracking request failed:", response.status);
      }
    }).catch((error: unknown) => {
      console.error("Page-view tracking request failed:", error);
    });
  }, [consent, editingConsent, pathname]);

  useEffect(() => {
    if (consent !== "accepted" || editingConsent || !pathname) return;
    void trackAnalyticsEvent("session_start", pathname);
  }, [consent, editingConsent, pathname]);

  function chooseConsent(choice: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(CONSENT_KEY, choice);
      if (choice === "rejected") {
        clearStoredAnalyticsIdentity();
      }
      window.dispatchEvent(new Event(CONSENT_EVENT));
      setEditingConsent(false);
      setPromptDismissed(false);
    } catch (error) {
      console.error("Could not save analytics consent:", error);
    }
  }

  if ((consent !== "unknown" && !editingConsent) || promptDismissed) {
    return (
      <button
        type="button"
        onClick={() => {
          setEditingConsent(true);
        }}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-3 z-[90] rounded-full border border-surface-border bg-surface px-3 py-2 text-xs font-semibold text-muted shadow-lg hover:text-foreground lg:bottom-3"
      >
        Prywatność
      </button>
    );
  }

  return (
    <aside
      aria-label="Zgoda na anonimową analitykę"
      className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[100] mx-auto max-w-sm rounded-xl border border-surface-border bg-surface/95 p-3 shadow-xl backdrop-blur lg:bottom-3"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs leading-relaxed text-foreground">
          Zgodzisz się na anonimowe statystyki, które pomogą nam ulepszać serwis?
        </p>
        <button
          type="button"
          aria-label="Nie teraz — zamknij komunikat"
          onClick={() => setPromptDismissed(true)}
          className="-mr-1 -mt-1 rounded-lg p-1 text-muted hover:text-foreground"
        >
          ×
        </button>
      </div>
      <details className="mt-1 text-xs text-muted">
        <summary className="w-fit cursor-pointer hover:text-foreground">
          Jakie dane?
        </summary>
        <p className="mt-1 leading-relaxed">
          Odsłony, sesje, rejestracje, pierwsze rozwiązane zadanie, źródło
          kampanii i domena strony odsyłającej. Bez adresu IP, pełnego adresu
          strony odsyłającej i danych konta. Losowy identyfikator zapisujemy
          tylko po zgodzie.
        </p>
      </details>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => chooseConsent("rejected")}
          className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
        >
          Odrzuć
        </button>
        <button
          type="button"
          onClick={() => chooseConsent("accepted")}
          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-background"
        >
          Akceptuj
        </button>
      </div>
    </aside>
  );
}
