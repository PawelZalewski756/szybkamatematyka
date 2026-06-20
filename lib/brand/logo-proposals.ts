export type LogoProposalId =
  | "bar"
  | "monogram"
  | "equal"
  | "rise"
  | "delta";

export type LogoProposal = {
  id: LogoProposalId;
  name: string;
  tagline: string;
  pros: readonly string[];
};

export const LOGO_PROPOSALS: readonly LogoProposal[] = [
  {
    id: "bar",
    name: "Pasek",
    tagline: "Minimalistyczny pionowy akcent przy słowie.",
    pros: [
      "Najlżejszy wizualnie — nie konkuruje z treścią",
      "Działa w wąskim navbarze i na mobile",
      "Spójny z obecnym faviconem (pasek + sm)",
    ],
  },
  {
    id: "monogram",
    name: "Monogram sm",
    tagline: "Kwadratowa ikona jak appka mobilna.",
    pros: [
      "Najlepszy jako favicon i PWA",
      "Rozpoznawalny bez pełnej nazwy",
      "Pasuje do ciemnego UI platformy",
    ],
  },
  {
    id: "equal",
    name: "Równość",
    tagline: "Znak = z wydłużonym środkiem w teal.",
    pros: [
      "Od razu kojarzy się z matematyką",
      "„Szybkość” wydłużoną kreską — subtelna metafora",
      "Prosty, czytelny w małym rozmiarze",
    ],
  },
  {
    id: "rise",
    name: "Wzrost",
    tagline: "Mini-wykres idący w górę.",
    pros: [
      "Opowiada o postępie i wyniku",
      "Miękki, przyjazny charakter",
      "Wyróżnia się na tle „sigma” i ∑ w edtech",
    ],
  },
  {
    id: "delta",
    name: "Delta Δ",
    tagline: "Geometryczny trójkąt — zmiana i różnica.",
    pros: [
      "Mocny, akademicki ton bez kalkulatorowego kliszu",
      "Dobrze wygląda solo (avatar, social)",
      "Gradient teal pasuje do reszty marki",
    ],
  },
] as const;
