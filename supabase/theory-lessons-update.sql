-- Wygenerowano: npm run seed:theory-sql
-- Uruchom w Supabase SQL Editor (Dashboard → SQL).
-- Aktualizuje title + content dla 25 tematów CKE.

UPDATE public.materials SET
  title = 'Potęgi i pierwiastki na maturze',
  content = '## Na egzaminie
Potęgi i pierwiastki pojawiają się na maturze praktycznie co roku, często w zadaniach otwartych lub jako element zadań z innych działów (np. procentów, funkcji). Zazwyczaj można zdobyć za nie 2–4 punkty. CKE sprawdza umiejętność stosowania podstawowych wzorów oraz upraszczania wyrażeń.

## Najważniejsze
*   **Definicja potęgi:** Dla $a \in \mathbb{R}$ i $n \in \mathbb{N}$, $a^n = \underbrace{a \cdot a \cdot \ldots \cdot a}_{n \text{ razy}}$.
*   **Potęga o wykładniku ujemnym:** Dla $a \neq 0$, $a^{-n} = \frac{1}{a^n}$.
*   **Potęga o wykładniku wymiernym:** Dla $a \ge 0$ i $n \in \mathbb{N}, n \neq 0$, $a^{\frac{1}{n}} = \sqrt[n]{a}$.
*   **Potęga o wykładniku wymiernym (ogólnie):** Dla $a \ge 0$ i $n, m \in \mathbb{N}, m \neq 0$, $a^{\frac{n}{m}} = (\sqrt[m]{a})^n = \sqrt[m]{a^n}$.
*   **Wzory na działania na potęgach:**
    *   Iloczyn potęg o tych samych podstawach: $a^n \cdot a^m = a^{n+m}$
    *   Iloraz potęg o tych samych podstawach: $\frac{a^n}{a^m} = a^{n-m}$ (dla $a \neq 0$)
    *   Potęgowanie potęgi: $(a^n)^m = a^{n \cdot m}$
    *   Potęgowanie iloczynu: $(a \cdot b)^n = a^n \cdot b^n$
    *   Potęgowanie ilorazu: $(\frac{a}{b})^n = \frac{a^n}{b^n}$ (dla $b \neq 0$)
*   **Definicja pierwiastka:** Dla $a \ge 0$ i $n \in \mathbb{N}, n \ge 2$, $\sqrt[n]{a}$ jest liczbą nieujemną, której $n$-ta potęga jest równa $a$.
*   **Wzory na działania na pierwiastkach:**
    *   $\sqrt[n]{a} \cdot \sqrt[n]{b} = \sqrt[n]{a \cdot b}$ (dla $a, b \ge 0$)
    *   $\frac{\sqrt[n]{a}}{\sqrt[n]{b}} = \sqrt[n]{\frac{a}{b}}$ (dla $a \ge 0, b > 0$)
    *   $\sqrt[m]{\sqrt[n]{a}} = \sqrt[m \cdot n]{a}$ (dla $a \ge 0$)
    *   $\sqrt[n]{a^m} = (\sqrt[n]{a})^m$
    *   $k \cdot \sqrt[n]{a} = \sqrt[n]{k^n \cdot a}$ (dla $k \ge 0$)

## Przykład krok po kroku
Uprość wyrażenie $\frac{12^3 \cdot 6^2}{18^4}$.

**Krok 1.** Zapisz wszystkie podstawy potęg jako iloczyn liczb pierwszych.
$12 = 2^2 \cdot 3$
$6 = 2 \cdot 3$
$18 = 2 \cdot 3^2$

**Krok 2.** Podstaw rozkład liczb pierwszych do wyrażenia.
$$ \frac{(2^2 \cdot 3)^3 \cdot (2 \cdot 3)^2}{(2 \cdot 3^2)^4} $$

**Krok 3.** Zastosuj wzory na potęgowanie iloczynu i potęgowanie potęgi.
$$ \frac{(2^2)^3 \cdot 3^3 \cdot 2^2 \cdot 3^2}{2^4 \cdot (3^2)^4} = \frac{2^{2 \cdot 3} \cdot 3^3 \cdot 2^2 \cdot 3^2}{2^4 \cdot 3^{2 \cdot 4}} = \frac{2^6 \cdot 3^3 \cdot 2^2 \cdot 3^2}{2^4 \cdot 3^8} $$

**Krok 4.** Zastosuj wzory na mnożenie i dzielenie potęg o tych samych podstawach w liczniku i mianowniku.
$$ \frac{2^{6+2} \cdot 3^{3+2}}{2^4 \cdot 3^8} = \frac{2^8 \cdot 3^5}{2^4 \cdot 3^8} = 2^{8-4} \cdot 3^{5-8} = 2^4 \cdot 3^{-3} $$

**Krok 5.** Zapisz wynik bez ujemnych wykładników.
$$ 2^4 \cdot 3^{-3} = 2^4 \cdot \frac{1}{3^3} = \frac{16}{27} $$

## Pułapki
*   Brak uwzględnienia dziedziny przy pierwiastkach – np. próba obliczenia $\sqrt{-4}$ lub upraszczanie $\frac{\sqrt{a}}{\sqrt{b}}$ bez założenia $b > 0$.
*   Błędy w stosowaniu wzorów na działania na potęgach, np. $a^n + a^m \neq a^{n+m}$ lub $(a^n)^m \neq a^{n+m}$.
*   Nieprawidłowe zamiany pierwiastków na potęgi, np. $\sqrt[3]{x^2} = x^{3/2}$ zamiast $x^{2/3}$.

## Szybka powtórka
1.  Ile wynosi $81^{\frac{3}{4}}$?
2.  Jak uprościć wyrażenie $(2\sqrt{3})^2$?
3.  Czy $\sqrt[3]{x^2} = \sqrt[2]{x^3}$?'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'liczby_rzeczywiste'
  AND topic = 'potegi';

UPDATE public.materials SET
  title = 'Logarytmy na maturze',
  content = '## Na egzaminie
Logarytmy pojawiają się na maturze z matematyki na poziomie podstawowym stosunkowo rzadko, zazwyczaj w zadaniach otwartych lub jako element większego problemu. Choć nie są tematem dominującym, poprawne ich zrozumienie jest kluczowe do rozwiązania niektórych zadań z działu liczby rzeczywiste. CKE sprawdza znajomość definicji, własności oraz umiejętność wykonywania prostych operacji na logarytmach.

## Najważniejsze
*   **Definicja logarytmu:** Logarytm przy podstawie $b$ z liczby $a$ jest to wykładnik $x$, do którego należy podnieść podstawę $b$, aby otrzymać liczbę $a$.
    $$ \log_b a = x \quad \iff \quad b^x = a $$
    gdzie $b > 0$, $b \ne 1$ (podstawa logarytmu) oraz $a > 0$ (liczba logarytmowana).
*   **Podstawowe własności:**
    *   $\log_b 1 = 0$ (bo $b^0 = 1$)
    *   $\log_b b = 1$ (bo $b^1 = b$)
    *   $\log_b (b^n) = n$
*   **Wzory na działania na logarytmach:**
    *   Suma logarytmów o tej samej podstawie to logarytm iloczynu:
        $$ \log_b x + \log_b y = \log_b (x \cdot y) \quad \text{dla } x > 0, y > 0 $$
    *   Różnica logarytmów o tej samej podstawie to logarytm ilorazu:
        $$ \log_b x - \log_b y = \log_b \left(\frac{x}{y}\right) \quad \text{dla } x > 0, y > 0 $$
    *   Logarytm potęgi:
        $$ \log_b (x^n) = n \cdot \log_b x \quad \text{dla } x > 0 $$
*   **Wzór na zmianę podstawy:** Pozwala zamienić logarytm z jednej podstawy na inną, np. na podstawę 10 (logarytm dziesiętny, $\log$) lub $e$ (logarytm naturalny, $\ln$).
    $$ \log_b a = \frac{\log_c a}{\log_c b} $$
    Szczególnie użyteczny jest wzór:
    $$ \log_b a = \frac{\log a}{\log b} $$

## Przykład krok po kroku
**Zadanie:** Oblicz wartość wyrażenia $\log_2 8 - \log_2 4$.

**Krok 1.** Zidentyfikuj operację i podstawę logarytmu. Widzimy odejmowanie logarytmów o tej samej podstawie (2).

**Krok 2.** Zastosuj wzór na różnicę logarytmów.
$$ \log_2 8 - \log_2 4 = \log_2 \left(\frac{8}{4}\right) $$

**Krok 3.** Wykonaj dzielenie w argumencie logarytmu.
$$ \log_2 \left(\frac{8}{4}\right) = \log_2 2 $$

**Krok 4.** Oblicz logarytm. Ponieważ podstawa jest równa argumentowi, wynik wynosi 1.
$$ \log_2 2 = 1 $$
*Alternatywnie można było obliczyć każdy logarytm osobno:* $\log_2 8 = 3$ (bo $2^3=8$) oraz $\log_2 4 = 2$ (bo $2^2=4$). Wtedy: $3 - 2 = 1$.

**Krok 5.** Zapisz ostateczną odpowiedź.
Wartość wyrażenia wynosi 1.

## Pułapki
*   Zapominanie o założeniach: podstawa logarytmu musi być większa od 0 i różna od 1, a liczba logarytmowana musi być większa od 0.
*   Mylenie wzorów: np. traktowanie $\log(x+y)$ jako $\log x + \log y$ (co jest błędne) lub $\log(x-y)$ jako $\log x - \log y$. Poprawne wzory dotyczą iloczynu i ilorazu.
*   Błędne stosowanie wzoru na potęgę: $\log_b (x^n) = n \cdot \log_b x$, a nie $(\log_b x)^n$.

## Szybka powtórka
1.  Jaka jest definicja $\log_3 9 = x$?
2.  Jak obliczyć $\log_5 125$?
3.  Do czego sprowadza się $\log_b x + \log_b y$?

