# Konfiguracja bazy Supabase

## Automatyczne migracje produkcyjne

Nowe migracje timestampowane (`YYYYMMDDHHMMSS_nazwa.sql`) dodane do
`supabase/migrations/` i wysłane na `master` są wykonywane przez
`.github/workflows/supabase-migrations.yml`. Workflow zapisuje checksum
zastosowanej migracji, wykonuje SQL i wpis historii w jednej transakcji oraz
odmawia ponownego zastosowania zmienionego pliku.

Przed pierwszym uruchomieniem dodaj w GitHub:
**Settings → Secrets and variables → Actions → New repository secret**:

- nazwa: `SUPABASE_DB_URL`
- wartość: connection string PostgreSQL z Supabase → **Connect → Session pooler**
  (nie klucz API, `service_role` ani connection string trybu Transaction pooler).

Sekret jest używany wyłącznie przez GitHub Actions podczas migracji; nie dodawaj
go do Vercel ani do kodu. Historyczne i nietimestampowane pliki SQL nie są
automatycznie wykonywane. Workflow uwzględnia jednorazowo idempotentną migrację
analityki `20261011100000_add_anonymous_page_analytics.sql`; kolejne pliki
migracji (w tym `20261011170000_add_funnel_analytics.sql`) wykonuje dopiero,
gdy zostaną dodane na `master`; zakres lejka uzupełnia
`20261011180000_add_referrer_and_hour_stats.sql`. Istniejącą migrację analityki możesz uruchomić
po dodaniu sekretu przyciskiem **Actions → Supabase migrations → Run workflow**.

## Kolejność wdrożenia

Pliki w `supabase/migrations/` powstały w kilku etapach projektu. Część z nich
ma historyczne, nietimestampowane nazwy i jest przeznaczona do ręcznego
uruchomienia w SQL Editorze. Na świeżym projekcie wykonaj:

1. `profiles.sql`
2. `migrations/init_profiles_avatars.sql`
3. `migrations/init_baza_zadan.sql`
4. `migrations/init_tasks.sql`
5. `migrations/init_materials.sql`
6. `migrations/init_solved_tasks.sql`
7. Drobne migracje `add_*`, `krok2_tylko_source_id.sql` i
   `fix_cke_legacy_slugs.sql`, jeśli ich kolumny lub dane nie istnieją.
8. Timestampowane migracje funkcjonalne w kolejności dat.
9. **Ostatni krok:** `migrations/20260906220000_production_hardening.sql`.

Ostatnia migracja jest celowo restrykcyjna: przerwie działanie z komunikatem,
jeśli nie istnieją wymagane tabele. Można uruchomić ją ponownie — naprawia
przypadek, w którym wcześniejsze pliki hardeningu zostały uruchomione przed
utworzeniem tabel.

Starsze pliki `20260529120000_harden_rls_admin_writes.sql` oraz
`20260529150000_audit_harden_new_tables_rls.sql` są zastąpione przez końcowy
hardening i nie trzeba ich uruchamiać na świeżej bazie.

## Admin i RLS

Po hardeningu dodaj adresy administratorów:

```sql
insert into public.admin_emails (email)
values ('twoj@email.pl')
on conflict do nothing;
```

Finalny stan:

- `arkusze`, `zadania`, `tasks` i `materials` są publicznie czytelne;
- insert/update/delete tych tabel jest dostępny wyłącznie dla
  zalogowanych adminów (`public.is_admin()`);
- `profiles`, `solved_tasks`, `daily_challenges`, `review_schedule`,
  `user_achievements` i `duel_results` używają own-row RLS;
- `profiles` blokuje samodzielną zmianę pól subskrypcji Stripe i limitu asysty;
- `duel_rooms` pozostaje świadomie otwarte dla anonimowych pojedynków, ale
  trigger blokuje zmianę celu pokoju po jego utworzeniu.

W aplikacji ustaw `ADMIN_EMAILS` oraz identyczne
`NEXT_PUBLIC_ADMIN_EMAILS`. Serwer używa tylko `ADMIN_EMAILS`; publiczna
zmienna jest wyłącznie wskazówką dla gate'u UI.

## Seed danych

Nie uruchamiaj `add_tasks_materials_insert.sql` na produkcji. Ten plik otwiera
zapis dla anon/authenticated i służy tylko do lokalnego lub stagingowego
seedu. Na produkcji skrypty seedujące powinny używać
`SUPABASE_SERVICE_ROLE_KEY`, a po ich wykonaniu należy ponownie uruchomić
`20260906220000_production_hardening.sql`.

```bash
npm run seed:trening-tasks -- --dry-run
npm run seed:trening-tasks
npm run audit:trening
npx tsx scripts/countDb.ts
```

## Awatary

Aplikacja zapisuje pliki w publicznym bucketcie `avatary`. Uruchom
`migrations/init_profiles_avatars.sql` albo `setup_avatary_bucket.sql`.
Polityki Storage pozwalają odczyt publiczny oraz zapis, zmianę i usunięcie
wyłącznie we własnym katalogu użytkownika.

## Kontrola po wdrożeniu

W SQL Editorze sprawdź publiczne zapisy:

```sql
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and cmd <> 'SELECT'
  and roles::text ilike '%anon%';
```

Zapytanie powinno zwrócić 0 wierszy dla wszystkich tabel poza świadomie
otwartym `duel_rooms`.

Sprawdź RLS:

```sql
select relname, relrowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
order by relname;
```

## Najczęstsze błędy

- `Could not find the table public.zadania` — uruchom
  `migrations/init_baza_zadan.sql`.
- `column source_id does not exist` — uruchom cały
  `migrations/add_zadania_source_id.sql`.
- Brak aktualizacji subskrypcji — sprawdź `SUPABASE_SERVICE_ROLE_KEY`,
  `STRIPE_WEBHOOK_SECRET` i końcową migrację hardeningu.
- Brak dostępu do panelu `/admin` — ustaw obie zmienne adminów oraz dodaj
  adres w `public.admin_emails`.
