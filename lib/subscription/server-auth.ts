import { createClient, type User } from "@supabase/supabase-js";
import { getBearerToken } from "@/lib/supabase/admin";

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
