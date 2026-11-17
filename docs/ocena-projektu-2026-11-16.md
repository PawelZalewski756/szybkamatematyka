# Ocena projektu Szybka Matematyka

**Data:** 16 listopada 2026  
**Zakres:** produkt, treść, UX, technologia, model biznesowy i dopasowanie do użytkownika w każdym roczniku.  
**Metoda:** analiza kodu i danych (12 847 zadań w produkcyjnej bazie, 76 tematów, 46 arkuszy), build produkcyjny, 484 testy, lint, typecheck, audyty treści, przegląd 15 stron na desktopie i mobile oraz publiczny ranking.

Skala ocen: 1–10.

---

## 0. Werdykt

- **Jako projekt inżynierski: 8,5/10.** To nie jest demo ani zadanie rekrutacyjne. Działa build, testy, CI, migracje, płatności, RLS, AI i PWA. Jak na projekt jednej osoby — bardzo dużo.
- **Jako produkt edukacyjny: 7/10.** Jest realna treść i realny loop nauki. Uczeń klasy 8 i maturzysta mogą z tego korzystać. Ale produkt jest zbudowany pod egzamin, nie pod konkretną klasę — i to jest jego główne ograniczenie.
- **Jako biznes: 4,5/10.** Brakuje wyboru rynku, monetyzacja przecieka, nie ma B2B, a pozyskanie użytkownika jest droższe niż obecna cena. To firma „do zrobienia”, nie firma „już zrobiona”.
- **Najkrócej:** bardzo dobry warsztat i przyzwoity produkt egzaminacyjny, ale jeszcze nie biznes. Największa wartość do odblokowania nie leży w kodzie, tylko w decyzji: **produkt dla klasy 8 i matury czy platforma klasowa 4–8/LO**.

---

## 1. Co ten produkt naprawdę robi

| Warstwa | Stan | Liczby |
| --- | --- | --- |
| Treść w bazie | 76 tematów, 80 lekcji teorii | 12 847 zadań: 6 690 matura podstawowa, 6 157 egzamin 8-klasisty |
| Archiwum CKE | 40 arkuszy w kodzie + 6 arkuszy katalogowych | 986 zadań z rozwiązaniami; matura 2015–2026, E8 2019–2026, 12 arkuszy rozszerzonych |
| Tryby nauki | trening tematyczny, baza zadań, arkusze, sprawdziany, minigry, wyzwania, powtórki, pojedynki | 34 minigry, 26 osiągnięć, 13 rozdziałów sprawdzianów |
| Technika | Next.js 16, React 19, Supabase + RLS, Stripe, Gemini, Vercel, PWA | 43 migracje, 484 testy, 1 190 statycznych stron |
| Jakość | lint, typecheck, testy, 4 audyty treści, build, Playwright, migracje, deploy | CI przechodzi; build 0 błędów, 5 ostrzeżeń KaTeX |

To jest pełnoprawna aplikacja: konta, profile, postęp, płatności, webhooki, AI z limitem, panel admina, analityka, RODO (eksport/usunięcie konta), cookie consent. Jak na projekt „na GitHub” — poziom bardzo wysoki.

---

## 2. Ocena dla każdego użytkownika

### 2.1 Uczniowie według rocznika

Ważne zastrzeżenie: aplikacja ma tylko dwie realne ścieżki — **„Szkoła podstawowa” = egzamin 8-klasisty** i **„Szkoła średnia” = matura podstawowa**. Wybór konkretnej klasy (1–8, LO 1–4, technikum 1–5, branżowa 1–5) istnieje w kodzie, ale **nie jest dostępny w UI**; picker pokazuje tylko dwie opcje. Dlatego „klasa” jest etykietą, nie planem.

Uwaga do liczb gier: to gry **przypisane do klasy w danych**. W UI uczeń „szkoły podstawowej” widzi wszystkie 34 gry, bo `matchesLearningPath` traktuje każdą `klasa-*` jako „sp” — czyli filtr klasy nie działa.

