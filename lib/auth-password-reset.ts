import { SITE_URL } from "@/lib/seo/site";
import { getRuntimeSiteUrl } from "@/lib/supabase/config";

const RESET_PATH = "/login/nowe-haslo";

function isLocalDevHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** Buduje stabilny adres callbacku Auth dla lokalnego i produkcyjnego hosta. */
export function authRedirectUrl(pathname: string): string {
  if (typeof window !== "undefined" && isLocalDevHost(window.location.hostname)) {
    return `${window.location.origin}${pathname}`;
  }
  return `${getRuntimeSiteUrl() ?? SITE_URL}${pathname}`;
}

/** URL przekierowania po kliknięciu linku resetu hasła w e-mailu. */
export function passwordResetRedirectUrl(): string {
  return authRedirectUrl(RESET_PATH);
}
