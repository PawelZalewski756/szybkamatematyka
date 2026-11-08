export type NavLink = {
  href: string;
  label: string;
  requiresAuth?: boolean;
};

export type NavGroup = {
  label: string | null;
  links: readonly NavLink[];
};

/** Główne linki widoczne w pasku nawigacji (reszta w menu „Więcej”). */
export const NAV_PRIMARY_LINKS: readonly NavLink[] = [
  { href: "/trening", label: "Trening" },
  { href: "/baza-zadan", label: "Baza zadań" },
  { href: "/minigry", label: "Minigry" },
] as const;

/** Linki w rozwijanym menu - pogrupowane dla czytelności. */
export const NAV_MORE_GROUPS: readonly NavGroup[] = [
  {
    label: "Graj",
    links: [
      { href: "/wyzwania", label: "Wyzwania" },
      { href: "/pojedynki", label: "Pojedynki" },
    ],
  },
  {
    label: "Nauka",
    links: [{ href: "/powtorki", label: "Powtórki", requiresAuth: true }],
  },
  {
    label: "Społeczność",
    links: [
      { href: "/rankingi", label: "Rankingi" },
      { href: "/osiagniecia", label: "Osiągnięcia" },
    ],
  },
  {
    label: null,
    links: [{ href: "/cennik", label: "Cennik" }],
  },
] as const;

/** @deprecated Użyj NAV_PRIMARY_LINKS + NAV_MORE_GROUPS */
export const NAV_GROUPS: readonly NavGroup[] = [
  { label: null, links: NAV_PRIMARY_LINKS },
  ...NAV_MORE_GROUPS,
];

export const NAV_LINKS: readonly NavLink[] = [
  ...NAV_PRIMARY_LINKS,
  ...NAV_MORE_GROUPS.flatMap((g) => g.links),
];

export function isNavLinkVisible(
  link: NavLink,
  isLoggedIn: boolean,
): boolean {
  return !link.requiresAuth || isLoggedIn;
}