| Użytkownik | Co realnie dostaje | Czego brakuje | Ocena |
| --- | --- | --- | --- |
| **Klasa 1–3** | 4 proste gry w danych `sp` (dodawanie, odejmowanie, mnożenie, porównanie); w UI widzi wszystkie 34, w tym potęgi i równania; brak zadań oznaczonych klasą 1–3 | Brak treści, planu, trybu rodzica, czytania na głos; UI jest tekstowe i wymaga czytania | **1,5/10** |
| **Klasa 4** | 105 zadań oznaczonych `klasa-4`, 7 gier w danych (widzi 34), baza i minigry; plan E8 od „kolejności działań” | Brak sprawdzianów, brak planu klasy 4; plan E8 szybko wchodzi w potęgi, pierwiastki i Pitagorasa | **4/10** |
| **Klasa 5** | 224 zadania `klasa-5`, 13 gier w danych (widzi 34) | Brak sprawdzianów; plan E8 wciąż za wcześnie; brak adaptacji do klasy | **4,5/10** |
| **Klasa 6** | 389 zadań `klasa-6`, 23 gry w danych (widzi 34), 1 sprawdzian („Pola i obwody”) | Jeden rozdział sprawdzianów to za mało; plan E8 miesza materiał 6–8 | **5,5/10** |
| **Klasa 7** | 754 zadania `klasa-7`, 28 gier w danych (widzi 34), 3 sprawdziany (równania, kąty, procenty), pełny plan E8 | Wciąż brak planu „klasa 7”; uczeń widzi cały E8, także to, czego jeszcze nie było | **7/10** |
| **Klasa 8 / E8** | 6 157 zadań E8, 38 tematów, 8 arkuszy E8 (2019–2026), 3 sprawdziany, powtórki, AI | Brak diagnozy startowej, brak progu/planu na 2–3 miesiące przed egzaminem; niektóre tematy mają po 10–18 zadań | **8,5/10** |
| **Liceum 1** | Cały plan matury podstawowej od pierwszego dnia, 2 sprawdziany | Zero zadań oznaczonych `liceum-1` w metadanych klasowych; plan jest maturalny, nie klasowy; ciągi, trygonometria i stereometria pojawiają się za wcześnie | **4/10** |
| **Liceum 2** | Plan matury, 2 sprawdziany (ciągi, trygonometria) | Brak planu klasy 2; brak rozróżnienia na klasy | **5/10** |
| **Liceum 3** | Plan matury, 2 sprawdziany (kombinatoryka, geometria analityczna), archiwum maturalne | Brak planu klasy 3; brak rozszerzenia | **7/10** |
| **Liceum 4 / matura podst.** | Cały plan matury, archiwum 2015–2026, AI, powtórki, arkusze | Brak sprawdzianów dla klasy 4; brak trybu „ostatnie 30 dni”; brak prognozy wyniku | **8/10** |
| **Matura rozszerzona** | 12 arkuszy rozszerzonych (2015–2026) z rozwiązaniami | Brak planu, tematów, teorii i bazy zadań rozszerzonych; brak ścieżki w treningu | **3/10** |
| **Technikum 1–5** | Plan matury podstawowej, te same treści co LO | Brak planu technikum, brak klasy 5 w UI, brak różnic programowych | **3,5/10** |
| **Branżowa 1–5** | Plan matury podstawowej | Matura to często nie jest cel; brak własnej ścieżki | **2,5/10** |
| **Dorosły / poprawka** | Archiwum, plan matury, powtórki | Brak diagnozy, kursu „od zera”, planu na 7 dni | **5/10** |
| **Uczeń słaby (2–3)** | Minigry i zadania łatwe, AI | Brak remedialnego planu, brak cofania się do podstaw, brak adaptacji trudności | **4/10** |
| **Uczeń dobry (5) / olimpijczyk** | Zadania trudne w bazie, archiwum | Za mało trudnych i rozszerzonych; brak trybu „wyzwanie” | **3/10** |
| **Uczeń z dysleksją / Ukrainy** | UI po polsku, dużo tekstu | Brak trybu ułatwień, czytania na głos, tłumaczeń; E8 ma wielu takich uczniów | **2/10** |

**Wniosek dla roczników:** produkt jest naprawdę dobry dla klasy 8 i matury podstawowej w klasie 3–4 LO. Dla klas 4–7 jest „przydatny, ale nie prowadzi za rękę”. Dla klas 1–3 nie istnieje. Dla rozszerzenia, technikum i branżowej jest tylko archiwum, nie produkt.

### 2.2 Pozostali użytkownicy

