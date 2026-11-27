import { HomeSimple } from "@/components/home-v2/HomeSimple";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";
import type { Metadata } from "next";
import { getAllTasks } from "@/lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import { EXAM_ARCHIVE_SHEETS } from "@/lib/baza-zadan/exams/cke-archive.generated";
import { MINIGAME_REGISTRY } from "@/lib/minigry/minigame-registry";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Szybka Matematyka - matura i egzamin ósmoklasisty online",
    description:
      "Platforma do nauki matematyki: arkusze CKE, baza zadań z rozwiązaniami, trening tematyczny, minigry i rankingi - matura i egzamin 8-klasisty.",
  },
};

export default function Home() {
  // Liczone na serwerze, żeby archiwum CKE i katalog nie trafiały do bundla klienta.
  const taskCount = getAllTasks().length;
  const sheetCount = EXAM_ARCHIVE_SHEETS.length + EXAM_SHEETS.length;

  return (
    <HomeSimple
      taskCount={taskCount}
      sheetCount={sheetCount}
      minigameCount={MINIGAME_REGISTRY.length}
    />
  );
}
