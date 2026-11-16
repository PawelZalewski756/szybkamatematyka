import { BazaZadanView } from "@/components/baza-zadan/BazaZadanView";
import {
  getAllTasks,
  getExamSheetsForPath,
  getTaskStats,
} from "@/lib/baza-zadan/catalog";
import { toClientTask } from "@/lib/baza-zadan/client-task";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Baza zadań - matura i egzamin ósmoklasisty",
  description:
    "Zadania treningowe z wyjaśnieniami, arkusze CKE i arkusze egzaminacyjne w aplikacji.",
  alternates: { canonical: "/baza-zadan" },
};

export default function BazaZadanPage() {
  const spStats = getTaskStats("sp");
  const sredniaStats = getTaskStats("srednia");

  return (
    <Suspense
      fallback={
        <div className="page-container px-4 py-12 text-sm text-muted sm:py-16">
          Ładowanie…
        </div>
      }
    >
      <BazaZadanView
        tasks={getAllTasks().map(toClientTask)}
        stats={{
          sp: { tasks: spStats.totalTasks, sheets: spStats.totalSheets },
          srednia: {
            tasks: sredniaStats.totalTasks,
            sheets: sredniaStats.totalSheets,
          },
        }}
        sheetsByPath={{
          sp: getExamSheetsForPath("sp"),
          srednia: getExamSheetsForPath("srednia"),
        }}
      />
    </Suspense>
  );
}
