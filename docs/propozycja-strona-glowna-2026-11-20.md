# Propozycja przebudowy strony głównej

**Data:** 20.11.2026  
**Status:** do rozmowy — nic nie jest jeszcze wdrażane  
**Zakres:** strona główna, nowa strona `/funkcje`, lista braków produktowych

> **Wersja 2 po uwagach:** [`propozycja-strona-glowna-v2-2026-11-20.md`](propozycja-strona-glowna-v2-2026-11-20.md)
> — ranking, AI, sprawdziany, powtórki i plan tygodnia jako osobne sekcje;
> cennik przeniesiony na sam dół.

---

## 1. W skrócie

Dziś strona główna pokazuje **3 ścieżki** (trening, baza zadań, arkusze CKE) i kilka
dodatków (minigry, liczby, wzory, zagadka). W serwisie jest jednak **21 obszarów** —
m.in. powtórki, sprawdziany, wyzwania, pojedynki, rankingi, osiągnięcia, profil,
asysta AI, cennik, program poleceń i panel dla szkół. Użytkownik nie ma szansy
dowiedzieć się o nich z home page.

Proponuję układ:

1. **Hero** — jedna obietnica + szybka próba (zostaje, bez zmian).
2. **„Wszystko w jednym miejscu”** — 16 kart w 4 grupach, każda z jednym zdaniem
   i linkiem. To jest odpowiedź na „co jeszcze dostaję”.
3. **„Jak to działa”** — 3 kroki: diagnoza → trening → egzamin i powtórki.
4. **Dla nauczyciela** — osobny pas, bo to inny odbiorca i inna konwersja.
5. **Cennik** — krótki pasek Start / Pro / Roczny (dziś na home go nie ma).
6. **Darmowa rozgrzewka** — wzory i zagadka dnia (zostają, ale niżej).
7. **FAQ** — 6 pytań, które najczęściej blokują rejestrację.
8. **Końcowe CTA + stopka jako pełna mapa serwisu.**

Równolegle proponuję **nową stronę `/funkcje`** — pełny, szczegółowy katalog
wszystkiego, co jest w serwisie. Home page ma być skanowalny, a `/funkcje` ma
domykać pytanie „a co dokładnie tam jest?”. Link do niej w karcie „wszystko”
i w stopce.

**Czego nie mamy (skrót):**

- matura rozszerzona to na razie tylko arkusze — brak planu, teorii i zadań,
- B2B to generator i panel z linkami — brak klas, przypisań, wyników i faktur,
- przypomnienia są tylko w przeglądarce — brak e-maili,
- raport dla rodzica to wydruk profilu — brak podziału na działy i historii,
- brak trybu egzaminu na czas,
- brak zeszytu błędów,
- brak globalnej wyszukiwarki,
- brak pełnej bazy wzorów i fiszek,
- brak wideo (jest tylko pole `video_url`).

Rekomendacja na „po home page”: **tryb egzaminu na czas**, **zeszyt błędów**,
**plan tygodnia + e-maile**. To trzy rzeczy, które najbardziej domykają obietnicę
„przygotuję cię do egzaminu”.

---

## 2. Inwentarz: co realnie jest w serwisie

Legenda: ✅ = jest na stronie głównej, 🟡 = tylko wzmianka/pill, ❌ = nie ma.

