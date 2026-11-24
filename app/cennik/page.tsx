"use client";

import { PricingSection } from "@/components/home/PricingSection";
import { proMemberPricing } from "@/lib/home/signed-in-home";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { ArrowRight, Gift } from "lucide-react";
import Link from "next/link";

export default function CennikPage() {
  const { isPro, loading } = useSubscription();
  const owned = !loading && isPro;
  const member = proMemberPricing();

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
          {owned ? member.title : "Cennik"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          {owned
            ? member.text
            : "Start jest darmowy i zostaje darmowy. Pro i Roczny to ta sama treść - wybierasz, czy płacisz co miesiąc, czy z góry za rok."}
        </p>
      </header>

      <div className="mt-10">
        <PricingSection />
      </div>

      <section
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent-soft/30 p-5 sm:flex-row sm:items-center sm:justify-between"
        aria-labelledby="cennik-polecenia"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <Gift className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2
              id="cennik-polecenia"
              className="text-sm font-extrabold text-foreground"
            >
              Zaproś 2 znajomych - 30 dni Pro
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
              Znajomy potwierdza e-mail, rozwiązuje 3 zadania i mija 7 dni. Za 2
              takie osoby dostajesz 30 dni Pro. Raz na konto, bez karty.
            </p>
          </div>
        </div>
        <Link
          href="/polecenia"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-accent hover:underline"
        >
          Jak to działa
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

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
