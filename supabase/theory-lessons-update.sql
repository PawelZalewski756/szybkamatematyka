-- Wygenerowano: npm run seed:theory-sql
-- Uruchom w Supabase SQL Editor (Dashboard → SQL).
-- Aktualizuje title + content dla 25 tematów CKE.

UPDATE public.materials SET
  title = 'Potęgowanie i pierwiastkowanie - klucz do sukcesu na maturze',
  content = '## Na egzaminie
Potęgi i pierwiastki pojawiają się na maturze podstawowej dość często, zazwyczaj w zadaniach otwartych (gdzie liczą się punkty za obliczenia) i zamkniętych (kilka pytań sprawdzających znajomość wzorów). CKE lubi sprawdzać umiejętność stosowania wzorów skróconego mnożenia w połączeniu z potęgami, a także sprowadzanie wyrażeń do prostszej postaci, co jest niezbędne w dalszych etapach rozwiązywania zadań. Typowo zadania te są warte 1-3 punkty, zależnie od stopnia skomplikowania.

## Mapa tematu
1.  **Zrozumienie podstaw potęgowania**: definicja potęgi o wykładniku naturalnym, całkowitym, wymiernym.
2.  **Wzory na działania na potęgach**: mnożenie, dzielenie, potęgowanie potęgi, potęgowanie iloczynu/ilorazu.
3.  **Obliczanie wartości potęg**: przykłady z różnymi wykładnikami i podstawami.
4.  **Zastosowanie potęg w wyrażeniach algebraicznych**: upraszczanie wyrażeń.
5.  **Zrozumienie pojęcia pierwiastkowania**: definicja pierwiastka kwadratowego i n-tego stopnia.
6.  **Wzory na działania na pierwiastkach**: mnożenie, dzielenie, potęgowanie pierwiastka, wyłączanie czynnika spod pierwiastka.
7.  **Obliczanie wartości pierwiastków**: przykłady z różnymi liczbami podpierwiastkowymi.
8.  **Łączenie potęg i pierwiastków**: przykłady zadań maturalnych z obu zagadnień.

## Definicje i wzory
*   **Potęgowanie**:
    *   Dla $n \in \mathbb{N}, n \ge 1$, potęgą liczby $a$ o wykładniku naturalnym $n$ nazywamy iloczyn $n$ czynników równych $a$:
        $$ a^n = \underbrace{a \cdot a \cdot \ldots \cdot a}_{n \text{ razy}} $$
        Przykład: $2^3 = 2 \cdot 2 \cdot 2 = 8$.
    *   Potęga zerowa: Dla $a \neq 0$, $a^0 = 1$. Przykład: $5^0 = 1$, $(-3)^0 = 1$.
    *   Potęga o wykładniku ujemnym: Dla $a \neq 0$ i $n \in \mathbb{N}, n \ge 1$, potęgą liczby $a$ o wykładniku całkowitym ujemnym $-n$ nazywamy:
        $$ a^{-n} = \frac{1}{a^n} $$
        Przykład: $2^{-3} = \frac{1}{2^3} = \frac{1}{8}$.
    *   Potęga o wykładniku wymiernym: Dla $a \ge 0$ i $n \in \mathbb{N}, n \ge 1$, $k \in \mathbb{Z}$:
        $$ a^{\frac{m}{n}} = \sqrt[n]{a^m} = (\sqrt[n]{a})^m $$
        Przykład: $8^{\frac{2}{3}} = \sqrt[3]{8^2} = \sqrt[3]{64} = 4$.

*   **Wzory na działania na potęgach (dla $a, b > 0$ i dowolnych wykładników $m, n$)**:
    *   Mnożenie potęg o tych samych podstawach:
        $$ a^m \cdot a^n = a^{m+n} $$
        Przykład: $x^2 \cdot x^5 = x^{2+5} = x^7$.
    *   Dzielenie potęg o tych samych podstawach:
        $$ \frac{a^m}{a^n} = a^{m-n} $$
        Przykład: $\frac{y^8}{y^3} = y^{8-3} = y^5$.
    *   Potęgowanie potęgi:
        $$ (a^m)^n = a^{m \cdot n} $$
        Przykład: $(b^4)^2 = b^{4 \cdot 2} = b^8$.
    *   Potęgowanie iloczynu:
        $$ (a \cdot b)^n = a^n \cdot b^n $$
        Przykład: $(2x)^3 = 2^3 \cdot x^3 = 8x^3$.
    *   Potęgowanie ilorazu:
        $$ \left(\frac{a}{b}\right)^n = \frac{a^n}{b^n} $$
        Przykład: $\left(\frac{x}{y}\right)^2 = \frac{x^2}{y^2}$.
    *   Ujemny wykładnik:
        $$ a^{-n} = \frac{1}{a^n} \quad \text{oraz} \quad \left(\frac{a}{b}\right)^{-n} = \left(\frac{b}{a}\right)^n $$
        Przykład: $3^{-2} = \frac{1}{3^2} = \frac{1}{9}$.

*   **Pierwiastkowanie**:
    *   Pierwiastkiem kwadratowym nieujemnej liczby $a$ nazywamy nieujemną liczbę $b$, której kwadrat jest równy $a$. Oznaczamy: $\sqrt{a} = b \iff b^2 = a$ i $b \ge 0$.
        Przykład: $\sqrt{9} = 3$, bo $3^2 = 9$ i $3 \ge 0$.
    *   Pierwiastkiem $n$-tego stopnia nieujemnej liczby $a$ nazywamy nieujemną liczbę $b$, której $n$-ta potęga jest równa $a$. Oznaczamy: $\sqrt[n]{a} = b \iff b^n = a$ i $b \ge 0$. (Dla $n$ parzystych, $a \ge 0$. Dla $n$ nieparzystych, $a$ może być dowolną liczbą rzeczywistą).
        Przykład: $\sqrt[3]{8} = 2$, bo $2^3 = 8$. $\sqrt[3]{-27} = -3$, bo $(-3)^3 = -27$.
    *   Związek z potęgami: $\sqrt[n]{a} = a^{\frac{1}{n}}$ dla $a \ge 0$ (lub $a \in \mathbb{R}$ gdy $n$ jest nieparzyste).
        Przykład: $\sqrt{5} = 5^{\frac{1}{2}}$. $\sqrt[3]{7} = 7^{\frac{1}{3}}$.

*   **Wzory na działania na pierwiastkach (dla $a, b \ge 0$ i $n, m \in \mathbb{N}, n, m \ge 2$)**:
    *   Mnożenie pierwiastków tego samego stopnia:
        $$ \sqrt[n]{a} \cdot \sqrt[n]{b} = \sqrt[n]{a \cdot b} $$
        Przykład: $\sqrt{2} \cdot \sqrt{8} = \sqrt{2 \cdot 8} = \sqrt{16} = 4$.
    *   Dzielenie pierwiastków tego samego stopnia:
        $$ \frac{\sqrt[n]{a}}{\sqrt[n]{b}} = \sqrt[n]{\frac{a}{b}} \quad (b \neq 0) $$
        Przykład: $\frac{\sqrt{18}}{\sqrt{2}} = \sqrt{\frac{18}{2}} = \sqrt{9} = 3$.
    *   Pierwiastek z pierwiastka:
        $$ \sqrt[m]{\sqrt[n]{a}} = \sqrt[m \cdot n]{a} $$
        Przykład: $\sqrt[3]{\sqrt{2}} = \sqrt[3 \cdot 2]{2} = \sqrt[6]{2}$.
    *   Potęgowanie pierwiastka:
        $$ (\sqrt[n]{a})^m = \sqrt[n]{a^m} $$
        Przykład: $(\sqrt[3]{5})^2 = \sqrt[3]{5^2} = \sqrt[3]{25}$.
    *   Wyłączanie czynnika spod pierwiastka: Jeżeli $a = k^n \cdot l$, to $\sqrt[n]{a} = \sqrt[n]{k^n \cdot l} = k \sqrt[n]{l}$.
        Przykład: $\sqrt{18} = \sqrt{9 \cdot 2} = \sqrt{3^2 \cdot 2} = 3\sqrt{2}$.
    *   Wprowadzanie czynnika pod pierwiastek: $k \sqrt[n]{l} = \sqrt[n]{k^n \cdot l}$ (przy założeniu $k \ge 0$ gdy $n$ jest parzyste).
        Przykład: $2\sqrt{3} = \sqrt{2^2 \cdot 3} = \sqrt{4 \cdot 3} = \sqrt{12}$.

## Przykład 1 — podstawowy
Uprość wyrażenie: $3^5 \cdot 3^{-2} \cdot (3^4)^0$.

**Krok 1.** Zastosuj wzór na mnożenie potęg o tych samych podstawach: $a^m \cdot a^n = a^{m+n}$.
Pierwsze dwa czynniki: $3^5 \cdot 3^{-2} = 3^{5 + (-2)} = 3^{5-2} = 3^3$.

**Krok 2.** Oblicz wartość potęgi zerowej. Pamiętaj, że $a^0 = 1$ dla $a \neq 0$.
Trzeci czynnik: $(3^4)^0$. Podstawa $3^4 = 81 \neq 0$, więc $(3^4)^0 = 1$.

**Krok 3.** Pomnóż wyniki z poprzednich kroków.
Wyrażenie przyjmuje postać: $3^3 \cdot 1$.

**Krok 4.** Oblicz końcową wartość.
$3^3 \cdot 1 = 27 \cdot 1 = 27$.

**Sprawdzenie:**
$3^5 \cdot 3^{-2} \cdot (3^4)^0 = 243 \cdot \frac{1}{9} \cdot 1 = \frac{243}{9} = 27$. Wynik jest poprawny.

## Przykład 2 — maturalny
Oblicz wartość wyrażenia: $\frac{\sqrt{72} - \sqrt{50}}{\sqrt{2}}$.

**Krok 1.** Uprość licznik, wyłączając czynniki spod pierwiastków.
Znajdź największy kwadrat liczby, który jest dzielnikiem 72 i 50.
Dla 72: $72 = 36 \cdot 2 = 6^2 \cdot 2$. Zatem $\sqrt{72} = \sqrt{6^2 \cdot 2} = 6\sqrt{2}$.
Dla 50: $50 = 25 \cdot 2 = 5^2 \cdot 2$. Zatem $\sqrt{50} = \sqrt{5^2 \cdot 2} = 5\sqrt{2}$.

**Krok 2.** Podstaw uproszczone pierwiastki do licznika.
$\sqrt{72} - \sqrt{50} = 6\sqrt{2} - 5\sqrt{2}$.

**Krok 3.** Zredukuj wyrazy podobne w liczniku.
$6\sqrt{2} - 5\sqrt{2} = (6-5)\sqrt{2} = 1\sqrt{2} = \sqrt{2}$.

**Krok 4.** Podstaw wynik licznika z powrotem do całego wyrażenia.
Wyrażenie ma teraz postać: $\frac{\sqrt{2}}{\sqrt{2}}$.

**Krok 5.** Oblicz końcową wartość.
$\frac{\sqrt{2}}{\sqrt{2}} = 1$.

**Sprawdzenie:**
Alternatywnie, możemy podzielić każdy wyraz licznika przez mianownik:
$\frac{\sqrt{72} - \sqrt{50}}{\sqrt{2}} = \frac{\sqrt{72}}{\sqrt{2}} - \frac{\sqrt{50}}{\sqrt{2}} = \sqrt{\frac{72}{2}} - \sqrt{\frac{50}{2}} = \sqrt{36} - \sqrt{25} = 6 - 5 = 1$. Wynik jest poprawny.

## Przykład 3 — egzaminacyjny
Wyrażenie $2 \cdot (\sqrt{3})^{-2} + 4 \cdot 3^{-1}$ jest równe:
A. $2$
B. $2\frac{1}{3}$
C. $3$
D. $2\frac{2}{3}$

**Krok 1.** Oblicz pierwszy składnik: $2 \cdot (\sqrt{3})^{-2}$.
Użyj wzoru $a^{-n} = \frac{1}{a^n}$: $(\sqrt{3})^{-2} = \frac{1}{(\sqrt{3})^2}$.
Ponieważ $(\sqrt{3})^2 = 3$, mamy $\frac{1}{3}$.
Pierwszy składnik to $2 \cdot \frac{1}{3} = \frac{2}{3}$.

**Krok 2.** Oblicz drugi składnik: $4 \cdot 3^{-1}$.
Użyj wzoru $a^{-n} = \frac{1}{a^n}$: $3^{-1} = \frac{1}{3}$.
Drugi składnik to $4 \cdot \frac{1}{3} = \frac{4}{3}$.

**Krok 3.** Dodaj oba składniki.
$\frac{2}{3} + \frac{4}{3} = \frac{2+4}{3} = \frac{6}{3} = 2$.

**Krok 4.** Porównaj wynik z opcjami.
Wynik 2 odpowiada opcji A.

**Sprawdzenie:**
Wyrażenie wynosi $2 \cdot \frac{1}{3} + 4 \cdot \frac{1}{3} = \frac{2}{3} + \frac{4}{3} = \frac{6}{3} = 2$. Wynik jest poprawny.

## Pułapki
*   **Kolejność działań przy potęgach**: Pamiętaj o pierwszeństwie potęgowania przed mnożeniem/dzieleniem, ale w nawiasach działania wykonujemy zgodnie z zasadami. Szczególnie uważaj na potęgę o wykładniku ujemnym: $-a^n$ to -(a^n), a $(-a)^n$ to potęga liczby ujemnej. Np. $-2^4 = -16$, ale $(-2)^4 = 16$.
*   **Potęga zerowa i ujemna podstawa**: $0^0$ jest nieokreślone. $a^0 = 1$ tylko dla $a \neq 0$. Ułamki z ujemnym wykładnikiem: $\left(\frac{a}{b}\right)^{-n} = \left(\frac{b}{a}\right)^n$. Np. $(\frac{2}{3})^{-2} = (\frac{3}{2})^2 = \frac{9}{4}$.
*   **Wzory na potęgi i pierwiastki**: Mylenie wzorów typu $(a+b)^n \neq a^n + b^n$ lub $\sqrt{a+b} \neq \sqrt{a} + \sqrt{b}$. Stosuj tylko poprawne wzory algebraiczne.
*   **Znaki pod pierwiastkiem**: Pamiętaj, że pierwiastek kwadratowy (parzystego stopnia) jest zdefiniowany tylko dla liczb nieujemnych. $\sqrt{-4}$ nie jest liczbą rzeczywistą. Pierwiastek sześcienny (nieparzystego stopnia) jest zdefiniowany dla liczb ujemnych, np. $\sqrt[3]{-8} = -2$.
*   **Upraszczanie pierwiastków**: Przy wyłączaniu czynnika spod pierwiastka szukaj kwadratów (lub sześcianów, itd.) liczb. Np. $\sqrt{72} = \sqrt{36 \cdot 2} = 6\sqrt{2}$, a nie $\sqrt{9 \cdot 8} = 3\sqrt{8}$, chyba że $\sqrt{8}$ można dalej uprościć.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz wartość wyrażenia: $5^2 \cdot 5^{-1} - \frac{1}{25}$.
2.  Uprość wyrażenie: $(a^3)^2 \cdot a^{-4}$ dla $a \neq 0$.
3.  Oblicz: $\sqrt{50} + \sqrt{32} - \sqrt{18}$.
4.  Wykaż, że równość $\sqrt[3]{16} \cdot \sqrt[3]{4} = 4$ jest prawdziwa.
5.  Oblicz wartość wyrażenia: $27^{\frac{2}{3}} - 16^{\frac{1}{2}}$.
6.  Uprość wyrażenie: $\frac{x^5 \cdot x^{-2}}{x^3}$ dla $x > 0$.
7.  Oblicz: $(\frac{2}{3})^{-2} + (\frac{1}{2})^3$.

## Odpowiedzi
1.  $5^2 \cdot 5^{-1} - \frac{1}{25} = 25 \cdot \frac{1}{5} - \frac{1}{25} = 5 - \frac{1}{25} = \frac{125-1}{25} = \frac{124}{25} = 4\frac{24}{25}$.
2.  $(a^3)^2 \cdot a^{-4} = a^{3 \cdot 2} \cdot a^{-4} = a^6 \cdot a^{-4} = a^{6-4} = a^2$.
3.  $\sqrt{50} + \sqrt{32} - \sqrt{18} = \sqrt{25 \cdot 2} + \sqrt{16 \cdot 2} - \sqrt{9 \cdot 2} = 5\sqrt{2} + 4\sqrt{2} - 3\sqrt{2} = (5+4-3)\sqrt{2} = 6\sqrt{2}$.
4.  $\sqrt[3]{16} \cdot \sqrt[3]{4} = \sqrt[3]{16 \cdot 4} = \sqrt[3]{64}$. Ponieważ $4^3 = 64$, to $\sqrt[3]{64} = 4$. Równość jest prawdziwa.
5.  $27^{\frac{2}{3}} - 16^{\frac{1}{2}} = (\sqrt[3]{27})^2 - \sqrt{16} = 3^2 - 4 = 9 - 4 = 5$.
6.  $\frac{x^5 \cdot x^{-2}}{x^3} = \frac{x^{5-2}}{x^3} = \frac{x^3}{x^3} = 1$.
7.  $(\frac{2}{3})^{-2} + (\frac{1}{2})^3 = (\frac{3}{2})^2 + \frac{1}{8} = \frac{9}{4} + \frac{1}{8} = \frac{18}{8} + \frac{1}{8} = \frac{19}{8} = 2\frac{3}{8}$.

## Szybka powtórka
1.  Ile wynosi $a^0$ dla $a \neq 0$?
2.  Jaki jest wzór na mnożenie potęg o tej samej podstawie?
3.  Jaki jest związek między $\sqrt[n]{a}$ a potęgami?
4.  Czy $(a+b)^2 = a^2 + b^2$?
5.  Jak uprościć $\sqrt{12}$?

