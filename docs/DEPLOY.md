# Wdrożenie Szybka Matematyka

Checklist przed uruchomieniem produkcyjnym (Vercel + Supabase + Stripe).

## 1. Zmienne środowiskowe

Skopiuj `.env.example` i uzupełnij zmienne w Vercel oraz lokalnie:

| Zmienna | Wymagane | Opis |
|---------|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | tak | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tak | Publiczny klucz anon |
| `NEXT_PUBLIC_SITE_URL` | produkcja | Pełny adres aplikacji, np. `https://szybkamatematyka.pl` |
| `ADMIN_EMAILS` | tak | Serwerowa lista e-maili adminów, po przecinku |
| `NEXT_PUBLIC_ADMIN_EMAILS` | tak | Ta sama lista dla gate'u UI `/admin` |
| `SUPABASE_SERVICE_ROLE_KEY` | Stripe / quota | Nigdy nie wystawiaj jej w przeglądarce |
| `TELEGRAM_BOT_TOKEN` | Telegram admin bot | Token z BotFather; wyłącznie jako sekret serwerowy |
| `TELEGRAM_ADMIN_IDS` | Telegram admin bot | Numeryczne ID administratorów Telegrama, rozdzielone przecinkami |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram admin bot | Losowy sekret używany do weryfikacji webhooka Telegrama |
| `TELEGRAM_SETUP_SECRET` | Telegram admin bot | Sekret Bearer do jednorazowego skonfigurowania webhooka |
| `GEMINI_API_KEY` | opcjonalnie | Generowanie rozwiązań i asysta |
| `STRIPE_SECRET_KEY` | płatności | Sekret Stripe test/live |
| `STRIPE_WEBHOOK_SECRET` | płatności | Sekret endpointu webhooka |
| `STRIPE_PRICE_PRO` | płatności | Price ID planu miesięcznego |
| `STRIPE_PRICE_ROCZNY` | płatności | Price ID planu rocznego |

`ADMIN_EMAILS` jest źródłem prawdy po stronie serwera. `NEXT_PUBLIC_ADMIN_EMAILS`
służy tylko do ukrycia/pokazania panelu w przeglądarce — obie wartości muszą być
identyczne. Brak whitelisty blokuje panel administratora (fail closed).

Bot Telegrama przyjmuje wyłącznie prywatne wiadomości od ID z `TELEGRAM_ADMIN_IDS`.
Do jego podłączenia po wdrożeniu wykonaj jednorazowe żądanie `POST
/api/telegram/setup` z nagłówkiem `Authorization: Bearer <TELEGRAM_SETUP_SECRET>`.
Token bota i klucz `SUPABASE_SERVICE_ROLE_KEY` nigdy nie mogą mieć prefiksu
`NEXT_PUBLIC_`.

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` i
`NEXT_PUBLIC_SITE_URL` ustaw przed `next build`, ponieważ Next.js wbudowuje
publiczne zmienne w bundle. Aplikacja ma dodatkowo endpoint
`/api/runtime-config`, który pobiera te trzy wartości przy uruchomieniu serwera;
to zabezpiecza wdrożenia Node/standalone budowane bez konfiguracji, ale nie
zastępuje ustawienia zmiennych w środowisku produkcyjnym ani nie działa przy
czysto statycznym eksporcie.

W Supabase dodaj do Authentication → URL Configuration:

- Site URL: wartość `NEXT_PUBLIC_SITE_URL`;
- Redirect URLs: `${NEXT_PUBLIC_SITE_URL}/login`,
  `${NEXT_PUBLIC_SITE_URL}/login/nowe-haslo` oraz lokalny
  `http://localhost:3000/**` do testów.

## 2. Supabase — kolejność SQL

Repozytorium zawiera starsze pliki SQL przeznaczone do uruchamiania w SQL
Editorze. Nie uruchamiaj ich w przypadkowej kolejności. Na świeżym projekcie
wykonaj poniższe kroki:

1. `supabase/profiles.sql`
2. `supabase/migrations/init_profiles_avatars.sql`
3. `supabase/migrations/init_baza_zadan.sql`
4. `supabase/migrations/init_tasks.sql`
5. `supabase/migrations/init_materials.sql`
6. `supabase/migrations/init_solved_tasks.sql`
7. Drobne migracje profilu i danych:
   `add_avatar_url_only.sql`, `add_last_nick_update.sql`,
   `add_profile_hearts.sql`, `add_profile_minigry_xp.sql`,
   `add_profile_school_class.sql`, `add_profile_streak_columns.sql`,
   `add_arkusz_miesiac.sql`, `add_zadania_source_id.sql`,
   `krok2_tylko_source_id.sql`, `fix_cke_legacy_slugs.sql`.
8. Migracje funkcjonalne w kolejności dat:
   `20260529130000_add_subscription_columns.sql`,
   `20260529135000_add_daily_challenges.sql`,
   `20260529140000_add_review_schedule.sql`,
   `20260529140100_init_duel_rooms.sql`,
   `20260529160000_add_duel_results.sql`,
   `20260529161000_add_achievements.sql`,
   `20260703000000_materials_created_at.sql`,
   `20260714210000_add_ai_assist_quota.sql`.
9. Na końcu uruchom, w tej kolejności:
   `20260906220000_production_hardening.sql`,
   `20260906230000_secure_profile_data_and_atomic_assist.sql`,
   `20260906240000_fix_auth_profile_trigger.sql`,
   `20260907000000_repair_public_profile_grants.sql`,
   `20261027140000_repair_profile_write_grants.sql`.

