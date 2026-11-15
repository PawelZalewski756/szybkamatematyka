# Audyt działów: matura, egzamin ósmoklasisty i plan nauki

Data: 14.11.2026
Zakres: plan nauki (`/trening`), taksonomia bazy zadań, wybór ścieżki ucznia.

## Status po uzupełnieniu

Drzewa i cache zostały rozszerzone w tej samej sesji:

- Matura podstawowa: 8 działów i 38 tematów. Dodano: optymalizację i zadania optymalizacyjne, wielomiany, wyrażenia i równania wymierne, funkcję logarytmiczną, twierdzenie sinusów i cosinusów, twierdzenie Talesa z dwusieczną i okręgiem wpisanym, statystykę zaawansowaną oraz proporcjonalność odwrotną.
- Egzamin ósmoklasisty: 10 działów i 38 tematów. Dodano: notację wykładniczą, obliczenia praktyczne (czas, droga, prędkość oraz jednostki i pieniądze), zadania tekstowe, symetralną i dwusieczną, wielokąty, proste i odcinki, oś liczbową oraz system rzymski.
- Dla każdego z 17 nowych tematów jest lekcja teorii i 20 zadań w `data/tasks-cache`. Zadania mają deterministyczne identyfikatory, więc ponowne uruchomienie generatora nie zmienia postępu uczniów.

Poniższe tabele opisują stan przed uzupełnieniem i pozostają jako uzasadnienie zmian oraz lista rzeczy do dalszej pracy.

## Werdykt (stan przed uzupełnieniem)

Twoja intuicja jest trafna, ale nie w taki sposób, że brakuje połowy materiału. Plan nauki jest zbudowany jako uproszczone drzewo tematyczne, a nie odwzorowanie sekcji CKE. Efekt:

- Matura: 7 działów i 30 tematów w planie, a CKE ma 13 sekcji wymagań. Brakuje całej sekcji optymalizacyjnej oraz kilku dużych grup tematycznych (wielomiany, wyrażenia wymierne, funkcja logarytmiczna, twierdzenie sinusów i cosinusów, część planimetrii, skala centylowa i wartość oczekiwana).
- Egzamin ósmoklasisty: 8 działów i 29 tematów, a podstawa programowa ma 14 sekcji dla klas VII-VIII plus 14 sekcji dla klas IV-VI. Brakuje m.in. obliczeń praktycznych (czas, droga, prędkość, jednostki), zadań tekstowych, notacji wykładniczej, symetralnej i dwusiecznej oraz systemu rzymskiego.
- Ścieżka ucznia: aplikacja pozwala wybrać tylko "Szkoła podstawowa" albo "Szkoła średnia". Nie ma planów dla konkretnej klasy ani dla liceum 1-4. Nie ma też planu matury rozszerzonej, mimo że arkusze rozszerzone są w bazie.

To nie jest tylko kwestia nazw. Część brakujących rzeczy realnie pojawia się w arkuszach CKE, co pokazuję niżej na numerach zadań.

## 1. Matura podstawowa

### Co jest w planie

Plik `lib/trening/cke-matura-podstawowa.ts` ma 7 działów i 30 tematów:

| Dział w aplikacji | Tematy |
| --- | --- |
| Liczby rzeczywiste | potęgi, logarytmy, procenty, notacja wykładnicza, zbiory i przedziały, wartość bezwzględna, kolejność działań |
| Algebra i równania | wyrażenia algebraiczne, wzory skróconego mnożenia, równania liniowe, równania kwadratowe, nierówności, układy równań |
| Funkcje | funkcja liniowa, funkcja kwadratowa, funkcja wykładnicza, własności funkcji, odczyt wykresu |
| Ciągi | ciąg arytmetyczny, ciąg geometryczny |
| Trygonometria | sinus, cosinus, tangens, zastosowania trygonometrii |
| Geometria | planimetria, twierdzenie Pitagorasa i podobieństwo, okrąg i koło, stereometria, geometria analityczna |
| Kombinatoryka i statystyka | kombinatoryka, prawdopodobieństwo, statystyka |

