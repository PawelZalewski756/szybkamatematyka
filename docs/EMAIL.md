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

## Polskie szablony maili

Supabase Dashboard > Authentication > Email Templates. Wklej zawartosc plikow z docs/email-templates/:

- Confirm signup: confirmation.html, temat: Potwierdz swoj adres e-mail - Szybka Matematyka
- Reset Password: recovery.html, temat: Reset hasla - Szybka Matematyka

## Powiadomienia Telegram

Nowe konto i nowy zakup wysylaja wiadomosc na Telegram do adminow. Wymagane zmienne na Vercelu: TELEGRAM_BOT_TOKEN i TELEGRAM_ADMIN_IDS (lub ADMIN_TELEGRAM_ID). Zakup: webhook Stripe musi dzialac.

## Zgłoszenia błędów (Resend)

Formularz „Zgłoś błąd” w stopce wysyła zgłoszenie przez Resend na adres
`BUG_REPORT_TO` (domyślnie kontakt@szybkamatematyka.pl). Wymagane zmienne:
`RESEND_API_KEY`, `BUG_REPORT_TO` i `BUG_REPORT_FROM`. Dopóki domena nie jest
zweryfikowana w Resend, odbiorcą musi być adres właściciela konta, a nadawcą
`Szybka Matematyka <onboarding@resend.dev>`. Po dodaniu rekordów SPF i DKIM
można użyć dowolnego adresu w domenie. Szczegóły w `docs/DEPLOY.md`.

## Przeprosiny za zgłoszenie błędu (Resend)

Po zgłoszeniu błędu użytkownik może dostać mail z przeprosinami i informacją
o miesiącu Pro. Szablon:

- [`docs/email-templates/przeprosiny-zgloszenie-bledu.md`](./email-templates/przeprosiny-zgloszenie-bledu.md)
- [`docs/email-templates/przeprosiny-zgloszenie-bledu.html`](./email-templates/przeprosiny-zgloszenie-bledu.html)

Wysyłka (wymaga `RESEND_API_KEY`; nadawca z `BUG_REPORT_FROM` lub
`WELCOME_EMAIL_FROM`):

```bash
BUG_REPORTER_EMAILS="adres1@example.com,adres2@example.com" \
  npx tsx scripts/sendBugReportApology.ts --send
```

Podgląd bez wysyłki:

```bash
npx tsx scripts/sendBugReportApology.ts --dry-run
```

Pro przyznane ręcznie ma `pro_source = 'gift'`; nie tworzy subskrypcji Stripe,
więc użytkownik nie może jej anulować. Po 30 dniach dostęp wygasa
automatycznie (RPC `get_my_subscription` zwraca wtedy `free`).
