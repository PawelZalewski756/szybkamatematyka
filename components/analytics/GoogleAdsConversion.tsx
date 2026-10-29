"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Wysyła zdarzenie konwersji Google Ads po wczytaniu strony (page load).
 * Czeka na gotowy gtag z globalnego tagu, żeby działało też po client-side router.push.
 */
export function GoogleAdsConversion({ sendTo }: { sendTo: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!sendTo || sent.current) return;

    const fire = (): boolean => {
      if (sent.current) return true;
      if (typeof window.gtag !== "function") return false;
      window.gtag("event", "conversion", { send_to: sendTo });
      sent.current = true;
      return true;
    };

    if (fire()) return;

    const intervalId = window.setInterval(() => {
      if (fire()) window.clearInterval(intervalId);
    }, 150);
    const timeoutId = window.setTimeout(
      () => window.clearInterval(intervalId),
      8000,
    );

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [sendTo]);

  return null;
}
