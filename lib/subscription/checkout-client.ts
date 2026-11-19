"use client";

import { getSupabaseOrNull } from "@/lib/supabase";

export type CheckoutResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

export type ConfirmedCheckout = {
  /** true, gdy subskrypcja została zapisana w profilu. */
  confirmed: boolean;
  /** Dane opłaconej sesji - tylko gdy faktycznie pobrano pieniądze. */
  purchase?: {
    sessionId: string;
    /** Kwota w groszach (Stripe `amount_total`). */
    amountTotalMinorUnits: number | null;
    currency: string | null;
    planId: string | null;
  };
};

/** Potwierdza opłaconą sesję Checkout po powrocie ze Stripe. */
export async function confirmCheckout(
  sessionId: string,
): Promise<ConfirmedCheckout> {
  const supabase = getSupabaseOrNull();
  if (!supabase) return { confirmed: false };
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return { confirmed: false };

  try {
    const res = await fetch("/api/checkout/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    });
    const data:
      | {
          confirmed?: boolean;
          paid?: boolean;
          amountTotal?: number | null;
          currency?: string | null;
          planId?: string | null;
        }
      | null = await res.json().catch(() => null);

    if (!res.ok || !data?.confirmed) return { confirmed: false };

    // Okres próbny (payment_status: "no_payment_required", amount_total: 0) to
    // jeszcze nie zakup - nie chcemy zawyżać konwersji „Zakup PRO”.
    const paid = data.paid === true || (data.amountTotal ?? 0) > 0;

    return {
      confirmed: true,
      purchase: paid
        ? {
            sessionId,
            amountTotalMinorUnits: data.amountTotal ?? null,
            currency: data.currency ?? null,
            planId: data.planId ?? null,
          }
        : undefined,
    };
  } catch {
    return { confirmed: false };
  }
}

export type CheckoutOptions = {
  /** Wymagane przez API: akceptacja regulaminu i zgoda na natychmiastowe świadczenie. */
  acceptTerms?: boolean;
};

/**
 * Rozpoczyna płatność: pobiera access token z sesji Supabase, woła
 * POST /api/checkout i przekierowuje na zwrócony `session.url` Stripe.
 *
 * Zwraca błąd zamiast rzucać - komponenty mogą pokazać komunikat. W przypadku
 * sukcesu funkcja przekierowuje przeglądarkę (i nie wraca z `ok: true` przed
 * nawigacją w typowym przypadku).
 */
export async function startCheckout(
  planId: string,
  options: CheckoutOptions = {},
): Promise<CheckoutResult> {
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
      body: JSON.stringify({
        planId,
        acceptTerms: options.acceptTerms === true,
      }),
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
