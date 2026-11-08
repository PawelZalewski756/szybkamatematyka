"use client";

import { AuthAlert, AUTH_INPUT_CLASS } from "@/components/auth/AuthFormParts";
import { passwordResetRedirectUrl } from "@/lib/auth-password-reset";
import {
  getAuthErrorMessage,
  validateEmailInput,
} from "@/lib/auth-errors";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ZapomnianeHasloPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [sent, setSent] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(() =>
    isSupabaseConfigured(),
  );

  useEffect(() => {
    const onConfigReady = () => setSupabaseReady(true);
    window.addEventListener("supabase-config-ready", onConfigReady);
    return () =>
      window.removeEventListener("supabase-config-ready", onConfigReady);
  }, []);

  useEffect(() => {
    if (!supabaseReady) return;

    const supabase = getSupabase();
    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          router.replace("/");
        }
      })
      .catch((error: unknown) => {
        console.warn("[szybka-matma] password reset session check:", error);
      });
  }, [router, supabaseReady]);

  const handleSubmit = async () => {
    setMessage(null);
    setIsError(false);

    const validationError = validateEmailInput(email);
    if (validationError) {
      setIsError(true);
      setMessage(validationError);
      return;
    }

    if (!supabaseReady) {
      setIsError(true);
      setMessage(
        "Odzyskiwanie hasła jest obecnie niedostępne. Spróbuj ponownie później.",
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: passwordResetRedirectUrl() },
      );

      if (error) throw error;

      setSent(true);
      setIsError(false);
      setMessage(
        "Jeśli konto z tym adresem istnieje, wysłaliśmy link do ustawienia nowego hasła. Sprawdź skrzynkę (także spam).",
      );
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
          Odzyskiwanie hasła
        </p>
        <h1 className="mt-2 text-center text-2xl font-black text-foreground sm:text-3xl">
          Zapomniałeś hasła?
        </h1>
        <p className="mt-3 text-center text-sm text-muted">
          Podaj e-mail konta - wyślemy link do ustawienia nowego hasła.
        </p>

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
              Email
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              disabled={sent}
              className={AUTH_INPUT_CLASS}
            />
          </label>

          {message && <AuthAlert message={message} isError={isError} />}

          <motion.button
            type="submit"
            disabled={loading || sent}
            className="mt-2 flex min-h-[52px] items-center justify-center rounded-2xl btn-primary text-lg disabled:opacity-60"
            whileHover={{ scale: loading || sent ? 1 : 1.02 }}
            whileTap={{ scale: loading || sent ? 1 : 0.98 }}
          >
            {loading ? "Wysyłanie…" : sent ? "Wysłano link" : "Wyślij link resetujący"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link
            href="/login"
            className="font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            ← Wróć do logowania
          </Link>
        </p>
      </motion.div>

      <p className="mt-6 text-center text-sm text-muted">
        <Link
          href="/"
          className="font-semibold text-muted transition-colors hover:text-accent"
        >
          Strona główna
        </Link>
      </p>
    </div>
  );
}
