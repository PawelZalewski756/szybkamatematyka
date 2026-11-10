import type { TypEgzaminu } from "@/lib/baza-zadan/dzialy";

export const MIESIACE_PL = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
] as const;

export type ArkuszLabelSource = {
  nazwa: string;
  miesiac: number | null;
  rok: number;
  typ?: TypEgzaminu;
};

/** Etykieta arkusza: „Arkusz - maj 2024”. */
export function formatArkuszLabel(arkusz: ArkuszLabelSource): string {
  if (
    arkusz.miesiac != null &&
    arkusz.miesiac >= 1 &&
    arkusz.miesiac <= 12
  ) {
    const level = /rozszerzon/i.test(arkusz.nazwa)
      ? " - rozszerzona"
      : /podstawow/i.test(arkusz.nazwa)
        ? " - podstawowa"
        : "";
    const extra = /dodatkow/i.test(arkusz.nazwa) ? " (termin dodatkowy)" : "";
    return `Arkusz - ${MIESIACE_PL[arkusz.miesiac - 1]} ${arkusz.rok}${extra}${level}`;
  }
  return arkusz.nazwa;
}

export function buildArkuszNazwa(miesiac: number, rok: number): string {
  return formatArkuszLabel({ nazwa: "", miesiac, rok });
}
