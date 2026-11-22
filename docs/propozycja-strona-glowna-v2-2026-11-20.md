# Propozycja strony głównej - wersja 2

**Data:** 20.11.2026  
**Status:** po Twoich uwagach - do decyzji, bez zmian w kodzie  
**Nawiązuje do:** `docs/propozycja-strona-glowna-2026-11-20.md` (inwentarz i analiza)

---

## 1. Co zmieniam po Twoich uwagach

| Twoja uwaga | Co robię w propozycji |
|---|---|
| „na pewno trzeba pokazać, że mamy ranking” | Ranking dostaje **osobną sekcję**, nie tylko kartę w siatce: podium top 3, zakładki, własna pozycja, CTA. |
| „na samym dole cennik” | Cennik przenoszę **na sam koniec**, po FAQ, tuż przed stopką. |
| „napisać o asyście AI” | Osobna sekcja z przykładem podpowiedzi i uczciwym opisem limitów. |
| „i sprawdzianach” | Osobna sekcja: generator dla nauczyciela + sprawdzian online dla ucznia. |
| „plan tygodnia też git” | Osobna sekcja „Twój tydzień” - ale to **nowa funkcja**, więc opisuję MVP i pytam, czy budujemy. |
| „powtórki” | Osobna sekcja z osią czasu spaced repetition i licznikiem „na dziś”. |

---

## 2. Nowa kolejność strony głównej

1. **Hero** + szybka próba (bez zmian).
2. **„Jak to działa”** - 3 kroki: diagnoza → codzienna praca → egzamin.
3. **„Wszystko w jednym miejscu”** - 16 kart w 4 grupach. To mapa serwisu; karty
   ranking/AI/sprawdziany/powtórki/plan prowadzą do sekcji niżej.
4. **„Twój tydzień”** - plan tygodnia + powtórki + seria.
5. **„Ranking”** - podium, zakładki, Twoja pozycja.
6. **„Asystent AI”** - podpowiedź, ocena, pytania do treści.
7. **„Sprawdziany”** - nauczyciel i uczeń.
8. **„Dla nauczyciela”** - pakiet szkolny, panel, faktura.
9. **„Darmowa rozgrzewka”** - wzory i zagadka dnia.
10. **FAQ** - 6 pytań.
11. **Cennik** - ostatnia sekcja przed stopką.
12. **Stopka** - pełna mapa serwisu.

Dlaczego tak: najpierw „co dostaję”, potem „jak to działa”, potem dowody
(ranking, AI, sprawdziany), na końcu cena. Cennik na dole nie blokuje wejścia
w trening.

---

## 3. Ranking - jak pokazać go mocniej

**Nagłówek:** Rywalizacja, która motywuje  
**Lead:** Top 20 w trzech kategoriach: łączne XP, minigry i pojedynki. Zobacz,
gdzie jesteś, i sprawdź, ile brakuje Ci do podium.

**Co pokazujemy:**

- podium top 3: avatar, nick, poziom, XP,
- listę miejsc 4–10,
- trzy zakładki: **Wszyscy / Minigry / Pojedynki**,
- pasek **„Twoja pozycja”** dla zalogowanego; dla gościa CTA „Zaloguj się,
  żeby zobaczyć swoją pozycję”,
- obok podium: 3 odznaki z 26 (np. „Tydzień ognia”, „Setka!”, „Pojedynkowicz”),
- CTA: `Zobacz pełny ranking` → `/rankingi`.

**Propozycja dodatkowa - ranking tygodniowy.** Dziś ranking jest all-time.
Nowy użytkownik nie ma szans wskoczyć do top 20, więc ranking może demotywować.
Dodanie zakładki **„Ten tydzień”** daje każdemu świeży start w poniedziałek.
To nowa funkcja (M), ale mocno zwiększa sens rywalizacji.

**Technicznie:** sekcja jako server component, `fetchTopLeaderboard(3, "all")`
z revalidate ok. 5 min; przy braku Supabase fallback z CTA. Nie ciągniemy
całego rankingu do klienta.

---

