import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cennik i plany",
    description:
      "Start jest darmowy. Pro i Roczny - pełny dostęp do bazy zadań, arkuszy i minigier. Porównaj plany bez zobowiązań.",
  alternates: { canonical: "/cennik" },
};

export default function CennikLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
