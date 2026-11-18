import { getSupabaseOrNull } from "@/lib/supabase";
import { getServiceSupabaseOrNull } from "@/lib/stripe/service-supabase";
import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function invalidCredentials(): Response {
  return Response.json(
    { error: "Nieprawidłowy nick/e-mail lub hasło." },
    { status: 401, headers: NO_STORE },
  );
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

async function findUserIdByNick(
  service: NonNullable<ReturnType<typeof getServiceSupabaseOrNull>>,
  identifier: string,
): Promise<string | null> {
  const pattern = escapeLike(identifier);
  const { data, error } = await service
    .from("profiles")
    .select("id, nick, nickname")
    .or(`nick.ilike.${pattern},nickname.ilike.${pattern}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[auth-login] nick lookup:", error.message);
    return null;
  }
  return data?.id ? String(data.id) : null;
}

/**
 * POST /api/auth/login
 *
 * Logowanie nickiem albo e-mailem. Dla nicku tłumaczymy go na e-mail przez
 * service role (bez wysyłania e-maila do klienta), a potem logujemy przez
 * Supabase Auth. Odpowiedź zawiera tylko tokeny sesji.
 */
export async function POST(request: Request): Promise<Response> {
  const limit = checkRateLimit(`login:${clientIp(request)}`, {
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Nieprawidłowe dane." }, { status: 400, headers: NO_STORE });
  }

  const identifier =
    typeof body.identifier === "string" ? body.identifier.trim().slice(0, 160) : "";
  const password =
    typeof body.password === "string" ? body.password.slice(0, 200) : "";

  if (!identifier || !password) {
    return Response.json(
      { error: "Podaj nick/e-mail i hasło." },
      { status: 400, headers: NO_STORE },
    );
  }

  const supabase = getSupabaseOrNull();
  if (!supabase) {
    return Response.json(
      { error: "Logowanie jest chwilowo niedostępne." },
      { status: 503, headers: NO_STORE },
    );
  }

  let email = identifier;
  if (!identifier.includes("@")) {
    const service = getServiceSupabaseOrNull();
    if (!service) {
      return Response.json(
        { error: "Logowanie nickiem jest chwilowo niedostępne." },
        { status: 503, headers: NO_STORE },
      );
    }

    const userId = await findUserIdByNick(service, identifier);
    if (!userId) return invalidCredentials();

    const { data, error } = await service.auth.admin.getUserById(userId);
    const resolvedEmail = data.user?.email?.trim();
    if (error || !resolvedEmail) return invalidCredentials();
    email = resolvedEmail;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (/email not confirmed/i.test(error.message)) {
      return Response.json(
        {
          error:
            "Potwierdź e-mail (link z wiadomości), a potem się zaloguj. Jeśli logujesz się nickiem, sprawdź skrzynkę przypisaną do konta.",
          code: "email_not_confirmed",
        },
        { status: 403, headers: NO_STORE },
      );
    }
    // Nie ujawniamy, czy nick istnieje, czy hasło jest złe.
    return invalidCredentials();
  }

  if (!data.session) return invalidCredentials();

  return Response.json(
    {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
    },
    { headers: NO_STORE },
  );
}
