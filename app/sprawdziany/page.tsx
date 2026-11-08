import { SprawdzianView } from "@/components/sprawdziany/SprawdzianView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sprawdziany z matematyki — zadania na klasówkę",
  description:
    "Przygotuj się do klasówki: wybierz tematy z matematyki, rozwiąż sprawdzian złożony z typowych zadań szkolnych i otrzymaj ocenę oraz rozwiązania.",
  alternates: { canonical: "/sprawdziany" },
};

export default function SprawdzianyPage() {
  return <SprawdzianView />;
}
