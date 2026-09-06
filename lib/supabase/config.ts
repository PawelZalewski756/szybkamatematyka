export type RuntimePublicConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl?: string;
};

let runtimeConfig: RuntimePublicConfig | null = null;

/** Ustawia publiczną konfigurację odczytaną bezpośrednio na serwerze. */
export function setRuntimePublicConfig(config: RuntimePublicConfig): void {
  if (!config.supabaseUrl.trim() || !config.supabaseAnonKey.trim()) return;
  runtimeConfig = {
    supabaseUrl: config.supabaseUrl.trim(),
    supabaseAnonKey: config.supabaseAnonKey.trim(),
    siteUrl: config.siteUrl?.trim().replace(/\/+$/, "") || undefined,
  };
}

export function getSupabaseConfig(): {
  url: string;
  anonKey: string;
} | null {
  const url =
    runtimeConfig?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    runtimeConfig?.supabaseAnonKey ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getRuntimeSiteUrl(): string | null {
  return runtimeConfig?.siteUrl ?? null;
}

/** Czy klient Supabase może zostać utworzony (build-time lub runtime). */
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
