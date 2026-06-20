import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Minigry matematyczne",
  description:
    "Trening refleksu i rachunków w ultrakrótkich rundach. Minigry matematyczne w trybach na czas, survival i maraton — ucz się przez grę i zdobywaj EXP.",
  alternates: { canonical: "/minigry" },
};

export default function MinigryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
