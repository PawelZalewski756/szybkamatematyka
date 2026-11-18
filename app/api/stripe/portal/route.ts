import {
  getStripeOrNull,
  isStripeConfigured,
  resolveSiteUrl,
} from "@/lib/stripe/config";
import { getServiceSupabaseOrNull } from "@/lib/stripe/service-supabase";
import { verifyUserRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/portal
 *
 * Tworzy sesję Stripe Customer Portal, żeby użytkownik mógł samodzielnie
 * anulować subskrypcję, zmienić kartę i pobrać faktury.
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return Response.json(
        {
          error: "Płatności są chwilowo niedostępne (brak konfiguracji Stripe).",
          code: "stripe_not_configured",
        },
        { status: 503 },
      );
    }

    const auth = await verifyUserRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = getServiceSupabaseOrNull();
    if (!supabase) {
      return Response.json(
        { error: "Zarządzanie subskrypcją jest chwilowo niedostępne." },
        { status: 503 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, pro_source")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[stripe-portal] profile read failed", profileError);
      return Response.json(
        { error: "Nie udało się odczytać danych płatności." },
        { status: 500 },
      );
    }

    const proSource = String(profile?.pro_source ?? "").trim();
    if (proSource === "gift" || proSource === "manual") {
      return Response.json(
        {
          error:
            "To Pro zostało przyznane ręcznie (np. w ramach rekompensaty) i nie ma subskrypcji Stripe do anulowania. Dostęp wygaśnie automatycznie w podanym terminie.",
          code: "gift_no_stripe_subscription",
        },
        { status: 409 },
      );
    }

    const customerId = profile?.stripe_customer_id?.trim();
    if (!customerId) {
      return Response.json(
        {
          error:
            "Nie mamy jeszcze historii płatności dla tego konta. Jeśli właśnie kupiłeś plan, odśwież stronę za chwilę.",
          code: "no_customer",
        },
        { status: 400 },
      );
    }

    const stripe = getStripeOrNull();
    if (!stripe) {
      return Response.json(
        { error: "Płatności są chwilowo niedostępne." },
        { status: 503 },
      );
    }

    const origin = new URL(request.url).origin;
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${resolveSiteUrl(origin)}/profil`,
    });

    return Response.json({ url: portal.url });
  } catch (error) {
    console.error("[stripe-portal] unexpected error", error);
    return Response.json(
      { error: "Nie udało się otworzyć panelu subskrypcji. Spróbuj ponownie." },
      { status: 500 },
    );
  }
}
