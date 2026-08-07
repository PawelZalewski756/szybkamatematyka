"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { useLearningPath } from "@/components/LearningPathProvider";
import { learningPathLabel } from "@/lib/learning-path";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Flame,
  Gamepad2,
  Library,
  RotateCcw,
  Swords,
  Trophy,
} from "lucide-react";
import Link from "next/link";

const DESTINATIONS = [
  {
    href: "/trening",
    label: "Trening tematyczny",
    hint: "Tematy w kolejności egzaminacyjnej — teoria, potem zadania",
    icon: BookOpen,
  },
  {
    href: "/baza-zadan",
    label: "Baza zadań",
    hint: "Zadania z pełnym tokiem rozwiązania",
    icon: Library,
  },
  {
    href: "/trening/arkusze",
    label: "Arkusze CKE",
    hint: "Oficjalne arkusze maturalne i egzamin ósmoklasisty",
    icon: FileText,
  },
  {
    href: "/minigry",
    label: "Minigry",
    hint: "Krótkie rundy na czas i na wytrwałość",
    icon: Gamepad2,
  },
  {
    href: "/powtorki",
    label: "Powtórki",
    hint: "Wracasz do tematów, które poszły słabiej",
    icon: RotateCcw,
  },
  {
    href: "/pojedynki",
    label: "Pojedynki",
    hint: "Rozwiązujesz to samo zadanie przeciwko innemu uczniowi",
    icon: Swords,
  },
] as const;

const STEPS = [
  {
    n: "1",
    title: "Ustaw ścieżkę",
    text: "Klasa albo matura — treść dopasowana do Twojego egzaminu.",
  },
  {
    n: "2",
    title: "Ćwicz temat",
    text: "Krótka teoria, potem zadania. Wiesz, na czym stanąć.",
  },
  {
    n: "3",
    title: "Rozwiąż arkusz",
    text: "Cały arkusz CKE albo treningowy — z rozwiązaniami do sprawdzenia.",
  },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function HomeDashboard() {
  const { path } = useLearningPath();
  const pathLabel = learningPathLabel(path);

  return (
    <div className="flex flex-1 flex-col">
      {/* ——— Hero: luzno — marka, jedna myśl, powietrze ——— */}
      <section className="relative isolate -mx-4 min-h-[min(86vh,48rem)] overflow-hidden border-b border-surface-border sm:-mx-6 md:-mx-8 lg:-mx-10 xl:-mx-12 2xl:-mx-16">
        <GamingBackground variant="hero" />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 70% 35%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 65%)",
          }}
        />

        <div className="page-container relative z-10 flex min-h-[min(86vh,48rem)] flex-col justify-center py-20 sm:py-24 lg:py-28">
          <motion.h1
            className="text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold leading-[0.95] tracking-tight"
            {...fadeUp}
            transition={{ duration: 0.5 }}
          >
            <span className="text-accent">Szybka</span>
            <br />
            <span className="text-foreground">Matematyka</span>
          </motion.h1>

          <motion.p
            className="mt-8 max-w-sm text-lg leading-relaxed text-muted sm:text-xl"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            Teoria, zadania i arkusze CKE
            <span className="text-foreground/80"> — {pathLabel}</span>.
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <Link
              href="/trening"
              className="btn-chunky w-full px-8 py-4 text-base sm:w-auto"
            >
              Zacznij trening
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/trening/arkusze"
              className="btn-chunky-soft w-full px-8 py-4 text-base sm:w-auto"
            >
              Arkusze CKE
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ——— Co jest w środku ——— */}
      <section className="border-b border-surface-border py-14 sm:py-20">
        <div className="page-container">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Co znajdziesz w serwisie
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Trening, baza zadań i arkusze — w jednym miejscu, pod Twój egzamin.
          </p>

          <ul className="mt-10 divide-y divide-surface-border border-y border-surface-border">
            {DESTINATIONS.map(({ href, label, hint, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-start gap-4 py-5 transition-colors hover:bg-surface/40 sm:items-center sm:gap-5 sm:px-2"
                >
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-surface-border bg-accent-soft text-accent sm:mt-0">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-foreground group-hover:text-accent">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {hint}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-1 h-5 w-5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent sm:mt-0"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            <Link
              href="/rankingi"
              className="inline-flex items-center gap-2 hover:text-accent"
            >
              <Trophy className="h-4 w-4" aria-hidden />
              Rankingi
            </Link>
            <Link
              href="/wyzwania"
              className="inline-flex items-center gap-2 hover:text-accent"
            >
              <Flame className="h-4 w-4" aria-hidden />
              Wyzwanie dnia
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Jak działa ——— */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--accent)_8%,transparent),transparent_50%)]"
          aria-hidden
        />
        <div className="page-container relative">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Od tematu do arkusza
          </h2>
          <p className="mt-3 max-w-xl text-base text-muted">
            Prosta kolejność: ścieżka, trening, sprawdzenie na arkuszu.
          </p>

          <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step) => (
              <li key={step.n} className="min-w-0">
                <p className="text-sm font-bold tracking-wide text-accent">
                  {step.n}
                </p>
                <h3 className="mt-3 text-lg font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-12">
            <Link href="/trening" className="btn-chunky px-8 py-4 text-base">
              Przejdź do treningu
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <p className="mt-3 text-xs text-muted">
              Aktualna ścieżka: {pathLabel}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
