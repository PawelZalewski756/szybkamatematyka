"use client";

import { getSupabaseOrNull } from "@/lib/supabase";

export type BillingPortalResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

/**
 * Otwiera Stripe Customer Portal: pobiera access token, woła
 * POST /api/billing-portal i przekierowuje na `session.url`.
 */
export async function startBillingPortal(): Promise<BillingPortalResult> {
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
      error: "Zaloguj się, aby zarządzać subskrypcją.",
      code: "not_logged_in",
    };
  }

  let res: Response;
  try {
    res = await fetch("/api/billing-portal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return { ok: false, error: "Błąd sieci — spróbuj ponownie." };
  }

  const data: { url?: string; error?: string; code?: string } | null =
    await res.json().catch(() => null);

  if (!res.ok || !data?.url) {
    return {
      ok: false,
      error: data?.error ?? "Nie udało się otworzyć portalu płatności.",
      code: data?.code,
    };
  }

  window.location.href = data.url;
  return { ok: true };
}
