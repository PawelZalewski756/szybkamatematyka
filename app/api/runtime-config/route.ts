import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Publiczna konfiguracja potrzebna klientowi, odczytywana dopiero w runtime. */
export function GET() {
  // Dynamiczny lookup zapobiega zamrożeniu wartości NEXT_PUBLIC_* podczas builda.
  const runtimeEnv = process.env;
  const supabaseUrl = runtimeEnv["NEXT_PUBLIC_SUPABASE_URL"]?.trim();
  const supabaseAnonKey = runtimeEnv["NEXT_PUBLIC_SUPABASE_ANON_KEY"]?.trim();
  const siteUrl = runtimeEnv["NEXT_PUBLIC_SITE_URL"]?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { configured: false },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return NextResponse.json(
    { configured: true, supabaseUrl, supabaseAnonKey, siteUrl },
    { headers: { "Cache-Control": "no-store" } },
  );
}
