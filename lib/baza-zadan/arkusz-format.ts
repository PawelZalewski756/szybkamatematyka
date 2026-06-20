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

/** Etykieta arkusza: „Arkusz — maj 2024”. */
export function formatArkuszLabel(arkusz: ArkuszLabelSource): string {
  if (
    arkusz.miesiac != null &&
    arkusz.miesiac >= 1 &&
    arkusz.miesiac <= 12
  ) {
    return `Arkusz — ${MIESIACE_PL[arkusz.miesiac - 1]} ${arkusz.rok}`;
  }
  return arkusz.nazwa;
}

export function buildArkuszNazwa(miesiac: number, rok: number): string {
  return formatArkuszLabel({ nazwa: "", miesiac, rok });
}
