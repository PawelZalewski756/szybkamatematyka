"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { learningPathLabel } from "@/lib/learning-path";
import { ChevronRight, GraduationCap, Trophy } from "lucide-react";
import Link from "next/link";

export function HomeDashboard() {
  const { path } = useLearningPath();
  const pathLabel = learningPathLabel(path);

  return (
    <div className="relative flex flex-1 flex-col">
      <section className="page-container py-8 sm:py-12">
        <div className="max-w-2xl">
          <p className="text-sm text-muted">{pathLabel}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Co dziś ćwiczymy?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Wyzwanie na dziś albo trening po tematach — wybierz, od czego zacząć.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/wyzwania"
            className="group flex items-center gap-4 surface-card p-4 transition hover:bg-surface-hover sm:p-5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-brand">
              <Trophy className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-foreground">Wyzwanie dnia</span>
              <span className="mt-0.5 block text-sm text-muted">
                Jedno zadanie na timer.
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted group-hover:text-brand" aria-hidden />
          </Link>

          <Link
            href="/trening"
            className="group flex items-center gap-4 surface-card p-4 transition hover:bg-surface-hover sm:p-5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-brand">
              <GraduationCap className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-foreground">Trening po tematach</span>
              <span className="mt-0.5 block text-sm text-muted">
                Teoria i zadania pod maturę lub egzamin 8-kl.
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted group-hover:text-brand" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/baza-zadan" className="text-brand hover:underline">
            Baza zadań
          </Link>
          <Link href="/trening/arkusze" className="text-brand hover:underline">
            Arkusze CKE
          </Link>
          <Link href="/minigry" className="text-brand hover:underline">
            Minigry
          </Link>
          <Link href="/powtorki" className="text-brand hover:underline">
            Powtórki
          </Link>
        </div>

        <div className="mt-8 surface-card px-4 py-3">
          <PlatformStatus variant="inline" />
        </div>
      </section>
    </div>
  );
}
