-- Ograniczenie zmiany nicku: raz na 7 dni
-- Uruchom w Supabase → SQL Editor (po profiles.sql)

alter table public.profiles add column if not exists last_nick_update timestamptz;
