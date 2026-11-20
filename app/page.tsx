import { HomeDashboardV2 } from "@/components/home-v2/HomeDashboardV2";
import { getAllTasks } from "@/lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import { EXAM_ARCHIVE_SHEETS } from "@/lib/baza-zadan/exams/cke-archive.generated";
import { MINIGAME_REGISTRY } from "@/lib/minigry/minigame-registry";
import { THEORY_INDEX } from "@/lib/trening/seed/theory-index";

export default function Home() {
  // Liczone na serwerze, żeby archiwum CKE i katalog nie trafiały do bundla klienta.
  const taskCount = getAllTasks().length;
  const sheetCount = EXAM_ARCHIVE_SHEETS.length + EXAM_SHEETS.length;

  return (
    <HomeDashboardV2
      taskCount={taskCount}
      sheetCount={sheetCount}
      topicCount={THEORY_INDEX.length}
      minigameCount={MINIGAME_REGISTRY.length}
    />
  );
}
