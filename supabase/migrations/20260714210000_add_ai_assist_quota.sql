-- Limit darmowych zapytań do asystenta AI (10 / miesiąc na konto free).
-- Aktualizowane wyłącznie przez API (/api/trening/task-assist) kluczem service_role.

alter table public.profiles
  add column if not exists ai_assist_period text;

alter table public.profiles
  add column if not exists ai_assist_count integer not null default 0;

comment on column public.profiles.ai_assist_period is
  'Okres rozliczeniowy zapytań AI (YYYY-MM, strefa Europe/Warsaw). NULL = brak zapytań w bieżącym miesiącu.';
comment on column public.profiles.ai_assist_count is
  'Liczba zapytań do asystenta AI w ai_assist_period (tylko plan darmowy; Pro bez limitu miesięcznego).';
