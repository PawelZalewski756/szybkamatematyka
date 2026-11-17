import { CONTACT_EMAIL } from "@/lib/brand/constants";
import { ArrowRight, CheckCircle2, FileText, Printer, School, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dla szkół i nauczycieli - sprawdziany z matematyki",
  description:
    "Gotowe sprawdziany z matematyki dla klas 6-8 i liceum: grupy A/B, klucz, schemat punktowania, PDF do druku. Generator zadań i arkusze CKE dla nauczycieli.",
  alternates: { canonical: "/dla-szkol" },
};

const FEATURES = [
  {
    icon: FileText,
    title: "Sprawdzian w minutę",
    text: "Wybierasz klasę, dział i grupę. Resztę - zadania, punktację i czas - układasz jednym kliknięciem.",
  },
  {
    icon: Users,
    title: "Grupy A i B",
    text: "Każda grupa dostaje inne liczby w tych samych zadaniach, więc siedzący obok nie przepisuje wyniku.",
  },
  {
    icon: CheckCircle2,
    title: "Klucz i punktacja",
    text: "Do każdego zadania jest odpowiedź i schemat punktowania. Sprawdzanie zajmuje mniej czasu.",
  },
  {
    icon: Printer,
    title: "PDF do druku",
    text: "Wersja bez odpowiedzi i wersja z kluczem na osobnej stronie. Działa też na szkolnej drukarce.",
  },
  {
    icon: School,
    title: "Zadania i arkusze CKE",
    text: "Tysiące zadań i 46 arkuszy egzaminacyjnych - od kartkówek po powtórki przed egzaminem.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Wybierz klasę i dział",
    text: "Klasa 6-8 albo liceum. Dział dopasowany do podstawy programowej.",
  },
  {
    number: "2",
    title: "Ustaw grupę i liczby",
    text: "Grupa A lub B. Przycisk „Inne liczby w zadaniach” losuje nowy zestaw.",
  },
  {
    number: "3",
    title: "Drukuj albo rozdaj",
    text: "Pobierz PDF z kluczem albo przeprowadź sprawdzian online i oddaj do oceny.",
  },
];

export default function DlaSzkolPage() {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    "Pakiet szkolny - Szybka Matematyka",
  )}`;

  return (
    <div className="page-container flex flex-1 flex-col py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm font-semibold text-muted transition hover:text-accent"
      >
        ← Strona główna
      </Link>

      <header className="mt-5 max-w-3xl">
        <p className="text-overline">DLA SZKÓŁ I NAUCZYCIELI</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Sprawdziany, które robią się w minutę
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Wybierasz dział, generujesz grupy A i B, drukujesz razem z kluczem.
          Bez układania zadań w Wordzie i bez liczenia punktów na piechotę.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/sprawdziany" className="btn-chunky px-6 py-3.5 text-sm">
            Wypróbuj generator
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/dla-szkol/panel"
            className="rounded-full border border-surface-border bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
          >
            Panel nauczyciela
          </Link>
          <a
            href={mailto}
            className="rounded-full border border-accent/35 bg-accent/10 px-5 py-3 text-sm font-bold text-accent-strong transition hover:border-accent/60"
          >
            Napisz w sprawie pakietu szkolnego
          </a>
        </div>
        <p className="mt-3 text-xs text-muted">
          Generator jest darmowy i nie wymaga konta ani instalacji.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="card-raised flex flex-col gap-3 p-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent-strong">
              <feature.icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-base font-bold text-foreground">
              {feature.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted">{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Jak to wygląda w praktyce
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-surface-border bg-surface p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-black text-on-accent">
                {step.number}
              </span>
              <h3 className="mt-3 text-base font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-3xl border border-accent/30 bg-accent-soft/40 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:items-center">
          <div>
            <p className="text-overline">PAKIET SZKOLNY</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Wersja dla całej szkoły
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Jeśli chcesz korzystać z generatora na kilku lekcjach albo
              potrzebujesz faktury i wsparcia dla nauczycieli, napisz do nas.
              Ustalimy zakres i warunki.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                Generator sprawdzianów, baza zadań i arkusze CKE
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                Wsparcie dla nauczycieli
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                Faktura i warunki dopasowane do szkoły
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={mailto}
              className="btn-chunky justify-center px-6 py-4 text-sm"
            >
              Napisz do nas
            </a>
            <Link
              href="/sprawdziany"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
            >
              Zobacz generator
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Najczęstsze pytania
        </h2>
        <div className="mt-4 space-y-3">
          <details className="rounded-xl border border-surface-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-bold text-foreground">
              Czy sprawdziany są zgodne z podstawą programową?
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Działy są ułożone pod klasy 6-8 oraz liceum. Każdy zestaw ma
              zadania zamknięte i otwarte z punktacją typową dla klasówki.
            </p>
          </details>
          <details className="rounded-xl border border-surface-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-bold text-foreground">
              Czy można edytować zadania?
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Generator losuje liczby i kolejność, ale nie zmienia treści zadań.
              Jeśli potrzebujesz własnych poleceń, napisz - ustalimy zakres
              pakietu szkolnego.
            </p>
          </details>
          <details className="rounded-xl border border-surface-border bg-surface p-4">
            <summary className="cursor-pointer text-sm font-bold text-foreground">
              Czy uczeń musi mieć konto?
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Nie. Sprawdzian można wydrukować albo rozdać link. Konto jest
              potrzebne tylko do zapisywania wyników i oceny AI zadań otwartych.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