| # | Obszar | Co konkretnie | Gdzie | Home |
|---:|---|---|---|:---:|
| 1 | Ścieżki i onboarding | egzamin ósmoklasisty i matura podstawowa; wybór klasy 4–8 / szkoła średnia; klasa i data egzaminu w onboardingu | `/trening`, `/plan-klasy` | 🟡 |
| 2 | Trening tematyczny | 134 tematy: teoria, zadania, poziom trudności, rozwiązania krok po kroku, postęp, XP, seria, licznik do egzaminu | `/trening/[exam]/[category]/[topic]` | ✅ |
| 3 | Teoria | 134 lekcje z wzorami i przykładami; pole `video_url` jest obsługiwane, ale w seedzie nie ma żadnego wideo | zakładka „Teoria” w temacie | ❌ |
| 4 | Baza zadań | 1926 zadań w katalogu (+ zadania CMS), filtry egzamin/dział/poziom, wyszukiwarka w panelu, rozwiązania w Pro | `/baza-zadan` | ✅ |
| 5 | Arkusze CKE | 46 arkuszy: 40 sesji CKE (20 podstawowych, 12 rozszerzonych, 8 ósmoklasisty) + 6 arkuszy treningowych; klucz, druk, rozwiązania w Pro | `/trening/arkusze` | ✅ |
| 6 | Sprawdziany | generator dla klas 6–8 i liceum: grupy A/B, klucz, punktacja, PDF, tryb online, ocena AI zadań otwartych | `/sprawdziany`, `/sprawdziany/druk` | ❌ |
| 7 | Panel nauczyciela | generator, baza zadań, arkusze CKE, matura rozszerzona, plan dla klasy — jedno miejsce dla nauczyciela | `/dla-szkol/panel` | ❌ |
| 8 | Diagnoza startowa | 8 krótkich pytań, wynik per dział, zapis lokalny, bez konta | `/diagnostyka` | 🟡 |
| 9 | Plan klasy | orientacyjny plan roku dla klas 4–8 i szkół średnich; klasy 1–3 bez planu (świadoma decyzja) | `/plan-klasy` | ❌ |
| 10 | Powtórki | spaced repetition w wariancie SM-2: własna talia, dodawanie zadań, sesja, podsumowanie | `/powtorki` | ❌ |
| 11 | Minigry | 34 gry, 3 tryby: na czas (60 s), survival, maraton; XP, minigra dnia | `/minigry` | ✅ |
| 12 | Wyzwania | 5 pytań dziennie, XP, seria dni, rekord | `/wyzwania` | ❌ |
| 13 | Pojedynki | 4 tryby: online na żywo, „na kod”, hot-seat, z botem; rating i nagrody | `/pojedynki` | ❌ |
| 14 | Rankingi | top 20 w trzech zakładkach: wszyscy / minigry / pojedynki | `/rankingi` | ❌ |
| 15 | Osiągnięcia | 26 odznak za zadania, poziom, serię, wyzwania, minigry, pojedynki i porę dnia | `/osiagniecia` | ❌ |
| 16 | Profil i postępy | statystyki, historia, poziom, seria, avatar, raport do druku, eksport i usunięcie konta | `/profil` | ❌ |
| 17 | Program poleceń | 2 zakwalifikowanych znajomych = 30 dni Pro, raz na konto | `/polecenia` | ❌ |
| 18 | Płatności | Start 0 zł, Pro 29 zł/mies., Roczny 249 zł/rok; Stripe, portal, anulowanie | `/cennik` | ❌ |
| 19 | Asysta AI | podpowiedzi do zadania, ocena zadań otwartych, rozwiązania; limity w Pro | trening / baza zadań | ❌ |
| 20 | Matura rozszerzona | 12 oficjalnych arkuszy i mapa zakresu; pełna ścieżka tematyczna „w przygotowaniu” | `/matura-rozszerzona` | ❌ |
| 21 | Dodatki | tryb ciemny, powiadomienia przeglądarki o serii, zgłaszanie błędów ze zrzutem, kontakt, regulamin, polityka, cookies, admin, Telegram | różne | ❌ |

**Liczby, które warto pokazywać:** 34 minigry · 1926 zadań · 46 arkuszy · 134 tematy
· 26 osiągnięć. Wszystkie pochodzą z kodu/statusu, więc nie są „marketingowe”.

---

## 3. Co dziś widzi użytkownik na stronie głównej

