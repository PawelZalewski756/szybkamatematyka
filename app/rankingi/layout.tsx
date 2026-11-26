import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageOpenGraph } from "@/lib/seo/open-graph";
import { BRAND_NAME_GENITIVE } from "@/lib/brand/constants";

export const metadata: Metadata = {
  title: "Rankingi",
  description:
    `Rankingi ${BRAND_NAME_GENITIVE} - porównuj postępy z innymi uczniami i śledź swoje miejsce na liście.`,
  openGraph: pageOpenGraph({
    path: "/rankingi",
    title: "Rankingi",
    description:
      "Rankingi Szybkiej Matematyki - porównuj postępy z innymi uczniami i śledź swoje miejsce na liście.",
  }),
  alternates: { canonical: "/rankingi" },
};

export default function RankingiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
