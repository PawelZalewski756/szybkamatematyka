"use client";

import { startCheckout } from "@/lib/subscription/checkout-client";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/lib/subscription/plans";
import { useSubscription } from "@/lib/subscription/use-subscription";
import { motion } from "framer-motion";
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
    "mt-6 w-full rounded-2xl py-3.5 text-center text-sm font-black transition";
  const filled = plan.highlighted
    ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/25 hover:brightness-110"
    : "border border-white/15 bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700/80";

  // Plan darmowy — prowadzi do gry / rejestracji.
  if (!plan.paid) {
    return (
      <Link href={isLoggedIn ? "/trening" : "/login"} className={`${base} ${filled}`}>
        {isLoggedIn ? "Graj za darmo" : "Zacznij za darmo"}
      </Link>
    );
  }

  // Użytkownik ma już aktywne Pro.
  if (isPro) {
    return (
      <Link
        href="/profil"
        className={`${base} border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15`}
      >
        Masz już Pro ✓
      </Link>
    );
  }

  // Niezalogowany — kierujemy najpierw do logowania.
  if (!isLoggedIn) {
    return (
      <Link href="/login" className={`${base} ${filled}`}>
        Zaloguj się, aby kupić
      </Link>
    );
  }

  const pending = pendingPlan === plan.id;
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => onBuy(plan.id)}
      className={`${base} ${filled} inline-flex items-center justify-center gap-2 disabled:opacity-60`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? "Przekierowuję…" : `Wybieram ${plan.name}`}
    </button>
  );
}

export function PricingSection() {
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
    // Przy sukcesie startCheckout przekierowuje przeglądarkę na Stripe.
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
      {SUBSCRIPTION_PLANS.map((plan, index) => (
        <motion.article
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: index * 0.08, duration: 0.45 }}
          className={`relative flex flex-col rounded-3xl border p-6 backdrop-blur-xl ${
            plan.highlighted
              ? "border-fuchsia-400/50 bg-gradient-to-b from-fuchsia-500/15 to-zinc-900/80 ring-2 ring-fuchsia-400/30"
              : "border-white/10 bg-white/5"
          }`}
        >
          {plan.badge && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1 text-xs font-black text-white">
              {plan.badge}
            </span>
          )}
          <h3 className="text-xl font-black text-white">{plan.name}</h3>
          <p className="mt-2 text-3xl font-black text-white">
            {plan.price}
            <span className="text-sm font-semibold text-zinc-400">
              {" "}
              / {plan.period}
            </span>
          </p>
          <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>
          <ul className="mt-5 flex-1 space-y-2">
            {plan.features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-zinc-300"
              >
                <Check
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                {f}
              </li>
            ))}
          </ul>
          {loading ? (
            <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sprawdzam status…
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
        </motion.article>
      ))}
      {error && (
        <p className="col-span-full text-center text-sm font-semibold text-red-400">
          {error}
        </p>
      )}
      <p className="col-span-full text-center text-sm text-zinc-500">
        Płatności obsługuje{" "}
        <span className="font-semibold text-zinc-300">Stripe</span> — bezpiecznie,
        anulujesz kiedy chcesz.{" "}
        <Link
          href="/cennik"
          className="font-semibold text-cyan-400 hover:underline"
        >
          Zobacz pełny cennik
        </Link>
        .
      </p>
    </div>
  );
}
