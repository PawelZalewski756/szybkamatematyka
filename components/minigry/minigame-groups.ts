import type { MinigameEntry } from "@/lib/minigry/minigames-catalog";

type MinigameGroupDefinition = {
  id: string;
  title: string;
  description: string;
  slugs: readonly string[];
};

export type MinigameGroup = Omit<MinigameGroupDefinition, "slugs"> & {
  games: MinigameEntry[];
};

const MINIGAME_GROUP_DEFINITIONS: readonly MinigameGroupDefinition[] = [
  {
    id: "rachunki",
    title: "Rachunki i działania",
    description: "Szybkie obliczenia, które dobrze sprawdzają się na start.",
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
    description: "Porównywanie, części całości i własności liczb.",
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
    description: "Równania, wzory i matematyczne pułapki.",
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
    description: "Pola, obwody i kąty w krótkich rundach.",
    slugs: ["pole", "obwod", "trojkat", "pole-kola"],
  },
  {
    id: "funkcje",
    title: "Funkcje i trygonometria",
    description: "Tematy ze szkoły średniej: funkcje, logarytmy i kąty.",
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
      games: ungroupedGames,
    });
  }

  return groups;
}
