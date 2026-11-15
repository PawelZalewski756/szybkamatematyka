import { HomeDashboard } from "@/components/home/HomeDashboard";
import { HomeGamingFooter } from "@/components/home/HomeGamingFooter";
import { getAllTasks } from "@/lib/baza-zadan/catalog";

export default function Home() {
  // Liczone na serwerze, żeby archiwum CKE nie trafiało do bundla klienta.
  const taskCount = getAllTasks().length;

  return (
    <div className="flex flex-1 flex-col">
      <HomeDashboard taskCount={taskCount} />
      <div className="page-container pb-10 pt-4">
        <HomeGamingFooter />
      </div>
    </div>
  );
}
