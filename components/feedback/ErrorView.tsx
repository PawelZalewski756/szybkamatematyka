"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";

type ErrorViewProps = {
  title?: string;
  description?: string;
  /** Funkcja `reset` z konwencji `error.tsx` App Routera. */
  reset?: () => void;
  /** Pokaż link do strony głównej. */
  showHome?: boolean;
};

/**
 * Spójny, dostępny komunikat błędu po polsku z akcją „Spróbuj ponownie”.
 * Współdzielony przez `error.tsx` poszczególnych sekcji i root.
 */
export function ErrorView({
  title = "Coś poszło nie tak",
  description = "Wystąpił nieoczekiwany błąd podczas ładowania tej sekcji. Spróbuj ponownie za chwilę.",
  reset,
  showHome = true,
}: ErrorViewProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[55vh] max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center"
    >
      <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 ring-1 ring-red-500/20">
        <AlertTriangle className="h-8 w-8 text-red-300" aria-hidden />
      </span>
      <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{description}</p>

      <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
        {reset && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Spróbuj ponownie
          </button>
        )}
        {showHome && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            <Home className="h-4 w-4" aria-hidden />
            Strona główna
          </Link>
        )}
      </div>
    </div>
  );
}
