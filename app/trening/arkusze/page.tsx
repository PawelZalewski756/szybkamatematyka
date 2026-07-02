import { ArkuszeCkeCatalog } from "@/components/arkusze/ArkuszeCkeCatalog";
import { GamingBackground } from "@/components/gaming/GamingBackground";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchZadaniaSafe } from "@/lib/supabase/baza-zadan";
import {
  formatSupabaseErrorForUser,
  isSchemaMissingError,
} from "@/lib/supabase/errors";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arkusze CKE — matura i egzamin ósmoklasisty",
  description:
    "Oryginalne arkusze maturalne i egzaminu ósmoklasisty (CKE) z poprzednich lat wraz z linkami do rozwiązań krok po kroku.",
  alternates: { canonical: "/trening/arkusze" },
};

export default async function TreningArkuszePage() {
  let cmsTasks: Awaited<ReturnType<typeof fetchZadaniaSafe>>["data"] = [];
  let schemaMissing = false;
  let errorNote: string | null = null;

  if (isSupabaseConfigured()) {
    const { data, error } = await fetchZadaniaSafe();
    if (error) {
      if (isSchemaMissingError(error)) {
        schemaMissing = true;
      } else {
        errorNote = formatSupabaseErrorForUser(error);
      }
    } else {
      cmsTasks = data;
    }
  } else {
    errorNote =
      "Supabase nie jest skonfigurowany — uzupełnij klucze w .env.local.";
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-zinc-950">
      <GamingBackground />
      <ArkuszeCkeCatalog
        cmsTasks={cmsTasks}
        schemaMissing={schemaMissing}
        errorNote={errorNote}
      />
    </div>
  );
}
