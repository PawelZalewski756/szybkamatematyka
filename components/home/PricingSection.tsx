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
    "mt-5 w-full rounded-lg py-2.5 text-center text-sm font-medium transition";

  if (!plan.paid) {
    return (
      <Link
        href={isLoggedIn ? "/trening" : "/login"}
        className={`${base} border border-white/15 text-slate-200 hover:border-white/25 hover:bg-white/[0.04]`}
      >
        {isLoggedIn ? "Korzystaj za darmo" : "Zacznij bez opłat"}
      </Link>
    );
  }

  if (isPro) {
    return (
      <Link
        href="/profil"
        className={`${base} border border-emerald-500/25 text-emerald-300/90 hover:bg-emerald-500/5`}
      >
        Masz aktywny plan
      </Link>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className={`${base} border border-white/12 text-slate-400 hover:border-white/20 hover:text-slate-200`}
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
      className={`${base} inline-flex items-center justify-center gap-2 border border-white/12 text-slate-300 hover:border-teal-500/30 hover:bg-teal-500/5 hover:text-white disabled:opacity-50`}
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
            className={`flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] ${
              compact ? "p-4" : "p-5"
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-200">{plan.name}</h3>
              {!plan.paid && (
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
                  domyślny
                </span>
              )}
            </div>

            <p className="mt-2 text-xl font-semibold tabular-nums text-white">
              {plan.price}
              <span className="ml-1 text-xs font-normal text-slate-500">
                / {plan.period}
              </span>
            </p>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {plan.description}
            </p>

            <ul className="mt-4 flex-1 space-y-1.5">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-xs leading-relaxed text-slate-400"
                >
                  <Check
                    size={14}
                    className="mt-0.5 shrink-0 text-slate-600"
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>

            {loading ? (
              <div className="mt-5 flex items-center justify-center gap-2 py-2.5 text-xs text-slate-500">
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
        <p className="mt-3 text-center text-xs text-red-400/90">{error}</p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-600">
        Płatności przez Stripe — możesz anulować w dowolnym momencie.{" "}
        <Link href="/cennik" className="text-slate-400 underline-offset-2 hover:text-slate-300 hover:underline">
          Szczegóły cennika
        </Link>
      </p>
    </div>
  );
}
