import { BRAND_DOMAIN, BRAND_NAME } from "@/lib/brand/constants";
import { SITE_URL } from "@/lib/seo/site";

export const LEGAL_OPERATOR = BRAND_NAME;
export const LEGAL_SITE = SITE_URL;
export const LEGAL_DOMAIN = BRAND_DOMAIN;
export const LEGAL_UPDATED = "24 sierpnia 2026";

export const LEGAL_NAV = [
  { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
  { href: "/regulamin", label: "Regulamin" },
] as const;
