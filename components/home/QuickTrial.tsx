"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

type TrackKey = "8_klasa" | "matura";

type TrialTask = {
  question: string;
  answers: readonly string[];
  correct: string;
  explanation: string;
};

const TRACKS: Record<
  TrackKey,
  { label: string; href: string; tasks: readonly TrialTask[] }
> = {
  "8_klasa": {
    label: "8-klasista",
    href: "/trening",
    tasks: [
      {
        question: "Rozwiąż: 3x + 2 = 14. Ile wynosi x?",
        answers: ["3", "4", "5", "6"],
        correct: "4",
        explanation: "3 · 4 + 2 = 14.",
      },
      {
        question: "Ile to 25% z liczby 80?",
        answers: ["16", "20", "25", "40"],
        correct: "20",
        explanation: "25% to jedna czwarta, a 80 : 4 = 20.",
      },
    ],
  },
  matura: {
    label: "Matura",
    href: "/trening",
    tasks: [
      {
        question: "Ile wynosi log₂ 8?",
        answers: ["2", "3", "4", "16"],
        correct: "3",
        explanation: "2³ = 8, więc log₂ 8 = 3.",
      },
      {
        question: "Funkcja f(x) = x² - 4x + 1. Ile wynosi f(3)?",
        answers: ["-2", "2", "1", "-4"],
        correct: "-2",
        explanation: "9 - 12 + 1 = -2.",
      },
    ],
  },
};

export function QuickTrial() {
  const [track, setTrack] = useState<TrackKey>("8_klasa");
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const sessionId = useRef<string | null>(null);

  const { tasks, label, href } = TRACKS[track];
  const task = tasks[taskIndex];
  const solved = answer === task.correct;
  const isLast = taskIndex === tasks.length - 1;
  const finished = solved && isLast;

  const reset = (nextTrack: TrackKey) => {
    setTrack(nextTrack);
    setTaskIndex(0);
    setAnswer(null);
    setMistakes(0);
  };

  const choose = (value: string) => {
    setAnswer(value);
    if (value !== task.correct) setMistakes((count) => count + 1);

    const id = sessionId.current ?? crypto.randomUUID();
    sessionId.current = id;

    void fetch("/api/quick-trial/attempt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: id, isCorrect: value === task.correct }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Quick trial tracking failed with status ${response.status}.`,
          );
        }
      })
      .catch((error: unknown) => {
        console.error("[szybka-matma] quick trial tracking:", error);
      });
  };

  return (
    <div className="card-raised p-4 sm:p-6" aria-label="Szybka próba">
      <div className="flex items-center justify-between gap-3">
        <p className="text-overline">SZYBKA PRÓBA</p>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted">
          Zadanie {taskIndex + 1} z {tasks.length}
        </span>
      </div>

      <div
        className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-surface-border bg-background p-1"
        role="group"
        aria-label="Wybierz poziom"
      >
        {(Object.keys(TRACKS) as TrackKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={track === key}
            onClick={() => reset(key)}
            className={`min-h-11 rounded-lg px-2 text-sm font-bold transition-colors ${
              track === key
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {TRACKS[key].label}
          </button>
        ))}
      </div>

      <p className="mt-5 text-lg font-bold leading-snug text-foreground">
        {task.question}
      </p>

      <div
        className="mt-4 grid grid-cols-2 gap-3"
        role="group"
        aria-label="Odpowiedzi do zadania"
      >
        {task.answers.map((value, index) => {
          const selected = answer === value;
          const isCorrect = value === task.correct;
          let style =
            "border-surface-border bg-background text-foreground hover:border-accent/50 hover:bg-surface-hover";
          if (selected && isCorrect) {
            style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-300";
          } else if (selected) {
            style = "border-red-500/50 bg-red-500/10 text-red-300";
          }

          return (
            <button
              key={value}
              type="button"
              aria-label={`Odpowiedź ${value}`}
              aria-pressed={selected}
              disabled={solved}
              onClick={() => choose(value)}
              className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2 text-left text-base font-semibold transition-colors disabled:cursor-default ${style}`}
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface text-xs font-bold text-muted">
                {String.fromCharCode(65 + index)}
              </span>
              {value}
            </button>
          );
        })}
      </div>

      <p
        className="mt-4 min-h-6 text-sm font-semibold text-muted"
        aria-live="polite"
      >
        {solved ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <Check className="h-4 w-4" aria-hidden />
            Dobrze! {task.explanation}
          </span>
        ) : answer ? (
          <span className="text-red-400">
            To nie ta odpowiedź - spróbuj jeszcze raz.
          </span>
        ) : (
          "Wybierz odpowiedź, aby sprawdzić."
        )}
      </p>

      {solved && !finished && (
        <button
          type="button"
          onClick={() => {
            setTaskIndex(taskIndex + 1);
            setAnswer(null);
          }}
          className="btn-chunky mt-3 w-full px-5 py-3 text-base"
        >
          Następne zadanie
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
      )}

      {finished && (
        <div className="mt-3 rounded-xl bg-accent-soft/60 p-4">
          <p className="text-base font-bold text-foreground">
            {mistakes === 0
              ? "Świetnie! Oba zadania bez pomyłki."
              : `Gotowe! Błędnych odpowiedzi: ${mistakes}.`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href={href}
              className="btn-chunky px-5 py-3 text-base"
            >
              Trenuj dalej: {label}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => reset(track)}
              className="text-sm font-bold text-accent underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent"
            >
              Jeszcze raz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
