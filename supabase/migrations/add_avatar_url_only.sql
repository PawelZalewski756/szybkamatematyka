-- Dodaje tylko kolumnę avatar_url (gdy profiles.sql już był uruchomiony bez niej).
-- Uruchom w Supabase → SQL Editor.

alter table public.profiles add column if not exists avatar_url text;
