"use client";

import {
  getAuthErrorMessage,
  validateAuthInput,
  validateSignupInput,
} from "@/lib/auth-errors";
import {
  createProfile,
  ensureUserProfile,
  fetchProfile,
  isNickTaken,
  normalizeNick,
} from "@/lib/supabase/profiles";
import { getSupabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthView = "login" | "signup";

const inputClassName =
  "rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3.5 text-white outline-none transition-shadow placeholder:text-zinc-600 focus:ring-4";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace("/");
      }
    });
  }, [router]);

  const clearMessage = () => {
    setMessage(null);
    setIsError(false);
  };

  const switchToSignup = () => {
    clearMessage();
    setPasswordConfirm("");
    setNick("");
    setView("signup");
  };

  const switchToLogin = () => {
    clearMessage();
    setPasswordConfirm("");
    setView("login");
  };

  const handleLogin = async () => {
    clearMessage();

    const validationError = validateAuthInput(email, password);
    if (validationError) {
      setIsError(true);
      setMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          await ensureUserProfile(user);
        } catch {
          /* sesja OK — profil naprawi navbar; i tak idziemy na stronę główną */
        }
      }

      router.replace("/");
    } catch (err) {
      setIsError(true);
      setMessage(getAuthErrorMessage(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    clearMessage();

    const validationError = validateSignupInput(
      email,
      password,
      passwordConfirm,
      nick,
    );
    if (validationError) {
      setIsError(true);
      setMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();
      const trimmedEmail = email.trim();
      const normalizedNick = normalizeNick(nick);

      if (await isNickTaken(normalizedNick)) {
        setIsError(true);
        setMessage("Ten nick jest już zajęty!");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { nick: normalizedNick, nickname: normalizedNick },
        },
      });

      if (error) throw error;

      // Supabase często zwraca user: null bez błędu, gdy e-mail jest już w bazie
      if (!data.user) {
        setIsError(true);
        setMessage(
          "Ten e-mail jest już zarejestrowany — użyj „Zaloguj się” albo innego adresu.",
        );
        return;
      }

      if (data.session) {
        const existing = await fetchProfile(data.user.id);
        if (!existing) {
          try {
            await createProfile(data.user.id, normalizedNick);
          } catch (profileError) {
            const msg =
              profileError instanceof Error ? profileError.message : "";
            if (msg.includes("unique") || msg.includes("duplicate")) {
              setIsError(true);
              setMessage("Ten nick jest już zajęty!");
              return;
            }
            throw profileError;
          }
        }

        router.push("/");
        router.refresh();
        return;
      }

      // Konto utworzone, czeka na potwierdzenie e-mail — profil utworzy trigger w bazie
      setIsError(false);
      setMessage(
        "Konto utworzone! Sprawdź skrzynkę e-mail, kliknij link potwierdzający, a potem się zaloguj.",
      );
      setPassword("");
      setPasswordConfirm("");
      setNick("");
    } catch (err) {
      setIsError(true);
      setMessage(getAuthErrorMessage(err as Error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <AnimatePresence mode="wait">
        {view === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-orange-500/20 bg-[#141c2b]/95 p-6 shadow-2xl shadow-orange-950/20 backdrop-blur-sm sm:p-8"
          >
            <p className="text-center text-sm font-bold uppercase tracking-widest text-orange-400">
              Logowanie
            </p>
            <h1 className="mt-2 text-center text-3xl font-black text-white sm:text-4xl">
              Zaloguj się do{" "}
              <span className="text-gradient-brand">Szybkiej Matematyki</span>
            </h1>
            <p className="mt-3 text-center text-sm text-zinc-400">
              Masz już konto? Wpisz e-mail i hasło.
            </p>

            <form
              className="mt-8 flex flex-col gap-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void handleLogin();
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
                  className={`${inputClassName} focus:border-orange-500/50 focus:ring-orange-500/20`}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Hasło
                </span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="twoje hasło"
                  className={`${inputClassName} focus:border-orange-500/50 focus:ring-orange-500/20`}
                />
              </label>

              {message && (
                <Alert message={message} isError={isError} />
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-[52px] items-center justify-center rounded-2xl bg-brand-gradient text-lg font-black text-white shadow-lg shadow-orange-500/30 disabled:opacity-60"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "Logowanie…" : "Zaloguj się"}
              </motion.button>

              <motion.button
                type="button"
                disabled={loading}
                onClick={switchToSignup}
                className="flex min-h-[52px] items-center justify-center rounded-2xl border border-white/15 bg-zinc-950 text-lg font-black text-white transition-colors hover:border-orange-500/40 hover:bg-orange-500/10 disabled:opacity-60"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                Załóż konto
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-b from-[#141c2b] via-[#121a28] to-[#0f1810] p-6 shadow-2xl shadow-orange-950/20 backdrop-blur-sm sm:p-8"
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-500/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-500/12 blur-3xl"
              aria-hidden
            />

            <div className="relative text-center">
              <span className="text-4xl" aria-hidden>
                🎮
              </span>
              <p className="mt-2 text-sm font-bold uppercase tracking-widest text-amber-400/90">
                Nowe konto
              </p>
              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                Dołącz do{" "}
                <span className="text-gradient-brand">Szybkiej Matematyki</span>
              </h1>
            </div>

            <form
              className="relative mt-8 flex flex-col gap-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void handleSignup();
              }}
            >
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-orange-400/80">
                  Nick
                </span>
                <input
                  type="text"
                  name="nick"
                  autoComplete="username"
                  required
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  placeholder="np. MatmaMaster"
                  maxLength={20}
                  className={`${inputClassName} focus:border-orange-500/50 focus:ring-orange-500/20`}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-orange-400/80">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="twoj@email.pl"
                  className={`${inputClassName} focus:border-orange-500/50 focus:ring-orange-500/20`}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-orange-400/80">
                  Hasło
                </span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="minimum 6 znaków"
                  className={`${inputClassName} focus:border-orange-500/50 focus:ring-orange-500/20`}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-amber-500/80">
                  Powtórz hasło
                </span>
                <input
                  type="password"
                  name="passwordConfirm"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="wpisz hasło jeszcze raz"
                  className={`${inputClassName} focus:border-amber-500/50 focus:ring-amber-500/20`}
                />
              </label>

              {message && (
                <Alert message={message} isError={isError} />
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="mt-2 flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-brand-gradient text-lg font-black text-white shadow-lg shadow-orange-950/30 disabled:opacity-60"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "Tworzenie konta…" : "Utwórz konto ✨"}
              </motion.button>

              <button
                type="button"
                disabled={loading}
                onClick={switchToLogin}
                className="text-center text-sm font-semibold text-zinc-500 transition-colors hover:text-orange-300 disabled:opacity-50"
              >
                Masz już konto?{" "}
                <span className="text-orange-400">Zaloguj się</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link
          href="/"
          className="font-semibold text-zinc-400 transition-colors hover:text-orange-400"
        >
          ← Wróć na stronę główną
        </Link>
      </p>
    </div>
  );
}

function Alert({
  message,
  isError,
}: {
  message: string;
  isError: boolean;
}) {
  return (
    <p
      className={`rounded-xl px-4 py-3 text-sm font-medium ${
        isError
          ? "border border-red-500/30 bg-red-500/10 text-red-300"
          : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      }`}
      role="alert"
    >
      {message}
    </p>
  );
}
