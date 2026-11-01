"use client";

import { startCheckout } from "@/lib/subscription/checkout-client";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/lib/subscription/plans";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function PlanCta({
  plan,
  isLoggedIn,
  isPro,
  pendingPlan,
  onBuy,
}: {
  plan: SubscriptionPlan;
  isLoggedIn: boolean;
  isPro: boolean;
  pendingPlan: string | null;
  onBuy: (planId: string) => void;
}) {
  const base =
    "mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-bold transition";

  if (!plan.paid) {
    return (
      <Link
        href="/trening"
        className={`${base} border border-surface-border bg-surface text-foreground shadow-sm hover:border-accent/40 hover:bg-surface-hover`}
      >
        Zacznij bez opłat
      </Link>
    );
  }

  if (isPro) {
    return (
      <Link
        href="/profil"
        className={`${base} border border-success/40 bg-success/10 text-success hover:bg-success/15`}
      >
        Masz aktywny plan
      </Link>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className={`${base} border border-surface-border text-muted hover:border-accent/40 hover:bg-accent-soft hover:text-accent`}
      >
        Zaloguj się, aby wykupić
      </Link>
    );
  }

  const pending = pendingPlan === plan.id;
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => onBuy(plan.id)}
      className={`${base} gap-2 border border-accent/50 bg-accent-soft text-accent hover:bg-accent/15 disabled:opacity-50`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Przekierowuję…" : "Wybierz plan"}
    </button>
  );
}

type PricingSectionProps = {
  /** Mniejszy układ na stronie głównej. */
  compact?: boolean;
};

export function PricingSection({ compact = false }: PricingSectionProps) {
  const { isLoggedIn, isPro, loading } = useSubscription();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (planId: string) => {
    setError(null);
    setPendingPlan(planId);
    const result = await startCheckout(planId);
    if (!result.ok) {
      setError(result.error);
      setPendingPlan(null);
    }
  };

  return (
    <div>
      <div
        className={`grid grid-cols-1 gap-3 ${compact ? "md:grid-cols-3 md:gap-4" : "md:grid-cols-3 md:gap-5"}`}
      >
        {SUBSCRIPTION_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`relative flex h-full flex-col rounded-2xl border ${
              plan.highlighted
                ? "border-accent/60 bg-accent-soft/45 shadow-lg shadow-accent/10"
                : "border-surface-border bg-surface"
            } ${compact ? "p-4" : "p-6"}`}
          >
            {plan.badge ? (
              <span className="absolute -top-3 left-5 rounded-full border border-accent/50 bg-accent px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-on-accent shadow-lg shadow-accent/10">
                {plan.badge}
              </span>
            ) : null}

            <div className="flex items-baseline justify-between gap-2">
              <h3
                className={`text-base font-bold ${
                  plan.highlighted ? "text-accent" : "text-foreground"
                }`}
              >
                {plan.name}
              </h3>
              {!plan.paid && (
                <span className="text-overline">domyślny</span>
              )}
            </div>

            <p className="mt-3 text-2xl font-extrabold tabular-nums text-foreground">
              {plan.price}
              <span className="ml-1 text-xs font-medium text-muted">
                / {plan.period}
              </span>
            </p>

            <p className="mt-3 text-sm leading-relaxed text-muted">
              {plan.description}
            </p>

            <ul className="mt-5 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                >
                  <Check
                    size={14}
                    className="mt-0.5 shrink-0 text-accent"
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>

            {loading ? (
              <div className="mt-5 flex items-center justify-center gap-2 py-2.5 text-xs text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sprawdzam…
              </div>
            ) : (
              <PlanCta
                plan={plan}
                isLoggedIn={isLoggedIn}
                isPro={isPro}
                pendingPlan={pendingPlan}
                onBuy={(id) => void handleBuy(id)}
              />
            )}
          </article>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-center text-xs text-danger">{error}</p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Płatności przez Stripe — możesz anulować w dowolnym momencie.
      </p>
    </div>
  );
}
