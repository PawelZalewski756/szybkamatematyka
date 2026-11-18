import type Stripe from "stripe";
import {
  getServiceSupabaseOrNull,
  isServiceRoleConfigured,
} from "@/lib/stripe/service-supabase";
import { planIdForPriceId, type SubscriptionPlanId } from "@/lib/subscription/plans";
import {
  normalizeSubscriptionStatus,
  type SubscriptionStatus,
} from "@/lib/subscription/status";
import { isPostgrestUndefinedColumnError } from "@/lib/supabase/errors";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Synchronizacja stanu subskrypcji ze Stripe do tabeli `profiles` (service role).
 * Wywoływana z webhooka - nie ma tu sesji użytkownika, więc używamy klucza
 * serwisowego (omija RLS). Brak konfiguracji albo błąd zapisu jest błędem
 * przetwarzania webhooka - wywołujący musi dostać 5xx, aby Stripe ponowił
 * dostarczenie zamiast trwale zgubić zmianę subskrypcji.
 */

type ProfileSubscriptionPatch = {
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlanId | null;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  pro_source: "stripe";
};

function unixToIso(seconds: number | null | undefined): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
}

/** Koniec bieżącego okresu - w nowszych API jest na pozycji subskrypcji. */
function readCurrentPeriodEnd(
  subscription: Stripe.Subscription,
): string | null {
  const itemPeriodEnd = subscription.items?.data?.[0]?.current_period_end;
  if (typeof itemPeriodEnd === "number") return unixToIso(itemPeriodEnd);
  const legacy = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  return unixToIso(legacy);
}

function readPriceId(subscription: Stripe.Subscription): string | null {
  return subscription.items?.data?.[0]?.price?.id ?? null;
}

function resolvePlanId(
  subscription: Stripe.Subscription,
): SubscriptionPlanId | null {
  const metaPlan = subscription.metadata?.plan_id;
  if (metaPlan) {
    const fromPrice = planIdForPriceId(readPriceId(subscription));
    // Preferujemy mapowanie po Price ID (źródło prawdy), metadata jako fallback.
    if (fromPrice) return fromPrice;
    if (metaPlan === "pro" || metaPlan === "roczny") return metaPlan;
  }
  return planIdForPriceId(readPriceId(subscription));
}

function userIdFromSubscription(
  subscription: Stripe.Subscription,
): string | null {
  return subscription.metadata?.supabase_user_id ?? null;
}

async function applyPatch(
  userId: string,
  patch: ProfileSubscriptionPatch,
): Promise<void> {
  const supabase = getServiceSupabaseOrNull();
  if (!supabase) {
    throw new Error(
      isServiceRoleConfigured()
        ? "Nie udało się utworzyć klienta Supabase service role."
        : "Brak SUPABASE_SERVICE_ROLE_KEY - nie można zapisać subskrypcji.",
    );
  }

  // `.select()` jest konieczne: PostgREST zwraca 204 bez błędu także wtedy,
  // gdy UPDATE trafił 0 wierszy (np. brak profilu). Wcześniej webhook
  // odpowiadał 200, Stripe nie ponawiał, a użytkownik zostawał na free.
  let { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  // Gdy kolumny stripe_* jeszcze nie istnieją (migracja nieuruchomiona),
  // próbujemy zapisać wąski podzbiór statusu - żeby flaga Pro mimo wszystko działała.
  if (error && isPostgrestUndefinedColumnError(error as PostgrestError)) {
    ({ data, error } = await supabase
      .from("profiles")
      .update({
        subscription_status: patch.subscription_status,
        subscription_plan: patch.subscription_plan,
      })
      .eq("id", userId)
      .select("id")
      .maybeSingle());
  }

  if (error) {
    console.error("[stripe-webhook] Zapis subskrypcji nieudany:", error);
    throw new Error("Zapis subskrypcji w profilu nieudany.");
  }

  if (!data) {
    console.error(
      "[stripe-webhook] Profil nie istnieje - nie zapisano subskrypcji:",
      userId,
    );
    throw new Error("Profil użytkownika nie istnieje - nie zapisano subskrypcji.");
  }
}

/**
 * Szuka użytkownika po powiązaniu ze Stripe, gdy brak `metadata.supabase_user_id`
 * (starsze subskrypcje, ręczne zmiany w dashboardzie).
 */
async function lookupUserIdByStripe(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const supabase = getServiceSupabaseOrNull();
  if (!supabase) return null;

  if (subscription.id) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();
    if (!error && data?.id) return String(data.id);
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : (subscription.customer?.id ?? null);

  if (customerId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (!error && data?.id) return String(data.id);
  }

  return null;
}

/** Zapisuje stan subskrypcji w profilu na podstawie obiektu Stripe.Subscription. */
export async function syncSubscriptionToProfile(
  subscription: Stripe.Subscription,
  options?: { forceUserId?: string },
): Promise<void> {
  const userId =
    options?.forceUserId ??
    userIdFromSubscription(subscription) ??
    (await lookupUserIdByStripe(subscription));

  if (!userId) {
    // Rzucamy, żeby webhook zwrócił 500 i Stripe ponowił dostarczenie.
    console.error(
      "[stripe-webhook] Brak powiązania subskrypcji z profilem:",
      subscription.id,
    );
    throw new Error(
      "Brak supabase_user_id w subskrypcji - nie wiadomo, czyj profil zaktualizować.",
    );
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : (subscription.customer?.id ?? null);

  await applyPatch(userId, {
    subscription_status: normalizeSubscriptionStatus(subscription.status),
    subscription_plan: resolvePlanId(subscription),
    subscription_current_period_end: readCurrentPeriodEnd(subscription),
    subscription_cancel_at_period_end: Boolean(
      subscription.cancel_at_period_end,
    ),
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    pro_source: "stripe",
  });
}

/** Oznacza subskrypcję jako anulowaną (customer.subscription.deleted). */
export async function markSubscriptionCanceled(
  subscription: Stripe.Subscription,
): Promise<void> {
  const userId =
    userIdFromSubscription(subscription) ??
    (await lookupUserIdByStripe(subscription));
  if (!userId) {
    // Anulowania nie da się przypisać do konta - nie ma czego aktualizować.
    console.error(
      "[stripe-webhook] subscription.deleted bez powiązania z profilem:",
      subscription.id,
    );
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : (subscription.customer?.id ?? null);

  await applyPatch(userId, {
    subscription_status: "canceled",
    subscription_plan: resolvePlanId(subscription),
    subscription_current_period_end: readCurrentPeriodEnd(subscription),
    subscription_cancel_at_period_end: true,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    pro_source: "stripe",
  });
}
