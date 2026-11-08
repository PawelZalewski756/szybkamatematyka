"use client";

import { FigureView } from "@/components/sprawdziany/FigureView";
import { MathText } from "@/components/trening/MathText";
import type { TaskGradeResult } from "@/lib/gemini/format-task-assist";
import {
  EMPTY_ANSWERS,
  autoPoints,
  buildSheet,
  getAvailableClasses,
  getChaptersForClass,
  gradeForPoints,
  gradeTable,
  percentOf,
  randomSeed,
  type SheetAnswers,
} from "@/lib/sprawdziany/sheet";
import type { OpenTask, Sheet, SheetTask } from "@/lib/sprawdziany/types";
import { useRequirePro } from "@/lib/subscription/use-require-pro";
import { fetchTaskGrade } from "@/lib/trening/task-assist-client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Phase = "setup" | "test" | "result";

const CHOICE_LETTERS = ["A", "B", "C", "D"];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function pointsLabel(n: number): string {
  if (n === 1) return "1 pkt";
  return `${n} pkt`;
}

type OpenResult = {
  points: number;
  feedback: string;
  error?: string;
};

export function SheetView() {
  const classes = useMemo(() => getAvailableClasses(), []);
  const pro = useRequirePro();

  const [schoolClass, setSchoolClass] = useState<number>(classes[0] ?? 7);
  const [group, setGroup] = useState<"A" | "B">("A");
  const [seed, setSeed] = useState<number>(() => randomSeed());
  const [phase, setPhase] = useState<Phase>("setup");
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [answers, setAnswers] = useState<SheetAnswers>(EMPTY_ANSWERS);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [grading, setGrading] = useState(false);
  const [openResults, setOpenResults] = useState<Record<string, OpenResult>>({});
  const [selfPoints, setSelfPoints] = useState<Record<string, number>>({});
  const finishedRef = useRef(false);

  const chapters = useMemo(() => getChaptersForClass(schoolClass), [schoolClass]);

  const start = useCallback(
    (chapterId: string) => {
      const built = buildSheet({ chapterId, group, seed });
      if (!built) return;
      finishedRef.current = false;
      setSheet(built);
      setAnswers({ closed: {}, tf: {}, open: {} });
      setOpenResults({});
      setSelfPoints({});
      setSecondsLeft(built.durationMin * 60);
      setPhase("test");
      window.scrollTo({ top: 0 });
    },
    [group, seed],
  );

  const finish = useCallback(async () => {
    if (finishedRef.current || !sheet) return;
    finishedRef.current = true;
    setPhase("result");
    window.scrollTo({ top: 0 });

    const openTasks = sheet.tasks.filter((t): t is OpenTask => t.kind === "open");
    if (!pro.allowed || openTasks.length === 0) return;

    setGrading(true);
    for (const task of openTasks) {
      const written = (answers.open[task.id] ?? "").trim();
      if (!written) {
        setOpenResults((prev) => ({
          ...prev,
          [task.id]: { points: 0, feedback: "Brak odpowiedzi." },
        }));
        continue;
      }
      try {
        const { grade }: { grade: TaskGradeResult } = await fetchTaskGrade({
          taskId: `sprawdzian:${sheet.chapterId}:${task.id}`,
          taskContent: [task.prompt, ...(task.parts ?? [])].join("\n"),
          correctAnswer: task.key,
          studentAnswer: written,
          maxPoints: Math.min(10, task.points),
          markingNotes: task.scheme
            .map((s) => `${s.points} pkt: ${s.text}`)
            .join("\n"),
          topicLabel: sheet.title,
          examLabel: "Sprawdzian",
        });
        const raw =
          grade.awardedPoints ?? (grade.acceptAsCorrect ? task.points : 0);
        const points = Math.max(0, Math.min(task.points, Math.round(raw)));
        setOpenResults((prev) => ({
          ...prev,
          [task.id]: { points, feedback: grade.feedback },
        }));
      } catch (e) {
        setOpenResults((prev) => ({
          ...prev,
          [task.id]: {
            points: 0,
            feedback: "",
            error:
              e instanceof Error
                ? e.message
                : "Nie udało się ocenić odpowiedzi.",
          },
        }));
      }
    }
    setGrading(false);
  }, [sheet, pro.allowed, answers.open]);

  useEffect(() => {
    if (phase !== "test") return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "test" && secondsLeft === 0 && sheet) void finish();
  }, [phase, secondsLeft, sheet, finish]);

  const taskPoints = useCallback(
    (task: SheetTask): number => {
      if (task.kind !== "open") return autoPoints(task, answers);
      if (pro.allowed) return openResults[task.id]?.points ?? 0;
      return Math.max(0, Math.min(task.points, selfPoints[task.id] ?? 0));
    },
    [answers, pro.allowed, openResults, selfPoints],
  );

  if (phase === "setup" || !sheet) {
    return (
      <div className="page-container py-10">
        <h1 className="text-3xl font-bold text-foreground">Sprawdziany</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Arkusze zbudowane jak klasówki szkolne: jeden dział, numerowane
          zadania z punktacją, czas 45 minut i grupy A oraz B. Zadania otwarte
          oceniane są według schematu punktowania.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <div>
            <p className="mb-2 text-sm font-medium text-muted">Klasa</p>
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSchoolClass(c)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    c === schoolClass
                      ? "border-accent bg-accent text-on-accent"
                      : "border-surface-border bg-surface-card text-foreground"
                  }`}
                >
                  Klasa {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted">Grupa</p>
            <div className="flex gap-2">
              {(["A", "B"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroup(g)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    g === group
                      ? "border-accent bg-accent text-on-accent"
                      : "border-surface-border bg-surface-card text-foreground"
                  }`}
                >
                  Grupa {g}
                </button>
              ))}
            </div>
          </div>
          <div className="self-end">
            <button
              type="button"
              onClick={() => setSeed(randomSeed())}
              className="rounded-lg border border-surface-border bg-surface-card px-4 py-2 text-sm text-foreground"
            >
              Inne liczby w zadaniach
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => start(c.id)}
              className="rounded-2xl border border-surface-border bg-surface-card p-5 text-left transition hover:border-accent"
            >
              <p className="text-lg font-semibold text-foreground">{c.title}</p>
              <p className="mt-1 text-sm text-muted">{c.description}</p>
              <p className="mt-3 text-xs text-muted">
                {c.slots.length} zadań · {c.durationMin} min
              </p>
            </button>
          ))}
        </div>

        {!pro.allowed && !pro.loading && (
          <p className="mt-8 max-w-2xl text-sm text-muted">
            Zadania otwarte w planie Pro są oceniane automatycznie. Bez planu
            Pro po zakończeniu otrzymasz klucz i schemat punktowania i
            przyznasz sobie punkty samodzielnie.{" "}
            <Link href="/cennik" className="text-accent underline">
              Zobacz plany
            </Link>
          </p>
        )}
      </div>
    );
  }

  const total = sheet.tasks.reduce((sum, t) => sum + taskPoints(t), 0);

  if (phase === "result") {
    const grade = gradeForPoints(total, sheet.maxPoints);
    return (
      <div className="page-container py-10">
        <h1 className="text-2xl font-bold text-foreground">
          {sheet.title} — wyniki
        </h1>
        <p className="mt-1 text-sm text-muted">
          Klasa {sheet.schoolClass}, grupa {sheet.group}
        </p>

        <div className="mt-6 rounded-2xl border border-surface-border bg-surface-card p-6">
          <p className="text-3xl font-bold text-foreground">
            {total} / {sheet.maxPoints} pkt
          </p>
          <p className="mt-1 text-muted">
            {percentOf(total, sheet.maxPoints)}% · ocena {grade.value} (
            {grade.label})
          </p>
          {grading && (
            <p className="mt-2 text-sm text-muted">
              Trwa ocenianie zadań otwartych…
            </p>
          )}
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-surface-border bg-surface-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-muted">
                <th className="p-3">Skala ocen</th>
                {gradeTable(sheet.maxPoints).map((g) => (
                  <th key={g.value} className="p-3">
                    {g.value}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 text-muted">Od (pkt)</td>
                {gradeTable(sheet.maxPoints).map((g) => (
                  <td key={g.value} className="p-3 text-foreground">
                    {g.minPoints}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 space-y-6">
          {sheet.tasks.map((task) => (
            <ResultTask
              key={task.id}
              task={task}
              answers={answers}
              earned={taskPoints(task)}
              pro={pro.allowed}
              openResult={openResults[task.id]}
              selfValue={selfPoints[task.id] ?? 0}
              onSelf={(v) => setSelfPoints((p) => ({ ...p, [task.id]: v }))}
            />
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => {
              setSeed(randomSeed());
              setPhase("setup");
            }}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent"
          >
            Nowy sprawdzian
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <div className="sticky top-0 z-10 -mx-2 mb-6 flex items-center justify-between border-b border-surface-border bg-background/95 px-2 py-3 backdrop-blur">
        <div>
          <p className="font-semibold text-foreground">{sheet.title}</p>
          <p className="text-xs text-muted">
            Klasa {sheet.schoolClass} · grupa {sheet.group} · maks.{" "}
            {sheet.maxPoints} pkt
          </p>
        </div>
        <p
          className={`font-mono text-xl ${
            secondsLeft < 300 ? "text-red-500" : "text-foreground"
          }`}
        >
          {formatTime(secondsLeft)}
        </p>
      </div>

      <div className="space-y-6">
        {sheet.tasks.map((task) => (
          <section
            key={task.id}
            className="rounded-2xl border border-surface-border bg-surface-card p-5"
          >
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="font-semibold text-foreground">
                Zadanie {task.number}.
              </h2>
              <span className="text-sm text-muted">
                {pointsLabel(task.points)}
              </span>
            </div>
            <MathText content={task.prompt} as="div" className="text-foreground" />
            {task.figure && (
              <div className="my-4">
                <FigureView figure={task.figure} />
              </div>
            )}
            <TaskInput
              task={task}
              answers={answers}
              setAnswers={setAnswers}
              proAllowed={pro.allowed}
            />
          </section>
        ))}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => void finish()}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-on-accent"
        >
          Oddaj sprawdzian
        </button>
      </div>
    </div>
  );
}

function TaskInput({
  task,
  answers,
  setAnswers,
  proAllowed,
}: {
  task: SheetTask;
  answers: SheetAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<SheetAnswers>>;
  proAllowed: boolean;
}) {
  if (task.kind === "closed") {
    return (
      <div className="mt-3 space-y-2">
        {task.choices.map((choice, i) => (
          <label
            key={i}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-surface-border px-3 py-2 text-foreground"
          >
            <input
              type="radio"
              name={task.id}
              checked={answers.closed[task.id] === i}
              onChange={() =>
                setAnswers((a) => ({
                  ...a,
                  closed: { ...a.closed, [task.id]: i },
                }))
              }
            />
            <span className="font-semibold">{CHOICE_LETTERS[i]}.</span>
            <MathText content={choice} />
          </label>
        ))}
      </div>
    );
  }

  if (task.kind === "tf") {
    return (
      <div className="mt-3 space-y-2">
        {task.statements.map((s, i) => {
          const value = answers.tf[task.id]?.[i] ?? null;
          const set = (v: boolean) =>
            setAnswers((a) => {
              const current = [...(a.tf[task.id] ?? task.statements.map(() => null))];
              current[i] = v;
              return { ...a, tf: { ...a.tf, [task.id]: current } };
            });
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-surface-border px-3 py-2"
            >
              <MathText content={s.text} className="text-foreground" />
              <div className="flex shrink-0 gap-2">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => set(v)}
                    className={`rounded-md border px-3 py-1 text-sm font-semibold ${
                      value === v
                        ? "border-accent bg-accent text-on-accent"
                        : "border-surface-border text-foreground"
                    }`}
                  >
                    {v ? "P" : "F"}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-3">
      {task.parts && (
        <ol className="mb-3 space-y-1 text-foreground">
          {task.parts.map((p, i) => (
            <li key={i}>
              <span className="font-semibold">{String.fromCharCode(97 + i)})</span>{" "}
              <MathText content={p} />
            </li>
          ))}
        </ol>
      )}
      <textarea
        value={answers.open[task.id] ?? ""}
        onChange={(e) =>
          setAnswers((a) => ({
            ...a,
            open: { ...a.open, [task.id]: e.target.value },
          }))
        }
        rows={task.parts ? 6 : 4}
        placeholder="Zapisz rozwiązanie i odpowiedź"
        className="w-full rounded-lg border border-surface-border bg-background p-3 text-sm text-foreground"
      />
      {!proAllowed && (
        <p className="mt-1 text-xs text-muted">
          Odpowiedź nie zostanie oceniona automatycznie (plan Pro). Po
          zakończeniu porównasz ją z kluczem.
        </p>
      )}
    </div>
  );
}

function ResultTask({
  task,
  answers,
  earned,
  pro,
  openResult,
  selfValue,
  onSelf,
}: {
  task: SheetTask;
  answers: SheetAnswers;
  earned: number;
  pro: boolean;
  openResult?: OpenResult;
  selfValue: number;
  onSelf: (v: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-surface-border bg-surface-card p-5">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="font-semibold text-foreground">Zadanie {task.number}.</h2>
        <span className="text-sm text-muted">
          {earned} / {task.points} pkt
        </span>
      </div>
      <MathText content={task.prompt} as="div" className="text-foreground" />
      {task.figure && (
        <div className="my-4">
          <FigureView figure={task.figure} />
        </div>
      )}

      {task.kind === "closed" && (
        <p className="mt-3 text-sm text-foreground">
          Twoja odpowiedź:{" "}
          {answers.closed[task.id] === undefined
            ? "brak"
            : CHOICE_LETTERS[answers.closed[task.id]!]}
          . Poprawna odpowiedź: {CHOICE_LETTERS[task.correctIndex]}.{" "}
          <MathText content={task.choices[task.correctIndex]} />
        </p>
      )}

      {task.kind === "tf" && (
        <ul className="mt-3 space-y-1 text-sm text-foreground">
          {task.statements.map((s, i) => {
            const given = answers.tf[task.id]?.[i] ?? null;
            return (
              <li key={i}>
                <MathText content={s.text} /> — poprawnie:{" "}
                {s.truth ? "P" : "F"}, Twoja odpowiedź:{" "}
                {given === null ? "brak" : given ? "P" : "F"}
              </li>
            );
          })}
        </ul>
      )}

      {task.kind === "open" && (
        <div className="mt-3 space-y-3 text-sm">
          {task.parts && (
            <ol className="space-y-1 text-foreground">
              {task.parts.map((p, i) => (
                <li key={i}>
                  <span className="font-semibold">
                    {String.fromCharCode(97 + i)})
                  </span>{" "}
                  <MathText content={p} />
                </li>
              ))}
            </ol>
          )}
          <div>
            <p className="text-muted">Twoja odpowiedź:</p>
            <p className="whitespace-pre-wrap text-foreground">
              {answers.open[task.id]?.trim() || "brak"}
            </p>
          </div>
          {pro && openResult && (
            <div className="rounded-lg border border-surface-border p-3">
              {openResult.error ? (
                <p className="text-red-500">{openResult.error}</p>
              ) : (
                <MathText
                  content={openResult.feedback}
                  as="div"
                  className="text-foreground"
                />
              )}
            </div>
          )}
          {!pro && (
            <label className="flex items-center gap-2 text-foreground">
              Przyznane punkty (wg schematu):
              <select
                value={selfValue}
                onChange={(e) => onSelf(Number(e.target.value))}
                className="rounded-md border border-surface-border bg-background px-2 py-1"
              >
                {Array.from({ length: task.points + 1 }, (_, n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div>
            <p className="font-semibold text-foreground">Odpowiedź</p>
            <MathText content={task.key} as="div" className="text-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Schemat punktowania</p>
            <ul className="space-y-1 text-foreground">
              {task.scheme.map((s, i) => (
                <li key={i}>
                  {pointsLabel(s.points)} — <MathText content={s.text} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-accent">Rozwiązanie krok po kroku</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-foreground">
          {task.solution.map((step, i) => (
            <li key={i}>
              <MathText content={step} />
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
