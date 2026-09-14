-- Dodaje tylko kolumnę avatar_url (gdy profiles.sql już był uruchomiony bez niej).
-- Uruchom w Supabase → SQL Editor.

alter table public.profiles add column if not exists avatar_url text;
grant select (avatar_url) on table public.profiles to anon, authenticated;
grant update (avatar_url) on table public.profiles to authenticated;
