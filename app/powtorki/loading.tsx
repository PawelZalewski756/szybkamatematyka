import { GamingBackground } from "@/components/gaming/GamingBackground";
import { PageLoader } from "@/components/feedback/PageLoader";

export default function Loading() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-zinc-950">
      <GamingBackground />
      <div className="relative z-10 flex flex-1 flex-col">
        <PageLoader label="Ładowanie powtórek…" />
      </div>
    </div>
  );
}
