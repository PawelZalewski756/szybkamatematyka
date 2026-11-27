# AI-HANDOFF - Szybka Matematyka

> **Przeczytaj ten plik w całości przed pierwszą zmianą.**
> Ostatnia aktualizacja: **2026-11-17, 00:30 Europe/Warsaw**
> Repozytorium: `https://github.com/PawelZalewski756/szybkamatematyka`
> Aktywny branch: `chore/ocena-projektu-0-30`
> Ostatni commit na branchu: `c94520e` (`fdaa`)

> **Aktualizacja po sesji nocnej 17/18.11.2026:**
> praca poszła na branchu `chore/nocna-sesja-2026-11-17` w workspace
> `szybkamatematyka-master 3`. Workspace nie miał `.git`, więc dołączyłem
> prawdziwą historię z GitHuba (bez nadpisywania plików).
> 13 commitów, 539 testów jednostkowych, 68 E2E, build bez ostrzeżeń KaTeX,
> wszystkie audyty CI zielone. **Sekcje 2–3 poniżej opisują stan sprzed
> sesji.** Aktualny stan i poranny plan: `plan dzialania/RANO-2026-11-18.md`.

---

## 0. Najważniejsze w 60 sekund

1. To jest **prawdziwe repo Git**, nie ZIP. Pracujemy na branchu
   `chore/ocena-projektu-0-30`, **nigdy bezpośrednio na `master`**.
2. Na komputerze są **3 niezacommitowane pliki**:
   - `AI-HANDOFF.md` (nowy - ten dokument),
   - `components/diagnostyka/DiagnosticQuiz.tsx`,
   - `e2e/smoke.spec.ts`.
3. **Przed przeniesieniem na laptopa** trzeba je zacommitować i wypchnąć
   (`Push origin`). Inaczej laptop ich nie zobaczy.
4. Po sklonowaniu na laptopie:

   ```bash
   git clone https://github.com/PawelZalewski756/szybkamatematyka.git
   cd szybkamatematyka
   git checkout chore/ocena-projektu-0-30
   npm ci
   cp .env.example .env.local
   # uzupełnij .env.local
   npm run dev
   ```

5. **Nie kopiuj** `node_modules`, `.next`, `test-results`, `.env.local`.
   To wszystko odtwarza się lokalnie.
6. Domyślna zasada dla agenta AI: **nie commituj sam, chyba że użytkownik
   wyraźnie o to poprosi**. Użytkownik pracuje w GitHub Desktop i chce widzieć
   zmiany przed commitem.

---

## 1. Co to za projekt

**Szybka Matematyka** - polska platforma do nauki matematyki dla:

- **egzaminu ósmoklasisty** (`8_klasa`),
- **matury podstawowej** (`matura_podstawowa`),
- w przyszłości matury rozszerzonej i planów klasowych.

Główne funkcje:

- trening tematyczny z zadaniami i teorią,
- baza zadań i oficjalne arkusze CKE,
- diagnoza startowa,
- powtórki spaced repetition,
- minigry i wyzwania,
- plany Pro/Stripe,
- panel administratora i powiadomienia Telegram,
- generator sprawdzianów dla nauczycieli.

Technicznie:

- **Next.js 16.4.5 App Router**,
- **React 19.2.4**,
- **TypeScript 5** (strict),
- **Tailwind CSS 4**,
- **Supabase** (Auth, Postgres, RLS, Realtime),
- **Stripe** (subskrypcje),
- **Gemini** (rozwiązania/teoria),
- **Resend** (e-maile),
- **Telegram Bot API**,
- **Vercel** (deploy),
- **Vitest** (unit),
- **Playwright** (E2E).

### 1.1. Kontekst biznesowy z raportu

Najważniejsze liczby i wnioski z `docs/ocena-projektu-2026-11-16.md`:

| Metryka | Wartość |
|---|---|
| Zadania w produkcyjnej bazie | **12 847** |
| Zadania w statycznym cache | **2 261** |
| Materiały / lekcje | **80** |
| Arkusze CKE | **46** |
| Tematy | **76** |
| Ocena biznesowa „dziś” | **4,5/10** |
| Potencjał po fokusie | **7/10** |

Główne wnioski:

1. Projekt ma dużo funkcji, ale rozprasza się między E8, maturą, minigrami,
   B2B i AI.
