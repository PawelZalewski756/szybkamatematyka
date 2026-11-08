/** Wspólna logika aktywności linków nawigacji. */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type MobileTabId = "start" | "trening" | "zadania" | "graj" | "wiecej";

export const MOBILE_TAB_BAR_HEIGHT_PX = 64;

/** Trasy przypisane do zakładki „Graj” (środek). */
export const MOBILE_GRAJ_PREFIXES = [
  "/minigry",
  "/pojedynki",
  "/wyzwania",
] as const;

/** Trasy przypisane do zakładki „Więcej”. */
export const MOBILE_WIECEJ_PREFIXES = [
  "/profil",
  "/login",
  "/powtorki",
  "/sprawdziany",
  "/rankingi",
  "/osiagniecia",
  "/cennik",
] as const;

function isTreningRoute(pathname: string): boolean {
  return (
    isNavActive(pathname, "/trening") || isNavActive(pathname, "/arkusze")
  );
}

export function getMobileActiveTab(pathname: string): MobileTabId | null {
  if (pathname === "/") return "start";
  if (isTreningRoute(pathname)) return "trening";
  if (MOBILE_GRAJ_PREFIXES.some((p) => isNavActive(pathname, p))) return "graj";
  if (isNavActive(pathname, "/baza-zadan")) return "zadania";
  if (MOBILE_WIECEJ_PREFIXES.some((p) => isNavActive(pathname, p))) {
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
