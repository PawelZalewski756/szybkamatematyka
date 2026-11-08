"use client";

import { getSupabaseOrNull } from "@/lib/supabase";

export type CheckoutResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

/**
 * Rozpoczyna płatność: pobiera access token z sesji Supabase, woła
 * POST /api/checkout i przekierowuje na zwrócony `session.url` Stripe.
 *
 * Zwraca błąd zamiast rzucać - komponenty mogą pokazać komunikat. W przypadku
 * sukcesu funkcja przekierowuje przeglądarkę (i nie wraca z `ok: true` przed
 * nawigacją w typowym przypadku).
 */
export async function startCheckout(planId: string): Promise<CheckoutResult> {
  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return {
      ok: false,
      error: "Logowanie jest chwilowo niedostępne.",
      code: "supabase_not_configured",
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    return {
      ok: false,
      error: "Zaloguj się, aby kupić subskrypcję.",
      code: "not_logged_in",
    };
  }

  let res: Response;
  try {
    res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planId }),
    });
  } catch {
    return { ok: false, error: "Błąd sieci - spróbuj ponownie." };
  }

  const data: { url?: string; error?: string; code?: string } | null =
    await res.json().catch(() => null);

  if (!res.ok || !data?.url) {
    return {
      ok: false,
      error: data?.error ?? "Nie udało się rozpocząć płatności.",
      code: data?.code,
    };
  }

  window.location.href = data.url;
  return { ok: true };
}
