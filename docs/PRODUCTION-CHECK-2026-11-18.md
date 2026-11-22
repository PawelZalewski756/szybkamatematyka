# Kontrola produkcji - 18.11.2026

Strona: `https://www.szybkamatematyka.pl`

## Zdrowie integracji

`GET /api/health` (przez `www`, bo apex robi 308):

```json
{
  "supabase": true,
  "stripe": true,
  "stripeWebhook": true,
  "supabaseServiceRole": true,
  "resend": true,
  "gemini": true,
  "telegram": true
}
```

## Trening

- Egzamin ósmoklasisty: **58 tematów / 58 aktywnych**.
- Matura podstawowa: **76 tematów / 76 aktywnych**.
- Wyszukiwanie „funkcja kwadratowa”: 1 wynik.
- Wszystkie 134 strony tematów sprawdzone na produkcji:
  - 125 OK,
  - 7 stron to zadania otwarte (mają pole „Twoja odpowiedź”, nie 4 opcje) - to poprawne,
  - 2 strony miały data-URI SVG z nawiasami (`url(#clip)`, `(-1,-3)`), które
    rozsadzało layout. Naprawione w `2791f2b` (parser zagnieżdżonych nawiasów).

## Zgłoszone zadania

Odczytane z produkcyjnego Supabase:

| ID | correct_answer |
|---|---|
| `b11b2734...` | 81 |
| `34c8fcc8...` | 33 |
| `ba4f578a...` | 19 |
| `9424496e...` | 18 |

## Wydajność

TTFB (curl, `www`):

- `/` - ~0,09 s
- `/trening` - ~0,10 s
- `/baza-zadan` - ~0,44 s
- `/minigry` - ~0,43 s
- `/cennik` - ~0,51 s

Sweep 134 stron: 0 stron wolniejszych niż 5 s, 0 błędów konsoli.

## Stripe - dlaczego 100% błędów

Endpoint w Stripe: `https://szybkamatematyka.pl/api/stripe/webhook` (apex).
Produkcja przekierowuje apex → `www` kodem **308**. Stripe nie powinien
dostawać przekierowania na webhooku.

**Poprawka:** w Stripe zmień Destination na:

```
https://www.szybkamatematyka.pl/api/stripe/webhook
```

Sekret podpisu zostaje ten sam; jeśli nie - skopiuj nowy do
`STRIPE_WEBHOOK_SECRET` i zrób Redeploy. Potem wyślij test event / resend;
oczekiwane 200.

## Telegram / Pro

- Endpoint `GET /api/telegram/sync-signups` odpowiada 401 bez sekretu - wdrożony.
- Health: `telegram: true`.
- Pro: prywatne kolumny `profiles` nie są dostępne przez anon key; weryfikacja
  w SQL Editor zapytaniem z `docs/zgloszenia-2026-11-18.md`.

## Co wymaga wdrożenia

- `2791f2b` - parser data-URI (2 strony z overflow).
- `1662f5c` - webhook Stripe (brak profilu nie daje 500, Telegram nie blokuje).
- `fc3f75c`, `bc7d156` - dokumentacja i cron 15 min (Pro).

Po pushu i Redeploy powtórz sweep oraz test webhooka.
