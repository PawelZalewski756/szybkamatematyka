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
      className={`inline-flex shrink-0 items-center rounded-md bg-accent font-black tabular-nums text-on-accent shadow-[0_0_12px_rgba(244,183,64,0.3)] ring-1 ring-accent/40 ${sizeClass} ${className}`}
    >
      Poz. {level}
    </span>
  );
}
