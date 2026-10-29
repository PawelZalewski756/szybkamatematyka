import Script from "next/script";

import {
  GOOGLE_ADS_ID,
  isGoogleAdsConfigured,
} from "@/lib/analytics/google-ads";

/**
 * Globalny tag Google Ads (gtag.js) na wszystkich stronach.
 * Wymagany do pomiaru konwersji (rejestracja, zakup).
 */
export function GoogleAdsTag() {
  if (!isGoogleAdsConfigured()) return null;

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
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
