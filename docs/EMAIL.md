# Potwierdzanie e-mail i wysyłka z kontakt@szybkamatematyka.pl (Zoho Mail)

Aplikacja wymaga potwierdzenia adresu e-mail. Maile wysyła Supabase Auth przez
SMTP Zoho, więc nadawcą jest kontakt@szybkamatematyka.pl, a limit wbudowanego
mailera Supabase nie obowiązuje.

## 1. Zoho Mail

1. Skrzynka `kontakt@szybkamatematyka.pl` musi istnieć w Zoho, a domena mieć
   zweryfikowane rekordy MX, SPF i DKIM (Zoho Mail Admin Console -> Domains ->
   Email Configuration). Bez SPF/DKIM maile trafią do spamu.
2. Włącz dostęp SMTP: Settings -> Mail Accounts -> SMTP (zwykle włączony).
3. Jeśli konto ma 2FA, utwórz **hasło aplikacji**: accounts.zoho.eu (lub .com)
   -> Security -> App Passwords. Użyj go jako hasła SMTP.
4. Host zależy od regionu konta: `smtp.zoho.eu` (Europa) lub `smtp.zoho.com`.

## 2. Supabase -> Authentication

- **Sign In / Providers -> Email:** włącz **Confirm email**.
- **Emails -> SMTP Settings -> Enable Custom SMTP:**
  - Sender email: `kontakt@szybkamatematyka.pl`
  - Sender name: `Szybka Matematyka`
  - Host: `smtp.zoho.eu`, Port: `465`
  - Username: `kontakt@szybkamatematyka.pl`
  - Password: hasło aplikacji (lub hasło skrzynki)
- **URL Configuration:** Site URL = `https://szybkamatematyka.pl`; w Redirect URLs
  dodaj `https://szybkamatematyka.pl/**`.
- **Emails -> Templates:** przetłumacz szablony (Confirm signup, Reset password).
- **Rate Limits:** podnieś limit maili na godzinę. Zoho ma własne limity
  dzienne (ok. 500 wiadomości), więc przy większym ruchu rozważ dostawcę
  transakcyjnego (Resend, Brevo).

## 3. Zmienne środowiskowe (Vercel)

`NEXT_PUBLIC_SITE_URL=https://szybkamatematyka.pl`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Jak to działa

`POST /api/signup` wywołuje `auth.signUp`, Supabase wysyła link, a logowanie
przed kliknięciem zwraca "Email not confirmed" (strona logowania oferuje
ponowne wysłanie linku).
