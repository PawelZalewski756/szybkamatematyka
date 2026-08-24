import { getServiceSupabaseOrNull } from "@/lib/stripe/service-supabase";
import { logWarn } from "@/lib/observability/logger";

export type StripeEventClaim = "new" | "duplicate" | "unavailable";

/** Zgłasza event_id. Duplikat = retry Stripe'a, nie przetwarzamy drugi raz. */
export async function claimStripeWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<StripeEventClaim> {
  const sb = getServiceSupabaseOrNull();
  if (!sb) return "unavailable";

  const { error } = await sb.from("stripe_webhook_events").insert({
    event_id: eventId,
    event_type: eventType,
  });

  if (!error) return "new";

  if (error.code === "23505") return "duplicate";

  logWarn("stripe.claim_failed", { message: error.message.slice(0, 200) });
  return "unavailable";
}

export async function releaseStripeWebhookEvent(eventId: string): Promise<void> {
  const sb = getServiceSupabaseOrNull();
  if (!sb) return;
  await sb.from("stripe_webhook_events").delete().eq("event_id", eventId);
}
