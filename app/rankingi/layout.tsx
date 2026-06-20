import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Rankingi",
  description:
    "Tablica wyników Szybkiej Matmy — rywalizuj o najwyższy poziom EXP, porównuj postępy z innymi i pnij się w rankingu graczy.",
  alternates: { canonical: "/rankingi" },
};

export default function RankingiLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
