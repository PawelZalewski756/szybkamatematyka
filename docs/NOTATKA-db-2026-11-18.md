# NOTATKA: rozwiązania `zadania.rozwiazanie` tylko dla service_role

> **Status: branch WIP, NIE mergeować bez testu na stagingu.**
> Branch: `chore/zadania-rozwiazania-service-only`
> Data: 17.11.2026

## Co jest na branchu

1. **Migracja** `supabase/migrations/20261117190000_zadania_rozwiazanie_service_only.sql`
   - odbiera `anon` i `authenticated` prawo `SELECT` na całej tabeli `zadania`,
   - nadaje im `SELECT` tylko na kolumnach katalogu (`id, arkusz_id,
     numer_zadania, dzial, tresc, created_at`),
   - zostawia `service_role` pełny odczyt.
   - Polityki RLS zostają bez zmian - kolumny pilnuje grant, wiersze polityka.

2. **Nowy moduł serwerowy** `lib/supabase/zadania-solutions-server.ts`
   - `fetchZadaniaWithSolutions` czyta kluczem `service_role`
     (`getServiceSupabaseOrNull`), a nie anon,
   - przeniesiony z `lib/supabase/baza-zadan.ts`, bo tamten moduł trafia do
     bundla klienta (`BazaZadanView`) - import service role do klienta byłby błędem.

3. **Endpointy**
   - `/api/trening/cms-solution` korzysta z service role (503 przy braku klucza),
   - `/api/trening/arkusz-solutions` korzysta z nowego modułu.

4. **Testy**
   - `tests/cms-solution-route.test.ts`: nowy test 503 + sprawdzenie, że czytamy
     service rolem,
   - `tests/arkusz-solutions-route.test.ts`: mock nowego modułu.

## Czego NIE da się sprawdzić lokalnie

- Czy baza produkcyjna ma granty w stanie oczekiwanym (lokalnie brak
  `.env.local` i Supabase).
- Czy PostgREST poprawnie obsługuje `select` po kolumnach po `revoke` (teoria
  mówi tak; praktyka wymaga jednego curl-a).
- Czy jakiś **nieznany** ekran nie czyta `rozwiazanie` anonem. Grep po repo
  znalazł tylko dwa miejsca (oba naprawione), ale w bazie mogą być inne
  klienty (bot Telegram? skrypty seed używają service role - OK).

## Jak wdrożyć (kolejność ma znaczenie)

1. Wdróż **kod** z tego brancha (endpointy z service role).
2. Ustaw `SUPABASE_SERVICE_ROLE_KEY` w środowisku produkcyjnym (już jest
   wymagane przez Stripe webhook, więc powinno być).
3. Dopiero potem wykonaj migrację (SQL Editor albo CI na `master`).
4. Sprawdź:

   ```bash
   # 1. Anon nie widzi rozwiązań
   curl -s "$SUPABASE_URL/rest/v1/zadania?select=rozwiazanie&limit=1" \
     -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
   # oczekiwane: 42501 / permission denied dla kolumny rozwiazanie

   # 2. Anon widzi treść
   curl -s "$SUPABASE_URL/rest/v1/zadania?select=id,tresc&limit=1" \
     -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
   # oczekiwane: 200 i jedno zadanie

   # 3. Pro dostaje klucz przez API
   curl -s -X POST "$SITE/api/trening/arkusz-solutions" \
     -H "Authorization: Bearer $PRO_TOKEN" -H "content-type: application/json" \
     -d '{"arkuszId":"<uuid-arkusza>"}'
   # oczekiwane: 200 i solutions
   ```

5. Sprawdź w UI: `/arkusze` (karta z kluczem Pro), `/baza-zadan`,
   `/trening/arkusze/<id>`.

## Wycofanie

```sql
grant select on table public.zadania to anon, authenticated;
```

(To przywraca stan sprzed migracji; polityki RLS się nie zmieniają.)

## Co nadal jest otwarte (świadomie poza tym branchem)

| Problem | Dlaczego nie tutaj | Propozycja |
|---|---|---|
| `tasks.correct_answer` czytelne anonem | trening sprawdza odpowiedź **w przeglądarce** (natychmiastowy feedback); odebranie kolumny wymaga przeniesienia sprawdzania do API | osobny branch: `POST /api/trening/check-answer` + optimistic UI |
| `profiles` publiczne (nick, XP, klasa, awatary) | ranking i pojedynki czytają profile u wszystkich | widok `profiles_public` + RPC rankingu; wymaga zmian w 5-6 komponentach |
| Brak idempotencji webhooka Stripe | wymaga tabeli `stripe_events` i zmiany kodu webhooka | osobny branch (mam przygotowany projekt tabeli) |
| Brak zdarzeń lejka (`product_events`) | wymaga migracji + API + panelu admina | P0-13 z planu, po decyzji o narzędziu analityki |
| `\expected` (odpowiedź otwarta) wysyłane do klienta w `/trening/arkusze/[id]` | używane do natychmiastowego sprawdzania i do oceny AI; wymaga API sprawdzania | razem z `tasks.correct_answer` |

## Ryzyko, jeśli migracja pójdzie przed kodem

`/api/trening/cms-solution` i `/api/trening/arkusz-solutions` zwrócą błąd
`permission denied` (42501). Objaw: Pro widzi „Nie udało się pobrać klucza”.
Wtedy natychmiast wycofaj grantem z sekcji „Wycofanie”.
