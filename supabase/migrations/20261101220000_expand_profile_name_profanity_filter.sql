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
    'pierdol', 'pizda', 'pizdy', 'pizd', 'sukinsyn', 'skurwysyn', 'skurw',
    'spierdal', 'wypierdal', 'zajeb', 'odpierd', 'dupa', 'dupy', 'dupe',
    'cwel', 'debil', 'idiota', 'kretyn', 'szmata', 'pedal', 'ciota',
    'fuck', 'fucker', 'shit', 'crap', 'bitch', 'bastard', 'asshole',
    'dumbass', 'moron', 'loser', 'dick', 'cock', 'prick',
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
