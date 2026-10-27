import type Stripe from "stripe";
import { getStripeOrNull } from "@/lib/stripe/config";
import { getServiceSupabaseOrNull } from "@/lib/stripe/service-supabase";

/**
 * Odczyt / zapis `profiles.stripe_customer_id` kluczem service role.
 * Kolumna jest prywatna (brak SELECT dla authenticated) — patrz migracja
 * `20260906230000_secure_profile_data_and_atomic_assist.sql`.
 */

export async function readStripeCustomerId(
  userId: string,
): Promise<string | null> {
  const supabase = getServiceSupabaseOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[stripe-customer] odczyt customer id:", error);
    return null;
  }

  const id = data?.stripe_customer_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

export async function saveStripeCustomerId(
  userId: string,
  customerId: string,
): Promise<void> {
  const supabase = getServiceSupabaseOrNull();
  if (!supabase) {
    throw new Error(
      "Brak SUPABASE_SERVICE_ROLE_KEY — nie można zapisać stripe_customer_id.",
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);

  if (error) {
    console.error("[stripe-customer] zapis customer id:", error);
    throw new Error("Nie udało się zapisać stripe_customer_id w profilu.");
  }
}

/**
 * Zwraca istniejącego klienta Stripe powiązanego z kontem, albo tworzy nowego
 * i zapisuje id w profilu. Bez service role zwraca null — wtedy Checkout
 * powinien użyć `customer_email` (fallback).
 */
export async function resolveStripeCustomer(options: {
  userId: string;
  email?: string | null;
}): Promise<string | null> {
  const stripe = getStripeOrNull();
  if (!stripe) return null;

  const existing = await readStripeCustomerId(options.userId);
  if (existing) {
    try {
      const customer = await stripe.customers.retrieve(existing);
      if (!("deleted" in customer && customer.deleted)) {
        return existing;
      }
    } catch (err) {
      console.warn(
        "[stripe-customer] istniejący customer niedostępny, tworzę nowego:",
        err,
      );
    }
  }

  // Bez service role nie zapiszemy id — nie twórz osieroconego customera.
  if (!getServiceSupabaseOrNull()) return null;

  const customer = await stripe.customers.create({
    email: options.email?.trim() || undefined,
    metadata: { supabase_user_id: options.userId },
  });

  await saveStripeCustomerId(options.userId, customer.id);
  return customer.id;
}

/** Tworzy sesję Stripe Customer Portal (zmiana karty / anulowanie). */
export async function createBillingPortalSession(options: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripeOrNull();
  if (!stripe) {
    throw new Error("Brak STRIPE_SECRET_KEY — portal jest wyłączony.");
  }
  return stripe.billingPortal.sessions.create({
    customer: options.customerId,
    return_url: options.returnUrl,
  });
}
