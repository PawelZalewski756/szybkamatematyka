import {
  Award,
  Brain,
  CalendarCheck,
  Crown,
  Flame,
  Footprints,
  Gamepad2,
  Gem,
  Medal,
  Moon,
  Rocket,
  Star,
  Sunrise,
  Swords,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { AchievementIcon } from "@/lib/achievements/types";

/** Mapowanie klucza ikony z czystego katalogu → komponent lucide. */
const ICON_MAP: Record<AchievementIcon, LucideIcon> = {
  footprints: Footprints,
  flame: Flame,
  target: Target,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
  star: Star,
  sparkles: Award,
  swords: Swords,
  gamepad: Gamepad2,
  calendar: CalendarCheck,
  zap: Zap,
  moon: Moon,
  sunrise: Sunrise,
  rocket: Rocket,
  brain: Brain,
  gem: Gem,
  award: Award,
};

export function AchievementGlyph({
  icon,
  className,
}: {
  icon: AchievementIcon;
  className?: string;
}) {
  const Icon = ICON_MAP[icon] ?? Trophy;
  return <Icon className={className} aria-hidden />;
}
