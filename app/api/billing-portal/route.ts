import {
  getStripeOrNull,
  isStripeConfigured,
  resolveSiteUrl,
} from "@/lib/stripe/config";
import {
  createBillingPortalSession,
  readStripeCustomerId,
} from "@/lib/stripe/customer";
import { isServiceRoleConfigured } from "@/lib/stripe/service-supabase";
import { verifyUserRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/billing-portal
 *
 * Tworzy sesję Stripe Customer Portal (zmiana karty, faktury, anulowanie)
 * i zwraca `{ url }` do przekierowania.
 *
 * Auth: zalogowany użytkownik z Bearer tokenem (jak /api/checkout).
 * Wymaga wcześniejszej płatności — bez `stripe_customer_id` w profilu
 * nie ma czego otwierać w portalu.
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured() || !getStripeOrNull()) {
      return Response.json(
        {
          error:
            "Płatności są chwilowo niedostępne (brak konfiguracji Stripe).",
          code: "stripe_not_configured",
        },
        { status: 503 },
      );
    }

    if (!isServiceRoleConfigured()) {
      return Response.json(
        {
          error:
            "Portal subskrypcji wymaga klucza Supabase service role po stronie serwera.",
          code: "service_role_missing",
        },
        { status: 503 },
      );
    }

    const auth = await verifyUserRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const customerId = await readStripeCustomerId(auth.user.id);
    if (!customerId) {
      return Response.json(
        {
          error:
            "Nie znaleziono konta płatności. Najpierw wykup plan Pro lub Roczny.",
          code: "no_customer",
        },
        { status: 404 },
      );
    }

    const origin = request.headers.get("origin");
    const siteUrl = resolveSiteUrl(origin);
    const session = await createBillingPortalSession({
      customerId,
      returnUrl: `${siteUrl}/profil?portal=return`,
    });

    if (!session.url) {
      return Response.json(
        { error: "Stripe nie zwrócił adresu portalu." },
        { status: 502 },
      );
    }

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[billing-portal]", err);
    const message =
      err instanceof Error ? err.message : "Nieznany błąd portalu.";
    return Response.json({ error: message }, { status: 500 });
  }
}
