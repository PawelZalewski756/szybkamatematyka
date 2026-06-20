import { AchievementsView } from "@/components/achievements/AchievementsView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Osiągnięcia",
  description:
    "Twoja gablota odznak. Zbieraj osiągnięcia za rozwiązane zadania, serie nauki, dzienne wyzwania i minigry matematyczne.",
  alternates: { canonical: "/osiagniecia" },
};

export default function OsiagnieciaPage() {
  return <AchievementsView />;
}