## Diagram
Logarytm $\log_b a = x$ to wykładnik $x$, dla którego $b^x = a$.
Przykład: $\log_2 8 = 3$, bo $2^3 = 8$.
Podstawa $b$: musi być $b>0$ i $b \neq 1$.
Argument $a$: musi być $a>0$.'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'liczby_rzeczywiste'
  AND topic = 'logarytmy';

UPDATE public.materials SET
  title = 'Procenty i proporcje na maturze',
  content = '## Na egzaminie
Temat procentów i proporcji pojawia się na maturze podstawowej niemal co roku, zazwyczaj w zadaniach otwartych lub zamkniętych, przynosząc od 2 do 4 punktów. CKE często sprawdza umiejętność obliczania procentu liczby, procentu z procentu, a także zadania z kontekstem ekonomicznym (ceny, rabaty, podwyżki).

## Najważniejsze
*   **Procent:** Jedna setna części jakiejś wielkości. Oznaczany symbolem `%`.
    *   $1\% = \frac{1}{100} = 0.01$
*   **Obliczanie procentu liczby:** Aby obliczyć $p\%$ liczby $x$, należy pomnożyć liczbę przez $p\%$ zapisaną w postaci dziesiętnej lub ułamkowej.
    *   Obliczenie $p\%$ liczby $x$: $x \cdot \frac{p}{100}$ lub $x \cdot 0.0p$.
*   **Obliczanie, jakim procentem jednej liczby jest druga:** Aby obliczyć, jakim procentem liczby $x$ jest liczba $y$, należy obliczyć $\frac{y}{x}$ i wynik pomnożyć przez $100\%$.
    *   $(\frac{y}{x}) \cdot 100\%$
*   **Obliczanie liczby, gdy dany jest jej procent:** Jeśli $p\%$ pewnej liczby $x$ wynosi $y$, to możemy zapisać równanie: $\frac{p}{100} \cdot x = y$. Wtedy $x = y \cdot \frac{100}{p}$.
*   **Procent składany:** Stosowany przy podwyżkach lub obniżkach wielokrotnych. Jeśli cena $C$ wzrosła o $p\%$ w pierwszym okresie, a potem o $q\%$ w drugim, to nowa cena wynosi $C \cdot (1 + \frac{p}{100}) \cdot (1 + \frac{q}{100})$. Analogicznie dla obniżek (znak minus zamiast plusa).
*   **Proporcja:** Równość dwóch stosunków. Pozwala na rozwiązywanie zadań, gdzie szukamy nieznanej wielkości, znając zależności między innymi.
    *   Jeśli $a$ odpowiada $b$, to $c$ odpowiada $x$. Zapis: $\frac{a}{b} = \frac{c}{x}$ lub $a:b = c:x$. Rozwiązanie: $x = \frac{b \cdot c}{a}$.

## Przykład krok po kroku
Cena towaru wynosiła 200 zł. Cenę tę najpierw podwyższono o 10%, a następnie obniżono o 20%. Jaka jest ostateczna cena tego towaru?

**Krok 1.** Obliczamy podwyżkę o 10%.
Kwota podwyżki: $200 \text{ zł} \cdot \frac{10}{100} = 200 \text{ zł} \cdot 0.10 = 20 \text{ zł}$.
Nowa cena po podwyżce: $200 \text{ zł} + 20 \text{ zł} = 220 \text{ zł}$.

**Krok 2.** Obliczamy obniżkę o 20% od nowej ceny.
Kwota obniżki: $220 \text{ zł} \cdot \frac{20}{100} = 220 \text{ zł} \cdot 0.20 = 44 \text{ zł}$.

**Krok 3.** Obliczamy ostateczną cenę.
Ostateczna cena: $220 \text{ zł} - 44 \text{ zł} = 176 \text{ zł}$.

*Alternatywne rozwiązanie (procent składany):*
Cena po podwyżce o 10%: $200 \cdot (1 + \frac{10}{100}) = 200 \cdot 1.10 = 220 \text{ zł}$.
Cena po obniżce o 20% (od nowej ceny): $220 \cdot (1 - \frac{20}{100}) = 220 \cdot 0.80 = 176 \text{ zł}$.
Ostateczna cena wynosi 176 zł.

## Pułapki
*   Obliczanie kolejnych procentów od ceny początkowej, zamiast od ceny bieżącej (np. przy podwyżkach i obniżkach).
*   Błędne stosowanie proporcji: niewłaściwe przyporządkowanie wielkości w liczniku i mianowniku.
*   Pomylenie "o ile procent" z "ile procent". Obniżka "o 20%" oznacza nowe 80% wartości.

## Szybka powtórka
1.  Cena kurtki wynosiła 400 zł. Została obniżona o 15%. Jaka jest nowa cena kurtki?
2.  W klasie jest 30 uczniów. 60% to dziewczynki. Ilu chłopców jest w klasie?
3.  Cena roweru wzrosła z 1000 zł do 1200 zł. O ile procent wzrosła cena roweru?

## Diagram
```text
Procent (%) <-------> Ułamek dziesiętny (np. 25% = 0.25)
    |                      |
    |                      |
    v                      v
Obliczanie % liczby:       Proporcje:
liczba * %                 a   ->   b
                       c   ->   x
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'liczby_rzeczywiste'
  AND topic = 'procenty';

UPDATE public.materials SET
  title = 'Uproszczanie wyrażeń algebraicznych',
  content = '## Na egzaminie
Temat wyrażeń algebraicznych pojawia się na maturze bardzo często, zwykle w zadaniach otwartych dotyczących działań na wielomianach lub rozwiązywania równań. Zadania te mogą przynieść od 2 do nawet 6 punktów. CKE sprawdza umiejętność redukcji wyrazów podobnych, mnożenia nawiasów, stosowania wzorów skróconego mnożenia.

## Najważniejsze
*   **Wyrażenie algebraiczne:** Zapis składający się ze stałych, zmiennych (liter) i znaków działań. Np. $3x + 5y$, $a^2 - 2ab + b^2$.
*   **Wyraz algebraiczny:** Pojedynczy składnik wyrażenia, np. $3x$, $5y$, $-7$.
*   **Wyrazy podobne:** Wyrazy, które różnią się co najwyżej współczynnikami liczbowymi. Można je dodawać lub odejmować. Np. $2x$ i $-5x$, $3y^2$ i $y^2$.
*   **Redukcja wyrazów podobnych:** Upraszczanie wyrażenia poprzez dodanie lub odjęcie wyrazów podobnych.
    *   Przykład: $2x + 3y - 5x + y = (2x - 5x) + (3y + y) = -3x + 4y$.
*   **Wzory skróconego mnożenia:**
    *   Kwadrat sumy: $(a+b)^2 = a^2 + 2ab + b^2$
    *   Kwadrat różnicy: $(a-b)^2 = a^2 - 2ab + b^2$
    *   Różnica kwadratów: $a^2 - b^2 = (a-b)(a+b)$
*   **Mnożenie nawiasów:** Stosujemy prawo rozdzielności mnożenia względem dodawania.
    *   Przykład: $(x+2)(y-3) = x(y-3) + 2(y-3) = xy - 3x + 2y - 6$.
*   **Opuszczanie nawiasów:**
    *   Jeśli przed nawiasem jest znak `+` lub nic, opuszczamy nawias bez zmian: $a + (b+c) = a+b+c$.
    *   Jeśli przed nawiasem jest znak `-`, zmieniamy znaki wszystkim wyrazom w nawiasie: $a - (b+c) = a-b-c$.
    *   Jeśli nawias jest mnożony przez liczbę lub wyrażenie, mnożymy każdy wyraz w nawiasie przez ten czynnik: $2(x+y) = 2x+2y$.

## Przykład krok po kroku
Uprość wyrażenie: $3(x-2y)^2 - (x+y)(x-y)$.

**Krok 1.** Rozwiń pierwszy nawias, stosując wzór na kwadrat różnicy $(a-b)^2 = a^2 - 2ab + b^2$.
Tutaj $a=x$, $b=2y$.
$(x-2y)^2 = x^2 - 2 \cdot x \cdot (2y) + (2y)^2 = x^2 - 4xy + 4y^2$.

**Krok 2.** Pomnóż wynik przez 3.
$3(x^2 - 4xy + 4y^2) = 3x^2 - 12xy + 12y^2$.

**Krok 3.** Rozwiń drugi człon wyrażenia, stosując wzór na różnicę kwadratów $a^2 - b^2 = (a-b)(a+b)$.
$(x+y)(x-y) = x^2 - y^2$.

**Krok 4.** Opuszczamy nawiasy w całym wyrażeniu, pamiętając o znaku minus przed drugim członem.
Wyrażenie oryginalne: $3(x-2y)^2 - (x+y)(x-y)$
Po rozwinięciu: $(3x^2 - 12xy + 12y^2) - (x^2 - y^2)$.
Opuszczamy nawiasy: $3x^2 - 12xy + 12y^2 - x^2 + y^2$.

**Krok 5.** Zredukuj wyrazy podobne.
Zbieramy wyrazy z $x^2$: $3x^2 - x^2 = 2x^2$.
Zbieramy wyrazy z $xy$: $-12xy$.
Zbieramy wyrazy z $y^2$: $12y^2 + y^2 = 13y^2$.
Ostateczny wynik: $2x^2 - 12xy + 13y^2$.

## Pułapki
*   Błędy w znakach przy opuszczaniu nawiasów, zwłaszcza gdy przed nawiasem jest minus.
*   Niepoprawne zastosowanie wzorów skróconego mnożenia (np. $(a-b)^2 = a^2 - b^2$ zamiast $a^2 - 2ab + b^2$).
*   Błędy rachunkowe przy mnożeniu (np. $3 \cdot (2y)^2 = 6y^2$ zamiast $3 \cdot 4y^2 = 12y^2$).

## Szybka powtórka
1.  Uprość wyrażenie: $5a - (2a + 3b) + (b - a)$.
2.  Oblicz wartość wyrażenia $x^2 - y^2$, wiedząc, że $x-y=5$ i $x+y=3$.
3.  Rozwiń wyrażenie $(2x-1)^2$.

## Diagram
```text
Wyrażenie algebraiczne:
    ^
    |-- stałe (liczby)
    |-- zmienne (litery)
    +-- znaki działań (+, -, *, /)

