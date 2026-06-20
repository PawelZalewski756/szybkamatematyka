"use client";

import { getSupabaseOrNull, isSupabaseConfigured } from "@/lib/supabase";
import { isAdminEmail, isAdminWhitelistConfigured } from "@/lib/supabase/admin";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Gate UI panelu administratora.
 *
 * To jest wyłącznie warstwa UX (sesja Supabase żyje w localStorage przeglądarki —
 * nie ma ciasteczka, więc Proxy/middleware ani server component nie odczytają sesji
 * po stronie serwera). Realne wymuszenie uprawnień dzieje się w route handlerach
 * (np. /api/generate-solution weryfikuje token Bearer) oraz w politykach RLS Supabase.
 *
 * Zasada gate'u:
 * - brak zalogowania → /login,
 * - whitelist NEXT_PUBLIC_ADMIN_EMAILS ustawiona i e-mail spoza listy → strona główna,
 * - whitelist nieustawiona → wpuszczamy zalogowanego (degradacja).
 */
type GateState = "checking" | "allowed";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GateState>("checking");

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      router.replace("/login");
      return;
    }

    const supabase = getSupabaseOrNull();
    if (!supabase) {
      router.replace("/login");
      return;
    }

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const user = data.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      if (isAdminWhitelistConfigured() && !isAdminEmail(user.email)) {
        router.replace("/");
        return;
      }

      setState("allowed");
    });

    return () => {
      active = false;
    };
  }, [router]);

  if (state !== "allowed") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-24 text-center">
        <p className="text-sm font-semibold text-zinc-500">
          Sprawdzanie uprawnień…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
