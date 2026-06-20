/** Działy matematyki — używane w panelu admin i filtrach. */
export const DZIALY_MATEMATYKI = [
  "Arytmetyka",
  "Ułamki",
  "Procenty",
  "Potęgi",
  "Pierwiastki",
  "Logarytmy",
  "Ciągi",
  "Funkcje",
  "Równania",
  "Geometria",
  "Trygonometria",
  "Kombinatoryka",
  "Prawdopodobieństwo",
  "Statystyka",
  "Algebra",
  "Inne",
] as const;

export type DzialMatematyki = (typeof DZIALY_MATEMATYKI)[number];

export const TYP_EGZAMINU_LABELS = {
  matura: "Matura",
  "egzamin-8": "Egzamin 8-klasisty",
} as const;

export type TypEgzaminu = keyof typeof TYP_EGZAMINU_LABELS;
