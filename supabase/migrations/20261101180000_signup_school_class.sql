-- Save the optional class selected during registration without blocking
-- account creation when a student chooses to decide later.

alter table public.profiles
  add column if not exists school_class text;

revoke select (school_class) on table public.profiles from anon;
grant select (school_class) on table public.profiles to authenticated;
grant insert (school_class) on table public.profiles to authenticated;
grant update (school_class) on table public.profiles to authenticated;

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

  meta_school_class := nullif(
    trim(new.raw_user_meta_data->>'school_class'),
    ''
  );
  if meta_school_class !~ '^(klasa-[1-8]|liceum-[1-4]|technikum-[1-5]|zawodowa-[1-5])$' then
    meta_school_class := null;
  end if;

  begin
    insert into public.profiles (
      id,
      nick,
      nickname,
      xp,
      level,
      school_class
    )
    values (
      new.id,
      final_nick,
      final_nick,
      0,
      1,
      meta_school_class
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
      final_nick := 'gracz_' || substring(replace(new.id::text, '-', ''), 1, 12);
      insert into public.profiles (
        id,
        nick,
        nickname,
        xp,
        level,
        school_class
      )
      values (
        new.id,
        final_nick,
        final_nick,
        0,
        1,
        meta_school_class
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
