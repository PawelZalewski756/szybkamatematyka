import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export { isSupabaseConfigured } from "@/lib/supabase/config";

let browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Brakuje NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY w konfiguracji aplikacji.",
    );
  }

  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Brakuje NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY w konfiguracji aplikacji.",
    );
  }

  if (!browserClient) {
    browserClient = createClient(config.url, config.anonKey);
  }

  return browserClient;
}

/** Token sesji do nagłówka Authorization - odświeża wygasłą sesję jeśli trzeba. */
export async function getSupabaseAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) return null;

  const session = sessionData.session;
  if (!session) {
    const { data, error } = await supabase.auth.refreshSession();
    return error ? null : data.session?.access_token ?? null;
  }

  const expiresAt = session.expires_at;
  const expiresSoon =
    typeof expiresAt === "number" &&
    expiresAt * 1000 <= Date.now() + 60_000;

  if (!expiresSoon) {
    return session.access_token;
  }

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) {
    return null;
  }
  return data.session.access_token;
}

/** Zwraca klienta lub null - bez rzucania wyjątku (bezpieczne dla UI). */
export function getSupabaseOrNull(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    return getSupabase();
  } catch {
    return null;
  }
}
