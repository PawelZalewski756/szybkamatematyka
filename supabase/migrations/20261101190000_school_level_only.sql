update public.profiles
set school_class = case
  when lower(school_class) ~ '^(klasa-[1-8]|sp)$' then 'sp'
  when lower(school_class) ~ '^(liceum-[1-4]|technikum-[1-5]|zawodowa-[1-5]|srednia|matura)$'
    then 'srednia'
  else null
end
where school_class is not null;

alter table public.profiles
  add constraint profiles_school_class_school_level_check
  check (school_class is null or school_class in ('sp', 'srednia'))
  not valid;

alter table public.profiles
  validate constraint profiles_school_class_school_level_check;

comment on column public.profiles.school_class is
  'Legacy column storing only the broad school level: sp or srednia.';

create or replace function public.normalize_profile_school_level()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.school_class is null then
    return new;
  end if;

  new.school_class := lower(trim(new.school_class));
  if new.school_class ~ '^(klasa-[1-8]|sp)$' then
    new.school_class := 'sp';
  elsif new.school_class ~ '^(liceum-[1-4]|technikum-[1-5]|zawodowa-[1-5]|srednia|matura)$' then
    new.school_class := 'srednia';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_normalize_school_level on public.profiles;
create trigger profiles_normalize_school_level
  before insert or update on public.profiles
  for each row execute function public.normalize_profile_school_level();

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
