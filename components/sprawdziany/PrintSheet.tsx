"use client";

import { FigureView } from "@/components/sprawdziany/FigureView";
import { MathText } from "@/components/trening/MathText";
import {
  buildSheet,
  classLabel,
  gradeTable,
} from "@/lib/sprawdziany/sheet";
import type { SheetTask } from "@/lib/sprawdziany/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const LETTERS = ["A", "B", "C", "D"];

function pts(n: number): string {
  return n === 1 ? "1 pkt" : `${n} pkt`;
}

function WorkLines({ count }: { count: number }) {
  return (
    <div className="mt-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-7 border-b border-neutral-400" />
      ))}
    </div>
  );
}

function PrintTask({ task }: { task: SheetTask }) {
  return (
    <section className="break-inside-avoid">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-bold">Zadanie {task.number}.</h2>
        <span className="text-sm">{pts(task.points)}</span>
      </div>
      <MathText content={task.prompt} as="div" />
      {task.figure && (
        <div className="my-3 max-w-xs text-black">
          <FigureView figure={task.figure} />
        </div>
      )}
      {task.kind === "closed" && (
        <ul className="mt-2 space-y-1">
          {task.choices.map((c, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-semibold">{LETTERS[i]}.</span>
              <MathText content={c} />
            </li>
          ))}
        </ul>
      )}
      {task.kind === "tf" && (
        <table className="mt-2 w-full border-collapse text-sm">
          <tbody>
            {task.statements.map((s, i) => (
              <tr key={i} className="border border-neutral-500">
                <td className="p-2">
                  <MathText content={s.text} />
                </td>
                <td className="w-16 border-l border-neutral-500 p-2 text-center font-semibold">
                  P / F
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {task.kind === "open" && (
        <>
          {task.parts && (
            <ol className="mt-2 space-y-1">
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
          <WorkLines count={task.parts ? 7 : 5} />
        </>
      )}
    </section>
  );
}

function KeyTask({ task }: { task: SheetTask }) {
  return (
    <section className="break-inside-avoid text-sm">
      <h3 className="font-bold">
        Zadanie {task.number}. ({pts(task.points)})
      </h3>
      {task.kind === "closed" && (
        <p>
          Odpowiedź: {LETTERS[task.correctIndex]}.{" "}
          <MathText content={task.choices[task.correctIndex]} />
        </p>
      )}
      {task.kind === "tf" && (
        <p>
          Odpowiedzi:{" "}
          {task.statements
            .map((s, i) => `${i + 1}. ${s.truth ? "P" : "F"}`)
            .join(", ")}
        </p>
      )}
      {task.kind === "open" && (
        <>
          <div>
            Odpowiedź: <MathText content={task.key} />
          </div>
          <p className="mt-1 font-semibold">Schemat punktowania</p>
          <ul className="list-disc pl-5">
            {task.scheme.map((s, i) => (
              <li key={i}>
                {pts(s.points)} - <MathText content={s.text} />
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-1 font-semibold">Rozwiązanie</p>
      <ol className="list-decimal pl-5">
        {task.solution.map((step, i) => (
          <li key={i}>
            <MathText content={step} />
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PrintSheet() {
  const params = useSearchParams();
  const chapterId = params.get("dzial") ?? "";
  const group = params.get("grupa") === "B" ? "B" : "A";
  const seed = Number(params.get("seed")) || 1;
  const withKey = params.get("klucz") === "1";

  const sheet = useMemo(
    () => buildSheet({ chapterId, group, seed }),
    [chapterId, group, seed],
  );

  useEffect(() => {
    if (!sheet) return;
    const id = window.setTimeout(() => window.print(), 600);
    return () => window.clearTimeout(id);
  }, [sheet]);

  if (!sheet) {
    return (
      <div className="page-container py-10">
        <p className="text-foreground">Nie znaleziono sprawdzianu.</p>
        <Link href="/sprawdziany" className="text-accent underline">
          Wróć do sprawdzianów
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-200 py-6 print:bg-white print:py-0">
      <style>{`@media print { header, footer, nav { display: none !important; } @page { margin: 15mm; } }`}</style>
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between gap-3 px-4 print:hidden">
        <Link href="/sprawdziany" className="text-sm text-neutral-800 underline">
          Wróć do sprawdzianów
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Drukuj / zapisz jako PDF
        </button>
      </div>

      <article className="mx-auto max-w-3xl space-y-6 bg-white p-8 text-black print:max-w-none print:p-0">
        <header className="border-b-2 border-black pb-3">
          <h1 className="text-xl font-bold">
            Sprawdzian: {sheet.title}
          </h1>
          <p className="text-sm">
            {classLabel(sheet.schoolClass)} · grupa {sheet.group} · czas{" "}
            {sheet.durationMin} min · maks. {sheet.maxPoints} pkt
          </p>
          <div className="mt-3 flex gap-8 text-sm">
            <span className="flex-1 border-b border-black">Imię i nazwisko:</span>
            <span className="w-40 border-b border-black">Data:</span>
            <span className="w-32 border-b border-black">Ocena:</span>
          </div>
        </header>

        {sheet.tasks.map((t) => (
          <PrintTask key={t.id} task={t} />
        ))}
      </article>

      {withKey && (
        <article className="mx-auto mt-6 max-w-3xl space-y-4 break-before-page bg-white p-8 text-black print:mt-0 print:max-w-none print:p-0">
          <header className="border-b-2 border-black pb-3">
            <h1 className="text-xl font-bold">
              Klucz odpowiedzi: {sheet.title}
            </h1>
            <p className="text-sm">
              {classLabel(sheet.schoolClass)} · grupa {sheet.group} · maks.{" "}
              {sheet.maxPoints} pkt
            </p>
          </header>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-neutral-500 p-1 text-left">Ocena</th>
                {gradeTable(sheet.maxPoints).map((g) => (
                  <th key={g.value} className="border border-neutral-500 p-1">
                    {g.value}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-neutral-500 p-1">Od (pkt)</td>
                {gradeTable(sheet.maxPoints).map((g) => (
                  <td
                    key={g.value}
                    className="border border-neutral-500 p-1 text-center"
                  >
                    {g.minPoints}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          {sheet.tasks.map((t) => (
            <KeyTask key={t.id} task={t} />
          ))}
        </article>
      )}
    </div>
  );
}