| Użytkownik | Co dostaje | Co boli | Ocena |
| --- | --- | --- | --- |
| **Rodzic** | Może kupić Pro, dziecko ma postęp | Brak konta rodzica, raportów, kontroli czasu, widoku „co dziecko przerobiło”; brak faktury w UI | **3/10** |
| **Nauczyciel** | Generator sprawdzianów: grupy A/B, klucz, punktacja, PDF; 13 rozdziałów | Brak edycji zadań, brak klas i wyników, brak eksportu do dziennika; tylko 1 rozdział dla klasy 6 i 2 na klasę LO | **5,5/10** |
| **Dyrektor / szkoła** | Landing „dla szkół”, mailto | Brak licencji, faktury, umowy powierzenia danych, SLA, SSO, wdrożenia; brak cennika szkolnego | **2/10** |
| **Administrator / właściciel** | Panel admina, analityka, CMS materiałów, RLS, CI | Brak monitoringu błędów, brak cohortów retencji, brak narzędzi wsparcia i kuponów | **8/10** |
| **Inwestor / partner** | Działający produkt, treść, technika | Brak trakcji, social proofu, wybranego rynku i defensywności | **5/10** |

---

## 3. Ocena biznesowa

### 3.1 Rynek i popyt

- **Matura 2026:** do matematyki podstawowej przystąpiło **ponad 376 tys. osób** (CKE, za Głosem Nauczycielskim); to obowiązkowy egzamin, którego zdanie warunkuje maturę.
- **Egzamin ósmoklasisty 2026:** ok. **350 tys.** uczniów; matematyka jest obowiązkowa i mocno różnicuje wynik.
- Razem **ok. 727 tys. uczniów rocznie** zdaje matematykę na egzaminie. Do tego klasa 7 (kolejne ~350 tys.) przygotowuje się rok wcześniej.
- Benchmarki cenowe: korepetycje z matematyki **60–80 zł/h** (średnio ok. 66,59 zł/h), Odrabiamy Premium **49 zł/mies.**, podręczniki i kursy 30–800 zł.
- Wniosek: **popyt jest, pain jest, willingness to pay jest**. Problem nie leży w rynku, tylko w tym, jak produkt go adresuje.

### 3.2 Model przychodów i cennik

| Plan | Cena | Co obiecuje | Co realnie dostaje | Problem |
| --- | --- | --- | --- | --- |
| Start | 0 zł | „3 arkusze CKE”, minigry, wyzwania, powtórki | **Wszystkie 46 arkuszy** jest publicznych; 3-arkuszowy limit działa tylko w jednym panelu bazy zadań | Obietnica nie zgadza się z produktem; darmowy plan jest zbyt hojny w treści |
| Pro | 29 zł/mies. | pełne rozwiązania, wszystkie arkusze, AI, filtry, ocena AI | rozwiązania są ukryte tylko w UI; treść i rozwiązania są publiczne w Supabase/API | Paywall jest kosmetyczny |
| Roczny | 249 zł/rok | to samo, taniej | to samo | Dobra oferta, ale brak trial, gwarancji i faktury |

**Najważniejszy problem biznesowy:** Pro sprzedaje głównie **treść i rozwiązania**, a ta treść jest publicznie czytelna:
- `tasks` i `materials` mają RLS „select public” dla anon/authenticated,
- `GET /api/trening/tasks` zwraca `correct_answer` i `explanation` bez logowania,
- strona arkusza serializuje `explanation` i `steps` do klienta, a `ProGate` tylko je ukrywa.

To nie jest „dziura” w sensie bezpieczeństwa danych osobowych — to dziura w modelu przychodów. Jeśli Pro ma sprzedawać treść, trzeba ją zamknąć po stronie serwera. Jeśli nie — **wartość Pro trzeba przenieść na AI, personalizację, raporty i narzędzia dla nauczyciela**, bo statyczna treść nie utrzyma paywalla.

### 3.3 Lejek i unit economics

Obecny lejek: wejście → QuickTrial (2 zadania bez konta) → rejestracja → onboarding (nick + poziom) → trening → Pro.

| Etap | Co jest | Co kuleje |
| --- | --- | --- |
| Wejście | SEO (1 190 stron), Google Ads, linki | Brak bloga/content marketingu; większość stron to zadania, nie artykuły na frazy „matura 2027” |
| Aktywacja | QuickTrial, pierwszy temat | Brak diagnozy, brak „planu na dziś”, brak egzaminu i daty |
| Rejestracja | nick + poziom | Brak zgody na regulamin, brak wieku/rodzica, brak maila po rejestracji |
| Retencja | seria, wyzwania, powtórki, minigry, pojedynki | Brak emaili, brak push (poza lokalnym), brak raportu dla rodzica |
| Płatność | Stripe, promocje, portal | Brak triala, brak gwarancji, paywall przecieka |

