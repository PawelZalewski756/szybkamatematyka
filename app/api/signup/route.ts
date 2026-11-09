import { createClient } from "@supabase/supabase-js";
import { validateAuthInput, validateNick } from "@/lib/auth-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "no-store" };

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Rejestracja bez wysyłki maila potwierdzającego.
 * Wbudowany mailer Supabase ma bardzo niski limit wiadomości na godzinę,
 * przez co użytkownicy nie dostawali linków i zakładali kolejne konta.
 */
export async function POST(request: Request): Promise<Response> {
  const supabase = getAdminSupabase();
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

  const metadata = { nick, nickname: nick, school_level: schoolLevel || null };

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (!error && data.user) {
    return Response.json({ ok: true, userId: data.user.id }, { headers: HEADERS });
  }

  const message = error?.message ?? "";
  if (!/already|registered|exists/i.test(message)) {
    console.error("[szybka-matma] signup createUser failed:", message);
    return Response.json(
      { error: "Nie udało się utworzyć konta. Spróbuj ponownie." },
      { status: 500, headers: HEADERS },
    );
  }

  // Konto z wcześniejszej próby, którego nikt nie potwierdził - odblokowujemy je.
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (listError || !list) break;
    const existing = list.users.find((u) => u.email?.toLowerCase() === target);
    if (existing) {
      if (existing.email_confirmed_at) break;
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existing.id,
        { password, email_confirm: true, user_metadata: metadata },
      );
      if (updateError) break;
      return Response.json({ ok: true, userId: existing.id }, { headers: HEADERS });
    }
    if (list.users.length < 1000) break;
  }

  return Response.json(
    { error: "Ten e-mail jest już zarejestrowany. Zaloguj się lub zresetuj hasło.", code: "exists" },
    { status: 409, headers: HEADERS },
  );
}
