"use client";

import Script from "next/script";

import { useConsent } from "@/components/analytics/use-consent";
import {
  GOOGLE_ADS_ID,
  isGoogleAdsConfigured,
} from "@/lib/analytics/google-ads";

/**
 * Globalny tag Google Ads (gtag.js) na wszystkich stronach.
 * Wymagany do pomiaru konwersji (rejestracja, zakup).
 */
export function GoogleAdsTag() {
  const consent = useConsent();

  // Tag reklamowy ładujemy wyłącznie po zgodzie na marketing - nie tylko go ukrywamy.
  if (!isGoogleAdsConfigured() || !consent.marketing) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: '${consent.analytics ? "granted" : "denied"}'
          });
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
