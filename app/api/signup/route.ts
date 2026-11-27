import { deliverSignupNotification } from "@/lib/telegram/signup-delivery";
import { sendWelcomeEmail } from "@/lib/email/welcome";
import { validateAuthInput, validateNick } from "@/lib/auth-errors";
import { isDisposableEmail } from "@/lib/auth/disposable-email-domains";
import { normalizeReferralCode } from "@/lib/referral/codes";
import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Wysyłka Telegrama i maila powitalnego jest awaitowana przed odpowiedzią.
// Domyślne 10 s bywa za krótkie przy zimnym starcie i wolnym Telegramie.
export const maxDuration = 30;

const HEADERS = { "Cache-Control": "no-store" };

type SupabaseConfig = { url: string; anonKey: string };

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url: url.replace(/\/$/, ""), anonKey };
}

type SignupUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown> | null;
  identities?: unknown[];
};

type SignupOutcome =
  | { ok: true; user: SignupUser; hasSession: boolean }
  | { ok: false; status: number; message: string };

/**
 * Rejestracja przez GoTrue zwracana jest jako użytkownik na najwyższym poziomie
 * JSON-a. supabase-js 2.106.1 parsuje ją przez `_sessionResponse`, które czyta
 * `data.user` - i w tej wersji API zwraca `user: null` mimo sukcesu. Dlatego
 * wołamy endpoint bezpośrednio i normalizujemy odpowiedź sami.
 */
async function signUpWithSupabase(
  config: SupabaseConfig,
  input: {
    email: string;
    password: string;
    metadata: Record<string, unknown>;
    redirectTo: string;
  },
): Promise<SignupOutcome> {
  const endpoint = new URL(`${config.url}/auth/v1/signup`);
  endpoint.searchParams.set("redirect_to", input.redirectTo);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        authorization: `Bearer ${config.anonKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        data: input.metadata,
      }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, message: "Brak połączenia z Supabase." };
  }

  const payload = (await response.json().catch(() => null)) as
    | (Record<string, unknown> & {
        msg?: string;
        message?: string;
        error_description?: string;
        error?: string;
        user?: Record<string, unknown>;
      })
    | null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        payload?.msg ??
        payload?.message ??
        payload?.error_description ??
        payload?.error ??
        `Supabase ${response.status}`,
    };
  }

  const rawUser = (payload?.user ?? payload) as Record<string, unknown> | null;
  if (!rawUser || typeof rawUser.id !== "string") {
    return {
      ok: false,
      status: 502,
      message: "Supabase nie zwrócił danych nowego konta.",
    };
  }

  return {
    ok: true,
    user: rawUser as SignupUser,
    hasSession: typeof payload?.access_token === "string",
  };
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
  const config = getSupabaseConfig();
  if (!config) {
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

  // Rejestracja jest najczęściej atakowanym endpointem (spam kont).
  const rateLimit = checkRateLimit(`signup:${clientIp(request)}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const nick = typeof body.nick === "string" ? body.nick : "";
  const schoolLevel =
    typeof body.schoolLevel === "string" ? body.schoolLevel.slice(0, 40) : null;
  const termsAccepted = body.termsAccepted === true;
  const ageConfirmed = body.ageConfirmed === true;
  const referralCode = normalizeReferralCode(body.referralCode);

  const validationError = validateNick(nick) ?? validateAuthInput(email, password);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400, headers: HEADERS });
  }
  if (isDisposableEmail(email)) {
    return Response.json(
      {
        error:
          "Użyj stałego adresu e-mail - jednorazowe skrzynki nie są akceptowane.",
      },
      { status: 400, headers: HEADERS },
    );
  }
  if (!termsAccepted || !ageConfirmed) {
    return Response.json(
      {
        error:
          "Aby założyć konto, zaakceptuj regulamin i politykę prywatności oraz potwierdź wiek lub zgodę opiekuna.",
      },
      { status: 400, headers: HEADERS },
    );
  }

  const signup = await signUpWithSupabase(config, {
    email,
    password,
    redirectTo: `${siteUrl(request)}/login`,
    metadata: {
      nick,
      nickname: nick,
      school_level: schoolLevel || null,
      terms_accepted_at: new Date().toISOString(),
      age_confirmed: true,
      ...(referralCode ? { referral_code: referralCode } : {}),
    },
  });

  if (!signup.ok) {
    if (signup.status === 429 || /rate limit/i.test(signup.message)) {
      return Response.json(
        { error: "Zbyt wiele prób. Spróbuj ponownie za kilka minut.", code: "rate_limited" },
        { status: 429, headers: HEADERS },
      );
    }
    if (/already|registered|exists/i.test(signup.message)) {
      return Response.json(
        { ok: true, needsConfirmation: true },
        { headers: HEADERS },
      );
    }
    console.error("[szybka-matma] signup failed:", signup.status, signup.message);
    return Response.json(
      { error: "Nie udało się utworzyć konta. Spróbuj ponownie." },
      { status: 500, headers: HEADERS },
    );
  }

  // Dla istniejącego, potwierdzonego adresu Supabase zwraca obfuskację bez
  // tożsamości. Odpowiadamy tak samo jak przy nowym koncie (bez enumeracji).
  if (signup.user.identities && signup.user.identities.length === 0) {
    return Response.json(
      { ok: true, needsConfirmation: true },
      { headers: HEADERS },
    );
  }

  const newUserId = signup.user.id;
  const newUser = {
    id: signup.user.id,
    email: signup.user.email ?? null,
    created_at: signup.user.created_at ?? new Date().toISOString(),
    email_confirmed_at: signup.user.email_confirmed_at ?? null,
    user_metadata: signup.user.user_metadata ?? null,
  };
  // Wysyłamy powiadomienie przed odpowiedzią, a nie w `after()`. Wcześniej
  // zdarzało się, że funkcja serverless kończyła się przed callbackiem i nowe
  // konto nie pojawiało się na Telegramie. Idempotencja jest po stronie
  // signup_notification_deliveries, więc ponowienie nie zdubluje wiadomości.
  const metadata = newUser.user_metadata ?? {};
  const welcomeNick =
    typeof metadata.nick === "string"
      ? metadata.nick
      : typeof metadata.nickname === "string"
        ? metadata.nickname
        : "";

  const [notification, welcome] = await Promise.all([
    deliverSignupNotification(newUserId, { user: newUser }).catch(
      (notificationError) => {
        console.error(
          "[telegram-signup] Powiadomienie nie zostało wysłane:",
          notificationError,
        );
        return null;
      },
    ),
    newUser.email
      ? sendWelcomeEmail({
          to: newUser.email,
          nick: welcomeNick,
          siteUrl: siteUrl(request),
        })
      : Promise.resolve({ ok: false as const, error: "missing recipient" }),
  ]);

  if (notification?.status === 202) {
    console.warn(
      "[telegram-signup] Powiadomienie pominięte (konto poza limitem wieku):",
      notification.body,
    );
  }
  if (notification && notification.status >= 400) {
    console.error(
      "[telegram-signup] Powiadomienie nie zostało wysłane:",
      notification.body,
    );
  }
  if (!welcome.ok && welcome.error !== "not configured") {
    console.error("[welcome-email] Wysyłka nie udała się:", welcome.error);
  }

  return Response.json(
    { ok: true, userId: newUserId, needsConfirmation: !signup.hasSession },
    { headers: HEADERS },
  );
}
