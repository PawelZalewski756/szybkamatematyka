import type Stripe from "stripe";
import {
  getStripeOrNull,
  getStripeWebhookSecret,
  isStripeConfigured,
  isStripeWebhookConfigured,
} from "@/lib/stripe/config";
import {
  markSubscriptionCanceled,
  syncSubscriptionToProfile,
} from "@/lib/stripe/subscription-sync";
import {
  claimStripeWebhookEvent,
  releaseStripeWebhookEvent,
} from "@/lib/stripe/webhook-events";
import { logError, logInfo } from "@/lib/observability/logger";
import { reportError } from "@/lib/observability/report-error";

// Weryfikacja podpisu Stripe wymaga Node crypto → runtime Node (nie Edge).
export const runtime = "nodejs";
// Webhook musi widzieć każde żądanie — wyłączamy jakiekolwiek cache'owanie.
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook
 *
 * Odbiera zdarzenia ze Stripe i synchronizuje status subskrypcji w Supabase.
 *
 * RAW BODY w Next.js 16: czytamy surowe body przez `await request.text()`
 * (Web Request API). W route handlerach App Routera NIE ma `bodyParser` ani
 * potrzeby `export const config` — surowe body jest dostępne wprost, w
 * przeciwieństwie do dawnych API Routes w Pages Routerze. Surowy string jest
 * niezbędny, bo Stripe weryfikuje podpis na bajtach payloadu (JSON.parse +
 * ponowna serializacja zmieniłyby je i podpis by się nie zgadzał).
 *
 * Obsługiwane zdarzenia:
 *  - checkout.session.completed
 *  - customer.subscription.updated
 *  - customer.subscription.deleted
 */
export async function POST(request: Request) {
  if (!isStripeConfigured() || !isStripeWebhookConfigured()) {
    return Response.json(
      { error: "Webhook Stripe nie jest skonfigurowany." },
      { status: 503 },
    );
  }

  const stripe = getStripeOrNull();
  if (!stripe) {
    return Response.json(
      { error: "Webhook Stripe nie jest skonfigurowany." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json(
      { error: "Brak nagłówka stripe-signature." },
      { status: 400 },
    );
  }

  // RAW BODY — patrz docstring powyżej.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "nieznany";
    logError("stripe.signature_invalid", { message });
    return Response.json(
      { error: `Nieprawidłowy podpis webhooka: ${message}` },
      { status: 400 },
    );
  }

  const claim = await claimStripeWebhookEvent(event.id, event.type);
  if (claim === "duplicate") {
    logInfo("stripe.duplicate_event", { eventId: event.id, type: event.type });
    return Response.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? null);
        const userId =
          session.client_reference_id ??
          session.metadata?.supabase_user_id ??
          null;

        if (subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);
          await syncSubscriptionToProfile(subscription, {
            forceUserId: userId ?? undefined,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToProfile(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await markSubscriptionCanceled(subscription);
        break;
      }

      default:
        // Pozostałe zdarzenia ignorujemy świadomie.
        break;
    }
  } catch (err) {
    await reportError(err, { source: "stripe-webhook", type: event.type });
    if (claim === "new") {
      await releaseStripeWebhookEvent(event.id);
    }
    // 500 → Stripe ponowi dostarczenie webhooka.
    return Response.json(
      { error: "Błąd przetwarzania zdarzenia." },
      { status: 500 },
    );
  }

  return Response.json({ received: true });
}
