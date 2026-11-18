-- 1. Uzupełnia brakujące profile dla kont, które istnieją w auth.users.
--    Objaw: /users w Telegramie pokazywał nowe konta, ale /stats liczył 0,
--    bo statystyki czytały profiles, a trigger nie utworzył wiersza.
-- 2. Odtwarza trigger handle_new_user, żeby kolejne konta też miały profil.
-- 3. Dodaje RPC get_platform_stats liczące konta z auth.users (nie tylko profiles).

insert into public.profiles (id, nick, nickname, xp, level, school_class)
select
  u.id,
  'gracz_' || replace(u.id::text, '-', ''),
  'gracz_' || replace(u.id::text, '-', ''),
  0,
  1,
  case
    when lower(coalesce(
      nullif(trim(u.raw_user_meta_data->>'school_level'), ''),
      nullif(trim(u.raw_user_meta_data->>'school_class'), '')
    )) in ('sp', 'klasa-1', 'klasa-2', 'klasa-3', 'klasa-4', 'klasa-5', 'klasa-6', 'klasa-7', 'klasa-8')
      then 'sp'
    when lower(coalesce(
      nullif(trim(u.raw_user_meta_data->>'school_level'), ''),
      nullif(trim(u.raw_user_meta_data->>'school_class'), '')
    )) in ('srednia', 'matura', 'liceum-1', 'liceum-2', 'liceum-3', 'liceum-4', 'technikum-1', 'technikum-2', 'technikum-3', 'technikum-4', 'technikum-5', 'zawodowa-1', 'zawodowa-2', 'zawodowa-3', 'zawodowa-4', 'zawodowa-5')
      then 'srednia'
    else null
  end
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_nick text;
  final_nick text;
  meta_school_class text;
begin
  meta_nick := coalesce(
    nullif(trim(new.raw_user_meta_data->>'nick'), ''),
    nullif(trim(new.raw_user_meta_data->>'nickname'), '')
  );
  final_nick := coalesce(
    meta_nick,
    'gracz_' || substring(replace(new.id::text, '-', ''), 1, 8)
  );

  meta_school_class := lower(coalesce(
    nullif(trim(new.raw_user_meta_data->>'school_level'), ''),
    nullif(trim(new.raw_user_meta_data->>'school_class'), '')
  ));
  if meta_school_class ~ '^klasa-[1-8]$' then
    meta_school_class := 'sp';
  elsif meta_school_class ~ '^(liceum-[1-4]|technikum-[1-5]|zawodowa-[1-5]|matura)$' then
    meta_school_class := 'srednia';
  elsif meta_school_class not in ('sp', 'srednia') then
    meta_school_class := null;
  end if;

  begin
    insert into public.profiles (
      id, nick, nickname, xp, level, school_class
    )
    values (
      new.id, final_nick, final_nick, 0, 1, meta_school_class
    )
    on conflict (id) do update set
      nick = coalesce(nullif(trim(excluded.nick), ''), public.profiles.nick),
      nickname = coalesce(
        nullif(trim(excluded.nickname), ''),
        public.profiles.nickname
      ),
      school_class = coalesce(
        public.profiles.school_class,
        excluded.school_class
      );
  exception
    when unique_violation then
      final_nick := 'gracz_' || replace(new.id::text, '-', '');
      insert into public.profiles (
        id, nick, nickname, xp, level, school_class
      )
      values (
        new.id, final_nick, final_nick, 0, 1, meta_school_class
      )
      on conflict (id) do nothing;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.get_platform_stats()
returns table (
  users_total bigint,
  users_new_7d bigint,
  users_new_24h bigint,
  profiles_total bigint,
  solved_total bigint,
  solved_7d bigint,
  active_users_7d bigint
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    (select count(*) from auth.users) as users_total,
    (select count(*) from auth.users where created_at >= now() - interval '7 days') as users_new_7d,
    (select count(*) from auth.users where created_at >= now() - interval '24 hours') as users_new_24h,
    (select count(*) from public.profiles) as profiles_total,
    (select count(*) from public.solved_tasks) as solved_total,
    (select count(*) from public.solved_tasks where solved_at >= now() - interval '7 days') as solved_7d,
    (select count(distinct user_id) from public.solved_tasks where solved_at >= now() - interval '7 days') as active_users_7d;
$$;

revoke all on function public.get_platform_stats() from public;
revoke all on function public.get_platform_stats() from anon, authenticated;
grant execute on function public.get_platform_stats() to service_role;