### Porównanie z sekcjami CKE (2025/2026)

| Sekcja CKE | W planie | Ocena |
| --- | --- | --- |
| I. Liczby rzeczywiste | dział "Liczby rzeczywiste", 7 tematów | jest, ale bez dowodów podzielności i pierwiastków stopnia nieparzystego jako osobnych tematów |
| II. Wyrażenia algebraiczne | wyrażenia algebraiczne, wzory skróconego mnożenia | częściowo: brak wielomianów, rozkładu na czynniki, dzielenia przez dwumian i wyrażeń wymiernych |
| III. Równania i nierówności | równania liniowe, równania kwadratowe, nierówności | częściowo: brak równań wielomianowych, dwukwadratowych i wymiernych |
| IV. Układy równań | układy równań | jest, choć bez układu liniowo-kwadratowego jako tematu |
| V. Funkcje | funkcja liniowa, funkcja kwadratowa, funkcja wykładnicza, własności funkcji, odczyt wykresu | częściowo: brak funkcji logarytmicznej i funkcji f(x) = a/x; przekształcenia wykresów tylko w treści lekcji |
| VI. Ciągi | ciąg arytmetyczny, ciąg geometryczny | jest |
| VII. Trygonometria | sinus, cosinus, tangens, zastosowania trygonometrii | częściowo: brak twierdzenia sinusów i cosinusów jako tematu |
| VIII. Planimetria | planimetria, Pitagoras i podobieństwo, okrąg i koło | częściowo: brak twierdzenia Talesa, dwusiecznej, okręgu wpisanego i opisanego, punktów szczególnych trójkąta i wielokątów foremnych |
| IX. Geometria analityczna | geometria analityczna | częściowo: brak równania okręgu, odległości punktu od prostej i symetrii w układzie jako tematów |
| X. Stereometria | stereometria | częściowo: brak kątów w bryłach, przekrojów i brył podobnych jako tematów |
| XI. Kombinatoryka | kombinatoryka | jest |
| XII. Prawdopodobieństwo i statystyka | prawdopodobieństwo, statystyka | częściowo: brak skali centylowej, średniej ważonej i wartości oczekiwanej; odchylenie standardowe jest w treści lekcji statystyki |
| XIII. Optymalizacja i rachunek różniczkowy | brak | BRAK CAŁEJ SEKCJI |

### Co to oznacza

- W UI widzisz 7 działów, a CKE ma 13 sekcji. Trzy sekcje (wyrażenia algebraiczne, równania i nierówności, układy równań) są schowane w jednym dziale "Algebra i równania". Trzy sekcje geometryczne są schowane w "Geometrii". Dwie sekcje kombinatoryczno-statystyczne są w jednym dziale.
- To nie jest tylko inna nazwa. Część wymagań nie ma odpowiednika w drzewie: wielomiany, wyrażenia wymierne, równania wielomianowe i wymierne, funkcja logarytmiczna, f(x) = a/x, twierdzenie sinusów i cosinusów, twierdzenie Talesa, dwusieczna, okrąg wpisany i opisany, punkty szczególne trójkąta, skala centylowa, średnia ważona, wartość oczekiwana, optymalizacja.
- W treściach lekcji część z tych rzeczy występuje pobocznie, np. odchylenie standardowe w statystyce, wzmianka o twierdzeniu cosinusów w zadaniu albo optymalizacja w lekcji funkcji kwadratowej. To nie zastępuje osobnego tematu, bo uczeń nie znajdzie go przez wyszukiwarkę ani nie zobaczy postępu.

### Dowody z arkuszy maturalnych

- Matura 2024, zadanie 8: wielomian. W planie nie ma tematu "wielomiany".
- Matura 2024, zadanie 20: twierdzenie o dwusiecznej. W planie nie ma tematu "dwusieczna".
- Matura 2025, zadania 18 i 21: twierdzenie sinusów i cosinusów. W planie jest tylko ogólne "zastosowania trygonometrii".
- Matura 2025, zadanie 31: zadanie optymalizacyjne z funkcją kwadratową (sekcja XIII). W planie nie ma działu ani tematu optymalizacja.
- Matura 2018, zadanie 23 oraz matura 2023 (próbna, grudzień), zadanie 33: odchylenie standardowe. Jest w treści lekcji, ale nie jako temat.
- Matura 2023 (próbna, grudzień), zadania 11 i 12 oraz matura 2024, zadanie 8: wielomiany. Brak tematu.

