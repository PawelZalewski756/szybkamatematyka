import { ClassPlanView } from "@/components/trening/ClassPlanView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan dla klasy - matematyka krok po kroku",
  description:
    "Plan tematów matematyki dla klasy 4-8, liceum, technikum i szkoły branżowej. Wybierz klasę i zobacz, co warto przerobić w tym roku.",
  alternates: { canonical: "/plan-klasy" },
};

export default function PlanKlasyPage() {
  return <ClassPlanView />;
}
