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
    description: "Darmowy dostęp do wszystkich minigier i podstawowej bazy zadań.",
    features: [
      "Wszystkie minigry bez limitu",
      "Podgląd bazy zadań i arkuszy CKE",
      "Codzienne wyzwanie i powtórki",
      "Bez karty - rejestracja opcjonalna",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "29 zł",
    period: "miesięcznie",
    description: "Pełny dostęp do rozwiązań, arkuszy i asystenta AI.",
    features: [
      "Pełne rozwiązania krok po kroku",
      "Wszystkie arkusze CKE z kluczem",
      "Asystent AI: podpowiedzi i ocena otwartych",
      "Filtry roku, działu i typu egzaminu",
      "Sprawdziany z automatyczną oceną AI",
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
      "Oszczędzasz 99 zł vs 12× Pro",
      "Priorytet przy nowych arkuszach",
      "Jedna płatność na cały rok",
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