Przykładowa ekonomia (założenia, nie dane z projektu):

- ARPU netto: ok. 27 zł/mies. (29 zł minus Stripe).
- Średni czas życia w sezonie: 4 miesiące → **LTV ok. 108 zł**.
- Docelowy CAC: ≤ 54 zł przy LTV/CAC = 2.
- Google Ads: CPC 2–4 zł; przy konwersji landing→rejestracja 8% i rejestracja→płatność 8% koszt pozyskania płacącego to **ok. 300–600 zł** — czyli adsy na 29 zł nie spięłyby się bez bardzo dobrej konwersji.
- Wniosek: **SEO, referral i B2B muszą być głównymi kanałami**, a nie płatne adsy.

Skala: żeby mieć **1 mln zł przychodu rocznie** przy 29 zł/mies. i 4 miesiącach, potrzeba ok. **8 600 płacących uczniów rocznie** (ok. 1,2% rynku egzaminacyjnego). To możliwe, ale wymaga dużego ruchu i wysokiej konwersji. Przy 49 zł/mies. potrzeba ok. 5 100 osób; przy 249 zł/rok — ok. 4 000 subskrypcji anualnych. **Cena 29 zł jest dobra dla ucznia, ale zła dla biznesu bez skali.**

### 3.4 Konkurencja i moat

| Gracz | Cena | Co wygrywa | Zagrożenie |
| --- | --- | --- | --- |
| CKE / arkusze PDF | 0 zł | autorytet, oficjalność | wysokie dla „samych arkuszy” |
| YouTube (Maturita, Matemaks) | 0 zł | tłumaczenie krok po kroku, twarz | wysokie |
| ChatGPT / Photomath | 0–20 zł | natychmiastowa odpowiedź, zdjęcie | bardzo wysokie |
| Odrabiamy | 49 zł/mies. | brand, wszystkie przedmioty, prace domowe | wysokie |
| Korepetycje | 60–80 zł/h | personalizacja, odpowiedzialność | średnie (cena) |
| Podręczniki / platformy szkolne | 0–50 zł | zaufanie nauczyciela, integracja | średnie |
| Szybka Matematyka | 29 zł/mies. | polski egzamin, gry, AI, cena | — |

**Moat:** treść (12,8 tys. zadań), archiwum CKE, UX, SEO i gry. To wszystko jest **do skopiowania** — treść CKE jest publiczna, zadania można wygenerować, AI jest tanie. Trwałą przewagę mogą dać tylko: **marka, sieć nauczycieli, umowy ze szkołami, dane o postępach i personalizacja**.

### 3.5 Ryzyka

| Ryzyko | Wpływ | Prawdopodobieństwo | Co robić |
| --- | --- | --- | --- |
| Paywall przecieka | wysokie | wysokie | zamknąć rozwiązania po stronie serwera; przenieść wartość Pro na AI/raporty |
| Sezonowość (luty–maj) | wysokie | pewne | plany roczne, kursy wakacyjne, klasa 7, B2B |
| Zaufanie do treści AI | wysokie | średnie | recenzja merytoryczna, „zweryfikowane”, zgłaszanie błędów w kontekście zadania |
| Brak firmy w regulaminie, brak odstąpienia, brak wieku | wysokie | wysokie | prawnik, dane operatora, 14 dni, zgoda rodzica <16 |
| Key person | wysokie | wysokie | dokumentacja, testy, jeden partner |
| Zależność od Vercel/Supabase/Stripe/Gemini | średnie | średnie | monitoring kosztów, fallbacki |
| Konkurencja free AI | wysokie | wysokie | nie konkurować na „rozwiąż za mnie”, tylko na planie i egzaminie |
| Brak trakcji | wysokie | wysokie | wybrać jeden ICP i kanał, mierzyć aktywację |

### 3.6 Szanse

1. **Plany klasowe 4–8 i LO 1–4** — to nie tylko feature, to **silnik LTV**: uczeń wchodzi w klasie 7 i zostaje na 2–4 lata, zamiast na 4 miesiące.
2. **Matura rozszerzona** — najwyższa willingness to pay, mała konkurencja w polskim online; wystarczy plan + teoria + 500–1000 zadań.
3. **Panel nauczyciela** — klasy, zadania domowe, auto-ocena, raporty; sprzedaż per nauczyciel/szkoła, faktura, RODO.
4. **Raport dla rodzica** — miesięczny PDF/email z postępem; rodzic płaci, ale nie ma dziś produktu dla niego.
5. **Referral w pojedynkach** — „zaproś kolegę, oboje dostajecie X”; obecne pojedynki są gotową pętlą wiralową, ale bez nagrody za zaproszenie.
6. **Content hub SEO** — „matura 2027”, „E8 2027”, „powtórka przed maturą”, „działy matury” — artykuły, nie tylko zadania.

