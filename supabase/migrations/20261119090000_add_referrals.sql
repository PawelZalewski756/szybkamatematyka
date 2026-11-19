-- Program poleceń.
--
-- Zasady:
-- 1. Zaproszony podaje kod w linku (?ref=...), kod trafia do metadanych konta.
-- 2. Po potwierdzeniu e-maila powstaje wpis `pending` (bez nagrody).
-- 3. Cron kwalifikuje wpis, gdy konto zaproszonego ma >= 7 dni i >= 3
--    rozwiązane zadania. Dopiero wtedy zapraszający zbiera punkty.
-- 4. Za 2 zakwalifikowane osoby zapraszający dostaje 30 dni Pro (raz na konto).
--
-- E-mail sam w sobie nie jest barierą (temp-mail), dlatego nagroda wymaga
-- realnej aktywności, a nie tylko potwierdzenia skrzynki.

alter table public.profiles
  add column if not exists referral_code text;

alter table public.profiles
  add column if not exists referral_rewarded_at timestamptz;

-- Backfill dla istniejących kont (12 znaków hex = 48 bitów, brak kolizji
-- przy tej skali). Nowe konta dostają kod z defaultu.
update public.profiles
set referral_code = lower(substr(md5(id::text), 1, 12))
where referral_code is null;

alter table public.profiles
  alter column referral_code
  set default lower(substr(md5(gen_random_uuid()::text), 1, 12));

alter table public.profiles
  alter column referral_code set not null;

create unique index if not exists profiles_referral_code_key
  on public.profiles (referral_code);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  invited_user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  status text not null default 'pending'
    check (status in ('pending', 'qualified', 'rewarded', 'rejected')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  qualified_at timestamptz,
  rewarded_at timestamptz,
  constraint referrals_invited_user_key unique (invited_user_id),
  constraint referrals_no_self check (referrer_id <> invited_user_id)
);

create index if not exists referrals_referrer_status_idx
  on public.referrals (referrer_id, status);

create index if not exists referrals_pending_idx
  on public.referrals (status, confirmed_at)
  where status = 'pending';

alter table public.referrals enable row level security;

drop policy if exists referrals_select_own on public.referrals;
create policy referrals_select_own
  on public.referrals for select
  to authenticated
  using (referrer_id = auth.uid());

revoke all on table public.referrals from anon, authenticated;
grant select on table public.referrals to authenticated;

