import type { MetadataRoute } from "next";
import { BRAND_NAME_SHORT } from "@/lib/brand/constants";
import { SITE_NAME } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — matura i egzamin ósmoklasisty`,
    short_name: BRAND_NAME_SHORT,
    description:
      "Platforma do nauki matematyki: arkusze CKE, baza zadań, trening i minigry.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f14",
    theme_color: "#0a0f14",
    lang: "pl",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
