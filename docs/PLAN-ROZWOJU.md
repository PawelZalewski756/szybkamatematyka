# Plan rozwoju - Szybka Matematyka

**Ostatnia aktualizacja:** 22.11.2026
**Zasada:** na stronie głównej, w nawigacji, stopce i sitemapie pokazujemy tylko
to, co realnie działa. Niedokończone funkcje są **ukryte, ale nie usunięte** -
kod i trasy zostają, żeby można je było dokończyć bez odtwarzania pracy.

Ten plik jest źródłem prawdy o tym, co jest ukryte, dlaczego i jak to przywrócić.

**Aktualny audyt całej strony:** [`AUDYT-STRONY-2026-11-24.md`](AUDYT-STRONY-2026-11-24.md)
— luki, wady techniczne i priorytety.
Backlog techniczny i historia projektu są w [`AI-HANDOFF.md`](../AI-HANDOFF.md),
a propozycje układu strony w [`docs/propozycja-strona-glowna-v2-2026-11-20.md`](propozycja-strona-glowna-v2-2026-11-20.md).

---

## 1. Co jest ukryte (stan na 22.11.2026)

| Funkcja | Gdzie była widoczna | Dlaczego ukryta | Jak przywrócić |
|---|---|---|---|
| **Plan tygodnia** (`/plan-tygodnia`) | sekcja na stronie głównej (`WeekSection`), karta w siatce funkcji, menu „Więcej", stopka, sitemap | MVP nowej funkcji; na stronie głównej pokazywała przykładowe dni i „0 zaległych powtórek", co wyglądało jak atrapa | 1) w `components/home-v2/HomeDashboardV2.tsx` dodaj import i `<WeekSection />`; 2) w `lib/home/feature-map.ts` przywróć kartę `plan-tygodnia`; 3) w `lib/layout/nav-links.ts` i `lib/layout/footer-links.ts` dodaj link; 4) w `components/home-v2/HomeFooterV2.tsx` dodaj link; 5) w `app/sitemap.ts` dodaj trasę; 6) usuń `robots: noindex` z `app/plan-tygodnia/page.tsx` |
| **Ranking na stronie głównej** (sekcja z podium) | przywrócony 24.11.2026 | wcześniej dane były przykładowe („Podgląd wyglądu”) | `HomeRankingPreview` czyta `fetchTopLeaderboard` (top 5, kategorie XP / minigry / pojedynki). Pusta baza pokazuje pusty stan, bez wymyślonych nicków |
| **Pakiet szkolny / panel nauczyciela** | pas `TeacherBand` na home, link „Panel nauczyciela" w stopce i w sekcji sprawdzianów | B2B nie ma klas, uczniów, wyników ani faktur - pas obiecywał rzeczy, których nie ma | strona `/dla-szkol` (kontakt B2B) została; panel `/dla-szkol/panel` nadal działa z bezpośredniego linku. Przywrócenie: `<TeacherBand />` w `HomeDashboardV2.tsx`, link w `HomeFooterV2.tsx` i przycisk w sekcji sprawdzianów (`HomeSections.tsx`) |
| **Karta „Matura rozszerzona - W przygotowaniu”** | siatka funkcji na home | badge „W przygotowaniu" na stronie głównej odstraszał uczniów zdających rozszerzenie | karta usunięta z `lib/home/feature-map.ts`; strona `/matura-rozszerzona` (12 oficjalnych arkuszy) **zostaje** i jest linkowana w stopce |

> Uwaga: ukrycie polega na **odlinkowaniu**, nie na usunięciu tras. Adresy
> `/plan-tygodnia`, `/dla-szkol/panel` i `/matura-rozszerzona` nadal odpowiadają,
> więc można je testować i linkować bezpośrednio.

---

## 2. Co zostaje jako „działa”

- trening tematyczny, baza zadań, arkusze CKE (matura podstawowa i ósmoklasisty),
- minigry, wyzwania dzienne, pojedynki,
- powtórki (spaced repetition, SM-2),
- sprawdziany (generator grup A/B, PDF, ocena online),
- asystent AI (podpowiedzi + ocena zadań otwartych, limit darmowy),
- diagnoza startowa, profil i postępy, osiągnięcia,
- rankingi (`/rankingi`) - realna lista, bez fejkowego podium,
- cennik, program poleceń, plan klasy (statyczny przewodnik po materiałie),
- matura rozszerzona jako zestaw arkuszy (bez planu tematycznego),
- kontakt B2B (`/dla-szkol`).

