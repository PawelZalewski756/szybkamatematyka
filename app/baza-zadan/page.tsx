import { BazaZadanView } from "@/components/baza-zadan/BazaZadanView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Baza zadań — matura i egzamin ósmoklasisty",
  description:
    "Zadania treningowe z wyjaśnieniami, arkusze CKE i arkusze egzaminacyjne w aplikacji.",
  alternates: { canonical: "/baza-zadan" },
};

export default function BazaZadanPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted xl:max-w-7xl">
          Ładowanie bazy zadań…
        </div>
      }
    >
      <BazaZadanView />
    </Suspense>
  );
}
