import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TreningSubNav } from "@/components/trening/TreningSubNav";

export const metadata: Metadata = {
  title: "Trening tematyczny",
  description:
    "Arena treningu: tysiące zadań pogrupowanych po działach i tematach, ze ścieżką pod maturę lub egzamin ósmoklasisty. Ćwicz wybrany temat i zbieraj EXP.",
  alternates: { canonical: "/trening" },
};

export default function TreningLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TreningSubNav />
      {children}
    </>
  );
}
