import { LoginPageClient } from "./LoginPageClient";

type LoginPageProps = {
  searchParams: Promise<{ mode?: string; ref?: string }>;
};

/**
 * Rejestracja i logowanie dzielą jeden ekran, ale źródłem prawdy o pierwszym
 * widoku jest URL: `?mode=signup` (linki „Załóż konto") i `?ref=` (polecenia)
 * od razu renderują rejestrację po stronie serwera - bez migotania logowania
 * i bez przeskoku animacji po hydratacji.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { mode, ref } = await searchParams;
  const wantsSignup = mode === "signup" || mode === "register" || Boolean(ref);

  return (
    <LoginPageClient
      key={wantsSignup ? "signup" : "login"}
      initialView={wantsSignup ? "signup" : "login"}
    />
  );
}
