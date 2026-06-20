export type NavLink = {
  href: string;
  label: string;
};

export type NavGroup = {
  /** Etykieta sekcji (null = bez nagłówka, np. Start) */
  label: string | null;
  links: readonly NavLink[];
};

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: null,
    links: [{ href: "/", label: "Start" }],
  },
  {
    label: "Graj",
    links: [
      { href: "/minigry", label: "Minigry" },
      { href: "/wyzwania", label: "Wyzwania" },
      { href: "/pojedynki", label: "Pojedynki" },
    ],
  },
  {
    label: "Ucz się",
    links: [
      { href: "/trening", label: "Trening" },
      { href: "/arkusze", label: "Arkusze CKE" },
      { href: "/baza-zadan", label: "Baza zadań" },
      { href: "/powtorki", label: "Powtórki" },
    ],
  },
  {
    label: "Społeczność",
    links: [
      { href: "/rankingi", label: "Rankingi" },
      { href: "/osiagniecia", label: "Osiągnięcia" },
    ],
  },
  {
    label: "Konto",
    links: [
      { href: "/profil", label: "Profil" },
      { href: "/cennik", label: "Cennik" },
    ],
  },
] as const;

/** Spłaszczona lista (kompatybilność wsteczna). */
export const NAV_LINKS: readonly NavLink[] = NAV_GROUPS.flatMap((g) => g.links);