---

## 4. Ocena produktu i techniki

### Mocne strony

- **Design i UX:** spójny brand, dobra typografia, dark mode, responsywność, dolna nawigacja mobilna. Wygląda jak produkt, nie jak projekt studencki.
- **Treść:** 12,8 tys. zadań, 80 lekcji, 46 arkuszy, 34 gry. To realna baza, nie atrapa.
- **Loop nauki:** teoria → zadania → rozwiązywanie → postęp → powtórki → arkusze. Działa.
- **Grywalizacja:** XP, poziomy, serie, osiągnięcia, rankingi, pojedynki, wyzwania. To dobrze pasuje do uczniów.
- **Technika:** RLS, admin whitelist, Stripe webhooki, atomowy limit AI, eksport/usunięcie konta, cookie consent, PWA.
- **Jakość:** 484 testy, lint, typecheck, build, 4 audyty, CI z e2e i migracjami. To rzadkość.
- **SEO:** 1 190 statycznych stron, sitemap, metadata, JSON-LD, canonical.

### Słabe strony

- **Brak personalizacji:** brak diagnozy, daty egzaminu, celu, planu tygodnia. Nowy uczeń zaczyna od „kolejności działań”, niezależnie od tego, czy jest w klasie 4, 7 czy 8.
- **Klasa to martwy kod:** `SchoolClassPath` obsługuje 1–8, LO 1–4, technikum 1–5, branżową 1–5, ale UI pokazuje tylko „SP/średnia”, a `matchesLearningPath` traktuje każdą `klasa-*` jako „sp”. Efekt: filtry klasowe nie działają.
- **Brak rozszerzenia:** 12 arkuszy MR, zero planu i zadań.
- **Rozjazd treści:** statyczny katalog (2 261 zadań), produkcyjna baza (12 847), cache (1 475) i archiwum (986) to cztery źródła prawdy. To grozi rozjazdem i utrudnia utrzymanie.
- **Paywall po stronie klienta:** `ProGate` ukrywa treść, ale dane są w HTML/RSC/API.
- **Brak emaila:** po rejestracji nie ma powitalnego maila, przypomnień, win-backu. Jest tylko lokalne powiadomienie o serii.
- **Brak monitoringu:** nie ma Sentry/OTel; błędy widać tylko w konsoli i według zgłoszeń.
- **Brak a11y i wydajności:** brak testów dostępności, brak budżetu wydajności; KaTeX + framer-motion na słabych telefonach mogą ważyć.
- **Duże pliki:** `TaskArena.tsx` ~718 linii, strona treningu ~1 259 linii, `sheet.ts`/`topics.ts` po kilkadziesiąt KB. Trudne w utrzymaniu.
- **Brak raportowania błędu w kontekście:** formularz `/zglos-blad` jest tylko w stopce; uczeń, który widzi złe rozwiązanie, nie ma przycisku „zgłoś błąd w tym zadaniu”.

---

## 5. Błędy i niespójności (zweryfikowane)

