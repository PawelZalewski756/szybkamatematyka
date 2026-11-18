# Raport: błędy zadań i pełny trening CKE (18.11.2026)

## 1. Co było zepsute

| Problem | Przyczyna | Efekt |
|---|---|---|
| Litery/wzory „wyżej niż tekst” | `MathText` opakowywał wzór w linii w `inline-block` + `overflow-x: auto`. Przeglądarka brała dolną krawędź przewijanego pudełka jako linię bazową. | Wzory w zadaniach, opcjach i minigrach były uniesione względem zdania. |
| Suwaki przy ułamkach | Ten sam `overflow-x-auto` na wzorze w linii tworzył poziomy pasek przewijania. | Ułamek można było „przesuwać” w poziomie. |
| Znikające tematy w treningu | `app/trening/page.tsx` filtrował działy/tematy po planie klasy. Dla `liceum-3` zostawało 11 z 76 tematów, więc ginęła m.in. funkcja kwadratowa. | Trening nie pokazywał całego zakresu CKE. |
| Wybór klasy wracał do klasy 8 | `saveSchoolClass` zapisywał tylko `sp`/`srednia`, a `loadSchoolClass` normalizował to do `klasa-8`. | Plan klasy był fikcją. |
| Stara lista zadań w dev | `/api/trening/tasks` trzymał listę w pamięci modułu. Po dodaniu plików cache trening pokazywał 38 aktywnych tematów zamiast 134. | Trzeba było restartować dev server. |
| Złe rozwiązania i formatowanie | 1259 szablonowych rozwiązań, 21 zepsutych sekwencji znaków, 20 błędnych części wspólnych przedziałów, 3 opcje `NaN`, 3 wzory poza `$...$`. | Uczeń widział „Podstaw dane…”, `--`, `+-`, `NaN` albo zły klucz. |

## 2. Co zmieniono

### 2.1. Renderowanie wzorów
- `components/trening/MathText.tsx`: wzór w linii to teraz zwykły `inline` z `align-baseline` i `font-size: 1em`; bez `overflow-x-auto`.
- `app/globals.css`: KaTeX w linii ma `1.05em`, bloki mogą się przewijać, wzory w linii nie.
- Efekt: brak suwaków, brak unoszenia liter, ten sam rozmiar tekstu i matematyki.

### 2.2. Trening i plan klasy
- `app/trening/page.tsx`: usunięte filtrowanie po `classPlan`; trening zawsze pokazuje całe drzewo CKE.
- `lib/learning-path.ts`: `saveSchoolClass` zapisuje konkretną klasę (`klasa-5`), a `saveLearningPath` nie nadpisuje klasy z tego samego poziomu.
- `app/api/trening/tasks/route.ts`: w trybie dev lista zadań nie jest cache’owana w module.
- `components/trening/TopicPageClient.tsx` + `lib/trening/summaries.ts`: nowe tematy dostają kartę „Mapa tematu” z lekcji, nawet bez ręcznego wpisu w `TOPIC_SUMMARIES`.

### 2.3. Pełna podstawa CKE
- `lib/trening/cke-egzamin-8.ts`: **58 tematów** w 10 działach — cała podstawa klas IV–VIII (14 działów IV–VI + 15 działów VII–VIII).
- `lib/trening/cke-matura-podstawowa.ts`: **76 tematów** w 8 działach — wszystkie sekcje CKE I–XIII, w tym funkcja kwadratowa, wielomiany, wyrażenia wymierne, ciągi, trygonometria, stereometria, prawdopodobieństwo warunkowe, pochodna.
- `docs/cke-podstawa-programowa.md`: lista źródeł CKE i wiążący kontrakt treningu.
- Nowe zadania: **58 nowych plików cache** (20 zadań każdy) = **1160 zadań**; łącznie **2635 zadań** w 134 tematach.
- Nowe lekcje: **58 nowych lekcji** (`materials-complete-e8.ts`, `materials-complete-matura.ts`); łącznie **134 lekcje**, wszystkie `full`/`comprehensive`.
- `data/theory-cache`: uzupełnione 58 brakujących plików.

