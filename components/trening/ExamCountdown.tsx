"use client";

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

/**
 * Jedna linijka z datą egzaminu - wcześniej była to osobna, duża karta z
 * etykietą, opisem i linkiem do diagnozy. Treść została ta sama, ale bez
 * dodatkowego bloku na stronie treningu.
 */
export function ExamCountdown() {
  const storedDate = useSyncExternalStore(
    subscribeExamDate,
    loadExamDate,
    getServerDate,
  );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inputValue = draft ?? storedDate ?? "";
  const days = storedDate ? daysUntilExam(storedDate) : null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidExamDate(inputValue)) {
      setError("Wybierz poprawną datę.");
      return;
    }
    setError(null);
    saveExamDate(inputValue);
    setDraft(null);
    setEditing(false);
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {editing ? (
        <form
          onSubmit={submit}
          className="flex flex-wrap items-center gap-1.5"
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
            className="input-field px-2 py-1 text-xs"
            autoFocus
          />
          <button
            type="submit"
            className="font-bold text-accent hover:underline"
          >
            Zapisz
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(null);
              setEditing(false);
              setError(null);
            }}
            className="underline underline-offset-2 hover:text-foreground"
          >
            Anuluj
          </button>
          {error ? (
            <span className="font-semibold text-danger">{error}</span>
          ) : null}
        </form>
      ) : storedDate && days != null ? (
        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            Do egzaminu:{" "}
            <strong className="font-bold text-foreground">
              {daysLabel(days)}
            </strong>{" "}
            <span className="text-muted">({examDateLabel(storedDate)})</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setDraft(storedDate);
              setEditing(true);
            }}
            className="underline underline-offset-2 hover:text-foreground"
          >
            zmień
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            setEditing(true);
          }}
          className="font-semibold text-accent hover:underline"
        >
          Ustaw datę egzaminu
        </button>
      )}
    </div>
  );
}
