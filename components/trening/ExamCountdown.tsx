"use client";

import { useLearningPath } from "@/components/LearningPathProvider";
import {
  daysUntilExam,
  examDateLabel,
  isValidExamDate,
  loadExamDate,
  saveExamDate,
  subscribeExamDate,
} from "@/lib/exam-date";
import { CalendarDays } from "lucide-react";
import { useSyncExternalStore, useState, type FormEvent } from "react";

function daysLabel(days: number): string {
  if (days < 0) return "termin minął";
  if (days === 0) return "dziś";
  if (days === 1) return "1 dzień";
  return `${days} dni`;
}

const getServerDate = () => null;

/** Mała karta z datą egzaminu i licznikiem dni. Nie wymaga konta. */
export function ExamCountdown() {
  const { path } = useLearningPath();
  const storedDate = useSyncExternalStore(
    subscribeExamDate,
    loadExamDate,
    getServerDate,
  );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const examLabel = path === "sp" ? "egzamin ósmoklasisty" : "matura";
  const inputValue = draft ?? storedDate ?? "";
  const days = storedDate ? daysUntilExam(storedDate) : null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidExamDate(inputValue)) {
      setError("Wybierz poprawną datę egzaminu.");
      return;
    }
    setError(null);
    saveExamDate(inputValue);
    setDraft(null);
    setEditing(false);
  };

  return (
    <section
      className="card-raised mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Data egzaminu"
    >
      <div className="flex items-center gap-3">
        <span className="icon-chip h-10 w-10 shrink-0">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-overline">Twój egzamin</p>
          <p className="text-sm font-bold text-foreground">{examLabel}</p>
        </div>
      </div>

      {editing ? (
        <form
          onSubmit={submit}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <label htmlFor="exam-date" className="sr-only">
            Data egzaminu
          </label>
          <input
            id="exam-date"
            type="date"
            value={inputValue}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            className="input-field py-2 text-sm"
          />
          <button type="submit" className="btn-chunky px-4 py-2 text-sm">
            Zapisz datę
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(null);
              setEditing(false);
              setError(null);
            }}
            className="text-xs font-semibold text-muted underline underline-offset-4 hover:text-accent"
          >
            Anuluj
          </button>
          {error ? (
            <p className="text-xs font-semibold text-danger sm:max-w-40">
              {error}
            </p>
          ) : null}
        </form>
      ) : storedDate && days != null ? (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xl font-extrabold tabular-nums text-foreground">
              {daysLabel(days)}
            </p>
            <p className="text-xs text-muted">{examDateLabel(storedDate)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDraft(storedDate);
              setEditing(true);
            }}
            className="text-xs font-semibold text-muted underline underline-offset-4 hover:text-accent"
          >
            Zmień
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            setEditing(true);
          }}
          className="self-start rounded-xl border border-surface-border px-3 py-2 text-xs font-bold text-foreground transition hover:border-accent/50 hover:text-accent sm:self-auto"
        >
          Ustaw datę egzaminu
        </button>
      )}
    </section>
  );
}
