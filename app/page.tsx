import { HomeDashboard } from "@/components/home/HomeDashboard";
import { HomeGamingFooter } from "@/components/home/HomeGamingFooter";
import { getAllTasks } from "@/lib/baza-zadan/catalog";
import { EXAM_SHEETS } from "@/lib/baza-zadan/exam-sheets";
import { EXAM_ARCHIVE_SHEETS } from "@/lib/baza-zadan/exams/cke-archive.generated";

export default function Home() {
  // Liczone na serwerze, żeby archiwum CKE nie trafiało do bundla klienta.
  const taskCount = getAllTasks().length;
  const sheetCount = EXAM_ARCHIVE_SHEETS.length + EXAM_SHEETS.length;

  return (
    <div className="flex flex-1 flex-col">
      <HomeDashboard taskCount={taskCount} sheetCount={sheetCount} />
      <div className="page-container pb-10 pt-4">
        <HomeGamingFooter />
      </div>
    </div>
  );
}