2. Największe dziury produktowe to **plany klasowe**, **paywall**,
   **aktywacja nowego użytkownika** i **panel B2B**.
3. Strategia: wybrać jednego użytkownika (klasa 8 lub matura), jedną obietnicę
   (plan + egzamin) i jeden kanał (SEO + referral).
4. Technicznie projekt jest gotowy; biznesowo trzeba zawęzić zakres.

Dlatego w tym repo nie chodzi już o „dodanie kolejnej funkcji”, tylko o
domykanie konkretnych ścieżek i pilnowanie, żeby layout/testy nie pękały.

---

## 2. Aktualny stan repozytorium

| Element | Wartość |
|---|---|
| Branch roboczy | `chore/ocena-projektu-0-30` |
| HEAD | `c94520e` - `fdaa` |
| Poprzednie commity | `e6765e4 2 pr`, `468d027 Ocena projektu: paywall, diagnoza i data egzaminu` |
| Upstream | `origin/chore/ocena-projektu-0-30` |
| PR | otwarty PR dla tego brancha (sprawdź w GitHubie) |
| Wymagane checki | `Lint, typecheck & build`, `Playwright smoke` |
| Niezacommitowane | 2 zmienione pliki + 1 nowy (`AI-HANDOFF.md`) |
| Testy unit | **527 passed / 71 plików** |
| Playwright | pełny przebieg: **47 passed**; po dodaniu testu layoutu celowane **3 passed** |
| Build | **1195 stron**, exit 0 |
| Lint / typecheck | czysto |

### 2.1. Niezacommitowana zmiana

```text
M components/diagnostyka/DiagnosticQuiz.tsx
M e2e/smoke.spec.ts
?? AI-HANDOFF.md
```

To poprawka layoutu + dokument przekazania. W diagnozie feedback „Nie tym razem”
i przycisk „Następne pytanie” były elementami `inline-flex`, więc przy ~710 px
przycisk nachodził na tekst.

Zmiana:

- feedback: `inline-flex` → `flex`,
- przycisk: `flex w-fit` (nowa linia),
- `data-testid="diagnostic-feedback"`,
- `data-testid="diagnostic-choice"`,
- `data-testid="diagnostic-next"`,
- nowy test Playwright przy `width: 710`, który sprawdza, że bounding box
  przycisku zaczyna się poniżej feedbacku.

Rekomendowane commity (dwa, bo to dwie różne rzeczy):

```bash
# 1. poprawka layoutu
git add components/diagnostyka/DiagnosticQuiz.tsx e2e/smoke.spec.ts
git commit -m "Diagnoza: feedback i przycisk nie nachodzą na siebie"

# 2. dokument przekazania
git add AI-HANDOFF.md
git commit -m "Dodaj AI-HANDOFF dla pracy na laptopie"

git push origin chore/ocena-projektu-0-30
```

W GitHub Desktop możesz zrobić to samo w dwóch commitach. Jeśli chcesz jeden,
wpisz Summary: `Diagnoza: layout + handoff dla AI`, ale dwa są czytelniejsze.

### 2.2. Ważne foldery na desktopie

| Folder | Rola |
|---|---|
| `C:\Users\pafci\Downloads\szybkamatematyka-fix` | **prawdziwy klon Git** - tu pracujemy |
| `C:\Users\pafci\Downloads\szybkamatematyka-master(2)\szybkamatematyka-master` | snapshot z ZIP, **nie jest źródłem prawdy** |

Na laptopie **nie kopiuj ZIP-a**. Sklonuj repo z GitHuba.

---

## 3. Przenoszenie z desktopa na laptopa

### Wariant A - zalecany: przez GitHuba

1. Na desktopie dokończ commit poprawki layoutu.
2. Kliknij **Push origin**.
3. Na laptopie:

   ```bash
   git clone https://github.com/PawelZalewski756/szybkamatematyka.git
   cd szybkamatematyka
   git checkout chore/ocena-projektu-0-30
   npm ci
   cp .env.example .env.local
   ```

4. Uzupełnij `.env.local` (patrz sekcja 5).
5. `npm run dev`.

### Wariant B - bez pusha: patch

Na desktopie:

```bash
git diff > diagnostic-layout.patch
```

Przenieś `diagnostic-layout.patch` na laptopa, w repo:

```bash
git apply diagnostic-layout.patch
```

Patch zawiera tylko niezacommitowane zmiany. **Nie** zawiera commitów, które
już są na branchu.