## 2. Egzamin ósmoklasisty

### Co jest w planie

Plik `lib/trening/cke-egzamin-8.ts` ma 8 działów i 29 tematów:

| Dział w aplikacji | Tematy |
| --- | --- |
| Liczby i działania | ułamki, potęgi, pierwiastki, procenty, liczby całkowite, podzielność, kolejność działań |
| Algebra | wyrażenia algebraiczne, wzory skróconego mnożenia, równania, proporcje i skala |
| Geometria płaska | kąty, obwody, pola figur, Pitagoras, podobieństwo, okrąg i koło, symetrie |
| Geometria przestrzenna | bryły, objętość i pole powierzchni |
| Układ współrzędnych | punkty na płaszczyźnie, długość odcinka |
| Funkcje i wykresy | odczyt wykresu, proporcjonalność prosta |
| Statystyka | średnia, mediana i dominanta, diagramy |
| Kombinatoryka | prawdopodobieństwo, reguła mnożenia |

### Porównanie z sekcjami CKE dla klas VII-VIII

| Sekcja CKE | W planie | Ocena |
| --- | --- | --- |
| I. Potęgi o podstawach wymiernych | potęgi | jest, ale bez notacji wykładniczej |
| II. Pierwiastki | pierwiastki | jest |
| III. Tworzenie wyrażeń algebraicznych | wyrażenia algebraiczne | jest |
| IV. Przekształcanie wyrażeń algebraicznych | wyrażenia algebraiczne, wzory skróconego mnożenia | częściowo |
| V. Obliczenia procentowe | procenty | jest |
| VI. Równania z jedną niewiadomą | równania | jest |
| VII. Proporcjonalność prosta | proporcje i skala, proporcjonalność prosta | jest, choć podział proporcjonalny i prędkość są tylko w treści |
| VIII. Własności figur geometrycznych na płaszczyźnie | kąty, symetrie, Pitagoras, obwody, pola figur | częściowo: brak symetralnej odcinka i dwusiecznej kąta |
| IX. Wielokąty | pola figur, obwody | częściowo: brak osobnego tematu "wielokąty" i wielokątów foremnych |
| X. Oś liczbowa. Układ współrzędnych | punkty na płaszczyźnie, długość odcinka | częściowo: brak osi liczbowej jako tematu |
| XI. Geometria przestrzenna | bryły, objętość i pole powierzchni | jest |
| XII. Wprowadzenie do kombinatoryki i rachunku prawdopodobieństwa | prawdopodobieństwo, reguła mnożenia | jest |
| XIII. Odczytywanie danych i elementy statystyki opisowej | średnia, mediana i dominanta, diagramy | jest |
| XIV. Długość okręgu i pole koła | okrąg i koło | jest |

### Sekcje klas IV-VI, które realnie występują w arkuszach

Egzamin ósmoklasisty sprawdza całą podstawę programową, nie tylko klasy VII-VIII. W arkuszach 2025 i 2026 pojawiają się odniesienia do sekcji klas IV-VI:

| Sekcja CKE dla klas IV-VI | W planie | Ocena |
| --- | --- | --- |
| I. Liczby naturalne w układzie pozycyjnym | brak | BRAK, np. system rzymski |
| II. Działania na liczbach naturalnych | podzielność, kolejność działań | częściowo: brak działań pisemnych jako tematu, NWD i NWW są w treści |
| III. Liczby całkowite | liczby całkowite | jest |
| IV. Ułamki zwykłe i dziesiętne | ułamki | jest |
| V. Działania na ułamkach | ułamki, kolejność działań | jest |
| VI. Elementy algebry | wyrażenia algebraiczne | częściowo: to temat bardziej z klas VII-VIII |
| VII. Proste i odcinki | brak | BRAK |
| VIII. Kąty | kąty | jest |
| IX. Wielokąty, koła i okręgi | pola figur, obwody, okrąg i koło | jest |
| X. Bryły | bryły | jest |
| XI. Obliczenia w geometrii | obwody, pola figur, objętość i pole powierzchni | jest |
| XII. Obliczenia praktyczne | brak | BRAK jako temat: czas, droga, prędkość, jednostki, pieniądze, skala |
| XIII. Elementy statystyki opisowej | średnia, diagramy | jest |
| XIV. Zadania tekstowe | brak | BRAK jako temat |

