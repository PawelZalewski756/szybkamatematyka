import { createClient, type User } from "@supabase/supabase-js";

/**
 * Whitelist administratorów.
 *
 * Źródłem prawdy jest serwerowa zmienna ADMIN_EMAILS (lista adresów po przecinku).
 * NEXT_PUBLIC_ADMIN_EMAILS jest opcjonalnym lustrem dla gate'u w UI panelu admina
 * (przeglądarka widzi tylko zmienne z prefiksem NEXT_PUBLIC_). Ustaw obie na tę
 * samą wartość. Realne wymuszenie i tak dzieje się po stronie serwera (route
 * handler) oraz w RLS Supabase — gate w UI to tylko UX.
 */
export function getAdminEmails(): string[] {
  const raw =
    process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getServerAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** Czy skonfigurowano jakąkolwiek whitelistę adminów. */
export function isAdminWhitelistConfigured(): boolean {
  return getAdminEmails().length > 0;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export type AdminAuthResult =
  | { ok: true; user: User; isAdmin: boolean }
  | { ok: false; status: 401 | 403; error: string };

export type AuthenticatedResult =
  | { ok: true; user: User }
  | { ok: false; status: 401; error: string };

/** Wyciąga token Bearer z nagłówka Authorization. */
export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

/**
 * Weryfikuje sesję Supabase przesłaną jako Bearer token i sprawdza uprawnienia.
 *
 * Sesja Supabase żyje wyłącznie po stronie klienta (localStorage), więc serwer
 * nie ma dostępu do ciasteczka sesji — token musi przyjść w nagłówku Authorization.
 *
 * Polityka:
 * - brak/niepoprawny token → 401,
 * - brak serwerowej whitelisty ADMIN_EMAILS → odmowa (fail closed),
 * - poprawna sesja, ale e-mail spoza whitelisty → 403.
 */
export async function verifyAdminRequest(
  request: Request,
): Promise<AdminAuthResult> {
  const token = getBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, error: "Wymagane zalogowanie." };
  }

  const adminEmails = getServerAdminEmails();
  if (adminEmails.length === 0) {
    return {
      ok: false,
      status: 403,
      error: "Panel administratora nie jest skonfigurowany.",
    };
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
    return { ok: false, status: 401, error: "Sesja wygasła lub jest nieprawidłowa." };
  }

  const admin = Boolean(
    user.email && adminEmails.includes(user.email.trim().toLowerCase()),
  );
  if (!admin) {
    return {
      ok: false,
      status: 403,
      error: "Brak uprawnień administratora.",
    };
  }

  return { ok: true, user, isAdmin: admin };
}

/**
 * Weryfikuje tylko zalogowanego użytkownika (Bearer token).
 * Bez wymogu wpisu na liście adminów — do endpointów uczniowskich (np. AI).
 */
export async function verifyAuthenticatedRequest(
  request: Request,
): Promise<AuthenticatedResult> {
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
