import { TaskSolverView } from "@/components/baza-zadan/TaskSolverView";
import {
  getPrerenderTaskIds,
  getRelatedTasks,
  getTaskById,
} from "@/lib/baza-zadan/catalog";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/baza-zadan/labels";
import { orderTaskChoices } from "@/lib/baza-zadan/task-order";
import type { Task, TaskForClient } from "@/lib/baza-zadan/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Pozostałe (proceduralne) zadania renderujemy on-demand zamiast w buildzie.
export const dynamicParams = true;

export function generateStaticParams() {
  return getPrerenderTaskIds().map((id) => ({ id }));
}

function clampText(text: string, max = 155): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Klient nie może dostać `solutionSteps`, bo to jest treść planu Pro.
 * Cały katalog zostaje na serwerze - wcześniej `TaskSolverView` importował go
 * do bundla klienta i wysyłał rozwiązania razem z HTML-em.
 */
function toClientTask(task: Task): TaskForClient {
  return {
    id: task.id,
    title: task.title,
    category: task.category,
    difficulty: task.difficulty,
    forPaths: task.forPaths,
    prompt: task.prompt,
    choices: task.choices,
    correctIndex: task.correctIndex,
    explanation: task.explanation,
    hint: task.hint,
    examTags: task.examTags,
    examSource: task.examSource,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const task = getTaskById(id);

  if (!task) {
    return {
      title: "Zadanie z matematyki",
      description: "Zadanie z matematyki z rozwiązaniem krok po kroku.",
    };
  }

  const dzial = CATEGORY_LABELS[task.category];
  const poziom = DIFFICULTY_LABELS[task.difficulty];

  return {
    title: `${task.title} - ${dzial}`,
    description: clampText(
      `${dzial} (poziom: ${poziom}). ${task.prompt} Rozwiąż zadanie i sprawdź odpowiedź z wyjaśnieniem.`,
    ),
    alternates: { canonical: `/baza-zadan/${task.id}` },
  };
}

export default async function TaskPage({ params }: PageProps) {
  const { id } = await params;
  const task = getTaskById(id);
  if (!task) {
    notFound();
  }

  const ordered = orderTaskChoices(task);
  const clientTask = toClientTask(ordered);

  return (
    <TaskSolverView
      task={clientTask}
      related={{
        sp: getRelatedTasks(ordered, "sp", 4).map(toClientTask),
        srednia: getRelatedTasks(ordered, "srednia", 4).map(toClientTask),
      }}
      hasSolution={(task.solutionSteps?.length ?? 0) > 0}
    />
  );
}
