import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BRAND_NAME_LOCATIVE } from "@/lib/brand/constants";

export const metadata: Metadata = {
  title: "Twój profil",
  description:
    `Twój profil w ${BRAND_NAME_LOCATIVE} - poziom, XP, statystyki nauki i ustawienia konta.`,
  // Strona prywatna (dane konta) - nie indeksujemy.
  robots: { index: false, follow: false },
};

export default function ProfilLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