## Diagram
```text
       Operacje na POTĘGACH (a, b > 0)
       --------------------------------
       a^m * a^n = a^(m+n)   |  (a*b)^n = a^n * b^n
       a^m / a^n = a^(m-n)   |  (a/b)^n = a^n / b^n
       (a^m)^n = a^(m*n)     |  a^-n = 1/a^n

       Operacje na PIERWIASTKACH (a, b >= 0)
       ------------------------------------
       sqrt[n]{a} * sqrt[n]{b} = sqrt[n]{a*b}  |  (sqrt[n]{a})^m = sqrt[n]{a^m}
       sqrt[n]{a} / sqrt[n]{b} = sqrt[n]{a/b}  |  sqrt[m]{sqrt[n]{a}} = sqrt[m*n]{a}

       Upraszczanie:
       sqrt[n]{k^n * l} = k * sqrt[n]{l}
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'liczby_rzeczywiste'
  AND topic = 'potegi';

UPDATE public.materials SET
  title = 'Logarytmy – definicje, własności i zadania maturalne',
  content = '## Na egzaminie
Logarytmy pojawiają się na maturze z matematyki na poziomie podstawowym dość regularnie, choć nie w każdym arkuszu. Najczęściej występują w zadaniach zamkniętych, a ich rozwiązanie opiera się na znajomości definicji oraz podstawowych własności logarytmów. Zadania te zazwyczaj są punktowane po 1 punkcie, a ich trudność nie jest wysoka, jeśli opanuje się kluczowe wzory i zasady. CKE lubi sprawdzać umiejętność stosowania definicji logarytmu, zamiany postaci logarytmicznej na wykładniczą i odwrotnie, a także wykorzystanie podstawowych własności do upraszczania wyrażeń.

## Mapa tematu
W tej lekcji opanujesz:
1.  Definicję logarytmu i jej interpretację.
2.  Zamianę postaci logarytmicznej na wykładniczą i odwrotnie.
3.  Podstawowe własności logarytmów, w tym: logarytm z jedynki, logarytm z podstawy, potęgę logarytmu.
4.  Twierdzenia o logarytmie iloczynu, ilorazu i potęgi.
5.  Twierdzenie o zamianie podstawy logarytmu.
6.  Obliczanie wartości wyrażeń zawierających logarytmy.
7.  Zastosowanie logarytmów w prostych zadaniach typu maturalnego.
8.  Unikanie typowych błędów przy pracy z logarytmami.

## Definicje i wzory
*   **Definicja logarytmu:** Logarytmem liczby dodatniej $b$ przy dodatniej podstawie $a$ ($a \neq 1$) nazywamy wykładnik $x$, do którego należy podnieść podstawę $a$, aby otrzymać liczbę $b$.
    Zapis: $\log_a b = x \iff a^x = b$, gdzie $a > 0$, $a \neq 1$ oraz $b > 0$.

*   **Warunki istnienia logarytmu:**
    *   Podstawa logarytmu $a$ musi być liczbą dodatnią i różną od 1 ($a > 0$ i $a \neq 1$).
    *   Liczba logarytmowana $b$ musi być liczbą dodatnią ($b > 0$).

*   **Zamiana postaci:**
    *   Z postaci logarytmicznej na wykładniczą: $\log_a b = x \iff a^x = b$
    *   Z postaci wykładniczej na logarytmiczną: $a^x = b \iff \log_a b = x$

*   **Podstawowe własności:**
    *   $\log_a 1 = 0$, ponieważ $a^0 = 1$ dla dowolnego $a > 0, a \neq 1$.
    *   $\log_a a = 1$, ponieważ $a^1 = a$ dla dowolnego $a > 0, a \neq 1$.
    *   $\log_a a^k = k$, ponieważ $a^k = a^k$.

*   **Twierdzenia o logarytmach:** Dla $a > 0, a \neq 1$, $x > 0$, $y > 0$:
    *   **Logarytm iloczynu:** $\log_a (x \cdot y) = \log_a x + \log_a y$
    *   **Logarytm ilorazu:** $\log_a \frac{x}{y} = \log_a x - \log_a y$
    *   **Logarytm potęgi:** $\log_a x^k = k \cdot \log_a x$, gdzie $k$ jest dowolną liczbą rzeczywistą.

*   **Wzór na zamianę podstawy:** Dla $a > 0, a \neq 1$, $b > 0$, $c > 0, c \neq 1$:
    $$ \log_a b = \frac{\log_c b}{\log_c a} $$
    Najczęściej stosowany wariant to zamiana na logarytm naturalny ($\ln$) lub dziesiętny ($\log$, bez zapisu podstawy).
    *   $\log_a b = \frac{\ln b}{\ln a}$
    *   $\log_a b = \frac{\log b}{\log a}$

*   **Uwaga:** Logarytmy dziesiętne (o podstawie 10) często zapisujemy jako $\log x$ (bez podstawy). Logarytmy naturalne (o podstawie $e$, gdzie $e \approx 2.718$) zapisujemy jako $\ln x$.

## Przykład 1 — podstawowy
Oblicz wartość wyrażenia $\log_2 16$.

**Krok 1.** Zapisujemy wyrażenie: $\log_2 16$.
**Krok 2.** Stosujemy definicję logarytmu: szukamy takiej liczby $x$, dla której $2^x = 16$.
**Krok 3.** Rozkładamy liczbę 16 na czynniki lub szukamy potęgi liczby 2, która daje 16. Wiemy, że $2^1 = 2$, $2^2 = 4$, $2^3 = 8$, $2^4 = 16$.
**Krok 4.** Znaleźliśmy wykładnik: $x=4$. Zatem $2^4 = 16$.
**Krok 5.** Zgodnie z definicją, $\log_2 16 = 4$.

**Sprawdzenie:** Czy $2^4 = 16$? Tak, $2 \cdot 2 \cdot 2 \cdot 2 = 16$. Wynik jest poprawny.

## Przykład 2 — maturalny
Oblicz wartość wyrażenia $\log_3 54 - \log_3 2$.

**Krok 1.** Analizujemy wyrażenie. Widzimy logarytmy o tej samej podstawie (3) i znak odejmowania. Przypominamy sobie twierdzenie o logarytmie ilorazu: $\log_a x - \log_a y = \log_a \frac{x}{y}$.
**Krok 2.** Stosujemy twierdzenie. W tym przypadku $a=3$, $x=54$, $y=2$.
$$ \log_3 54 - \log_3 2 = \log_3 \frac{54}{2} $$
**Krok 3.** Wykonujemy dzielenie w liczbie logarytmowanej: $\frac{54}{2} = 27$.
$$ \log_3 \frac{54}{2} = \log_3 27 $$
**Krok 4.** Obliczamy wartość otrzymanego logarytmu. Szukamy liczby $x$ takiej, że $3^x = 27$.
**Krok 5.** Wiemy, że $3^1 = 3$, $3^2 = 9$, $3^3 = 27$. Zatem $x=3$.
$$ \log_3 27 = 3 $$
Ostateczna wartość wyrażenia to 3.

**Sprawdzenie:**
Możemy też sprawdzić, czy $\log_3 54 = \log_3 (27 \cdot 2) = \log_3 27 + \log_3 2 = 3 + \log_3 2$.
Wtedy $\log_3 54 - \log_3 2 = (3 + \log_3 2) - \log_3 2 = 3$. Wynik jest poprawny.

## Przykład 3 — egzaminacyjny
Oblicz wartość wyrażenia: $\frac{\log_5 125}{\log_5 5}$

**Krok 1.** Rozpoznajemy zadanie jako wymagające obliczenia wartości logarytmów lub zastosowania twierdzenia o zamianie podstawy.
**Krok 2.** Obliczamy licznik: $\log_5 125$. Szukamy $x$ takiego, że $5^x = 125$. Ponieważ $5^3 = 125$, to $\log_5 125 = 3$.
**Krok 3.** Obliczamy mianownik: $\log_5 5$. Korzystając z własności $\log_a a = 1$, otrzymujemy $\log_5 5 = 1$.
**Krok 4.** Podstawiamy obliczone wartości do wyrażenia:
$$ \frac{\log_5 125}{\log_5 5} = \frac{3}{1} $$
**Krok 5.** Obliczamy wynik: $\frac{3}{1} = 3$.

**Alternatywne rozwiązanie (zamiana podstawy):**
Zauważmy, że mianownik jest logarytmem o podstawie 5, a licznik jest również logarytmem o podstawie 5. Możemy potraktować to jako zastosowanie wzoru na zamianę podstawy w odwrotnej kolejności: $\frac{\log_c b}{\log_c a} = \log_a b$.
W tym przypadku $c=5$, $b=125$, $a=5$. Otrzymujemy:
$$ \frac{\log_5 125}{\log_5 5} = \log_5 125 $$
Następnie obliczamy $\log_5 125 = 3$, ponieważ $5^3 = 125$. Wynik jest ten sam.

## Pułapki
*   **Niespełnione warunki:** Uczniowie często zapominają o warunkach istnienia logarytmu ($a>0, a \neq 1, b>0$). Może to prowadzić do błędnych obliczeń lub prób obliczenia logarytmów z liczb ujemnych lub zer, bądź o niedozwolonej podstawie. Zawsze sprawdzaj warunki na początku.
*   **Mylenie twierdzeń:** Częstym błędem jest stosowanie twierdzenia o logarytmie iloczynu do sumy lub różnicy: $\log_a (x+y) \neq \log_a x + \log_a y$ ani $\log_a (x-y) \neq \log_a x - \log_a y$. Pamiętaj: suma logarytmów to logarytm iloczynu, różnica logarytmów to logarytm ilorazu.
*   **Złe zastosowanie potęgi:** Własność $\log_a x^k = k \cdot \log_a x$ jest często mylona, np. zapisywana jako $\log_a x^k = (\log_a x)^k$. Pamiętaj, że wykładnik "wychodzi" przed logarytm jako mnożenie, a nie potęgowanie.
*   **Logarytmy o tej samej podstawie:** Twierdzenia o iloczynie, ilorazie i potędze można stosować tylko do logarytmów o **tej samej podstawie**. Jeśli podstawy są różne, trzeba je najpierw ujednolicić, np. za pomocą wzoru na zamianę podstawy.
*   **Brak rozróżnienia $\log$ i $\ln$:** Chociaż na maturze podstawowej zazwyczaj podaje się podstawę, warto pamiętać, że $\log$ bez podstawy to $\log_{10}$, a $\ln$ to $\log_e$. Ich wartości są różne.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz wartość wyrażenia: $\log_3 81$.
2.  Oblicz wartość wyrażenia: $\log_5 0.04$.
3.  Oblicz wartość wyrażenia: $2 \cdot \log_4 2$.
4.  Oblicz wartość wyrażenia: $\log_2 5 + \log_2 0.8$.
5.  Uprość wyrażenie: $\log_6 3 + \log_6 12$.
6.  Uprość wyrażenie: $2 \cdot \log 7 - \log 49$.
7.  Zapisz liczbę 5 jako logarytm o podstawie 3, tzn. znajdź $x$ takie, że $\log_3 x = 5$.

## Odpowiedzi
1.  $\log_3 81 = 4$, ponieważ $3^4 = 81$.
2.  $\log_5 0.04 = \log_5 \frac{4}{100} = \log_5 \frac{1}{25} = \log_5 5^{-2} = -2$.
3.  $2 \cdot \log_4 2$. Wiemy, że $4^{1/2} = \sqrt{4} = 2$, więc $\log_4 2 = \frac{1}{2}$. Wtedy $2 \cdot \frac{1}{2} = 1$.
4.  $\log_2 5 + \log_2 0.8 = \log_2 (5 \cdot 0.8) = \log_2 4 = 2$.
5.  $\log_6 3 + \log_6 12 = \log_6 (3 \cdot 12) = \log_6 36 = 2$.
6.  $2 \cdot \log 7 - \log 49 = \log 7^2 - \log 49 = \log 49 - \log 49 = 0$.
7.  Chcemy znaleźć $x$ takie, że $\log_3 x = 5$. Z definicji logarytmu $3^5 = x$. $3^5 = 3 \cdot 3 \cdot 3 \cdot 3 \cdot 3 = 9 \cdot 9 \cdot 3 = 81 \cdot 3 = 243$. Zatem $x = 243$.

## Szybka powtórka
1.  Jaka jest definicja logarytmu $\log_a b = x$?
2.  Jakie warunki musi spełniać podstawa $a$ logarytmu?
3.  Jaka jest wartość $\log_7 1$?
4.  Jak zapisać sumę dwóch logarytmów o tej samej podstawie jako pojedynczy logarytm?
5.  Jaki jest wzór na logarytm potęgi $\log_a x^k$?

## Diagram
Logarytm $\log_a b = x$
definiuje się przez
równanie wykładnicze $a^x = b$.

Warunki:
$a > 0$
$a \neq 1$
$b > 0$

Przykład: $\log_2 8 = 3 \iff 2^3 = 8$.'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'liczby_rzeczywiste'
  AND topic = 'logarytmy';

UPDATE public.materials SET
  title = 'Procenty i proporcje',
  content = '## Na egzaminie
Zadania z procentów i proporcji pojawiają się na maturze podstawowej praktycznie co roku. Mogą występować w formie zadań zamkniętych (testowych) lub otwartych. Zazwyczaj są to zadania o prostej lub średniej trudności, a ich prawidłowe rozwiązanie może przynieść od 1 do nawet 4 punktów. Egzaminatorzy często sprawdzają umiejętność stosowania procentu składanego, obliczania podwyżek i obniżek cen, a także rozwiązywania problemów z wykorzystaniem proporcji prostych i odwrotnie proporcjonalnych.

## Mapa tematu
1.  Zrozumienie pojęcia procentu i sposoby jego zapisu.
2.  Obliczanie procentu danej liczby.
3.  Obliczanie, jakim procentem jednej liczby jest druga liczba.
4.  Obliczanie liczby, gdy dany jest jej procent.
5.  Obliczanie podwyżek i obniżek cen.
6.  Zastosowanie procentu składanego.
7.  Rozwiązywanie zadań z zastosowaniem proporcji prostych.
8.  Rozwiązywanie zadań z zastosowaniem proporcji odwrotnie proporcjonalnych.

## Definicje i wzory
*   **Procent:** Jeden procent (1%) to jedna setna ( $\frac{1}{100}$ ) danej wielkości.
*   **Zapis procentowy:** $p\% = \frac{p}{100}$. Na przykład, $25\% = \frac{25}{100} = 0.25$.
*   **Obliczanie procentu danej liczby:** Aby obliczyć $p\%$ danej liczby $L$, mnożymy liczbę $L$ przez $\frac{p}{100}$:
    $$ \text{Wynik} = L \cdot \frac{p}{100} $$
*   **Obliczanie, jakim procentem jednej liczby jest druga liczba:** Aby obliczyć, jakim procentem liczby $L_1$ jest liczba $L_2$, obliczamy ułamek $\frac{L_2}{L_1}$ i mnożymy przez 100%:
    $$ \text{Procent} = \frac{L_2}{L_1} \cdot 100\% $$
*   **Obliczanie liczby, gdy dany jest jej procent:** Jeśli $p\%$ danej liczby $L$ jest równe $W$, to możemy zapisać równanie:
    $$ L \cdot \frac{p}{100} = W $$
    Aby obliczyć $L$, przekształcamy równanie:
    $$ L = W : \frac{p}{100} = W \cdot \frac{100}{p} $$
*   **Podwyżka o $p\%$:** Nowa cena $C_{nowa}$ po podwyżce ceny $C_{stara}$ o $p\%$ wynosi:
    $$ C_{nowa} = C_{stara} + C_{stara} \cdot \frac{p}{100} = C_{stara} \left( 1 + \frac{p}{100} \right) $$
*   **Obniżka o $p\%$:** Nowa cena $C_{nowa}$ po obniżce ceny $C_{stara}$ o $p\%$ wynosi:
    $$ C_{nowa} = C_{stara} - C_{stara} \cdot \frac{p}{100} = C_{stara} \left( 1 - \frac{p}{100} \right) $$
*   **Procent składany:** Po $n$ okresach, w których następuje kapitalizacja odsetek (lub zmiana procentowa) na poziomie $p\%$ na okres, kwota początkowa $K_0$ wzrośnie do kwoty $K_n$ danej wzorem:
    $$ K_n = K_0 \left( 1 + \frac{p}{100} \right)^n $$
    Jest to rzadziej spotykane na maturze podstawowej, ale warto znać podstawy.
*   **Proporcja prosta:** Dwie wielkości są proporcjonalne prosto, jeśli wzrostowi jednej towarzyszy proporcjonalny wzrost drugiej (lub spadkowi jednej towarzyszy proporcjonalny spadek drugiej). Jeśli $a$ odpowiada $c$, a $b$ odpowiada $d$, to:
    $$ \frac{a}{b} = \frac{c}{d} $$
    lub inaczej:
    $$ \frac{a}{c} = \frac{b}{d} $$
*   **Proporcja odwrotnie proporcjonalna:** Dwie wielkości są proporcjonalne odwrotnie, jeśli wzrostowi jednej towarzyszy proporcjonalny spadek drugiej (i odwrotnie). Jeśli $a$ odpowiada $c$, a $b$ odpowiada $d$, to:
    $$ a \cdot c = b \cdot d $$
    lub inaczej:
    $$ \frac{a}{b} = \frac{d}{c} $$

## Przykład 1 — podstawowy
Oblicz $15\%$ liczby $240$.

**Krok 1.** Zapisujemy procent w postaci ułamka dziesiętnego lub zwykłego.
$15\% = \frac{15}{100} = 0.15$.

**Krok 2.** Mnożymy liczbę przez obliczony ułamek.
Wynik $= 240 \cdot 0.15$.

**Krok 3.** Wykonujemy mnożenie.
$240 \cdot 0.15 = 240 \cdot \frac{15}{100} = \frac{240 \cdot 15}{100} = \frac{3600}{100} = 36$.
Alternatywnie:
$240 \cdot 0.15 = 24 \cdot 1.5 = 24 + 12 = 36$.

**Sprawdzenie:**
$10\%$ z $240$ to $24$.
$5\%$ z $240$ to połowa z $10\%$, czyli $12$.
$15\% = 10\% + 5\%$, więc $24 + 12 = 36$. Wynik jest poprawny.

## Przykład 2 — maturalny
Cena roweru wynosiła $1200$ zł. Najpierw cenę tę podwyższono o $10\%$, a następnie nową cenę obniżono o $20\%$. Jaka jest ostateczna cena roweru?

**Krok 1.** Obliczamy cenę po pierwszej podwyżce o $10\%$.
Wzór na podwyżkę: $C_{nowa} = C_{stara} \left( 1 + \frac{p}{100} \right)$.
$C_1 = 1200 \cdot \left( 1 + \frac{10}{100} \right) = 1200 \cdot \left( 1 + 0.10 \right) = 1200 \cdot 1.10$.

**Krok 2.** Wykonujemy mnożenie.
$C_1 = 1200 \cdot 1.10 = 1320$ zł.

**Krok 3.** Obliczamy nową cenę po obniżce o $20\%$. Teraz bazujemy na cenie $C_1 = 1320$ zł.
Wzór na obniżkę: $C_{nowa} = C_{stara} \left( 1 - \frac{p}{100} \right)$.
$C_2 = 1320 \cdot \left( 1 - \frac{20}{100} \right) = 1320 \cdot \left( 1 - 0.20 \right) = 1320 \cdot 0.80$.

**Krok 4.** Wykonujemy mnożenie.
$C_2 = 1320 \cdot 0.80 = 132 \cdot 8 = 1056$ zł.

**Sprawdzenie:**
Podwyżka o $10\%$: $1200 + 0.10 \cdot 1200 = 1200 + 120 = 1320$.
Obniżka o $20\%$ od $1320$: $1320 - 0.20 \cdot 1320 = 1320 - 264 = 1056$. Wynik jest poprawny.

## Przykład 3 — egzaminacyjny

W klasie liczącej $25$ uczniów, $40\%$ to dziewczęta. Ilu chłopców jest w tej klasie?

**Krok 1.** Obliczamy liczbę dziewcząt.
Liczba dziewcząt $= 25 \cdot 40\% = 25 \cdot \frac{40}{100} = 25 \cdot 0.4$.

**Krok 2.** Wykonujemy mnożenie.
$25 \cdot 0.4 = 10$. W klasie jest $10$ dziewcząt.

**Krok 3.** Obliczamy liczbę chłopców.
Liczba chłopców = Całkowita liczba uczniów - Liczba dziewcząt.
Liczba chłopców $= 25 - 10 = 15$.

**Alternatywne rozwiązanie (proporcja):**
Jeśli $40\%$ to dziewczęta, to $100\% - 40\% = 60\%$ to chłopcy.
Liczba chłopców $= 25 \cdot 60\% = 25 \cdot \frac{60}{100} = 25 \cdot 0.6$.
$25 \cdot 0.6 = 15$.

**Sprawdzenie:**
$10$ dziewcząt i $15$ chłopców daje $10+15=25$ uczniów.
$\frac{10}{25} = \frac{2}{5} = 0.4 = 40\%$ (dziewczęta).
$\frac{15}{25} = \frac{3}{5} = 0.6 = 60\%$ (chłopcy). Wynik jest poprawny.

## Pułapki
*   **Obliczanie procentu z pierwotnej ceny po podwyżce/obniżce:** W zadaniach typu "podwyżka, potem obniżka" (lub odwrotnie) pamiętaj, że kolejna zmiana procentowa jest liczona od *aktualnej* ceny (po poprzedniej zmianie), a nie od ceny początkowej. Przykład 2 ilustruje ten błąd. Obniżenie ceny o $20\%$ od pierwotnej kwoty ($1200 \cdot 0.20 = 240$) zamiast od kwoty po podwyżce ($1320 \cdot 0.20 = 264$) prowadzi do błędnego wyniku.
*   **Mylenie proporcji prostej z odwrotnie proporcjonalną:** Zawsze zastanów się, czy wielkości rosną lub maleją razem (prosta proporcja), czy też gdy jedna rośnie, druga maleje (odwrotna proporcja).
*   **Błędy rachunkowe:** Długie obliczenia, zwłaszcza z ułamkami dziesiętnymi i liczbami z wieloma zerami, są podatne na błędy. Warto sprawdzać obliczenia lub stosować alternatywne metody (jak w Przykładzie 1 i 3).
*   **Nieprawidłowe przekształcanie wzorów:** Przy obliczaniu liczby, gdy znamy jej procent, łatwo popełnić błąd dzieląc zamiast mnożyć lub odwrotnie. Wzór $L = W \cdot \frac{100}{p}$ jest kluczowy. Upewnij się, że mnożysz przez $\frac{100}{p}$, a nie przez $\frac{p}{100}$.
*   **Zbyt szybkie zaokrąglanie:** Jeśli zadanie nie wymaga zaokrąglenia, staraj się pracować na dokładnych ułamkach lub liczbach. Zaokrąglanie wyników pośrednich może prowadzić do znaczących błędów w końcowym rezultacie.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz $35\%$ liczby $150$.
2.  Znajdź liczbę, której $20\%$ wynosi $45$.
3.  Cena telewizora wynosiła $2500$ zł. Obniżono ją o $15\%$. Jaka jest nowa cena?
4.  Pewna liczba po zwiększeniu o $25\%$ wynosi $200$. Jaka była liczba pierwotna?
5.  W sklepie sportowym jest $60$ par butów. $30\%$ z nich to buty do biegania. Pozostałe to buty piłkarskie. Ile par butów piłkarskich jest w sklepie?
6.  Pociąg miał przejechać trasę $300$ km w $5$ godzin. Po godzinie jazdy okazało się, że prędkość należy zmniejszyć o $10\%$. Po zmianie prędkości, ile czasu zajmie pociągowi pokonanie reszty trasy?
7.  Pan Janek wpłacił $5000$ zł na lokatę bankową oprocentowaną na $3\%$ w skali roku. Po ilu latach (przy kapitalizacji rocznej) stan jego konta przekroczy $5400$ zł?

## Odpowiedzi
1.  $150 \cdot 0.35 = 52.5$.
2.  $L \cdot 0.20 = 45 \implies L = \frac{45}{0.20} = 225$.
3.  $2500 \cdot (1 - 0.15) = 2500 \cdot 0.85 = 2125$ zł.
4.  $L \cdot (1 + 0.25) = 200 \implies L \cdot 1.25 = 200 \implies L = \frac{200}{1.25} = 160$.
5.  Buty piłkarskie to $100\% - 30\% = 70\%$. Liczba par butów piłkarskich $= 60 \cdot 0.70 = 42$.
6.  Prędkość początkowa: $300 \text{ km} / 5 \text{ h} = 60 \text{ km/h}$. Po zmianie prędkość wynosi $60 \cdot (1-0.10) = 60 \cdot 0.9 = 54 \text{ km/h}$. Przejechano $60 \text{ km}$ w pierwszą godzinę. Pozostało $300 - 60 = 240 \text{ km}$. Czas potrzebny na pokonanie reszty trasy: $\frac{240 \text{ km}}{54 \text{ km/h}} = \frac{240}{54} = \frac{40}{9} \approx 4.44$ godziny.
7.  Po 1 roku: $5000(1.03) = 5150$. Po 2 latach: $5150(1.03) \approx 5304.5$. Po 3 latach: $5304.5(1.03) \approx 5463.6$. Stan konta przekroczy $5400$ zł po 3 latach.

## Szybka powtórka
1.  Jak zapisać $5\%$ jako ułamek dziesiętny?
2.  Jak obliczyć $10\%$ danej liczby?
3.  Czym różni się obniżka o $10\%$ od zwiększenia o $10\%$?
4.  Jeśli cena $X$ została podwyższona o $20\%$ i wynosi teraz $120$ zł, to ile wynosiła cena $X$?
5.  Jeśli na trasę $100$ km potrzeba $2$ godzin przy stałej prędkości, ile czasu zajmie pokonanie tej trasy, jeśli prędkość zostanie zmniejszona dwukrotnie?'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'liczby_rzeczywiste'
  AND topic = 'procenty';

UPDATE public.materials SET
  title = 'Wyrażenia algebraiczne i ich przekształcanie',
  content = '## Na egzaminie
Wyrażenia algebraiczne pojawiają się na maturze z matematyki na poziomie podstawowym bardzo często, zarówno w zadaniach zamkniętych, jak i otwartych. Zazwyczaj dotyczą one upraszczania wyrażeń, działań na nich (dodawanie, odejmowanie, mnożenie, dzielenie), lub wykorzystania ich w zadaniach tekstowych i geometrycznych. Poprawne opanowanie tego działu pozwoli zdobyć od kilku do kilkunastu punktów. CKE często sprawdza umiejętność sprowadzenia wyrażenia do najprostszej postaci, a także stosowanie wzorów skróconego mnożenia.

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił:
1. Definiować wyrażenia algebraiczne i rozpoznawać ich elementy (zmienne, stałe, współczynniki).
2. Dodawać i odejmować sumy algebraiczne.
3. Mnożyć sumy algebraiczne przez jednomian i przez sumę algebraiczną.
4. Dzielić sumy algebraiczne przez jednomian.
5. Stosować wzory skróconego mnożenia do przekształcania wyrażeń.
6. Upraszczać złożone wyrażenia algebraiczne.
7. Rozwiązywać proste zadania tekstowe z wykorzystaniem wyrażeń algebraicznych.
8. Rozpoznawać i wykorzystywać podobieństwo wyrazów w wyrażeniach algebraicznych.

## Definicje i wzory
*   **Wyrażenie algebraiczne** to takie, które zawiera liczby, litery (zmienne), symbole działań matematycznych (+, -, $\cdot$, :), nawiasy oraz potęgi.
    *   **Wyraz algebraiczny (monom)**: Jednoelementowe wyrażenie algebraiczne, będące iloczynem liczb i zmiennych podniesionych do pewnych potęg. Np.: $3x$, $-5y^2$, $\frac{1}{2}ab$, $7$.
    *   **Współczynnik**: Liczba stojąca przed zmienną (lub zmiennymi) w wyrazie algebraicznym. Np. we wzorach $3x$, $-5y^2$, $\frac{1}{2}ab$, współczynnikami są odpowiednio $3$, $-5$, $\frac{1}{2}$. W wyrazie $x$ współczynnikiem jest $1$, a w $-y$ jest $-1$.
    *   **Część zmienna**: Litery występujące w wyrazie algebraicznym. Np. w $3x$ częścią zmienną jest $x$, w $-5y^2$ jest $y^2$, w $\frac{1}{2}ab$ jest $ab$.
    *   **Wyraz wolny**: Wyraz algebraiczny, który nie zawiera żadnej zmiennej (jest liczbą). Np. w wyrażeniu $2x + 5$, wyrazem wolnym jest $5$.

*   **Suma algebraiczna**: Wyrażenie algebraiczne będące sumą lub różnicą jednomianów. Np.: $2x + 3y$, $5a - 2b + 7$.
    *   **Wyrazy podobne**: Wyrazy w sumie algebraicznej, które mają tę samą część zmienną (z tymi samymi potęgami). Np. w sumie $3x^2 + 5y - 2x^2 + 7$, wyrazy podobne to $3x^2$ i $-2x^2$.

*   **Działania na wyrażeniach algebraicznych**:
    *   **Dodawanie i odejmowanie**: Możemy dodawać i odejmować tylko wyrazy podobne.
        *   $ax + bx = (a+b)x$
        *   $ax - bx = (a-b)x$
        *   $ax + by + cx + dy = (a+c)x + (b+d)y$
    *   **Mnożenie przez jednomian**: Mnożymy każdy składnik sumy przez ten jednomian.
        *   $a(b+c) = ab + ac$
        *   $a(b-c) = ab - ac$
    *   **Mnożenie sum algebraicznych**: Mnożymy każdy składnik pierwszej sumy przez każdy składnik drugiej sumy.
        *   $(a+b)(c+d) = ac + ad + bc + bd$
    *   **Dzielenie przez jednomian**: Dzielimy każdy składnik sumy przez ten jednomian (jeśli jest to możliwe).
        *   $\frac{a+b}{c} = \frac{a}{c} + \frac{b}{c}$ (gdzie $c \neq 0$)

*   **Wzory skróconego mnożenia** (kluczowe na maturze!):
    *   **Kwadrat sumy**: $(a+b)^2 = a^2 + 2ab + b^2$
    *   **Kwadrat różnicy**: $(a-b)^2 = a^2 - 2ab + b^2$
    *   **Różnica kwadratów**: $a^2 - b^2 = (a-b)(a+b)$

## Przykład 1 — podstawowy
Uprość wyrażenie algebraiczne: $5(x - 2y) - 3(2x + y) + 4y$.

**Krok 1.** Opuszczamy pierwsze nawiasy, mnożąc $5$ przez każdy składnik w nawiasie:
$5(x - 2y) = 5 \cdot x - 5 \cdot 2y = 5x - 10y$

**Krok 2.** Opuszczamy drugie nawiasy, mnożąc $-3$ przez każdy składnik w nawiasie:
$-3(2x + y) = -3 \cdot 2x + (-3) \cdot y = -6x - 3y$

**Krok 3.** Zapisujemy całe wyrażenie po opuszczeniu nawiasów:
$5x - 10y - 6x - 3y + 4y$

**Krok 4.** Grupujemy i dodajemy (odejmujemy) wyrazy podobne. Wyrazy z $x$: $5x$ i $-6x$. Wyrazy z $y$: $-10y$, $-3y$ i $4y$.
$(5x - 6x) + (-10y - 3y + 4y)$

**Krok 5.** Wykonujemy działania w grupach:
$(5-6)x + (-10-3+4)y = -1x + (-9)y = -x - 9y$

**Sprawdzenie:**
Przyjmijmy $x=1$, $y=2$.
Oryginalne wyrażenie: $5(1 - 2 \cdot 2) - 3(2 \cdot 1 + 2) + 4 \cdot 2 = 5(1 - 4) - 3(2 + 2) + 8 = 5(-3) - 3(4) + 8 = -15 - 12 + 8 = -19$.
Uproszczone wyrażenie: $-x - 9y = -1 - 9 \cdot 2 = -1 - 18 = -19$.
Wyniki są zgodne.

## Przykład 2 — maturalny
Uprość wyrażenie: $(\frac{1}{2}a - 3b)^2 - (\frac{1}{2}a + 3b)(\frac{1}{2}a - 3b)$.

**Krok 1.** Rozpoznajemy wzory skróconego mnożenia. Pierwszy człon to kwadrat różnicy $(a-b)^2$, gdzie $a = \frac{1}{2}a$ i $b = 3b$. Drugi człon to różnica kwadratów $a^2 - b^2$, gdzie $a = \frac{1}{2}a$ i $b = 3b$.

**Krok 2.** Stosujemy wzór na kwadrat różnicy do pierwszego członu:
$(\frac{1}{2}a - 3b)^2 = (\frac{1}{2}a)^2 - 2 \cdot (\frac{1}{2}a) \cdot (3b) + (3b)^2 = \frac{1}{4}a^2 - 3ab + 9b^2$

**Krok 3.** Stosujemy wzór na różnicę kwadratów do drugiego członu. Pamiętamy, że całe wyrażenie jest odejmowane, więc stosujemy nawiasy:
$(\frac{1}{2}a + 3b)(\frac{1}{2}a - 3b) = (\frac{1}{2}a)^2 - (3b)^2 = \frac{1}{4}a^2 - 9b^2$

**Krok 4.** Podstawiamy obliczone wyrażenia z powrotem do oryginalnego równania i opuszczamy nawiasy, pamiętając o zmianie znaków przy drugim członie:
$(\frac{1}{4}a^2 - 3ab + 9b^2) - (\frac{1}{4}a^2 - 9b^2) = \frac{1}{4}a^2 - 3ab + 9b^2 - \frac{1}{4}a^2 + 9b^2$

**Krok 5.** Grupujemy i dodajemy (odejmujemy) wyrazy podobne:
$(\frac{1}{4}a^2 - \frac{1}{4}a^2) - 3ab + (9b^2 + 9b^2)$

**Krok 6.** Obliczamy wynik:
$0 - 3ab + 18b^2 = -3ab + 18b^2$

**Sprawdzenie:**
Przyjmijmy $a=2$, $b=1$.
Oryginalne wyrażenie: $(\frac{1}{2}\cdot 2 - 3\cdot 1)^2 - (\frac{1}{2}\cdot 2 + 3\cdot 1)(\frac{1}{2}\cdot 2 - 3\cdot 1) = (1 - 3)^2 - (1 + 3)(1 - 3) = (-2)^2 - (4)(-2) = 4 - (-8) = 4 + 8 = 12$.
Uproszczone wyrażenie: $-3ab + 18b^2 = -3\cdot 2\cdot 1 + 18\cdot 1^2 = -6 + 18 = 12$.
Wyniki są zgodne.

## Przykład 3 — egzaminacyjny

Pole prostokąta wynosi $P = 6x^2 + 7x - 3$. Jednym z boków tego prostokąta jest dwumian $2x+3$. Wyznacz długość drugiego boku.

**Krok 1.** Wiemy, że pole prostokąta jest iloczynem długości jego boków. Oznaczmy długości boków jako $a$ i $b$. Wtedy $P = a \cdot b$. W tym zadaniu mamy dane pole $P = 6x^2 + 7x - 3$ i jeden z boków, np. $a = 2x+3$. Musimy znaleźć drugi bok, $b$.

**Krok 2.** Zapisujemy równanie: $(2x+3) \cdot b = 6x^2 + 7x - 3$.

**Krok 3.** Aby znaleźć $b$, musimy podzielić pole przez długość znanego boku: $b = \frac{6x^2 + 7x - 3}{2x+3}$. Możemy wykonać to dzielenie pisemne lub spróbować rozłożyć licznik na czynniki. Spróbujmy rozłożyć trójmian kwadratowy $6x^2 + 7x - 3$ na czynniki. Poszukujemy dwóch liczb, których iloczyn wynosi $6 \cdot (-3) = -18$, a suma $7$. Takimi liczbami są $9$ i $-2$.
$6x^2 + 7x - 3 = 6x^2 + 9x - 2x - 3$

**Krok 4.** Grupowanie wyrazów w rozłożonym liczniku:
$6x^2 + 9x - 2x - 3 = 3x(2x+3) - 1(2x+3)$

**Krok 5.** Wyłączamy wspólny czynnik $(2x+3)$:
$(3x-1)(2x+3)$

**Krok 6.** Podstawiamy rozłożony licznik z powrotem do wzoru na $b$:
$b = \frac{(3x-1)(2x+3)}{2x+3}$

**Krok 7.** Skracamy wspólny czynnik $(2x+3)$ (zakładając, że $2x+3 \neq 0$):
$b = 3x-1$

**Odpowiedź:** Długość drugiego boku wynosi $3x-1$.

**Sprawdzenie:**
Mnożymy znalezione boki: $(2x+3)(3x-1) = 2x \cdot 3x + 2x \cdot (-1) + 3 \cdot 3x + 3 \cdot (-1) = 6x^2 - 2x + 9x - 3 = 6x^2 + 7x - 3$. Jest to pole $P$, więc rozwiązanie jest poprawne.

## Pułapki
*   **Znaki przy odejmowaniu nawiasów**: Zapomnienie o zmianie znaków wszystkich wyrazów w nawiasie, który jest odejmowany. Np. $a - (b+c)$ to $a - b - c$, a nie $a - b + c$.
*   **Mylenie wzorów skróconego mnożenia**: Szczególnie przy $(a+b)^2$ i $(a-b)^2$. Pamiętaj o środkowym wyrazie $2ab$ i jego znaku.
*   **Potęgowanie ułamków i iloczynów**: Przy potęgowaniu np. $(\frac{1}{2}a)^2$, trzeba podnieść do kwadratu zarówno $\frac{1}{2}$, jak i $a$, co daje $\frac{1}{4}a^2$. Podobnie przy $(-3b)^2$ otrzymujemy $9b^2$, a nie $-9b^2$.
*   **Niedopisywanie potęg**: Przy mnożeniu $x \cdot x$ często zapomina się o potędze i pisze $2x$ zamiast $x^2$. Podobnie $x \cdot x^2 = x^3$, a nie $x^2$.
*   **Błędy rachunkowe**: Proste pomyłki w dodawaniu lub odejmowaniu liczb, zwłaszcza przy ujemnych.

## Ćwiczenia do samodzielnego rozwiązania
1.  Uprość wyrażenie: $2(3a - b) + 4(a + 2b) - 5a$.
2.  Oblicz i uprość: $(x - 4)(x + 3)$.
3.  Zastosuj wzory skróconego mnożenia: $(2m - 3n)^2$.
4.  Zastosuj wzory skróconego mnożenia: $9p^2 - 4q^2$.
5.  Uprość złożone wyrażenie: $5(x-1)^2 - 2(x+3)(x-3)$.
6.  Długość jednego boku prostokąta wynosi $x+2$, a drugiego $3x-1$. Oblicz pole tego prostokąta.
7.  Wyrażenie $4x^2 - 9$ można zapisać jako iloczyn dwóch dwumianów. Podaj ten iloczyn.

## Odpowiedzi
1.  $3a + 7b$
2.  $x^2 - x - 12$
3.  $4m^2 - 12mn + 9n^2$
4.  $(3p - 2q)(3p + 2q)$
5.  $3x^2 - 5$
6.  $P = (x+2)(3x-1) = 3x^2 - x + 6x - 2 = 3x^2 + 5x - 2$
7.  $(2x-3)(2x+3)$

## Szybka powtórka
1.  Jakie są wyrazy podobne w wyrażeniu $3x^2 - 5x + 2x^2 + 7$?
2.  Jaka jest zasada dodawania i odejmowania sum algebraicznych?
3.  Wymień dwa podstawowe wzory skróconego mnożenia.
4.  Co otrzymasz, mnożąc $a(b+c)$?
5.  Co oznacza symbol $a^2$ w kontekście wyrażeń algebraicznych?

## Diagram
```text
       +-----------------------+
       |   WYRAŻENIA ALGEBRAICZNE  |
       +-----------+-----------+
                   |
      +------------+------------+
      |                         |
+-----+------+           +------+-----+
|   Jednomiany   |           |  Suma algebraiczna  |
+-----+------+           +------+-----+
      |                         |
  Współczynnik,           Wyrazy podobne,
  Część zmienna           Dodawanie/Odejmowanie

+---------------------+
|   Działania:        |
| - Dodawanie/Odejm.  |
| - Mnożenie (przez   |
|   jednomian/sumę)   |
| - Dzielenie (przez  |
|   jednomian)        |
+---------------------+
      |
+---------------------+
| Wzory skróconego    |
| mnożenia:           |
| - (a+b)^2           |
| - (a-b)^2           |
| - a^2 - b^2         |
+---------------------+
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'algebra'
  AND topic = 'wyrazenia_algebraiczne';

UPDATE public.materials SET
  title = 'Równania liniowe — pełny kurs',
  content = '## Na egzaminie

Równania liniowe to **fundament matury podstawowej** — pojawiają się w prawie każdym arkuszu: jako samodzielne zadanie otwarte (2–3 pkt), element układu równań albo krok w zadaniu tekstowym. CKE sprawdza: przekształcanie, ułamki, nawiasy, interpretację wyniku (brak / jeden / nieskończenie wiele rozwiązań).

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Postać równania** i pojęcie rozwiązania
2. **Zasady równoważności** (co wolno robić z obiema stronami)
3. **Równania z ułamkami** i nawiasami
4. **Interpretację wyniku** (sprzeczne / tożsamościowe)
5. **Zadania maturalne** krok po kroku
6. **Ćwiczenia** z odpowiedziami

## Definicje i wzory

**Równanie liniowe** z jedną niewiadomą:

$$
ax + b = 0, \quad a \neq 0
$$

**Rozwiązanie** to liczba $x_0$, która po podstawieniu daje prawdziwą równość.

Wzór (gdy $a \neq 0$):

$$
x = -\frac{b}{a}
$$

**Zasady równoważności:**
- dodaj lub odejmij tę samą liczbę po obu stronach
- pomnóż lub podziel obie strony przez tę samą liczbę $\neq 0$
- rozwijaj nawiasy przed przenoszeniem wyrazów

**Typy równań po uproszczeniu:**
| Postać | Rozwiązań |
|--------|-----------|
| $x = \text{liczba}$ | dokładnie jedno |
| $0 = 0$ | nieskończenie wiele |
| $0 = 5$ | brak |

## Przykład 1 — podstawowy

Rozwiąż: $5x - 3 = 2x + 9$

**Krok 1.** Przenieś wyrazy z $x$ na lewą: $5x - 2x = 9 + 3$

**Krok 2.** Redukuj: $3x = 12$

**Krok 3.** Dziel przez 3: $x = 4$

**Sprawdzenie:** L: $5 \cdot 4 - 3 = 17$, P: $2 \cdot 4 + 9 = 17$ ✓

## Przykład 2 — ułamki

Rozwiąż: $\dfrac{2x - 1}{3} = \dfrac{x + 4}{2}$

**Krok 1.** NWW(3, 2) = 6. Mnożymy obie strony przez 6:

$$2(2x - 1) = 3(x + 4)$$

**Krok 2.** $4x - 2 = 3x + 12$

**Krok 3.** $x = 14$

**Sprawdzenie:** $\dfrac{27}{3} = 9$, $\dfrac{18}{2} = 9$ ✓

## Przykład 3 — nawiasy

Rozwiąż: $3(x - 2) + 5 = 2(x + 1) - 1$

**Krok 1.** $3x - 6 + 5 = 2x + 2 - 1$

**Krok 2.** $3x - 1 = 2x + 1$

**Krok 3.** $x = 2$

## Przykład 4 — zadanie maturalne (tekst)

Pierwsza liczba jest o 12 większa od drugiej. Ich suma wynosi 48. Znajdź obie liczby.

**Krok 1.** Niech $x$ — mniejsza liczba. Większa: $x + 12$.

**Krok 2.** Równanie: $x + (x + 12) = 48$

**Krok 3.** $2x + 12 = 48 \Rightarrow 2x = 36 \Rightarrow x = 18$

**Odpowiedź:** liczby **18** i **30**.

## Pułapki

