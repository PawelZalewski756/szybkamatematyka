import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

type EmptyStateAction = {
  label: string;
  href: string;
};

type EmptyStateProps = {
  /** Ikona (np. z lucide-react) renderowana w okrągłym chipie. */
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: ReactNode;
  /** Główne CTA renderowane jako link. */
  action?: EmptyStateAction;
  /** Dodatkowa treść pod opisem (np. własny przycisk). */
  children?: ReactNode;
  className?: string;
};

/**
 * Spójny, zachęcający pusty stan: ikona w chipie, tytuł, opis i opcjonalne CTA.
 * Używany w listach bez wyników (ranking, osiągnięcia, powtórki, filtry).
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`mx-auto flex max-w-md flex-col items-center justify-center px-4 py-12 text-center ${className}`}
    >
      {Icon && (
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 to-cyan-500/15 ring-1 ring-white/10">
          <Icon className="h-7 w-7 text-fuchsia-300" />
        </span>
      )}
      <p className="text-lg font-black text-white">{title}</p>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          {action.label}
        </Link>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
