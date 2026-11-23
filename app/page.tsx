import { HomeSimple } from "@/components/home-v2/HomeSimple";
import { getAllTasks } from "@/lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import { EXAM_ARCHIVE_SHEETS } from "@/lib/baza-zadan/exams/cke-archive.generated";
import { MINIGAME_REGISTRY } from "@/lib/minigry/minigame-registry";

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
