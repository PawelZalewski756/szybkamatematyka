import {
  getStripeOrNull,
  isStripeConfigured,
  resolveSiteUrl,
} from "@/lib/stripe/config";
import { resolveStripeCustomer } from "@/lib/stripe/customer";
import { getPlanById } from "@/lib/subscription/plans";
import { verifyUserRequest } from "@/lib/subscription/server-auth";

// Stripe SDK używa Node crypto / fetcha — wymuszamy runtime Node (nie Edge).
export const runtime = "nodejs";
// Tworzenie sesji Checkout to operacja zależna od żądania — nigdy nie cache'ować.
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout
 *
 * Body: { planId: "pro" | "roczny" }
 * Tworzy Stripe Checkout Session w trybie `subscription` dla wybranego planu i
 * zwraca `{ url }` do przekierowania (frontend robi window.location = url).
 *
 * Auth: wymaga zalogowanego użytkownika (Bearer token z sesji Supabase — sesja
 * żyje w localStorage po stronie klienta, więc token wędruje w nagłówku,
 * analogicznie do /api/generate-solution).
 */
export async function POST(request: Request) {
  try {
    // 1) Płatności mogą być wyłączone (brak kluczy) — odpowiadamy łagodnie.
    if (!isStripeConfigured()) {
      return Response.json(
        {
          error:
            "Płatności są chwilowo niedostępne (brak konfiguracji Stripe).",
          code: "stripe_not_configured",
        },
        { status: 503 },
      );
    }

    // 2) Autoryzacja: dowolny zalogowany użytkownik.
    const auth = await verifyUserRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    // 3) Walidacja planu.
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Nieprawidłowy format JSON w żądaniu." },
        { status: 400 },
      );
    }

    const planId =
      typeof body === "object" &&
      body !== null &&
      "planId" in body &&
      typeof (body as { planId: unknown }).planId === "string"
        ? (body as { planId: string }).planId.trim()
        : "";

    const plan = getPlanById(planId);
    if (!plan || !plan.paid || !plan.priceEnvVar) {
      return Response.json(
        { error: "Nieznany lub darmowy plan — brak czego opłacać." },
        { status: 400 },
      );
    }

    const priceId = process.env[plan.priceEnvVar]?.trim();
    if (!priceId) {
      return Response.json(
        {
          error: `Plan „${plan.name}" nie ma jeszcze skonfigurowanego Price ID (${plan.priceEnvVar}).`,
          code: "price_not_configured",
        },
        { status: 503 },
      );
    }

    const stripe = getStripeOrNull();
    if (!stripe) {
      return Response.json(
        { error: "Płatności są chwilowo niedostępne." },
        { status: 503 },
      );
    }

    // 4) Budujemy URL powrotu z origin żądania (działa lokalnie i w produkcji).
    const origin = request.headers.get("origin");
    const siteUrl = resolveSiteUrl(origin);

    // 5) Preferujemy istniejącego klienta Stripe (unikamy duplikatów przy
    //    kolejnych checkoutach). Bez service role zostaje customer_email.
    const customerId = await resolveStripeCustomer({
      userId: auth.user.id,
      email: auth.user.email,
    });

    // 6) Tworzymy sesję Checkout. client_reference_id + metadata pozwalają
    //    webhookowi jednoznacznie powiązać płatność z użytkownikiem Supabase.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: auth.user.id,
      ...(customerId
        ? { customer: customerId }
        : { customer_email: auth.user.email ?? undefined }),
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: auth.user.id,
        plan_id: plan.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: auth.user.id,
          plan_id: plan.id,
        },
      },
      success_url: `${siteUrl}/profil?checkout=success`,
      cancel_url: `${siteUrl}/cennik?checkout=cancelled`,
    });

    if (!session.url) {
      return Response.json(
        { error: "Stripe nie zwrócił adresu Checkout." },
        { status: 502 },
      );
    }

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    const message =
      err instanceof Error ? err.message : "Nieznany błąd płatności.";
    return Response.json({ error: message }, { status: 500 });
  }
}