| Blok | Co mówi | Czego nie mówi |
|---|---|---|
| Hero + szybka próba | „Przygotuj się do egzaminu”, 3 CTA, 2 pytania bez konta | że poza treningiem jest jeszcze 15 obszarów |
| 3 karty | trening, baza zadań, arkusze CKE | powtórki, sprawdziany, gry, profil, AI, cennik |
| Minigry | 1 minigra dnia + 3 popularne gry | 3 tryby, 34 gry, pojedynki, wyzwania, rankingi |
| Liczby | 34 / 1926 / 46 | 134 tematy, 26 osiągnięć, 40 sesji CKE |
| Wzory | 6 wzorów na poziom | że to dopiero zajawka bazy wzorów |
| Zagadka dnia | 1 pytanie | że to część większego systemu gier |
| Stopka | 7 linków produktowych + 6 informacyjnych | brakuje połowy serwisu (powtórki, sprawdziany, rankingi, profil, matura rozszerzona) |

**Wniosek:** home page jest dziś dobrą stroną „startową treningu”, ale nie jest
stroną „całego serwisu”. Nie odpowiada na pytanie „co jeszcze dostaję za darmo
i co daje Pro?”.

---

## 4. Trzy warianty — i co rekomenduję

| | A. Hub + `/funkcje` | B. Wszystko na home page | C. Segmentacja po odbiorcy |
|---|---|---|---|
| Idea | home = 16 kart w 4 grupach + link do pełnej listy | home = 30+ pozycji, pełny katalog | przełącznik: uczeń E8 / maturzysta / nauczyciel / rodzic |
| Długość | średnia (ok. 1,5× dziś) | bardzo długa (2,5–3×) | średnia, ale treść zmienna |
| Skanowalność | wysoka | niska | wysoka |
| Konwersja | wysoka — jedno główne CTA | ryzyko rozproszenia | wysoka, jeśli trafimy z segmentem |
| SEO | dobre — `/funkcje` zbiera długi ogon | dobre, ale wszystko na jednym URL | średnie — treść ukryta za stanem |
| Koszt | 1–2 dni | 2–3 dni | 3–5 dni |
| Ryzyko | trzeba pilnować, by karty nie były „ścianą” | użytkownik przewija i nie klika | więcej stanu, trudniejsze testy |

**Rekomendacja: A + elementy C.** Home page zostaje skanowalny, ale w sekcji
„wszystko” dodajemy dyskretny przełącznik „Uczę się do: ósmoklasisty / matury”,
który podświetla rekomendowane karty. Pełny katalog żyje na `/funkcje`.

Jeśli zależy Ci, żeby **dosłownie wszystko** było na home page, wybierz B — ale
wtedy trzeba zaakceptować długość i mniejszą klikalność. Nie polecam.

---

## 5. Proponowany układ strony głównej — sekcja po sekcji

Poniżej gotowy szkielet i copy do zatwierdzenia. Kolejność jest celowa:
najpierw „co z tego mam”, potem „jak to działa”, potem „ile to kosztuje”.

```text
┌─────────────────────────────────────────────────────┐
│ HERO: H1 + podtytuł + CTA            SZYBKA PRÓBA   │
├─────────────────────────────────────────────────────┤
│ WSZYSTKO W JEDNYM MIEJSCU                           │
│  Zacznij tutaj  |  Ucz się i utrwalaj                │
│  Sprawdzaj      |  Progres i wsparcie                │
│  (4 grupy × 4 karty = 16 kart)                      │
├─────────────────────────────────────────────────────┤
│ JAK TO DZIAŁA: diagnoza → trening → egzamin         │
├─────────────────────────────────────────────────────┤
│ DLA NAUCZYCIELA: generator + panel + pakiet          │
├─────────────────────────────────────────────────────┤
│ CENNIK: Start / Pro / Roczny                        │
├─────────────────────────────────────────────────────┤
│ DARMOWA ROZGRZEWKA: wzory + zagadka dnia             │
├─────────────────────────────────────────────────────┤
│ FAQ (6 pytań)                                       │
├─────────────────────────────────────────────────────┤
│ CTA końcowe + STOPKA = mapa serwisu                  │
└─────────────────────────────────────────────────────┘
```

