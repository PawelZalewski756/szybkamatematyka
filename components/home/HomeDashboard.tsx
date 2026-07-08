"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { learningPathLabel } from "@/lib/learning-path";
import Link from "next/link";

export function HomeDashboard() {
  const { path } = useLearningPath();
  const pathLabel = learningPathLabel(path);

  return (
    <div className="relative flex flex-1 flex-col">
      <section className="page-container py-8 sm:py-12">
        <div className="max-w-xl">
          <p className="text-sm text-muted">{pathLabel}</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Co dziś ćwiczymy?
          </h1>
          <p className="mt-3 text-base text-muted">
            Wybierz wyzwanie albo przejdź do treningu po tematach.
          </p>
        </div>

        <ul className="mt-8 max-w-xl divide-y divide-surface-border border-y border-surface-border">
          <li>
            <Link
              href="/wyzwania"
              className="flex items-baseline justify-between gap-4 py-4 transition hover:bg-surface-hover"
            >
              <span>
                <span className="block font-medium text-foreground">Wyzwanie dnia</span>
                <span className="mt-0.5 block text-sm text-muted">Jedno zadanie na timer</span>
              </span>
              <span className="text-sm text-muted" aria-hidden>
                →
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/trening"
              className="flex items-baseline justify-between gap-4 py-4 transition hover:bg-surface-hover"
            >
              <span>
                <span className="block font-medium text-foreground">Trening po tematach</span>
                <span className="mt-0.5 block text-sm text-muted">
                  Teoria i zadania — matura lub egzamin 8-kl.
                </span>
              </span>
              <span className="text-sm text-muted" aria-hidden>
                →
              </span>
            </Link>
          </li>
        </ul>

        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Na skróty">
          <Link href="/baza-zadan" className="link-plain">
            Baza zadań
          </Link>
          <Link href="/trening/arkusze" className="link-plain">
            Arkusze CKE
          </Link>
          <Link href="/minigry" className="link-plain">
            Minigry
          </Link>
          <Link href="/powtorki" className="link-plain">
            Powtórki
          </Link>
        </nav>

        <div className="mt-8 max-w-xl border-t border-surface-border pt-4">
          <PlatformStatus variant="inline" />
        </div>
      </section>
    </div>
  );
}
