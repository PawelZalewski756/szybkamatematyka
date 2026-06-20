-- Streak + ostatnia gra (gdy profiles.sql był uruchomiony bez tych kolumn).
-- Uruchom w Supabase → SQL Editor.

alter table public.profiles add column if not exists streak integer default 0 not null;
alter table public.profiles add column if not exists last_played_date date;

update public.profiles set streak = 0 where streak is null;