## 4. Asystent AI - jak o nim pisać

**Nagłówek:** Podpowiedź, nie gotowiec  
**Lead:** Gdy utkniesz, AI wskazuje następny krok. Gdy piszesz zadanie otwarte,
sprawdza tok rozumowania - nie tylko wynik.

**Trzy tryby (już są w kodzie):**

| Tryb | Co robi | Dla kogo |
|---|---|---|
| **Podpowiedź** | wskazuje kolejny krok, nie podaje wyniku | każdy |
| **Ocena** | sprawdza zadanie otwarte, daje punkty i uwagi | Pro |
| **Pytanie** | pozwala dopytać o treść, wzór lub sposób | każdy |

**Przykład do pokazania w sekcji (statyczny mock, bez wywołania AI):**

> **Ty:** Nie wiem, od czego zacząć to zadanie.  
> **AI:** Zacznij od wyznaczenia delty. Zapisz, ile wynoszą `a`, `b` i `c`,
> a potem podstaw je do wzoru. Nie licz jeszcze miejsc zerowych.  
> *[Pokaż kolejną podpowiedź]*

**Ważne w komunikacji:**

- nie piszemy „AI rozwiąże za Ciebie” - to psuje zaufanie nauczycieli i rodziców,
- piszemy „AI pomaga przejść przez krok, którego nie rozumiesz”,
- dodajemy uczciwą notkę: **„AI może się mylić. Klucz i rozwiązanie krok po
  kroku zostają źródłem prawdy.”**
- wyraźnie oznaczamy limit: ocena zadań otwartych i pełne rozwiązania są w Pro.

**CTA:** `Wypróbuj w treningu` → `/trening` · badge `Pro` przy ocenie.

**Technicznie:** na home tylko statyczny mock; żadnego wywołania Gemini przy
wejsciu na stronę (koszt i opóźnienie). Prawdziwe AI dopiero w treningu.

---

## 5. Sprawdziany - jak je pokazać

**Nagłówek:** Klasówka w minutę - dla nauczyciela i dla siebie  
**Lead:** Wybierasz klasę i dział, generujesz grupy A i B, drukujesz z kluczem
i punktacją. Albo rozdajesz link i zbierasz wyniki online.

**Dwie kolumny:**

| Dla nauczyciela | Dla ucznia |
|---|---|
| wybór klasy i działu | sprawdzian online |
| grupy A/B z innymi liczbami | punktacja od razu |
| klucz i schemat punktowania | ocena zadań otwartych przez AI (Pro) |
| PDF do druku | wynik per zadanie i dział |

**Trzy kroki:**

1. Wybierz klasę i dział.
2. Ustaw grupę A/B i ewentualnie przelosuj liczby.
3. Drukuj z kluczem albo rozdaj link.

**CTA:** `Wypróbuj generator` → `/sprawdziany` · `Panel nauczyciela` →
`/dla-szkol/panel` · `Pakiet szkolny` → `/dla-szkol`.

**Ważne:** generator jest darmowy i nie wymaga konta; AI ocenia zadania otwarte
w Pro. Nie obiecujemy „sprawdzianów w 100% zgodnych z każdą szkołą” - działy są
orientacyjne.

---

## 6. Powtórki - jak je pokazać

**Nagłówek:** Wracają dokładnie wtedy, gdy zapominasz  
**Lead:** Spaced repetition w wariancie SM-2. Po błędzie zadanie wraca szybciej,
po poprawnej odpowiedzi - rzadziej. Zamiast czytać wszystko od nowa, robisz
tylko to, co naprawdę wymaga powtórki.

**Oś czasu do pokazania:**

```text
dziś  →  +1 dzień  →  +3 dni  →  +7 dni  →  +14 dni
 1.       2.           3.          4.          5.
```

**Elementy sekcji:**

- duży licznik **„12 zadań na dziś”** (dla gościa: „tak to działa”),
- mały podgląd talii: dział, temat, następna powtórka,
- seria dni i rekord,
- CTA: `Otwórz powtórki` → `/powtorki`.

