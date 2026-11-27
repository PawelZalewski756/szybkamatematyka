# CKE - pełna lista tematów treningu (SP 4–8 i szkoła średnia)

> **Status: wiążący kontrakt treningu.** Ten dokument jest źródłem prawdy dla
> zawartości `/trening`. Jeśli temat jest w podstawie programowej CKE, musi być
> widoczny w treningu - także wtedy, gdy w danym roku nie było z niego zadania
> na egzaminie. Plan klasy (`/plan-klasy`) jest tylko podpowiedzią „co w tym
> roku”; **nie może ukrywać tematów**.
>
> Źródła (odczyt 18.11.2026):
> - [Podstawa programowa - matematyka, szkoła podstawowa IV–VIII (zpe.gov.pl)](https://zpe.gov.pl/podstawa-programowa/szkola-podstawowa/matematyka)
> - [Podstawa programowa - matematyka, liceum ogólnokształcące i technikum (zpe.gov.pl)](https://zpe.gov.pl/podstawa-programowa/szkola-ponadpodstawowa/matematyka)
> - [Informatory CKE o egzaminie ósmoklasisty i maturze](https://cke.gov.pl/egzamin-osmoklasisty/informatory/) oraz [komunikaty o wymaganiach egzaminacyjnych](https://cke.gov.pl/egzamin-maturalny/egzamin-w-nowej-formule/komunikaty/)
>
> Mapowanie na slugi aplikacji: `lib/trening/cke-egzamin-8.ts` i
> `lib/trening/cke-matura-podstawowa.ts`.

## 1. Szkoła podstawowa - klasy IV–VI (14 działów)

| Nr | Dział podstawy programowej | Tematy w aplikacji (slugi) |
| --- | --- | --- |
| I | Liczby naturalne w dziesiątkowym układzie pozycyjnym | `liczby_naturalne`, `zaokraglanie_i_szacowanie` |
| II | Działania na liczbach naturalnych | `dzialania_pisemne`, `podzielnosc`, `nwd_i_nww`, `kolejnosc_dzialan` |
| III | Liczby całkowite | `liczby_calkowite` |
| IV | Ułamki zwykłe i dziesiętne | `ulamki`, `ulamki_dziesietne` |
| V | Działania na ułamkach zwykłych i dziesiętnych | `ulamki`, `ulamki_dziesietne` |
| VI | Elementy algebry | `wyrazenia_algebraiczne`, `rownania` |
| VII | Proste i odcinki | `proste_i_odcinki` |
| VIII | Kąty | `katy` |
| IX | Wielokąty, koła i okręgi | `trojkaty`, `czworokaty`, `wielokaty`, `okrag_i_kolo` |
| X | Bryły | `bryly`, `siatki_bryl` |
| XI | Obliczenia w geometrii | `obwody`, `pola_figur`, `objetosc_i_pole` |
| XII | Obliczenia praktyczne | `jednostki_i_pieniadze`, `czas_droga_predkosc`, `skala`, `zegar_i_kalendarz`, `temperatura` |
| XIII | Elementy statystyki opisowej | `diagramy`, `tabele_i_wykresy`, `srednia` |
| XIV | Zadania tekstowe | `zadania_tekstowe` |

## 2. Szkoła podstawowa - klasy VII–VIII (15 działów)

| Nr | Dział podstawy programowej | Tematy w aplikacji (slugi) |
| --- | --- | --- |
| I | Potęgi o podstawach wymiernych | `potegi`, `notacja_wykladnicza` |
| II | Pierwiastki | `pierwiastki` |
| III | Tworzenie wyrażeń algebraicznych | `wyrazenia_algebraiczne` |
| IV | Przekształcanie wyrażeń algebraicznych | `przeksztalcanie_wyrazen`, `wzory_skroconego_mnozenia` |
| V | Obliczenia procentowe | `procenty` |
| VI | Równania z jedną niewiadomą | `rownania`, `nierownosci`, `wyznaczanie_wielkosci_ze_wzoru` |
| VII | Proporcjonalność prosta | `proporcjonalnosc`, `proporcje` |
| VIII | Własności figur geometrycznych na płaszczyźnie | `katy`, `trojkaty`, `pitagoras`, `twierdzenie_talesa` |
| IX | Wielokąty | `czworokaty`, `wielokaty`, `wielokaty_foremne`, `pola_figur` |
| X | Oś liczbowa. Układ współrzędnych | `os_liczbowa`, `punkty_na_plaszczyznie`, `dlugosc_odcinka`, `srodek_odcinka` |
| XI | Geometria przestrzenna | `bryly`, `siatki_bryl`, `objetosc_i_pole` |
| XII | Wprowadzenie do kombinatoryki i rachunku prawdopodobieństwa | `kombinatoryka`, `regula_mnozenia`, `prawdopodobienstwo` |
| XIII | Odczytywanie danych i elementy statystyki opisowej | `diagramy`, `tabele_i_wykresy`, `srednia`, `mediana_i_dominanta` |
| XIV | Długość okręgu i pole koła | `okrag_i_kolo` |
| XV | Symetrie | `symetralna_i_dwusieczna`, `symetrie` |

## 3. Szkoła średnia - matura podstawowa (13 sekcji CKE)

| Nr | Sekcja wymagań CKE | Tematy w aplikacji (slugi) |
| --- | --- | --- |
| I | Liczby rzeczywiste | `potegi`, `pierwiastki`, `logarytmy`, `procenty`, `notacja_wykladnicza`, `zbiory_i_przedzialy`, `wartosc_bezwzgledna`, `kolejnosc_dzialan`, `dowody_podzielnosci` |
| II | Wyrażenia algebraiczne | `wyrazenia_algebraiczne`, `wzory_skroconego_mnozenia`, `przeksztalcanie_wyrazen`, `wielomiany`, `dzielenie_wielomianow`, `wyrazenia_wymierne` |
| III | Równania i nierówności | `rownania_liniowe`, `rownania_kwadratowe`, `rownania_wielomianowe`, `rownania_wymierne`, `nierownosci`, `nierownosci_kwadratowe`, `rownania_z_wartoscia_bezwzgledna`, `wzory_viete` |
| IV | Układy równań | `uklady_rownan`, `uklady_liniowo_kwadratowe`, `zadania_tekstowe_uklady` |
| V | Funkcje | `funkcja_liniowa`, `funkcja_kwadratowa`, `funkcja_wykladnicza`, `funkcja_logarytmiczna`, `proporcjonalnosc_odwrotna`, `wlasnosci_funkcji`, `odczyt_wykresu`, `przeksztalcenia_wykresow` |
| VI | Ciągi | `ciag_arytmetyczny`, `ciag_geometryczny`, `wyrazy_ciagu`, `granica_ciagu`, `szereg_geometryczny` |
| VII | Trygonometria | `sin_cos_tg`, `twierdzenie_sinusow_cosinusow`, `zastosowania_trygonometrii`, `tozsamosci_trygonometryczne`, `miara_lukowa`, `wzory_redukcyjne` |
| VIII | Planimetria | `planimetria`, `tales_dwusieczna_okrag`, `pitagoras_i_podobienstwo`, `okrag_i_kolo`, `wielokaty_foremne`, `punkty_szczegolne_trojkata`, `wycinek_i_luk` |
| IX | Geometria analityczna na płaszczyźnie kartezjańskiej | `geometria_analityczna`, `rownanie_okregu`, `odleglosc_punktu_od_prostej`, `wektory` |
| X | Stereometria | `stereometria`, `katy_w_brylach`, `przekroje_bryl`, `bryly_podobne`, `walce_stozki_kule` |
| XI | Kombinatoryka | `kombinatoryka`, `regula_mnozenia`, `permutacje`, `kombinacje` |
| XII | Rachunek prawdopodobieństwa i statystyka | `prawdopodobienstwo`, `prawdopodobienstwo_warunkowe`, `schemat_bernoulliego`, `statystyka`, `statystyka_zaawansowana`, `srednia_wazona`, `odchylenie_standardowe` |
| XIII | Optymalizacja i rachunek różniczkowy | `zadania_optymalizacyjne`, `granice_funkcji`, `pochodna`, `monotonicznosc_i_ekstrema` |

### 3.1. Zakres rozszerzony (osobny poziom, nie chowamy go w podstawie)

Wymagania rozszerzone są nadzbiorem podstawy. Aplikacja ma osobne strony
`/matura-rozszerzona` i arkusze rozszerzone, ale trening podstawowy nie może
udawać, że ich nie ma. Docelowo należy dodać trzeci przełącznik
`matura_rozszerzona`; do tego czasu tematy rozszerzone, które pokrywają się z
podstawą, są widoczne w drzewie podstawowym, a tematy wyłącznie rozszerzone
(np. wzory Viète'a z parametrem, granice funkcji, pochodna, schemat
Bernoulliego) są oznaczone w nazwach jako „(rozszerzenie)” lub mają osobny
wpis w `/matura-rozszerzona`.

## 4. Zasady, które muszą być egzekwowane w kodzie i testach

1. **Trening pokazuje pełne drzewo egzaminu.** `app/trening/page.tsx` nie
   filtruje działów/tematów po `classPlan`. Plan klasy może jedynie podświetlać
   lub opisywać „co w tym roku”.
2. **Każdy temat z tego dokumentu ma wpis w drzewie CKE** (`CKE_EGZAMIN_8` albo
   `CKE_MATURA_PODSTAWOWA`) i jest widoczny na `/trening`.
3. **Każdy temat ma co najmniej 10 zadań** w `data/tasks-cache` i lekcję teorii
   w `SEED_MATERIALS` (test `tests/training-catalog.test.ts`).
4. **Żadne zadanie nie może być przypisane do złego działu.** Nazwa działu i
   tematu w pliku cache musi istnieć w drzewie CKE; nowe zadania przechodzą
   audyt `npm run audit:tasks-cache`.
5. **Formatowanie:** wzory w linii nie mogą mieć własnego paska przewijania
   (`overflow-x-auto` na `inline-block`), bo to rozjeżdża linię bazową i tworzy
   „suwaki” przy ułamkach. Wzory blokowe mogą się przewijać.
6. **Rozwiązania:** `explanation` musi pokazywać obliczenia, a nie frazę
   „Podstaw dane z treści...”. Audyt odrzuca takie rozwiązania.
7. **Każda zmiana drzewa CKE wymaga aktualizacji tego dokumentu** oraz
   `docs/STATUS.md` (liczby działów/tematów/zadań).

## 5. Checklist przy dodawaniu tematu

- [ ] Wpis w `CKE_*` z unikalnym slugiem (bez polskich znaków i spacji).
- [ ] Wpis w `CLASS_TOPICS` (jeśli temat należy do konkretnej klasy).
- [ ] 20 zadań w `data/tasks-cache/<exam>__<category>__<topic>.json`.
- [ ] Lekcja w `SEED_MATERIALS` (full/comprehensive).
- [ ] `npm run audit:tasks-cache`, `npm run audit:questions`, `npm run audit:render`.
- [ ] `npm test` (w tym `tests/training-catalog.test.ts`).
- [ ] Zrzut ekranu `/trening` przed/po i sprawdzenie, że temat jest widoczny
      bez zmiany klasy.
