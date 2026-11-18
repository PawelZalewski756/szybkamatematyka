-- Rozróżnienie Pro kupionego w Stripe od Pro przyznanego ręcznie (gift/manual).
--
-- Cel:
-- 1. Użytkownik z Pro od Stripe może wejść do Stripe Customer Portal.
-- 2. Użytkownik z Pro przyznanym (np. miesiąc za zgłoszenie błędu) NIE ma
--    subskrypcji Stripe, więc nie może jej anulować; portal jest dla niego
--    zablokowany w API i ukryty w UI.
-- 3. Pro przyznane ręcznie wygasa po subscription_current_period_end.

alter table public.profiles
  add column if not exists pro_source text not null default 'none';

alter table public.profiles
  add column if not exists pro_granted_reason text;

-- Backfill: subskrypcje Stripe mają stripe_subscription_id; aktywne Pro bez
-- Stripe to najpewniej wcześniejsze granty ręczne.
update public.profiles
set pro_source = case
  when stripe_subscription_id is not null and length(trim(stripe_subscription_id)) > 0 then 'stripe'
  when subscription_status in ('active', 'trialing') then 'manual'
  else coalesce(pro_source, 'none')
end
where pro_source = 'none';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_pro_source_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_pro_source_check
      check (pro_source in ('none', 'stripe', 'gift', 'manual'));
  end if;
end $$;

comment on column public.profiles.pro_source is
  'Źródło Pro: none | stripe (płatna subskrypcja) | gift (prezent/ręczny grant) | manual (wsparcie).';
comment on column public.profiles.pro_granted_reason is
  'Opcjonalny powód przyznania Pro (np. rekompensata za zgłoszenie błędu).';

-- RPC dla właściciela konta: zwraca też pro_source i wygasza gift po terminie.
-- PostgreSQL nie pozwala zmienić typu zwracanego przez CREATE OR REPLACE,
-- dlatego najpierw usuwamy starą wersję funkcji (4 kolumny -> 5 kolumn).
drop function if exists public.get_my_subscription();

create or replace function public.get_my_subscription()
returns table (
  subscription_status text,
  subscription_plan text,
  subscription_current_period_end timestamptz,
  subscription_cancel_at_period_end boolean,
  pro_source text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when p.pro_source in ('gift', 'manual')
        and p.subscription_current_period_end is not null
        and p.subscription_current_period_end < now()
      then 'free'::text
      else p.subscription_status
    end as subscription_status,
    p.subscription_plan,
    p.subscription_current_period_end,
    p.subscription_cancel_at_period_end,
    p.pro_source
  from public.profiles p
  where p.id = auth.uid();
$$;

revoke all on function public.get_my_subscription() from public;
grant execute on function public.get_my_subscription() to authenticated;
