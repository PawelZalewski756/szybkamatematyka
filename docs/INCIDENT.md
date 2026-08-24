# Incydent danych lub awaria

Krótka procedura operatora serwisu. Nie zastępuje obowiązków z RODO — to
checklista, żeby nie działać z pamięci.

## 1. Izolacja

1. Ogranicz dostęp: rotacja kluczy Supabase (anon / service role), Stripe
   webhook secret, Gemini, Sentry.
2. W Vercel wyłącz lub przywróć poprzednią wersję, jeśli błąd jest w deployu.
3. Nie kasuj logów — będą potrzebne do zakresu.

## 2. Zakres

1. Co wyciekło albo co przestało działać: tabele, buckety, logi, DSN.
2. Czy dane osobowe (e-mail, nick, awatar) mogły trafić poza serwis.
3. Czas od-do i liczba kont.

## 3. Powiadomienia

- Wysokie ryzyko dla osób: zawiadomienie UODO w 72 h i informacja dla
  użytkowników (e-mail / komunikat w serwisie).
- Awaria bez wycieku: status na stronie lub krótka notka; nie obiecuj
  terminu, którego nie znasz.

## 4. Rollback

1. Vercel: poprzedni gotowy deploy.
2. Supabase: przywróć backup sprzed migracji, jeśli migracja zepsuła RLS.
3. Po rollbacku uruchom `GET /api/health` i smoke logowania.

## 5. Po incydencie

Zapisz: co się stało, co naprawiono, jaka migracja / klucz wymaga wymiany.
Uzupełnij tę listę, jeśli pojawi się stały kontakt e-mail administratora.
