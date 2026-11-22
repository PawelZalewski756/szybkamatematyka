# RANO 18.11.2026 - poprawki po zgłoszeniach uczniów

> Kolejna sesja tego wieczoru. Wcześniejszy raport: `docs/RANO-2026-11-18.md`.
> Ta porcja jest krótka: co naprawione, co sprawdzone, od czego zacząć.

---

## 1. Zacznij od tego (3 rzeczy)

1. **Push brancha** `chore/plan-2026-11-18` (18 commitów nad `origin/master`).
2. **Sprawdź „rozjeżdżanie” na telefonie** - naprawiłem dwa konkretne przypadki
   (łamanie równań po „=” i baner cookies zasłaniający treść), ale jeśli nadal
   coś wygląda krzywo, **zrób zrzut ekranu** i wrzuć go do zgłoszenia.
   Bez tego nie odróżnię „rozjeżdża się” od „zła odpowiedź”.
3. **Dane operatora + domena Resend** - nadal blokują sprzedaż, a to Twoje
   konta (kod jest gotowy).

---

## 2. Co było naprawdę zepsute - i naprawione

### 2.1 Minigry: złe odpowiedzi (najważniejsze)

Audyt 34 minigier (po 300 pytań na każdą, dwie ścieżki) wykrył **5 generatorów
z błędną matematyką**. Dokładnie ten przypadek, który zgłosiłeś:

| Minigra | Było | Jest |
|---|---|---|
| **Procenty** | `10% z 42` → odpowiedź **4** (zaokrąglenie), brak 4,2 | **4,2** i inne warianty dziesiętne |
| **Procent z liczby (odwrotny)** | `62 z 104` → **60%** (zaokrąglenie), a naprawdę 59,6% | procent dobrany tak, by wynik był dokładny |
| **Średnia** | `5,75` → **5,8** jako „poprawna” | **5,75** |
| **Pole koła** | `50,24` → **50,2** | **50,24** |
| **Nawiasy** | poprawna odpowiedź **w ogóle nie było w opcjach** (nadpisywała ją pułapka) | zawsze jest dokładnie jedna |

Dodatkowo: w „Prawda/Fałsz” równania z procentami wypisywały surowe
`3.3000000000000003`, a w trójkącie fałszywe zdanie mogło sumować się do 180°
(czyli było prawdziwe). Wszystko naprawione.

**Testy:** 43 nowe testy jednostkowe - niezmienniki dla wszystkich 34 minigier
plus sprawdzanie odpowiedzi „na piechotę” (procenty, średnia, pole koła,
nawiasy, banki prawda/fałsz, trójkąt).

### 2.2 „Zadania się rozjeżdżają” - dwa konkretne przypadki

- **Równania łamane po „=”**: każde dłuższe równanie w „Prawda/Fałsz” i
  „Wzory” było dzielone na dwie osobno wyśrodkowane linie
  (`a^m · a^n` i `= a^{m·n}`), co wyglądało jak dwa różne działania.
  Teraz jedno równanie, skalowane do szerokości; na wąskim ekranie przewija się
  w poziomie w karcie. Test E2E: brak bloku zaczynającego się od „=”.
- **Baner cookies zasłaniał treść** (przyciski planu, opcje zadania, dół
  katalogu) - na telefonie wyglądało to jak zepsuta nawigacja. Teraz baner
  rezerwuje miejsce w `main` (`--consent-banner-space`) i po akceptacji zeruje
  je. Test E2E na 390 px.

### 2.3 „Nie potrafią się poruszać po bazie zadań”

- **Filtry przeżywają wejście w zadanie**: dział, fraza i trudność zapisują się
  w `sessionStorage`; po powrocie wracają.
- **Powrót przywraca pozycję listy** - wcześniej lądowało się na górze katalogu.
- **Zakładki** (Ćwicz / Arkusze / Symulacje) są osobnym krokiem w historii
  (`router.push`), więc „wstecz” wraca do poprzedniej zakładki, a nie poza bazę.
  Na telefonie zawijają się zamiast chować trzeciej.
- **Karty zadań** pokazują źródło (`matura maj 2016 · zad. 22`) i informację
  „krok po kroku”. Pod zakładkami jest opis aktualnego trybu pracy (wcześniej
  zdefiniowany, ale nigdzie nie wyświetlany).

### 2.4 Sprawdzone i czyste

- Klucze odpowiedzi w 2261 zadaniach katalogu: **0** przypadków, gdzie
  `correctIndex` nie zgadza się z literą/liczbą w wyjaśnieniu, **0** duplikatów
  opcji, **0** indeksów poza zakresem.
- 20 stron (tematy, zadania, arkusze CKE, druk) na 390 px: **brak** poziomego
  przewijania i elementów poza ekranem.

---

## 3. Czego NIE udało się odtworzyć

- **„Rozjeżdżanie” inne niż powyższe** - mierzyłem overflow na 21 stronach
  i 10 minigrach; nie znalazłem. Jeśli chodzi o wygląd (np. nachodzące teksty),
  potrzebuję zrzutu ekranu albo nazwy minigry i telefonu.
- **Błędy w zadaniach treningowych** poza minigrami: audyt nie znalazł
  sprzeczności w kluczach, ale jakość rozwiązań (boilerplate, artefakty LLM)
  to osobny temat z `docs/do-recenzji.md` - bez recenzenta się nie ruszy.

---

## 4. Bramki (stan po ostatnim commicie)

| Bramka | Wynik |
|---|---|
| `npm run lint` | 0 |
| `tsc --noEmit` | 0 |
| Testy jednostkowe | **618/618** (81 plików; +43 nowe) |
| E2E Playwright | **82/82** (w tym nowe testy minigier, powrotu i cookies) |
| `npm run build` | 1203 strony, exit 0 |
| `status:check` | aktualny |

Commity z tej nocy (7): `304cbf3`, `caaaa30`, `8253e8b`, `2c595dc`, `6fbc588`,
`d8cfa66`, `d5176c7`.

---

## 5. Co dalej (moja kolejność)

1. **Recenzja treści** (`docs/do-recenzji.md`) - 7 rozwiązań do poprawy.
2. **Zdarzenia lejka** (P0-13 z planu) - bez nich nie zmierzysz, czy poprawki
   minigier cokolwiek zmieniły w retencji.
3. **Dalsze oznaczanie bazy**: chipsy aktywnych filtrów, breadcrumb na stronie
   zadania, „pokazano 9 z 560” - drobne, ale wprost adresuje zgłoszenie.
4. **Admin gate na serwerze** (P0-6) - wymaga migracji auth na cookies;
   zaplanować jako 2–3 dni, nie „szybki fix”.

---

## 6. Komendy

```bash
git log --oneline origin/master..HEAD     # 18 commitów
npm test                                   # 618
npm run test:e2e                           # 82
npm run build
npm run status:check
npm run audit:cke                          # 7 ostrzeżeń (do recenzji)
```

Uwaga na przyszłość: **nie przepisywać plików z polskimi znakami przez
PowerShell `Get-Content`/`Set-Content`** - dwa razy uszkodziło to kodowanie
(mojibake). Zmiany robić edytorem UTF-8; plik testu minigier był już raz
naprawiany z tego powodu.
