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
import { SchoolClassPicker } from "@/components/SchoolClassPicker";
import {
  hasStoredLearningPath,
  loadLearningPath,
  type LearningPath,
} from "@/lib/learning-path";
import { isSupabaseNetworkError } from "@/lib/supabase/errors";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  authRedirectUrl,
  signupSuccessPath,
} from "@/lib/auth-password-reset";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthView = "login" | "signup";

const inputClassName =
  "rounded-2xl border border-surface-border bg-background px-4 py-3.5 text-foreground outline-none transition-shadow placeholder:text-muted focus:ring-4";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [schoolLevel, setSchoolLevel] = useState<LearningPath | "">(() =>
    hasStoredLearningPath() ? loadLearningPath() : "",
  );
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
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
        console.warn("[szybka-matma] login session check:", error);
      });
  }, [router, supabaseReady]);

  const clearMessage = () => {
    setMessage(null);
    setIsError(false);
    setNeedsConfirm(false);
  };

  const handleResendConfirmation = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !supabaseReady) return;
    setLoading(true);
    try {
      const { error } = await getSupabase().auth.resend({
        type: "signup",
        email: trimmedEmail,
        options: { emailRedirectTo: authRedirectUrl("/login") },
      });
      if (error) throw error;
      setIsError(false);
      setNeedsConfirm(false);
      setMessage(
        "Wysłaliśmy link ponownie. Sprawdź skrzynkę, także SPAM i oferty.",
      );
    } catch (err) {
      setIsError(true);
      setMessage(getAuthErrorMessage(err as Error));
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => {
    clearMessage();
    setPasswordConfirm("");
    setNick("");
    setSchoolLevel(hasStoredLearningPath() ? loadLearningPath() : "");
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

    if (!supabaseReady) {
      setIsError(true);
      setMessage("Logowanie jest obecnie niedostępne. Spróbuj ponownie później.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        try {
          await ensureUserProfile(data.user);
        } catch {
          /* sesja OK - profil naprawi navbar; i tak idziemy na stronę główną */
        }
      }

      router.replace("/");
    } catch (err) {
      setIsError(true);
      setNeedsConfirm(
        (err as Error)?.message?.includes("Email not confirmed") ?? false,
      );
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

    if (!supabaseReady) {
      setIsError(true);
      setMessage("Rejestracja jest obecnie niedostępna. Spróbuj ponownie później.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabase();
      const trimmedEmail = email.trim();
      const normalizedNick = normalizeNick(nick);

      try {
        if (await isNickTaken(normalizedNick)) {
          setIsError(true);
          setMessage("Ten nick jest już zajęty!");
          return;
        }
      } catch (nickCheckError) {
        if (!isSupabaseNetworkError(nickCheckError)) {
          throw nickCheckError;
        }

        // Sprawdzenie nicku korzysta z PostgREST, a rejestracja z Auth.
        // Chwilowa awaria jednego endpointu nie powinna blokować drugiego.
        console.warn(
          "[szybka-matma] Nie udało się sprawdzić dostępności nicku; kontynuuję rejestrację.",
        );
      }

      const signupResponse = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          nick: normalizedNick,
          schoolLevel: schoolLevel || null,
        }),
      });
      const signupResult = (await signupResponse.json().catch(() => ({}))) as {
        ok?: boolean;
        userId?: string;
        needsConfirmation?: boolean;
        error?: string;
        code?: string;
      };

      if (!signupResponse.ok || !signupResult.ok) {
        setIsError(true);
        setMessage(
          signupResult.error ?? "Nie udało się utworzyć konta. Spróbuj ponownie.",
        );
        return;
      }

      if (signupResult.needsConfirmation && !signupResult.userId) {
        router.push(signupSuccessPath(true));
        return;
      }

      // Powiadomienie administratorów wysyła serwer w /api/signup.

      if (!signupResult.needsConfirmation) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) throw error;
        try {
          const existing = await fetchProfile(data.user.id);
          if (!existing) {
            await createProfile(data.user.id, normalizedNick);
          }
        } catch (profileError) {
          const msg =
            profileError instanceof Error ? profileError.message : "";
          if (msg.includes("unique") || msg.includes("duplicate")) {
            setIsError(true);
            setMessage("Ten nick jest już zajęty!");
            return;
          }
          // Konto istnieje, a profil utworzy trigger w bazie lub navbar.
          console.warn("[szybka-matma] profil po rejestracji:", profileError);
        }

        // Stały URL sukcesu - do pomiaru konwersji (Google Ads).
        router.push(signupSuccessPath(false));
        router.refresh();
        return;
      }

      // Konto utworzone, czeka na potwierdzenie e-mail - profil utworzy trigger w bazie.
      // Osobny URL sukcesu (z ?confirm=1), żeby Ads mogło mierzyć rejestrację.
      router.push(signupSuccessPath(true));
      return;
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
            className="rounded-3xl border border-accent/20 bg-surface/95 p-6 shadow-2xl shadow-accent/20 backdrop-blur-sm sm:p-8"
          >
            <p className="text-center text-sm font-bold uppercase tracking-widest text-accent">
              Logowanie
            </p>
            <h1 className="mt-2 text-center text-3xl font-black text-foreground sm:text-4xl">
              Zaloguj się do{" "}
              <span className="text-gradient-brand">Szybkiej Matematyki</span>
            </h1>
            <p className="mt-3 text-center text-sm text-muted">
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
                  className={`${inputClassName} focus:border-accent/50 focus:ring-accent/20`}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted">
                  Hasło
                </span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="twoje hasło"
                  className={`${inputClassName} focus:border-accent/50 focus:ring-accent/20`}
                />
              </label>

              <p className="-mt-1 text-right">
                <Link
                  href="/login/zapomniane-haslo"
                  className="text-xs font-semibold text-accent/90 transition-colors hover:text-accent"
                >
                  Zapomniałeś hasła?
                </Link>
              </p>

              {message && (
                <Alert message={message} isError={isError} />
              )}
              {needsConfirm && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void handleResendConfirmation()}
                  className="rounded-2xl border border-accent/40 px-4 py-3 text-sm font-bold text-accent transition hover:bg-accent/10 disabled:opacity-50"
                >
                  Wyślij link potwierdzający ponownie
                </button>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-chunky mt-2 flex min-h-[52px] w-full items-center justify-center text-lg disabled:opacity-60"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "Logowanie…" : "Zaloguj się"}
              </motion.button>

              <motion.button
                type="button"
                disabled={loading}
                onClick={switchToSignup}
                className="flex min-h-[52px] items-center justify-center rounded-2xl border border-surface-border bg-background text-lg font-black text-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 disabled:opacity-60"
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
            className="relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-b from-surface via-surface to-background p-6 shadow-2xl shadow-accent/20 backdrop-blur-sm sm:p-8"
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
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
              <p className="mt-2 text-sm font-bold uppercase tracking-widest text-accent/90">
                Nowe konto
              </p>
              <h1 className="mt-2 text-3xl font-black text-foreground sm:text-4xl">
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
                <span className="text-xs font-bold uppercase tracking-wide text-accent/80">
                  Nick
                </span>
                <input
                  type="text"
                  name="nick"
                  autoComplete="username"
                  required
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  placeholder="np. KasiaM"
                  maxLength={20}
                  className={`${inputClassName} focus:border-accent/50 focus:ring-accent/20`}
                />
              </label>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="signup-school-class"
                  className="text-xs font-bold uppercase tracking-wide text-accent/80"
                >
                  Poziom nauki (opcjonalnie)
                </label>
                <SchoolClassPicker
                  id="signup-school-class"
                  value={schoolLevel}
                  onChange={setSchoolLevel}
                  className="w-full"
                  optional
                />
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-accent/80">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="twoj@email.pl"
                  className={`${inputClassName} focus:border-accent/50 focus:ring-accent/20`}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-accent/80">
                  Hasło
                </span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="minimum 6 znaków"
                  className={`${inputClassName} focus:border-accent/50 focus:ring-accent/20`}
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
                  className={`${inputClassName} focus:border-accent/50 focus:ring-amber-500/20`}
                />
              </label>

              {message && (
                <Alert message={message} isError={isError} />
              )}
              {needsConfirm && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void handleResendConfirmation()}
                    className="rounded-2xl border border-accent/40 px-4 py-3 text-sm font-bold text-accent transition hover:bg-accent/10 disabled:opacity-50"
                  >
                    Wyślij link potwierdzający ponownie
                  </button>
                  <Link
                    href="/login/zapomniane-haslo"
                    className="text-center text-sm font-semibold text-accent hover:underline"
                  >
                    Zapomniałem hasła
                  </Link>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-chunky mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 text-lg disabled:opacity-60"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "Tworzenie konta…" : "Utwórz konto"}
              </motion.button>

              <button
                type="button"
                disabled={loading}
                onClick={switchToLogin}
                className="text-center text-sm font-semibold text-muted transition-colors hover:text-accent disabled:opacity-50"
              >
                Masz już konto?{" "}
                <span className="text-accent">Zaloguj się</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-sm text-muted">
        <Link
          href="/"
          className="font-semibold text-muted transition-colors hover:text-accent"
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
          : "border border-success/30 bg-success/10 text-success"
      }`}
      role="alert"
    >
      {message}
    </p>
  );
}
