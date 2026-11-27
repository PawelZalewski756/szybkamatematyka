-- Naprawa zadań wyboru, w których poprawna odpowiedź nie występowała w opcjach.
-- Zamiast usuwać zadanie, podmieniamy błędną opcję na poprawną i ustawiamy klucz.
-- Uruchom w Supabase SQL Editor po przejrzeniu. Wartości policzone solverem.
--
-- Uwaga: 9fa1e3ee miało w opcjach całe rozwiązanie zamiast liczby - podmieniamy
-- tę opcję na czysty wynik 19/8.

begin;

-- 1 2/5 + 2 1/3 = 56/15 = 3 11/15
update public.tasks
set options = array_replace(options, '$3\frac{7}{15}$', '$3\frac{11}{15}$'),
    correct_answer = '$3\frac{11}{15}$'
where id = '0e3d9736-6bf9-4387-8764-e35477eb7c50';

-- 3/4 - 1/2 * (1 - 1/3) = 5/12
update public.tasks
set options = array_replace(options, '$\frac{5}{6}$', '$\frac{5}{12}$'),
    correct_answer = '$\frac{5}{12}$'
where id = '0f5fe2a7-97a7-4371-9160-2fc75257c10c';

-- 5/6 + 1/3 * 3/4 = 13/12
update public.tasks
set options = array_replace(options, '$\frac{11}{12}$', '$\frac{13}{12}$'),
    correct_answer = '$\frac{13}{12}$'
where id = '1e3ba50d-903a-4274-a1fd-303b6117ad3f';

-- 5 - (3 - 7) = 9
update public.tasks
set options = array_replace(options, '$5$', '$9$'),
    correct_answer = '$9$'
where id = 'f4fa9dd6-2832-44fe-81d4-ff4b823d695f';

-- 1 1/4 - 3/8 = 7/8
update public.tasks
set options = array_replace(options, '$1\frac{1}{8}$', '$\frac{7}{8}$'),
    correct_answer = '$\frac{7}{8}$'
where id = 'fd0f1122-8a7d-41dd-b204-9216930f1b4f';

-- 3/4 + 1/2 * 2/3 - 1/6 = 11/12
update public.tasks
set options = array_replace(options, '$\frac{2}{3}$', '$\frac{11}{12}$'),
    correct_answer = '$\frac{11}{12}$'
where id = '38890e68-22d2-46e1-9f28-7dbceec7d178';

-- 10 + 2 * [15 - (3+4)^2 : 7] = 26
update public.tasks
set options = array_replace(options, '30', '26'),
    correct_answer = '26'
where id = '8bf4d0ff-7707-4a79-a75c-0d3c47724177';

-- (2^10 * 3^5) / 6^5 = 32
update public.tasks
set options = array_replace(options, '1024', '32'),
    correct_answer = '32'
where id = 'dd7cbca7-bb8a-4aba-bbd2-1c03e7d2cbd6';

-- log_3 243 / log_3 9 = 5/2
update public.tasks
set options = array_replace(options, '3', '5/2'),
    correct_answer = '5/2'
where id = 'b34c405f-61ba-47ff-9523-52d61a3f2381';

-- 7 * 1/2 - 3/4 : 3/2 = 19/8
update public.tasks
set options = array_replace(
    options,
    '$7 \cdot \frac{1}{2} - \frac{3}{4} \cdot \frac{3}{2} = \frac{7}{2} - \frac{9}{8} = \frac{28}{8} - \frac{9}{8} = \frac{19}{8}$',
    '$\frac{19}{8}$'
  ),
    correct_answer = '$\frac{19}{8}$'
where id = '9fa1e3ee-11e3-4337-99d7-786f8c1847de';

commit;

-- Weryfikacja: każdy klucz powinien być w opcjach.
select id, correct_answer, options
from public.tasks
where id in (
  '0e3d9736-6bf9-4387-8764-e35477eb7c50',
  '0f5fe2a7-97a7-4371-9160-2fc75257c10c',
  '1e3ba50d-903a-4274-a1fd-303b6117ad3f',
  'f4fa9dd6-2832-44fe-81d4-ff4b823d695f',
  'fd0f1122-8a7d-41dd-b204-9216930f1b4f',
  '38890e68-22d2-46e1-9f28-7dbceec7d178',
  '8bf4d0ff-7707-4a79-a75c-0d3c47724177',
  'dd7cbca7-bb8a-4aba-bbd2-1c03e7d2cbd6',
  'b34c405f-61ba-47ff-9523-52d61a3f2381',
  '9fa1e3ee-11e3-4337-99d7-786f8c1847de'
);
