import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cennik i plany",
  description:
    "Plany subskrypcji Szybkiej Matmy — pełny dostęp do bazy zadań, arkuszy, treningów i minigier. Wybierz plan dopasowany do przygotowań do egzaminu.",
  alternates: { canonical: "/cennik" },
};

export default function CennikLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