### 5.1. Hero (zostaje, lekko doprecyzowany)

**H1:** Przygotuj się do egzaminu z matematyki.

**Podtytuł:** Teoria, zadania, arkusze CKE, powtórki i gry — w jednym miejscu.
Bez skakania po dziesięciu stronach i bez zgadywania, od czego zacząć.

**CTA:**
- główne: `Zacznij trening` → `/trening`
- drugie: `Zrób diagnozę` → `/diagnostyka`
- link: `Zobacz arkusze CKE` → `/trening/arkusze`
- pill: `Minigra na 60 s` → `/minigry`

**Pasek liczb pod hero:** 34 minigry · 1926 zadań · 46 arkuszy · 134 tematy.

**Szybka próba** (obecny komponent `QuickTrial`) zostaje po prawej. To najlepszy
element home page: daje natychmiastową wartość bez konta.

### 5.2. „Wszystko w jednym miejscu” — 16 kart w 4 grupach

**Nagłówek:** Wszystko, czego potrzebujesz do matematyki  
**Lead:** Nie tylko zadania. Cały system nauki — od diagnozy po ostatnią powtórkę
przed egzaminem.

Karty są kompaktowe: ikona, tytuł, jedno zdanie, link „Otwórz →”. Na mobile
zwijają się w akordeon per grupa.

#### Grupa 1 — „Zacznij tutaj”

| Karta | Copy | Link | Badge |
|---|---|---|---|
| Trening tematyczny | Teoria, zadania i rozwiązania krok po kroku. Wybierasz temat i widzisz, co już umiesz. | `/trening` | — |
| Diagnoza startowa | 8 pytań i konkretny wynik: od czego zacząć i co powtórzyć najpierw. | `/diagnostyka` | — |
| Arkusze CKE | 46 arkuszy z lat 2015–2026: matura podstawowa, rozszerzona i egzamin ósmoklasisty. Rozwiąż online albo wydrukuj; klucz i pełne rozwiązania w Pro. | `/trening/arkusze` | — |
| Minigry | 34 szybkie gry w trzech trybach. 60 sekund rachunków zamiast przewijania telefonu. | `/minigry` | — |

#### Grupa 2 — „Ucz się i utrwalaj”

| Karta | Copy | Link | Badge |
|---|---|---|---|
| Teoria | 134 lekcje z wzorami i przykładami. Krótko i konkretnie, bez akademickiego lania wody. | `/trening` | — |
| Baza zadań | 1926 zadań z filtrami po egzaminie, dziale i poziomie. Rozwiązania krok po kroku odblokowuje Pro. | `/baza-zadan` | — |
| Powtórki | Zadania wracają w rytmie spaced repetition — dokładnie wtedy, gdy zaczynasz je zapominać. | `/powtorki` | — |
| Plan klasy | Wybierz klasę i zobacz, które tematy warto przerobić w tym roku. | `/plan-klasy` | — |

#### Grupa 3 — „Sprawdzaj i rywalizuj”

| Karta | Copy | Link | Badge |
|---|---|---|---|
| Sprawdziany | Generator klasówek: grupy A/B, punktacja, klucz i PDF w minutę. Dla nauczyciela i dla siebie. | `/sprawdziany` | — |
| Wyzwania | 5 pytań dziennie i seria dni. Mały rytuał, który trzyma cię w nauce. | `/wyzwania` | — |
| Pojedynki | 1v1 na żywo, na kod, na jednym urządzeniu albo z botem. Ten sam zestaw pytań, jeden zwycięzca. | `/pojedynki` | — |
| Rankingi i osiągnięcia | Top 20 w trzech kategoriach i 26 odznak do zdobycia. | `/rankingi` | — |

#### Grupa 4 — „Twój progres i wsparcie”

