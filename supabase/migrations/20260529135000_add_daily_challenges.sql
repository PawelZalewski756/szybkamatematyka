-- Dzienne wyzwania: zapis ukończenia wyzwania na dany dzień (anti-double-XP, historia serii).
-- Streak gracza pozostaje w profiles.streak / profiles.last_played_date (jedna, wspólna seria aktywności).
-- Uruchom w Supabase → SQL Editor (po init_profiles_avatars.sql, przed 20260529150000_audit_harden_new_tables_rls.sql).

create table if not exists public.daily_challenges (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_date date not null,
  completed_at timestamptz not null default now(),
  correct_count integer not null default 0,
  total_count integer not null default 0,
  xp_awarded integer not null default 0,
  streak_after integer not null default 0,
  primary key (user_id, challenge_date)
);

create index if not exists daily_challenges_user_id_idx
  on public.daily_challenges (user_id);

alter table public.daily_challenges enable row level security;

drop policy if exists "daily_challenges_select_own" on public.daily_challenges;
create policy "daily_challenges_select_own"
  on public.daily_challenges for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "daily_challenges_insert_own" on public.daily_challenges;
create policy "daily_challenges_insert_own"
  on public.daily_challenges for insert
  to authenticated
  with check (auth.uid() = user_id);

comment on table public.daily_challenges is 'Ukończenia dziennych wyzwań (jeden wiersz na gracza i dzień).';
