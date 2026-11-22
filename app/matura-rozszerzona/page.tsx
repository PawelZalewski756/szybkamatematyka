import {
  listOfficialCkeSheets,
} from "@/lib/baza-zadan/exams/archive-catalog";
import { officialCkeSheetHref } from "@/lib/baza-zadan/exams/archive-sheet-meta";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Matura rozszerzona z matematyki - arkusze i plan",
  description:
    "Matura rozszerzona z matematyki: oficjalne arkusze CKE, zakres materiału i wskazówki, od czego zacząć. Plan tematyczny i zadania rozszerzone w przygotowaniu.",
  alternates: { canonical: "/matura-rozszerzona" },
};

const AREAS = [
  "Liczby rzeczywiste, potęgi, pierwiastki i logarytmy",
  "Wyrażenia algebraiczne, wielomiany i funkcje wymierne",
  "Funkcje: liniowa, kwadratowa, wykładnicza i logarytmiczna",
  "Ciągi, granice i pochodne",
  "Trygonometria i zastosowania",
  "Planimetria, stereometria i geometria analityczna",
  "Kombinatoryka, prawdopodobieństwo i statystyka",
  "Dowody, optymalizacja i zadania z parametrem",
];

export default function MaturaRozszerzonaPage() {
  const sheets = listOfficialCkeSheets().filter((sheet) =>
    /rozszerzon/i.test(sheet.title),
  );

  return (
    <div className="page-container w-full py-10 sm:py-14">
      <Link href="/trening/arkusze" className="text-sm font-semibold text-muted hover:text-accent">
        ← Arkusze CKE
      </Link>

      <header className="mt-5 max-w-3xl">
        <p className="text-overline">Matura rozszerzona</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Matematyka rozszerzona bez zgadywania, od czego zacząć
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          Na tej stronie znajdziesz oficjalne arkusze rozszerzone CKE i mapę
          materiału. Pełny plan tematyczny z zadaniami rozszerzonymi jest w
          przygotowaniu - nie udajemy, że jest gotowy, zanim nie będzie.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-foreground">Co obejmuje zakres</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {AREAS.map((area) => (
            <li
              key={area}
              className="rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm text-muted"
            >
              {area}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-extrabold text-foreground">
            Oficjalne arkusze rozszerzone
          </h2>
          <span className="text-sm text-muted">{sheets.length} arkuszy</span>
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sheets.map((sheet) => (
            <li key={sheet.id}>
              <Link
                href={officialCkeSheetHref(sheet.id)}
                className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition hover:border-accent/50 hover:bg-surface-hover"
              >
                <span>{sheet.title}</span>
                <span className="text-xs text-muted">{sheet.taskIds.length} zadań</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/trening/arkusze" className="btn-chunky px-5 py-3 text-sm">
          Wszystkie arkusze CKE
        </Link>
        <Link
          href="/diagnostyka"
          className="rounded-xl border border-surface-border bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
        >
          Sprawdź start
        </Link>
      </div>

      <p className="mt-8 text-xs text-muted">
        Zakres może się zmieniać wraz z komunikatami CKE. Przed egzaminem
        sprawdź aktualne wymagania na stronie cke.gov.pl.
      </p>
    </div>
  );
}
