/**
 * Oficjalne arkusze egzaminu ósmoklasisty z matematyki (CKE, termin główny).
 * Dane trafiają do cache przez scripts/importCkeE8.ts.
 */

export type CkeE8Session = {
  /** Slug do source_id i nazwy katalogu z obrazkami, np. e8-2025-maj */
  id: string;
  nazwa: string;
  rok: number;
  miesiac: number;
  arkuszUrl: string;
  zasadyUrl: string;
  /** Karta rozwiązań zadań otwartych (od 2024 treść zadań otwartych jest tylko tam). */
  kartaUrl?: string;
  /** Domyślnie egzamin-8. */
  typ?: "egzamin-8" | "matura";
};

const BASE =
  "https://cke.gov.pl/images/_EGZAMIN_OSMOKLASISTY/Arkusze-egzaminacyjne";

function session(
  rok: number,
  arkusz: string,
  zasady: string,
  karta?: string,
): CkeE8Session {
  return {
    id: `e8-${rok}-maj`,
    nazwa: `Egzamin ósmoklasisty - maj ${rok}`,
    rok,
    miesiac: 5,
    arkuszUrl: `${BASE}/${rok}/${arkusz}`,
    zasadyUrl: `${BASE}/${rok}/${zasady}`,
    kartaUrl: karta ? `${BASE}/${rok}/${karta}` : undefined,
  };
}

export const CKE_E8_SESSIONS: CkeE8Session[] = [
  session(
    2019,
    "matematyka/Arkusz_OMAP-100-1904.pdf",
    "zasady_oceniania/matematyka/Zasady_oceniania_OMAP-100-1904.pdf",
  ),
  session(
    2020,
    "matematyka/OMAP-100-2004.pdf",
    "zasady_oceniania/matematyka/OMAP-100-2004-zasady.pdf",
  ),
  session(
    2021,
    "matematyka/OMAP-100-X-2105.pdf",
    "zasady_oceniania/matematyka/OMAP-100-2105-zasady.pdf",
  ),
  session(
    2022,
    "matematyka/OMAP-100-2205.pdf",
    "zasady_oceniania/Matematyka/OMAP-100-2205-zasady.pdf",
  ),
  session(
    2023,
    "matematyka/OMAP-100-2305.pdf",
    "matematyka/OMAP-100-2305-zasady.pdf",
  ),
  session(
    2024,
    "matematyka/OMAP-100-X-2405-zeszyt-zadan.pdf",
    "matematyka/OMAP-100-2405-zasady.pdf",
  ),
  session(
    2025,
    "matematyka/OMAP-100-X-2505-zeszyt-zadan.pdf",
    "matematyka/OMAP-100-2505-zasady.pdf",
    "matematyka/Karta-rozwiazan-zadan-matematyka-2505.pdf",
  ),
  session(
    2026,
    "matematyka/OMAP-100-X-2605-zeszyt-zadan.pdf",
    "matematyka/OMAP-100-2605-zasady.pdf",
    "matematyka/Karta-rozwiazan-zadan-otwartych-2605.pdf",
  ),
];
