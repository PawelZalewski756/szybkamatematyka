"use client";

import { getSupabase } from "@/lib/supabase";
import { useEffect } from "react";

const STORAGE_PREFIX = "sm-telegram-confirmed";

/**
 * Po potwierdzeniu e-maila Supabase tworzy sesję i przekierowuje użytkownika
 * na stronę logowania. Ten komponent wysyła wtedy jednorazowo powiadomienie
 * do administratorów. Endpoint weryfikuje token sesji i jest idempotentny.
 */
export function ConfirmedAccountNotifier() {
  useEffect(() => {
    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch {
      return;
    }

    let cancelled = false;

    const notify = async (session: {
      access_token: string;
      user: { id: string; email_confirmed_at?: string | null };
    } | null) => {
      if (cancelled || !session?.user.email_confirmed_at) return;

      const key = `${STORAGE_PREFIX}:${session.user.id}`;
      try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch {
        /* prywatny tryb może blokować sessionStorage */
      }

      try {
        const response = await fetch("/api/telegram/account-confirmed", {
          method: "POST",
          headers: { authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        if (!response.ok) {
          try {
            sessionStorage.removeItem(key);
          } catch {
            /* ignore */
          }
        }
      } catch {
        try {
          sessionStorage.removeItem(key);
        } catch {
          /* ignore */
        }
      }
    };

    void supabase.auth.getSession().then(({ data }) => {
      void notify(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void notify(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
