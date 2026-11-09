import { createClient } from "@supabase/supabase-js";
import { validateAuthInput, validateNick } from "@/lib/auth-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "no-store" };

function getAnonSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function siteUrl(request: Request): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return new URL(request.url).origin;
}

/**
 * Rejestracja z potwierdzeniem e-mail. Supabase wysyła link przez własny SMTP
 * (kontakt@szybkamatematyka.pl, patrz docs/EMAIL.md). Konto bez potwierdzenia
 * nie może się zalogować. Gdy potwierdzanie jest wyłączone w Supabase,
 * zwracamy `needsConfirmation: false` i klient loguje od razu.
 */
export async function POST(request: Request): Promise<Response> {
  const supabase = getAnonSupabase();
  if (!supabase) {
    return Response.json(
      { error: "Rejestracja jest obecnie niedostępna." },
      { status: 503, headers: HEADERS },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Nieprawidłowe dane." }, { status: 400, headers: HEADERS });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const nick = typeof body.nick === "string" ? body.nick : "";
  const schoolLevel =
    typeof body.schoolLevel === "string" ? body.schoolLevel.slice(0, 40) : null;

  const validationError = validateNick(nick) ?? validateAuthInput(email, password);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400, headers: HEADERS });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl(request)}/login`,
      data: { nick, nickname: nick, school_level: schoolLevel || null },
    },
  });

  if (error) {
    if (error.status === 429 || /rate limit/i.test(error.message)) {
      return Response.json(
        { error: "Zbyt wiele prób. Spróbuj ponownie za kilka minut.", code: "rate_limited" },
        { status: 429, headers: HEADERS },
      );
    }
    if (/already|registered|exists/i.test(error.message)) {
      return Response.json(
        { ok: true, needsConfirmation: true },
        { headers: HEADERS },
      );
    }
    console.error("[szybka-matma] signup failed:", error.message);
    return Response.json(
      { error: "Nie udało się utworzyć konta. Spróbuj ponownie." },
      { status: 500, headers: HEADERS },
    );
  }

  // Dla istniejącego adresu Supabase zwraca użytkownika bez tożsamości.
  // Odpowiadamy tak samo jak przy nowym koncie (bez ujawniania, że konto istnieje).
  if (!data.user || data.user.identities?.length === 0) {
    return Response.json(
      { ok: true, needsConfirmation: true },
      { headers: HEADERS },
    );
  }

  return Response.json(
    { ok: true, userId: data.user.id, needsConfirmation: !data.session },
    { headers: HEADERS },
  );
}
