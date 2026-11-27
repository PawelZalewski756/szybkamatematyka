# Naprawa `solved_tasks` - wszyscy mają 0 zadań

## Objaw

- `/users` w Telegramie pokazuje 0 zadań u wszystkich,
- w `solved_tasks` są tylko stare wiersze jednego konta,
- użytkownicy są zalogowani (`last_sign_in_at` nie jest NULL),
- `task_id` jest typu `text`.

To oznacza, że **nowe inserty są odrzucane**, a nie że licznik źle liczy.

## Co robi repair

Plik:

[`supabase/sql-editor/2026-11-18-repair-solved-tasks.sql`](../supabase/sql-editor/2026-11-18-repair-solved-tasks.sql)

Idempotentnie:

1. usuwa FK z `solved_tasks.task_id` (cache/minigry mają ID spoza `tasks`),
2. zmienia `task_id` na `text`,
3. dodaje/uzupełnia `source` i ustawia default `trening`,
4. ustawia `solved_at default now()`,
5. odtwarza constraint źródeł,
6. odtwarza polityki RLS `select_own` / `insert_own`,
7. nadaje uprawnienia `authenticated` i `service_role`,
8. odświeża cache PostgREST,
9. pokazuje licznik.

## Jak uruchomić

Supabase → SQL Editor → wklej całość → **Run**.

Na końcu zobaczysz:

```
wszystkie | uczniowie | trening | minigry | baza | cke
```

## Test po naprawie

1. Zaloguj się na konto, które ma 0.
2. Rozwiąż jedno zadanie w treningu.
3. Rozwiąż jedno poprawne pytanie w minigrze.
4. Uruchom:

```sql
select u.email, count(s.task_id) as zadania
from auth.users u
left join public.solved_tasks s on s.user_id = u.id
group by u.email
order by zadania desc;
```

Liczba powinna wzrosnąć o 2 (trening + minigra).

## Jeśli nadal 0

W konsoli przeglądarki po rozwiązaniu zadania sprawdź:

```
[szybka-matma] recordTaskCompletion: ...
```

Wklej mi dokładny błąd - będzie zawierał kod PostgREST/RLS.
