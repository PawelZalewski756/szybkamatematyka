"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useConsent } from "@/components/analytics/use-consent";

const VISITOR_ID_KEY = "sm-analytics-visitor-id";
const SESSION_SENT_KEY = "sm-analytics-session-sent";

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
  const consent = useConsent();

  useEffect(() => {
    if (!consent.analytics || !pathname) return;
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
      // Brak dostępu do pamięci przeglądarki: nie liczymy odwiedzin.
    }
  }, [consent.analytics, pathname]);

  return null;
}
