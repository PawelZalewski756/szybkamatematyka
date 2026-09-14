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
        <div className="page-container px-4 py-12 text-sm text-muted sm:py-16">
          Ładowanie…
        </div>
      }
    >
      <BazaZadanView />
    </Suspense>
  );
}
