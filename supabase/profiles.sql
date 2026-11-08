-- Uruchom w Supabase → SQL Editor (cały plik)

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists nick text;
alter table public.profiles add column if not exists nickname text;
alter table public.profiles add column if not exists xp bigint default 0;
alter table public.profiles add column if not exists level integer default 1;
alter table public.profiles add column if not exists streak integer default 0;
alter table public.profiles add column if not exists last_played_date date;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists last_nick_update timestamptz;
alter table public.profiles add column if not exists hearts integer not null default 5;

-- Synchronizacja nick ↔ nickname
update public.profiles set nick = nickname where (nick is null or nick = '') and nickname is not null;
update public.profiles set nickname = nick where (nickname is null or nickname = '') and nick is not null;

update public.profiles set xp = 0 where xp is null;
update public.profiles set level = 1 where level is null;
update public.profiles set streak = 0 where streak is null;
update public.profiles set hearts = 5 where hearts is null;

update public.profiles
set nick = 'gracz_' || substring(replace(id::text, '-', ''), 1, 8)
where nick is null or trim(nick) = '';

update public.profiles
set nickname = nick
where nickname is null or trim(nickname) = '';

alter table public.profiles alter column xp set default 0;
alter table public.profiles alter column xp set not null;
alter table public.profiles alter column level set default 1;
alter table public.profiles alter column level set not null;
alter table public.profiles alter column streak set default 0;
alter table public.profiles alter column streak set not null;

do $$
begin
  if not exists (select 1 from public.profiles where nick is null or trim(nick) = '') then
    alter table public.profiles alter column nick set not null;
  end if;
end $$;

drop index if exists public.profiles_nick_lower_idx;
drop index if exists public.profiles_nickname_lower_idx;
create unique index if not exists profiles_nick_lower_idx on public.profiles (lower(nick));

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select to anon, authenticated using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Profile rows are used by the public leaderboard, but billing and quota
-- columns must never be exposed through PostgREST. Later migrations add any
-- optional public columns that exist in a deployed database.
revoke select on table public.profiles from anon, authenticated;
grant select (
  id,
  created_at,
  nick,
  nickname,
  xp,
  level,
  streak,
  last_played_date,
  avatar_url,
  last_nick_update,
  hearts
) on table public.profiles to anon, authenticated;

-- Zapis własnego profilu (nick, XP, streak…) - bez tego onboarding i XP
-- kończą się permission denied przy kolumnowych grantach SELECT.
grant insert (
  id,
  created_at,
  nick,
  nickname,
  xp,
  level,
  streak,
  last_played_date,
  avatar_url,
  last_nick_update,
  hearts
) on table public.profiles to authenticated;
grant update (
  nick,
  nickname,
  xp,
  level,
  streak,
  last_played_date,
  avatar_url,
  last_nick_update,
  hearts
) on table public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_nick text;
  final_nick text;
begin
  meta_nick := coalesce(
    nullif(trim(new.raw_user_meta_data->>'nick'), ''),
    nullif(trim(new.raw_user_meta_data->>'nickname'), '')
  );
  final_nick := coalesce(meta_nick, 'gracz_' || substring(replace(new.id::text, '-', ''), 1, 8));

  insert into public.profiles (id, nick, nickname, xp, level, streak, last_played_date, hearts)
  values (new.id, final_nick, final_nick, 0, 1, 0, null, 5)
  on conflict (id) do update set
    nick = coalesce(nullif(trim(excluded.nick), ''), public.profiles.nick),
    nickname = coalesce(nullif(trim(excluded.nickname), ''), public.profiles.nickname);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