Migracja `20260907000000` naprawia granty odczytu dla opcjonalnych kolumn
profilu (w tym `avatar_url`, XP z minigier i danych pojedynków).
`20261027140000` dodaje brakujące granty **zapisu** (`UPDATE`/`INSERT` na nick,
XP, klasę, streak itd.) — bez niej onboarding nicku i zapis EXP kończą się
`permission denied`. Obie są ważne przy aktualizacji istniejącego projektu.

Aby włączyć statystyki odwiedzin w bocie Telegrama, uruchom dodatkowo
`supabase/migrations/20261011100000_add_anonymous_page_analytics.sql` w
Supabase → SQL Editor. Pomiar zacznie działać po wdrożeniu tej migracji i
wyłącznie dla przeglądarek, które zaakceptują analitykę. Zapisywane są
anonimowe odsłony i skrót losowego identyfikatora przeglądarki — bez adresów IP.
Bot udostępnia `/visits` (ostatnie 7 dni) oraz `/visits 30` (ostatnie 30 dni).

Kolejna timestampowana migracja,
`supabase/migrations/20261011170000_add_funnel_analytics.sql`, rozszerza
pomiar o sesje, powracających odwiedzających, rejestracje, pierwsze rozwiązane
zadanie i źródła UTM. Na wdrożeniach z aktywnym GitHub Actions migracji
zastosuje się automatycznie po pushu na `master`. Bot udostępnia `/funnel`
(ostatnie 7 dni) i `/funnel 30`; `/visits` pokazuje również oznaczone źródła
kampanii. Dodatkowe zdarzenia również są zbierane tylko po zgodzie na analitykę.
Kolejna migracja `20261011180000_add_referrer_and_hour_stats.sql` dodaje
domenę strony odsyłającej (bez pełnego URL-a) i statystyki godzinowe w strefie
`Europe/Warsaw`; bot pokaże najczęstsze godziny w `/visits`. Dane te również
zapisują się tylko po zgodzie.

`20260529120000_harden_rls_admin_writes.sql` i
`20260529150000_audit_harden_new_tables_rls.sql` są starszymi, częściowymi
plikami hardeningu. Nie są wymagane w nowej instalacji — końcowa migracja
odtwarza ich potrzebne elementy po utworzeniu tabel.

Migracja hardeningu sprawdza istnienie tabel bazowych i końcowo ustawia RLS. Zamyka
zapis anon/authenticated do `arkusze`, `zadania`, `tasks` i `materials`,
zostawiając zapis wyłącznie dla adminów przez `public.is_admin()`. Ponownie
tworzy polityki own-row dla postępu, wyzwań, powtórek, osiągnięć i historii
pojedynków oraz chroni pola subskrypcji i limitu asysty w `profiles`.

Po hardeningu dodaj adminów:

```sql
insert into public.admin_emails (email)
values ('twoj@email.pl')
on conflict do nothing;
```

### Seed danych

`add_tasks_materials_insert.sql` otwiera zapis dla anon i authenticated. To
plik wyłącznie do jednorazowego, lokalnego/stagingowego seedu i nie wolno go
uruchamiać na produkcji. Na produkcji używaj `SUPABASE_SERVICE_ROLE_KEY` w
skryptach seedujących, a po każdym seedzie uruchom ponownie
`20260906220000_production_hardening.sql`.

```bash
npm run seed:trening-tasks -- --dry-run
npm run seed:trening-tasks
npm run audit:trening
npm run audit:questions
npm run repair:production-tasks
```

`repair:production-tasks` domyślnie wykonuje tylko audyt. Użyj
`npm run repair:production-tasks -- --apply` wyłącznie po sprawdzeniu raportu;
naprawia znane duplikaty opcji, usuwa zadania bez poprawnej opcji i mapuje
stare sloty curriculum.

## 3. Kontrola RLS po wdrożeniu

W SQL Editorze sprawdź, czy nie ma publicznych polityk zapisu:

```sql
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and cmd <> 'SELECT'
  and roles::text ilike '%anon%';
```

Powinno zostać 0 wierszy dla tabel treści i profilu. Publiczne polityki
`duel_rooms` są wyjątkiem opisanym w migracji: gra anonimowa wymaga odczytu,
insertu i update bez logowania, ale pokój ma blokadę zmian strukturalnych.

Sprawdź również:

```sql
select relname, relrowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in (
    'profiles', 'solved_tasks', 'daily_challenges', 'review_schedule',
    'user_achievements', 'duel_results', 'arkusze', 'zadania', 'tasks',
    'materials'
  )
order by relname;
```

Każda wymieniona tabela powinna mieć `relrowsecurity = true`.

## 4. Treść i CI

```bash
npm run audit:cke
npm run audit:questions
npm run audit:trening
npm test
npm run lint
npx tsc --noEmit
npm run build
```

CI (`.github/workflows/ci.yml`) uruchamia lint, TypeScript, testy i build.
E2E lokalnie: `npm run test:e2e`.

## 5. Stripe w trybie testowym

1. Utwórz produkty i ceny testowe, a następnie ustaw oba `STRIPE_PRICE_*`.
2. Wdróż aplikację z `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `SUPABASE_SERVICE_ROLE_KEY` i `NEXT_PUBLIC_SITE_URL`.
3. Skonfiguruj endpoint `POST /api/stripe/webhook`.
4. W Stripe CLI przekaż zdarzenia testowe do endpointu i sprawdź:
   `checkout.session.completed`, `customer.subscription.updated` oraz
   `customer.subscription.deleted`.
5. Potwierdź, że webhook aktualizuje tylko właściwy profil i że użytkownik
   nie może sam zmienić `subscription_*`, `stripe_*` ani `ai_assist_*`.

Webhook zwraca `503`, gdy brakuje klucza service role, oraz `500` po błędzie
zapisu profilu. Dzięki temu Stripe ponawia dostarczenie zamiast trwale zgubić
zmianę subskrypcji.
