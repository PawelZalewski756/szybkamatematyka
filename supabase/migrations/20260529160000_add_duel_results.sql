-- =============================================================================
-- PERSYSTENCJA WYNIKÓW POJEDYNKÓW 1v1 + dane do rankingu pojedynków.
-- =============================================================================
-- Migracja w pełni IDEMPOTENTNA (add column if not exists / create table if not
-- exists / drop policy if exists + create policy), bezpieczna przy ponownym Run.
--
-- Uruchom w Supabase → SQL Editor PO init_profiles_avatars.sql.
-- (Kolejność względem add_subscription_columns / audit_harden jest dowolna -
--  trigger ochrony kolumn subskrypcji NIE dotyka kolumn duel_*.)
--
-- DWA elementy persystencji (świadoma decyzja):
--   1) public.duel_results - PRYWATNA historia pojedynków zalogowanego gracza
--      (jeden wiersz na zakończony pojedynek). RLS own-row: gracz widzi/zapisuje
--      tylko swoje wiersze. Append-only (brak UPDATE/DELETE) - historia jest
--      niezmienna.
--   2) profiles.duel_* - ZAGREGOWANE liczniki (rozegrane/wygrane/przegrane/remisy
--      + duel_rating). Trzymane w profiles, bo tabela ta ma już PUBLICZNY odczyt
--      (polityka profiles_select_*), więc ranking pojedynków reużywa istniejący
--      tor leaderboardu (sortowanie po kolumnie) bez nowej tabeli publicznej ani
--      widoku. Zapis tych kolumn robi sam gracz (profiles_update_own,
--      auth.uid() = id) - to INNE kolumny niż subscription_*, więc trigger
--      protect_subscription_columns ich nie blokuje.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1) profiles - zagregowane liczniki pojedynków (zasilają ranking „Pojedynki").
--    Idempotentnie, kolumna po kolumnie. Brak tabeli profiles = pomijamy.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.profiles') is null then
    raise notice 'pomijam profiles - tabela nie istnieje';
  else
    alter table public.profiles
      add column if not exists duel_played  integer not null default 0,
      add column if not exists duel_wins    integer not null default 0,
      add column if not exists duel_losses  integer not null default 0,
      add column if not exists duel_draws   integer not null default 0,
      add column if not exists duel_rating  integer not null default 0;

    execute
      'grant select (duel_played, duel_wins, duel_losses, duel_draws, duel_rating) ' ||
      'on table public.profiles to anon, authenticated';
  end if;
end $$;

create index if not exists profiles_duel_rating_idx
  on public.profiles (duel_rating desc);


-- ---------------------------------------------------------------------------
-- 2) duel_results - prywatna historia zakończonych pojedynków gracza.
-- ---------------------------------------------------------------------------
create table if not exists public.duel_results (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  outcome        text not null check (outcome in ('win', 'loss', 'draw')),
  mode           text not null,
  slug           text not null,
  score          integer not null default 0,
  opponent_score integer not null default 0,
  correct        integer not null default 0,
  total          integer not null default 0,
  duration_ms    integer not null default 0,
  rating_delta   integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists duel_results_user_created_idx
  on public.duel_results (user_id, created_at desc);

alter table public.duel_results enable row level security;

-- Prywatne dane gracza: pełen dostęp tylko do własnych wierszy.
-- Historia jest append-only → świadomie BEZ polityk UPDATE/DELETE
-- (przy włączonym RLS te operacje są wówczas domyślnie zabronione).
drop policy if exists "duel_results_select_own" on public.duel_results;
create policy "duel_results_select_own"
  on public.duel_results for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "duel_results_insert_own" on public.duel_results;
create policy "duel_results_insert_own"
  on public.duel_results for insert
  to authenticated
  with check (auth.uid() = user_id);

comment on table public.duel_results is
  'Prywatna historia zakończonych pojedynków 1v1 (jeden wiersz na pojedynek, own-row RLS). Zagregowane liczniki do rankingu: profiles.duel_*.';