### Nowe wymagania od 2025

Od 2025 egzamin ósmoklasisty wrócił do pełnej podstawy programowej. Wymagane są m.in.:

- notacja wykładnicza,
- symetralna odcinka,
- dwusieczna kąta.

W planie E8 nie ma żadnego z tych trzech tematów. Notacja wykładnicza jest tylko w planie maturalnym, a symetralna i dwusieczna nie występują w żadnym planie jako osobne tematy.

### Dowody z arkuszy E8

- Egzamin 2025, zadanie 9 i 19: "Obliczenia praktyczne" (prędkość, skala). W planie nie ma tematu "obliczenia praktyczne".
- Egzamin 2025, zadania 2, 3, 7, 12, 13, 15, 18 i 20: odniesienia do sekcji klas IV-VI (ułamki, działania na liczbach naturalnych, liczby całkowite, wielokąty, kąty, pola). Plan pokrywa je tylko częściowo.
- Egzamin 2026, zadania 7, 12, 15 i 19: "Zadania tekstowe". W planie nie ma tematu "zadania tekstowe".
- Egzamin 2026, zadanie 16: "Obliczenia praktyczne" (prędkość, droga, czas). Brak tematu.
- Egzamin 2026, zadanie 5: "Elementy algebry" z klas IV-VI. Plan ma tylko wyrażenia algebraiczne z klas VII-VIII.
- Egzamin 2026, zadania 10 i 13: "Wielokąty". Plan ma pola figur, ale nie ma tematu "wielokąty".
- Egzamin 2026, zadanie 12: "Oś liczbowa. Układ współrzędnych". Plan ma tylko układ współrzędnych, bez osi liczbowej.

## 3. Ścieżka naukowa ucznia

To jest największa luka, większa niż pojedyncze tematy.

### Wybór poziomu

W `lib/learning-path.ts` są jeszcze definicje klas 1-8, liceum 1-4, technikum 1-5 i szkoły branżowej 1-5. Ale `SCHOOL_CLASS_GROUPS`, `ALL_SCHOOL_CLASS_OPTIONS` i `SchoolClassPath` nie są już używane w UI. `SchoolClassPicker` pokazuje tylko dwie opcje: "Szkoła podstawowa" i "Szkoła średnia".

### Plan jest taki sam dla całego etapu

`examKeyForLearningPath` w `lib/trening/next-topic.ts` mapuje:

- "sp" na "8_klasa",
- "srednia" na "matura_podstawowa".

Skutek:

- uczeń klasy 4, 5, 6 lub 7 widzi cały plan E8, w tym potęgi, pierwiastki, twierdzenie Pitagorasa i podobieństwo, które w szkole pojawiają się w klasach 7-8,
- uczeń liceum 1 widzi cały plan matury podstawowej, w tym ciągi, trygonometrię, stereometrię i prawdopodobieństwo, które w szkole pojawiają się w klasach 2-3,
- nie ma planu "klasa 4", "klasa 5", "klasa 6", "klasa 7", "liceum 1", "liceum 2".

To może być świadoma decyzja produktowa: plan jest planem egzaminacyjnym, nie planem klasowym. Ale wtedy nazwa "Plan nauki" i wybór "ścieżki" sugerują coś więcej, niż aplikacja faktycznie daje.

### Brak matury rozszerzonej

W `lib/trening/slugs.ts` typ `matura_rozszerzona` ma przypisany `null` jako slug, a `TRAINING_CURRICULUM` ma tylko dwa egzaminy: `matura_podstawowa` i `8_klasa`.

