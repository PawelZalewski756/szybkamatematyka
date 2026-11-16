"use client";

import { PricingSection } from "@/components/home/PricingSection";
import Link from "next/link";

export default function CennikPage() {
  return (
    <div className="page-container flex flex-1 flex-col py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm font-semibold text-muted transition hover:text-accent"
      >
        ← Strona główna
      </Link>

      <header className="mt-4 max-w-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Cennik
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          Start jest darmowy i zostaje darmowy. Pro i Roczny to ta sama treść -
          wybierasz, czy płacisz co miesiąc, czy z góry za rok.
        </p>
      </header>

      <div className="mt-10">
        <PricingSection />
      </div>

      <div className="mt-8 rounded-2xl border border-surface-border bg-surface p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-sm font-bold text-foreground">Prowadzisz szkołę?</p>
          <p className="mt-1 text-sm text-muted">
            Sprawdziany z grupami A/B, kluczem i PDF oraz warunki dla placówki.
          </p>
        </div>
        <Link
          href="/dla-szkol"
          className="mt-3 inline-flex shrink-0 items-center gap-2 text-sm font-bold text-accent hover:underline sm:mt-0"
        >
          Pakiet szkolny →
        </Link>
      </div>
    </div>
  );
}
