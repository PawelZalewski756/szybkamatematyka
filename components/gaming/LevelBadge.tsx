type LevelBadgeProps = {
  level: number;
  className?: string;
  size?: "sm" | "md";
};

export function LevelBadge({
  level,
  className = "",
  size = "md",
}: LevelBadgeProps) {
  const sizeClass =
    size === "sm"
      ? "px-1.5 py-0.5 text-[10px]"
      : "px-2 py-0.5 text-xs sm:text-sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 font-black tabular-nums text-white shadow-[0_0_12px_rgba(251,146,60,0.35)] ring-1 ring-amber-300/40 ${sizeClass} ${className}`}
    >
      Lvl {level}
    </span>
  );
}
