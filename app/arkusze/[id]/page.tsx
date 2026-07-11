import { ArkuszCkeDetail } from "@/components/arkusze/ArkuszCkeDetail";
import { GamingBackground } from "@/components/gaming/GamingBackground";
import { formatArkuszLabel } from "@/lib/baza-zadan/arkusz-format";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchZadaniaSafe } from "@/lib/supabase/baza-zadan";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) {
    return { title: "Arkusz CKE" };
  }

  const { data } = await fetchZadaniaSafe();
  const tasks = data.filter((z) => z.arkusz_id === id);
  const sample = tasks[0];

  if (!sample) {
    return { title: "Arkusz CKE" };
  }

  const label = formatArkuszLabel(sample.arkusz);
  return {
    title: label,
    description: `Zadania i rozwiązania: ${label} (${tasks.length} zadań).`,
    alternates: { canonical: `/arkusze/${id}` },
  };
}

export default async function ArkuszCkePage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const { data, error } = await fetchZadaniaSafe();
  if (error) {
    notFound();
  }

  const tasks = data
    .filter((z) => z.arkusz_id === id)
    .sort((a, b) => a.numer_zadania - b.numer_zadania);

  if (tasks.length === 0) {
    notFound();
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <GamingBackground />
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <ArkuszCkeDetail tasks={tasks} />
      </div>
    </div>
  );
}