- **Znak przy przenoszeniu** — $-3x$ na drugą stronę daje $+3x$, nie $-3x$
- **Dzielenie przez wyrażenie z $x$** — możesz stracić rozwiązanie; bezpieczniej przekształcaj algebraicznie
- **Ułamki** — mnoż przez NWW **całego** równania, nie pojedynczych wyrazów
- **$0 = 0$** — to nie „$x = 0$”, tylko nieskończenie wiele rozwiązań
- **Sprawdzenie** — 10 sekund i unikasz utraty punktów za literówkę

## Ćwiczenia do samodzielnego rozwiązania

1. $7x + 5 = 26$
2. $4x - 3 = 2x + 11$
3. $\dfrac{x}{2} + 3 = \dfrac{x}{3} + 5$
4. $2(x + 4) = 3(x - 1)$
5. Cena $x$ zł po podwyżce o 15% wynosi 230 zł. Zapisz równanie i znajdź $x$.
6. Czy $x = 3$ spełnia $2(x - 1) = x + 2$? (L: 4, P: 5)
7. Ile rozwiązań ma $2x + 4 = 2(x + 2)$?

## Odpowiedzi

1. $x = 3$
2. $x = 7$
3. Pomnóż przez 6: $3x + 18 = 2x + 30 \Rightarrow x = 12$
4. $2x + 8 = 3x - 3 \Rightarrow x = 11$
5. $1{,}15x = 230 \Rightarrow x = 200$ zł
6. **Nie** — po podstawieniu L = 4, P = 5
7. Nieskończenie wiele ($0 = 0$ po uproszczeniu)

## Szybka powtórka

1. Wymień dwie zasady równoważności.
2. Jak rozpoznać równanie sprzeczne?
3. Dlaczego warto sprawdzać wynik podstawieniem?
4. Co zrobić, gdy w równaniu są ułamki?
5. Jaka jest postać ogólna równania liniowego?'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'algebra'
  AND topic = 'rownania_liniowe';

UPDATE public.materials SET
  title = 'Układy równań liniowych na maturze',
  content = '## Na egzaminie
Układy równań liniowych pojawiają się na maturze na poziomie podstawowym regularnie, zazwyczaj w zadaniach otwartych (gdzie można zdobyć 3-4 punkty) lub jako element innych zadań. CKE często sprawdza umiejętność tworzenia układu równań na podstawie treści zadania oraz jego rozwiązywania, stosując różne metody. Ważne jest, aby opanować zarówno metodę podstawiania, jak i przeciwnych współczynników.

## Mapa tematu
1.  Zrozumienie czym jest układ dwóch równań liniowych z dwiema niewiadomymi.
2.  Rozpoznawanie, kiedy dany punkt (para liczb) jest rozwiązaniem układu równań.
3.  Opanowanie metody przeciwnych współczynników do rozwiązywania układów równań.
4.  Opanowanie metody podstawiania do rozwiązywania układów równań.
5.  Rozwiązywanie układów równań, które wymagają wcześniejszych przekształceń (np. uproszczenia, usunięcia nawiasów).
6.  Tworzenie i rozwiązywanie układów równań na podstawie treści zadań tekstowych.
7.  Interpretacja geometryczna układu równań (proste przecinające się, równoległe, pokrywające się).
8.  Rozwiązywanie układów równań, które nie mają jednego rozwiązania (nieskończenie wiele lub brak rozwiązań).

## Definicje i wzory
*   **Układ dwóch równań liniowych z dwiema niewiadomymi** to dwa równania pierwszego stopnia z dwiema niewiadomymi (np. $x$ i $y$), połączone klamrą:
    $$
    \begin{cases}
    ax + by = c \\
    dx + ey = f
    \end{cases}
    $$
    gdzie $a, b, c, d, e, f$ są liczbami rzeczywistymi, a przynajmniej jedna z liczb w każdym równaniu ($a$ lub $b$, $d$ lub $e$) jest różna od zera.

*   **Rozwiązanie układu równań** to para liczb $(x_0, y_0)$, która spełnia jednocześnie oba równania układu.

*   **Interpretacja geometryczna:** Każde równanie liniowe z dwiema niewiadomymi można przedstawić na płaszczyźnie jako prostą. Rozwiązanie układu równań odpowiada współrzędnym punktu przecięcia tych prostych.
    *   **Jedno rozwiązanie:** Proste przecinają się w jednym punkcie.
    *   **Nieskończenie wiele rozwiązań:** Proste pokrywają się (są identyczne).
    *   **Brak rozwiązań:** Proste są równoległe i nie pokrywają się.

*   **Metoda przeciwnych współczynników:** Polega na przekształceniu równań tak, aby współczynniki przy jednej z niewiadomych były liczbami przeciwnymi. Następnie dodaje się równania stronami, eliminując jedną niewiadomą.
    1.  Jeśli współczynniki przy jednej zmiennej nie są przeciwne, mnoży się jedno lub oba równania przez odpowiednie liczby, aby je takie uczynić.
    2.  Dodaje się równania stronami.
    3.  Rozwiązuje się powstałe równanie z jedną niewiadomą.
    4.  Wyznaczoną wartość podstawia się do jednego z pierwotnych równań i oblicza drugą niewiadomą.

*   **Metoda podstawiania:** Polega na wyznaczeniu jednej niewiadomej z jednego równania (najlepiej, gdy współczynnik przy tej niewiadomej wynosi 1 lub -1) i podstawieniu jej do drugiego równania.
    1.  Wyznaczamy jedną zmienną z jednego z równań (np. $y$ z pierwszego równania: $y = \frac{c - ax}{b}$).
    2.  Podstawiamy otrzymane wyrażenie do drugiego równania zamiast tej zmiennej.
    3.  Rozwiązujemy powstałe równanie z jedną niewiadomą.
    4.  Wyznaczoną wartość podstawia się do wyrażenia na pierwszą zmienną lub do jednego z pierwotnych równań i oblicza drugą niewiadomą.

## Przykład 1 — podstawowy
Rozwiąż układ równań metodą przeciwnych współczynników:
$$
\begin{cases}
2x + y = 5 \\
3x - y = 0
\end{cases}
$$

**Krok 1.** Zauważamy, że współczynniki przy zmiennej $y$ są liczbami przeciwnymi (1 i -1). Nie musimy mnożyć równań.

**Krok 2.** Dodajemy równania stronami:
$(2x + y) + (3x - y) = 5 + 0$
$2x + 3x + y - y = 5$
$5x = 5$

**Krok 3.** Rozwiązujemy równanie z jedną niewiadomą ($x$):
$5x = 5 \implies x = \frac{5}{5} \implies x = 1$

**Krok 4.** Podstawiamy znalezioną wartość $x=1$ do jednego z pierwotnych równań, np. do pierwszego:
$2x + y = 5$
$2(1) + y = 5$
$2 + y = 5$

**Krok 5.** Obliczamy wartość $y$:
$y = 5 - 2$
$y = 3$

**Rozwiązanie:** Para liczb $(x, y) = (1, 3)$.

**Sprawdzenie:**
Podstawiamy $x=1$ i $y=3$ do obu równań:
Pierwsze równanie: $2(1) + 3 = 2 + 3 = 5$. Zgadza się.
Drugie równanie: $3(1) - 3 = 3 - 3 = 0$. Zgadza się.

Rozwiązanie jest poprawne.

## Przykład 2 — maturalny
Rozwiąż układ równań metodą podstawiania:
$$
\begin{cases}
3(x - 1) + 2y = 7 \\
x + 2(y + 3) = 1
\end{cases}
$$

**Krok 1.** Upraszczamy oba równania, usuwając nawiasy:
Pierwsze równanie: $3x - 3 + 2y = 7 \implies 3x + 2y = 10$
Drugie równanie: $x + 2y + 6 = 1 \implies x + 2y = 1 - 6 \implies x + 2y = -5$
Otrzymaliśmy układ:
$$
\begin{cases}
3x + 2y = 10 \\
x + 2y = -5
\end{cases}
$$

**Krok 2.** Wybieramy równanie i zmienną do wyznaczenia. Najłatwiej jest wyznaczyć $x$ z drugiego równania, ponieważ jego współczynnik wynosi 1:
$x + 2y = -5 \implies x = -5 - 2y$

**Krok 3.** Podstawiamy otrzymane wyrażenie na $x$ do pierwszego równania:
$3x + 2y = 10$
$3(-5 - 2y) + 2y = 10$

**Krok 4.** Rozwiązujemy powstałe równanie z jedną niewiadomą ($y$):
$-15 - 6y + 2y = 10$
$-15 - 4y = 10$
$-4y = 10 + 15$
$-4y = 25$
$y = -\frac{25}{4}$

**Krok 5.** Obliczamy wartość $x$, podstawiając $y = -\frac{25}{4}$ do wyrażenia z Kroku 2:
$x = -5 - 2y$
$x = -5 - 2\left(-\frac{25}{4}\right)$
$x = -5 - \left(-\frac{50}{4}\right)$
$x = -5 + \frac{25}{2}$
Aby dodać, sprowadzamy do wspólnego mianownika:
$x = -\frac{10}{2} + \frac{25}{2}$
$x = \frac{15}{2}$

**Rozwiązanie:** Para liczb $(x, y) = \left(\frac{15}{2}, -\frac{25}{4}\right)$.

**Sprawdzenie:**
Pierwsze równanie (po uproszczeniu): $3x + 2y = 10$
$3\left(\frac{15}{2}\right) + 2\left(-\frac{25}{4}\right) = \frac{45}{2} - \frac{50}{4} = \frac{45}{2} - \frac{25}{2} = \frac{20}{2} = 10$. Zgadza się.
Drugie równanie (po uproszczeniu): $x + 2y = -5$
$\frac{15}{2} + 2\left(-\frac{25}{4}\right) = \frac{15}{2} - \frac{50}{4} = \frac{15}{2} - \frac{25}{2} = -\frac{10}{2} = -5$. Zgadza się.

Rozwiązanie jest poprawne.

## Przykład 3 — egzaminacyjny

W pewnej szkole jest 500 uczniów. Liczba dziewcząt stanowi 60% liczby wszystkich uczniów. Ile dziewcząt i ilu chłopców jest w tej szkole?

**Krok 1.** Wprowadzamy oznaczenia dla niewiadomych.
Niech $d$ oznacza liczbę dziewcząt.
Niech $c$ oznacza liczbę chłopców.

**Krok 2.** Zapisujemy informacje z treści zadania w postaci równań.
Z pierwszego zdania wiemy, że łączna liczba uczniów to 500:
$d + c = 500$

Z drugiego zdania wiemy, że liczba dziewcząt stanowi 60% wszystkich uczniów. 60% liczby 500 to:
$0.60 \cdot 500 = \frac{60}{100} \cdot 500 = 60 \cdot 5 = 300$.
Możemy to zapisać jako:
$d = 0.60 \cdot (d+c)$ lub bezpośrednio obliczyć $d=300$.

Jednak, aby utworzyć układ równań, możemy zapisać to jako:
$d = 0.60 \cdot 500$
$d = 300$
Mamy więc układ:
$$
\begin{cases}
d + c = 500 \\
d = 300
\end{cases}
$$
Alternatywnie, jeśli chcemy bardziej klasyczny układ z dwiema niewiadomymi i bez bezpośredniego obliczenia:
Wiemy, że chłopcy stanowią $100\% - 60\% = 40\%$ uczniów.
$d = 0.60 \cdot (d+c)$
$c = 0.40 \cdot (d+c)$
Dodając te równania stronami: $d+c = 0.60(d+c) + 0.40(d+c) = (0.60+0.40)(d+c) = 1.00(d+c)$. To nam nic nie mówi.
Najprościej jest użyć informacji, że $d+c=500$.
Zatem $d = 0.60 \cdot 500 = 300$.
A wtedy $c = 500 - d = 500 - 300 = 200$.

Jeśli jednak chcemy rozwiązać *układ równań*, użyjmy obu informacji w postaci układu:
$$
\begin{cases}
d + c = 500 \quad \text{(Łączna liczba uczniów)} \\
d = 0.60 \cdot 500 \quad \text{(Liczba dziewcząt)}
\end{cases}
$$

**Krok 3.** Rozwiązujemy układ.
Drugie równanie bezpośrednio daje nam wartość $d$:
$d = 300$

**Krok 4.** Podstawiamy wartość $d$ do pierwszego równania, aby znaleźć $c$:
$300 + c = 500$
$c = 500 - 300$
$c = 200$

**Rozwiązanie:** W szkole jest 300 dziewcząt i 200 chłopców.

**Sprawdzenie:**
Liczba wszystkich uczniów: $300 + 200 = 500$. Zgadza się.
Czy liczba dziewcząt stanowi 60%?
$\frac{300}{500} = \frac{3}{5} = 0.6 = 60\%$. Zgadza się.

## Pułapki
*   **Brak przekształcenia równań:** Uczniowie często próbują rozwiązać układ od razu, nie upraszczając równań, które zawierają nawiasy lub wymagają przeniesienia wyrazów. Zawsze zaczynaj od doprowadzenia obu równań do postaci standardowej $ax + by = c$.
*   **Błędy w mnożeniu lub dodawaniu:** Przy stosowaniu metody przeciwnych współczynników lub podstawiania łatwo o pomyłki przy mnożeniu całego równania przez liczbę lub przy dodawaniu/odejmowaniu. Dokładnie sprawdzaj każdy krok.
*   **Błędy przy wyznaczaniu zmiennej:** W metodzie podstawiania, gdy wyznaczasz jedną zmienną, pamiętaj o poprawnej zmianie znaków i podziale przez współczynnik. Np. z $3x + 2y = 10$, wyznaczając $x$, otrzymasz $3x = 10 - 2y$, a następnie $x = \frac{10 - 2y}{3}$. Nie zapominaj o kresce ułamkowej i dzieleniu.
*   **Nieczytelne zapisy:** Zapis może być bardzo nieczytelny, zwłaszcza przy ułamkach i długich wyrażeniach. Pisz starannie, używaj nawiasów tam, gdzie są potrzebne, aby uniknąć pomyłek.
*   **Zapominanie o sprawdzeniu:** Zawsze sprawdzaj swoje rozwiązanie, podstawiając obliczone wartości $x$ i $y$ do obu pierwotnych równań. To najprostszy sposób na wyłapanie błędów.

## Ćwiczenia do samodzielnego rozwiązania
1.  Rozwiąż układ równań metodą przeciwnych współczynników:
    $$
    \begin{cases}
    x + 3y = 5 \\
    2x - 3y = 1
    \end{cases}
    $$
2.  Rozwiąż układ równań metodą podstawiania:
    $$
    \begin{cases}
    2x - y = 4 \\
    x + 5y = -3
    \end{cases}
    $$
3.  Rozwiąż układ równań:
    $$
    \begin{cases}
    3(x + y) - 2y = 10 \\
    2x + 5(x - y) = 7
    \end{cases}
    $$
4.  Rozwiąż układ równań:
    $$
    \begin{cases}
    \frac{1}{2}x + y = 3 \\
    x - \frac{1}{3}y = 2
    \end{cases}
    $$
5.  Suma dwóch liczb wynosi 45. Jedna liczba jest o 7 większa od drugiej. Znajdź te liczby.
6.  Rozwiąż układ równań i określ jego rodzaj (jedno rozwiązanie, brak rozwiązań, nieskończenie wiele rozwiązań):
    $$
    \begin{cases}
    4x - 2y = 6 \\
    -2x + y = -3
    \end{cases}
    $$

## Odpowiedzi
1.  $x=2, y=1$
2.  $x=1, y=-2$
3.  $x=3, y=-1$
4.  $x=2, y=2$
5.  Niech szukane liczby to $a$ i $b$.
    $$
    \begin{cases}
    a + b = 45 \\
    a = b + 7
    \end{cases}
    $$
    Rozwiązanie: $a=26, b=19$. Szukane liczby to 26 i 19.
6.  Po przekształceniu drugiego równania ($y = 2x - 3$, czyli $2y = 4x - 6$, czyli $4x - 2y = 6$), widzimy, że oba równania są tożsame. Układ ma **nieskończenie wiele rozwiązań**. Rozwiązaniem są wszystkie pary $(x, y)$ spełniające równanie $y = 2x - 3$.

## Szybka powtórka
1.  Jakie są dwie podstawowe metody rozwiązywania układów równań liniowych?
2.  Co oznacza, że para liczb $(x_0, y_0)$ jest rozwiązaniem układu równań?
3.  Co geometrycznie reprezentuje układ dwóch równań liniowych z dwiema niewiadomymi?
4.  Kiedy układ równań liniowych nie ma rozwiązań?
5.  Co należy zrobić, jeśli równania w układzie zawierają nawiasy lub ułamki?

## Diagram
```text
       ^ y
       |
       |     /
       |    /
       |   /  (x0, y0) - punkt przecięcia
       |  /
       | /
-------+----------------> x
      /|
     / |
    /  |
   /   |
  /    |
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'algebra'
  AND topic = 'uklady_rownan';

UPDATE public.materials SET
  title = 'Funkcja liniowa na maturze',
  content = '## Na egzaminie
Funkcja liniowa pojawia się na maturze z matematyki na poziomie podstawowym dosyć często, zazwyczaj w zadaniach otwartych, gdzie można uzyskać od 2 do 4 punktów. CKE lubi sprawdzać rozumienie pojęć takich jak współczynnik kierunkowy i wyraz wolny, umiejętność rysowania wykresu funkcji, znajdowania miejsc zerowych, określania monotoniczności oraz rozwiązywania prostych zadań tekstowych i geometrycznych związanych z prostymi. Często zadania dotyczą interpretacji geometrycznej rozwiązań układów równań liniowych lub analizy położenia prostych na płaszczyźnie (równoległość, prostopadłość).

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił:
1.  Zdefiniować funkcję liniową i podać jej ogólną postać.
2.  Rozpoznać i zinterpretować współczynniki $a$ (współczynnik kierunkowy) i $b$ (wyraz wolny) w równaniu funkcji liniowej.
3.  Określić monotoniczność funkcji liniowej (rosnąca, malejąca, stała) na podstawie współczynnika $a$.
4.  Wyznaczyć punkt przecięcia wykresu funkcji liniowej z osiami układu współrzędnych (oś $OY$ i oś $OX$).
5.  Obliczyć miejsce zerowe funkcji liniowej.
6.  Naszkicować wykres funkcji liniowej w układzie współrzędnych.
7.  Wyznaczyć równanie prostej przechodzącej przez dwa dane punkty.
8.  Zastosować wiedzę o funkcjiach liniowych do rozwiązywania zadań tekstowych i geometrycznych.

## Definicje i wzory
*   **Funkcja liniowa** to funkcja określona wzorem postaci:
    $$f(x) = ax + b$$
    gdzie $a$ i $b$ są stałymi liczbami rzeczywistymi ($a, b \in \mathbb{R}$). Dziedziną i zbiorem wartości funkcji liniowej jest zbiór liczb rzeczywistych ($\mathbb{R}$).

*   **Wykres funkcji liniowej** to linia prosta.

*   **Współczynnik kierunkowy ($a$)**:
    *   Określa nachylenie prostej względem osi $OX$.
    *   Decyduje o monotoniczności funkcji:
        *   Jeśli $a > 0$, funkcja jest **rosnąca**.
        *   Jeśli $a < 0$, funkcja jest **malejąca**.
        *   Jeśli $a = 0$, funkcja jest **stała** ($f(x) = b$). Jej wykres jest prostą poziomą.

*   **Wyraz wolny ($b$)**:
    *   Jest to wartość funkcji dla argumentu $x=0$, czyli $f(0) = a \cdot 0 + b = b$.
    *   Określa punkt przecięcia wykresu funkcji z osią $OY$. Wykres przecina oś $OY$ w punkcie $(0, b)$.

*   **Miejsce zerowe funkcji liniowej**:
    *   Jest to taki argument $x$, dla którego wartość funkcji wynosi 0, czyli $f(x) = 0$.
    *   Aby je obliczyć, rozwiązujemy równanie:
        $$ax + b = 0$$
        $$ax = -b$$
        Jeśli $a \neq 0$, to miejsce zerowe wynosi:
        $$x = -\frac{b}{a}$$
    *   Miejsce zerowe geometrycznie oznacza punkt przecięcia wykresu funkcji z osią $OX$. Jest to punkt $(-\frac{b}{a}, 0)$.
    *   Jeśli $a = 0$ i $b \neq 0$, funkcja jest stała ($f(x)=b$) i nie ma miejsca zerowego (wykres jest prostą poziomą różną od osi $OX$).
    *   Jeśli $a = 0$ i $b = 0$, funkcja jest stała ($f(x)=0$) i każdym argumentem jest miejscem zerowym (wykres pokrywa się z osią $OX$).

*   **Równanie prostej przechodzącej przez dwa punkty** $A = (x_1, y_1)$ i $B = (x_2, y_2)$:
    *   Najpierw obliczamy współczynnik kierunkowy $a$ ze wzoru:
        $$a = \frac{y_2 - y_1}{x_2 - x_1}$$
        (zakładamy, że $x_1 \neq x_2$).
    *   Następnie, korzystając z jednego z punktów (np. $A$) i obliczonego $a$, wyznaczamy $b$ z równania $y_1 = ax_1 + b$.
        $$b = y_1 - ax_1$$
    *   Ostatecznie zapisujemy równanie prostej $y = ax + b$.

*   **Proste równoległe**: Dwie proste o równaniach $y = a_1x + b_1$ i $y = a_2x + b_2$ są równoległe, jeśli mają równe współczynniki kierunkowe:
    $$a_1 = a_2$$
    (i różne wyraz wolny $b_1 \neq b_2$, w przeciwnym razie proste są identyczne).

*   **Proste prostopadłe**: Dwie proste o równaniach $y = a_1x + b_1$ i $y = a_2x + b_2$ są prostopadłe, jeśli iloczyn ich współczynników kierunkowych wynosi $-1$:
    $$a_1 \cdot a_2 = -1$$
    (zakładamy, że żadna z prostych nie jest pionowa, co w przypadku funkcji liniowej zawsze ma miejsce, gdyż $a$ jest liczbą rzeczywistą).

## Przykład 1 — podstawowy
Dana jest funkcja liniowa $f(x) = 2x - 4$.
a) Określ monotoniczność tej funkcji.
b) Podaj współrzędne punktu przecięcia wykresu funkcji z osią $OY$.
c) Oblicz miejsce zerowe funkcji.
d) Naszkicuj wykres tej funkcji.

**Rozwiązanie:**

*   **Krok 1: Analiza współczynników.**
    W równaniu $f(x) = 2x - 4$, mamy $a = 2$ i $b = -4$.

*   **Krok 2: Określenie monotoniczności.**
    Ponieważ $a = 2 > 0$, funkcja jest **rosnąca**.

*   **Krok 3: Znalezienie punktu przecięcia z osią OY.**
    Punkt przecięcia z osią $OY$ ma współrzędne $(0, b)$. W tym przypadku jest to punkt $(0, -4)$.

*   **Krok 4: Obliczenie miejsca zerowego.**
    Aby znaleźć miejsce zerowe, rozwiązujemy równanie $f(x) = 0$:
    $2x - 4 = 0$
    $2x = 4$
    $x = \frac{4}{2}$
    $x = 2$
    Miejsce zerowe wynosi 2. Wykres przecina oś $OX$ w punkcie $(2, 0)$.

*   **Krok 5: Szkicowanie wykresu.**
    Wykres funkcji liniowej jest linią prostą. Aby go narysować, wystarczy zaznaczyć dwa punkty.
    Znamy już dwa punkty leżące na wykresie:
    - Punkt przecięcia z $OY$: $(0, -4)$
    - Miejsce zerowe (punkt przecięcia z $OX$): $(2, 0)$
    Zaznaczamy te dwa punkty w układzie współrzędnych i prowadzimy przez nie prostą.

**Sprawdzenie:**
Podstawiamy wartości do wzoru:
$f(0) = 2 \cdot 0 - 4 = -4$ (zgadza się z punktem $(0, -4)$)
$f(2) = 2 \cdot 2 - 4 = 4 - 4 = 0$ (zgadza się z miejscem zerowym $x=2$)
Współczynnik $a=2$ jest dodatni, więc funkcja jest rosnąca. Wszystko się zgadza.

## Przykład 2 — maturalny
Wyznacz równanie prostej, która przechodzi przez punkty $A = (-1, 5)$ i $B = (3, -7)$. Czy ta prosta jest prostopadła do prostej o równaniu $y = \frac{1}{2}x + 1$?

**Rozwiązanie:**

*   **Krok 1: Obliczenie współczynnika kierunkowego ($a$)**
    Używamy wzoru $a = \frac{y_2 - y_1}{x_2 - x_1}$ dla punktów $A = (-1, 5)$ (czyli $x_1 = -1, y_1 = 5$) i $B = (3, -7)$ (czyli $x_2 = 3, y_2 = -7$).
    $$a = \frac{-7 - 5}{3 - (-1)} = \frac{-12}{3 + 1} = \frac{-12}{4} = -3$$
    Współczynnik kierunkowy wynosi $a = -3$.

*   **Krok 2: Obliczenie wyrazu wolnego ($b$)**
    Używamy znalezionego współczynnika $a = -3$ oraz współrzędnych jednego z punktów, np. $A=(-1, 5)$. Podstawiamy do wzoru $y = ax + b$:
    $5 = (-3) \cdot (-1) + b$
    $5 = 3 + b$
    $b = 5 - 3$
    $b = 2$
    Wyraz wolny wynosi $b = 2$.

*   **Krok 3: Zapisanie równania prostej.**
    Równanie szukanej prostej ma postać $y = ax + b$. Podstawiając obliczone wartości $a = -3$ i $b = 2$, otrzymujemy:
    $$y = -3x + 2$$

*   **Krok 4: Sprawdzenie prostopadłości.**
    Mamy prostą o równaniu $y = -3x + 2$. Jej współczynnik kierunkowy to $a_1 = -3$.
    Druga prosta ma równanie $y = \frac{1}{2}x + 1$. Jej współczynnik kierunkowy to $a_2 = \frac{1}{2}$.
    Aby sprawdzić, czy proste są prostopadłe, obliczamy iloczyn ich współczynników kierunkowych:
    $$a_1 \cdot a_2 = (-3) \cdot \frac{1}{2} = -\frac{3}{2}$$
    Ponieważ iloczyn $a_1 \cdot a_2 = -\frac{3}{2} \neq -1$, proste **nie są** prostopadłe.

**Sprawdzenie:**
Podstawmy punkty do równania $y = -3x + 2$:
Dla punktu $A=(-1, 5)$: $5 = -3(-1) + 2 = 3 + 2 = 5$. Zgadza się.
Dla punktu $B=(3, -7)$: $-7 = -3(3) + 2 = -9 + 2 = -7$. Zgadza się.
Warunek prostopadłości $a_1 \cdot a_2 = -1$ jest niespełniony, bo $-\frac{3}{2} \neq -1$.

## Przykład 3 — egzaminacyjny

Funkcja liniowa $f(x) = (m-1)x + 5$ jest malejąca. Wyznacz wszystkie możliwe wartości parametru $m$.

**Rozwiązanie:**

*   **Krok 1: Zapisanie warunku malejącości.**
    Funkcja liniowa $f(x) = ax + b$ jest malejąca, gdy jej współczynnik kierunkowy $a$ jest ujemny ($a < 0$).

*   **Krok 2: Zidentyfikowanie współczynnika kierunkowego.**
    W naszej funkcji $f(x) = (m-1)x + 5$, współczynnikiem kierunkowym jest wyrażenie przy $x$, czyli $a = m-1$.

*   **Krok 3: Zapisanie nierówności.**
    Warunek malejącości ($a < 0$) przyjmuje postać:
    $m - 1 < 0$

*   **Krok 4: Rozwiązanie nierówności.**
    Dodajemy 1 do obu stron nierówności:
    $m < 1$

*   **Krok 5: Podanie odpowiedzi.**
    Funkcja jest malejąca, gdy $m < 1$. Zatem możliwe wartości parametru $m$ to wszystkie liczby rzeczywiste mniejsze od 1.

**Sprawdzenie:**
Weźmy jakąś wartość $m < 1$, np. $m = 0$. Wtedy $f(x) = (0-1)x + 5 = -x + 5$. Współczynnik $a = -1 < 0$, więc funkcja jest malejąca.
Weźmy jakąś wartość $m > 1$, np. $m = 2$. Wtedy $f(x) = (2-1)x + 5 = x + 5$. Współczynnik $a = 1 > 0$, funkcja jest rosnąca.
Weźmy $m = 1$. Wtedy $f(x) = (1-1)x + 5 = 5$. Funkcja jest stała ($a=0$).
Wynik $m < 1$ jest poprawny.

## Pułapki
*   **Mylenie miejsc zerowych z punktem przecięcia z osią OY:** Miejsce zerowe to $x$, dla którego $f(x)=0$. Punkt przecięcia z $OY$ to zawsze $(0, b)$.
*   **Błędy w obliczeniach ze znakiem minus:** Szczególnie przy odejmowaniu współrzędnych punktów ($y_2 - y_1$, $x_2 - x_1$) lub przy obliczaniu $b$ ($b = y - ax$). Minusy lubią sprawiać kłopoty.
*   **Niewłaściwa interpretacja współczynnika $a$**: Zapominanie, że $a>0$ oznacza funkcję rosnącą, a $a<0$ – malejącą. Szczególnie ważne w zadaniach z parametrem.
*   **Brak sprawdzenia warunku prostopadłości/równoległości:** Pamiętaj, że proste są równoległe, gdy $a_1=a_2$, a prostopadłe, gdy $a_1 \cdot a_2 = -1$. Nie wystarczy tylko obliczyć $a_1$ i $a_2$.
*   **Dzielenie przez zero:** Wzór na $a$ ($a = \frac{y_2 - y_1}{x_2 - x_1}$) jest niezdefiniowany dla $x_1 = x_2$. Oznacza to, że punkty leżą na prostej pionowej, która nie jest wykresem funkcji liniowej (funkcja musi przyporządkować każdemu $x$ dokładnie jedno $y$). W kontekście funkcji liniowej nie występuje taka sytuacja, ale warto o tym pamiętać przy innych tematach.

## Ćwiczenia do samodzielnego rozwiązania
1.  Dana jest funkcja $f(x) = -3x + 6$.
    a) Określ jej monotoniczność.
    b) Podaj współrzędne punktu przecięcia z osią $OY$.
    c) Oblicz miejsce zerowe.
    d) Naszkicuj wykres.

2.  Wyznacz równanie prostej przechodzącej przez punkty $P = (2, -1)$ i $Q = (-4, 5)$.

3.  Funkcja liniowa $g(x) = \frac{1}{4}x + 2$ jest:
    A. Rosnąca, przecina oś $OY$ w punkcie $(0, 2)$.
    B. Malejąca, przecina oś $OX$ w punkcie $(-8, 0)$.
    C. Rosnąca, ma miejsce zerowe $x = -8$.
    D. Malejąca, ma miejsce zerowe $x = 8$.

4.  Prosta o równaniu $y = 2x - 1$ i prosta o równaniu $y = -\frac{1}{2}x + 3$ są:
    A. Równoległe
    B. Prostopadłe
    C. Mają ten sam punkt przecięcia z osią $OY$
    D. Mają ten sam punkt przecięcia z osią $OX$

5.  Wyznacz parametr $k$, dla którego funkcja liniowa $f(x) = (2k - 1)x - 4$ jest stała.

6.  Oblicz miejsce zerowe funkcji $h(x) = 5x + 10$. Następnie sprawdź, czy punkt $(1, 15)$ leży na wykresie tej funkcji.

7.  Znajdź równanie prostej przechodzącej przez punkt $(1, 7)$ i prostopadłej do prostej $y = -\frac{1}{3}x + 2$.

## Odpowiedzi
1.  a) Malejąca ($a = -3 < 0$). b) $(0, 6)$. c) $x = 2$. d) Wykres przechodzi przez punkty $(0, 6)$ i $(2, 0)$.
2.  $y = -x + 1$. (Obliczenie $a = \frac{5 - (-1)}{-4 - 2} = \frac{6}{-6} = -1$. Następnie $b$: $-1 = -1 \cdot 2 + b \Rightarrow b = 1$).
3.  C. (a = 1/4 > 0 - rosnąca; miejsce zerowe: 1/4 * x + 2 = 0 => 1/4 * x = -2 => x = -8. Punkt przecięcia z OY to (0, 2)).
4.  B. (Współczynniki kierunkowe to $a_1 = 2$ i $a_2 = -1/2$. Ich iloczyn: $2 \cdot (-1/2) = -1$, co jest warunkiem prostopadłości).
5.  $k = \frac{1}{2}$. (Aby funkcja była stała, $a=0$, czyli $2k-1=0$).
6.  Miejsce zerowe $x = -2$. Punkt $(1, 15)$ nie leży na wykresie (bo $h(1) = 5(1)+10 = 15$, czyli punkt $(1, 15)$ leży na wykresie).
7.  $y = 3x + 4$. (Prosta prostopadła ma współczynnik $a = 3$. Używając punktu $(1, 7)$: $7 = 3 \cdot 1 + b \Rightarrow b = 4$).

## Szybka powtórka
1.  Jaki jest ogólny wzór funkcji liniowej?
2.  Co oznacza współczynnik $a$ we wzorze funkcji liniowej?
3.  W jaki sposób określamy, czy funkcja liniowa jest rosnąca, malejąca czy stała?
4.  Gdzie wykres funkcji liniowej $y = ax + b$ przecina oś $OY$?
5.  Jaki warunek muszą spełniać współczynniki kierunkowe dwóch prostych, aby były one prostopadłe?

## Diagram
```text
     ^ Y
     |
     |      /
     |     /  (a>0, rosnąca)
     |    /
