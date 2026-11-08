-- Życia (hearts) w profilu gracza - arena treningu.
-- Uruchom w Supabase → SQL Editor.

alter table public.profiles add column if not exists hearts integer not null default 5;

update public.profiles set hearts = 5 where hearts is null;
