import type { SubscriptionPlanId } from "@/lib/subscription/plans";

/**
 * Kanoniczny status subskrypcji zapisywany w `profiles.subscription_status`.
 *
 * Wartości pokrywają się z najważniejszymi statusami subskrypcji Stripe, plus
 * domyślne `free` dla kont bez subskrypcji.
 */
export type SubscriptionStatus =
  | "free"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

/** Statusy, które dają dostęp Pro (pełny dostęp do treści). */
const PRO_STATUSES: ReadonlySet<SubscriptionStatus> = new Set([
  "active",
  "trialing",
]);

/** Migawka subskrypcji używana przez UI / hooki. */
export type SubscriptionSnapshot = {
  status: SubscriptionStatus;
  planId: SubscriptionPlanId | null;
  /** ISO timestamp końca bieżącego okresu rozliczeniowego (jeśli znany). */
  currentPeriodEnd: string | null;
  /** Czy subskrypcja zostanie anulowana z końcem okresu. */
  cancelAtPeriodEnd: boolean;
};

export const FREE_SUBSCRIPTION: SubscriptionSnapshot = {
  status: "free",
  planId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

/** Czy podany status daje dostęp Pro. */
export function isProStatus(
  status: SubscriptionStatus | null | undefined,
): boolean {
  if (!status) return false;
  return PRO_STATUSES.has(status);
}

/** Czy migawka subskrypcji oznacza aktywne Pro. */
export function isPro(
  snapshot: SubscriptionSnapshot | null | undefined,
): boolean {
  return isProStatus(snapshot?.status);
}

/**
 * Normalizuje dowolny string (np. status subskrypcji ze Stripe) do naszego
 * zbioru statusów. Nieznane wartości traktujemy jako `free` (brak dostępu).
 */
export function normalizeSubscriptionStatus(
  raw: string | null | undefined,
): SubscriptionStatus {
  switch ((raw ?? "").trim().toLowerCase()) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "cancelled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    case "incomplete":
    case "paused":
      return "incomplete";
    default:
      return "free";
  }
}

/** Etykieta statusu po polsku - do wyświetlenia w profilu. */
export function subscriptionStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "active":
      return "Aktywna";
    case "trialing":
      return "Okres próbny";
    case "past_due":
      return "Zaległa płatność";
    case "canceled":
      return "Anulowana";
    case "incomplete":
      return "Niedokończona";
    case "free":
    default:
      return "Brak (plan Start)";
  }
}