-----|---/-----> X
     |  /| (0,b)
     | / |
     |/  | (miejsce zerowe x=-b/a)
    /|
   / | (a<0, malejąca)
  /  |
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'funkcje'
  AND topic = 'funkcja_liniowa';

UPDATE public.materials SET
  title = 'Funkcja kwadratowa – od podstaw do matury',
  content = '## Na egzaminie
Funkcja kwadratowa pojawia się na maturze bardzo często, zazwyczaj w zadaniach otwartych (na 4 lub 6 punktów) lub jako element zadań zamkniętych. CKE lubi sprawdzać umiejętność badania własności funkcji (monotoniczność, miejsca zerowe, wierzchołek), szkicowanie wykresu, rozwiązywanie nierówności kwadratowych oraz zastosowania w zadaniach optymalizacyjnych lub geometrycznych.

## Mapa tematu
W tej lekcji opanujesz:
1. Definicję funkcji kwadratowej i jej ogólny wzór.
2. Własności funkcji kwadratowej: ramiona, miejsca zerowe, wierzchołek.
3. Sposoby obliczania miejsc zerowych: delta.
4. Wzory na współrzędne wierzchołka paraboli.
5. Szkicowanie wykresu funkcji kwadratowej.
6. Wyznaczanie zbioru wartości funkcji kwadratowej.
7. Określanie monotoniczności funkcji kwadratowej.
8. Rozwiązywanie prostych zadań tekstowych z zastosowaniem funkcji kwadratowej.

## Definicje i wzory
*   **Definicja funkcji kwadratowej:** Funkcję kwadratową w postaci ogólnej opisuje wzór:
    $$f(x) = ax^2 + bx + c$$
    gdzie $a, b, c$ są współczynnikami liczbowymi, a $a \neq 0$.
    *   $ax^2$ – człon kwadratowy
    *   $bx$ – człon liniowy
    *   $c$ – wyraz wolny
*   **Wykres funkcji kwadratowej:** Wykresem funkcji kwadratowej jest parabola.
    *   Jeśli $a > 0$, ramiona paraboli są skierowane do góry.
    *   Jeśli $a < 0$, ramiona paraboli są skierowane do dołu.
*   **Miejsca zerowe:** Miejsca zerowe funkcji kwadratowej to wartości $x$, dla których $f(x) = 0$. Obliczamy je, rozwiązując równanie kwadratowe $ax^2 + bx + c = 0$.
    *   Obliczamy wyróżnik trójmianu kwadratowego (deltę):
        $$\Delta = b^2 - 4ac$$
    *   W zależności od wartości $\Delta$:
        *   Jeśli $\Delta > 0$, istnieją dwa różne miejsca zerowe $x_1, x_2$:
            $$x_1 = \frac{-b - \sqrt{\Delta}}{2a}, \quad x_2 = \frac{-b + \sqrt{\Delta}}{2a}$$
        *   Jeśli $\Delta = 0$, istnieje dokładnie jedno miejsce zerowe (zwane podwójnym) $x_0$:
            $$x_0 = \frac{-b}{2a}$$
        *   Jeśli $\Delta < 0$, nie istnieją miejsca zerowe (funkcja nie przecina osi OX).
*   **Wierzchołek paraboli:** Wierzchołek paraboli $W = (p, q)$ ma współrzędne:
    $$p = \frac{-b}{2a}$$
    $$q = \frac{-\Delta}{4a} = f(p)$$
    *   Współrzędna $p$ jest osią symetrii paraboli.
    *   Wierzchołek jest najniższym punktem paraboli (dla $a>0$) lub najwyższym (dla $a<0$).
*   **Zbiór wartości:**
    *   Dla $a > 0$: Zbiorem wartości jest przedział $[q, +\infty)$, gdzie $q$ to współrzędna $y$ wierzchołka.
    *   Dla $a < 0$: Zbiorem wartości jest przedział $(-\infty, q]$, gdzie $q$ to współrzędna $y$ wierzchołka.
*   **Monotoniczność:**
    *   Dla $a > 0$:
        *   Funkcja jest malejąca w przedziale $(-\infty, p]$.
        *   Funkcja jest rosnąca w przedziale $[p, +\infty)$.
    *   Dla $a < 0$:
        *   Funkcja jest rosnąca w przedziale $(-\infty, p]$.
        *   Funkcja jest malejąca w przedziale $[p, +\infty)$.
*   **Postać kanoniczna:**
    $$f(x) = a(x-p)^2 + q$$
    gdzie $(p, q)$ to współrzędne wierzchołka.
*   **Postać iloczynowa (jeśli istnieją miejsca zerowe $x_1, x_2$):**
    $$f(x) = a(x-x_1)(x-x_2)$$

## Przykład 1 — podstawowy
Dana jest funkcja kwadratowa $f(x) = x^2 - 4x + 3$.
a) Określ współczynniki $a, b, c$.
b) Ustal, w którą stronę skierowane są ramiona paraboli.
c) Oblicz miejsca zerowe.
d) Oblicz współrzędne wierzchołka paraboli.
e) Naszkicuj wykres funkcji.
f) Podaj zbiór wartości funkcji.
g) Określ przedziały monotoniczności.

**Rozwiązanie:**

**Krok 1.** Określenie współczynników i kierunku ramion.
Porównujemy wzór funkcji $f(x) = x^2 - 4x + 3$ z postacią ogólną $ax^2 + bx + c$.
$a = 1$, $b = -4$, $c = 3$.
Ponieważ $a = 1 > 0$, ramiona paraboli są skierowane do góry.

**Krok 2.** Obliczenie miejsc zerowych.
Obliczamy deltę:
$\Delta = b^2 - 4ac = (-4)^2 - 4 \cdot 1 \cdot 3 = 16 - 12 = 4$.
Ponieważ $\Delta > 0$, obliczamy dwa miejsca zerowe:
$\sqrt{\Delta} = \sqrt{4} = 2$.
$x_1 = \frac{-b - \sqrt{\Delta}}{2a} = \frac{-(-4) - 2}{2 \cdot 1} = \frac{4 - 2}{2} = \frac{2}{2} = 1$.
$x_2 = \frac{-b + \sqrt{\Delta}}{2a} = \frac{-(-4) + 2}{2 \cdot 1} = \frac{4 + 2}{2} = \frac{6}{2} = 3$.
Miejsca zerowe to $x=1$ i $x=3$.

**Krok 3.** Obliczenie współrzędnych wierzchołka.
Obliczamy $p$:
$p = \frac{-b}{2a} = \frac{-(-4)}{2 \cdot 1} = \frac{4}{2} = 2$.
Obliczamy $q$:
$q = \frac{-\Delta}{4a} = \frac{-4}{4 \cdot 1} = \frac{-4}{4} = -1$.
Możemy też obliczyć $q$ jako $f(p)$:
$q = f(2) = 2^2 - 4 \cdot 2 + 3 = 4 - 8 + 3 = -1$.
Wierzchołek paraboli $W = (2, -1)$.

**Krok 4.** Szkicowanie wykresu.
Zaznaczamy miejsca zerowe na osi OX (punkty (1,0) i (3,0)).
Zaznaczamy wierzchołek (punkt (2,-1)).
Rysujemy parabolę przechodzącą przez te punkty, z ramionami skierowanymi do góry i symetryczną względem prostej $x=2$. Punkt przecięcia z osią OY to $f(0) = 0^2 - 4 \cdot 0 + 3 = 3$, czyli punkt (0,3).

**Krok 5.** Podanie zbioru wartości.
Ponieważ $a=1>0$ i $q=-1$, zbiorem wartości funkcji jest przedział $[q, +\infty)$, czyli $[-1, +\infty)$.

**Krok 6.** Określenie przedziałów monotoniczności.
Ponieważ $a=1>0$ i $p=2$:
Funkcja jest malejąca w przedziale $(-\infty, 2]$.
Funkcja jest rosnąca w przedziale $[2, +\infty)$.

**Sprawdzenie:**
Wzór funkcji $f(x) = x^2 - 4x + 3$.
$a=1, b=-4, c=3$. Ramiona w górę ($a>0$).
Miejsca zerowe: $x_1=1, x_2=3$. (1,0), (3,0) na wykresie.
Wierzchołek: $p=2, q=-1$. $W=(2,-1)$. Punkt najniższy.
Zbiór wartości: $[-1, +\infty)$.
Monotoniczność: malejąca $(-\infty, 2]$, rosnąca $[2, +\infty)$.
Wszystko się zgadza.

## Przykład 2 — maturalny
Dana jest funkcja $f(x) = -2x^2 + 8x - 6$.
a) Oblicz miejsca zerowe funkcji i zapisz jej postać iloczynową.
b) Oblicz współrzędne wierzchołka i zapisz postać kanoniczną funkcji.
c) Naszkicuj wykres funkcji, zaznaczając jej wierzchołek, miejsca zerowe oraz punkt przecięcia z osią OY.
d) Podaj zbiór wartości funkcji.
e) Dla jakich argumentów $x$ funkcja przyjmuje wartości większe od 0?

**Rozwiązanie:**

**Krok 1.** Miejsca zerowe i postać iloczynowa.
$a = -2$, $b = 8$, $c = -6$.
$\Delta = b^2 - 4ac = 8^2 - 4 \cdot (-2) \cdot (-6) = 64 - 48 = 16$.
$\sqrt{\Delta} = \sqrt{16} = 4$.
$x_1 = \frac{-b - \sqrt{\Delta}}{2a} = \frac{-8 - 4}{2 \cdot (-2)} = \frac{-12}{-4} = 3$.
$x_2 = \frac{-b + \sqrt{\Delta}}{2a} = \frac{-8 + 4}{2 \cdot (-2)} = \frac{-4}{-4} = 1$.
Miejsca zerowe to $x=1$ i $x=3$.
Postać iloczynowa: $f(x) = a(x-x_1)(x-x_2) = -2(x-3)(x-1)$.

**Krok 2.** Wierzchołek i postać kanoniczna.
$p = \frac{-b}{2a} = \frac{-8}{2 \cdot (-2)} = \frac{-8}{-4} = 2$.
$q = \frac{-\Delta}{4a} = \frac{-16}{4 \cdot (-2)} = \frac{-16}{-8} = 2$.
Wierzchołek $W = (2, 2)$.
Postać kanoniczna: $f(x) = a(x-p)^2 + q = -2(x-2)^2 + 2$.

**Krok 3.** Szkicowanie wykresu.
*   Ramiona paraboli skierowane są w dół ($a=-2 < 0$).
*   Miejsca zerowe: $x=1$ i $x=3$. Punkty $(1, 0)$ i $(3, 0)$.
*   Wierzchołek: $W=(2, 2)$.
*   Punkt przecięcia z osią OY: $f(0) = -2(0)^2 + 8(0) - 6 = -6$. Punkt $(0, -6)$.
Szkicujemy parabolę przechodzącą przez te punkty.

**Krok 4.** Zbiór wartości.
Ponieważ $a=-2<0$ i $q=2$, zbiorem wartości jest przedział $(-\infty, q]$, czyli $(-\infty, 2]$.

**Krok 5.** Rozwiązanie nierówności $f(x) > 0$.
Szukamy argumentów $x$, dla których wykres funkcji znajduje się nad osią OX. Z miejsc zerowych $x=1$ i $x=3$ oraz faktu, że ramiona są skierowane w dół, wynika, że funkcja jest dodatnia między miejscami zerowymi.
Rozwiązaniem nierówności $f(x) > 0$ jest przedział $(1, 3)$.

**Sprawdzenie:**
Postać iloczynowa: $-2(x-3)(x-1) = -2(x^2 - x - 3x + 3) = -2(x^2 - 4x + 3) = -2x^2 + 8x - 6$. Zgadza się.
Postać kanoniczna: $-2(x-2)^2 + 2 = -2(x^2 - 4x + 4) + 2 = -2x^2 + 8x - 8 + 2 = -2x^2 + 8x - 6$. Zgadza się.
Wierzchołek $(2,2)$: $f(2) = -2(2-2)^2 + 2 = 0 + 2 = 2$. Zgadza się.
Miejsca zerowe $1, 3$: $f(1) = -2(1)^2 + 8(1) - 6 = -2+8-6=0$. $f(3) = -2(3)^2 + 8(3) - 6 = -18+24-6=0$. Zgadza się.
Zbiór wartości $(-\infty, 2]$. Potwierdzone przez wierzchołek.
Dla $x \in (1, 3)$, np. $x=2$, $f(2)=2>0$.

## Przykład 3 — egzaminacyjny
Trójkąt prostokątny ma przyprostokątne o długościach $x$ cm i $(10-x)$ cm. Oblicz pole tego trójkąta jako funkcję zmiennej $x$ i określ dziedzinę tej funkcji. Dla jakiej długości boku $x$ pole tego trójkąta jest największe?

**Rozwiązanie:**

**Krok 1.** Zapisanie wzoru na pole trójkąta.
Pole trójkąta prostokątnego jest równe połowie iloczynu długości jego przyprostokątnych.
$P(x) = \frac{1}{2} \cdot x \cdot (10-x)$.

**Krok 2.** Uporządkowanie wzoru i określenie dziedziny.
$P(x) = \frac{1}{2} (10x - x^2) = 5x - \frac{1}{2}x^2 = -\frac{1}{2}x^2 + 5x$.
Jest to funkcja kwadratowa, gdzie $a = -\frac{1}{2}$, $b = 5$, $c = 0$.
Długości boków muszą być dodatnie.
$x > 0$
$10 - x > 0 \implies x < 10$.
Zatem dziedziną funkcji $P(x)$ jest przedział $(0, 10)$.

**Krok 3.** Znalezienie argumentu maksymalizującego pole.
Szukamy argumentu $x$, dla którego funkcja $P(x) = -\frac{1}{2}x^2 + 5x$ przyjmuje największą wartość. Ponieważ współczynnik $a = -\frac{1}{2} < 0$, ramiona paraboli są skierowane w dół, a największą wartość funkcja przyjmuje w wierzchołku.
Obliczamy współrzędną $p$ wierzchołka:
$p = \frac{-b}{2a} = \frac{-5}{2 \cdot (-\frac{1}{2})} = \frac{-5}{-1} = 5$.
Argument $x=5$ należy do dziedziny $(0, 10)$.

**Krok 4.** Obliczenie maksymalnego pola (nie jest wymagane, ale warto wiedzieć).
Maksymalne pole:
$P(5) = -\frac{1}{2}(5)^2 + 5 \cdot 5 = -\frac{1}{2} \cdot 25 + 25 = -12.5 + 25 = 12.5$.

**Odpowiedź:** Pole trójkąta jako funkcja $x$ to $P(x) = -\frac{1}{2}x^2 + 5x$. Dziedzina funkcji to $x \in (0, 10)$. Pole jest największe dla $x = 5$ cm.

## Pułapki
*   **Znak współczynnika $a$:** Zapominanie o znaku $a$ przy określaniu kierunku ramion lub przy obliczaniu $q$ lub przy stosowaniu postaci iloczynowej. Pamiętaj: $a>0$ ramiona w górę, $a<0$ ramiona w dół.
*   **Wzory na wierzchołek:** Mylenie wzorów na $p$ i $q$, lub nieprawidłowe podstawianie znaków ze wzoru $ax^2+bx+c$. Zawsze sprawdzaj znaki, np. $-b$ jest inne niż $b$.
*   **Obliczanie delty:** Błędy rachunkowe przy obliczaniu $\Delta = b^2 - 4ac$, zwłaszcza przy ujemnych współczynnikach (np. $(-4)^2=16$, a nie $-16$).
*   **Dziedzina funkcji:** W zadaniach tekstowych często występuje ograniczenie dziedziny (np. długości boków muszą być dodatnie). Nie można analizować funkcji poza jej dziedziną.
*   **Miejsca zerowe a funkcja:** Pamiętaj, że miejsca zerowe to wartości $x$, dla których $f(x)=0$. Nie są to punkty przecięcia z osią OY.

## Ćwiczenia do samodzielnego rozwiązania
1.  Dana jest funkcja $f(x) = 2x^2 - 8x + 6$.
    a) Podaj współczynniki $a, b, c$.
    b) Oblicz miejsca zerowe i współrzędne wierzchołka.
    c) Podaj zbiór wartości i przedziały monotoniczności.

2.  Dla jakich wartości parametru $m$ funkcja $f(x) = (m-1)x^2 + 4x - 5$ jest funkcją kwadratową?

3.  Funkcja kwadratowa $f(x) = ax^2 + bx + c$ ma miejsca zerowe $x_1 = -2$ i $x_2 = 4$. Wierzchołek paraboli znajduje się w punkcie $(1, -9)$. Zapisz wzór funkcji w postaci ogólnej.

4.  Naszkicuj wykres funkcji $f(x) = -x^2 + 2x + 3$. Podaj jej zbiór wartości oraz przedziały monotoniczności.

5.  Znajdź największą wartość funkcji $f(x) = -x^2 + 6x - 5$.

6.  Prostokąt ma boki o długościach $x$ oraz $12-x$. Wyznacz funkcję $P(x)$ opisującą pole tego prostokąta i określ jej dziedzinę. Znajdź wymiary prostokąta o największym polu.

7.  Rozwiąż nierówność kwadratową: $-x^2 + 5x - 6 \ge 0$.

## Odpowiedzi
1.  a) $a=2, b=-8, c=6$.
    b) $\Delta = (-8)^2 - 4 \cdot 2 \cdot 6 = 64 - 48 = 16$, $\sqrt{\Delta}=4$. $x_1 = \frac{8-4}{4}=1$, $x_2 = \frac{8+4}{4}=3$. Miejsca zerowe: $x=1, x=3$.
    $p = \frac{-(-8)}{2 \cdot 2} = \frac{8}{4} = 2$. $q = f(2) = 2(2^2) - 8(2) + 6 = 8 - 16 + 6 = -2$. Wierzchołek: $(2, -2)$.
    c) Zbiór wartości: $[-2, +\infty)$. Monotoniczność: malejąca $(-\infty, 2]$, rosnąca $[2, +\infty)$.

2.  Aby funkcja była kwadratową, współczynnik przy $x^2$ musi być różny od zera. Zatem $m-1 \neq 0$, co oznacza $m \neq 1$.

3.  Korzystamy z postaci iloczynowej: $f(x) = a(x-x_1)(x-x_2) = a(x-(-2))(x-4) = a(x+2)(x-4)$.
    Wykorzystujemy wierzchołek $(1, -9)$: $f(1) = -9$.
    $a(1+2)(1-4) = -9$
    $a(3)(-3) = -9$
    $-9a = -9 \implies a=1$.
    Wzór funkcji: $f(x) = 1(x+2)(x-4) = x^2 - 4x + 2x - 8 = x^2 - 2x - 8$.
    Wzór w postaci ogólnej: $f(x) = x^2 - 2x - 8$.

4.  $f(x) = -x^2 + 2x + 3$. $a=-1, b=2, c=3$. Ramiona w dół.
    $\Delta = 2^2 - 4(-1)(3) = 4 + 12 = 16$. $\sqrt{\Delta}=4$.
    $x_1 = \frac{-2-4}{2(-1)} = \frac{-6}{-2} = 3$. $x_2 = \frac{-2+4}{2(-1)} = \frac{2}{-2} = -1$. Miejsca zerowe: $x=-1, x=3$.
    $p = \frac{-2}{2(-1)} = \frac{-2}{-2} = 1$. $q = f(1) = -(1)^2 + 2(1) + 3 = -1+2+3 = 4$. Wierzchołek: $(1, 4)$.
    Punkt przecięcia z OY: $f(0)=3$.
    Wykres: parabola z ramionami w dół, przechodząca przez $(-1,0), (3,0), (1,4), (0,3)$.
    Zbiór wartości: $(-\infty, 4]$.
    Monotoniczność: rosnąca $(-\infty, 1]$, malejąca $[1, +\infty)$.

5.  Funkcja $f(x) = -x^2 + 6x - 5$. $a=-1 < 0$, więc funkcja ma wartość maksymalną w wierzchołku.
    $p = \frac{-6}{2(-1)} = \frac{-6}{-2} = 3$.
    $q = f(3) = -(3)^2 + 6(3) - 5 = -9 + 18 - 5 = 4$.
    Największa wartość funkcji wynosi 4.

6.  $P(x) = x(12-x) = 12x - x^2 = -x^2 + 12x$.
    Dziedzina: $x>0$ i $12-x>0 \implies x<12$. Dziedzina: $(0, 12)$.
    Aby znaleźć wymiary prostokąta o największym polu, szukamy $x$ maksymalizującego $P(x)$.
    $a=-1 < 0$. Wartość maksymalna w wierzchołku.
    $p = \frac{-12}{2(-1)} = \frac{-12}{-2} = 6$.
    Argument $x=6$ należy do dziedziny $(0, 12)$.
    Długości boków to $x=6$ cm i $12-x = 12-6=6$ cm. Prostokąt jest kwadratem.

7.  $-x^2 + 5x - 6 \ge 0$.
    Szukamy pierwiastków równania $-x^2 + 5x - 6 = 0$.
    $\Delta = 5^2 - 4(-1)(-6) = 25 - 24 = 1$. $\sqrt{\Delta}=1$.
    $x_1 = \frac{-5-1}{2(-1)} = \frac{-6}{-2} = 3$. $x_2 = \frac{-5+1}{2(-1)} = \frac{-4}{-2} = 2$.
    Pierwiastki to $x=2$ i $x=3$.
    Współczynnik $a=-1<0$, więc ramiona paraboli skierowane są w dół.
    Nierówność $\ge 0$ oznacza wartości dodatnie lub równe zero. Szukamy $x$, dla których parabola jest nad lub na osi OX.
    Rozwiązaniem jest przedział domknięty między pierwiastkami: $[2, 3]$.

## Szybka powtórka
1.  Jaki jest wzór funkcji kwadratowej w postaci ogólnej?
2.  Jak określamy kierunek ramion paraboli?
3.  Jakie są wzory na miejsca zerowe funkcji kwadratowej?
4.  Podaj wzory na współrzędne wierzchołka paraboli.
5.  Jak zależy zbiór wartości funkcji kwadratowej od współczynnika $a$?

