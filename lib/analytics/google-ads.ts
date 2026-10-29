/**
 * Publiczny ID tagu Google Ads (gtag). Nie jest sekretem — i tak trafia do HTML.
 * Nadpisanie: NEXT_PUBLIC_GOOGLE_ADS_ID.
 */
export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-18540137652";

/**
 * Etykieta konwersji „Rejestracja” (page load na /login/sukces).
 * send_to = AW-…/LABEL
 */
export const GOOGLE_ADS_SIGNUP_CONVERSION =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONVERSION?.trim() ||
  "AW-18540137652/BSrGCOqOgq4dELSZ0IhF";

export function isGoogleAdsConfigured(): boolean {
  return /^AW-\d+$/.test(GOOGLE_ADS_ID);
}

export function isGoogleAdsSignupConversionConfigured(): boolean {
  return /^AW-\d+\/[\w-]+$/.test(GOOGLE_ADS_SIGNUP_CONVERSION);
}
