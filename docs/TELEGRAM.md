# Telegram: powiadomienia o nowych kontach

Bot wysyła administratorom wiadomość po każdej nowej rejestracji. Ten dokument
zbiera konfigurację i najczęstsze przyczyny „nie dostaję powiadomień”.

## 1. Wymagane zmienne

Ustaw w Vercel → Project Settings → Environment Variables (Production **i**
Preview, jeśli testujesz na preview):

| Zmienna | Wymagana | Opis |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | tak | Token z BotFather, np. `123456789:AA...`. Bez prefiksu `bot`. |
| `TELEGRAM_ADMIN_IDS` | tak | Numeryczne ID czatu prywatnego, po przecinku, np. `111111111,222222222`. |
| `SUPABASE_SERVICE_ROLE_KEY` | opcjonalnie | Potrzebny do idempotencji i backfillu. Sama wysyłka działa też bez niego. |
| `NEXT_PUBLIC_SUPABASE_URL` | tak | URL projektu Supabase. |
| `TELEGRAM_WEBHOOK_SECRET` | dla komend bota | Sekret webhooka Telegrama. |
| `TELEGRAM_SETUP_SECRET` | jednorazowo | Bearer do `POST /api/telegram/setup`. |
| `TELEGRAM_SIGNUP_SECRET` | opcjonalnie | Sekret dla `POST /api/telegram/signup-notification` (backfill). |

## 2. Najważniejsze: administrator musi napisać `/start`

Telegram nie pozwala botowi rozpocząć rozmowy z użytkownikiem. Każdy odbiorca
musi **pierwszy** wysłać botowi `/start` na prywatnym czacie. Dopiero wtedy
`sendMessage` zwróci `200`. Bez tego dostaniesz `403 Forbidden: bot can't
initiate conversation with a user`.

To jest najczęstsza przyczyna braku powiadomień - kod działa, ale Telegram
odrzuca wiadomość.

## 3. Sprawdzenie krok po kroku

1. Wejdź na `/admin/telegram` (jako administrator).
2. Kliknij **Sprawdź konfigurację**:
   - ✅ przy `TELEGRAM_BOT_TOKEN` i `TELEGRAM_ADMIN_IDS`,
   - ✅ przy `@nazwa_bota`,
   - ✅ przy webhooku (jeśli używasz komend).
3. Kliknij **Wyślij testową wiadomość**:
   - jeśli dojdzie - powiadomienia o rejestracji też zadziałają,
   - jeśli nie - zobaczysz dokładny błąd Telegrama (403, 400, 401).

## 4. Najczęstsze błędy

| Objaw | Przyczyna | Rozwiązanie |
| --- | --- | --- |
| Brak wiadomości, brak błędu w UI | Brak `TELEGRAM_BOT_TOKEN` lub `TELEGRAM_ADMIN_IDS` | Uzupełnij env w Vercel i zrób redeploy |
| `403 bot can't initiate conversation` | Administrator nie napisał `/start` | Napisz `/start` do bota na prywatnym czacie |
| `400 chat not found` | Złe `TELEGRAM_ADMIN_IDS` (np. username zamiast ID) | Użyj numerycznego ID czatu |
| `401 Unauthorized` | Zły token / token z prefiksem `bot` | Wklej token z BotFather; kod i tak usuwa prefiks `bot` |
| Powiadomienie nie dochodzi, a test działa | Stary kod wymagał `SUPABASE_SERVICE_ROLE_KEY` do odczytu użytkownika | Zaktualizowany `/api/signup` przekazuje dane użytkownika bezpośrednio; service role nie jest już potrzebny do wysyłki |
| Brak powiadomień po wdrożeniu | Zmienne ustawione tylko dla Preview | Ustaw też dla Production i zrób redeploy |

## 5. Jak to działa w kodzie

- `app/api/signup/route.ts` tworzy konto przez Supabase i **przed odpowiedzią**
  woła `deliverSignupNotification` z danymi nowego użytkownika. `after()` było
  zbyt często przerywane przez Vercel, więc powiadomienia ginęły.
- `lib/telegram/signup-delivery.ts` buduje treść, pilnuje idempotencji
  (`signup_notification_deliveries`) i wysyła wiadomość przez
  `lib/telegram/send.ts`.
- `lib/telegram/send.ts` normalizuje token, woła `sendMessage` i zwraca
  czytelny błąd zamiast rzucać wyjątkiem.
- `POST /api/telegram/signup-notification` służy do ponowienia/backfillu. Jest
  chroniony sekretem `TELEGRAM_SIGNUP_SECRET` albo sesją administratora.
- `POST /api/telegram/diagnostics` (admin) sprawdza `getMe`, `getWebhookInfo`
  i opcjonalnie wysyła test.

## 6. Backfill i cron

Główne powiadomienie idzie od razu z `/api/signup`. Dodatkowo
`GET /api/telegram/sync-signups` (Vercel Cron co 15 min) dosyła powiadomienia
dla kont z ostatnich 7 dni. Idempotencja jest w
`signup_notification_deliveries`, więc nie ma duplikatów. Cron wymaga
`CRON_SECRET`.

## 7. Diagnostyka `/solved`

```text
/solved
```

Pokazuje, ile wierszy jest w `solved_tasks`, ilu uczniów ma rozwiązania i top 10.
Jeśli wynik to **0**:

- użytkownicy nie są zalogowani (gość zapisuje tylko lokalnie),
- albo inserty do `solved_tasks` są odrzucane (RLS / brak migracji).

`/users` liczy teraz tym samym agregatorem co `/admin/analityka`
(`fetchSolvedStats`), więc liczby powinny się zgadzać.

## 8. Komenda `/pro` - ręczne Pro

Administrator może przyznać Pro z Telegrama:

```text
/pro <nick|email> [dni] [powód]
```

Przykłady:

```text
/pro vlad 30 rekompensata za zgłoszenie błędu
/pro uczen@example.com 30 prezent od administracji
/pro vlad
```

Zasady:

- domyślnie **30 dni**,
- `pro_source = 'gift'`, bez subskrypcji Stripe (nie da się jej anulować),
- nie nadpisuje aktywnego płatnego Pro Stripe,
- istniejący gift wydłuża od obecnej daty końca,
- nick jest wyszukiwany bez rozróżniania wielkości liter,
- e-mail jest wyszukiwany w `auth.users`.

Komenda działa tylko dla adminów z `TELEGRAM_ADMIN_IDS` na prywatnym czacie.
