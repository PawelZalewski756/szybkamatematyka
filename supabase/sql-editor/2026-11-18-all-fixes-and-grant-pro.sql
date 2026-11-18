-- ============================================================================
-- Szybka Matematyka — wszystkie poprawki z 18.11.2026 + 30 dni Pro
--
-- Wklej CAŁY plik do Supabase -> SQL Editor -> Run.
-- Skrypt jest idempotentny: można go uruchomić ponownie.
--
-- Co robi:
--   1. tworzy/naprawia solved_tasks (tekstowe ID + źródło),
--   2. tworzy tabelę idempotencji powiadomień o kontach,
--   3. poprawia 44 zadania z audytu (w tym 4 zgłoszone przez użytkowników),
--   4. dodaje pro_source (Stripe / gift / manual) i RPC subskrypcji,
--   5. uzupełnia brakujące profile i odtwarza trigger handle_new_user,
--   6. dodaje RPC get_platform_stats (statystyki z auth.users),
--   7. przyznaje 30 DNI KALENDARZOWYCH Pro osobom z listy _gift_emails.
--
-- Na końcu są zapytania weryfikacyjne — ich wyniki pokażą, czy wszystko weszło.
-- ============================================================================

-- ============================================================================
-- 1. solved_tasks: tekstowe ID, źródło, bez FK do tasks
-- ============================================================================
-- Postęp areny: rozwiązane zadania (anti-XP-farm)
-- Uruchom w Supabase → SQL Editor (po init_tasks.sql)

create table if not exists public.solved_tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Tekstowy identyfikator: trening (UUID), arkusze CKE, minigry i inne.
  task_id text not null,
  source text not null default 'trening',
  solved_at timestamptz not null default now(),
  primary key (user_id, task_id)
);

create index if not exists solved_tasks_user_id_idx on public.solved_tasks (user_id);

alter table public.solved_tasks enable row level security;

drop policy if exists "solved_tasks_select_own" on public.solved_tasks;
create policy "solved_tasks_select_own"
  on public.solved_tasks for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "solved_tasks_insert_own" on public.solved_tasks;
create policy "solved_tasks_insert_own"
  on public.solved_tasks for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Postęp treningu: zadania spoza tabeli public.tasks.
--
-- Część zadań treningowych jest serwowana z cache (data/tasks-cache,
-- /api/trening/tasks) i nie musi istnieć w public.tasks. Klucz obcy
-- solved_tasks.task_id -> tasks.id blokował wtedy zapis (błąd 23503),
-- więc uczeń widział 0 rozwiązanych zadań, nie dostawał XP, a panel admina
-- i bot Telegram nie miały czego policzyć.
--
-- Po tej migracji solved_tasks przechowuje identyfikator zadania bez FK.
-- Identyfikatory z cache są UUID-ami, więc typ kolumny się nie zmienia.

do $$
declare
  constraint_name text;
begin
  if to_regclass('public.solved_tasks') is null then
    raise notice 'pomijam solved_tasks - tabela nie istnieje (uruchom init_solved_tasks.sql)';
    return;
  end if;

  for constraint_name in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.solved_tasks'::regclass
      and con.contype = 'f'
      and exists (
        select 1
        from unnest(con.conkey) as key(attnum)
        join pg_attribute att
          on att.attrelid = con.conrelid
         and att.attnum = key.attnum
        where att.attname = 'task_id'
      )
  loop
    execute format(
      'alter table public.solved_tasks drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

create index if not exists solved_tasks_solved_at_idx
  on public.solved_tasks (solved_at desc);

create index if not exists solved_tasks_user_solved_at_idx
  on public.solved_tasks (user_id, solved_at desc);

-- Statystyki platformy (panel admina / bot) liczą DISTINCT user_id oraz sumy
-- w oknach 7/30 dni - powyższe indeksy wystarczają przy typowej skali.

-- Jedna wspólna księga rozwiązań dla WSZYSTKICH źródeł zadań:
-- trening, baza zadań, arkusze CKE, diagnoza, powtórki, minigry, wyzwania,
-- pojedynki i szybka próba.
--
-- Powód: solved_tasks.task_id był UUID z FK do public.tasks. Zadania z cache,
-- arkuszy CKE i minigier mają identyfikatory tekstowe, więc zapis kończył się
-- błędem 23503/22P02 i nie trafiał ani do statystyk, ani do XP.

do $$
begin
  if to_regclass('public.solved_tasks') is null then
    raise notice 'pomijam solved_tasks - tabela nie istnieje';
    return;
  end if;

  alter table public.solved_tasks
    alter column task_id type text using task_id::text;

  alter table public.solved_tasks
    add column if not exists source text not null default 'trening';

  if not exists (
    select 1 from pg_constraint
    where conname = 'solved_tasks_source_check'
      and conrelid = 'public.solved_tasks'::regclass
  ) then
    alter table public.solved_tasks
      add constraint solved_tasks_source_check
      check (source in (
        'trening', 'baza-zadan', 'cke', 'diagnoza', 'powtorki',
        'minigra', 'wyzwanie', 'pojedynek', 'szybka-proba'
      ));
  end if;
end $$;

create index if not exists solved_tasks_source_idx
  on public.solved_tasks (source, solved_at desc);

-- ============================================================================
-- 2. Idempotencja powiadomień o nowych kontach
-- ============================================================================
create table if not exists public.signup_notification_deliveries (
  user_id uuid not null references auth.users(id) on delete cascade,
  telegram_admin_id text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, telegram_admin_id)
);

