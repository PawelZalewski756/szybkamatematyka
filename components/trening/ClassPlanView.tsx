"use client";

import {
  getClassPlan,
  getClassPlanOptions,
} from "@/lib/trening/class-plan";
import {
  loadSchoolClass,
  saveSchoolClass,
  subscribeLearningPath,
  type SchoolClassPath,
} from "@/lib/learning-path";
import { ArrowRight, BookOpen, CalendarDays, Target } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore, useState } from "react";

const getServerClass = (): SchoolClassPath => "klasa-8";

export function ClassPlanView() {
  const stored = useSyncExternalStore(
    subscribeLearningPath,
    loadSchoolClass,
    getServerClass,
  );
  const [selected, setSelected] = useState<SchoolClassPath | null>(null);
  const value = selected ?? stored;
  const plan = getClassPlan(value);
  const options = getClassPlanOptions();

  const change = (next: SchoolClassPath) => {
    setSelected(next);
    saveSchoolClass(next);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-overline">Plan nauki</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
        Plan dla klasy
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        Wybierz klasę, a pokażemy tematy, które warto przerobić w tym roku.
        Plan jest orientacyjny - kolejność może różnić się od programu Twojej
        szkoły.
      </p>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-surface-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="class-plan-select" className="text-sm font-bold text-foreground">
          Twoja klasa
        </label>
        <select
          id="class-plan-select"
          value={value}
          onChange={(event) => change(event.target.value as SchoolClassPath)}
          className="input-field w-full cursor-pointer py-2.5 text-sm sm:max-w-xs"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/trening" className="btn-chunky inline-flex items-center gap-2 px-5 py-3 text-sm">
          <BookOpen className="h-4 w-4" aria-hidden />
          Przejdź do treningu
        </Link>
        <Link
          href="/diagnostyka"
          className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
        >
          <Target className="h-4 w-4" aria-hidden />
          Diagnoza startowa
        </Link>
        <Link
          href="/trening"
          className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-muted transition hover:text-accent"
        >
          <CalendarDays className="h-4 w-4" aria-hidden />
          Ustaw datę egzaminu w treningu
        </Link>
      </div>

      <p className="mt-6 text-sm text-muted">
        {plan.topicCount > 0
          ? `${plan.topicCount} tematów w planie · ${plan.label}`
          : plan.description}
      </p>

      {plan.categories.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-surface-border bg-surface p-6 text-center">
          <p className="text-sm font-bold text-foreground">
            Brak planu tematycznego dla tej klasy
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Dla klas 1–3 nie mamy jeszcze osobnego planu. Możesz korzystać z
            minigier i działów szkoły podstawowej.
          </p>
          <Link href="/minigry" className="mt-4 inline-block text-sm font-bold text-accent">
            Zobacz minigry →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {plan.categories.map((category) => (
            <section key={category.id}>
              <div className="flex items-baseline justify-between gap-3 border-b border-surface-border pb-2">
                <h2 className="text-lg font-extrabold text-foreground">
                  {category.name}
                </h2>
                <span className="text-xs font-semibold text-muted">
                  {category.topics.length} tematów
                </span>
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {category.topics.map((topic) => (
                  <li key={topic.id}>
                    <Link
                      href={topic.href}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition hover:border-accent/50 hover:bg-surface-hover"
                    >
                      <span>{topic.name}</span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-muted">
        Plan nie zastępuje podstawy programowej. Przed egzaminem wróć do pełnego
        planu CKE w treningu.
      </p>
    </div>
  );
}