| Karta | Copy | Link | Badge |
|---|---|---|---|
| Profil i postępy | XP, poziom, seria, historia zadań i raport do druku. Widzisz, że idziesz do przodu. | `/profil` | — |
| Asystent AI | Podpowiedź, gdy utkniesz, i ocena zadań otwartych. Bez podawania gotowca. | `/trening` | Pro |
| Matura rozszerzona | 12 oficjalnych arkuszy i mapa zakresu. Pełna ścieżka tematyczna w przygotowaniu. | `/matura-rozszerzona` | W przygotowaniu |
| Program poleceń | Zaproś 2 znajomych, którzy naprawdę zaczną ćwiczyć, i odbierz 30 dni Pro. | `/polecenia` | — |

**Pod siatką:** `Pełna lista funkcji →` `/funkcje`

> Karty `/profil`, `/powtorki` i część `/pojedynki` wymagają konta (albo pokazują
> bramkę logowania). Dla gościa warto dodać badge „Po zalogowaniu” i prowadzić
> do strony z wyjaśnieniem, a nie od razu do redirectu. To detal, ale potrafi
> zepsuć pierwsze wrażenie.

**Pasek dodatków (mały, jednolinijkowy):** tryb ciemny · przypomnienia o serii ·
zgłaszanie błędów · eksport danych.

> Uwaga: karta „Asystent AI” prowadzi do treningu, bo nie ma osobnej strony AI.
> Jeśli chcemy osobne `/ai`, to już nowa funkcja — patrz sekcja 7.

### 5.3. „Jak to działa” — 3 kroki

**Nagłówek:** Od pierwszego pytania do ostatniej powtórki  
**Lead:** Trzy kroki, które możesz przejść dziś. Bez planowania na pół roku.

| Krok | Tytuł | Copy |
|---:|---|---|
| 1 | Zrób diagnozę | 8 pytań z różnych działów. Po wyniku wiesz, które obszary wymagają powtórki. |
| 2 | Ucz się tematem | Krótka teoria, potem zadania. Gdy utkniesz, masz rozwiązanie krok po kroku i asystę AI. |
| 3 | Sprawdź się i utrwal | Arkusze CKE, powtórki i gry. Wracasz do błędów, zamiast zaczynać od zera. |

CTA pod krokami: `Zacznij od diagnozy` → `/diagnostyka`.

### 5.4. Dla nauczyciela — osobny pas

**Nagłówek:** Prowadzisz lekcje? Sprawdzian zrobisz w minutę.  
**Copy:** Wybierasz klasę i dział, generujesz grupy A i B, drukujesz z kluczem
i punktacją. Bez Worda i bez liczenia punktów na piechotę.

**3 bullety:**
- grupy A/B z innymi liczbami w tych samych zadaniach,
- klucz i schemat punktowania do każdego zadania,
- PDF do druku albo sprawdzian online z oceną AI.

**CTA:** `Zobacz generator` → `/sprawdziany` · `Panel nauczyciela` → `/dla-szkol/panel`
· `Pakiet szkolny` → `/dla-szkol`

### 5.5. Cennik — krótki pasek

**Nagłówek:** Start jest darmowy. Pro odblokowuje pełną naukę.

| Plan | Cena | Co daje |
|---|---|---|
| Start | 0 zł na zawsze | wszystkie minigry, podgląd bazy i arkuszy, wyzwania, powtórki |
| Pro | 29 zł/mies. | pełne rozwiązania, AI, wszystkie arkusze, sprawdziany z oceną AI, filtry |
| Roczny | 249 zł/rok | wszystko z Pro, jedna płatność, oszczędność 99 zł |

**CTA:** `Zobacz pełny cennik` → `/cennik`  
**Pod spodem:** `Zaproś 2 znajomych — 30 dni Pro` → `/polecenia`

> Dziś cennik jest tylko na `/cennik`. Uważam, że na home page musi być przynajmniej
> zajawka, bo „czy to darmowe?” to jedno z pierwszych pytań.

