"use client";

import {
  DEFAULT_QUESTION_COUNT,
  buildSprawdzian,
  getAvailableClasses,
  getTopicsForClass,
} from "@/lib/sprawdziany/builder";
import {
  aggregateByTopic,
  loadSprawdzianHistory,
  saveSprawdzianResult,
} from "@/lib/sprawdziany/history";
import { scoreSprawdzian, weakTopicIds } from "@/lib/sprawdziany/scoring";
import type {
  SprawdzianQuestion,
  SprawdzianResult,
} from "@/lib/sprawdziany/types";
import {
  getSchoolClassServerSnapshot,
  loadSchoolClass,
  subscribeLearningPath,
} from "@/lib/learning-path";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

const QUESTION_COUNTS = [8, 10, 15] as const;
const LETTERS = ["A", "B", "C", "D"] as const;

type Stage = "setup" | "test" | "result";

function classNumber(schoolClass: string): number | null {
  const match = /^klasa-(\d)$/.exec(schoolClass);
  return match ? Number(match[1]) : null;
}

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SprawdzianView() {
  const storedClass = useSyncExternalStore(
    subscribeLearningPath,
    loadSchoolClass,
    getSchoolClassServerSnapshot,
  );
  const available = getAvailableClasses();
  const storedNumber = classNumber(storedClass);
  const [classOverride, setClassOverride] = useState<number | null>(null);
  const schoolClass =
    classOverride ??
    (storedNumber !== null && available.includes(storedNumber)
      ? storedNumber
      : available[available.length - 1]);
  const topics = getTopicsForClass(schoolClass);

  const [stage, setStage] = useState<Stage>("setup");
  const [selected, setSelected] = useState<string[]>([]);
  const [count, setCount] = useState<number>(DEFAULT_QUESTION_COUNT);
  const [questions, setQuestions] = useState<SprawdzianQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [history, setHistory] = useState<SprawdzianResult[]>([]);

  useEffect(() => {
    // Historia żyje w localStorage, więc można ją odczytać dopiero po zamontowaniu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(loadSprawdzianHistory());
  }, []);

  const classHistory = history.filter((r) => r.schoolClass === schoolClass);
  const weakTopics = weakTopicIds(aggregateByTopic(classHistory)).filter((id) =>
    topics.some((t) => t.id === id),
  );

  function start(topicIds: string[]) {
    const generated = buildSprawdzian({ schoolClass, topicIds, count });
    if (generated.length === 0) return;
    setSelected(topicIds);
    setQuestions(generated);
    setAnswers({});
    setStartedAt(Date.now());
    setStage("test");
    window.scrollTo({ top: 0 });
  }

  function toggleTopic(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }

  function submit() {
    const duration = Math.round((Date.now() - startedAt) / 1000);
    const scored = scoreSprawdzian(questions, answers);
    const result: SprawdzianResult = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      schoolClass,
      total: scored.total,
      correct: scored.correct,
      durationSec: duration,
      byTopic: scored.byTopic,
    };
    saveSprawdzianResult(result);
    setHistory((prev) => [result, ...prev]);
    setDurationSec(duration);
    setStage("result");
    window.scrollTo({ top: 0 });
  }

  if (stage === "test") {
    const answered = Object.keys(answers).length;
    return (
      <div className="page-container mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-foreground">
            Sprawdzian — klasa {schoolClass}
          </h1>
          <span className="text-sm font-bold text-accent">
            {answered}/{questions.length}
          </span>
        </div>
        <ol className="mt-6 space-y-5">
          {questions.map((q, index) => (
            <li
              key={q.id}
              className="rounded-3xl border border-surface-border bg-surface p-5"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Zadanie {index + 1} ·{" "}
                {topics.find((t) => t.id === q.topicId)?.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {q.prompt}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.choices.map((choice, i) => (
                  <button
                    key={choice}
                    type="button"
                    aria-pressed={answers[q.id] === i}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                    className={`rounded-2xl border px-4 py-3 text-left font-bold text-foreground transition-colors ${
                      answers[q.id] === i
                        ? "border-accent bg-accent/15"
                        : "border-surface-border bg-surface hover:border-accent/40"
                    }`}
                  >
                    <span className="mr-2 text-muted">{LETTERS[i]}.</span>
                    {choice}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-col gap-3">
          {answered < questions.length && (
            <p className="text-sm text-muted">
              Bez odpowiedzi: {questions.length - answered} — policzą się jako
              błędne.
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            className="btn-primary rounded-2xl py-4 text-base"
          >
            Oddaj sprawdzian
          </button>
          <button
            type="button"
            onClick={() => setStage("setup")}
            className="rounded-2xl border border-surface-border py-3 font-bold text-muted"
          >
            Przerwij
          </button>
        </div>
      </div>
    );
  }

  if (stage === "result") {
    const scored = scoreSprawdzian(questions, answers);
    const weak = weakTopicIds(scored.byTopic);
    return (
      <div className="page-container mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-surface-border bg-surface p-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-muted">
            Twoja ocena
          </p>
          <p className="mt-1 text-7xl font-black text-accent">
            {scored.grade.value}
          </p>
          <p className="text-lg font-bold text-foreground">
            {scored.grade.label}
          </p>
          <p className="mt-3 text-muted">
            {scored.correct}/{scored.total} poprawnych ({scored.percent}%) ·
            czas {formatDuration(durationSec)}
          </p>
        </div>

        <h2 className="mt-8 text-lg font-black text-foreground">Tematy</h2>
        <ul className="mt-3 space-y-2">
          {Object.entries(scored.byTopic).map(([id, v]) => {
            const topic = topics.find((t) => t.id === id);
            const pct = Math.round((v.correct / v.total) * 100);
            return (
              <li
                key={id}
                className="rounded-2xl border border-surface-border bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-2 text-sm font-bold text-foreground">
                  <span>
                    {topic?.emoji} {topic?.label ?? id}
                  </span>
                  <span>
                    {v.correct}/{v.total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className={`h-full rounded-full ${pct >= 60 ? "bg-success" : "bg-danger"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <h2 className="mt-8 text-lg font-black text-foreground">Rozwiązania</h2>
        <ol className="mt-3 space-y-3">
          {questions.map((q, index) => {
            const picked = answers[q.id];
            const ok = picked === q.correctIndex;
            return (
              <li
                key={q.id}
                className={`rounded-2xl border p-4 ${
                  ok
                    ? "border-success/40 bg-success/10"
                    : "border-danger/40 bg-danger/10"
                }`}
              >
                <p className="font-semibold text-foreground">
                  {index + 1}. {q.prompt}
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Twoja odpowiedź:{" "}
                  <strong>
                    {picked === undefined ? "brak" : q.choices[picked]}
                  </strong>
                  {!ok && (
                    <>
                      {" "}
                      · Poprawna: <strong>{q.choices[q.correctIndex]}</strong>
                    </>
                  )}
                </p>
                {!ok && <p className="mt-2 text-sm text-muted">{q.explanation}</p>}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-col gap-3">
          {weak.length > 0 && (
            <button
              type="button"
              onClick={() => start(weak)}
              className="btn-primary rounded-2xl py-4 text-base"
            >
              Powtórz słabsze tematy
            </button>
          )}
          <button
            type="button"
            onClick={() => start(selected)}
            className="rounded-2xl border border-surface-border py-4 font-black text-foreground"
          >
            Nowy sprawdzian z tego samego zakresu
          </button>
          <button
            type="button"
            onClick={() => setStage("setup")}
            className="rounded-2xl border border-surface-border py-3 font-bold text-muted"
          >
            Zmień tematy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/baza-zadan"
        className="text-sm font-semibold text-muted hover:text-accent"
      >
        ← Baza zadań
      </Link>
      <h1 className="mt-3 text-3xl font-black text-foreground">Sprawdziany</h1>
      <p className="mt-2 text-muted">
        Wybierz tematy z klasówki — wylosujemy zadania w stylu szkolnych
        sprawdzianów, od najłatwiejszych do najtrudniejszych, i na koniec
        wystawimy ocenę.
      </p>

      {available.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Klasa">
          {available.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={schoolClass === c}
              onClick={() => {
                setClassOverride(c);
                setSelected([]);
              }}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold ${
                schoolClass === c
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-surface-border text-muted"
              }`}
            >
              Klasa {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-2">
        <h2 className="text-lg font-black text-foreground">
          Tematy — klasa {schoolClass}
        </h2>
        <button
          type="button"
          onClick={() =>
            setSelected(
              selected.length === topics.length ? [] : topics.map((t) => t.id),
            )
          }
          className="text-sm font-bold text-accent"
        >
          {selected.length === topics.length ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {topics.map((topic) => {
          const on = selected.includes(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggleTopic(topic.id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                on
                  ? "border-accent bg-accent/15"
                  : "border-surface-border bg-surface hover:border-accent/40"
              }`}
            >
              <p className="font-black text-foreground">
                {topic.emoji} {topic.label}
              </p>
              <p className="mt-1 text-sm text-muted">{topic.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-foreground">Liczba zadań:</span>
        {QUESTION_COUNTS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={count === n}
            onClick={() => setCount(n)}
            className={`rounded-full border px-4 py-1.5 text-sm font-bold ${
              count === n
                ? "border-accent bg-accent/15 text-accent"
                : "border-surface-border text-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={selected.length === 0}
        onClick={() => start(selected)}
        className="btn-primary mt-6 w-full rounded-2xl py-4 text-base disabled:opacity-50"
      >
        {selected.length === 0 ? "Wybierz przynajmniej jeden temat" : "Rozpocznij sprawdzian"}
      </button>

      {classHistory.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-black text-foreground">Ostatnie wyniki</h2>
          <ul className="mt-3 space-y-2">
            {classHistory.slice(0, 5).map((r) => {
              const percent = Math.round((r.correct / r.total) * 100);
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface px-4 py-3 text-sm"
                >
                  <span className="text-muted">
                    {new Date(r.date).toLocaleDateString("pl-PL")}
                  </span>
                  <span className="font-bold text-foreground">
                    {r.correct}/{r.total} ({percent}%)
                  </span>
                </li>
              );
            })}
          </ul>
          {weakTopics.length > 0 && (
            <button
              type="button"
              onClick={() => start(weakTopics)}
              className="mt-4 w-full rounded-2xl border border-accent/50 bg-accent/10 py-3 font-black text-accent"
            >
              Ćwicz słabe tematy (
              {weakTopics
                .map((id) => topics.find((t) => t.id === id)?.label)
                .join(", ")}
              )
            </button>
          )}
        </section>
      )}
    </div>
  );
}
