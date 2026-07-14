-- Naprawa starych slugów materials/tasks (przed drzewem CKE).
-- Uruchom PO theory-lessons-update.sql (UPSERT 55 tematów).

-- 1) exam_type 8-klasy
UPDATE public.materials SET exam_type = '8_klasa' WHERE exam_type = 'egzamin_8_klasisty';
UPDATE public.tasks SET exam_type = '8_klasa' WHERE exam_type = 'egzamin_8_klasisty';

-- 2) Matura: przeniesienie tematów z algebra → liczby_rzeczywiste
UPDATE public.materials SET category = 'liczby_rzeczywiste', topic = 'potegi'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'potegi';
UPDATE public.tasks SET category = 'liczby_rzeczywiste', topic = 'potegi'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'potegi';

UPDATE public.materials SET category = 'liczby_rzeczywiste', topic = 'logarytmy'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'logarytmy';
UPDATE public.tasks SET category = 'liczby_rzeczywiste', topic = 'logarytmy'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'logarytmy';

UPDATE public.materials SET category = 'liczby_rzeczywiste', topic = 'procenty'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'procenty';
UPDATE public.tasks SET category = 'liczby_rzeczywiste', topic = 'procenty'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'procenty';

UPDATE public.materials SET category = 'liczby_rzeczywiste', topic = 'wartosc_bezwzgledna'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'wartosc_bezwzgledna';
UPDATE public.tasks SET category = 'liczby_rzeczywiste', topic = 'wartosc_bezwzgledna'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'wartosc_bezwzgledna';

UPDATE public.materials SET category = 'liczby_rzeczywiste', topic = 'notacja_wykladnicza'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'notacja_wykladnicza';
UPDATE public.tasks SET category = 'liczby_rzeczywiste', topic = 'notacja_wykladnicza'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'notacja_wykladnicza';

UPDATE public.materials SET category = 'liczby_rzeczywiste', topic = 'kolejnosc_dzialan'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'kolejnosc_dzialan';
UPDATE public.tasks SET category = 'liczby_rzeczywiste', topic = 'kolejnosc_dzialan'
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra' AND topic = 'kolejnosc_dzialan';

-- 3) 8 klasa: arytmetyka → liczby
UPDATE public.materials SET category = 'liczby', topic = 'ulamki'
  WHERE exam_type = '8_klasa' AND category = 'arytmetyka' AND topic = 'ulamki';
UPDATE public.tasks SET category = 'liczby', topic = 'ulamki'
  WHERE exam_type = '8_klasa' AND category = 'arytmetyka' AND topic = 'ulamki';

-- 4) Usuń osierocone duplikaty po migracji (stare slugi)
DELETE FROM public.materials
  WHERE exam_type = 'matura_podstawowa' AND category = 'algebra'
    AND topic IN ('potegi', 'logarytmy', 'procenty', 'wartosc_bezwzgledna', 'notacja_wykladnicza', 'kolejnosc_dzialan');

DELETE FROM public.materials
  WHERE exam_type = '8_klasa' AND category = 'arytmetyka';

-- 5) exam_type legacy (jeśli jeszcze zostały wiersze)
