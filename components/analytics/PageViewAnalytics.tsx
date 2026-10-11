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
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (consent !== "accepted" || editingConsent || !pathname) return;
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    let visitorId: string;
    const isLandingPage = lastTrackedPath.current === null;
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
    } catch (error) {
      console.error("Could not save analytics consent:", error);
    }
  }

  if (consent !== "unknown" && !editingConsent) {
    return (
      <button
        type="button"
        onClick={() => {
          setEditingConsent(true);
        }}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] right-3 z-[90] rounded-full border border-surface-border bg-surface px-3 py-2 text-xs font-semibold text-muted shadow-lg hover:text-foreground lg:bottom-3"
      >
        Ustawienia prywatności
      </button>
    );
  }

  return (
    <aside
      aria-label="Zgoda na anonimową analitykę"
      className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-[100] mx-auto max-w-xl rounded-2xl border border-surface-border bg-surface p-4 shadow-2xl lg:bottom-4"
    >
      <p className="text-sm text-foreground">
        Czy możemy anonimowo mierzyć odsłony, sesje, rejestracje i pierwsze
        rozwiązane zadanie, aby ulepszać serwis? Zapisujemy też źródło kampanii
        (UTM), jeśli odwiedzasz stronę z oznaczonego linku. Nie zapisujemy
        adresu IP ani danych konta. Losowy identyfikator przeglądarki zapisujemy
        wyłącznie po zgodzie. Zapisujemy tylko domenę strony odsyłającej, bez
        pełnego adresu.
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => chooseConsent("rejected")}
          className="rounded-xl border border-surface-border px-3 py-2 text-sm font-semibold text-muted hover:text-foreground"
        >
          Odrzuć
        </button>
        <button
          type="button"
          onClick={() => chooseConsent("accepted")}
          className="rounded-xl bg-accent px-3 py-2 text-sm font-bold text-background"
        >
          Zgadzam się
        </button>
      </div>
    </aside>
  );
}
