import { createClient, type User } from "@supabase/supabase-js";
import { getBearerToken } from "@/lib/supabase/admin";
import { isProStatus } from "@/lib/subscription/status";

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

  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (error) {
    console.error("[verifyProRequest]", error);
    return {
      ok: false,
      status: 403,
      error: "Nie udało się sprawdzić subskrypcji.",
    };
  }

  if (!isProStatus(data?.subscription_status)) {
    return {
      ok: false,
      status: 403,
      error: "Asystent AI jest dostępny w planie Pro.",
    };
  }

  return { ok: true, user: auth.user };
}
