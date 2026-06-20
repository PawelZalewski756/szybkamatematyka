-- =============================================================================
-- AUDYT I UTWARDZENIE RLS dla nowych tabel + ochrona kolumn subskrypcji.
-- =============================================================================
-- Migracja porządkowa, w pełni IDEMPOTENTNA i bezpieczna przy ponownym Run:
--   * każdy blok jest osłonięty przez to_regclass / sprawdzenie kolumn,
--     więc brak danej tabeli/kolumny jest po prostu pomijany (bez błędu),
--   * polityki tworzymy wzorcem `drop policy if exists` + `create policy`
--     (nie ma duplikatów ani błędu 42710),
--   * funkcje przez `create or replace`, triggery przez `drop ... if exists`.
--
-- Uruchom w Supabase → SQL Editor PO migracjach nowych tabel
-- (daily_challenges, review_schedule, duel_rooms) oraz po add_subscription_columns.
--
-- Zakres:
--   1) daily_challenges  — domknięcie polityk (brakowało UPDATE/DELETE własnych wierszy).
--   2) review_schedule   — weryfikacja (komplet polityk już poprawny — tylko re-assert RLS).
--   3) duel_rooms        — casual feature: świadomie otwarte, + trigger immutability
--                          na kolumny strukturalne (anty-hijack pokoju).
--   4) profiles          — ZAMKNIĘCIE luki self-upgrade subskrypcji (trigger).
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1) daily_challenges — dane prywatne gracza: pełny zestaw polityk own-row.
--    Pierwotna migracja miała tylko SELECT + INSERT. Brak UPDATE/DELETE przy
--    włączonym RLS = te operacje były domyślnie zabronione. To blokuje m.in.
--    `insert ... on conflict do update` (upsert anti-double-XP wymaga UPDATE).
--    Dodajemy własnościowe UPDATE/DELETE (auth.uid() = user_id).
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.daily_challenges') is null then
    raise notice 'pomijam daily_challenges — tabela nie istnieje';
  else
    execute 'alter table public.daily_challenges enable row level security';

    -- (SELECT/INSERT own-row są już poprawne w migracji init — nie ruszamy.)

    execute 'drop policy if exists "daily_challenges_update_own" on public.daily_challenges';
    execute $pol$
      create policy "daily_challenges_update_own"
        on public.daily_challenges for update
        to authenticated
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id)
    $pol$;

    execute 'drop policy if exists "daily_challenges_delete_own" on public.daily_challenges';
    execute $pol$
      create policy "daily_challenges_delete_own"
        on public.daily_challenges for delete
        to authenticated
        using (auth.uid() = user_id)
    $pol$;
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 2) review_schedule — weryfikacja audytowa.
--    Komplet polityk own-row (SELECT/INSERT/UPDATE/DELETE, auth.uid() = user_id)
--    jest już poprawny w migracji 20260529140000_add_review_schedule.sql.
--    Nie duplikujemy poprawnych polityk — jedynie idempotentnie potwierdzamy RLS.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.review_schedule') is null then
    raise notice 'pomijam review_schedule — tabela nie istnieje';
  else
    execute 'alter table public.review_schedule enable row level security';
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 3) duel_rooms — casual feature (kody pokojów), goście grają ANONIMOWO.
--
--    DECYZJA: zostawiamy SELECT/INSERT/UPDATE otwarte dla anon+authenticated.
--    Uzasadnienie: pokój jest udostępniany przez losowy, krótkotrwały kod, a
--    gość dołącza bez logowania — wymuszenie `authenticated` lub własności
--    wiersza ZŁAMAŁOBY feature (brak tożsamości po stronie gościa).
--
--    RYZYKO (świadomie akceptowane, brak danych wrażliwych/PII):
--      * SELECT using(true) pozwala teoretycznie wylistować wszystkie pokoje
--        (RLS nie potrafi wymusić filtra `where code = ...`, klient może go pominąć).
--      * INSERT/UPDATE open pozwala dowolnemu klientowi nadpisać wynik/status pokoju.
--    Pokoje są efemeryczne i nie zawierają danych osobowych — ryzyko niskie.
--
--    UTWARDZENIE, które NIE psuje anonimowej gry: trigger BEFORE UPDATE czyni
--    kolumny strukturalne NIEZMIENNYMI (anty-hijack: nie da się podmienić celu
--    pokoju — slug/path/seed itd.). Zmieniać można tylko stan rozgrywki
--    (guest_name, host_result, guest_result, status). Brak polityki DELETE =
--    usuwanie zabronione dla wszystkich (pozostawiamy świadomie).
-- ---------------------------------------------------------------------------
create or replace function public.duel_rooms_lock_structure()
returns trigger
language plpgsql
as $$
begin
  -- Kolumny ustalane przy tworzeniu pokoju pozostają niezmienne po INSERT.
  -- (Przy upsercie z tymi samymi wartościami to no-op; różniące się są ignorowane.)
  new.code           := old.code;
  new.slug           := old.slug;
  new.path           := old.path;
  new.seed           := old.seed;
  new.question_count := old.question_count;
  new.host_name      := old.host_name;
  new.created_at     := old.created_at;
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.duel_rooms') is null then
    raise notice 'pomijam duel_rooms — tabela nie istnieje';
  else
    execute 'alter table public.duel_rooms enable row level security';

    execute 'drop trigger if exists duel_rooms_lock_structure_trg on public.duel_rooms';
    execute $trg$
      create trigger duel_rooms_lock_structure_trg
        before update on public.duel_rooms
        for each row execute function public.duel_rooms_lock_structure()
    $trg$;
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 4) profiles — ZAMKNIĘCIE luki SELF-UPGRADE subskrypcji.
--
--    PROBLEM: polityka `profiles_update_own` (using/with check auth.uid() = id)
--    działa NA POZIOMIE WIERSZA — nie ogranicza, KTÓRE kolumny user może zmienić.
--    Zalogowany user mógłby więc wykonać:
--        update public.profiles
--           set subscription_status = 'active', subscription_plan = 'pro'
--         where id = auth.uid();
--    czyli nadać sobie Pro za darmo. Analogicznie przy ewentualnym własnym INSERT.
--    Źródłem prawdy dla tych kolumn ma być WYŁĄCZNIE webhook Stripe (service_role).
--
--    ROZWIĄZANIE: trigger BEFORE INSERT/UPDATE, który dla ról innych niż
--    service_role/admin neutralizuje próby zmiany kolumn subskrypcji:
--      * UPDATE → przywraca poprzednie (OLD) wartości,
--      * INSERT → wymusza wartości domyślne (free / NULL / false).
--    service_role (webhook), postgres oraz role administracyjne mają pełen dostęp.
--    Trigger jest niezależny od grantów kolumnowych i polityk RLS, więc działa
--    nawet bez modyfikacji „stabilnego” pliku supabase/profiles.sql.
-- ---------------------------------------------------------------------------
create or replace function public.protect_subscription_columns()
returns trigger
language plpgsql
as $$
begin
  -- Role uprzywilejowane (webhook Stripe = service_role; obsługa/manualne SQL =
  -- postgres/supabase_admin) mogą zapisywać kolumny subskrypcji bez ograniczeń.
  -- Wewnątrz handle_new_user() (SECURITY DEFINER, owner=postgres) current_user
  -- również jest uprzywilejowany, więc rejestracja użytkownika nie jest blokowana.
  if current_user in ('service_role', 'supabase_admin', 'postgres', 'supabase_auth_admin') then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    new.subscription_status              := old.subscription_status;
    new.subscription_plan                := old.subscription_plan;
    new.subscription_current_period_end  := old.subscription_current_period_end;
    new.subscription_cancel_at_period_end := old.subscription_cancel_at_period_end;
    new.stripe_customer_id               := old.stripe_customer_id;
    new.stripe_subscription_id           := old.stripe_subscription_id;
  elsif tg_op = 'INSERT' then
    new.subscription_status              := 'free';
    new.subscription_plan                := null;
    new.subscription_current_period_end  := null;
    new.subscription_cancel_at_period_end := false;
    new.stripe_customer_id               := null;
    new.stripe_subscription_id           := null;
  end if;

  return new;
end;
$$;

do $$
begin
  -- Trigger tworzymy tylko, gdy istnieje tabela profiles ORAZ kolumny subskrypcji
  -- (dodawane przez 20260529130000_add_subscription_columns.sql). Bez kolumn
  -- trigger zgłaszałby błąd w runtime — dlatego twardo to sprawdzamy.
  if to_regclass('public.profiles') is null then
    raise notice 'pomijam profiles — tabela nie istnieje';
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'subscription_status'
  ) then
    raise notice 'pomijam profiles — brak kolumn subskrypcji (uruchom najpierw add_subscription_columns)';
  else
    execute 'drop trigger if exists protect_subscription_columns_trg on public.profiles';
    execute $trg$
      create trigger protect_subscription_columns_trg
        before insert or update on public.profiles
        for each row execute function public.protect_subscription_columns()
    $trg$;
  end if;
end $$;
