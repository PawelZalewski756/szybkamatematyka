import Link from "next/link";

type ActionTileProps = {
  href: string;
  title: string;
  emoji: string;
  /** `accent` - wyróżniona karta; `surface` - neutralna. */
  variant?: "accent" | "surface";
};

/**
 * Duża karta CTA (np. hub gier). Spójny kształt z `card-raised`, bez rainbow gradientów.
 */
export function ActionTile({
  href,
  title,
  emoji,
  variant = "accent",
}: ActionTileProps) {
  const accent = variant === "accent";

  return (
    <Link
      href={href}
      className={`group relative flex min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] sm:min-h-[220px] sm:p-8 md:min-h-[260px] ${
        accent
          ? "border border-accent/30 bg-accent-soft shadow-[0_4px_0_0_color-mix(in_srgb,var(--accent)_35%,var(--surface-border))]"
          : "card-raised"
      }`}
    >
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl ${
          accent ? "bg-accent/20" : "bg-surface-hover/80"
        }`}
        aria-hidden
      />
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-4xl transition-transform duration-300 group-hover:scale-110 sm:text-5xl ${
          accent ? "icon-chip bg-accent/15" : "bg-surface-hover"
        }`}
        aria-hidden
      >
        {emoji}
      </span>
      <h2 className="relative z-10 max-w-[14ch] text-2xl font-black leading-tight text-foreground sm:text-3xl md:text-4xl">
        {title}
      </h2>
    </Link>
  );
}