**Powiązanie z przyszłym zeszytem błędów:** po błędnym zadaniu dodajemy je do
powtórek automatycznie. Dziś użytkownik musi dodać zadanie ręcznie - to luka,
która psuje całą pętlę „błąd → powtórka → poprawa”.

**Technicznie:** dla zalogowanego można użyć `useReview` (due count); dla gościa
statyczny przykład. Nie importować katalogu zadań do klienta - tylko metadane
przez API, tak jak w obecnym `ReviewDashboard`.

---

## 7. Plan tygodnia - nowa funkcja (MVP)

To jedyna rzecz z Twojej listy, której **nie ma jeszcze w kodzie**. Dlatego
traktuję ją osobno: albo budujemy MVP przed wdrożeniem home page, albo na home
dajemy badge „Wkrótce” i zbieramy zapisy.

**Nagłówek:** Wiesz, co robić w każdym dniu  
**Lead:** Plan układa się z daty egzaminu, Twojej klasy, zaległych powtórek
i słabych działów z diagnozy. Każdy dzień to 2–3 zadania, nie cały arkusz.

**Mock sekcji:**

```text
Pon  ✓ 3 zadania z procentów        Wt  • 2 powtórki + 1 zadanie
Śr   • 2 zadania z geometrii        Czw • powtórki + minigra
Pt   • próbny fragment arkusza      Sob • 1 dział z diagnozy
Ndz   - dzień przerwy               Do matury: 168 dni
```

**Zakres MVP:**

- 7 dni, 2–3 zadania dziennie, 15–25 min,
- źródła: zaległe powtórki, ostatni temat, słaby dział z diagnozy, wyzwanie dnia,
- „Dziś” jako pierwsza karta, checkboxy, seria,
- na start localStorage + istniejące dane; bez nowej migracji,
- później e-mail z planem dnia.

**Rozmiar:** 1–2 tygodnie na sensowne MVP. Bez backendu da się zrobić szybciej,
ale wtedy plan nie przejdzie między urządzeniami.

**CTA:** `Zobacz swój plan` → `/plan-tygodnia` (nowa trasa) albo `Wkrótce -
powiadom mnie` z zapisem e-maila.

---

## 8. Cennik - na samym dole

**Miejsce:** po FAQ, przed stopką. Żadnego cennika w środku strony.

**Nagłówek:** Zacznij za darmo. Pro, kiedy chcesz więcej.  
**Lead:** Start zostaje darmowy na zawsze. Pro odblokowuje pełne rozwiązania,
AI i wszystkie arkusze.

| Plan | Cena | Co daje |
|---|---|---|
| Start | 0 zł | minigry, podgląd bazy i arkuszy, wyzwania, powtórki |
| Pro | 29 zł/mies. | pełne rozwiązania, AI, arkusze z kluczem, sprawdziany z oceną AI |
| Roczny | 249 zł/rok | wszystko z Pro, jedna płatność, oszczędność 99 zł |

**CTA:** `Zobacz pełny cennik` → `/cennik`  
**Pod spodem:** `Zaproś 2 znajomych - 30 dni Pro` → `/polecenia`

**Technicznie:** na home statyczne karty z `SUBSCRIPTION_PLANS` (server data),
bez ładowania klienta Stripe. Checkout dopiero na `/cennik`.

---

## 9. Co jeszcze proponuję - 6 rzeczy

### 9.1. „Twoje dziś” - osobisty pasek dla zalogowanych

Największa wartość, jaką można dodać do home page bez nowej funkcji. Dziś
zalogowany użytkownik widzi tylko „Ostatni temat”. Proponuję pasek:

> **Cześć!** 12 powtórek na dziś · seria 7 dni · do matury 168 dni · ostatni
> temat: funkcja kwadratowa. **[Kontynuuj]**

Dane już są: `useReview`, profil, data egzaminu, ostatni temat. To zamienia home
page z ulotki w dashboard i od razu odpowiada „co mam dziś zrobić?”. Dla gościa
zostaje szybka próba.

**Rozmiar:** S–M. **Priorytet:** najwyższy z dodatków.

