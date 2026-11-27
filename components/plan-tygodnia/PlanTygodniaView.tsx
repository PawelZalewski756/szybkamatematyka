"use client";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarRange,
  Check,
  Clock,
  Flame,
  RefreshCw,
  Target,
} from "lucide-react";
import Link from "next/link";

import { useWeeklyPlan } from "@/components/home-v2/use-weekly-plan";
import type { WeeklyPlan, WeeklyPlanDay } from "@/lib/plan-tygodnia/plan";

function pluralTasks(count: number): string {
  if (count === 1) return "zadanie";
  if (count >= 2 && count <= 4) return "zadania";
  return "zadań";
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function DayCard({
  day,
  toggleTask,
}: {
  day: WeeklyPlanDay;
  toggleTask: (taskId: string) => void;
}) {
  return (
    <article
      className={`flex flex-col rounded-2xl border p-4 ${
        day.isToday
          ? "border-accent/50 bg-accent-soft/40 ring-2 ring-accent/20"
          : day.completed
            ? "border-accent/30 bg-accent-soft/25"
            : day.isRest
              ? "border-dashed border-surface-border bg-background/50"
              : "border-surface-border bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            {day.weekday}
            {day.isToday ? " · dziś" : ""}
          </p>
          <p className="mt-1 text-sm font-extrabold text-foreground">
            {day.dateLabel}
          </p>
        </div>
        {day.completed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-[10px] font-bold text-accent">
            <Check className="h-3 w-3" aria-hidden />
            zrobione
          </span>
        ) : (
          <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-bold text-muted">
            {day.isRest ? "przerwa" : `${day.totalCount} ${pluralTasks(day.totalCount)}`}
          </span>
        )}
      </div>

      {day.isRest ? (
        <p className="mt-4 flex-1 text-xs leading-relaxed text-muted">
          Dzień przerwy. Odpoczynek też jest częścią planu - wróć jutro.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {day.tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-pressed={task.completed}
                aria-label={
                  task.completed
                    ? `Oznacz jako niezrobione: ${task.title}`
                    : `Oznacz jako zrobione: ${task.title}`
                }
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition ${
                  task.completed
                    ? "border-accent bg-accent text-on-accent"
                    : "border-surface-border bg-background hover:border-accent/60"
                }`}
              >
                {task.completed ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : null}
              </button>
              <div className="min-w-0 flex-1">
                <Link
                  href={task.href}
                  className={`block text-xs font-semibold leading-snug transition hover:text-accent ${
                    task.completed
                      ? "text-muted line-through"
                      : "text-foreground"
                  }`}
                >
                  {task.title}
                </Link>
                <p className="mt-0.5 text-[10px] text-muted">
                  {task.minutes} min · +{task.xp} XP
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function PlanContent({ plan, toggleTask }: { plan: WeeklyPlan; toggleTask: (id: string) => void }) {
  const progress =
    plan.totalTasks > 0
      ? Math.round((plan.completedTasks / plan.totalTasks) * 100)
      : 0;

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-3 py-1.5">
          <CalendarRange className="h-3.5 w-3.5 text-accent" aria-hidden />
          {plan.weekLabel}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-3 py-1.5">
          <Target className="h-3.5 w-3.5 text-accent" aria-hidden />
          {plan.classLabel}
        </span>
        {plan.daysUntilExam !== null ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-surface px-3 py-1.5">
            <Flame className="h-3.5 w-3.5 text-accent" aria-hidden />
            {plan.daysUntilExam < 0
              ? "egzamin minął"
              : plan.daysUntilExam === 0
                ? "egzamin dziś"
                : `do egzaminu ${plan.daysUntilExam} dni`}
          </span>
        ) : (
          <Link
            href="/trening"
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-accent hover:border-accent/60"
          >
            <Flame className="h-3.5 w-3.5" aria-hidden />
            ustaw datę egzaminu
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Zadania w tygodniu"
          value={String(plan.totalTasks)}
          hint={`${plan.totalMinutes} min łącznie`}
        />
        <SummaryCard
          label="Zrobione"
          value={`${plan.completedTasks}/${plan.totalTasks}`}
          hint={plan.completedTasks === 0 ? "zacznij od dziś" : `${progress}% planu`}
        />
        <SummaryCard
          label="Powtórki"
          value={String(plan.reviewDueCount)}
          hint={
            plan.reviewDueCount === 0
              ? "brak zaległości"
              : `${pluralTasks(plan.reviewDueCount)} na dziś`
          }
        />
        <SummaryCard
          label="Skupienie"
          value={plan.focusLabel.replace("Skupienie: ", "")}
          hint="na podstawie diagnozy"
        />
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full border border-surface-border bg-surface">
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plan.days.map((day) => (
          <DayCard key={day.dateKey} day={day} toggleTask={toggleTask} />
        ))}
      </div>

      {!plan.hasClassPlan ? (
        <p className="mt-5 rounded-xl border border-accent/25 bg-accent-soft/40 p-4 text-sm leading-relaxed text-muted">
          Dla klas 1–3 nie mamy jeszcze planu tematycznego. Możesz korzystać z
          minigier i działów szkoły podstawowej, a plan tygodnia nadal pokaże
          powtórki i wyzwania.
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/trening" className="btn-chunky px-5 py-3 text-sm">
          <BookOpen className="mr-2 inline h-4 w-4" aria-hidden />
          Przejdź do treningu
          <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/powtorki"
          className="rounded-xl border border-surface-border bg-surface px-5 py-3 text-sm font-bold text-foreground transition hover:border-accent/50 hover:text-accent"
        >
          <RefreshCw className="mr-2 inline h-4 w-4" aria-hidden />
          Otwórz powtórki
        </Link>
        <Link
          href="/plan-klasy"
          className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-muted transition hover:text-accent"
        >
          <CalendarDays className="h-4 w-4" aria-hidden />
          Zmień klasę
        </Link>
      </div>
    </>
  );
}

function PlanSkeleton() {
  return (
    <div className="mt-6 animate-pulse space-y-4" aria-hidden>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-2xl border border-surface-border bg-surface"
          />
        ))}
      </div>
      <div className="h-2 rounded-full bg-surface" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-2xl border border-surface-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}

export function PlanTygodniaView() {
  const { plan, loading, toggleTask } = useWeeklyPlan();

  return (
    <div className="page-container w-full py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm font-semibold text-muted transition hover:text-accent"
      >
        ← Strona główna
      </Link>

      <header className="mt-4 max-w-3xl">
        <p className="text-overline">PLAN TYGODNIA</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Twój plan na ten tydzień
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Plan układa się z daty egzaminu, Twojej klasy, diagnozy i zaległych
          powtórek. Każdy dzień to 2–3 zadania - dość, żeby iść do przodu, i
          dość mało, żeby nie wypalić się w pierwszy poniedziałek.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3.5 w-3.5 text-accent" aria-hidden />
          Postęp zapisuje się lokalnie w tej przeglądarce.
        </p>
      </header>

      {loading || !plan ? <PlanSkeleton /> : <PlanContent plan={plan} toggleTask={toggleTask} />}
    </div>
  );
}
