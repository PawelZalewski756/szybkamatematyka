import { PrintArchiveSheet } from "@/components/arkusze/PrintArchiveSheet";
import { examSheetPoints } from "@/lib/baza-zadan/cke/exam-points";
import {
  getOfficialCkeSheetById,
  getOfficialCkeSheetTasks,
} from "@/lib/baza-zadan/exams/archive-catalog";
import { toPrintTask } from "@/lib/baza-zadan/print-task";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ klucz?: string }>;
};

export const metadata: Metadata = {
  title: "Arkusz do druku (PDF)",
  robots: { index: false, follow: false },
};

export default async function ArchivePrintPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { klucz } = await searchParams;
  const sheet = getOfficialCkeSheetById(id);
  if (!sheet) notFound();

  const tasks = getOfficialCkeSheetTasks(sheet.id);
  // Do klienta trafiają wyłącznie treści zadań - bez odpowiedzi i rozwiązań.
  // Klucz pobiera `PrintArchiveSheet` z `/api/trening/archive-solutions`
  // dopiero po potwierdzeniu planu Pro.
  const data = tasks.map(toPrintTask);

  return (
    <PrintArchiveSheet
      sheetId={sheet.id}
      title={sheet.title}
      totalPoints={examSheetPoints(tasks)}
      tasks={data}
      initialKey={klucz === "1"}
      solutionsSource="archive"
    />
  );
}
