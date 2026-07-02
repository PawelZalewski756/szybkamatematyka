-- Dodaje created_at jeśli tabela powstała ze starszego schematu (opcjonalnie).
alter table public.materials
  add column if not exists created_at timestamptz default now();
