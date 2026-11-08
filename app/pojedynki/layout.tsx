import { DuelProvider } from "@/components/pojedynki/DuelProvider";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pojedynki 1v1",
  description:
    "Pojedynki matematyczne 1v1: ten sam zestaw pytań, gra na żywo - na kod ze znajomym lub z botem. Sprawdź, kto liczy szybciej.",
  alternates: { canonical: "/pojedynki" },
};

/**
 * Własny layout obszaru pojedynków. Owijamy własnym providerem stanu
 * (DuelProvider), nie dotykając globalnych providerów aplikacji.
 */
export default function PojedynkiLayout({ children }: { children: ReactNode }) {
  return <DuelProvider>{children}</DuelProvider>;
}
