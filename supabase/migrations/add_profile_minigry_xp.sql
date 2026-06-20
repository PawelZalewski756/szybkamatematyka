-- Osobny licznik XP z minigier (ranking „Minigry”). Całkowite XP (profiles.xp) nadal obejmuje arenę + minigry.
alter table public.profiles
  add column if not exists minigry_xp integer not null default 0;

comment on column public.profiles.minigry_xp is 'Suma XP zdobyta wyłącznie w minigrach (do rankingu Minigry).';
