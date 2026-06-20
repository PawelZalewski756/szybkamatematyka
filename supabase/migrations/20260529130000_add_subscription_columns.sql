-- Subskrypcja (Stripe): flaga statusu + powiązania w tabeli profiles.
-- Uruchom w Supabase → SQL Editor (po init_profiles_avatars.sql). Plik jest
-- idempotentny (add column if not exists), więc bezpieczny przy ponownym uruchomieniu.
--
-- Źródłem prawdy dla tych kolumn jest webhook Stripe (/api/stripe/webhook),
-- który aktualizuje je kluczem service_role (omija RLS).
--
-- UWAGA (do rozważenia osobno, poza tą migracją): jeśli istniejąca polityka RLS
-- pozwala użytkownikowi aktualizować własny wiersz profiles, to teoretycznie może
-- on sam ustawić subscription_status. Realny dostęp Pro i tak warto egzekwować
-- po stronie serwera/RLS na chronionych zasobach; webhook pozostaje źródłem prawdy.

alter table public.profiles
  add column if not exists subscription_status text not null default 'free';

alter table public.profiles
  add column if not exists subscription_plan text;

alter table public.profiles
  add column if not exists subscription_current_period_end timestamptz;

alter table public.profiles
  add column if not exists subscription_cancel_at_period_end boolean not null default false;

alter table public.profiles
  add column if not exists stripe_customer_id text;

alter table public.profiles
  add column if not exists stripe_subscription_id text;

-- Indeksy pod wyszukiwanie po identyfikatorach Stripe w webhooku.
create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);

create index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id);

comment on column public.profiles.subscription_status is
  'Kanoniczny status subskrypcji: free | active | trialing | past_due | canceled | incomplete (zapisywany przez webhook Stripe).';
comment on column public.profiles.subscription_plan is
  'Identyfikator planu z lib/subscription/plans.ts (np. pro, roczny) lub NULL dla planu darmowego.';
