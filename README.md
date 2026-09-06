# Szybka Matematyka

Platforma do nauki matematyki: arkusze CKE, baza zadań, trening tematyczny, minigry i rankingi (matura + egzamin 8-klasisty).

Stack: **Next.js 16**, Supabase, Gemini, Vercel.

## Start lokalny

```bash
cp .env.example .env.local   # uzupełnij Supabase (+ opcjonalnie Gemini)
npm ci
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

## Najważniejsze komendy

| Komenda | Opis |
|---------|------|
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run build` | Build produkcyjny |
| `npm run test:e2e` | Smoke Playwright (lokalnie) |
| `npm run audit:cke` | Placeholdery rozwiązań CKE |
| `npm run audit:questions` | Jakość opcji MC w katalogu |
| `npm run seed:exam-archive` | Regeneracja archiwum CKE z cache |
| `npm run seed:tasks-parametric` | Parametryczne zadania → `data/tasks-cache` (bez Gemini) |
| `npm run seed:tasks-gemini` | Zadania Gemini (wymaga `GEMINI_API_KEY`) |
| `npm run seed:hour-quality` | Godzinna poprawa rozwiązań CKE |

Testy E2E budują aplikację bez publicznych zmiennych Supabase i sprawdzają ich
podanie dopiero przy uruchomieniu serwera. Aby wymusić osobny port oraz pełny
test ścieżki runtime lokalnie, ustaw `E2E_PORT`, np. w PowerShell:

```powershell
$env:E2E_PORT = "3001"
npm run test:e2e
```

Wdrożenie: zobacz [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Struktura

- `app/` — trasy Next.js (trening, baza, minigry, admin…)
- `data/cke-matura-cache/` — cache arkuszy CKE
- `data/tasks-cache/` — cache zadań treningowych
- `data/theory-cache/` — materiały teoretyczne
- `scripts/` — seed / audyt / Gemini
