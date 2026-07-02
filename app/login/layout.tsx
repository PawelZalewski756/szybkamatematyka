import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BRAND_NAME_GENITIVE } from "@/lib/brand/constants";

export const metadata: Metadata = {
  title: "Logowanie",
  description:
    `Zaloguj się do ${BRAND_NAME_GENITIVE}, aby zapisywać postępy, zdobywać XP i synchronizować naukę między urządzeniami.`,
  // Strona uwierzytelniania — bez wartości dla wyszukiwarek.
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
