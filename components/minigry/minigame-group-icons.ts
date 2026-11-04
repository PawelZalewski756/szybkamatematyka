import {
  Calculator,
  Layers,
  LineChart,
  Radical,
  Sigma,
  Triangle,
  type LucideIcon,
} from "lucide-react";
import type { MinigameGroupVisual } from "@/components/minigry/minigame-groups";

export const MINIGAME_GROUP_ICONS: Record<
  MinigameGroupVisual["icon"],
  LucideIcon
> = {
  calculator: Calculator,
  sigma: Sigma,
  radical: Radical,
  triangle: Triangle,
  "line-chart": LineChart,
  layers: Layers,
};
