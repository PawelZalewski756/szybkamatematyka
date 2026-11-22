"use client";

import {
  ArrowRight,
  CalendarRange,
  Check,
  Clock,
  Flame,
  RefreshCw,
  Target,
} from "lucide-react";
import Link from "next/link";

import { useWeeklyPlan } from "@/components/home-v2/use-weekly-plan";
import type { WeeklyPlan } from "@/lib/plan-tygodnia/plan";

const REVIEW_STEPS = ["Dziś", "+1 dzień", "+3 dni", "+7 dni", "+14 dni"];

function PlanSkeleton() {
  return (
    <div className="mt-5 animate-pulse space-y-3" aria-hidden>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="h-16 rounded-xl border border-surface-border bg-background/60"
          />
        ))}
      </div>
      <div className="h-28 rounded-xl border border-surface-border bg-background/60" />
    </div>
  );
}

function ExamContext({
  examDateLabel,
  daysUntilExam,
}: {
  examDateLabel: string | null;
  daysUntilExam: number | null;
}) {
  if (!examDateLabel || daysUntilExam === null) {
    return (
      <p className="mt-2 text-xs text-muted">
        <Link href="/trening" className="font-semibold text-accent hover:underline">
          Ustaw datę egzaminu
        </Link>
        , aby plan był dokładniejszy.
      </p>
    );
  }

  if (daysUntilExam < 0) {
    return (
      <p className="mt-2 text-xs text-muted">
        Egzamin minął ({examDateLabel}).{" "}
        <Link href="/trening" className="font-semibold text-accent hover:underline">
          Ustaw nowy termin
        </Link>
        .
      </p>
    );
  }

  return (
    <p className="mt-2 text-xs text-muted">
      <span className="font-semibold text-foreground">
        {daysUntilExam === 0
          ? "Egzamin jest dziś"
          : `Do egzaminu: ${daysUntilExam} dni`}
      </span>{" "}
      · {examDateLabel}
    </p>
  );
}

