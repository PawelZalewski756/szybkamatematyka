import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export { isSupabaseConfigured } from "@/lib/supabase/config";

let browserClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Brakuje NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY w pliku .env.local",
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

  if (!browserClient) {
    browserClient = createClient(url, anonKey);
  }

  return browserClient;
}

/** Token sesji do nagłówka Authorization — odświeża wygasłą sesję jeśli trzeba. */
export async function getSupabaseAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const readToken = () => supabase.auth.getSession().then(({ data }) => data.session?.access_token ?? null);

  let token = await readToken();
  if (token) return token;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) {
    return null;
  }
  return data.session.access_token;
}

/** Zwraca klienta lub null — bez rzucania wyjątku (bezpieczne dla UI). */
export function getSupabaseOrNull(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    return getSupabase();
  } catch {
    return null;
  }
}
