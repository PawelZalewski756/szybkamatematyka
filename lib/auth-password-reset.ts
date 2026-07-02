import { SITE_URL } from "@/lib/seo/site";

const RESET_PATH = "/login/nowe-haslo";

function isLocalDevHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/** URL przekierowania po kliknięciu linku resetu hasła w e-mailu. */
export function passwordResetRedirectUrl(): string {
  if (typeof window !== "undefined" && isLocalDevHost(window.location.hostname)) {
    return `${window.location.origin}${RESET_PATH}`;
  }
  return `${SITE_URL}${RESET_PATH}`;
}