### Czego NIE przenosić

- `node_modules/` - ogromne, platformowo zależne,
- `.next/` - build cache,
- `test-results/`, `playwright-report/`,
- `.env.local` - sekrety,
- `*.tsbuildinfo`,
- `data/*.log`.

Jeżeli kopiujesz cały folder, **musisz** skopiować także `.git/`. Bez tego to
nie jest repo Git.

---

## 4. Wymagania i pierwsze uruchomienie

### 4.1. Wymagania

- **Node.js 22** - plik `.nvmrc` zawiera `22`.
  CI używa Node 22. Lokalny Node 26 może działać, ale do reprodukcji CI użyj 22.
- **npm 11+** (albo zgodny z `package-lock.json`).
- **Git**.
- **GitHub Desktop** (opcjonalnie, ale użytkownik go używa).
- **Playwright Chromium** do E2E:

  ```bash
  npx playwright install chromium
  ```

  W CI używany jest Chrome z runnera (`channel: chrome`), lokalnie domyślnie
  Chromium.

### 4.2. Instalacja

Windows PowerShell:

```powershell
cd C:\Users\<ty>\Downloads
git clone https://github.com/PawelZalewski756/szybkamatematyka.git
cd szybkamatematyka
git checkout chore/ocena-projektu-0-30
npm.cmd ci
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
git clone https://github.com/PawelZalewski756/szybkamatematyka.git
cd szybkamatematyka
git checkout chore/ocena-projektu-0-30
npm ci
cp .env.example .env.local
```

### 4.3. Uruchomienie

```bash
npm run dev
```

Domyślnie: `http://localhost:3000`.

Build produkcyjny:

```bash
npm run build
npm run start
```

Uwaga: `build` używa `next build --webpack` (tak jest w `package.json`).

---

## 5. Zmienne środowiskowe

Plik: `.env.local` (ignorowany przez Git). Wzór: `.env.example`.

### 5.1. Wymagane do logowania i danych

| Zmienna | Znaczenie |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publiczny klucz anon |
| `SUPABASE_SERVICE_ROLE_KEY` | **tylko serwer**; seed, Stripe webhook, statystyki, Telegram `/users` |
| `NEXT_PUBLIC_SITE_URL` | np. `http://localhost:3000` lub domena produkcyjna |

### 5.2. Admin

| Zmienna | Znaczenie |
|---|---|
| `ADMIN_EMAILS` | lista e-maili adminów po przecinku |
| `NEXT_PUBLIC_ADMIN_EMAILS` | to samo po stronie klienta |

### 5.3. Operator / regulamin

| Zmienna | Znaczenie |
|---|---|
| `NEXT_PUBLIC_OPERATOR_NAME` | nazwa firmy/osoby |
| `NEXT_PUBLIC_OPERATOR_ADDRESS` | adres |
| `NEXT_PUBLIC_OPERATOR_NIP` | NIP |
| `NEXT_PUBLIC_OPERATOR_EMAIL` | e-mail operatora (opcjonalny; fallback kontakt) |

Bez tych danych sekcja „Dane operatora” **nie renderuje się**. Nie wymyślaj
danych firmy.

### 5.4. E-mail / Resend

| Zmienna | Znaczenie |
|---|---|
| `RESEND_API_KEY` | klucz Resend |
| `BUG_REPORT_TO` | odbiorca zgłoszeń i zapytań B2B |
| `BUG_REPORT_FROM` | nadawca; bez domeny zostaw `onboarding@resend.dev` |
| `WELCOME_EMAIL_FROM` | opcjonalny nadawca welcome email; wymaga zweryfikowanej domeny |

### 5.5. Telegram

| Zmienna | Znaczenie |
|---|---|
| `TELEGRAM_BOT_TOKEN` | token BotFather, bez prefiksu `bot` |
| `TELEGRAM_ADMIN_IDS` | numeryczne ID czatów, po przecinku |
| `TELEGRAM_WEBHOOK_SECRET` | sekret webhooka |
| `TELEGRAM_SETUP_SECRET` | jednorazowy Bearer do setupu |
| `TELEGRAM_SIGNUP_SECRET` | opcjonalny sekret backfillu powiadomień |

Administrator musi najpierw wysłać botowi `/start`, inaczej dostanie 403
„bot can't initiate conversation”.

### 5.6. Gemini / Stripe

