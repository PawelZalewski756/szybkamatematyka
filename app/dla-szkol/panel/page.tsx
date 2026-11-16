import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Printer,
} from "lucide-react";
import { SchoolInquiryForm } from "@/components/school/SchoolInquiryForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Panel nauczyciela - zasoby do lekcji matematyki",
  description:
    "Startowy panel nauczyciela: generator sprawdzianów, baza zadań, arkusze CKE i plan lekcji. Klasy i wyniki uczniów w przygotowaniu.",
  alternates: { canonical: "/dla-szkol/panel" },
};

const TOOLS = [
  {
    href: "/sprawdziany",
    icon: ClipboardList,
    title: "Generator sprawdzianów",
    text: "Grupy A/B, klucz, punktacja i PDF. 13 gotowych rozdziałów dla klas 6–8 i liceum.",
  },
  {
    href: "/baza-zadan",
    icon: BookOpen,
    title: "Baza zadań",
    text: "Zadania z rozwiązaniami i filtrami działu/poziomu. Do pracy na lekcji i w domu.",
  },
  {
    href: "/trening/arkusze",
    icon: FileText,
    title: "Arkusze CKE",
    text: "Oficjalne arkusze maturalne i egzaminu ósmoklasisty od 2015 roku.",
  },
  {
    href: "/matura-rozszerzona",
    icon: GraduationCap,
    title: "Matura rozszerzona",
    text: "Zakres materiału i archiwum arkuszy rozszerzonych.",
  },
  {
    href: "/plan-klasy",
    icon: Printer,
    title: "Plan dla klasy",
    text: "Orientacyjny plan tematów dla konkretnego rocznika.",
  },
];

export default function TeacherPanelPage() {
  return (
    <div className="page-container w-full py-10 sm:py-14">
      <Link href="/dla-szkol" className="text-sm font-semibold text-muted hover:text-accent">
        ← Dla szkół
      </Link>

      <header className="mt-5 max-w-2xl">
        <p className="text-overline">Panel nauczyciela</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Wszystkie narzędzia w jednym miejscu
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Startowa wersja panelu: zasoby do prowadzenia lekcji i sprawdzianów.
          Klasy, uczniowie i wyniki w jednym widoku są w przygotowaniu.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOOLS.map(({ href, icon: Icon, title, text }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-surface-border bg-surface p-5 transition hover:border-accent/50 hover:bg-surface-hover"
          >
            <span className="icon-chip h-10 w-10">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="mt-3 text-base font-extrabold text-foreground">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-accent">
              Otwórz <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-accent/25 bg-accent-soft/30 p-5">
        <h2 className="text-lg font-extrabold text-foreground">
          Czego jeszcze nie ma
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Docelowy panel nauczyciela (klasy, przypisywanie zadań, wyniki i
          faktury) wymaga kont szkolnych i osobnego wdrożenia. Ten ekran zbiera
          to, co jest gotowe już teraz — bez udawania, że B2B jest skończone.
        </p>
        <a
          href="mailto:kontakt@szybkamatematyka.pl?subject=Pakiet%20szkolny"
          className="mt-4 inline-flex rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-bold text-accent transition hover:bg-accent/15"
        >
          Porozmawiaj o pakiecie szkolnym
        </a>
      </section>

      <div className="mt-8">
        <SchoolInquiryForm />
      </div>
    </div>
  );
}
