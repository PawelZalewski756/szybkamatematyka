export type SubscriptionPlanId = "start" | "pro" | "roczny";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: readonly string[];
  highlighted?: boolean;
  badge?: string;
  /** Czy plan jest płatny (wymaga Stripe Checkout). „start" jest darmowy. */
  paid?: boolean;
  /** Nazwa zmiennej env z Price ID w Stripe (tylko dla planów płatnych). */
  priceEnvVar?: string;
};

/** Cennik - dane prezentacyjne + powiązanie planów płatnych z Price ID Stripe. */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "start",
    name: "Start",
    price: "0 zł",
    period: "na zawsze",
    description: "Podgląd platformy i kilka minigier treningowych.",
    features: [
      "Wybrane minigry bez limitu czasu",
      "Podgląd bazy zadań (ograniczony)",
      "Bez karty - rejestracja opcjonalna",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "29 zł",
    period: "miesięcznie",
    description: "Pełny dostęp do treningu pod Matury i Egzamin 8-klasisty.",
    features: [
      "Wszystkie minigry + zapis EXP",
      "Pełna baza arkuszy CKE z rozwiązaniami",
      "Asystent AI przy zadaniach (podpowiedzi + ocena otwartych)",
      "Filtry po roku, dziale i typie egzaminu",
      "Anulujesz kiedy chcesz",
    ],
    highlighted: true,
    badge: "Najczęściej wybierany",
    paid: true,
    priceEnvVar: "STRIPE_PRICE_PRO",
  },
  {
    id: "roczny",
    name: "Roczny",
    price: "249 zł",
    period: "rok",
    description: "Ten sam pakiet co Pro, taniej przy płatności z góry.",
    features: [
      "Wszystko z planu Pro",
      "Asystent AI przy zadaniach",
      "Oszczędzasz vs 12× miesięczna",
      "Priorytet przy nowych arkuszach",
    ],
    paid: true,
    priceEnvVar: "STRIPE_PRICE_ROCZNY",
  },
];

export function getPlanById(
  planId: string,
): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

export function isPaidPlanId(planId: string): planId is SubscriptionPlanId {
  const plan = getPlanById(planId);
  return Boolean(plan?.paid);
}

/** Lista płatnych planów (Pro, Roczny) - przydatne w UI i webhooku. */
export const PAID_PLANS = SUBSCRIPTION_PLANS.filter((plan) => plan.paid);

/**
 * Odwrotne mapowanie Price ID → planId na podstawie zmiennych env (server-only).
 * Używane w webhooku, gdy metadata subskrypcji nie zawiera plan_id.
 */
export function planIdForPriceId(
  priceId: string | null | undefined,
): SubscriptionPlanId | null {
  if (!priceId) return null;
  for (const plan of PAID_PLANS) {
    if (plan.priceEnvVar && process.env[plan.priceEnvVar]?.trim() === priceId) {
      return plan.id;
    }
  }
  return null;
}