| Zmienna | Znaczenie |
|---|---|
| `GEMINI_API_KEY` | rozwiązania/teoria |
| `GEMINI_MODEL` | domyślnie `gemini-2.5-flash-lite` |
| `GEMINI_MODEL_FALLBACK` | opcjonalny |
| `STRIPE_SECRET_KEY` | tylko serwer |
| `STRIPE_WEBHOOK_SECRET` | weryfikacja webhooka |
| `STRIPE_PRICE_PRO` | `price_...` dla Pro |
| `STRIPE_PRICE_ROCZNY` | `price_...` dla rocznego |

Bez env build nadal przechodzi - aplikacja czyta zmienne leniwie. Ale funkcje
zależne od Supabase/Stripe/Resend nie zadziałają.

---

## 6. Komendy i weryfikacja

### 6.1. Podstawowe

```bash
npm run dev          # dev server
npm run lint         # ESLint
npm test             # Vitest, 527 testów
npm run build        # build, 1195 stron
npm run test:e2e     # Playwright smoke
```

Typecheck bez `npx` (Windows bywa blokowany przez execution policy):

```bash
node node_modules/typescript/bin/tsc --noEmit
```

Na Windows, jeśli `npm`/`npx` jest blokowane:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
node node_modules/typescript/bin/tsc --noEmit
```

### 6.2. Oczekiwane wyniki

| Komenda | Oczekiwane |
|---|---|
| `npm test` | 527 passed / 71 plików |
| `npm run build` | 1195 stron, exit 0 |
| `npm run test:e2e` | 47+ passed (po dodaniu testu layoutu: 48) |
| `npm run lint` | brak błędów |
| `tsc --noEmit` | brak błędów |

### 6.3. CI uruchamia więcej niż lokalny `npm test`

W `.github/workflows/ci.yml` job `quality` uruchamia:

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm test`
4. `npm run audit:questions`
5. `npm run audit:tasks-cache`
6. `npm run audit:cke`
7. `npm run audit:render`
8. `npm run build`

Job `e2e` uruchamia `npm run test:e2e` na Ubuntu 24.04 z Chrome.

> Audyty mogą wymagać danych/env. W CI przechodzą bez sekretów; jeśli lokalnie
> wywalają się o Supabase, sprawdź, czy nie brakuje `.env.local` lub czy skrypt
> nie wymaga service role.

### 6.4. Playwright - ważne

- Config: `playwright.config.ts`.
- Domyślny port: `3000`; można zmienić `E2E_PORT`.
- `webServer` robi `node scripts/buildE2e.mjs && npm run start`.
- Lokalnie `reuseExistingServer: true`, więc jeśli dev server już działa,
  Playwright go użyje.
- W CI `CI=1`, retries 2, workers 1.
- Test layoutu diagnozy jest przy `width: 710`, bo tam występował overlap.

---

## 7. Architektura - co gdzie jest

### 7.1. Katalogi

| Katalog | Rola |
|---|---|
| `app/` | App Router: strony i API routes |
| `components/` | komponenty UI (client/server) |
| `lib/` | logika domenowa, Supabase, Stripe, trening, legal, e-mail |
| `data/` | lokalne cache/seed danych |
| `e2e/` | Playwright |
| `tests/` | Vitest |
| `supabase/` | migracje i konfiguracja |
| `scripts/` | seed/audyty/migracje danych |
| `docs/` | dokumentacja, w tym raport oceny |
| `types/` | typy DB |

### 7.2. Najważniejsze pliki

| Obszar | Plik |
|---|---|
| Raport oceny projektu | `docs/ocena-projektu-2026-11-16.md` |
| Trening + filtrowanie po klasie | `app/trening/page.tsx` |
| Plan klasy (mapowanie) | `lib/trening/class-plan.ts` |
| Plan klasy (UI) | `components/trening/ClassPlanView.tsx`, `app/plan-klasy/page.tsx` |
| Diagnoza | `components/diagnostyka/DiagnosticQuiz.tsx` |
| Data egzaminu | `lib/exam-date.ts`, `components/trening/ExamCountdown.tsx` |
| Baza zadań (server data) | `lib/baza-zadan/client-task.ts`, `app/baza-zadan/page.tsx` |
| CMS paywall | `components/baza-zadan/CmsTaskCard.tsx`, `app/api/trening/cms-solution/route.ts` |
| Wydruk z kluczem | `components/arkusze/PrintArchiveSheet.tsx`, `app/api/trening/arkusz-solutions/route.ts` |
| Regulamin/polityka | `app/regulamin/page.tsx`, `app/polityka-prywatnosci/page.tsx` |
| Operator | `lib/legal/operator.ts`, `components/info/OperatorDetails.tsx` |
| Welcome email | `lib/email/welcome.ts`, `app/api/signup/route.ts` |
| B2B formularz | `app/api/school-inquiry/route.ts`, `components/school/SchoolInquiryForm.tsx` |
| Panel nauczyciela | `app/dla-szkol/panel/page.tsx` |
| Matura rozszerzona | `app/matura-rozszerzona/page.tsx` |
| Testy E2E | `e2e/smoke.spec.ts` |
| CI | `.github/workflows/ci.yml` |

