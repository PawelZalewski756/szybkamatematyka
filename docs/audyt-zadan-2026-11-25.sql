-- Audyt zadań — poprawki (25.11.2026)
-- Część 1: odpowiedzi, które da się poprawić automatycznie.
-- Część 2: zadania wymagające ręcznej decyzji (brak poprawnej opcji / zła forma).
-- Część 3: walec — treść mówi π≈3,14, klucz liczony z π (69 zadań).
--
-- Uruchamiaj w Supabase SQL Editor. Najpierw przejrzyj część 2.

begin;

-- ===== 1. POPRAWNE ODPOWIEDZI =====
update public.tasks set correct_answer = '6/5' where id = '15da8d93-e415-4f1b-b476-d7c4236318ed'; -- Oblicz wartość wyrażenia $ \left( 3^{-1} + 2^{-1} \right)^{-1} $. Wynik zapisz w
update public.tasks set correct_answer = '$-1$' where id = 'd7ff6600-dc49-4ed4-a56a-4e8c937cac2f'; -- Oblicz wartość wyrażenia $a^2 - 2b$ dla $a = -3$ i $b = 5$.
update public.tasks set correct_answer = '$$6$$' where id = 'db170f7d-d910-432e-ac75-2ebd898bc192'; -- Oblicz wartość wyrażenia $$(-1)^3 + (-2)^2 - (-3)^1$$.
update public.tasks set correct_answer = '20/7' where id = 'f5542699-222a-43ba-ac2a-936ab66f2b12'; -- Oblicz wartość wyrażenia $\sqrt{\frac{25}{49}} \cdot \sqrt{16}$.
update public.tasks set correct_answer = '2' where id = '2cf4aa42-2413-4047-94cc-35746bd6449c'; -- Oblicz wartość wyrażenia $\log_6 12 + \log_6 3$.
update public.tasks set correct_answer = '4' where id = '41255137-c8d5-4efb-8a5a-96316c76fd5a'; -- Oblicz wartość wyrażenia $\log_3 81$.
update public.tasks set correct_answer = '13/12' where id = '632c16cb-e5da-4c58-a9d7-864ca0e109ef'; -- Oblicz wartość wyrażenia $$ \frac{3}{4} + \frac{1}{2} \times \frac{2}{3} $$
update public.tasks set correct_answer = '12' where id = '8f3d8860-908c-4d4d-a4e2-34d40f6a7dd8'; -- Oblicz wartość wyrażenia $|-7| + |5 - 12| - |-3 - (-1)|$.
update public.tasks set correct_answer = '11' where id = '9b96bc7a-80f8-49fd-8c0b-da49855c863c'; -- Oblicz wartość wyrażenia $|-12| + |5 - 9| - |3 - (-2)|$.
update public.tasks set correct_answer = '$2\sqrt{17} - 7$' where id = '9c3365ee-e546-42cf-a210-1986e88b7ea5'; -- Oblicz wartość wyrażenia $|3 - \sqrt{17}| + |\sqrt{17} - 4|$.
update public.tasks set correct_answer = '-24' where id = '7c759f3c-0c8e-403d-9788-1f269d287a5e'; -- Oblicz wartość wyrażenia: 2*(15-3*(7-4)^2)
update public.tasks set correct_answer = '7' where id = '9c99b99d-e530-4a22-9225-caf3c9db159d'; -- |-5|+|3-8|-|2-(-1)|

