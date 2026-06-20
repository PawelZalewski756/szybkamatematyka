import { DailyChallengeView } from "@/components/wyzwania/DailyChallengeView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dzienne wyzwanie",
  description:
    "Codzienny zestaw pytań z matematyki. Ukończ wyzwanie, zdobądź EXP i buduj swoją serię nauki dzień po dniu.",
  alternates: { canonical: "/wyzwania" },
};

export default function WyzwaniaPage() {
  return <DailyChallengeView />;
}
