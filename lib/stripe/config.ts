import Stripe from "stripe";

/**
 * Konfiguracja Stripe po stronie serwera.
 *
 * Klucze (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_*) są wyłącznie
 * serwerowe — nigdy nie trafiają do przeglądarki. Cała aplikacja działa też BEZ
 * tych zmiennych: wtedy `isStripeConfigured()` zwraca false, a UI/route handlery
 * uprzejmie informują, że płatności są chwilowo niedostępne (analogicznie do
 * sytuacji braku konfiguracji Supabase).
 */

let stripeClient: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

/** Zwraca singleton klienta Stripe lub null, gdy brak klucza (bez wyjątku). */
export function getStripeOrNull(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
      // apiVersion celowo pominięty — używamy wersji przypiętej przez SDK,
      // co eliminuje rozjazd typów przy aktualizacjach pakietu.
      typescript: true,
      appInfo: { name: "szybka-matma" },
    });
  }
  return stripeClient;
}

/** Wariant rzucający — używaj tam, gdzie konfiguracja jest już zweryfikowana. */
export function getStripe(): Stripe {
  const stripe = getStripeOrNull();
  if (!stripe) {
    throw new Error("Brak STRIPE_SECRET_KEY — płatności są wyłączone.");
  }
  return stripe;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error("Brak STRIPE_WEBHOOK_SECRET — webhook nie może zweryfikować podpisu.");
  }
  return secret;
}

/**
 * Bazowy URL aplikacji do budowy success/cancel URL w Checkout.
 * Kolejność: jawny NEXT_PUBLIC_SITE_URL → origin żądania (fallback w route handlerze).
 */
export function resolveSiteUrl(fallbackOrigin?: string | null): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, "");
  return "http://localhost:3000";
}
