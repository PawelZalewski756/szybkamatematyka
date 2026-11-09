/**
 * Brakujace w archiwum sesje matury podstawowej z matematyki, pobierane wprost z cke.gov.pl.
 * Import: scripts/importCkeE8.ts (ten sam pipeline co egzamin osmoklasisty i matura rozszerzona).
 */

import type { CkeE8Session } from "./e8-sessions";

const NEW = "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne";

export const CKE_MATURA_P_SESSIONS: CkeE8Session[] = [
  {
    id: "mp-2026-maj",
    nazwa: "Matura - maj 2026 - poziom podstawowy",
    rok: 2026,
    miesiac: 5,
    arkuszUrl: `${NEW}/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2605-arkusz.pdf`,
    zasadyUrl: `${NEW}/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-2605-zasady.pdf`,
    typ: "matura",
  },
  {
    id: "mp-2024-cze",
    nazwa: "Matura - czerwiec 2024 (termin dodatkowy) - poziom podstawowy",
    rok: 2024,
    miesiac: 6,
    arkuszUrl: `${NEW}/2024/Matematyka/poziom_podstawowy/MMAP-P0-200-A-2405-arkusz.pdf`,
    zasadyUrl: `${NEW}/2024/Matematyka/poziom_podstawowy/MMAP-P0-200-2405-zasady.pdf`,
    typ: "matura",
  },
];
