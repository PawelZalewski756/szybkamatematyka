-- Naprawa: dodaj source_id do ISTNIEJĄCEJ tabeli zadania (uruchom CAŁY plik w SQL Editor).
-- Błąd „column source_id does not exist” = tabela powstała ze starej migracji bez tej kolumny.

-- Krok 1: kolumna (musi być PRZED indeksem)
alter table public.zadania
  add column if not exists source_id text;

-- Krok 2: indeks (dopiero gdy kolumna istnieje)
drop index if exists public.zadania_source_id_unique_idx;

create unique index zadania_source_id_unique_idx
  on public.zadania (source_id)
  where source_id is not null;
