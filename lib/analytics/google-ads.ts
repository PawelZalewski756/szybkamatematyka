/**
 * Publiczny ID tagu Google Ads (gtag). Nie jest sekretem — i tak trafia do HTML.
 * Nadpisanie: NEXT_PUBLIC_GOOGLE_ADS_ID.
 */
export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-18540137652";

export function isGoogleAdsConfigured(): boolean {
  return /^AW-\d+$/.test(GOOGLE_ADS_ID);
}
