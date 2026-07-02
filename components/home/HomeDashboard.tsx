"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { learningPathLabel } from "@/lib/learning-path";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Gamepad2,
  GraduationCap,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";

const QUICK_ACTIONS = [
  {
    href: "/trening",
    label: "Tematy",
    hint: "Teoria i arena po działach",
    icon: GraduationCap,
    accent: "teal",
  },
  {
    href: "/trening/arkusze",
    label: "Arkusze CKE",
    hint: "Prawdziwe egzaminy z lat",
    icon: FileText,
    accent: "sky",
  },
  {
    href: "/minigry",
    label: "Minigry",
    hint: "Szybki trening w grach",
    icon: Gamepad2,
    accent: "violet",
  },
  {
    href: "/baza-zadan",
    label: "Baza zadań",
    hint: "Przeglądaj i filtruj",
    icon: BookOpen,
    accent: "slate",
  },
] as const;

const accentRing: Record<(typeof QUICK_ACTIONS)[number]["accent"], string> = {
  teal: "border-teal-500/20 bg-teal-500/10 text-teal-300",
  sky: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  slate: "border-white/10 bg-white/[0.05] text-slate-300",
};

export function HomeDashboard() {
  const { path } = useLearningPath();
  const pathLabel = learningPathLabel(path);

  return (
    <div className="relative flex flex-1 flex-col">
      <section className="page-container py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-400/80">
            {pathLabel}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Co dziś ćwiczymy?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Wyzwanie na dziś, ścieżka tematyczna albo arkusz CKE — wybierz, od
            czego zacząć.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Link
              href="/wyzwania"
              className="group flex h-full flex-col rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-orange-600/5 p-5 transition hover:border-amber-400/35"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-300">
                  <Trophy className="h-5 w-5" aria-hidden />
                </span>
                <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
                  Dziś
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">
                Wyzwanie dnia
              </h2>
              <p className="mt-1 flex-1 text-sm text-slate-400">
                Jedno zadanie na timer — buduj serię i zbieraj EXP.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-300 group-hover:gap-2 transition-all">
                Gram
                <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Link
              href="/trening"
              className="group flex h-full flex-col rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 to-teal-600/5 p-5 transition hover:border-teal-400/30"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/25 bg-teal-500/15 text-teal-300">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">
                Ścieżka treningowa
              </h2>
              <p className="mt-1 flex-1 text-sm text-slate-400">
                Działy i tematy z teorią, areną i postępem — pod Twój egzamin.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-300 group-hover:gap-2 transition-all">
                Kontynuuj
                <ChevronRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Na skróty
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {QUICK_ACTIONS.map(({ href, label, hint, icon: Icon, accent }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition hover:border-white/12 hover:bg-white/[0.04] sm:p-4"
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${accentRing[accent]}`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-200">{label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-slate-600 group-hover:text-slate-500">
                  {hint}
                </p>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.14 }}
          className="mt-8 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <PlatformStatus variant="inline" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <Link
            href="/pojedynki"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:text-slate-200"
          >
            Pojedynki
          </Link>
          <Link
            href="/powtorki"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:text-slate-200"
          >
            Powtórki
          </Link>
          <Link
            href="/rankingi"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:text-slate-200"
          >
            Rankingi
          </Link>
          <Link
            href="/cennik"
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:text-slate-200"
          >
            Cennik
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
