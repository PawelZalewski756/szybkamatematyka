-- Etykieta arkusza: miesiąc + rok zamiast numerów / ID zewnętrznych
alter table public.arkusze
  add column if not exists miesiac integer
  check (miesiac is null or (miesiac >= 1 and miesiac <= 12));

create index if not exists arkusze_rok_miesiac_idx
  on public.arkusze (rok desc, miesiac desc nulls last);
