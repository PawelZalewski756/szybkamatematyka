"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import { learningPathLabel } from "@/lib/learning-path";
import {
  ArrowRight,
  FileText,
  Flame,
  Gamepad2,
  GraduationCap,
  Library,
  RotateCcw,
  Swords,
  Trophy,
} from "lucide-react";
import Link from "next/link";

const CARDS = [
  {
    href: "/baza-zadan",
    label: "Baza zadań",
    hint: "Zadania z pełnymi rozwiązaniami",
    icon: Library,
  },
  {
    href: "/trening/arkusze",
    label: "Arkusze CKE",
    hint: "Całe arkusze egzaminacyjne",
    icon: FileText,
  },
  {
    href: "/minigry",
    label: "Minigry",
    hint: "Szybkie gry na czas",
    icon: Gamepad2,
  },
  {
    href: "/powtorki",
    label: "Powtórki",
    hint: "Wróć do słabszych tematów",
    icon: RotateCcw,
  },
  {
    href: "/pojedynki",
    label: "Pojedynki",
    hint: "Rywalizuj z innymi",
    icon: Swords,
  },
  {
    href: "/rankingi",
    label: "Rankingi",
    hint: "Sprawdź swoją pozycję",
    icon: Trophy,
  },
] as const;

export function HomeDashboard() {
  const { path } = useLearningPath();
  const pathLabel = learningPathLabel(path);

  return (
    <section className="page-container py-8 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <GraduationCap className="h-3.5 w-3.5 text-accent" aria-hidden />
          {pathLabel}
        </span>

        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
          Ogarnij matematykę
          <br />
          <span className="text-accent">krok po kroku.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Teoria, zadania z rozwiązaniami i całe arkusze CKE — poukładane po
          tematach. Uczysz się tego, co faktycznie będzie na egzaminie.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/trening"
            className="btn-chunky w-full px-7 py-4 text-base sm:w-auto"
          >
            Zacznij trening
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
          <Link
            href="/wyzwania"
            className="btn-chunky-soft w-full px-7 py-4 text-base sm:w-auto"
          >
            <Flame className="h-5 w-5 text-accent" aria-hidden />
            Wyzwanie dnia
          </Link>
        </div>

        <h2 className="mt-14 text-sm font-bold uppercase tracking-wide text-muted">
          Odkryj resztę
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CARDS.map(({ href, label, hint, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="card-raised group flex items-center gap-4 p-4 sm:p-5"
            >
              <span className="icon-chip h-11 w-11 shrink-0">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-bold text-foreground">
                  {label}
                </span>
                <span className="mt-0.5 block text-sm text-muted">{hint}</span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
