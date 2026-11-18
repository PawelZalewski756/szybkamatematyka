# Stripe webhook — naprawa i ponowne włączenie

## Dlaczego Stripe wyłączył endpoint

Stripe wyłącza webhook po kilku dniach błędów (5xx, timeouty, brak profilu).
W naszym kodzie były dwa źródła błędów:

1. **Brak profilu użytkownika** — `applyPatch` rzucał 500, gdy `profiles`
   nie miało wiersza dla `auth.users` (np. trigger nie zadziałał).
   Teraz webhook tworzy minimalny profil i zapisuje subskrypcję.
2. **Telegram blokował odpowiedź** — powiadomienie o zakupie było `await`
   w webhooku. Wolny Telegram potrafił przekroczyć limit czasu Vercel.
   Teraz powiadomienie leci w tle, a Stripe dostaje 200 od razu.

Endpoint nigdy nie powinien odpowiadać 5xx przy poprawnym podpisie i
istniejącym użytkowniku.

## Najważniejsze: adres z `www`

Produkcja przekierowuje `https://szybkamatematyka.pl` → `https://www.szybkamatematyka.pl`
(308). Stripe nie powinien dostawać przekierowania na webhooku. W Stripe ustaw
adres **z `www`**:

```
https://www.szybkamatematyka.pl/api/stripe/webhook
```

To była przyczyna 100% błędów: endpoint na apexie dostawał 308, zamiast
przyjąć podpisany POST.

## Co ustawić w Vercel

W **Project → Settings → Environment Variables** (Production):

- `STRIPE_SECRET_KEY` — klucz **live** `sk_live_...`,
- `STRIPE_WEBHOOK_SECRET` — **live** signing secret endpointu
  `https://www.szybkamatematyka.pl/api/stripe/webhook` (`whsec_...`),
- `SUPABASE_SERVICE_ROLE_KEY` — klucz `service_role`,
- `NEXT_PUBLIC_SUPABASE_URL`,
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Po zmianie env zrób **Redeploy**. Bez `SUPABASE_SERVICE_ROLE_KEY` webhook
zwraca 503 i Stripe znów go wyłączy.

## Co zrobić w Stripe

1. Stripe Dashboard → **Developers → Webhooks**.
2. Wybierz endpoint `https://www.szybkamatematyka.pl/api/stripe/webhook`.
3. Kliknij **Enable** (Stripe go wyłączył).
4. Sprawdź zdarzenia:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Skopiuj **Signing secret** i porównaj z `STRIPE_WEBHOOK_SECRET`.
   To musi być sekret **live**, nie testowy.
6. Użyj **Send test event** lub **Resend** dla ostatnich błędów.
   Oczekiwany status: **200**.

## Weryfikacja

Otwórz:

```
https://szybkamatematyka.pl/api/health
```

Powinno być:

```json
{
  "integrations": {
    "stripe": true,
    "stripeWebhook": true,
    "supabaseServiceRole": true
  }
}
```

W Stripe → Webhooks → endpoint → **Events** każde zdarzenie powinno mieć
status 200. W Vercel → Functions → Logs szukaj `[stripe-webhook]`; nie powinno
być `Zapis subskrypcji nieudany` ani `Profil nie istnieje`.

## Gdy dalej 500

Sprawdź w logach Vercel dokładny `[stripe-webhook]`:

- `Brak SUPABASE_SERVICE_ROLE_KEY` → dodaj env i redeploy,
- `Nieprawidłowy podpis` → zły `STRIPE_WEBHOOK_SECRET` (test vs live),
- `Brak użytkownika auth` → subskrypcja dotyczy usuniętego konta; webhook
  kończy 200, nie blokuje kolejnych zdarzeń,
- błąd PostgREST → uruchom migracje z `supabase/migrations` (albo SQL Editor
  bundle `supabase/sql-editor/2026-11-18-all-fixes-and-grant-pro.sql`).
