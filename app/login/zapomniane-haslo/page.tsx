"use client";

import { AuthAlert, AUTH_INPUT_CLASS } from "@/components/auth/AuthFormParts";
import { passwordResetRedirectUrl } from "@/lib/auth-password-reset";
import {
  getAuthErrorMessage,
  validateEmailInput,
} from "@/lib/auth-errors";
import { getSupabase } from "@/lib/supabase";
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

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace("/");
      }
    });
  }, [router]);

  const handleSubmit = async () => {
    setMessage(null);
    setIsError(false);

    const validationError = validateEmailInput(email);
    if (validationError) {
      setIsError(true);
      setMessage(validationError);
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
        className="rounded-3xl border border-white/[0.08] bg-[#141c2b]/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
      >
        <p className="text-center text-sm font-bold uppercase tracking-widest text-teal-400/90">
          Odzyskiwanie hasła
        </p>
        <h1 className="mt-2 text-center text-2xl font-black text-white sm:text-3xl">
          Zapomniałeś hasła?
        </h1>
        <p className="mt-3 text-center text-sm text-zinc-400">
          Podaj e-mail konta — wyślemy link do ustawienia nowego hasła.
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
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
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
            className="mt-2 flex min-h-[52px] items-center justify-center rounded-2xl bg-brand-gradient text-lg font-black text-white shadow-lg shadow-teal-950/30 disabled:opacity-60"
            whileHover={{ scale: loading || sent ? 1 : 1.02 }}
            whileTap={{ scale: loading || sent ? 1 : 0.98 }}
          >
            {loading ? "Wysyłanie…" : sent ? "Wysłano link" : "Wyślij link resetujący"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link
            href="/login"
            className="font-semibold text-teal-400 transition-colors hover:text-teal-300"
          >
            ← Wróć do logowania
          </Link>
        </p>
      </motion.div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link
          href="/"
          className="font-semibold text-zinc-400 transition-colors hover:text-teal-400"
        >
          Strona główna
        </Link>
      </p>
    </div>
  );
}
