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
            Powtórki zapisują się na koncie
          </h1>
          <p className="mt-2 text-sm text-muted">
            Załóż darmowe konto, aby wracać do zapisanych zadań i kontynuować
            naukę na każdym urządzeniu.
          </p>
          {state === "error" ? (
            <p className="mt-3 text-sm text-muted">
              Nie udało się potwierdzić sesji. Spróbuj ponownie.
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link href="/login?mode=signup" className="btn-primary">
              Załóż darmowe konto
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold text-muted transition-colors hover:text-foreground"
            >
              Mam już konto
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ReviewProvider>{children}</ReviewProvider>;
}
