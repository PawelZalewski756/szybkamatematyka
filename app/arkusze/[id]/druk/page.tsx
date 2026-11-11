import { PrintArchiveSheet } from "@/components/arkusze/PrintArchiveSheet";
import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import { formatSolutionForDisplay } from "@/lib/gemini/format-solution";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchZadaniaSafe } from "@/lib/supabase/baza-zadan";
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

export default async function ArkuszCkePrintPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { klucz } = await searchParams;

  if (!isSupabaseConfigured()) notFound();

  const { data, error } = await fetchZadaniaSafe({ arkuszId: id });
  if (error || data.length === 0) notFound();

  const tasks = [...data].sort((a, b) => a.numer_zadania - b.numer_zadania);
  const arkusz = tasks[0].arkusz;
  if (!arkusz) notFound();

  return (
    <PrintArchiveSheet
      sheetId={id}
      title={formatArkuszLabel(arkusz)}
      totalPoints={0}
      tasks={tasks.map((task) => ({
        id: task.id,
        number: String(task.numer_zadania),
        points: 0,
        prompt: task.tresc,
        choices: [],
        open: true,
        correctLetter: null,
        explanation: formatSolutionForDisplay(task.rozwiazanie),
        steps: [],
      }))}
      initialKey={klucz === "1"}
      backHref={`/arkusze/${id}`}
    />
  );
}