Operacje:
    - Redukcja wyrazów podobnych (dodawanie/odejmowanie)
    - Mnożenie nawiasów
    - Wzory skróconego mnożenia (kwadrat sumy/różnicy, różnica kwadratów)
    - Opuszczanie nawiasów (zmiana znaków przy minusie przed nawiasem)
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'algebra'
  AND topic = 'wyrazenia_algebraiczne';

UPDATE public.materials SET
  title = 'Rozwiązywanie równań liniowych',
  content = '## Na egzaminie
Równania liniowe pojawiają się regularnie na maturze z matematyki na poziomie podstawowym, zazwyczaj w zadaniach otwartych lub jako część zadań złożonych. Zazwyczaj są to zadania jednopunktowe, ale pojawiają się też w zadaniach wymagających więcej pracy. CKE sprawdza umiejętność przekształcania równań i znajdowania ich rozwiązań.

## Najważniejsze
*   **Równanie liniowe** to równanie, które po uporządkowaniu można zapisać w postaci $ax + b = 0$, gdzie $x$ jest niewiadomą, a $a$ i $b$ są znanymi liczbami, przy czym $a \neq 0$.
*   **Rozwiązaniem równania liniowego** nazywamy liczbę, która po podstawieniu w miejsce niewiadomej sprawia, że równość jest prawdziwa.
*   **Przekształcanie równań:**
    *   Można dodać lub odjąć tę samą liczbę od obu stron równania.
    *   Można pomnożyć lub podzielić obie strony równania przez tę samą liczbę różną od zera.
*   **Typy rozwiązań:**
    *   **Jedno rozwiązanie:** Równanie ma postać $x = \text{liczba}$.
    *   **Nieskończenie wiele rozwiązań:** Po uporządkowaniu równania obie strony są identyczne, np. $0 = 0$.
    *   **Brak rozwiązań:** Po uporządkowaniu równania otrzymujemy sprzeczność, np. $5 = 0$.

## Przykład krok po kroku
Rozwiąż równanie: $3(x - 2) + 5 = 2x - 1$

**Krok 1.** Uprość obie strony równania, usuwając nawiasy.
$3 \cdot x - 3 \cdot 2 + 5 = 2x - 1$
$3x - 6 + 5 = 2x - 1$

**Krok 2.** Połącz podobne wyrazy po lewej stronie.
$3x - 1 = 2x - 1$

**Krok 3.** Przenieś wszystkie wyrazy z niewiadomą $x$ na jedną stronę, a stałe na drugą. Odejmij $2x$ od obu stron.
$3x - 2x - 1 = 2x - 2x - 1$
$x - 1 = -1$

**Krok 4.** Dodaj $1$ do obu stron, aby wyizolować $x$.
$x - 1 + 1 = -1 + 1$
$x = 0$

**Krok 5.** Sprawdź rozwiązanie, podstawiając $x=0$ do pierwotnego równania.
Lewa strona: $3(0 - 2) + 5 = 3(-2) + 5 = -6 + 5 = -1$
Prawa strona: $2(0) - 1 = 0 - 1 = -1$
Lewa strona równa się prawej stronie, zatem rozwiązanie jest poprawne.

## Pułapki
*   **Błędy w przekształcaniu:** Częste pomyłki przy zmianie znaku podczas przenoszenia wyrazów na drugą stronę równania (np. zamiast $-2$ napisać $+2$ przy dodawaniu).
*   **Dzielenie przez zero:** Nie można dzielić obu stron równania przez zero. Jeśli w wyniku działań pojawia się dzielenie przez wyrażenie z niewiadomą, należy rozważyć osobno przypadek, gdy to wyrażenie jest równe zero.
*   **Nierozpoznanie braku rozwiązań lub nieskończenie wielu rozwiązań:** Po uproszczeniu równania można otrzymać np. $5=0$ (brak rozwiązań) lub $3=3$ (nieskończenie wiele rozwiązań), a uczniowie czasami próbują nadal szukać wartości $x$.

## Szybka powtórka
1.  Jakie są trzy możliwe rodzaje rozwiązań równania liniowego?
2.  Co należy zrobić, jeśli podczas rozwiązywania równania chcemy przenieść wyraz z jednej strony na drugą?
3.  Jak sprawdzić, czy znalezione rozwiązanie równania jest poprawne?'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'algebra'
  AND topic = 'rownania_liniowe';

UPDATE public.materials SET
  title = 'Układy równań liniowych',
  content = '## Na egzaminie
Układy równań liniowych pojawiają się na maturze podstawowej dość często, zazwyczaj jako zadanie otwarte warte 3-4 punkty. CKE sprawdza umiejętność rozwiązywania układów dwiema metodami: przez podstawianie i przeciwnych współczynników, a także interpretację geometryczną układu.

## Najważniejsze
*   **Układ równań liniowych** to para lub więcej równań z kilkoma niewiadomymi. Najczęściej spotykane są układy dwóch równań z dwiema niewiadomymi ($x$ i $y$).
*   **Rozwiązanie układu** to para liczb $(x, y)$, która spełnia jednocześnie wszystkie równania wchodzące w skład układu.
*   **Metody rozwiązywania:**
    *   **Metoda przeciwnych współczynników:** Polega na taksowaniu równań przez odpowiednie liczby, aby współczynniki przy jednej z niewiadomych były liczbami przeciwnymi. Następnie równania dodaje się stronami.
        Przykład:
        $$
        \begin{cases}
        2x + y = 5 \\
        x - y = 1
        \end{cases}
        $$
        Dodajemy równania: $(2x+y) + (x-y) = 5+1$, co daje $3x = 6$, czyli $x=2$. Następnie podstawiamy $x=2$ do jednego z równań, np. $2-y=1$, co daje $y=1$. Rozwiązanie: $(2,1)$.
    *   **Metoda podstawiania:** Polega na wyznaczeniu jednej niewiadomej z jednego równania (np. $y$ z pierwszego równania) i podstawieniu jej do drugiego równania.
        Przykład (ten sam układ):
        $$
        \begin{cases}
        2x + y = 5 \implies y = 5 - 2x \\
        x - y = 1
        \end{cases}
        $$
        Podstawiamy $y$: $x - (5 - 2x) = 1$. Rozwiązujemy: $x - 5 + 2x = 1$, czyli $3x = 6$, $x=2$. Następnie obliczamy $y$: $y = 5 - 2(2) = 5 - 4 = 1$. Rozwiązanie: $(2,1)$.
*   **Interpretacja geometryczna:** Każde równanie liniowe z dwiema niewiadomymi można przedstawić jako prostą na płaszczyźnie. Rozwiązaniem układu jest punkt (lub punkty) przecięcia tych prostych.
    *   Dwa różne punkty przecięcia: układ ma dokładnie jedno rozwiązanie.
    *   Dwie proste pokrywające się: układ ma nieskończenie wiele rozwiązań.
    *   Dwie proste równoległe i nierównoległe: układ nie ma rozwiązań.

## Przykład krok po kroku
Rozwiąż układ równań:
$$
\begin{cases}
3x + 2y = 7 \\
x - 4y = -1
\end{cases}
$$
**Krok 1.** Wybierz metodę. Tutaj metoda podstawiania będzie wygodna, ponieważ łatwo wyznaczyć $x$ z drugiego równania.
**Krok 2.** Wyznacz jedną zmienną z jednego równania. Z drugiego równania wyznaczamy $x$: $x = 4y - 1$.
**Krok 3.** Podstaw wyznaczone wyrażenie do drugiego równania. Podstawiamy $x$ do pierwszego równania: $3(4y - 1) + 2y = 7$.
**Krok 4.** Rozwiąż równanie z jedną zmienną. $12y - 3 + 2y = 7 \implies 14y = 10 \implies y = \frac{10}{14} = \frac{5}{7}$.
**Krok 5.** Oblicz wartość drugiej zmiennej. Podstawiamy $y = \frac{5}{7}$ do $x = 4y - 1$: $x = 4(\frac{5}{7}) - 1 = \frac{20}{7} - \frac{7}{7} = \frac{13}{7}$. Rozwiązanie: $(x, y) = (\frac{13}{7}, \frac{5}{7})$.

## Pułapki
*   Błędy rachunkowe przy dodawaniu lub odejmowaniu równań, zwłaszcza przy znakach minus.
*   Zapominanie o podstawieniu obliczonej wartości jednej zmiennej z powrotem do jednego z pierwotnych równań, aby znaleźć drugą zmienną.
*   Błędne przekształcenia algebraiczne przy wyznaczaniu zmiennej lub przy podstawianiu (np. brak nawiasów przy podstawianiu wyrażenia).

## Szybka powtórka
1.  Jakie są trzy możliwe rodzaje rozwiązań układu dwóch równań liniowych i jak można je zinterpretować geometrycznie?
2.  Opisz krótko, na czym polega metoda przeciwnych współczynników.
3.  W jaki sposób należy pomnożyć równania, aby zastosować metodę przeciwnych współczynników do następującego układu:
    $$
    \begin{cases}
    2x + 3y = 1 \\
    5x + 2y = 9
    \end{cases}
    $$