### 5.6. Darmowa rozgrzewka — wzory i zagadka

Zostają obecne sekcje (`FormulaSheet`, `DailyPuzzle`), ale schodzą niżej i dostają
wspólny nagłówek: **„Nie chcesz się jeszcze rejestrować? Zacznij od wzorów i zagadki.”**

To ważne: home page nie może skończyć się na cenniku. Dajemy jeszcze jedną
bezpłatną, natychmiastową wartość.

### 5.7. FAQ — 6 pytań

| Pytanie | Odpowiedź |
|---|---|
| Czy Szybka Matematyka jest darmowa? | Tak. Start jest darmowy na zawsze: minigry, podgląd bazy i arkuszy, wyzwania i powtórki. Pro odblokowuje pełne rozwiązania, AI i sprawdziany z oceną. |
| Czy muszę mieć konto? | Nie, żeby zacząć. Konto zapisuje postęp, serię i osiągnięcia oraz pozwala uczyć się na kilku urządzeniach. |
| Skąd są arkusze? | Z oficjalnych arkuszy CKE. Nie jesteśmy oficjalnym serwisem CKE i nie publikujemy przecieków. |
| Czy to zastąpi korepetytora? | Nie. To narzędzie do regularnej pracy. Rozwiązania i AI pomagają, gdy utkniesz, ale nie odrabiają zadań za Ciebie. |
| Czy mogę uczyć się na telefonie? | Tak. Strona działa w przeglądarce na telefonie i komputerze. |
| Czy matura rozszerzona jest gotowa? | Mamy 12 oficjalnych arkuszy i mapę zakresu. Pełna ścieżka z teorią i zadaniami jest w przygotowaniu — nie udajemy, że jest skończona. |

### 5.8. Końcowe CTA

**Nagłówek:** Zacznij od 8 pytań. Reszta przyjdzie sama.  
**Copy:** Diagnoza zajmuje kilka minut i nie wymaga konta.  
**CTA:** `Zrób diagnozę` → `/diagnostyka` · `Zacznij trening` → `/trening`

### 5.9. Stopka jako mapa serwisu

Obecna stopka ma 13 linków. Proponuję 5 kolumn:

- **Nauka:** Trening, Baza zadań, Teoria, Plan klasy, Powtórki
- **Egzaminy:** Arkusze CKE, Sprawdziany, Diagnoza, Matura rozszerzona
- **Gry:** Minigry, Wyzwania, Pojedynki, Rankingi, Osiągnięcia
- **Konto:** Profil, Cennik, Program poleceń, `/funkcje`
- **Szkoła i informacje:** Dla szkół, Panel nauczyciela, Kontakt, Regulamin,
  Polityka prywatności, Zgłoś błąd

To najtańszy sposób, żeby „wszystkie rzeczy” były dostępne z każdego miejsca.

---

## 6. Nowa strona `/funkcje`

**Po co:** home page ma sprzedawać i kierować. `/funkcje` ma odpowiadać na pytanie
„co dokładnie jest w środku?” i zbierać SEO na frazy typu „platforma do nauki
matematyki”, „sprawdziany z matematyki online”, „powtórki matematyki”.

**Struktura:**

1. Hero: „Wszystko, co jest w Szybkiej Matematyce” + 4 liczby.
2. Sekcje tematyczne (te same 4 grupy co na home page), ale każda pozycja ma
   2–4 zdania, zrzut/ikonę i link.
3. Tabela „Co dostajesz w Start, a co w Pro”.
4. „Czego jeszcze nie ma” — krótka, uczciwa lista „w przygotowaniu”
   (matura rozszerzona, B2B, e-maile, tryb egzaminu).
5. FAQ i CTA.

**Wymagania techniczne:** strona statyczna (server component), bez nowych zapytań
do bazy; dane funkcji w `lib/home/feature-map.ts`, żeby home i `/funkcje` korzystały
z jednego źródła. Nad Link do `/funkcje` w stopce i w sekcji „wszystko”.

