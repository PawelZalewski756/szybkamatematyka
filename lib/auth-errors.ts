import type { AuthError } from "@supabase/supabase-js";
import { containsProfanity } from "@/lib/profanity";
import { formatSupabaseErrorForUser } from "@/lib/supabase/errors";

export function validateAuthInput(email: string, password: string): string | null {
  const emailError = validateEmailInput(email);
  if (emailError) return emailError;

  if (!password) {
    return "Podaj hasło.";
  }

  if (password.length < 6) {
    return "Hasło musi mieć co najmniej 6 znaków.";
  }

  return null;
}

export function validateEmailInput(email: string): string | null {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return "Podaj adres e-mail.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return "Podaj poprawny adres e-mail (np. jan.kowalski@gmail.com).";
  }

  return null;
}

export function validatePasswordResetInput(
  password: string,
  passwordConfirm: string,
): string | null {
  if (!password) {
    return "Podaj nowe hasło.";
  }

  if (password.length < 6) {
    return "Hasło musi mieć co najmniej 6 znaków.";
  }

  if (!passwordConfirm) {
    return "Powtórz hasło w drugim polu.";
  }

  if (password !== passwordConfirm) {
    return "Hasła nie są takie same — wpisz je ponownie.";
  }

  return null;
}

export function validateNick(nick: string): string | null {
  const trimmed = nick.trim();

  if (!trimmed) {
    return "Podaj nick.";
  }

  if (trimmed.length < 3) {
    return "Nick musi mieć co najmniej 3 znaki.";
  }

  if (trimmed.length > 20) {
    return "Nick może mieć maksymalnie 20 znaków.";
  }

  if (containsProfanity(trimmed)) {
    return "Nick nie może zawierać wulgarnych słów.";
  }

  if (!/^[a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(trimmed)) {
    return "Nick może zawierać tylko litery, cyfry i podkreślnik.";
  }

  return null;
}

export function validateSignupInput(
  email: string,
  password: string,
  passwordConfirm: string,
  nick: string,
): string | null {
  const nickError = validateNick(nick);
  if (nickError) return nickError;

  const baseError = validateAuthInput(email, password);
  if (baseError) return baseError;

  if (!passwordConfirm) {
    return "Powtórz hasło w drugim polu.";
  }

  if (password !== passwordConfirm) {
    return "Hasła nie są takie same — wpisz je ponownie.";
  }

  return null;
}

export function getAuthErrorMessage(error: AuthError | Error): string {
  const message = error.message;

  if (message.includes("Anonymous sign-ins are disabled")) {
    return "Brakuje e-maila lub hasła — uzupełnij oba pola (nie zostawiaj pustych).";
  }

  if (message.includes("Invalid login credentials")) {
    return "Zły e-mail lub hasło. Sprawdź dane albo załóż konto.";
  }

  if (message.includes("User already registered")) {
    return "Ten e-mail jest już zarejestrowany. Zaloguj się.";
  }

  if (message.includes("Signups not allowed")) {
    return "Rejestracja jest wyłączona w Supabase. Włącz ją w Authentication → Providers → Email.";
  }

  if (
    message.includes("Invalid API key") ||
    message.includes("Project not found") ||
    message.includes("supabaseUrl is required") ||
    message.includes("supabaseKey is required")
  ) {
    return "Logowanie jest źle skonfigurowane na serwerze. Ustaw zmienne Supabase przed zbudowaniem aplikacji.";
  }

  if (
    message.includes("redirect") ||
    message.includes("Redirect URL") ||
    message.includes("not allowed")
  ) {
    return "Adres przekierowania logowania nie jest dozwolony w Supabase. Dodaj domenę aplikacji w Authentication → URL Configuration.";
  }

  if (message.includes("Database error saving new user")) {
    return "Błąd bazy przy rejestracji — w Supabase uruchom plik supabase/profiles.sql (SQL Editor), potem spróbuj ponownie.";
  }

  if (message.includes("Email not confirmed")) {
    return "Potwierdź e-mail (link z wiadomości), a potem się zaloguj.";
  }

  if (
    message.includes("For security purposes") ||
    message.includes("rate limit") ||
    message.includes("only request this after")
  ) {
    return "Poczekaj chwilę przed kolejną próbą wysłania linku.";
  }

  if (message.includes("Password should be at least")) {
    return "Hasło musi mieć co najmniej 6 znaków.";
  }

  if (
    message.includes("duplicate key") ||
    message.includes("profiles_nick") ||
    message.includes("profiles_nickname") ||
    message.includes("nickname") ||
    message.includes("unique")
  ) {
    return "Ten nick jest już zajęty!";
  }

  if (
    message.includes('null value in column "nickname"') ||
    message.includes('null value in column "nick"')
  ) {
    return "Błąd profilu — uruchom profiles.sql w Supabase, potem wyloguj się i zaloguj ponownie.";
  }

  if (message.includes("row-level security")) {
    return "Brak uprawnień do zapisu profilu. Uruchom ponownie skrypt SQL (profiles.sql) w Supabase.";
  }

  if (message.includes("already registered") || message.includes("already been registered")) {
    return "Ten e-mail jest już zarejestrowany. Zaloguj się.";
  }

  return formatSupabaseErrorForUser(message);
}
