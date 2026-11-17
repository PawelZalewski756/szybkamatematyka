import { ExamSheetQuiz } from "@/components/baza-zadan/ExamSheetQuiz";
import { getExamSheetById, getTaskById } from "@/lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import { toQuizTask } from "@/lib/baza-zadan/quiz-task";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Arkusze treningowe są znane w buildzie - nie renderujemy dowolnych ID.
export const dynamicParams = false;

export function generateStaticParams() {
  return EXAM_SHEETS.map((sheet) => ({ id: sheet.id }));
}

/**
 * Wcześniej ta strona była komponentem klienckim, który importował cały
 * katalog zadań (2 MB chunka, w tym `solutionSteps`) i renderował rozwiązania
 * bez bramki Pro. Teraz dane przychodzą z serwera jako `QuizTask` bez
 * rozwiązań, a krok po kroku pobiera `/api/trening/task-solution` tylko Pro.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sheet = getExamSheetById(id);

  if (!sheet) {
    return { title: "Arkusz treningowy" };
  }

  return {
    title: `${sheet.title} - arkusz treningowy`,
    description: `${sheet.description} ${sheet.taskIds.length} zadań z natychmiastową oceną odpowiedzi i zapisem postępu.`,
    alternates: { canonical: `/baza-zadan/arkusz/${sheet.id}` },
  };
}

export default async function ExamSheetPage({ params }: PageProps) {
  const { id } = await params;
  const sheet = getExamSheetById(id);
  if (!sheet) notFound();

  const tasks = sheet.taskIds.flatMap((taskId) => {
    const task = getTaskById(taskId);
    return task ? [toQuizTask(task)] : [];
  });

  return (
    <ExamSheetQuiz sheetId={sheet.id} title={sheet.title} tasks={tasks} />
  );
}