## Diagram
```text
      ^ y
      |       * W(p,q)
      |      / \
      |     /   \
------+----*-----*------- > x
     x1   |     x2
          |
          |
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'funkcje'
  AND topic = 'funkcja_kwadratowa';

UPDATE public.materials SET
  title = 'Planimetria - podstawowe figury i twierdzenia',
  content = '## Na egzaminie
Zadania z planimetrii pojawiają się regularnie na maturze z matematyki na poziomie podstawowym, zarówno w zadaniach otwartych, jak i zamkniętych. Zazwyczaj można zdobyć od 3 do nawet 7 punktów za jedno zadanie z tego działu. Kluczowe jest opanowanie podstawowych figur geometrycznych, ich własności oraz kluczowych twierdzeń, takich jak twierdzenie Pitagorasa czy twierdzenia dotyczące podobieństwa trójkątów.

## Mapa tematu
1.  Definicja i podstawowe własności figur płaskich: trójkąty, czworokąty (kwadrat, prostokąt, romb, równoległobok, trapez).
2.  Twierdzenie Pitagorasa i jego zastosowanie do obliczania długości boków i przekątnych.
3.  Wzory na pola powierzchni podstawowych figur płaskich.
4.  Wzory na obwody podstawowych figur płaskich.
5.  Twierdzenie o podobieństwie trójkątów i jego zastosowania.
6.  Cechy przystawania trójkątów.
7.  Zastosowanie planimetrii w zadaniach tekstowych i geometrycznych.
8.  Rozwiązywanie zadań maturalnych wymagających połączenia kilku pojęć planimetrycznych.

## Definicje i wzory
**Podstawowe figury geometryczne:**

*   **Trójkąt:** Figura płaska ograniczona trzema odcinkami (bokami) łączącymi trzy punkty (wierzchołki) niedające się położyć na jednej prostej.
    *   Suma kątów wewnętrznych: $180^\circ$.
    *   Nierówność trójkąta: suma długości dwóch dowolnych boków musi być większa od długości trzeciego boku.
    *   Rodzaje trójkątów ze względu na boki: równoboczny, równoramienny, różnoboczny.
    *   Rodzaje trójkątów ze względu na kąty: ostrokątny, prostokątny, rozwartokątny.

*   **Czworokąt:** Figura płaskie ograniczona czterema odcinkami (bokami) łączącymi cztery punkty (wierzchołki).
    *   Suma kątów wewnętrznych: $360^\circ$.
    *   **Kwadrat:** Czworokąt o wszystkich bokach równych i wszystkich kątach prostych.
        *   Długość boku: $a$.
        *   Obwód: $Obw = 4a$.
        *   Pole: $P = a^2$.
        *   Długość przekątnej: $d = a\sqrt{2}$.
    *   **Prostokąt:** Czworokąt o wszystkich kątach prostych.
        *   Długości boków: $a, b$.
        *   Obwód: $Obw = 2a + 2b$.
        *   Pole: $P = a \cdot b$.
        *   Długość przekątnej: $d = \sqrt{a^2 + b^2}$.
    *   **Romb:** Czworokąt o wszystkich bokach równych.
        *   Długość boku: $a$.
        *   Obwód: $Obw = 4a$.
        *   Pole: $P = a \cdot h$ (gdzie $h$ to wysokość) lub $P = \frac{1}{2} d_1 \cdot d_2$ (gdzie $d_1, d_2$ to przekątne).
        *   Przekątne przecinają się pod kątem prostym i dzielą się na połowy.
    *   **Równoległobok:** Czworokąt o parach boków równoległych.
        *   Długości boków: $a, b$.
        *   Obwód: $Obw = 2a + 2b$.
        *   Pole: $P = a \cdot h_a = b \cdot h_b$ (gdzie $h_a, h_b$ to wysokości opuszczone na odpowiednie boki).
        *   Przeciwległe kąty są równe, a sąsiednie sumują się do $180^\circ$.
    *   **Trapez:** Czworokąt posiadający co najmniej jedną parę boków równoległych (podstawy).
        *   Długości podstaw: $a, b$.
        *   Długość ramion: $c, d$.
        *   Pole: $P = \frac{a+b}{2} \cdot h$ (gdzie $h$ to wysokość).
        *   **Trapez równoramienny:** Ramiona równej długości. Kąty przy tej samej podstawie równe. Przekątne równej długości.

**Twierdzenia:**

*   **Twierdzenie Pitagorasa:** W trójkącie prostokątnym suma kwadratów długości przyprostokątnych jest równa kwadratowi długości przeciwprostokątnej.
    *   Jeśli $a, b$ to przyprostokątne, a $c$ to przeciwprostokątna, to: $a^2 + b^2 = c^2$.
*   **Twierdzenie o podobieństwie trójkątów (cechy):**
    *   **Bok-bok-bok (BBB):** Dwa trójkąty są podobne, jeśli stosunki długości wszystkich ich parami odpowiadających boków są równe.
    *   **Bok-kąt-bok (BKB):** Dwa trójkąty są podobne, jeśli stosunek długości dwóch par odpowiadających sobie boków jest taki sam i kąt zawarty między tymi bokami jest równy.
    *   **Kąt-kąt (KK):** Dwa trójkąty są podobne, jeśli dwa kąty jednego trójkąta są odpowiednio równe dwóm kątom drugiego trójkąta.

## Przykład 1 — podstawowy
Oblicz pole i obwód prostokąta, którego jeden bok ma długość 5 cm, a przekątna ma długość 13 cm.

**Krok 1.** Narysuj prostokąt i zaznacz dane. Oznacz boki jako $a$ i $b$, a przekątną jako $d$. Mamy $a = 5$ cm, $d = 13$ cm.

**Krok 2.** Zauważ, że przekątna prostokąta dzieli go na dwa trójkąty prostokątne. Boki prostokąta są przyprostokątnymi tych trójkątów, a przekątna jest przeciwprostokątną.

**Krok 3.** Zastosuj twierdzenie Pitagorasa do jednego z tych trójkątów prostokątnych: $a^2 + b^2 = d^2$. Podstaw znane wartości: $5^2 + b^2 = 13^2$.

**Krok 4.** Rozwiąż równanie, aby obliczyć długość drugiego boku ($b$):
$25 + b^2 = 169$
$b^2 = 169 - 25$
$b^2 = 144$
$b = \sqrt{144}$
$b = 12$ cm.

**Krok 5.** Oblicz obwód i pole prostokąta, korzystając ze wzorów:
Obwód: $Obw = 2a + 2b = 2 \cdot 5 + 2 \cdot 12 = 10 + 24 = 34$ cm.
Pole: $P = a \cdot b = 5 \cdot 12 = 60$ cm$^2$.

**Sprawdzenie:**
Boki prostokąta to 5 cm i 12 cm. Przekątna ma 13 cm. Sprawdźmy twierdzenie Pitagorasa: $5^2 + 12^2 = 25 + 144 = 169$. $13^2 = 169$. Zgadza się. Obliczenia obwodu i pola są poprawne.

## Przykład 2 — maturalny
W trapezie równoramiennym podstawy mają długości 10 cm i 4 cm, a ramiona mają długość 5 cm. Oblicz pole tego trapezu.

**Krok 1.** Narysuj trapez równoramienny. Oznacz dłużą podstawę jako $a=10$ cm, krótszą podstawę jako $b=4$ cm, a ramiona jako $c=5$ cm.

**Krok 2.** Aby obliczyć pole trapezu, potrzebujemy jego wysokości ($h$). Skorzystaj ze wzoru $P = \frac{a+b}{2} \cdot h$. Musimy obliczyć $h$.

**Krok 3.** W trapezie równoramiennym, jeśli opuścimy wysokości z końców krótszej podstawy na dłuższą podstawę, podzielimy dłuższą podstawę na trzy odcinki. Środkowy odcinek będzie równy krótszej podstawie ($4$ cm). Dwa skrajne odcinki będą miały taką samą długość. Obliczmy tę długość:
$x = \frac{a-b}{2} = \frac{10-4}{2} = \frac{6}{2} = 3$ cm.

**Krok 4.** Rozważ jeden z dwóch prostokątnych trójkątów utworzonych przez wysokość, fragment dłuższego ramienia podstawy (długości $x=3$ cm) i ramię trapezu (długości $c=5$ cm). W tym trójkącie prostokątnym przyprostokątnymi są wysokość ($h$) i odcinek ($x$), a przeciwprostokątną jest ramię ($c$). Zastosuj twierdzenie Pitagorasa:
$h^2 + x^2 = c^2$
$h^2 + 3^2 = 5^2$
$h^2 + 9 = 25$
$h^2 = 25 - 9$
$h^2 = 16$
$h = \sqrt{16}$
$h = 4$ cm.

**Krok 5.** Oblicz pole trapezu, korzystając ze wzoru i obliczonej wysokości:
$P = \frac{a+b}{2} \cdot h = \frac{10+4}{2} \cdot 4 = \frac{14}{2} \cdot 4 = 7 \cdot 4 = 28$ cm$^2$.

**Sprawdzenie:**
Długości podstaw 10 cm i 4 cm, ramiona 5 cm. Wysokość 4 cm. Sprawdźmy Pitagorasem: wysokość $4^2=16$, odcinek podstawy $3^2=9$, suma $16+9=25$. Ramię $5^2=25$. Zgadza się. Pole obliczone poprawnie.

## Przykład 3 — egzaminacyjny

Trójkąt ABC jest podobny do trójkąta DEF. Długości boków trójkąta ABC wynoszą odpowiednio 3 cm, 4 cm i 5 cm. Obwód trójkąta DEF wynosi 24 cm. Oblicz długości boków trójkąta DEF.

**Krok 1.** Zrozumienie pojęcia podobieństwa. Trójkąty podobne mają odpowiadające sobie kąty równe, a stosunek długości odpowiadających sobie boków jest stały. Ten stały stosunek nazywamy skalą podobieństwa ($k$).

**Krok 2.** Oblicz obwód pierwszego trójkąta (ABC):
$Obw_{ABC} = 3 + 4 + 5 = 12$ cm.

**Krok 3.** Oblicz skalę podobieństwa ($k$) między trójkątem ABC a trójkątem DEF. Skala podobieństwa to stosunek obwodu figury podobnej (tu DEF) do obwodu figury pierwotnej (tu ABC).
$k = \frac{Obw_{DEF}}{Obw_{ABC}} = \frac{24 \text{ cm}}{12 \text{ cm}} = 2$.
Oznacza to, że każdy bok trójkąta DEF jest dwa razy dłuższy od odpowiadającego mu boku trójkąta ABC.

**Krok 4.** Oblicz długości boków trójkąta DEF, mnożąc długości odpowiadających im boków trójkąta ABC przez skalę podobieństwa $k=2$.
Długość pierwszego boku DEF: $3 \text{ cm} \cdot 2 = 6$ cm.
Długość drugiego boku DEF: $4 \text{ cm} \cdot 2 = 8$ cm.
Długość trzeciego boku DEF: $5 \text{ cm} \cdot 2 = 10$ cm.

**Sprawdzenie:**
Boki trójkąta DEF to 6 cm, 8 cm, 10 cm. Obwód $6+8+10 = 24$ cm. Zgadza się z danymi. Stosunek boków: $6/3 = 2$, $8/4 = 2$, $10/5 = 2$. Skala podobieństwa jest stała, więc trójkąty są podobne.

## Pułapki
*   **Brak twierdzenia Pitagorasa:** Mylenie kolejności przyprostokątnych i przeciwprostokątnej w twierdzeniu Pitagorasa. Zawsze kwadrat przeciwprostokątnej jest równy sumie kwadratów przyprostokątnych ($a^2 + b^2 = c^2$), a nie odwrotnie. Pamiętaj, że przeciwprostokątna jest najdłuższym bokiem trójkąta prostokątnego.
*   **Wzory na pole:** Mylenie wzorów na pole różnych figur, np. stosowanie wzoru na pole prostokąta do kwadratu lub odwrotnie. Upewnij się, że używasz właściwego wzoru dla danej figury.
*   **Trapez równoramienny:** Nieprawidłowe obliczanie odcinków na dłuższej podstawie. Pamiętaj, że odcinek $x = \frac{a-b}{2}$ to połowa różnicy długości podstaw, a nie jakaś inna część.
*   **Podobieństwo trójkątów:** Mylenie kolejności odpowiadających sobie boków przy obliczaniu skali podobieństwa. Zawsze porównuj odpowiednie boki. Jeśli $k = \frac{\text{bok w figurze 2}}{\text{bok w figurze 1}}$, to $k$ będzie większe od 1, gdy figura 2 jest większa od figury 1.
*   **Jednostki:** Zapominanie o jednostkach lub stosowanie ich nieprawidłowo. W zadaniach geometrycznych często spotkasz jednostki długości (cm, m) i pola (cm$^2$, m$^2$).

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz pole i obwód kwadratu, którego przekątna ma długość $8\sqrt{2}$ cm.
2.  Długości boków prostokąta wynoszą 6 cm i 10 cm. Oblicz długość jego przekątnej.
3.  Romb ma boki o długości 10 cm i jedną przekątną o długości 12 cm. Oblicz pole tego rombu.
4.  W trójkącie prostokątnym jeden z kątów ostrych ma miarę $30^\circ$. Oblicz stosunek długości przyprostokątnych.
5.  Dwa trójkąty są podobne. Jeden ma boki o długościach 5 cm, 7 cm, 9 cm. Drugi trójkąt ma najkrótszy bok o długości 15 cm. Oblicz obwód drugiego trójkąta.
6.  Podstawa trapezu prostokątnego ma długość 12 cm, a ramię prostopadłe do podstaw ma długość 5 cm. Krótsza podstawa ma długość 8 cm. Oblicz pole trapezu.

## Odpowiedzi
1.  Bok kwadratu ma długość 8 cm. Pole: $64$ cm$^2$. Obwód: $32$ cm.
2.  Przekątna ma długość $\sqrt{136}$ cm (czyli $2\sqrt{34}$ cm).
3.  Druga przekątna ma długość 16 cm. Pole: $96$ cm$^2$.
4.  Stosunek przyprostokątnej leżącej naprzeciw kąta $30^\circ$ do przyprostokątnej leżącej przy kącie $30^\circ$ wynosi $\frac{1}{\sqrt{3}}$ (lub $\frac{\sqrt{3}}{3}$).
5.  Skala podobieństwa $k=3$. Obwód drugiego trójkąta: $45$ cm.
6.  Pole trapezu: $100$ cm$^2$.

## Szybka powtórka
1.  Jaka jest suma kątów wewnętrznych w dowolnym trójkącie?
2.  Co mówi twierdzenie Pitagorasa?
3.  Podaj wzór na pole prostokąta.
4.  Podaj wzór na pole trapezu.
5.  Jakie są cechy podobieństwa trójkątów?

## Diagram
```text
      a
   +------+
 b |      | b
   +------+
      a

     /|\
    / | \
 c /  |h \ c
  /   |   \
 /____|____\
   x  b  x
    <-- a -->

   /----\
  /      \
c/        \d
/          \
+------------+
      a
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'geometria'
  AND topic = 'planimetria';

UPDATE public.materials SET
  title = 'Bryły i ich objętości – klucz do zadań z geometrii przestrzennej',
  content = '## Na egzaminie
Zadania ze stereometrii pojawiają się na maturze podstawowej dość regularnie, zazwyczaj jako jedno z zadań zamkniętych lub otwartych. Przeważnie dotyczą obliczania objętości lub pól powierzchni prostych brył, takich jak graniastosłupy, ostrosłupy, walce, stożki czy kule. Zwykle można za nie uzyskać 3–5 punktów, a kluczem do sukcesu jest poprawne zidentyfikowanie bryły, przypomnienie sobie lub wyprowadzenie odpowiednich wzorów oraz staranne przeprowadzenie obliczeń.

## Mapa tematu
1.  Zrozumienie pojęcia bryły i jej elementów (wierzchołki, krawędzie, ściany).
2.  Poznanie i stosowanie wzorów na objętości podstawowych brył: graniastosłupa, ostrosłupa, walca, stożka i kuli.
3.  Rozumienie pojęcia pola powierzchni całkowitej i bocznej brył.
4.  Umiejętność obliczania pól powierzchni podstawowych brył.
5.  Wykonywanie obliczeń z wykorzystaniem danych liczbowych, w tym liczb z pierwiastkiem i $\pi$.
6.  Rozwiązywanie zadań tekstowych dotyczących objętości i pól powierzchni brył.
7.  Rozpoznawanie elementów brył (wysokość, promień, tworząca) na rysunkach.
8.  Stosowanie twierdzenia Pitagorasa w zadaniach stereometrycznych.

## Definicje i wzory
**Bryła geometryczna** – zbiór punktów w przestrzeni ograniczony przez powierzchnię.
**Graniastosłup** – bryła ograniczona dwiema przystającymi podstawami (wielokątami) leżącymi w płaszczyznach równoległych oraz ścianami bocznymi (równoległobokami).
*   **Graniastosłup prosty:** ściany boczne są prostokątami, a krawędzie boczne są prostopadłe do podstaw.
*   **Graniastosłup prawidłowy:** podstawa jest wielokątem foremnym, a graniastosłup jest prosty.
*   Wzór na objętość graniastosłupa: $$V = P_p \cdot h$$ gdzie $P_p$ to pole podstawy, a $h$ to wysokość graniastosłupa (odległość między podstawami).
*   Wzór na pole powierzchni całkowitej graniastosłupa: $$P_c = 2 P_p + P_b$$ gdzie $P_b$ to pole powierzchni bocznej (suma pól ścian bocznych).

**Ostrosłup** – bryła, której podstawą jest wielokąt, a wierzchołkami ścian bocznych są punkty leżące w jednym punkcie (wierzchołku ostrosłupa), nieleżącym w płaszczyźnie podstawy.
*   **Ostrosłup prosty:** spodek wysokości znajduje się wewnątrz podstawy.
*   **Ostrosłup prawidłowy:** podstawa jest wielokątem foremnym, a ściany boczne są przystającymi trójkątami równoramiennymi.
*   Wzór na objętość ostrosłupa: $$V = \frac{1}{3} P_p \cdot h$$ gdzie $P_p$ to pole podstawy, a $h$ to wysokość ostrosłupa (odległość wierzchołka od płaszczyzny podstawy).
*   Wzór na pole powierzchni całkowitej ostrosłupa: $$P_c = P_p + P_b$$

**Walec** – bryła powstająca przez obrót prostokąta wokół jednego z jego boków. Ma dwie kołowe podstawy i powierzchnię boczną (powstającą z obrotu boku prostokąta).
*   Wzór na objętość walca: $$V = \pi r^2 h$$ gdzie $r$ to promień podstawy, a $h$ to wysokość walca.
*   Wzór na pole powierzchni całkowitej walca: $$P_c = 2 P_p + P_b = 2\pi r^2 + 2\pi rh$$ gdzie $P_p = \pi r^2$ to pole podstawy, a $P_b = 2\pi rh$ to pole powierzchni bocznej.

**Stożek** – bryła powstająca przez obrót trójkąta prostokątnego wokół jednej z jego przyprostokątnych. Ma jedną kołową podstawę i powierzchnię boczną.
*   Wzór na objętość stożka: $$V = \frac{1}{3} \pi r^2 h$$ gdzie $r$ to promień podstawy, a $h$ to wysokość stożka.
*   Wzór na pole powierzchni całkowitej stożka: $$P_c = P_p + P_b = \pi r^2 + \pi rl$$ gdzie $P_p = \pi r^2$ to pole podstawy, a $P_b = \pi rl$ to pole powierzchni bocznej, a $l$ to tworząca stożka (przeciwprostokątna obracanego trójkąta prostokątnego).
*   Związek między $r$, $h$ i $l$: $$l^2 = r^2 + h^2$$ (twierdzenie Pitagorasa).

**Kula** – bryła powstająca przez obrót koła wokół średnicy.
*   Wzór na objętość kuli: $$V = \frac{4}{3} \pi r^3$$ gdzie $r$ to promień kuli.
*   Wzór na pole powierzchni kuli: $$P = 4 \pi r^2$$ gdzie $r$ to promień kuli.

## Przykład 1 — podstawowy
Oblicz objętość graniastosłupa prawidłowego czworokątnego, którego krawędź podstawy ma długość 5 cm, a wysokość graniastosłupa wynosi 10 cm.

**Krok 1.** Zidentyfikuj bryłę. Jest to graniastosłup prawidłowy czworokątny. Podstawa jest kwadratem.
**Krok 2.** Podstawa jest kwadratem o boku $a = 5$ cm. Oblicz pole podstawy.
$$P_p = a^2 = 5^2 = 25 \, \text{cm}^2$$
**Krok 3.** Zidentyfikuj wysokość graniastosłupa. $h = 10$ cm.
**Krok 4.** Zastosuj wzór na objętość graniastosłupa.
$$V = P_p \cdot h$$
**Krok 5.** Podstaw dane i oblicz objętość.
$$V = 25 \, \text{cm}^2 \cdot 10 \, \text{cm} = 250 \, \text{cm}^3$$

**Sprawdzenie:** Wszystkie dane zostały wykorzystane. Wzór jest poprawny. Obliczenia są proste i wydają się poprawne. Jednostki są zgodne.

## Przykład 2 — maturalny
Oblicz pole powierzchni całkowitej stożka, którego promień podstawy wynosi 6 cm, a wysokość 8 cm.

**Krok 1.** Zidentyfikuj bryłę. Jest to stożek. Potrzebujemy pola podstawy i pola powierzchni bocznej.
**Krok 2.** Oblicz pole podstawy. Podstawa jest kołem o promieniu $r = 6$ cm.
$$P_p = \pi r^2 = \pi \cdot 6^2 = 36\pi \, \text{cm}^2$$
**Krok 3.** Aby obliczyć pole powierzchni bocznej, potrzebujemy długości tworzącej $l$. Zastosujemy twierdzenie Pitagorasa, ponieważ promień, wysokość i tworząca tworzą trójkąt prostokątny.
$$l^2 = r^2 + h^2$$
$$l^2 = 6^2 + 8^2 = 36 + 64 = 100$$
$$l = \sqrt{100} = 10 \, \text{cm}$$
**Krok 4.** Oblicz pole powierzchni bocznej.
$$P_b = \pi rl = \pi \cdot 6 \cdot 10 = 60\pi \, \text{cm}^2$$
**Krok 5.** Oblicz pole powierzchni całkowitej.
$$P_c = P_p + P_b = 36\pi + 60\pi = 96\pi \, \text{cm}^2$$

**Sprawdzenie:** Obliczono pole podstawy, tworzącą i pole boczne. Wszystkie obliczenia są poprawne. Wynik końcowy jest sumą dwóch pól.

## Przykład 3 — egzaminacyjny

Pudełko w kształcie prostopadłościanu ma wymiary 10 cm x 20 cm x 30 cm. Ile opakowań soku w kształcie walca o promieniu podstawy 3 cm i wysokości 15 cm zmieści się w tym pudełku, zakładając idealne ułożenie? (Przyjmij $\pi \approx 3$)

**Krok 1.** Oblicz objętość pudełka (prostopadłościanu).
$$V_{\text{pudełka}} = 10 \, \text{cm} \cdot 20 \, \text{cm} \cdot 30 \, \text{cm} = 6000 \, \text{cm}^3$$
**Krok 2.** Oblicz objętość jednego opakowania soku (walca). $r = 3$ cm, $h = 15$ cm. Przyjmujemy $\pi \approx 3$.
$$V_{\text{soku}} = \pi r^2 h = 3 \cdot 3^2 \cdot 15 = 3 \cdot 9 \cdot 15 = 27 \cdot 15 = 405 \, \text{cm}^3$$
**Krok 3.** Podziel objętość pudełka przez objętość jednego opakowania soku, aby dowiedzieć się, ile opakowań teoretycznie może się zmieścić.
$$\frac{V_{\text{pudełka}}}{V_{\text{soku}}} = \frac{6000}{405} \approx 14.8$$
**Krok 4.** Ponieważ nie można umieścić części opakowania, bierzemy liczbę całkowitą mniejszą od wyniku.
Można zmieścić 14 opakowań soku.

**Uwaga:** To jest uproszczenie. W rzeczywistości liczy się również fizyczne ułożenie, a nie tylko stosunek objętości. Zadanie często zakłada obliczenie stosunku objętości.

## Pułapki
*   ** Mylenie wysokości z tworzącą:** W stożku i w niektórych ostrosłupach kluczowe jest rozróżnienie między wysokością ($h$) a tworzącą ($l$) lub wysokością ściany bocznej. Tworząca nie jest tym samym co wysokość bryły.
*   ** Zapominanie o współczynniku $\frac{1}{3}$ przy ostrosłupach i stożkach:** Wzory na objętość ostrosłupów i stożków różnią się od graniastosłupów i walców obecnością czynnika $\frac{1}{3}$. Jest to częsty błąd.
*   ** Błędy w obliczeniach pola podstawy:** Szczególnie w przypadku podstaw będących wielokątami innymi niż kwadrat czy prostokąt (np. trójkąt, sześciokąt), błędy w obliczeniu pola podstawy przekładają się na błąd w obliczeniu objętości.
*   ** Niewłaściwe stosowanie twierdzenia Pitagorasa:** W zadaniach przestrzennych twierdzenie Pitagorasa często stosuje się do obliczenia wysokości ściany bocznej, tworzącej lub krawędzi. Należy upewnić się, że tworzymy poprawne trójkąty prostokątne.
*   ** Zapominanie o $\pi$ lub jego przybliżonej wartości:** W zadaniach z walcami, stożkami i kulami często pojawia się $\pi$. Należy pamiętać, aby je uwzględnić w obliczeniach lub zastosować podane przybliżenie.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz objętość walca, którego promień podstawy wynosi 4 cm, a wysokość 7 cm. Wynik podaj z dokładnością do dwóch miejsc po przecinku, przyjmując $\pi \approx 3.14$.
2.  Oblicz pole powierzchni całkowitej graniastosłupa prawidłowego sześciokątnego, którego krawędź podstawy ma długość 3 cm, a wysokość wynosi 8 cm.
3.  Oblicz objętość kuli o promieniu 9 cm. Wynik podaj w zależności od $\pi$.
4.  Podstawa ostrosłupa prostego jest rombem o przekątnych długości 12 cm i 16 cm. Wysokość ostrosłupa wynosi 10 cm. Oblicz objętość tego ostrosłupa.
5.  Oblicz pole powierzchni bocznej stożka, którego tworząca ma długość 13 cm, a promień podstawy wynosi 5 cm.
6.  Wysokość walca wynosi 12 cm, a promień jego podstawy jest o 4 cm krótszy. Oblicz objętość tego walca. Wynik podaj w zależności od $\pi$.
7.  Oblicz pole powierzchni całkowitej ostrosłupa prawidłowego czworokątnego, którego krawędź podstawy ma długość 6 cm, a wysokość ściany bocznej (wysokość ściany bocznej) wynosi 5 cm.

## Odpowiedzi
1.  $V = \pi r^2 h \approx 3.14 \cdot 4^2 \cdot 7 = 3.14 \cdot 16 \cdot 7 = 3.14 \cdot 112 = 351.68 \, \text{cm}^3$.
2.  Pole podstawy (sześciokąta foremnego): $P_p = \frac{3\sqrt{3}}{2} a^2 = \frac{3\sqrt{3}}{2} \cdot 3^2 = \frac{27\sqrt{3}}{2} \, \text{cm}^2$. Pole boczne: $P_b = 6 \cdot (a \cdot h) = 6 \cdot (3 \cdot 8) = 6 \cdot 24 = 144 \, \text{cm}^2$. Pole całkowite: $P_c = 2 P_p + P_b = 2 \cdot \frac{27\sqrt{3}}{2} + 144 = 27\sqrt{3} + 144 \, \text{cm}^2$.
3.  $V = \frac{4}{3} \pi r^3 = \frac{4}{3} \pi \cdot 9^3 = \frac{4}{3} \pi \cdot 729 = 4 \pi \cdot 243 = 972\pi \, \text{cm}^3$.
4.  Pole podstawy (rombu): $P_p = \frac{1}{2} d_1 d_2 = \frac{1}{2} \cdot 12 \cdot 16 = 6 \cdot 16 = 96 \, \text{cm}^2$. Objętość: $V = \frac{1}{3} P_p \cdot h = \frac{1}{3} \cdot 96 \cdot 10 = 32 \cdot 10 = 320 \, \text{cm}^3$.
5.  $P_b = \pi rl = \pi \cdot 5 \cdot 13 = 65\pi \, \text{cm}^2$.
6.  $r = 12 - 4 = 8$ cm. $V = \pi r^2 h = \pi \cdot 8^2 \cdot 12 = \pi \cdot 64 \cdot 12 = 768\pi \, \text{cm}^3$.
7.  Pole podstawy: $P_p = a^2 = 6^2 = 36 \, \text{cm}^2$. Pole boczne: $P_b = 4 \cdot \frac{1}{2} \cdot a \cdot h_b = 4 \cdot \frac{1}{2} \cdot 6 \cdot 5 = 2 \cdot 30 = 60 \, \text{cm}^2$. Pole całkowite: $P_c = P_p + P_b = 36 + 60 = 96 \, \text{cm}^2$.

## Szybka powtórka
1.  Jaki jest wzór na objętość walca?
2.  Czym różni się wzór na objętość ostrosłupa od wzoru na objętość graniastosłupa?
3.  Jakie elementy potrzebujemy, aby obliczyć pole powierzchni całkowitej stożka?
4.  Jaki wzór stosujemy do znalezienia tworzącej stożka, znając promień i wysokość?
5.  Ile wynosi wzór na objętość kuli?

## Diagram
```text
    +--------+
   /        /|
  /        / |
 +--------+  |   <-- Graniastosłup
 |        |  +
 |        | /
 |        |/
 +--------+

    .-------.
   /         \
  /           \  <-- Stożek
 |             |
 \             /
  \           /
   `---------''

     O         <-- Kula (centrym)
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'geometria'
  AND topic = 'stereometria';

UPDATE public.materials SET
  title = 'Geometria analityczna na maturze',
  content = '## Na egzaminie
Geometria analityczna pojawia się na maturze podstawowej regularnie, zazwyczaj jako zadanie otwarte warte 3-5 punktów lub jako część zadań zamkniętych. CKE najczęściej sprawdza umiejętność obliczania odległości między punktami, środka odcinka, równania prostej oraz jej położenia względem innych prostych (równoległość, prostopadłość). Często pojawiają się też zadania dotyczące pól figur na płaszczyźnie kartezjańskiej.

## Mapa tematu
1.  Współrzędne punktów na płaszczyźnie kartezjańskiej.
2.  Obliczanie odległości między dwoma punktami.
3.  Obliczanie współrzędnych środka odcinka.
4.  Równanie prostej — różne postacie.
5.  Warunki równoległości i prostopadłości prostych.
6.  Wyznaczanie punktów wspólnych prostych (układy równań).
7.  Obliczanie pola trójkąta o danych wierzchołkach.
8.  Zastosowania w zadaniach tekstowych i geometrycznych.

## Definicje i wzory
*   **Płaszczyzna kartezjańska:** Jest to płaszczyzna, na której wyróżniono dwa prostopadłe punkty: początek układu współrzędnych ($O=(0,0)$) oraz dwie prostopadłe osie: poziomą oś $Ox$ (osię odciętych) i pionową oś $Oy$ (osię rzędnych).
*   **Współrzędne punktu:** Każdy punkt $P$ na płaszczyźnie kartezjańskiej można jednoznacznie opisać za pomocą pary liczb rzeczywistych $(x, y)$, gdzie $x$ to współrzędna $x$ (odcięta) punktu, a $y$ to współrzędna $y$ (rzędna) punktu. Zapisujemy to jako $P=(x, y)$.

*   **Odległość między dwoma punktami:** Odległość między punktami $A=(x_A, y_A)$ i $B=(x_B, y_B)$ obliczamy ze wzoru:
    $$d(A, B) = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$$

*   **Środek odcinka:** Współrzędne środka $S=(x_S, y_S)$ odcinka o końcach $A=(x_A, y_A)$ i $B=(x_B, y_B)$ obliczamy ze wzorów:
    $$x_S = \frac{x_A + x_B}{2}$$
    $$y_S = \frac{y_A + y_B}{2}$$

*   **Równanie prostej:**
    *   **Postać kierunkowa:** $y = ax + b$, gdzie $a$ to współczynnik kierunkowy (nachylenie prostej), a $b$ to wyraz wolny (punkt przecięcia prostej z osią $Oy$, czyli $b=y$ dla $x=0$).
    *   **Postać ogólna:** $Ax + By + C = 0$.
    *   **Prosta pionowa:** $x = c$ (nie ma postaci kierunkowej, bo współczynnik kierunkowy $a$ jest nieokreślony).
    *   **Prosta pozioma:** $y = c$ (jest to szczególny przypadek postaci kierunkowej, gdzie $a=0$).

*   **Warunki równoległości i prostopadłości prostych:**
    *   Dwie proste w postaci kierunkowej $y = a_1 x + b_1$ i $y = a_2 x + b_2$ są **równoległe**, gdy ich współczynniki kierunkowe są równe: $a_1 = a_2$.
    *   Dwie proste w postaci kierunkowej $y = a_1 x + b_1$ i $y = a_2 x + b_2$ są **prostopadłe**, gdy iloczyn ich współczynników kierunkowych wynosi $-1$: $a_1 \cdot a_2 = -1$. (Ten warunek nie dotyczy prostych poziomych i pionowych).
    *   Prosta pionowa $x=c$ jest prostopadła do prostej poziomej $y=d$.

*   **Punkt przecięcia prostych:** Aby znaleźć współrzędne punktu przecięcia dwóch prostych, rozwiązujemy układ równań, którego równaniami są równania tych prostych.

*   **Pole trójkąta o danych wierzchołkach:** Dla trójkąta o wierzchołkach $A=(x_A, y_A)$, $B=(x_B, y_B)$ i $C=(x_C, y_C)$, pole $P$ można obliczyć ze wzoru:
    $$P = \frac{1}{2} |x_A(y_B - y_C) + x_B(y_C - y_A) + x_C(y_A - y_B)|$$
    (Wartość bezwzględna zapewnia, że pole jest dodatnie).

## Przykład 1 — podstawowy
Oblicz odległość między punktami $A=(-2, 3)$ i $B=(4, -5)$.

**Krok 1.** Zapisujemy współrzędne punktów: $x_A = -2$, $y_A = 3$, $x_B = 4$, $y_B = -5$.
**Krok 2.** Stosujemy wzór na odległość między punktami: $d(A, B) = \sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.
**Krok 3.** Podstawiamy współrzędne do wzoru: $d(A, B) = \sqrt{(4 - (-2))^2 + (-5 - 3)^2}$.
**Krok 4.** Wykonujemy obliczenia w nawiasach: $d(A, B) = \sqrt{(4 + 2)^2 + (-8)^2} = \sqrt{6^2 + (-8)^2}$.
**Krok 5.** Obliczamy kwadraty i sumę, a następnie pierwiastek: $d(A, B) = \sqrt{36 + 64} = \sqrt{100} = 10$.

**Sprawdzenie:**
Obliczenia są poprawne. Różnica współrzędnych x to $4 - (-2) = 6$. Różnica współrzędnych y to $-5 - 3 = -8$. Suma kwadratów to $6^2 + (-8)^2 = 36 + 64 = 100$. Pierwiastek z 100 to 10.

## Przykład 2 — maturalny
Wyznacz równanie prostej, która przechodzi przez punkt $P=(1, -2)$ i jest prostopadła do prostej $k: y = -\frac{1}{3}x + 4$.

**Krok 1.** Analizujemy daną prostą $k$. Jest ona w postaci kierunkowej $y = a_k x + b_k$. Odczytujemy współczynnik kierunkowy $a_k = -\frac{1}{3}$.
**Krok 2.** Określamy warunek prostopadłości. Prosta, którą szukamy (nazwijmy ją $m$), ma równanie $y = a_m x + b_m$. Ponieważ proste $k$ i $m$ są prostopadłe, zachodzi warunek $a_k \cdot a_m = -1$.
**Krok 3.** Obliczamy współczynnik kierunkowy prostej $m$: $(-\frac{1}{3}) \cdot a_m = -1$. Mnożąc obie strony przez $-3$, otrzymujemy $a_m = 3$.
**Krok 4.** Zapisujemy tymczasowe równanie prostej $m$ z obliczonym współczynnikiem kierunkowym: $y = 3x + b_m$.
**Krok 5.** Wykorzystujemy informację, że prosta $m$ przechodzi przez punkt $P=(1, -2)$. Podstawiamy współrzędne punktu $P$ do równania prostej, aby obliczyć $b_m$: $-2 = 3 \cdot 1 + b_m$.
**Krok 6.** Rozwiązujemy równanie: $-2 = 3 + b_m$, co daje $b_m = -2 - 3 = -5$.
**Krok 7.** Zapisujemy ostateczne równanie prostej $m$: $y = 3x - 5$.

**Sprawdzenie:**
Współczynnik kierunkowy naszej prostej to $a_m = 3$. Współczynnik kierunkowy prostej $k$ to $a_k = -\frac{1}{3}$. Ich iloczyn $3 \cdot (-\frac{1}{3}) = -1$, więc proste są prostopadłe. Nasza prosta ma równanie $y = 3x - 5$. Sprawdzamy, czy punkt $P=(1, -2)$ należy do tej prostej: $-2 = 3 \cdot 1 - 5 \implies -2 = 3 - 5 \implies -2 = -2$. Warunek jest spełniony.