---

## 7. Czego jeszcze nie mamy — propozycje

Legenda rozmiaru: **S** = 1–3 dni, **M** = 1–2 tyg., **L** = 2–4 tyg., **XL** = 4–8 tyg.

### 7.1. Rzeczy już zapowiedziane (backlog w `AI-HANDOFF.md`)

| Priorytet | Propozycja | Problem, który rozwiązuje | Rozmiar |
|---|---|---|---|
| P1 | **Matura rozszerzona — pełna ścieżka** | Dziś są tylko arkusze. Uczeń rozszerzenia nie ma planu, teorii ani zadań. To najbardziej widoczna obietnica bez pokrycia. | L |
| P1 | **B2B: klasy, przypisania, wyniki, faktury** | Panel nauczyciela to dziś zestaw linków. Szkoła nie może przypisać sprawdzianu klasie ani zobaczyć wyników. | XL |
| P1 | **E-maile z przypomnieniami** | Przypomnienia są tylko w przeglądarce, więc działają, gdy użytkownik sam wejdzie na stronę. | M |
| P2 | **Raport rodzica** | Wydruk profilu nie pokazuje podziału na działy ani historii. Rodzic nie widzi, co dziecko realnie umie. | S–M |

### 7.2. Nowe rekomendacje — domknięcie pętli nauki

| Priorytet | Propozycja | Problem, który rozwiązuje | Rozmiar |
|---|---|---|---|
| **1** | **Tryb egzaminu na czas** | Można przeglądać arkusze, ale nie ma symulacji egzaminu: timer, punktacja, próg, wynik per dział. To największa luka w obietnicy „przygotowanie do egzaminu”. | M |
| **2** | **Zeszyt błędów** | Po błędzie zadanie nie trafia automatycznie do powtórek. Uczeń nie ma jednego miejsca „co mi nie wyszło”. | M |
| **3** | **Plan tygodnia + cel dzienny** | Jest plan klasy i licznik do egzaminu, ale brak „co dziś zrobić” i przypomnienia. To najkrótsza droga do aktywacji nowego użytkownika. | M |
| 4 | **Globalna wyszukiwarka** | Wyszukiwarka jest tylko w bazie zadań i w powtórkach. Nie można znaleźć tematu, zadania i arkusza z jednego miejsca. | M |
| 5 | **Baza wzorów i fiszki** | Na home page jest 6 wzorów. Uczeń nie ma pełnej, przeszukiwalnej ściągi ani fiszek do wykucia. | S–M |
| 6 | **Wideo / animacje** | W bazie jest pole `video_url`, ale brak treści. Krótkie wyjaśnienia (30–90 s) do najtrudniejszych tematów. | L |
| 7 | **Ligi tygodniowe / turnieje** | Ranking jest globalny i statyczny. Brak krótkich sezonów, które dają drugą szansę i wracają co tydzień. | M |
| 8 | **A11y: tryb dysleksji, większa czcionka, czytanie na głos** | Część rzeczy jest poprawiona, ale brak pełnego audytu i trybów wspomagających. | M |
| 9 | **Tłumaczenia UA/EN** | W polskich szkołach jest wielu uczniów z Ukrainy. Brak wersji językowej. | L |
| 10 | **Integracje: Google Classroom, Librus/Vulcan** | Nauczyciel nie może podpiąć sprawdzianu do dziennika. Duży zysk dla B2B. | L |

### 7.3. Czego nie robić teraz

- **Sklep za XP i kosmetyki** — fajne, ale nie zwiększa wyników egzaminu.
- **Publiczne profile i znajomi** — moderacja, RODO, za dużo na ten etap.
- **Certyfikaty i dyplomy** — sensowne dopiero przy B2B.
- **Kolejne minigry** — jest ich 34; problemem nie jest liczba, tylko konwersja.

### 7.4. Rekomendowana kolejność po home page

