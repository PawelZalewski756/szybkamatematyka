-- 1. Poprawa zadania logarytmy (zgłoszenie użytkownika; dane osobowe usunięte).
--    log2(64) - log2(2) = 6 - 1 = 5, a w bazie było 32.
-- 2. 30 dni kalendarzowych Pro dla zgłaszającej.
-- Uruchom w Supabase → SQL Editor → Run. Idempotentne.
--
-- Adres e-mail usunięty z repozytorium (RODO). Jeśli odtwarzasz ten
-- historyczny skrypt, wpisz właściwy adres lokalnie w SQL Editor - nigdy
-- w pliku w repo. Placeholder poniżej celowo nie znajdzie konta.

update public.tasks
   set correct_answer = '5'
 where id = '17c88022-b528-42f1-bebf-ea65194697c9';

do $$
declare
  v_user_id uuid;
  v_status text;
  v_source text;
  v_period_end timestamptz;
  v_end timestamptz;
  v_email constant text := 'adres-usuniety@example.invalid';
  v_actual_email text;
begin
  select id, email into v_user_id, v_actual_email
    from auth.users
   where lower(btrim(email)) = lower(btrim(v_email))
   limit 1;

  if v_user_id is null then
    raise notice 'Adres usunięty z repo - uzupełnij lokalnie, aby przyznać Pro.';
    return;
  end if;

  select subscription_status, pro_source, subscription_current_period_end
    into v_status, v_source, v_period_end
    from public.profiles
   where id = v_user_id;

  -- Nie nadpisujemy aktywnego płatnego Stripe.
  if v_source = 'stripe' and v_status in ('active', 'trialing') then
    raise notice 'Pomijam % - aktywne płatne Pro Stripe', v_actual_email;
  else
    -- 30 dni kalendarzowych w Europe/Warsaw; istniejący gift wydłużamy.
    v_end := (now() at time zone 'Europe/Warsaw') + interval '30 days';
    if v_source = 'gift' and v_period_end is not null and v_period_end > now() then
      v_end := (v_period_end at time zone 'Europe/Warsaw') + interval '30 days';
    end if;
    v_end := v_end at time zone 'Europe/Warsaw';

    update public.profiles
       set subscription_status = 'active',
           subscription_plan = 'pro',
           subscription_current_period_end = v_end,
           subscription_cancel_at_period_end = false,
           pro_source = 'gift',
           pro_granted_reason = 'rekompensata za błędne zadanie logarytmy (17c88022-b528-42f1-bebf-ea65194697c9)'
     where id = v_user_id;

    raise notice 'Przyznano Pro % do %', v_actual_email, v_end;
  end if;
end $$;

-- Weryfikacja zadania
select id, content, correct_answer, options
  from public.tasks
 where id = '17c88022-b528-42f1-bebf-ea65194697c9';

-- Weryfikacja Pro (szukamy po powodzie grantu, nie po adresie e-mail)
select
  u.email,
  p.subscription_status as status,
  p.subscription_plan as plan,
  p.pro_source,
  to_char(p.subscription_current_period_end at time zone 'Europe/Warsaw', 'YYYY-MM-DD HH24:MI') as koniec,
  greatest(0, ceil(extract(epoch from (p.subscription_current_period_end - now())) / 86400))::int as dni,
  p.pro_granted_reason as powod
from auth.users u
join public.profiles p on p.id = u.id
where p.pro_granted_reason like '%17c88022-b528-42f1-bebf-ea65194697c9%';

-- Licznik solved_tasks po naprawie (osobno uruchom repair, jeśli jeszcze nie)
select count(*) as wszystkie, count(distinct user_id) as uczniowie
from public.solved_tasks;
