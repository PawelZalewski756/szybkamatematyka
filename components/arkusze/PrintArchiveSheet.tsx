"use client";

import { TheoryMarkdown } from "@/components/trening/TheoryMarkdown";
import { formatCkeMathText } from "@/lib/baza-zadan/cke/format-cke-math";
import { splitTaskContent } from "@/lib/baza-zadan/cke/matura-task-content";
import Link from "next/link";
import { useMemo, useState } from "react";

export type PrintTaskData = {
  id: string;
  number: string;
  points: number;
  prompt: string;
  choices: string[];
  open: boolean;
  correctLetter: string | null;
  explanation: string;
  steps: string[];
};

type Props = {
  sheetId: string;
  title: string;
  totalPoints: number;
  tasks: PrintTaskData[];
  initialKey: boolean;
  backHref?: string;
};

function pts(n: number): string {
  return n > 0 ? `${n} pkt` : "";
}

function Content({ text }: { text: string }) {
  const parts = useMemo(
    () => splitTaskContent(formatCkeMathText(text)),
    [text],
  );
  return (
    <div className="space-y-2">
      {parts.map((part, i) =>
        part.type === "text" ? (
          <TheoryMarkdown key={i} content={part.content} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={part.src}
            alt={part.alt || "Ilustracja do zadania"}
            loading="eager"
            className="mx-auto max-h-[240mm] w-auto max-w-full"
          />
        ),
      )}
    </div>
  );
}

export function PrintArchiveSheet({
  sheetId,
  title,
  totalPoints,
  tasks,
  initialKey,
  backHref,
}: Props) {
  const [withKey, setWithKey] = useState(initialKey);

  const hasKey = withKey;

  return (
    <div className="print-sheet min-h-screen bg-neutral-200 py-6 print:bg-white print:py-0">
      <style>{`
        @media print { header, footer, nav { display: none !important; } @page { margin: 12mm; } }
        .print-sheet, .print-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-sheet .katex, .print-sheet .katex * { color: #000 !important; border-color: #000 !important; }
        .print-sheet .katex svg { fill: #000 !important; stroke: #000; }
        .print-sheet .katex svg path { fill: #000 !important; }
        .print-sheet .katex .frac-line, .print-sheet .katex .overline-line, .print-sheet .katex .underline-line, .print-sheet .katex .hline { border-bottom-style: solid !important; border-color: #000 !important; }
        .print-sheet .overflow-x-auto { overflow: visible !important; }
        .print-sheet table { width: 100% !important; table-layout: auto; border-collapse: collapse; }
        .print-sheet th, .print-sheet td { border: 1px solid #000 !important; background: #fff !important; color: #000 !important; padding: 4px 8px; overflow-wrap: anywhere; }
        .print-sheet tr, .print-sheet img { break-inside: avoid; }
        .print-sheet img { max-width: 100%; height: auto; }
        .print-sheet .prose { color: #000; max-width: none; }
        .print-sheet .prose :where(p, li, strong, td, th) { color: #000 !important; }
      `}</style>
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 print:hidden">
        <Link
          href={backHref ?? `/trening/arkusze/${sheetId}`}
          className="text-sm text-neutral-800 underline"
        >
          Wróć do arkusza
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={hasKey}
              onChange={(e) => setWithKey(e.target.checked)}
            />
            Z odpowiedziami (na osobnych stronach)
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Drukuj / zapisz jako PDF
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-3xl space-y-6 bg-white p-8 text-black print:max-w-none print:p-0">
        <header className="border-b-2 border-black pb-3">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm">
            {tasks.length} zadań{totalPoints > 0 ? ` · maks. ${pts(totalPoints)}` : ""}
          </p>
          <div className="mt-3 flex gap-8 text-sm">
            <span className="flex-1 border-b border-black">Imię i nazwisko:</span>
            <span className="w-40 border-b border-black">Data:</span>
            <span className="w-32 border-b border-black">Wynik:</span>
          </div>
        </header>

        {tasks.map((task) => (
          <section key={task.id} className="break-inside-avoid">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <h2 className="font-bold">Zadanie {task.number}</h2>
              <span>{pts(task.points)}</span>
            </div>
            <Content text={task.prompt} />
            {!task.open && task.choices.length > 0 ? (
              <ul className="mt-1 space-y-1">
                {task.choices.map((choice, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="font-semibold">{"ABCDEF"[i] ?? i + 1})</span>
                    <Content text={choice} />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>

      {hasKey && (
        <article className="mx-auto mt-6 max-w-3xl space-y-4 break-before-page bg-white p-8 text-black print:mt-0 print:max-w-none print:p-0">
          <header className="border-b-2 border-black pb-3">
            <h1 className="text-xl font-bold">Rozwiązania: {title}</h1>
            {totalPoints > 0 ? (
              <p className="text-sm">maks. {pts(totalPoints)}</p>
            ) : null}
          </header>
          {tasks.map((task) => (
            <section key={task.id} className="break-inside-avoid text-sm">
              <h3 className="font-bold">
                Zadanie {task.number}
                {task.points > 0 ? ` (${pts(task.points)})` : ""}
              </h3>
              {task.correctLetter && !task.open && (
                <p>Odpowiedź: {task.correctLetter}</p>
              )}
              {task.explanation.trim() && (
                <TheoryMarkdown
                  content={formatCkeMathText(task.explanation)}
                  variant="solution"
                />
              )}
              {task.steps.length > 0 && (
                <ol className="mt-1 list-decimal space-y-1 pl-5">
                  {task.steps.map((step, i) => (
                    <li key={i}>
                      <TheoryMarkdown
                        content={formatCkeMathText(
                          step.replace(/^\s*\d+[.)]\s+/, ""),
                        )}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ))}
        </article>
      )}
    </div>
  );
}
