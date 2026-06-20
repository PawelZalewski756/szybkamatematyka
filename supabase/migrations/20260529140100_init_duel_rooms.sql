-- Pojedynki 1v1 (async / cross-device po krótkim kodzie pokoju).
-- Tabela jest OPCJONALNA: feature działa też bez niej (przenośny kod offline,
-- tryb lokalny, bot, oraz realtime przez Supabase Realtime broadcast bez tabeli).
-- Uruchom w Supabase → SQL Editor (po init_profiles_avatars.sql).

create table if not exists public.duel_rooms (
  code text primary key,
  slug text not null,
  path text not null,
  seed bigint not null,
  question_count integer not null default 15,
  host_name text not null default 'Gospodarz',
  host_result jsonb,
  guest_name text,
  guest_result jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists duel_rooms_created_at_idx
  on public.duel_rooms (created_at desc);

alter table public.duel_rooms enable row level security;

-- Pokoje są dostępne po losowym kodzie (casual feature) — odczyt dla wszystkich,
-- którzy znają kod. Zapis/aktualizacja również otwarte, bo gracze grają również
-- jako goście anonimowi. Kody są losowe i krótkotrwałe.
drop policy if exists "duel_rooms_select_all" on public.duel_rooms;
create policy "duel_rooms_select_all"
  on public.duel_rooms for select
  to anon, authenticated
  using (true);

drop policy if exists "duel_rooms_insert_all" on public.duel_rooms;
create policy "duel_rooms_insert_all"
  on public.duel_rooms for insert
  to anon, authenticated
  with check (true);

drop policy if exists "duel_rooms_update_all" on public.duel_rooms;
create policy "duel_rooms_update_all"
  on public.duel_rooms for update
  to anon, authenticated
  using (true)
  with check (true);

comment on table public.duel_rooms is 'Pokoje pojedynków 1v1 (async po kodzie). Opcjonalne — feature ma fallback offline.';
