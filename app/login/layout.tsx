import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Logowanie",
  description:
    "Zaloguj się do Szybkiej Matmy, aby zapisywać postępy, zdobywać EXP i synchronizować naukę między urządzeniami.",
  // Strona uwierzytelniania — bez wartości dla wyszukiwarek.
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