alter table public.signup_notification_deliveries enable row level security;
revoke all on table public.signup_notification_deliveries
  from public, anon, authenticated;
grant select, insert, delete on table public.signup_notification_deliveries
  to service_role;

comment on table public.signup_notification_deliveries is
  'Idempotency receipts for Telegram notifications sent after a new signup.';

-- ============================================================================
-- 3. Poprawki zadań (44 zadania, w tym 4 zgłoszone)
-- ============================================================================
-- Poprawki zadań zgłoszonych przez użytkowników (m.in. kolejność działań).
-- Idempotentne: jeśli odpowiedź już jest poprawna, nic się nie zmienia.
-- Uruchamiane przez CI przy deployu na master.
--
-- Zgłoszenia z 18.11.2026:
--   b11b2734-f3e1-46c0-9d9c-67257754ae85 -> 81
--   34c8fcc8-8218-40b8-a6dd-b4b848f228e0 -> 33
--   ba4f578a-5919-4891-aa1f-94027f96f18f -> 19
--   9424496e-e443-4a89-8504-ff7d5df26436 -> 18

create or replace function public.fix_task_answer(
  p_id uuid,
  p_correct text,
  p_old text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_options jsonb;
  v_new jsonb;
begin
  select options into v_options from public.tasks where id = p_id;
  if not found then
    return;
  end if;

  if v_options is null
     or jsonb_typeof(v_options) <> 'array'
     or jsonb_array_length(v_options) = 0 then
    update public.tasks set correct_answer = p_correct where id = p_id;
    return;
  end if;

  -- Zachowujemy oryginalne opcje (łącznie z dystraktorami), tylko je deduplikujemy.
  select coalesce(
           jsonb_agg(value order by ord),
           '[]'::jsonb
         )
    into v_new
    from (
      select distinct on (value) value, ord
      from jsonb_array_elements_text(v_options) with ordinality as e(value, ord)
      order by value, ord
    ) as unique_options;

  if not exists (
    select 1 from jsonb_array_elements_text(v_new) as x(value)
    where x.value = p_correct
  ) then
    v_new := v_new || to_jsonb(p_correct);

    -- Gdy stara odpowiedź była osobną opcją, usuwamy ją tylko wtedy, gdy
    -- trzeba zrobić miejsce na nową (max 4 opcje).
    if jsonb_array_length(v_new) > 4 and p_old is not null and p_old <> p_correct then
      select coalesce(jsonb_agg(value order by ord), '[]'::jsonb)
        into v_new
        from jsonb_array_elements_text(v_new) with ordinality as e(value, ord)
        where value <> p_old;
    end if;
  end if;

  update public.tasks
     set correct_answer = p_correct,
         options = v_new
   where id = p_id;
end;
$$;

revoke all on function public.fix_task_answer(uuid, text, text) from public;
revoke all on function public.fix_task_answer(uuid, text, text) from anon, authenticated;

select public.fix_task_answer('7534742b-8704-40e0-b0a3-d3743ff45bce', '18', '20');
select public.fix_task_answer('a513b58b-da21-4e65-beea-3859b03ac13f', '23', '7');
select public.fix_task_answer('76f657e1-af80-40cf-869e-182308a46373', '90', '190');
select public.fix_task_answer('fe7b64ee-662d-4e30-98be-eb2ce2620f09', '29', '38');
select public.fix_task_answer('afc659f5-ffca-44cc-9880-189702dc4589', '-0.6', '2');
select public.fix_task_answer('1af0622e-a101-4379-bf10-611d813e1833', '56', '58');
select public.fix_task_answer('27c6ef42-e4c3-42bd-9aa7-1d02112f7f4d', '-6.86', '-3');
select public.fix_task_answer('ccf5fc63-2d38-4a7b-ae15-3930d28f97b4', '46', '56');
select public.fix_task_answer('ef779769-e9b6-4d60-b033-1b0f39e3a42e', '-6', '10');
select public.fix_task_answer('965cd508-37d8-4ba4-83d9-e2dfa26a007e', '5', '7');
select public.fix_task_answer('b11b2734-f3e1-46c0-9d9c-67257754ae85', '81', '113');
select public.fix_task_answer('3ad58ee2-6eb5-4590-96b2-d2d633f4f6e8', '57', null);
select public.fix_task_answer('f3de92fd-206f-42c0-ac82-b27639f13232', '61', '65');
select public.fix_task_answer('ffe79e48-08d4-4059-9e25-ed14d287f82c', '241', '116');
select public.fix_task_answer('b614d580-d50e-4d61-8809-a98991394658', '23', '29');
select public.fix_task_answer('10c5152f-e275-4d60-93b4-2356acc8926c', '22', '18');
select public.fix_task_answer('e4388b8d-b697-4093-818a-2aac6bb57012', '12', null);
select public.fix_task_answer('804d31d0-d20f-48f1-b95c-9ee3eedcae91', '8', '5');
select public.fix_task_answer('218945ea-915e-4d0a-8b48-5364b17305a7', '-19', '-14');
select public.fix_task_answer('b17b1c59-9b76-48f8-a426-04565a42351d', '4', '20');
select public.fix_task_answer('b3ae9e6d-26b7-40cd-95ae-464ab8b97d8d', '31', '29');
select public.fix_task_answer('a1109b8a-21c3-4989-94c3-a1d1d74ce633', '22', '30');
select public.fix_task_answer('568336fe-ab31-44fb-8f65-9dabfcc298ba', '37', null);
select public.fix_task_answer('aa90ae1d-f332-4e92-9844-8b757ee59e30', '72', null);
select public.fix_task_answer('f0a42b32-cb61-46c5-9e10-4fccbe98a4b3', '24', '31');
select public.fix_task_answer('34c8fcc8-8218-40b8-a6dd-b4b848f228e0', '33', null);
select public.fix_task_answer('12e9fe25-cfc6-43ac-aa97-d7fd2d90055d', '16', '20');
select public.fix_task_answer('303a345a-d708-480e-88b8-838d4607fed7', '-3', '12');
select public.fix_task_answer('bcdedc82-6049-4aee-86a2-2a0457604286', '9', '6');
select public.fix_task_answer('4dafbbf6-37e1-4c92-b8c4-42682f263005', '61', '46');
select public.fix_task_answer('16e41697-0e15-41b4-9f69-cc9853fa132e', '67', '57');
select public.fix_task_answer('a38f33fd-0f56-402e-a01e-c86876ed2807', '78', null);
select public.fix_task_answer('4d706b05-12ce-4da4-bb66-f2e3b5398da3', '22', null);
select public.fix_task_answer('b9ec333d-1ef6-4cf2-bdbd-a92fb5e22625', '-274', null);
select public.fix_task_answer('325987ee-b6c3-45f7-bed5-12792409a379', '50', null);
select public.fix_task_answer('ba4f578a-5919-4891-aa1f-94027f96f18f', '19', null);
select public.fix_task_answer('3f6fa20f-6847-411d-af79-aea2c2fb1187', '33', null);
select public.fix_task_answer('807f646f-1738-4e18-8fe7-ec86d0e2143c', '13.29', null);
select public.fix_task_answer('74950420-542d-4e76-818a-3af976fd66f6', '9.9', null);
select public.fix_task_answer('046af79d-aa8b-4d94-be79-3c0dcbac407f', '0.68', null);
select public.fix_task_answer('9424496e-e443-4a89-8504-ff7d5df26436', '18', null);
select public.fix_task_answer('fd7c10de-7f98-4232-a8fa-1a830af39e5e', '43', null);
select public.fix_task_answer('a52a6d8f-1c4e-44b5-af75-31fdc02a7996', '128', '103');
select public.fix_task_answer('633cedff-b099-4640-8344-1a22f0b8b0a4', '91', '82');
drop function if exists public.fix_task_answer(uuid, text, text);

-- ============================================================================
-- 4. pro_source: Stripe / gift / manual + RPC subskrypcji
-- ============================================================================
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

-- ============================================================================
-- 5. Backfill profili, trigger handle_new_user, get_platform_stats
-- ============================================================================
-- 1. Uzupełnia brakujące profile dla kont, które istnieją w auth.users.
--    Objaw: /users w Telegramie pokazywał nowe konta, ale /stats liczył 0,
--    bo statystyki czytały profiles, a trigger nie utworzył wiersza.
-- 2. Odtwarza trigger handle_new_user, żeby kolejne konta też miały profil.
-- 3. Dodaje RPC get_platform_stats liczące konta z auth.users (nie tylko profiles).

insert into public.profiles (id, nick, nickname, xp, level, school_class)
select
  u.id,
  'gracz_' || replace(u.id::text, '-', ''),
  'gracz_' || replace(u.id::text, '-', ''),
  0,
  1,
  case
    when lower(coalesce(
      nullif(trim(u.raw_user_meta_data->>'school_level'), ''),
      nullif(trim(u.raw_user_meta_data->>'school_class'), '')
    )) in ('sp', 'klasa-1', 'klasa-2', 'klasa-3', 'klasa-4', 'klasa-5', 'klasa-6', 'klasa-7', 'klasa-8')
      then 'sp'
    when lower(coalesce(
      nullif(trim(u.raw_user_meta_data->>'school_level'), ''),
      nullif(trim(u.raw_user_meta_data->>'school_class'), '')
    )) in ('srednia', 'matura', 'liceum-1', 'liceum-2', 'liceum-3', 'liceum-4', 'technikum-1', 'technikum-2', 'technikum-3', 'technikum-4', 'technikum-5', 'zawodowa-1', 'zawodowa-2', 'zawodowa-3', 'zawodowa-4', 'zawodowa-5')
      then 'srednia'
    else null
  end
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_nick text;
  final_nick text;
  meta_school_class text;
begin
  meta_nick := coalesce(
    nullif(trim(new.raw_user_meta_data->>'nick'), ''),
    nullif(trim(new.raw_user_meta_data->>'nickname'), '')
  );
  final_nick := coalesce(
    meta_nick,
    'gracz_' || substring(replace(new.id::text, '-', ''), 1, 8)
  );

  meta_school_class := lower(coalesce(
    nullif(trim(new.raw_user_meta_data->>'school_level'), ''),
    nullif(trim(new.raw_user_meta_data->>'school_class'), '')
  ));
  if meta_school_class ~ '^klasa-[1-8]$' then
    meta_school_class := 'sp';
  elsif meta_school_class ~ '^(liceum-[1-4]|technikum-[1-5]|zawodowa-[1-5]|matura)$' then
    meta_school_class := 'srednia';
  elsif meta_school_class not in ('sp', 'srednia') then
    meta_school_class := null;
  end if;

  begin
    insert into public.profiles (
      id, nick, nickname, xp, level, school_class
    )
    values (
      new.id, final_nick, final_nick, 0, 1, meta_school_class
    )
    on conflict (id) do update set
      nick = coalesce(nullif(trim(excluded.nick), ''), public.profiles.nick),
      nickname = coalesce(
        nullif(trim(excluded.nickname), ''),
        public.profiles.nickname
      ),
      school_class = coalesce(
        public.profiles.school_class,
        excluded.school_class
      );
  exception
    when unique_violation then
      final_nick := 'gracz_' || replace(new.id::text, '-', '');
      insert into public.profiles (
        id, nick, nickname, xp, level, school_class
      )
      values (
        new.id, final_nick, final_nick, 0, 1, meta_school_class
      )
      on conflict (id) do nothing;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.get_platform_stats()
returns table (
  users_total bigint,
  users_new_7d bigint,
  users_new_24h bigint,
  profiles_total bigint,
  solved_total bigint,
  solved_7d bigint,
  active_users_7d bigint
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    (select count(*) from auth.users) as users_total,
    (select count(*) from auth.users where created_at >= now() - interval '7 days') as users_new_7d,
    (select count(*) from auth.users where created_at >= now() - interval '24 hours') as users_new_24h,
    (select count(*) from public.profiles) as profiles_total,
    (select count(*) from public.solved_tasks) as solved_total,
    (select count(*) from public.solved_tasks where solved_at >= now() - interval '7 days') as solved_7d,
    (select count(distinct user_id) from public.solved_tasks where solved_at >= now() - interval '7 days') as active_users_7d;
$$;

revoke all on function public.get_platform_stats() from public;
revoke all on function public.get_platform_stats() from anon, authenticated;
grant execute on function public.get_platform_stats() to service_role;

-- ============================================================================
-- 6. PRZYZNANIE 30 DNI KALENDARZOWYCH PRO
--
-- >>> TU EDYTUJESZ ADRESY E-MAIL (możesz dodać/uszunąć wiersz) <<<
-- ============================================================================

begin;

drop table if exists _gift_emails;
create temporary table _gift_emails (
  email text primary key,
  reason text not null default 'rekompensata za zgłoszenie błędu 2026-11-18'
);

insert into _gift_emails (email) values
  ('yashinaksyha85@gmail.com'),
  ('amelkaaa1606@gmail.com')
on conflict (email) do nothing;

do $$
declare
  r record;
  v_user_id uuid;
  v_status text;
  v_source text;
  v_stripe_sub text;
  v_end timestamptz;
begin
  for r in select email, reason from _gift_emails order by email loop
    select u.id into v_user_id
    from auth.users u
    where lower(u.email) = lower(r.email)
    limit 1;

    if v_user_id is null then
      raise notice 'POMINIETO %: brak konta w auth.users', r.email;
      continue;
    end if;

    -- Profil musi istnieć, żeby było co zaktualizować.
    insert into public.profiles (id, nick, nickname, xp, level, school_class)
    values (
      v_user_id,
      'gracz_' || replace(v_user_id::text, '-', ''),
      'gracz_' || replace(v_user_id::text, '-', ''),
      0,
      1,
      null
    )
    on conflict (id) do nothing;

    select
      coalesce(subscription_status, 'free'),
      coalesce(pro_source, 'none'),
      stripe_subscription_id
    into v_status, v_source, v_stripe_sub
    from public.profiles
    where id = v_user_id;

    -- Nie nadpisujemy aktywnego płatnego Pro ze Stripe.
    if v_stripe_sub is not null
       and v_status in ('active', 'trialing')
       and v_source = 'stripe' then
      raise notice 'POMINIETO %: aktywne płatne Pro Stripe', r.email;
      continue;
    end if;

    -- 30 dni kalendarzowych: ta sama godzina 30 dni później, czas Warszawy.
    v_end := (
      (now() at time zone 'Europe/Warsaw') + interval '30 days'
    ) at time zone 'Europe/Warsaw';

    update public.profiles
       set subscription_status = 'active',
           subscription_plan = 'pro',
           subscription_current_period_end = v_end,
           subscription_cancel_at_period_end = false,
           pro_source = 'gift',
           pro_granted_reason = r.reason
     where id = v_user_id;

    raise notice 'PRZYZNANO %: Pro do % (30 dni kalendarzowych, gift)',
      r.email, to_char(v_end at time zone 'Europe/Warsaw', 'YYYY-MM-DD HH24:MI');
  end loop;
end $$;

commit;

-- ============================================================================
-- 7. WERYFIKACJA — sprawdź wyniki tych zapytań
-- ============================================================================

-- 7.1. Pro dla zgłoszonych adresów (powinno być active/pro/gift i data ~+30 dni)
select
  lower(u.email) as email,
  p.subscription_status,
  p.subscription_plan,
  p.subscription_current_period_end,
  p.pro_source,
  p.pro_granted_reason,
  round(extract(epoch from (p.subscription_current_period_end - now())) / 86400.0, 1)
    as dni_do_konca
from auth.users u
join public.profiles p on p.id = u.id
where lower(u.email) in (select lower(email) from _gift_emails)
order by email;

-- 7.2. Cztery zgłoszone zadania (oczekiwane: 81, 33, 19, 18)
select id, correct_answer, options
from public.tasks
where id in (
  'b11b2734-f3e1-46c0-9d9c-67257754ae85',
  '34c8fcc8-8218-40b8-a6dd-b4b848f228e0',
  'ba4f578a-5919-4891-aa1f-94027f96f18f',
  '9424496e-e443-4a89-8504-ff7d5df26436'
)
order by id;

-- 7.3. Statystyki platformy (konta z auth.users, nie tylko profiles)
select * from public.get_platform_stats();

-- 7.4. Czy solved_tasks ma tekstowe ID i source
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'solved_tasks'
  and column_name in ('task_id', 'source')
order by column_name;

-- 7.5. Ile jest wszystkich rozwiązań i z jakich źródeł
select source, count(*) as rozwiazania
from public.solved_tasks
group by source
order by source;
