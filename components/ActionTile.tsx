import Link from "next/link";

type ActionTileProps = {
  href: string;
  title: string;
  emoji: string;
  gradient: string;
  glow: string;
};

export function ActionTile({
  href,
  title,
  emoji,
  gradient,
  glow,
}: ActionTileProps) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-[180px] w-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 shadow-lg transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] sm:min-h-[220px] sm:p-8 md:min-h-[260px]`}
    >
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl opacity-60 ${glow}`}
        aria-hidden
      />
      <span className="text-5xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110 sm:text-6xl">
        {emoji}
      </span>
      <h2 className="relative z-10 max-w-[14ch] text-2xl font-black leading-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
        {title}
      </h2>
    </Link>
  );
}
