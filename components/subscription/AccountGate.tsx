"use client";

import { useSubscription } from "@/lib/subscription/use-subscription";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type AccountGateProps = {
  children: ReactNode;
  /** Co wymaga konta, np. "Sprawdzanie odpowiedzi". */
  featureLabel: string;
  compact?: boolean;
};

/** Wymaga zalogowania (konto darmowe wystarcza). Limity egzekwuje serwer. */
export function AccountGate({
  children,
  featureLabel,
  compact = false,
}: AccountGateProps) {
  const { loading, isLoggedIn } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Sprawdzam dostęp…
      </div>
    );
  }

  if (isLoggedIn) return <>{children}</>;

  return (
    <div
      className={`rounded-2xl border border-accent/30 bg-accent/5 text-center ${
        compact ? "mt-4 px-4 py-4" : "mt-6 p-6"
      }`}
    >
      <p className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
        <Lock className="h-4 w-4 text-accent" aria-hidden />
        {featureLabel} wymaga darmowego konta
      </p>
      <p className="mt-1 text-xs text-muted">
        Załóż konto, aby zaznaczać odpowiedzi i sprawdzać zadania.
      </p>
      <Link href="/login" className="btn-chunky-soft mt-3 inline-block px-4 py-2 text-sm">
        Zaloguj się
      </Link>
    </div>
  );
}
