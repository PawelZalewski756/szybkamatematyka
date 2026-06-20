import { BRAND_DOMAIN, BRAND_NAME } from "@/lib/brand/constants";

/**
 * Bazowy URL serwisu używany przez metadata (`metadataBase`), `sitemap.ts`
 * i `robots.ts`. Źródło prawdy: `NEXT_PUBLIC_SITE_URL`; w razie braku
 * (np. lokalny build bez konfiguracji) wracamy do domeny produkcyjnej.
 *
 * Końcowy ukośnik jest ucinany, by składanie ścieżek było przewidywalne.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || `https://${BRAND_DOMAIN}`
).replace(/\/+$/, "");

/** Nazwa serwisu — spójna w `title.template`, OpenGraph i JSON-LD. */
export const SITE_NAME = BRAND_NAME;