### 7.3. Model danych / paywall

- Statyczny katalog zadań żyje w `lib/baza-zadan/`.
- CMS: Supabase `zadania`, `arkusze`.
- `fetchZadaniaSafe` **nie selekcjonuje już `rozwiazanie`** - to celowe.
- Rozwiązania Pro pobierane są przez API:
  - `/api/trening/task-solution` - pojedyncze zadanie,
  - `/api/trening/cms-solution` - zadanie CMS,
  - `/api/trening/arkusz-solutions` - klucz całego arkusza.
- `toClientTask` usuwa `solutionSteps` przed wysłaniem do klienta.
- Paywall jest sprawdzany po stronie serwera przez `verifyTaskAssistRequest`.

Nie „upraszczaj” tego, wracając do przekazywania `rozwiazanie` w propsach -
to był realny wyciek treści Pro.

### 7.4. Plany klasowe

- `lib/trening/class-plan.ts` mapuje klasy na tematy z drzewa CKE.
- `/plan-klasy` pokazuje plan.
- `/trening` filtruje drzewo po `schoolClass` z `localStorage`.
- Klasy 1–3 nie mają planu - to świadoma decyzja, nie bug.
- Mapowanie jest **orientacyjne**, nie oficjalną podstawą programową.

---

## 8. Co zostało zrobione w tej sesji

### 8.1. Paywall i dane

- [x] `/baza-zadan` nie importuje katalogu do klienta.
- [x] `TaskSolverView` pobiera rozwiązanie z API tylko dla Pro.
- [x] `CmsTaskCard` pobiera `rozwiazanie` z `/api/trening/cms-solution`.
- [x] Wydruk `?klucz=1` pobiera klucz z `/api/trening/arkusz-solutions`.
- [x] `fetchZadaniaSafe` nie selekcjonuje `rozwiazanie`.
- [x] Testy endpointów paywalla.

### 8.2. Aktywacja i personalizacja

- [x] Diagnoza startowa `/diagnostyka` (8 pytań, wynik per dział).
- [x] Data egzaminu + licznik dni.
- [x] Data egzaminu w onboardingu.
- [x] „Plan na dziś” z diagnozą i licznikiem.
- [x] Plan dla klasy `/plan-klasy`.
- [x] Pełne filtrowanie `/trening` po klasie.
- [x] CTA „Diagnoza startowa” na stronie głównej.

### 8.3. Legal / B2B / e-mail

- [x] Zgody przy rejestracji (regulamin, polityka, 16 lat/opiekun).
- [x] `/api/signup` odrzuca rejestrację bez zgód.
- [x] Regulamin 3a (niepełnoletni) i 4a (odstąpienie).
- [x] Polityka prywatności 3a.
- [x] Sekcja „Dane operatora” konfigurowana env.
- [x] Welcome email przez Resend.
- [x] Panel nauczyciela `/dla-szkol/panel`.
- [x] Formularz B2B `/api/school-inquiry` z honeypotem.
- [x] Raport postępów do druku z profilu.

### 8.4. Jakość

- [x] Poprawka rejestracji w E2E (zgody).
- [x] Poprawka print CSS (`data-print-hide`, nie globalny `header`).
- [x] Poprawka layoutu diagnozy (feedback vs przycisk).
- [x] Test regresyjny layoutu przy 710 px.
- [x] Skip link i a11y quick wins.

---

## 9. Co jeszcze zostało - backlog

### P0 - dokończ przed kolejnym PR

