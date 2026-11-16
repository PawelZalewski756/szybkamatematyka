import { DiagnosticQuiz } from "@/components/diagnostyka/DiagnosticQuiz";
import { getTasksForPath } from "@/lib/baza-zadan/catalog";
import { selectDiagnosticTasks } from "@/lib/diagnostyka";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnoza startowa - sprawdź, od czego zacząć",
  description:
    "Krótka diagnoza z matematyki: 8 pytań z różnych działów, wynik i wskazówka, które tematy powtórzyć przed maturą lub egzaminem ósmoklasisty.",
  alternates: { canonical: "/diagnostyka" },
};

export default function DiagnostykaPage() {
  return (
    <DiagnosticQuiz
      tasksByPath={{
        sp: selectDiagnosticTasks(getTasksForPath("sp")),
        srednia: selectDiagnosticTasks(getTasksForPath("srednia")),
      }}
    />
  );
}
