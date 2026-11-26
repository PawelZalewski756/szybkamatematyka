import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageOpenGraph } from "@/lib/seo/open-graph";

export const metadata: Metadata = {
  title: "Powtórki",
  description:
    "Inteligentne powtórki w systemie powtórek rozłożonych w czasie - wracaj do zadań, które sprawiają trudność, i utrwalaj materiał przed egzaminem.",
  openGraph: pageOpenGraph({
    path: "/powtorki",
    title: "Powtórki",
    description:
      "Inteligentne powtórki w systemie powtórek rozłożonych w czasie - wracaj do zadań, które sprawiają trudność, i utrwalaj materiał przed egzaminem.",
  }),
  alternates: { canonical: "/powtorki" },
};

export default function PowtorkiLayout({ children }: { children: ReactNode }) {
  return children;
}