| Zadanie | Pliki | Definition of Done |
|---|---|---|
| Commit + push poprawki layoutu diagnozy | `DiagnosticQuiz.tsx`, `e2e/smoke.spec.ts` | branch pushed, CI zielone |
| Macierz layoutu zadań 390/710/1280 | `e2e/` | testy wszystkich rendererów, brak overlapów |
| Prawdziwe dane operatora | `.env.local` / Vercel | sekcja „Dane operatora” widoczna |
| Weryfikacja domeny Resend | Resend dashboard | welcome email dochodzi do obcego adresu |

### P1 - produkt

| Zadanie | Uwagi |
|---|---|
| Pełna matura rozszerzona | obecnie strona z arkuszami; brak planu i zadań |
| Pełne B2B | klasy, uczniowie, wyniki, faktury; wymaga migracji i ról |
| E-mail reminders | obecnie przypomnienia w przeglądarce; brak e-maili |
| Pełny audyt a11y | kontrast, fokus w modalach, nawigacja klawiaturą |

### P2 - techniczne

| Zadanie | Uwagi |
|---|---|
| Refactor `powtorki` | `ReviewDashboard`/`ReviewSession`/`AddTasksPicker` nadal importują katalog do klienta |
| Raport rodzica | rozbudować print profile o kategorie i historię |
| SEO | canonical, sitemap, metadata dla nowych stron |
| Testy wizualne | screenshoty task cards |

---

## 10. Zasady pracy agenta AI

1. **Najpierw przeczytaj** ten plik oraz `docs/ocena-projektu-2026-11-16.md`.
2. Zanim zmienisz kod, **podsumuj stan** i powiedz, co zamierzasz zrobić.
3. Nie pracuj na `master`. Domyślny branch: `chore/ocena-projektu-0-30`.
4. **Nie commituj bez polecenia użytkownika.** Użytkownik używa GitHub Desktop
   i chce widzieć diff.
5. Jeden commit = jedna logiczna zmiana. Nie mieszaj layoutu, paywalla i legal.
6. Po zmianie uruchom:
   - `npm.cmd run lint`
   - `node node_modules/typescript/bin/tsc --noEmit`
   - `npm.cmd test -- --reporter=dot`
   - `npm.cmd run build`
   - przy zmianach UI: `npm.cmd run test:e2e`
7. Nie wprowadzaj sekretów do repo. `.env.local` jest ignorowany.
8. Nie wymyślaj danych operatora, treści matury rozszerzonej ani wyników B2B.
   Braki oznacz jako `TODO`/blocked.
9. Aktualizuj checklist w `docs/ocena-projektu-2026-11-16.md`.
10. Komunikaty i UI pisz po polsku; kod/typy po angielsku.

### Czego nie robić

- Nie pushuj na `master`.
- Nie rób `git push --force`.
- Nie commituj `node_modules`, `.next`, `.env.local`, `test-results`.
- Nie zmieniaj wszystkich plików naraz „bo ładniej”.
- Nie usuwaj `verifyTaskAssistRequest` ani serwerowego paywalla.
- Nie wracaj do przekazywania `rozwiazanie` w propsach klienta.

---

## 11. Git + GitHub Desktop - instrukcja krok po kroku

### 11.1. Zasady branchy

- `master` jest **chroniony** rulesetem `private` (id `24784074`).
- Wymagane: PR + checki `Lint, typecheck & build` i `Playwright smoke`.
- Reguły dotyczą **tylko** `~DEFAULT_BRANCH` (master). Branch
  `chore/ocena-projektu-0-30` sam nie ma reguł.
- Praca idzie przez branch + PR, nie direct push na master.

### 11.2. GitHub Desktop - pierwsze uruchomienie na laptopie

1. Zainstaluj GitHub Desktop.
2. **File → Clone repository**.
3. Wybierz `PawelZalewski756/szybkamatematyka`.
4. Ścieżka lokalna np. `C:\Users\<ty>\Documents\GitHub\szybkamatematyka`.
5. Po sklonowaniu: **Current branch → chore/ocena-projektu-0-30**.
6. **Fetch origin**, potem ewentualnie **Pull origin**.

### 11.3. GitHub Desktop - commit zmian

1. Otwórz repo.
2. Sprawdź **Current branch** (ma być `chore/ocena-projektu-0-30`).
3. Zakładka **Changes**.
4. Zaznacz pliki, które wchodzą do commita.
5. W polu **Summary** wpisz np.:

   ```text
   Diagnoza: feedback i przycisk nie nachodzą na siebie
   ```