1. **„6 arkuszy CKE” na stronie głównej vs 46 arkuszy w bazie.** `PlatformStatus` liczy `EXAM_SHEETS` (6), a nie archiwum (40) + CMS. W `dla-szkol` jest „40 arkuszy”. Trzy różne liczby w trzech miejscach.
2. **„3 arkusze CKE” w planie Start vs wszystkie 46 dostępne.** Limit `FREE_CMS_SHEETS_VISIBLE = 3` dotyczy tylko panelu w bazie zadań; katalog `/trening/arkusze` pokazuje wszystkie lata i arkusze bez gate.
3. **Paywall jest kosmetyczny.** `app/api/trening/tasks` zwraca `correct_answer` i `explanation` bez auth; strona arkusza przekazuje `explanation` i `steps` do klienta; RLS na `tasks`/`materials` pozwala czytać wszystko anonimowo.
4. **Wybór klasy to tylko „SP/średnia”.** `SchoolClassPicker` ma dwie opcje; definicje klas 1–8, LO 1–4, technikum 1–5 i branżowej 1–5 są nieużywane w UI.
5. **Brak numerów klas w metadanych zadań.** Zero zadań oznaczonych `klasa-1`, `klasa-2`, `klasa-3`, `liceum-1`, `technikum-1` itd.; są tylko ogólne `liceum`, `technikum`, `zawodowa`. Uczeń klasy 1–3 nie ma dedykowanej treści; uczeń LO 1 widzi plan maturalny, nie klasowy.
6. **Filtry klasowe nie działają.** `matchesLearningPath("sp", ...)` uznaje każdą `klasa-*` za pasującą, więc uczeń klasy 4 widzi zadania i gry opisane dla klas 6–8.
7. **Sprawdziany: 13 rozdziałów.** 1 dla klasy 6, 3 dla klasy 7, 3 dla klasy 8, po 2 dla LO 1–3; zero dla klasy 4–5, LO 4, technikum i branżowej.
8. **Brak planu matury rozszerzonej.** W bazie nie ma zadań `matura_rozszerzona`; są tylko 12 arkuszy w archiwum.
9. **Brak diagnozy, daty egzaminu i planu.** „Zacznij tutaj” wybiera pierwszy temat z drzewa, a nie temat adekwatny do klasy/celu.
10. **Brak lifecycle email.** Po rejestracji nie ma maila powitalnego, przypomnień, rekomendacji; jest tylko lokalne powiadomienie o serii.
11. **Regulamin nie wskazuje operatora.** Brak nazwy firmy, NIP, adresu; brak informacji o 14-dniowym odstąpieniu; brak zgody rodzica dla <16 lat; przy rejestracji nie ma checkboxa akceptacji regulaminu.
12. **Cookie banner zasłania CTA na mobile.** Na pierwszym wejściu banner przykrywa „Zacznij trening”/kartę następnego kroku; „Akceptuję wszystkie” jest wizualnie dominujące.
13. **Publiczny ranking pokazuje 3 profile (w tym „test”).** To może być filtr `xp > 0`, ale w połączeniu z brakiem social proofu wygląda na bardzo wczesną fazę.
14. **Hardcoded produkcyjny Supabase URL i publishable key w `scripts/auditTaskRendering.ts`.** Klucz publishable nie jest sekretem, ale CI bez sekretów uderza do produkcyjnej bazy; lepiej użyć env i trybu offline.
15. **5 ostrzeżeń KaTeX w buildzie.** Pojedyncze zadania mają polskie znaki w trybie matematyki i `%` bez zamknięcia; build przechodzi, ale render może być brzydki.
16. **„Procent z Liczby” w minigrach ma tytuł i opis mówiące o dwóch różnych rzeczach** (`procent-odwrotny` vs „ile procent z całości”).
17. **Brak monitoringu błędów i brak testów a11y.** Przy produkcie dla minorsów i szkół to luka.

---

## 6. Roadmapa

### 0–30 dni: zatrzymać przeciek i uporządkować obietnicę

| Działanie | Efekt | Wysiłek |
| --- | --- | --- |
| Zamknąć rozwiązania po stronie serwera (RPC/route z auth + `isPro`) | Pro zaczyna być produktem, nie ozdobą | 3–5 dni |
| Ujednolicić liczby: 46 arkuszy, 12,8 tys. zadań, 80 lekcji | spójność i wiarygodność | 1 dzień |
| Poprawić plan Start: albo realnie 3 arkusze, albo zmienić copy | zgodność z prawem konsumenckim | 1 dzień |
| Dodać dane operatora, odstąpienie, zgodę na regulamin i wiek/rodzica | zaufanie i compliance | 2–3 dni |
| Dodać „zgłoś błąd w tym zadaniu” + „zweryfikowane” | jakość treści i feedback loop | 2 dni |
| Dodać egzamin + datę + krótką diagnozę (10–15 pytań) | personalizacja od pierwszego dnia | 3–5 dni |
| Wysłać welcome email i 3 przypomnienia | retencja | 2–3 dni |
| Cookie banner jako cienki pasek; a11y quick wins | mobile conversion | 1–2 dni |
| Sentry + zdarzenia paywalla | mierzenie lejka | 1 dzień |

### 30–90 dni: product-market fit