Arkusze rozszerzone są w bazie (`lib/baza-zadan/cke/matura-rozszerzona-sessions.ts`), ale nie ma dla nich planu działów i tematów. Uczeń zdający rozszerzenie nie może trenować działami. Brakuje m.in.:

- granic ciągów i funkcji,
- pochodnej i jej zastosowań,
- optymalizacji z pochodną,
- wielomianów stopnia wyższego i twierdzenia o reszcie,
- funkcji wymiernej,
- trygonometrii rozszerzonej (wzory redukcyjne, sumy i różnice, równania trygonometryczne),
- geometrii analitycznej z wektorami,
- stereometrii przekrojów,
- prawdopodobieństwa warunkowego, wzoru Bayesa i schematu Bernoulliego,
- kombinatoryki z symbolem Newtona.

### Sprawdziany i minigry

- Sprawdziany mają rozdziały tylko dla klas 6, 7, 8 i liceum 1-3 (`lib/sprawdziany/sheet.ts`, `classLabel`). Nie ma klas 4-5, klas 1-3, liceum 4 ani technikum i szkoły branżowej.
- Minigry i baza zadań mają w danych `forPaths` wpisane klasy (np. klasa-4, klasa-8), ale `matchesLearningPath` dla ścieżki "sp" traktuje każdą wartość "klasa-*" jako pasującą. Skutek: filtry klasowe nie działają, a uczeń klasy 4 widzi gry i zadania opisane dla klas 6-8.
- Nie ma treści przypisanych do klas 1-3: żaden wpis `forPaths` nie zawiera klasa-1, klasa-2 ani klasa-3. Gry z `forPaths: ["sp"]` są dostępne dla wszystkich klas szkoły podstawowej.

## 4. Osobna taksonomia bazy zadań

`lib/baza-zadan/dzialy.ts` ma 16 kategorii: Arytmetyka, Ułamki, Procenty, Potęgi, Pierwiastki, Logarytmy, Ciągi, Funkcje, Równania, Geometria, Trygonometria, Kombinatoryka, Prawdopodobieństwo, Statystyka, Algebra, Inne.

To inna taksonomia niż CKE. Brakuje w niej m.in. osobnej geometrii analitycznej, stereometrii, planimetrii, wyrażeń algebraicznych i wielomianów. Jeśli wrażenie braków wzięło się z filtrów w "Baza zadań", to jest drugie, niezależne źródło tego samego problemu.

## 5. Rekomendacje

### Priorytet 1: uzupełnić maturę podstawową

Dodać do drzewa co najmniej:

- optymalizacja i zadania optymalizacyjne,
- wielomiany i rozkład na czynniki,
- wyrażenia wymierne,
- równania wielomianowe, dwukwadratowe i wymierne,
- funkcja logarytmiczna,
- funkcja f(x) = a/x i proporcjonalność odwrotna,
- twierdzenie sinusów i cosinusów,
- twierdzenie Talesa, dwusieczna, okrąg wpisany i opisany, punkty szczególne trójkąta,
- skala centylowa, średnia ważona, wartość oczekiwana.

### Priorytet 2: uzupełnić egzamin ósmoklasisty

Dodać:

- notacja wykładnicza,
- symetralna odcinka i dwusieczna kąta,
- obliczenia praktyczne (czas, droga, prędkość, jednostki, pieniądze, skala),
- zadania tekstowe,
- liczby naturalne w układzie pozycyjnym (system rzymski),
- proste i odcinki,
- rozważyć osobne tematy "wielokąty" i "oś liczbowa".

### Priorytet 3: uporządkować strukturę

Albo rozbić "Algebra i równania" oraz "Geometrię" na sekcje zgodne z CKE, albo wyraźnie oznaczyć, że to grupy tematyczne, a nie sekcje egzaminacyjne. Inaczej uczeń porównujący plan z informatorom zawsze zobaczy mniej działów.

### Priorytet 4: zdecydować, czym jest "Plan nauki"

