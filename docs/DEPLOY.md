# Wdrożenie Szybka Matematyka

Checklist przed uruchomieniem produkcyjnym (Vercel + Supabase).

## 1. Zmienne środowiskowe (`.env.local` / Vercel)

Skopiuj z `.env.example` i uzupełnij:

| Zmienna | Wymagane | Opis |
|---------|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | tak | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tak | Klucz anon |
| `NEXT_PUBLIC_SITE_URL` | produkcja | np. `https://szybkamatematyka.pl` |
| `ADMIN_EMAILS` | tak | E-maile adminów (serwer) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | tak | To samo (gate UI `/admin`) |
| `GEMINI_API_KEY` | opcjonalnie | Generowanie rozwiązań CKE / API |
| `SUPABASE_SERVICE_ROLE_KEY` | webhook Stripe | Zapis subskrypcji (później) |
| `STRIPE_*` | później | Monetyzacja |

## 2. Migracje Supabase (SQL Editor, w kolejności)

Uruchom pliki z `supabase/migrations/`:

1. `20260529120000_harden_rls_admin_writes.sql`
2. `20260529130000_add_subscription_columns.sql`
3. `20260529135000_add_daily_challenges.sql`
4. `20260529140000_add_review_schedule.sql`
5. `20260529140100_init_duel_rooms.sql`
6. `20260529150000_audit_harden_new_tables_rls.sql`
7. `20260529160000_add_duel_results.sql`
8. `20260529161000_add_achievements.sql`
9. `20260714210000_add_ai_assist_quota.sql`
10. `20260824103000_production_security_baseline.sql` — uruchom jako ostatnią

Przed punktem 10 wykonaj backup i zapisz aktualny raport polityk RLS. Po
migracji sprawdź role `anon`, `authenticated` i konto admina. Aplikacja po tej
migracji zapisuje XP i wyniki pojedynków przez idempotentne RPC; bez migracji
nagrody pozostaną lokalne i UI pokaże błąd zapisu.

Następnie dodaj siebie do adminów:

```sql
insert into public.admin_emails (email)
values ('twoj@email.pl')
on conflict do nothing;
```

## 3. Treść CKE (rozwiązania)

```bash
npm run audit:cke                    # raport placeholderów
npm run seed:cke-matura -- --fill-solutions --replace   # Gemini → cache + DB
npm run seed:cke-matura -- --only=m25-maj --fill-solutions --replace  # jedna sesja
```

## 4. Jakość pytań

```bash
npm run audit:questions    # katalog lokalny (1275 zadań MC)
npm run audit:trening      # zadania areny w Supabase
npm test                   # testy jednostkowe banków
```

## 5. CI (GitHub Actions)

Pipeline `.github/workflows/ci.yml`: lint → typecheck → unit → audyty treści
→ audyt zależności runtime → build → Playwright smoke.

E2E lokalnie: najpierw `npx playwright install chromium`, następnie
`npm run test:e2e`. Skopiuj `.env.example` → `.env.local` albo pozwól
Playwrightowi użyć bezpiecznych placeholderów z `playwright.config.ts`.

## 6. Stripe (opcjonalnie, później)

1. Utwórz produkty/ceny w Stripe.
2. Ustaw `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`.
3. Webhook: `POST /api/stripe/webhook`.
4. `SUPABASE_SERVICE_ROLE_KEY` dla zapisu statusu subskrypcji.
