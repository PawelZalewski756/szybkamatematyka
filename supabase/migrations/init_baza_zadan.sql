-- Baza zadań: arkusze egzaminacyjne + zadania z rozwiązaniami
-- Uruchom w Supabase SQL Editor lub: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabele
-- ---------------------------------------------------------------------------

create table if not exists public.arkusze (
  id uuid primary key default gen_random_uuid(),
  nazwa text not null,
  typ text not null check (typ in ('matura', 'egzamin-8')),
  rok integer not null check (rok >= 2000 and rok <= 2100),
  miesiac integer not null check (miesiac >= 1 and miesiac <= 12),
  created_at timestamptz not null default now()
);

create index if not exists arkusze_typ_rok_idx on public.arkusze (typ, rok desc);
create index if not exists arkusze_rok_miesiac_idx on public.arkusze (rok desc, miesiac desc);

create table if not exists public.zadania (
  id uuid primary key default gen_random_uuid(),
  arkusz_id uuid not null references public.arkusze (id) on delete cascade,
  numer_zadania integer not null check (numer_zadania > 0),
  dzial text not null,
  tresc text not null,
  rozwiazanie text not null,
  created_at timestamptz not null default now(),
  unique (arkusz_id, numer_zadania)
);

create index if not exists zadania_arkusz_id_idx on public.zadania (arkusz_id);
create index if not exists zadania_dzial_idx on public.zadania (dzial);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.arkusze enable row level security;
alter table public.zadania enable row level security;

-- Polityki (DROP + CREATE = można uruchomić plik ponownie bez błędu 42710)
drop policy if exists "arkusze_select_all" on public.arkusze;
drop policy if exists "zadania_select_all" on public.zadania;
drop policy if exists "arkusze_insert_all" on public.arkusze;
drop policy if exists "arkusze_update_all" on public.arkusze;
drop policy if exists "arkusze_delete_all" on public.arkusze;
drop policy if exists "zadania_insert_all" on public.zadania;
drop policy if exists "zadania_update_all" on public.zadania;
drop policy if exists "zadania_delete_all" on public.zadania;

-- Odczyt dla wszystkich (anon + authenticated)
create policy "arkusze_select_all"
  on public.arkusze for select
  to anon, authenticated
  using (true);

create policy "zadania_select_all"
  on public.zadania for select
  to anon, authenticated
  using (true);

-- Zapis dla wszystkich (panel admin — zaostrzymy później)
create policy "arkusze_insert_all"
  on public.arkusze for insert
  to anon, authenticated
  with check (true);

create policy "arkusze_update_all"
  on public.arkusze for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "arkusze_delete_all"
  on public.arkusze for delete
  to anon, authenticated
  using (true);

create policy "zadania_insert_all"
  on public.zadania for insert
  to anon, authenticated
  with check (true);

create policy "zadania_update_all"
  on public.zadania for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "zadania_delete_all"
  on public.zadania for delete
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Uzupełnienia dla starszych baz (bezpieczne przy ponownym Run)
-- ---------------------------------------------------------------------------

alter table public.arkusze
  add column if not exists miesiac integer check (miesiac is null or (miesiac >= 1 and miesiac <= 12));

alter table public.zadania
  add column if not exists source_id text;

create unique index if not exists zadania_source_id_unique_idx
  on public.zadania (source_id)
  where source_id is not null;