-- Nagroda: 30 dni Pro, raz na konto. Nie nadpisuje aktywnego Stripe.
create or replace function public.grant_referral_reward(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_qualified integer;
  v_end timestamptz;
begin
  select * into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return false;
  end if;

  if v_profile.referral_rewarded_at is not null then
    return false;
  end if;

  select count(*) into v_qualified
  from public.referrals
  where referrer_id = p_user_id and status = 'qualified';

  if v_qualified < 2 then
    return false;
  end if;

  -- Płatne Pro ma własny cykl w Stripe - nie dotykamy go.
  if v_profile.pro_source = 'stripe'
     and v_profile.stripe_subscription_id is not null
     and v_profile.subscription_status in ('active', 'trialing') then
    return false;
  end if;

  if v_profile.pro_source in ('gift', 'referral')
     and v_profile.subscription_current_period_end is not null
     and v_profile.subscription_current_period_end > now() then
    v_end := v_profile.subscription_current_period_end + interval '30 days';
  else
    v_end := now() + interval '30 days';
  end if;

  update public.profiles
  set
    subscription_status = 'active',
    subscription_plan = 'pro',
    subscription_current_period_end = v_end,
    subscription_cancel_at_period_end = false,
    pro_source = 'referral',
    pro_granted_reason = 'Program poleceń: 2 zakwalifikowanych znajomych',
    referral_rewarded_at = now()
  where id = p_user_id;

  update public.referrals
  set status = 'rewarded', rewarded_at = now()
  where referrer_id = p_user_id and status = 'qualified';

  return true;
end;
$$;

revoke all on function public.grant_referral_reward(uuid) from public;
grant execute on function public.grant_referral_reward(uuid) to service_role;

-- Kwalifikacja: konto zaproszonego >= 7 dni, potwierdzony e-mail, >= 3 zadania.
create or replace function public.qualify_referrals()
returns table (qualified integer, rewarded integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qualified integer := 0;
  v_rewarded integer := 0;
  v_referrer uuid;
begin
  update public.referrals r
  set status = 'qualified', qualified_at = now()
  where r.status = 'pending'
    and r.confirmed_at is not null
    and r.confirmed_at <= now() - interval '7 days'
    and exists (
      select 1
      from auth.users u
      where u.id = r.invited_user_id
        and u.email_confirmed_at is not null
        and u.created_at <= now() - interval '7 days'
    )
    and (
      select count(*)
      from public.solved_tasks s
      where s.user_id = r.invited_user_id
    ) >= 3;

  get diagnostics v_qualified = row_count;

  for v_referrer in
    select r.referrer_id
    from public.referrals r
    where r.status = 'qualified'
    group by r.referrer_id
    having count(*) >= 2
  loop
    if public.grant_referral_reward(v_referrer) then
      v_rewarded := v_rewarded + 1;
    end if;
  end loop;

  return query select v_qualified, v_rewarded;
end;
$$;

revoke all on function public.qualify_referrals() from public;
grant execute on function public.qualify_referrals() to service_role;

-- Po potwierdzeniu e-maila tworzymy wpis `pending`.
create or replace function public.handle_referral_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_referrer uuid;
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.email_confirmed_at is not null then
      return new;
    end if;
  end if;

  v_code := lower(trim(coalesce(new.raw_user_meta_data ->> 'referral_code', '')));
  if v_code !~ '^[a-z0-9]{6,12}$' then
    return new;
  end if;

  select p.id into v_referrer
  from public.profiles p
  where p.referral_code = v_code;

  if v_referrer is null or v_referrer = new.id then
    return new;
  end if;

  insert into public.referrals (
    referrer_id,
    invited_user_id,
    code,
    status,
    confirmed_at
  )
  values (v_referrer, new.id, v_code, 'pending', now())
  on conflict (invited_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_referral_insert on auth.users;
create trigger on_auth_user_referral_insert
  after insert on auth.users
  for each row execute function public.handle_referral_confirmation();

drop trigger if exists on_auth_user_referral_confirm on auth.users;
create trigger on_auth_user_referral_confirm
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_referral_confirmation();

revoke all on function public.handle_referral_confirmation() from public;

-- Statystyki dla karty w profilu. Nie ujawniamy danych zaproszonych osób.
create or replace function public.get_my_referral_stats()
returns table (
  referral_code text,
  pending_count integer,
  qualified_count integer,
  rewarded_count integer,
  referral_rewarded_at timestamptz,
  pro_until timestamptz,
  pro_source text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.referral_code,
    (count(r.id) filter (where r.status = 'pending'))::int,
    (count(r.id) filter (where r.status = 'qualified'))::int,
    (count(r.id) filter (where r.status = 'rewarded'))::int,
    p.referral_rewarded_at,
    p.subscription_current_period_end,
    p.pro_source
  from public.profiles p
  left join public.referrals r on r.referrer_id = p.id
  where p.id = auth.uid()
  group by p.id;
$$;

revoke all on function public.get_my_referral_stats() from public;
grant execute on function public.get_my_referral_stats() to authenticated;

-- Nowe źródło Pro.
alter table public.profiles
  drop constraint if exists profiles_pro_source_check;

alter table public.profiles
  add constraint profiles_pro_source_check
  check (pro_source in ('none', 'stripe', 'gift', 'manual', 'referral'));

comment on column public.profiles.referral_code is
  'Kod polecający (12 znaków), używany w linku /login?ref=...';

comment on column public.profiles.referral_rewarded_at is
  'Kiedy użytkownik odebrał nagrodę 30 dni Pro za polecenia.';

comment on column public.profiles.pro_source is
  'Źródło Pro: none | stripe | gift | manual | referral.';

-- get_my_subscription musi wygaszać także Pro z poleceń.
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
      when p.pro_source in ('gift', 'manual', 'referral')
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
