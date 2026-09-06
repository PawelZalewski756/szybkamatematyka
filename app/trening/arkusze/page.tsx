import { ArkuszeCkeCatalog } from "@/components/arkusze/ArkuszeCkeCatalog";
import { GamingBackground } from "@/components/gaming/GamingBackground";
import { listOfficialCkeSheets } from "@/lib/baza-zadan/exams/archive-catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arkusze CKE — matura i egzamin ósmoklasisty",
  description:
    "Oryginalne arkusze maturalne CKE z poprzednich lat, z rozwiązaniami krok po kroku.",
  alternates: { canonical: "/trening/arkusze" },
};

export default function TreningArkuszePage() {
  const archiveSheets = listOfficialCkeSheets();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-background">
      <GamingBackground />
      <ArkuszeCkeCatalog
        archiveSheets={archiveSheets}
      />
    </div>
  );
}
