"use client";

import { useRequirePro } from "@/lib/subscription/use-require-pro";
import { Loader2, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type ProGateProps = {
  /** Treść dostępna tylko dla Pro. */
  children: ReactNode;
  /** Własny ekran zastępczy zamiast domyślnej karty paywalla. */
  fallback?: ReactNode;
  /** Co pokazać w trakcie ustalania statusu (domyślnie subtelny loader). */
  loadingFallback?: ReactNode;
  /** Krótki opis, czego dotyczy zablokowana sekcja (do komunikatu). */
  featureLabel?: string;
};

function DefaultLoading() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-zinc-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      Sprawdzam dostęp…
    </div>
  );
}

function DefaultPaywall({
  reason,
  featureLabel,
}: {
  reason: "not_logged_in" | "needs_pro";
  featureLabel?: string;
}) {
  const needsLogin = reason === "not_logged_in";
  return (
    <div className="relative overflow-hidden rounded-3xl border border-fuchsia-400/30 bg-gradient-to-b from-fuchsia-500/10 to-zinc-900/80 p-8 text-center backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="relative">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-fuchsia-300">
          <Lock className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-xl font-black text-white">
          {featureLabel ? `${featureLabel} jest w planie Pro` : "Funkcja Pro"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
          {needsLogin
            ? "Zaloguj się i aktywuj subskrypcję Pro, aby odblokować tę sekcję."
            : "Odblokuj pełny dostęp do treningu, bazy arkuszy CKE i rozwiązań krok po kroku."}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {needsLogin && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-zinc-800/80 px-5 py-3 text-sm font-black text-zinc-100 transition hover:bg-zinc-700/80"
            >
              Zaloguj się
            </Link>
          )}
          <Link
            href="/cennik"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" />
            Zobacz plany Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Reużywalny paywall. Renderuje `children` tylko dla użytkowników Pro, w
 * przeciwnym razie pokazuje `fallback` (domyślnie kartę z CTA do /cennik).
 *
 * Przykład:
 *   <ProGate featureLabel="Pełna baza arkuszy">
 *     <PelnaBazaArkuszy />
 *   </ProGate>
 */
export function ProGate({
  children,
  fallback,
  loadingFallback,
  featureLabel,
}: ProGateProps) {
  const { allowed, reason } = useRequirePro();

  if (reason === "loading") {
    return <>{loadingFallback ?? <DefaultLoading />}</>;
  }

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return (
    <DefaultPaywall
      reason={reason === "not_logged_in" ? "not_logged_in" : "needs_pro"}
      featureLabel={featureLabel}
    />
  );
}
