# Zgłoszenia błędów z 18.11.2026 — status

Cztery zgłoszenia dotyczyły tematu **„Kolejność wykonywania działań”**.
Zadania są w produkcyjnej tabeli `public.tasks` (nie w lokalnym cache), więc
poprawka idzie migracją, a nie plikiem JSON.

| ID zadania | Zgłoszenie | Poprawna odpowiedź | Status |
|---|---|---|---|
| `b11b2734-f3e1-46c0-9d9c-67257754ae85` | „odpowiedź 81” | `81` (było `113`) | migracja `20261118133000_fix_reported_tasks.sql` |
| `34c8fcc8-8218-40b8-a6dd-b4b848f228e0` | „33 prawie odpowiedź” | `33` | ta sama migracja |
| `ba4f578a-5919-4891-aa1f-94027f96f18f` | „nie wpisujecie poprawna odpowiedź 19” | `19` | ta sama migracja |
| `9424496e-e443-4a89-8504-ff7d5df26436` | „wynik to 18” | `18` | ta sama migracja |

Migracja jest idempotentna: poprawia `correct_answer`, a jeśli odpowiedź nie
ma jej w `options`, dopisuje ją. Obejmuje też 40 innych poprawek z audytu
arytmetyki (`docs/sql/fix-tasks-2026-11-18.sql`).

## Jednorazowo w Supabase SQL Editor

Pełny, idempotentny skrypt (wszystkie migracje + 30 dni Pro dla dwóch adresów):

[`supabase/sql-editor/2026-11-18-all-fixes-and-grant-pro.sql`](../supabase/sql-editor/2026-11-18-all-fixes-and-grant-pro.sql)

Wklej całość do Supabase → SQL Editor → Run. Na końcu są zapytania
weryfikacyjne (Pro, 4 zadania, statystyki, typy kolumn).

## Weryfikacja po deployu

```bash
# .env.local: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm run audit:reported-tasks
```

Oczekiwane: `Wszystkie 4 zgłoszone zadania są poprawne.`

## Rekompensata

Osoby zgłaszające dostają **30 dni Pro** (`pro_source = 'gift'`), bez karty
i bez subskrypcji Stripe. Nie mogą jej anulować w panelu Stripe — nie mają
tam czego anulować. Po 30 dniach dostęp wygasa automatycznie.

```bash
npm run grant:pro -- adres1@example.com adres2@example.com \
  --days=30 --reason="rekompensata za zgłoszenie błędu 2026-11-18"
```

## Mail

Szablon: [`docs/email-templates/przeprosiny-zgloszenie-bledu.md`](./email-templates/przeprosiny-zgloszenie-bledu.md)
oraz wersja HTML. Wysyłka:

```bash
BUG_REPORTER_EMAILS="adres1@example.com,adres2@example.com" \
  npx tsx scripts/sendBugReportApology.ts --send
```