To kolejność wdrożeń, nie ważność — matura rozszerzona jest ważna, ale większa
i wymaga osobnego cyklu treści.

1. **Tryb egzaminu na czas** (M) — domyka najważniejszą obietnicę.
2. **Zeszyt błędów + auto-dodawanie do powtórek** (M) — domyka pętlę nauki.
3. **Plan tygodnia + e-maile** (M) — podnosi powroty i aktywację.
4. **Matura rozszerzona** (L) — nowy segment uczniów.
5. **B2B** (XL) — największy projekt, ale i największy przychód; dopiero po
   uporządkowaniu home page i lejka.

---

## 8. Wdrożenie strony głównej — plan techniczny

### Etap 1 — szkielet i copy (1–2 dni)

- `lib/home/feature-map.ts` — jedno źródło danych: grupa, tytuł, opis, link, badge.
- `components/home/FeatureMap.tsx` — server component, grid 2/4 kolumny, akordeon
  na mobile (bez JS, np. `<details>`).
- `components/home/HowItWorks.tsx` — 3 kroki.
- `components/home/TeacherBand.tsx` — pas dla nauczycieli.
- `components/home/PricingTeaser.tsx` — pasek cennika (dane z `lib/subscription/plans.ts`).
- `app/page.tsx` + `components/home/HomeDashboard.tsx` — nowa kolejność sekcji.
- `app/funkcje/page.tsx` — pełna lista.
- `app/sitemap.ts` — dodać `/funkcje`.
- `lib/layout/footer-links.ts` — nowe kolumny.
- `e2e/smoke.spec.ts` — test, że `/funkcje` się renderuje i linki działają.

### Etap 2 — dopracowanie (1 dzień)

- FAQ z `<details>` (bez JS).
- Pasek dodatków (tryb ciemny, przypomnienia, zgłoszenia).
- Spójne badge „Pro” i „W przygotowaniu”.
- Mobile: sprawdzić, że 16 kart nie tworzy ściany — akordeon per grupa.

### Etap 3 — pomiar (opcjonalnie)

- Zdarzenia: klik w kartę funkcji, klik w `/funkcje`, scroll depth, start diagnozy.
- A/B: obecny home vs nowy (jeśli ruch pozwala).
- Kryteria sukcesu: wzrost kliknięć w `/trening` i `/diagnostyka`, spadek
  odrzuceń, wzrost rejestracji.

### Czego pilnować

- **Nie dublować CTA.** Jedno główne „Zacznij trening”, reszta secondary.
- **Nie wysyłać całego katalogu do klienta.** Feature map to statyczne dane;
  nie importować `getAllTasks()` do komponentu klienckiego.
- **Zachować szybkość.** Nowe sekcje jako server components; brak nowych
  zapytań do Supabase na home page.
- **Nie obiecywać rzeczy, których nie ma.** Karta matury rozszerzonej ma badge
  „W przygotowaniu”, a FAQ mówi wprost, co jest gotowe.

---

## 9. Decyzje do podjęcia

1. **Wariant:** A (hub + `/funkcje`), B (wszystko na home), C (segmentacja)?
2. **Czy dodajemy `/funkcje` i przebudowujemy stopkę?** (Rekomendacja: tak.)
3. **Czy pokazujemy „W przygotowaniu”?** (Rekomendacja: tak, ale tylko przy
   maturze rozszerzonej i w FAQ — nie jako osobną sekcję na home.)
4. **Które braki robimy pierwsze?** (Rekomendacja: tryb egzaminu → zeszyt błędów
   → plan tygodnia + e-maile.)

---

## 10. Jedno zdanie podsumowania

Strona główna nie powinna być spisem 30 funkcji — powinna być **mapą 16 rzeczy,
które uczeń i nauczyciel naprawdę dostają**, z jednym mocnym CTA i uczciwym
„w przygotowaniu” tam, gdzie coś jeszcze nie działa.