6. W **Description** możesz dodać:

   ```text
   - feedback i CTA w osobnych liniach
   - test regresyjny Playwright przy 710 px
   ```

7. Kliknij **Commit to chore/ocena-projektu-0-30**.
8. Kliknij **Push origin**.

**Ważne:** GitHub Desktop wymaga niepustego Summary. Nie da się kliknąć
Commitu bez wpisania nazwy.

### 11.4. GitHub Desktop - PR

1. Po pushu pojawi się **Create Pull Request** (albo **View on GitHub**).
2. Base: `master`, compare: `chore/ocena-projektu-0-30`.
3. Opisz zmiany.
4. Utwórz PR.
5. Poczekaj na oba checki.
6. Merge dopiero, gdy są zielone.

### 11.5. Jeśli GitHub Desktop pokazuje błąd reguł przy pushu

Objaw:

```text
One or more rules apply to the branch and prevent pushing
```

Przyczyna: branch miał upstream ustawiony na `origin/master` (stary stan).

Naprawa w terminalu:

```bash
git branch --unset-upstream
git push origin chore/ocena-projektu-0-30
```

albo w GitHub Desktop:

1. **Repository → Repository settings**,
2. sprawdź remote,
3. **Fetch origin**,
4. ustaw upstream na `origin/chore/ocena-projektu-0-30`.

Aktualnie upstream jest już poprawny.

### 11.6. CLI - odpowiedniki

```bash
# stan
git status
git branch -vv
git log --oneline -5

# commit
git add <pliki>
git commit -m "krótki opis"
git push origin chore/ocena-projektu-0-30

# nowy branch
git checkout -b chore/nowy-temat
git push -u origin chore/nowy-temat
```

### 11.7. Konflikt

Jeśli GitHub Desktop pokaże konflikt:

1. Nie klikaj „force”.
2. Otwórz plik, rozwiąż konflikt ręcznie.
3. `git add <plik>`.
4. Kontynuuj commit.
5. Jeśli nie wiesz - zatrzymaj się i opisz problem.

---

## 12. CI/CD

`.github/workflows/ci.yml`:

- **quality** (`Lint, typecheck & build`):
  - lint, typecheck, unit, audyty, build,
- **e2e** (`Playwright smoke`):
  - Ubuntu 24.04, Chrome, `npm run test:e2e`,
- **production-preflight / migrations / deploy** tylko na `master`.

Branch protection:

- PR wymagany,
- checki wymagane,
- brak direct push na `master`.

Po pushu brancha zobaczysz:

- Vercel Preview Deployment,
- check `Lint, typecheck & build`,
- check `Playwright smoke`.

Jeśli `Playwright smoke` padnie, **nie merguj**. Odczytaj nazwę testu i
odtwórz lokalnie:

```bash
npm.cmd run test:e2e -- --grep "nazwa testu"
```

---

## 13. Znane pułapki

### PowerShell i `npm`

Na Windows `npm`/`npx` może być blokowane przez execution policy. Używaj:

```powershell
npm.cmd run lint
npm.cmd test
node node_modules/typescript/bin/tsc --noEmit
```

### Stale `.next`

Po przeniesieniu route'ów/plików TypeScript może zgłaszać TS2307. Wtedy:

```powershell
Remove-Item -Recurse -Force .next
node node_modules/typescript/bin/tsc --noEmit
```

### Node

CI używa Node 22 (`.nvmrc`). Lokalny Node 26 bywa OK, ale do reprodukcji CI
użyj 22.

### Playwright

- Port 3000 musi być wolny albo działa istniejący serwer.
- `npm run test:e2e` sam robi build + start.
- Jeśli testy są flaky, uruchom `--workers=1`.
- Nie commituj `test-results/`.

### Supabase

- Bez env build przejdzie, ale auth/dane nie zadziałają.
- `SUPABASE_SERVICE_ROLE_KEY` **nigdy** w kliencie.
- RLS: `solved_tasks` tylko własne wiersze; statystyki admina wymagają service role.

### Resend

- `onboarding@resend.dev` wysyła tylko na adres właściciela konta.
- Do uczniów potrzebna zweryfikowana domena + `WELCOME_EMAIL_FROM`.

### Telegram

- Bot nie napisze pierwszy; admin musi wysłać `/start`.
- `TELEGRAM_ADMIN_IDS` to numeryczne ID, nie username.

