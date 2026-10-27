import type { NavLink } from "@/lib/layout/nav-links";

/** Linki produktowe w stopce (nauka / gra). */
export const FOOTER_PRODUCT_LINKS: readonly NavLink[] = [
  { href: "/trening", label: "Trening" },
  { href: "/baza-zadan", label: "Baza zadań" },
  { href: "/trening/arkusze", label: "Arkusze CKE" },
  { href: "/minigry", label: "Minigry" },
  { href: "/wyzwania", label: "Wyzwania" },
  { href: "/cennik", label: "Cennik" },
] as const;

/** Zakładki informacyjne i prawne w stopce. */
export const FOOTER_INFO_LINKS: readonly NavLink[] = [
  { href: "/regulamin", label: "Regulamin" },
  { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
  { href: "/kontakt", label: "Kontakt" },
] as const;
