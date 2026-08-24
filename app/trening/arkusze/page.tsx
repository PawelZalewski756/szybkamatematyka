import { ArkuszeCkeCatalog } from "@/components/arkusze/ArkuszeCkeCatalog";
import { GamingBackground } from "@/components/gaming/GamingBackground";
import { listOfficialCkeSheets } from "@/lib/baza-zadan/exams/archive-catalog";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchZadaniaSafe } from "@/lib/supabase/baza-zadan";
import { isSchemaMissingError } from "@/lib/supabase/errors";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arkusze CKE — matura i egzamin ósmoklasisty",
  description:
    "Oryginalne arkusze maturalne CKE z poprzednich lat, z rozwiązaniami krok po kroku.",
  alternates: { canonical: "/trening/arkusze" },
};

export default async function TreningArkuszePage() {
  const archiveSheets = listOfficialCkeSheets();
  let cmsTasks: Awaited<ReturnType<typeof fetchZadaniaSafe>>["data"] = [];
  let schemaMissing = false;

  if (isSupabaseConfigured()) {
    const { data, error } = await fetchZadaniaSafe();
    if (error) {
      if (isSchemaMissingError(error)) schemaMissing = true;
    } else {
      cmsTasks = data;
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <GamingBackground />
      <ArkuszeCkeCatalog
        archiveSheets={archiveSheets}
        cmsTasks={cmsTasks}
        schemaMissing={schemaMissing && archiveSheets.length === 0}
      />
    </div>
  );
}
