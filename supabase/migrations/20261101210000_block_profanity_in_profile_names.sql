create or replace function public.nick_contains_profanity(value text)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  normalized text;
  term text;
  blocked_terms constant text[] := array[
    'kurwa', 'kurwy', 'kurew', 'kurwis',
    'chuj', 'chuja', 'chuje', 'chujek',
    'jebac', 'jebie', 'jebal', 'jebany', 'jebana', 'jebane', 'jebani',
    'pierdol', 'pizda', 'pizdy', 'pizd', 'sukinsyn', 'dupa', 'dupy', 'dupe',
    'spierdal', 'wypierdal', 'zajeb', 'odpierd',
    'fuck', 'shit', 'bitch', 'bastard', 'asshole', 'dick', 'cock',
    'pussy', 'cunt', 'motherfucker', 'bullshit', 'piss', 'pissing',
    'slut', 'whore'
  ];
begin
  normalized := lower(translate(
    coalesce(value, ''),
    'ąćęłńóśźż',
    'acelnoszz'
  ));
  normalized := translate(normalized, '01345@$!', 'oieasasi');
  normalized := regexp_replace(normalized, '[^a-z0-9]', '', 'g');

  foreach term in array blocked_terms
  loop
    if strpos(normalized, term) > 0 then
      return true;
    end if;
  end loop;

  return false;
end;
$$;

create or replace function public.reject_profane_profile_nick()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE'
    and new.nick is not distinct from old.nick
    and new.nickname is not distinct from old.nickname
  then
    return new;
  end if;

  if public.nick_contains_profanity(new.nick)
    or public.nick_contains_profanity(new.nickname)
  then
    raise exception using
      errcode = '23514',
      message = 'Nickname contains prohibited language.';
  end if;

  return new;
end;
$$;

revoke all on function public.nick_contains_profanity(text)
  from public, anon, authenticated;
revoke all on function public.reject_profane_profile_nick()
  from public, anon, authenticated;

drop trigger if exists profiles_reject_profane_nick on public.profiles;
create trigger profiles_reject_profane_nick
  before insert or update on public.profiles
  for each row execute function public.reject_profane_profile_nick();