### Git

- Ostrzeżenia LF/CRLF są normalne na Windows; nie rób masowej konwersji.
- Nie commituj `.env.local`.
- Nie pushuj na master.

### Kodowanie

Pliki są UTF-8. Jeśli PowerShell pokazuje „krzaki”, to tylko wyświetlanie -
nie zapisuj ich ponownie w ANSI.

---

## 14. Definition of Done

Przed commitem:

- [ ] zmiana jest logicznie jednym tematem,
- [ ] `npm.cmd run lint` - 0 błędów,
- [ ] `node node_modules/typescript/bin/tsc --noEmit` - 0 błędów,
- [ ] `npm.cmd test -- --reporter=dot` - wszystkie przechodzą,
- [ ] `npm.cmd run build` - exit 0,
- [ ] przy UI: `npm.cmd run test:e2e` - przechodzi,
- [ ] nie ma sekretów w diffie,
- [ ] checklist w `docs/ocena-projektu-2026-11-16.md` zaktualizowany,
- [ ] commit message opisuje efekt, nie „fix”.

Przed pushem:

- [ ] branch to `chore/...`, nie `master`,
- [ ] upstream to `origin/chore/...`,
- [ ] PR opisany,
- [ ] CI zielone.

---

## 15. Gotowy prompt dla AI na laptopie

Skopiuj to do nowej sesji:

```text
Jesteś agentem pracującym nad projektem Szybka Matematyka.

Najpierw przeczytaj w całości:
1. AI-HANDOFF.md
2. docs/ocena-projektu-2026-11-16.md

Potem:
- sprawdź `git status`, `git branch -vv`, `git log --oneline -5`,
- powiedz, jaki jest aktualny branch i czy są niezacommitowane zmiany,
- nie commituj bez mojego polecenia,
- nie pushuj na master,
- pracuj na branchu `chore/ocena-projektu-0-30`.

Aktualne zadanie:
[TU WPISZ ZADANIE, np. „dokończ macierz testów layoutu zadań 390/710/1280”]

Zasady:
- najpierw plan, potem kod,
- jedna logiczna zmiana na commit,
- po zmianie uruchom lint, typecheck, testy i build,
- przy UI uruchom Playwright,
- nie wymyślaj danych operatora ani treści matury rozszerzonej,
- aktualizuj checklist w raporcie oceny.

Na koniec podaj:
- co zmieniłeś,
- jakie testy przeszły,
- co zostało,
- czy zmiany są gotowe do commita w GitHub Desktop.
```

---

## 16. Ściąga - najważniejsze komendy

```bash
# stan
git status
git branch -vv
git log --oneline -5

# instalacja
npm ci
cp .env.example .env.local

# dev
npm run dev

# jakość
npm run lint
node node_modules/typescript/bin/tsc --noEmit
npm test
npm run build

# E2E
npm run test:e2e
npm run test:e2e -- --grep "diagnoza"

# commit
git add <pliki>
git commit -m "opis"
git push origin chore/ocena-projektu-0-30
```

Windows:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
node node_modules/typescript/bin/tsc --noEmit
```

---

## 17. Adresy i zasoby

| Zasób | Adres |
|---|---|
| Repo | `https://github.com/PawelZalewski756/szybkamatematyka` |
| Branch | `chore/ocena-projektu-0-30` |
| Supabase | panel projektu (env) |
| Vercel | panel projektu (env) |
| Resend | `https://resend.com` |
| Telegram BotFather | `@BotFather` |
| Raport oceny | `docs/ocena-projektu-2026-11-16.md` |
| Dokumentacja deploy | `docs/DEPLOY.md` |
| Dokumentacja e-mail | `docs/EMAIL.md` |
| Dokumentacja Telegram | `docs/TELEGRAM.md` |

---

## 18. Ostatnia rzecz

Jeśli nie wiesz, co robić:

1. Przeczytaj sekcję **9. Backlog**.
2. Wybierz **jedno** zadanie P0.
3. Napisz plan.
4. Zrób najmniejszą sensowną zmianę.
5. Uruchom testy.
6. Zostaw commit użytkownikowi albo zapytaj, czy zacommitować.

**Nie próbuj „zrobić wszystkiego” w jednym commicie.** To repo ma już dużo
zmian; najważniejsza jest teraz przewidywalność i zielone CI.
