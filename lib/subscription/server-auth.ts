import { createClient, type User } from "@supabase/supabase-js";
import { getBearerToken } from "@/lib/supabase/admin";
import {
  isProStatus,
  normalizeSubscriptionStatus,
} from "@/lib/subscription/status";

/**
 * Weryfikacja zalogowanego użytkownika dla route handlerów płatności.
 *
 * Analogicznie do `verifyAdminRequest` (lib/supabase/admin.ts) sesja Supabase żyje
 * tylko po stronie klienta (localStorage), więc token musi przyjść w nagłówku
 * Authorization: Bearer <access_token>. Różnica: tutaj wystarczy DOWOLNY zalogowany
 * użytkownik — checkout nie jest operacją administracyjną.
 */

export type UserAuthResult =
  | { ok: true; user: User }
  | { ok: false; status: 401; error: string };

export async function verifyUserRequest(
  request: Request,
): Promise<UserAuthResult> {
  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, error: "Wymagane zalogowanie." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return { ok: false, status: 401, error: "Brak konfiguracji Supabase." };
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  const user = data?.user;
  if (error || !user) {
    return {
      ok: false,
      status: 401,
      error: "Sesja wygasła lub jest nieprawidłowa.",
    };
  }

  return { ok: true, user };
}

export type ProAuthResult =
  | { ok: true; user: User }
  | { ok: false; status: 401 | 403; error: string };

/** Zalogowany użytkownik z aktywną subskrypcją Pro. */
export async function verifyProRequest(
  request: Request,
): Promise<ProAuthResult> {
  const auth = await verifyTaskAssistRequest(request);
  if (!auth.ok) return auth;
  if (!auth.isPro) {
    return {
      ok: false,
      status: 403,
      error: "Asystent AI jest dostępny w planie Pro.",
    };
  }
  return { ok: true, user: auth.user };
}

export type TaskAssistAuthResult =
  | { ok: true; user: User; isPro: boolean }
  | { ok: false; status: 401 | 403; error: string };

/** Zalogowany użytkownik — Pro lub free (z limitem miesięcznym po stronie route). */
export async function verifyTaskAssistRequest(
  request: Request,
): Promise<TaskAssistAuthResult> {
  const auth = await verifyUserRequest(request);
  if (!auth.ok) return auth;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return { ok: false, status: 401, error: "Brak konfiguracji Supabase." };
  }

  const token = getBearerToken(request)!;
  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc("get_my_subscription");

  if (error) {
    console.error("[verifyTaskAssistRequest]", error);
    return {
      ok: false,
      status: 403,
      error: "Nie udało się sprawdzić subskrypcji.",
    };
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | { subscription_status?: string | null }
    | null
    | undefined;

  return {
    ok: true,
    user: auth.user,
    isPro: isProStatus(normalizeSubscriptionStatus(row?.subscription_status)),
  };
}
