"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { useLearningPath } from "@/components/LearningPathProvider";
import { BRAND_NAME } from "@/lib/brand/constants";
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
    hint: "Teoria i zadania poukładane jak na egzaminie",
    icon: BookOpen,
  },
  {
    href: "/baza-zadan",
    label: "Baza zadań",
    hint: "Zadania z pełnymi rozwiązaniami krok po kroku",
    icon: Library,
  },
  {
    href: "/trening/arkusze",
    label: "Arkusze CKE",
    hint: "Całe sesje maturalne i egzamin 8-klasisty",
    icon: FileText,
  },
  {
    href: "/minigry",
    label: "Minigry",
    hint: "Szybkie rundy na czas, przetrwanie, maraton",
    icon: Gamepad2,
  },
  {
    href: "/powtorki",
    label: "Powtórki",
    hint: "Wracasz do tego, co poszło słabiej",
    icon: RotateCcw,
  },
  {
    href: "/pojedynki",
    label: "Pojedynki",
    hint: "Rywalizacja 1:1 z innym uczniem",
    icon: Swords,
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Wybierz ścieżkę",
    text: "Klasa albo matura — dostajesz treść dopasowaną do egzaminu.",
  },
  {
    n: "02",
    title: "Ćwicz temat po temacie",
    text: "Najpierw teoria, potem zadania. Widzisz, gdzie utknąłeś.",
  },
  {
    n: "03",
    title: "Sprawdź się na arkuszach",
    text: "Oficjalne CKE i treningowe symulacje — z rozwiązaniami.",
  },
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export function HomeDashboard() {
  const { path } = useLearningPath();
  const pathLabel = learningPathLabel(path);

  return (
    <div className="flex flex-1 flex-col">
      {/* ——— Hero: jedna kompozycja ——— */}
      <section className="relative isolate -mx-4 min-h-[min(88vh,52rem)] overflow-hidden border-b border-surface-border sm:-mx-6 md:-mx-8 lg:-mx-10 xl:-mx-12 2xl:-mx-16">
        <GamingBackground variant="hero" />
        <div className="home-grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] lg:block"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_60%)]" />
          <div className="absolute inset-[12%_8%_18%_20%] rounded-[2rem] border border-accent/20 bg-surface/40 backdrop-blur-[2px]">
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] p-8 font-mono text-[11px] leading-relaxed text-muted/80 sm:text-xs">
              <p className="text-accent/90">{`// matura · poziom podstawowy`}</p>
              <p className="mt-4 text-foreground/80">f(x) = −x² + 22x + 279</p>
              <p className="mt-2">L(3) = 336</p>
              <p className="mt-2">wierzchołek → n = 11</p>
              <p className="mt-6 text-foreground/70">P = 7/64</p>
              <p className="mt-2">√(a²+b²) · sin α</p>
              <p className="mt-8 text-accent/70">rozwiązanie krok po kroku →</p>
            </div>
          </div>
        </div>

        <div className="page-container relative z-10 flex min-h-[min(88vh,52rem)] flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
          <motion.p
            className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl"
            {...fadeUp}
            transition={{ duration: 0.45 }}
          >
            <span className="text-accent">Szybka</span>{" "}
            <span className="text-foreground">Matematyka</span>
          </motion.p>

          <motion.h1
            className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            Ogarnij matematykę
            <span className="block text-accent">krok po kroku.</span>
          </motion.h1>

          <motion.p
            className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            Teoria, zadania z rozwiązaniami i arkusze CKE — poukładane pod{" "}
            <span className="text-foreground/90">{pathLabel}</span>. Uczysz się
            tego, co faktycznie wraca na egzaminie.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            <Link
              href="/trening"
              className="btn-chunky w-full px-8 py-4 text-base sm:w-auto"
            >
              Zacznij trening
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/wyzwania"
              className="btn-chunky-soft w-full px-8 py-4 text-base sm:w-auto"
            >
              <Flame className="h-5 w-5 text-accent" aria-hidden />
              Wyzwanie dnia
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ——— Co jest w środku ——— */}
      <section className="border-b border-surface-border py-14 sm:py-20">
        <div className="page-container">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Wszystko, czego potrzebujesz do egzaminu
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Jedna aplikacja zamiast dziesięciu PDF-ów. Wchodzisz, ćwiczysz,
            wracasz do słabszych tematów.
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
                    <span className="mt-0.5 block text-sm text-muted">{hint}</span>
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
            <Link href="/rankingi" className="inline-flex items-center gap-2 hover:text-accent">
              <Trophy className="h-4 w-4" aria-hidden />
              Rankingi
            </Link>
            <Link href="/wyzwania" className="inline-flex items-center gap-2 hover:text-accent">
              <Flame className="h-4 w-4" aria-hidden />
              Dzienne wyzwanie
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Jak działa ——— */}
      <section className="relative overflow-hidden py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_50%)]"
          aria-hidden
        />
        <div className="page-container relative">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Trzy kroki, bez chaosu
          </h2>
          <p className="mt-3 max-w-xl text-base text-muted">
            Nie musisz planować nauki od zera — ścieżka jest już poukładana.
          </p>

          <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step) => (
              <li key={step.n} className="min-w-0">
                <p className="font-mono text-sm font-bold tracking-widest text-accent">
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
              Aktualna ścieżka: {pathLabel} · {BRAND_NAME}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
