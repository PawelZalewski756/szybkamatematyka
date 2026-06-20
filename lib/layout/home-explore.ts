/** Sekcja „Więcej na platformie” — linki spoza głównego paska (bez duplikowania navbara). */
export type HomeExploreLink = {
  href: string;
  label: string;
  hint: string;
};

export type HomeExploreGroup = {
  label: string | null;
  links: readonly HomeExploreLink[];
};

export const HOME_EXPLORE_GROUPS: readonly HomeExploreGroup[] = [
  {
    label: "Graj",
    links: [
      {
        href: "/wyzwania",
        label: "Wyzwania",
        hint: "Codzienne zadanie na timer",
      },
      {
        href: "/pojedynki",
        label: "Pojedynki",
        hint: "Rywalizacja z innymi",
      },
    ],
  },
  {
    label: "Nauka",
    links: [
      {
        href: "/powtorki",
        label: "Powtórki",
        hint: "Wracaj do trudniejszych tematów",
      },
    ],
  },
  {
    label: "Społeczność",
    links: [
      {
        href: "/rankingi",
        label: "Rankingi",
        hint: "Wyniki w minigrach i pojedynkach",
      },
      {
        href: "/osiagniecia",
        label: "Osiągnięcia",
        hint: "Odznaki za postęp",
      },
    ],
  },
] as const;