## Diagram
```text
Prosta 1: y = a1*x + b1
Prosta 2: y = a2*x + b2

Przypadek 1: Przecięcie (jedno rozwiązanie)
   /
  /
 /
/_________

Przypadek 2: Równoległe (brak rozwiązań)
_________
_________

Przypadek 3: Pokrywające się (nieskończenie wiele rozwiązań)
___________
___________ (ta sama linia)
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'algebra'
  AND topic = 'uklady_rownan';

UPDATE public.materials SET
  title = 'Funkcja liniowa – klucz do sukcesu na maturze',
  content = '## Na egzaminie
Funkcja liniowa pojawia się na maturze niemal co roku, zazwyczaj w zadaniach otwartych, gdzie można zdobyć 3-5 punktów. CKE sprawdza znajomość definicji, sposobu rysowania wykresu, odczytywania wartości oraz rozwiązywania prostych równań i nierówności z nią związanych.

## Najważniejsze
*   **Definicja:** Funkcję liniową w postaci ogólnej zapisujemy jako $f(x) = ax + b$, gdzie $a$ i $b$ to stałe liczby rzeczywiste.
    *   $a$ nazywamy **współczynnikiem kierunkowym** – określa nachylenie prostej względem osi X.
    *   $b$ nazywamy **wyrazem wolnym** – określa punkt przecięcia prostej z osią Y (współrzędne punktu $(0, b)$).
*   **Wykres:** Wykresem funkcji liniowej jest **linia prosta**.
    *   Jeśli $a > 0$, funkcja jest **rosnąca**.
    *   Jeśli $a < 0$, funkcja jest **malejąca**.
    *   Jeśli $a = 0$, funkcja jest **stała** (wykres jest poziomy).
*   **Miejsce zerowe:** Miejsce zerowe funkcji liniowej to wartość $x$, dla której $f(x) = 0$. Obliczamy je ze wzoru:
    $$ax + b = 0 \Rightarrow ax = -b \Rightarrow x = -\frac{b}{a}$$
    (zakładamy, że $a \neq 0$).
*   **Prosta równoległa:** Dwie proste o równaniach $y = a_1x + b_1$ i $y = a_2x + b_2$ są równoległe, gdy ich współczynniki kierunkowe są równe: $a_1 = a_2$.
*   **Prosta prostopadła:** Dwie proste o równaniach $y = a_1x + b_1$ i $y = a_2x + b_2$ są prostopadłe, gdy iloczyn ich współczynników kierunkowych wynosi $-1$: $a_1 \cdot a_2 = -1$ (pod warunkiem, że żadna z prostych nie jest pionowa lub pozioma).

## Przykład krok po kroku
**Zadanie:** Dana jest funkcja liniowa $f(x) = -2x + 4$.
a) Naszkicuj wykres tej funkcji.
b) Podaj jej miejsce zerowe.
c) Dla jakich argumentów $x$ funkcja przyjmuje wartości ujemne?

**Krok 1.** Analiza współczynników.
Dla $f(x) = -2x + 4$, mamy $a = -2$ i $b = 4$. Ponieważ $a < 0$, funkcja jest malejąca. Punkt przecięcia z osią Y to $(0, 4)$.

**Krok 2.** Obliczenie miejsca zerowego.
Przyrównujemy funkcję do zera: $-2x + 4 = 0$.
$-2x = -4$.
$x = \frac{-4}{-2} = 2$.
Miejsce zerowe to $x=2$.

**Krok 3.** Wyznaczenie dwóch punktów do narysowania wykresu.
Znamy już punkt przecięcia z osią Y: $P_1 = (0, 4)$.
Znamy też miejsce zerowe (punkt przecięcia z osią X): $P_2 = (2, 0)$.

**Krok 4.** Naszkicowanie wykresu.
Zaznaczamy punkty $(0, 4)$ i $(2, 0)$ na układzie współrzędnych i łączymy je linią prostą.

```text
^ y
|
|     (0,4)
+-----*- - - - -
|     /
|    /
|   /
+--/---*- - - - - > x
  0   (2,0)
```

**Krok 5.** Rozwiązanie nierówności.
Szukamy argumentów $x$, dla których $f(x) < 0$.
$-2x + 4 < 0$.
$-2x < -4$.
Dzielimy przez $-2$ i zmieniamy znak nierówności:
$x > \frac{-4}{-2}$.
$x > 2$.
Funkcja przyjmuje wartości ujemne dla $x \in (2, \infty)$.

## Pułapki
*   Zapominanie o zmianie znaku nierówności przy dzieleniu lub mnożeniu przez liczbę ujemną.
*   Błędne przypisywanie znaczenia współczynnikom $a$ i $b$ (np. mylenie punktu przecięcia z osią Y z miejscem zerowym).
*   Nieprawidłowe odczytanie wykresu lub błędne obliczenie współczynnika kierunkowego na podstawie dwóch punktów.

## Szybka powtórka
1.  Podaj wzór na funkcję liniową i wyjaśnij znaczenie $a$ i $b$.
2.  Jakie warunki muszą spełniać współczynniki kierunkowe dwóch prostych, aby były one prostopadłe?
3.  Dla funkcji $f(x) = 3x - 6$, która oś jest przecięta w punkcie o współrzędnych $(0, -6)$? Która oś jest przecięta w punkcie $(2, 0)$?'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'funkcje'
  AND topic = 'funkcja_liniowa';

UPDATE public.materials SET
  title = 'Funkcja kwadratowa',
  content = '## Na egzaminie
Funkcja kwadratowa pojawia się na maturze podstawowej regularnie, zazwyczaj w zadaniach otwartych, wartych 3-5 punktów. CKE lubi sprawdzać umiejętność rysowania wykresu, znajdowania wierzchołka, miejsc zerowych oraz odczytywania własności z wykresu lub wzoru.

## Najważniejsze
*   **Definicja:** Funkcję kwadratową określa wzór $f(x) = ax^2 + bx + c$, gdzie $a, b, c$ są współczynnikami rzeczywistymi, a $a \neq 0$.
*   **Wykres:** Wykresem funkcji kwadratowej jest parabola.
    *   Jeśli $a > 0$, ramiona paraboli są skierowane w górę.
    *   Jeśli $a < 0$, ramiona paraboli są skierowane w dół.
*   **Wierzchołek paraboli:** Punkt $W = (p, q)$ o współrzędnych:
    *   $p = -\frac{b}{2a}$
    *   $q = f(p) = -\frac{\Delta}{4a}$, gdzie $\Delta = b^2 - 4ac$.
*   **Miejsca zerowe:** Są to wartości $x$, dla których $f(x) = 0$. Obliczamy je za pomocą wyróżnika $\Delta$:
    *   $\Delta = b^2 - 4ac$
    *   Jeśli $\Delta > 0$, istnieją dwa różne miejsca zerowe: $x_1 = \frac{-b - \sqrt{\Delta}}{2a}$ i $x_2 = \frac{-b + \sqrt{\Delta}}{2a}$.
    *   Jeśli $\Delta = 0$, istnieje dokładnie jedno miejsce zerowe (podwójne): $x_0 = -\frac{b}{2a}$.
    *   Jeśli $\Delta < 0$, nie ma miejsc zerowych.
*   **Osi symetrii:** Jest to prosta pionowa o równaniu $x = p$, gdzie $p$ jest pierwszą współrzędną wierzchołka.

## Przykład krok po kroku
Dana jest funkcja kwadratowa $f(x) = x^2 - 4x + 3$.
a) Wyznacz współrzędne wierzchołka paraboli.
b) Znajdź miejsca zerowe funkcji.
c) Określ, czy ramiona paraboli są skierowane w górę czy w dół.
d) Naszkicuj wykres funkcji.

**Krok 1.** Identyfikacja współczynników:
W naszym wzorze $f(x) = 1x^2 - 4x + 3$, mamy $a=1$, $b=-4$, $c=3$.

**Krok 2.** Wyznaczenie współrzędnej $p$ wierzchołka:
$p = -\frac{b}{2a} = -\frac{-4}{2 \cdot 1} = \frac{4}{2} = 2$.

**Krok 3.** Wyznaczenie współrzędnej $q$ wierzchołka i obliczenie $\Delta$:
$\Delta = b^2 - 4ac = (-4)^2 - 4 \cdot 1 \cdot 3 = 16 - 12 = 4$.
$q = -\frac{\Delta}{4a} = -\frac{4}{4 \cdot 1} = -1$.
Wierzchołek to $W = (2, -1)$.

**Krok 4.** Obliczenie miejsc zerowych:
Ponieważ $\Delta = 4 > 0$, mamy dwa miejsca zerowe.
$\sqrt{\Delta} = \sqrt{4} = 2$.
$x_1 = \frac{-b - \sqrt{\Delta}}{2a} = \frac{-(-4) - 2}{2 \cdot 1} = \frac{4 - 2}{2} = \frac{2}{2} = 1$.
$x_2 = \frac{-b + \sqrt{\Delta}}{2a} = \frac{-(-4) + 2}{2 \cdot 1} = \frac{4 + 2}{2} = \frac{6}{2} = 3$.
Miejsca zerowe to $x=1$ i $x=3$.

**Krok 5.** Określenie kierunku ramion i szkicowanie wykresu:
Współczynnik $a=1 > 0$, więc ramiona paraboli są skierowane w górę.
Wykres przechodzi przez miejsca zerowe $x=1$ i $x=3$, ma wierzchołek w punkcie $(2, -1)$, a oś symetrii to prosta $x=2$. Punkt przecięcia z osią $OY$ to $(0, c)$, czyli $(0, 3)$.

## Pułapki
*   Błędne obliczenie wyróżnika $\Delta$ (np. zapomnienie o podniesieniu $b$ do kwadratu lub błędny znak).
*   Pomyłka w znaku przy obliczaniu $p = -\frac{b}{2a}$ (częsty błąd przy ujemnym $b$).
*   Zaniedbanie informacji o znaku współczynnika $a$ przy określaniu kierunku ramion paraboli.

## Szybka powtórka
1.  Jakie są współrzędne wierzchołka paraboli o równaniu $f(x) = ax^2 + bx + c$?
2.  Ile miejsc zerowych ma funkcja kwadratowa, gdy $\Delta = 0$?
3.  Co oznacza dodatni współczynnik $a$ dla wykresu funkcji kwadratowej?

## Diagram
```text
       ^ y
       |
     (0,3) *
       |
