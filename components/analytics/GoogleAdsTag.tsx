"use client";

import Script from "next/script";
import { useEffect } from "react";

import { useConsent } from "@/components/analytics/use-consent";
import { CONSENT_STORAGE_KEY, LEGACY_CONSENT_STORAGE_KEY } from "@/lib/analytics/consent";
import {
  GOOGLE_ADS_ID,
  isGoogleAdsConfigured,
} from "@/lib/analytics/google-ads";

type GtagFn = (...args: unknown[]) => void;

/**
 * Buduje skrypt startowy tagu Google z Consent Mode v2.
 *
 * Domyślne zgody ustawiamy na `denied` (zgodnie z RODO), ale tag ładujemy
 * zawsze. Wcześniej skrypt nie był wstawiany w ogóle, dopóki użytkownik nie
 * kliknął zgody - przez co weryfikator Google i Tag Assistant widziały stronę
 * bez żadnego tagu, a Google Ads pokazywał „Nie zainstalowano" i nie chciał
 * udostępnić fragmentu kodu konwersji.
 *
 * Stan zgód czytamy od razu z localStorage, żeby powracający użytkownik nie
 * miał ani chwili z `denied`, gdy wcześniej wyraził zgodę.
 */
function buildTagScript(): string {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
try {
  var stored = JSON.parse(window.localStorage.getItem('${CONSENT_STORAGE_KEY}') || 'null');
  var marketing = !!(stored && stored.marketing);
  var analytics = !!(stored && stored.analytics) ||
    window.localStorage.getItem('${LEGACY_CONSENT_STORAGE_KEY}') === 'accepted';
  gtag('consent', 'default', {
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
    analytics_storage: analytics ? 'granted' : 'denied',
    wait_for_update: 500
  });
} catch (e) {
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });
}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');
`;
}

/**
 * Globalny tag Google Ads (gtag.js) na wszystkich stronach.
 * Wymagany do pomiaru konwersji (rejestracja, zakup) i do tego, żeby Google
 * uznał tag za zainstalowany.
 */
export function GoogleAdsTag() {
  const consent = useConsent();

  useEffect(() => {
    if (!isGoogleAdsConfigured()) return;

    const payload = {
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
      analytics_storage: consent.analytics ? "granted" : "denied",
    };

    const apply = (): boolean => {
      const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
      if (typeof gtag !== "function") return false;
      gtag("consent", "update", payload);
      return true;
    };

    // Skrypt tagu wstrzykuje się po hydracji - czekamy, aż gtag będzie gotowy.
    if (apply()) return;

    const intervalId = window.setInterval(() => {
      if (apply()) window.clearInterval(intervalId);
    }, 150);
    const timeoutId = window.setTimeout(
      () => window.clearInterval(intervalId),
      10000,
    );

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [consent.analytics, consent.marketing]);

  if (!isGoogleAdsConfigured()) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {buildTagScript()}
      </Script>
    </>
  );
}
