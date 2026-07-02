/** Wspólna logika aktywności linków nawigacji. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type MobileTabId = "arkusze" | "trening" | "graj" | "profil" | "wiecej";

export const MOBILE_TAB_BAR_HEIGHT_PX = 64;

/** Trasy przypisane do zakładki „Graj” (środek). */
export const MOBILE_GRAJ_PREFIXES = [
  "/minigry",
  "/pojedynki",
  "/wyzwania",
] as const;

/** Trasy przypisane do zakładki „Więcej”. */
export const MOBILE_WIECEJ_PREFIXES = [
  "/baza-zadan",
  "/powtorki",
  "/rankingi",
  "/osiagniecia",
  "/cennik",
  "/admin",
] as const;

export function getMobileActiveTab(pathname: string): MobileTabId | null {
  if (isNavActive(pathname, "/arkusze")) return "arkusze";
  if (isNavActive(pathname, "/trening")) return "trening";
  if (MOBILE_GRAJ_PREFIXES.some((p) => isNavActive(pathname, p))) return "graj";
  if (isNavActive(pathname, "/profil") || isNavActive(pathname, "/login"))
    return "profil";
  if (
    pathname === "/" ||
    MOBILE_WIECEJ_PREFIXES.some((p) => isNavActive(pathname, p))
  ) {
    return "wiecej";
  }
  return null;
}

export function isMobileMoreActive(pathname: string): boolean {
  return getMobileActiveTab(pathname) === "wiecej";
}

export function isMobileGrajActive(pathname: string): boolean {
  return getMobileActiveTab(pathname) === "graj";
}