### 2.4. Jakość zadań
- `lib/trening/seed/explain-task.ts`: rozwiązania krok po kroku dla równań, nierówności, funkcji, ciągów, geometrii, procentów, statystyki, trygonometrii itd.; fallback nigdy nie zwraca szablonu.
- `scripts/repairTaskExplanations.ts`: naprawił **1259 rozwiązań** i **21 sekwencji znaków**.
- `scripts/fixIntervalIntersections.ts`: 20 zadań o części wspólnej przedziałów ma poprawne klucze (np. `[-2,10] ∩ [1,13] = [1,10]`).
- `scripts/rewriteBrylyTasks.ts`: temat „Bryły – rozpoznawanie” nie kopiuje już 20 zadań o objętości; ma 20 zadań o ścianach, krawędziach, wierzchołkach i siatkach.
- `scripts/repairCkeArtifacts.ts`: 7 rozwiązań CKE bez „Przepraszam”, „poprawiam” i sprzecznych odpowiedzi.
- `scripts/cleanTaskFormatting.ts`: usunięte `+0`, `1x`, `-0x`, długie rozwinięcia dziesiętne; zamienione `$$...$$` na `$...$`.
- 3 opcje `NaN` zastąpione poprawnymi dystraktorami.
- 3 wzory poza `$...$` w `permutacje` opakowane.

## 3. Audyty (wszystkie zielone)

| Audyt | Wynik |
|---|---|
| `npm run audit:questions` | 2261 zadań MC, 0 problemów |
| `npm run audit:tasks-cache` | 2635 zadań, 0 problemów (w tym 0 szablonów, 0 krótkich rozwiązań, 0 złych znaków) |
| `npm run audit:placement` | 134 tematy, 2635 zadań, 0 problemów |
| `npm run audit:render` | 3621 rekordów, 0 błędów KaTeX |
| `npm run audit:cke -- --strict` | 591/591 rozwiązań, 0 artefaktów |
| `npm test` | 83 pliki, **626 testów** |
| `npm run lint` | 0 błędów |
| `npx tsc --noEmit` | 0 błędów |
| `npm run build` | sukces (prod, 0 błędów) |
| Sweep 134 stron tematów | 0 błędów, 0 overflow, 0 console errors |
| `npm run test:e2e` | **86/86** (Playwright, build produkcyjny na porcie 3100) |

## 4. Zrzuty ekranu

- Przed: [`screenshots/arena-algebra.png`](../screenshots/arena-algebra.png) — wzór `2a+3b` uniesiony nad zdaniem.
- Po: [`screenshots/final-arena-algebra.png`](../screenshots/final-arena-algebra.png) — wzór w linii tekstu.
- Przed: [`screenshots/trening-matura.png`](../screenshots/trening-matura.png) — 11 tematów (plan liceum 3).
- Po: [`screenshots/final-trening-matura.png`](../screenshots/final-trening-matura.png) — 76 tematów, 76 aktywnych.
- Po: [`screenshots/final-trening-e8.png`](../screenshots/final-trening-e8.png) — 58 tematów, 58 aktywnych.
- Po: [`screenshots/ulamki-play.png`](../screenshots/ulamki-play.png) — ułamek bez suwaka.
- Po: [`screenshots/final-plan-klasa-5.png`](../screenshots/final-plan-klasa-5.png) — plan klasy 5 zapisany poprawnie.

## 5. Co pozostaje

- **Matura rozszerzona** ma osobne strony i arkusze, ale trening nadal ma dwa przełączniki (podstawa i E8). Tematy rozszerzone pokrywające się z podstawą są widoczne; docelowo warto dodać trzeci przełącznik `matura_rozszerzona`.
- **322 zadania z archiwum CKE** mają treść tylko jako obrazek (`![Zadanie](...png)`), więc nie da się ich poprawnie przypisać do działu bez OCR. To osobne zadanie, opisane w `docs/do-recenzji.md`.
- **`data/theory-cache`** ma teraz 134 pliki, ale część lekcji to skrócone wersje wygenerowane z zadań; pełne lekcje `materials-complete-*` są źródłem prawdy.

## 6. Zgłoszenia z 18.11.2026 (druga tura)

Cztery zgłoszenia dotyczyły „Kolejności wykonywania działań”. Zadania są w
produkcyjnej tabeli `public.tasks`, nie w lokalnym cache, więc poprawka jest
migracją:

- `b11b2734-f3e1-46c0-9d9c-67257754ae85` → `81`,
- `34c8fcc8-8218-40b8-a6dd-b4b848f228e0` → `33`,
- `ba4f578a-5919-4891-aa1f-94027f96f18f` → `19`,
- `9424496e-e443-4a89-8504-ff7d5df26436` → `18`.