-------+-------+-------*----> x
       |       1       3
       |    * W(2,-1)
       |
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'funkcje'
  AND topic = 'funkcja_kwadratowa';

UPDATE public.materials SET
  title = 'Planimetria - Figury na płaszczyźnie',
  content = '## Na egzaminie
Planimetria pojawia się na maturze niemal co roku, często w zadaniach otwartych. Średnio można spodziewać się 5-8 punktów. CKE lubi sprawdzać umiejętność stosowania wzorów na pola i obwody figur płaskich, własności trójkątów (w tym Pitagoras) oraz kątów.

## Najważniejsze
*   **Figury podstawowe:**
    *   **Trójkąt:** Suma kątów wewnętrznych to $180^\circ$.
        *   Pole: $P = \frac{1}{2} \cdot a \cdot h$, gdzie $a$ to podstawa, $h$ to wysokość opuszczona na tę podstawę.
        *   Trójkąt prostokątny: $a^2 + b^2 = c^2$ (twierdzenie Pitagorasa), gdzie $a, b$ to przyprostokątne, $c$ to przeciwprostokątna.
    *   **Czworokąty:**
        *   **Prostokąt:** Obwód $L = 2a + 2b$, Pole $P = a \cdot b$.
        *   **Kwadrat:** Obwód $L = 4a$, Pole $P = a^2$. Przekątna $d = a\sqrt{2}$.
        *   **Równoległobok:** Pole $P = a \cdot h$ (gdzie $h$ to wysokość opuszczona na bok $a$).
        *   **Trapez:** Pole $P = \frac{a+b}{2} \cdot h$, gdzie $a, b$ to podstawy, $h$ to wysokość.
*   **Twierdzenie Pitagorasa:** W trójkącie prostokątnym suma kwadratów długości przyprostokątnych jest równa kwadratowi długości przeciwprostokątnej. $a^2 + b^2 = c^2$.
*   **Twierdzenie o kącie wpisanym i środkowym:** Kąt środkowy oparty na tym samym łuku co kąt wpisany jest dwa razy większy od tego kąta wpisanego.

## Przykład krok po kroku
**Zadanie:** W prostokącie ABCD o bokach $|AB|=8$ i $|BC|=4$ poprowadzono przekątną AC. Oblicz długość przekątnej AC oraz pole trójkąta ABC.

**Krok 1.** Zapisz dane. Mamy prostokąt ABCD, $|AB|=8$, $|BC|=4$. Szukamy $|AC|$ i $P_{\triangle ABC}$.

**Krok 2.** Zauważ, że trójkąt ABC jest trójkątem prostokątnym (kąt przy wierzchołku B wynosi $90^\circ$), ponieważ jest częścią prostokąta. Bok AB i BC są przyprostokątnymi, a AC jest przeciwprostokątną.

**Krok 3.** Zastosuj twierdzenie Pitagorasa do trójkąta ABC. $a=4$, $b=8$, $c=|AC|$.
$$|BC|^2 + |AB|^2 = |AC|^2$$
$$4^2 + 8^2 = |AC|^2$$
$$16 + 64 = |AC|^2$$
$$80 = |AC|^2$$

**Krok 4.** Oblicz długość przekątnej AC.
$$|AC| = \sqrt{80} = \sqrt{16 \cdot 5} = 4\sqrt{5}$$

**Krok 5.** Oblicz pole trójkąta ABC. Trójkąt ABC jest połową prostokąta ABCD.
$$P_{\triangle ABC} = \frac{1}{2} \cdot |AB| \cdot |BC| = \frac{1}{2} \cdot 8 \cdot 4 = 16$$
Można też policzyć pole prostokąta i podzielić przez 2: $P_{ABCD} = 8 \cdot 4 = 32$, $P_{\triangle ABC} = \frac{1}{2} \cdot 32 = 16$.

## Pułapki
*    Mylenie wzorów na pole i obwód figur.
*   Brak konsekwencji w stosowaniu twierdzenia Pitagorasa (np. przez przypadek dodawanie przyprostokątnych zamiast ich kwadratów).
*   Nieprawidłowe obliczenia pierwiastków przy upraszczaniu wyników.

## Szybka powtórka
1.  Jaka jest suma kątów wewnętrznych w dowolnym trójkącie?
2.  Jaki jest wzór na pole trapezu?
3.  Jaka jest zależność między długościami boków w trójkącie prostokątnym (twierdzenie Pitagorasa)?

## Diagram
```text
      A ________ B
       |        |
       |        |
      4|        |4
       |________|
      D     8    C

Przekątna AC przecina prostokąt na dwa trójkąty prostokątne ABC i ADC.
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'geometria'
  AND topic = 'planimetria';

UPDATE public.materials SET
  title = 'Bryły proste – pole i objętość',
  content = '## Na egzaminie
Stereometria pojawia się na maturze podstawowej regularnie, zazwyczaj w zadaniach otwartych (1-2 zadania) lub jako część zadań zamkniętych. CKE sprawdza znajomość wzorów na pola powierzchni i objętości podstawowych brył, a także umiejętność ich zastosowania w prostych obliczeniach. Często pojawiają się zadania z graniastosłupami i ostrosłupami.

## Najważniejsze
*   **Graniastosłup**: Bryła o dwóch przystających podstawach położonych w dwóch równoległych płaszczyznach i połączonych ścianami bocznymi (równoległoboki).
    *   **Graniastosłup prosty**: Ściany boczne są prostokątami, a krawędzie boczne są prostopadłe do podstaw.
        *   Pole powierzchni całkowitej ($P_c$): $P_c = 2 P_p + P_b$, gdzie $P_p$ to pole podstawy, a $P_b$ to pole powierzchni bocznej.
        *   Objętość ($V$): $V = P_p \cdot H$, gdzie $H$ to wysokość graniastosłupa.
    *   **Sześcian**: Graniastosłup prawidłowy sześciokątny o kwadratowych podstawach i ścianach bocznych. Wszystkie krawędzie mają tę samą długość ($a$).
        *   Pole powierzchni całkowitej: $P_c = 6a^2$
        *   Objętość: $V = a^3$
*   **Ostrosłup**: Bryła o jednej podstawie (wielokąt) i wierzchołku nie leżącym w płaszczyźnie podstawy, połączonym krawędziami z wierzchołkami podstawy.
    *   **Ostrosłup prosty**: Spodek wysokości ostrosłupa znajduje się w środku okręgu wpisanego w podstawę (w przypadku ostrosłupa prawidłowego) lub jest to inny punkt (w ogólnym przypadku).
        *   Pole powierzchni całkowitej ($P_c$): $P_c = P_p + P_b$
        *   Objętość ($V$): $V = \frac{1}{3} P_p \cdot H$
*   **Wzory pomocnicze**: Warto pamiętać wzory na pola podstawowych figur płaskich (trójkąt, kwadrat, prostokąt, sześciokąt).

## Przykład krok po kroku
Oblicz objętość i pole powierzchni całkowitej graniastosłupa prawidłowego czworokątnego, którego krawędź podstawy ma długość 5 cm, a wysokość wynosi 8 cm.

**Krok 1.** Zidentyfikuj bryłę i jej wymiary. Jest to graniastosłup prawidłowy czworokątny, co oznacza, że w podstawie ma kwadrat. Krawędź podstawy $a = 5$ cm, wysokość $H = 8$ cm.

**Krok 2.** Oblicz pole podstawy ($P_p$). Podstawa jest kwadratem o boku $a$, więc $P_p = a^2$.
$P_p = 5^2 = 25$ cm$^2$.

**Krok 3.** Oblicz pole powierzchni bocznej ($P_b$). Ściany boczne graniastosłupa prostego są prostokątami. W tym przypadku są to 4 prostokąty o bokach $a$ i $H$.
$P_b = 4 \cdot (a \cdot H) = 4 \cdot (5 \cdot 8) = 4 \cdot 40 = 160$ cm$^2$.

**Krok 4.** Oblicz pole powierzchni całkowitej ($P_c$). Użyj wzoru $P_c = 2 P_p + P_b$.
$P_c = 2 \cdot 25 + 160 = 50 + 160 = 210$ cm$^2$.

**Krok 5.** Oblicz objętość ($V$). Użyj wzoru $V = P_p \cdot H$.
$V = 25 \cdot 8 = 200$ cm$^3$.

## Pułapki
*    Mylenie graniastosłupa prostego z pochyłym – pamiętaj, że w graniastosłupie prostym wysokość jest równa krawędzi bocznej.
*   Stosowanie wzoru na objętość ostrosłupa do graniastosłupa (lub odwrotnie) – zapamiętaj czynnik $\frac{1}{3}$ dla ostrosłupów.
*   Nieprawidłowe obliczenie pola podstawy, szczególnie gdy podstawa nie jest kwadratem lub prostokątem (np. trójkąt równoboczny, sześciokąt foremny).

## Szybka powtórka
1.  Jaka jest różnica między polem powierzchni bocznej a całkowitej graniastosłupa?
2.  Ile wynosi objętość sześcianu o krawędzi $3$ cm?
3.  Wzór na pole powierzchni bocznej ostrosłupa prawidłowego trójkątnego o boku podstawy $a$ i wysokości ściany bocznej $h_s$?

## Diagram
```text
   /-------/|
  /       / | <-- Graniastosłup prosty
 /_______/  |
|       |  /
|       | /
|_______|/

  / \
 / _ \  <-- Ostrosłup
/_____\
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'geometria'
  AND topic = 'stereometria';

UPDATE public.materials SET
  title = 'Geometria analityczna na maturze',
  content = '## Na egzaminie
Geometria analityczna pojawia się na maturze co roku, zazwyczaj w zadaniu otwartym lub jako część zadań zamkniętych. Można spodziewać się 1-4 punktów. CKE sprawdza znajomość wzorów na odległość, środek odcinka, równanie prostej oraz umiejętność stosowania ich w różnych kontekstach, np. z trójkątami czy okręgami.

