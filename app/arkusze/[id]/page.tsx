import { ArkuszCkeDetail } from "@/components/arkusze/ArkuszCkeDetail";
import { GamingBackground } from "@/components/gaming/GamingBackground";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchZadaniaSafe } from "@/lib/supabase/baza-zadan";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Arkusz CKE",
    description: "Zadania i rozwiązania arkusza CKE krok po kroku.",
    alternates: { canonical: `/arkusze/${id}` },
  };
}

export default async function ArkuszCkePage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    redirect("/trening/arkusze");
  }

  const { data, error } = await fetchZadaniaSafe({ arkuszId: id });
  if (error) {
    redirect("/trening/arkusze");
  }

  const tasks = data.sort((a, b) => a.numer_zadania - b.numer_zadania);

  if (tasks.length === 0) {
    redirect("/trening/arkusze");
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
