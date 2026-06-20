import type { ComponentType } from "react";

type MetricCardProps = {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  sub?: string;
  /** Klasa koloru ikony, np. "text-cyan-400". */
  accent?: string;
};

/**
 * Pojedyncza karta metryki — spójna ze stylem `PlatformStatus`
 * (półprzezroczyste tło, ramka, ikona + etykieta + duża wartość).
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "text-cyan-400",
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon size={16} className={accent} />
        <span className="text-xs font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}