## Przykład 3 — egzaminacyjny
Oblicz pole trójkąta o wierzchołkach $A=(1, 1)$, $B=(4, 2)$ i $C=(2, 5)$.

**Krok 1.** Zapisujemy współrzędne wierzchołków: $x_A=1, y_A=1$, $x_B=4, y_B=2$, $x_C=2, y_C=5$.
**Krok 2.** Stosujemy wzór na pole trójkąta o danych wierzchołkach: $P = \frac{1}{2} |x_A(y_B - y_C) + x_B(y_C - y_A) + x_C(y_A - y_B)|$.
**Krok 3.** Podstawiamy współrzędne do wzoru:
$P = \frac{1}{2} |1(2 - 5) + 4(5 - 1) + 2(1 - 2)|$.
**Krok 4.** Wykonujemy obliczenia w nawiasach:
$P = \frac{1}{2} |1(-3) + 4(4) + 2(-1)|$.
**Krok 5.** Wykonujemy mnożenie:
$P = \frac{1}{2} |-3 + 16 - 2|$.
**Krok 6.** Dodajemy i odejmujemy wewnątrz wartości bezwzględnej:
$P = \frac{1}{2} |11|$.
**Krok 7.** Obliczamy wartość bezwzględną i mnożymy przez $\frac{1}{2}$:
$P = \frac{1}{2} \cdot 11 = \frac{11}{2} = 5.5$.

**Sprawdzenie:**
Obliczenia wydają się poprawne. Różnice y: $y_B-y_C = 2-5=-3$, $y_C-y_A = 5-1=4$, $y_A-y_B=1-2=-1$.
Iloczyny: $1 \cdot (-3) = -3$, $4 \cdot 4 = 16$, $2 \cdot (-1) = -2$.
Suma: $-3 + 16 - 2 = 11$.
Pole: $\frac{1}{2}|11| = 5.5$.

## Pułapki
*   **Znaki przy odejmowaniu:** Często popełnianym błędem jest niewłaściwe opuszczenie lub dodanie znaku minus podczas odejmowania współrzędnych, zwłaszcza gdy jedna ze współrzędnych jest ujemna (np. błąd w $4 - (-2)$). Zawsze sprawdzaj znaki.
*   **Współczynnik kierunkowy prostej pionowej:** Pamiętaj, że prosta pionowa o równaniu $x=c$ nie ma współczynnika kierunkowego w postaci $y=ax+b$, ponieważ jest on nieokreślony. Warunek prostopadłości do prostej poziomej ($y=d$) jest spełniony, ale nie można go obliczyć przez mnożenie współczynników.
*   **Użycie wzoru na odległość/środek odcinka:** Upewnij się, że używasz poprawnego wzoru. Wzór na odległość zawiera pierwiastek i kwadraty różnic, a wzór na środek odcinka zawiera sumy i dzielenie przez 2.
*   **Kolejność punktów we wzorach:** We wzorach na odległość i środek odcinka kolejność punktów $A$ i $B$ nie ma znaczenia (bo $(x_B - x_A)^2 = (x_A - x_B)^2$), ale bądź konsekwentny. Wzór na pole jest bardziej wrażliwy na kolejność; użycie wartości bezwzględnej łagodzi ten problem, ale warto pamiętać o poprawnej implementacji.
*   **Wartość bezwzględna we wzorze na pole:** Nie zapomnij o wartości bezwzględnej we wzorze na pole trójkąta. Pole musi być dodatnie, a obliczenia w nawiasach mogą czasem dać wynik ujemny.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz współrzędne środka odcinka o końcach $P=(-5, 2)$ i $Q=(3, -8)$.
2.  Oblicz odległość między punktami $M=(0, -7)$ i $N=(-2, 1)$.
3.  Wyznacz równanie prostej przechodzącej przez punkty $A=(1, 5)$ i $B=(3, 1)$.
4.  Znajdź równanie prostej równoległej do prostej $l: y = 2x - 1$ i przechodzącej przez punkt $K=(0, 3)$.
5.  Znajdź równanie prostej prostopadłej do prostej $m: x - 2y + 4 = 0$ i przechodzącej przez punkt $L=(1, 1)$.
6.  Oblicz pole trójkąta o wierzchołkach $D=(0, 0)$, $E=(5, 0)$ i $F=(3, 4)$.
7.  Dany jest trójkąt o wierzchołkach $P=(1, 2)$, $Q=(5, 3)$, $R=(3, 6)$. Sprawdź, czy ten trójkąt jest prostokątny.

## Odpowiedzi
1.  $S = (\frac{-5+3}{2}, \frac{2+(-8)}{2}) = (\frac{-2}{2}, \frac{-6}{2}) = (-1, -3)$.
2.  $d(M, N) = \sqrt{(-2-0)^2 + (1-(-7))^2} = \sqrt{(-2)^2 + 8^2} = \sqrt{4 + 64} = \sqrt{68} = 2\sqrt{17}$.
3.  Najpierw obliczamy współczynnik kierunkowy: $a = \frac{1-5}{3-1} = \frac{-4}{2} = -2$. Równanie prostej: $y - 5 = -2(x - 1) \implies y - 5 = -2x + 2 \implies y = -2x + 7$.
4.  Prosta szukana jest równoległa do $y = 2x - 1$, więc ma ten sam współczynnik kierunkowy $a=2$. Przechodzi przez $(0, 3)$, więc $b=3$ (bo jest to punkt przecięcia z osią $Oy$). Równanie: $y = 2x + 3$.
5.  Przekształcamy równanie prostej $m$ do postaci kierunkowej: $-2y = -x - 4 \implies y = \frac{1}{2}x + 2$. Współczynnik kierunkowy $a_m = \frac{1}{2}$. Prosta prostopadła ma współczynnik $a_p$, taki że $a_m \cdot a_p = -1$, czyli $\frac{1}{2} \cdot a_p = -1$, stąd $a_p = -2$. Równanie prostej prostopadłej: $y = -2x + b_p$. Przechodzi przez $(1, 1)$: $1 = -2 \cdot 1 + b_p \implies 1 = -2 + b_p \implies b_p = 3$. Równanie: $y = -2x + 3$.
6.  $P = \frac{1}{2} |0(0 - 4) + 5(4 - 0) + 3(0 - 0)| = \frac{1}{2} |0 + 20 + 0| = \frac{1}{2} \cdot 20 = 10$. (Można też zauważyć, że podstawa leży na osi $Ox$ i ma długość 5, a wysokość to współrzędna $y$ punktu $F$, czyli 4. Pole $= \frac{1}{2} \cdot 5 \cdot 4 = 10$).
7.  Obliczamy długości boków.
    $PQ^2 = (5-1)^2 + (3-2)^2 = 4^2 + 1^2 = 16 + 1 = 17$.
    $PR^2 = (3-1)^2 + (6-2)^2 = 2^2 + 4^2 = 4 + 16 = 20$.
    $QR^2 = (3-5)^2 + (6-3)^2 = (-2)^2 + 3^2 = 4 + 9 = 13$.
    Sprawdzamy twierdzenie Pitagorasa: $13 + 17 = 30 \neq 20$. $13 + 20 = 33 \neq 17$. $17 + 20 = 37 \neq 13$. Żaden z boków nie jest przeciwprostokątną. Trójkąt nie jest prostokątny.

## Szybka powtórka
1.  Jaki jest wzór na obliczenie współrzędnych środka odcinka?
2.  Jakie są współrzędne punktu $A$, jeśli jest on oddalony o 5 jednostek od początku układu współrzędnych i leży na osi $Oy$ powyżej punktu $(0,0)$?
3.  Jakie warunki muszą spełniać współczynniki kierunkowe dwóch prostych, aby były one prostopadłe?
4.  Jak zapisać równanie prostej przechodzącej przez punkt $(2, 0)$ i równoległej do osi $Ox$?
5.  Czy wzór na pole trójkąta wymaga użycia wartości bezwzględnej? Dlaczego?

## Diagram
```text
         ^ Oy
         |
         |     C=(xC, yC)
         |    /|
         |   / |
         |  /  | h
         | /   |
---------+-----M-----*--------> Ox
       A=(xA, yA) B=(xB, yB)
         |
```
Diagram przedstawia trójkąt ABC. AB to odcinek. M to rzut punktu C na prostą przechodzącą przez AB. ''h'' to wysokość trójkąta opuszczona na podstawę AB. W geometrii analitycznej można obliczyć długość podstawy i wysokość, lub użyć bezpośredniego wzoru na pole.'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'geometria'
  AND topic = 'geometria_analityczna';

UPDATE public.materials SET
  title = 'Prawdopodobieństwo na Maturze',
  content = '## Na egzaminie
Zadania z prawdopodobieństwa pojawiają się na maturze co roku, zazwyczaj jako jedno lub dwa pytania otwarte lub zamknięte, warte od 1 do nawet 4 punktów. CKE często sprawdza umiejętność obliczania prawdopodobieństwa w klasycznych sytuacjach losowych (rzuty kostką, losowanie kul, przekształcenia wzorów), a także w zadaniach wymagających umiejętności kombinatorycznych do policzenia zdarzeń sprzyjających i wszystkich możliwych. Kluczowe jest zrozumienie definicji prawdopodobieństwa i poprawne zastosowanie wzorów.

## Mapa tematu
W tej lekcji dowiesz się:
1. Czym jest prawdopodobieństwo i jakie są jego podstawowe własności.
2. Jak obliczyć prawdopodobieństwo zdarzenia w klasycznych sytuacjach losowych.
3. Jak stosować wzory na prawdopodobieństwo zdarzeń w prostych przypadkach.
4. Jak wykorzystać wiedzę o kombinatoryce (permutacje, kombinacje) do obliczania prawdopodobieństwa.
5. Jak interpretować wyniki obliczeń prawdopodobieństwa.
6. Jak radzić sobie z typowymi błędami przy obliczaniu prawdopodobieństwa.
7. Jak rozwiązywać zadania z prawdopodobieństwa na poziomie maturalnym.
8. Jak stosować podstawowe zasady rachunku prawdopodobieństwa.

## Definicje i wzory
Prawdopodobieństwo jest miarą szansy, że dane zdarzenie losowe zajdzie. Wynosi zawsze liczbę z przedziału $[0, 1]$.
- Prawdopodobieństwo $0$ oznacza zdarzenie niemożliwe.
- Prawdopodobieństwo $1$ oznacza zdarzenie pewne.

**Przestrzeń zdarzeń elementarnych ($\Omega$)**: Zbiór wszystkich możliwych wyników danego doświadczenia losowego.
*Przykład:* Rzut monetą – $\Omega = \{\text{orzeł, reszka}\}$. Rzut kostką – $\Omega = \{1, 2, 3, 4, 5, 6\}$.

**Zdarzenie losowe ($A$)**: Podzbiór przestrzeni zdarzeń elementarnych. Czyli pewien konkretny wynik lub grupę wyników.
*Przykład:* Rzut kostką – zdarzenie $A$ = "wyrzucenie parzystej liczby" = $\{2, 4, 6\}$.

**Klasyczna definicja prawdopodobieństwa**:
Jeśli $\Omega$ jest przestrzenią skończoną, a wszystkie zdarzenia elementarne są równie prawdopodobne, to prawdopodobieństwo zdarzenia $A$ wynosi:
$$ P(A) = \frac{|A|}{|\Omega|} $$
gdzie $|A|$ to liczba zdarzeń sprzyjających zdarzeniu $A$, a $|\Omega|$ to liczba wszystkich możliwych zdarzeń elementarnych.

**Podstawowe własności prawdopodobieństwa**:
1.  $0 \le P(A) \le 1$ dla każdego zdarzenia $A$.
2.  $P(\Omega) = 1$ (zdarzenie pewne, czyli zajście jednego z możliwych wyników).
3.  $P(\emptyset) = 0$ (zdarzenie niemożliwe, czyli $\emptyset$ to zbiór pusty).

**Prawdopodobieństwo zdarzeń przeciwnych**:
Jeśli $A''$ to zdarzenie przeciwne do $A$ (czyli zdarzenie, że $A$ nie zaszło), to:
$$ P(A'') = 1 - P(A) $$

**Prawdopodobieństwo sumy zdarzeń (zdarzeń rozłącznych)**:
Jeśli zdarzenia $A$ i $B$ są rozłączne (nie mogą zajść jednocześnie, $A \cap B = \emptyset$), to:
$$ P(A \cup B) = P(A) + P(B) $$

**Prawdopodobieństwo sumy zdarzeń (zdarzeń dowolnych)**:
Dla dowolnych zdarzeń $A$ i $B$:
$$ P(A \cup B) = P(A) + P(B) - P(A \cap B) $$
gdzie $P(A \cap B)$ to prawdopodobieństwo zajścia obu zdarzeń $A$ i $B$ jednocześnie.

**Schemat Bernoulliego (w uproszczeniu)**: Stosowany, gdy wykonujemy $n$ niezależnych prób, a w każdej próbie interesuje nas tylko sukces (zdarzenie $A$) lub porażka ($A''$). Prawdopodobieństwo sukcesu w jednej próbie wynosi $p$, a porażki $q = 1-p$. Prawdopodobieństwo uzyskania dokładnie $k$ sukcesów w $n$ próbach wynosi:
$$ P_n(k) = \binom{n}{k} p^k q^{n-k} $$
gdzie $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ to symbol Newtona (liczba kombinacji $k$ elementów z $n$).

## Przykład 1 — podstawowy
Rzucamy dwukrotnie symetryczną kostką sześcienną. Jakie jest prawdopodobieństwo, że suma wyrzuconych oczek będzie wynosić 8?

**Krok 1.** Określamy przestrzeń zdarzeń elementarnych $\Omega$.
Wyrzucamy kostką dwukrotnie. Wynik każdego rzutu to liczba od 1 do 6. Wszystkie możliwe pary wyników tworzą $\Omega$. Liczba wszystkich możliwych wyników to $6 \times 6 = 36$.
$|\Omega| = 36$.

**Krok 2.** Określamy zdarzenie losowe $A$.
Zdarzeniem $A$ jest wyrzucenie sumy oczek równej 8.
Szukamy par $(x, y)$, gdzie $x$ to wynik pierwszego rzutu, a $y$ to wynik drugiego rzutu, takie że $x+y=8$.

**Krok 3.** Wypisujemy zdarzenia sprzyjające zdarzeniu $A$.
Pary, których suma wynosi 8, to:
(2, 6)
(3, 5)
(4, 4)
(5, 3)
(6, 2)
Jest 5 takich par.
$|A| = 5$.

**Krok 4.** Obliczamy prawdopodobieństwo zdarzenia $A$.
Stosujemy klasyczną definicję prawdopodobieństwa:
$$ P(A) = \frac{|A|}{|\Omega|} = \frac{5}{36} $$

**Krok 5.** Sprawdzamy wynik.
Wynik $\frac{5}{36}$ jest liczbą z przedziału $[0, 1]$, co jest zgodne z definicją prawdopodobieństwa. Wszystkie możliwe wyniki (pary oczek) są równie prawdopodobne.

Odpowiedź: Prawdopodobieństwo, że suma wyrzuconych oczek będzie wynosić 8, wynosi $\frac{5}{36}$.

## Przykład 2 — maturalny
W urnie znajduje się 7 kul białych i 5 kul czarnych. Losujemy kolejno bez zwracania 3 kule. Jakie jest prawdopodobieństwo, że wśród wylosowanych kul będą dokładnie dwie kule białe?

**Krok 1.** Określamy przestrzeń zdarzeń elementarnych $|\Omega|$.
Losujemy 3 kule spośród $7+5=12$ kul. Kolejność losowania ma znaczenie przy opisywaniu procesu, ale dla wyniku (zestawu wylosowanych kul) możemy użyć kombinacji. Łączna liczba sposobów wyboru 3 kul z 12 to:
$$ |\Omega| = \binom{12}{3} = \frac{12!}{3!(12-3)!} = \frac{12!}{3!9!} = \frac{12 \cdot 11 \cdot 10}{3 \cdot 2 \cdot 1} = 2 \cdot 11 \cdot 10 = 220 $$
Jest 220 możliwych zestawów 3 kul.

**Krok 2.** Określamy zdarzenie losowe $A$.
Zdarzeniem $A$ jest wylosowanie dokładnie dwóch kul białych i jednej kuli czarnej.

**Krok 3.** Określamy liczbę zdarzeń sprzyjających $|A|$.
Musimy wybrać 2 kule białe spośród 7 białych ORAZ 1 kulę czarną spośród 5 czarnych.
Liczba sposobów wyboru 2 kul białych z 7 to: $\binom{7}{2} = \frac{7!}{2!5!} = \frac{7 \cdot 6}{2 \cdot 1} = 21$.
Liczba sposobów wyboru 1 kuli czarnej z 5 to: $\binom{5}{1} = \frac{5!}{1!4!} = 5$.
Ponieważ te wybory muszą zajść razem (zasada mnożenia), liczba kombinacji sprzyjających zdarzeniu $A$ wynosi:
$$ |A| = \binom{7}{2} \cdot \binom{5}{1} = 21 \cdot 5 = 105 $$

**Krok 4.** Obliczamy prawdopodobieństwo zdarzenia $A$.
$$ P(A) = \frac{|A|}{|\Omega|} = \frac{105}{220} $$

**Krok 5.** Upraszczamy wynik.
Dzielimy licznik i mianownik przez 5: $\frac{105}{5} = 21$, $\frac{220}{5} = 44$.
$$ P(A) = \frac{21}{44} $$

**Sprawdzenie**: Wynik $\frac{21}{44}$ jest liczbą z przedziału $[0, 1]$. Zastosowaliśmy kombinacje, co jest poprawne przy losowaniu bez zwracania, gdy kolejność nie ma znaczenia dla ostatecznego składu wylosowanych elementów.

Odpowiedź: Prawdopodobieństwo, że wśród wylosowanych kul będą dokładnie dwie kule białe, wynosi $\frac{21}{44}$.

## Przykład 3 — egzaminacyjny
W pudełku są liczby od 1 do 10. Losujemy jedną liczbę. Jakie jest prawdopodobieństwo, że będzie to liczba pierwsza lub podzielna przez 3?

**Krok 1.** Określamy przestrzeń zdarzeń elementarnych $|\Omega|$.
Losujemy jedną liczbę spośród liczb od 1 do 10.
$\Omega = \{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\}$.
$|\Omega| = 10$.

**Krok 2.** Określamy zdarzenia $A$ i $B$.
Zdarzenie $A$: wylosowana liczba jest pierwsza.
Zdarzenie $B$: wylosowana liczba jest podzielna przez 3.

**Krok 3.** Wypisujemy zdarzenia sprzyjające $A$ i $B$.
Liczby pierwsze w zbiorze od 1 do 10 to: $\{2, 3, 5, 7\}$.
$A = \{2, 3, 5, 7\}$.
$|A| = 4$.

Liczby podzielne przez 3 w zbiorze od 1 do 10 to: $\{3, 6, 9\}$.
$B = \{3, 6, 9\}$.
$|B| = 3$.

**Krok 4.** Sprawdzamy, czy zdarzenia są rozłączne.
Szukamy części wspólnej $A \cap B$. Jest to zbiór liczb, które są jednocześnie pierwsze i podzielne przez 3.
$A \cap B = \{3\}$.
Zdarzenia nie są rozłączne, ponieważ liczba 3 jest w obu zbiorach. $|A \cap B| = 1$.

**Krok 5.** Obliczamy prawdopodobieństwo sumy zdarzeń $A \cup B$.
Używamy wzoru: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$.
Najpierw obliczamy prawdopodobieństwa poszczególnych zdarzeń:
$P(A) = \frac{|A|}{|\Omega|} = \frac{4}{10}$
$P(B) = \frac{|B|}{|\Omega|} = \frac{3}{10}$
$P(A \cap B) = \frac{|A \cap B|}{|\Omega|} = \frac{1}{10}$

Teraz obliczamy prawdopodobieństwo sumy:
$$ P(A \cup B) = \frac{4}{10} + \frac{3}{10} - \frac{1}{10} = \frac{4+3-1}{10} = \frac{6}{10} $$

**Krok 6.** Upraszczamy wynik.
$$ P(A \cup B) = \frac{6}{10} = \frac{3}{5} $$

Alternatywnie, można było wypisać wszystkie liczby, które są pierwsze LUB podzielne przez 3:
$A \cup B = \{2, 3, 5, 7\} \cup \{3, 6, 9\} = \{2, 3, 5, 6, 7, 9\}$.
$|A \cup B| = 6$.
$P(A \cup B) = \frac{|A \cup B|}{|\Omega|} = \frac{6}{10} = \frac{3}{5}$.

Odpowiedź: Prawdopodobieństwo, że wylosowana liczba będzie pierwsza lub podzielna przez 3, wynosi $\frac{3}{5}$.

## Pułapki
*   **Niezrozumienie pojęcia "równie prawdopodobne"**: Klasyczna definicja prawdopodobieństwa działa tylko wtedy, gdy każdy wynik elementarny ma taką samą szansę zajścia. W zadaniach maturalnych zazwyczaj tak jest (symetryczna kostka, losowanie bez manipulacji), ale trzeba o tym pamiętać.
*   ** Mylenie kombinacji z wariacjami/permutacjami**: Przy wyborze grupy przedmiotów, gdzie kolejność nie ma znaczenia (np. wylosowane kule, karty), używamy kombinacji $\binom{n}{k}$. Jeśli kolejność ma znaczenie (np. ułożenie liter, pierwsze trzy miejsca na podium), używamy wariacji lub permutacji.
*   **Pomijanie części wspólnej przy sumie zdarzeń**: Przy obliczaniu prawdopodobieństwa sumy zdarzeń $P(A \cup B) = P(A) + P(B)$, należy pamiętać o odjęciu $P(A \cap B)$, jeśli zdarzenia nie są rozłączne. W przeciwnym razie policzymy elementy ze wspólnej części dwukrotnie.
*   **Błędy arytmetyczne przy obliczaniu lub upraszczaniu ułamków**: Upewnij się, że poprawnie wykonujesz działania na ułamkach, zwłaszcza przy dodawaniu i odejmowaniu. Upraszczaj wynik do najprostszej postaci.
*   **Losowanie bez zwracania a z zwracaniem**: Przy losowaniu bez zwracania, liczba dostępnych elementów w urnie maleje z każdym kolejnym losowaniem. Prawdopodobieństwo w kolejnych krokach zależy od poprzednich. Przy losowaniu z zwracaniem, prawdopodobieństwa pozostają stałe.

## Ćwiczenia do samodzielnego rozwiązania
1.  Rzucamy symetryczną monetą 3 razy. Jakie jest prawdopodobieństwo, że otrzymamy dokładnie dwa orły?
2.  Ze zbioru liczb $\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\}$ losujemy jedną liczbę. Jakie jest prawdopodobieństwo, że jest to liczba podzielna przez 4 lub przez 6?
3.  W koszyku znajduje się 5 jabłek i 3 gruszki. Wyjmujemy losowo 2 owoce. Jakie jest prawdopodobieństwo, że oba owoce są tego samego rodzaju?
4.  Rzucamy dwa razy kostką sześcienną. Jakie jest prawdopodobieństwo, że pierwsza kostka pokaże liczbę większą niż 4, a druga kostka liczbę mniejszą niż 3?
5.  W klasie jest 15 dziewcząt i 10 chłopców. Nauczyciel losuje 4 osoby do przedstawienia projektu. Jakie jest prawdopodobieństwo, że wylosowane osoby to 2 dziewczęta i 2 chłopców?
6.  Rzucamy monetą tak długo, aż wypadnie orzeł. Jakie jest prawdopodobieństwo, że będzie to najwyżej 4 rzut? (Zakładamy, że prawdopodobieństwo orła i reszki jest równe 1/2).

## Odpowiedzi
1.  Zdarzenia elementarne: $\{OOO, OOR, ORO, ROO, ORR, ROR, RRO, RRR\}$, $|\Omega|=8$. Zdarzenia sprzyjające (dokładnie 2 orły): $\{OOR, ORO, ROO\}$, $|A|=3$. Prawdopodobieństwo: $P(A) = \frac{3}{8}$.
2.  $|\Omega|=10$. Zdarzenie $A$: liczba podzielna przez 4: $\{4, 8\}$, $|A|=2$. Zdarzenie $B$: liczba podzielna przez 6: $\{6\}$, $|B|=1$. Zdarzenia są rozłączne ($A \cap B = \emptyset$). Prawdopodobieństwo $P(A \cup B) = P(A) + P(B) = \frac{2}{10} + \frac{1}{10} = \frac{3}{10}$.
3.  $|\Omega| = \binom{8}{2} = \frac{8 \cdot 7}{2} = 28$. Zdarzenie $A$: oba jabłka: $\binom{5}{2} = \frac{5 \cdot 4}{2} = 10$. Zdarzenie $B$: obie gruszki: $\binom{3}{2} = 3$. Zdarzenia są rozłączne. Prawdopodobieństwo $P(A \cup B) = P(A) + P(B) = \frac{10}{28} + \frac{3}{28} = \frac{13}{28}$.
4.  Zdarzenie $A$: pierwsza kostka $>4$ ($5, 6$), $P(A) = \frac{2}{6}$. Zdarzenie $B$: druga kostka $<3$ ($1, 2$), $P(B) = \frac{2}{6}$. Rzuty są niezależne. Prawdopodobieństwo $P(A \cap B) = P(A) \cdot P(B) = \frac{2}{6} \cdot \frac{2}{6} = \frac{1}{3} \cdot \frac{1}{3} = \frac{1}{9}$.
5.  $|\Omega| = \binom{25}{4} = \frac{25 \cdot 24 \cdot 23 \cdot 22}{4 \cdot 3 \cdot 2 \cdot 1} = 25 \cdot 2 \cdot 23 \cdot 11 = 12650$. Zdarzenie $A$: 2 dziewczęta i 2 chłopców: $\binom{15}{2} \cdot \binom{10}{2} = \frac{15 \cdot 14}{2} \cdot \frac{10 \cdot 9}{2} = 105 \cdot 45 = 4725$. Prawdopodobieństwo: $P(A) = \frac{4725}{12650}$. Po skróceniu (np. przez 25): $\frac{189}{506}$.
6.  Zdarzenie $A$: pierwszy orzeł w 1. rzucie. $P(A) = \frac{1}{2}$. Zdarzenie $B$: pierwszy orzeł w 2. rzucie (R O). $P(B) = \frac{1}{2} \cdot \frac{1}{2} = \frac{1}{4}$. Zdarzenie $C$: pierwszy orzeł w 3. rzucie (R R O). $P(C) = (\frac{1}{2})^3 = \frac{1}{8}$. Zdarzenie $D$: pierwszy orzeł w 4. rzucie (R R R O). $P(D) = (\frac{1}{2})^4 = \frac{1}{16}$. Zdarzenia te są rozłączne. Prawdopodobieństwo, że to będzie najwyżej 4. rzut, to suma ich prawdopodobieństw: $P(A \cup B \cup C \cup D) = \frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \frac{1}{16} = \frac{8+4+2+1}{16} = \frac{15}{16}$. Jest to również $1 - P(\text{brak orła w 4 rzutach}) = 1 - P(RRRR) = 1 - (\frac{1}{2})^4 = 1 - \frac{1}{16} = \frac{15}{16}$.

## Szybka powtórka
1.  Jak nazywa się zbiór wszystkich możliwych wyników doświadczenia losowego?
2.  Jakie wartości przyjmuje prawdopodobieństwo dowolnego zdarzenia?
3.  Jaki jest wzór na prawdopodobieństwo zdarzenia $A$, gdy wszystkie zdarzenia elementarne są równie prawdopodobne?
4.  Co oznacza zdarzenie przeciwne do $A$ i jaki jest wzór na jego prawdopodobieństwo?
5.  Kiedy stosujemy wzór na prawdopodobieństwo sumy zdarzeń rozłącznych?