### 9.2. „Dla kogo” - 4 ścieżki na starcie

Krótki pasek lub 4 karty: **ósmoklasista / maturzysta / nauczyciel / rodzic**.
Każda z innym CTA i innym akcentem (np. nauczyciel → generator, rodzic →
raport i cennik). Dziś home mówi do wszystkich naraz, przez co nie mówi mocno
do nikogo.

**Rozmiar:** S. **Priorytet:** wysoki, jeśli chcemy segmentować ruch.

### 9.3. „Ile umiesz” - karta wyniku diagnozy do udostępnienia

Po diagnozie użytkownik dostaje wynik per dział. Proponuję prostą, ładną kartę
do skopiowania/pobrania: „Mój wynik: 6/8. Najsłabszy dział: geometria. Start:
szybkamatematyka.pl”. To viral loop i dowód społeczny bez wymyślania opinii.
Wymaga wygenerowania obrazka (OG/share) - M.

### 9.4. „Nowe arkusze” - świeżość i SEO

Mały pasek: „Ostatnio dodane: matura maj 2026, egzamin ósmoklasisty 2026…” z datą
i linkiem. Dane są w repo (`EXAM_ARCHIVE_SHEETS`), więc to tanie. Daje powód, żeby
wracać, i pokazuje, że serwis żyje.

**Rozmiar:** S. **Priorytet:** średni, ale bardzo tani.

### 9.5. „Dla rodziców” - osobny pas przy cenniku

Rodzic jest często płacącym, a dziś nie ma dla niego ani jednego zdania. Proponuję
krótki pas: „Widzisz, co dziecko robi: raport postępów, działy, historia. Bez
ukrytych opłat, z eksportem i usunięciem konta.” CTA: `Zobacz raport` /
`Cennik`. To nie wymaga nowej funkcji - wystarczy rozbudować obecny wydruk profilu.

### 9.6. Licznik do egzaminu + pasek zaufania

- **Licznik:** „Do matury 2027 zostało 168 dni” z CTA `Plan na dziś`. Komponent
  `ExamCountdown` już istnieje; trzeba go tylko wpiąć w home.
- **Pasek zaufania:** „Dane w Twoich rękach: eksport, usunięcie konta, RLS,
  brak ukrytych opłat.” Dla rodzica i nauczyciela to ważniejsze niż kolejna karta.

**Rozmiar:** S.

---

## 10. Czego nie robić

- **Nie wrzucać 30 sekcji.** 10–12 to maksimum, inaczej home page zamienia się
  w dokumentację.
- **Nie wymyślać opinii i liczb.** „Zaufało nam 50 000 uczniów” bez danych to
  strzał w stopę. Lepiej pokazać realne 1926 zadań, 46 arkuszy, 134 tematy.
- **Nie sprzedawać planu tygodnia jako gotowego**, jeśli go nie ma. Badge
  „Wkrótce” albo MVP przed premierą.
- **Nie dawać cennika w środku.** Ma być na dole, tak jak chcesz.
- **Nie dublować CTA.** Jedno główne „Zacznij trening”, reszta secondary.

---

## 11. Decyzje

1. **Plan tygodnia:** budujemy MVP (1–2 tyg.) czy na home dajemy „Wkrótce”?
2. **Ranking:** zostajemy przy all-time, czy dodajemy zakładkę „Ten tydzień”?
3. **„Twoje dziś”:** wchodzimy w personalizowany pasek dla zalogowanych?
4. **Dodatki:** które z 9.2–9.6 bierzemy - „Dla kogo”, share card, „Nowe
   arkusze”, „Dla rodziców”, licznik/pasek zaufania?
5. **`/funkcje`:** robimy pełny katalog, czy wystarczy rozbudowana stopka?

---

## 12. Jedno zdanie

Ranking, AI, sprawdziany, powtórki i plan tygodnia powinny być **osobnymi
sekcjami z konkretnym przykładem**, a cennik - ostatnim akcentem przed stopką.
Wtedy home page opisuje cały serwis, ale nadal prowadzi do jednego działania.