## Najważniejsze
*   **Współrzędne punktów:** Punkt na płaszczyźnie opisujemy parą liczb $(x, y)$.
*   **Odległość między dwoma punktami:** Odległość między punktami $A=(x_A, y_A)$ i $B=(x_B, y_B)$ obliczamy ze wzoru:
    $$d(A, B) = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$$
*   **Środek odcinka:** Współrzędne środka $S=(x_S, y_S)$ odcinka o końcach $A=(x_A, y_A)$ i $B=(x_B, y_B)$ obliczamy ze wzorów:
    $$x_S = \frac{x_A + x_B}{2}, \quad y_S = \frac{y_A + y_B}{2}$$
*   **Równanie prostej:**
    *   Ogólna postać: $Ax + By + C = 0$
    *   Postać kierunkowa: $y = ax + b$, gdzie $a$ to współczynnik kierunkowy (nachylenie prostej), a $b$ to wyraz wolny (punkt przecięcia z osią OY).
    *   Prosta przechodząca przez punkty $A=(x_A, y_A)$ i $B=(x_B, y_B)$ ($x_A \neq x_B$):
        $$y - y_A = \frac{y_B - y_A}{x_B - x_A}(x - x_A)$$
    *   Warunek równoległości prostych: Dwie proste $y = a_1 x + b_1$ i $y = a_2 x + b_2$ są równoległe, gdy $a_1 = a_2$.
    *   Warunek prostopadłości prostych: Dwie proste $y = a_1 x + b_1$ i $y = a_2 x + b_2$ są prostopadłe, gdy $a_1 \cdot a_2 = -1$ (przy założeniu, że żadna z prostych nie jest pionowa).

## Przykład krok po kroku
**Zadanie:** Punkty $A=(-2, 1)$ i $B=(4, -5)$ są końcami odcinka $AB$. Wyznacz współrzędne środka tego odcinka oraz oblicz jego długość.

**Krok 1.** Zapisz współrzędne danych punktów.
$A = (x_A, y_A) = (-2, 1)$
$B = (x_B, y_B) = (4, -5)$

**Krok 2.** Oblicz współrzędne środka odcinka $AB$ ze wzorów.
$x_S = \frac{x_A + x_B}{2} = \frac{-2 + 4}{2} = \frac{2}{2} = 1$
$y_S = \frac{y_A + y_B}{2} = \frac{1 + (-5)}{2} = \frac{-4}{2} = -2$
Środek odcinka $AB$ to punkt $S=(1, -2)$.

**Krok 3.** Oblicz długość odcinka $AB$ ze wzoru na odległość między punktami.
$d(A, B) = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$
$d(A, B) = \sqrt{(4 - (-2))^2 + (-5 - 1)^2}$

**Krok 4.** Wykonaj obliczenia.
$d(A, B) = \sqrt{(4 + 2)^2 + (-6)^2}$
$d(A, B) = \sqrt{6^2 + (-6)^2}$
$d(A, B) = \sqrt{36 + 36}$
$d(A, B) = \sqrt{72}$

**Krok 5.** Uprość wynik (jeśli to możliwe).
$\sqrt{72} = \sqrt{36 \cdot 2} = \sqrt{36} \cdot \sqrt{2} = 6\sqrt{2}$
Długość odcinka $AB$ wynosi $6\sqrt{2}$.

## Pułapki
*   **Znaki przy odejmowaniu współrzędnych:** Często popełniany błąd to niewłaściwe opuszczenie lub dodanie znaków minus przy obliczaniu różnic współrzędnych w wzorze na odległość lub współczynnik kierunkowy.
*   **Kolejność punktów w odejmowaniu:** Pamiętaj, że $(x_B - x_A)^2 = (x_A - x_B)^2$, więc kolejność odejmowania w liczniku wzoru na odległość nie ma znaczenia, ale powinna być spójna (np. zawsze punkt końcowy minus punkt początkowy). W postaci kierunkowej prostej kolejność jest istotna.
*   **Zapominanie o pierwiastku:** Po obliczeniu sumy kwadratów różnic współrzędnych, nie zapomnij wyciągnąć pierwiastka kwadratowego, aby uzyskać odległość.

## Szybka powtórka
1.  Podaj wzór na równanie prostej przechodzącej przez dwa punkty $A=(x_1, y_1)$ i $B=(x_2, y_2)$, zakładając $x_1 \neq x_2$.
2.  Jakie warunki muszą spełniać współczynniki kierunkowe dwóch prostych, aby były one prostopadłe?
3.  Punkt $P$ ma współrzędne $(5, -3)$. Jaka jest jego odległość od początku układu współrzędnych $(0, 0)$?

## Diagram
```
      ^ y
      |
      |   B(xB, yB)
      |  .
      | /
      |/   S (środek AB)
 -----+-----.-----> x
      |\   .
      | \
      |  . A(xA, yA)
      |
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'geometria'
  AND topic = 'geometria_analityczna';

UPDATE public.materials SET
  title = 'Prawdopodobieństwo na maturze',
  content = '## Na egzaminie
Prawdopodobieństwo pojawia się na maturze co roku, zazwyczaj w zadaniu otwartym lub jako część zadań zamkniętych. Daje od 2 do 5 punktów. CKE często sprawdza umiejętność obliczania prawdopodobieństwa w kontekście klasycznym, np. rzuty kostką, losowanie kul, ale też w zadaniach z treścią.

## Najważniejsze
*   **Prawdopodobieństwo klasyczne:** Zakłada, że wszystkie zdarzenia elementarne (możliwe wyniki) są równie prawdopodobne.
    *   Wzór: $P(A) = \frac{|A|}{| \Omega |}$
        *   $P(A)$ – prawdopodobieństwo zajścia zdarzenia A
        *   $|A|$ – liczba zdarzeń sprzyjających zdarzeniu A (zdarzenia, które nas interesują)
        *   $| \Omega |$ – liczba wszystkich możliwych zdarzeń elementarnych (wszystkie możliwe wyniki)
*   **Zdarzenie pewne:** Zdarzenie, które musi zajść. Jego prawdopodobieństwo wynosi 1.
*   **Zdarzenie niemożliwe:** Zdarzenie, które nie może zajść. Jego prawdopodobieństwo wynosi 0.
*   **Zakres prawdopodobieństwa:** $0 \le P(A) \le 1$.
*   **Zdarzenia przeciwne:** Jeśli A jest zdarzeniem, to zdarzenie przeciwne $A''$ oznacza, że zdarzenie A nie zaszło. $P(A'') = 1 - P(A)$.

## Przykład krok po kroku
W pudełku znajduje się 10 kul: 4 białe i 6 czarnych. Losujemy jedną kulę. Jakie jest prawdopodobieństwo, że wylosowana kula będzie biała?

**Krok 1.** Określ zbiór wszystkich możliwych zdarzeń elementarnych.
W pudełku jest 10 kul, więc możemy wylosować jedną z nich.
$| \Omega | = 10$ (liczba wszystkich kul).

**Krok 2.** Określ zbiór zdarzeń sprzyjających zdarzeniu, które nas interesuje.
Interesuje nas zdarzenie, że wylosowana kula jest biała. W pudełku są 4 białe kule.
$|A| = 4$ (liczba kul białych).

**Krok 3.** Zastosuj wzór na prawdopodobieństwo klasyczne.
$P(A) = \frac{|A|}{| \Omega |}$

**Krok 4.** Podstaw wartości i oblicz.
$P(\text{wylosowanie białej kuli}) = \frac{4}{10}$

**Krok 5.** Uprość wynik.
$\frac{4}{10} = \frac{2}{5}$.
Prawdopodobieństwo wylosowania białej kuli wynosi $\frac{2}{5}$.

## Pułapki
*   **Mylenie liczby zdarzeń sprzyjających z całkowitą liczbą zdarzeń:** Upewnij się, że w liczniku wzoru na prawdopodobieństwo jest liczba zdarzeń pasujących do opisu, a w mianowniku – wszystkich możliwych.
*   **Nieuproszczenie wyniku:** Prawdopodobieństwo powinno być podane w najprostszej postaci (np. $\frac{2}{5}$ zamiast $\frac{4}{10}$). Czasem wymagany jest też wynik w postaci dziesiętnej lub procentowej.
*   **Błędne obliczenia przy zdarzeniach wieloetapowych lub złożonych:** Rozbijaj problem na mniejsze kroki i starannie licz możliwości na każdym etapie.

## Szybka powtórka
1.  W urnie są 3 kule czerwone i 7 niebieskich. Jakie jest prawdopodobieństwo wylosowania kuli niebieskiej?
2.  Rzucamy dwa razy monetą. Jakie jest prawdopodobieństwo, że wyrzucimy co najmniej jednego orła?
3.  Jakie jest prawdopodobieństwo, że przy rzucie sześcienną kostką wypadnie liczba większa niż 6?

## Diagram
Symulacja rzutu dwiema kostkami sześciennymi (suma oczek).
`
   | 1  2  3  4  5  6
