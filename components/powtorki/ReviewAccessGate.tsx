"use client";

import { ReviewProvider } from "@/components/powtorki/ReviewProvider";
import { getSupabaseOrNull } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

type AccessState = "checking" | "allowed" | "guest" | "error";

export function ReviewAccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessState>("checking");

  useEffect(() => {
    const supabase = getSupabaseOrNull();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("guest");
      return;
    }

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session?.user ? "allowed" : "guest");
    });

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        setState(error ? "error" : data.session?.user ? "allowed" : "guest");
      })
      .catch(() => {
        if (active) setState("error");
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (state === "checking") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <p className="text-sm font-semibold text-muted">Sprawdzam logowanie…</p>
      </div>
    );
  }

  if (state !== "allowed") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-4 py-12">
        <div className="card-raised w-full p-6 text-center sm:p-8">
          <h1 className="text-xl font-extrabold text-foreground">
            Powtórki są dostępne po zalogowaniu
          </h1>
          <p className="mt-2 text-sm text-muted">
            Zaloguj się, aby wrócić do zapisanych zadań i kontynuować naukę.
          </p>
          {state === "error" ? (
            <p className="mt-3 text-sm text-muted">
              Nie udało się potwierdzić sesji. Spróbuj ponownie.
            </p>
          ) : null}
          <Link href="/login" className="btn-primary mt-5 inline-flex">
            Zaloguj się
          </Link>
        </div>
      </div>
    );
  }

  return <ReviewProvider>{children}</ReviewProvider>;
}
