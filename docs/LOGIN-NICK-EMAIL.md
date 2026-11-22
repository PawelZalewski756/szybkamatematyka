# Logowanie nickiem lub e-mailem

## Jak działa

- Pole „Nick lub e-mail” przyjmuje oba identyfikatory.
- E-mail: bezpośrednio `supabase.auth.signInWithPassword`.
- Nick: `POST /api/auth/login` tłumaczy nick na e-mail przez `service_role`
  i dopiero potem loguje. Klient dostaje tylko tokeny sesji - **e-mail nie jest
  wysyłany do przeglądarki**.
- Nick jest wyszukiwany w `profiles.nick` / `profiles.nickname` bez względu na
  wielkość liter.
- Błędny nick i błędne hasło dają ten sam komunikat
  „Nieprawidłowy nick/e-mail lub hasło.”, żeby nie ujawniać, czy konto istnieje.

## Wymagania

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
- `SUPABASE_SERVICE_ROLE_KEY` (tylko serwer) - bez niego logowanie nickiem
  zwraca 503; logowanie e-mailem nadal działa.
- Konto musi mieć potwierdzony e-mail (Supabase Auth).

## Bezpieczeństwo

- limit 10 prób / 10 minut na IP (`lib/security/rate-limit.ts`),
- Supabase Auth ma własne limity,
- endpoint nie zwraca e-maila ani informacji o istnieniu nicku,
- `Cache-Control: no-store`.

## Testy

- `tests/login-identifier.test.ts` - nick, e-mail, nieznany nick, złe hasło.
- `npm test -- --run tests/login-identifier.test.ts`.
