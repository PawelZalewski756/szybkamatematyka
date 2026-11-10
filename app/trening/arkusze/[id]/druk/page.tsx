import { PrintArchiveSheet } from "@/components/arkusze/PrintArchiveSheet";
import {
  examSheetPoints,
  examTaskPoints,
  isOpenExamTask,
} from "@/lib/baza-zadan/cke/exam-points";
import {
  getOfficialCkeSheetById,
  getOfficialCkeSheetTasks,
} from "@/lib/baza-zadan/exams/archive-catalog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Arkusz do druku (PDF)",
  robots: { index: false, follow: false },
};

const LETTERS = ["A", "B", "C", "D"];

export default async function ArchivePrintPage({ params }: PageProps) {
  const { id } = await params;
  const sheet = getOfficialCkeSheetById(id);
  if (!sheet) notFound();

  const tasks = getOfficialCkeSheetTasks(sheet.id);
  const data = tasks.map((task, index) => ({
    id: task.id,
    number: task.examSource?.taskNumber ?? String(index + 1),
    points: examTaskPoints(task),
    prompt: task.prompt,
    open: isOpenExamTask(task),
    correctLetter: LETTERS[task.correctIndex] ?? null,
    explanation: task.explanation,
    steps: [...(task.solutionSteps ?? [])],
  }));

  return (
    <PrintArchiveSheet
      sheetId={sheet.id}
      title={sheet.title}
      totalPoints={examSheetPoints(tasks)}
      tasks={data}
    />
  );
}
