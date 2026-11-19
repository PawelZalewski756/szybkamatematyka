/**
 * Publiczny ID tagu Google Ads (gtag). Nie jest sekretem - i tak trafia do HTML.
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

/**
 * Etykieta konwersji „Zakup PRO” (płatna subskrypcja).
 *
 * Bez niej Google Ads widzi wyłącznie rejestracje, więc uczy się kupować
 * darmowe konta, a nie klientów. Etykietę znajdziesz w panelu:
 * Google Ads → Narzędzia → Konwersje → „Zakup PRO” → fragment `send_to`
 * po ukośniku (np. `AW-18540137652/AbC-D_efGh`).
 *
 * Celowo brak wartości domyślnej: dopóki jej nie ustawisz, zdarzenie się nie
 * wyśle (lepiej zero danych niż konwersja przypisana do złej etykiety).
 */
export const GOOGLE_ADS_PURCHASE_CONVERSION =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION?.trim() || "";

export function isGoogleAdsConfigured(): boolean {
  return /^AW-\d+$/.test(GOOGLE_ADS_ID);
}

export function isGoogleAdsSignupConversionConfigured(): boolean {
  return /^AW-\d+\/[\w-]+$/.test(GOOGLE_ADS_SIGNUP_CONVERSION);
}

export function isGoogleAdsPurchaseConversionConfigured(): boolean {
  return /^AW-\d+\/[\w-]+$/.test(GOOGLE_ADS_PURCHASE_CONVERSION);
}
