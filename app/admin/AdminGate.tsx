"use client";

import { GamingBackground } from "@/components/gaming/GamingBackground";
import { getSupabaseOrNull, isSupabaseConfigured } from "@/lib/supabase";
import { isAdminEmail, isAdminWhitelistConfigured } from "@/lib/supabase/admin";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

type GateState = "checking" | "allowed" | "denied";

/**
 * Gate panelu administratora — bez publicznych linków w UI.
 * Nieuprawnieni widzą zwykły 404 (bez podpowiedzi, że istnieje /admin).
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>(() =>
    isSupabaseConfigured() && isAdminWhitelistConfigured()
      ? "checking"
      : "denied",
  );

  useEffect(() => {
    if (!isSupabaseConfigured() || !isAdminWhitelistConfigured()) return;

    const supabase = getSupabaseOrNull();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("denied");
      return;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const user = data.user;

      if (!user) {
        setState("denied");
        return;
      }

      if (!isAdminEmail(user.email)) {
        setState("denied");
        return;
      }

      setState("allowed");
    });

    return () => {
      active = false;
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-24 text-center">
        <p className="text-sm font-semibold text-muted">Ładowanie…</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col bg-background">
        <GamingBackground />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:py-28">
          <p className="text-overline text-accent/90">Błąd 404</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Tej strony nie ma na mapie
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted">
            Strona, której szukasz, nie istnieje lub została przeniesiona.
          </p>
          <Link href="/" className="chip-link mt-8">
            Strona główna
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
