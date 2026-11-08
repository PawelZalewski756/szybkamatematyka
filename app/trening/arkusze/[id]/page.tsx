import { GamingBackground } from "@/components/gaming/GamingBackground";
import { CATEGORY_LABELS } from "@/lib/baza-zadan/labels";
import {
  examSheetPoints,
  examTaskPoints,
  formatPkt,
  isOpenExamTask,
} from "@/lib/baza-zadan/cke/exam-points";
import {
  getOfficialCkeSheetById,
  getOfficialCkeSheetTasks,
  listOfficialCkeSheets,
} from "@/lib/baza-zadan/exams/archive-catalog";
import { officialCkeSheetHref, officialCkeSheetKind } from "@/lib/baza-zadan/exams/archive-sheet-meta";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return listOfficialCkeSheets().map((sheet) => ({ id: sheet.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sheet = getOfficialCkeSheetById(id);
  if (!sheet) {
    return { title: "Arkusz CKE" };
  }
  return {
    title: sheet.title,
    description: `${sheet.title} - ${sheet.taskIds.length} zadań z rozwiązaniami.`,
    alternates: { canonical: officialCkeSheetHref(sheet.id) },
  };
}

export default async function OfficialCkeSheetPage({ params }: PageProps) {
  const { id } = await params;
  const sheet = getOfficialCkeSheetById(id);
  if (!sheet) notFound();

  const tasks = getOfficialCkeSheetTasks(sheet.id);
  const totalPoints = examSheetPoints(tasks);
  const kindLabel =
    officialCkeSheetKind(sheet) === "egzamin-8"
      ? "Egzamin ósmoklasisty"
      : "Matura podstawowa";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <GamingBackground />
      <article className="page-container relative z-10 w-full max-w-3xl py-8 sm:py-12">
        <Link
          href="/trening/arkusze"
          className="text-sm font-semibold text-muted hover:text-accent"
        >
          ← Wszystkie arkusze CKE
        </Link>
        <header className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            {kindLabel} · {sheet.year}
          </p>
          <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
            {sheet.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {tasks.length} zadań · {formatPkt(totalPoints)}. Otwórz wybrane
            albo zacznij od pierwszego.
          </p>
          {tasks[0] ? (
            <Link
              href={`/baza-zadan/${tasks[0].id}`}
              className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-on-accent"
            >
              Rozpocznij arkusz
            </Link>
          ) : null}
        </header>

        <ol className="mt-8 space-y-2">
          {tasks.map((task, index) => (
            <li key={task.id}>
              <Link
                href={`/baza-zadan/${task.id}`}
                className="flex items-start justify-between gap-3 rounded-2xl border border-surface-border bg-surface px-4 py-3 transition hover:border-accent/40"
              >
                <span className="min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted">
                    Zad. {task.examSource?.taskNumber ?? index + 1}
                    {" · "}
                    {CATEGORY_LABELS[task.category]}
                    {" · "}
                    {formatPkt(examTaskPoints(task))}
                    {isOpenExamTask(task) ? " · otwarte" : ""}
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-foreground">
                    {task.title}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-bold text-accent">
                  Otwórz
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