---|--------------------
1  | 2  3  4  5  6  7
2  | 3  4  5  6  7  8
3  | 4  5  6  7  8  9
4  | 5  6  7  8  9 10
5  | 6  7  8  9 10 11
6  | 7  8  9 10 11 12
`
Liczba wszystkich możliwych wyników: 36.'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'kombinatoryka'
  AND topic = 'prawdopodobienstwo';

UPDATE public.materials SET
  title = 'Statystyka – opis danych',
  content = '## Na egzaminie
Statystyka pojawia się na maturze podstawowej regularnie, zwykle jako jedno lub dwa zadania otwarte, za które można uzyskać łącznie około 5-7 punktów. CKE najczęściej sprawdza umiejętność obliczania średniej arytmetycznej, mediany i dominanty, a także interpretację tych miar.

## Najważniejsze
*   **Średnia arytmetyczna:** Suma wszystkich liczb w zbiorze podzielona przez liczbę tych liczb.
    Dla zbioru danych $x_1, x_2, \dots, x_n$, średnia arytmetyczna $\bar{x}$ wynosi:
    $$\bar{x} = \frac{x_1 + x_2 + \dots + x_n}{n}$$
*   **Mediana:** Wartość środkowa w uporządkowanym zbiorze danych.
    *   Jeśli liczba danych ($n$) jest **nieparzysta**, mediana jest środkowym elementem po uporządkowaniu.
    *   Jeśli liczba danych ($n$) jest **parzysta**, mediana jest średnią arytmetyczną dwóch środkowych elementów po uporządkowaniu.
*   **Dominanta (Moda):** Wartość, która najczęściej występuje w zbiorze danych. Zbiór danych może mieć jedną dominantę, więcej niż jedną lub nie mieć jej wcale.

## Przykład krok po kroku
Zbadano wiek 7 osób, wyniki przedstawiono w tabeli:

| Wiek | Liczba osób |
| :--- | :---------- |
| 20  | 1           |
| 22  | 3           |
| 25  | 2           |
| 30  | 1           |

Oblicz średnią arytmetyczną wieku tych osób.

**Krok 1.** Zidentyfikuj wszystkie wartości i ich częstości.
Wartości wieku to: 20, 22, 25, 30.
Częstości (liczba osób) to: 1, 3, 2, 1.

**Krok 2.** Oblicz sumę wszystkich wartości. Aby to zrobić, mnożymy każdą wartość przez jej częstość, a następnie sumujemy te iloczyny.
Suma = $(20 \cdot 1) + (22 \cdot 3) + (25 \cdot 2) + (30 \cdot 1) = 20 + 66 + 50 + 30 = 166$.

**Krok 3.** Oblicz całkowitą liczbę danych (liczbę osób).
Liczba osób = $1 + 3 + 2 + 1 = 7$.

**Krok 4.** Oblicz średnią arytmetyczną, dzieląc sumę wartości przez liczbę danych.
Średnia arytmetyczna = $\frac{166}{7}$.

**Krok 5.** Podaj wynik. Wynik można pozostawić w postaci ułamka lub zaokrąglić.
Średnia arytmetyczna $\approx 23.71$.

## Pułapki
*   Zapominanie o uporządkowaniu danych przy obliczaniu mediany.
*   Błędne stosowanie wzoru na średnią arytmetyczną dla danych pogrupowanych (nie mnożenie przez częstości).
*   Mylenie pojęć: średnia, mediana i dominanta – np. obliczanie dominanty, gdy proszą o średnią.

## Szybka powtórka
1.  Podaj zestaw danych, dla którego mediana jest większa niż średnia arytmetyczna.
2.  Dla zbioru liczb {3, 7, 2, 7, 5, 7, 9} podaj dominantę.
3.  Jak obliczyć medianę dla zbioru danych, który zawiera 10 liczb?

## Diagram
Dane: {1, 2, 2, 2, 3, 3, 4}
Uporządkowane: 1, 2, 2, **2**, **3**, 3, 4
Średnia: (1+2+2+2+3+3+4)/7 = 17/7 $\approx$ 2.43
Mediana: 2 (środkowy element)
Dominanta: 2 (najczęściej występująca)'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'kombinatoryka'
  AND topic = 'statystyka';

UPDATE public.materials SET
  title = 'Ułamki — działania krok po kroku',
  content = '## Na egzaminie

Działania na ułamkach — zadania zamknięte i krótkie otwarte. Sprawdzany wspólny mianownik, skracanie i dzielenie przez ułamek.

## Najważniejsze

**Dodawanie/odejmowanie:** $\dfrac{a}{b} \pm \dfrac{c}{d} = \dfrac{ad \pm bc}{bd}$

**Mnożenie:** $\dfrac{a}{b} \cdot \dfrac{c}{d} = \dfrac{ac}{bd}$

**Dzielenie:** $\dfrac{a}{b} : \dfrac{c}{d} = \dfrac{a}{b} \cdot \dfrac{d}{c}$

## Przykład krok po kroku

Oblicz: $\dfrac{3}{4} + \dfrac{5}{6} - \dfrac{1}{3}$

NWW = 12: $\dfrac{9}{12} + \dfrac{10}{12} - \dfrac{4}{12} = \dfrac{15}{12} = \dfrac{5}{4}$

## Pułapki

- Najpierw wspólny mianownik przy +/- 
- Przy dzieleniu „przewracasz” **drugi** ułamek
- Zawsze skracaj wynik

## Szybka powtórka

1. $\dfrac{2}{5} + \dfrac{1}{3} = ?$
2. $\dfrac{2}{3} : \dfrac{4}{9} = ?$
3. Czy $\dfrac{6}{8}$ można skrócić?'
WHERE exam_type = '8_klasa'
  AND category = 'liczby'
  AND topic = 'ulamki';

UPDATE public.materials SET
  title = 'Potęgi — definicja i działania',
  content = '## Na egzaminie

Potęgi o wykładniku naturalnym — uproszczenia, porównywanie wartości. Zwykle 1–2 zadania w arkuszu.

## Najważniejsze

$a^n = \underbrace{a \cdot a \cdots a}_{n\text{ razy}}$

- $a^m \cdot a^n = a^{m+n}$
- $\dfrac{a^m}{a^n} = a^{m-n}$ ($a \neq 0$)
- $(a^m)^n = a^{mn}$

**Specjalne:** $a^0 = 1$ ($a \neq 0$), $a^1 = a$.

## Przykład krok po kroku

Oblicz: $2^3 \cdot 2^4 : 2^5$

**Krok 1.** Licznik: $2^{3+4} = 2^7$

**Krok 2.** $\dfrac{2^7}{2^5} = 2^2 = 4$

## Pułapki

- $(2^3)^2 = 2^6$, nie $2^5$
- $2^3 \cdot 3^2$ **nie** upraszcza się do jednej potęgi
- $0^0$ — nie używaj bez definicji z zadania

## Szybka powtórka

1. Ile wynosi $5^0$?
2. Uprość $3^4 : 3^2$.
3. $(10^2)^3 = ?$'
WHERE exam_type = '8_klasa'
  AND category = 'liczby'
  AND topic = 'potegi';

UPDATE public.materials SET
  title = 'Procenty — obliczenia i zadania tekstowe',
  content = '## Na egzaminie

Procenty z liczby, jaki procent stanowi liczba, zadania o ceny i rabaty — bardzo częsty temat na egzaminie ósmoklasisty.

## Najważniejsze

$p\%$ z $N$: $\dfrac{p}{100} \cdot N$

**Jaki procent?** $\dfrac{\text{część}}{\text{całość}} \cdot 100\%$

**Schemat:** całość = 100%.

## Przykład krok po kroku

Bluzka kosztuje 120 zł. W wyprzedaży taniej o 25%. Ile kosztuje po obniżce?

**Krok 1.** Obniżka: $25\% \cdot 120 = 30$ zł

**Krok 2.** Cena: $120 - 30 = 90$ zł

Alternatywnie: $120 \cdot 0{,}75 = 90$ zł.

## Pułapki

- Spadek o 25% $\neq$ wzrost o 25% do powrotu
- „O ile procent więcej” — dziel przez mniejszą wartość (początkową)
- 100% to całość, 50% to połowa

## Szybka powtórka

1. Ile to 20% z 150?
2. 18 z 24 to ile procent?
3. Cena 200 zł + 10% — ile wynosi?'
WHERE exam_type = '8_klasa'
  AND category = 'liczby'
  AND topic = 'procenty';

UPDATE public.materials SET
  title = 'Wyrażenia algebraiczne — podstawianie i upraszczanie',
  content = '## Na egzaminie

Podstawianie liczb za zmienną, porządek działań, redukcja wyrazów podobnych — 2–3 zadania.

## Najważniejsze

**Podstawianie:** w miejsce $x$ wstaw liczbę i licz według kolejności: nawiasy → potęgi → $\times /$ → $+/-$.

**Wyrazy podobne:** ta sama część literowa, np. $2x + 3x = 5x$.

**Mnożenie przez nawias:** $2(x + 3) = 2x + 6$.

## Przykład krok po kroku

Oblicz wartość $2x^2 - 3x + 1$ dla $x = -2$.

**Krok 1.** $2 \cdot (-2)^2 = 2 \cdot 4 = 8$

**Krok 2.** $-3 \cdot (-2) = 6$

**Krok 3.** $8 + 6 + 1 = 15$

## Pułapki

- **Minus przy podstawianiu:** $x = -2$ w $x^2$ daje $(-2)^2 = 4$
- **$2x^2$ vs $(2x)^2$** — to nie to samo
- Redukuj tylko wyrazy **podobne**

## Szybka powtórka

1. Wartość $3x - 1$ dla $x = 4$?
2. Uprość $5a + 2b - a + 3b$.
3. Rozwiń $3(2x - 1)$.'
WHERE exam_type = '8_klasa'
  AND category = 'algebra'
  AND topic = 'wyrazenia_algebraiczne';

UPDATE public.materials SET
  title = 'Równania liniowe — rozwiązywanie',
  content = '## Na egzaminie

Równania z jedną niewiadomą — przenoszenie wyrazów, sprawdzanie rozwiązania. 2–4 pkt w części otwartej.

## Najważniejsze

Cel: samo $x$ po jednej stronie, liczba po drugiej.

**Zasady:** to samo dodaj/odejmij; mnoż/dziel obie strony przez tę samą liczbę $\neq 0$.

**Sprawdzenie:** podstaw wynik — obie strony muszą być równe.

## Przykład krok po kroku

Rozwiąż: $5x - 3 = 2x + 9$

**Krok 1.** $5x - 2x = 9 + 3$

**Krok 2.** $3x = 12$

**Krok 3.** $x = 4$

**Sprawdzenie:** $17 = 17$ ✓

## Pułapki

- Zmiana znaku przy przenoszeniu
- Mnożenie nawiasu: $2(x + 1) = 2x + 2$
- Zawsze sprawdź wynik

## Szybka powtórka

1. Rozwiąż $4x + 5 = 21$.
2. Co robić z $3(x - 2) = 12$?
3. Czy $x = 0$ spełnia $2x = x$?'
WHERE exam_type = '8_klasa'
  AND category = 'algebra'
  AND topic = 'rownania';

UPDATE public.materials SET
  title = 'Pola figur płaskich',
  content = '## Na egzaminie

Pola prostokąta, trójkąta, trapezu, równoległoboku, koła — wzory w arkuszu, ale trzeba umieć je stosować (2–4 pkt).

## Najważniejsze

**Prostokąt:** $P = ab$

**Trójkąt:** $P = \dfrac{ah}{2}$ ($h$ — wysokość na podstawę $a$)

**Trapez:** $P = \dfrac{(a + b)h}{2}$

**Równoległobok:** $P = ah$

**Koło:** $P = \pi r^2$

## Przykład krok po kroku

Trapez ma podstawy 6 cm i 10 cm, wysokość 4 cm. Oblicz pole.

$$P = \frac{(6 + 10) \cdot 4}{2} = \frac{64}{2} = 32\text{ cm}^2$$

## Pułapki

- **Wysokość** musi być prostopadła do podstawy
- **$r$ vs $d$** w kole — promień to połowa średnicy
- **Jednostki** — cm², nie cm

## Szybka powtórka

1. Pole prostokąta 5 cm × 8 cm?
2. Trójkąt: $a = 10$, $h = 6$ — pole?
3. Koło $r = 3$ — pole (z $\pi$)?'
WHERE exam_type = '8_klasa'
  AND category = 'geometria'
  AND topic = 'pola_figur';

UPDATE public.materials SET
  title = 'Obwód figury płaskiej',
  content = '## Na egzaminie

Obwód = suma długości boków. Proste zadania, czasem z brakującym bokiem (Pitagoras).

## Najważniejsze

**Definicja:** $O = a + b + c + \ldots$ (suma wszystkich boków).

**Kwadrat:** $O = 4a$

**Prostokąt:** $O = 2a + 2b$

**Trójkąt:** $O = a + b + c$

**Koło:** $L = 2\pi r$ (długość okręgu)

## Przykład krok po kroku

Prostokąt ma boki 7 cm i 11 cm. Oblicz obwód.

$$O = 2 \cdot 7 + 2 \cdot 11 = 14 + 22 = 36\text{ cm}$$

## Pułapki

- **Obwód $\neq$ pole** — inne jednostki (cm vs cm²)
- Przy wielokącie **nie pomijaj żadnego boku**
- Okrąg — używaj $L = 2\pi r$, nie myl z polem

## Szybka powtórka

1. Obwód kwadratu o boku 9 cm?
2. Trójkąt o bokach 3, 4, 5 — obwód?
3. Czym różni się obwód koła od pola koła?'
WHERE exam_type = '8_klasa'
  AND category = 'geometria'
  AND topic = 'obwody';

UPDATE public.materials SET
  title = 'Kąty w trójkątach i wielokątach',
  content = '## Na egzaminie

Suma kątów w trójkącie i wielokącie, kąty przy prostej równoległej, trójkąt prostokątny — 2–3 zadania.

## Najważniejsze

**Trójkąt:** suma kątów wewnętrznych = $180°$.

**Trójkąt prostokątny:** jeden kąt $90°$, dwa pozostałe ostre, suma $90°$.

**Wielokąt $n$-kątny:** suma kątów = $(n - 2) \cdot 180°$.

**Kąty przy prostej równoległej** — kąty odpowiadające i naprzemianległe.

## Przykład krok po kroku

W trójkącie dwa kąty mają miary $65°$ i $48°$. Oblicz trzeci kąt.

$$\alpha = 180° - 65° - 48° = 67°$$

## Pułapki

- Suma trzech kątów trójkąta **zawsze** $180°$
- Kąt prosty dokładnie $90°$
- Przy równoległych — rozróżnij kąty odpowiadające i naprzemianległe

## Szybka powtórka

1. Trzeci kąt przy $90°$ i $45°$?
2. Suma kątów czworokąta?
3. Ile wynosi kąt prosty?'
WHERE exam_type = '8_klasa'
  AND category = 'geometria'
  AND topic = 'katy';

UPDATE public.materials SET
  title = 'Odczyt wykresu funkcji',
  content = '## Na egzaminie

Odczyt wartości z wykresu, miejsca zerowe, gdzie funkcja rośnie/maleje — zadania z rysunkiem (2–4 pkt).

## Najważniejsze

**Układ współrzędnych:** oś pozioma $x$ (argument), pionowa $y$ (wartość).

**Punkt na wykresie:** $(x, f(x))$ — z wykresu odczytujesz $y$ dla danego $x$.

**Miejsce zerowe:** punkt przecięcia z osią $x$ ($y = 0$).

**Rosnąca** — wykres idzie w górę (w lewo → w prawo); **malejąca** — w dół.

## Przykład krok po kroku

Z wykresu prostej przechodzącej przez $(0, 2)$ i $(2, 6)$ odczytaj $f(1)$.

Prosta rosnąca równomiernie: między $x = 0$ a $x = 2$ wartość rośnie o 4, więc przy $x = 1$: $f(1) = 4$.

## Pułapki

- Odczytuj **dokładnie** z podziałki osi
- Miejsce zerowe to $x$, nie $y$
- Wykres $\neq$ tabela — sprawdzaj obie osie

## Szybka powtórka

1. Co oznacza punkt $(3, -1)$ na wykresie?
2. Gdzie szukać miejsc zerowych?
3. Jak rozpoznać, że funkcja jest stała?'
WHERE exam_type = '8_klasa'
  AND category = 'funkcje'
  AND topic = 'wykresy';

UPDATE public.materials SET
  title = 'Średnia arytmetyczna',
  content = '## Na egzaminie

Obliczanie średniej z listy liczb lub tabeli — proste zadanie, ale wymaga dokładności (1–2 pkt).

## Najważniejsze

$$\bar{x} = \frac{x_1 + x_2 + \cdots + x_n}{n}$$

**Interpretacja:** „typowy” wynik zbioru — np. średnia ocen, średnia temperatura.

**Brakująca wartość:** jeśli znasz średnią i pozostałe liczby, sumuj i wylicz brakującą.

## Przykład krok po kroku

Oceny: 4, 5, 3, 5, 5, 4. Oblicz średnią.

Suma: $4 + 5 + 3 + 5 + 5 + 4 = 26$, $n = 6$

$$\bar{x} = \frac{26}{6} \approx 4{,}33$$

## Pułapki

- **Dziel przez liczbę elementów**, nie przez największą wartość
- Średnia może **nie być** liczbą całkowitą
- Jedna wartość skrajna mocno przesuwa średnią

## Szybka powtórka

1. Średnia z 2, 4, 6, 8?
2. Suma pięciu liczb to 50 — jaka średnia?
3. Czym różni się średnia od mediany?'
WHERE exam_type = '8_klasa'
  AND category = 'statystyka'
  AND topic = 'srednia';

UPDATE public.materials SET
  title = 'Diagramy słupkowe i kołowe',
  content = '## Na egzaminie

Odczyt danych z diagramu, obliczanie udziałów procentowych, czasem rysowanie — 2–3 pkt.

## Najważniejsze

**Diagram słupkowy:** wysokość (lub długość) słupka = wartość; dobre do porównań.

**Diagram kołowy:** kąt (lub procent) wycinka = udział w całości; całość = $360°$ lub 100%.

**Przeliczanie:** udział = $\dfrac{\text{wartość}}{\text{suma}} \cdot 100\%$.

## Przykład krok po kroku

W klasie 30 uczniów: 12 osób gra w piłkę, 8 w koszykówkę, reszta w siatkówkę. Ile osób gra w siatkówkę?

**Krok 1.** $30 - 12 - 8 = 10$ osób

**Krok 2.** Udział: $\dfrac{10}{30} \approx 33{,}3\%$

## Pułapki

- W diagramie kołowym **suma wycinków = całość**
- Sprawdź skalę osi na diagramie słupkowym
- Procenty zaokrąglaj rozsądnie

## Szybka powtórka

1. Co pokazuje wysokość słupka?
2. Całość w diagramie kołowym to ile procent?
3. Jak obliczyć udział procentowy?'
WHERE exam_type = '8_klasa'
  AND category = 'statystyka'
  AND topic = 'diagramy';

UPDATE public.materials SET
  title = 'Prawdopodobieństwo — wprowadzenie',
  content = '## Na egzaminie

Proste prawdopodobieństwo klasyczne: rzut kostką, monety, losowanie kul — 1–2 zadania.

## Najważniejsze

$$P(A) = \frac{\text{liczba wyników sprzyjających}}{\text{liczba wszystkich wyników}}$$

Wartość od 0 (niemożliwe) do 1 (pewne).

**Zdarzenie przeciwne:** $P(\text{nie } A) = 1 - P(A)$.

## Przykład krok po kroku

Rzucamy symetryczną kostką. Prawdopodobieństwo wyrzucenia liczby większej niż 4?

**Krok 1.** Sprzyjające: 5, 6 → 2 wyniki

**Krok 2.** Wszystkich: 6

**Krok 3.** $P = \dfrac{2}{6} = \dfrac{1}{3}$

## Pułapki

- **Wszystkie wyniki jednakowo prawdopodobne** — warunek modelu klasycznego
- „Co najmniej jeden” — czasem łatwiej $1 - P(\text{żaden})$
- $P = \dfrac{1}{2}$ przy monecie tylko gdy uczciwa

## Szybka powtórka

1. $P(\text{orzeł})$ przy rzucie monetą?
2. $P(\text{parzysta})$ na kostce?
3. Ile wynosi $P(\text{pewne})$?'
WHERE exam_type = '8_klasa'
  AND category = 'kombinatoryka'
  AND topic = 'prawdopodobienstwo';
