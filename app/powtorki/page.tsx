import { ReviewAccessGate } from "@/components/powtorki/ReviewAccessGate";
import { PowtorkiView } from "@/components/powtorki/PowtorkiView";

export const metadata = {
  title: "Powtórki — Szybka Matematyka",
  description:
    "Inteligentne powtórki w systemie spaced repetition. Utrwalaj zadania, z którymi miałeś problem, w optymalnych odstępach czasu.",
};

export default function PowtorkiPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-accent/20 blur-[110px]" />
        <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-accent/15 blur-[120px]" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <ReviewAccessGate>
          <PowtorkiView />
        </ReviewAccessGate>
      </div>
    </div>
  );
}
