-- KROK 2 (gdy krok 1 już był uruchomiony wcześniej)
-- Wklej w Supabase SQL Editor → Run

alter table public.zadania
  add column if not exists source_id text;

drop index if exists public.zadania_source_id_unique_idx;

create unique index zadania_source_id_unique_idx
  on public.zadania (source_id)
  where source_id is not null;
