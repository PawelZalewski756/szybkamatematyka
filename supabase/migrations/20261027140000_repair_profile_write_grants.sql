-- Gracze muszą móc zapisywać nick, XP, klasę i streak. Po przejściu na
-- granty kolumnowe (SELECT tylko na publicznych polach) brakowało UPDATE/INSERT
-- na polach gracza - zapisy nicku i XP kończyły się permission denied, a
-- onboarding wracał w nieskończoność.

do $$
declare
  profile_column text;
  writable_profile_columns constant text[] := array[
    'nick',
    'nickname',
    'xp',
    'minigry_xp',
    'level',
    'streak',
    'last_played_date',
    'avatar_url',
    'last_nick_update',
    'hearts',
    'school_class',
    'duel_played',
    'duel_wins',
    'duel_losses',
    'duel_draws',
    'duel_rating'
  ];
  insertable_profile_columns constant text[] := array[
    'id',
    'created_at',
    'nick',
    'nickname',
    'xp',
    'minigry_xp',
    'level',
    'streak',
    'last_played_date',
    'avatar_url',
    'last_nick_update',
    'hearts',
    'school_class',
    'duel_played',
    'duel_wins',
    'duel_losses',
    'duel_draws',
    'duel_rating'
  ];
begin
  if to_regclass('public.profiles') is null then
    raise notice 'pomijam granty zapisu profiles - tabela nie istnieje';
    return;
  end if;

  foreach profile_column in array writable_profile_columns
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = profile_column
    ) then
      execute format(
        'grant update (%I) on table public.profiles to authenticated',
        profile_column
      );
    end if;
  end loop;

  foreach profile_column in array insertable_profile_columns
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = profile_column
    ) then
      execute format(
        'grant insert (%I) on table public.profiles to authenticated',
        profile_column
      );
    end if;
  end loop;
end $$;
