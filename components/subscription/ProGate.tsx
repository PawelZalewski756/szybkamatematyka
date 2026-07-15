"use client";

import { useRequirePro } from "@/lib/subscription/use-require-pro";
import { Loader2, Lock } from "lucide-react";
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
    <div className="flex items-center justify-center gap-2 rounded-3xl border border-surface-border bg-surface p-8 text-sm text-muted">
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
    <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-surface-card p-8 text-center">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
      <div className="relative">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Lock className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-xl font-black text-foreground">
          {featureLabel ? `${featureLabel} jest w planie Pro` : "Funkcja Pro"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          {needsLogin
            ? "Zaloguj się i aktywuj subskrypcję Pro, aby odblokować tę sekcję."
            : "Odblokuj pełny dostęp do treningu, bazy arkuszy CKE i rozwiązań krok po kroku."}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {needsLogin && (
            <Link
              href="/login"
              className="btn-chunky-soft px-5 py-3 text-sm"
            >
              Zaloguj się
            </Link>
          )}
          <Link
            href="/cennik"
            className="btn-chunky px-5 py-3 text-sm"
          >
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
