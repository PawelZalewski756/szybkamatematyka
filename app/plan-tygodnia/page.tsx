import type { Metadata } from "next";

import { PlanTygodniaView } from "@/components/plan-tygodnia/PlanTygodniaView";

export const metadata: Metadata = {
  title: "Plan tygodnia — matematyka krok po kroku",
  description:
    "Tygodniowy plan nauki matematyki: 2–3 zadania dziennie, powtórki, wyzwania i przygotowanie do matury lub egzaminu ósmoklasisty.",
  alternates: { canonical: "/plan-tygodnia" },
};

export default function PlanTygodniaPage() {
  return <PlanTygodniaView />;
}
