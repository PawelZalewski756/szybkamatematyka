# Program poleceń

## Zasady

1. Użytkownik ma w profilu link `https://szybkamatematyka.pl/login?ref=KOD`.
2. Zaproszony klika link, kod zapisuje się w `localStorage` na 30 dni.
3. Przy rejestracji kod trafia do metadanych konta (`referral_code`).
4. Po potwierdzeniu e-maila powstaje wpis `pending` w `public.referrals`.
5. Cron kwalifikuje wpis, gdy konto zaproszonego:
   - ma potwierdzony e-mail,
   - ma co najmniej 7 dni,
   - rozwiązało co najmniej 3 zadania (`solved_tasks`).
6. Za 2 zakwalifikowane osoby zapraszający dostaje **30 dni Pro**.
   Nagroda jest **raz na konto** (`profiles.referral_rewarded_at`).

Sam e-mail nie jest barierą (temp-mail), dlatego nagroda wymaga realnej
aktywności. Lista znanych domen jednorazowych jest tylko dodatkowym filtrem
(`lib/auth/disposable-email-domains.ts`).

## Baza danych

Migracja: `supabase/migrations/20261119090000_add_referrals.sql`.

- `profiles.referral_code` - 12 znaków, unikalny, generowany domyślnie.
- `profiles.referral_rewarded_at` - data odebrania nagrody.
- `public.referrals` - `referrer_id`, `invited_user_id` (unikalny),
  `status` (`pending` / `qualified` / `rewarded` / `rejected`), znaczniki czasu.
- Triggery na `auth.users` tworzą wpis po potwierdzeniu e-maila.
- `get_my_referral_stats()` - liczniki dla karty w profilu (bez danych
  zaproszonych osób).
- `qualify_referrals()` - uruchamiane przez cron.
- `grant_referral_reward()` - nadaje Pro i oznacza wpisy jako `rewarded`.

RLS: użytkownik widzi tylko własne polecenia; zapis wyłącznie przez funkcje
`security definer`.

## Cron

`GET /api/cron/referrals` (Vercel Cron, codziennie 03:20 UTC).

Autoryzacja: `Authorization: Bearer $CRON_SECRET` albo sesja administratora.
Ręcznie:

```bash
npm run referrals:qualify
```

## Zmienne środowiskowe

- `SUPABASE_SERVICE_ROLE_KEY` - potrzebny do cronu i skryptu ręcznego.
- `CRON_SECRET` - wspólny dla cronów Telegram i poleceń.

## Testowanie

- Testy jednostkowe: `tests/referral.test.ts`.
- E2E: `e2e/referral.spec.ts` (link `?ref`, przekazanie kodu do API,
  odrzucenie temp-maila).
- Ręczny test triggera na stagingu: utwórz konto z linku, potwierdź e-mail,
  dodaj 3 wiersze w `solved_tasks` dla zaproszonego, ustaw jego
  `created_at`/`confirmed_at` na 8 dni wstecz, uruchom `npm run referrals:qualify`.

## Anty-abuse

- jedna nagroda na konto, maks. 2 zakwalifikowane osoby do nagrody,
- wymóg aktywności i czasu (temp-mail nic nie daje),
- brak self-referral (także po kodzie),
- limit 10 rejestracji/godzinę/IP,
- lista domen jednorazowych,
- aktywne Pro Stripe nie jest nadpisywane - nagroda czeka, aż subskrypcja
  przestanie być aktywna.