-- ===== 2. RĘCZNIE (nie uruchamiaj bez decyzji) =====
-- RĘCZNIE (zadanie wyboru): 0e3d9736-6bf9-4387-8764-e35477eb7c50 — poprawna wartość 3.7333 nie występuje w opcjach; popraw opcje lub usuń zadanie. -- Oblicz wartość wyrażenia $1\frac{2}{5} + 2\frac{1}{3}$.
-- RĘCZNIE (zadanie wyboru): 0f5fe2a7-97a7-4371-9160-2fc75257c10c — poprawna wartość 0.4167 nie występuje w opcjach; popraw opcje lub usuń zadanie. -- Oblicz wartość wyrażenia: $\frac{3}{4} - \frac{1}{2} \cdot (
-- RĘCZNIE (zadanie wyboru): 1e3ba50d-903a-4274-a1fd-303b6117ad3f — poprawna wartość 1.0833 nie występuje w opcjach; popraw opcje lub usuń zadanie. -- Oblicz wartość wyrażenia: $\frac{5}{6} + \frac{1}{3} \times 
-- RĘCZNIE (zadanie wyboru): f4fa9dd6-2832-44fe-81d4-ff4b823d695f — poprawna wartość 9.0000 nie występuje w opcjach; popraw opcje lub usuń zadanie. -- Oblicz wartość wyrażenia $$ 5 - (3 - 7) $$.
-- RĘCZNIE (zadanie wyboru): fd0f1122-8a7d-41dd-b204-9216930f1b4f — poprawna wartość 0.8750 nie występuje w opcjach; popraw opcje lub usuń zadanie. -- Oblicz wartość wyrażenia: $1\frac{1}{4} - \frac{3}{8}$
-- RĘCZNIE (zadanie wyboru): 38890e68-22d2-46e1-9f28-7dbceec7d178 — poprawna wartość 0.9167 nie występuje w opcjach; popraw opcje lub usuń zadanie. -- Oblicz wartość wyrażenia: $\frac{3}{4} + \frac{1}{2} \times 
-- RĘCZNIE: 64c58215-a753-4162-bc26-39e80d84e2b4 — wynik 4.2451124978 nie jest prostym ułamkiem; popraw treść lub usuń zadanie. -- Oblicz wartość wyrażenia $3 \log_2 8 - \log_2 27$.
-- RĘCZNIE (zadanie wyboru): 8bf4d0ff-7707-4a79-a75c-0d3c47724177 — poprawna wartość 26.0000 nie występuje w opcjach; popraw opcje lub usuń zadanie. -- Oblicz wartość wyrażenia: $10 + 2 \times [15 - (3+4)^2 : 7]$
-- 9fa1e3ee-11e3-4337-99d7-786f8c1847de — zadanie wyboru z całym rozwiązaniem w opcjach; popraw treść/opcje.
-- dd7cbca7-bb8a-4aba-bbd2-1c03e7d2cbd6 — poprawne 32, w opcjach 6/1/1024/243; brak 32.
-- b34c405f-61ba-47ff-9523-52d61a3f2381 — poprawne 5/2, w opcjach 3/5/81/2; brak 5/2.
-- b1983103-8f0e-4896-83eb-23ddbc0dc2a3 — poprawne 12x (wyrażenie), klucz 2; zadanie źle skonstruowane.
-- Zadania bez poprawnej opcji / źle skonstruowane (11) — do przepisania albo usunięcia:
-- 0e3d9736-6bf9-4387-8764-e35477eb7c50
-- 0f5fe2a7-97a7-4371-9160-2fc75257c10c
-- 1e3ba50d-903a-4274-a1fd-303b6117ad3f
-- f4fa9dd6-2832-44fe-81d4-ff4b823d695f
-- fd0f1122-8a7d-41dd-b204-9216930f1b4f
-- 38890e68-22d2-46e1-9f28-7dbceec7d178
-- 8bf4d0ff-7707-4a79-a75c-0d3c47724177
-- 9fa1e3ee-11e3-4337-99d7-786f8c1847de
-- delete from public.tasks where id in (
--   '0e3d9736-6bf9-4387-8764-e35477eb7c50', '0f5fe2a7-97a7-4371-9160-2fc75257c10c',
--   '1e3ba50d-903a-4274-a1fd-303b6117ad3f', 'f4fa9dd6-2832-44fe-81d4-ff4b823d695f',
--   'fd0f1122-8a7d-41dd-b204-9216930f1b4f', '38890e68-22d2-46e1-9f28-7dbceec7d178',
--   '8bf4d0ff-7707-4a79-a75c-0d3c47724177', '9fa1e3ee-11e3-4337-99d7-786f8c1847de',
--   'dd7cbca7-bb8a-4aba-bbd2-1c03e7d2cbd6', 'b34c405f-61ba-47ff-9523-52d61a3f2381',
--   'b1983103-8f0e-4896-83eb-23ddbc0dc2a3'
-- );


-- Duże liczby (22) — klucz zaokrąglony; popraw treść/opcje ręcznie:
--   0e9dc912-7e97-48da-b264-76ca5cd63782 | Uprość $18^{5} * 18^{8}$
--   222ac43a-8783-4885-9026-8bce71cb82e5 | Oblicz $17^{6} * 17^{7}$
--   d5fd911e-08b9-41e0-8359-32b421418155 | Oblicz $17^{6} * 17^{7}$
--   d7bf2d77-0a59-457f-9386-7b89a8b5c1b3 | Uprość $18^{9} * 18^{4}$
--   e316ca83-7fef-4f56-b65f-de8f9ebf01eb | Uprość $9^{8} * 9^{9}$
--   ec5cbc34-c549-412f-abf5-71a152f72208 | Uprość $7^{10} * 7^{9}$
--   37e2ed32-c217-4047-8943-fcb85675fd71 | Uprość $9^{8} * 9^{9}$
--   41f3e620-abd1-4871-b845-ab8a040752f1 | Oblicz $17^{8} * 17^{5}$
--   46aff7fe-1354-46aa-acfd-d7c0654c2fd7 | Uprość $18^{9} * 18^{4}$
--   5047f6ef-356c-4b23-bf79-62acd4336b71 | Uprość $9^{10} * 9^{7}$
--   524f4222-f5e4-450c-a363-a02e4d4d7840 | Uprość $18^{5} * 18^{8}$
--   5492d17d-63fd-41cf-be0e-5b8a46335f42 | Uprość $7^{10} * 7^{9}$
--   6614157e-a138-4688-9edf-406547bcb31b | Uprość $18^{7} * 18^{6}$
--   742ac842-2dc5-476b-8652-267bb88cafc1 | Oblicz $17^{10} * 17^{3}$
--   79d56043-c23a-4ae9-87c9-f8110d399df9 | Uprość $18^{11} * 18^{2}$
--   7a5ebcf7-0dc3-4012-b4b0-4041b3ac9d69 | Oblicz $17^{4} * 17^{9}$
--   9d7cf0c9-dbc0-4e95-abd0-397db2b9d5bb | Uprość $9^{10} * 9^{7}$
--   a027c0e6-6502-4c4d-b55e-70f1fab7c656 | Oblicz $17^{8} * 17^{5}$
--   a51c67bc-1a40-4138-af5b-2cb2dca0d8ce | Uprość $18^{11} * 18^{2}$
--   b50e547d-d8ec-4ff9-a7c5-8b26ead0f47f | Uprość $18^{7} * 18^{6}$
--   b6549921-1e03-4151-a58f-0cf518862685 | Oblicz $17^{4} * 17^{9}$
--   bb314213-149d-423e-bf11-8800fa71d85d | Oblicz $17^{10} * 17^{3}$

-- ===== 3. WALEC: π≈3,14 -> π≈3,1416 =====
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '00859189-14fc-4da6-836f-235777fa60b6'; -- Objętość walca $r=11$, $h=7$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '0108e956-46a6-497f-82a1-6f46e8c9c8dc'; -- Objętość walca $r=10$, $h=10$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '01b38d0c-0303-4f05-91ec-943067c488ef'; -- Objętość walca $r=10$, $h=8$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '037fdf70-0a2f-4c62-9bb2-920f99e748ee'; -- Objętość walca $r=10$, $h=6$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '0a53d885-9df3-4da2-b35e-2e3704482529'; -- Objętość walca $r=10$, $h=14$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '168538d3-c992-4fa4-a847-096f5aeba935'; -- Objętość walca $r=9$, $h=15$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '16e88c61-645f-4c6d-9acd-a6cfee074894'; -- Objętość walca $r=7$, $h=13$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '17063903-dacf-47ff-b4aa-dba0d1bdf0c0'; -- Objętość walca $r=11$, $h=5$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '20b459bd-5ecd-4189-b440-9fbdf22c83af'; -- Objętość walca $r=6$, $h=8$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '23a0c40a-4e70-4713-96ff-d9b45ef33e2f'; -- Objętość walca $r=8$, $h=10$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '274215bb-0442-4c62-b08b-c37793fb5940'; -- Objętość walca $r=10$, $h=4$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'c961a817-0f6e-4de8-a905-3c28e403fb74'; -- Objętość walca $r=10$, $h=12$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'cc403b7e-80ca-4229-aa4e-f9a7af03f2c6'; -- Objętość walca $r=7$, $h=5$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'cdbf8e3f-0a65-4e71-bd15-3adef84180ce'; -- Objętość walca $r=8$, $h=10$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'cff7e212-5a0b-41df-a3d8-5246c00833d7'; -- Objętość walca $r=10$, $h=6$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'd37ba331-6ee9-4e94-971a-59b8321be6de'; -- Objętość walca $r=9$, $h=7$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'd76596ff-5d99-468e-848c-d2514cd1ea76'; -- Objętość walca $r=10$, $h=16$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'd93b6bec-fa5d-4fe0-85be-f45f09398a2d'; -- Objętość walca $r=9$, $h=9$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'e542e222-e7d7-4036-a884-6a6465161335'; -- Objętość walca $r=11$, $h=5$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'ec582f91-9d3e-407e-8c56-08e8adf83d51'; -- Objętość walca $r=6$, $h=16$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'ee0e7322-0745-43d6-bbd0-ce89a41bfd7d'; -- Objętość walca $r=11$, $h=11$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'f01e3bb2-4cd2-4e3c-871b-53e8dea43f22'; -- Objętość walca $r=6$, $h=6$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'f10e436f-36a3-45ba-926a-b1a98ddee029'; -- Objętość walca $r=10$, $h=4$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'f1b03beb-d3e9-4aa4-9fb3-0d0581a5c363'; -- Objętość walca $r=7$, $h=5$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'fcae8298-e946-4b1e-b412-c22341e73edb'; -- Objętość walca $r=9$, $h=15$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'fd6a7c3d-4950-4916-a0cf-dba3a89f4003'; -- Objętość walca $r=6$, $h=8$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'ffbb2787-9cd0-45f7-a08f-87e620e7c859'; -- Objętość walca $r=11$, $h=9$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '2fe6852b-256e-428a-9291-bd965c806856'; -- Objętość walca $r=4$, $h=10$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '345d742e-4bf6-4205-b784-0f5780d24008'; -- Objętość walca $r=9$, $h=13$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '35484e53-31e2-4529-aa36-7d78236322cc'; -- Objętość walca $r=11$, $h=13$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '35900a0c-90c9-41f3-b4cc-8b627a2addab'; -- Objętość walca $r=7$, $h=13$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '3a4f3029-e135-462e-afc0-24abbaf6af38'; -- Objętość walca $r=2$, $h=8$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '3cdca911-40b2-48bd-a922-af557ed6b2f0'; -- Objętość walca $r=10$, $h=14$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '436a0853-fdcb-4ae2-b0e6-30eca62780b4'; -- Objętość walca $r=10$, $h=8$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '44a6eb73-bcbc-451b-a39d-590ac20d6d8b'; -- Objętość walca $r=9$, $h=11$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '4e514ae6-5529-4316-8172-d2b88a2cf16f'; -- Objętość walca $r=11$, $h=7$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '591e13d4-578e-4661-a017-10337b447406'; -- Objętość walca $r=6$, $h=10$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '5a7f6d7b-e93e-4e2b-aad1-65a6248972b4'; -- Objętość walca $r=11$, $h=11$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '5d2ff7b8-8c7c-44ac-b0fd-98566dfd4a71'; -- Objętość walca $r=11$, $h=15$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '5e8d925e-9f05-424b-a450-71573903b015'; -- Objętość walca $r=4$, $h=14$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '5fa2e4d6-ea4b-471a-bdce-20423df45684'; -- Objętość walca $r=8$, $h=14$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '629226b7-5d1d-4478-ae70-79903477a71e'; -- Objętość walca $r=9$, $h=13$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '6419ca02-adcc-4faf-85e7-772a2900aa00'; -- Objętość walca $r=8$, $h=12$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '64e4e88d-fc35-47af-854d-f7a03983c1a8'; -- Objętość walca $r=11$, $h=13$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '6b0c8e71-4966-460e-b943-ace9eec83517'; -- Objętość walca $r=9$, $h=9$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '6efeca62-b031-4cd3-85cc-7ec323ae6ae7'; -- Objętość walca $r=10$, $h=16$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '754a718a-f631-4ae8-9f54-194ce899cf07'; -- Objętość walca $r=7$, $h=7$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '7c1089c2-36ac-4bb4-a69f-1971d65fad79'; -- Objętość walca $r=6$, $h=10$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '801c513e-ea89-4158-848b-d91ed27d477b'; -- Objętość walca $r=8$, $h=16$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '828db8fd-c139-4060-b2a5-d5ef217c820e'; -- Objętość walca $r=9$, $h=7$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '82a0784b-3f4c-4795-8e16-1689e644b8e2'; -- Objętość walca $r=10$, $h=12$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '8fa70adf-9787-4826-a646-0494b3146b8e'; -- Objętość walca $r=7$, $h=15$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '92b1b2c7-09f1-40e8-b797-886bee47adff'; -- Objętość walca $r=8$, $h=12$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '95916198-4c9e-4fcb-8052-a41ee4b7f5a2'; -- Objętość walca $r=4$, $h=6$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '96571b23-72ad-4d8d-9b8d-d6ed32976e7e'; -- Objętość walca $r=3$, $h=13$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '9a109104-6db4-45d4-974a-7c9c6fd0e677'; -- Objętość walca $r=7$, $h=11$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = '9f638502-5e74-4283-a669-fb3677bc6c53'; -- Objętość walca $r=7$, $h=15$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'a48d6c88-3ae5-4cd5-833f-5c18bbf9dddf'; -- Objętość walca $r=7$, $h=11$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'a7cd1a92-7f03-41a0-9c2a-95d6ae5b46d5'; -- Objętość walca $r=4$, $h=14$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'a7fb0031-b845-4a5d-a755-cc62f2fcddfa'; -- Objętość walca $r=11$, $h=9$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'a844a9e8-8cb4-459c-8f25-162de22330d8'; -- Objętość walca $r=2$, $h=8$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'a8e79417-34d6-4e58-919c-3578632bf8f9'; -- Objętość walca $r=6$, $h=6$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'ab1569f9-fd1e-4898-8c0f-ab0ec4a94bb7'; -- Objętość walca $r=4$, $h=10$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'ac380db8-85cf-498e-b149-62b76289c516'; -- Objętość walca $r=4$, $h=6$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'b723db51-4486-4ba2-adfb-0f40e395f974'; -- Objętość walca $r=6$, $h=12$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'baa8c8d4-351c-406d-ae2d-13db0712dd54'; -- Objętość walca $r=11$, $h=15$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'c1d8b88b-4ce5-46a3-ae58-e9562b054632'; -- Objętość walca $r=6$, $h=16$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'c522f2a7-521b-4c45-8b72-80ac090dab84'; -- Objętość walca $r=10$, $h=10$, $\pi\approx 3,14$
update public.tasks set content = replace(replace(content, '3{,}14', '3{,}1416'), '3,14', '3,1416') where id = 'c5ade569-9fcf-41e1-869e-9df8a0689b1e'; -- Objętość walca $r=8$, $h=14$, $\pi\approx 3,14$

commit;