function PlanCard({
  plan,
  loading,
  toggleTask,
}: {
  plan: WeeklyPlan | null;
  loading: boolean;
  toggleTask: (taskId: string) => void;
}) {
  return (
    <div className="card-raised flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="icon-chip h-11 w-11">
          <CalendarRange className="h-5 w-5" aria-hidden />
        </span>
        <span className="rounded-full border border-accent/30 bg-accent-soft/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
          Nowe
        </span>
      </div>

      <h3 className="mt-4 text-xl font-extrabold tracking-tight text-foreground">
        Wiesz, co robić w każdym dniu
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        7 dni, 2–3 zadania dziennie i jasny cel. Plan układa się z daty
        egzaminu, Twojej klasy i zaległych powtórek.
      </p>

      {loading || !plan ? (
        <PlanSkeleton />
      ) : (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Target className="h-3.5 w-3.5 text-accent" aria-hidden />
              {plan.classLabel}
            </span>
            <span className="text-surface-border" aria-hidden>
              •
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Clock className="h-3.5 w-3.5 text-accent" aria-hidden />
              {plan.totalMinutes} min w tygodniu
            </span>
          </div>

          <ExamContext
            examDateLabel={plan.examDateLabel}
            daysUntilExam={plan.daysUntilExam}
          />

          <div className="mt-5 grid grid-cols-7 gap-1.5">
            {plan.days.map((day) => (
              <div
                key={day.dateKey}
                className={`rounded-xl border p-2 text-center ${
                  day.isToday
                    ? "border-accent/60 bg-accent-soft/80 ring-2 ring-accent/25"
                    : day.completed
                      ? "border-accent/35 bg-accent-soft/50"
                      : "border-surface-border bg-background/60"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                  {day.weekday}
                </p>
                <p className="mt-1 text-sm font-black tabular-nums text-foreground">
                  {day.isRest ? "-" : day.totalCount}
                </p>
                <p className="text-[9px] text-muted">
                  {day.isRest ? "przerwa" : "zad."}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-accent/25 bg-background/70 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-foreground">
                {plan.today
                  ? `Dziś · ${plan.today.totalCount} ${
                      plan.today.totalCount === 1
                        ? "zadanie"
                        : plan.today.totalCount >= 2 &&
                            plan.today.totalCount <= 4
                          ? "zadania"
                          : "zadań"
                    }`
                  : "Dziś"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-accent">
                {plan.completedTasks}/{plan.totalTasks} w tygodniu
              </span>
            </div>

            {plan.today && plan.today.tasks.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {plan.today.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2 text-xs text-muted"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      aria-pressed={task.completed}
                      aria-label={
                        task.completed
                          ? `Oznacz jako niezrobione: ${task.title}`
                          : `Oznacz jako zrobione: ${task.title}`
                      }
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition ${
                        task.completed
                          ? "border-accent bg-accent text-on-accent"
                          : "border-surface-border bg-background hover:border-accent/60"
                      }`}
                    >
                      {task.completed ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : null}
                    </button>
                    <Link
                      href={task.href}
                      className={`min-w-0 flex-1 truncate font-medium transition hover:text-accent ${
                        task.completed
                          ? "text-muted line-through"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </Link>
                    <span className="shrink-0 text-[10px] text-muted">
                      {task.minutes} min
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted">
                Dziś dzień przerwy - wróć jutro z nową energią.
              </p>
            )}

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-accent transition-[width]"
                style={{
                  width: `${
                    plan.totalTasks > 0
                      ? Math.round((plan.completedTasks / plan.totalTasks) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {!plan.hasClassPlan ? (
            <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-[11px] leading-relaxed text-muted">
              Dla klas 1–3 nie mamy jeszcze planu tematycznego. Na razie
              korzystaj z minigier i działów szkoły podstawowej.
            </p>
          ) : null}

          <Link
            href="/plan-tygodnia"
            className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"
          >
            Otwórz cały plan
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </>
      )}
    </div>
  );
}

function ReviewCard({
  plan,
  loading,
}: {
  plan: WeeklyPlan | null;
  loading: boolean;
}) {
  const dueCount = plan?.reviewDueCount ?? 0;
  const totalCount = plan?.reviewTotalCount ?? 0;

  return (
    <div id="powtorki" className="card-raised flex flex-col p-5 sm:p-6">
      <span className="icon-chip h-11 w-11">
        <RefreshCw className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-xl font-extrabold tracking-tight text-foreground">
        Powtórki, które działają
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Spaced repetition w wariancie SM-2. Po błędzie zadanie wraca szybciej,
        po poprawnej odpowiedzi - rzadziej.
      </p>

      <div className="mt-5 rounded-xl border border-accent/25 bg-accent-soft/40 p-4">
        <p className="text-4xl font-black tabular-nums text-foreground">
          {loading ? "…" : dueCount}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-muted">
          {dueCount === 0
            ? "Brak zaległych powtórek - dobra robota."
            : dueCount === 1
              ? "zadanie czeka na powtórkę dziś"
              : "zadań czeka na powtórkę dziś"}
        </p>
        {!loading && totalCount > 0 ? (
          <p className="mt-1 text-[10px] text-muted">
            {totalCount} {totalCount === 1 ? "zadanie" : "zadań"} w Twojej talii
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {REVIEW_STEPS.map((step, index) => (
          <div
            key={step}
            className="rounded-lg border border-surface-border bg-background/60 p-2 text-center"
          >
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
              {step}
            </p>
            <span
              className={`mx-auto mt-1.5 block h-1.5 w-1.5 rounded-full ${
                index === 0 ? "bg-accent" : "bg-surface-border"
              }`}
              aria-hidden
            />
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1">
          <Flame className="h-3.5 w-3.5 text-accent" aria-hidden />
          Błąd = szybszy powrót
        </span>
        <span className="text-surface-border" aria-hidden>
          •
        </span>
        <span>Sukces = dłuższa przerwa</span>
      </div>

      <Link
        href="/powtorki"
        className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"
      >
        Otwórz powtórki
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export function WeekSection() {
  const { plan, loading, toggleTask } = useWeeklyPlan();

  return (
    <section
      id="plan-tygodnia"
      className="border-b border-surface-border bg-surface/35 py-14 sm:py-20"
      aria-labelledby="tydzien-heading"
    >
      <div className="page-container px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="max-w-2xl">
          <p className="text-overline">TWÓJ TYDZIEŃ</p>
          <h2
            id="tydzien-heading"
            className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            Plan, powtórki i seria w jednym rytmie
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Nie musisz codziennie zastanawiać się, co zrobić. Plan podpowiada
            następny krok, a powtórki pilnują, żeby nic nie uciekło.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <PlanCard plan={plan} loading={loading} toggleTask={toggleTask} />
          <ReviewCard plan={plan} loading={loading} />
        </div>
      </div>
    </section>
  );
}