- Jeśli ma być planem egzaminacyjnym: zmienić nazwę i opis, żeby nie sugerował planu klasowego.
- Jeśli ma być planem ucznia: dodać plany dla klas 4-8 i liceum 1-4, z kolejnością zgodną z podstawą programową.

### Priorytet 5: matura rozszerzona

Dodać trzecią ścieżkę z działami i tematami rozszerzonymi. Same arkusze to za mało, bo uczeń nie ma postępu ani kolejności nauki.

### Uwaga wdrożeniowa

Dodanie działu lub tematu do drzewa bez zadań i teorii pokaże status "Wkrótce". Trzeba też uzupełnić:

- `data/tasks-cache` i `data/theory-cache`,
- `lib/trening/seed/theory-index.ts`,
- ewentualnie generator zadań i materiały w `lib/trening/seed`.

## 6. Źródła

- `lib/trening/cke-matura-podstawowa.ts` - drzewo matury.
- `lib/trening/cke-egzamin-8.ts` - drzewo E8.
- `lib/trening/curriculum.ts` - mapowanie drzew na plan.
- `lib/learning-path.ts` - poziomy nauki.
- `lib/trening/next-topic.ts` - mapowanie ścieżki na egzamin.
- `lib/trening/slugs.ts` - brak slugu dla matury rozszerzonej.
- `lib/sprawdziany/sheet.ts` - klasy dostępne w sprawdzianach.
- `lib/minigry/minigame-registry.ts` - `forPaths` minigier.
- `lib/baza-zadan/dzialy.ts` - taksonomia bazy zadań.
- Informator CKE o egzaminie ósmoklasisty z matematyki od 2024/2025 (sekcje wymagań i przykładowe zadania).
- Arkusze CKE 2025 i 2026 w `data/cke-e8-cache` i `data/cke-matura-cache`.
- Wymagania maturalne 2025/2026 z zakresu podstawowego (sekcje I-XIII).
- Komunikat o powrocie E8 do pełnej podstawy programowej od 2025 (notacja wykładnicza, symetralna, dwusieczna).


## 7. Weryfikacja wdrożenia

- `npm test`: 418 testów zaliczonych.
- Plan nauki ma jasny opis zakresu oraz linki do sprawdzianów klasowych i arkuszy CKE, w tym rozszerzonych.
- `npm run build`: build produkcyjny zakończony sukcesem, 1187 stron statycznych.
- Smoke test API na porcie 3001: nowe kategorie `optymalizacja` i `obliczenia_praktyczne` zwracają zadania, a lekcje nowych tematów są dostępne.
- `data/theory-cache` i `data/tasks-cache` mają po 76 plików, czyli po jednym na każdy temat z drzew matury i E8.
- Generator zadań ma deterministyczne identyfikatory, więc ponowne uruchomienie nie zmienia postępu uczniów.


## 8. Nowy layout teorii

Layout teorii z live (szybkamatematyka.pl) został przeniesiony z PR #79, branch `fix/math-formatting`:

- `components/trening/TopicSummaryCard.tsx` - karta podsumowania tematu z wariantami `steps`, `cheatsheet`, `table`, `figure`, `plot`.
- `lib/trening/summaries.ts` - dane podsumowań dla wszystkich 76 tematów, w tym 17 nowych.
- `components/trening/TheorySectionView.tsx` - akordeon "Pełna lekcja" z przyciskiem "Rozwiń wszystko".
- `components/trening/TopicPageClient.tsx` - nowy nagłówek z zakładkami Teoria/Zadania i ukrytym spisem treści.

Efekt: lekcja pokazuje najpierw kartę podsumowania dopasowaną do tematu, a dopiero potem rozwijane sekcje pełnej lekcji. Sekcja `## Diagram` jest ukrywana, bo jej rolę przejmuje karta podsumowania.

Test `tests/topic-summaries.test.ts` pilnuje, że każdy temat z drzewa CKE ma podsumowanie. Zrzuty nowego layoutu są w `docs/preview/nowy-layout-optymalizacja.png`, `nowy-layout-czas.png`, `nowy-layout-wielokaty.png` i `nowy-layout-statystyka.png`.
