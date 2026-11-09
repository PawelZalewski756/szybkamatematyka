/**
 * Oficjalne arkusze maturalne CKE - matematyka, poziom rozszerzony (termin główny).
 * Import: scripts/importCkeE8.ts (ten sam pipeline co egzamin ósmoklasisty).
 */

import type { CkeE8Session } from "./e8-sessions";

const OLD = "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2015/Arkusze_egzaminacyjne";
const NEW = "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne";

function r(
  rok: number,
  miesiac: number,
  arkuszUrl: string,
  zasadyUrl: string,
): CkeE8Session {
  const mies = miesiac === 6 ? "czerwiec" : "maj";
  return {
    id: `mr-${rok}-${miesiac === 6 ? "cze" : "maj"}`,
    nazwa: `Matura - ${mies} ${rok} - poziom rozszerzony`,
    rok,
    miesiac,
    arkuszUrl,
    zasadyUrl,
    typ: "matura",
  };
}

export const CKE_MATURA_R_SESSIONS: CkeE8Session[] = [
  r(
    2015,
    5,
    `${OLD}/2015/formula_od_2015/MMA-R1_1P-152.pdf`,
    `${OLD}/2015/formula_od_2015/odpowiedzi/MMA-R1-N.pdf`,
  ),
  r(
    2016,
    5,
    `${OLD}/2016/formula_od_2015/MMA-R1_1P-162.pdf`,
    `${OLD}/2016/formula_od_2015/zasady_oceniania/MMA-R1-N.pdf`,
  ),
  r(
    2017,
    5,
    `${OLD}/2017/formula_od_2015/matematyka/MMA-R1_1P-172.pdf`,
    `${OLD}/2017/formula_od_2015/zasady_oceniania/MMA-R1-N.pdf`,
  ),
  r(
    2018,
    5,
    `${OLD}/2018/formula_od_2015/matematyka/MMA-R1_1P-182.pdf`,
    `${OLD}/2018/formula_od_2015/Zasady_oceniania/MMA-R1_1P-182_zasady_oceniania.pdf`,
  ),
  r(
    2019,
    5,
    `${OLD}/2019/formula_od_2015/matematyka/MMA-R1_1P-192.pdf`,
    `${OLD}/2019/formula_od_2015/Zasady_oceniania/MMA-R1_1P-192_model.pdf`,
  ),
  r(
    2020,
    6,
    `${OLD}/2020/formula_od_2015/matematyka/MMA-R1_1P-202.pdf`,
    `${OLD}/2020/formula_od_2015/Zasady_oceniania/MMA-PR-202_zasady.pdf`,
  ),
  r(
    2021,
    5,
    `${OLD}/2021/Matematyka/poziom_rozszerzony/EMAP-R0-100-2105.pdf`,
    `${OLD}/2021/Zasady_Oceniania/EMAP-R0-100-2105-zasady.pdf`,
  ),
  r(
    2022,
    5,
    `${OLD}/2022/Matematyka/poziom_rozszerzony/EMAP-R0-100-2205.pdf`,
    `${OLD}/2022/Zasady_oceniania/EMAP-R0-100-2205-zasady.pdf`,
  ),
  r(
    2023,
    5,
    `${NEW}/2023/Matematyka/poziom_rozszerzony/MMAP-R0-100-2305.pdf`,
    `${NEW}/2023/Matematyka/poziom_rozszerzony/MMAP-R0-100-2305-zasady.pdf`,
  ),
  r(
    2024,
    5,
    `${NEW}/2024/Matematyka/poziom_rozszerzony/MMAP-R0-100-A-2405-arkusz.pdf`,
    `${NEW}/2024/Matematyka/poziom_rozszerzony/MMAP-R0-100-2405-zasady.pdf`,
  ),
  r(
    2025,
    5,
    `${NEW}/2025/Matematyka/poziom_rozszerzony/MMAP-R0-100-A-2505-arkusz.pdf`,
    `${NEW}/2025/zasady_oceniania/MMAP-R0-100-2505-zasady.pdf`,
  ),
  r(
    2026,
    5,
    `${NEW}/2026/Matematyka/poziom_rozszerzony/MMAP-R0-100-A-2605-arkusz.pdf`,
    `${NEW}/2026/Matematyka/poziom_rozszerzony/MMAP-R0-100-2605-zasady.pdf`,
  ),
];
