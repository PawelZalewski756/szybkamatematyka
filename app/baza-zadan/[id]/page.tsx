import { TaskSolverView } from "@/components/baza-zadan/TaskSolverView";
import { getPrerenderTaskIds, getTaskById } from "@/lib/baza-zadan/catalog";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/baza-zadan/labels";
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
    title: `${task.title} — ${dzial}`,
    description: clampText(
      `${dzial} (poziom: ${poziom}). ${task.prompt} Rozwiąż zadanie i sprawdź odpowiedź z wyjaśnieniem.`,
    ),
    alternates: { canonical: `/baza-zadan/${task.id}` },
  };
}

export default async function TaskPage({ params }: PageProps) {
  const { id } = await params;
  if (!getTaskById(id)) {
    notFound();
  }
  return <TaskSolverView id={id} />;
}