## Diagram
```text
   KOSZ/URNA/POJEMNIK
   -------------------
   |  Elementy (np. kule) |
   |  Kolory, liczby, kształty|
   -------------------
          |
          | Losowanie (z zwracaniem / bez zwracania)
          V
     WYNIK DOŚWIADCZENIA
     -------------------
     |  Kolekcja wylosowanych |
     |  elementów lub ich     |
     |  właściwości         |
     -------------------
              |
              | Klasyfikacja wyniku
              V
    ZDARZENIE LOSOWE (A, B, ...)
    ---------------------------
    | Zbiór wyników sprzyjających |
    ---------------------------
              |
              | Obliczenie prawdopodobieństwa
              V
         P(A) = |A| / |Omega|
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'kombinatoryka'
  AND topic = 'prawdopodobienstwo';

UPDATE public.materials SET
  title = 'Podstawy Statystyki: Miary Tendencji Centralnej i Rozproszenia',
  content = '## Na egzaminie
Statystyka na maturze z matematyki na poziomie podstawowym pojawia się regularnie, zazwyczaj w zadaniach otwartych lub jako część szerszych zadań, gdzie wymaga od nas obliczenia średniej, mediany, dominanty lub odchylenia standardowego. Zadania te testują umiejętność interpretacji danych i stosowania podstawowych wzorów. Za poprawne obliczenia możemy zdobyć od 2 do 4 punktów.

## Mapa tematu
1.  Zrozumienie pojęcia statystyki i jej zastosowań.
2.  Obliczanie średniej arytmetycznej dla danych pogrupowanych i niepogrupowanych.
3.  Wyznaczanie mediany – wartości środkowej w szeregu danych.
4.  Identyfikacja dominanty (modusa) – najczęściej występującej wartości.
5.  Obliczanie rozstępu jako miary zróżnicowania danych.
6.  Obliczanie wariancji i odchylenia standardowego – kluczowych miar rozproszenia.
7.  Interpretacja obliczonych miar statystycznych.
8.  Zastosowanie zdobytej wiedzy w praktycznych zadaniach egzaminacyjnych.

## Definicje i wzory
Statystyka to dziedzina matematyki zajmująca się gromadzeniem, analizą, interpretacją i prezentacją danych. Pomaga zrozumieć zjawiska występujące w społeczeństwie, przyrodzie czy gospodarce.

**Dane statystyczne** to zbiór informacji liczbowych lub opisowych dotyczących określonego zagadnienia. Mogą to być np. wyniki sprawdzianu, wzrost uczniów, ceny produktów.

**Szereg danych** – uporządkowany zbiór danych. Dane możemy przedstawić jako:
*   **Szereg niepogrupowany:** lista poszczególnych wartości (np. 2, 3, 5, 3, 4).
*   **Szereg pogrupowany (wartości i ich częstości):** lista unikalnych wartości i liczby ich wystąpień (np. wartość 2 występuje 1 raz, wartość 3 występuje 2 razy, wartość 4 występuje 1 raz, wartość 5 występuje 1 raz).

**Miary tendencji centralnej** – opisują "typową" wartość w zbiorze danych.
*   **Średnia arytmetyczna ($\bar{x}$ lub $a_{sr}$):**
    *   Dla danych niepogrupowanych (wartości $x_1, x_2, ..., x_n$):
        $$ \bar{x} = \frac{x_1 + x_2 + \dots + x_n}{n} = \frac{1}{n} \sum_{i=1}^{n} x_i $$
        gdzie $n$ to liczba danych.
    *   Dla danych pogrupowanych (wartości $x_1, x_2, ..., x_k$ o częstościach $f_1, f_2, ..., f_k$):
        $$ \bar{x} = \frac{x_1 f_1 + x_2 f_2 + \dots + x_k f_k}{f_1 + f_2 + \dots + f_k} = \frac{\sum_{i=1}^{k} x_i f_i}{\sum_{i=1}^{k} f_i} $$
        gdzie $N = \sum_{i=1}^{k} f_i$ to łączna liczba danych.
*   **Mediana ($Me$):** Wartość środkowa w uporządkowanym szeregu danych.
    *   Jeśli liczba danych $n$ jest nieparzysta, mediana jest środkowym wyrazem (na pozycji $\frac{n+1}{2}$).
    *   Jeśli liczba danych $n$ jest parzysta, mediana jest średnią arytmetyczną dwóch środkowych wyrazów (na pozycjach $\frac{n}{2}$ i $\frac{n}{2} + 1$).
*   **Moda (Dominanta, $Mo$):** Wartość najczęściej występująca w zbiorze danych. Może być jedna, więcej niż jedna (wielomodalna) lub nie istnieć (gdy wszystkie wartości występują równie często).

**Miary rozproszenia** – opisują, jak bardzo dane są zróżnicowane wokół średniej.
*   **Rozstęp ($R$):** Różnica między największą a najmniejszą wartością w zbiorze danych.
    $$ R = x_{max} - x_{min} $$
*   **Wariancja ($D^2$ lub $\sigma^2$):** Średnia kwadratów odchyleń od średniej arytmetycznej.
    *   Dla danych niepogrupowanych:
        $$ D^2 = \frac{1}{n} \sum_{i=1}^{n} (x_i - \bar{x})^2 $$
    *   Dla danych pogrupowanych:
        $$ D^2 = \frac{1}{N} \sum_{i=1}^{k} (x_i - \bar{x})^2 f_i $$
        gdzie $N = \sum_{i=1}^{k} f_i$.
*   **Odchylenie standardowe ($\sigma$):** Pierwiastek kwadratowy z wariancji. Jest to miara, która ma te same jednostki co dane.
    $$ \sigma = \sqrt{D^2} $$

## Przykład 1 — podstawowy
Oblicz średnią arytmetyczną, medianę, dominantę i rozstęp dla następującego zbioru danych: 5, 2, 8, 5, 3, 9, 5.

**Krok 1.** Uporządkowanie danych**
Najpierw uporządkujmy dane rosnąco: 2, 3, 5, 5, 5, 8, 9.

**Krok 2.** Obliczenie średniej arytmetycznej**
Mamy $n=7$ danych. Suma danych wynosi $2+3+5+5+5+8+9 = 37$.
$$ \bar{x} = \frac{37}{7} \approx 5.29 $$

**Krok 3.** Wyznaczenie mediany**
Liczba danych $n=7$ jest nieparzysta. Mediana jest środkowym elementem na pozycji $\frac{7+1}{2} = 4$.
Uporządkowany ciąg: 2, 3, 5, **5**, 5, 8, 9.
Mediana $Me = 5$.

**Krok 4.** Identyfikacja dominanty**
Szukamy najczęściej występującej wartości. Wartość 5 występuje 3 razy, co jest największą liczbą wystąpień.
Moda $Mo = 5$.

**Krok 5.** Obliczenie rozstępu**
Największa wartość $x_{max} = 9$. Najmniejsza wartość $x_{min} = 2$.
$$ R = x_{max} - x_{min} = 9 - 2 = 7 $$

**Sprawdzenie:**
Średnia: $\frac{37}{7}$ - poprawnie.
Mediana: 4. pozycja w 7 elementach - poprawnie.
Moda: 5 występuje najczęściej - poprawnie.
Rozstęp: $9-2=7$ - poprawnie.

## Przykład 2 — maturalny
Zebrano dane dotyczące wieku 10 osób: 22, 25, 23, 25, 28, 25, 30, 24, 25, 23 lata. Oblicz odchylenie standardowe dla tych danych.

**Krok 1.** Uporządkowanie danych i obliczenie średniej arytmetycznej**
Uporządkowany ciąg: 22, 23, 23, 24, 25, 25, 25, 25, 28, 30.
Liczba danych $n=10$.
Suma danych: $22+23+23+24+25+25+25+25+28+30 = 250$.
$$ \bar{x} = \frac{250}{10} = 25 $$

**Krok 2.** Obliczenie odchyleń od średniej**
Obliczamy różnicę między każdą wartością a średnią:
$22-25 = -3$
$23-25 = -2$
$23-25 = -2$
$24-25 = -1$
$25-25 = 0$
$25-25 = 0$
$25-25 = 0$
$25-25 = 0$
$28-25 = 3$
$30-25 = 5$

**Krok 3.** Obliczenie kwadratów odchyleń**
Podnosimy obliczone odchylenia do kwadratu:
$(-3)^2 = 9$
$(-2)^2 = 4$
$(-2)^2 = 4$
$(-1)^2 = 1$
$0^2 = 0$
$0^2 = 0$
$0^2 = 0$
$0^2 = 0$
$3^2 = 9$
$5^2 = 25$

**Krok 4.** Obliczenie wariancji**
Sumujemy kwadraty odchyleń: $9+4+4+1+0+0+0+0+9+25 = 52$.
Wariancja:
$$ D^2 = \frac{52}{10} = 5.2 $$

**Krok 5.** Obliczenie odchylenia standardowego**
Obliczamy pierwiastek z wariancji:
$$ \sigma = \sqrt{5.2} \approx 2.28 $$

**Sprawdzenie:**
Średnia $\bar{x}=25$ - poprawnie.
Odchylenia: $-3, -2, -2, -1, 0, 0, 0, 0, 3, 5$ - suma równa 0, ok.
Kwadraty odchyleń: $9, 4, 4, 1, 0, 0, 0, 0, 9, 25$ - poprawnie.
Suma kwadratów: $9+4+4+1+9+25 = 52$ - poprawnie.
Wariancja: $\frac{52}{10} = 5.2$ - poprawnie.
Odchylenie standardowe: $\sqrt{5.2}$ - poprawnie.

## Przykład 3 — egzaminacyjny
W pewnej klasie przeprowadzono sprawdzian z matematyki. Wyniki (liczba punktów) przedstawiono w tabeli:

| Liczba punktów | Liczba uczniów |
| :------------- | :------------ |
| 3              | 2             |
| 4              | 5             |
| 5              | 7             |
| 6              | 4             |
| 7              | 2             |

Oblicz średnią arytmetyczną punktów uzyskanych przez uczniów tej klasy.

**Krok 1.** Określenie danych i ich częstości**
Mamy dane pogrupowane. Wartości $x_i$ to liczba punktów, a częstości $f_i$ to liczba uczniów.

**Krok 2.** Obliczenie iloczynów $x_i \cdot f_i$**
Dla każdej pary (wartość, częstość) obliczamy iloczyn:
$3 \cdot 2 = 6$
$4 \cdot 5 = 20$
$5 \cdot 7 = 35$
$6 \cdot 4 = 24$
$7 \cdot 2 = 14$

**Krok 3.** Obliczenie sumy iloczynów $\sum (x_i \cdot f_i)$**
Suma iloczynów: $6 + 20 + 35 + 24 + 14 = 99$.

**Krok 4.** Obliczenie sumy częstości $\sum f_i$ (łączna liczba uczniów)**
Suma częstości: $2 + 5 + 7 + 4 + 2 = 20$. Jest to łączna liczba uczniów w klasie.

**Krok 5.** Obliczenie średniej arytmetycznej**
Korzystamy ze wzoru dla danych pogrupowanych:
$$ \bar{x} = \frac{\sum (x_i \cdot f_i)}{\sum f_i} = \frac{99}{20} $$
$$ \bar{x} = 4.95 $$

**Sprawdzenie:**
Obliczono iloczyny i ich sumę - poprawnie.
Obliczono sumę częstości (łączna liczba uczniów) - poprawnie.
Podstawiono do wzoru na średnią dla danych pogrupowanych - poprawnie.
Wynik $\frac{99}{20} = 4.95$ - poprawnie.

## Pułapki
*   **Zapominanie o uporządkowaniu danych przy obliczaniu mediany:** Mediana jest wartością środkową *tylko* w uporządkowanym szeregu. Zawsze zacznij od posortowania danych.
*   **Błąd przy parzystej liczbie danych:** Gdy liczba danych jest parzysta, mediana to *średnia arytmetyczna* dwóch środkowych wartości, a nie jedna z nich.
*   **Mylenie wariancji z odchyleniem standardowym:** Wariancja jest kwadratem odchylenia standardowego. Pamiętaj, aby na końcu obliczyć pierwiastek z wariancji, aby uzyskać odchylenie standardowe.
*   **Błędy rachunkowe:** Obliczenia średniej, sumy kwadratów odchyleń mogą prowadzić do błędów. Zawsze warto sprawdzić obliczenia, np. sumę odchyleń od średniej (powinna wynosić 0).
*   **Niewłaściwe stosowanie wzorów dla danych pogrupowanych:** Upewnij się, że używasz właściwych wzorów, mnożąc wartość przez jej częstość, a nie traktując dane jako listę niepogrupowaną.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz średnią arytmetyczną, medianę i dominantę dla zbioru danych: 10, 12, 15, 12, 18, 11, 12.
2.  Znajdź rozstęp dla danych: 55, 48, 62, 50, 58, 65, 52.
3.  Oblicz odchylenie standardowe dla danych: 2, 4, 6, 8, 10.
4.  Dane dotyczące liczby błędów popełnionych przez uczniów na sprawdzianie:
    | Liczba błędów | Liczba uczniów |
    | :------------ | :------------ |
    | 0             | 3             |
    | 1             | 6             |
    | 2             | 8             |
    | 3             | 3             |
    Oblicz średnią arytmetyczną liczbę błędów.
5.  Dla danych z zadania 4 oblicz medianę i dominantę.
6.  Oblicz wariancję dla zbioru danych: 1, 2, 3, 4, 5.
7.  Zebrano informacje o czasie (w minutach) potrzebnym na dojazd do pracy przez 8 osób: 15, 25, 30, 20, 45, 35, 25, 15. Oblicz średnią arytmetyczną, medianę i rozstęp.

## Odpowiedzi
1.  Średnia: $\frac{12+10+15+12+18+11+12}{7} = \frac{90}{7} \approx 12.86$. Uporządkowane dane: 10, 11, 12, 12, 12, 15, 18. Mediana: 12. Moda: 12.
2.  $x_{max}=65$, $x_{min}=48$. Rozstęp $R = 65 - 48 = 17$.
3.  Dane: 2, 4, 6, 8, 10. Średnia $\bar{x} = \frac{2+4+6+8+10}{5} = \frac{30}{5} = 6$. Odchylenia: -4, -2, 0, 2, 4. Kwadraty odchyleń: 16, 4, 0, 4, 16. Suma kwadratów: $16+4+0+4+16 = 40$. Wariancja $D^2 = \frac{40}{5} = 8$. Odchylenie standardowe $\sigma = \sqrt{8} = 2\sqrt{2} \approx 2.83$.
4.  Suma iloczynów: $(0 \cdot 3) + (1 \cdot 6) + (2 \cdot 8) + (3 \cdot 3) = 0 + 6 + 16 + 9 = 31$. Suma częstości: $3+6+8+3 = 20$. Średnia $\bar{x} = \frac{31}{20} = 1.55$.
5.  Uporządkowane dane (nie trzeba ich wypisywać, wystarczy policzyć pozycje): 0, 0, 0, 1, 1, 1, 1, 1, 1, **2**, **2**, 2, 2, 2, 2, 2, 2, 3, 3, 3. Liczba danych $N=20$. Pozycje środkowe: $\frac{20}{2}=10$ i $\frac{20}{2}+1=11$. Na 10. pozycji jest 2, na 11. pozycji jest 2. Mediana $Me = \frac{2+2}{2} = 2$. Najczęściej występuje liczba błędów = 2 (8 uczniów). Moda $Mo = 2$.
6.  Dane: 1, 2, 3, 4, 5. Średnia $\bar{x} = 3$. Odchylenia: -2, -1, 0, 1, 2. Kwadraty odchyleń: 4, 1, 0, 1, 4. Suma kwadratów: $4+1+0+1+4=10$. Wariancja $D^2 = \frac{10}{5} = 2$.
7.  Uporządkowane dane: 15, 15, 20, 25, 25, 30, 35, 45. Liczba danych $n=8$. Średnia: $\frac{15+15+20+25+25+30+35+45}{8} = \frac{210}{8} = 26.25$. Mediana: pozycje $\frac{8}{2}=4$ i $4+1=5$. Wartości na tych pozycjach to 25 i 25. Mediana $Me = \frac{25+25}{2} = 25$. Rozstęp $R = 45 - 15 = 30$.

## Szybka powtórka
1.  Co opisuje średnia arytmetyczna?
2.  Jak obliczyć medianę dla nieparzystej liczby danych?
3.  Czym różni się moda od mediany?
4.  Jaki jest cel obliczania rozstępu?
5.  Dlaczego odchylenie standardowe jest często preferowane jako miara rozproszenia nad wariancją?

## Diagram
Nie ma prostego, uniwersalnego diagramu ASCII dla wszystkich miar statystycznych, ale można zilustrować rozkład danych względem średniej i mediany.

```text
Dane: 2, 3, 5, 5, 5, 8, 9
Średnia: ~5.29
Mediana: 5
Moda: 5
Rozstęp: 7

      ^
      |    *
      |    *
      |  * * *
      |*
      |      *
    --+----------------> Wartość
      0    2 3 5 8 9

