import { createClient } from "@supabase/supabase-js";
import { deliverSignupNotification } from "@/lib/telegram/signup-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Powiadomienie po potwierdzeniu e-maila.
 *
 * Wywoływane z przeglądarki po zalogowaniu się użytkownika z potwierdzonym
 * adresem. Token użytkownika jest weryfikowany przez Supabase, więc nie da się
 * wywołać tego endpointu dla cudzego konta.
 */
export async function POST(request: Request): Promise<Response> {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return Response.json(
      { error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return Response.json(
      { error: "Supabase is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return Response.json(
      { error: "Invalid session." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!data.user.email_confirmed_at) {
    return Response.json(
      { delivered: false, reason: "email is not confirmed" },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  }

  const result = await deliverSignupNotification(data.user.id, { force: true });
  return Response.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
