import { ArchiveSheetTasks } from "@/components/arkusze/ArchiveSheetTasks";
import { GamingBackground } from "@/components/gaming/GamingBackground";
import { CATEGORY_LABELS } from "@/lib/baza-zadan/labels";
import {
  examSheetPoints,
  examTaskPoints,
  expectedOpenAnswer,
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
      : /rozszerzon/i.test(sheet.title)
        ? "Matura rozszerzona"
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
            {tasks.length} zadań · {formatPkt(totalPoints)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            <Link
              href={`/trening/arkusze/${sheet.id}/druk`}
              className="rounded-xl border border-surface-border px-3 py-2 text-foreground hover:border-accent/40"
            >
              PDF bez odpowiedzi
            </Link>
            <Link
              href={`/trening/arkusze/${sheet.id}/druk?klucz=1`}
              className="rounded-xl border border-surface-border px-3 py-2 text-foreground hover:border-accent/40"
            >
              PDF z odpowiedziami
            </Link>
          </div>
        </header>

        <ArchiveSheetTasks
          tasks={tasks.map((task, index) => ({
            id: task.id,
            number: task.examSource?.taskNumber ?? String(index + 1),
            category: CATEGORY_LABELS[task.category],
            points: examTaskPoints(task),
            open: isOpenExamTask(task),
            prompt: task.prompt,
            choices: [...task.choices],
            correctIndex: task.correctIndex,
            expected: isOpenExamTask(task) ? expectedOpenAnswer(task) : "",
            explanation: task.explanation,
            steps: [...(task.solutionSteps ?? [])],
            examLabel: task.examSource?.sessionLabel,
          }))}
        />

      </article>
    </div>
  );
}
