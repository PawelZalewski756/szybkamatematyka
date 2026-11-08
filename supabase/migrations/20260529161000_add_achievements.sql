-- Osiągnięcia gracza: persystencja odblokowanych odznak + stan „widziane" (sync między urządzeniami).
-- Odznaki są WYLICZANE z PlayerStats; tutaj trzymamy tylko fakt odblokowania i flagę „seen".
-- achievement_id to stabilny tekstowy klucz z katalogu (np. „solved-50") - BEZ klucza obcego.
-- Uruchom w Supabase → SQL Editor (po init_profiles_avatars.sql). Idempotentne.

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  seen boolean not null default false,
  primary key (user_id, achievement_id)
);

create index if not exists user_achievements_user_id_idx
  on public.user_achievements (user_id);

alter table public.user_achievements enable row level security;

drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own"
  on public.user_achievements for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_achievements_insert_own" on public.user_achievements;
create policy "user_achievements_insert_own"
  on public.user_achievements for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_achievements_update_own" on public.user_achievements;
create policy "user_achievements_update_own"
  on public.user_achievements for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_achievements_delete_own" on public.user_achievements;
create policy "user_achievements_delete_own"
  on public.user_achievements for delete
  to authenticated
  using (auth.uid() = user_id);

comment on table public.user_achievements is 'Odblokowane osiągnięcia gracza + flaga „widziane" (jeden wiersz na gracza i odznakę).';