Migracja `20261118133000_fix_reported_tasks.sql` jest idempotentna, poprawia
`correct_answer` i dopisuje odpowiedź do `options`, jeśli jej brakuje. Obejmuje
też 40 innych poprawek z audytu arytmetyki. Całość (migracje + grant Pro) jest
też w jednym pliku do wklejenia w Supabase SQL Editor:
`supabase/sql-editor/2026-11-18-all-fixes-and-grant-pro.sql`.
Weryfikacja po deployu:

```bash
npm run audit:reported-tasks
```

### Pro dla zgłaszających

- `pro_source` (`stripe` / `gift` / `manual` / `none`) odróżnia płatne Pro od
  przyznanego.
- Gift wygasa po `subscription_current_period_end`; RPC `get_my_subscription`
  zwraca wtedy `free`.
- `/api/stripe/portal` blokuje portal dla `gift`/`manual` (kod
  `gift_no_stripe_subscription`), a profil ukrywa „Zarządzaj subskrypcją”.
- `npm run grant:pro -- adres1 adres2 --days=30 --reason="..."` przyznaje
  miesiąc Pro bez karty i bez subskrypcji Stripe.

### Mail

Szablon i skrypt: `docs/email-templates/przeprosiny-zgloszenie-bledu.*` oraz
`scripts/sendBugReportApology.ts` (`--dry-run`, `--write`, `--send`).
Wysyłka wymaga `RESEND_API_KEY`; nadawca z `BUG_REPORT_FROM`.

## 7. Commit

Branch: `fix/trening-zadania-pro-2026-11-18` (na bazie `origin/master`). Repozytorium ma prawdziwą historię GitHuba; można je otworzyć
w GitHub Desktop i opublikować branch.

## 8. Telegram, statystyki i XP wszędzie

### Dlaczego nowe konta nie były w /stats
`/users` czytał `auth.users`, a `/stats` liczył tylko `profiles`. Jeśli trigger
`handle_new_user` nie utworzył wiersza profilu (albo konto powstało obok
`/api/signup`), konto było w `/users`, ale nie w `/stats` i nie miało profilu.

Naprawa:

- migracja `20261118150000_platform_stats_and_profile_backfill.sql`:
  - backfill brakujących profili z `auth.users`,
  - odtworzenie triggera `handle_new_user`,
  - RPC `get_platform_stats()` liczące konta z `auth.users` (total, 7 dni, 24 h),
    profile, rozwiązania i aktywnych uczniów,
- `/stats` używa RPC, a gdy go brak — awaryjnie liczy `auth.users` przez admin API,
- `/api/signup` wysyła powiadomienie Telegram **przed** odpowiedzią (nie w `after()`),
- nowy cron `/api/telegram/sync-signups` (`vercel.json`, raz dziennie) dosyła
  powiadomienia dla kont z ostatnich 7 dni; idempotencja przez
  `signup_notification_deliveries`,
- `CRON_SECRET` w `.env.example`.

### XP i rozwiązania wszędzie
`solved_tasks.task_id` było UUID z FK do `tasks`, więc zadania z cache, CKE,
minigier i arkuszy nie mogły się zapisać. Migracja
`20261118145000_solved_tasks_text_source.sql`:

- `task_id` → `text` (bez FK),
- `source` (`trening`, `baza-zadan`, `cke`, `diagnoza`, `powtorki`, `minigra`,
  `wyzwanie`, `pojedynek`, `szybka-proba`).

Nowy `lib/progress/task-completion.ts`:

- zapisuje rozwiązanie w `solved_tasks` + lokalnym cache,
- nalicza XP tylko za **pierwsze poprawne** rozwiązanie,
- źródła: trening (już wcześniej), baza zadań, arkusze CKE, diagnoza, powtórki,
  minigry, wyzwania, pojedynki, szybka próba,
- błędna odpowiedź nie jest „rozwiązaniem” (trafia tylko do powtórek),
- gość zapisuje lokalnie, bez XP.

Minigry, wyzwania i pojedynki zapisują rozwiązanie z XP = 0, bo XP za grę
przyznają ich własne mechanizmy (bez podwójnego naliczania).

Dodatkowo `SolvedTasksProvider` przy pierwszym wejściu zalogowanego ucznia
dosyła do bazy jego lokalną historię rozwiązań (gość / sprzed migracji), bez
retroaktywnego XP. Dzięki temu zadania, które Vlad rozwiązał wcześniej w tej
przeglądarce, też pojawią się w `solved_tasks` i w statystykach Telegrama.
