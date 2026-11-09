# Potwierdzanie e-mail i wysyłka z kontakt@szybkamatematyka.pl

Aplikacja wymaga potwierdzenia adresu e-mail. Maile wysyła Supabase Auth przez
własny SMTP, więc nadawcą jest kontakt@szybkamatematyka.pl, a limit wbudowanego
mailera (kilka maili na godzinę) nie obowiązuje.

## 1. Dostawca SMTP (np. Resend)

1. Załóż konto na resend.com i dodaj domenę `szybkamatematyka.pl`.
2. W DNS domeny dodaj rekordy SPF, DKIM (i opcjonalnie DMARC) podane przez Resend,
   poczekaj na status "Verified". Bez tego maile trafią do spamu.
3. Utwórz klucz API (to hasło SMTP).

## 2. Supabase -> Authentication

- **Sign In / Providers -> Email:** włącz **Confirm email**.
- **Emails -> SMTP Settings -> Enable Custom SMTP:**
  - Sender email: `kontakt@szybkamatematyka.pl`
  - Sender name: `Szybka Matematyka`
  - Host: `smtp.resend.com`, Port: `465`
  - Username: `resend`, Password: klucz API
- **URL Configuration:** Site URL = `https://szybkamatematyka.pl`; w Redirect URLs
  dodaj `https://szybkamatematyka.pl/**`.
- **Emails -> Templates:** przetłumacz szablony (Confirm signup, Reset password).
- **Rate Limits:** po włączeniu własnego SMTP podnieś limit maili na godzinę.

## 3. Zmienne środowiskowe (Vercel)

`NEXT_PUBLIC_SITE_URL=https://szybkamatematyka.pl`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Jak to działa

`POST /api/signup` wywołuje `auth.signUp`, Supabase wysyła link, a logowanie
przed kliknięciem zwraca "Email not confirmed" (strona logowania oferuje
ponowne wysłanie linku).
