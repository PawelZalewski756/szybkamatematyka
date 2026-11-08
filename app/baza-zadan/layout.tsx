import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Baza zadań z matematyki",
  description:
    "Katalog zadań z matematyki z filtrami po działach i poziomie trudności - algebra, geometria, funkcje, równania i więcej. Pełne rozwiązania krok po kroku pod maturę i egzamin ósmoklasisty.",
  alternates: { canonical: "/baza-zadan" },
};

export default function BazaZadanLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