Średnia (~5.29) i Mediana (5) są blisko środka skupienia danych.
Moda (5) wskazuje najczęstszą wartość.
Rozstęp (7) pokazuje zakres danych.
```'
WHERE exam_type = 'matura_podstawowa'
  AND category = 'kombinatoryka'
  AND topic = 'statystyka';

UPDATE public.materials SET
  title = 'Ułamki zwykłe i dziesiętne – wszystko, co musisz wiedzieć na egzaminie ósmoklasisty',
  content = '## Na egzaminie
Ułamki to podstawa wielu zadań na egzaminie ósmoklasisty. Pojawiają się zarówno w zadaniach zamkniętych (jedna poprawna odpowiedź), jak i otwartych, gdzie wymagane jest pełne rozwiązanie. Często stanowią kluczowy element zadań tekstowych, geometrycznych czy związanych z procentami. Umiejętność swobodnego operowania ułamkami, w tym zamiany między postaciami, dodawania, odejmowania, mnożenia i dzielenia, jest kluczowa do zdobycia punktów. Zazwyczaj zadania z ułamkami to pewne 3-5 punktów na egzaminie.

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił:
1.  Rozpoznawać i zapisywać ułamki zwykłe (właściwe, niewłaściwe, liczby mieszane) oraz dziesiętne.
2.  Zamieniać ułamki zwykłe na dziesiętne i odwrotnie.
3.  Porównywać ułamki zwykłe i dziesiętne.
4.  Wykonywać podstawowe działania arytmetyczne (dodawanie, odejmowanie, mnożenie, dzielenie) na ułamkach zwykłych.
5.  Wykonywać podstawowe działania arytmetyczne (dodawanie, odejmowanie, mnożenie, dzielenie) na ułamkach dziesiętnych.
6.  Stosować kolejność wykonywania działań na ułamkach.
7.  Rozwiązywać proste zadania tekstowe z wykorzystaniem ułamków.
8.  Rozumieć pojęcie skracania i rozszerzania ułamków.

## Definicje i wzory
*   **Ułamek zwykły**: Liczba zapisana za pomocą dwóch liczb całkowitych oddzielonych kreską ułamkową. Górna liczba to **licznik**, dolna to **mianownik**. Mianownik nie może być równy zero.
    *   $\frac{a}{b}$ – $a$ to licznik, $b$ to mianownik.
*   **Ułamek właściwy**: Licznik jest mniejszy od mianownika (np. $\frac{2}{5}$). Wartość ułamka właściwego jest mniejsza od 1.
*   **Ułamek niewłaściwy**: Licznik jest większy lub równy mianownikowi (np. $\frac{7}{3}$, $\frac{4}{4}$). Wartość ułamka niewłaściwego jest większa lub równa 1.
*   **Liczba mieszana**: Suma liczby całkowitej i ułamka właściwego (np. $2\frac{1}{3}$). Oznacza $2 + \frac{1}{3}$.
*   **Ułamek dziesiętny**: Ułamek, którego mianownik jest potęgą liczby 10 (10, 100, 1000 itd.). Zapisuje się go za pomocą przecinka oddzielającego część całkowitą od ułamkowej (np. $0,5$, $3,14$).
    *   $0,5 = \frac{5}{10}$
    *   $3,14 = 3\frac{14}{100} = \frac{314}{100}$
*   **Rozszerzanie ułamka**: Mnożenie licznika i mianownika przez tę samą liczbę różną od zera. Wartość ułamka się nie zmienia.
    *   $\frac{a}{b} = \frac{a \cdot k}{b \cdot k}$, gdzie $k \neq 0$.
    *   Przykład: $\frac{2}{3} = \frac{2 \cdot 5}{3 \cdot 5} = \frac{10}{15}$.
*   **Skracanie ułamka**: Dzielenie licznika i mianownika przez tę samą liczbę (ich wspólny dzielnik). Wartość ułamka się nie zmienia. Najczęściej skraca się ułamek do postaci nieskracalnej (gdy licznik i mianownik nie mają już wspólnych dzielników poza 1).
    *   $\frac{a}{b} = \frac{a : k}{b : k}$, gdzie $k$ jest wspólnym dzielnikiem $a$ i $b$, $k \neq 0$.
    *   Przykład: $\frac{12}{18} = \frac{12 : 6}{18 : 6} = \frac{2}{3}$.
*   **Zamiana ułamka niewłaściwego na liczbę mieszaną**: Dzielimy licznik przez mianownik. Wynik dzielenia to część całkowita, reszta z dzielenia to licznik nowego ułamka, a mianownik pozostaje bez zmian.
    *   $\frac{13}{5} \implies 13 : 5 = 2$ reszty $3$. Zatem $\frac{13}{5} = 2\frac{3}{5}$.
*   **Zamiana liczby mieszanej na ułamek niewłaściwy**: Mnożymy część całkowitą przez mianownik, dodajemy licznik, a wynik zapisujemy jako nowy licznik. Mianownik pozostaje bez zmian.
    *   $3\frac{2}{7} = \frac{3 \cdot 7 + 2}{7} = \frac{21 + 2}{7} = \frac{23}{7}$.
*   **Zamiana ułamka zwykłego na dziesiętny**: Rozszerzamy ułamek do mianownika 10, 100, 1000 itd., a następnie zapisujemy go z przecinkiem. Jeśli nie da się łatwo rozszerzyć do potęgi 10, można wykonać dzielenie licznika przez mianownik.
    *   $\frac{3}{4} = \frac{3 \cdot 25}{4 \cdot 25} = \frac{75}{100} = 0,75$.
    *   $\frac{1}{3} \implies 1 : 3 = 0,333...$ (ułamek dziesiętny okresowy).
*   **Zamiana ułamka dziesiętnego na zwykły**: Zapisujemy liczbę jako ułamek, gdzie mianownikiem jest odpowiednia potęga 10 (10 dla jednej cyfry po przecinku, 100 dla dwóch, 1000 dla trzech itd.), a licznikiem jest liczba bez przecinka. Następnie skracamy ułamek, jeśli to możliwe.
    *   $0,12 = \frac{12}{100} = \frac{3}{25}$.
    *   $1,5 = \frac{15}{10} = 1\frac{5}{10} = 1\frac{1}{2} = \frac{3}{2}$.

*   **Dodawanie i odejmowanie ułamków zwykłych**:
    *   Ułamki o **tych samych mianownikach**: Dodajemy (odejmujemy) liczniki, mianownik przepisujemy.
        *   $\frac{a}{c} + \frac{b}{c} = \frac{a+b}{c}$
        *   $\frac{a}{c} - \frac{b}{c} = \frac{a-b}{c}$
    *   Ułamki o **różnych mianownikach**: Sprowadzamy je do **wspólnego mianownika** (najlepiej najmniejszego wspólnego mianownika - NWW), a następnie dodajemy (odejmujemy) tak jak ułamki o tych samych mianownikach.
        *   $\frac{a}{b} + \frac{c}{d} = \frac{a \cdot k}{b \cdot k} + \frac{c \cdot m}{d \cdot m}$, gdzie $b \cdot k = d \cdot m =$ wspólny mianownik.
*   **Dodawanie i odejmowanie liczb mieszanych**: Można je zamienić na ułamki niewłaściwe lub dodać/odjąć części całkowite i ułamkowe osobno (jeśli nie ma potrzeby pożyczania).
    *   $2\frac{1}{3} + 1\frac{1}{2} = (2+1) + (\frac{1}{3} + \frac{1}{2}) = 3 + (\frac{2}{6} + \frac{3}{6}) = 3 + \frac{5}{6} = 3\frac{5}{6}$.
*   **Mnożenie ułamków zwykłych**: Mnożymy liczniki i mnożymy mianowniki. Można skracać przed mnożeniem.
    *   $\frac{a}{b} \cdot \frac{c}{d} = \frac{a \cdot c}{b \cdot d}$.
    *   $\frac{2}{5} \cdot \frac{3}{4} = \frac{2 \cdot 3}{5 \cdot 4} = \frac{6}{20} = \frac{3}{10}$. (Można skrócić 2 i 4: $\frac{\cancel{2}^1}{5} \cdot \frac{3}{\cancel{4}^2} = \frac{1 \cdot 3}{5 \cdot 2} = \frac{3}{10}$)
*   **Mnożenie liczby całkowitej przez ułamek**: Liczbę całkowitą traktujemy jak ułamek z mianownikiem 1.
    *   $5 \cdot \frac{2}{3} = \frac{5}{1} \cdot \frac{2}{3} = \frac{5 \cdot 2}{1 \cdot 3} = \frac{10}{3} = 3\frac{1}{3}$.
*   **Dzielenie ułamków zwykłych**: Dzielenie przez ułamek jest mnożeniem przez jego odwrotność.
    *   $\frac{a}{b} : \frac{c}{d} = \frac{a}{b} \cdot \frac{d}{c} = \frac{a \cdot d}{b \cdot c}$.
    *   $\frac{2}{3} : \frac{4}{5} = \frac{2}{3} \cdot \frac{5}{4} = \frac{2 \cdot 5}{3 \cdot 4} = \frac{10}{12} = \frac{5}{6}$.
*   **Kolejność wykonywania działań**:
    1.  Działania w nawiasach.
    2.  Potęgowanie i pierwiastkowanie (nie występują w tym temacie).
    3.  Mnożenie i dzielenie (od lewej do prawej).
    4.  Dodawanie i odejmowanie (od lewej do prawej).

*   **Dodawanie i odejmowanie ułamków dziesiętnych**: Wyrównujemy liczbę miejsc po przecinku dodając zera na końcu i wykonujemy dodawanie/odejmowanie jak liczb całkowitych, pamiętając o ustawieniu przecinka w odpowiednim miejscu.
    *   $1,25 + 3,4 = 1,25 + 3,40 = 4,65$.
    *   $5 - 0,75 = 5,00 - 0,75 = 4,25$.
*   **Mnożenie ułamków dziesiętnych**: Mnożymy liczby tak, jakby nie było przecinków. W wyniku końcowym stawiamy przecinek tak, aby liczba miejsc po przecinku była równa sumie miejsc po przecinku w mnożonych liczbach.
    *   $0,3 \cdot 0,04$: $3 \cdot 4 = 12$. W pierwszym czynniku jest 1 miejsce po przecinku, w drugim 2 miejsca. Suma to $1+2=3$ miejsca. Wynik: $0,012$.
*   **Dzielenie ułamków dziesiętnych**:
    *   Przez liczbę całkowitą: Wykonujemy dzielenie, przecinek w wyniku stawiamy nad przecinkiem w dzielnej.
        *   $1,5 : 3 = 0,5$.
    *   Przez liczbę dziesiętną: Przesuwamy przecinek w dzielniku (liczbie, przez którą dzielimy) w prawo tak, aby stał się liczbą całkowitą. Tyle samo miejsc przesuwamy przecinek w dzielnej (pierwszej liczbie).
        *   $1,2 : 0,4 = 12 : 4 = 3$.
        *   $0,6 : 0,03 = 60 : 3 = 20$.

## Przykład 1 — podstawowy
**Zadanie:** Oblicz: $\frac{2}{5} + \frac{1}{3}$

**Krok 1.** Zauważamy, że mianowniki są różne (5 i 3). Musimy je sprowadzić do wspólnego mianownika.
**Krok 2.** Znajdujemy najmniejszą wspólną wielokrotność (NWW) liczb 5 i 3. Jest to 15.
**Krok 3.** Rozszerzamy pierwszy ułamek, aby jego mianownik wynosił 15. Mnożymy licznik i mianownik przez 3 (bo $5 \cdot 3 = 15$).
$\frac{2}{5} = \frac{2 \cdot 3}{5 \cdot 3} = \frac{6}{15}$.
**Krok 4.** Rozszerzamy drugi ułamek, aby jego mianownik wynosił 15. Mnożymy licznik i mianownik przez 5 (bo $3 \cdot 5 = 15$).
$\frac{1}{3} = \frac{1 \cdot 5}{3 \cdot 5} = \frac{5}{15}$.
**Krok 5.** Teraz dodajemy ułamki o tych samych mianownikach.
$\frac{6}{15} + \frac{5}{15} = \frac{6+5}{15} = \frac{11}{15}$.

**Sprawdzenie:** Wynik $\frac{11}{15}$ jest ułamkiem nieskracalnym, ponieważ 11 jest liczbą pierwszą, a 15 nie jest jej wielokrotnością. Obliczenia wydają się poprawne.

## Przykład 2 — maturalny
**Zadanie:** Oblicz: $2\frac{1}{4} - 0,75 + \frac{3}{5} \cdot (1\frac{1}{2})$

**Krok 1.** Zamieniamy wszystkie liczby na jeden rodzaj – najwygodniej będzie na ułamki zwykłe nieskracalne.
*   $2\frac{1}{4} = \frac{2 \cdot 4 + 1}{4} = \frac{9}{4}$
*   $0,75 = \frac{75}{100} = \frac{3}{4}$ (po skróceniu przez 25)
*   $1\frac{1}{2} = \frac{1 \cdot 2 + 1}{2} = \frac{3}{2}$

Wyrażenie wygląda teraz tak: $\frac{9}{4} - \frac{3}{4} + \frac{3}{5} \cdot \frac{3}{2}$.

**Krok 2.** Wykonujemy działania zgodnie z kolejnością (najpierw mnożenie w nawiasie, ale tutaj nawiasem jest tylko mnożenie).
Mnożymy $\frac{3}{5} \cdot \frac{3}{2}$. Licznik z licznikiem, mianownik z mianownikiem:
$\frac{3}{5} \cdot \frac{3}{2} = \frac{3 \cdot 3}{5 \cdot 2} = \frac{9}{10}$.

Wyrażenie teraz wygląda tak: $\frac{9}{4} - \frac{3}{4} + \frac{9}{10}$.

**Krok 3.** Wykonujemy odejmowanie, ponieważ występuje ono przed dodawaniem od lewej strony. Ułamki $\frac{9}{4}$ i $\frac{3}{4}$ mają wspólny mianownik.
$\frac{9}{4} - \frac{3}{4} = \frac{9-3}{4} = \frac{6}{4}$.
Możemy od razu skrócić $\frac{6}{4} = \frac{3}{2}$.

Wyrażenie wygląda teraz tak: $\frac{3}{2} + \frac{9}{10}$.

**Krok 4.** Dodajemy pozostałe ułamki. Mają różne mianowniki (2 i 10). Sprowadzamy je do wspólnego mianownika, którym jest 10.
Pierwszy ułamek $\frac{3}{2}$ rozszerzamy przez 5:
$\frac{3}{2} = \frac{3 \cdot 5}{2 \cdot 5} = \frac{15}{10}$.

Dodajemy:
$\frac{15}{10} + \frac{9}{10} = \frac{15+9}{10} = \frac{24}{10}$.

**Krok 5.** Zamieniamy wynik na najprostszą postać. Ułamek $\frac{24}{10}$ można skrócić przez 2.
$\frac{24}{10} = \frac{12}{5}$.
Możemy też zapisać go jako liczbę mieszaną: $\frac{12}{5} = 2\frac{2}{5}$. Albo jako ułamek dziesiętny: $\frac{12}{5} = \frac{24}{10} = 2,4$.

**Odpowiedź:** Wynik to $\frac{12}{5}$ (lub $2\frac{2}{5}$, lub $2,4$).

## Przykład 3 — egzaminacyjny

**Zadanie:** W pewnej klasie $\frac{2}{5}$ uczniów uczy się gry na pianinie, a $\frac{1}{4}$ uczniów gra na gitarze. Pozostali uczniowie nie grają na żadnym z tych instrumentów. Jaki ułamek uczniów tej klasy nie gra na pianinie ani na gitarze?

**Krok 1.** Zidentyfikuj dane. Uczniowie grający na pianinie: $\frac{2}{5}$. Uczniowie grający na gitarze: $\frac{1}{4}$.
**Krok 2.** Oblicz, jaki ułamek uczniów gra na którymś z instrumentów. Dodajemy ułamki: $\frac{2}{5} + \frac{1}{4}$.
**Krok 3.** Sprowadzamy do wspólnego mianownika. NWW(5, 4) = 20.
$\frac{2}{5} = \frac{2 \cdot 4}{5 \cdot 4} = \frac{8}{20}$.
$\frac{1}{4} = \frac{1 \cdot 5}{4 \cdot 5} = \frac{5}{20}$.
Suma: $\frac{8}{20} + \frac{5}{20} = \frac{13}{20}$.
Jest to ułamek uczniów grających na pianinie LUB na gitarze.
**Krok 4.** Cała klasa to 1 (jedność). Aby obliczyć ułamek uczniów, którzy nie grają na żadnym instrumencie, odejmujemy od całości ułamek uczniów grających na instrumentach.
$1 - \frac{13}{20}$.
Zamieniamy 1 na ułamek o mianowniku 20: $1 = \frac{20}{20}$.
$\frac{20}{20} - \frac{13}{20} = \frac{7}{20}$.

**Odpowiedź:** $\frac{7}{20}$ uczniów tej klasy nie gra na pianinie ani na gitarze.

## Pułapki
*   **Brak sprowadzania do wspólnego mianownika**: Często uczniowie próbują dodawać lub odejmować liczniki i mianowniki osobno, np. $\frac{1}{2} + \frac{1}{3} = \frac{2}{5}$. To jest błąd! Pamiętaj o wspólnym mianowniku.
*   **Błędne skracanie**: Skracanie wykonujemy dzieląc licznik i mianownik przez tę samą liczbę. Mylone bywa skracanie z odejmowaniem, np. $\frac{5}{10}$ nie równa się $\frac{4}{9}$. Prawidłowo: $\frac{5}{10} = \frac{1}{2}$ (dzielimy licznik i mianownik przez 5).
*   **Kolejność wykonywania działań**: Przy bardziej złożonych wyrażeniach łatwo pomylić kolejność. Zawsze najpierw nawiasy, potem mnożenie/dzielenie, na końcu dodawanie/odejmowanie. Pamiętaj, że mnożenie i dzielenie "mają pierwszeństwo" przed dodawaniem i odejmowaniem.
*   **Błędy przy zamianie liczb mieszanych i ułamków niewłaściwych**: Np. przy zamianie $2\frac{3}{4}$ na ułamek niewłaściwy, zamiast $\frac{2 \cdot 4 + 3}{4} = \frac{11}{4}$, uczniowie piszą $\frac{10}{4}$ (nie dodając licznika) lub $\frac{11}{8}$ (mnożąc mianowniki).
*   **Błędy w działaniach na ułamkach dziesiętnych**: Szczególnie przy mnożeniu i dzieleniu. W mnożeniu kluczowe jest poprawne umiejscowienie przecinka. W dzieleniu przez liczbę dziesiętną łatwo zapomnieć o przesunięciu przecinka w obu liczbach.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz: $\frac{3}{7} + \frac{2}{5}$.
2.  Oblicz: $3\frac{1}{2} - 1\frac{3}{4}$.
3.  Oblicz: $\frac{4}{9} \cdot \frac{3}{8}$.
4.  Oblicz: $\frac{5}{6} : \frac{10}{3}$.
5.  Oblicz: $0,6 + 1,25 - 0,05$.
6.  Oblicz: $1,2 \cdot 0,4 - 0,03$.
7.  Zamień ułamek $\frac{17}{5}$ na liczbę mieszaną i ułamek dziesiętny.

## Odpowiedzi
1.  $\frac{3}{7} + \frac{2}{5} = \frac{15}{35} + \frac{14}{35} = \frac{29}{35}$.
2.  $3\frac{1}{2} - 1\frac{3}{4} = \frac{7}{2} - \frac{7}{4} = \frac{14}{4} - \frac{7}{4} = \frac{7}{4} = 1\frac{3}{4}$.
3.  $\frac{4}{9} \cdot \frac{3}{8} = \frac{\cancel{4}^1}{\cancel{9}^3} \cdot \frac{\cancel{3}^1}{\cancel{8}^2} = \frac{1}{3} \cdot \frac{1}{2} = \frac{1}{6}$.
4.  $\frac{5}{6} : \frac{10}{3} = \frac{5}{6} \cdot \frac{3}{10} = \frac{\cancel{5}^1}{\cancel{6}^2} \cdot \frac{\cancel{3}^1}{\cancel{10}^2} = \frac{1}{2} \cdot \frac{1}{2} = \frac{1}{4}$.
5.  $0,6 + 1,25 - 0,05 = 0,60 + 1,25 - 0,05 = 1,85 - 0,05 = 1,80$.
6.  $1,2 \cdot 0,4 - 0,03 = 0,48 - 0,03 = 0,45$.
7.  $\frac{17}{5} = 3\frac{2}{5} = 3,4$.

## Szybka powtórka
1.  Jaki jest warunek, aby można było dodać dwa ułamki zwykłe bez zmiany ich wartości?
2.  Jakie jest podstawowe działanie, które należy wykonać przed dodawaniem lub odejmowaniem ułamków o różnych mianownikach?
3.  Jak mnożymy dwa ułamki zwykłe?
4.  Przez co mnożymy, aby podzielić przez ułamek zwykły?
5.  Jak ustalamy pozycję przecinka w wyniku mnożenia dwóch ułamków dziesiętnych?'
WHERE exam_type = '8_klasa'
  AND category = 'liczby'
  AND topic = 'ulamki';

UPDATE public.materials SET
  title = 'Potęgi - od podstaw do matury',
  content = '## Na egzaminie
Potęgi pojawiają się na egzaminie ósmoklasisty regularnie, zazwyczaj w zadaniach otwartych, gdzie liczą się nie tylko poprawne obliczenia, ale i sposób zapisu. Zadania mogą dotyczyć prostego obliczania wartości potęg, ich porównywania, a także wykorzystania własności potęg w działaniach na liczbach. Często pojawiają się w zadaniach tekstowych, gdzie trzeba zastosować potęgowanie do obliczenia np. powierzchni, objętości czy liczby ludności. Za poprawne rozwiązanie zadania z potęgami można uzyskać od 1 do 3 punktów.

## Mapa tematu
1.  Rozumienie zapisu potęgi (podstawa i wykładnik).
2.  Obliczanie wartości potęg o dodatnich i ujemnych wykładnikach.
3.  Obliczanie wartości potęg o podstawie ułamkowej.
4.  Działania na potęgach: mnożenie i dzielenie potęg o tych samych podstawach.
5.  Działania na potęgach: mnożenie i dzielenie potęg o tych samych wykładnikach.
6.  Działania na potęgach: potęgowanie potęgi.
7.  Potęgowanie iloczynu i ilorazu.
8.  Zastosowanie własności potęg w obliczeniach.

## Definicje i wzory
*   **Potęga** to skrócony zapis iloczynu tej samej liczby przez siebie określoną liczbę razy.
    *   Zapis: $a^n$
    *   $a$ – podstawa potęgi (liczba, którą mnożymy)
    *   $n$ – wykładnik potęgi (liczba, ile razy mnożymy podstawę przez siebie)
    *   $a^n = \underbrace{a \cdot a \cdot a \cdot \ldots \cdot a}_{n \text{ razy}}$ (dla $n$ naturalnego dodatniego)

*   **Potęga o wykładniku 1:**
    *   $a^1 = a$
    *   Np.: $5^1 = 5$, $(-3)^1 = -3$

*   **Potęga o wykładniku 0:**
    *   $a^0 = 1$ (dla $a \neq 0$)
    *   Np.: $7^0 = 1$, $(-2)^0 = 1$, $(\frac{1}{2})^0 = 1$
    *   Wyrażenie $0^0$ jest nieokreślone.

*   **Potęga o wykładniku ujemnym:**
    *   $a^{-n} = \frac{1}{a^n}$ (dla $a \neq 0$)
    *   Np.: $2^{-3} = \frac{1}{2^3} = \frac{1}{8}$
    *   $(-3)^{-2} = \frac{1}{(-3)^2} = \frac{1}{9}$
    *   $(\frac{2}{3})^{-2} = \frac{1}{(\frac{2}{3})^2} = \frac{1}{\frac{4}{9}} = \frac{9}{4}$

*   **Własności działań na potęgach:**
    1.  **Mnożenie potęg o tych samych podstawach:**
        *   $a^m \cdot a^n = a^{m+n}$
        *   Np.: $2^3 \cdot 2^5 = 2^{3+5} = 2^8$
        *   $(-5)^2 \cdot (-5)^4 = (-5)^{2+4} = (-5)^6$

    2.  **Dzielenie potęg o tych samych podstawach:**
        *   $\frac{a^m}{a^n} = a^{m-n}$ (dla $a \neq 0$)
        *   Np.: $3^7 : 3^4 = 3^{7-4} = 3^3$
        *   $\frac{(-4)^5}{(-4)^2} = (-4)^{5-2} = (-4)^3$

    3.  **Potęgowanie potęgi:**
        *   $(a^m)^n = a^{m \cdot n}$
        *   Np.: $(5^2)^3 = 5^{2 \cdot 3} = 5^6$
        *   $((-2)^3)^4 = (-2)^{3 \cdot 4} = (-2)^{12}$

    4.  **Potęgowanie iloczynu:**
        *   $(a \cdot b)^n = a^n \cdot b^n$
        *   Np.: $(2 \cdot 3)^4 = 2^4 \cdot 3^4$
        *   $(-5 \cdot 7)^2 = (-5)^2 \cdot 7^2$

    5.  **Potęgowanie ilorazu:**
        *   $(\frac{a}{b})^n = \frac{a^n}{b^n}$ (dla $b \neq 0$)
        *   Np.: $(\frac{2}{5})^3 = \frac{2^3}{5^3}$
        *   $(\frac{-3}{4})^2 = \frac{(-3)^2}{4^2}$

    6.  **Mnożenie potęg o tych samych wykładnikach:**
        *   $a^n \cdot b^n = (a \cdot b)^n$
        *   Np.: $2^3 \cdot 5^3 = (2 \cdot 5)^3 = 10^3$
        *   $7^2 \cdot (-3)^2 = (7 \cdot (-3))^2 = (-21)^2$

    7.  **Dzielenie potęg o tych samych wykładnikach:**
        *   $\frac{a^n}{b^n} = (\frac{a}{b})^n$ (dla $b \neq 0$)
        *   Np.: $10^4 : 2^4 = (\frac{10}{2})^4 = 5^4$
        *   $\frac{6^3}{3^3} = (\frac{6}{3})^3 = 2^3$

## Przykład 1 — podstawowy
Oblicz wartość wyrażenia: $3^4 - 5^2 + 2^3$

**Krok 1.** Oblicz potęgę $3^4$.
$3^4 = 3 \cdot 3 \cdot 3 \cdot 3 = 9 \cdot 9 = 81$

**Krok 2.** Oblicz potęgę $5^2$.
$5^2 = 5 \cdot 5 = 25$

**Krok 3.** Oblicz potęgę $2^3$.
$2^3 = 2 \cdot 2 \cdot 2 = 8$

**Krok 4.** Podstaw obliczone wartości do wyrażenia.
$81 - 25 + 8$

**Krok 5.** Wykonaj działania odejmowania i dodawania od lewej do prawej.
$81 - 25 = 56$
$56 + 8 = 64$

**Sprawdzenie:** Obliczyliśmy każdą potęgę poprawnie, a następnie wykonaliśmy działania zgodnie z kolejnością. Wynik $64$ jest poprawny.

## Przykład 2 — maturalny
Uprość wyrażenie: $(\frac{2x^3}{3y^2})^2 \cdot (\frac{3y}{x^2})^3$, gdzie $x \neq 0$ i $y \neq 0$.

**Krok 1.** Zastosuj potęgowanie ilorazu i iloczynu w pierwszym nawiasie.
$(\frac{2x^3}{3y^2})^2 = \frac{(2x^3)^2}{(3y^2)^2} = \frac{2^2 \cdot (x^3)^2}{3^2 \cdot (y^2)^2}$

**Krok 2.** Uprość wyrażenie z pierwszego nawiasu, korzystając z własności potęgowania potęgi.
$\frac{4 \cdot x^{3 \cdot 2}}{9 \cdot y^{2 \cdot 2}} = \frac{4x^6}{9y^4}$

**Krok 3.** Zastosuj potęgowanie ilorazu w drugim nawiasie.
$(\frac{3y}{x^2})^3 = \frac{(3y)^3}{(x^2)^3} = \frac{3^3 \cdot y^3}{(x^2)^3}$

**Krok 4.** Uprość wyrażenie z drugiego nawiasu, korzystając z własności potęgowania potęgi.
$\frac{27y^3}{x^{2 \cdot 3}} = \frac{27y^3}{x^6}$

**Krok 5.** Pomnóż uproszczone wyrażenia.
$\frac{4x^6}{9y^4} \cdot \frac{27y^3}{x^6}$

**Krok 6.** Skróć wspólne czynniki licznika i mianownika. Zauważ, że $x^6$ skraca się, $y^3$ skraca się z $y^4$ (zostaje $y$ w mianowniku), a $9$ skraca się z $27$ (zostaje $3$ w liczniku).
$\frac{4 \cancel{x^6}}{9\cancel{y^4}_1} \cdot \frac{27^3 \cancel{y^3}}{\cancel{x^6}} = \frac{4}{1} \cdot \frac{3}{y} = \frac{12}{y}$

**Sprawdzenie:** Zastosowaliśmy kolejno potęgowanie ilorazu, potęgowanie iloczynu i potęgowanie potęgi. Następnie wykonaliśmy mnożenie i skrócenie. Wynik $\frac{12}{y}$ jest poprawny.

## Przykład 3 — egzaminacyjny

Oblicz wartość wyrażenia: $(5^{-2} \cdot 5^4) : 5^{-1}$

**Krok 1.** Wykonaj mnożenie potęg o tych samych podstawach w nawiasie.
$5^{-2} \cdot 5^4 = 5^{-2+4} = 5^2$

**Krok 2.** Podstaw wynik z powrotem do wyrażenia.
$5^2 : 5^{-1}$

**Krok 3.** Wykonaj dzielenie potęg o tych samych podstawach.
$5^2 : 5^{-1} = 5^{2 - (-1)} = 5^{2+1} = 5^3$

**Krok 4.** Oblicz ostateczną wartość potęgi.
$5^3 = 5 \cdot 5 \cdot 5 = 125$

**Sprawdzenie:** Zastosowaliśmy własność mnożenia, a następnie dzielenia potęg o tych samych podstawach. Obliczenia są poprawne.

## Pułapki
*   **Znaki przy potęgach ujemnych:** Często mylone są zasady dotyczące potęgowania liczb ujemnych. Pamiętaj:
    *   Potęga liczby ujemnej o **parzystym** wykładniku jest **dodatnia**. Np.: $(-2)^4 = 16$.
    *   Potęga liczby ujemnej o **nieparzystym** wykładniku jest **ujemna**. Np.: $(-2)^3 = -8$.
    *   Wyrażenie $-a^n$ oznacza $- (a^n)$. Np. $-2^4 = -(2^4) = -16$.
    *   Wyrażenie $(-a)^n$ oznacza potęgowanie całej podstawy $(-a)$.

*   **Wykładnik ujemny a odwrotność:** Wykładnik ujemny oznacza odwrotność liczby, a nie jej przeciwieństwo.
    *   $a^{-n} = \frac{1}{a^n}$, a **nie** $-a^n$. Np. $2^{-3} = \frac{1}{8}$, a nie $-8$.
    *   $(\frac{a}{b})^{-n} = (\frac{b}{a})^n$. Np. $(\frac{2}{3})^{-2} = (\frac{3}{2})^2 = \frac{9}{4}$.

*   **Dodawanie i odejmowanie potęg:** Nie ma prostej zasady na dodawanie lub odejmowanie potęg, chyba że mają tę samą podstawę i ten sam wykładnik. Nie można dodać $a^m + a^n$ do $a^{m+n}$ ani $a^{m-n}$.
    *   Np. $2^3 + 2^2 = 8 + 4 = 12$. **Nie jest to** $2^{3+2}=2^5=32$ ani $2^{3-2}=2^1=2$.

*   **Kolejność działań i własności potęg:** Należy uważać, kiedy stosować własności potęg, a kiedy wykonywać działania zgodnie z kolejnością. Własności potęg stosuje się przy mnożeniu i dzieleniu, a potęgowanie potęgi jest "silniejsze" niż mnożenie.
    *   Np. W wyrażeniu $2^3 \cdot 2^5$, stosujemy $a^m \cdot a^n = a^{m+n}$.
    *   W wyrażeniu $(2^3)^5$, stosujemy $(a^m)^n = a^{m \cdot n}$.
    *   W wyrażeniu $2^3 + 2^5$, nie stosujemy żadnej z tych własności, tylko obliczamy wartości i dodajemy.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz: $10^3 - 6^2 + 3^4$.
2.  Oblicz wartość wyrażenia: $4^{-2} + (\frac{1}{2})^3$.
3.  Uprość wyrażenie: $(x^5 \cdot x^3) : x^2$.
4.  Uprość wyrażenie: $\frac{(3a^4)^2}{6a^3}$.
5.  Oblicz: $2^5 \cdot 2^{-3} \cdot 2^0$.
6.  Uprość wyrażenie: $(\frac{a^2}{b^3})^3 \cdot (\frac{b}{a})^2$.
7.  Porównaj liczby: $3^{10}$ i $9^5$.

## Odpowiedzi
1.  $1000 - 36 + 81 = 964 + 81 = 1045$.
2.  $\frac{1}{16} + \frac{1}{8} = \frac{1}{16} + \frac{2}{16} = \frac{3}{16}$.
3.  $x^{5+3} : x^2 = x^8 : x^2 = x^{8-2} = x^6$.
4.  $\frac{3^2 \cdot (a^4)^2}{6a^3} = \frac{9a^8}{6a^3} = \frac{3}{2} a^{8-3} = \frac{3}{2} a^5$.
5.  $2^{5+(-3)+0} = 2^2 = 4$.
6.  $\frac{(a^2)^3}{(b^3)^3} \cdot \frac{b^2}{a^2} = \frac{a^6}{b^9} \cdot \frac{b^2}{a^2} = \frac{a^{6-2}}{b^{9-2}} = \frac{a^4}{b^7}$.
7.  $9^5 = (3^2)^5 = 3^{2 \cdot 5} = 3^{10}$. Liczby są równe.

## Szybka powtórka
1.  Jaka jest definicja potęgi $a^n$?
2.  Ile wynosi $a^0$ dla $a \neq 0$?
3.  Jak zapisać $a^{-n}$ używając ułamka?
4.  Jak mnożymy potęgi o tych samych podstawach?
5.  Jak potęgujemy potęgę $(a^m)^n$?

## Diagram
```text
Podstawa ^ Wykładnik = Potęga
   a     ^     n     = a^n

Ważne własności:
 a^m * a^n = a^(m+n)    (te same podstawy, mnożenie -> dodaj wykładniki)
 a^m / a^n = a^(m-n)    (te same podstawy, dzielenie -> odejmij wykładniki)
(a^m)^n = a^(m*n)       (potęgowanie potęgi -> pomnóż wykładniki)
(a*b)^n = a^n * b^n     (potęgowanie iloczynu)
(a/b)^n = a^n / b^n     (potęgowanie ilorazu)

Szczególne przypadki:
a^0 = 1 (dla a != 0)
a^1 = a
a^-n = 1/a^n (dla a != 0)
```'
WHERE exam_type = '8_klasa'
  AND category = 'liczby'
  AND topic = 'potegi';

UPDATE public.materials SET
  title = 'Procenty — obliczenia i zadania tekstowe',
  content = '## Na egzaminie
Procenty z liczby, jaki procent stanowi liczba, zadania o ceny i rabaty — bardzo częsty temat na egzaminie ósmoklasisty.

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
$p\%$ z $N$: $\dfrac{p}{100} \cdot N$

**Jaki procent?** $\dfrac{\text{część}}{\text{całość}} \cdot 100\%$

**Schemat:** całość = 100%.

## Przykład 1 — podstawowy
Bluzka kosztuje 120 zł. W wyprzedaży taniej o 25%. Ile kosztuje po obniżce?

**Krok 1.** Obniżka: $25\% \cdot 120 = 30$ zł

**Krok 2.** Cena: $120 - 30 = 90$ zł

Alternatywnie: $120 \cdot 0{,}75 = 90$ zł.

## Pułapki
- Spadek o 25% $\neq$ wzrost o 25% do powrotu
- „O ile procent więcej” — dziel przez mniejszą wartość (początkową)
- 100% to całość, 50% to połowa
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. Ile to 20% z 150?
5. 18 z 24 to ile procent?
6. Cena 200 zł + 10% — ile wynosi?

## Odpowiedzi

1. Ile to 20% z 150? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. 18 z 24 to ile procent? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Cena 200 zł + 10% — ile wynosi? — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

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

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
**Podstawianie:** w miejsce $x$ wstaw liczbę i licz według kolejności: nawiasy → potęgi → $\times /$ → $+/-$.

**Wyrazy podobne:** ta sama część literowa, np. $2x + 3x = 5x$.

**Mnożenie przez nawias:** $2(x + 3) = 2x + 6$.

## Przykład 1 — podstawowy
Oblicz wartość $2x^2 - 3x + 1$ dla $x = -2$.

**Krok 1.** $2 \cdot (-2)^2 = 2 \cdot 4 = 8$

**Krok 2.** $-3 \cdot (-2) = 6$

**Krok 3.** $8 + 6 + 1 = 15$

## Pułapki
- **Minus przy podstawianiu:** $x = -2$ w $x^2$ daje $(-2)^2 = 4$
- **$2x^2$ vs $(2x)^2$** — to nie to samo
- Redukuj tylko wyrazy **podobne**
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. Wartość $3x - 1$ dla $x = 4$?
5. Uprość $5a + 2b - a + 3b$.
6. Rozwiń $3(2x - 1)$.

## Odpowiedzi

1. Wartość $3x - 1$ dla $x = 4$? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. Uprość $5a + 2b - a + 3b$. — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Rozwiń $3(2x - 1)$. — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

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

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
Cel: samo $x$ po jednej stronie, liczba po drugiej.

**Zasady:** to samo dodaj/odejmij; mnoż/dziel obie strony przez tę samą liczbę $\neq 0$.

**Sprawdzenie:** podstaw wynik — obie strony muszą być równe.

## Przykład 1 — podstawowy
Rozwiąż: $5x - 3 = 2x + 9$

**Krok 1.** $5x - 2x = 9 + 3$

**Krok 2.** $3x = 12$

**Krok 3.** $x = 4$

**Sprawdzenie:** $17 = 17$ ✓

## Pułapki
- Zmiana znaku przy przenoszeniu
- Mnożenie nawiasu: $2(x + 1) = 2x + 2$
- Zawsze sprawdź wynik
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. Rozwiąż $4x + 5 = 21$.
5. Co robić z $3(x - 2) = 12$?
6. Czy $x = 0$ spełnia $2x = x$?

## Odpowiedzi

1. Rozwiąż $4x + 5 = 21$. — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. Co robić z $3(x - 2) = 12$? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Czy $x = 0$ spełnia $2x = x$? — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

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

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
**Prostokąt:** $P = ab$

**Trójkąt:** $P = \dfrac{ah}{2}$ ($h$ — wysokość na podstawę $a$)

**Trapez:** $P = \dfrac{(a + b)h}{2}$

**Równoległobok:** $P = ah$

**Koło:** $P = \pi r^2$

## Przykład 1 — podstawowy
Trapez ma podstawy 6 cm i 10 cm, wysokość 4 cm. Oblicz pole.

$$P = \frac{(6 + 10) \cdot 4}{2} = \frac{64}{2} = 32\text{ cm}^2$$

## Pułapki
- **Wysokość** musi być prostopadła do podstawy
- **$r$ vs $d$** w kole — promień to połowa średnicy
- **Jednostki** — cm², nie cm
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. Pole prostokąta 5 cm × 8 cm?
5. Trójkąt: $a = 10$, $h = 6$ — pole?
6. Koło $r = 3$ — pole (z $\pi$)?

## Odpowiedzi

1. Pole prostokąta 5 cm × 8 cm? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. Trójkąt: $a = 10$, $h = 6$ — pole? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Koło $r = 3$ — pole (z $\pi$)? — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

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

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
**Definicja:** $O = a + b + c + \ldots$ (suma wszystkich boków).

**Kwadrat:** $O = 4a$

**Prostokąt:** $O = 2a + 2b$

**Trójkąt:** $O = a + b + c$

**Koło:** $L = 2\pi r$ (długość okręgu)

## Przykład 1 — podstawowy
Prostokąt ma boki 7 cm i 11 cm. Oblicz obwód.

$$O = 2 \cdot 7 + 2 \cdot 11 = 14 + 22 = 36\text{ cm}$$

## Pułapki
- **Obwód $\neq$ pole** — inne jednostki (cm vs cm²)
- Przy wielokącie **nie pomijaj żadnego boku**
- Okrąg — używaj $L = 2\pi r$, nie myl z polem
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. Obwód kwadratu o boku 9 cm?
5. Trójkąt o bokach 3, 4, 5 — obwód?
6. Czym różni się obwód koła od pola koła?

## Odpowiedzi

1. Obwód kwadratu o boku 9 cm? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. Trójkąt o bokach 3, 4, 5 — obwód? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Czym różni się obwód koła od pola koła? — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

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

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
**Trójkąt:** suma kątów wewnętrznych = $180°$.

**Trójkąt prostokątny:** jeden kąt $90°$, dwa pozostałe ostre, suma $90°$.

**Wielokąt $n$-kątny:** suma kątów = $(n - 2) \cdot 180°$.

**Kąty przy prostej równoległej** — kąty odpowiadające i naprzemianległe.

## Przykład 1 — podstawowy
W trójkącie dwa kąty mają miary $65°$ i $48°$. Oblicz trzeci kąt.

$$\alpha = 180° - 65° - 48° = 67°$$

## Pułapki
- Suma trzech kątów trójkąta **zawsze** $180°$
- Kąt prosty dokładnie $90°$
- Przy równoległych — rozróżnij kąty odpowiadające i naprzemianległe
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. Trzeci kąt przy $90°$ i $45°$?
5. Suma kątów czworokąta?
6. Ile wynosi kąt prosty?

## Odpowiedzi

1. Trzeci kąt przy $90°$ i $45°$? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. Suma kątów czworokąta? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Ile wynosi kąt prosty? — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

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

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
**Układ współrzędnych:** oś pozioma $x$ (argument), pionowa $y$ (wartość).

**Punkt na wykresie:** $(x, f(x))$ — z wykresu odczytujesz $y$ dla danego $x$.

**Miejsce zerowe:** punkt przecięcia z osią $x$ ($y = 0$).

**Rosnąca** — wykres idzie w górę (w lewo → w prawo); **malejąca** — w dół.

## Przykład 1 — podstawowy
Z wykresu prostej przechodzącej przez $(0, 2)$ i $(2, 6)$ odczytaj $f(1)$.

Prosta rosnąca równomiernie: między $x = 0$ a $x = 2$ wartość rośnie o 4, więc przy $x = 1$: $f(1) = 4$.

## Pułapki
- Odczytuj **dokładnie** z podziałki osi
- Miejsce zerowe to $x$, nie $y$
- Wykres $\neq$ tabela — sprawdzaj obie osie
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. Co oznacza punkt $(3, -1)$ na wykresie?
5. Gdzie szukać miejsc zerowych?
6. Jak rozpoznać, że funkcja jest stała?

## Odpowiedzi

1. Co oznacza punkt $(3, -1)$ na wykresie? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. Gdzie szukać miejsc zerowych? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Jak rozpoznać, że funkcja jest stała? — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

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

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
$$\bar{x} = \frac{x_1 + x_2 + \cdots + x_n}{n}$$

**Interpretacja:** „typowy” wynik zbioru — np. średnia ocen, średnia temperatura.

**Brakująca wartość:** jeśli znasz średnią i pozostałe liczby, sumuj i wylicz brakującą.

## Przykład 1 — podstawowy
Oceny: 4, 5, 3, 5, 5, 4. Oblicz średnią.

Suma: $4 + 5 + 3 + 5 + 5 + 4 = 26$, $n = 6$

$$\bar{x} = \frac{26}{6} \approx 4{,}33$$

## Pułapki
- **Dziel przez liczbę elementów**, nie przez największą wartość
- Średnia może **nie być** liczbą całkowitą
- Jedna wartość skrajna mocno przesuwa średnią
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. Średnia z 2, 4, 6, 8?
5. Suma pięciu liczb to 50 — jaka średnia?
6. Czym różni się średnia od mediany?

## Odpowiedzi

1. Średnia z 2, 4, 6, 8? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. Suma pięciu liczb to 50 — jaka średnia? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Czym różni się średnia od mediany? — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

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

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
**Diagram słupkowy:** wysokość (lub długość) słupka = wartość; dobre do porównań.

**Diagram kołowy:** kąt (lub procent) wycinka = udział w całości; całość = $360°$ lub 100%.

**Przeliczanie:** udział = $\dfrac{\text{wartość}}{\text{suma}} \cdot 100\%$.

## Przykład 1 — podstawowy
W klasie 30 uczniów: 12 osób gra w piłkę, 8 w koszykówkę, reszta w siatkówkę. Ile osób gra w siatkówkę?

**Krok 1.** $30 - 12 - 8 = 10$ osób

**Krok 2.** Udział: $\dfrac{10}{30} \approx 33{,}3\%$

## Pułapki
- W diagramie kołowym **suma wycinków = całość**
- Sprawdź skalę osi na diagramie słupkowym
- Procenty zaokrąglaj rozsądnie
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. Co pokazuje wysokość słupka?
5. Całość w diagramie kołowym to ile procent?
6. Jak obliczyć udział procentowy?

## Odpowiedzi

1. Co pokazuje wysokość słupka? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. Całość w diagramie kołowym to ile procent? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Jak obliczyć udział procentowy? — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

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

## Mapa tematu

W tej lekcji przejdziesz przez:

1. **Definicje i wzory**
2. **Przykład 1 — podstawowy**
3. **Pułapki**
4. **Szybka powtórka**

Po lekturze przejdź do **zadań w arenie** — tam utrwalisz materiał na przykładach maturalnych.

## Definicje i wzory
$$P(A) = \frac{\text{liczba wyników sprzyjających}}{\text{liczba wszystkich wyników}}$$

Wartość od 0 (niemożliwe) do 1 (pewne).

**Zdarzenie przeciwne:** $P(\text{nie } A) = 1 - P(A)$.

## Przykład 1 — podstawowy
Rzucamy symetryczną kostką. Prawdopodobieństwo wyrzucenia liczby większej niż 4?

**Krok 1.** Sprzyjające: 5, 6 → 2 wyniki

**Krok 2.** Wszystkich: 6

**Krok 3.** $P = \dfrac{2}{6} = \dfrac{1}{3}$

## Pułapki
- **Wszystkie wyniki jednakowo prawdopodobne** — warunek modelu klasycznego
- „Co najmniej jeden” — czasem łatwiej $1 - P(\text{żaden})$
- $P = \dfrac{1}{2}$ przy monecie tylko gdy uczciwa
## Ćwiczenia do samodzielnego rozwiązania

1. Rozwiąż zadanie analogiczne do **Przykładu 1** — zmień liczby, zachowaj strukturę.
2. Wyjaśnij własnymi słowami główną definicję z sekcji **Definicje i wzory**.
3. Wypisz 3 typowe błędy, o których mowa w **Pułapkach**, i jak ich unikać.
4. $P(\text{orzeł})$ przy rzucie monetą?
5. $P(\text{parzysta})$ na kostce?
6. Ile wynosi $P(\text{pewne})$?

## Odpowiedzi

1. $P(\text{orzeł})$ przy rzucie monetą? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
2. $P(\text{parzysta})$ na kostce? — patrz sekcja **Definicje i wzory** i **Przykład 1**.
3. Ile wynosi $P(\text{pewne})$? — patrz sekcja **Definicje i wzory** i **Przykład 1**.

*Pełne obliczenia do zadań 1–3 znajdziesz stosując kroki z przykładów powyżej.*

## Szybka powtórka
1. $P(\text{orzeł})$ przy rzucie monetą?
2. $P(\text{parzysta})$ na kostce?
3. Ile wynosi $P(\text{pewne})$?'
WHERE exam_type = '8_klasa'
  AND category = 'kombinatoryka'
  AND topic = 'prawdopodobienstwo';
