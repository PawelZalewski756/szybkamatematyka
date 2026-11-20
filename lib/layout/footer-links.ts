import type { NavLink } from "@/lib/layout/nav-links";

/** Linki produktowe w stopce (nauka / gra). */
export const FOOTER_PRODUCT_LINKS: readonly NavLink[] = [
  { href: "/trening", label: "Trening" },
  { href: "/baza-zadan", label: "Baza zadań" },
  { href: "/plan-tygodnia", label: "Plan tygodnia" },
  { href: "/trening/arkusze", label: "Arkusze CKE" },
  { href: "/minigry", label: "Minigry" },
  { href: "/wyzwania", label: "Wyzwania" },
  { href: "/cennik", label: "Cennik" },
  { href: "/dla-szkol", label: "Dla szkół" },
] as const;

/** Zakładki informacyjne i prawne w stopce. */
export const FOOTER_INFO_LINKS: readonly NavLink[] = [
  { href: "/polecenia", label: "Program poleceń" },
  { href: "/regulamin", label: "Regulamin" },
  { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
  { href: "/dla-szkol", label: "Dla szkół" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/zglos-blad", label: "Zgłoś błąd" },
] as const;
