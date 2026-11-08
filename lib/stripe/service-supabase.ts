import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klient Supabase z kluczem SERVICE ROLE - używany WYŁĄCZNIE w webhooku Stripe
 * po stronie serwera. Service role omija RLS, więc tego klienta NIGDY nie wolno
 * tworzyć w kodzie wykonywanym w przeglądarce.
 *
 * Webhook nie ma sesji użytkownika (przychodzi prosto od Stripe), więc aktualizacja
 * statusu subskrypcji w `profiles` musi iść kluczem serwisowym.
 */

let serviceClient: SupabaseClient | null = null;

export function isServiceRoleConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export function getServiceSupabaseOrNull(): SupabaseClient | null {
  if (!isServiceRoleConfigured()) return null;

  if (!serviceClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
    serviceClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return serviceClient;
}