- **Plany klasowe 4–8 i LO 1–4:** mapowanie tematów na klasy, picker klas, filtrowanie treści, „plan na tydzień”, widok „co umiem / co zalegam”. To największa dźwignia biznesowa: LTV z 4 miesięcy do 2–4 lat.
- **Matura rozszerzona:** plan działów, teoria, 500–1000 zadań, arkusze. Najwyższa cena, najmniejsza konkurencja.
- **Panel nauczyciela v1:** klasy, zadania domowe, auto-ocena, eksport CSV, PDF; strona „Pakiet szkolny” z cennikiem, fakturą i RODO.
- **Raport dla rodzica:** miesięczny PDF/email z postępem, czasem, tematami do powtórki.
- **Referral:** zaproszenie do pojedynku z nagrodą dla obu stron.

### 90–180 dni: wzrost

- **Content hub SEO:** artykuły „matura 2027”, „E8 2027”, „powtórka w 30 dni”, „działy matury”, „najczęstsze błędy”.
- **Partnerstwa szkolne:** 50–100 szkół, pilotaż, case study, faktura.
- **PWA push / aplikacja:** przypomnienia o serii i egzaminie.
- **AI foto‑zadanie:** zdjęcie zadania → podpowiedź (nie gotowiec), jeśli ekonomika pozwala.

---

## 7. Rekomendacja końcowa

### Wybierz jedną z dwóch strategii

**A. „Egzamin premium” (B2C)**
- Cel: klasa 7–8 + matura podstawowa i rozszerzona.
- Cena: 39–49 zł/mies. lub 299–349 zł/rok; 7-dniowy trial; gwarancja 14 dni.
- Wartość: plan, diagnoza, AI, raporty, próbne egzaminy z oceną.
- Kanały: SEO + referral + YouTube/TikTok.
- Ryzyko: sezonowość, konkurencja free AI.

**B. „Platforma klasowa” (B2B/B2C)**
- Cel: klasy 4–8 + LO 1–4, nauczyciel w centrum.
- Cena: 49–79 zł/mies. nauczyciel; 1 500–3 000 zł/rok szkoła.
- Wartość: generator, klasy, zadania domowe, analiza wyników, RODO, faktura.
- Kanały: sprzedaż bezpośrednia, konferencje nauczycieli, partnerstwa.
- Ryzyko: długi cykl sprzedaży, wsparcie, SSO.

**Rekomendacja:** zacznij od **A**, ale z **planami klasowymi** jako pierwszym rozszerzeniem — to one dają LTV. B2B dodaj po 3–6 miesiącach, gdy będzie 50–100 płacących szkół/nauczycieli w pilocie.

### Pięć rzeczy do zrobienia w tym tygodniu

1. Zamknąć rozwiązania po stronie serwera.
2. Ujednolicić liczby i copy (46 arkuszy, 12,8 tys. zadań).
3. Dodać dane operatora, odstąpienie, zgodę na regulamin i wiek/rodzica.
4. Dodać diagnozę + datę egzaminu + „plan na dziś”.
5. Dodać „zgłoś błąd” przy zadaniu i welcome email.

### Ocena końcowa

| Wymiar | Ocena |
| --- | --- |
| Problem i rynek | 9/10 |
| Treść | 7,5/10 |
| UX/design | 8/10 |
| Technika | 8,5/10 |
| Monetyzacja | 4/10 |
| Dystrybucja | 5/10 |
| Retencja | 6/10 |
| Zaufanie/legal | 5/10 |
| **Jako projekt** | **8,5/10** |
| **Jako biznes dziś** | **4,5/10** |
| **Potencjał po fokusie** | **7/10** |

**Zdanie na koniec:** to nie jest projekt, który trzeba „poprawiać”. To projekt, który trzeba **zawęzić**: wybrać jednego użytkownika (klasa 8 / matura), jedną obietnicę (plan i egzamin, nie „wszystko”) i jeden kanał (SEO + referral), a resztę odłożyć. Technicznie jesteś gotowy. Biznesowo — dopiero zaczynasz.

---

## 8. Status wdrożenia (16.11.2026)

Pierwsza partia z priorytetów 0–30 dni:

- [x] Strona główna pokazuje **46 arkuszy** (archiwum CKE + katalog), a nie 6.
- [x] Plan Start nie obiecuje już „3 arkuszy CKE”; copy mówi o podglądzie bazy i arkuszy.
- [x] `dla-szkol` nie zaniża liczby zadań do „ponad 2200”; mówi o tysiącach zadań i 46 arkuszach.
- [x] „Zgłoś błąd w zadaniu” jest dostępne przy zadaniu w treningu i w arkuszach CKE, z prefillem numeru zadania.
- [x] Rozwiązania arkuszy CKE są pobierane z `/api/trening/task-solution` tylko dla Pro; strona arkusza nie serializuje już `steps`/`explanation` do klienta.
- [x] Widok pojedynczego zadania (`TaskSolverView`) nie importuje już całego katalogu do bundla klienta; zadanie i podobne zadania przychodzą z serwera bez `solutionSteps`, a rozwiązanie dociąga `/api/trening/task-solution` tylko dla Pro.
- [x] Diagnoza startowa `/diagnostyka`: 8 pytań, wynik ogólny i per dział, zapis lokalny.
- [x] Data egzaminu i licznik dni w treningu (`localStorage`, bez konta).
- [x] Cookie banner skrócony na mobile.
- [x] „Plan na dziś”: karta następnego kroku pokazuje dni do egzaminu, najsłabszy dział z diagnozy i postęp tematu.
- [x] Listing `/baza-zadan` nie importuje już katalogu do klienta: zadania (bez `solutionSteps`) i arkusze przychodzą z serwera, a filtrowanie odbywa się na sanitizowanych danych.
- [x] Paywall dla rozwiązań z CMS: `CmsTaskCard` pobiera `rozwiazanie` z `/api/trening/cms-solution` tylko dla Pro; zwykłe zapytania `zadania` nie selekcjonują już tej kolumny.
- [x] Wydruk „PDF z kluczem” (`/arkusze/[id]/druk?klucz=1`) nie serwuje już rozwiązań w HTML; Pro pobiera klucz przez `/api/trening/arkusz-solutions`. Data egzaminu jest też w onboardingu.
- [x] Zgoda na regulamin i politykę prywatności, potwierdzenie wieku/zgody opiekuna, informacja o 14-dniowym odstąpieniu oraz sekcja dla niepełnoletnich.
- [x] Plan dla klasy `/plan-klasy`: orientacyjny plan tematów dla klas 4–8, liceum, technikum i branżowej; klasy 1–3 mają jasny komunikat o braku planu.
- [x] Pełne filtrowanie treningu po klasie: drzewo `/trening` zawęża się do tematów z planu wybranej klasy, z banerem „Plan dla…” i linkiem do zmiany klasy.
- [x] Sekcja „Dane operatora” w regulaminie i polityce jest konfigurowana przez `NEXT_PUBLIC_OPERATOR_*`; renderuje się tylko, gdy dane są ustawione.
- [ ] Wpisać prawdziwe dane operatora (nazwa, adres, NIP) w zmiennych środowiskowych.
- [x] Welcome email przez Resend (`lib/email/welcome.ts`) wysyłany po rejestracji, jeśli `RESEND_API_KEY` jest ustawiony.
- [ ] Zweryfikować domenę w Resend i ustawić `WELCOME_EMAIL_FROM`, żeby mail dochodził do uczniów.
- [x] `/matura-rozszerzona`: strona z zakresem materiału i 12 oficjalnymi arkuszami rozszerzonymi.
- [ ] Pełny plan tematyczny i baza zadań rozszerzonych — nadal brak treści.
- [x] Startowy panel nauczyciela `/dla-szkol/panel`: generator, baza zadań, arkusze, rozszerzona i plan klasy w jednym miejscu.
- [x] Formularz zapytania o pakiet szkolny (`/api/school-inquiry`): walidacja, honeypot, wysyłka przez Resend.
- [ ] Pełny panel B2B (klasy, uczniowie, wyniki, faktury) — wymaga kont szkolnych i osobnego wdrożenia.
- [x] A11y quick wins: skip link, `aria-live` w diagnozie, `role="status"` przy ładowaniu.
- [x] Raport postępów do druku z profilu (`Drukuj raport` + `@media print`).
- [x] Macierz layoutu zadań 390/710/1280: trening, baza zadań, arkusz CKE i diagnoza (`e2e/layout-matrix.spec.ts`).
- [x] Regresja layoutu diagnozy: feedback i przycisk „Następne pytanie” nie nachodzą na siebie.
- [x] Bramka a11y w lincie: wybrane reguły `jsx-a11y`, powiązane etykiety formularzy admina.
- [x] Pułapka fokusu w dialogach mobilnych (Więcej, Graj, menu nawigacji) + powrót fokusu.
- [x] Automatyczny audyt axe-core 29 tras w jasnym/ciemnym motywie i na 390/1280 px; 0 naruszeń.
- [ ] Pełny audyt a11y z kontem użytkownika i panelem admina (wymaga danych logowania).

