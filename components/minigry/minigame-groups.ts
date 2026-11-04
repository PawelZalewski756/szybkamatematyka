import type { MinigameEntry } from "@/lib/minigry/minigames-catalog";

export type MinigameGroupTone =
  | "amber"
  | "sky"
  | "violet"
  | "rose"
  | "emerald"
  | "slate";

export type MinigameGroupVisual = {
  eyebrow: string;
  icon:
    | "calculator"
    | "sigma"
    | "radical"
    | "triangle"
    | "line-chart"
    | "layers";
  tone: MinigameGroupTone;
};

type MinigameGroupDefinition = {
  id: string;
  title: string;
  description: string;
  slugs: readonly string[];
  visual: MinigameGroupVisual;
};

export type MinigameGroup = Omit<MinigameGroupDefinition, "slugs"> & {
  games: MinigameEntry[];
};

const MINIGAME_GROUP_DEFINITIONS: readonly MinigameGroupDefinition[] = [
  {
    id: "rachunki",
    title: "Rachunki i działania",
    description: "Dodawanie, odejmowanie, mnożenie i dzielenie.",
    visual: {
      eyebrow: "Podstawowe operacje",
      icon: "calculator",
      tone: "amber",
    },
    slugs: [
      "mnozenie",
      "dodawanie",
      "odejmowanie",
      "dzielenie",
      "porownaj",
      "zaokraglenie",
      "kwadrat",
      "modulo",
    ],
  },
  {
    id: "liczby",
    title: "Liczby, ułamki i procenty",
    description: "Ułamki, procenty i własności liczb.",
    visual: {
      eyebrow: "Liczby i ułamki",
      icon: "sigma",
      tone: "sky",
    },
    slugs: [
      "ulamki",
      "ulamki-plus",
      "ulamki-minus",
      "procenty",
      "procent-odwrotny",
      "nwd",
      "nww",
      "przeciwna",
      "wartosc-bezwzgledna",
      "srednia",
      "potegi-10",
    ],
  },
  {
    id: "algebra",
    title: "Algebra i potęgi",
    description: "Równania, wzory i potęgi.",
    visual: {
      eyebrow: "Równania i wzory",
      icon: "radical",
      tone: "violet",
    },
    slugs: [
      "prawda-falsz",
      "potegi",
      "pierwiastki",
      "rownania",
      "ciag",
      "nawiasy",
      "wzory",
    ],
  },
  {
    id: "geometria",
    title: "Geometria",
    description: "Obliczanie pól, obwodów i kątów.",
    visual: {
      eyebrow: "Figury i pomiary",
      icon: "triangle",
      tone: "rose",
    },
    slugs: ["pole", "obwod", "trojkat", "pole-kola"],
  },
  {
    id: "funkcje",
    title: "Funkcje i trygonometria",
    description: "Wykresy funkcji, logarytmy i trygonometria.",
    visual: {
      eyebrow: "Funkcje i wykresy",
      icon: "line-chart",
      tone: "emerald",
    },
    slugs: ["funkcje", "logarytmy", "sinusy", "kosinusy"],
  },
];

export function groupMinigames(
  games: readonly MinigameEntry[],
): MinigameGroup[] {
  const assignedSlugs = new Set(
    MINIGAME_GROUP_DEFINITIONS.flatMap((group) => group.slugs),
  );
  const groups = MINIGAME_GROUP_DEFINITIONS.flatMap((definition) => {
    const definitionSlugs = new Set(definition.slugs);
    const groupGames = games.filter((game) => definitionSlugs.has(game.id));

    if (groupGames.length === 0) return [];

    return [
      {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        visual: definition.visual,
        games: groupGames,
      },
    ];
  });
  const ungroupedGames = games.filter((game) => !assignedSlugs.has(game.id));

  if (ungroupedGames.length > 0) {
    groups.push({
      id: "inne",
      title: "Pozostałe",
      description: "Pozostałe dostępne minigry.",
      visual: {
        eyebrow: "Inne minigry",
        icon: "layers",
        tone: "slate",
      },
      games: ungroupedGames,
    });
  }

  return groups;
}