---

## 3. Decyzje do podjęcia

1. **Plan tygodnia** - dokończyć (integracja z powtórkami, e-mailowe przypomnienia)
   czy usunąć na stałe? Jeśli wraca, musi pokazywać realne zadania użytkownika,
   a nie przykładowy tydzień.
2. **Ranking na stronie głównej** - zrobione 24.11.2026: top 5 z
   `leaderboard.ts` po stronie klienta, pusta baza bez danych przykładowych.
   Pełna lista zostaje pod `/rankingi`.
3. **Matura rozszerzona** - dokończyć plan tematyczny + zadania (P1) albo
   zostawić same arkusze i nie nazywać tego „pełną ścieżką”.
4. **B2B** - klasy, uczniowie, wyniki, faktury; do tego czasu nie obiecywać
   „wielu klas" i faktur na stronie głównej.
5. **Plan klasy** - zostaje jako statyczny przewodnik; sprawdzić, czy nie myli
   się z „planem tygodnia" w komunikacji.

---

## 4. Backlog

### P0 - teraz

| Zadanie | Uwagi |
|---|---|
| Wdrożyć zmiany rejestracji i ukrycia funkcji na produkcję | deploy z GitHuba/Vercela, potem sprawdzić `/login?mode=signup` i przycisk w nagłówku |
| Prawdziwe dane operatora w regulaminie | `NEXT_PUBLIC_OPERATOR_NAME/ADDRESS/NIP` - bez tego rodzic nie zapłaci, a to wymóg formalny |
| Sprawdzić, czy rejestracje wróciły | Supabase → Authentication (konta niepotwierdzone), Telegram, `/api/health` |
| Weryfikacja domeny Resend | mail powitalny dochodzi do obcego adresu |

### P1 - produkt

| Zadanie | Uwagi |
|---|---|
| Pełna matura rozszerzona | plan tematyczny + zadania; dziś tylko arkusze |
| Pełne B2B | klasy, uczniowie, wyniki, faktury - wymaga migracji i ról |
| E-mail reminders | dziś przypomnienia tylko w przeglądarce |
| Ranking na home na realnych danych | zrobione 24.11.2026, `HomeRankingPreview` |
| Audyt a11y | kontrast, fokus w modalach, nawigacja klawiaturą |

### P2 - techniczne

| Zadanie | Uwagi |
|---|---|
| Refactor `powtorki` | `ReviewDashboard`/`ReviewSession`/`AddTasksPicker` importują katalog do klienta |
| Raport rodzica | rozbudować wydruk profilu o kategorie i historię |
| SEO | canonical, sitemap, metadata nowych stron |
| Testy wizualne | screenshoty kart zadań |

---

## 5. Dziennik zmian

- **24.11.2026** - ranking na stronie głównej pokazuje prawdziwe top 5
  (XP, minigry, pojedynki). Zniknęły dane przykładowe i plakietka „Podgląd”.
- **22.11.2026** - audyt strony głównej: brak CTA rejestracji, fejkowy ranking,
  „rejestracja opcjonalna". Wdrożone: CTA „Załóż konto" w nagłówku, rejestracja
  pod `/login?mode=signup`, propozycja konta po szybkiej próbie, uczciwe copy,
  CTA rejestracji w bramkach produktu. Testy: 688 jednostkowych + smoke E2E.
- **22.11.2026** - ukrycie niedokończonych funkcji (plan tygodnia, ranking
  z danymi przykładowymi, pas B2B, karta matury rozszerzonej) + ten plan.
  Repozytorium git zainicjowane, gotowe do wypchnięcia z GitHub Desktop.

---

## 6. Jak sprawdzić, co jest ukryte

```bash
# linki do planu tygodnia (powinny być tylko w tym pliku i w kodzie trasy)
grep -rn "plan-tygodnia" app components lib

# karty funkcji widoczne na stronie głównej
grep -n "title:" lib/home/feature-map.ts

# sekcje renderowane na stronie głównej
grep -n "<.*Section\|<FeatureGrid\|<MinigamePromo" components/home-v2/HomeDashboardV2.tsx
```
