import type Stripe from "stripe";
import { getStripeOrNull, isStripeConfigured } from "@/lib/stripe/config";
import { isServiceRoleConfigured } from "@/lib/stripe/service-supabase";
import { syncSubscriptionToProfile } from "@/lib/stripe/subscription-sync";
import { verifyUserRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout/confirm
 *
 * Body: { sessionId }
 * Po powrocie ze Stripe Checkout sprawdza sesję bezpośrednio w Stripe i zapisuje
 * subskrypcję w profilu. Dzięki temu Pro działa od razu, także gdy webhook jest
 * opóźniony lub źle skonfigurowany. Operacja jest idempotentna.
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured() || !isServiceRoleConfigured()) {
      return Response.json(
        { error: "Płatności są chwilowo niedostępne." },
        { status: 503 },
      );
    }

    const auth = await verifyUserRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const body: unknown = await request.json().catch(() => null);
    const sessionId =
      typeof body === "object" &&
      body !== null &&
      typeof (body as { sessionId?: unknown }).sessionId === "string"
        ? (body as { sessionId: string }).sessionId.trim()
        : "";
    if (!sessionId.startsWith("cs_")) {
      return Response.json({ error: "Nieprawidłowa sesja." }, { status: 400 });
    }

    const stripe = getStripeOrNull();
    if (!stripe) {
      return Response.json(
        { error: "Płatności są chwilowo niedostępne." },
        { status: 503 },
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const ownerId =
      session.client_reference_id ?? session.metadata?.supabase_user_id ?? null;
    if (ownerId !== auth.user.id) {
      return Response.json({ error: "Brak dostępu do sesji." }, { status: 403 });
    }

    const subscriptionRef: string | Stripe.Subscription | null =
      session.subscription;
    const subscriptionId =
      typeof subscriptionRef === "string"
        ? subscriptionRef
        : (subscriptionRef?.id ?? null);

    if (
      session.mode !== "subscription" ||
      session.status !== "complete" ||
      !subscriptionId
    ) {
      return Response.json({ confirmed: false });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncSubscriptionToProfile(subscription, {
      forceUserId: auth.user.id,
    });

    return Response.json({ confirmed: true });
  } catch (err) {
    console.error("[checkout-confirm]", err);
    return Response.json(
      { error: "Nie udało się potwierdzić płatności." },
      { status: 500 },
    );
  }
}
