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
    </div>
  );
}
