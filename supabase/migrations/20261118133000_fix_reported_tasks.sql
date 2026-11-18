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

  select coalesce(
           jsonb_agg(
             case
               when e.value = p_old then to_jsonb(p_correct)
               else to_jsonb(e.value)
             end
             order by e.ord
           ),
           '[]'::jsonb
         )
    into v_new
    from jsonb_array_elements_text(v_options) with ordinality as e(value, ord);

  if not exists (
    select 1 from jsonb_array_elements_text(v_new) as x(value)
    where x.value = p_correct
  ) then
    v_new := v_new || to_jsonb(p_correct);
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
