"use client";

import { AuthAlert, AUTH_INPUT_CLASS } from "@/components/auth/AuthFormParts";
import {
  getAuthErrorMessage,
  validatePasswordResetInput,
} from "@/lib/auth-errors";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AUTH_UNAVAILABLE_MESSAGE =
  "Ustawianie nowego hasła jest obecnie niedostępne. Spróbuj ponownie później.";

export default function NoweHasloPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(() =>
    isSupabaseConfigured(),
  );
  const [checking, setChecking] = useState(() => isSupabaseConfigured());
  const [canReset, setCanReset] = useState(false);
  const [message, setMessage] = useState<string | null>(
    isSupabaseConfigured() ? null : AUTH_UNAVAILABLE_MESSAGE,
  );
  const [isError, setIsError] = useState(!isSupabaseConfigured());
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let started = false;
    let unsubscribe = () => {};

    const start = () => {
      if (started || !isSupabaseConfigured()) return;
      started = true;
      setSupabaseReady(true);
      setChecking(true);
      setMessage(null);
      setIsError(false);

      const supabase = getSupabase();
      const init = async () => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!cancelled) {
            if (!error) {
              setCanReset(true);
              setChecking(false);
              window.history.replaceState({}, "", "/login/nowe-haslo");
              return;
            }
            setChecking(false);
            setIsError(true);
            setMessage(
              "Link wygasł lub jest nieprawidłowy. Poproś o nowy link resetujący hasło.",
            );
            return;
          }
        }

        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session) {
          setCanReset(true);
          setChecking(false);
          return;
        }

        setChecking(false);
        setIsError(true);
        setMessage(
          "Link wygasł lub jest nieprawidłowy. Poproś o nowy link resetujący hasło.",
        );
      };

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;
        if (event === "PASSWORD_RECOVERY" || session) {
          setCanReset(true);
          setChecking(false);
          setIsError(false);
          setMessage(null);
        }
      });
      unsubscribe = () => subscription.unsubscribe();
      void init();
    };

    window.addEventListener("supabase-config-ready", start);
    start();

    return () => {
      cancelled = true;
      window.removeEventListener("supabase-config-ready", start);
      unsubscribe();
    };
  }, []);

  const handleSubmit = async () => {
    setMessage(null);
    setIsError(false);

    const validationError = validatePasswordResetInput(password, passwordConfirm);
    if (validationError) {
      setIsError(true);
      setMessage(validationError);
      return;
    }

    if (!supabaseReady) {
      setIsError(true);
      setMessage(AUTH_UNAVAILABLE_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setDone(true);
      setIsError(false);
      setMessage("Hasło zostało zmienione. Za chwilę przekierujemy na stronę główną…");

      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 2000);
    } catch (err) {
      setIsError(true);
      setMessage(getAuthErrorMessage(err as Error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-surface-border bg-surface/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
      >
        <p className="text-center text-sm font-bold uppercase tracking-widest text-accent/90">
          Nowe hasło
        </p>
        <h1 className="mt-2 text-center text-2xl font-black text-white sm:text-3xl">
          Ustaw nowe hasło
        </h1>
        <p className="mt-3 text-center text-sm text-muted">
          Wybierz hasło o długości co najmniej 6 znaków.
        </p>

        {checking ? (
          <p className="mt-8 text-center text-sm text-muted">Weryfikuję link…</p>
        ) : canReset ? (
          <form
            className="mt-8 flex flex-col gap-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">
                Nowe hasło
              </span>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="minimum 6 znaków"
                disabled={done}
                className={AUTH_INPUT_CLASS}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">
                Powtórz hasło
              </span>
              <input
                type="password"
                name="passwordConfirm"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="wpisz hasło jeszcze raz"
                disabled={done}
                className={AUTH_INPUT_CLASS}
              />
            </label>

            {message && <AuthAlert message={message} isError={isError} />}

            <motion.button
              type="submit"
              disabled={loading || done}
              className="mt-2 flex min-h-[52px] items-center justify-center rounded-2xl btn-primary text-lg disabled:opacity-60"
              whileHover={{ scale: loading || done ? 1 : 1.02 }}
              whileTap={{ scale: loading || done ? 1 : 0.98 }}
            >
              {loading ? "Zapisuję…" : done ? "Zapisano" : "Zapisz nowe hasło"}
            </motion.button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            {message && <AuthAlert message={message} isError={isError} />}
            <Link
              href="/login/zapomniane-haslo"
              className="flex min-h-[52px] items-center justify-center rounded-2xl border border-surface-border bg-background text-sm font-bold text-white transition hover:border-accent/30"
            >
              Poproś o nowy link
            </Link>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            href="/login"
            className="font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            ← Wróć do logowania
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
