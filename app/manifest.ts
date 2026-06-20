import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — matura i egzamin ósmoklasisty w tempie gry`,
    short_name: SITE_NAME,
    description:
      "Zgamifikowana platforma do nauki matematyki: minigry, baza zadań, arkusze, treningi i rankingi pod maturę i egzamin ósmoklasisty.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
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
