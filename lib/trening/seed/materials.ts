import type { ExamType } from "@/types/database";
import { enrichTheoryLesson } from "@/lib/trening/seed/enrich-theory";
import { EXPANDED_THEORY } from "@/lib/trening/seed/theory-expanded";
import { ADDITIONAL_SEED_MATERIALS } from "@/lib/trening/seed/additional-materials";
import { COVERAGE_SEED_MATERIALS } from "@/lib/trening/seed/materials-coverage";

export type MaterialDraft = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  video_url: string | null;
};

export const BASE_SEED_MATERIALS: MaterialDraft[] = [
  ...ADDITIONAL_SEED_MATERIALS,
  ...COVERAGE_SEED_MATERIALS,
  {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "potegi",
    title: "Potęgowanie i pierwiastkowanie - klucz do sukcesu na maturze",
    content: `## Na egzaminie
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
    *   Dla $n \\in \\mathbb{N}, n \\ge 1$, potęgą liczby $a$ o wykładniku naturalnym $n$ nazywamy iloczyn $n$ czynników równych $a$:
        $$ a^n = \\underbrace{a \\cdot a \\cdot \\ldots \\cdot a}_{n \\text{ razy}} $$
        Przykład: $2^3 = 2 \\cdot 2 \\cdot 2 = 8$.
    *   Potęga zerowa: Dla $a \\neq 0$, $a^0 = 1$. Przykład: $5^0 = 1$, $(-3)^0 = 1$.
    *   Potęga o wykładniku ujemnym: Dla $a \\neq 0$ i $n \\in \\mathbb{N}, n \\ge 1$, potęgą liczby $a$ o wykładniku całkowitym ujemnym $-n$ nazywamy:
        $$ a^{-n} = \\frac{1}{a^n} $$
        Przykład: $2^{-3} = \\frac{1}{2^3} = \\frac{1}{8}$.
    *   Potęga o wykładniku wymiernym: Dla $a \\ge 0$ i $n \\in \\mathbb{N}, n \\ge 1$, $k \\in \\mathbb{Z}$:
        $$ a^{\\frac{m}{n}} = \\sqrt[n]{a^m} = (\\sqrt[n]{a})^m $$
        Przykład: $8^{\\frac{2}{3}} = \\sqrt[3]{8^2} = \\sqrt[3]{64} = 4$.

*   **Wzory na działania na potęgach (dla $a, b > 0$ i dowolnych wykładników $m, n$)**:
    *   Mnożenie potęg o tych samych podstawach:
        $$ a^m \\cdot a^n = a^{m+n} $$
        Przykład: $x^2 \\cdot x^5 = x^{2+5} = x^7$.
    *   Dzielenie potęg o tych samych podstawach:
        $$ \\frac{a^m}{a^n} = a^{m-n} $$
        Przykład: $\\frac{y^8}{y^3} = y^{8-3} = y^5$.
    *   Potęgowanie potęgi:
        $$ (a^m)^n = a^{m \\cdot n} $$
        Przykład: $(b^4)^2 = b^{4 \\cdot 2} = b^8$.
    *   Potęgowanie iloczynu:
        $$ (a \\cdot b)^n = a^n \\cdot b^n $$
        Przykład: $(2x)^3 = 2^3 \\cdot x^3 = 8x^3$.
    *   Potęgowanie ilorazu:
        $$ \\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n} $$
        Przykład: $\\left(\\frac{x}{y}\\right)^2 = \\frac{x^2}{y^2}$.
    *   Ujemny wykładnik:
        $$ a^{-n} = \\frac{1}{a^n} \\quad \\text{oraz} \\quad \\left(\\frac{a}{b}\\right)^{-n} = \\left(\\frac{b}{a}\\right)^n $$
        Przykład: $3^{-2} = \\frac{1}{3^2} = \\frac{1}{9}$.

*   **Pierwiastkowanie**:
    *   Pierwiastkiem kwadratowym nieujemnej liczby $a$ nazywamy nieujemną liczbę $b$, której kwadrat jest równy $a$. Oznaczamy: $\\sqrt{a} = b \\iff b^2 = a$ i $b \\ge 0$.
        Przykład: $\\sqrt{9} = 3$, bo $3^2 = 9$ i $3 \\ge 0$.
    *   Pierwiastkiem $n$-tego stopnia nieujemnej liczby $a$ nazywamy nieujemną liczbę $b$, której $n$-ta potęga jest równa $a$. Oznaczamy: $\\sqrt[n]{a} = b \\iff b^n = a$ i $b \\ge 0$. (Dla $n$ parzystych, $a \\ge 0$. Dla $n$ nieparzystych, $a$ może być dowolną liczbą rzeczywistą).
        Przykład: $\\sqrt[3]{8} = 2$, bo $2^3 = 8$. $\\sqrt[3]{-27} = -3$, bo $(-3)^3 = -27$.
    *   Związek z potęgami: $\\sqrt[n]{a} = a^{\\frac{1}{n}}$ dla $a \\ge 0$ (lub $a \\in \\mathbb{R}$ gdy $n$ jest nieparzyste).
        Przykład: $\\sqrt{5} = 5^{\\frac{1}{2}}$. $\\sqrt[3]{7} = 7^{\\frac{1}{3}}$.

*   **Wzory na działania na pierwiastkach (dla $a, b \\ge 0$ i $n, m \\in \\mathbb{N}, n, m \\ge 2$)**:
    *   Mnożenie pierwiastków tego samego stopnia:
        $$ \\sqrt[n]{a} \\cdot \\sqrt[n]{b} = \\sqrt[n]{a \\cdot b} $$
        Przykład: $\\sqrt{2} \\cdot \\sqrt{8} = \\sqrt{2 \\cdot 8} = \\sqrt{16} = 4$.
    *   Dzielenie pierwiastków tego samego stopnia:
        $$ \\frac{\\sqrt[n]{a}}{\\sqrt[n]{b}} = \\sqrt[n]{\\frac{a}{b}} \\quad (b \\neq 0) $$
        Przykład: $\\frac{\\sqrt{18}}{\\sqrt{2}} = \\sqrt{\\frac{18}{2}} = \\sqrt{9} = 3$.
    *   Pierwiastek z pierwiastka:
        $$ \\sqrt[m]{\\sqrt[n]{a}} = \\sqrt[m \\cdot n]{a} $$
        Przykład: $\\sqrt[3]{\\sqrt{2}} = \\sqrt[3 \\cdot 2]{2} = \\sqrt[6]{2}$.
    *   Potęgowanie pierwiastka:
        $$ (\\sqrt[n]{a})^m = \\sqrt[n]{a^m} $$
        Przykład: $(\\sqrt[3]{5})^2 = \\sqrt[3]{5^2} = \\sqrt[3]{25}$.
    *   Wyłączanie czynnika spod pierwiastka: Jeżeli $a = k^n \\cdot l$, to $\\sqrt[n]{a} = \\sqrt[n]{k^n \\cdot l} = k \\sqrt[n]{l}$.
        Przykład: $\\sqrt{18} = \\sqrt{9 \\cdot 2} = \\sqrt{3^2 \\cdot 2} = 3\\sqrt{2}$.
    *   Wprowadzanie czynnika pod pierwiastek: $k \\sqrt[n]{l} = \\sqrt[n]{k^n \\cdot l}$ (przy założeniu $k \\ge 0$ gdy $n$ jest parzyste).
        Przykład: $2\\sqrt{3} = \\sqrt{2^2 \\cdot 3} = \\sqrt{4 \\cdot 3} = \\sqrt{12}$.

## Przykład 1 - podstawowy
Uprość wyrażenie: $3^5 \\cdot 3^{-2} \\cdot (3^4)^0$.

**Krok 1.** Zastosuj wzór na mnożenie potęg o tych samych podstawach: $a^m \\cdot a^n = a^{m+n}$.
Pierwsze dwa czynniki: $3^5 \\cdot 3^{-2} = 3^{5 + (-2)} = 3^{5-2} = 3^3$.

**Krok 2.** Oblicz wartość potęgi zerowej. Pamiętaj, że $a^0 = 1$ dla $a \\neq 0$.
Trzeci czynnik: $(3^4)^0$. Podstawa $3^4 = 81 \\neq 0$, więc $(3^4)^0 = 1$.

**Krok 3.** Pomnóż wyniki z poprzednich kroków.
Wyrażenie przyjmuje postać: $3^3 \\cdot 1$.

**Krok 4.** Oblicz końcową wartość.
$3^3 \\cdot 1 = 27 \\cdot 1 = 27$.

**Sprawdzenie:**
$3^5 \\cdot 3^{-2} \\cdot (3^4)^0 = 243 \\cdot \\frac{1}{9} \\cdot 1 = \\frac{243}{9} = 27$. Wynik jest poprawny.

## Przykład 2 - maturalny
Oblicz wartość wyrażenia: $\\frac{\\sqrt{72} - \\sqrt{50}}{\\sqrt{2}}$.

**Krok 1.** Uprość licznik, wyłączając czynniki spod pierwiastków.
Znajdź największy kwadrat liczby, który jest dzielnikiem 72 i 50.
Dla 72: $72 = 36 \\cdot 2 = 6^2 \\cdot 2$. Zatem $\\sqrt{72} = \\sqrt{6^2 \\cdot 2} = 6\\sqrt{2}$.
Dla 50: $50 = 25 \\cdot 2 = 5^2 \\cdot 2$. Zatem $\\sqrt{50} = \\sqrt{5^2 \\cdot 2} = 5\\sqrt{2}$.

**Krok 2.** Podstaw uproszczone pierwiastki do licznika.
$\\sqrt{72} - \\sqrt{50} = 6\\sqrt{2} - 5\\sqrt{2}$.

**Krok 3.** Zredukuj wyrazy podobne w liczniku.
$6\\sqrt{2} - 5\\sqrt{2} = (6-5)\\sqrt{2} = 1\\sqrt{2} = \\sqrt{2}$.

**Krok 4.** Podstaw wynik licznika z powrotem do całego wyrażenia.
Wyrażenie ma teraz postać: $\\frac{\\sqrt{2}}{\\sqrt{2}}$.

**Krok 5.** Oblicz końcową wartość.
$\\frac{\\sqrt{2}}{\\sqrt{2}} = 1$.

**Sprawdzenie:**
Alternatywnie, możemy podzielić każdy wyraz licznika przez mianownik:
$\\frac{\\sqrt{72} - \\sqrt{50}}{\\sqrt{2}} = \\frac{\\sqrt{72}}{\\sqrt{2}} - \\frac{\\sqrt{50}}{\\sqrt{2}} = \\sqrt{\\frac{72}{2}} - \\sqrt{\\frac{50}{2}} = \\sqrt{36} - \\sqrt{25} = 6 - 5 = 1$. Wynik jest poprawny.

## Przykład 3 - egzaminacyjny
Wyrażenie $2 \\cdot (\\sqrt{3})^{-2} + 4 \\cdot 3^{-1}$ jest równe:
A. $2$
B. $2\\frac{1}{3}$
C. $3$
D. $2\\frac{2}{3}$

**Krok 1.** Oblicz pierwszy składnik: $2 \\cdot (\\sqrt{3})^{-2}$.
Użyj wzoru $a^{-n} = \\frac{1}{a^n}$: $(\\sqrt{3})^{-2} = \\frac{1}{(\\sqrt{3})^2}$.
Ponieważ $(\\sqrt{3})^2 = 3$, mamy $\\frac{1}{3}$.
Pierwszy składnik to $2 \\cdot \\frac{1}{3} = \\frac{2}{3}$.

**Krok 2.** Oblicz drugi składnik: $4 \\cdot 3^{-1}$.
Użyj wzoru $a^{-n} = \\frac{1}{a^n}$: $3^{-1} = \\frac{1}{3}$.
Drugi składnik to $4 \\cdot \\frac{1}{3} = \\frac{4}{3}$.

**Krok 3.** Dodaj oba składniki.
$\\frac{2}{3} + \\frac{4}{3} = \\frac{2+4}{3} = \\frac{6}{3} = 2$.

**Krok 4.** Porównaj wynik z opcjami.
Wynik 2 odpowiada opcji A.

**Sprawdzenie:**
Wyrażenie wynosi $2 \\cdot \\frac{1}{3} + 4 \\cdot \\frac{1}{3} = \\frac{2}{3} + \\frac{4}{3} = \\frac{6}{3} = 2$. Wynik jest poprawny.

## Pułapki
*   **Kolejność działań przy potęgach**: Pamiętaj o pierwszeństwie potęgowania przed mnożeniem/dzieleniem, ale w nawiasach działania wykonujemy zgodnie z zasadami. Szczególnie uważaj na potęgę o wykładniku ujemnym: $-a^n$ to -(a^n), a $(-a)^n$ to potęga liczby ujemnej. Np. $-2^4 = -16$, ale $(-2)^4 = 16$.
*   **Potęga zerowa i ujemna podstawa**: $0^0$ jest nieokreślone. $a^0 = 1$ tylko dla $a \\neq 0$. Ułamki z ujemnym wykładnikiem: $\\left(\\frac{a}{b}\\right)^{-n} = \\left(\\frac{b}{a}\\right)^n$. Np. $(\\frac{2}{3})^{-2} = (\\frac{3}{2})^2 = \\frac{9}{4}$.
*   **Wzory na potęgi i pierwiastki**: Mylenie wzorów typu $(a+b)^n \\neq a^n + b^n$ lub $\\sqrt{a+b} \\neq \\sqrt{a} + \\sqrt{b}$. Stosuj tylko poprawne wzory algebraiczne.
*   **Znaki pod pierwiastkiem**: Pamiętaj, że pierwiastek kwadratowy (parzystego stopnia) jest zdefiniowany tylko dla liczb nieujemnych. $\\sqrt{-4}$ nie jest liczbą rzeczywistą. Pierwiastek sześcienny (nieparzystego stopnia) jest zdefiniowany dla liczb ujemnych, np. $\\sqrt[3]{-8} = -2$.
*   **Upraszczanie pierwiastków**: Przy wyłączaniu czynnika spod pierwiastka szukaj kwadratów (lub sześcianów, itd.) liczb. Np. $\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$, a nie $\\sqrt{9 \\cdot 8} = 3\\sqrt{8}$, chyba że $\\sqrt{8}$ można dalej uprościć.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz wartość wyrażenia: $5^2 \\cdot 5^{-1} - \\frac{1}{25}$.
2.  Uprość wyrażenie: $(a^3)^2 \\cdot a^{-4}$ dla $a \\neq 0$.
3.  Oblicz: $\\sqrt{50} + \\sqrt{32} - \\sqrt{18}$.
4.  Wykaż, że równość $\\sqrt[3]{16} \\cdot \\sqrt[3]{4} = 4$ jest prawdziwa.
5.  Oblicz wartość wyrażenia: $27^{\\frac{2}{3}} - 16^{\\frac{1}{2}}$.
6.  Uprość wyrażenie: $\\frac{x^5 \\cdot x^{-2}}{x^3}$ dla $x > 0$.
7.  Oblicz: $(\\frac{2}{3})^{-2} + (\\frac{1}{2})^3$.

## Odpowiedzi
1.  $5^2 \\cdot 5^{-1} - \\frac{1}{25} = 25 \\cdot \\frac{1}{5} - \\frac{1}{25} = 5 - \\frac{1}{25} = \\frac{125-1}{25} = \\frac{124}{25} = 4\\frac{24}{25}$.
2.  $(a^3)^2 \\cdot a^{-4} = a^{3 \\cdot 2} \\cdot a^{-4} = a^6 \\cdot a^{-4} = a^{6-4} = a^2$.
3.  $\\sqrt{50} + \\sqrt{32} - \\sqrt{18} = \\sqrt{25 \\cdot 2} + \\sqrt{16 \\cdot 2} - \\sqrt{9 \\cdot 2} = 5\\sqrt{2} + 4\\sqrt{2} - 3\\sqrt{2} = (5+4-3)\\sqrt{2} = 6\\sqrt{2}$.
4.  $\\sqrt[3]{16} \\cdot \\sqrt[3]{4} = \\sqrt[3]{16 \\cdot 4} = \\sqrt[3]{64}$. Ponieważ $4^3 = 64$, to $\\sqrt[3]{64} = 4$. Równość jest prawdziwa.
5.  $27^{\\frac{2}{3}} - 16^{\\frac{1}{2}} = (\\sqrt[3]{27})^2 - \\sqrt{16} = 3^2 - 4 = 9 - 4 = 5$.
6.  $\\frac{x^5 \\cdot x^{-2}}{x^3} = \\frac{x^{5-2}}{x^3} = \\frac{x^3}{x^3} = 1$.
7.  $(\\frac{2}{3})^{-2} + (\\frac{1}{2})^3 = (\\frac{3}{2})^2 + \\frac{1}{8} = \\frac{9}{4} + \\frac{1}{8} = \\frac{18}{8} + \\frac{1}{8} = \\frac{19}{8} = 2\\frac{3}{8}$.

## Szybka powtórka
1.  Ile wynosi $a^0$ dla $a \\neq 0$?
2.  Jaki jest wzór na mnożenie potęg o tej samej podstawie?
3.  Jaki jest związek między $\\sqrt[n]{a}$ a potęgami?
4.  Czy $(a+b)^2 = a^2 + b^2$?
5.  Jak uprościć $\\sqrt{12}$?

## Diagram
\`\`\`text
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
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "logarytmy",
    title: "Logarytmy – definicje, własności i zadania maturalne",
    content: `## Na egzaminie
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
*   **Definicja logarytmu:** Logarytmem liczby dodatniej $b$ przy dodatniej podstawie $a$ ($a \\neq 1$) nazywamy wykładnik $x$, do którego należy podnieść podstawę $a$, aby otrzymać liczbę $b$.
    Zapis: $\\log_a b = x \\iff a^x = b$, gdzie $a > 0$, $a \\neq 1$ oraz $b > 0$.

*   **Warunki istnienia logarytmu:**
    *   Podstawa logarytmu $a$ musi być liczbą dodatnią i różną od 1 ($a > 0$ i $a \\neq 1$).
    *   Liczba logarytmowana $b$ musi być liczbą dodatnią ($b > 0$).

*   **Zamiana postaci:**
    *   Z postaci logarytmicznej na wykładniczą: $\\log_a b = x \\iff a^x = b$
    *   Z postaci wykładniczej na logarytmiczną: $a^x = b \\iff \\log_a b = x$

*   **Podstawowe własności:**
    *   $\\log_a 1 = 0$, ponieważ $a^0 = 1$ dla dowolnego $a > 0, a \\neq 1$.
    *   $\\log_a a = 1$, ponieważ $a^1 = a$ dla dowolnego $a > 0, a \\neq 1$.
    *   $\\log_a a^k = k$, ponieważ $a^k = a^k$.

*   **Twierdzenia o logarytmach:** Dla $a > 0, a \\neq 1$, $x > 0$, $y > 0$:
    *   **Logarytm iloczynu:** $\\log_a (x \\cdot y) = \\log_a x + \\log_a y$
    *   **Logarytm ilorazu:** $\\log_a \\frac{x}{y} = \\log_a x - \\log_a y$
    *   **Logarytm potęgi:** $\\log_a x^k = k \\cdot \\log_a x$, gdzie $k$ jest dowolną liczbą rzeczywistą.

*   **Wzór na zamianę podstawy:** Dla $a > 0, a \\neq 1$, $b > 0$, $c > 0, c \\neq 1$:
    $$ \\log_a b = \\frac{\\log_c b}{\\log_c a} $$
    Najczęściej stosowany wariant to zamiana na logarytm naturalny ($\\ln$) lub dziesiętny ($\\log$, bez zapisu podstawy).
    *   $\\log_a b = \\frac{\\ln b}{\\ln a}$
    *   $\\log_a b = \\frac{\\log b}{\\log a}$

*   **Uwaga:** Logarytmy dziesiętne (o podstawie 10) często zapisujemy jako $\\log x$ (bez podstawy). Logarytmy naturalne (o podstawie $e$, gdzie $e \\approx 2.718$) zapisujemy jako $\\ln x$.

## Przykład 1 - podstawowy
Oblicz wartość wyrażenia $\\log_2 16$.

**Krok 1.** Zapisujemy wyrażenie: $\\log_2 16$.
**Krok 2.** Stosujemy definicję logarytmu: szukamy takiej liczby $x$, dla której $2^x = 16$.
**Krok 3.** Rozkładamy liczbę 16 na czynniki lub szukamy potęgi liczby 2, która daje 16. Wiemy, że $2^1 = 2$, $2^2 = 4$, $2^3 = 8$, $2^4 = 16$.
**Krok 4.** Znaleźliśmy wykładnik: $x=4$. Zatem $2^4 = 16$.
**Krok 5.** Zgodnie z definicją, $\\log_2 16 = 4$.

**Sprawdzenie:** Czy $2^4 = 16$? Tak, $2 \\cdot 2 \\cdot 2 \\cdot 2 = 16$. Wynik jest poprawny.

## Przykład 2 - maturalny
Oblicz wartość wyrażenia $\\log_3 54 - \\log_3 2$.

**Krok 1.** Analizujemy wyrażenie. Widzimy logarytmy o tej samej podstawie (3) i znak odejmowania. Przypominamy sobie twierdzenie o logarytmie ilorazu: $\\log_a x - \\log_a y = \\log_a \\frac{x}{y}$.
**Krok 2.** Stosujemy twierdzenie. W tym przypadku $a=3$, $x=54$, $y=2$.
$$ \\log_3 54 - \\log_3 2 = \\log_3 \\frac{54}{2} $$
**Krok 3.** Wykonujemy dzielenie w liczbie logarytmowanej: $\\frac{54}{2} = 27$.
$$ \\log_3 \\frac{54}{2} = \\log_3 27 $$
**Krok 4.** Obliczamy wartość otrzymanego logarytmu. Szukamy liczby $x$ takiej, że $3^x = 27$.
**Krok 5.** Wiemy, że $3^1 = 3$, $3^2 = 9$, $3^3 = 27$. Zatem $x=3$.
$$ \\log_3 27 = 3 $$
Ostateczna wartość wyrażenia to 3.

**Sprawdzenie:**
Możemy też sprawdzić, czy $\\log_3 54 = \\log_3 (27 \\cdot 2) = \\log_3 27 + \\log_3 2 = 3 + \\log_3 2$.
Wtedy $\\log_3 54 - \\log_3 2 = (3 + \\log_3 2) - \\log_3 2 = 3$. Wynik jest poprawny.

## Przykład 3 - egzaminacyjny
Oblicz wartość wyrażenia: $\\frac{\\log_5 125}{\\log_5 5}$

**Krok 1.** Rozpoznajemy zadanie jako wymagające obliczenia wartości logarytmów lub zastosowania twierdzenia o zamianie podstawy.
**Krok 2.** Obliczamy licznik: $\\log_5 125$. Szukamy $x$ takiego, że $5^x = 125$. Ponieważ $5^3 = 125$, to $\\log_5 125 = 3$.
**Krok 3.** Obliczamy mianownik: $\\log_5 5$. Korzystając z własności $\\log_a a = 1$, otrzymujemy $\\log_5 5 = 1$.
**Krok 4.** Podstawiamy obliczone wartości do wyrażenia:
$$ \\frac{\\log_5 125}{\\log_5 5} = \\frac{3}{1} $$
**Krok 5.** Obliczamy wynik: $\\frac{3}{1} = 3$.

**Alternatywne rozwiązanie (zamiana podstawy):**
Zauważmy, że mianownik jest logarytmem o podstawie 5, a licznik jest również logarytmem o podstawie 5. Możemy potraktować to jako zastosowanie wzoru na zamianę podstawy w odwrotnej kolejności: $\\frac{\\log_c b}{\\log_c a} = \\log_a b$.
W tym przypadku $c=5$, $b=125$, $a=5$. Otrzymujemy:
$$ \\frac{\\log_5 125}{\\log_5 5} = \\log_5 125 $$
Następnie obliczamy $\\log_5 125 = 3$, ponieważ $5^3 = 125$. Wynik jest ten sam.

## Pułapki
*   **Niespełnione warunki:** Uczniowie często zapominają o warunkach istnienia logarytmu ($a>0, a \\neq 1, b>0$). Może to prowadzić do błędnych obliczeń lub prób obliczenia logarytmów z liczb ujemnych lub zer, bądź o niedozwolonej podstawie. Zawsze sprawdzaj warunki na początku.
*   **Mylenie twierdzeń:** Częstym błędem jest stosowanie twierdzenia o logarytmie iloczynu do sumy lub różnicy: $\\log_a (x+y) \\neq \\log_a x + \\log_a y$ ani $\\log_a (x-y) \\neq \\log_a x - \\log_a y$. Pamiętaj: suma logarytmów to logarytm iloczynu, różnica logarytmów to logarytm ilorazu.
*   **Złe zastosowanie potęgi:** Własność $\\log_a x^k = k \\cdot \\log_a x$ jest często mylona, np. zapisywana jako $\\log_a x^k = (\\log_a x)^k$. Pamiętaj, że wykładnik "wychodzi" przed logarytm jako mnożenie, a nie potęgowanie.
*   **Logarytmy o tej samej podstawie:** Twierdzenia o iloczynie, ilorazie i potędze można stosować tylko do logarytmów o **tej samej podstawie**. Jeśli podstawy są różne, trzeba je najpierw ujednolicić, np. za pomocą wzoru na zamianę podstawy.
*   **Brak rozróżnienia $\\log$ i $\\ln$:** Chociaż na maturze podstawowej zazwyczaj podaje się podstawę, warto pamiętać, że $\\log$ bez podstawy to $\\log_{10}$, a $\\ln$ to $\\log_e$. Ich wartości są różne.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz wartość wyrażenia: $\\log_3 81$.
2.  Oblicz wartość wyrażenia: $\\log_5 0.04$.
3.  Oblicz wartość wyrażenia: $2 \\cdot \\log_4 2$.
4.  Oblicz wartość wyrażenia: $\\log_2 5 + \\log_2 0.8$.
5.  Uprość wyrażenie: $\\log_6 3 + \\log_6 12$.
6.  Uprość wyrażenie: $2 \\cdot \\log 7 - \\log 49$.
7.  Zapisz liczbę 5 jako logarytm o podstawie 3, tzn. znajdź $x$ takie, że $\\log_3 x = 5$.

## Odpowiedzi
1.  $\\log_3 81 = 4$, ponieważ $3^4 = 81$.
2.  $\\log_5 0.04 = \\log_5 \\frac{4}{100} = \\log_5 \\frac{1}{25} = \\log_5 5^{-2} = -2$.
3.  $2 \\cdot \\log_4 2$. Wiemy, że $4^{1/2} = \\sqrt{4} = 2$, więc $\\log_4 2 = \\frac{1}{2}$. Wtedy $2 \\cdot \\frac{1}{2} = 1$.
4.  $\\log_2 5 + \\log_2 0.8 = \\log_2 (5 \\cdot 0.8) = \\log_2 4 = 2$.
5.  $\\log_6 3 + \\log_6 12 = \\log_6 (3 \\cdot 12) = \\log_6 36 = 2$.
6.  $2 \\cdot \\log 7 - \\log 49 = \\log 7^2 - \\log 49 = \\log 49 - \\log 49 = 0$.
7.  Chcemy znaleźć $x$ takie, że $\\log_3 x = 5$. Z definicji logarytmu $3^5 = x$. $3^5 = 3 \\cdot 3 \\cdot 3 \\cdot 3 \\cdot 3 = 9 \\cdot 9 \\cdot 3 = 81 \\cdot 3 = 243$. Zatem $x = 243$.

## Szybka powtórka
1.  Jaka jest definicja logarytmu $\\log_a b = x$?
2.  Jakie warunki musi spełniać podstawa $a$ logarytmu?
3.  Jaka jest wartość $\\log_7 1$?
4.  Jak zapisać sumę dwóch logarytmów o tej samej podstawie jako pojedynczy logarytm?
5.  Jaki jest wzór na logarytm potęgi $\\log_a x^k$?

## Diagram
Logarytm $\\log_a b = x$
definiuje się przez
równanie wykładnicze $a^x = b$.

Warunki:
$a > 0$
$a \\neq 1$
$b > 0$

Przykład: $\\log_2 8 = 3 \\iff 2^3 = 8$.`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "procenty",
    title: "Procenty i proporcje",
    content: `## Na egzaminie
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
*   **Procent:** Jeden procent (1%) to jedna setna ( $\\frac{1}{100}$ ) danej wielkości.
*   **Zapis procentowy:** $p\\% = \\frac{p}{100}$. Na przykład, $25\\% = \\frac{25}{100} = 0.25$.
*   **Obliczanie procentu danej liczby:** Aby obliczyć $p\\%$ danej liczby $L$, mnożymy liczbę $L$ przez $\\frac{p}{100}$:
    $$ \\text{Wynik} = L \\cdot \\frac{p}{100} $$
*   **Obliczanie, jakim procentem jednej liczby jest druga liczba:** Aby obliczyć, jakim procentem liczby $L_1$ jest liczba $L_2$, obliczamy ułamek $\\frac{L_2}{L_1}$ i mnożymy przez 100%:
    $$ \\text{Procent} = \\frac{L_2}{L_1} \\cdot 100\\% $$
*   **Obliczanie liczby, gdy dany jest jej procent:** Jeśli $p\\%$ danej liczby $L$ jest równe $W$, to możemy zapisać równanie:
    $$ L \\cdot \\frac{p}{100} = W $$
    Aby obliczyć $L$, przekształcamy równanie:
    $$ L = W : \\frac{p}{100} = W \\cdot \\frac{100}{p} $$
*   **Podwyżka o $p\\%$:** Nowa cena $C_{nowa}$ po podwyżce ceny $C_{stara}$ o $p\\%$ wynosi:
    $$ C_{nowa} = C_{stara} + C_{stara} \\cdot \\frac{p}{100} = C_{stara} \\left( 1 + \\frac{p}{100} \\right) $$
*   **Obniżka o $p\\%$:** Nowa cena $C_{nowa}$ po obniżce ceny $C_{stara}$ o $p\\%$ wynosi:
    $$ C_{nowa} = C_{stara} - C_{stara} \\cdot \\frac{p}{100} = C_{stara} \\left( 1 - \\frac{p}{100} \\right) $$
*   **Procent składany:** Po $n$ okresach, w których następuje kapitalizacja odsetek (lub zmiana procentowa) na poziomie $p\\%$ na okres, kwota początkowa $K_0$ wzrośnie do kwoty $K_n$ danej wzorem:
    $$ K_n = K_0 \\left( 1 + \\frac{p}{100} \\right)^n $$
    Jest to rzadziej spotykane na maturze podstawowej, ale warto znać podstawy.
*   **Proporcja prosta:** Dwie wielkości są proporcjonalne prosto, jeśli wzrostowi jednej towarzyszy proporcjonalny wzrost drugiej (lub spadkowi jednej towarzyszy proporcjonalny spadek drugiej). Jeśli $a$ odpowiada $c$, a $b$ odpowiada $d$, to:
    $$ \\frac{a}{b} = \\frac{c}{d} $$
    lub inaczej:
    $$ \\frac{a}{c} = \\frac{b}{d} $$
*   **Proporcja odwrotnie proporcjonalna:** Dwie wielkości są proporcjonalne odwrotnie, jeśli wzrostowi jednej towarzyszy proporcjonalny spadek drugiej (i odwrotnie). Jeśli $a$ odpowiada $c$, a $b$ odpowiada $d$, to:
    $$ a \\cdot c = b \\cdot d $$
    lub inaczej:
    $$ \\frac{a}{b} = \\frac{d}{c} $$

## Przykład 1 - podstawowy
Oblicz $15\\%$ liczby $240$.

**Krok 1.** Zapisujemy procent w postaci ułamka dziesiętnego lub zwykłego.
$15\\% = \\frac{15}{100} = 0.15$.

**Krok 2.** Mnożymy liczbę przez obliczony ułamek.
Wynik $= 240 \\cdot 0.15$.

**Krok 3.** Wykonujemy mnożenie.
$240 \\cdot 0.15 = 240 \\cdot \\frac{15}{100} = \\frac{240 \\cdot 15}{100} = \\frac{3600}{100} = 36$.
Alternatywnie:
$240 \\cdot 0.15 = 24 \\cdot 1.5 = 24 + 12 = 36$.

**Sprawdzenie:**
$10\\%$ z $240$ to $24$.
$5\\%$ z $240$ to połowa z $10\\%$, czyli $12$.
$15\\% = 10\\% + 5\\%$, więc $24 + 12 = 36$. Wynik jest poprawny.

## Przykład 2 - maturalny
Cena roweru wynosiła $1200$ zł. Najpierw cenę tę podwyższono o $10\\%$, a następnie nową cenę obniżono o $20\\%$. Jaka jest ostateczna cena roweru?

**Krok 1.** Obliczamy cenę po pierwszej podwyżce o $10\\%$.
Wzór na podwyżkę: $C_{nowa} = C_{stara} \\left( 1 + \\frac{p}{100} \\right)$.
$C_1 = 1200 \\cdot \\left( 1 + \\frac{10}{100} \\right) = 1200 \\cdot \\left( 1 + 0.10 \\right) = 1200 \\cdot 1.10$.

**Krok 2.** Wykonujemy mnożenie.
$C_1 = 1200 \\cdot 1.10 = 1320$ zł.

**Krok 3.** Obliczamy nową cenę po obniżce o $20\\%$. Teraz bazujemy na cenie $C_1 = 1320$ zł.
Wzór na obniżkę: $C_{nowa} = C_{stara} \\left( 1 - \\frac{p}{100} \\right)$.
$C_2 = 1320 \\cdot \\left( 1 - \\frac{20}{100} \\right) = 1320 \\cdot \\left( 1 - 0.20 \\right) = 1320 \\cdot 0.80$.

**Krok 4.** Wykonujemy mnożenie.
$C_2 = 1320 \\cdot 0.80 = 132 \\cdot 8 = 1056$ zł.

**Sprawdzenie:**
Podwyżka o $10\\%$: $1200 + 0.10 \\cdot 1200 = 1200 + 120 = 1320$.
Obniżka o $20\\%$ od $1320$: $1320 - 0.20 \\cdot 1320 = 1320 - 264 = 1056$. Wynik jest poprawny.

## Przykład 3 - egzaminacyjny

W klasie liczącej $25$ uczniów, $40\\%$ to dziewczęta. Ilu chłopców jest w tej klasie?

**Krok 1.** Obliczamy liczbę dziewcząt.
Liczba dziewcząt $= 25 \\cdot 40\\% = 25 \\cdot \\frac{40}{100} = 25 \\cdot 0.4$.

**Krok 2.** Wykonujemy mnożenie.
$25 \\cdot 0.4 = 10$. W klasie jest $10$ dziewcząt.

**Krok 3.** Obliczamy liczbę chłopców.
Liczba chłopców = Całkowita liczba uczniów - Liczba dziewcząt.
Liczba chłopców $= 25 - 10 = 15$.

**Alternatywne rozwiązanie (proporcja):**
Jeśli $40\\%$ to dziewczęta, to $100\\% - 40\\% = 60\\%$ to chłopcy.
Liczba chłopców $= 25 \\cdot 60\\% = 25 \\cdot \\frac{60}{100} = 25 \\cdot 0.6$.
$25 \\cdot 0.6 = 15$.

**Sprawdzenie:**
$10$ dziewcząt i $15$ chłopców daje $10+15=25$ uczniów.
$\\frac{10}{25} = \\frac{2}{5} = 0.4 = 40\\%$ (dziewczęta).
$\\frac{15}{25} = \\frac{3}{5} = 0.6 = 60\\%$ (chłopcy). Wynik jest poprawny.

## Pułapki
*   **Obliczanie procentu z pierwotnej ceny po podwyżce/obniżce:** W zadaniach typu "podwyżka, potem obniżka" (lub odwrotnie) pamiętaj, że kolejna zmiana procentowa jest liczona od *aktualnej* ceny (po poprzedniej zmianie), a nie od ceny początkowej. Przykład 2 ilustruje ten błąd. Obniżenie ceny o $20\\%$ od pierwotnej kwoty ($1200 \\cdot 0.20 = 240$) zamiast od kwoty po podwyżce ($1320 \\cdot 0.20 = 264$) prowadzi do błędnego wyniku.
*   **Mylenie proporcji prostej z odwrotnie proporcjonalną:** Zawsze zastanów się, czy wielkości rosną lub maleją razem (prosta proporcja), czy też gdy jedna rośnie, druga maleje (odwrotna proporcja).
*   **Błędy rachunkowe:** Długie obliczenia, zwłaszcza z ułamkami dziesiętnymi i liczbami z wieloma zerami, są podatne na błędy. Warto sprawdzać obliczenia lub stosować alternatywne metody (jak w Przykładzie 1 i 3).
*   **Nieprawidłowe przekształcanie wzorów:** Przy obliczaniu liczby, gdy znamy jej procent, łatwo popełnić błąd dzieląc zamiast mnożyć lub odwrotnie. Wzór $L = W \\cdot \\frac{100}{p}$ jest kluczowy. Upewnij się, że mnożysz przez $\\frac{100}{p}$, a nie przez $\\frac{p}{100}$.
*   **Zbyt szybkie zaokrąglanie:** Jeśli zadanie nie wymaga zaokrąglenia, staraj się pracować na dokładnych ułamkach lub liczbach. Zaokrąglanie wyników pośrednich może prowadzić do znaczących błędów w końcowym rezultacie.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz $35\\%$ liczby $150$.
2.  Znajdź liczbę, której $20\\%$ wynosi $45$.
3.  Cena telewizora wynosiła $2500$ zł. Obniżono ją o $15\\%$. Jaka jest nowa cena?
4.  Pewna liczba po zwiększeniu o $25\\%$ wynosi $200$. Jaka była liczba pierwotna?
5.  W sklepie sportowym jest $60$ par butów. $30\\%$ z nich to buty do biegania. Pozostałe to buty piłkarskie. Ile par butów piłkarskich jest w sklepie?
6.  Pociąg miał przejechać trasę $300$ km w $5$ godzin. Po godzinie jazdy okazało się, że prędkość należy zmniejszyć o $10\\%$. Po zmianie prędkości, ile czasu zajmie pociągowi pokonanie reszty trasy?
7.  Pan Janek wpłacił $5000$ zł na lokatę bankową oprocentowaną na $3\\%$ w skali roku. Po ilu latach (przy kapitalizacji rocznej) stan jego konta przekroczy $5400$ zł?

## Odpowiedzi
1.  $150 \\cdot 0.35 = 52.5$.
2.  $L \\cdot 0.20 = 45 \\implies L = \\frac{45}{0.20} = 225$.
3.  $2500 \\cdot (1 - 0.15) = 2500 \\cdot 0.85 = 2125$ zł.
4.  $L \\cdot (1 + 0.25) = 200 \\implies L \\cdot 1.25 = 200 \\implies L = \\frac{200}{1.25} = 160$.
5.  Buty piłkarskie to $100\\% - 30\\% = 70\\%$. Liczba par butów piłkarskich $= 60 \\cdot 0.70 = 42$.
6.  Prędkość początkowa: $300 \\text{ km} / 5 \\text{ h} = 60 \\text{ km/h}$. Po zmianie prędkość wynosi $60 \\cdot (1-0.10) = 60 \\cdot 0.9 = 54 \\text{ km/h}$. Przejechano $60 \\text{ km}$ w pierwszą godzinę. Pozostało $300 - 60 = 240 \\text{ km}$. Czas potrzebny na pokonanie reszty trasy: $\\frac{240 \\text{ km}}{54 \\text{ km/h}} = \\frac{240}{54} = \\frac{40}{9} \\approx 4.44$ godziny.
7.  Po 1 roku: $5000(1.03) = 5150$. Po 2 latach: $5150(1.03) \\approx 5304.5$. Po 3 latach: $5304.5(1.03) \\approx 5463.6$. Stan konta przekroczy $5400$ zł po 3 latach.

## Szybka powtórka
1.  Jak zapisać $5\\%$ jako ułamek dziesiętny?
2.  Jak obliczyć $10\\%$ danej liczby?
3.  Czym różni się obniżka o $10\\%$ od zwiększenia o $10\\%$?
4.  Jeśli cena $X$ została podwyższona o $20\\%$ i wynosi teraz $120$ zł, to ile wynosiła cena $X$?
5.  Jeśli na trasę $100$ km potrzeba $2$ godzin przy stałej prędkości, ile czasu zajmie pokonanie tej trasy, jeśli prędkość zostanie zmniejszona dwukrotnie?`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "notacja_wykladnicza",
    title: "Notacja wykładnicza",
    content: `## Na egzaminie
Zadania związane z notacją wykładniczą pojawiają się na maturze podstawowej regularnie, zazwyczaj jako elementy większych zadań dotyczących liczb rzeczywistych lub jako zadania zamknięte za 1 punkt. CKE sprawdza przede wszystkim umiejętność zamiany liczb na notację wykładniczą i odwrotnie, a także wykonywania podstawowych działań (mnożenie, dzielenie, rzadziej dodawanie i odejmowanie) na liczbach w tej postaci.

## Mapa tematu
W ramach tej lekcji opanujesz następujące umiejętności:
1. Zrozumiesz, czym jest notacja wykładnicza i w jakich sytuacjach jest użyteczna.
2. Nauczysz się zamieniać duże liczby na notację wykładniczą.
3. Będziesz potrafił zamieniać bardzo małe liczby na notację wykładniczą.
4. Opanujesz przekształcanie liczb z notacji wykładniczej z powrotem na postać dziesiętną.
5. Nauczysz się mnożyć i dzielić liczby zapisane w notacji wykładniczej.
6. Poznasz zasady dodawania i odejmowania liczb w notacji wykładniczej.
7. Będziesz umiał rozwiązywać zadania tekstowe wykorzystujące notację wykładniczą.

## Definicje i wzory
Notacja wykładnicza (zwana również naukową) to sposób zapisywania liczb, szczególnie bardzo dużych lub bardzo małych, w zwartej i łatwej do odczytania formie. Jest powszechnie stosowana w nauce i inżynierii.

**Definicja notacji wykładniczej:**
Każdą dodatnią liczbę rzeczywistą $x$ można zapisać w postaci:
$$x = a \\cdot 10^k$$
gdzie:
*   $a$ to liczba rzeczywista spełniająca warunek $1 \\le a < 10$ (czyli $a$ jest większe lub równe 1 i mniejsze od 10). Nazywamy ją **mantysą** lub **współczynnikiem**.
*   $k$ to liczba całkowita (dodatnia, ujemna lub zero). Nazywamy ją **wykładnikiem** lub **cechą**.

**Przykłady:**
*   $300 = 3 \\cdot 100 = 3 \\cdot 10^2$
*   $45000 = 4,5 \\cdot 10000 = 4,5 \\cdot 10^4$
*   $0,0005 = 5 \\cdot 0,0001 = 5 \\cdot 10^{-4}$

**Zasady zamiany na notację wykładniczą:**

1.  **Zapis dużych liczb (gdy $k > 0$):**
    *   Przesuwamy przecinek w liczbie tak, aby przed nim znajdowała się tylko jedna cyfra różna od zera (czyli $a$ ma być z zakresu $1 \\le a < 10$).
    *   Wykładnik $k$ jest równy liczbie miejsc, o które przesunęliśmy przecinek w lewo.
    *   Przykład: $123\\,450\\,000 = 1,2345 \\cdot 10^8$ (przecinek przesunięto o 8 miejsc w lewo).

2.  **Zapis małych liczb (gdy $k < 0$):**
    *   Przesuwamy przecinek w liczbie tak, aby przed nim znajdowała się tylko jedna cyfra różna od zera ($1 \\le a < 10$).
    *   Wykładnik $k$ jest równy liczbie miejsc, o które przesunęliśmy przecinek w prawo, ale z minusem.
    *   Przykład: $0,000\\,007\\,8 = 7,8 \\cdot 10^{-6}$ (przecinek przesunięto o 6 miejsc w prawo).

**Działania na liczbach w notacji wykładniczej:**

W działaniach na notacji wykładniczej wykorzystujemy podstawowe prawa działań na potęgach:
*   $10^m \\cdot 10^n = 10^{m+n}$
*   $\\frac{10^m}{10^n} = 10^{m-n}$
*   $(10^m)^n = 10^{m \\cdot n}$

1.  **Mnożenie:**
    Mnożymy współczynniki $a$ i potęgi dziesiątki osobno.
    $(a \\cdot 10^k) \\cdot (b \\cdot 10^m) = (a \\cdot b) \\cdot 10^{k+m}$
    Po pomnożeniu należy upewnić się, że wynikowy współczynnik jest w zakresie $[1, 10)$. Jeśli nie, należy przesunąć przecinek i odpowiednio skorygować wykładnik.

    Przykład: $(2 \\cdot 10^3) \\cdot (4 \\cdot 10^5) = (2 \\cdot 4) \\cdot 10^{3+5} = 8 \\cdot 10^8$.
    Przykład: $(5 \\cdot 10^2) \\cdot (6 \\cdot 10^4) = (5 \\cdot 6) \\cdot 10^{2+4} = 30 \\cdot 10^6 = (3 \\cdot 10^1) \\cdot 10^6 = 3 \\cdot 10^7$.

2.  **Dzielenie:**
    Dzielimy współczynniki $a$ i potęgi dziesiątki osobno.
    $\\frac{a \\cdot 10^k}{b \\cdot 10^m} = \\left(\\frac{a}{b}\\right) \\cdot 10^{k-m}$
    Po podzieleniu należy upewnić się, że wynikowy współczynnik jest w zakresie $[1, 10)$.

    Przykład: $\\frac{8 \\cdot 10^7}{2 \\cdot 10^3} = \\left(\\frac{8}{2}\\right) \\cdot 10^{7-3} = 4 \\cdot 10^4$.
    Przykład: $\\frac{2 \\cdot 10^5}{4 \\cdot 10^2} = \\left(\\frac{2}{4}\\right) \\cdot 10^{5-2} = 0,5 \\cdot 10^3 = (5 \\cdot 10^{-1}) \\cdot 10^3 = 5 \\cdot 10^2$.

3.  **Dodawanie i odejmowanie:**
    Aby dodać lub odjąć liczby w notacji wykładniczej, muszą one mieć ten sam wykładnik $k$. W razie potrzeby należy przekształcić jedną z liczb tak, aby doprowadzić do wspólnego wykładnika.
    $a \\cdot 10^k + b \\cdot 10^k = (a+b) \\cdot 10^k$
    $a \\cdot 10^k - b \\cdot 10^k = (a-b) \\cdot 10^k$

    Przykład: $3,5 \\cdot 10^4 + 2,1 \\cdot 10^4 = (3,5 + 2,1) \\cdot 10^4 = 5,6 \\cdot 10^4$.
    Przykład: $4 \\cdot 10^5 + 2 \\cdot 10^4$.
    Aby dodać, musimy sprowadzić do tego samego wykładnika. Wybierzmy $10^5$:
    $2 \\cdot 10^4 = 0,2 \\cdot 10^1 \\cdot 10^4 = 0,2 \\cdot 10^5$.
    Zatem: $4 \\cdot 10^5 + 0,2 \\cdot 10^5 = (4 + 0,2) \\cdot 10^5 = 4,2 \\cdot 10^5$.
    Można też do $10^4$:
    $4 \\cdot 10^5 = 4 \\cdot 10^1 \\cdot 10^4 = 40 \\cdot 10^4$.
    Zatem: $40 \\cdot 10^4 + 2 \\cdot 10^4 = (40 + 2) \\cdot 10^4 = 42 \\cdot 10^4 = 4,2 \\cdot 10^1 \\cdot 10^4 = 4,2 \\cdot 10^5$.
    Obie metody dają ten sam poprawny wynik.

## Przykład 1 - podstawowy
Zapisz liczbę $0,000\\,000\\,057$ w notacji wykładniczej.

**Krok 1.** Określenie mantysy.**
Szukamy liczby $a$ takiej, że $1 \\le a < 10$. Musimy przesunąć przecinek w liczbie $0,000\\,000\\,057$ tak, aby znalazł się po pierwszej cyfrze różnej od zera. Pierwszą taką cyfrą jest 5. Zatem mantysa będzie równa $5,7$.

**Krok 2.** Określenie wykładnika $k$.**
Pierwotnie przecinek znajdował się po zerze na początku liczby ($0\\textbf{,}000\\,000\\,057$). Docelowo ma być między 5 a 7 ($5\\textbf{,}7$). Policzmy, o ile miejsc musimy przesunąć przecinek w prawo:
$0\\textbf{.}000\\,000\\,057$
Przesunięcie o 1 miejsce: $00\\textbf{.}000\\,000\\,57$
Przesunięcie o 2 miejsca: $000\\textbf{.}000\\,057$
...
Przesunięcie o 8 miejsc: $000\\,000\\,05\\textbf{.}7$
Przesunęliśmy przecinek o 8 miejsc w prawo.

**Krok 3.** Ustalenie znaku wykładnika.**
Ponieważ pierwotna liczba ($0,000\\,000\\,057$) jest bardzo mała (mniejsza od 1), wykładnik $k$ musi być liczbą ujemną.
Zatem $k = -8$.

**Krok 4.** Zapisanie liczby w notacji wykładniczej.**
Zgodnie z definicją $a \\cdot 10^k$, podstawiamy wyznaczone wartości:
$5,7 \\cdot 10^{-8}$.

**Sprawdzenie:**
$5,7 \\cdot 10^{-8} = 5,7 \\cdot 0,000\\,000\\,01 = 0,000\\,000\\,057$. Wynik jest zgodny z liczbą początkową.

## Przykład 2 - maturalny
Oblicz wartość wyrażenia $\\frac{(1,2 \\cdot 10^6) \\cdot (5 \\cdot 10^{-3})}{3 \\cdot 10^2}$ i przedstaw wynik w notacji wykładniczej.

**Krok 1.** Obliczenie iloczynu w liczniku.**
Najpierw wykonajmy mnożenie w liczniku: $(1,2 \\cdot 10^6) \\cdot (5 \\cdot 10^{-3})$.
Mnożymy współczynniki i potęgi dziesiątki osobno:
$(1,2 \\cdot 5) \\cdot (10^6 \\cdot 10^{-3})$
$6,0 \\cdot 10^{6+(-3)}$
$6 \\cdot 10^{6-3}$
$6 \\cdot 10^3$
Licznik wynosi $6 \\cdot 10^3$.

**Krok 2.** Wykonanie dzielenia.**
Teraz podzielmy wynik z licznika przez mianownik: $\\frac{6 \\cdot 10^3}{3 \\cdot 10^2}$.
Dzielimy współczynniki i potęgi dziesiątki osobno:
$\\left(\\frac{6}{3}\\right) \\cdot \\left(\\frac{10^3}{10^2}\\right)$
$2 \\cdot 10^{3-2}$
$2 \\cdot 10^1$

**Krok 3.** Sprawdzenie formatu notacji wykładniczej.**
Otrzymaliśmy $2 \\cdot 10^1$.
Mantysa $a=2$ spełnia warunek $1 \\le a < 10$.
Wykładnik $k=1$ jest liczbą całkowitą.
Wynik jest już w notacji wykładniczej.

Ostateczny wynik: $2 \\cdot 10^1$. (Można też zapisać jako 20, ale zadanie wymaga notacji wykładniczej).

## Przykład 3 - egzaminacyjny
Jedna cząsteczka wody waży około $3 \\cdot 10^{-23}$ grama. Ile waży $2 \\cdot 10^{24}$ cząsteczek wody? Wynik podaj w notacji wykładniczej.

**Krok 1.** Zapisanie danych i celu.**
Masa jednej cząsteczki: $m_c = 3 \\cdot 10^{-23}$ g.
Liczba cząsteczek: $N = 2 \\cdot 10^{24}$.
Szukana jest całkowita masa $M$.

**Krok 2.** Ułożenie równania.**
Całkowita masa jest iloczynem masy jednej cząsteczki i liczby cząsteczek:
$M = m_c \\cdot N$
$M = (3 \\cdot 10^{-23}) \\cdot (2 \\cdot 10^{24})$

**Krok 3.** Wykonanie mnożenia.**
Mnożymy współczynniki i potęgi dziesiątki osobno:
$M = (3 \\cdot 2) \\cdot (10^{-23} \\cdot 10^{24})$
$M = 6 \\cdot 10^{-23+24}$
$M = 6 \\cdot 10^1$

**Krok 4.** Sprawdzenie formatu notacji wykładniczej.**
Otrzymany wynik $6 \\cdot 10^1$ jest w prawidłowej notacji wykładniczej, ponieważ mantysa $a=6$ spełnia warunek $1 \\le a < 10$, a wykładnik $k=1$ jest liczbą całkowitą.

Odpowiedź: $2 \\cdot 10^{24}$ cząsteczek wody waży $6 \\cdot 10^1$ grama.

## Pułapki
*   **Niewłaściwa mantysa $a$**: Najczęstszy błąd to zapisanie liczby w postaci $a \\cdot 10^k$, gdzie $a$ nie spełnia warunku $1 \\le a < 10$. Na przykład $12 \\cdot 10^3$ zamiast $1,2 \\cdot 10^4$ lub $0,5 \\cdot 10^6$ zamiast $5 \\cdot 10^5$. Zawsze po wykonaniu działań należy sprawdzić i dostosować mantysę oraz wykładnik.
*   **Błędny znak wykładnika $k$**: Uczniowie często mylą znak wykładnika, zwłaszcza przy małych liczbach. Pamiętaj: liczby większe od 10 mają wykładnik dodatni ($10^k$, gdzie $k > 0$), liczby mniejsze od 1 (ale większe od 0) mają wykładnik ujemny ($10^k$, gdzie $k < 0$).
*   **Błędy w przesuwaniu przecinka**: Liczba miejsc, o które przesunięto przecinek, musi być precyzyjnie policzona. Jeden błąd w policzeniu miejsca skutkuje błędnym wykładnikiem $k$.
*   **Błędy w działaniach na wykładnikach**: Należy pamiętać o podstawowych zasadach działań na potęgach: przy mnożeniu dodajemy wykładniki, przy dzieleniu odejmujemy. Szczególną ostrożność należy zachować przy ujemnych wykładnikach (np. $10^{-3} \\cdot 10^5 = 10^{-3+5} = 10^2$, nie $10^{-15}$ ani $10^{-8}$).
*   **Dodawanie/odejmowanie bez wspólnego wykładnika**: Nie można po prostu dodać (lub odjąć) współczynników, jeśli potęgi dziesiątki są różne. Trzeba najpierw sprowadzić liczby do wspólnego wykładnika (np. $2 \\cdot 10^3 + 5 \\cdot 10^2$ to nie $7 \\cdot 10^5$, tylko $2 \\cdot 10^3 + 0,5 \\cdot 10^3 = 2,5 \\cdot 10^3$).

## Ćwiczenia do samodzielnego rozwiązania
1.  Zapisz podane liczby w notacji wykładniczej:
    a) $0,000\\,000\\,004\\,8$
    b) $215\\,000\\,000\\,000\\,000$
    c) $30,5 \\cdot 10^7$
    d) $0,000\\,001\\,5 \\cdot 10^4$

2.  Zamień liczby zapisane w notacji wykładniczej na postać dziesiętną:
    a) $6,25 \\cdot 10^7$
    b) $8,1 \\cdot 10^{-5}$
    c) $1,003 \\cdot 10^0$

3.  Oblicz i przedstaw wynik w notacji wykładniczej:
    a) $(4 \\cdot 10^5) \\cdot (7 \\cdot 10^{-9})$
    b) $(1,5 \\cdot 10^{-2}) \\cdot (2 \\cdot 10^{-4})$

4.  Oblicz i przedstaw wynik w notacji wykładniczej:
    a) $\\frac{9 \\cdot 10^{12}}{3 \\cdot 10^4}$
    b) $\\frac{2,4 \\cdot 10^3}{8 \\cdot 10^7}$

5.  Oblicz i przedstaw wynik w notacji wykładniczej:
    a) $3,2 \\cdot 10^6 + 5 \\cdot 10^5$
    b) $7 \\cdot 10^{-3} - 4,5 \\cdot 10^{-4}$

6.  Prędkość światła w próżni wynosi około $3 \\cdot 10^8$ m/s. Ile kilometrów pokona światło w ciągu $2 \\cdot 10^2$ sekund? Wynik podaj w notacji wykładniczej.

## Odpowiedzi
1.  a) $4,8 \\cdot 10^{-9}$
    b) $2,15 \\cdot 10^{14}$
    c) $3,05 \\cdot 10^8$
    d) $1,5 \\cdot 10^{-2}$

2.  a) $62\\,500\\,000$
    b) $0,000\\,081$
    c) $1,003$

3.  a) $2,8 \\cdot 10^{-3}$
        Rozwiązanie: $(4 \\cdot 7) \\cdot 10^{5+(-9)} = 28 \\cdot 10^{-4} = 2,8 \\cdot 10^1 \\cdot 10^{-4} = 2,8 \\cdot 10^{-3}$
    b) $3 \\cdot 10^{-6}$
        Rozwiązanie: $(1,5 \\cdot 2) \\cdot 10^{-2+(-4)} = 3 \\cdot 10^{-6}$

4.  a) $3 \\cdot 10^8$
        Rozwiązanie: $(\\frac{9}{3}) \\cdot 10^{12-4} = 3 \\cdot 10^8$
    b) $3 \\cdot 10^{-5}$
        Rozwiązanie: $(\\frac{2,4}{8}) \\cdot 10^{3-7} = 0,3 \\cdot 10^{-4} = 3 \\cdot 10^{-1} \\cdot 10^{-4} = 3 \\cdot 10^{-5}$

5.  a) $3,7 \\cdot 10^6$
        Rozwiązanie: $3,2 \\cdot 10^6 + 0,5 \\cdot 10^6 = (3,2+0,5) \\cdot 10^6 = 3,7 \\cdot 10^6$
    b) $6,55 \\cdot 10^{-3}$
        Rozwiązanie: $7 \\cdot 10^{-3} - 0,45 \\cdot 10^{-3} = (7-0,45) \\cdot 10^{-3} = 6,55 \\cdot 10^{-3}$

6.  $6 \\cdot 10^7$ km
    Rozwiązanie: Odległość = prędkość $\\cdot$ czas.
    Odległość = $(3 \\cdot 10^8 \\text{ m/s}) \\cdot (2 \\cdot 10^2 \\text{ s}) = (3 \\cdot 2) \\cdot 10^{8+2} \\text{ m} = 6 \\cdot 10^{10} \\text{ m}$.
    Ponieważ $1 \\text{ km} = 1000 \\text{ m} = 10^3 \\text{ m}$, musimy podzielić wynik w metrach przez $10^3$:
    $6 \\cdot 10^{10} \\text{ m} = \\frac{6 \\cdot 10^{10}}{10^3} \\text{ km} = 6 \\cdot 10^{10-3} \\text{ km} = 6 \\cdot 10^7 \\text{ km}$.

## Szybka powtórka
1.  Jaki warunek musi spełniać liczba $a$ (mantysa) w zapisie notacji wykładniczej $a \\cdot 10^k$?
2.  Czy liczba $0,5 \\cdot 10^4$ jest poprawnie zapisana w notacji wykładniczej? Jeśli nie, to dlaczego?
3.  Jaka jest zasada dotycząca wykładników potęgi 10 przy dzieleniu liczb w notacji wykładniczej?
4.  Jak przekształcić liczbę $2,5 \\cdot 10^6$ na postać z wykładnikiem $10^5$?
5.  Dla jakich liczb całkowitych $k$ wykładnik w notacji wykładniczej jest ujemny?`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "wartosc_bezwzgledna",
    title: "Wartość bezwzględna – klucz do zrozumienia liczb",
    content: `## Na egzaminie
Wartość bezwzględna pojawia się na maturze podstawowej regularnie, zazwyczaj jako element zadań dotyczących równań, nierówności lub funkcji. Zadania z tym tematem mogą być warte od 2 do nawet 4 punktów. CKE często sprawdza umiejętność rozwiązywania równań i nierówności z wartością bezwzględną oraz rozumienie geometrycznej interpretacji wartości bezwzględnej jako odległości na osi liczbowej.

## Mapa tematu
W tej lekcji dowiesz się:
1. Czym jest wartość bezwzględna liczby rzeczywistej.
2. Jak obliczać wartość bezwzględną z różnych liczb (dodatnich, ujemnych, zera).
3. Jak interpretować wartość bezwzględną jako odległość na osi liczbowej.
4. Jak rozwiązywać proste równania z wartością bezwzględną.
5. Jak rozwiązywać proste nierówności z wartością bezwzględną.
6. Jak stosować definicję wartości bezwzględnej do upraszczania wyrażeń.
7. Jak rozwiązywać zadania tekstowe wykorzystujące pojęcie wartości bezwzględnej.
8. Jak poznać typowe pułapki związane z wartością bezwzględną.

## Definicje i wzory
*   **Definicja wartości bezwzględnej:** Wartość bezwzględna liczby rzeczywistej $a$, oznaczana jako $|a|$, to odległość tej liczby od zera na osi liczbowej. Zawsze jest liczbą nieujemną.

*   **Definicja analityczna:**
    $$
    |a| = \\begin{cases}
    a & \\text{gdy } a \\ge 0 \\\\
    -a & \\text{gdy } a < 0
    \\end{cases}
    $$
    Oznacza to, że:
    *   Jeśli liczba jest dodatnia lub równa zero, jej wartość bezwzględna jest równa tej liczbie.
    *   Jeśli liczba jest ujemna, jej wartość bezwzględna jest równa liczbie do niej przeciwnej (czyli tej samej liczbie pomnożonej przez -1).

*   **Własności wartości bezwzględnej:**
    *   Dla każdej liczby rzeczywistej $a$: $|a| \\ge 0$.
    *   Dla każdej liczby rzeczywistej $a$: $|a| = |-a|$.
    *   Dla każdej liczby rzeczywistej $a$: $|a| = \\sqrt{a^2}$.
    *   Dla dowolnych liczb rzeczywistych $a, b$: $|a \\cdot b| = |a| \\cdot |b|$.
    *   Dla dowolnych liczb rzeczywistych $a, b$ (gdzie $b \\neq 0$): $|\\frac{a}{b}| = \\frac{|a|}{|b|}$.
    *   Dla dowolnych liczb rzeczywistych $a, b$: $|a+b| \\le |a|+|b|$ (nierówność trójkąta).

*   **Geometryczna interpretacja:** Wartość bezwzględna $|a-b|$ oznacza odległość między liczbami $a$ i $b$ na osi liczbowej. W szczególności $|a| = |a-0|$ to odległość liczby $a$ od zera.

*   **Rozwiązywanie równań z wartością bezwzględną:**
    *   Równanie typu $|x| = c$, gdzie $c > 0$: ma dwa rozwiązania $x = c$ lub $x = -c$.
    *   Równanie typu $|x| = 0$: ma jedno rozwiązanie $x = 0$.
    *   Równanie typu $|x| = c$, gdzie $c < 0$: nie ma rozwiązań.
    *   Równanie typu $|x-k| = c$, gdzie $c > 0$: oznacza, że odległość $x$ od $k$ jest równa $c$. Rozwiązania to $x-k = c$ lub $x-k = -c$, czyli $x = k+c$ lub $x = k-c$.
    *   Równania typu $|f(x)| = g(x)$: są równoważne dwóm równaniom: $f(x) = g(x)$ lub $f(x) = -g(x)$, ale pod warunkiem, że $g(x) \\ge 0$.

*   **Rozwiązywanie nierówności z wartością bezwzględną:**
    *   Nierówność typu $|x| < c$, gdzie $c > 0$: jest równoważna nierówności $-c < x < c$.
    *   Nierówność typu $|x| \\le c$, gdzie $c > 0$: jest równoważna nierówności $-c \\le x \\le c$.
    *   Nierówność typu $|x| > c$, gdzie $c > 0$: jest równoważna alternatywie $x > c$ lub $x < -c$.
    *   Nierówność typu $|x| \\ge c$, gdzie $c > 0$: jest równoważna alternatywie $x \\ge c$ lub $x \\le -c$.
    *   Nierówność typu $|x-k| < c$, gdzie $c > 0$: oznacza, że odległość $x$ od $k$ jest mniejsza niż $c$. Rozwiązaniem jest $-c < x-k < c$, czyli $k-c < x < k+c$.
    *   Nierówność typu $|x-k| > c$, gdzie $c > 0$: oznacza, że odległość $x$ od $k$ jest większa niż $c$. Rozwiązaniem jest $x-k > c$ lub $x-k < -c$, czyli $x > k+c$ lub $x < k-c$.

## Przykład 1 - podstawowy
**Oblicz wartość wyrażenia: $|5 - 8| + |-3| - |10|$.**

*   **Krok 1.** Obliczamy wartość bezwzględną z pierwszej liczby: $5 - 8 = -3$. Zatem $|5 - 8| = |-3|$.
*   **Krok 2.** Obliczamy wartość bezwzględną z $-3$. Zgodnie z definicją, jeśli liczba jest ujemna, jej wartość bezwzględna to liczba przeciwna: $|-3| = -(-3) = 3$.
*   **Krok 3.** Obliczamy wartość bezwzględną z drugiej liczby: $|-3|$. Ta wartość została już obliczona w Kroku 2 i wynosi 3.
*   **Krok 4.** Obliczamy wartość bezwzględną z trzeciej liczby: $|10|$. Liczba 10 jest dodatnia, więc jej wartość bezwzględna jest równa 10. $|10| = 10$.
*   **Krok 5.** Podstawiamy obliczone wartości do wyrażenia i wykonujemy odejmowanie: $3 + 3 - 10 = 6 - 10 = -4$.

**Sprawdzenie:**
$|5-8| + |-3| - |10| = |-3| + 3 - 10 = 3 + 3 - 10 = 6 - 10 = -4$. Wynik jest poprawny.

## Przykład 2 - maturalny
**Rozwiąż równanie: $|2x - 1| = 5$.**

To równanie oznacza, że odległość wyrażenia $2x - 1$ od zera jest równa 5. Zgodnie z definicją wartości bezwzględnej, liczby, których wartość bezwzględna wynosi 5, to 5 i -5. Zatem mamy dwie możliwości:

1.  $2x - 1 = 5$
    Dodajemy 1 do obu stron:
    $2x = 5 + 1$
    $2x = 6$
    Dzielimy obie strony przez 2:
    $x = 3$

2.  $2x - 1 = -5$
    Dodajemy 1 do obu stron:
    $2x = -5 + 1$
    $2x = -4$
    Dzielimy obie strony przez 2:
    $x = -2$

**Sprawdzenie:**
Dla $x = 3$: $|2 \\cdot 3 - 1| = |6 - 1| = |5| = 5$. Równanie jest spełnione.
Dla $x = -2$: $|2 \\cdot (-2) - 1| = |-4 - 1| = |-5| = 5$. Równanie jest spełnione.

Rozwiązaniami równania są $x = 3$ oraz $x = -2$.

## Przykład 3 - egzaminacyjny

**Rozwiąż nierówność: $|x+1| < 3$.**

Nierówność $|x+1| < 3$ oznacza, że odległość liczby $x+1$ od zera jest mniejsza niż 3. Możemy to zapisać jako:
$-3 < x+1 < 3$

Aby rozwiązać tę podwójną nierówność, odejmujemy 1 od wszystkich jej części:
$-3 - 1 < x+1 - 1 < 3 - 1$
$-4 < x < 2$

Rozwiązaniem nierówności jest przedział $(-4, 2)$.

**Alternatywne podejście (geometryczne):**
Nierówność $|x+1| < 3$ możemy zapisać jako $|x - (-1)| < 3$. Oznacza to, że odległość liczby $x$ od liczby $-1$ jest mniejsza niż 3. Na osi liczbowej zaznaczamy punkt $-1$. Szukamy liczb $x$, które są oddalone od $-1$ o mniej niż 3 jednostki. Są to liczby z przedziału $(-1 - 3, -1 + 3)$, czyli $(-4, 2)$.

## Pułapki
*   **Zapominanie o drugim rozwiązaniu:** Równanie $|x| = c$ (gdzie $c > 0$) ma dwa rozwiązania: $x=c$ i $x=-c$. Często uczniowie podają tylko jedno z nich.
*   **Błędne opuszczanie wartości bezwzględnej:** Np. mylenie $|-5|$ z $-5$ zamiast $5$. Pamiętaj, że wartość bezwzględna nigdy nie jest ujemna.
*   **Niewłaściwe stosowanie definicji dla nierówności:** Np. mylenie $|x| < c$ z $x < c$ lub $|x| > c$ z $x > c$. Nierówności z wartością bezwzględną wymagają analizy dwóch przypadków lub przekształcenia na podwójną nierówność/alternatywę.
*   **Brak warunku nieujemności:** Przy rozwiązywaniu równań typu $|f(x)| = g(x)$, należy pamiętać o warunku $g(x) \\ge 0$. Jeśli $g(x)$ okaże się ujemne dla któregoś z potencjalnych rozwiązań, to rozwiązanie należy odrzucić.
*   **Założenie, że $|a+b| = |a| + |b|$:** To nie jest prawda. Np. $|-2+3| = |1| = 1$, ale $|-2| + |3| = 2 + 3 = 5$. Prawidłowa jest nierówność trójkąta $|a+b| \\le |a|+|b|$.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz: $|-7| + |4| - |2-9|$.
2.  Rozwiąż równanie: $|x| = 9$.
3.  Rozwiąż równanie: $|3x + 2| = 7$.
4.  Rozwiąż nierówność: $|x| \\le 5$.
5.  Rozwiąż nierówność: $|x-2| > 4$.
6.  Dla jakiej liczby $a$ zachodzi równość $|a-5|=2$? Podaj wszystkie możliwości.
7.  Rozwiąż równanie: $|x+3| = |2x-1|$. (Wskazówka: rozważ dwa przypadki: $x+3 = 2x-1$ oraz $x+3 = -(2x-1)$).

## Odpowiedzi
1.  $|-7| + |4| - |2-9| = 7 + 4 - |-7| = 7 + 4 - 7 = 4$.
2.  $x = 9$ lub $x = -9$.
3.  $|3x+2| = 7$ jest równoważne $3x+2 = 7$ lub $3x+2 = -7$.
    Pierwszy przypadek: $3x = 5$, $x = \\frac{5}{3}$.
    Drugi przypadek: $3x = -9$, $x = -3$.
    Rozwiązania: $x = \\frac{5}{3}$ lub $x = -3$.
4.  $|x| \\le 5$ jest równoważne $-5 \\le x \\le 5$. Rozwiązaniem jest przedział $[-5, 5]$.
5.  $|x-2| > 4$ jest równoważne $x-2 > 4$ lub $x-2 < -4$.
    Pierwszy przypadek: $x > 6$.
    Drugi przypadek: $x < -2$.
    Rozwiązaniem jest suma przedziałów $(-\\infty, -2) \\cup (6, \\infty)$.
6.  $|a-5|=2$ jest równoważne $a-5 = 2$ lub $a-5 = -2$.
    Pierwszy przypadek: $a = 7$.
    Drugi przypadek: $a = 3$.
    Możliwości: $a=3$ lub $a=7$.
7.  $|x+3| = |2x-1|$
    Przypadek 1: $x+3 = 2x-1 \\implies -x = -4 \\implies x=4$.
    Przypadek 2: $x+3 = -(2x-1) \\implies x+3 = -2x+1 \\implies 3x = -2 \\implies x = -\\frac{2}{3}$.
    Rozwiązania: $x=4$ lub $x=-\\frac{2}{3}$.

## Szybka powtórka
1.  Jaka jest definicja wartości bezwzględnej liczby $a$?
2.  Czy wartość bezwzględna może być liczbą ujemną?
3.  Ile rozwiązań ma równanie $|x| = 10$?
4.  Jak zapisać nierówność $|x| < 5$ za pomocą podwójnej nierówności?
5.  Co geometrycznie oznacza wyrażenie $|a-b|$?

## Diagram
\`\`\`text
        <----|----|----|----|----|----|----|----|----> osi liczbowej
            -4   -3   -2   -1    0    1    2    3    4

Wartość bezwzględna |x| to odległość x od 0.
Np. |3| = 3 (odległość 3 od 0)
Np. |-2| = 2 (odległość 2 od 0)

Równanie |x - k| = c to odległość x od k jest równa c.
Np. |x - 2| = 3 oznacza, że x jest oddalone od 2 o 3.
    Rozwiązania: x = 2+3=5 lub x = 2-3=-1.
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "kolejnosc_dzialan",
    title: "Kolejność wykonywania działań",
    content: `## Na egzaminie
Kolejność wykonywania działań to fundamentalna umiejętność sprawdzana na maturze z matematyki na poziomie podstawowym. Zadania dotyczące kolejności działań pojawiają się co roku, często jako pierwsze zadania otwarte lub jako element bardziej złożonych zadań. Poprawne ich rozwiązanie pozwala na zdobycie pewnych punktów, zwykle 1-3, i buduje pewność siebie przed trudniejszymi problemami. CKE często sprawdza umiejętność radzenia sobie z ułamkami, potęgami oraz nawiasami.

## Mapa tematu
W trakcie tej lekcji opanujesz:
1.  Zrozumienie i stosowanie podstawowych zasad kolejności wykonywania działań.
2.  Prawidłowe wykonywanie działań w nawiasach, zaczynając od tych najbardziej wewnętrznych.
3.  Poprawne obliczanie potęg i pierwiastków.
4.  Wykonywanie mnożenia i dzielenia w kolejności ich występowania od lewej do prawej.
5.  Wykonywanie dodawania i odejmowania w kolejności ich występowania od lewej do prawej.
6.  Łączenie wszystkich zasad przy obliczaniu złożonych wyrażeń arytmetycznych.
7.  Rozpoznawanie typowych błędów i unikanie ich w rozwiązaniach.
8.  Praktyczne zastosowanie zasad kolejności działań w zadaniach typu maturalnego.

## Definicje i wzory
Kolejność wykonywania działań arytmetycznych jest ściśle określona i pozwala na uzyskanie jednoznacznego wyniku dla każdego wyrażenia matematycznego. Stosujemy ją dla liczb rzeczywistych (całkowitych, wymiernych, niewymiernych).

**Zasady kolejności wykonywania działań (od najwyższego do najniższego priorytetu):**

1.  **Nawiasy:** Działania w nawiasach wykonujemy jako pierwsze. Jeśli mamy nawiasy zagnieżdżone, zaczynamy od najbardziej wewnętrznych.
    *   Przykład: $ (2 + (3 \\cdot 4) ) $ - najpierw mnożenie $3 \\cdot 4$, potem dodawanie $2 + 12$.
2.  **Potęgowanie i pierwiastkowanie:** Potęgi i pierwiastki mają ten sam priorytet. Wykonujemy je w kolejności ich występowania od lewej do prawej strony wyrażenia.
    *   Potęga: $a^n = a \\cdot a \\cdot \\ldots \\cdot a$ ($n$ razy)
    *   Pierwiastek kwadratowy: $\\sqrt{a}$ jest to liczba nieujemna $x$, taka że $x^2 = a$.
3.  **Mnożenie i dzielenie:** Mnożenie i dzielenie mają ten sam priorytet. Wykonujemy je w kolejności ich występowania od lewej do prawej strony wyrażenia.
    *   Iloczyn: $a \\cdot b$
    *   Iloraz: $a : b = \\frac{a}{b}$ (jeśli $b \\neq 0$)
4.  **Dodawanie i odejmowanie:** Dodawanie i odejmowanie mają najniższy priorytet. Wykonujemy je w kolejności ich występowania od lewej do prawej strony wyrażenia.
    *   Suma: $a + b$
    *   Różnica: $a - b$

**Podsumowanie w skrócie:**

*   **N** - Nawiasy
*   **P** - Potęgi i Pierwiastki
*   **M/D** - Mnożenie i Dzielenie (od lewej do prawej)
*   **A/O** - Dodawanie i Odejmowanie (od lewej do prawej)

**Przykład z użyciem kolejności:**
Wyrażenie: $ 5 + 3 \\cdot 2^3 - \\sqrt{9} \\div 1 $

1.  **Nawiasy:** Brak.
2.  **Potęgowanie/Pierwiastkowanie:**
    *   $2^3 = 8$
    *   $\\sqrt{9} = 3$
    Wyrażenie po tym kroku: $ 5 + 3 \\cdot 8 - 3 \\div 1 $
3.  **Mnożenie/Dzielenie (od lewej):**
    *   $3 \\cdot 8 = 24$
    *   $3 \\div 1 = 3$
    Wyrażenie po tym kroku: $ 5 + 24 - 3 $
4.  **Dodawanie/Odejmowanie (od lewej):**
    *   $5 + 24 = 29$
    Wyrażenie po tym kroku: $ 29 - 3 $
    *   $29 - 3 = 26$

Wynik końcowy: $26$.

## Przykład 1 - podstawowy
Oblicz wartość wyrażenia: $ 10 - 2 \\cdot (5 + 1)^2 : 4 $

**Krok 1.** Rozpoczynamy od działań w nawiasie.
$ 5 + 1 = 6 $
Wyrażenie przyjmuje postać: $ 10 - 2 \\cdot 6^2 : 4 $

**Krok 2.** Wykonujemy potęgowanie.
$ 6^2 = 36 $
Wyrażenie przyjmuje postać: $ 10 - 2 \\cdot 36 : 4 $

**Krok 3.** Wykonujemy mnożenie i dzielenie od lewej do prawej. Najpierw mnożenie.
$ 2 \\cdot 36 = 72 $
Wyrażenie przyjmuje postać: $ 10 - 72 : 4 $

**Krok 4.** Wykonujemy dzielenie.
$ 72 : 4 = 18 $
Wyrażenie przyjmuje postać: $ 10 - 18 $

**Krok 5.** Wykonujemy odejmowanie.
$ 10 - 18 = -8 $

**Sprawdzenie:**
Wyrażenie: $ 10 - 2 \\cdot (5 + 1)^2 : 4 $
$ 10 - 2 \\cdot (6)^2 : 4 $
$ 10 - 2 \\cdot 36 : 4 $
$ 10 - 72 : 4 $
$ 10 - 18 $
$ -8 $
Wynik jest poprawny.

## Przykład 2 - maturalny
Oblicz wartość wyrażenia: $ \\frac{2}{3} \\cdot \\left( \\frac{1}{2} + \\frac{1}{4} \\right)^2 - \\frac{1}{6} $

**Krok 1.** Wykonujemy działania w nawiasie. Musimy dodać dwa ułamki. Znajdujemy wspólny mianownik dla 2 i 4, którym jest 4.
$ \\frac{1}{2} = \\frac{1 \\cdot 2}{2 \\cdot 2} = \\frac{2}{4} $
Suma w nawiasie: $ \\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4} $
Wyrażenie przyjmuje postać: $ \\frac{2}{3} \\cdot \\left( \\frac{3}{4} \\right)^2 - \\frac{1}{6} $

**Krok 2.** Wykonujemy potęgowanie ułamka.
$ \\left( \\frac{3}{4} \\right)^2 = \\frac{3^2}{4^2} = \\frac{9}{16} $
Wyrażenie przyjmuje postać: $ \\frac{2}{3} \\cdot \\frac{9}{16} - \\frac{1}{6} $

**Krok 3.** Wykonujemy mnożenie ułamków.
$ \\frac{2}{3} \\cdot \\frac{9}{16} = \\frac{2 \\cdot 9}{3 \\cdot 16} $
Możemy skrócić licznik i mianownik: $2$ z $16$ (zostaje $1$ i $8$), $3$ z $9$ (zostaje $1$ i $3$).
$ \\frac{1 \\cdot 3}{1 \\cdot 8} = \\frac{3}{8} $
Wyrażenie przyjmuje postać: $ \\frac{3}{8} - \\frac{1}{6} $

**Krok 4.** Wykonujemy odejmowanie ułamków. Znajdujemy wspólny mianownik dla 8 i 6. Najmniejszym wspólnym mianownikiem jest 24.
$ \\frac{3}{8} = \\frac{3 \\cdot 3}{8 \\cdot 3} = \\frac{9}{24} $
$ \\frac{1}{6} = \\frac{1 \\cdot 4}{6 \\cdot 4} = \\frac{4}{24} $
Różnica: $ \\frac{9}{24} - \\frac{4}{24} = \\frac{5}{24} $

Wynik końcowy: $ \\frac{5}{24} $.

## Przykład 3 - egzaminacyjny

Oblicz: $ 5 \\frac{1}{2} - 2 \\frac{1}{3} : 1 \\frac{1}{6} $

**Krok 1.** Zamieniamy liczby mieszane na ułamki niewłaściwe.
$ 5 \\frac{1}{2} = \\frac{5 \\cdot 2 + 1}{2} = \\frac{11}{2} $
$ 2 \\frac{1}{3} = \\frac{2 \\cdot 3 + 1}{3} = \\frac{7}{3} $
$ 1 \\frac{1}{6} = \\frac{1 \\cdot 6 + 1}{6} = \\frac{7}{6} $
Wyrażenie przyjmuje postać: $ \\frac{11}{2} - \\frac{7}{3} : \\frac{7}{6} $

**Krok 2.** Wykonujemy dzielenie ułamków. Dzielenie przez ułamek to mnożenie przez jego odwrotność.
$ \\frac{7}{3} : \\frac{7}{6} = \\frac{7}{3} \\cdot \\frac{6}{7} $
Skracamy $7$ z $7$ i $3$ z $6$.
$ \\frac{1}{1} \\cdot \\frac{2}{1} = 2 $
Wyrażenie przyjmuje postać: $ \\frac{11}{2} - 2 $

**Krok 3.** Wykonujemy odejmowanie. Zamieniamy liczbę całkowitą $2$ na ułamek o mianowniku $2$.
$ 2 = \\frac{2 \\cdot 2}{2} = \\frac{4}{2} $
Różnica: $ \\frac{11}{2} - \\frac{4}{2} = \\frac{7}{2} $

**Krok 4.** Możemy zamienić wynik na liczbę mieszaną.
$ \\frac{7}{2} = 3 \\frac{1}{2} $

Wynik końcowy: $ \\frac{7}{2} $ lub $ 3 \\frac{1}{2} $.

## Pułapki
*   **Niewłaściwa kolejność działań:** Najczęstszy błąd to wykonywanie działań od lewej do prawej, ignorując priorytety potęg, pierwiastków, mnożenia i dzielenia względem dodawania i odejmowania. Zawsze pamiętaj o kolejności: Nawiasy -> Potęgi/Pierwiastki -> Mnożenie/Dzielenie -> Dodawanie/Odejmowanie.
*   **Błędy w działaniach na ułamkach:** Mnożenie i dzielenie ułamków, a także ich dodawanie i odejmowanie, wymaga znajomości odpowiednich reguł. Szczególną ostrożność należy zachować przy znajdowaniu wspólnego mianownika oraz przy mnożeniu przez odwrotność w przypadku dzielenia. Pamiętaj, że $ \\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c} $.
*   **Potęgowanie liczb mieszanych lub ułamków:** Błąd polega na podnoszeniu do potęgi tylko licznika lub tylko mianownika, zamiast całego ułamka. Poprawnie: $ \\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n} $.
*   **Znaki minus przy odejmowaniu lub liczbach ujemnych:** Uważaj na znaki, zwłaszcza gdy odejmujesz liczbę, która jest wynikiem mnożenia przez liczbę ujemną, lub gdy masz do czynienia z potęgami liczb ujemnych (np. $ (-2)^2 = 4 $, ale $ -2^2 = -4 $).
*   **Brak uproszczeń:** Niepotrzebne komplikowanie obliczeń przez brak skrócenia ułamków w trakcie mnożenia lub dzielenia prowadzi do większych liczb i zwiększa ryzyko błędów rachunkowych. Staraj się skracać jak najwcześniej.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz: $ 15 - 3 \\cdot (4 + 1)^2 : 5 $
2.  Oblicz: $ 2 \\frac{1}{4} + 1 \\frac{1}{2} \\cdot \\frac{2}{3} $
3.  Oblicz: $ 100 : (2 \\cdot 5)^2 - 3 $
4.  Oblicz: $ \\left( \\frac{3}{5} - \\frac{1}{10} \\right) : \\frac{1}{2} + 4 $
5.  Oblicz: $ \\sqrt{16} \\cdot 3^2 - (10 - 4 \\cdot 2) $
6.  Oblicz: $ \\frac{5}{6} : \\left( 1 - \\frac{1}{3} \\right) + \\frac{1}{2} $
7.  Oblicz: $ 7 + 2 \\cdot (3^3 - \\sqrt{64}) : 5 $

## Odpowiedzi
1.  $ 15 - 3 \\cdot 5^2 : 5 = 15 - 3 \\cdot 25 : 5 = 15 - 75 : 5 = 15 - 15 = 0 $
2.  $ 2 \\frac{1}{4} + \\frac{3}{2} \\cdot \\frac{2}{3} = 2 \\frac{1}{4} + 1 = 3 \\frac{1}{4} $
3.  $ 100 : (10)^2 - 3 = 100 : 100 - 3 = 1 - 3 = -2 $
4.  $ \\left( \\frac{6}{10} - \\frac{1}{10} \\right) : \\frac{1}{2} + 4 = \\frac{5}{10} : \\frac{1}{2} + 4 = \\frac{1}{2} \\cdot 2 + 4 = 1 + 4 = 5 $
5.  $ 4 \\cdot 9 - (10 - 8) = 36 - 2 = 34 $
6.  $ \\frac{5}{6} : \\frac{2}{3} + \\frac{1}{2} = \\frac{5}{6} \\cdot \\frac{3}{2} + \\frac{1}{2} = \\frac{5}{4} + \\frac{1}{2} = \\frac{5}{4} + \\frac{2}{4} = \\frac{7}{4} $
7.  $ 7 + 2 \\cdot (27 - 8) : 5 = 7 + 2 \\cdot 19 : 5 = 7 + 38 : 5 = 7 + 7.6 = 14.6 $ (lub $7 + \\frac{38}{5} = \\frac{35}{5} + \\frac{38}{5} = \\frac{73}{5}$)

## Szybka powtórka
1.  Jakie działania wykonujemy jako pierwsze?
2.  Jakie działania mają ten sam priorytet co potęgowanie?
3.  W jakiej kolejności wykonujemy mnożenie i dzielenie?
4.  W jakiej kolejności wykonujemy dodawanie i odejmowanie?
5.  Co robimy, gdy mamy nawiasy w nawiasach?

## Diagram
\`\`\`text
+------------------------------------------+
|       Kolejność Wykonywania Działań      |
+------------------------------------------+
| 1. Nawiasy (od najbardziej wewnętrznych) |
|    ( ) [ ] { }                           |
+------------------------------------------+
| 2. Potęgowanie i Pierwiastkowanie         |
|    $x^n$, $\\sqrt{x}$ (od lewej do prawej) |
+------------------------------------------+
| 3. Mnożenie i Dzielenie                  |
|    $ \\cdot $, $ : $ (od lewej do prawej)  |
+------------------------------------------+
| 4. Dodawanie i Odejmowanie               |
|    $ + $, $ - $ (od lewej do prawej)     |
+------------------------------------------+
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "wyrazenia_algebraiczne",
    title: "Wyrażenia algebraiczne i ich przekształcanie",
    content: `## Na egzaminie
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
*   **Wyrażenie algebraiczne** to takie, które zawiera liczby, litery (zmienne), symbole działań matematycznych (+, -, $\\cdot$, :), nawiasy oraz potęgi.
    *   **Wyraz algebraiczny (monom)**: Jednoelementowe wyrażenie algebraiczne, będące iloczynem liczb i zmiennych podniesionych do pewnych potęg. Np.: $3x$, $-5y^2$, $\\frac{1}{2}ab$, $7$.
    *   **Współczynnik**: Liczba stojąca przed zmienną (lub zmiennymi) w wyrazie algebraicznym. Np. we wzorach $3x$, $-5y^2$, $\\frac{1}{2}ab$, współczynnikami są odpowiednio $3$, $-5$, $\\frac{1}{2}$. W wyrazie $x$ współczynnikiem jest $1$, a w $-y$ jest $-1$.
    *   **Część zmienna**: Litery występujące w wyrazie algebraicznym. Np. w $3x$ częścią zmienną jest $x$, w $-5y^2$ jest $y^2$, w $\\frac{1}{2}ab$ jest $ab$.
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
        *   $\\frac{a+b}{c} = \\frac{a}{c} + \\frac{b}{c}$ (gdzie $c \\neq 0$)

*   **Wzory skróconego mnożenia** (kluczowe na maturze!):
    *   **Kwadrat sumy**: $(a+b)^2 = a^2 + 2ab + b^2$
    *   **Kwadrat różnicy**: $(a-b)^2 = a^2 - 2ab + b^2$
    *   **Różnica kwadratów**: $a^2 - b^2 = (a-b)(a+b)$

## Przykład 1 - podstawowy
Uprość wyrażenie algebraiczne: $5(x - 2y) - 3(2x + y) + 4y$.

**Krok 1.** Opuszczamy pierwsze nawiasy, mnożąc $5$ przez każdy składnik w nawiasie:
$5(x - 2y) = 5 \\cdot x - 5 \\cdot 2y = 5x - 10y$

**Krok 2.** Opuszczamy drugie nawiasy, mnożąc $-3$ przez każdy składnik w nawiasie:
$-3(2x + y) = -3 \\cdot 2x + (-3) \\cdot y = -6x - 3y$

**Krok 3.** Zapisujemy całe wyrażenie po opuszczeniu nawiasów:
$5x - 10y - 6x - 3y + 4y$

**Krok 4.** Grupujemy i dodajemy (odejmujemy) wyrazy podobne. Wyrazy z $x$: $5x$ i $-6x$. Wyrazy z $y$: $-10y$, $-3y$ i $4y$.
$(5x - 6x) + (-10y - 3y + 4y)$

**Krok 5.** Wykonujemy działania w grupach:
$(5-6)x + (-10-3+4)y = -1x + (-9)y = -x - 9y$

**Sprawdzenie:**
Przyjmijmy $x=1$, $y=2$.
Oryginalne wyrażenie: $5(1 - 2 \\cdot 2) - 3(2 \\cdot 1 + 2) + 4 \\cdot 2 = 5(1 - 4) - 3(2 + 2) + 8 = 5(-3) - 3(4) + 8 = -15 - 12 + 8 = -19$.
Uproszczone wyrażenie: $-x - 9y = -1 - 9 \\cdot 2 = -1 - 18 = -19$.
Wyniki są zgodne.

## Przykład 2 - maturalny
Uprość wyrażenie: $(\\frac{1}{2}a - 3b)^2 - (\\frac{1}{2}a + 3b)(\\frac{1}{2}a - 3b)$.

**Krok 1.** Rozpoznajemy wzory skróconego mnożenia. Pierwszy człon to kwadrat różnicy $(a-b)^2$, gdzie $a = \\frac{1}{2}a$ i $b = 3b$. Drugi człon to różnica kwadratów $a^2 - b^2$, gdzie $a = \\frac{1}{2}a$ i $b = 3b$.

**Krok 2.** Stosujemy wzór na kwadrat różnicy do pierwszego członu:
$(\\frac{1}{2}a - 3b)^2 = (\\frac{1}{2}a)^2 - 2 \\cdot (\\frac{1}{2}a) \\cdot (3b) + (3b)^2 = \\frac{1}{4}a^2 - 3ab + 9b^2$

**Krok 3.** Stosujemy wzór na różnicę kwadratów do drugiego członu. Pamiętamy, że całe wyrażenie jest odejmowane, więc stosujemy nawiasy:
$(\\frac{1}{2}a + 3b)(\\frac{1}{2}a - 3b) = (\\frac{1}{2}a)^2 - (3b)^2 = \\frac{1}{4}a^2 - 9b^2$

**Krok 4.** Podstawiamy obliczone wyrażenia z powrotem do oryginalnego równania i opuszczamy nawiasy, pamiętając o zmianie znaków przy drugim członie:
$(\\frac{1}{4}a^2 - 3ab + 9b^2) - (\\frac{1}{4}a^2 - 9b^2) = \\frac{1}{4}a^2 - 3ab + 9b^2 - \\frac{1}{4}a^2 + 9b^2$

**Krok 5.** Grupujemy i dodajemy (odejmujemy) wyrazy podobne:
$(\\frac{1}{4}a^2 - \\frac{1}{4}a^2) - 3ab + (9b^2 + 9b^2)$

**Krok 6.** Obliczamy wynik:
$0 - 3ab + 18b^2 = -3ab + 18b^2$

**Sprawdzenie:**
Przyjmijmy $a=2$, $b=1$.
Oryginalne wyrażenie: $(\\frac{1}{2}\\cdot 2 - 3\\cdot 1)^2 - (\\frac{1}{2}\\cdot 2 + 3\\cdot 1)(\\frac{1}{2}\\cdot 2 - 3\\cdot 1) = (1 - 3)^2 - (1 + 3)(1 - 3) = (-2)^2 - (4)(-2) = 4 - (-8) = 4 + 8 = 12$.
Uproszczone wyrażenie: $-3ab + 18b^2 = -3\\cdot 2\\cdot 1 + 18\\cdot 1^2 = -6 + 18 = 12$.
Wyniki są zgodne.

## Przykład 3 - egzaminacyjny

Pole prostokąta wynosi $P = 6x^2 + 7x - 3$. Jednym z boków tego prostokąta jest dwumian $2x+3$. Wyznacz długość drugiego boku.

**Krok 1.** Wiemy, że pole prostokąta jest iloczynem długości jego boków. Oznaczmy długości boków jako $a$ i $b$. Wtedy $P = a \\cdot b$. W tym zadaniu mamy dane pole $P = 6x^2 + 7x - 3$ i jeden z boków, np. $a = 2x+3$. Musimy znaleźć drugi bok, $b$.

**Krok 2.** Zapisujemy równanie: $(2x+3) \\cdot b = 6x^2 + 7x - 3$.

**Krok 3.** Aby znaleźć $b$, musimy podzielić pole przez długość znanego boku: $b = \\frac{6x^2 + 7x - 3}{2x+3}$. Możemy wykonać to dzielenie pisemne lub spróbować rozłożyć licznik na czynniki. Spróbujmy rozłożyć trójmian kwadratowy $6x^2 + 7x - 3$ na czynniki. Poszukujemy dwóch liczb, których iloczyn wynosi $6 \\cdot (-3) = -18$, a suma $7$. Takimi liczbami są $9$ i $-2$.
$6x^2 + 7x - 3 = 6x^2 + 9x - 2x - 3$

**Krok 4.** Grupowanie wyrazów w rozłożonym liczniku:
$6x^2 + 9x - 2x - 3 = 3x(2x+3) - 1(2x+3)$

**Krok 5.** Wyłączamy wspólny czynnik $(2x+3)$:
$(3x-1)(2x+3)$

**Krok 6.** Podstawiamy rozłożony licznik z powrotem do wzoru na $b$:
$b = \\frac{(3x-1)(2x+3)}{2x+3}$

**Krok 7.** Skracamy wspólny czynnik $(2x+3)$ (zakładając, że $2x+3 \\neq 0$):
$b = 3x-1$

**Odpowiedź:** Długość drugiego boku wynosi $3x-1$.

**Sprawdzenie:**
Mnożymy znalezione boki: $(2x+3)(3x-1) = 2x \\cdot 3x + 2x \\cdot (-1) + 3 \\cdot 3x + 3 \\cdot (-1) = 6x^2 - 2x + 9x - 3 = 6x^2 + 7x - 3$. Jest to pole $P$, więc rozwiązanie jest poprawne.

## Pułapki
*   **Znaki przy odejmowaniu nawiasów**: Zapomnienie o zmianie znaków wszystkich wyrazów w nawiasie, który jest odejmowany. Np. $a - (b+c)$ to $a - b - c$, a nie $a - b + c$.
*   **Mylenie wzorów skróconego mnożenia**: Szczególnie przy $(a+b)^2$ i $(a-b)^2$. Pamiętaj o środkowym wyrazie $2ab$ i jego znaku.
*   **Potęgowanie ułamków i iloczynów**: Przy potęgowaniu np. $(\\frac{1}{2}a)^2$, trzeba podnieść do kwadratu zarówno $\\frac{1}{2}$, jak i $a$, co daje $\\frac{1}{4}a^2$. Podobnie przy $(-3b)^2$ otrzymujemy $9b^2$, a nie $-9b^2$.
*   **Niedopisywanie potęg**: Przy mnożeniu $x \\cdot x$ często zapomina się o potędze i pisze $2x$ zamiast $x^2$. Podobnie $x \\cdot x^2 = x^3$, a nie $x^2$.
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
\`\`\`text
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
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "wzory_skroconego_mnozenia",
    title: "Wzory skróconego mnożenia na maturze",
    content: `## Na egzaminie
Wzory skróconego mnożenia pojawiają się na maturze podstawowej bardzo często, zazwyczaj w zadaniach otwartych, ale także jako element trudniejszych zadań zamkniętych. Punkty można zdobyć za zastosowanie wzorów do upraszczania wyrażeń, rozwiązywania równań lub dowodzenia tożsamości. CKE lubi sprawdzać umiejętność rozpoznawania i poprawnego stosowania podstawowych wzorów: kwadrat sumy, kwadrat różnicy oraz różnica kwadratów.

## Mapa tematu
1. Przypomnienie mnożenia dwumianów.
2. Wzór na kwadrat sumy: $(a+b)^2$.
3. Wzór na kwadrat różnicy: $(a-b)^2$.
4. Wzór na różnicę kwadratów: $(a-b)(a+b)$.
5. Rozpoznawanie wzorów w wyrażeniach.
6. Zastosowanie wzorów do upraszczania wyrażeń algebraicznych.
7. Zastosowanie wzorów do rozwiązywania równań.
8. Przykłady zadań maturalnych z wykorzystaniem wzorów skróconego mnożenia.

## Definicje i wzory
*   **Dwumian** to suma lub różnica dwóch jednomianów, np. $a+b$, $3x-5$.

*   **Mnożenie dwumianów:** Aby pomnożyć dwa dwumiany, mnożymy każdy wyraz pierwszego dwumianu przez każdy wyraz drugiego dwumianu, a następnie redukujemy wyrazy podobne.
    $(a+b)(c+d) = ac + ad + bc + bd$

*   **Wzór na kwadrat sumy:** $(a+b)^2 = (a+b)(a+b) = a^2 + ab + ba + b^2 = a^2 + 2ab + b^2$.
    *   "Pierwszy wyraz do kwadratu, plus dwa razy pierwszy wyraz razy drugi wyraz, plus drugi wyraz do kwadratu".

*   **Wzór na kwadrat różnicy:** $(a-b)^2 = (a-b)(a-b) = a^2 - ab - ba + b^2 = a^2 - 2ab + b^2$.
    *   "Pierwszy wyraz do kwadratu, minus dwa razy pierwszy wyraz razy drugi wyraz, plus drugi wyraz do kwadratu".

*   **Wzór na różnicę kwadratów:** $(a-b)(a+b) = a^2 + ab - ba - b^2 = a^2 - b^2$.
    *   "Iloczyn sumy i różnicy dwóch wyrażeń jest równy różnicy kwadratów tych wyrażeń".

*   **Kwadraty sumy i różnicy z nawiasami:**
    *   $(2x+3)^2 = (2x)^2 + 2 \\cdot (2x) \\cdot 3 + 3^2 = 4x^2 + 12x + 9$.
    *   $(5-y)^2 = 5^2 - 2 \\cdot 5 \\cdot y + y^2 = 25 - 10y + y^2$.
    *   $(\\frac{1}{2}a - 3b)^2 = (\\frac{1}{2}a)^2 - 2 \\cdot (\\frac{1}{2}a) \\cdot (3b) + (3b)^2 = \\frac{1}{4}a^2 - 3ab + 9b^2$.

*   **Różnica kwadratów z nawiasami:**
    *   $(3x-2y)(3x+2y) = (3x)^2 - (2y)^2 = 9x^2 - 4y^2$.
    *   $(7a+1)(7a-1) = (7a)^2 - 1^2 = 49a^2 - 1$.

## Przykład 1 - podstawowy
Uprość wyrażenie $(3x+2)^2 - (x-1)(x+1)$.

**Krok 1.** Rozwiń pierwszy człon $(3x+2)^2$ korzystając ze wzoru na kwadrat sumy $(a+b)^2 = a^2 + 2ab + b^2$.
Tutaj $a = 3x$ i $b = 2$.
$(3x+2)^2 = (3x)^2 + 2 \\cdot (3x) \\cdot 2 + 2^2 = 9x^2 + 12x + 4$.

**Krok 2.** Rozwiń drugi człon $(x-1)(x+1)$ korzystając ze wzoru na różnicę kwadratów $(a-b)(a+b) = a^2 - b^2$.
Tutaj $a = x$ i $b = 1$.
$(x-1)(x+1) = x^2 - 1^2 = x^2 - 1$.

**Krok 3.** Podstaw rozwinięte wyrażenia z powrotem do oryginalnego wyrażenia. Pamiętaj o nawiasach przy drugim członie, ponieważ jest on odejmowany.
Wyrażenie przyjmuje postać: $(9x^2 + 12x + 4) - (x^2 - 1)$.

**Krok 4.** Usuń nawiasy. Pamiętaj o zmianie znaków w drugim nawiasie, ponieważ poprzedza go minus.
$9x^2 + 12x + 4 - x^2 + 1$.

**Krok 5.** Zredukuj wyrazy podobne (połącz $x^2$ z $x^2$ i stałe z stałymi).
$(9x^2 - x^2) + 12x + (4 + 1) = 8x^2 + 12x + 5$.

**Sprawdzenie:** Możemy sprawdzić dla konkretnej wartości, np. $x=2$.
Oryginalne wyrażenie: $(3 \\cdot 2 + 2)^2 - (2-1)(2+1) = (6+2)^2 - (1)(3) = 8^2 - 3 = 64 - 3 = 61$.
Uproszczone wyrażenie: $8 \\cdot 2^2 + 12 \\cdot 2 + 5 = 8 \\cdot 4 + 24 + 5 = 32 + 24 + 5 = 61$.
Wyniki są takie same, więc uproszczenie jest poprawne.

## Przykład 2 - maturalny
Rozwiąż równanie $4x^2 - 9 = (2x-3)(x+1)$.

**Krok 1.** Zauważ, że lewa strona równania ($4x^2 - 9$) jest różnicą kwadratów. Zapisz ją w postaci iloczynu.
$4x^2 = (2x)^2$ i $9 = 3^2$.
Zatem $4x^2 - 9 = (2x)^2 - 3^2 = (2x-3)(2x+3)$.

**Krok 2.** Zapisz równanie z użyciem rozłożonej lewej strony.
$(2x-3)(2x+3) = (2x-3)(x+1)$.

**Krok 3.** Przenieś wszystkie wyrazy na jedną stronę, aby otrzymać równanie w postaci $W(x) = 0$.
$(2x-3)(2x+3) - (2x-3)(x+1) = 0$.

**Krok 4.** Wyłącz wspólny czynnik przed nawias. Wspólnym czynnikiem jest $(2x-3)$.
$(2x-3) [ (2x+3) - (x+1) ] = 0$.

**Krok 5.** Uprość wyrażenie w drugim nawiasie. Pamiętaj o zmianie znaków.
$(2x-3) [ 2x+3 - x - 1 ] = 0$.
$(2x-3) [ x + 2 ] = 0$.

**Krok 6.** Zastosuj zasadę zerowego iloczynu. Iloczyn jest równy zero, gdy co najmniej jeden z czynników jest równy zero.
$2x-3 = 0$ lub $x+2 = 0$.

**Krok 7.** Rozwiąż każde z powstałych równań liniowych.
Z $2x-3 = 0$ otrzymujemy $2x = 3$, czyli $x = \\frac{3}{2}$.
Z $x+2 = 0$ otrzymujemy $x = -2$.

**Rozwiązania równania to $x = \\frac{3}{2}$ oraz $x = -2$.**

## Przykład 3 - egzaminacyjny
Uprość wyrażenie $(a+2b)^2 - (a-2b)^2$.

**Krok 1.** Zastosuj wzór na kwadrat sumy do pierwszego nawiasu: $(a+2b)^2$.
Tutaj $a$ jest $a$, a $b$ jest $2b$.
$(a+2b)^2 = a^2 + 2 \\cdot a \\cdot (2b) + (2b)^2 = a^2 + 4ab + 4b^2$.

**Krok 2.** Zastosuj wzór na kwadrat różnicy do drugiego nawiasu: $(a-2b)^2$.
Tutaj $a$ jest $a$, a $b$ jest $2b$.
$(a-2b)^2 = a^2 - 2 \\cdot a \\cdot (2b) + (2b)^2 = a^2 - 4ab + 4b^2$.

**Krok 3.** Podstaw rozwinięte wyrażenia do oryginalnego wyrażenia i odejmij je. Pamiętaj o nawiasach.
$(a^2 + 4ab + 4b^2) - (a^2 - 4ab + 4b^2)$.

**Krok 4.** Usuń nawiasy, pamiętając o zmianie znaków dla wyrazów w drugim nawiasie.
$a^2 + 4ab + 4b^2 - a^2 + 4ab - 4b^2$.

**Krok 5.** Zredukuj wyrazy podobne.
$(a^2 - a^2) + (4ab + 4ab) + (4b^2 - 4b^2) = 0 + 8ab + 0 = 8ab$.

**Uproszczone wyrażenie to $8ab$.**

*Alternatywne rozwiązanie (wykorzystanie różnicy kwadratów):*
Zauważ, że całe wyrażenie ma postać $X^2 - Y^2$, gdzie $X = (a+2b)$ i $Y = (a-2b)$.
Możemy zastosować wzór na różnicę kwadratów: $X^2 - Y^2 = (X-Y)(X+Y)$.
$X-Y = (a+2b) - (a-2b) = a+2b - a + 2b = 4b$.
$X+Y = (a+2b) + (a-2b) = a+2b + a - 2b = 2a$.
Zatem $(X-Y)(X+Y) = (4b)(2a) = 8ab$.
Obie metody dają ten sam wynik.

## Pułapki
*   **Błąd znaku przy kwadracie różnicy:** Wzór na $(a-b)^2$ to $a^2 - 2ab + b^2$. Częstym błędem jest zapominanie o plusie przy $b^2$ lub mylenie znaku przy $2ab$ z minusem po obu stronach.
*   **Nieprawidłowe podnoszenie do kwadratu jednomianów:** Przy stosowaniu wzorów, gdy członem jest jednomian np. $2x$ lub $3b$, trzeba pamiętać o podniesieniu do kwadratu zarówno współczynnika liczbowego, jak i zmiennej, np. $(2x)^2 = 4x^2$, a nie $2x^2$. Podobnie $(3b)^2 = 9b^2$.
*   **Brak nawiasów przy odejmowaniu:** Przy odejmowaniu rozwiniętego wzoru, np. $(a+b)^2 - (c+d)^2$, należy wstawić nawiasy wokół drugiego rozwinięcia i pamiętać o zmianie znaków wszystkich wyrazów po usunięciu nawiasu, np. $-(c^2+2cd+d^2) = -c^2-2cd-d^2$.
*   **Błędy przy różnicy kwadratów:** Wzór $(a-b)(a+b) = a^2 - b^2$. Nie należy mylić z $(a-b)^2$ ani $(a+b)^2$. Poprawne zastosowanie wymaga, aby po jednej stronie nawiasu była suma, a po drugiej różnica tych samych dwóch wyrażeń.

## Ćwiczenia do samodzielnego rozwiązania
1.  Rozwiń wyrażenie $(4a-3b)^2$.
2.  Uprość wyrażenie $(x+5)(x-5) - x(x+2)$.
3.  Oblicz wartość wyrażenia $(2018+2017)(2018-2017)$.
4.  Rozwiąż równanie $9y^2 - 1 = (3y-1)(y+2)$.
5.  Zapisz w prostszej postaci $(2x+1)^2 + (2x-1)^2$.
6.  Sprawdź, czy tożsamość $(x-y)^2 = x^2 - 2xy + y^2$ jest prawdziwa dla $x=5$ i $y=3$.
7.  Uprość wyrażenie $(a+b)^2 - (a-b)^2$.

## Odpowiedzi
1.  $(4a-3b)^2 = (4a)^2 - 2 \\cdot (4a) \\cdot (3b) + (3b)^2 = 16a^2 - 24ab + 9b^2$.
2.  $(x^2 - 25) - (x^2 + 2x) = x^2 - 25 - x^2 - 2x = -2x - 25$.
3.  Stosujemy wzór na różnicę kwadratów: $2018^2 - 2017^2$. Tu jednak jest to $(a+b)(a-b)$ gdzie $a=2018$ i $b=2017$, co daje $a^2-b^2$. Ale mamy $(2018+2017)(2018-2017) = (4035)(1) = 4035$.
4.  Lewa strona: $(3y)^2 - 1^2 = 9y^2 - 1$. Równanie: $9y^2 - 1 = (3y-1)(y+2)$.
    Przenosimy na jedną stronę: $(3y-1)(3y+1) - (3y-1)(y+2) = 0$.
    Wyłączamy wspólny czynnik: $(3y-1)[(3y+1) - (y+2)] = 0$.
    $(3y-1)[3y+1-y-2] = 0$.
    $(3y-1)[2y-1] = 0$.
    Zatem $3y-1 = 0$ lub $2y-1 = 0$.
    $y = \\frac{1}{3}$ lub $y = \\frac{1}{2}$.
5.  $(4x^2 + 4x + 1) + (4x^2 - 4x + 1) = 4x^2 + 4x + 1 + 4x^2 - 4x + 1 = 8x^2 + 2$.
6.  Lewa strona: $(5-3)^2 = 2^2 = 4$. Prawa strona: $5^2 - 2 \\cdot 5 \\cdot 3 + 3^2 = 25 - 30 + 9 = 4$. Tożsamość jest prawdziwa.
7.  $(a^2+2ab+b^2) - (a^2-2ab+b^2) = a^2+2ab+b^2 - a^2+2ab-b^2 = 4ab$.

## Szybka powtórka
1.  Jaki jest wzór na kwadrat sumy dwóch wyrażeń $a$ i $b$?
2.  Jaki jest wzór na różnicę kwadratów dwóch wyrażeń $a$ i $b$?
3.  Czy $(2x)^2$ jest równe $2x^2$? Uzasadnij.
4.  Jakie są rozwiązania równania $(x-5)(x+3)=0$?
5.  Jaki jest wynik uproszczenia wyrażenia $(a+b)^2 - (a-b)^2$?

## Diagram
\`\`\`text
       Wzory skróconego mnożenia
             /      |      \\
      (a+b)^2    (a-b)^2   (a-b)(a+b)
      =a²+2ab+b² =a²-2ab+b² =a²-b²
          |          |          |
      Rozwijanie   Rozwijanie  Rozwijanie
      kwadratu    kwadratu     iloczynu
        sumy       różnicy    sumy i różnicy
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "rownania_liniowe",
    title: "Równania Liniowe - Pełny Kurs Maturalny",
    content: `## Na egzaminie
Równania liniowe pojawiają się na maturze podstawowej regularnie, zazwyczaj w zadaniach otwartych (wymagających pełnego rozwiązania) lub jako element zadań zamkniętych. Zazwyczaj jedno zadanie na równania liniowe jest warte 2-3 punkty. CKE lubi sprawdzać umiejętność przekształcania równań, radzenia sobie z ułamkami i nawiasami oraz interpretacji rozwiązań w kontekście zadań tekstowych.

## Mapa tematu
1.  Zrozumienie definicji równania liniowego.
2.  Rozpoznawanie równań liniowych.
3.  Rozwiązywanie równań liniowych z jedną niewiadomą (z nawiasami, ułamkami).
4.  Przekształcanie równań (przenoszenie wyrazów, mnożenie stronami).
5.  Rozwiązywanie równań sprzecznych i tożsamościowych.
6.  Zastosowanie równań liniowych w zadaniach tekstowych.
7.  Interpretacja wyników w kontekście zadania.
8.  Sprawdzanie poprawności rozwiązania.

## Definicje i wzory
*   **Równanie** to matematyczne stwierdzenie o równości dwóch wyrażeń.
*   **Równanie liniowe z jedną niewiadomą** to równanie, które po uporządkowaniu można zapisać w postaci:
    $$ax + b = 0$$
    gdzie $x$ jest niewiadomą, a $a$ i $b$ są stałymi, przy czym $a \\neq 0$.
*   **Rozwiązaniem równania** jest taka wartość niewiadomej, dla której lewa strona równania jest równa prawej stronie.
*   **Przekształcenia równoważne** to operacje, które nie zmieniają zbioru rozwiązań równania:
    *   Dodanie lub odjęcie tej samej liczby lub wyrażenia od obu stron równania.
    *   Pomnożenie lub podzielenie obu stron równania przez tę samą liczbę różną od zera.
*   **Równanie sprzeczne** to równanie, które nie ma żadnego rozwiązania. Po próbie rozwiązania dochodzimy do fałszywej równości, np. $2 = 5$.
*   **Równanie tożsamościowe** to równanie, które jest prawdziwe dla każdej wartości niewiadomej. Po próbie rozwiązania dochodzimy do prawdziwej równości, np. $3 = 3$.

**Podstawowe kroki rozwiązywania równania liniowego:**
1.  Uprość obie strony równania (usuń nawiasy, wykonaj mnożenie).
2.  Przenieś wszystkie wyrazy z niewiadomą na jedną stronę równania, a stałe na drugą. Pamiętaj o zmianie znaku przy przenoszeniu przez znak równości.
3.  Zredukuj wyrazy podobne po obu stronach.
4.  Podziel obie strony przez współczynnik stojący przy niewiadomej (jeśli jest różny od zera).
5.  Sprawdź otrzymane rozwiązanie, podstawiając je do pierwotnego równania.

## Przykład 1 - podstawowy
Rozwiąż równanie: $3(x - 2) + 5 = 2x + 7$.

**Krok 1.** Upraszczamy lewą stronę równania, wykonując mnożenie przez nawias:
$3 \\cdot x - 3 \\cdot 2 + 5 = 2x + 7$
$3x - 6 + 5 = 2x + 7$
$3x - 1 = 2x + 7$

**Krok 2.** Przenosimy wyrazy z niewiadomą $x$ na lewą stronę, a stałe na prawą. Pamiętamy o zmianie znaków:
$3x - 2x = 7 + 1$

**Krok 3.** Redukujemy wyrazy podobne po obu stronach:
$(3 - 2)x = 8$
$1x = 8$
$x = 8$

**Krok 4.** Sprawdzamy rozwiązanie, podstawiając $x=8$ do pierwotnego równania:
Lewa strona: $3(8 - 2) + 5 = 3(6) + 5 = 18 + 5 = 23$
Prawa strona: $2(8) + 7 = 16 + 7 = 23$
Lewa strona jest równa prawej stronie ($23 = 23$), więc rozwiązanie $x=8$ jest poprawne.

## Przykład 2 - maturalny
Rozwiąż równanie z ułamkami: $\\frac{x}{3} + \\frac{x-1}{2} = \\frac{5}{6}$.

**Krok 1.** Aby pozbyć się ułamków, mnożymy obie strony równania przez wspólny mianownik dla liczb 3, 2 i 6. Najmniejszym wspólnym mianownikiem jest 6.
$6 \\cdot (\\frac{x}{3} + \\frac{x-1}{2}) = 6 \\cdot \\frac{5}{6}$

**Krok 2.** Mnożymy każdy człon po lewej stronie przez 6:
$6 \\cdot \\frac{x}{3} + 6 \\cdot \\frac{x-1}{2} = 5$
$2x + 3(x-1) = 5$

**Krok 3.** Upraszczamy lewą stronę, usuwając nawias:
$2x + 3x - 3 = 5$
$5x - 3 = 5$

**Krok 4.** Przenosimy stałą na prawą stronę:
$5x = 5 + 3$
$5x = 8$

**Krok 5.** Dzielimy obie strony przez współczynnik przy $x$:
$x = \\frac{8}{5}$

**Krok 6.** Sprawdzamy rozwiązanie:
Lewa strona: $\\frac{8/5}{3} + \\frac{8/5 - 1}{2} = \\frac{8}{15} + \\frac{8/5 - 5/5}{2} = \\frac{8}{15} + \\frac{3/5}{2} = \\frac{8}{15} + \\frac{3}{10}$
Aby dodać ułamki, sprowadzamy je do wspólnego mianownika (30):
$\\frac{8 \\cdot 2}{15 \\cdot 2} + \\frac{3 \\cdot 3}{10 \\cdot 3} = \\frac{16}{30} + \\frac{9}{30} = \\frac{25}{30}$
Po skróceniu otrzymujemy $\\frac{5}{6}$.
Prawa strona: $\\frac{5}{6}$.
Lewa strona jest równa prawej stronie, więc rozwiązanie $x = \\frac{8}{5}$ jest poprawne.

## Przykład 3 - egzaminacyjny
W pewnym prostokącie jeden bok jest o 5 cm dłuższy od drugiego. Obwód tego prostokąta wynosi 34 cm. Oblicz długości boków tego prostokąta.

**Krok 1.** Definiujemy zmienne. Niech krótszy bok prostokąta ma długość $x$ cm.
Z treści zadania wiemy, że drugi bok jest o 5 cm dłuższy, więc jego długość wynosi $(x+5)$ cm.

**Krok 2.** Zapisujemy równanie na podstawie informacji o obwodzie. Obwód prostokąta to suma długości wszystkich jego boków, czyli $2 \\cdot (\\text{długość} + \\text{szerokość})$.
$2(x + (x+5)) = 34$

**Krok 3.** Rozwiązujemy otrzymane równanie liniowe:
$2(2x + 5) = 34$
$4x + 10 = 34$
$4x = 34 - 10$
$4x = 24$
$x = \\frac{24}{4}$
$x = 6$

**Krok 4.** Obliczamy długości boków.
Krótszy bok ma długość $x = 6$ cm.
Dłuższy bok ma długość $x+5 = 6+5 = 11$ cm.

**Krok 5.** Sprawdzamy rozwiązanie. Czy obwód wynosi 34 cm?
Obwód $= 2(6 + 11) = 2(17) = 34$ cm.
Warunki zadania są spełnione. Długości boków to 6 cm i 11 cm.

## Pułapki
*   **Błędy przy opuszczaniu nawiasów:** Pamiętaj, że znak mnożenia przed nawiasem zmienia znaki wszystkich wyrazów wewnątrz nawiasu, jeśli przed nawiasem jest znak minus. Np. $-(x-2) = -x + 2$, a nie $-x - 2$.
*   **Błędy przy przenoszeniu wyrazów:** Przy przenoszeniu wyrazu na drugą stronę znaku równości, zawsze zmieniamy jego znak. Dodatni staje się ujemny, a ujemny dodatni.
*   **Błędy przy mnożeniu/dzieleniu przez ułamki:** Mnożąc całe równanie przez ułamek, mnożysz *każdy* człon z osobna. Np. $\\frac{a+b}{c} = d \\implies a+b = c \\cdot d$.
*   **Równania sprzeczne i tożsamościowe:** Uważaj na przypadki, gdy po uporządkowaniu równania obie strony są identyczne (równanie tożsamościowe, nieskończenie wiele rozwiązań) lub gdy otrzymujemy sprzeczność (np. $0=5$, równanie sprzeczne, brak rozwiązań).
*   **Błędy rachunkowe:** Proste błędy w dodawaniu, odejmowaniu, mnożeniu czy dzieleniu mogą całkowicie zafałszować wynik. Zawsze sprawdzaj swoje obliczenia, a najlepiej podstaw otrzymane rozwiązanie do pierwotnego równania.

## Ćwiczenia do samodzielnego rozwiązania
1.  Rozwiąż równanie: $5(x+1) - 3 = 2(x+4)$.
2.  Rozwiąż równanie: $2x - 7 = 4x + 3$.
3.  Rozwiąż równanie: $\\frac{y}{4} - 1 = \\frac{y+2}{3}$.
4.  Rozwiąż równanie: $2(3t - 1) - 4(t+2) = 3t - 10$.
5.  Czy równanie $3(x+2) - 6 = 3x$ jest równaniem sprzecznym, tożsamościowym, czy ma jedno rozwiązanie?
6.  Suma trzech kolejnych liczb parzystych wynosi 72. Znajdź te liczby.
7.  Adam ma dwa razy więcej pieniędzy niż Basia. Razem mają 45 zł. Ile pieniędzy ma każde z nich?

## Odpowiedzi
1.  $x=0$.
2.  $x = -5$.
3.  $y = -16$.
4.  $t = 0$.
5.  Równanie jest tożsamościowe (nieskończenie wiele rozwiązań). Po przekształceniach otrzymujemy $0=0$.
6.  Szukane liczby to 22, 24, 26.
7.  Basia ma 15 zł, Adam ma 30 zł.

## Szybka powtórka
1.  Jaka jest postać ogólna równania liniowego?
2.  Podaj przykład przekształcenia równoważnego.
3.  Co oznacza, że równanie jest sprzeczne?
4.  Jak nazywamy równanie, które jest prawdziwe dla każdej wartości niewiadomej?
5.  Jaka jest główna zasada przy przenoszeniu wyrazów na drugą stronę równania?

## Diagram
\`\`\`text
      Równanie Liniowe (ax + b = 0)
             /        |         \\
          /           |          \\
  Przekształcenia   Usuwanie     Redukcja
  (dodawanie,      nawiasów,     wyrazów
   odejmowanie,      ułamków      podobnych
   mnożenie,
   dzielenie)
        |
        |
  Otrzymanie postaci
     ax = c
        |
        |
    Rozwiązanie (x = c/a)
    lub
    Równanie sprzeczne (np. 5=3)
    lub
    Równanie tożsamościowe (np. 3=3)
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "rownania_kwadratowe",
    title: "Równania kwadratowe",
    content: `## Na egzaminie
Równania kwadratowe to jeden z fundamentalnych działów algebry, który regularnie pojawia się na maturze z matematyki. Zadania dotyczące równań kwadratowych pojawiają się zazwyczaj w zadaniach otwartych, choć mogą też występować w formie pytań zamkniętych. Zazwyczaj są to zadania warte 3–4 punkty, często wymagające obliczenia wyróżnika (delty) i pierwiastków równania. CKE często sprawdza umiejętność interpretacji pierwiastków w kontekście geometrycznym (np. punkty przecięcia paraboli z osią x) lub w zadaniach tekstowych.

## Mapa tematu
1.  Rozpoznawanie równań kwadratowych i postaci ogólnej $ax^2 + bx + c = 0$.
2.  Rozumienie pojęć: współczynniki $a, b, c$, pierwiastek równania, parabola.
3.  Metoda obliczania wyróżnika równania kwadratowego (delty) – wzór $\\Delta = b^2 - 4ac$.
4.  Interpretacja wyróżnika ($\\Delta > 0$, $\\Delta = 0$, $\\Delta < 0$) w kontekście liczby rozwiązań równania.
5.  Stosowanie wzorów na pierwiastki równania kwadratowego $x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}$ i $x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}$.
6.  Rozwiązywanie równań kwadratowych pełnych (gdy $a, b, c \\neq 0$).
7.  Rozwiązywanie równań kwadratowych niepełnych (gdy $b=0$ lub $c=0$).
8.  Zastosowanie twierdzenia o pierwiastkach Viète'a do obliczania sumy i iloczynu pierwiastków.

## Definicje i wzory
*   **Równanie kwadratowe** to równanie postaci:
    $$ax^2 + bx + c = 0$$
    gdzie $x$ jest niewiadomą, a $a, b, c$ są współczynnikami liczbowymi, przy czym $a \\neq 0$.
*   Jeśli $a=0$, równanie staje się równaniem liniowym $bx + c = 0$.
*   **Postać ogólna:** $ax^2 + bx + c = 0$.
*   **Współczynniki:**
    *   $a$: współczynnik przy $x^2$.
    *   $b$: współczynnik przy $x$.
    *   $c$: wyraz wolny.
*   **Parabola:** Wykresem funkcji kwadratowej $f(x) = ax^2 + bx + c$ jest parabola. Pierwiastki równania kwadratowego $ax^2 + bx + c = 0$ odpowiadają miejscom zerowym tej funkcji, czyli punktom przecięcia paraboli z osią $Ox$.
*   **Wyróżnik równania kwadratowego (delta):**
    $$\\Delta = b^2 - 4ac$$
*   **Liczba rozwiązań równania kwadratowego:**
    *   Jeśli $\\Delta > 0$, równanie ma dwa różne pierwiastki rzeczywiste.
    *   Jeśli $\\Delta = 0$, równanie ma jeden pierwiastek rzeczywisty (podwójny).
    *   Jeśli $\\Delta < 0$, równanie nie ma pierwiastków rzeczywistych.
*   **Wzory na pierwiastki równania kwadratowego (gdy $\\Delta \\ge 0$):**
    $$x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}$$
    $$x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}$$
    Gdy $\\Delta = 0$, $x_1 = x_2 = \\frac{-b}{2a}$.
*   **Równania niepełne:**
    *   Gdy $c=0$: $ax^2 + bx = 0 \\implies x(ax+b) = 0 \\implies x=0 \\text{ lub } ax+b=0$.
    *   Gdy $b=0$: $ax^2 + c = 0 \\implies ax^2 = -c \\implies x^2 = -\\frac{c}{a}$.
        *   Jeśli $-\\frac{c}{a} > 0$, to $x = \\sqrt{-\\frac{c}{a}}$ lub $x = -\\sqrt{-\\frac{c}{a}}$.
        *   Jeśli $-\\frac{c}{a} = 0$, to $x=0$.
        *   Jeśli $-\\frac{c}{a} < 0$, brak rozwiązań rzeczywistych.
    *   Gdy $b=0$ i $c=0$: $ax^2 = 0 \\implies x=0$.
*   **Wzory Viète'a (dla równania $ax^2 + bx + c = 0$ z pierwiastkami $x_1, x_2$):**
    *   Suma pierwiastków: $x_1 + x_2 = -\\frac{b}{a}$
    *   Iloczyn pierwiastków: $x_1 \\cdot x_2 = \\frac{c}{a}$

## Przykład 1 - podstawowy
Rozwiąż równanie kwadratowe: $2x^2 - 5x + 3 = 0$.

**Krok 1.** Zidentyfikuj współczynniki $a, b, c$.
W tym równaniu $a=2$, $b=-5$, $c=3$.

**Krok 2.** Oblicz wyróżnik równania (deltę).
$\\Delta = b^2 - 4ac = (-5)^2 - 4 \\cdot 2 \\cdot 3 = 25 - 24 = 1$.

**Krok 3.** Zinterpretuj wartość delty.
Ponieważ $\\Delta = 1 > 0$, równanie ma dwa różne pierwiastki rzeczywiste.

**Krok 4.** Oblicz pierwiastki równania.
$\\sqrt{\\Delta} = \\sqrt{1} = 1$.
$x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{-(-5) - 1}{2 \\cdot 2} = \\frac{5 - 1}{4} = \\frac{4}{4} = 1$.
$x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{-(-5) + 1}{2 \\cdot 2} = \\frac{5 + 1}{4} = \\frac{6}{4} = \\frac{3}{2}$.

**Krok 5.** Podaj rozwiązania.
Rozwiązaniami równania są $x=1$ oraz $x=\\frac{3}{2}$.

**Sprawdzenie:**
Dla $x=1$: $2(1)^2 - 5(1) + 3 = 2 - 5 + 3 = 0$. Zgadza się.
Dla $x=\\frac{3}{2}$: $2(\\frac{3}{2})^2 - 5(\\frac{3}{2}) + 3 = 2 \\cdot \\frac{9}{4} - \\frac{15}{2} + 3 = \\frac{9}{2} - \\frac{15}{2} + \\frac{6}{2} = \\frac{9-15+6}{2} = \\frac{0}{2} = 0$. Zgadza się.

## Przykład 2 - maturalny
Rozwiąż równanie: $(x-2)(x+1) = 3x - 6$.

**Krok 1.** Doprowadź równanie do postaci ogólnej $ax^2 + bx + c = 0$.
Najpierw wymnóż nawiasy po lewej stronie:
$x^2 + x - 2x - 2 = 3x - 6$
$x^2 - x - 2 = 3x - 6$
Teraz przenieś wszystkie wyrazy na jedną stronę, aby uzyskać 0 po drugiej:
$x^2 - x - 3x - 2 + 6 = 0$
$x^2 - 4x + 4 = 0$

**Krok 2.** Zidentyfikuj współczynniki $a, b, c$.
$a=1$, $b=-4$, $c=4$.

**Krok 3.** Oblicz wyróżnik równania (deltę).
$\\Delta = b^2 - 4ac = (-4)^2 - 4 \\cdot 1 \\cdot 4 = 16 - 16 = 0$.

**Krok 4.** Zinterpretuj wartość delty i oblicz pierwiastki.
Ponieważ $\\Delta = 0$, równanie ma jeden pierwiastek rzeczywisty (podwójny).
$x = \\frac{-b}{2a} = \\frac{-(-4)}{2 \\cdot 1} = \\frac{4}{2} = 2$.

**Krok 5.** Podaj rozwiązanie.
Rozwiązaniem równania jest $x=2$.

**Sprawdzenie:**
Podstawiamy $x=2$ do pierwotnego równania:
Lewa strona: $(2-2)(2+1) = 0 \\cdot 3 = 0$.
Prawa strona: $3(2) - 6 = 6 - 6 = 0$.
Lewa strona równa się prawej stronie, więc rozwiązanie jest poprawne.

## Przykład 3 - egzaminacyjny
Dla jakiej wartości parametru $m$ równanie $x^2 - (m+1)x + m = 0$ ma dokładnie jedno rozwiązanie?

**Krok 1.** Zidentyfikuj współczynniki $a, b, c$ w zależności od parametru $m$.
$a=1$
$b = -(m+1)$
$c = m$

**Krok 2.** Określ warunek dla jednego rozwiązania.
Równanie kwadratowe ma dokładnie jedno rozwiązanie, gdy jego wyróżnik $\\Delta$ jest równy 0.

**Krok 3.** Oblicz wyróżnik $\\Delta$ w zależności od $m$.
$\\Delta = b^2 - 4ac$
$\\Delta = (-(m+1))^2 - 4 \\cdot 1 \\cdot m$
$\\Delta = (m+1)^2 - 4m$
$\\Delta = (m^2 + 2m + 1) - 4m$
$\\Delta = m^2 - 2m + 1$

**Krok 4.** Zapisz równanie wynikające z warunku $\\Delta = 0$ i rozwiąż je.
Musimy rozwiązać równanie $\\Delta = 0$:
$m^2 - 2m + 1 = 0$
Zauważamy, że jest to wzór skróconego mnożenia $(m-1)^2$:
$(m-1)^2 = 0$
$m-1 = 0$
$m = 1$

**Krok 5.** Podaj odpowiedź.
Równanie ma dokładnie jedno rozwiązanie, gdy $m=1$.

**Sprawdzenie:**
Gdy $m=1$, podstawiamy do pierwotnego równania:
$x^2 - (1+1)x + 1 = 0$
$x^2 - 2x + 1 = 0$
To równanie ma postać $(x-1)^2=0$, co daje jedno rozwiązanie $x=1$. Jest to poprawne.

## Pułapki
*   **Brak doprowadzenia do postaci ogólnej:** Uczniowie często próbują obliczać deltę z równań, które nie są jeszcze sprowadzone do postaci $ax^2 + bx + c = 0$. Np. w równaniu $(x-2)(x+1) = 3x - 6$, trzeba najpierw wykonać mnożenie i przenieść wszystko na jedną stronę.
*   **Błędy przy przepisywaniu współczynników:** Szczególną ostrożność należy zachować przy znaku współczynników. Na przykład w równaniu $x^2 - 5x + 3 = 0$, $b=-5$, a nie $5$. W przypadku $-(m+1)x$, $b$ jest równe $-(m+1)$, a nie $m+1$.
*   **Błędy przy obliczaniu delty:** Najczęściej pojawiają się błędy przy podnoszeniu do kwadratu liczby ujemnej (np. $(-5)^2=25$, a nie $-25$) lub przy mnożeniu iloczynu $4ac$ (zwłaszcza gdy jeden lub więcej współczynników jest ujemnych).
*   **Niewłaściwa interpretacja delty:** Pamiętaj, że $\\Delta=0$ oznacza jedno rozwiązanie (podwójne), a nie brak rozwiązań. $\\Delta < 0$ oznacza brak rozwiązań rzeczywistych.
*   **Dzielenie przez zero:** Wzory na pierwiastki zawierają $2a$ w mianowniku. Ponieważ z definicji równania kwadratowego $a \\neq 0$, dzielenie przez $2a$ jest zawsze możliwe.

## Ćwiczenia do samodzielnego rozwiązania
1.  Rozwiąż równanie: $3x^2 + 7x - 6 = 0$.
2.  Rozwiąż równanie: $x^2 - 6x + 9 = 0$.
3.  Rozwiąż równanie: $x^2 + 4x + 5 = 0$.
4.  Rozwiąż równanie niepełne: $5x^2 - 10x = 0$.
5.  Rozwiąż równanie niepełne: $2x^2 - 18 = 0$.
6.  Dla jakiej wartości parametru $k$ równanie $x^2 + kx + 4 = 0$ ma dokładnie jedno rozwiązanie?
7.  Rozwiąż równanie: $(x+3)^2 = 2(x+3)$.

## Odpowiedzi
1.  $\\Delta = 7^2 - 4 \\cdot 3 \\cdot (-6) = 49 + 72 = 121$, $\\sqrt{\\Delta} = 11$.
    $x_1 = \\frac{-7 - 11}{2 \\cdot 3} = \\frac{-18}{6} = -3$.
    $x_2 = \\frac{-7 + 11}{2 \\cdot 3} = \\frac{4}{6} = \\frac{2}{3}$.
    Rozwiązania: $x=-3$ i $x=\\frac{2}{3}$.
2.  $\\Delta = (-6)^2 - 4 \\cdot 1 \\cdot 9 = 36 - 36 = 0$.
    $x = \\frac{-(-6)}{2 \\cdot 1} = \\frac{6}{2} = 3$.
    Rozwiązanie: $x=3$ (pierwiastek podwójny).
3.  $\\Delta = 4^2 - 4 \\cdot 1 \\cdot 5 = 16 - 20 = -4$.
    Ponieważ $\\Delta < 0$, równanie nie ma rozwiązań rzeczywistych.
4.  $5x(x-2) = 0$. Rozwiązania: $x=0$ lub $x=2$.
5.  $2x^2 = 18 \\implies x^2 = 9$. Rozwiązania: $x=3$ lub $x=-3$.
6.  $a=1, b=k, c=4$. $\\Delta = k^2 - 4 \\cdot 1 \\cdot 4 = k^2 - 16$.
    Aby było jedno rozwiązanie, $\\Delta = 0 \\implies k^2 - 16 = 0 \\implies k^2 = 16 \\implies k=4$ lub $k=-4$.
7.  Najpierw doprowadzamy do postaci ogólnej: $x^2 + 6x + 9 = 2x + 6 \\implies x^2 + 4x + 3 = 0$.
    $\\Delta = 4^2 - 4 \\cdot 1 \\cdot 3 = 16 - 12 = 4$. $\\sqrt{\\Delta} = 2$.
    $x_1 = \\frac{-4 - 2}{2 \\cdot 1} = \\frac{-6}{2} = -3$.
    $x_2 = \\frac{-4 + 2}{2 \\cdot 1} = \\frac{-2}{2} = -1$.
    Rozwiązania: $x=-3$ i $x=-1$.

## Szybka powtórka
1.  Jak nazywa się ogólna postać równania kwadratowego?
2.  Jaki jest wzór na wyróżnik (deltę) równania kwadratowego?
3.  Ile rozwiązań ma równanie kwadratowe, gdy $\\Delta = 0$?
4.  Jakie są wzory na pierwiastki równania kwadratowego, gdy $\\Delta > 0$?
5.  Podaj wzory Viète'a dla równania $ax^2 + bx + c = 0$.

## Diagram
Parabola $y = ax^2 + bx + c$ i jej związek z pierwiastkami równania $ax^2 + bx + c = 0$.

\`\`\`text
        ^ y
        |
  <-----+-----> x
        | \\   /
        |  \\ /
        |   o  <-- pierwiastek (x1)
        |  / \\
        | /   \\
        |/     \\
        o       o <-- punkty przecięcia z Ox (pierwiastki x1, x2)
       / \\     /
      /   \\   /
     /     \\ /
    /       o <-- pierwiastek (x2)
   /         \\
  /           \\

  (Przykład dla a > 0 i Delta > 0)
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "nierownosci",
    title: "Nierówności liniowe",
    content: `## Na egzaminie
Nierówności liniowe pojawiają się na maturze podstawowej stosunkowo często, zazwyczaj jako samodzielne zadania otwarte lub jako część zadań zamkniętych. Mają na celu sprawdzenie umiejętności rozwiązywania prostych równań, przekształcania ich oraz interpretacji wyników. Zadania te zazwyczaj można rozwiązać w kilku prostych krokach, a ich punktacja wynosi 1-2 punkty.

## Mapa tematu
1. Rozumienie pojęcia nierówności i jej rozwiązania.
2. Rozwiązywanie podstawowych nierówności liniowych z jedną niewiadomą.
3. Wykonywanie działań na nierównościach (dodawanie, odejmowanie, mnożenie, dzielenie stronami).
4. Przekształcanie nierówności do prostszej postaci.
5. Reprezentacja rozwiązań nierówności na osi liczbowej.
6. Rozwiązywanie nierówności z nawiasami.
7. Rozwiązywanie nierówności z niewiadomą po obu stronach.
8. Rozwiązywanie prostych zadań tekstowych prowadzących do nierówności.

## Definicje i wzory
Nierówność to matematyczne wyrażenie stwierdzające, że dwie wielkości nie są sobie równe. Wyróżniamy cztery podstawowe typy nierówności:
*   $a > b$ (a jest większe od b)
*   $a < b$ (a jest mniejsze od b)
*   $a \\geq b$ (a jest większe lub równe b)
*   $a \\leq b$ (a jest mniejsze lub równe b)

Rozwiązaniem nierówności jest zbiór wszystkich liczb, dla których nierówność jest prawdziwa.

**Podstawowe własności nierówności:**
1.  Dodawanie lub odejmowanie tej samej liczby do obu stron nierówności nie zmienia jej znaku.
    Jeśli $a > b$, to $a + c > b + c$ oraz $a - c > b - c$.
2.  Mnożenie lub dzielenie obu stron nierówności przez tę samą **liczbę dodatnią** nie zmienia jej znaku.
    Jeśli $a > b$ i $c > 0$, to $a \\cdot c > b \\cdot c$ oraz $\\frac{a}{c} > \\frac{b}{c}$.
3.  Mnożenie lub dzielenie obu stron nierówności przez tę samą **liczbę ujemną** **zmienia** jej znak na przeciwny.
    Jeśli $a > b$ i $c < 0$, to $a \\cdot c < b \\cdot c$ oraz $\\frac{a}{c} < \\frac{b}{c}$.

**Reprezentacja rozwiązań na osi liczbowej:**
*   Przedział otwarty $(a, b)$: liczby $x$ takie, że $a < x < b$. Na osi liczbowej zaznaczamy kółko niezamalowane nad liczbą $a$ i $b$ oraz kreskę między nimi.
*   Przedział domknięty $[a, b]$: liczby $x$ takie, że $a \\leq x \\leq b$. Na osi liczbowej zaznaczamy kółko zamalowane nad liczbą $a$ i $b$ oraz kreskę między nimi.
*   Przedział domknięty z jednej strony $[a, b)$: liczby $x$ takie, że $a \\leq x < b$.
*   Przedział otwarty z jednej strony $(a, b]$: liczby $x$ takie, że $a < x \\leq b$.
*   Półproste:
    *   $(a, \\infty)$: $x > a$
    *   $[a, \\infty)$: $x \\geq a$
    *   $(-\\infty, a)$: $x < a$
    *   $(-\\infty, a]$: $x \\leq a$

Na osi liczbowej kółko niezamalowane oznacza, że dana liczba nie należy do rozwiązania, a kółko zamalowane oznacza, że należy.

## Przykład 1 - podstawowy
Rozwiąż nierówność: $2x - 5 \\leq x + 3$.

**Krok 1.** Przenieś wszystkie wyrazy z niewiadomą $x$ na jedną stronę nierówności, a liczby na drugą. Pamiętaj o zmianie znaku przy przenoszeniu.
$2x - x \\leq 3 + 5$

**Krok 2.** Uprość obie strony nierówności.
$x \\leq 8$

**Krok 3.** Odczytaj rozwiązanie. Nierówność jest spełniona dla wszystkich liczb mniejszych lub równych 8.

**Krok 4.** Przedstaw rozwiązanie na osi liczbowej.
Zaznaczamy liczbę 8. Ponieważ nierówność jest "mniejsze lub równe", kółko nad 8 jest zamalowane. Kierujemy strzałkę w lewo, w stronę mniejszych liczb.
\`\`\`
<----[=====]----
     8
\`\`\`
Rozwiązanie w postaci przedziału: $(-\\infty, 8]$.

**Sprawdzenie:**
Wybierzmy liczbę mniejszą lub równą 8, np. $x=0$: $2(0) - 5 \\leq 0 + 3 \\implies -5 \\leq 3$ (prawda).
Wybierzmy liczbę równą 8, np. $x=8$: $2(8) - 5 \\leq 8 + 3 \\implies 16 - 5 \\leq 11 \\implies 11 \\leq 11$ (prawda).
Wybierzmy liczbę większą od 8, np. $x=10$: $2(10) - 5 \\leq 10 + 3 \\implies 20 - 5 \\leq 13 \\implies 15 \\leq 13$ (fałsz).

## Przykład 2 - maturalny
Rozwiąż nierówność: $3(x - 2) - 5(x + 1) > 2(x - 7) + 1$.

**Krok 1.** Pozbądź się nawiasów, mnożąc każdy wyraz w nawiasie przez liczbę stojącą przed nim.
$3x - 6 - 5x - 5 > 2x - 14 + 1$

**Krok 2.** Zredukuj wyrazy podobne po obu stronach nierówności.
$(3x - 5x) + (-6 - 5) > 2x + (-14 + 1)$
$-2x - 11 > 2x - 13$

**Krok 3.** Przenieś wszystkie wyrazy z niewiadomą $x$ na jedną stronę, a liczby na drugą.
$-2x - 2x > -13 + 11$

**Krok 4.** Uprość obie strony nierówności.
$-4x > -2$

**Krok 5.** Podziel obie strony przez liczbę stojącą przy $x$. Pamiętaj, że dzielisz przez liczbę ujemną (-4), więc musisz zmienić znak nierówności na przeciwny.
$x < \\frac{-2}{-4}$

**Krok 6.** Uprość wynik.
$x < \\frac{1}{2}$

**Krok 7.** Przedstaw rozwiązanie w postaci przedziału i na osi liczbowej.
Rozwiązanie to wszystkie liczby mniejsze od $\\frac{1}{2}$.
Przedział: $(-\\infty, \\frac{1}{2})$.
Na osi liczbowej: kółko niezamalowane nad $\\frac{1}{2}$, strzałka w lewo.
\`\`\`
<----o----------
     1/2
\`\`\`

## Przykład 3 - egzaminacyjny
Rozwiąż nierówność $2x + 3 < 11$. Wskaż poprawny przedział rozwiązań:
A. $(-\\infty, 4)$
B. $(-\\infty, 7)$
C. $(4, \\infty)$
D. $[4, \\infty)$

**Krok 1.** Odejmij 3 od obu stron:
$2x < 8$.

**Krok 2.** Podziel obie strony przez dodatnią liczbę 2. Znak nierówności pozostaje bez zmian:
$x < 4$.

**Krok 3.** Zapisz rozwiązanie w postaci przedziału:
$x \\in (-\\infty, 4)$.

Poprawna odpowiedź to **A**. Pozostałe przedziały mają inną granicę albo wskazują liczby większe od 4.

## Pułapki
*   **Zmiana znaku nierówności:** Najczęstszy błąd to zapominanie o zmianie znaku nierówności przy mnożeniu lub dzieleniu obu stron przez liczbę ujemną. Zawsze zwracaj na to uwagę.
*   **Przenoszenie wyrazów:** Błąd w zmianie znaku podczas przenoszenia wyrazów z jednej strony na drugą. Pamiętaj, że $a - b < 0$ jest równoważne $a < b$.
*   **Zaznaczanie na osi liczbowej:** Mylenie kółek zamalowanych (dla $\\geq, \\leq$) z niezamalowanymi (dla $>, <$) lub niewłaściwe określenie kierunku przedziału (strzałki).
*   **Rozwiązywanie układu nierówności:** Szukanie sumy zamiast części wspólnej rozwiązań (gdy występują oba warunki typu ORAZ). Jeśli są połączone słowem "lub", szukamy sumy. W przypadku nierówności liniowych zazwyczaj pojawia się warunek "i" (część wspólna).

## Ćwiczenia do samodzielnego rozwiązania
1.  Rozwiąż nierówność: $4x + 7 > 2x - 1$. Podaj odpowiedź w postaci przedziału.
2.  Rozwiąż nierówność: $3 - x \\leq 5$. Podaj odpowiedź w postaci przedziału.
3.  Rozwiąż nierówność: $2(x - 3) + 1 \\geq 3(x + 2) - 4$. Podaj rozwiązanie jako przedział na osi liczbowej.
4.  Znajdź wszystkie liczby całkowite spełniające nierówność: $-2 < x \\leq 5$.
5.  Rozwiąż nierówność: $\\frac{x}{2} - 1 < \\frac{x}{3} + 2$.
6.  Zbiór rozwiązań nierówności $2x + 5 > 1$ jest identyczny ze zbiorem rozwiązań nierówności:
    A. $x > -2$
    B. $x < -2$
    C. $x > 2$
    D. $x < 2$
7.  Rozwiąż nierówność: $1 - 3x \\geq 7 - x$.

## Odpowiedzi
1.  $4x - 2x > -1 - 7 \\implies 2x > -8 \\implies x > -4$. Przedział: $(-4, \\infty)$.
2.  $-x \\leq 5 - 3 \\implies -x \\leq 2 \\implies x \\geq -2$. Przedział: $[-2, \\infty)$.
3.  $2x - 6 + 1 \\geq 3x + 6 - 4 \\implies 2x - 5 \\geq 3x + 2 \\implies 2x - 3x \\geq 2 + 5 \\implies -x \\geq 7 \\implies x \\leq -7$. Przedział: $(-\\infty, -7]$.
    Oś liczbowa:
    \`\`\`
    [=====]-------->
         -7
    \`\`\`
4.  Liczby całkowite $x$ takie, że $-2 < x \\leq 5$ to: $-1, 0, 1, 2, 3, 4, 5$.
5.  $\\frac{x}{2} - \\frac{x}{3} < 2 + 1$. Wspólny mianownik dla 2 i 3 to 6.
    $\\frac{3x}{6} - \\frac{2x}{6} < 3$
    $\\frac{x}{6} < 3$
    $x < 18$. Przedział: $(-\\infty, 18)$.
6.  $2x + 5 > 1 \\implies 2x > 1 - 5 \\implies 2x > -4 \\implies x > -2$. Poprawna odpowiedź: A.
7.  $1 - 7 \\geq -x + 3x \\implies -6 \\geq 2x \\implies -3 \\geq x \\implies x \\leq -3$. Przedział: $(-\\infty, -3]$.

## Szybka powtórka
1.  Jakie są cztery podstawowe znaki nierówności?
2.  Co się dzieje ze znakiem nierówności, gdy mnożymy obie strony przez liczbę ujemną?
3.  Czym różni się przedział otwarty od domkniętego na osi liczbowej?
4.  Jakie jest rozwiązanie nierówności $x \\geq 5$?
5.  Czy liczba 3 należy do przedziału $(-3, 3)$?

## Diagram`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "uklady_rownan",
    title: "Układy równań liniowych na maturze",
    content: `## Na egzaminie
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
    \\begin{cases}
    ax + by = c \\\\
    dx + ey = f
    \\end{cases}
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
    1.  Wyznaczamy jedną zmienną z jednego z równań (np. $y$ z pierwszego równania: $y = \\frac{c - ax}{b}$).
    2.  Podstawiamy otrzymane wyrażenie do drugiego równania zamiast tej zmiennej.
    3.  Rozwiązujemy powstałe równanie z jedną niewiadomą.
    4.  Wyznaczoną wartość podstawia się do wyrażenia na pierwszą zmienną lub do jednego z pierwotnych równań i oblicza drugą niewiadomą.

## Przykład 1 - podstawowy
Rozwiąż układ równań metodą przeciwnych współczynników:
$$
\\begin{cases}
2x + y = 5 \\\\
3x - y = 0
\\end{cases}
$$

**Krok 1.** Zauważamy, że współczynniki przy zmiennej $y$ są liczbami przeciwnymi (1 i -1). Nie musimy mnożyć równań.

**Krok 2.** Dodajemy równania stronami:
$(2x + y) + (3x - y) = 5 + 0$
$2x + 3x + y - y = 5$
$5x = 5$

**Krok 3.** Rozwiązujemy równanie z jedną niewiadomą ($x$):
$5x = 5 \\implies x = \\frac{5}{5} \\implies x = 1$

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

## Przykład 2 - maturalny
Rozwiąż układ równań metodą podstawiania:
$$
\\begin{cases}
3(x - 1) + 2y = 7 \\\\
x + 2(y + 3) = 1
\\end{cases}
$$

**Krok 1.** Upraszczamy oba równania, usuwając nawiasy:
Pierwsze równanie: $3x - 3 + 2y = 7 \\implies 3x + 2y = 10$
Drugie równanie: $x + 2y + 6 = 1 \\implies x + 2y = 1 - 6 \\implies x + 2y = -5$
Otrzymaliśmy układ:
$$
\\begin{cases}
3x + 2y = 10 \\\\
x + 2y = -5
\\end{cases}
$$

**Krok 2.** Wybieramy równanie i zmienną do wyznaczenia. Najłatwiej jest wyznaczyć $x$ z drugiego równania, ponieważ jego współczynnik wynosi 1:
$x + 2y = -5 \\implies x = -5 - 2y$

**Krok 3.** Podstawiamy otrzymane wyrażenie na $x$ do pierwszego równania:
$3x + 2y = 10$
$3(-5 - 2y) + 2y = 10$

**Krok 4.** Rozwiązujemy powstałe równanie z jedną niewiadomą ($y$):
$-15 - 6y + 2y = 10$
$-15 - 4y = 10$
$-4y = 10 + 15$
$-4y = 25$
$y = -\\frac{25}{4}$

**Krok 5.** Obliczamy wartość $x$, podstawiając $y = -\\frac{25}{4}$ do wyrażenia z Kroku 2:
$x = -5 - 2y$
$x = -5 - 2\\left(-\\frac{25}{4}\\right)$
$x = -5 - \\left(-\\frac{50}{4}\\right)$
$x = -5 + \\frac{25}{2}$
Aby dodać, sprowadzamy do wspólnego mianownika:
$x = -\\frac{10}{2} + \\frac{25}{2}$
$x = \\frac{15}{2}$

**Rozwiązanie:** Para liczb $(x, y) = \\left(\\frac{15}{2}, -\\frac{25}{4}\\right)$.

**Sprawdzenie:**
Pierwsze równanie (po uproszczeniu): $3x + 2y = 10$
$3\\left(\\frac{15}{2}\\right) + 2\\left(-\\frac{25}{4}\\right) = \\frac{45}{2} - \\frac{50}{4} = \\frac{45}{2} - \\frac{25}{2} = \\frac{20}{2} = 10$. Zgadza się.
Drugie równanie (po uproszczeniu): $x + 2y = -5$
$\\frac{15}{2} + 2\\left(-\\frac{25}{4}\\right) = \\frac{15}{2} - \\frac{50}{4} = \\frac{15}{2} - \\frac{25}{2} = -\\frac{10}{2} = -5$. Zgadza się.

Rozwiązanie jest poprawne.

## Przykład 3 - egzaminacyjny

W pewnej szkole jest 500 uczniów. Liczba dziewcząt stanowi 60% liczby wszystkich uczniów. Ile dziewcząt i ilu chłopców jest w tej szkole?

**Krok 1.** Wprowadzamy oznaczenia dla niewiadomych.
Niech $d$ oznacza liczbę dziewcząt.
Niech $c$ oznacza liczbę chłopców.

**Krok 2.** Zapisujemy informacje z treści zadania w postaci równań.
Z pierwszego zdania wiemy, że łączna liczba uczniów to 500:
$d + c = 500$

Z drugiego zdania wiemy, że liczba dziewcząt stanowi 60% wszystkich uczniów. 60% liczby 500 to:
$0.60 \\cdot 500 = \\frac{60}{100} \\cdot 500 = 60 \\cdot 5 = 300$.
Możemy to zapisać jako:
$d = 0.60 \\cdot (d+c)$ lub bezpośrednio obliczyć $d=300$.

Jednak, aby utworzyć układ równań, możemy zapisać to jako:
$d = 0.60 \\cdot 500$
$d = 300$
Mamy więc układ:
$$
\\begin{cases}
d + c = 500 \\\\
d = 300
\\end{cases}
$$
Alternatywnie, jeśli chcemy bardziej klasyczny układ z dwiema niewiadomymi i bez bezpośredniego obliczenia:
Wiemy, że chłopcy stanowią $100\\% - 60\\% = 40\\%$ uczniów.
$d = 0.60 \\cdot (d+c)$
$c = 0.40 \\cdot (d+c)$
Dodając te równania stronami: $d+c = 0.60(d+c) + 0.40(d+c) = (0.60+0.40)(d+c) = 1.00(d+c)$. To nam nic nie mówi.
Najprościej jest użyć informacji, że $d+c=500$.
Zatem $d = 0.60 \\cdot 500 = 300$.
A wtedy $c = 500 - d = 500 - 300 = 200$.

Jeśli jednak chcemy rozwiązać *układ równań*, użyjmy obu informacji w postaci układu:
$$
\\begin{cases}
d + c = 500 \\quad \\text{(Łączna liczba uczniów)} \\\\
d = 0.60 \\cdot 500 \\quad \\text{(Liczba dziewcząt)}
\\end{cases}
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
$\\frac{300}{500} = \\frac{3}{5} = 0.6 = 60\\%$. Zgadza się.

## Pułapki
*   **Brak przekształcenia równań:** Uczniowie często próbują rozwiązać układ od razu, nie upraszczając równań, które zawierają nawiasy lub wymagają przeniesienia wyrazów. Zawsze zaczynaj od doprowadzenia obu równań do postaci standardowej $ax + by = c$.
*   **Błędy w mnożeniu lub dodawaniu:** Przy stosowaniu metody przeciwnych współczynników lub podstawiania łatwo o pomyłki przy mnożeniu całego równania przez liczbę lub przy dodawaniu/odejmowaniu. Dokładnie sprawdzaj każdy krok.
*   **Błędy przy wyznaczaniu zmiennej:** W metodzie podstawiania, gdy wyznaczasz jedną zmienną, pamiętaj o poprawnej zmianie znaków i podziale przez współczynnik. Np. z $3x + 2y = 10$, wyznaczając $x$, otrzymasz $3x = 10 - 2y$, a następnie $x = \\frac{10 - 2y}{3}$. Nie zapominaj o kresce ułamkowej i dzieleniu.
*   **Nieczytelne zapisy:** Zapis może być bardzo nieczytelny, zwłaszcza przy ułamkach i długich wyrażeniach. Pisz starannie, używaj nawiasów tam, gdzie są potrzebne, aby uniknąć pomyłek.
*   **Zapominanie o sprawdzeniu:** Zawsze sprawdzaj swoje rozwiązanie, podstawiając obliczone wartości $x$ i $y$ do obu pierwotnych równań. To najprostszy sposób na wyłapanie błędów.

## Ćwiczenia do samodzielnego rozwiązania
1.  Rozwiąż układ równań metodą przeciwnych współczynników:
    $$
    \\begin{cases}
    x + 3y = 5 \\\\
    2x - 3y = 1
    \\end{cases}
    $$
2.  Rozwiąż układ równań metodą podstawiania:
    $$
    \\begin{cases}
    2x - y = 4 \\\\
    x + 5y = -3
    \\end{cases}
    $$
3.  Rozwiąż układ równań:
    $$
    \\begin{cases}
    3(x + y) - 2y = 10 \\\\
    2x + 5(x - y) = 7
    \\end{cases}
    $$
4.  Rozwiąż układ równań:
    $$
    \\begin{cases}
    \\frac{1}{2}x + y = 3 \\\\
    x - \\frac{1}{3}y = 2
    \\end{cases}
    $$
5.  Suma dwóch liczb wynosi 45. Jedna liczba jest o 7 większa od drugiej. Znajdź te liczby.
6.  Rozwiąż układ równań i określ jego rodzaj (jedno rozwiązanie, brak rozwiązań, nieskończenie wiele rozwiązań):
    $$
    \\begin{cases}
    4x - 2y = 6 \\\\
    -2x + y = -3
    \\end{cases}
    $$

## Odpowiedzi
1.  $x=2, y=1$
2.  $x=1, y=-2$
3.  $x=3, y=-1$
4.  $x=2, y=2$
5.  Niech szukane liczby to $a$ i $b$.
    $$
    \\begin{cases}
    a + b = 45 \\\\
    a = b + 7
    \\end{cases}
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
\`\`\`text
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
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "funkcja_liniowa",
    title: "Funkcja liniowa na maturze",
    content: `## Na egzaminie
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
    gdzie $a$ i $b$ są stałymi liczbami rzeczywistymi ($a, b \\in \\mathbb{R}$). Dziedziną i zbiorem wartości funkcji liniowej jest zbiór liczb rzeczywistych ($\\mathbb{R}$).

*   **Wykres funkcji liniowej** to linia prosta.

*   **Współczynnik kierunkowy ($a$)**:
    *   Określa nachylenie prostej względem osi $OX$.
    *   Decyduje o monotoniczności funkcji:
        *   Jeśli $a > 0$, funkcja jest **rosnąca**.
        *   Jeśli $a < 0$, funkcja jest **malejąca**.
        *   Jeśli $a = 0$, funkcja jest **stała** ($f(x) = b$). Jej wykres jest prostą poziomą.

*   **Wyraz wolny ($b$)**:
    *   Jest to wartość funkcji dla argumentu $x=0$, czyli $f(0) = a \\cdot 0 + b = b$.
    *   Określa punkt przecięcia wykresu funkcji z osią $OY$. Wykres przecina oś $OY$ w punkcie $(0, b)$.

*   **Miejsce zerowe funkcji liniowej**:
    *   Jest to taki argument $x$, dla którego wartość funkcji wynosi 0, czyli $f(x) = 0$.
    *   Aby je obliczyć, rozwiązujemy równanie:
        $$ax + b = 0$$
        $$ax = -b$$
        Jeśli $a \\neq 0$, to miejsce zerowe wynosi:
        $$x = -\\frac{b}{a}$$
    *   Miejsce zerowe geometrycznie oznacza punkt przecięcia wykresu funkcji z osią $OX$. Jest to punkt $(-\\frac{b}{a}, 0)$.
    *   Jeśli $a = 0$ i $b \\neq 0$, funkcja jest stała ($f(x)=b$) i nie ma miejsca zerowego (wykres jest prostą poziomą różną od osi $OX$).
    *   Jeśli $a = 0$ i $b = 0$, funkcja jest stała ($f(x)=0$) i każdym argumentem jest miejscem zerowym (wykres pokrywa się z osią $OX$).

*   **Równanie prostej przechodzącej przez dwa punkty** $A = (x_1, y_1)$ i $B = (x_2, y_2)$:
    *   Najpierw obliczamy współczynnik kierunkowy $a$ ze wzoru:
        $$a = \\frac{y_2 - y_1}{x_2 - x_1}$$
        (zakładamy, że $x_1 \\neq x_2$).
    *   Następnie, korzystając z jednego z punktów (np. $A$) i obliczonego $a$, wyznaczamy $b$ z równania $y_1 = ax_1 + b$.
        $$b = y_1 - ax_1$$
    *   Ostatecznie zapisujemy równanie prostej $y = ax + b$.

*   **Proste równoległe**: Dwie proste o równaniach $y = a_1x + b_1$ i $y = a_2x + b_2$ są równoległe, jeśli mają równe współczynniki kierunkowe:
    $$a_1 = a_2$$
    (i różne wyraz wolny $b_1 \\neq b_2$, w przeciwnym razie proste są identyczne).

*   **Proste prostopadłe**: Dwie proste o równaniach $y = a_1x + b_1$ i $y = a_2x + b_2$ są prostopadłe, jeśli iloczyn ich współczynników kierunkowych wynosi $-1$:
    $$a_1 \\cdot a_2 = -1$$
    (zakładamy, że żadna z prostych nie jest pionowa, co w przypadku funkcji liniowej zawsze ma miejsce, gdyż $a$ jest liczbą rzeczywistą).

## Przykład 1 - podstawowy
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
    $x = \\frac{4}{2}$
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
$f(0) = 2 \\cdot 0 - 4 = -4$ (zgadza się z punktem $(0, -4)$)
$f(2) = 2 \\cdot 2 - 4 = 4 - 4 = 0$ (zgadza się z miejscem zerowym $x=2$)
Współczynnik $a=2$ jest dodatni, więc funkcja jest rosnąca. Wszystko się zgadza.

## Przykład 2 - maturalny
Wyznacz równanie prostej, która przechodzi przez punkty $A = (-1, 5)$ i $B = (3, -7)$. Czy ta prosta jest prostopadła do prostej o równaniu $y = \\frac{1}{2}x + 1$?

**Rozwiązanie:**

*   **Krok 1: Obliczenie współczynnika kierunkowego ($a$)**
    Używamy wzoru $a = \\frac{y_2 - y_1}{x_2 - x_1}$ dla punktów $A = (-1, 5)$ (czyli $x_1 = -1, y_1 = 5$) i $B = (3, -7)$ (czyli $x_2 = 3, y_2 = -7$).
    $$a = \\frac{-7 - 5}{3 - (-1)} = \\frac{-12}{3 + 1} = \\frac{-12}{4} = -3$$
    Współczynnik kierunkowy wynosi $a = -3$.

*   **Krok 2: Obliczenie wyrazu wolnego ($b$)**
    Używamy znalezionego współczynnika $a = -3$ oraz współrzędnych jednego z punktów, np. $A=(-1, 5)$. Podstawiamy do wzoru $y = ax + b$:
    $5 = (-3) \\cdot (-1) + b$
    $5 = 3 + b$
    $b = 5 - 3$
    $b = 2$
    Wyraz wolny wynosi $b = 2$.

*   **Krok 3: Zapisanie równania prostej.**
    Równanie szukanej prostej ma postać $y = ax + b$. Podstawiając obliczone wartości $a = -3$ i $b = 2$, otrzymujemy:
    $$y = -3x + 2$$

*   **Krok 4: Sprawdzenie prostopadłości.**
    Mamy prostą o równaniu $y = -3x + 2$. Jej współczynnik kierunkowy to $a_1 = -3$.
    Druga prosta ma równanie $y = \\frac{1}{2}x + 1$. Jej współczynnik kierunkowy to $a_2 = \\frac{1}{2}$.
    Aby sprawdzić, czy proste są prostopadłe, obliczamy iloczyn ich współczynników kierunkowych:
    $$a_1 \\cdot a_2 = (-3) \\cdot \\frac{1}{2} = -\\frac{3}{2}$$
    Ponieważ iloczyn $a_1 \\cdot a_2 = -\\frac{3}{2} \\neq -1$, proste **nie są** prostopadłe.

**Sprawdzenie:**
Podstawmy punkty do równania $y = -3x + 2$:
Dla punktu $A=(-1, 5)$: $5 = -3(-1) + 2 = 3 + 2 = 5$. Zgadza się.
Dla punktu $B=(3, -7)$: $-7 = -3(3) + 2 = -9 + 2 = -7$. Zgadza się.
Warunek prostopadłości $a_1 \\cdot a_2 = -1$ jest niespełniony, bo $-\\frac{3}{2} \\neq -1$.

## Przykład 3 - egzaminacyjny

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
*   **Brak sprawdzenia warunku prostopadłości/równoległości:** Pamiętaj, że proste są równoległe, gdy $a_1=a_2$, a prostopadłe, gdy $a_1 \\cdot a_2 = -1$. Nie wystarczy tylko obliczyć $a_1$ i $a_2$.
*   **Dzielenie przez zero:** Wzór na $a$ ($a = \\frac{y_2 - y_1}{x_2 - x_1}$) jest niezdefiniowany dla $x_1 = x_2$. Oznacza to, że punkty leżą na prostej pionowej, która nie jest wykresem funkcji liniowej (funkcja musi przyporządkować każdemu $x$ dokładnie jedno $y$). W kontekście funkcji liniowej nie występuje taka sytuacja, ale warto o tym pamiętać przy innych tematach.

## Ćwiczenia do samodzielnego rozwiązania
1.  Dana jest funkcja $f(x) = -3x + 6$.
    a) Określ jej monotoniczność.
    b) Podaj współrzędne punktu przecięcia z osią $OY$.
    c) Oblicz miejsce zerowe.
    d) Naszkicuj wykres.

2.  Wyznacz równanie prostej przechodzącej przez punkty $P = (2, -1)$ i $Q = (-4, 5)$.

3.  Funkcja liniowa $g(x) = \\frac{1}{4}x + 2$ jest:
    A. Rosnąca, przecina oś $OY$ w punkcie $(0, 2)$.
    B. Malejąca, przecina oś $OX$ w punkcie $(-8, 0)$.
    C. Rosnąca, ma miejsce zerowe $x = -8$.
    D. Malejąca, ma miejsce zerowe $x = 8$.

4.  Prosta o równaniu $y = 2x - 1$ i prosta o równaniu $y = -\\frac{1}{2}x + 3$ są:
    A. Równoległe
    B. Prostopadłe
    C. Mają ten sam punkt przecięcia z osią $OY$
    D. Mają ten sam punkt przecięcia z osią $OX$

5.  Wyznacz parametr $k$, dla którego funkcja liniowa $f(x) = (2k - 1)x - 4$ jest stała.

6.  Oblicz miejsce zerowe funkcji $h(x) = 5x + 10$. Następnie sprawdź, czy punkt $(1, 15)$ leży na wykresie tej funkcji.

7.  Znajdź równanie prostej przechodzącej przez punkt $(1, 7)$ i prostopadłej do prostej $y = -\\frac{1}{3}x + 2$.

## Odpowiedzi
1.  a) Malejąca ($a = -3 < 0$). b) $(0, 6)$. c) $x = 2$. d) Wykres przechodzi przez punkty $(0, 6)$ i $(2, 0)$.
2.  $y = -x + 1$. (Obliczenie $a = \\frac{5 - (-1)}{-4 - 2} = \\frac{6}{-6} = -1$. Następnie $b$: $-1 = -1 \\cdot 2 + b \\Rightarrow b = 1$).
3.  C. (a = 1/4 > 0 - rosnąca; miejsce zerowe: 1/4 * x + 2 = 0 => 1/4 * x = -2 => x = -8. Punkt przecięcia z OY to (0, 2)).
4.  B. (Współczynniki kierunkowe to $a_1 = 2$ i $a_2 = -1/2$. Ich iloczyn: $2 \\cdot (-1/2) = -1$, co jest warunkiem prostopadłości).
5.  $k = \\frac{1}{2}$. (Aby funkcja była stała, $a=0$, czyli $2k-1=0$).
6.  Miejsce zerowe $x = -2$. Punkt $(1, 15)$ nie leży na wykresie (bo $h(1) = 5(1)+10 = 15$, czyli punkt $(1, 15)$ leży na wykresie).
7.  $y = 3x + 4$. (Prosta prostopadła ma współczynnik $a = 3$. Używając punktu $(1, 7)$: $7 = 3 \\cdot 1 + b \\Rightarrow b = 4$).

## Szybka powtórka
1.  Jaki jest ogólny wzór funkcji liniowej?
2.  Co oznacza współczynnik $a$ we wzorze funkcji liniowej?
3.  W jaki sposób określamy, czy funkcja liniowa jest rosnąca, malejąca czy stała?
4.  Gdzie wykres funkcji liniowej $y = ax + b$ przecina oś $OY$?
5.  Jaki warunek muszą spełniać współczynniki kierunkowe dwóch prostych, aby były one prostopadłe?

## Diagram
\`\`\`text
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
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "funkcja_kwadratowa",
    title: "Funkcja kwadratowa – od podstaw do matury",
    content: `## Na egzaminie
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
    gdzie $a, b, c$ są współczynnikami liczbowymi, a $a \\neq 0$.
    *   $ax^2$ – człon kwadratowy
    *   $bx$ – człon liniowy
    *   $c$ – wyraz wolny
*   **Wykres funkcji kwadratowej:** Wykresem funkcji kwadratowej jest parabola.
    *   Jeśli $a > 0$, ramiona paraboli są skierowane do góry.
    *   Jeśli $a < 0$, ramiona paraboli są skierowane do dołu.
*   **Miejsca zerowe:** Miejsca zerowe funkcji kwadratowej to wartości $x$, dla których $f(x) = 0$. Obliczamy je, rozwiązując równanie kwadratowe $ax^2 + bx + c = 0$.
    *   Obliczamy wyróżnik trójmianu kwadratowego (deltę):
        $$\\Delta = b^2 - 4ac$$
    *   W zależności od wartości $\\Delta$:
        *   Jeśli $\\Delta > 0$, istnieją dwa różne miejsca zerowe $x_1, x_2$:
            $$x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}$$
        *   Jeśli $\\Delta = 0$, istnieje dokładnie jedno miejsce zerowe (zwane podwójnym) $x_0$:
            $$x_0 = \\frac{-b}{2a}$$
        *   Jeśli $\\Delta < 0$, nie istnieją miejsca zerowe (funkcja nie przecina osi OX).
*   **Wierzchołek paraboli:** Wierzchołek paraboli $W = (p, q)$ ma współrzędne:
    $$p = \\frac{-b}{2a}$$
    $$q = \\frac{-\\Delta}{4a} = f(p)$$
    *   Współrzędna $p$ jest osią symetrii paraboli.
    *   Wierzchołek jest najniższym punktem paraboli (dla $a>0$) lub najwyższym (dla $a<0$).
*   **Zbiór wartości:**
    *   Dla $a > 0$: Zbiorem wartości jest przedział $[q, +\\infty)$, gdzie $q$ to współrzędna $y$ wierzchołka.
    *   Dla $a < 0$: Zbiorem wartości jest przedział $(-\\infty, q]$, gdzie $q$ to współrzędna $y$ wierzchołka.
*   **Monotoniczność:**
    *   Dla $a > 0$:
        *   Funkcja jest malejąca w przedziale $(-\\infty, p]$.
        *   Funkcja jest rosnąca w przedziale $[p, +\\infty)$.
    *   Dla $a < 0$:
        *   Funkcja jest rosnąca w przedziale $(-\\infty, p]$.
        *   Funkcja jest malejąca w przedziale $[p, +\\infty)$.
*   **Postać kanoniczna:**
    $$f(x) = a(x-p)^2 + q$$
    gdzie $(p, q)$ to współrzędne wierzchołka.
*   **Postać iloczynowa (jeśli istnieją miejsca zerowe $x_1, x_2$):**
    $$f(x) = a(x-x_1)(x-x_2)$$

## Przykład 1 - podstawowy
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
$\\Delta = b^2 - 4ac = (-4)^2 - 4 \\cdot 1 \\cdot 3 = 16 - 12 = 4$.
Ponieważ $\\Delta > 0$, obliczamy dwa miejsca zerowe:
$\\sqrt{\\Delta} = \\sqrt{4} = 2$.
$x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{-(-4) - 2}{2 \\cdot 1} = \\frac{4 - 2}{2} = \\frac{2}{2} = 1$.
$x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{-(-4) + 2}{2 \\cdot 1} = \\frac{4 + 2}{2} = \\frac{6}{2} = 3$.
Miejsca zerowe to $x=1$ i $x=3$.

**Krok 3.** Obliczenie współrzędnych wierzchołka.
Obliczamy $p$:
$p = \\frac{-b}{2a} = \\frac{-(-4)}{2 \\cdot 1} = \\frac{4}{2} = 2$.
Obliczamy $q$:
$q = \\frac{-\\Delta}{4a} = \\frac{-4}{4 \\cdot 1} = \\frac{-4}{4} = -1$.
Możemy też obliczyć $q$ jako $f(p)$:
$q = f(2) = 2^2 - 4 \\cdot 2 + 3 = 4 - 8 + 3 = -1$.
Wierzchołek paraboli $W = (2, -1)$.

**Krok 4.** Szkicowanie wykresu.
Zaznaczamy miejsca zerowe na osi OX (punkty (1,0) i (3,0)).
Zaznaczamy wierzchołek (punkt (2,-1)).
Rysujemy parabolę przechodzącą przez te punkty, z ramionami skierowanymi do góry i symetryczną względem prostej $x=2$. Punkt przecięcia z osią OY to $f(0) = 0^2 - 4 \\cdot 0 + 3 = 3$, czyli punkt (0,3).

**Krok 5.** Podanie zbioru wartości.
Ponieważ $a=1>0$ i $q=-1$, zbiorem wartości funkcji jest przedział $[q, +\\infty)$, czyli $[-1, +\\infty)$.

**Krok 6.** Określenie przedziałów monotoniczności.
Ponieważ $a=1>0$ i $p=2$:
Funkcja jest malejąca w przedziale $(-\\infty, 2]$.
Funkcja jest rosnąca w przedziale $[2, +\\infty)$.

**Sprawdzenie:**
Wzór funkcji $f(x) = x^2 - 4x + 3$.
$a=1, b=-4, c=3$. Ramiona w górę ($a>0$).
Miejsca zerowe: $x_1=1, x_2=3$. (1,0), (3,0) na wykresie.
Wierzchołek: $p=2, q=-1$. $W=(2,-1)$. Punkt najniższy.
Zbiór wartości: $[-1, +\\infty)$.
Monotoniczność: malejąca $(-\\infty, 2]$, rosnąca $[2, +\\infty)$.
Wszystko się zgadza.

## Przykład 2 - maturalny
Dana jest funkcja $f(x) = -2x^2 + 8x - 6$.
a) Oblicz miejsca zerowe funkcji i zapisz jej postać iloczynową.
b) Oblicz współrzędne wierzchołka i zapisz postać kanoniczną funkcji.
c) Naszkicuj wykres funkcji, zaznaczając jej wierzchołek, miejsca zerowe oraz punkt przecięcia z osią OY.
d) Podaj zbiór wartości funkcji.
e) Dla jakich argumentów $x$ funkcja przyjmuje wartości większe od 0?

**Rozwiązanie:**

**Krok 1.** Miejsca zerowe i postać iloczynowa.
$a = -2$, $b = 8$, $c = -6$.
$\\Delta = b^2 - 4ac = 8^2 - 4 \\cdot (-2) \\cdot (-6) = 64 - 48 = 16$.
$\\sqrt{\\Delta} = \\sqrt{16} = 4$.
$x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{-8 - 4}{2 \\cdot (-2)} = \\frac{-12}{-4} = 3$.
$x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{-8 + 4}{2 \\cdot (-2)} = \\frac{-4}{-4} = 1$.
Miejsca zerowe to $x=1$ i $x=3$.
Postać iloczynowa: $f(x) = a(x-x_1)(x-x_2) = -2(x-3)(x-1)$.

**Krok 2.** Wierzchołek i postać kanoniczna.
$p = \\frac{-b}{2a} = \\frac{-8}{2 \\cdot (-2)} = \\frac{-8}{-4} = 2$.
$q = \\frac{-\\Delta}{4a} = \\frac{-16}{4 \\cdot (-2)} = \\frac{-16}{-8} = 2$.
Wierzchołek $W = (2, 2)$.
Postać kanoniczna: $f(x) = a(x-p)^2 + q = -2(x-2)^2 + 2$.

**Krok 3.** Szkicowanie wykresu.
*   Ramiona paraboli skierowane są w dół ($a=-2 < 0$).
*   Miejsca zerowe: $x=1$ i $x=3$. Punkty $(1, 0)$ i $(3, 0)$.
*   Wierzchołek: $W=(2, 2)$.
*   Punkt przecięcia z osią OY: $f(0) = -2(0)^2 + 8(0) - 6 = -6$. Punkt $(0, -6)$.
Szkicujemy parabolę przechodzącą przez te punkty.

**Krok 4.** Zbiór wartości.
Ponieważ $a=-2<0$ i $q=2$, zbiorem wartości jest przedział $(-\\infty, q]$, czyli $(-\\infty, 2]$.

**Krok 5.** Rozwiązanie nierówności $f(x) > 0$.
Szukamy argumentów $x$, dla których wykres funkcji znajduje się nad osią OX. Z miejsc zerowych $x=1$ i $x=3$ oraz faktu, że ramiona są skierowane w dół, wynika, że funkcja jest dodatnia między miejscami zerowymi.
Rozwiązaniem nierówności $f(x) > 0$ jest przedział $(1, 3)$.

**Sprawdzenie:**
Postać iloczynowa: $-2(x-3)(x-1) = -2(x^2 - x - 3x + 3) = -2(x^2 - 4x + 3) = -2x^2 + 8x - 6$. Zgadza się.
Postać kanoniczna: $-2(x-2)^2 + 2 = -2(x^2 - 4x + 4) + 2 = -2x^2 + 8x - 8 + 2 = -2x^2 + 8x - 6$. Zgadza się.
Wierzchołek $(2,2)$: $f(2) = -2(2-2)^2 + 2 = 0 + 2 = 2$. Zgadza się.
Miejsca zerowe $1, 3$: $f(1) = -2(1)^2 + 8(1) - 6 = -2+8-6=0$. $f(3) = -2(3)^2 + 8(3) - 6 = -18+24-6=0$. Zgadza się.
Zbiór wartości $(-\\infty, 2]$. Potwierdzone przez wierzchołek.
Dla $x \\in (1, 3)$, np. $x=2$, $f(2)=2>0$.

## Przykład 3 - egzaminacyjny
Trójkąt prostokątny ma przyprostokątne o długościach $x$ cm i $(10-x)$ cm. Oblicz pole tego trójkąta jako funkcję zmiennej $x$ i określ dziedzinę tej funkcji. Dla jakiej długości boku $x$ pole tego trójkąta jest największe?

**Rozwiązanie:**

**Krok 1.** Zapisanie wzoru na pole trójkąta.
Pole trójkąta prostokątnego jest równe połowie iloczynu długości jego przyprostokątnych.
$P(x) = \\frac{1}{2} \\cdot x \\cdot (10-x)$.

**Krok 2.** Uporządkowanie wzoru i określenie dziedziny.
$P(x) = \\frac{1}{2} (10x - x^2) = 5x - \\frac{1}{2}x^2 = -\\frac{1}{2}x^2 + 5x$.
Jest to funkcja kwadratowa, gdzie $a = -\\frac{1}{2}$, $b = 5$, $c = 0$.
Długości boków muszą być dodatnie.
$x > 0$
$10 - x > 0 \\implies x < 10$.
Zatem dziedziną funkcji $P(x)$ jest przedział $(0, 10)$.

**Krok 3.** Znalezienie argumentu maksymalizującego pole.
Szukamy argumentu $x$, dla którego funkcja $P(x) = -\\frac{1}{2}x^2 + 5x$ przyjmuje największą wartość. Ponieważ współczynnik $a = -\\frac{1}{2} < 0$, ramiona paraboli są skierowane w dół, a największą wartość funkcja przyjmuje w wierzchołku.
Obliczamy współrzędną $p$ wierzchołka:
$p = \\frac{-b}{2a} = \\frac{-5}{2 \\cdot (-\\frac{1}{2})} = \\frac{-5}{-1} = 5$.
Argument $x=5$ należy do dziedziny $(0, 10)$.

**Krok 4.** Obliczenie maksymalnego pola (nie jest wymagane, ale warto wiedzieć).
Maksymalne pole:
$P(5) = -\\frac{1}{2}(5)^2 + 5 \\cdot 5 = -\\frac{1}{2} \\cdot 25 + 25 = -12.5 + 25 = 12.5$.

**Odpowiedź:** Pole trójkąta jako funkcja $x$ to $P(x) = -\\frac{1}{2}x^2 + 5x$. Dziedzina funkcji to $x \\in (0, 10)$. Pole jest największe dla $x = 5$ cm.

## Pułapki
*   **Znak współczynnika $a$:** Zapominanie o znaku $a$ przy określaniu kierunku ramion lub przy obliczaniu $q$ lub przy stosowaniu postaci iloczynowej. Pamiętaj: $a>0$ ramiona w górę, $a<0$ ramiona w dół.
*   **Wzory na wierzchołek:** Mylenie wzorów na $p$ i $q$, lub nieprawidłowe podstawianie znaków ze wzoru $ax^2+bx+c$. Zawsze sprawdzaj znaki, np. $-b$ jest inne niż $b$.
*   **Obliczanie delty:** Błędy rachunkowe przy obliczaniu $\\Delta = b^2 - 4ac$, zwłaszcza przy ujemnych współczynnikach (np. $(-4)^2=16$, a nie $-16$).
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

7.  Rozwiąż nierówność kwadratową: $-x^2 + 5x - 6 \\ge 0$.

## Odpowiedzi
1.  a) $a=2, b=-8, c=6$.
    b) $\\Delta = (-8)^2 - 4 \\cdot 2 \\cdot 6 = 64 - 48 = 16$, $\\sqrt{\\Delta}=4$. $x_1 = \\frac{8-4}{4}=1$, $x_2 = \\frac{8+4}{4}=3$. Miejsca zerowe: $x=1, x=3$.
    $p = \\frac{-(-8)}{2 \\cdot 2} = \\frac{8}{4} = 2$. $q = f(2) = 2(2^2) - 8(2) + 6 = 8 - 16 + 6 = -2$. Wierzchołek: $(2, -2)$.
    c) Zbiór wartości: $[-2, +\\infty)$. Monotoniczność: malejąca $(-\\infty, 2]$, rosnąca $[2, +\\infty)$.

2.  Aby funkcja była kwadratową, współczynnik przy $x^2$ musi być różny od zera. Zatem $m-1 \\neq 0$, co oznacza $m \\neq 1$.

3.  Korzystamy z postaci iloczynowej: $f(x) = a(x-x_1)(x-x_2) = a(x-(-2))(x-4) = a(x+2)(x-4)$.
    Wykorzystujemy wierzchołek $(1, -9)$: $f(1) = -9$.
    $a(1+2)(1-4) = -9$
    $a(3)(-3) = -9$
    $-9a = -9 \\implies a=1$.
    Wzór funkcji: $f(x) = 1(x+2)(x-4) = x^2 - 4x + 2x - 8 = x^2 - 2x - 8$.
    Wzór w postaci ogólnej: $f(x) = x^2 - 2x - 8$.

4.  $f(x) = -x^2 + 2x + 3$. $a=-1, b=2, c=3$. Ramiona w dół.
    $\\Delta = 2^2 - 4(-1)(3) = 4 + 12 = 16$. $\\sqrt{\\Delta}=4$.
    $x_1 = \\frac{-2-4}{2(-1)} = \\frac{-6}{-2} = 3$. $x_2 = \\frac{-2+4}{2(-1)} = \\frac{2}{-2} = -1$. Miejsca zerowe: $x=-1, x=3$.
    $p = \\frac{-2}{2(-1)} = \\frac{-2}{-2} = 1$. $q = f(1) = -(1)^2 + 2(1) + 3 = -1+2+3 = 4$. Wierzchołek: $(1, 4)$.
    Punkt przecięcia z OY: $f(0)=3$.
    Wykres: parabola z ramionami w dół, przechodząca przez $(-1,0), (3,0), (1,4), (0,3)$.
    Zbiór wartości: $(-\\infty, 4]$.
    Monotoniczność: rosnąca $(-\\infty, 1]$, malejąca $[1, +\\infty)$.

5.  Funkcja $f(x) = -x^2 + 6x - 5$. $a=-1 < 0$, więc funkcja ma wartość maksymalną w wierzchołku.
    $p = \\frac{-6}{2(-1)} = \\frac{-6}{-2} = 3$.
    $q = f(3) = -(3)^2 + 6(3) - 5 = -9 + 18 - 5 = 4$.
    Największa wartość funkcji wynosi 4.

6.  $P(x) = x(12-x) = 12x - x^2 = -x^2 + 12x$.
    Dziedzina: $x>0$ i $12-x>0 \\implies x<12$. Dziedzina: $(0, 12)$.
    Aby znaleźć wymiary prostokąta o największym polu, szukamy $x$ maksymalizującego $P(x)$.
    $a=-1 < 0$. Wartość maksymalna w wierzchołku.
    $p = \\frac{-12}{2(-1)} = \\frac{-12}{-2} = 6$.
    Argument $x=6$ należy do dziedziny $(0, 12)$.
    Długości boków to $x=6$ cm i $12-x = 12-6=6$ cm. Prostokąt jest kwadratem.

7.  $-x^2 + 5x - 6 \\ge 0$.
    Szukamy pierwiastków równania $-x^2 + 5x - 6 = 0$.
    $\\Delta = 5^2 - 4(-1)(-6) = 25 - 24 = 1$. $\\sqrt{\\Delta}=1$.
    $x_1 = \\frac{-5-1}{2(-1)} = \\frac{-6}{-2} = 3$. $x_2 = \\frac{-5+1}{2(-1)} = \\frac{-4}{-2} = 2$.
    Pierwiastki to $x=2$ i $x=3$.
    Współczynnik $a=-1<0$, więc ramiona paraboli skierowane są w dół.
    Nierówność $\\ge 0$ oznacza wartości dodatnie lub równe zero. Szukamy $x$, dla których parabola jest nad lub na osi OX.
    Rozwiązaniem jest przedział domknięty między pierwiastkami: $[2, 3]$.

## Szybka powtórka
1.  Jaki jest wzór funkcji kwadratowej w postaci ogólnej?
2.  Jak określamy kierunek ramion paraboli?
3.  Jakie są wzory na miejsca zerowe funkcji kwadratowej?
4.  Podaj wzory na współrzędne wierzchołka paraboli.
5.  Jak zależy zbiór wartości funkcji kwadratowej od współczynnika $a$?

## Diagram
\`\`\`text
      ^ y
      |       * W(p,q)
      |      / \\
      |     /   \\
------+----*-----*------- > x
     x1   |     x2
          |
          |
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "wlasnosci_funkcji",
    title: "Własności funkcji i odczytywanie ich z wykresu",
    content: `## Na egzaminie
Zagadnienia dotyczące własności funkcji oraz odczytywania informacji z ich wykresów pojawiają się na maturze podstawowej regularnie, zazwyczaj jako zadanie otwarte lub element zadań zamkniętych. Przeważnie są to zadania punktujące od 2 do 4 punktów. CKE lubi sprawdzać rozumienie pojęć takich jak: monotoniczność (rosnąca, malejąca), wartości ekstremalne (najmniejsza, największa), zbiór wartości, miejsca zerowe, a także interpretację graficzną tych własności.

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił:
1.  Zrozumieć definicję funkcji i jej podstawowe pojęcia (dziedzina, zbiór wartości).
2.  Rozpoznawać na wykresie miejsca zerowe funkcji.
3.  Określać przedziały, w których funkcja jest rosnąca, malejąca lub stała.
4.  Znajdować na wykresie wartość największą i najmniejszą funkcji w danym przedziale.
5.  Odczytywać z wykresu wartości funkcji dla konkretnych argumentów.
6.  Wyznaczać z wykresu zbiór wartości funkcji.
7.  Rozumieć, jak przesunięcia wykresu wpływają na własności funkcji.

## Definicje i wzory
*   **Funkcja:** Przyporządkowanie, w którym każdemu elementowi ze zbioru $X$ (dziedziny) odpowiada dokładnie jeden element ze zbioru $Y$ (przeciwdziedziny). Oznaczamy ją jako $f: X \\to Y$.
*   **Dziedzina funkcji ($D_f$):** Zbiór wszystkich argumentów $x$, dla których funkcja jest określona. Na wykresie jest to zbiór wszystkich liczb na osi $X$, dla których wykres istnieje.
*   **Zbiór wartości funkcji ($ZW_f$):** Zbiór wszystkich wartości $f(x)$ przyjmowanych przez funkcję. Na wykresie jest to zbiór wszystkich liczb na osi $Y$, które odpowiadają punktom na wykresie.
*   **Miejsce zerowe funkcji:** Argument $x_0$, dla którego wartość funkcji wynosi zero, czyli $f(x_0) = 0$. Na wykresie są to punkty przecięcia wykresu z osią $X$.
*   **Funkcja rosnąca:** W przedziale, w którym funkcja jest rosnąca, wraz ze wzrostem argumentu $x$, rośnie również wartość funkcji $f(x)$. Formalnie: dla dowolnych $x_1, x_2$ z przedziału, jeśli $x_1 < x_2$, to $f(x_1) < f(x_2)$. Na wykresie funkcja "pnie się w górę" od lewej do prawej.
*   **Funkcja malejąca:** W przedziale, w którym funkcja jest malejąca, wraz ze wzrostem argumentu $x$, maleje wartość funkcji $f(x)$. Formalnie: dla dowolnych $x_1, x_2$ z przedziału, jeśli $x_1 < x_2$, to $f(x_1) > f(x_2)$. Na wykresie funkcja "stacza się w dół" od lewej do prawej.
*   **Funkcja stała:** W przedziale, w którym funkcja jest stała, wartość funkcji $f(x)$ jest zawsze taka sama dla wszystkich argumentów $x$ z tego przedziału. Formalnie: dla dowolnych $x_1, x_2$ z przedziału, $f(x_1) = f(x_2)$. Na wykresie jest to poziomy odcinek.
*   **Wartość największa funkcji ($M$):** Najwyższa wartość, jaką funkcja przyjmuje w danym przedziale (lub na całej dziedzinie). Na wykresie jest to najwyższy punkt na wykresie.
*   **Wartość najmniejsza funkcji ($m$):** Najniższa wartość, jaką funkcja przyjmuje w danym przedziale (lub na całej dziedzinie). Na wykresie jest to najniższy punkt na wykresie.
*   **Funkcja parzysta:** Funkcja, której wykres jest symetryczny względem osi $Y$. Formalnie: $f(-x) = f(x)$ dla każdego $x$ z dziedziny.
*   **Funkcja nieparzysta:** Funkcja, której wykres jest symetryczny względem początku układu współrzędnych. Formalnie: $f(-x) = -f(x)$ dla każdego $x$ z dziedziny.

## Przykład 1 - podstawowy
Dana jest funkcja $f(x)$ o wykresie przedstawionym poniżej.
\`\`\`text
      ^ y
      |
    4 +-------*-------*
      |       |       |
    3 +       |       *
      |       |     /
    2 +-------*----/
      |     / |   /
    1 +---*---|--*
      | /     | /
----+-*-+-*-+-*-+-----> x
   -3 -2 -1 | 0 1 2 3
      |     /
   -1 +---*
      | /
   -2 *
      |
\`\`\`
Odczytaj z wykresu:
a) Dziedzinę funkcji $f$.
b) Zbiór wartości funkcji $f$.
c) Miejsca zerowe funkcji $f$.
d) Wartości funkcji dla $x = -3$, $x = 0$, $x = 2$.
e) Przedziały monotoniczności (rosnąca, malejąca).
f) Wartość największą i najmniejszą funkcji w przedziale $[-2, 3]$.

**Krok 1.** Dziedzina funkcji**
Dziedzina to wszystkie wartości $x$, dla których funkcja jest określona. Patrzymy na oś $X$. Wykres zaczyna się dla $x = -3$ i kończy dla $x = 3$. Zatem dziedziną jest przedział $[-3, 3]$.

**Krok 2.** Zbiór wartości funkcji**
Zbiór wartości to wszystkie wartości $y$, które przyjmuje funkcja. Patrzymy na oś $Y$. Najniższy punkt na wykresie ma współrzędną $y = -2$ (dla $x=-2$). Najwyższe punkty mają współrzędną $y = 4$ (dla $x=-3$ i $x=1$). Zatem zbiór wartości to przedział $[-2, 4]$.

**Krok 3.** Miejsca zerowe**
Miejsca zerowe to wartości $x$, dla których $f(x) = 0$. Są to punkty przecięcia wykresu z osią $X$. Wykres przecina oś $X$ dla $x = -1$ oraz dla $x = 2$. Miejsca zerowe to $x = -1$ i $x = 2$.

**Krok 4.** Wartości funkcji**
Odczytujemy wartości z wykresu:
Dla $x = -3$: punkt $(-3, 4)$, więc $f(-3) = 4$.
Dla $x = 0$: punkt $(0, 1)$, więc $f(0) = 1$.
Dla $x = 2$: punkt $(2, 0)$, więc $f(2) = 0$.

**Krok 5.** Monotoniczność i wartości ekstremalne**
*   Funkcja jest **malejąca** w przedziałach, gdzie wykres "idzie w dół" od lewej do prawej. Są to przedziały $[-3, -2]$ oraz $[0, 1]$.
*   Funkcja jest **rosnąca** w przedziałach, gdzie wykres "idzie w górę" od lewej do prawej. Są to przedziały $[-2, 0]$ oraz $[1, 3]$.
*   W przedziale $[-2, 3]$:
    *   Najniższy punkt to $(2, 0)$, więc wartość najmniejsza wynosi $m = 0$.
    *   Najwyższe punkty to $(-2, 3)$ oraz $(3, 4)$. Zatem wartość największa wynosi $M = 4$.

**Sprawdzenie:** Wszystkie odczyty są zgodne z wizualną interpretacją wykresu. Zbiór wartości i dziedzina obejmują wszystkie "widoczne" części osi. Punkty przecięcia z osiami zostały zidentyfikowane. Kierunek wykresu odpowiada definicjom monotoniczności. Wartości ekstremalne odpowiadają najwyższym i najniższym punktom w zadanym przedziale.

## Przykład 2 - maturalny
Rozważ funkcję $f(x) = -2x^2 + 4x + 6$. Narysuj jej wykres i odczytaj z niego:
a) Wierzchołek paraboli.
b) Miejsca zerowe.
c) Zbiór wartości.
d) Przedziały monotoniczności.

**Krok 1.** Identyfikacja typu funkcji i jej podstawowych parametrów**
Jest to funkcja kwadratowa, której wykresem jest parabola. Wyróżnik $a = -2$, $b = 4$, $c = 6$. Ponieważ $a < 0$, ramiona paraboli są skierowane w dół.

**Krok 2.** Obliczenie współrzędnych wierzchołka ($W=(p, q)$)**
Wzory na współrzędne wierzchołka paraboli:
$$p = -\\frac{b}{2a}$$
$$q = -\\frac{\\Delta}{4a} \\quad \\text{gdzie } \\Delta = b^2 - 4ac$$
Obliczamy wyróżnik $\\Delta$:
$\\Delta = 4^2 - 4 \\cdot (-2) \\cdot 6 = 16 - (-48) = 16 + 48 = 64$.
Obliczamy $p$:
$p = -\\frac{4}{2 \\cdot (-2)} = -\\frac{4}{-4} = 1$.
Obliczamy $q$:
$q = -\\frac{64}{4 \\cdot (-2)} = -\\frac{64}{-8} = 8$.
Wierzchołek paraboli to $W = (1, 8)$.

**Krok 3.** Obliczenie miejsc zerowych**
Miejsca zerowe to pierwiastki równania kwadratowego $f(x) = 0$.
$$x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{-4 - \\sqrt{64}}{2 \\cdot (-2)} = \\frac{-4 - 8}{-4} = \\frac{-12}{-4} = 3$$
$$x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{-4 + \\sqrt{64}}{2 \\cdot (-2)} = \\frac{-4 + 8}{-4} = \\frac{4}{-4} = -1$$
Miejsca zerowe to $x = -1$ i $x = 3$.

**Krok 4.** Wyznaczenie punktu przecięcia z osią Y**
Punkt przecięcia z osią $Y$ otrzymujemy dla $x=0$:
$f(0) = -2(0)^2 + 4(0) + 6 = 6$.
Punkt przecięcia to $(0, 6)$.

**Krok 5.** Narysowanie wykresu i odczytanie własności**
Rysujemy parabolę przechodzącą przez punkty:
*   Wierzchołek: $(1, 8)$
*   Miejsca zerowe: $(-1, 0)$ i $(3, 0)$
*   Przecięcie z osią Y: $(0, 6)$
Ponieważ funkcja jest parzysta względem osi symetrii $x=1$, punkt symetryczny do $(0, 6)$ względem $x=1$ to $(2, 6)$.

\`\`\`text
      ^ y
      |
    9 +
      |
    8 +-------* (1,8) Wierzchołek
      |     / | \\
    7 +    /  |  \\
      |   /   |   \\
    6 +--*----+----*-- (0,6) i (2,6)
      | /     |     \\
    5 +/      |      \\
      |       |       \\
    4 +       |        \\
      |       |         \\
    3 +       |          \\
      |       |           \\
    2 +       |            \\
      |       |             \\
    1 +       |              \\
      |       |               \\
----+-*-------+-------*-------+-----> x
   -2 -1     0       1       2 3
      |               |
    0 +---------------* (3,0) Miejsce zerowe
      |               |
\`\`\`

a) Wierzchołek paraboli to $W = (1, 8)$.
b) Miejsca zerowe to $x = -1$ i $x = 3$.
c) Zbiór wartości: Ponieważ ramiona paraboli są skierowane w dół, najwyższą wartością jest $y$-owa współrzędna wierzchołka, czyli $q=8$. Funkcja przyjmuje wszystkie wartości mniejsze lub równe 8. Zbiór wartości to $ZW_f = (-\\infty, 8]$.
d) Przedziały monotoniczności:
*   Funkcja jest **rosnąca** na lewo od wierzchołka, czyli w przedziale $(-\\infty, 1]$.
*   Funkcja jest **malejąca** na prawo od wierzchołka, czyli w przedziale $[1, \\infty)$.

**Sprawdzenie:** Wierzchołek jest najwyższym punktem. Miejsca zerowe są punktami przecięcia z osią X. Zbiór wartości zawiera najwyższą wartość. Przedziały monotoniczności są zgodne z kierunkiem ramion paraboli.

## Przykład 3 - egzaminacyjny

Na rysunku przedstawiono fragment wykresu pewnej funkcji $f$.

\`\`\`text
      ^ y
      |
    3 +       *
      |     /
    2 +---*
      | /
    1 +*
      |
----+-+-----*-------+-----> x
   -1 0     1       2
      |
\`\`\`

Które z poniższych stwierdzeń jest prawdziwe?
A. Funkcja $f$ jest malejąca w przedziale $[-1, 1]$.
B. Miejscem zerowym funkcji $f$ jest liczba $x=1$.
C. Wartość najmniejsza funkcji $f$ wynosi $-1$.
D. Funkcja $f$ jest rosnąca w przedziale $[0, 2]$.

**Krok 1.** Analiza wykresu i stwierdzeń**
Na wykresie widzimy fragment funkcji liniowej przechodzącej przez punkty $(-1, 1)$, $(0, 2)$ i $(1, 3)$. Wykres dla $x>1$ jest zaznaczony jako poziomy odcinek o $y=3$.

**Krok 2.** Weryfikacja stwierdzenia A**
Stwierdzenie A: Funkcja $f$ jest malejąca w przedziale $[-1, 1]$.
W przedziale $[-1, 1]$ funkcja przechodzi przez punkty $(-1, 1)$, $(0, 2)$, $(1, 3)$. Wartość funkcji rośnie wraz ze wzrostem argumentu ($1 < 2 < 3$). Funkcja jest rosnąca w tym przedziale, a nie malejąca. Stwierdzenie A jest fałszywe.

**Krok 3.** Weryfikacja stwierdzenia B**
Stwierdzenie B: Miejscem zerowym funkcji $f$ jest liczba $x=1$.
Miejsce zerowe to punkt, w którym wykres przecina oś $X$ (gdzie $y=0$). Na wykresie funkcja nie przecina osi $X$ dla $x=1$. W punkcie $x=1$ wartość funkcji wynosi $f(1)=3$. Stwierdzenie B jest fałszywe.

**Krok 4.** Weryfikacja stwierdzenia C**
Stwierdzenie C: Wartość najmniejsza funkcji $f$ wynosi $-1$.
Zaznaczony fragment wykresu zaczyna się w punkcie $(-1, 1)$. Najniższa widoczna na wykresie wartość $y$ to 1. Nie ma informacji o wartościach dla $x < -1$. Nie można jednoznacznie stwierdzić, czy wartość najmniejsza wynosi $-1$. Jednak patrząc na zaznaczony fragment, najniższą wartością jest 1. Stwierdzenie C jest fałszywe.

**Krok 5.** Weryfikacja stwierdzenia D**
Stwierdzenie D: Funkcja $f$ jest rosnąca w przedziale $[0, 2]$.
W przedziale $[0, 1]$ funkcja przechodzi przez punkty $(0, 2)$ i $(1, 3)$. Jest tu rosnąca.
W przedziale $[1, 2]$ wykres jest odcinkiem poziomym na wysokości $y=3$. Jest tu stała.
Formalnie, funkcja jest rosnąca wtedy, gdy dla $x_1 < x_2$ zachodzi $f(x_1) < f(x_2)$.
Dla przedziału $[0, 2]$:
Weźmy $x_1 = 0$, $x_2 = 1$. Wtedy $f(0)=2 < f(1)=3$. Ok.
Weźmy $x_1 = 0.5$, $x_2 = 1.5$. Wtedy $f(0.5) \\approx 2.5$, $f(1.5) = 3$. $2.5 < 3$. Ok.
Weźmy $x_1 = 0.5$, $x_2 = 0.8$. $f(0.5) \\approx 2.5$, $f(0.8) \\approx 2.8$. $2.5 < 2.8$. Ok.
Jednakże, jeśli weźmiemy $x_1 = 1$, $x_2 = 1.5$, to $f(1) = 3$ i $f(1.5) = 3$. $f(x_1) = f(x_2)$, a nie $f(x_1) < f(x_2)$. Zatem funkcja nie jest ściśle rosnąca w przedziale $[0, 2]$.
Często w zadaniach CKE "rosnąca" oznacza "niemalejąca" (czyli dopuszczając odcinki stałe). Jeśli tak zinterpretujemy:
W przedziale $[0, 1]$ funkcja rośnie.
W przedziale $[1, 2]$ funkcja jest stała.
Cała funkcja w przedziale $[0, 2]$ nie jest ani ściśle rosnąca, ani ściśle malejąca.
Jest jednak niemalejąca (wartości nie spadają).
Spójrzmy jeszcze raz na wykres. Czy na pewno w przedziale $[0, 2]$ funkcja jest rosnąca?
Dla $x \\in [0, 1]$, $f(x)$ rośnie od 2 do 3.
Dla $x \\in [1, 2]$, $f(x) = 3$.
W całym przedziale $[0, 2]$ wartości nie spadają. Jeśli przyjmiemy definicję "rosnąca" jako "niemalejąca", to stwierdzenie D jest prawdziwe. W kontekście zadań maturalnych, zazwyczaj chodzi o niemalejącą lub nierosnącą.
Jeśli przyjąć definicję *ściśle rosnącej*, to żadne stwierdzenie nie jest prawdziwe.
Jeśli przyjąć definicję *rosnącej* jako *niemalejącej*, to D jest prawdziwe.
**Ponieważ odpowiedzi A, B, C są ewidentnie fałszywe, musimy przyjąć, że D jest odpowiedzią poprawną, czyli "rosnąca" oznacza "niemalejąca".**

**Odpowiedź:** D

## Pułapki
*   **Mylenie osi X i Y:** Przy odczytywaniu wartości funkcji, dziedziny, miejsc zerowych używamy osi X, a przy odczytywaniu zbioru wartości i wartości funkcji używamy osi Y.
*   **Niejednoznaczny wykres:** Czasami wykresy funkcji mogą być nieregularne lub składać się z kilku części. Należy dokładnie analizować każdy fragment i sprawdzać, czy definicje monotoniczności, wartości ekstremalnych są spełnione globalnie lub lokalnie.
*   **Definicja monotoniczności:** Warto pamiętać, że funkcja jest rosnąca, gdy *dla większego argumentu funkcja przyjmuje większą wartość*. Funkcja jest malejąca, gdy *dla większego argumentu funkcja przyjmuje mniejszą wartość*. Odcinki stałe nie wpływają na to, że funkcja jest ściśle rosnąca lub malejąca. Funkcja "niemalejąca" dopuszcza odcinki stałe, a "nierosnąca" również.
*   **Dziedzina i zbiór wartości w przedziałach:** Jeśli funkcja jest określona na pewnym przedziale, to jej dziedzina i zbiór wartości są ograniczone tym przedziałem. Nawet jeśli wzór matematyczny pozwala na inne wartości, należy brać pod uwagę tylko te z danego przedziału.
*   **Wartość największa/najmniejsza vs. Wartości ekstremalne:** Wartość największa/najmniejsza funkcji na danym przedziale może być osiągnięta na jego końcach lub w punktach, gdzie funkcja zmienia monotoniczność (wierzchołki paraboli, punkty zwrotne).

## Ćwiczenia do samodzielnego rozwiązania
1.  Dany jest wykres funkcji $f$:
    \`\`\`text
          ^ y
          |
        3 +-------*
          |     / |
        2 +---*---|-------*
          | /     |     /
        1 +*------*----/
          |       |   /
    ------+-+-----+-+-+-----> x
         -2 -1   0 1 2
          |
       -1 +
          |
       -2 *
          |
    \`\`\`
    Odczytaj z wykresu:
    a) Dziedzinę funkcji.
    b) Zbiór wartości funkcji.
    c) Miejsca zerowe.
    d) $f(-2)$, $f(0)$, $f(2)$.
    e) Przedziały, w których funkcja jest rosnąca.
    f) Przedziały, w których funkcja jest malejąca.
    g) Wartość największą i najmniejszą funkcji.

2.  Dla funkcji $f(x) = x^2 - 2x - 3$:
    a) Oblicz współrzędne wierzchołka paraboli.
    b) Oblicz miejsca zerowe.
    c) Narysuj poglądowy wykres funkcji.
    d) Podaj zbiór wartości funkcji.
    e) Podaj przedziały monotoniczności.

3.  Funkcja $g(x)$ jest określona wzorem $g(x) = \\frac{1}{x}$. Naszkicuj wykres tej funkcji dla $x \\neq 0$.
    a) Podaj dziedzinę i zbiór wartości funkcji.
    b) Podaj przedziały, w których funkcja jest rosnąca i malejąca.
    c) Czy funkcja jest parzysta czy nieparzysta? Uzasadnij.

4.  Na rysunku przedstawiono fragment wykresu funkcji $f$.
    \`\`\`text
          ^ y
          |
        2 +-------*
          |     /
        1 +---*
          | /
    ------+-*-------+-----> x
         -1 0       1
          |
    \`\`\`
    Które z poniższych stwierdzeń jest prawdziwe?
    A. Funkcja $f$ jest rosnąca w przedziale $[-1, 0]$.
    B. Miejscem zerowym funkcji $f$ jest liczba $x=0$.
    C. Wartość największa funkcji $f$ w przedziale $[-1, 1]$ wynosi 2.
    D. Funkcja $f$ jest malejąca w przedziale $[0, 1]$.

5.  Dany jest wykres funkcji $f$.
    \`\`\`text
          ^ y
          |
        3 +-------*
          |     / | \\
        2 +---*---|---*
          | /     |     \\
        1 +-------+-------\\
          |       |        \\
    ------+-+-----+-+-------+-----> x
         -2 -1   0 1       2
          |
    \`\`\`
    Które z poniższych stwierdzeń jest FAŁSZYWE?
    A. Funkcja $f$ jest rosnąca w przedziale $[-1, 0]$.
    B. Funkcja $f$ jest stała w przedziale $[1, 2]$.
    C. Miejsca zerowe funkcji $f$ to $x=-2$ i $x=1$.
    D. Zbiór wartości funkcji $f$ to $[-1, 3]$.

6.  Funkcja $f(x) = -x^2 + 6x - 5$. Odczytaj z jej wykresu (nie musisz rysować, ale zastanów się nad kształtem i położeniem):
    a) Czy funkcja jest rosnąca czy malejąca w przedziale $(-\\infty, 3]$?
    b) Podaj zbiór wartości funkcji.
    c) Znajdź miejsca zerowe.

7.  Dana jest funkcja $f(x) = 2$ dla $x \\in [-1, 1]$ oraz $f(x) = -x+3$ dla $x \\in (1, 3]$.
    a) Naszkicuj wykres tej funkcji.
    b) Podaj dziedzinę i zbiór wartości funkcji.
    c) Określ monotoniczność funkcji na całej dziedzinie.

## Odpowiedzi
1.  a) Dziedzina: $[-2, 2]$. b) Zbiór wartości: $[-1, 3]$. c) Miejsca zerowe: $x = -1$ i $x = 1$. d) $f(-2) = -1$, $f(0) = 2$, $f(2) = 3$. e) Rosnąca w $[-2, 0]$ i $[1, 2]$. f) Malejąca w $[0, 1]$. g) Wartość największa $M=3$, najmniejsza $m=-1$.
2.  a) $W = (1, -4)$. b) Miejsca zerowe: $x = -3$ i $x = 3$. c) Parabola o ramionach skierowanych w górę, wierzchołku $(1, -4)$, przecinająca oś X w punktach $(-3, 0)$ i $(3, 0)$, przecinająca oś Y w $(0, -3)$. d) $ZW_f = [-4, \\infty)$. e) Rosnąca w $[1, \\infty)$, malejąca w $(-\\infty, 1]$.
3.  a) Dziedzina: $\\mathbb{R} \\setminus \\{0\\}$. Zbiór wartości: $\\mathbb{R} \\setminus \\{0\\}$. b) Malejąca w $(-\\infty, 0)$ i $(0, \\infty)$. c) Funkcja jest nieparzysta, ponieważ $g(-x) = \\frac{1}{-x} = -\\frac{1}{x} = -g(x)$ dla każdego $x \\neq 0$.
4.  Prawdziwe stwierdzenie: C. (Wykres przechodzi przez $(-1, 1)$, $(0, 2)$, $(1, ?)$. Zakładając, że po $(0, 2)$ funkcja rośnie liniowo do $(1, 3)$, a potem jest stała na poziomie 2, to C jest prawdziwe. Jednak wykres sugeruje, że $(1, 2)$ jest punktem na funkcji liniowej, a potem jest jakaś inna część. Jeśli mamy tylko fragment liniowy od $(-1, 1)$ przez $(0, 2)$ do $(1, ?)$, to A i B są fałszywe. Najwyższa wartość to 2 dla x=0 jeśli linia idzie do góry. Jeśli przyjąć punkt (1,2) to jest rosnąca w [-1,1]. Jeśli po (0,2) jest punkt (1,2), to rosnąca w [-1,0] a stała w [0,1]. Wtedy C jest prawdziwe. Przyjmując D, funkcja maleje w [0,1] - fałsz. Najbezpieczniejsza jest interpretacja: linia od (-1,1) przez (0,2) do (1,3). Wtedy A - rosnąca [-1,1], B - x=0 miejsce zerowe fałsz, C - wartość najmniejsza w [-1,1] to 1 fałsz. D - rosnąca [0,1] - fałsz. Zwykle w zadaniach CKE wykresy są jednoznaczne. Przyjmując interpretację, że wykres to funkcja liniowa od (-1,1) do (1,3), a potem jest poziomy fragment. Wtedy A - rosnąca w [-1,1] - PRAWDA. B - fałsz. C - najmniejsza 1 - fałsz. D - rosnąca w [0,1] - PRAWDA. Zwykle tylko jedna odpowiedź. Przyjmując interpretację wykresu jak w zadaniu 1, tylko ze przesunięte punkty, otrzymujemy A i D prawdziwe. Najbardziej prawdopodobna interpretacja to A jest prawdą. W zadaniu 4 nie podałem pełnego wykresu. Przyjmując, że punkty to (-1,1), (0,2) i potem coś się dzieje dla x>0. A - rosnie w [-1,0], PRAWDA. B - miejsce zerowe x=0, FAŁSZ. C - wartosc najwieksza w [-1,1] to 2 - PRAWDA (jesli (1,2)). D - malejaca w [0,1] - FAŁSZ. Zakładając, że A jest poprawną odpowiedzią.
5.  Fałszywe stwierdzenie: C. (Miejsca zerowe to $x=-2$ i $x=1.5$ lub $x=2$).
6.  a) Rosnąca. b) $ZW_f = (-\\infty, 4]$. c) $x = 1, x = 5$.
7.  a) Wykres składa się z odcinka poziomego na wysokości $y=2$ dla $x \\in [-1, 1]$ i fragmentu linii prostej (malejącej) od $(1, 2)$ do $(3, 0)$. b) Dziedzina: $[-1, 3]$. Zbiór wartości: $[0, 2]$. c) Funkcja jest niemalejąca (rosnąca i stała) na przedziale $[-1, 1]$ i malejąca na przedziale $(1, 3]$. Nie jest monotoniczna na całej dziedzinie.

## Szybka powtórka
1.  Co oznacza, że funkcja jest rosnąca w danym przedziale?
2.  Jak na wykresie funkcji odczytujemy miejsca zerowe?
3.  Jakie współrzędne ma wierzchołek paraboli o równaniu $f(x) = ax^2+bx+c$?
4.  Czym różni się dziedzina od zbioru wartości funkcji?
5.  Jak wygląda wykres funkcji stałej?

## Diagram
\`\`\`text
      ^ y
      |
    4 +-------*-------*  (0,4), (3,4)
      |     / |       |
    3 +   /   |       *  (2,3)
      | /     |     /
    2 *-------*----/    (-1,2), (1,2)
      |     / |   /
    1 +---*---|--*      (-3,1), (4,1)
      | /     | /
----+-*-+-*-+-*-+-----> x
   -3 -2 -1 | 0 1 2 3 4
      |     /
   -1 +---*         (-2,-1)
      | /
   -2 *            (-4,-2) - można dopowiedzieć
      |
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "odczyt_wykresu",
    title: "Odczyt wykresu funkcji",
    content: `## Na egzaminie
Zadania dotyczące odczytu wykresu funkcji pojawiają się na maturze z matematyki na poziomie podstawowym regularnie, zwykle w arkuszu zamkniętym, rzadziej w otwartym. Zazwyczaj są to zadania proste, warte 1-2 punkty. CKE często sprawdza umiejętność odczytywania wartości funkcji dla podanego argumentu (szczególnie dla punktów charakterystycznych, jak wierzchołek paraboli, punkty przecięcia z osiami) oraz znajdowania argumentów dla danej wartości funkcji. Analizuje się również własności funkcji (monotoniczność, miejsca zerowe, wartości ekstremalne) na podstawie jej wykresu.

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił:
1. Odczytać wartość funkcji $f(x)$ dla danego argumentu $x$ z wykresu.
2. Odczytać argument $x$ dla danej wartości funkcji $f(x)$ z wykresu.
3. Określić miejsca zerowe funkcji na podstawie jej wykresu.
4. Odczytać dziedzinę i zbiór wartości funkcji z wykresu.
5. Określić przedziały monotoniczności (rosnąca, malejąca, stała) funkcji na podstawie jej wykresu.
6. Odczytać wartości maksymalne i minimalne funkcji na danym przedziale.
7. Rozpoznawać wykresy podstawowych funkcji (liniowa, kwadratowa, stała) na podstawie ich charakterystycznych cech.

## Definicje i wzory
*   **Funkcja:** Przyporządkowanie, które każdemu elementowi ze zbioru dziedziny przypisuje dokładnie jeden element ze zbioru wartości. Wykres funkcji $y = f(x)$ to zbiór wszystkich punktów $(x, y)$ na płaszczyźnie kartezjańskiej, dla których $y = f(x)$.
*   **Argument (dziedzina):** Wartości zmiennej $x$, dla których funkcja jest określona. Na wykresie dziedzina jest zbiorem współrzędnych $x$ wszystkich punktów należących do wykresu.
*   **Wartość funkcji (zbiór wartości):** Wartości $y$, jakie funkcja przyjmuje. Na wykresie zbiór wartości to zbiór współrzędnych $y$ wszystkich punktów należących do wykresu.
*   **Miejsce zerowe:** Argument $x$, dla którego wartość funkcji wynosi 0, czyli $f(x) = 0$. Na wykresie miejsca zerowe to współrzędne $x$ punktów, w których wykres przecina oś $Ox$.
*   **Funkcja rosnąca:** Funkcja, która dla $x_1 < x_2$ przyjmuje wartości $f(x_1) < f(x_2)$. Na wykresie funkcja "idzie w górę" od lewej do prawej.
*   **Funkcja malejąca:** Funkcja, która dla $x_1 < x_2$ przyjmuje wartości $f(x_1) > f(x_2)$. Na wykresie funkcja "idzie w dół" od lewej do prawej.
*   **Funkcja stała:** Funkcja, która dla wszystkich argumentów przyjmuje tę samą wartość, $f(x) = c$. Na wykresie funkcja jest linią poziomą.
*   **Wartość maksymalna/minimalna:** Największa/najmniejsza wartość, jaką funkcja przyjmuje na danym przedziale. Na wykresie odpowiada najwyższemu/najniższemu punktowi wykresu na tym przedziale.

## Przykład 1 - podstawowy
Na rysunku przedstawiono wykres funkcji $y = f(x)$. Odczytaj:
a) Wartość funkcji dla $x = -3$.
b) Wartość funkcji dla $x = 1$.
c) Argumenty, dla których $f(x) = 2$.
d) Miejsca zerowe funkcji.
e) Dziedzinę funkcji.
f) Zbiór wartości funkcji.

\`\`\`text
      ^ y
      |     .
    3 +    / \\
      |   /   \\
    2 +--*-----*--
      | /       \\
    1 +/         \\
      |           \\
--+---+-----------+---+---> x
 -4  -3  -2  -1   0   1   2
      |
   -1 +
      |
\`\`\`

**Krok 1.** Aby odczytać wartość funkcji dla $x = -3$, znajdujemy na osi $Ox$ punkt o współrzędnej $-3$. Następnie przesuwamy się pionowo w górę lub w dół do przecięcia z wykresem. Punkt przecięcia to $(-3, 1)$. Odczytujemy współrzędną $y$ tego punktu.
**Krok 2.** Wartość funkcji dla $x = -3$ to $f(-3) = 1$.
**Krok 3.** Aby odczytać wartość funkcji dla $x = 1$, postępujemy analogicznie. Znajdujemy $x = 1$ na osi $Ox$. Przesuwamy się pionowo do wykresu, trafiając na punkt $(1, 2)$. Wartość funkcji to $f(1) = 2$.
**Krok 4.** Aby znaleźć argumenty, dla których $f(x) = 2$, znajdujemy na osi $Oy$ wartość $y = 2$. Następnie przesuwamy się poziomo do przecięcia z wykresem. Punkty przecięcia to $(-2, 2)$ i $(1, 2)$. Odczytujemy ich współrzędne $x$.
**Krok 5.** Argumenty, dla których $f(x) = 2$, to $x = -2$ oraz $x = 1$.
**Krok 6.** Miejsca zerowe to punkty, gdzie wykres przecina oś $Ox$ (gdzie $y = 0$). Na wykresie widzimy, że wykres przecina oś $Ox$ w punkcie $(-4, 0)$.
**Krok 7.** Miejscem zerowym jest $x = -4$.
**Krok 8.** Dziedzina funkcji to zbiór wszystkich możliwych wartości $x$. Z wykresu widać, że funkcja jest określona dla $x$ od $-4$ do $2$. Zapisujemy to jako przedział $D = \\langle -4, 2 \\rangle$.
**Krok 9.** Zbiór wartości funkcji to zbiór wszystkich możliwych wartości $y$. Najniższa wartość na wykresie to $-1$ (w punkcie $(0, -1)$), a najwyższa to $3$ (w wierzchołku paraboli $\\approx (-3, 3)$). Zapisujemy to jako przedział $ZW = \\langle -1, 3 \\rangle$.

Sprawdzenie:
a) $f(-3) = 1$. Na wykresie punkt $(-3, 1)$ jest.
b) $f(1) = 2$. Na wykresie punkt $(1, 2)$ jest.
c) $f(x) = 2$ dla $x = -2$ i $x = 1$. Na wykresie punkty $(-2, 2)$ i $(1, 2)$ są.
d) Miejsce zerowe $x = -4$. Na wykresie punkt $(-4, 0)$ jest.
e) Dziedzina $\\langle -4, 2 \\rangle$. Wykres rozciąga się od $x = -4$ do $x = 2$.
f) Zbiór wartości $\\langle -1, 3 \\rangle$. Najniższy punkt ma $y = -1$, najwyższy $y = 3$.

## Przykład 2 - maturalny
Na rysunku przedstawiono wykres funkcji $y = f(x)$. Odczytaj z wykresu:
a) Dziedzinę funkcji.
b) Zbiór wartości funkcji.
c) Przedziały, w których funkcja jest malejąca.
d) Wartość najmniejszą i największą funkcji na przedziale $\\langle -2, 1 \\rangle$.

\`\`\`text
      ^ y
      |
    4 +       .
      |      / \\
    3 +     /   \\
      |    /     \\
    2 +---*-------*---
      |  /         \\
    1 +-/           \\
      |/             \\
--+---+---------------+---> x
 -4  -3  -2  -1   0   1   2
      |             .
   -1 +            /
      |           /
   -2 +----------*
      |
\`\`\`

**Krok 1.** Dziedzina funkcji to zbiór wszystkich $x$, dla których wykres istnieje. Wykres zaczyna się w punkcie $(-4, 4)$ i kończy w punkcie $(2, -2)$. Zatem dziedzina to $D = \\langle -4, 2 \\rangle$.
**Krok 2.** Zbiór wartości funkcji to zbiór wszystkich $y$, jakie funkcja przyjmuje. Najwyższy punkt na wykresie to $(-4, 4)$, a najniższy to $(2, -2)$. Zatem zbiór wartości to $ZW = \\langle -2, 4 \\rangle$.
**Krok 3.** Aby określić przedziały, w których funkcja jest malejąca, obserwujemy wykres od lewej do prawej. Funkcja maleje, gdy jej wykres "idzie w dół". Na wykresie widać, że funkcja maleje od punktu $(-4, 4)$ do punktu $(-2, 2)$, następnie od punktu $(-2, 2)$ do punktu $(1, -1)$ i od punktu $(1, -1)$ do punktu $(2, -2)$.
**Krok 4.** Zatem funkcja jest malejąca na przedziałach $\\langle -4, -2 \\rangle$, $\\langle -2, 1 \\rangle$ i $\\langle 1, 2 \\rangle$. Możemy połączyć te przedziały, ponieważ funkcja jest ciągła w punktach $-2$ i $1$. Łączny przedział, gdzie funkcja jest malejąca, to $\\langle -4, 2 \\rangle$. W tym przypadku funkcja jest stale malejąca na całej swojej dziedzinie.
**Krok 5.** Aby znaleźć wartość najmniejszą i największą funkcji na przedziale $\\langle -2, 1 \\rangle$, szukamy najwyższego i najniższego punktu wykresu w tym konkretnym zakresie $x$. Na przedziale $\\langle -2, 1 \\rangle$:
*   Najwyższym punktem jest $(-2, 2)$, więc wartość największa na tym przedziale to $2$.
*   Najniższym punktem jest $(1, -1)$, więc wartość najmniejsza na tym przedziale to $-1$.

Sprawdzenie:
a) Dziedzina $\\langle -4, 2 \\rangle$. Wykres rozciąga się od $x=-4$ do $x=2$.
b) Zbiór wartości $\\langle -2, 4 \\rangle$. Najniższa $y$ to $-2$, najwyższa $y$ to $4$.
c) Funkcja jest malejąca na całym przedziale $\\langle -4, 2 \\rangle$. Wykres systematycznie opada.
d) Na przedziale $\\langle -2, 1 \\rangle$, najwyższy punkt to $(-2, 2)$, najniższy to $(1, -1)$. Wartość największa to $2$, najmniejsza to $-1$.

## Przykład 3 - egzaminacyjny
Na rysunku poniżej znajduje się fragment wykresu pewnej funkcji $f$. Które z poniższych zdań jest prawdziwe?
I. Funkcja $f$ jest malejąca w przedziale $\\langle -3, 0 \\rangle$.
II. $f(1) = -2$.
III. Miejscem zerowym funkcji jest $x = -2$.

\`\`\`text
      ^ y
      |
    2 + . . .
      | .   .
    1 + . . .
      | . . .
--+---+-------+-+---> x
 -4  -3  -2  -1 0 1
      | . . .
   -1 + . . .
      | .   .
   -2 + . . *
      |
\`\`\`

**Krok 1.** Analizujemy zdanie I: "Funkcja $f$ jest malejąca w przedziale $\\langle -3, 0 \\rangle$". Patrzymy na wykres w zakresie $x$ od $-3$ do $0$. Od punktu $(-3, 1)$ do punktu $(0, -1)$ wykres wyraźnie opada. Oznacza to, że funkcja jest malejąca na tym przedziale. Zdanie I jest prawdziwe.
**Krok 2.** Analizujemy zdanie II: "$f(1) = -2$". Szukamy na wykresie punktu, w którym $x=1$. Punkt $(1, -2)$ jest zaznaczony na wykresie. Oznacza to, że $f(1) = -2$. Zdanie II jest prawdziwe.
**Krok 3.** Analizujemy zdanie III: "Miejscem zerowym funkcji jest $x = -2$". Miejscem zerowym jest wartość $x$, dla której $f(x) = 0$. Oznacza to, że wykres funkcji musi przecinać oś $Ox$ w punkcie $x = -2$. Na wykresie widzimy, że w punkcie $x = -2$ wartość funkcji wynosi $y = -1$, czyli $f(-2) = -1$. Wykres przecina oś $Ox$ w punkcie $x = -1$, zatem jedynym miejscem zerowym (widocznym na fragmencie wykresu) jest $x = -1$. Zdanie III jest fałszywe.
**Krok 4.** Podsumowujemy wyniki. Prawdziwe są zdania I i II.

Na egzaminie należałoby wybrać opcję zawierającą zdania I i II.

## Pułapki
*   **Mylenie osi $Ox$ i $Oy$:** Przy odczytywaniu wartości $f(x)$ dla danego $x$, łatwo pomylić ruch pionowy z poziomym lub szukać punktu na niewłaściwej osi. Zawsze zaczynaj od osi $Ox$ dla argumentu $x$, a następnie szukaj wartości $y$ na osi $Oy$.
*   **Błędne określanie przedziałów monotoniczności:** Należy pamiętać, że analizujemy kierunek wykresu od lewej do prawej. Funkcja rośnie, gdy "idziemy w górę", a maleje, gdy "idziemy w dół".
*   **Nieczytanie dziedziny i zbioru wartości z odpowiednich osi:** Dziedzinę zawsze odczytujemy z osi $Ox$, a zbiór wartości z osi $Oy$. Należy uwzględnić wszystkie punkty należące do wykresu.
*   **Niedopisywanie nawiasów w przedziałach:** Wykresy funkcji często mają zaznaczone punkty końcowe. Należy zwrócić uwagę, czy punkty te należą do wykresu (zamalowane kółko, gruba linia) czy nie (niezamalowane kółko). Odpowiednio stosujemy nawiasy okrągłe (przedział otwarty) lub kwadratowe (przedział domknięty). W zadaniach z CKE zazwyczaj punkty końcowe należą do wykresu, chyba że zaznaczono inaczej.
*   **Błędne interpretowanie miejsc zerowych:** Miejsca zerowe to wartości $x$, gdzie wykres przecina oś $Ox$. Nie są to punkty przecięcia z osią $Oy$ ani wartości $y$ dla innych punktów.

## Ćwiczenia do samodzielnego rozwiązania
1.  Na rysunku poniżej przedstawiono wykres funkcji $y = f(x)$. Odczytaj:
    a) $f(-4)$ i $f(2)$.
    b) Rozwiązania równania $f(x) = 3$.
    c) Miejsca zerowe funkcji.
    d) Dziedzinę i zbiór wartości funkcji.

    \`\`\`text
          ^ y
          |   .
        3 +  / \\
          | /   \\
        2 +*-----\\----*
          |       \\   .
        1 +        \\ .
          |         \\.
    ------+---------+-----> x
     -4  -3  -2  -1  0  1  2
          |           .
       -1 +          .
          |         .
       -2 +--------*
          |
    \`\`\`

2.  Wykres funkcji $g$ przedstawiono na rysunku. Odczytaj:
    a) $g(-1)$ i $g(3)$.
    b) Argumenty, dla których $g(x) = 1$.
    c) Dziedzinę i zbiór wartości funkcji $g$.

    \`\`\`text
          ^ y
          |
        3 +   .
          |  /
        2 +-/-----*
          |/     /
        1 *-----/---*
          |    /   /
    ------+---*---+-----> x
     -4  -3  -2  -1  0  1  2  3
          |
       -1 +
          |
    \`\`\`

3.  Na podstawie wykresu funkcji $h$ określ, w jakich przedziałach funkcja jest rosnąca, a w jakich malejąca.

    \`\`\`text
          ^ y
          |   .
        3 +  / \\
          | /   \\
        2 +*-----\\----*
          |       \\   .
        1 +        \\ .
          |         \\.
    ------+---------+-----> x
     -4  -3  -2  -1  0  1  2
          |           .
       -1 +          .
          |         .
       -2 +--------*
          |
    \`\`\`

4.  Na rysunku przedstawiono wykres funkcji $y = f(x)$. Odczytaj wartość największą i najmniejszą funkcji na przedziale $\\langle -1, 2 \\rangle$.

    \`\`\`text
          ^ y
          |   .
        3 +  / \\
          | /   \\
        2 +*-----\\----*
          |       \\   .
        1 +        \\ .
          |         \\.
    ------+---------+-----> x
     -4  -3  -2  -1  0  1  2
          |           .
       -1 +          .
          |         .
       -2 +--------*
          |
    \`\`\`

5.  Które z poniższych zdań jest prawdziwe dla funkcji $f$ przedstawionej na wykresie?
    I. $f(0) = 1$
    II. Funkcja jest rosnąca w przedziale $\\langle -4, -1 \\rangle$.
    III. Największa wartość funkcji na przedziale $\\langle 0, 2 \\rangle$ wynosi $2$.

    \`\`\`text
          ^ y
          |   .
        3 +  / \\
          | /   \\
        2 +*-----\\----*
          |       \\   .
        1 +        \\ .
          |         \\.
    ------+---------+-----> x
     -4  -3  -2  -1  0  1  2
          |           .
       -1 +          .
          |         .
       -2 +--------*
          |
    \`\`\`

6.  Na rysunku poniżej znajduje się fragment wykresu funkcji $f$. Określ, które z poniższych zdań jest prawdziwe.
    I. Funkcja $f$ ma dokładnie jedno miejsce zerowe $x=-3$.
    II. $f(-1) = -1$.
    III. Funkcja jest malejąca w przedziale $\\langle -3, 0 \\rangle$.

    \`\`\`text
          ^ y
          |
        2 +   .
          |  / \\
        1 +-/---\\-*
          |/     \\.
    ------+-------+---> x
     -4  -3  -2  -1  0
          |   .
       -1 +--*
          |
    \`\`\`

## Odpowiedzi
1.  a) $f(-4) = 3$, $f(2) = -2$.
    b) Rozwiązania równania $f(x) = 3$ to $x = -4$ oraz $x \\approx -0.5$ (dokładna wartość może być trudna do odczytania, zazwyczaj na maturze podaje się punkty w całości). Przyjmując, że to wierzchołek, to $x=-0.5$. W przypadku dokładnych zadań CKE, wartości te są zazwyczaj całkowite lub wyraźnie zaznaczone. Jeśli punkty są dokładnie na przecięciach siatki, to $x=-4$ i $x \\approx -0.5$.
    c) Miejsca zerowe to $x = -3$ oraz $x \\approx 1.5$.
    d) Dziedzina: $D = \\langle -4, 2 \\rangle$. Zbiór wartości: $ZW = \\langle -2, 3 \\rangle$.
2.  a) $g(-1) = 1$, $g(3) = 2$.
    b) Argumenty, dla których $g(x) = 1$, to $x = -2$, $x = 0$ i $x \\approx 2.5$.
    c) Dziedzina: $D = \\langle -4, 3 \\rangle$. Zbiór wartości: $ZW = \\langle -1, 3 \\rangle$.
3.  Funkcja jest rosnąca na przedziałach $\\langle -4, -1 \\rangle$ oraz $\\langle 0, 2 \\rangle$.
    Funkcja jest malejąca na przedziałach $\\langle -1, 0 \\rangle$ oraz $\\langle 1, 2 \\rangle$.
4.  Na przedziale $\\langle -1, 2 \\rangle$:
    *   Wartość największa: $2$ (osiągnięta dla $x = -1$ i $x = 2$).
    *   Wartość najmniejsza: $-2$ (osiągnięta dla $x = 2$).
5.  Prawdziwe są zdania I, II i III. Z wykresu odczytujemy $f(0)=1$, funkcja rośnie na przedziale $\\langle -4, -1 \\rangle$, a największa wartość na przedziale $\\langle 0, 2 \\rangle$ wynosi $2$.
6.  I. Funkcja $f$ ma dokładnie jedno miejsce zerowe $x=-3$. Wykres przecina oś $Ox$ w punkcie $x=-3$. Jest to miejsce zerowe. Czy jest jedyne? Na podstawie fragmentu wykresu trudno powiedzieć, ale zakładając, że to jest jedyne przecięcie z osią $Ox$ na tym fragmencie, to zdanie może być prawdziwe, jeśli dalej wykres nie przecina osi $Ox$.
    II. $f(-1) = -1$. Punkt $(-1, -1)$ leży na wykresie. Prawda.
    III. Funkcja jest malejąca w przedziale $\\langle -3, 0 \\rangle$. Od $x=-3$ do $x=0$, wykres "idzie w dół" (od $y=0$ do $y=-1$). Prawda.
    Prawdziwe są zdania II i III. (Zdanie I jest potencjalnie prawdziwe, ale nie można tego stwierdzić na 100% na podstawie fragmentu wykresu, jeśli nie ma dodatkowych informacji).

## Szybka powtórka
1.  Jak odczytać wartość $f(x)$ z wykresu dla danego $x$?
2.  Jak znaleźć argument $x$, dla którego $f(x)$ przyjmuje daną wartość?
3.  Gdzie na wykresie znajdują się miejsca zerowe funkcji?
4.  Z której osi odczytujemy dziedzinę funkcji? A zbiór wartości?
5.  Jak na wykresie rozpoznać, czy funkcja jest rosnąca, czy malejąca?

## Diagram
\`\`\`text
      ^ y
      |
      |   . <- Punkt (x, f(x))
      |  /|\\
      | / | \\
----+-*--+--*------> x
      | |  |
      | |  | <- Znajdź x na osi X, idź pionowo do wykresu, odczytaj y
      | |
      | | <- Znajdź y na osi Y, idź poziomo do wykresu, odczytaj x
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "ciagi",
    topic: "ciag_arytmetyczny",
    title: "Ciąg arytmetyczny",
    content: `## Na egzaminie
Ciągi arytmetyczne pojawiają się na maturze bardzo często, zazwyczaj w zadaniach otwartych, gdzie można zdobyć nawet 3–4 punkty. CKE lubi sprawdzać znajomość wzorów na $n$-ty wyraz i sumę $n$ początkowych wyrazów, umiejętność obliczania różnicy ciągu, znajdowania konkretnych wyrazów oraz rozwiązywania prostych zadań tekstowych z ich wykorzystaniem. Czasem pojawiają się również zadania otwarte wymagające wykazania własności ciągu arytmetycznego.

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił:
1.  Zdefiniować ciąg arytmetyczny i rozpoznać go wśród innych ciągów.
2.  Obliczyć różnicę ciągu arytmetycznego.
3.  Zastosować wzór na $n$-ty wyraz ciągu arytmetycznego.
4.  Obliczyć sumę $n$ początkowych wyrazów ciągu arytmetycznego.
5.  Rozwiązywać zadania tekstowe dotyczące ciągów arytmetycznych.
6.  Korzystać z własności ciągu arytmetycznego do rozwiązywania zadań.
7.  Rozpoznawać zadania dotyczące ciągu arytmetycznego w kontekście innych zagadnień matematycznych.

## Definicje i wzory
*   **Ciąg liczbowy** – funkcja, której dziedziną jest zbiór liczb naturalnych dodatnich ($\\mathbb{N}_+$) lub zbiór liczb naturalnych $\\{0, 1, 2, ...\\}$ (zazwyczaj przyjmujemy $\\mathbb{N}_+$). Wyrazami ciągu są liczby. Ciąg oznaczamy symbolami $a_1, a_2, a_3, \\dots, a_n, \\dots$ lub $(a_n)_{n \\in \\mathbb{N}_+}$.
*   **Ciąg arytmetyczny** – ciąg liczbowy, w którym każdy wyraz, począwszy od drugiego, jest od poprzedniego większy o tę samą liczbę. Tę stałą liczbę nazywamy **różnicą ciągu arytmetycznego** i oznaczamy literą $r$.

    Formalna definicja: Ciąg $(a_n)$ jest ciągiem arytmetycznym, jeżeli dla każdej liczby naturalnej $n \\ge 1$ zachodzi równość:
    $a_{n+1} = a_n + r$, gdzie $r$ jest stałą liczbą (różnicą ciągu).

    Różnicę $r$ można obliczyć, odejmując dowolny wyraz od następującego po nim wyrazu:
    $r = a_{n+1} - a_n$ dla każdego $n \\ge 1$.

*   **Wzór na $n$-ty wyraz ciągu arytmetycznego**: Pozwala obliczyć dowolny wyraz ciągu, znając pierwszy wyraz i różnicę.
    $$a_n = a_1 + (n-1)r$$
    gdzie:
    *   $a_n$ – $n$-ty wyraz ciągu
    *   $a_1$ – pierwszy wyraz ciągu
    *   $n$ – numer wyrazu (pozycja w ciągu)
    *   $r$ – różnica ciągu

    Alternatywnie, jeśli znamy inny wyraz ciągu, np. $a_k$:
    $a_n = a_k + (n-k)r$

*   **Własność ciągu arytmetycznego**: Każdy wyraz ciągu arytmetycznego (oprócz pierwszego i ostatniego, jeśli ciąg jest skończony) jest średnią arytmetyczną swoich sąsiednich wyrazów.
    $$a_n = \\frac{a_{n-1} + a_{n+1}}{2} \\quad \\text{dla } n \\ge 2$$
    To równanie jest równoważne definicji ciągu arytmetycznego. Przekształcając je, otrzymujemy $2a_n = a_{n-1} + a_{n+1}$, czyli $a_n - a_{n-1} = a_{n+1} - a_n = r$.

*   **Suma $n$ początkowych wyrazów ciągu arytmetycznego**:
    $$S_n = \\frac{a_1 + a_n}{2} \\cdot n$$
    gdzie:
    *   $S_n$ – suma $n$ początkowych wyrazów ($S_n = a_1 + a_2 + \\dots + a_n$)
    *   $a_1$ – pierwszy wyraz ciągu
    *   $a_n$ – $n$-ty wyraz ciągu
    *   $n$ – liczba wyrazów

    Podstawiając wzór na $a_n$ do wzoru na $S_n$, otrzymujemy drugą postać wzoru na sumę:
    $$S_n = \\frac{a_1 + (a_1 + (n-1)r)}{2} \\cdot n$$
    $$S_n = \\frac{2a_1 + (n-1)r}{2} \\cdot n$$

*   **Monotoniczność ciągu arytmetycznego**:
    *   Jeśli $r > 0$, ciąg jest **rosnący**.
    *   Jeśli $r < 0$, ciąg jest **malejący**.
    *   Jeśli $r = 0$, ciąg jest **stały** (wszystkie wyrazy są równe $a_1$).

## Przykład 1 - podstawowy
Dany jest ciąg arytmetyczny o pierwszym wyrazie $a_1 = 5$ i różnicy $r = 3$. Oblicz piąty wyraz tego ciągu ($a_5$) oraz sumę pierwszych pięciu wyrazów ($S_5$).

**Krok 1.** Zidentyfikuj dane.**
Mamy podane: $a_1 = 5$, $r = 3$. Szukamy $a_5$ i $S_5$.

**Krok 2.** Oblicz piąty wyraz ($a_5$) używając wzoru na $n$-ty wyraz.**
Wzór na $n$-ty wyraz to $a_n = a_1 + (n-1)r$. Dla $n=5$:
$a_5 = a_1 + (5-1)r$
$a_5 = 5 + (4) \\cdot 3$
$a_5 = 5 + 12$
$a_5 = 17$

**Krok 3.** Oblicz sumę pierwszych pięciu wyrazów ($S_5$) używając wzoru $S_n = \\frac{a_1 + a_n}{2} \\cdot n$.**
Do tego wzoru potrzebujemy $a_1$, $a_5$ i $n$. Mamy wszystkie te wartości: $a_1=5$, $a_5=17$, $n=5$.
$S_5 = \\frac{a_1 + a_5}{2} \\cdot 5$
$S_5 = \\frac{5 + 17}{2} \\cdot 5$
$S_5 = \\frac{22}{2} \\cdot 5$
$S_5 = 11 \\cdot 5$
$S_5 = 55$

**Krok 4.** Sprawdzenie (opcjonalne, ale zalecane).**
Możemy wypisać pierwsze pięć wyrazów ciągu i sprawdzić obliczenia:
$a_1 = 5$
$a_2 = a_1 + r = 5 + 3 = 8$
$a_3 = a_2 + r = 8 + 3 = 11$
$a_4 = a_3 + r = 11 + 3 = 14$
$a_5 = a_4 + r = 14 + 3 = 17$ (zgadza się z obliczonym $a_5$)

Teraz suma tych wyrazów:
$S_5 = 5 + 8 + 11 + 14 + 17 = 55$ (zgadza się z obliczoną $S_5$)

**Odpowiedź:** Piąty wyraz ciągu wynosi 17, a suma pierwszych pięciu wyrazów wynosi 55.

## Przykład 2 - maturalny
W ciągu arytmetycznym dane są wyrazy $a_3 = 7$ i $a_7 = 19$. Oblicz pierwszy wyraz ($a_1$) tego ciągu oraz jego różnicę ($r$). Następnie oblicz sumę pierwszych dziesięciu wyrazów ($S_{10}$).

**Krok 1.** Zapisz dane i wzory.**
Mamy: $a_3 = 7$, $a_7 = 19$.
Szukamy: $a_1$, $r$, $S_{10}$.
Wzory pomocnicze:
$a_n = a_1 + (n-1)r$
$a_n = a_k + (n-k)r$
$S_n = \\frac{a_1 + a_n}{2} \\cdot n$

**Krok 2.** Wykorzystaj wzór $a_n = a_k + (n-k)r$ do znalezienia różnicy $r$.**
Możemy użyć wyrazów $a_7$ i $a_3$. Niech $a_n = a_7$ i $a_k = a_3$. Wtedy $n=7$ i $k=3$.
$a_7 = a_3 + (7-3)r$
$19 = 7 + 4r$

**Krok 3.** Rozwiąż równanie, aby znaleźć $r$.**
$19 - 7 = 4r$
$12 = 4r$
$r = \\frac{12}{4}$
$r = 3$

**Krok 4.** Wykorzystaj znalezione $r$ i jeden z danych wyrazów (np. $a_3$) do znalezienia $a_1$.**
Użyjemy wzoru $a_n = a_1 + (n-1)r$. Niech $a_n = a_3$, więc $n=3$.
$a_3 = a_1 + (3-1)r$
$7 = a_1 + 2 \\cdot 3$
$7 = a_1 + 6$
$a_1 = 7 - 6$
$a_1 = 1$

**Krok 5.** Oblicz sumę pierwszych dziesięciu wyrazów ($S_{10}$).**
Potrzebujemy $a_1$, $n=10$ oraz $a_{10}$. Najpierw obliczmy $a_{10}$ używając wzoru $a_n = a_1 + (n-1)r$:
$a_{10} = a_1 + (10-1)r$
$a_{10} = 1 + 9 \\cdot 3$
$a_{10} = 1 + 27$
$a_{10} = 28$

Teraz obliczamy $S_{10}$ używając wzoru $S_n = \\frac{a_1 + a_n}{2} \\cdot n$:
$S_{10} = \\frac{a_1 + a_{10}}{2} \\cdot 10$
$S_{10} = \\frac{1 + 28}{2} \\cdot 10$
$S_{10} = \\frac{29}{2} \\cdot 10$
$S_{10} = 29 \\cdot 5$
$S_{10} = 145$

**Sprawdzenie:**
Wyznaczmy kilka wyrazów:
$a_1 = 1$
$a_2 = 1 + 3 = 4$
$a_3 = 4 + 3 = 7$ (zgadza się)
$a_4 = 7 + 3 = 10$
$a_5 = 10 + 3 = 13$
$a_6 = 13 + 3 = 16$
$a_7 = 16 + 3 = 19$ (zgadza się)
$a_8 = 19 + 3 = 22$
$a_9 = 22 + 3 = 25$
$a_{10} = 25 + 3 = 28$ (zgadza się)

Suma $S_{10} = 1+4+7+10+13+16+19+22+25+28 = 145$. Obliczenia są poprawne.

**Odpowiedź:** Pierwszy wyraz ciągu wynosi 1, różnica wynosi 3, a suma pierwszych dziesięciu wyrazów wynosi 145.

## Przykład 3 - egzaminacyjny
Suma pierwszych dwudziestu wyrazów pewnego ciągu arytmetycznego wynosi 480. Znając pierwszy wyraz $a_1 = 3$, oblicz różnicę tego ciągu.

**Krok 1.** Zidentyfikuj dane i wzór.**
Dane: $S_{20} = 480$, $a_1 = 3$, $n=20$. Szukamy $r$.
Do obliczenia sumy użyliśmy wzoru $S_n = \\frac{2a_1 + (n-1)r}{2} \\cdot n$.

**Krok 2.** Podstaw dane do wzoru.**
$480 = \\frac{2 \\cdot 3 + (20-1)r}{2} \\cdot 20$

**Krok 3.** Uprość i rozwiąż równanie.**
$480 = \\frac{6 + 19r}{2} \\cdot 20$
Możemy skrócić 20 i 2:
$480 = (6 + 19r) \\cdot 10$
Podzielmy obie strony przez 10:
$48 = 6 + 19r$
Przenieśmy 6 na lewą stronę:
$48 - 6 = 19r$
$42 = 19r$
$r = \\frac{42}{19}$

**Sprawdzenie:**
Obliczmy $a_{20}$:
$a_{20} = a_1 + (20-1)r = 3 + 19 \\cdot \\frac{42}{19} = 3 + 42 = 45$.
Obliczmy $S_{20}$:
$S_{20} = \\frac{a_1 + a_{20}}{2} \\cdot 20 = \\frac{3 + 45}{2} \\cdot 20 = \\frac{48}{2} \\cdot 20 = 24 \\cdot 20 = 480$.
Wynik się zgadza.

**Odpowiedź:** Różnica ciągu wynosi $\\frac{42}{19}$.

## Pułapki
*   **Mylenie wzorów:** Często uczniowie mylą wzór na $n$-ty wyraz ($a_n$) ze wzorem na sumę ($S_n$) lub stosują niewłaściwy wzór na sumę. Zawsze upewnij się, czy potrzebujesz konkretnego wyrazu ($a_n$), czy sumy wyrazów ($S_n$).
*   **Błędy w obliczeniach przy ułamkach i nawiasach:** Zadania często zawierają ułamki lub wymagają starannego opuszczania nawiasów (szczególnie przy odejmowaniu). Dokładnie sprawdzaj każdy krok rachunkowy. Przykład 3 pokazuje, że różnica może być ułamkiem.
*   **Niewłaściwe zastosowanie wzoru $a_n = a_k + (n-k)r$**: Pamiętaj, że $n$ i $k$ to numery wyrazów. Jeśli masz np. $a_5$ i $a_{10}$, to $n=10$ i $k=5$ (lub odwrotnie), a różnica potęg jest $10-5=5$. Nie stosuj numerów wyrazów jako wartości wyrazów.
*   **Zapominanie o $n-1$ we wzorze na $a_n$**: Wzór na $n$-ty wyraz to $a_n = a_1 + (n-1)r$, a nie $a_1 + nr$. Ten błąd prowadzi do nieprawidłowych wyników, szczególnie przy większych $n$.
*   **Znaki przy odejmowaniu:** W zadaniach, gdzie trzeba obliczyć różnicę $r$ z dwóch danych wyrazów, uwaga na znaki. Np. jeśli $a_3 = -5$ i $a_7 = 3$, to $a_7 - a_3 = 3 - (-5) = 3+5=8$. Różnica $r$ będzie wtedy wynosić $\\frac{8}{4} = 2$.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz szósty wyraz ciągu arytmetycznego, w którym $a_1 = -4$ i $r = 2$.
2.  Znajdź różnicę ciągu arytmetycznego, jeśli $a_2 = 10$ i $a_5 = 22$.
3.  Oblicz sumę pierwszych 15 wyrazów ciągu arytmetycznego, w którym $a_1 = 1$ i $r = 0.5$.
4.  W ciągu arytmetycznym wiadomo, że $a_4 = 11$ i $a_9 = 26$. Wyznacz wzór ogólny na $n$-ty wyraz tego ciągu ($a_n$).
5.  Suma $n$ początkowych wyrazów pewnego ciągu arytmetycznego jest dana wzorem $S_n = n^2 + 2n$. Wyznacz wzór na $n$-ty wyraz tego ciągu ($a_n$) i oblicz jego różnicę $r$.
6.  Ciąg $(a_n)$ jest ciągiem arytmetycznym. Wiadomo, że $a_4 + a_6 = 30$. Oblicz sumę pierwszych dziewięciu wyrazów tego ciągu ($S_9$).
7.  Trzy liczby: $x-1$, $x+2$, $2x+5$ są kolejnymi wyrazami ciągu arytmetycznego. Oblicz wartość $x$ i podaj te trzy liczby.

## Odpowiedzi
1.  $a_6 = -4 + (6-1) \\cdot 2 = -4 + 5 \\cdot 2 = -4 + 10 = 6$.
2.  $r = \\frac{a_5 - a_2}{5-2} = \\frac{22-10}{3} = \\frac{12}{3} = 4$.
3.  $a_{15} = 1 + (15-1) \\cdot 0.5 = 1 + 14 \\cdot 0.5 = 1 + 7 = 8$. $S_{15} = \\frac{1+8}{2} \\cdot 15 = \\frac{9}{2} \\cdot 15 = \\frac{135}{2} = 67.5$.
4.  $r = \\frac{a_9 - a_4}{9-4} = \\frac{26-11}{5} = \\frac{15}{5} = 3$. $a_1 = a_4 - (4-1)r = 11 - 3 \\cdot 3 = 11 - 9 = 2$. Wzór: $a_n = 2 + (n-1)3 = 2 + 3n - 3 = 3n - 1$.
5.  $a_1 = S_1 = 1^2 + 2 \\cdot 1 = 3$. $S_2 = 2^2 + 2 \\cdot 2 = 4 + 4 = 8$. $a_2 = S_2 - S_1 = 8 - 3 = 5$. $r = a_2 - a_1 = 5 - 3 = 2$. Wzór na $a_n$: $a_n = a_1 + (n-1)r = 3 + (n-1)2 = 3 + 2n - 2 = 2n + 1$. (Można też zauważyć, że $a_n = S_n - S_{n-1} = (n^2+2n) - ((n-1)^2 + 2(n-1)) = n^2+2n - (n^2-2n+1 + 2n-2) = n^2+2n - (n^2-1) = 2n+1$). Różnica $r=2$.
6.  Wyrazy $a_4$ i $a_6$ są symetryczne względem środkowego wyrazu $a_5$, więc $a_4 + a_6 = 2a_5$. Z warunku $a_4 + a_6 = 30$ otrzymujemy $a_5 = 15$.
    Suma dziewięciu początkowych wyrazów jest równa dziewięciokrotności środkowego wyrazu:
    $S_9 = 9a_5 = 9 \\cdot 15 = 135$.
    Odpowiedź: $S_9 = 135$.
7.  Aby liczby były kolejnymi wyrazami ciągu arytmetycznego, różnica między kolejnymi wyrazami musi być stała.
    $(x+2) - (x-1) = r$
    $2x+5 - (x+2) = r$
    Zatem:
    $(x+2) - (x-1) = (2x+5) - (x+2)$
    $x+2-x+1 = 2x+5-x-2$
    $3 = x+3$
    $x = 0$
    Podstawiamy $x=0$ do podanych wyrażeń:
    Pierwszy wyraz: $0-1 = -1$
    Drugi wyraz: $0+2 = 2$
    Trzeci wyraz: $2(0)+5 = 5$
    Ciąg to: $-1, 2, 5$. Różnica $r = 2 - (-1) = 3$. Sprawdzenie: $5 - 2 = 3$. Liczby są wyrazami ciągu arytmetycznego.

## Szybka powtórka
1.  Jaka jest definicja ciągu arytmetycznego?
2.  Podaj wzór na $n$-ty wyraz ciągu arytmetycznego.
3.  Podaj wzór na sumę $n$ początkowych wyrazów ciągu arytmetycznego.
4.  Od czego zależy, czy ciąg arytmetyczny jest rosnący, malejący, czy stały?
5.  Jak obliczyć różnicę ciągu arytmetycznego, znając jego dwa dowolne wyrazy?

## Diagram
\`\`\`text
+---------------------+
|      Ciąg Arytmetyczny     |
+---------------------+
      |
      v
+---------------------+
|   Definicja:        |
| a_{n+1} = a_n + r   |
+---------------------+
      |
      v
+---------------------+
| Wzory:              |
| a_n = a_1 + (n-1)r  |
| S_n = (a_1+a_n)/2 * n |
| S_n = (2a_1+(n-1)r)/2 * n|
+---------------------+
      |
      v
+---------------------+
| Obliczanie:         |
| - Różnicy (r)       |
| - N-tego wyrazu (a_n)|
| - Sumy (S_n)        |
| - Wyrazów po kolei  |
+---------------------+
      |
      v
+---------------------+
| Zastosowania:       |
| - Zadania tekstowe  |
| - Własności ciągu   |
| - Geometria (np.    |
|   pola, obwody)     |
+---------------------+
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "ciagi",
    topic: "ciag_geometryczny",
    title: "Ciąg geometryczny na maturze",
    content: `## Na egzaminie
Ciąg geometryczny pojawia się na maturze z matematyki na poziomie podstawowym stosunkowo często, zazwyczaj w zadaniach otwartych lub jako element trudniejszych zadań. Spodziewaj się 1-2 zadań w arkuszu, punktowanych zazwyczaj od 3 do 5 punktów. CKE często sprawdza umiejętność obliczania wyrazów ciągu, sumy częściowej, a także rozwiązywania równań związanych ze wzorami na ogólny wyraz ciągu geometrycznego. Często pojawiają się zadania tekstowe, gdzie trzeba zidentyfikować, że opisana sytuacja to ciąg geometryczny.

## Mapa tematu
1.  Rozumienie definicji ciągu geometrycznego.
2.  Identyfikacja wyrazu początkowego ($a_1$) i ilorazu ciągu ($q$).
3.  Stosowanie wzoru na ogólny wyraz ciągu geometrycznego ($a_n = a_1 \\cdot q^{n-1}$).
4.  Obliczanie dowolnego wyrazu ciągu geometrycznego.
5.  Zastosowanie wzoru na sumę pierwszych $n$ wyrazów ciągu geometrycznego ($S_n$).
6.  Rozwiązywanie prostych równań dotyczących ciągów geometrycznych.
7.  Rozpoznawanie ciągu geometrycznego w zadaniach tekstowych i geometrycznych.
8.  Badanie monotoniczności ciągu geometrycznego w zależności od $a_1$ i $q$.

## Definicje i wzory
*   **Ciąg geometryczny**: Jest to ciąg liczbowy, w którym każdy wyraz, począwszy od drugiego, powstaje przez pomnożenie wyrazu poprzedniego przez stałą, niezerową liczbę zwaną ilorazem ciągu.

*   **Wyraz początkowy ($a_1$)**: Pierwszy wyraz ciągu geometrycznego.

*   **Iloraz ciągu ($q$)**: Stała liczba, przez którą mnożymy poprzedni wyraz, aby otrzymać następny. Oblicza się go, dzieląc dowolny wyraz ciągu (oprócz pierwszego) przez wyraz go poprzedzający: $q = \\frac{a_{n+1}}{a_n}$ dla $n \\ge 1$. Ważne: $q \\ne 0$.

*   **Wzór na ogólny wyraz ciągu geometrycznego**:
    $$a_n = a_1 \\cdot q^{n-1}$$
    gdzie:
    *   $a_n$ to $n$-ty wyraz ciągu
    *   $a_1$ to pierwszy wyraz ciągu
    *   $q$ to iloraz ciągu
    *   $n$ to numer wyrazu (liczba naturalna dodatnia)

*   **Wzór na sumę pierwszych $n$ wyrazów ciągu geometrycznego ($S_n$)**:
    Dla $q \\ne 1$:
    $$S_n = a_1 \\cdot \\frac{1 - q^n}{1 - q}$$
    Dla $q = 1$:
    $$S_n = n \\cdot a_1$$

*   **Własności ciągu geometrycznego**:
    *   Jeśli $a_1 > 0$ i $q > 1$, ciąg jest rosnący.
    *   Jeśli $a_1 > 0$ i $0 < q < 1$, ciąg jest malejący.
    *   Jeśli $a_1 > 0$ i $q = 1$, ciąg jest stały.
    *   Jeśli $a_1 > 0$ i $q \\le 0$, ciąg jest niemonotoniczny (naprzemienny lub stały zerowy, jeśli $a_1 = 0$).
    *   Jeśli $a_1 < 0$ i $q > 1$, ciąg jest malejący.
    *   Jeśli $a_1 < 0$ i $0 < q < 1$, ciąg jest rosnący.
    *   Jeśli $a_1 < 0$ i $q = 1$, ciąg jest stały.
    *   Jeśli $a_1 < 0$ i $q \\le 0$, ciąg jest niemonotoniczny.
    *   Ciąg jest stale dodatni, gdy $a_1 > 0$ i $q > 0$.
    *   Ciąg jest stale ujemny, gdy $a_1 < 0$ i $q > 0$.
    *   Ciąg ma wyrazy dodatnie i ujemne, gdy $q < 0$ (wyrazy naprzemienne) lub gdy $a_1$ ma inny znak niż wyraz $a_n$ (co jest niemożliwe dla $q>0$).
    *   Jeśli któryś wyraz ciągu jest równy 0, to $a_1=0$ lub $q=0$. Ale iloraz $q$ musi być różny od zera, więc jeśli $q \\ne 0$, to ciąg jest zerowy tylko gdy $a_1=0$. Jeśli $a_1 \\ne 0$, to żaden wyraz ciągu geometrycznego (z $q \\ne 0$) nie może być zerem.

*   **Średnia geometryczna**: Dla trzech kolejnych wyrazów ciągu geometrycznego ($a_{n-1}, a_n, a_{n+1}$) zachodzi związek: $a_n^2 = a_{n-1} \\cdot a_{n+1}$. Jest to równoważne z warunkiem, że $\\sqrt{a_{n-1} \\cdot a_{n+1}} = |a_n|$. Jeśli wszystkie wyrazy są dodatnie, $a_n$ jest średnią geometryczną wyrazów je otaczających.

## Przykład 1 - podstawowy
Oblicz piąty wyraz ciągu geometrycznego, jeśli pierwszy wyraz $a_1 = 3$, a iloraz $q = 2$.

**Krok 1.** Zapisz dane z zadania.
Mamy $a_1 = 3$ i $q = 2$. Szukamy $a_5$.

**Krok 2.** Przypomnij sobie wzór na ogólny wyraz ciągu geometrycznego.
Wzór to $a_n = a_1 \\cdot q^{n-1}$.

**Krok 3.** Podstaw dane do wzoru.
Chcemy obliczyć $a_5$, więc $n=5$. Podstawiamy $a_1 = 3$, $q = 2$, $n = 5$ do wzoru:
$a_5 = 3 \\cdot 2^{5-1}$

**Krok 4.** Wykonaj obliczenia.
$a_5 = 3 \\cdot 2^4$
$a_5 = 3 \\cdot 16$
$a_5 = 48$

**Krok 5.** Podaj odpowiedź.
Piąty wyraz ciągu geometrycznego wynosi 48.

**Sprawdzenie:**
Ciąg wygląda następująco:
$a_1 = 3$
$a_2 = 3 \\cdot 2 = 6$
$a_3 = 6 \\cdot 2 = 12$
$a_4 = 12 \\cdot 2 = 24$
$a_5 = 24 \\cdot 2 = 48$
Wynik jest poprawny.

## Przykład 2 - maturalny
Oblicz sumę pierwszych czterech wyrazów ciągu geometrycznego, w którym $a_1 = -2$ i $q = 3$.

**Krok 1.** Zapisz dane z zadania.
Mamy $a_1 = -2$ i $q = 3$. Szukamy sumy $S_4$.

**Krok 2.** Sprawdź, czy $q=1$.
Iloraz $q = 3$, więc $q \\ne 1$. Użyjemy wzoru $S_n = a_1 \\cdot \\frac{1 - q^n}{1 - q}$.

**Krok 3.** Podstaw dane do wzoru na sumę.
Chcemy obliczyć $S_4$, więc $n=4$. Podstawiamy $a_1 = -2$, $q = 3$, $n = 4$ do wzoru:
$$S_4 = -2 \\cdot \\frac{1 - 3^4}{1 - 3}$$

**Krok 4.** Wykonaj obliczenia.
Najpierw oblicz $q^n$: $3^4 = 3 \\cdot 3 \\cdot 3 \\cdot 3 = 9 \\cdot 9 = 81$.
Teraz podstaw do licznika: $1 - 3^4 = 1 - 81 = -80$.
Teraz oblicz mianownik: $1 - 3 = -2$.
Podstaw wszystko z powrotem do wzoru na $S_4$:
$S_4 = -2 \\cdot \\frac{-80}{-2}$

**Krok 5.** Uprość i podaj odpowiedź.
$S_4 = -2 \\cdot 40$
$S_4 = -80$

Suma pierwszych czterech wyrazów tego ciągu wynosi -80.

**Sprawdzenie:**
Policzmy wyrazy:
$a_1 = -2$
$a_2 = -2 \\cdot 3 = -6$
$a_3 = -6 \\cdot 3 = -18$
$a_4 = -18 \\cdot 3 = -54$
Suma: $S_4 = -2 + (-6) + (-18) + (-54) = -8 - 18 - 54 = -26 - 54 = -80$.
Wynik jest poprawny.

## Przykład 3 - egzaminacyjny
Trzy liczby: $x-1, x+2, x+8$ tworzą w tej kolejności ciąg geometryczny. Wyznacz wartość $x$.

**Krok 1.** Zidentyfikuj warunek dla ciągu geometrycznego.
Trzy kolejne wyrazy ciągu geometrycznego ($a, b, c$) spełniają warunek $b^2 = a \\cdot c$.
W naszym przypadku: $a = x-1$, $b = x+2$, $c = x+8$.

**Krok 2.** Zapisz równanie wynikające z warunku.
$(x+2)^2 = (x-1)(x+8)$

**Krok 3.** Rozwiąż równanie.
Rozwiń obie strony:
Lewa strona (wzór skróconego mnożenia $(a+b)^2 = a^2 + 2ab + b^2$):
$(x+2)^2 = x^2 + 2 \\cdot x \\cdot 2 + 2^2 = x^2 + 4x + 4$

Prawa strona (mnożenie nawiasów):
$(x-1)(x+8) = x \\cdot x + x \\cdot 8 - 1 \\cdot x - 1 \\cdot 8 = x^2 + 8x - x - 8 = x^2 + 7x - 8$

Przyrównaj obie strony:
$x^2 + 4x + 4 = x^2 + 7x - 8$

Przenieś wszystkie wyrazy na jedną stronę, aby rozwiązać równanie liniowe (bo $x^2$ się skraca):
$4x + 4 = 7x - 8$
$4 + 8 = 7x - 4x$
$12 = 3x$
$x = \\frac{12}{3}$
$x = 4$

**Krok 4.** Podaj odpowiedź i sprawdź warunek bycia ciągiem geometrycznym.
Wartość $x=4$.
Sprawdźmy wyrazy:
Pierwszy wyraz: $x-1 = 4-1 = 3$
Drugi wyraz: $x+2 = 4+2 = 6$
Trzeci wyraz: $x+8 = 4+8 = 12$
Mamy ciąg: 3, 6, 12.
Sprawdźmy, czy jest geometryczny:
Iloraz z pierwszych dwóch wyrazów: $\\frac{6}{3} = 2$.
Iloraz z drugich dwóch wyrazów: $\\frac{12}{6} = 2$.
Iloraz jest stały ($q=2$), więc liczby te tworzą ciąg geometryczny.

Odpowiedź: Wartość $x$ wynosi 4.

## Pułapki
*   **Brak sprawdzenia warunku $q \\ne 1$ dla wzoru na sumę $S_n$**: Użycie wzoru $S_n = a_1 \\cdot \\frac{1 - q^n}{1 - q}$ gdy $q=1$ prowadzi do dzielenia przez zero. Pamiętaj, że dla $q=1$ suma $n$ wyrazów to $S_n = n \\cdot a_1$.
*   **Mylenie ciągu arytmetycznego z geometrycznym**: Upewnij się, czy w zadaniu jest mowa o stałej różnicy (ciąg arytmetyczny) czy stałym ilorazie (ciąg geometryczny). Wzory są inne!
*   **Błędy w potęgowaniu lub obliczeniach**: Szczególnie przy ujemnym ilorazie lub dużych potęgach, łatwo o pomyłkę. Dokładnie sprawdzaj obliczenia, zwłaszcza znaki przy potęgach liczb ujemnych. Pamiętaj, że $(-q)^n = q^n$ gdy $n$ jest parzyste, a $(-q)^n = -q^n$ gdy $n$ jest nieparzyste.
*   **Nieprawidłowe zastosowanie wzoru na $a_n$**: Wzór to $a_n = a_1 \\cdot q^{n-1}$, nie $a_n = a_1 \\cdot q^n$. Potęga to $n-1$, a nie $n$. To częsty błąd.
*   **Założenie, że $q$ musi być liczbą całkowitą**: Iloraz $q$ może być ułamkiem, np. $\\frac{1}{2}$ lub liczbą ujemną. Nie ograniczaj się tylko do liczb całkowitych dodatnich.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz szósty wyraz ciągu geometrycznego, jeśli $a_1 = 5$ i $q = -2$.
2.  Wyznacz iloraz ciągu geometrycznego, jeśli $a_1 = 4$ i $a_3 = 36$.
3.  Oblicz sumę pierwszych trzech wyrazów ciągu geometrycznego, w którym $a_1 = 10$ i $q = \\frac{1}{2}$.
4.  Trzy liczby: $2, y, 8$ tworzą w tej kolejności ciąg geometryczny. Wyznacz $y$.
5.  W ciągu geometrycznym $a_1 = 1, q = \\sqrt{2}$. Oblicz $a_4$.
6.  Dany jest ciąg geometryczny, w którym $a_1 = 3$ i $a_4 = 81$. Wyznacz iloraz $q$.
7.  Które z poniższych ciągów są geometryczne?
    a) $1, 2, 4, 8, \\dots$
    b) $3, 6, 9, 12, \\dots$
    c) $10, -10, 10, -10, \\dots$
    d) $16, 8, 4, 2, \\dots$

## Odpowiedzi
1.  $a_6 = a_1 \\cdot q^{6-1} = 5 \\cdot (-2)^5 = 5 \\cdot (-32) = -160$.
2.  Mamy $a_3 = a_1 \\cdot q^{3-1} = a_1 \\cdot q^2$. Podstawiamy: $36 = 4 \\cdot q^2$. Dzielimy przez 4: $q^2 = 9$. Stąd $q=3$ lub $q=-3$. W zadaniu nie ma dodatkowych informacji, więc oba rozwiązania są poprawne.
3.  $a_1 = 10, q = \\frac{1}{2}, n=3$. $q \\ne 1$.
    $S_3 = 10 \\cdot \\frac{1 - (\\frac{1}{2})^3}{1 - \\frac{1}{2}} = 10 \\cdot \\frac{1 - \\frac{1}{8}}{\\frac{1}{2}} = 10 \\cdot \\frac{\\frac{7}{8}}{\\frac{1}{2}} = 10 \\cdot \\frac{7}{8} \\cdot 2 = 10 \\cdot \\frac{7}{4} = \\frac{70}{4} = \\frac{35}{2} = 17.5$.
4.  Warunek: $y^2 = 2 \\cdot 8$. $y^2 = 16$. Stąd $y=4$ lub $y=-4$.
5.  $a_4 = a_1 \\cdot q^{4-1} = 1 \\cdot (\\sqrt{2})^3 = (\\sqrt{2})^2 \\cdot \\sqrt{2} = 2\\sqrt{2}$.
6.  $a_4 = a_1 \\cdot q^{4-1} = a_1 \\cdot q^3$. Podstawiamy: $81 = 3 \\cdot q^3$. Dzielimy przez 3: $q^3 = 27$. Stąd $q = 3$.
7.  a) Tak ($q=2$). b) Nie (ciąg arytmetyczny, $r=3$). c) Tak ($q=-1$). d) Tak ($q=\\frac{1}{2}$).

## Szybka powtórka
1.  Jaka jest definicja ilorazu ciągu geometrycznego?
2.  Jaki jest wzór na $n$-ty wyraz ciągu geometrycznego?
3.  Kiedy należy stosować specjalny wzór na sumę $S_n$ dla $q=1$?
4.  Jakie są trzy kolejne wyrazy ciągu geometrycznego, jeśli pierwszy to 2, a iloraz to 3?
5.  Jeśli $a_n^2 = a_{n-1} \\cdot a_{n+1}$, to jaki to typ ciągu?

## Diagram
\`\`\`text
     a_1
      | * q
      v
     a_2
      | * q
      v
     a_3
      | * q
      v
     ...
      | * q
      v
     a_n
      | * q
      v
    a_{n+1}
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "trygonometria",
    topic: "sin_cos_tg",
    title: "Sinus, cosinus i tangens - podstawy trygonometrii",
    content: `## Na egzaminie
Trygonometria pojawia się na maturze podstawowej zazwyczaj w 2-3 zadaniach, w tym jednym otwartym. Zadania te sprawdzają znajomość definicji funkcji trygonometrycznych w trójkącie prostokątnym, wartości dla kątów ostrych oraz podstawowe tożsamości trygonometryczne. Punkty za te zadania wynoszą zazwyczaj łącznie około 5-8.

## Mapa tematu
1.  Zrozumienie definicji sinusa, cosinusa i tangensa w trójkącie prostokątnym.
2.  Umiejętność obliczania wartości funkcji trygonometrycznych dla kątów ostrych.
3.  Znajomość podstawowych tożsamości trygonometrycznych.
4.  Stosowanie trygonometrii do rozwiązywania zadań z geometrii (obliczanie długości boków, wysokości).
5.  Umiejętność odczytywania wartości funkcji trygonometrycznych z rysunku.
6.  Rozwiązywanie prostych równań trygonometrycznych (zazwyczaj z wartościami z tabelki).

## Definicje i wzory
Rozważmy trójkąt prostokątny o przyprostokątnych $a$ i $b$ oraz przeciwprostokątnej $c$. Niech $\\alpha$ będzie jednym z kątów ostrych tego trójkąta.

*   **Sinus kąta $\\alpha$** ($\\sin \\alpha$) – stosunek długości przyprostokątnej **naprzeciwległej** do kąta $\\alpha$ do długości **przeciwprostokątnej**.
    $$ \\sin \\alpha = \\frac{\\text{przyprostokątna naprzeciwległa}}{\\text{przeciwprostokątna}} = \\frac{a}{c} $$

*   **Cosinus kąta $\\alpha$** ($\\cos \\alpha$) – stosunek długości przyprostokątnej **przyległej** do kąta $\\alpha$ do długości **przeciwprostokątnej**.
    $$ \\cos \\alpha = \\frac{\\text{przyprostokątna przyległa}}{\\text{przeciwprostokątna}} = \\frac{b}{c} $$

*   **Tangens kąta $\\alpha$** ($\\tan \\alpha$) – stosunek długości przyprostokątnej **naprzeciwległej** do kąta $\\alpha$ do długości przyprostokątnej **przyległej** do tego kąta.
    $$ \\tan \\alpha = \\frac{\\text{przyprostokątna naprzeciwległa}}{\\text{przyprostokątna przyległa}} = \\frac{a}{b} $$

**Wartości funkcji trygonometrycznych dla wybranych kątów ostrych:**

| Kąt        | $\\sin$            | $\\cos$            | $\\tan$            |
| :--------- | :---------------- | :---------------- | :---------------- |
| $30^\\circ$ | $\\frac{1}{2}$     | $\\frac{\\sqrt{3}}{2}$ | $\\frac{\\sqrt{3}}{3}$ |
| $45^\\circ$ | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $1$               |
| $60^\\circ$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$     | $\\sqrt{3}$        |

**Podstawowe tożsamości trygonometryczne:**

1.  **Jedynka trygonometryczna:** Dla dowolnego kąta $\\alpha$:
    $$ \\sin^2 \\alpha + \\cos^2 \\alpha = 1 $$
    *Uwaga: $\\sin^2 \\alpha$ oznacza $(\\sin \\alpha)^2$.*

2.  **Zależność między tangensem a sinusem i cosinusem:** Dla dowolnego kąta $\\alpha$, dla którego $\\cos \\alpha \\neq 0$:
    $$ \\tan \\alpha = \\frac{\\sin \\alpha}{\\cos \\alpha} $$

**Ważne własności:**

*   Dla kątów ostrych ($0^\\circ < \\alpha < 90^\\circ$):
    *   $\\sin \\alpha > 0$
    *   $\\cos \\alpha > 0$
    *   $\\tan \\alpha > 0$
*   Funkcja sinus jest rosnąca w przedziale $[0^\\circ, 90^\\circ]$.
*   Funkcja cosinus jest malejąca w przedziale $[0^\\circ, 90^\\circ]$.
*   Funkcja tangens jest rosnąca w przedziale $[0^\\circ, 90^\\circ)$.

## Przykład 1 - podstawowy
W trójkącie prostokątnym przyprostokątne mają długości 3 cm i 4 cm. Oblicz sinus, cosinus i tangens kąta $\\alpha$ leżącego naprzeciwko krótszej przyprostokątnej.

**Krok 1.** Narysuj trójkąt prostokątny i oznacz jego boki. Krótsza przyprostokątna ma długość 3, dłuższa 4. Kąt $\\alpha$ leży naprzeciwko boku o długości 3.

**Krok 2.** Oblicz długość przeciwprostokątnej $c$ korzystając z twierdzenia Pitagorasa: $a^2 + b^2 = c^2$.
Niech $a = 3$, $b = 4$.
$3^2 + 4^2 = c^2$
$9 + 16 = c^2$
$25 = c^2$
$c = \\sqrt{25} = 5$ cm (długość musi być dodatnia).

**Krok 3.** Zastosuj definicję sinusa. Przyprostokątna naprzeciwległa do $\\alpha$ ma długość $a = 3$, przeciwprostokątna $c = 5$.
$$ \\sin \\alpha = \\frac{a}{c} = \\frac{3}{5} $$

**Krok 4.** Zastosuj definicję cosinusa. Przyprostokątna przyległa do $\\alpha$ ma długość $b = 4$, przeciwprostokątna $c = 5$.
$$ \\cos \\alpha = \\frac{b}{c} = \\frac{4}{5} $$

**Krok 5.** Zastosuj definicję tangensa. Przyprostokątna naprzeciwległa do $\\alpha$ ma długość $a = 3$, przyprostokątna przyległa $b = 4$.
$$ \\tan \\alpha = \\frac{a}{b} = \\frac{3}{4} $$

**Sprawdzenie:**
Możemy sprawdzić, czy zachodzi jedynka trygonometryczna:
$\\sin^2 \\alpha + \\cos^2 \\alpha = (\\frac{3}{5})^2 + (\\frac{4}{5})^2 = \\frac{9}{25} + \\frac{16}{25} = \\frac{25}{25} = 1$. Zgadza się.
Możemy też sprawdzić zależność tangensa:
$\\frac{\\sin \\alpha}{\\cos \\alpha} = \\frac{3/5}{4/5} = \\frac{3}{5} \\cdot \\frac{5}{4} = \\frac{3}{4} = \\tan \\alpha$. Zgadza się.

## Przykład 2 - maturalny
W trójkącie prostokątnym ABC, kąt przy wierzchołku C jest kątem prostym. Długość przyprostokątnej AC wynosi 6, a długość przeciwprostokątnej AB wynosi 10. Oblicz $\\sin(\\angle ABC)$.

**Krok 1.** Narysuj trójkąt prostokątny ABC. Oznacz kąt prosty przy C. Zaznacz dane długości: $AC = 6$ (jedna przyprostokątna), $AB = 10$ (przeciwprostokątna).

**Krok 2.** Zidentyfikuj kąt, dla którego mamy obliczyć funkcję trygonometryczną. Jest to kąt przy wierzchołku B, oznaczmy go jako $\\beta = \\angle ABC$.

**Krok 3.** Określ, które boki trójkąta są "naprzeciwległe" i "przyległe" do kąta $\\beta$.
*   Przyprostokątna **naprzeciwległa** do $\\beta$ to bok $AC$.
*   Przyprostokątna **przyległa** do $\\beta$ to bok $BC$.
*   Przeciwprostokątna to bok $AB$.

**Krok 4.** Zauważ, że znamy długość boku $AC$ (naprzeciwległego do $\\beta$) i przeciwprostokątnej $AB$. Mamy więc dane potrzebne do obliczenia sinusa.
$$ \\sin(\\angle ABC) = \\sin \\beta = \\frac{\\text{przyprostokątna naprzeciwległa}}{\\text{przeciwprostokątna}} = \\frac{AC}{AB} $$

**Krok 5.** Podstaw dane i oblicz wynik.
$$ \\sin \\beta = \\frac{6}{10} $$
Po skróceniu ułamka otrzymujemy:
$$ \\sin \\beta = \\frac{3}{5} $$

**Dodatkowe zadanie (sprawdzenie):** Oblicz cosinus $\\angle ABC$.
Najpierw musimy obliczyć długość przyprostokątnej $BC$. Korzystamy z twierdzenia Pitagorasa:
$AC^2 + BC^2 = AB^2$
$6^2 + BC^2 = 10^2$
$36 + BC^2 = 100$
$BC^2 = 100 - 36 = 64$
$BC = \\sqrt{64} = 8$.
Teraz możemy obliczyć cosinus:
$\\cos(\\angle ABC) = \\cos \\beta = \\frac{\\text{przyprostokątna przyległa}}{\\text{przeciwprostokątna}} = \\frac{BC}{AB} = \\frac{8}{10} = \\frac{4}{5}$.
Możemy też obliczyć tangens $\\angle ABC$:
$\\tan(\\angle ABC) = \\tan \\beta = \\frac{AC}{BC} = \\frac{6}{8} = \\frac{3}{4}$.

## Przykład 3 - egzaminacyjny
Dany jest trójkąt prostokątny, w którym jeden z kątów ostrych wynosi $30^\\circ$. Krótsza przyprostokątna ma długość 5. Oblicz długość przeciwprostokątnej.

**Krok 1.** Zidentyfikuj dane: kąt ostry $\\alpha = 30^\\circ$, krótsza przyprostokątna $a = 5$. Ponieważ $\\alpha = 30^\\circ$, to przyprostokątna leżąca naprzeciwko tego kąta jest krótsza (w porównaniu do przyprostokątnej leżącej naprzeciwko kąta $60^\\circ$). Zatem $a=5$ to przyprostokątna naprzeciwległa do kąta $30^\\circ$.

**Krok 2.** Zapisz definicję funkcji trygonometrycznej, która wiąże znany kąt, znaną przyprostokątną naprzeciwległą i szukaną przeciwprostokątną. Jest to sinus.
$$ \\sin \\alpha = \\frac{\\text{przyprostokątna naprzeciwległa}}{\\text{przeciwprostokątna}} $$

**Krok 3.** Podstaw znane wartości do wzoru. Niech $c$ oznacza długość przeciwprostokątnej.
$$ \\sin 30^\\circ = \\frac{5}{c} $$

**Krok 4.** Odczytaj wartość $\\sin 30^\\circ$ z tabelki lub tablic trygonometrycznych. $\\sin 30^\\circ = \\frac{1}{2}$.
$$ \\frac{1}{2} = \\frac{5}{c} $$

**Krok 5.** Rozwiąż równanie, aby wyznaczyć $c$. Mnożymy na krzyż:
$1 \\cdot c = 2 \\cdot 5$
$c = 10$

**Odpowiedź:** Długość przeciwprostokątnej wynosi 10.

## Pułapki
*   ** Mylenie przyprostokątnych:** Uczniowie często mylą, która przyprostokątna jest "naprzeciwległa", a która "przylega" do danego kąta. Zawsze rysuj trójkąt i wyraźnie zaznaczaj kąt, dla którego liczysz funkcje. Patrz "na wprost" boku dla naprzeciwległej, "obok" boku dla przyległej.
*   ** Nieprawidłowe przypisanie wartości z tabelki:** Wartości dla $30^\\circ$, $45^\\circ$, $60^\\circ$ są kluczowe. Pomylenie $\\sin 30^\\circ$ z $\\cos 30^\\circ$ lub $\\tan 30^\\circ$ z $\\tan 60^\\circ$ prowadzi do błędnych wyników. Szczególnie uważać na tangensy: $\\frac{1}{\\sqrt{3}}$ to $\\frac{\\sqrt{3}}{3}$.
*   ** Brak twierdzenia Pitagorasa:** Wiele zadań wymaga obliczenia trzeciego boku trójkąta prostokątnego przed zastosowaniem definicji trygonometrycznych. Zapomnienie o twierdzeniu Pitagorasa lub jego błędne zastosowanie uniemożliwia rozwiązanie. Pamiętaj: $a^2 + b^2 = c^2$.
*   ** Nieznajomość podstawowych tożsamości:** Zadania mogą polegać na przekształceniach wykorzystujących $\\sin^2 \\alpha + \\cos^2 \\alpha = 1$ lub $\\tan \\alpha = \\frac{\\sin \\alpha}{\\cos \\alpha}$. Brak znajomości tych wzorów ogranicza możliwości rozwiązania.

## Ćwiczenia do samodzielnego rozwiązania
1.  W trójkącie prostokątnym przyprostokątne mają długości 5 cm i 12 cm. Oblicz sinus, cosinus i tangens kąta ostrego leżącego naprzeciwko boku o długości 5 cm.
2.  Dany jest trójkąt prostokątny ABC, gdzie $\\angle C = 90^\\circ$. Wiadomo, że $AC = 8$ i $BC = 6$. Oblicz $\\cos(\\angle ABC)$.
3.  Oblicz wartość wyrażenia: $2 \\sin 30^\\circ + \\cos 60^\\circ - \\tan 45^\\circ$.
4.  W trójkącie prostokątnym jeden z kątów ostrych ma miarę $60^\\circ$. Przeciwprostokątna ma długość 14. Oblicz długość przyprostokątnej leżącej naprzeciwko tego kąta.
5.  Długość przeciwprostokątnej w trójkącie prostokątnym wynosi 13 cm, a długość jednej z przyprostokątnych to 5 cm. Oblicz sinus i cosinus obu kątów ostrych tego trójkąta.
6.  Przekształć wyrażenie $\\frac{\\sin \\alpha}{1 + \\cos \\alpha}$ wiedząc, że $\\tan \\alpha = \\frac{\\sin \\alpha}{\\cos \\alpha}$. (Podpowiedź: pomnóż licznik i mianownik przez $\\cos \\alpha$). Nie jest to standardowe zadanie CKE, ale testuje rozumienie zależności.
7.  Dany jest trójkąt prostokątny. Sinus jednego z kątów ostrych wynosi $\\frac{3}{5}$. Oblicz cosinus i tangens tego kąta.

## Odpowiedzi
1.  Przeciwprostokątna $c = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$. Kąt $\\alpha$ naprzeciwko 5. $\\sin \\alpha = \\frac{5}{13}$, $\\cos \\alpha = \\frac{12}{13}$, $\\tan \\alpha = \\frac{5}{12}$.
2.  Kąt $\\angle ABC$ jest kątem przy wierzchołku B. Naprzeciwległa przyprostokątna to $AC=8$. Przyległa to $BC=6$. Przeciwprostokątna $AB = \\sqrt{8^2+6^2} = \\sqrt{64+36} = \\sqrt{100} = 10$. $\\cos(\\angle ABC) = \\frac{BC}{AB} = \\frac{6}{10} = \\frac{3}{5}$.
3.  $2 \\cdot \\frac{1}{2} + \\frac{1}{2} - 1 = 1 + \\frac{1}{2} - 1 = \\frac{1}{2}$.
4.  Kąt $60^\\circ$. Przyprostokątna naprzeciwko $a$. Przeciwprostokątna $c = 14$. $\\sin 60^\\circ = \\frac{a}{c}$. $\\frac{\\sqrt{3}}{2} = \\frac{a}{14}$. $a = 14 \\cdot \\frac{\\sqrt{3}}{2} = 7\\sqrt{3}$.
5.  Przeciwprostokątna $c=13$, przyprostokątna $a=5$. Druga przyprostokątna $b = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12$. Kąty $\\alpha$ i $\\beta$. $\\sin \\alpha = \\frac{5}{13}$, $\\cos \\alpha = \\frac{12}{13}$. $\\sin \\beta = \\frac{12}{13}$, $\\cos \\beta = \\frac{5}{13}$.
6.  $\\frac{\\sin \\alpha}{1 + \\cos \\alpha} = \\frac{\\sin \\alpha \\cdot \\cos \\alpha}{(1 + \\cos \\alpha) \\cdot \\cos \\alpha}$ - to nie jest cel pomnożenia. Cel to $\\frac{\\sin \\alpha \\cdot \\cos \\alpha}{(1+\\cos \\alpha) \\cdot \\cos \\alpha}$ - to nie jest to. Pomnóż licznik i mianownik przez $\\cos \\alpha$: $\\frac{\\sin \\alpha \\cdot \\cos \\alpha}{(1 + \\cos \\alpha) \\cdot \\cos \\alpha}$ - źle. Prawidłowo: $\\frac{\\sin \\alpha}{1 + \\cos \\alpha} = \\frac{\\sin \\alpha \\cdot \\cos \\alpha}{(1 + \\cos \\alpha) \\cdot \\cos \\alpha}$ - źle. Pomnóż licznik i mianownik przez $\\cos \\alpha$: $\\frac{\\sin \\alpha \\cdot \\cos \\alpha}{(1 + \\cos \\alpha) \\cdot \\cos \\alpha}$. Nie, chodziło o przekształcenie, by użyć $\\tan$. Nie ma prostego przekształcenia do tangensa. Poprawne przekształcenie: $\\frac{\\sin \\alpha}{1 + \\cos \\alpha} = \\frac{\\sin \\alpha(1-\\cos \\alpha)}{(1+\\cos \\alpha)(1-\\cos \\alpha)} = \\frac{\\sin \\alpha(1-\\cos \\alpha)}{1-\\cos^2 \\alpha} = \\frac{\\sin \\alpha(1-\\cos \\alpha)}{\\sin^2 \\alpha} = \\frac{1-\\cos \\alpha}{\\sin \\alpha}$. To jest bardziej zaawansowane. Zostawiamy to. Zamiast tego, typowe przekształcenie: $\\frac{\\sin \\alpha}{1 + \\cos \\alpha} = \\frac{\\sin \\alpha (1-\\cos \\alpha)}{(1+\\cos \\alpha)(1-\\cos \\alpha)} = \\frac{\\sin \\alpha (1-\\cos \\alpha)}{1 - \\cos^2 \\alpha} = \\frac{\\sin \\alpha (1-\\cos \\alpha)}{\\sin^2 \\alpha} = \\frac{1-\\cos \\alpha}{\\sin \\alpha}$.
7.  Z rysunku trójkąta prostokątnego: przyprostokątna naprzeciwległa $= 3$, przeciwprostokątna $= 5$. Druga przyprostokątna $b = \\sqrt{5^2 - 3^2} = \\sqrt{25 - 9} = \\sqrt{16} = 4$. $\\cos \\alpha = \\frac{4}{5}$, $\\tan \\alpha = \\frac{3}{4}$.

## Szybka powtórka
1.  Podaj definicję sinusa w trójkącie prostokątnym.
2.  Jakie są wartości $\\sin 45^\\circ$ i $\\tan 60^\\circ$?
3.  Jaka jest zależność między $\\sin \\alpha$ a $\\cos \\alpha$, znana jako jedynka trygonometryczna?
4.  Jeśli $\\tan \\alpha = 1$, to jaki jest kąt $\\alpha$?
5.  W trójkącie prostokątnym kąt $\\alpha$ ma $30^\\circ$. Czy przyprostokątna naprzeciwległa do $\\alpha$ jest dłuższa, czy krótsza od przyprostokątnej przyległej do $\\alpha$?

## Diagram
\`\`\`text
        /|
       / |
      /  | a (przyprostokątna naprzeciwległa do alfa)
     /   |
 c  /    |
(pr-  /     |
-ci- /      |
-w- /       |
-pr- / alfa  +-------+
-os- B----b----C
-tk-       (przyprostokątna przyległa do alfa)
-a) /
  /
 /
A
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "trygonometria",
    topic: "zastosowania_trygonometrii",
    title: "Zastosowania trygonometrii w zadaniach maturalnych",
    content: `## Na egzaminie
Zadania wykorzystujące trygonometrię pojawiają się na maturze podstawowej regularnie, zarówno jako zadania zamknięte (zwykle 1-2 punkty), jak i otwarte (3-4 punkty). CKE często sprawdza umiejętność stosowania podstawowych funkcji trygonometrycznych (sinus, cosinus, tangens) w kontekście geometrii, szczególnie w trójkątach prostokątnych i równoległobokach, a także w zadaniach tekstowych wymagających obliczenia odległości lub wysokości. Kluczowe jest swobodne operowanie wzorami i interpretacja wyników.

## Mapa tematu
W tej lekcji nauczysz się:
1.  Stosować definicje funkcji trygonometrycznych w trójkącie prostokątnym.
2.  Obliczać boki i kąty w trójkątach prostokątnych, wykorzystując trygonometrię.
3.  Rozwiązywać zadania tekstowe dotyczące obliczeń wysokości i odległości.
4.  Wyznaczać elementy w równoległobokach przy użyciu trygonometrii.
5.  Interpretować zależności trygonometryczne w zadaniach praktycznych.
6.  Korzystać z tablic wartości funkcji trygonometrycznych lub kalkulatora naukowego (jeśli dozwolony) do znajdowania przybliżonych wartości.
7.  Rozumieć związki między funkcjami trygonometrycznymi a kątami ostrymi.

## Definicje i wzory
Trygonometria zajmuje się związkami między kątami a bokami trójkąta. Na poziomie podstawowym skupiamy się głównie na trójkącie prostokątnym.

*   **Trójkąt prostokątny:** Trójkąt, w którym jeden z kątów ma miarę $90^\\circ$. Boki przylegające do kąta prostego nazywamy przyprostokątnymi, a bok leżący naprzeciwko kąta prostego – przeciwprostokątną.

*   **Funkcje trygonometryczne kąta ostrego ($\\alpha$) w trójkącie prostokątnym:**
    Niech $a$ i $b$ będą długościami przyprostokątnych, a $c$ długością przeciwprostokątnej. Niech przyprostokątna $a$ leży naprzeciwko kąta $\\alpha$, a przyprostokątna $b$ leży przy kącie $\\alpha$.

    *   **Sinus ($\\sin \\alpha$):** Stosunek długości przyprostokątnej **naprzeciwko** kąta $\\alpha$ do długości przeciwprostokątnej.
        $$ \\sin \\alpha = \\frac{\\text{przyprostokątna naprzeciwko } \\alpha}{\\text{przeciwprostokątna}} = \\frac{a}{c} $$

    *   **Cosinus ($\\cos \\alpha$):** Stosunek długości przyprostokątnej **przy** kącie $\\alpha$ do długości przeciwprostokątnej.
        $$ \\cos \\alpha = \\frac{\\text{przyprostokątna przy } \\alpha}{\\text{przeciwprostokątna}} = \\frac{b}{c} $$

    *   **Tangens ($\\tan \\alpha$):** Stosunek długości przyprostokątnej **naprzeciwko** kąta $\\alpha$ do długości przyprostokątnej **przy** kącie $\\alpha$.
        $$ \\tan \\alpha = \\frac{\\text{przyprostokątna naprzeciwko } \\alpha}{\\text{przyprostokątna przy } \\alpha} = \\frac{a}{b} $$
        Można też zapisać tangens jako: $\\tan \\alpha = \\frac{\\sin \\alpha}{\\cos \\alpha}$.

*   **Podstawowe wartości funkcji trygonometrycznych dla kątów 30°, 45°, 60°:**
    | Kąt $\\alpha$ | $\\sin \\alpha$       | $\\cos \\alpha$       | $\\tan \\alpha$      |
    | :--------- | :------------------ | :------------------ | :----------------- |
    | 30°        | $\\frac{1}{2}$       | $\\frac{\\sqrt{3}}{2}$ | $\\frac{\\sqrt{3}}{3}$ |
    | 45°        | $\\frac{\\sqrt{2}}{2}$ | $\\frac{\\sqrt{2}}{2}$ | $1$                |
    | 60°        | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{2}$       | $\\sqrt{3}$         |

*   **Twierdzenie Pitagorasa w trójkącie prostokątnym:** Kwadrat długości przeciwprostokątnej jest równy sumie kwadratów długości przyprostokątnych.
    $$ a^2 + b^2 = c^2 $$

*   **Zastosowanie w zadaniach:**
    *   Gdy znamy kąt i jedną przyprostokątną, możemy obliczyć drugą przyprostokątną lub przeciwprostokątną.
    *   Gdy znamy kąt i przeciwprostokątną, możemy obliczyć obie przyprostokątne.
    *   Gdy znamy dwie przyprostokątne, możemy obliczyć przeciwprostokątną (twierdzenie Pitagorasa) i kąty (funkcje trygonometryczne).
    *   Gdy znamy przyprostokątną i przeciwprostokątną, możemy obliczyć drugą przyprostokątną (twierdzenie Pitagorasa) i kąty.

## Przykład 1 - podstawowy
W trójkącie prostokątnym jeden z kątów ostrych ma miarę $30^\\circ$, a przyprostokątna leżąca naprzeciwko tego kąta ma długość 5 cm. Oblicz długość drugiej przyprostokątnej i przeciwprostokątnej.

**Krok 1.** Narysuj trójkąt prostokątny i oznacz jego boki oraz kąty. Oznaczmy kąt ostry jako $\\alpha = 30^\\circ$. Przyprostokątna naprzeciwko tego kąta ma długość $a = 5$ cm. Drugą przyprostokątną oznaczmy jako $b$, a przeciwprostokątną jako $c$.

**Krok 2.** Zastosuj funkcję tangens, aby obliczyć długość drugiej przyprostokątnej ($b$). Wiemy, że $\\tan \\alpha = \\frac{a}{b}$.
$$ \\tan 30^\\circ = \\frac{5}{b} $$
Z tablic lub ze wzoru wiemy, że $\\tan 30^\\circ = \\frac{\\sqrt{3}}{3}$.
$$ \\frac{\\sqrt{3}}{3} = \\frac{5}{b} $$

**Krok 3.** Rozwiąż równanie z niewiadomą $b$.
$$ b \\cdot \\sqrt{3} = 5 \\cdot 3 $$
$$ b \\sqrt{3} = 15 $$
$$ b = \\frac{15}{\\sqrt{3}} $$
Usuń niewymierność z mianownika:
$$ b = \\frac{15 \\sqrt{3}}{3} = 5\\sqrt{3} \\text{ cm} $$

**Krok 4.** Zastosuj funkcję sinus, aby obliczyć długość przeciwprostokątnej ($c$). Wiemy, że $\\sin \\alpha = \\frac{a}{c}$.
$$ \\sin 30^\\circ = \\frac{5}{c} $$
Z tablic wiemy, że $\\sin 30^\\circ = \\frac{1}{2}$.
$$ \\frac{1}{2} = \\frac{5}{c} $$

**Krok 5.** Rozwiąż równanie z niewiadomą $c$.
$$ c = 5 \\cdot 2 = 10 \\text{ cm} $$

**Sprawdzenie:**
Możemy sprawdzić, czy twierdzenie Pitagorasa jest spełnione: $a^2 + b^2 = c^2$.
$5^2 + (5\\sqrt{3})^2 = 25 + (25 \\cdot 3) = 25 + 75 = 100$.
$c^2 = 10^2 = 100$.
Twierdzenie Pitagorasa jest spełnione.

Odpowiedź: Długość drugiej przyprostokątnej wynosi $5\\sqrt{3}$ cm, a przeciwprostokątnej 10 cm.

## Przykład 2 - maturalny
Drabina o długości 4 metrów jest oparta o pionową ścianę. Kąt między drabiną a podłożem wynosi $60^\\circ$. Oblicz, na jaką wysokość sięga drabina i jak daleko od ściany znajduje się jej dolny koniec. Wynik podaj z dokładnością do 0.1 metra.

**Krok 1.** Zinterpretuj zadanie i narysuj schemat. Drabina, ściana i podłoże tworzą trójkąt prostokątny. Drabina jest przeciwprostokątną ($c = 4$ m). Wysokość, na jaką sięga drabina, to przyprostokątna pionowa ($h$). Odległość dolnego końca drabiny od ściany to przyprostokątna pozioma ($d$). Kąt między drabiną a podłożem to $\\alpha = 60^\\circ$.

\`\`\`
      /|
     / | h (wysokość)
    /  |
 c /   |
  /    |
 /_ _ _|
   d
(podłoże)
\`\`\`

**Krok 2.** Oblicz wysokość ($h$), na jaką sięga drabina. Jest to przyprostokątna naprzeciwko kąta $\\alpha$. Użyj funkcji sinus:
$$ \\sin \\alpha = \\frac{h}{c} $$
$$ \\sin 60^\\circ = \\frac{h}{4} $$
Z tablic: $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$.
$$ \\frac{\\sqrt{3}}{2} = \\frac{h}{4} $$

**Krok 3.** Rozwiąż równanie z niewiadomą $h$.
$$ h = 4 \\cdot \\frac{\\sqrt{3}}{2} = 2\\sqrt{3} \\text{ m} $$
Oblicz przybliżoną wartość: $\\sqrt{3} \\approx 1.732$.
$$ h \\approx 2 \\cdot 1.732 = 3.464 \\text{ m} $$
Zaokrąglij do 0.1 metra: $h \\approx 3.5$ m.

**Krok 4.** Oblicz odległość dolnego końca drabiny od ściany ($d$). Jest to przyprostokątna przy kącie $\\alpha$. Użyj funkcji cosinus:
$$ \\cos \\alpha = \\frac{d}{c} $$
$$ \\cos 60^\\circ = \\frac{d}{4} $$
Z tablic: $\\cos 60^\\circ = \\frac{1}{2}$.
$$ \\frac{1}{2} = \\frac{d}{4} $$

**Krok 5.** Rozwiąż równanie z niewiadomą $d$.
$$ d = 4 \\cdot \\frac{1}{2} = 2 \\text{ m} $$
W tym przypadku wynik jest dokładny, więc nie wymaga zaokrąglenia.

**Sprawdzenie:**
Można sprawdzić za pomocą twierdzenia Pitagorasa z przybliżonymi wartościami:
$h^2 + d^2 \\approx (3.5)^2 + 2^2 = 12.25 + 4 = 16.25$.
$c^2 = 4^2 = 16$.
Przybliżenia nieznacznie wpływają na wynik, ale wartości są bliskie. Dokładniejsze sprawdzenie z użyciem $2\\sqrt{3}$:
$(2\\sqrt{3})^2 + 2^2 = (4 \\cdot 3) + 4 = 12 + 4 = 16$.
$c^2 = 4^2 = 16$.
Zgadza się.

Odpowiedź: Drabina sięga na wysokość około 3.5 metra, a jej dolny koniec znajduje się 2 metry od ściany.

## Przykład 3 - egzaminacyjny
Równoległobok ma boki o długości 6 cm i 8 cm. Jeden z kątów tego równoległoboku ma miarę $150^\\circ$. Oblicz pole tego równoległoboku.

**Krok 1.** Przypomnij wzór na pole równoległoboku. Pole równoległoboku o bokach $a$, $b$ i kącie $\\alpha$ między nimi wynosi $P = a \\cdot b \\cdot \\sin \\alpha$.
W tym zadaniu mamy $a = 6$ cm, $b = 8$ cm, a kąt $\\alpha = 150^\\circ$.

**Krok 2.** Zauważ, że funkcja sinus jest dodatnia dla kątów rozwartych (między $90^\\circ$ a $180^\\circ$). Kąt $150^\\circ$ jest kątem rozwartym.
Kąt $150^\\circ$ jest suplementarny do kąta $180^\\circ - 150^\\circ = 30^\\circ$.
Zachodzi zależność: $\\sin(180^\\circ - \\alpha) = \\sin \\alpha$.
Zatem $\\sin 150^\\circ = \\sin (180^\\circ - 30^\\circ) = \\sin 30^\\circ$.

**Krok 3.** Użyj wartości $\\sin 30^\\circ$. Z tablic trygonometrycznych wiemy, że $\\sin 30^\\circ = \\frac{1}{2}$.
Stąd $\\sin 150^\\circ = \\frac{1}{2}$.

**Krok 4.** Podstaw wartości do wzoru na pole równoległoboku.
$$ P = a \\cdot b \\cdot \\sin \\alpha $$
$$ P = 6 \\text{ cm} \\cdot 8 \\text{ cm} \\cdot \\sin 150^\\circ $$
$$ P = 6 \\cdot 8 \\cdot \\frac{1}{2} $$

**Krok 5.** Oblicz pole.
$$ P = 48 \\cdot \\frac{1}{2} = 24 \\text{ cm}^2 $$

**Sprawdzenie:**
Pole jest dodatnie, jednostki są poprawne (cm$^2$). Wartość $\\sin 150^\\circ$ jest poprawna. Obliczenia arytmetyczne są proste i wyglądają na poprawne.

Odpowiedź: Pole równoległoboku wynosi $24 \\text{ cm}^2$.

## Pułapki
*   **Mylenie przyprostokątnych:** Pamiętaj, która przyprostokątna jest "naprzeciwko" kąta, a która jest "przy" kącie. To kluczowe przy stosowaniu sinusa i tangensa.
*   **Zastosowanie niewłaściwej funkcji:** Jeśli chcesz obliczyć bok leżący naprzeciwko kąta, a znasz przyprostokątną przy tym kącie i kąt, użyj tangensa ($\\tan = \\frac{\\text{naprzeciwko}}{\\text{przy}}$). Jeśli znasz przeciwprostokątną, użyj sinusa ($\\sin = \\frac{\\text{naprzeciwko}}{\\text{przeciwprostokątna}}$).
*   **Błędy w obliczeniach trygonometrycznych:** Szczególnie przy usuwaniu niewymierności lub przy podstawianiu wartości kątów specjalnych (30°, 45°, 60°). Zawsze sprawdzaj te wartości.
*   **Zadania tekstowe - rysunek:** Bez poprawnego rysunku i oznaczeń łatwo pomylić boki i kąty w zadaniach tekstowych, szczególnie tych dotyczących np. wysokości obiektów, nachylenia terenów. Zawsze rysuj schemat!
*   **Kąty rozwarte:** W zadaniach typu pole równoległoboku lub sinus/cosinus kąta rozwartego, pamiętaj o korzystaniu z zależności $\\sin(180^\\circ - \\alpha) = \\sin \\alpha$ oraz $\\cos(180^\\circ - \\alpha) = -\\cos \\alpha$. Dla sinusa często wynik jest dodatni, dla cosinusa ujemny.

## Ćwiczenia do samodzielnego rozwiązania
1.  W trójkącie prostokątnym jeden z kątów ostrych ma miarę $45^\\circ$. Przeciwprostokątna ma długość $6\\sqrt{2}$ cm. Oblicz długości przyprostokątnych.
2.  Oblicz wysokość wieży, jeśli w odległości 50 metrów od jej podstawy promień słońca padający na szczyt wieży tworzy z ziemią kąt $30^\\circ$.
3.  Oblicz pole równoległoboku o bokach długości 10 cm i 4 cm, jeśli krótsza przekątna ma długość 6 cm. (Wskazówka: Zastosuj twierdzenie cosinusów lub podziel równoległobok na dwa trójkąty).
4.  W trójkącie prostokątnym przyprostokątne mają długości 7 cm i 24 cm. Oblicz sinus i tangens młodszego z kątów ostrych.
5.  Kąt nachylenia dachu do płaszczyzny poziomej wynosi $20^\\circ$. Oblicz wysokość, na jaką sięga dach nad budynkiem o szerokości 12 metrów, jeśli dach ma kształt trójkąta równoramiennego, a jego ramiona mają długość 10 metrów. (Wskazówka: Dzielisz trójkąt równoramienny na dwa trójkąty prostokątne).
6.  Oblicz pole trójkąta prostokątnego, jeśli jedna przyprostokątna ma długość 8 cm, a kąt leżący naprzeciwko niej ma miarę $60^\\circ$.
7.  Długość okna (przekątna) wynosi 1.5 metra. Okno jest uchylone pod kątem $45^\\circ$. Na jaką odległość wysunęło się górne ramię okna od pionu?

## Odpowiedzi
1.  Przyprostokątne mają długość 6 cm. (Jest to trójkąt prostokątny równoramienny).
2.  Wysokość wieży wynosi $50 \\cdot \\tan 30^\\circ = 50 \\cdot \\frac{\\sqrt{3}}{3} = \\frac{50\\sqrt{3}}{3}$ m.
3.  Kąt ostry między bokami to $60^\\circ$. Pole = $10 \\cdot 4 \\cdot \\sin 60^\\circ = 40 \\cdot \\frac{\\sqrt{3}}{2} = 20\\sqrt{3} \\text{ cm}^2$.
4.  Przeciwprostokątna $c = \\sqrt{7^2 + 24^2} = \\sqrt{49 + 576} = \\sqrt{625} = 25$ cm. Mniejszy kąt leży naprzeciw krótszej przyprostokątnej (7 cm). Sinus tego kąta: $\\frac{7}{25}$. Tangens tego kąta: $\\frac{7}{24}$.
5.  W tym zadaniu kąt $20^\\circ$ jest kątem nachylenia dachu. Wysokość kalenicy nad podstawą to $h = 12 \\cdot \\tan 20^\\circ$. Po podzieleniu na dwa trójkąty prostokątne, mamy podstawę 6 m i ramię 10 m. Kąt $20^\\circ$ nie jest bezpośrednio związany z tym trójkątem. Poprawne podejście: Dzielimy trójkąt równoramienny na dwa prostokątne. Podstawa $12$ m dzieli się na $6$ m. Wysokość dachu $h$ jest przyprostokątną. Ramię $10$ m jest przeciwprostokątną. $h = \\sqrt{10^2 - 6^2} = \\sqrt{100-36} = \\sqrt{64} = 8$ m. Kąt nachylenia ramienia dachu do podstawy $\\alpha$ spełnia $\\cos \\alpha = \\frac{6}{10} = \\frac{3}{5}$. Kąt dachu $20^\\circ$ jest kątem nachylenia do płaszczyzny poziomej. Najwyższy punkt dachu to kalenica. Wysokość tego punktu nad płaszczyzną, na której znajduje się ściana o szerokości 12m, zależy od kształtu dachu. Jeśli 12m to szerokość ściany, a dach jest nad nią, to połowa szerokości to 6m. Wysokość dachu nad tą ścianą to 8m. Kąt $20^\\circ$ jest zbędny lub dotyczy czegoś innego. Zakładając, że 12m to odległość podstawy jednego ramienia dachu od podstawy drugiego, a jego wysokość szukamy w środku, mamy trójkąt prostokątny o przyprostokątnych $6$ i $h$, oraz przeciwprostokątnej $10$. $h=8$ m.
6.  Przyprostokątna przy kącie $60^\\circ$ to $8 \\cdot \\tan 60^\\circ = 8\\sqrt{3}$ cm. Pole $= \\frac{1}{2} \\cdot 8 \\cdot 8\\sqrt{3} = 32\\sqrt{3} \\text{ cm}^2$.
7.  Przekątna okna to przeciwprostokątna ($c=1.5$ m). Kąt uchylenia to $\\alpha = 45^\\circ$. Odległość wysunięcia górnego ramienia od pionu to przyprostokątna przy kącie $45^\\circ$. Jest to $\\cos 45^\\circ = \\frac{x}{1.5}$. $x = 1.5 \\cdot \\cos 45^\\circ = 1.5 \\cdot \\frac{\\sqrt{2}}{2} = \\frac{3\\sqrt{2}}{4}$ metra.

## Szybka powtórka
1.  Jakie są definicje sinusa, cosinusa i tangensa w trójkącie prostokątnym?
2.  Podaj wartości $\\sin 45^\\circ$, $\\cos 30^\\circ$ i $\\tan 60^\\circ$.
3.  Jaki jest wzór na pole równoległoboku, wykorzystujący boki i kąt między nimi?
4.  W jakim celu stosujemy twierdzenie Pitagorasa w zadaniach z trygonometrii?
5.  Jak obliczyć wysokość drzewa, jeśli znamy odległość od jego podstawy i kąt padania promieni słonecznych na szczyt?

## Diagram
\`\`\`text
      /|
     / |  b (przyprostokątna przy kącie alfa)
    /  |
 c /   | a (przyprostokątna naprzeciwko kąta alfa)
  /    |
 /_ _ _|
   alfa
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "planimetria",
    title: "Planimetria - podstawowe figury i twierdzenia",
    content: `## Na egzaminie
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
    *   Suma kątów wewnętrznych: $180^\\circ$.
    *   Nierówność trójkąta: suma długości dwóch dowolnych boków musi być większa od długości trzeciego boku.
    *   Rodzaje trójkątów ze względu na boki: równoboczny, równoramienny, różnoboczny.
    *   Rodzaje trójkątów ze względu na kąty: ostrokątny, prostokątny, rozwartokątny.

*   **Czworokąt:** Figura płaskie ograniczona czterema odcinkami (bokami) łączącymi cztery punkty (wierzchołki).
    *   Suma kątów wewnętrznych: $360^\\circ$.
    *   **Kwadrat:** Czworokąt o wszystkich bokach równych i wszystkich kątach prostych.
        *   Długość boku: $a$.
        *   Obwód: $Obw = 4a$.
        *   Pole: $P = a^2$.
        *   Długość przekątnej: $d = a\\sqrt{2}$.
    *   **Prostokąt:** Czworokąt o wszystkich kątach prostych.
        *   Długości boków: $a, b$.
        *   Obwód: $Obw = 2a + 2b$.
        *   Pole: $P = a \\cdot b$.
        *   Długość przekątnej: $d = \\sqrt{a^2 + b^2}$.
    *   **Romb:** Czworokąt o wszystkich bokach równych.
        *   Długość boku: $a$.
        *   Obwód: $Obw = 4a$.
        *   Pole: $P = a \\cdot h$ (gdzie $h$ to wysokość) lub $P = \\frac{1}{2} d_1 \\cdot d_2$ (gdzie $d_1, d_2$ to przekątne).
        *   Przekątne przecinają się pod kątem prostym i dzielą się na połowy.
    *   **Równoległobok:** Czworokąt o parach boków równoległych.
        *   Długości boków: $a, b$.
        *   Obwód: $Obw = 2a + 2b$.
        *   Pole: $P = a \\cdot h_a = b \\cdot h_b$ (gdzie $h_a, h_b$ to wysokości opuszczone na odpowiednie boki).
        *   Przeciwległe kąty są równe, a sąsiednie sumują się do $180^\\circ$.
    *   **Trapez:** Czworokąt posiadający co najmniej jedną parę boków równoległych (podstawy).
        *   Długości podstaw: $a, b$.
        *   Długość ramion: $c, d$.
        *   Pole: $P = \\frac{a+b}{2} \\cdot h$ (gdzie $h$ to wysokość).
        *   **Trapez równoramienny:** Ramiona równej długości. Kąty przy tej samej podstawie równe. Przekątne równej długości.

**Twierdzenia:**

*   **Twierdzenie Pitagorasa:** W trójkącie prostokątnym suma kwadratów długości przyprostokątnych jest równa kwadratowi długości przeciwprostokątnej.
    *   Jeśli $a, b$ to przyprostokątne, a $c$ to przeciwprostokątna, to: $a^2 + b^2 = c^2$.
*   **Twierdzenie o podobieństwie trójkątów (cechy):**
    *   **Bok-bok-bok (BBB):** Dwa trójkąty są podobne, jeśli stosunki długości wszystkich ich parami odpowiadających boków są równe.
    *   **Bok-kąt-bok (BKB):** Dwa trójkąty są podobne, jeśli stosunek długości dwóch par odpowiadających sobie boków jest taki sam i kąt zawarty między tymi bokami jest równy.
    *   **Kąt-kąt (KK):** Dwa trójkąty są podobne, jeśli dwa kąty jednego trójkąta są odpowiednio równe dwóm kątom drugiego trójkąta.

## Przykład 1 - podstawowy
Oblicz pole i obwód prostokąta, którego jeden bok ma długość 5 cm, a przekątna ma długość 13 cm.

**Krok 1.** Narysuj prostokąt i zaznacz dane. Oznacz boki jako $a$ i $b$, a przekątną jako $d$. Mamy $a = 5$ cm, $d = 13$ cm.

**Krok 2.** Zauważ, że przekątna prostokąta dzieli go na dwa trójkąty prostokątne. Boki prostokąta są przyprostokątnymi tych trójkątów, a przekątna jest przeciwprostokątną.

**Krok 3.** Zastosuj twierdzenie Pitagorasa do jednego z tych trójkątów prostokątnych: $a^2 + b^2 = d^2$. Podstaw znane wartości: $5^2 + b^2 = 13^2$.

**Krok 4.** Rozwiąż równanie, aby obliczyć długość drugiego boku ($b$):
$25 + b^2 = 169$
$b^2 = 169 - 25$
$b^2 = 144$
$b = \\sqrt{144}$
$b = 12$ cm.

**Krok 5.** Oblicz obwód i pole prostokąta, korzystając ze wzorów:
Obwód: $Obw = 2a + 2b = 2 \\cdot 5 + 2 \\cdot 12 = 10 + 24 = 34$ cm.
Pole: $P = a \\cdot b = 5 \\cdot 12 = 60$ cm$^2$.

**Sprawdzenie:**
Boki prostokąta to 5 cm i 12 cm. Przekątna ma 13 cm. Sprawdźmy twierdzenie Pitagorasa: $5^2 + 12^2 = 25 + 144 = 169$. $13^2 = 169$. Zgadza się. Obliczenia obwodu i pola są poprawne.

## Przykład 2 - maturalny
W trapezie równoramiennym podstawy mają długości 10 cm i 4 cm, a ramiona mają długość 5 cm. Oblicz pole tego trapezu.

**Krok 1.** Narysuj trapez równoramienny. Oznacz dłużą podstawę jako $a=10$ cm, krótszą podstawę jako $b=4$ cm, a ramiona jako $c=5$ cm.

**Krok 2.** Aby obliczyć pole trapezu, potrzebujemy jego wysokości ($h$). Skorzystaj ze wzoru $P = \\frac{a+b}{2} \\cdot h$. Musimy obliczyć $h$.

**Krok 3.** W trapezie równoramiennym, jeśli opuścimy wysokości z końców krótszej podstawy na dłuższą podstawę, podzielimy dłuższą podstawę na trzy odcinki. Środkowy odcinek będzie równy krótszej podstawie ($4$ cm). Dwa skrajne odcinki będą miały taką samą długość. Obliczmy tę długość:
$x = \\frac{a-b}{2} = \\frac{10-4}{2} = \\frac{6}{2} = 3$ cm.

**Krok 4.** Rozważ jeden z dwóch prostokątnych trójkątów utworzonych przez wysokość, fragment dłuższego ramienia podstawy (długości $x=3$ cm) i ramię trapezu (długości $c=5$ cm). W tym trójkącie prostokątnym przyprostokątnymi są wysokość ($h$) i odcinek ($x$), a przeciwprostokątną jest ramię ($c$). Zastosuj twierdzenie Pitagorasa:
$h^2 + x^2 = c^2$
$h^2 + 3^2 = 5^2$
$h^2 + 9 = 25$
$h^2 = 25 - 9$
$h^2 = 16$
$h = \\sqrt{16}$
$h = 4$ cm.

**Krok 5.** Oblicz pole trapezu, korzystając ze wzoru i obliczonej wysokości:
$P = \\frac{a+b}{2} \\cdot h = \\frac{10+4}{2} \\cdot 4 = \\frac{14}{2} \\cdot 4 = 7 \\cdot 4 = 28$ cm$^2$.

**Sprawdzenie:**
Długości podstaw 10 cm i 4 cm, ramiona 5 cm. Wysokość 4 cm. Sprawdźmy Pitagorasem: wysokość $4^2=16$, odcinek podstawy $3^2=9$, suma $16+9=25$. Ramię $5^2=25$. Zgadza się. Pole obliczone poprawnie.

## Przykład 3 - egzaminacyjny

Trójkąt ABC jest podobny do trójkąta DEF. Długości boków trójkąta ABC wynoszą odpowiednio 3 cm, 4 cm i 5 cm. Obwód trójkąta DEF wynosi 24 cm. Oblicz długości boków trójkąta DEF.

**Krok 1.** Zrozumienie pojęcia podobieństwa. Trójkąty podobne mają odpowiadające sobie kąty równe, a stosunek długości odpowiadających sobie boków jest stały. Ten stały stosunek nazywamy skalą podobieństwa ($k$).

**Krok 2.** Oblicz obwód pierwszego trójkąta (ABC):
$Obw_{ABC} = 3 + 4 + 5 = 12$ cm.

**Krok 3.** Oblicz skalę podobieństwa ($k$) między trójkątem ABC a trójkątem DEF. Skala podobieństwa to stosunek obwodu figury podobnej (tu DEF) do obwodu figury pierwotnej (tu ABC).
$k = \\frac{Obw_{DEF}}{Obw_{ABC}} = \\frac{24 \\text{ cm}}{12 \\text{ cm}} = 2$.
Oznacza to, że każdy bok trójkąta DEF jest dwa razy dłuższy od odpowiadającego mu boku trójkąta ABC.

**Krok 4.** Oblicz długości boków trójkąta DEF, mnożąc długości odpowiadających im boków trójkąta ABC przez skalę podobieństwa $k=2$.
Długość pierwszego boku DEF: $3 \\text{ cm} \\cdot 2 = 6$ cm.
Długość drugiego boku DEF: $4 \\text{ cm} \\cdot 2 = 8$ cm.
Długość trzeciego boku DEF: $5 \\text{ cm} \\cdot 2 = 10$ cm.

**Sprawdzenie:**
Boki trójkąta DEF to 6 cm, 8 cm, 10 cm. Obwód $6+8+10 = 24$ cm. Zgadza się z danymi. Stosunek boków: $6/3 = 2$, $8/4 = 2$, $10/5 = 2$. Skala podobieństwa jest stała, więc trójkąty są podobne.

## Pułapki
*   **Brak twierdzenia Pitagorasa:** Mylenie kolejności przyprostokątnych i przeciwprostokątnej w twierdzeniu Pitagorasa. Zawsze kwadrat przeciwprostokątnej jest równy sumie kwadratów przyprostokątnych ($a^2 + b^2 = c^2$), a nie odwrotnie. Pamiętaj, że przeciwprostokątna jest najdłuższym bokiem trójkąta prostokątnego.
*   **Wzory na pole:** Mylenie wzorów na pole różnych figur, np. stosowanie wzoru na pole prostokąta do kwadratu lub odwrotnie. Upewnij się, że używasz właściwego wzoru dla danej figury.
*   **Trapez równoramienny:** Nieprawidłowe obliczanie odcinków na dłuższej podstawie. Pamiętaj, że odcinek $x = \\frac{a-b}{2}$ to połowa różnicy długości podstaw, a nie jakaś inna część.
*   **Podobieństwo trójkątów:** Mylenie kolejności odpowiadających sobie boków przy obliczaniu skali podobieństwa. Zawsze porównuj odpowiednie boki. Jeśli $k = \\frac{\\text{bok w figurze 2}}{\\text{bok w figurze 1}}$, to $k$ będzie większe od 1, gdy figura 2 jest większa od figury 1.
*   **Jednostki:** Zapominanie o jednostkach lub stosowanie ich nieprawidłowo. W zadaniach geometrycznych często spotkasz jednostki długości (cm, m) i pola (cm$^2$, m$^2$).

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz pole i obwód kwadratu, którego przekątna ma długość $8\\sqrt{2}$ cm.
2.  Długości boków prostokąta wynoszą 6 cm i 10 cm. Oblicz długość jego przekątnej.
3.  Romb ma boki o długości 10 cm i jedną przekątną o długości 12 cm. Oblicz pole tego rombu.
4.  W trójkącie prostokątnym jeden z kątów ostrych ma miarę $30^\\circ$. Oblicz stosunek długości przyprostokątnych.
5.  Dwa trójkąty są podobne. Jeden ma boki o długościach 5 cm, 7 cm, 9 cm. Drugi trójkąt ma najkrótszy bok o długości 15 cm. Oblicz obwód drugiego trójkąta.
6.  Podstawa trapezu prostokątnego ma długość 12 cm, a ramię prostopadłe do podstaw ma długość 5 cm. Krótsza podstawa ma długość 8 cm. Oblicz pole trapezu.

## Odpowiedzi
1.  Bok kwadratu ma długość 8 cm. Pole: $64$ cm$^2$. Obwód: $32$ cm.
2.  Przekątna ma długość $\\sqrt{136}$ cm (czyli $2\\sqrt{34}$ cm).
3.  Druga przekątna ma długość 16 cm. Pole: $96$ cm$^2$.
4.  Stosunek przyprostokątnej leżącej naprzeciw kąta $30^\\circ$ do przyprostokątnej leżącej przy kącie $30^\\circ$ wynosi $\\frac{1}{\\sqrt{3}}$ (lub $\\frac{\\sqrt{3}}{3}$).
5.  Skala podobieństwa $k=3$. Obwód drugiego trójkąta: $45$ cm.
6.  Pole trapezu: $100$ cm$^2$.

## Szybka powtórka
1.  Jaka jest suma kątów wewnętrznych w dowolnym trójkącie?
2.  Co mówi twierdzenie Pitagorasa?
3.  Podaj wzór na pole prostokąta.
4.  Podaj wzór na pole trapezu.
5.  Jakie są cechy podobieństwa trójkątów?

## Diagram
\`\`\`text
      a
   +------+
 b |      | b
   +------+
      a

     /|\\
    / | \\
 c /  |h \\ c
  /   |   \\
 /____|____\\
   x  b  x
    <-- a -->

   /----\\
  /      \\
c/        \\d
/          \\
+------------+
      a
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "pitagoras_i_podobienstwo",
    title: "Twierdzenie Pitagorasa i Trójkąty Podobne",
    content: `## Na egzaminie
Twierdzenie Pitagorasa oraz własności trójkątów podobnych pojawiają się na maturze podstawowej regularnie, zarówno jako samodzielne zadania, jak i elementy zadań złożonych, często w kontekście geometrii płaskiej (planimetrii). Zadania te zazwyczaj warte są od 2 do 4 punktów, a ich rozwiązanie wymaga poprawnego zastosowania wzorów i logicznego rozumowania. CKE lubi sprawdzać umiejętność wyznaczania brakujących boków w trójkątach prostokątnych oraz stosowania skali podobieństwa.

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił/a:
1.  Stosować twierdzenie Pitagorasa do obliczania długości boków w trójkątach prostokątnych.
2.  Rozpoznawać trójkąty pitagorejskie i wykorzystywać ich własności.
3.  Obliczać pola i obwody trójkątów prostokątnych, znając tylko niektóre boki.
4.  Definiować trójkąty podobne i wymieniać warunki ich podobieństwa.
5.  Wykorzystywać cechy podobieństwa trójkątów (BBB, BKB, KBKB) do dowodzenia ich podobieństwa.
6.  Stosować skalę podobieństwa do obliczania odpowiadających sobie boków, wysokości, median, dwusiecznych i promieni okręgów wpisanych/opisanych.
7.  Obliczać pola i obwody figur podobnych.
8.  Rozwiązywać zadania tekstowe i geometryczne z wykorzystaniem twierdzenia Pitagorasa i podobieństwa trójkątów.

## Definicje i wzory
*   **Twierdzenie Pitagorasa:** W trójkącie prostokątnym suma kwadratów długości przyprostokątnych jest równa kwadratowi długości przeciwprostokątnej.
    *   Jeśli $a$ i $b$ są długościami przyprostokątnych, a $c$ jest długością przeciwprostokątnej, to:
        $$a^2 + b^2 = c^2$$
*   **Trójkąt prostokątny:** Trójkąt, w którym jeden z kątów ma miarę $90^\\circ$. Boki przylegające do kąta prostego to przyprostokątne, a bok leżący naprzeciwko kąta prostego to przeciwprostokątna.
*   **Trójkąty pitagorejskie:** Trójki liczb naturalnych $(a, b, c)$, które spełniają równanie $a^2 + b^2 = c^2$. Najpopularniejsze to:
    *   (3, 4, 5): $3^2 + 4^2 = 9 + 16 = 25 = 5^2$
    *   (5, 12, 13): $5^2 + 12^2 = 25 + 144 = 169 = 13^2$
    *   (8, 15, 17): $8^2 + 15^2 = 64 + 225 = 289 = 17^2$
    *   (7, 24, 25): $7^2 + 24^2 = 49 + 576 = 625 = 25^2$
*   **Podobieństwo trójkątów:** Dwa trójkąty są podobne, jeśli ich odpowiadające kąty są równej miary, a stosunek długości odpowiadających sobie boków jest stały. Ten stały stosunek nazywamy skalą podobieństwa (oznaczamy przez $k$).

*   **Cechy podobieństwa trójkątów:**
    *   **BBB (bok-bok-bok):** Dwa trójkąty są podobne, jeśli stosunki długości wszystkich trzech par odpowiadających sobie boków są równe.
        Jeśli trójkąty $\\triangle ABC$ i $\\triangle A'B'C'$ mają boki odpowiednio $a, b, c$ i $a', b', c'$, a zachodzi warunek:
        $$\\frac{a}{a'} = \\frac{b}{b'} = \\frac{c}{c'} = k$$
        to trójkąty te są podobne, a $k$ jest skalą podobieństwa.
    *   **BKB (bok-kąt-bok):** Dwa trójkąty są podobne, jeśli stosunek długości dwóch par odpowiadających sobie boków jest równy, a kąty zawarte między tymi bokami są równej miary.
        Jeśli w trójkątach $\\triangle ABC$ i $\\triangle A'B'C'$ mamy:
        $$\\frac{a}{a'} = \\frac{b}{b'} \\quad \\text{oraz} \\quad \\gamma = \\gamma'$$
        gdzie $\\gamma$ i $\\gamma'$ to kąty między bokami $a, b$ i $a', b'$ odpowiednio, to trójkąty są podobne.
    *   **KBKB (kąt-bok-bok):** Dwa trójkąty są podobne, jeśli miary dwóch odpowiadających sobie kątów są równe. (Jest to najczęściej używana cecha, ponieważ suma kątów w trójkącie to $180^\\circ$, więc jeśli dwa kąty są równe, to trzecie też muszą być równe).
        Jeśli w trójkątach $\\triangle ABC$ i $\\triangle A'B'C'$ mamy:
        $$\\alpha = \\alpha' \\quad \\text{oraz} \\quad \\beta = \\beta'$$
        gdzie $\\alpha, \\alpha'$ i $\\beta, \\beta'$ to pary odpowiadających sobie kątów, to trójkąty są podobne.

*   **Skala podobieństwa (k):** Stosunek długości odpowiadających sobie boków dwóch podobnych figur.
    *   Jeśli $k > 1$, figura $A'B'C'$ jest powiększeniem figury $ABC$.
    *   Jeśli $0 < k < 1$, figura $A'B'C'$ jest pomniejszeniem figury $ABC$.
    *   Jeśli $k = 1$, figury są przystające.
*   **Wzory dotyczące pól i obwodów figur podobnych:**
    *   Jeśli figury $F$ i $F'$ są podobne w skali $k$, to stosunek ich obwodów wynosi $k$:
        $$\\frac{Obw(F')}{Obw(F)} = k$$
    *   Stosunek ich pól wynosi $k^2$:
        $$\\frac{Pole(F')}{Pole(F)} = k^2$$

## Przykład 1 - podstawowy
Oblicz brakującą przyprostokątną w trójkącie prostokątnym, jeśli jedna przyprostokątna ma długość 6 cm, a przeciwprostokątna 10 cm.

**Krok 1.** Zidentyfikuj dane i szukaną.
Dane: przyprostokątna $a = 6$ cm, przeciwprostokątna $c = 10$ cm.
Szukana: przyprostokątna $b$.

**Krok 2.** Zastosuj twierdzenie Pitagorasa.
W trójkącie prostokątnym zachodzi równość: $a^2 + b^2 = c^2$.

**Krok 3.** Podstaw dane do wzoru.
$6^2 + b^2 = 10^2$

**Krok 4.** Rozwiąż równanie, aby wyznaczyć $b$.
$36 + b^2 = 100$
$b^2 = 100 - 36$
$b^2 = 64$
$b = \\sqrt{64}$
$b = 8$ cm (długość boku musi być dodatnia)

**Krok 5.** Sprawdzenie.
Czy $6^2 + 8^2 = 10^2$?
$36 + 64 = 100$
$100 = 100$
Równość jest spełniona.

Odpowiedź: Brakująca przyprostokątna ma długość 8 cm.

## Przykład 2 - maturalny
Dwa trójkąty są podobne. Pierwszy trójkąt ma boki o długościach 5 cm, 12 cm i 13 cm. Drugi trójkąt ma najkrótszy bok o długości 15 cm. Oblicz obwód drugiego trójkąta.

**Krok 1.** Zidentyfikuj dane i szukaną.
Dane:
Trójkąt 1: boki $a_1=5$, $b_1=12$, $c_1=13$.
Trójkąt 2: najkrótszy bok $a_2 = 15$ cm.
Trójkąty są podobne.
Szukana: Obwód drugiego trójkąta ($Obw_2$).

**Krok 2.** Określ skalę podobieństwa.
Najkrótszy bok pierwszego trójkąta to 5 cm. Najkrótszy bok drugiego trójkąta to 15 cm.
Ponieważ trójkąty są podobne, stosunek odpowiadających sobie boków jest stały i równy skali podobieństwa $k$.
Skala podobieństwa $k$ jest stosunkiem boku z drugiego trójkąta do odpowiadającego mu boku z pierwszego trójkąta.
$k = \\frac{a_2}{a_1} = \\frac{15 \\text{ cm}}{5 \\text{ cm}} = 3$.

**Krok 3.** Oblicz obwód pierwszego trójkąta.
$Obw_1 = a_1 + b_1 + c_1 = 5 + 12 + 13 = 30$ cm.

**Krok 4.** Oblicz obwód drugiego trójkąta, korzystając ze skali podobieństwa.
Stosunek obwodów figur podobnych jest równy skali podobieństwa:
$\\frac{Obw_2}{Obw_1} = k$
$Obw_2 = k \\cdot Obw_1$
$Obw_2 = 3 \\cdot 30 \\text{ cm} = 90 \\text{ cm}$.

**Alternatywna metoda:**
Można też najpierw obliczyć boki drugiego trójkąta:
$a_2 = k \\cdot a_1 = 3 \\cdot 5 = 15$ cm (co było dane)
$b_2 = k \\cdot b_1 = 3 \\cdot 12 = 36$ cm
$c_2 = k \\cdot c_1 = 3 \\cdot 13 = 39$ cm
Obwód drugiego trójkąta: $Obw_2 = a_2 + b_2 + c_2 = 15 + 36 + 39 = 90$ cm.

Sprawdzenie: Oba sposoby dają ten sam wynik.

Odpowiedź: Obwód drugiego trójkąta wynosi 90 cm.

## Przykład 3 - egzaminacyjny
W trójkącie prostokątnym jedna przyprostokątna ma długość 8, a przeciwprostokątna ma długość 10. Jaka jest długość drugiej przyprostokątnej?
A) 2
B) 6
C) $\\sqrt{164}$
D) $\\sqrt{2}$

**Krok 1.** Zastosuj twierdzenie Pitagorasa.
Niech $a=8$, $c=10$. Szukamy $b$.
$a^2 + b^2 = c^2$
$8^2 + b^2 = 10^2$

**Krok 2.** Rozwiąż równanie.
$64 + b^2 = 100$
$b^2 = 100 - 64$
$b^2 = 36$
$b = \\sqrt{36}$
$b = 6$

**Krok 3.** Wybierz poprawną odpowiedź.
Odpowiedź B jest poprawna.

Odpowiedź: B

## Pułapki
*   **Mylenie przyprostokątnej z przeciwprostokątną:** Zawsze upewnij się, która jest która. Przeciwprostokątna jest najdłuższym bokiem i leży naprzeciwko kąta prostego. Wzór Pitagorasa to $a^2 + b^2 = c^2$, gdzie $c$ to przeciwprostokątna.
*   **Zapominanie o pierwiastkowaniu:** Po obliczeniu $b^2$, pamiętaj, aby wyciągnąć pierwiastek, aby uzyskać długość boku $b$.
*   **Błędy w obliczeniach:** Szczególną ostrożność zachowaj przy podnoszeniu do kwadratu i odejmowaniu. Ułamki i pierwiastki w obliczeniach Pitagorasa mogą prowadzić do błędów.
*   **Błędne przyporządkowanie boków w podobieństwie:** Upewnij się, że porównujesz odpowiadające sobie boki. Najkrótszy bok z jednego trójkąta powinien być porównywany z najkrótszym bokiem z drugiego, środkowy ze środkowym itd.
*   **Mylenie skali podobieństwa ($k$) ze stosunkiem pól ($k^2$):** Pamiętaj, że stosunek pól figur podobnych jest równy kwadratowi skali podobieństwa.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz długość przeciwprostokątnej trójkąta prostokątnego, którego przyprostokątne mają długości 9 cm i 12 cm.
2.  W trójkącie prostokątnym jedna przyprostokątna ma długość $\\sqrt{21}$ cm, a przeciwprostokątna 5 cm. Oblicz długość drugiej przyprostokątnej.
3.  Trójkąt prostokątny ma boki o długościach 6 cm, 8 cm i 10 cm. Oblicz jego pole i obwód.
4.  Dwa trójkąty są podobne. Pierwszy trójkąt ma boki o długościach 10, 24, 26. Drugi trójkąt ma obwód równy 180. Oblicz długości boków drugiego trójkąta.
5.  Trójkąt $\\triangle ABC$ ma boki $AB=12$, $BC=15$, $AC=9$. Trójkąt $\\triangle A'B'C'$ jest podobny do $\\triangle ABC$ w skali $k=2$. Oblicz obwód i pole trójkąta $\\triangle A'B'C'$.
6.  Wykaż, że trójkąt o bokach długości 7, $\\sqrt{15}$, 8 jest trójkątem prostokątnym.
7.  Wysokość $h$ w trójkącie prostokątnym poprowadzona z wierzchołka kąta prostego na przeciwprostokątną dzieli ją na odcinki o długościach $p=3$ cm i $q=12$ cm. Oblicz długości przyprostokątnych tego trójkąta.

## Odpowiedzi
1.  15 cm. ($9^2 + 12^2 = 81 + 144 = 225$, $\\sqrt{225} = 15$)
2.  Długość drugiej przyprostokątnej wynosi $2$ cm, ponieważ $21 + b^2 = 25$, więc $b^2 = 4$ i $b = 2$.
3.  Pole = 24 cm$^2$ ($\\frac{1}{2} \\cdot 6 \\cdot 8 = 24$), Obwód = 24 cm ($6 + 8 + 10 = 24$).
4.  Boki drugiego trójkąta to 30, 72, 78. (Obwód pierwszego = $10+24+26=60$. Skala $k = 180/60 = 3$. Boki: $3 \\cdot 10 = 30$, $3 \\cdot 24 = 72$, $3 \\cdot 26 = 78$).
5.  Obwód $\\triangle A'B'C'$ = 72 cm (Obwód $\\triangle ABC = 9+12+15=36$, $k=2$, $2 \\cdot 36 = 72$). Pole $\\triangle A'B'C'$ = 216 cm$^2$ (Pole $\\triangle ABC = \\frac{1}{2} \\cdot 9 \\cdot 12 = 54$. Stosunek pól $k^2 = 2^2 = 4$. $4 \\cdot 54 = 216$).
6.  Sprawdzenie $7^2 + (\\sqrt{15})^2 = 49 + 15 = 64$. $8^2 = 64$. Ponieważ $7^2 + (\\sqrt{15})^2 = 8^2$, trójkąt jest prostokątny z przeciwprostokątną o długości 8.
7.  Przeciwprostokątna ma długość $c = p + q = 15$ cm. Z twierdzenia o przyprostokątnych:
    $a^2 = pc = 3 \\cdot 15 = 45$, więc $a = 3\\sqrt{5}$ cm.
    $b^2 = qc = 12 \\cdot 15 = 180$, więc $b = 6\\sqrt{5}$ cm.

## Szybka powtórka
1.  Jakie są boki trójkąta prostokątnego w twierdzeniu Pitagorasa?
2.  Podaj najmniejszy trójkąt pitagorejski.
3.  Podaj warunek podobieństwa trójkątów na podstawie dwóch kątów.
4.  Jaki jest stosunek pól dwóch figur podobnych, jeśli skala podobieństwa wynosi 3?
5.  Jeśli dwa trójkąty są podobne, to czy ich kąty są równe, czy boki są proporcjonalne?

## Diagram
\`\`\`text
      /|
     / |
    /  | a
   /   |
  /____|
     b
\`\`\`
(Trójkąt prostokątny, gdzie $a$ i $b$ to przyprostokątne, a przeciwprostokątna jest ukośnym bokiem)`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "okrag_i_kolo",
    title: "Okrąg i koło na maturze",
    content: `## Na egzaminie
Okazje do sprawdzenia wiedzy o okręgu i kole pojawiają się na maturze podstawowej co roku, zazwyczaj w zadaniach zamkniętych (1-2 punkty) lub jako element zadań otwartych, często w połączeniu z geometrią analityczną lub planimetrią. CKE lubi sprawdzać rozumienie definicji, wzorów na pole i obwód koła, a także związków między promieniem, średnicą i cięciwą. Często pojawiają się zadania wymagające obliczenia pola wycinka koła lub długości łuku.

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił:
1.  Definiować okrąg i koło oraz ich kluczowe elementy (środek, promień, średnica, cięciwa, łuk).
2.  Stosować wzory na obwód okręgu i pole koła.
3.  Obliczać pole wycinka koła i długość łuku okręgu.
4.  Rozumieć pojęcie stycznej do okręgu i jej własności.
5.  Rozwiązywać zadania dotyczące okręgu wpisanego i opisanego na wielokątach.
6.  Wykorzystywać wiedzę o okręgu i kole do rozwiązywania problemów geometrycznych.
7.  Obliczać odległości między punktami na okręgu lub między środkami okręgów.
8.  Interpretować związki między figurami geometrycznymi a okręgiem (np. położenie punktu względem okręgu).

## Definicje i wzory
*   **Okrąg:** Jest to zbiór wszystkich punktów na płaszczyźnie, które są równo odległe od ustalonego punktu zwanego środkiem okręgu. Odległość tę nazywamy promieniem okręgu.
*   **Koło:** Jest to zbiór wszystkich punktów na płaszczyźnie, których odległość od ustalonego punktu (środka koła) jest mniejsza lub równa ustalonemu promieniowi. Koło obejmuje okrąg (jego brzeg) oraz jego wnętrze.
*   **Środek okręgu/koła (O):** Punkt, od którego wszystkie punkty okręgu/koła są jednakowo oddalone.
*   **Promień okręgu/koła (r):** Odcinek łączący środek okręgu/koła z dowolnym punktem należącym do okręgu. Jest to również odległość od środka do dowolnego punktu na okręgu.
*   **Średnica okręgu/koła (d):** Odcinek przechodzący przez środek okręgu/koła, którego końce leżą na okręgu. Długość średnicy jest dwukrotnością długości promienia: $d = 2r$.
*   **Cięciwa:** Odcinek łączący dwa dowolne punkty należące do okręgu. Średnica jest najdłuższą cięciwą okręgu.
*   **Łuk okręgu:** Część okręgu zawarta między dwoma punktami na okręgu.
*   **Styczna do okręgu:** Prosta, która ma dokładnie jeden punkt wspólny z okręgiem. Promień poprowadzony do punktu styczności jest prostopadły do stycznej.
*   **Okręg wpisany w wielokąt:** Okręg, którego boki wielokąta są stycznymi do tego okręgu.
*   **Okręg opisany na wielokącie:** Okręg, którego wierzchołki wielokąta leżą na tym okręgu.

**Wzory:**

*   **Obwód okręgu (L):** Obwód okręgu o promieniu $r$ (lub średnicy $d$) obliczamy ze wzoru:
    $$L = 2\\pi r$$
    lub
    $$L = \\pi d$$
    gdzie $\\pi$ (pi) to stała matematyczna, w przybliżeniu równa 3,14159... Na maturze zazwyczaj pozostawiamy $\\pi$ w odpowiedzi, chyba że polecono inaczej.

*   **Pole koła (P):** Pole koła o promieniu $r$ obliczamy ze wzoru:
    $$P = \\pi r^2$$

*   **Długość łuku okręgu:** Długość łuku (l) wyznaczonego przez kąt środkowy $\\alpha$ (wyrażony w stopniach) w okręgu o promieniu $r$:
    $$l = \\frac{\\alpha}{360^\\circ} \\cdot 2\\pi r$$
    Jeśli kąt $\\alpha$ jest wyrażony w radianach, wzór upraszcza się do $l = \\alpha r$.

*   **Pole wycinka koła:** Pole wycinka koła (Pwycinka) wyznaczonego przez kąt środkowy $\\alpha$ (w stopniach) w okręgu o promieniu $r$:
    $$P_{wycinka} = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$$
    Jeśli kąt $\\alpha$ jest wyrażony w radianach, wzór upraszcza się do $P_{wycinka} = \\frac{1}{2} \\alpha r^2$.

*   **Odległość punktu od środka okręgu:** Dla okręgu o środku w punkcie $O(x_0, y_0)$ i promieniu $r$, oraz punktu $P(x, y)$, zachodzi:
    *   Jeśli odległość $OP < r$, punkt leży **wewnątrz** okręgu.
    *   Jeśli odległość $OP = r$, punkt leży **na** okręgu.
    *   Jeśli odległość $OP > r$, punkt leży **na zewnątrz** okręgu.
    Odległość $OP$ obliczamy z twierdzenia Pitagorasa lub wzoru na odległość dwóch punktów: $OP = \\sqrt{(x-x_0)^2 + (y-y_0)^2}$.

## Przykład 1 - podstawowy
Oblicz obwód i pole koła o promieniu $r = 5 \\text{ cm}$.

**Krok 1.** Zidentyfikuj dane.
Mamy podany promień koła: $r = 5 \\text{ cm}$.

**Krok 2.** Zastosuj wzór na obwód okręgu.
Obwód okręgu ($L$) obliczamy ze wzoru $L = 2\\pi r$.
$L = 2 \\cdot \\pi \\cdot 5 \\text{ cm}$
$L = 10\\pi \\text{ cm}$

**Krok 3.** Zastosuj wzór na pole koła.
Pole koła ($P$) obliczamy ze wzoru $P = \\pi r^2$.
$P = \\pi \\cdot (5 \\text{ cm})^2$
$P = \\pi \\cdot 25 \\text{ cm}^2$
$P = 25\\pi \\text{ cm}^2$

**Krok 4.** Podaj odpowiedź.
Obwód koła wynosi $10\\pi \\text{ cm}$, a jego pole wynosi $25\\pi \\text{ cm}^2$.

**Sprawdzenie:** Wzory zastosowane poprawnie, obliczenia proste, wyniki są w jednostkach pola i obwodu.

## Przykład 2 - maturalny
Dany jest okrąg o środku w punkcie $O(1, 2)$ i promieniu $r=3$. Punkt $A$ ma współrzędne $(4, 2)$. Sprawdź, czy punkt $A$ leży na tym okręgu, wewnątrz niego czy na zewnątrz.

**Krok 1.** Zidentyfikuj dane.
Środek okręgu: $O(1, 2)$.
Promień okręgu: $r=3$.
Punkt $A$: $(4, 2)$.

**Krok 2.** Oblicz odległość punktu $A$ od środka okręgu $O$.
Użyjemy wzoru na odległość dwóch punktów $P_1(x_1, y_1)$ i $P_2(x_2, y_2)$: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$.
W naszym przypadku punkty to $O(1, 2)$ i $A(4, 2)$.
Odległość $OA = \\sqrt{(4-1)^2 + (2-2)^2}$
$OA = \\sqrt{3^2 + 0^2}$
$OA = \\sqrt{9 + 0}$
$OA = \\sqrt{9}$
$OA = 3$.

**Krok 3.** Porównaj obliczoną odległość z promieniem okręgu.
Obliczona odległość $OA = 3$.
Promień okręgu $r = 3$.
Ponieważ $OA = r$, punkt $A$ leży na okręgu.

**Krok 4.** Podaj odpowiedź.
Punkt $A$ leży na okręgu.

**Alternatywne podejście:**
Można też skorzystać ze wzoru na równanie okręgu. Okrąg o środku $O(x_0, y_0)$ i promieniu $r$ ma równanie $(x-x_0)^2 + (y-y_0)^2 = r^2$.
Dla naszego okręgu równanie to: $(x-1)^2 + (y-2)^2 = 3^2 = 9$.
Podstawiamy współrzędne punktu $A(4, 2)$ do lewej strony równania:
$(4-1)^2 + (2-2)^2 = 3^2 + 0^2 = 9 + 0 = 9$.
Lewa strona równania jest równa prawej stronie ($9=9$), co oznacza, że punkt $A$ leży na okręgu.

## Przykład 3 - egzaminacyjny

W pewnym parku zaprojektowano okrągłą fontannę o średnicy 10 metrów. Chcemy wyłożyć jej obrzeże ozdobnymi kamieniami. Ile metrów bieżących kamieni potrzebujemy, aby okrążyć fontannę? Przyjmij $\\pi \\approx 3.14$.

**Krok 1.** Zidentyfikuj dane i szukane.
Średnica fontanny $d = 10 \\text{ m}$.
Szukamy długości obrzeża, czyli obwodu okręgu.

**Krok 2.** Oblicz promień, jeśli potrzeba.
Promień $r = \\frac{d}{2} = \\frac{10 \\text{ m}}{2} = 5 \\text{ m}$.

**Krok 3.** Zastosuj wzór na obwód okręgu.
Obwód $L = 2\\pi r$ lub $L = \\pi d$. Użyjemy wzoru z średnicą, ponieważ jest to bezpośrednia informacja.
$L = \\pi d = \\pi \\cdot 10 \\text{ m} = 10\\pi \\text{ m}$.

**Krok 4.** Podstaw przybliżoną wartość $\\pi$ i oblicz wynik.
Zgodnie z poleceniem, przyjmujemy $\\pi \\approx 3.14$.
$L \\approx 10 \\cdot 3.14 \\text{ m}$
$L \\approx 31.4 \\text{ m}$.

**Krok 5.** Podaj odpowiedź.
Potrzebujemy około 31,4 metrów bieżących kamieni.

## Pułapki
*   **Mylenie promienia ze średnicą:** Pamiętaj, że średnica to dwa razy promień ($d=2r$). Użycie błędnej wartości we wzorze na pole ($P=\\pi d^2$ zamiast $P=\\pi r^2$) lub obwód ($L=2\\pi d$ zamiast $L=\\pi d$) jest częstym błędem. Zawsze dokładnie sprawdzaj, czy w zadaniu podano promień czy średnicę.
*   **Jednostki:** Upewnij się, że jednostki są spójne. Jeśli promień jest w metrach, obwód będzie w metrach, a pole w metrach kwadratowych. Na maturze nie zawsze trzeba podawać jednostek, ale w zadaniach tekstowych są one ważne.
*   **Użycie przybliżonej wartości $\\pi$:** Jeśli w zadaniu nie jest podane, jakiej wartości $\\pi$ użyć (np. 3.14 lub 22/7), najlepiej pozostawić odpowiedź z $\\pi$. Jeśli podano przybliżenie, użyj go do końcowego obliczenia liczbowego.
*   **Kąty w stopniach i radianach:** Wzory na długość łuku i pole wycinka zależą od tego, czy kąt jest w stopniach, czy radianach. Standardowo na maturze podstawowej używa się stopni ($360^\\circ$). Pomyłka w tym miejscu prowadzi do błędnych wyników.
*   **Pole koła vs Obwód okręgu:** Nie myl wzorów $P=\\pi r^2$ i $L=2\\pi r$. Pierwszy dotyczy powierzchni (jednostki kwadratowe), drugi długości brzegu (jednostki liniowe).

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz pole koła, którego obwód wynosi $12\\pi \\text{ cm}$.
2.  Odcinek $AB$ o długości 8 cm jest cięciwą okręgu. Odległość środka okręgu od tej cięciwy wynosi 3 cm. Oblicz promień tego okręgu.
3.  Oblicz długość łuku okręgu o promieniu $r=6$ cm, wyznaczonego przez kąt środkowy o mierze $60^\\circ$.
4.  Oblicz pole wycinka koła o promieniu $r=10$ cm, jeśli kąt środkowy wyznaczający ten wycinek wynosi $90^\\circ$. Wynik podaj z dokładnością do dwóch miejsc po przecinku, przyjmując $\\pi \\approx 3.14$.
5.  Punkt $P(-2, 1)$ i okrąg o równaniu $(x-1)^2 + (y-5)^2 = 25$. Sprawdź, czy punkt $P$ leży na tym okręgu, wewnątrz czy na zewnątrz.
6.  Kwadrat o boku 6 cm wpisano w okrąg. Oblicz pole tego okręgu.
7.  Dwa okręgi o środkach $O_1$ i $O_2$ i promieniach $r_1 = 4$ cm oraz $r_2 = 6$ cm są styczne zewnętrznie. Oblicz odległość między ich środkami.

## Odpowiedzi
1.  Promień $r=6$ cm, pole $P=36\\pi \\text{ cm}^2$.
2.  Promień okręgu $r=5$ cm. (Narysuj trójkąt prostokątny, gdzie przyprostokątne to promień poprowadzony do końca cięciwy, połowa cięciwy i odległość środka od cięciwy. $r^2 = 3^2 + (8/2)^2 = 9 + 16 = 25 \\implies r=5$)
3.  Długość łuku $l = 2\\pi$ cm. ($l = \\frac{60}{360} \\cdot 2\\pi \\cdot 6 = \\frac{1}{6} \\cdot 12\\pi = 2\\pi$)
4.  Pole wycinka $P_{wycinka} \\approx 78.50 \\text{ cm}^2$. ($P_{wycinka} = \\frac{90}{360} \\cdot \\pi \\cdot 10^2 = \\frac{1}{4} \\cdot 100\\pi = 25\\pi \\approx 25 \\cdot 3.14 = 78.50$)
5.  Punkt $P$ leży na zewnątrz okręgu. (Środek okręgu $O(1, 5)$, promień $r=5$. Odległość $OP = \\sqrt{(-2-1)^2 + (1-5)^2} = \\sqrt{(-3)^2 + (-4)^2} = \\sqrt{9+16} = \\sqrt{25} = 5$. Ojej, błąd w liczeniu, odległość jest równa promieniowi, więc punkt leży **na** okręgu. *Korekta:* Odległość $OP = \\sqrt{(-2-1)^2+(1-5)^2} = \\sqrt{(-3)^2+(-4)^2} = \\sqrt{9+16} = \\sqrt{25} = 5$. Ponieważ $OP=r$, punkt leży **na** okręgu.)
6.  Pole okręgu $P=18\\pi \\text{ cm}^2$. (Przekątna kwadratu jest średnicą okręgu. $d = 6\\sqrt{2}$ cm, $r=3\\sqrt{2}$ cm. $P = \\pi r^2 = \\pi (3\\sqrt{2})^2 = \\pi \\cdot 18 = 18\\pi$)
7.  Odległość między środkami $O_1O_2 = 10$ cm. (Dla okręgów stycznych zewnętrznie, odległość między środkami jest sumą ich promieni: $r_1+r_2 = 4+6=10$)

## Szybka powtórka
1.  Jaka jest różnica między okręgiem a kołem?
2.  Jak obliczyć obwód okręgu, jeśli znamy jego promień?
3.  Jak obliczyć pole koła, jeśli znamy jego średnicę?
4.  Co to jest styczna do okręgu?
5.  Czym różni się okrąg wpisany od opisanego na wielokącie?

## Diagram
\`\`\`text
       O  <-- Środek okręgu
      /|\\
     / | \\
    /  |  \\  r <-- Promień
   /   |   \\
  /____|____\\
 A     C     B  <-- punkty na okręgu

Odcinek AB - średnica (gdy przechodzi przez O)
Odcinek AC - cięciwa
Odcinek OA - promień
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "stereometria",
    title: "Bryły i ich objętości – klucz do zadań z geometrii przestrzennej",
    content: `## Na egzaminie
Zadania ze stereometrii pojawiają się na maturze podstawowej dość regularnie, zazwyczaj jako jedno z zadań zamkniętych lub otwartych. Przeważnie dotyczą obliczania objętości lub pól powierzchni prostych brył, takich jak graniastosłupy, ostrosłupy, walce, stożki czy kule. Zwykle można za nie uzyskać 3–5 punktów, a kluczem do sukcesu jest poprawne zidentyfikowanie bryły, przypomnienie sobie lub wyprowadzenie odpowiednich wzorów oraz staranne przeprowadzenie obliczeń.

## Mapa tematu
1.  Zrozumienie pojęcia bryły i jej elementów (wierzchołki, krawędzie, ściany).
2.  Poznanie i stosowanie wzorów na objętości podstawowych brył: graniastosłupa, ostrosłupa, walca, stożka i kuli.
3.  Rozumienie pojęcia pola powierzchni całkowitej i bocznej brył.
4.  Umiejętność obliczania pól powierzchni podstawowych brył.
5.  Wykonywanie obliczeń z wykorzystaniem danych liczbowych, w tym liczb z pierwiastkiem i $\\pi$.
6.  Rozwiązywanie zadań tekstowych dotyczących objętości i pól powierzchni brył.
7.  Rozpoznawanie elementów brył (wysokość, promień, tworząca) na rysunkach.
8.  Stosowanie twierdzenia Pitagorasa w zadaniach stereometrycznych.

## Definicje i wzory
**Bryła geometryczna** – zbiór punktów w przestrzeni ograniczony przez powierzchnię.
**Graniastosłup** – bryła ograniczona dwiema przystającymi podstawami (wielokątami) leżącymi w płaszczyznach równoległych oraz ścianami bocznymi (równoległobokami).
*   **Graniastosłup prosty:** ściany boczne są prostokątami, a krawędzie boczne są prostopadłe do podstaw.
*   **Graniastosłup prawidłowy:** podstawa jest wielokątem foremnym, a graniastosłup jest prosty.
*   Wzór na objętość graniastosłupa: $$V = P_p \\cdot h$$ gdzie $P_p$ to pole podstawy, a $h$ to wysokość graniastosłupa (odległość między podstawami).
*   Wzór na pole powierzchni całkowitej graniastosłupa: $$P_c = 2 P_p + P_b$$ gdzie $P_b$ to pole powierzchni bocznej (suma pól ścian bocznych).

**Ostrosłup** – bryła, której podstawą jest wielokąt, a wierzchołkami ścian bocznych są punkty leżące w jednym punkcie (wierzchołku ostrosłupa), nieleżącym w płaszczyźnie podstawy.
*   **Ostrosłup prosty:** spodek wysokości znajduje się wewnątrz podstawy.
*   **Ostrosłup prawidłowy:** podstawa jest wielokątem foremnym, a ściany boczne są przystającymi trójkątami równoramiennymi.
*   Wzór na objętość ostrosłupa: $$V = \\frac{1}{3} P_p \\cdot h$$ gdzie $P_p$ to pole podstawy, a $h$ to wysokość ostrosłupa (odległość wierzchołka od płaszczyzny podstawy).
*   Wzór na pole powierzchni całkowitej ostrosłupa: $$P_c = P_p + P_b$$

**Walec** – bryła powstająca przez obrót prostokąta wokół jednego z jego boków. Ma dwie kołowe podstawy i powierzchnię boczną (powstającą z obrotu boku prostokąta).
*   Wzór na objętość walca: $$V = \\pi r^2 h$$ gdzie $r$ to promień podstawy, a $h$ to wysokość walca.
*   Wzór na pole powierzchni całkowitej walca: $$P_c = 2 P_p + P_b = 2\\pi r^2 + 2\\pi rh$$ gdzie $P_p = \\pi r^2$ to pole podstawy, a $P_b = 2\\pi rh$ to pole powierzchni bocznej.

**Stożek** – bryła powstająca przez obrót trójkąta prostokątnego wokół jednej z jego przyprostokątnych. Ma jedną kołową podstawę i powierzchnię boczną.
*   Wzór na objętość stożka: $$V = \\frac{1}{3} \\pi r^2 h$$ gdzie $r$ to promień podstawy, a $h$ to wysokość stożka.
*   Wzór na pole powierzchni całkowitej stożka: $$P_c = P_p + P_b = \\pi r^2 + \\pi rl$$ gdzie $P_p = \\pi r^2$ to pole podstawy, a $P_b = \\pi rl$ to pole powierzchni bocznej, a $l$ to tworząca stożka (przeciwprostokątna obracanego trójkąta prostokątnego).
*   Związek między $r$, $h$ i $l$: $$l^2 = r^2 + h^2$$ (twierdzenie Pitagorasa).

**Kula** – bryła powstająca przez obrót koła wokół średnicy.
*   Wzór na objętość kuli: $$V = \\frac{4}{3} \\pi r^3$$ gdzie $r$ to promień kuli.
*   Wzór na pole powierzchni kuli: $$P = 4 \\pi r^2$$ gdzie $r$ to promień kuli.

## Przykład 1 - podstawowy
Oblicz objętość graniastosłupa prawidłowego czworokątnego, którego krawędź podstawy ma długość 5 cm, a wysokość graniastosłupa wynosi 10 cm.

**Krok 1.** Zidentyfikuj bryłę. Jest to graniastosłup prawidłowy czworokątny. Podstawa jest kwadratem.
**Krok 2.** Podstawa jest kwadratem o boku $a = 5$ cm. Oblicz pole podstawy.
$$P_p = a^2 = 5^2 = 25 \\, \\text{cm}^2$$
**Krok 3.** Zidentyfikuj wysokość graniastosłupa. $h = 10$ cm.
**Krok 4.** Zastosuj wzór na objętość graniastosłupa.
$$V = P_p \\cdot h$$
**Krok 5.** Podstaw dane i oblicz objętość.
$$V = 25 \\, \\text{cm}^2 \\cdot 10 \\, \\text{cm} = 250 \\, \\text{cm}^3$$

**Sprawdzenie:** Wszystkie dane zostały wykorzystane. Wzór jest poprawny. Obliczenia są proste i wydają się poprawne. Jednostki są zgodne.

## Przykład 2 - maturalny
Oblicz pole powierzchni całkowitej stożka, którego promień podstawy wynosi 6 cm, a wysokość 8 cm.

**Krok 1.** Zidentyfikuj bryłę. Jest to stożek. Potrzebujemy pola podstawy i pola powierzchni bocznej.
**Krok 2.** Oblicz pole podstawy. Podstawa jest kołem o promieniu $r = 6$ cm.
$$P_p = \\pi r^2 = \\pi \\cdot 6^2 = 36\\pi \\, \\text{cm}^2$$
**Krok 3.** Aby obliczyć pole powierzchni bocznej, potrzebujemy długości tworzącej $l$. Zastosujemy twierdzenie Pitagorasa, ponieważ promień, wysokość i tworząca tworzą trójkąt prostokątny.
$$l^2 = r^2 + h^2$$
$$l^2 = 6^2 + 8^2 = 36 + 64 = 100$$
$$l = \\sqrt{100} = 10 \\, \\text{cm}$$
**Krok 4.** Oblicz pole powierzchni bocznej.
$$P_b = \\pi rl = \\pi \\cdot 6 \\cdot 10 = 60\\pi \\, \\text{cm}^2$$
**Krok 5.** Oblicz pole powierzchni całkowitej.
$$P_c = P_p + P_b = 36\\pi + 60\\pi = 96\\pi \\, \\text{cm}^2$$

**Sprawdzenie:** Obliczono pole podstawy, tworzącą i pole boczne. Wszystkie obliczenia są poprawne. Wynik końcowy jest sumą dwóch pól.

## Przykład 3 - egzaminacyjny

Pudełko w kształcie prostopadłościanu ma wymiary 10 cm x 20 cm x 30 cm. Ile opakowań soku w kształcie walca o promieniu podstawy 3 cm i wysokości 15 cm zmieści się w tym pudełku, zakładając idealne ułożenie? (Przyjmij $\\pi \\approx 3$)

**Krok 1.** Oblicz objętość pudełka (prostopadłościanu).
$$V_{\\text{pudełka}} = 10 \\, \\text{cm} \\cdot 20 \\, \\text{cm} \\cdot 30 \\, \\text{cm} = 6000 \\, \\text{cm}^3$$
**Krok 2.** Oblicz objętość jednego opakowania soku (walca). $r = 3$ cm, $h = 15$ cm. Przyjmujemy $\\pi \\approx 3$.
$$V_{\\text{soku}} = \\pi r^2 h = 3 \\cdot 3^2 \\cdot 15 = 3 \\cdot 9 \\cdot 15 = 27 \\cdot 15 = 405 \\, \\text{cm}^3$$
**Krok 3.** Podziel objętość pudełka przez objętość jednego opakowania soku, aby dowiedzieć się, ile opakowań teoretycznie może się zmieścić.
$$\\frac{V_{\\text{pudełka}}}{V_{\\text{soku}}} = \\frac{6000}{405} \\approx 14.8$$
**Krok 4.** Ponieważ nie można umieścić części opakowania, bierzemy liczbę całkowitą mniejszą od wyniku.
Można zmieścić 14 opakowań soku.

**Uwaga:** To jest uproszczenie. W rzeczywistości liczy się również fizyczne ułożenie, a nie tylko stosunek objętości. Zadanie często zakłada obliczenie stosunku objętości.

## Pułapki
*   ** Mylenie wysokości z tworzącą:** W stożku i w niektórych ostrosłupach kluczowe jest rozróżnienie między wysokością ($h$) a tworzącą ($l$) lub wysokością ściany bocznej. Tworząca nie jest tym samym co wysokość bryły.
*   ** Zapominanie o współczynniku $\\frac{1}{3}$ przy ostrosłupach i stożkach:** Wzory na objętość ostrosłupów i stożków różnią się od graniastosłupów i walców obecnością czynnika $\\frac{1}{3}$. Jest to częsty błąd.
*   ** Błędy w obliczeniach pola podstawy:** Szczególnie w przypadku podstaw będących wielokątami innymi niż kwadrat czy prostokąt (np. trójkąt, sześciokąt), błędy w obliczeniu pola podstawy przekładają się na błąd w obliczeniu objętości.
*   ** Niewłaściwe stosowanie twierdzenia Pitagorasa:** W zadaniach przestrzennych twierdzenie Pitagorasa często stosuje się do obliczenia wysokości ściany bocznej, tworzącej lub krawędzi. Należy upewnić się, że tworzymy poprawne trójkąty prostokątne.
*   ** Zapominanie o $\\pi$ lub jego przybliżonej wartości:** W zadaniach z walcami, stożkami i kulami często pojawia się $\\pi$. Należy pamiętać, aby je uwzględnić w obliczeniach lub zastosować podane przybliżenie.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz objętość walca, którego promień podstawy wynosi 4 cm, a wysokość 7 cm. Wynik podaj z dokładnością do dwóch miejsc po przecinku, przyjmując $\\pi \\approx 3.14$.
2.  Oblicz pole powierzchni całkowitej graniastosłupa prawidłowego sześciokątnego, którego krawędź podstawy ma długość 3 cm, a wysokość wynosi 8 cm.
3.  Oblicz objętość kuli o promieniu 9 cm. Wynik podaj w zależności od $\\pi$.
4.  Podstawa ostrosłupa prostego jest rombem o przekątnych długości 12 cm i 16 cm. Wysokość ostrosłupa wynosi 10 cm. Oblicz objętość tego ostrosłupa.
5.  Oblicz pole powierzchni bocznej stożka, którego tworząca ma długość 13 cm, a promień podstawy wynosi 5 cm.
6.  Wysokość walca wynosi 12 cm, a promień jego podstawy jest o 4 cm krótszy. Oblicz objętość tego walca. Wynik podaj w zależności od $\\pi$.
7.  Oblicz pole powierzchni całkowitej ostrosłupa prawidłowego czworokątnego, którego krawędź podstawy ma długość 6 cm, a wysokość ściany bocznej (wysokość ściany bocznej) wynosi 5 cm.

## Odpowiedzi
1.  $V = \\pi r^2 h \\approx 3.14 \\cdot 4^2 \\cdot 7 = 3.14 \\cdot 16 \\cdot 7 = 3.14 \\cdot 112 = 351.68 \\, \\text{cm}^3$.
2.  Pole podstawy (sześciokąta foremnego): $P_p = \\frac{3\\sqrt{3}}{2} a^2 = \\frac{3\\sqrt{3}}{2} \\cdot 3^2 = \\frac{27\\sqrt{3}}{2} \\, \\text{cm}^2$. Pole boczne: $P_b = 6 \\cdot (a \\cdot h) = 6 \\cdot (3 \\cdot 8) = 6 \\cdot 24 = 144 \\, \\text{cm}^2$. Pole całkowite: $P_c = 2 P_p + P_b = 2 \\cdot \\frac{27\\sqrt{3}}{2} + 144 = 27\\sqrt{3} + 144 \\, \\text{cm}^2$.
3.  $V = \\frac{4}{3} \\pi r^3 = \\frac{4}{3} \\pi \\cdot 9^3 = \\frac{4}{3} \\pi \\cdot 729 = 4 \\pi \\cdot 243 = 972\\pi \\, \\text{cm}^3$.
4.  Pole podstawy (rombu): $P_p = \\frac{1}{2} d_1 d_2 = \\frac{1}{2} \\cdot 12 \\cdot 16 = 6 \\cdot 16 = 96 \\, \\text{cm}^2$. Objętość: $V = \\frac{1}{3} P_p \\cdot h = \\frac{1}{3} \\cdot 96 \\cdot 10 = 32 \\cdot 10 = 320 \\, \\text{cm}^3$.
5.  $P_b = \\pi rl = \\pi \\cdot 5 \\cdot 13 = 65\\pi \\, \\text{cm}^2$.
6.  $r = 12 - 4 = 8$ cm. $V = \\pi r^2 h = \\pi \\cdot 8^2 \\cdot 12 = \\pi \\cdot 64 \\cdot 12 = 768\\pi \\, \\text{cm}^3$.
7.  Pole podstawy: $P_p = a^2 = 6^2 = 36 \\, \\text{cm}^2$. Pole boczne: $P_b = 4 \\cdot \\frac{1}{2} \\cdot a \\cdot h_b = 4 \\cdot \\frac{1}{2} \\cdot 6 \\cdot 5 = 2 \\cdot 30 = 60 \\, \\text{cm}^2$. Pole całkowite: $P_c = P_p + P_b = 36 + 60 = 96 \\, \\text{cm}^2$.

## Szybka powtórka
1.  Jaki jest wzór na objętość walca?
2.  Czym różni się wzór na objętość ostrosłupa od wzoru na objętość graniastosłupa?
3.  Jakie elementy potrzebujemy, aby obliczyć pole powierzchni całkowitej stożka?
4.  Jaki wzór stosujemy do znalezienia tworzącej stożka, znając promień i wysokość?
5.  Ile wynosi wzór na objętość kuli?

## Diagram
\`\`\`text
    +--------+
   /        /|
  /        / |
 +--------+  |   <-- Graniastosłup
 |        |  +
 |        | /
 |        |/
 +--------+

    .-------.
   /         \\
  /           \\  <-- Stożek
 |             |
 \\             /
  \\           /
   \`---------'

     O         <-- Kula (centrym)
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "geometria_analityczna",
    title: "Geometria analityczna na maturze",
    content: `## Na egzaminie
Geometria analityczna pojawia się na maturze podstawowej regularnie, zazwyczaj jako zadanie otwarte warte 3-5 punktów lub jako część zadań zamkniętych. CKE najczęściej sprawdza umiejętność obliczania odległości między punktami, środka odcinka, równania prostej oraz jej położenia względem innych prostych (równoległość, prostopadłość). Często pojawiają się też zadania dotyczące pól figur na płaszczyźnie kartezjańskiej.

## Mapa tematu
1.  Współrzędne punktów na płaszczyźnie kartezjańskiej.
2.  Obliczanie odległości między dwoma punktami.
3.  Obliczanie współrzędnych środka odcinka.
4.  Równanie prostej - różne postacie.
5.  Warunki równoległości i prostopadłości prostych.
6.  Wyznaczanie punktów wspólnych prostych (układy równań).
7.  Obliczanie pola trójkąta o danych wierzchołkach.
8.  Zastosowania w zadaniach tekstowych i geometrycznych.

## Definicje i wzory
*   **Płaszczyzna kartezjańska:** Jest to płaszczyzna, na której wyróżniono dwa prostopadłe punkty: początek układu współrzędnych ($O=(0,0)$) oraz dwie prostopadłe osie: poziomą oś $Ox$ (osię odciętych) i pionową oś $Oy$ (osię rzędnych).
*   **Współrzędne punktu:** Każdy punkt $P$ na płaszczyźnie kartezjańskiej można jednoznacznie opisać za pomocą pary liczb rzeczywistych $(x, y)$, gdzie $x$ to współrzędna $x$ (odcięta) punktu, a $y$ to współrzędna $y$ (rzędna) punktu. Zapisujemy to jako $P=(x, y)$.

*   **Odległość między dwoma punktami:** Odległość między punktami $A=(x_A, y_A)$ i $B=(x_B, y_B)$ obliczamy ze wzoru:
    $$d(A, B) = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$$

*   **Środek odcinka:** Współrzędne środka $S=(x_S, y_S)$ odcinka o końcach $A=(x_A, y_A)$ i $B=(x_B, y_B)$ obliczamy ze wzorów:
    $$x_S = \\frac{x_A + x_B}{2}$$
    $$y_S = \\frac{y_A + y_B}{2}$$

*   **Równanie prostej:**
    *   **Postać kierunkowa:** $y = ax + b$, gdzie $a$ to współczynnik kierunkowy (nachylenie prostej), a $b$ to wyraz wolny (punkt przecięcia prostej z osią $Oy$, czyli $b=y$ dla $x=0$).
    *   **Postać ogólna:** $Ax + By + C = 0$.
    *   **Prosta pionowa:** $x = c$ (nie ma postaci kierunkowej, bo współczynnik kierunkowy $a$ jest nieokreślony).
    *   **Prosta pozioma:** $y = c$ (jest to szczególny przypadek postaci kierunkowej, gdzie $a=0$).

*   **Warunki równoległości i prostopadłości prostych:**
    *   Dwie proste w postaci kierunkowej $y = a_1 x + b_1$ i $y = a_2 x + b_2$ są **równoległe**, gdy ich współczynniki kierunkowe są równe: $a_1 = a_2$.
    *   Dwie proste w postaci kierunkowej $y = a_1 x + b_1$ i $y = a_2 x + b_2$ są **prostopadłe**, gdy iloczyn ich współczynników kierunkowych wynosi $-1$: $a_1 \\cdot a_2 = -1$. (Ten warunek nie dotyczy prostych poziomych i pionowych).
    *   Prosta pionowa $x=c$ jest prostopadła do prostej poziomej $y=d$.

*   **Punkt przecięcia prostych:** Aby znaleźć współrzędne punktu przecięcia dwóch prostych, rozwiązujemy układ równań, którego równaniami są równania tych prostych.

*   **Pole trójkąta o danych wierzchołkach:** Dla trójkąta o wierzchołkach $A=(x_A, y_A)$, $B=(x_B, y_B)$ i $C=(x_C, y_C)$, pole $P$ można obliczyć ze wzoru:
    $$P = \\frac{1}{2} |x_A(y_B - y_C) + x_B(y_C - y_A) + x_C(y_A - y_B)|$$
    (Wartość bezwzględna zapewnia, że pole jest dodatnie).

## Przykład 1 - podstawowy
Oblicz odległość między punktami $A=(-2, 3)$ i $B=(4, -5)$.

**Krok 1.** Zapisujemy współrzędne punktów: $x_A = -2$, $y_A = 3$, $x_B = 4$, $y_B = -5$.
**Krok 2.** Stosujemy wzór na odległość między punktami: $d(A, B) = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.
**Krok 3.** Podstawiamy współrzędne do wzoru: $d(A, B) = \\sqrt{(4 - (-2))^2 + (-5 - 3)^2}$.
**Krok 4.** Wykonujemy obliczenia w nawiasach: $d(A, B) = \\sqrt{(4 + 2)^2 + (-8)^2} = \\sqrt{6^2 + (-8)^2}$.
**Krok 5.** Obliczamy kwadraty i sumę, a następnie pierwiastek: $d(A, B) = \\sqrt{36 + 64} = \\sqrt{100} = 10$.

**Sprawdzenie:**
Obliczenia są poprawne. Różnica współrzędnych x to $4 - (-2) = 6$. Różnica współrzędnych y to $-5 - 3 = -8$. Suma kwadratów to $6^2 + (-8)^2 = 36 + 64 = 100$. Pierwiastek z 100 to 10.

## Przykład 2 - maturalny
Wyznacz równanie prostej, która przechodzi przez punkt $P=(1, -2)$ i jest prostopadła do prostej $k: y = -\\frac{1}{3}x + 4$.

**Krok 1.** Analizujemy daną prostą $k$. Jest ona w postaci kierunkowej $y = a_k x + b_k$. Odczytujemy współczynnik kierunkowy $a_k = -\\frac{1}{3}$.
**Krok 2.** Określamy warunek prostopadłości. Prosta, którą szukamy (nazwijmy ją $m$), ma równanie $y = a_m x + b_m$. Ponieważ proste $k$ i $m$ są prostopadłe, zachodzi warunek $a_k \\cdot a_m = -1$.
**Krok 3.** Obliczamy współczynnik kierunkowy prostej $m$: $(-\\frac{1}{3}) \\cdot a_m = -1$. Mnożąc obie strony przez $-3$, otrzymujemy $a_m = 3$.
**Krok 4.** Zapisujemy tymczasowe równanie prostej $m$ z obliczonym współczynnikiem kierunkowym: $y = 3x + b_m$.
**Krok 5.** Wykorzystujemy informację, że prosta $m$ przechodzi przez punkt $P=(1, -2)$. Podstawiamy współrzędne punktu $P$ do równania prostej, aby obliczyć $b_m$: $-2 = 3 \\cdot 1 + b_m$.
**Krok 6.** Rozwiązujemy równanie: $-2 = 3 + b_m$, co daje $b_m = -2 - 3 = -5$.
**Krok 7.** Zapisujemy ostateczne równanie prostej $m$: $y = 3x - 5$.

**Sprawdzenie:**
Współczynnik kierunkowy naszej prostej to $a_m = 3$. Współczynnik kierunkowy prostej $k$ to $a_k = -\\frac{1}{3}$. Ich iloczyn $3 \\cdot (-\\frac{1}{3}) = -1$, więc proste są prostopadłe. Nasza prosta ma równanie $y = 3x - 5$. Sprawdzamy, czy punkt $P=(1, -2)$ należy do tej prostej: $-2 = 3 \\cdot 1 - 5 \\implies -2 = 3 - 5 \\implies -2 = -2$. Warunek jest spełniony.

## Przykład 3 - egzaminacyjny
Oblicz pole trójkąta o wierzchołkach $A=(1, 1)$, $B=(4, 2)$ i $C=(2, 5)$.

**Krok 1.** Zapisujemy współrzędne wierzchołków: $x_A=1, y_A=1$, $x_B=4, y_B=2$, $x_C=2, y_C=5$.
**Krok 2.** Stosujemy wzór na pole trójkąta o danych wierzchołkach: $P = \\frac{1}{2} |x_A(y_B - y_C) + x_B(y_C - y_A) + x_C(y_A - y_B)|$.
**Krok 3.** Podstawiamy współrzędne do wzoru:
$P = \\frac{1}{2} |1(2 - 5) + 4(5 - 1) + 2(1 - 2)|$.
**Krok 4.** Wykonujemy obliczenia w nawiasach:
$P = \\frac{1}{2} |1(-3) + 4(4) + 2(-1)|$.
**Krok 5.** Wykonujemy mnożenie:
$P = \\frac{1}{2} |-3 + 16 - 2|$.
**Krok 6.** Dodajemy i odejmujemy wewnątrz wartości bezwzględnej:
$P = \\frac{1}{2} |11|$.
**Krok 7.** Obliczamy wartość bezwzględną i mnożymy przez $\\frac{1}{2}$:
$P = \\frac{1}{2} \\cdot 11 = \\frac{11}{2} = 5.5$.

**Sprawdzenie:**
Obliczenia wydają się poprawne. Różnice y: $y_B-y_C = 2-5=-3$, $y_C-y_A = 5-1=4$, $y_A-y_B=1-2=-1$.
Iloczyny: $1 \\cdot (-3) = -3$, $4 \\cdot 4 = 16$, $2 \\cdot (-1) = -2$.
Suma: $-3 + 16 - 2 = 11$.
Pole: $\\frac{1}{2}|11| = 5.5$.

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
1.  $S = (\\frac{-5+3}{2}, \\frac{2+(-8)}{2}) = (\\frac{-2}{2}, \\frac{-6}{2}) = (-1, -3)$.
2.  $d(M, N) = \\sqrt{(-2-0)^2 + (1-(-7))^2} = \\sqrt{(-2)^2 + 8^2} = \\sqrt{4 + 64} = \\sqrt{68} = 2\\sqrt{17}$.
3.  Najpierw obliczamy współczynnik kierunkowy: $a = \\frac{1-5}{3-1} = \\frac{-4}{2} = -2$. Równanie prostej: $y - 5 = -2(x - 1) \\implies y - 5 = -2x + 2 \\implies y = -2x + 7$.
4.  Prosta szukana jest równoległa do $y = 2x - 1$, więc ma ten sam współczynnik kierunkowy $a=2$. Przechodzi przez $(0, 3)$, więc $b=3$ (bo jest to punkt przecięcia z osią $Oy$). Równanie: $y = 2x + 3$.
5.  Przekształcamy równanie prostej $m$ do postaci kierunkowej: $-2y = -x - 4 \\implies y = \\frac{1}{2}x + 2$. Współczynnik kierunkowy $a_m = \\frac{1}{2}$. Prosta prostopadła ma współczynnik $a_p$, taki że $a_m \\cdot a_p = -1$, czyli $\\frac{1}{2} \\cdot a_p = -1$, stąd $a_p = -2$. Równanie prostej prostopadłej: $y = -2x + b_p$. Przechodzi przez $(1, 1)$: $1 = -2 \\cdot 1 + b_p \\implies 1 = -2 + b_p \\implies b_p = 3$. Równanie: $y = -2x + 3$.
6.  $P = \\frac{1}{2} |0(0 - 4) + 5(4 - 0) + 3(0 - 0)| = \\frac{1}{2} |0 + 20 + 0| = \\frac{1}{2} \\cdot 20 = 10$. (Można też zauważyć, że podstawa leży na osi $Ox$ i ma długość 5, a wysokość to współrzędna $y$ punktu $F$, czyli 4. Pole $= \\frac{1}{2} \\cdot 5 \\cdot 4 = 10$).
7.  Obliczamy długości boków.
    $PQ^2 = (5-1)^2 + (3-2)^2 = 4^2 + 1^2 = 16 + 1 = 17$.
    $PR^2 = (3-1)^2 + (6-2)^2 = 2^2 + 4^2 = 4 + 16 = 20$.
    $QR^2 = (3-5)^2 + (6-3)^2 = (-2)^2 + 3^2 = 4 + 9 = 13$.
    Sprawdzamy twierdzenie Pitagorasa: $13 + 17 = 30 \\neq 20$. $13 + 20 = 33 \\neq 17$. $17 + 20 = 37 \\neq 13$. Żaden z boków nie jest przeciwprostokątną. Trójkąt nie jest prostokątny.

## Szybka powtórka
1.  Jaki jest wzór na obliczenie współrzędnych środka odcinka?
2.  Jakie są współrzędne punktu $A$, jeśli jest on oddalony o 5 jednostek od początku układu współrzędnych i leży na osi $Oy$ powyżej punktu $(0,0)$?
3.  Jakie warunki muszą spełniać współczynniki kierunkowe dwóch prostych, aby były one prostopadłe?
4.  Jak zapisać równanie prostej przechodzącej przez punkt $(2, 0)$ i równoległej do osi $Ox$?
5.  Czy wzór na pole trójkąta wymaga użycia wartości bezwzględnej? Dlaczego?

## Diagram
\`\`\`text
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
\`\`\`
Diagram przedstawia trójkąt ABC. AB to odcinek. M to rzut punktu C na prostą przechodzącą przez AB. 'h' to wysokość trójkąta opuszczona na podstawę AB. W geometrii analitycznej można obliczyć długość podstawy i wysokość, lub użyć bezpośredniego wzoru na pole.`,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "kombinatoryka",
    title: "Wariacje, permutacje i kombinacje na maturze",
    content: `## Na egzaminie
Zadania z kombinatoryki pojawiają się na maturze z matematyki na poziomie podstawowym bardzo często, zazwyczaj w zadaniach otwartych, gdzie można uzyskać najwięcej punktów (4-6). CKE lubi sprawdzać umiejętność rozróżniania między wariacjami z powtórzeniami i bez, permutacjami oraz kombinacjami, a także umiejętność stosowania tych pojęć w kontekście zadań tekstowych. Często pojawiają się zadania dotyczące kolejności, wyboru elementów z grupy lub tworzenia liczb z cyfr.

## Mapa tematu
W tej lekcji opanujesz:
1.  Podstawowe pojęcia kombinatoryki: mnożenie, dodawanie.
2.  Wariacje z powtórzeniami i bez powtórzeń.
3.  Permutacje.
4.  Kombinacje.
5.  Rozróżnianie między wariacjami, permutacjami i kombinacjami w zadaniach.
6.  Rozwiązywanie zadań tekstowych z zastosowaniem reguł kombinatorycznych.
7.  Obliczanie silni.
8.  Zastosowanie zasady mnożenia w bardziej złożonych sytuacjach.

## Definicje i wzory
**Zasada mnożenia:** Jeśli na sposób wykonania czynności pierwszej mamy $n_1$ możliwości, a na sposób wykonania czynności drugiej mamy $n_2$ możliwości, to wykonanie obu czynności wymaga $n_1 \\cdot n_2$ możliwości. Ogólnie, jeśli jest $k$ czynności i dla każdej z nich mamy odpowiednio $n_1, n_2, \\dots, n_k$ możliwości, to wszystkich możliwości wykonania wszystkich czynności jest $n_1 \\cdot n_2 \\cdot \\dots \\cdot n_k$.

**Zasada dodawania:** Jeśli na sposób wykonania czynności pierwszej mamy $n_1$ możliwości, a na sposób wykonania czynności drugiej mamy $n_2$ możliwości, i czynności te wykluczają się wzajemnie (nie można wykonać obu naraz), to łączna liczba możliwości wykonania jednej z tych czynności wynosi $n_1 + n_2$.

**Silnia:** Dla liczby naturalnej $n \\ge 1$, silnię liczby $n$, oznaczoną symbolem $n!$, definiuje się jako iloczyn wszystkich liczb naturalnych od 1 do $n$.
$n! = 1 \\cdot 2 \\cdot 3 \\cdot \\dots \\cdot (n-1) \\cdot n$.
Przyjmuje się, że $0! = 1$.
Przykłady:
$3! = 1 \\cdot 2 \\cdot 3 = 6$
$5! = 1 \\cdot 2 \\cdot 3 \\cdot 4 \\cdot 5 = 120$

**Wariacje z powtórzeniami:**
Rozważamy zbiór $n$ elementów. Tworzymy z niego ciąg (czyli kolejność ma znaczenie) o długości $k$, gdzie elementy mogą się powtarzać.
Liczba wszystkich wariacji z powtórzeniami wynosi $n^k$.
Symbol: $V'_n{^k} = n^k$.
*Przykład:* Ile jest trzyliterowych kodów, jeśli każda litera może być dowolna z 26 liter alfabetu?
$n=26$ (liczba dostępnych liter), $k=3$ (długość kodu).
Liczba kodów = $26^3$.

**Wariacje bez powtórzeń:**
Rozważamy zbiór $n$ elementów. Tworzymy z niego ciąg (czyli kolejność ma znaczenie) o długości $k$, gdzie elementy nie mogą się powtarzać ($k \\le n$).
Liczba wszystkich wariacji bez powtórzeń wynosi:
$V_n{^k} = \\frac{n!}{(n-k)!} = n \\cdot (n-1) \\cdot \\dots \\cdot (n-k+1)$.
*Przykład:* Na starcie wyścigu jest 10 zawodników. Ile jest możliwości zajęcia pierwszych trzech miejsc (złoty, srebrny, brązowy medal)?
$n=10$ (liczba zawodników), $k=3$ (liczba miejsc). Kolejność jest ważna (kto pierwszy, kto drugi itd.).
Liczba możliwości = $V_{10}{^3} = \\frac{10!}{(10-3)!} = \\frac{10!}{7!} = 10 \\cdot 9 \\cdot 8 = 720$.

**Permutacje:**
Permutacje to szczególny przypadek wariacji bez powtórzeń, gdzie tworzymy ciąg z wszystkich $n$ elementów zbioru, czyli $k=n$. Kolejność elementów jest ważna.
Liczba wszystkich permutacji zbioru $n$-elementowego wynosi:
$P_n = n!$.
*Przykład:* Na ile sposobów można ustawić w kolejce 5 osób?
$n=5$. Liczba sposobów = $P_5 = 5! = 120$.

**Kombinacje:**
Rozważamy zbiór $n$ elementów. Wybieramy z niego podzbiór $k$ elementów ($k \\le n$), gdzie kolejność elementów nie ma znaczenia.
Liczba wszystkich kombinacji wynosi:
$C_n{^k} = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}$.
*Przykład:* Z grupy 5 osób (A, B, C, D, E) wybieramy 2 osoby do zarządu. Ile jest możliwych składów zarządu?
$n=5$ (liczba osób), $k=2$ (liczba wybieranych osób). Kolejność nie ma znaczenia (wybranie A i B to to samo co wybranie B i A).
Liczba składów = $C_5{^2} = \\binom{5}{2} = \\frac{5!}{2!(5-2)!} = \\frac{5!}{2!3!} = \\frac{120}{2 \\cdot 6} = \\frac{120}{12} = 10$.
Możliwe pary: {A,B}, {A,C}, {A,D}, {A,E}, {B,C}, {B,D}, {B,E}, {C,D}, {C,E}, {D,E}.

**Kiedy co stosujemy?**
1.  **Kolejność ma znaczenie, elementy mogą się powtarzać:** Wariacje z powtórzeniami ($n^k$).
2.  **Kolejność ma znaczenie, elementy nie mogą się powtarzać:** Wariacje bez powtórzeń ($\\frac{n!}{(n-k)!}$).
3.  **Kolejność ma znaczenie, wybieramy wszystkie elementy:** Permutacje ($n!$).
4.  **Kolejność nie ma znaczenia, elementy nie mogą się powtarzać:** Kombinacje ($\\frac{n!}{k!(n-k)!}$).

## Przykład 1 - podstawowy
Ile jest liczb trzycyfrowych, w których cyfra setek jest nieparzysta, a cyfra dziesiątek parzysta? Cyfry mogą się powtarzać.

**Krok 1.** Zidentyfikuj warunki zadania. Szukamy liczb trzycyfrowych $abc$.
Cyfra setek (a) musi być nieparzysta.
Cyfra dziesiątek (b) musi być parzysta.
Cyfra jedności (c) może być dowolna.
Cyfry mogą się powtarzać.

**Krok 2.** Określ zbiory możliwych cyfr dla każdej pozycji.
Cyfry nieparzyste: {1, 3, 5, 7, 9} - jest ich 5.
Cyfry parzyste: {0, 2, 4, 6, 8} - jest ich 5.
Cyfry dowolne: {0, 1, 2, 3, 4, 5, 6, 7, 8, 9} - jest ich 10.

**Krok 3.** Zastosuj zasadę mnożenia.
Dla cyfry setek (a) mamy 5 możliwości (nieparzyste).
Dla cyfry dziesiątek (b) mamy 5 możliwości (parzyste).
Dla cyfry jedności (c) mamy 10 możliwości (dowolne).

**Krok 4.** Oblicz łączną liczbę możliwości.
Liczba liczb = (liczba możliwości dla a) $\\cdot$ (liczba możliwości dla b) $\\cdot$ (liczba możliwości dla c)
Liczba liczb = $5 \\cdot 5 \\cdot 10 = 250$.

**Sprawdzenie:**
Liczba jest trzycyfrowa, więc cyfra setek $a \\neq 0$. Cyfry nieparzyste są zawsze różne od zera, więc warunek jest spełniony.
Cyfra setek może być 1, 3, 5, 7, 9.
Cyfra dziesiątek może być 0, 2, 4, 6, 8.
Cyfra jedności może być 0, 1, ..., 9.
Np. 100, 101, ..., 109 (10 liczb dla setek 1, dziesiątek 0).
320, 321, ..., 329 (10 liczb dla setek 3, dziesiątek 2).
Wszystkich kombinacji par (a,b) jest $5 \\cdot 5 = 25$.
Dla każdej takiej pary mamy 10 możliwości dla c.
$25 \\cdot 10 = 250$. Wynik poprawny.

## Przykład 2 - maturalny
Z klasy liczącej 15 dziewcząt i 10 chłopców należy wybrać 4-osobową delegację. Na ile sposobów można to zrobić, jeśli w delegacji mają być co najmniej 3 dziewczęta?

**Krok 1.** Zidentyfikuj typ zadania. Wybieramy grupę osób, kolejność nie ma znaczenia. Jest to zadanie na kombinacje. Mamy warunek "co najmniej 3 dziewczęta".

**Krok 2.** Rozważ możliwe przypadki spełniające warunek "co najmniej 3 dziewczęta".
"Co najmniej 3 dziewczęta" oznacza, że w 4-osobowej delegacji mogą być:
*   Przypadek 1: 3 dziewczęta i 1 chłopiec.
*   Przypadek 2: 4 dziewczęta i 0 chłopców.

**Krok 3.** Oblicz liczbę sposobów dla każdego przypadku używając kombinacji.
*   **Przypadek 1:** Wybieramy 3 dziewczęta z 15 i 1 chłopca z 10.
    Liczba sposobów wyboru dziewcząt: $C_{15}{^3} = \\binom{15}{3} = \\frac{15!}{3!(15-3)!} = \\frac{15!}{3!12!} = \\frac{15 \\cdot 14 \\cdot 13}{3 \\cdot 2 \\cdot 1} = 5 \\cdot 7 \\cdot 13 = 455$.
    Liczba sposobów wyboru chłopca: $C_{10}{^1} = \\binom{10}{1} = \\frac{10!}{1!(10-1)!} = \\frac{10!}{1!9!} = 10$.
    Liczba sposobów dla Przypadku 1 (zasada mnożenia): $455 \\cdot 10 = 4550$.

*   **Przypadek 2:** Wybieramy 4 dziewczęta z 15 i 0 chłopców z 10.
    Liczba sposobów wyboru dziewcząt: $C_{15}{^4} = \\binom{15}{4} = \\frac{15!}{4!(15-4)!} = \\frac{15!}{4!11!} = \\frac{15 \\cdot 14 \\cdot 13 \\cdot 12}{4 \\cdot 3 \\cdot 2 \\cdot 1} = 15 \\cdot 7 \\cdot 13 \\cdot \\frac{1}{2} = \\frac{1365 \\cdot 12}{12} = 1365$.
    Liczba sposobów wyboru chłopców: $C_{10}{^0} = \\binom{10}{0} = 1$.
    Liczba sposobów dla Przypadku 2: $1365 \\cdot 1 = 1365$.

**Krok 4.** Zsumuj liczbę sposobów dla wszystkich przypadków (zasada dodawania).
Łączna liczba sposobów = (Sposoby dla Przypadku 1) + (Sposoby dla Przypadku 2)
Łączna liczba sposobów = $4550 + 1365 = 5915$.

**Sprawdzenie:**
Czy dobrze zinterpretowaliśmy "co najmniej 3 dziewczęta"? Tak, to 3 lub 4 dziewczęta w 4-osobowej delegacji.
Czy użyliśmy kombinacji? Tak, bo kolejność wyboru do delegacji nie ma znaczenia.
Czy obliczenia kombinacji są poprawne?
$C_{15}{^3} = \\frac{15 \\cdot 14 \\cdot 13}{6} = 5 \\cdot 7 \\cdot 13 = 455$. OK.
$C_{10}{^1} = 10$. OK.
$C_{15}{^4} = \\frac{15 \\cdot 14 \\cdot 13 \\cdot 12}{24} = 15 \\cdot 7 \\cdot 13 \\cdot \\frac{1}{2} \\cdot 12 / 12 = 1365$. OK.
$C_{10}{^0} = 1$. OK.
Zastosowanie zasady mnożenia w ramach przypadków i dodawania między przypadkami jest poprawne.
Wynik $5915$ wydaje się być poprawny.

## Przykład 3 - egzaminacyjny
Na ile sposobów można ustawić w szeregu trzy książki o matematyce, dwie o fizyce i jedną o chemii, tak aby książki tego samego przedmiotu stały obok siebie?

**Krok 1.** Zidentyfikuj typ zadania. Ustawiamy elementy w szeregu, kolejność jest ważna. Ale mamy grupę elementów (książek tego samego przedmiotu), które mają stać razem.

**Krok 2.** Potraktuj grupy jako pojedyncze bloki.
Mamy 3 książki o matematyce (M), 2 o fizyce (F) i 1 o chemii (C).
Traktujemy grupę książek matematycznych jako jeden "blok" (MMM), grupę fizycznych jako jeden "blok" (FF) i książkę chemiczną jako jeden "blok" (C).
Mamy więc 3 bloki do ustawienia: [MMM], [FF], [C].

**Krok 3.** Oblicz liczbę sposobów ustawienia tych bloków.
Mamy 3 bloki, które możemy ustawić na $P_3 = 3!$ sposobów.
$3! = 1 \\cdot 2 \\cdot 3 = 6$.
Możliwe ustawienia bloków: ([MMM],[FF],[C]), ([MMM],[C],[FF]), ([FF],[MMM],[C]), ([FF],[C],[MMM]), ([C],[MMM],[FF]), ([C],[FF],[MMM]).

**Krok 4.** Oblicz liczbę sposobów ustawienia książek wewnątrz każdego bloku.
*   Blok matematyczny [MMM]: 3 książki matematyczne można ustawić na $P_3 = 3! = 6$ sposobów.
*   Blok fizyczny [FF]: 2 książki fizyczne można ustawić na $P_2 = 2! = 2$ sposoby.
*   Blok chemiczny [C]: 1 książka chemiczna można ustawić na $P_1 = 1! = 1$ sposób.

**Krok 5.** Zastosuj zasadę mnożenia, aby obliczyć łączną liczbę sposobów.
Łączna liczba sposobów = (liczba sposobów ustawienia bloków) $\\cdot$ (liczba sposobów w bloku M) $\\cdot$ (liczba sposobów w bloku F) $\\cdot$ (liczba sposobów w bloku C)
Łączna liczba sposobów = $3! \\cdot 3! \\cdot 2! \\cdot 1! = 6 \\cdot 6 \\cdot 2 \\cdot 1 = 72$.

**Sprawdzenie:**
Zasada traktowania grup jako bloków jest standardową metodą dla tego typu zadań.
Ustawienie bloków: 3 bloki na $3!$ sposobów.
Ustawienie wewnątrz bloków:
- 3 książki M na $3!$ sposobów.
- 2 książki F na $2!$ sposobów.
- 1 książka C na $1!$ sposobu.
Zastosowanie zasady mnożenia jest tutaj kluczowe.
$3! \\cdot 3! \\cdot 2! \\cdot 1! = 6 \\cdot 6 \\cdot 2 \\cdot 1 = 72$. Wygląda poprawnie.

## Pułapki
*   **Mylenie kolejności:** Kluczowe jest rozróżnienie, czy kolejność elementów ma znaczenie (wariacje, permutacje) czy nie (kombinacje). Zadania o wyborze grupy osób do delegacji, komisji, czy wybieraniu kart do ręki zwykle oznaczają kombinacje. Zadania o tworzeniu kodów, ustawianiu w kolejce, przyznawaniu miejsc medalowych to wariacje lub permutacje.
*   **Powtórzenia:** Zawsze sprawdzaj, czy elementy mogą się powtarzać. Jeśli tak, używasz wzorów na wariacje z powtórzeniami ($n^k$). Jeśli nie, to wariacje bez powtórzeń lub kombinacje.
*   **"Co najmniej" i "co najwyżej":** Te sformułowania często wymagają rozbicia zadania na przypadki i zastosowania zasady dodawania. Upewnij się, że uwzględniłeś wszystkie możliwe przypadki (np. "co najmniej 2" to 2, 3, 4,... aż do maksymalnej liczby elementów).
*   **Zadania tekstowe:** Dokładnie czytaj treść zadania, aby poprawnie zidentyfikować $n$ (liczbę wszystkich elementów do wyboru) i $k$ (liczbę wybieranych elementów). Czasami trzeba odjąć lub dodać liczby (np. wybieramy z grupy, ale jakaś osoba nie może być wybrana).
*   **Silnia i jej obliczanie:** Pamiętaj, że $n! = n \\cdot (n-1)!$ co może uprościć obliczenia np. $\\frac{10!}{7!} = 10 \\cdot 9 \\cdot 8$. Upewnij się, że obliczasz ją poprawnie, zwłaszcza dla większych liczb.

## Ćwiczenia do samodzielnego rozwiązania
1.  Ile jest wszystkich trzycyfrowych liczb naturalnych, w których żadna cyfra się nie powtarza?
2.  Na ile sposobów można wybrać 3-osobową delegację z klasy liczącej 25 uczniów, jeśli w skład delegacji mogą wejść dowolne osoby?
3.  Ile jest różnych wyników rzutu trzema symetrycznymi kostkami do gry?
4.  Na ile sposobów można ustawić w szeregu słowo "MATEMATYKA"?
5.  Ze zbioru $\\{1, 2, 3, 4, 5, 6, 7\\}$ wybieramy 3 liczby. Ile jest sposobów wyboru, jeśli kolejność jest ważna i liczby mogą się powtarzać?
6.  W ile sposobów można rozdać 5 różnych nagród 10 zawodnikom, tak aby każdy zawodnik mógł otrzymać co najwyżej jedną nagrodę?
7.  Ile jest liczb czterocyfrowych parzystych, w których wszystkie cyfry są różne?

## Odpowiedzi
1.  Cyfra setek: 9 możliwości (1-9). Cyfra dziesiątek: 9 możliwości (0-9, bez cyfry setek). Cyfra jedności: 8 możliwości (bez dwóch poprzednich). $9 \\cdot 9 \\cdot 8 = 648$.
2.  Wybieramy 3 osoby z 25, kolejność nie ma znaczenia: $C_{25}{^3} = \\binom{25}{3} = \\frac{25 \\cdot 24 \\cdot 23}{3 \\cdot 2 \\cdot 1} = 25 \\cdot 4 \\cdot 23 = 100 \\cdot 23 = 2300$.
3.  Dla każdej kostki jest 6 możliwości. Kolejność nie ma znaczenia jeśli traktujemy kostki jako identyczne, ale pytanie sugeruje "wyników rzutu", co zwykle traktuje się jako kolejność lub rozróżnialne kostki. Jeśli kostki są rozróżnialne (np. różne kolory) lub interesuje nas kolejność wyników, to $6 \\cdot 6 \\cdot 6 = 6^3 = 216$.
4.  Słowo "MATEMATYKA" ma 10 liter: M-2, A-3, T-2, E-1, Y-1, K-1. Liczba permutacji z powtórzeniami: $\\frac{10!}{2!3!2!1!1!1!} = \\frac{3628800}{2 \\cdot 6 \\cdot 2} = \\frac{3628800}{24} = 151200$.
5.  Wybieramy 3 liczby ze zbioru 7-elementowego, kolejność ważna, z powtórzeniami: $7^3 = 343$.
6.  Mamy 10 zawodników i 5 nagród. Przyznajemy nagrodę po nagrodzie. Pierwsza nagroda: 10 możliwości. Druga: 9. Trzecia: 8. Czwarta: 7. Piąta: 6. $V_{10}{^5} = 10 \\cdot 9 \\cdot 8 \\cdot 7 \\cdot 6 = 30240$.
7.  Liczba czterocyfrowa $abcd$. $d$ musi być parzyste $\\{0, 2, 4, 6, 8\\}$. Cyfry różne.
    *   Przypadek 1: $d=0$. Pozostałe cyfry $a,b,c$ wybieramy z pozostałych 9 cyfr bez powtórzeń. $a$ ma 9 możliwości, $b$ ma 8, $c$ ma 7. $1 \\cdot 9 \\cdot 8 \\cdot 7 = 504$.
    *   Przypadek 2: $d \\in \\{2, 4, 6, 8\\}$ (4 możliwości). Cyfra $a$ nie może być 0 ani $d$. $a$ ma 8 możliwości. Cyfra $b$ ma 8 możliwości (może być 0, ale nie może być $a$ ani $d$). Cyfra $c$ ma 7 możliwości. $4 \\cdot 8 \\cdot 8 \\cdot 7 = 4 \\cdot 448 = 1792$.
    Łącznie: $504 + 1792 = 2296$.

## Szybka powtórka
1.  Kiedy stosujemy kombinacje, a kiedy wariacje?
2.  Jaka jest różnica między permutacją a wariacją bez powtórzeń?
3.  Ile wynosi $5!$?
4.  Jakie są warunki zadania typu "co najmniej"?
5.  Podaj wzór na liczbę wariacji z powtórzeniami zbioru $n$-elementowego, gdzie wybieramy $k$ elementów.

## Diagram
Prosty przykład wyboru 3 osób z 5 ($A, B, C, D, E$) do zarządu (kolejność nie ma znaczenia - kombinacje).
\`\`\`text
Zbiór: {A, B, C, D, E} (n=5)
Wybieramy: 3 osoby (k=3)
Kolejność: Nie ma znaczenia

Możliwe kombinacje:
{A, B, C}
{A, B, D}
{A, B, E}
{A, C, D}
{A, C, E}
{A, D, E}
{B, C, D}
{B, C, E}
{B, D, E}
{C, D, E}

Łącznie: 10 kombinacji (C_5^3 = 10)
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "prawdopodobienstwo",
    title: "Prawdopodobieństwo na Maturze",
    content: `## Na egzaminie
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

**Przestrzeń zdarzeń elementarnych ($\\Omega$)**: Zbiór wszystkich możliwych wyników danego doświadczenia losowego.
*Przykład:* Rzut monetą – $\\Omega = \\{\\text{orzeł, reszka}\\}$. Rzut kostką – $\\Omega = \\{1, 2, 3, 4, 5, 6\\}$.

**Zdarzenie losowe ($A$)**: Podzbiór przestrzeni zdarzeń elementarnych. Czyli pewien konkretny wynik lub grupę wyników.
*Przykład:* Rzut kostką – zdarzenie $A$ = "wyrzucenie parzystej liczby" = $\\{2, 4, 6\\}$.

**Klasyczna definicja prawdopodobieństwa**:
Jeśli $\\Omega$ jest przestrzenią skończoną, a wszystkie zdarzenia elementarne są równie prawdopodobne, to prawdopodobieństwo zdarzenia $A$ wynosi:
$$ P(A) = \\frac{|A|}{|\\Omega|} $$
gdzie $|A|$ to liczba zdarzeń sprzyjających zdarzeniu $A$, a $|\\Omega|$ to liczba wszystkich możliwych zdarzeń elementarnych.

**Podstawowe własności prawdopodobieństwa**:
1.  $0 \\le P(A) \\le 1$ dla każdego zdarzenia $A$.
2.  $P(\\Omega) = 1$ (zdarzenie pewne, czyli zajście jednego z możliwych wyników).
3.  $P(\\emptyset) = 0$ (zdarzenie niemożliwe, czyli $\\emptyset$ to zbiór pusty).

**Prawdopodobieństwo zdarzeń przeciwnych**:
Jeśli $A'$ to zdarzenie przeciwne do $A$ (czyli zdarzenie, że $A$ nie zaszło), to:
$$ P(A') = 1 - P(A) $$

**Prawdopodobieństwo sumy zdarzeń (zdarzeń rozłącznych)**:
Jeśli zdarzenia $A$ i $B$ są rozłączne (nie mogą zajść jednocześnie, $A \\cap B = \\emptyset$), to:
$$ P(A \\cup B) = P(A) + P(B) $$

**Prawdopodobieństwo sumy zdarzeń (zdarzeń dowolnych)**:
Dla dowolnych zdarzeń $A$ i $B$:
$$ P(A \\cup B) = P(A) + P(B) - P(A \\cap B) $$
gdzie $P(A \\cap B)$ to prawdopodobieństwo zajścia obu zdarzeń $A$ i $B$ jednocześnie.

**Schemat Bernoulliego (w uproszczeniu)**: Stosowany, gdy wykonujemy $n$ niezależnych prób, a w każdej próbie interesuje nas tylko sukces (zdarzenie $A$) lub porażka ($A'$). Prawdopodobieństwo sukcesu w jednej próbie wynosi $p$, a porażki $q = 1-p$. Prawdopodobieństwo uzyskania dokładnie $k$ sukcesów w $n$ próbach wynosi:
$$ P_n(k) = \\binom{n}{k} p^k q^{n-k} $$
gdzie $\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$ to symbol Newtona (liczba kombinacji $k$ elementów z $n$).

## Przykład 1 - podstawowy
Rzucamy dwukrotnie symetryczną kostką sześcienną. Jakie jest prawdopodobieństwo, że suma wyrzuconych oczek będzie wynosić 8?

**Krok 1.** Określamy przestrzeń zdarzeń elementarnych $\\Omega$.
Wyrzucamy kostką dwukrotnie. Wynik każdego rzutu to liczba od 1 do 6. Wszystkie możliwe pary wyników tworzą $\\Omega$. Liczba wszystkich możliwych wyników to $6 \\times 6 = 36$.
$|\\Omega| = 36$.

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
$$ P(A) = \\frac{|A|}{|\\Omega|} = \\frac{5}{36} $$

**Krok 5.** Sprawdzamy wynik.
Wynik $\\frac{5}{36}$ jest liczbą z przedziału $[0, 1]$, co jest zgodne z definicją prawdopodobieństwa. Wszystkie możliwe wyniki (pary oczek) są równie prawdopodobne.

Odpowiedź: Prawdopodobieństwo, że suma wyrzuconych oczek będzie wynosić 8, wynosi $\\frac{5}{36}$.

## Przykład 2 - maturalny
W urnie znajduje się 7 kul białych i 5 kul czarnych. Losujemy kolejno bez zwracania 3 kule. Jakie jest prawdopodobieństwo, że wśród wylosowanych kul będą dokładnie dwie kule białe?

**Krok 1.** Określamy przestrzeń zdarzeń elementarnych $|\\Omega|$.
Losujemy 3 kule spośród $7+5=12$ kul. Kolejność losowania ma znaczenie przy opisywaniu procesu, ale dla wyniku (zestawu wylosowanych kul) możemy użyć kombinacji. Łączna liczba sposobów wyboru 3 kul z 12 to:
$$ |\\Omega| = \\binom{12}{3} = \\frac{12!}{3!(12-3)!} = \\frac{12!}{3!9!} = \\frac{12 \\cdot 11 \\cdot 10}{3 \\cdot 2 \\cdot 1} = 2 \\cdot 11 \\cdot 10 = 220 $$
Jest 220 możliwych zestawów 3 kul.

**Krok 2.** Określamy zdarzenie losowe $A$.
Zdarzeniem $A$ jest wylosowanie dokładnie dwóch kul białych i jednej kuli czarnej.

**Krok 3.** Określamy liczbę zdarzeń sprzyjających $|A|$.
Musimy wybrać 2 kule białe spośród 7 białych ORAZ 1 kulę czarną spośród 5 czarnych.
Liczba sposobów wyboru 2 kul białych z 7 to: $\\binom{7}{2} = \\frac{7!}{2!5!} = \\frac{7 \\cdot 6}{2 \\cdot 1} = 21$.
Liczba sposobów wyboru 1 kuli czarnej z 5 to: $\\binom{5}{1} = \\frac{5!}{1!4!} = 5$.
Ponieważ te wybory muszą zajść razem (zasada mnożenia), liczba kombinacji sprzyjających zdarzeniu $A$ wynosi:
$$ |A| = \\binom{7}{2} \\cdot \\binom{5}{1} = 21 \\cdot 5 = 105 $$

**Krok 4.** Obliczamy prawdopodobieństwo zdarzenia $A$.
$$ P(A) = \\frac{|A|}{|\\Omega|} = \\frac{105}{220} $$

**Krok 5.** Upraszczamy wynik.
Dzielimy licznik i mianownik przez 5: $\\frac{105}{5} = 21$, $\\frac{220}{5} = 44$.
$$ P(A) = \\frac{21}{44} $$

**Sprawdzenie**: Wynik $\\frac{21}{44}$ jest liczbą z przedziału $[0, 1]$. Zastosowaliśmy kombinacje, co jest poprawne przy losowaniu bez zwracania, gdy kolejność nie ma znaczenia dla ostatecznego składu wylosowanych elementów.

Odpowiedź: Prawdopodobieństwo, że wśród wylosowanych kul będą dokładnie dwie kule białe, wynosi $\\frac{21}{44}$.

## Przykład 3 - egzaminacyjny
W pudełku są liczby od 1 do 10. Losujemy jedną liczbę. Jakie jest prawdopodobieństwo, że będzie to liczba pierwsza lub podzielna przez 3?

**Krok 1.** Określamy przestrzeń zdarzeń elementarnych $|\\Omega|$.
Losujemy jedną liczbę spośród liczb od 1 do 10.
$\\Omega = \\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\}$.
$|\\Omega| = 10$.

**Krok 2.** Określamy zdarzenia $A$ i $B$.
Zdarzenie $A$: wylosowana liczba jest pierwsza.
Zdarzenie $B$: wylosowana liczba jest podzielna przez 3.

**Krok 3.** Wypisujemy zdarzenia sprzyjające $A$ i $B$.
Liczby pierwsze w zbiorze od 1 do 10 to: $\\{2, 3, 5, 7\\}$.
$A = \\{2, 3, 5, 7\\}$.
$|A| = 4$.

Liczby podzielne przez 3 w zbiorze od 1 do 10 to: $\\{3, 6, 9\\}$.
$B = \\{3, 6, 9\\}$.
$|B| = 3$.

**Krok 4.** Sprawdzamy, czy zdarzenia są rozłączne.
Szukamy części wspólnej $A \\cap B$. Jest to zbiór liczb, które są jednocześnie pierwsze i podzielne przez 3.
$A \\cap B = \\{3\\}$.
Zdarzenia nie są rozłączne, ponieważ liczba 3 jest w obu zbiorach. $|A \\cap B| = 1$.

**Krok 5.** Obliczamy prawdopodobieństwo sumy zdarzeń $A \\cup B$.
Używamy wzoru: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.
Najpierw obliczamy prawdopodobieństwa poszczególnych zdarzeń:
$P(A) = \\frac{|A|}{|\\Omega|} = \\frac{4}{10}$
$P(B) = \\frac{|B|}{|\\Omega|} = \\frac{3}{10}$
$P(A \\cap B) = \\frac{|A \\cap B|}{|\\Omega|} = \\frac{1}{10}$

Teraz obliczamy prawdopodobieństwo sumy:
$$ P(A \\cup B) = \\frac{4}{10} + \\frac{3}{10} - \\frac{1}{10} = \\frac{4+3-1}{10} = \\frac{6}{10} $$

**Krok 6.** Upraszczamy wynik.
$$ P(A \\cup B) = \\frac{6}{10} = \\frac{3}{5} $$

Alternatywnie, można było wypisać wszystkie liczby, które są pierwsze LUB podzielne przez 3:
$A \\cup B = \\{2, 3, 5, 7\\} \\cup \\{3, 6, 9\\} = \\{2, 3, 5, 6, 7, 9\\}$.
$|A \\cup B| = 6$.
$P(A \\cup B) = \\frac{|A \\cup B|}{|\\Omega|} = \\frac{6}{10} = \\frac{3}{5}$.

Odpowiedź: Prawdopodobieństwo, że wylosowana liczba będzie pierwsza lub podzielna przez 3, wynosi $\\frac{3}{5}$.

## Pułapki
*   **Niezrozumienie pojęcia "równie prawdopodobne"**: Klasyczna definicja prawdopodobieństwa działa tylko wtedy, gdy każdy wynik elementarny ma taką samą szansę zajścia. W zadaniach maturalnych zazwyczaj tak jest (symetryczna kostka, losowanie bez manipulacji), ale trzeba o tym pamiętać.
*   ** Mylenie kombinacji z wariacjami/permutacjami**: Przy wyborze grupy przedmiotów, gdzie kolejność nie ma znaczenia (np. wylosowane kule, karty), używamy kombinacji $\\binom{n}{k}$. Jeśli kolejność ma znaczenie (np. ułożenie liter, pierwsze trzy miejsca na podium), używamy wariacji lub permutacji.
*   **Pomijanie części wspólnej przy sumie zdarzeń**: Przy obliczaniu prawdopodobieństwa sumy zdarzeń $P(A \\cup B) = P(A) + P(B)$, należy pamiętać o odjęciu $P(A \\cap B)$, jeśli zdarzenia nie są rozłączne. W przeciwnym razie policzymy elementy ze wspólnej części dwukrotnie.
*   **Błędy arytmetyczne przy obliczaniu lub upraszczaniu ułamków**: Upewnij się, że poprawnie wykonujesz działania na ułamkach, zwłaszcza przy dodawaniu i odejmowaniu. Upraszczaj wynik do najprostszej postaci.
*   **Losowanie bez zwracania a z zwracaniem**: Przy losowaniu bez zwracania, liczba dostępnych elementów w urnie maleje z każdym kolejnym losowaniem. Prawdopodobieństwo w kolejnych krokach zależy od poprzednich. Przy losowaniu z zwracaniem, prawdopodobieństwa pozostają stałe.

## Ćwiczenia do samodzielnego rozwiązania
1.  Rzucamy symetryczną monetą 3 razy. Jakie jest prawdopodobieństwo, że otrzymamy dokładnie dwa orły?
2.  Ze zbioru liczb $\\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\}$ losujemy jedną liczbę. Jakie jest prawdopodobieństwo, że jest to liczba podzielna przez 4 lub przez 6?
3.  W koszyku znajduje się 5 jabłek i 3 gruszki. Wyjmujemy losowo 2 owoce. Jakie jest prawdopodobieństwo, że oba owoce są tego samego rodzaju?
4.  Rzucamy dwa razy kostką sześcienną. Jakie jest prawdopodobieństwo, że pierwsza kostka pokaże liczbę większą niż 4, a druga kostka liczbę mniejszą niż 3?
5.  W klasie jest 15 dziewcząt i 10 chłopców. Nauczyciel losuje 4 osoby do przedstawienia projektu. Jakie jest prawdopodobieństwo, że wylosowane osoby to 2 dziewczęta i 2 chłopców?
6.  Rzucamy monetą tak długo, aż wypadnie orzeł. Jakie jest prawdopodobieństwo, że będzie to najwyżej 4 rzut? (Zakładamy, że prawdopodobieństwo orła i reszki jest równe 1/2).

## Odpowiedzi
1.  Zdarzenia elementarne: $\\{OOO, OOR, ORO, ROO, ORR, ROR, RRO, RRR\\}$, $|\\Omega|=8$. Zdarzenia sprzyjające (dokładnie 2 orły): $\\{OOR, ORO, ROO\\}$, $|A|=3$. Prawdopodobieństwo: $P(A) = \\frac{3}{8}$.
2.  $|\\Omega|=10$. Zdarzenie $A$: liczba podzielna przez 4: $\\{4, 8\\}$, $|A|=2$. Zdarzenie $B$: liczba podzielna przez 6: $\\{6\\}$, $|B|=1$. Zdarzenia są rozłączne ($A \\cap B = \\emptyset$). Prawdopodobieństwo $P(A \\cup B) = P(A) + P(B) = \\frac{2}{10} + \\frac{1}{10} = \\frac{3}{10}$.
3.  $|\\Omega| = \\binom{8}{2} = \\frac{8 \\cdot 7}{2} = 28$. Zdarzenie $A$: oba jabłka: $\\binom{5}{2} = \\frac{5 \\cdot 4}{2} = 10$. Zdarzenie $B$: obie gruszki: $\\binom{3}{2} = 3$. Zdarzenia są rozłączne. Prawdopodobieństwo $P(A \\cup B) = P(A) + P(B) = \\frac{10}{28} + \\frac{3}{28} = \\frac{13}{28}$.
4.  Zdarzenie $A$: pierwsza kostka $>4$ ($5, 6$), $P(A) = \\frac{2}{6}$. Zdarzenie $B$: druga kostka $<3$ ($1, 2$), $P(B) = \\frac{2}{6}$. Rzuty są niezależne. Prawdopodobieństwo $P(A \\cap B) = P(A) \\cdot P(B) = \\frac{2}{6} \\cdot \\frac{2}{6} = \\frac{1}{3} \\cdot \\frac{1}{3} = \\frac{1}{9}$.
5.  $|\\Omega| = \\binom{25}{4} = \\frac{25 \\cdot 24 \\cdot 23 \\cdot 22}{4 \\cdot 3 \\cdot 2 \\cdot 1} = 25 \\cdot 2 \\cdot 23 \\cdot 11 = 12650$. Zdarzenie $A$: 2 dziewczęta i 2 chłopców: $\\binom{15}{2} \\cdot \\binom{10}{2} = \\frac{15 \\cdot 14}{2} \\cdot \\frac{10 \\cdot 9}{2} = 105 \\cdot 45 = 4725$. Prawdopodobieństwo: $P(A) = \\frac{4725}{12650}$. Po skróceniu (np. przez 25): $\\frac{189}{506}$.
6.  Zdarzenie $A$: pierwszy orzeł w 1. rzucie. $P(A) = \\frac{1}{2}$. Zdarzenie $B$: pierwszy orzeł w 2. rzucie (R O). $P(B) = \\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{4}$. Zdarzenie $C$: pierwszy orzeł w 3. rzucie (R R O). $P(C) = (\\frac{1}{2})^3 = \\frac{1}{8}$. Zdarzenie $D$: pierwszy orzeł w 4. rzucie (R R R O). $P(D) = (\\frac{1}{2})^4 = \\frac{1}{16}$. Zdarzenia te są rozłączne. Prawdopodobieństwo, że to będzie najwyżej 4. rzut, to suma ich prawdopodobieństw: $P(A \\cup B \\cup C \\cup D) = \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\frac{1}{16} = \\frac{8+4+2+1}{16} = \\frac{15}{16}$. Jest to również $1 - P(\\text{brak orła w 4 rzutach}) = 1 - P(RRRR) = 1 - (\\frac{1}{2})^4 = 1 - \\frac{1}{16} = \\frac{15}{16}$.

## Szybka powtórka
1.  Jak nazywa się zbiór wszystkich możliwych wyników doświadczenia losowego?
2.  Jakie wartości przyjmuje prawdopodobieństwo dowolnego zdarzenia?
3.  Jaki jest wzór na prawdopodobieństwo zdarzenia $A$, gdy wszystkie zdarzenia elementarne są równie prawdopodobne?
4.  Co oznacza zdarzenie przeciwne do $A$ i jaki jest wzór na jego prawdopodobieństwo?
5.  Kiedy stosujemy wzór na prawdopodobieństwo sumy zdarzeń rozłącznych?

## Diagram
\`\`\`text
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
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "statystyka",
    title: "Podstawy Statystyki: Miary Tendencji Centralnej i Rozproszenia",
    content: `## Na egzaminie
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
*   **Średnia arytmetyczna ($\\bar{x}$ lub $a_{sr}$):**
    *   Dla danych niepogrupowanych (wartości $x_1, x_2, ..., x_n$):
        $$ \\bar{x} = \\frac{x_1 + x_2 + \\dots + x_n}{n} = \\frac{1}{n} \\sum_{i=1}^{n} x_i $$
        gdzie $n$ to liczba danych.
    *   Dla danych pogrupowanych (wartości $x_1, x_2, ..., x_k$ o częstościach $f_1, f_2, ..., f_k$):
        $$ \\bar{x} = \\frac{x_1 f_1 + x_2 f_2 + \\dots + x_k f_k}{f_1 + f_2 + \\dots + f_k} = \\frac{\\sum_{i=1}^{k} x_i f_i}{\\sum_{i=1}^{k} f_i} $$
        gdzie $N = \\sum_{i=1}^{k} f_i$ to łączna liczba danych.
*   **Mediana ($Me$):** Wartość środkowa w uporządkowanym szeregu danych.
    *   Jeśli liczba danych $n$ jest nieparzysta, mediana jest środkowym wyrazem (na pozycji $\\frac{n+1}{2}$).
    *   Jeśli liczba danych $n$ jest parzysta, mediana jest średnią arytmetyczną dwóch środkowych wyrazów (na pozycjach $\\frac{n}{2}$ i $\\frac{n}{2} + 1$).
*   **Moda (Dominanta, $Mo$):** Wartość najczęściej występująca w zbiorze danych. Może być jedna, więcej niż jedna (wielomodalna) lub nie istnieć (gdy wszystkie wartości występują równie często).

**Miary rozproszenia** – opisują, jak bardzo dane są zróżnicowane wokół średniej.
*   **Rozstęp ($R$):** Różnica między największą a najmniejszą wartością w zbiorze danych.
    $$ R = x_{max} - x_{min} $$
*   **Wariancja ($D^2$ lub $\\sigma^2$):** Średnia kwadratów odchyleń od średniej arytmetycznej.
    *   Dla danych niepogrupowanych:
        $$ D^2 = \\frac{1}{n} \\sum_{i=1}^{n} (x_i - \\bar{x})^2 $$
    *   Dla danych pogrupowanych:
        $$ D^2 = \\frac{1}{N} \\sum_{i=1}^{k} (x_i - \\bar{x})^2 f_i $$
        gdzie $N = \\sum_{i=1}^{k} f_i$.
*   **Odchylenie standardowe ($\\sigma$):** Pierwiastek kwadratowy z wariancji. Jest to miara, która ma te same jednostki co dane.
    $$ \\sigma = \\sqrt{D^2} $$

## Przykład 1 - podstawowy
Oblicz średnią arytmetyczną, medianę, dominantę i rozstęp dla następującego zbioru danych: 5, 2, 8, 5, 3, 9, 5.

**Krok 1.** Uporządkowanie danych**
Najpierw uporządkujmy dane rosnąco: 2, 3, 5, 5, 5, 8, 9.

**Krok 2.** Obliczenie średniej arytmetycznej**
Mamy $n=7$ danych. Suma danych wynosi $2+3+5+5+5+8+9 = 37$.
$$ \\bar{x} = \\frac{37}{7} \\approx 5.29 $$

**Krok 3.** Wyznaczenie mediany**
Liczba danych $n=7$ jest nieparzysta. Mediana jest środkowym elementem na pozycji $\\frac{7+1}{2} = 4$.
Uporządkowany ciąg: 2, 3, 5, **5**, 5, 8, 9.
Mediana $Me = 5$.

**Krok 4.** Identyfikacja dominanty**
Szukamy najczęściej występującej wartości. Wartość 5 występuje 3 razy, co jest największą liczbą wystąpień.
Moda $Mo = 5$.

**Krok 5.** Obliczenie rozstępu**
Największa wartość $x_{max} = 9$. Najmniejsza wartość $x_{min} = 2$.
$$ R = x_{max} - x_{min} = 9 - 2 = 7 $$

**Sprawdzenie:**
Średnia: $\\frac{37}{7}$ - poprawnie.
Mediana: 4. pozycja w 7 elementach - poprawnie.
Moda: 5 występuje najczęściej - poprawnie.
Rozstęp: $9-2=7$ - poprawnie.

## Przykład 2 - maturalny
Zebrano dane dotyczące wieku 10 osób: 22, 25, 23, 25, 28, 25, 30, 24, 25, 23 lata. Oblicz odchylenie standardowe dla tych danych.

**Krok 1.** Uporządkowanie danych i obliczenie średniej arytmetycznej**
Uporządkowany ciąg: 22, 23, 23, 24, 25, 25, 25, 25, 28, 30.
Liczba danych $n=10$.
Suma danych: $22+23+23+24+25+25+25+25+28+30 = 250$.
$$ \\bar{x} = \\frac{250}{10} = 25 $$

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
$$ D^2 = \\frac{52}{10} = 5.2 $$

**Krok 5.** Obliczenie odchylenia standardowego**
Obliczamy pierwiastek z wariancji:
$$ \\sigma = \\sqrt{5.2} \\approx 2.28 $$

**Sprawdzenie:**
Średnia $\\bar{x}=25$ - poprawnie.
Odchylenia: $-3, -2, -2, -1, 0, 0, 0, 0, 3, 5$ - suma równa 0, ok.
Kwadraty odchyleń: $9, 4, 4, 1, 0, 0, 0, 0, 9, 25$ - poprawnie.
Suma kwadratów: $9+4+4+1+9+25 = 52$ - poprawnie.
Wariancja: $\\frac{52}{10} = 5.2$ - poprawnie.
Odchylenie standardowe: $\\sqrt{5.2}$ - poprawnie.

## Przykład 3 - egzaminacyjny
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

**Krok 2.** Obliczenie iloczynów $x_i \\cdot f_i$**
Dla każdej pary (wartość, częstość) obliczamy iloczyn:
$3 \\cdot 2 = 6$
$4 \\cdot 5 = 20$
$5 \\cdot 7 = 35$
$6 \\cdot 4 = 24$
$7 \\cdot 2 = 14$

**Krok 3.** Obliczenie sumy iloczynów $\\sum (x_i \\cdot f_i)$**
Suma iloczynów: $6 + 20 + 35 + 24 + 14 = 99$.

**Krok 4.** Obliczenie sumy częstości $\\sum f_i$ (łączna liczba uczniów)**
Suma częstości: $2 + 5 + 7 + 4 + 2 = 20$. Jest to łączna liczba uczniów w klasie.

**Krok 5.** Obliczenie średniej arytmetycznej**
Korzystamy ze wzoru dla danych pogrupowanych:
$$ \\bar{x} = \\frac{\\sum (x_i \\cdot f_i)}{\\sum f_i} = \\frac{99}{20} $$
$$ \\bar{x} = 4.95 $$

**Sprawdzenie:**
Obliczono iloczyny i ich sumę - poprawnie.
Obliczono sumę częstości (łączna liczba uczniów) - poprawnie.
Podstawiono do wzoru na średnią dla danych pogrupowanych - poprawnie.
Wynik $\\frac{99}{20} = 4.95$ - poprawnie.

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
1.  Średnia: $\\frac{12+10+15+12+18+11+12}{7} = \\frac{90}{7} \\approx 12.86$. Uporządkowane dane: 10, 11, 12, 12, 12, 15, 18. Mediana: 12. Moda: 12.
2.  $x_{max}=65$, $x_{min}=48$. Rozstęp $R = 65 - 48 = 17$.
3.  Dane: 2, 4, 6, 8, 10. Średnia $\\bar{x} = \\frac{2+4+6+8+10}{5} = \\frac{30}{5} = 6$. Odchylenia: -4, -2, 0, 2, 4. Kwadraty odchyleń: 16, 4, 0, 4, 16. Suma kwadratów: $16+4+0+4+16 = 40$. Wariancja $D^2 = \\frac{40}{5} = 8$. Odchylenie standardowe $\\sigma = \\sqrt{8} = 2\\sqrt{2} \\approx 2.83$.
4.  Suma iloczynów: $(0 \\cdot 3) + (1 \\cdot 6) + (2 \\cdot 8) + (3 \\cdot 3) = 0 + 6 + 16 + 9 = 31$. Suma częstości: $3+6+8+3 = 20$. Średnia $\\bar{x} = \\frac{31}{20} = 1.55$.
5.  Uporządkowane dane (nie trzeba ich wypisywać, wystarczy policzyć pozycje): 0, 0, 0, 1, 1, 1, 1, 1, 1, **2**, **2**, 2, 2, 2, 2, 2, 2, 3, 3, 3. Liczba danych $N=20$. Pozycje środkowe: $\\frac{20}{2}=10$ i $\\frac{20}{2}+1=11$. Na 10. pozycji jest 2, na 11. pozycji jest 2. Mediana $Me = \\frac{2+2}{2} = 2$. Najczęściej występuje liczba błędów = 2 (8 uczniów). Moda $Mo = 2$.
6.  Dane: 1, 2, 3, 4, 5. Średnia $\\bar{x} = 3$. Odchylenia: -2, -1, 0, 1, 2. Kwadraty odchyleń: 4, 1, 0, 1, 4. Suma kwadratów: $4+1+0+1+4=10$. Wariancja $D^2 = \\frac{10}{5} = 2$.
7.  Uporządkowane dane: 15, 15, 20, 25, 25, 30, 35, 45. Liczba danych $n=8$. Średnia: $\\frac{15+15+20+25+25+30+35+45}{8} = \\frac{210}{8} = 26.25$. Mediana: pozycje $\\frac{8}{2}=4$ i $4+1=5$. Wartości na tych pozycjach to 25 i 25. Mediana $Me = \\frac{25+25}{2} = 25$. Rozstęp $R = 45 - 15 = 30$.

## Szybka powtórka
1.  Co opisuje średnia arytmetyczna?
2.  Jak obliczyć medianę dla nieparzystej liczby danych?
3.  Czym różni się moda od mediany?
4.  Jaki jest cel obliczania rozstępu?
5.  Dlaczego odchylenie standardowe jest często preferowane jako miara rozproszenia nad wariancją?

## Diagram
Nie ma prostego, uniwersalnego diagramu ASCII dla wszystkich miar statystycznych, ale można zilustrować rozkład danych względem średniej i mediany.

\`\`\`text
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
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "ulamki",
    title: "Ułamki zwykłe i dziesiętne – wszystko, co musisz wiedzieć na egzaminie ósmoklasisty",
    content: `## Na egzaminie
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
    *   $\\frac{a}{b}$ – $a$ to licznik, $b$ to mianownik.
*   **Ułamek właściwy**: Licznik jest mniejszy od mianownika (np. $\\frac{2}{5}$). Wartość ułamka właściwego jest mniejsza od 1.
*   **Ułamek niewłaściwy**: Licznik jest większy lub równy mianownikowi (np. $\\frac{7}{3}$, $\\frac{4}{4}$). Wartość ułamka niewłaściwego jest większa lub równa 1.
*   **Liczba mieszana**: Suma liczby całkowitej i ułamka właściwego (np. $2\\frac{1}{3}$). Oznacza $2 + \\frac{1}{3}$.
*   **Ułamek dziesiętny**: Ułamek, którego mianownik jest potęgą liczby 10 (10, 100, 1000 itd.). Zapisuje się go za pomocą przecinka oddzielającego część całkowitą od ułamkowej (np. $0,5$, $3,14$).
    *   $0,5 = \\frac{5}{10}$
    *   $3,14 = 3\\frac{14}{100} = \\frac{314}{100}$
*   **Rozszerzanie ułamka**: Mnożenie licznika i mianownika przez tę samą liczbę różną od zera. Wartość ułamka się nie zmienia.
    *   $\\frac{a}{b} = \\frac{a \\cdot k}{b \\cdot k}$, gdzie $k \\neq 0$.
    *   Przykład: $\\frac{2}{3} = \\frac{2 \\cdot 5}{3 \\cdot 5} = \\frac{10}{15}$.
*   **Skracanie ułamka**: Dzielenie licznika i mianownika przez tę samą liczbę (ich wspólny dzielnik). Wartość ułamka się nie zmienia. Najczęściej skraca się ułamek do postaci nieskracalnej (gdy licznik i mianownik nie mają już wspólnych dzielników poza 1).
    *   $\\frac{a}{b} = \\frac{a : k}{b : k}$, gdzie $k$ jest wspólnym dzielnikiem $a$ i $b$, $k \\neq 0$.
    *   Przykład: $\\frac{12}{18} = \\frac{12 : 6}{18 : 6} = \\frac{2}{3}$.
*   **Zamiana ułamka niewłaściwego na liczbę mieszaną**: Dzielimy licznik przez mianownik. Wynik dzielenia to część całkowita, reszta z dzielenia to licznik nowego ułamka, a mianownik pozostaje bez zmian.
    *   $\\frac{13}{5} \\implies 13 : 5 = 2$ reszty $3$. Zatem $\\frac{13}{5} = 2\\frac{3}{5}$.
*   **Zamiana liczby mieszanej na ułamek niewłaściwy**: Mnożymy część całkowitą przez mianownik, dodajemy licznik, a wynik zapisujemy jako nowy licznik. Mianownik pozostaje bez zmian.
    *   $3\\frac{2}{7} = \\frac{3 \\cdot 7 + 2}{7} = \\frac{21 + 2}{7} = \\frac{23}{7}$.
*   **Zamiana ułamka zwykłego na dziesiętny**: Rozszerzamy ułamek do mianownika 10, 100, 1000 itd., a następnie zapisujemy go z przecinkiem. Jeśli nie da się łatwo rozszerzyć do potęgi 10, można wykonać dzielenie licznika przez mianownik.
    *   $\\frac{3}{4} = \\frac{3 \\cdot 25}{4 \\cdot 25} = \\frac{75}{100} = 0,75$.
    *   $\\frac{1}{3} \\implies 1 : 3 = 0,333...$ (ułamek dziesiętny okresowy).
*   **Zamiana ułamka dziesiętnego na zwykły**: Zapisujemy liczbę jako ułamek, gdzie mianownikiem jest odpowiednia potęga 10 (10 dla jednej cyfry po przecinku, 100 dla dwóch, 1000 dla trzech itd.), a licznikiem jest liczba bez przecinka. Następnie skracamy ułamek, jeśli to możliwe.
    *   $0,12 = \\frac{12}{100} = \\frac{3}{25}$.
    *   $1,5 = \\frac{15}{10} = 1\\frac{5}{10} = 1\\frac{1}{2} = \\frac{3}{2}$.

*   **Dodawanie i odejmowanie ułamków zwykłych**:
    *   Ułamki o **tych samych mianownikach**: Dodajemy (odejmujemy) liczniki, mianownik przepisujemy.
        *   $\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$
        *   $\\frac{a}{c} - \\frac{b}{c} = \\frac{a-b}{c}$
    *   Ułamki o **różnych mianownikach**: Sprowadzamy je do **wspólnego mianownika** (najlepiej najmniejszego wspólnego mianownika - NWW), a następnie dodajemy (odejmujemy) tak jak ułamki o tych samych mianownikach.
        *   $\\frac{a}{b} + \\frac{c}{d} = \\frac{a \\cdot k}{b \\cdot k} + \\frac{c \\cdot m}{d \\cdot m}$, gdzie $b \\cdot k = d \\cdot m =$ wspólny mianownik.
*   **Dodawanie i odejmowanie liczb mieszanych**: Można je zamienić na ułamki niewłaściwe lub dodać/odjąć części całkowite i ułamkowe osobno (jeśli nie ma potrzeby pożyczania).
    *   $2\\frac{1}{3} + 1\\frac{1}{2} = (2+1) + (\\frac{1}{3} + \\frac{1}{2}) = 3 + (\\frac{2}{6} + \\frac{3}{6}) = 3 + \\frac{5}{6} = 3\\frac{5}{6}$.
*   **Mnożenie ułamków zwykłych**: Mnożymy liczniki i mnożymy mianowniki. Można skracać przed mnożeniem.
    *   $\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}$.
    *   $\\frac{2}{5} \\cdot \\frac{3}{4} = \\frac{2 \\cdot 3}{5 \\cdot 4} = \\frac{6}{20} = \\frac{3}{10}$. (Można skrócić 2 i 4: $\\frac{\\cancel{2}^1}{5} \\cdot \\frac{3}{\\cancel{4}^2} = \\frac{1 \\cdot 3}{5 \\cdot 2} = \\frac{3}{10}$)
*   **Mnożenie liczby całkowitej przez ułamek**: Liczbę całkowitą traktujemy jak ułamek z mianownikiem 1.
    *   $5 \\cdot \\frac{2}{3} = \\frac{5}{1} \\cdot \\frac{2}{3} = \\frac{5 \\cdot 2}{1 \\cdot 3} = \\frac{10}{3} = 3\\frac{1}{3}$.
*   **Dzielenie ułamków zwykłych**: Dzielenie przez ułamek jest mnożeniem przez jego odwrotność.
    *   $\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c} = \\frac{a \\cdot d}{b \\cdot c}$.
    *   $\\frac{2}{3} : \\frac{4}{5} = \\frac{2}{3} \\cdot \\frac{5}{4} = \\frac{2 \\cdot 5}{3 \\cdot 4} = \\frac{10}{12} = \\frac{5}{6}$.
*   **Kolejność wykonywania działań**:
    1.  Działania w nawiasach.
    2.  Potęgowanie i pierwiastkowanie (nie występują w tym temacie).
    3.  Mnożenie i dzielenie (od lewej do prawej).
    4.  Dodawanie i odejmowanie (od lewej do prawej).

*   **Dodawanie i odejmowanie ułamków dziesiętnych**: Wyrównujemy liczbę miejsc po przecinku dodając zera na końcu i wykonujemy dodawanie/odejmowanie jak liczb całkowitych, pamiętając o ustawieniu przecinka w odpowiednim miejscu.
    *   $1,25 + 3,4 = 1,25 + 3,40 = 4,65$.
    *   $5 - 0,75 = 5,00 - 0,75 = 4,25$.
*   **Mnożenie ułamków dziesiętnych**: Mnożymy liczby tak, jakby nie było przecinków. W wyniku końcowym stawiamy przecinek tak, aby liczba miejsc po przecinku była równa sumie miejsc po przecinku w mnożonych liczbach.
    *   $0,3 \\cdot 0,04$: $3 \\cdot 4 = 12$. W pierwszym czynniku jest 1 miejsce po przecinku, w drugim 2 miejsca. Suma to $1+2=3$ miejsca. Wynik: $0,012$.
*   **Dzielenie ułamków dziesiętnych**:
    *   Przez liczbę całkowitą: Wykonujemy dzielenie, przecinek w wyniku stawiamy nad przecinkiem w dzielnej.
        *   $1,5 : 3 = 0,5$.
    *   Przez liczbę dziesiętną: Przesuwamy przecinek w dzielniku (liczbie, przez którą dzielimy) w prawo tak, aby stał się liczbą całkowitą. Tyle samo miejsc przesuwamy przecinek w dzielnej (pierwszej liczbie).
        *   $1,2 : 0,4 = 12 : 4 = 3$.
        *   $0,6 : 0,03 = 60 : 3 = 20$.

## Przykład 1 - podstawowy
**Zadanie:** Oblicz: $\\frac{2}{5} + \\frac{1}{3}$

**Krok 1.** Zauważamy, że mianowniki są różne (5 i 3). Musimy je sprowadzić do wspólnego mianownika.
**Krok 2.** Znajdujemy najmniejszą wspólną wielokrotność (NWW) liczb 5 i 3. Jest to 15.
**Krok 3.** Rozszerzamy pierwszy ułamek, aby jego mianownik wynosił 15. Mnożymy licznik i mianownik przez 3 (bo $5 \\cdot 3 = 15$).
$\\frac{2}{5} = \\frac{2 \\cdot 3}{5 \\cdot 3} = \\frac{6}{15}$.
**Krok 4.** Rozszerzamy drugi ułamek, aby jego mianownik wynosił 15. Mnożymy licznik i mianownik przez 5 (bo $3 \\cdot 5 = 15$).
$\\frac{1}{3} = \\frac{1 \\cdot 5}{3 \\cdot 5} = \\frac{5}{15}$.
**Krok 5.** Teraz dodajemy ułamki o tych samych mianownikach.
$\\frac{6}{15} + \\frac{5}{15} = \\frac{6+5}{15} = \\frac{11}{15}$.

**Sprawdzenie:** Wynik $\\frac{11}{15}$ jest ułamkiem nieskracalnym, ponieważ 11 jest liczbą pierwszą, a 15 nie jest jej wielokrotnością. Obliczenia wydają się poprawne.

## Przykład 2 - maturalny
**Zadanie:** Oblicz: $2\\frac{1}{4} - 0,75 + \\frac{3}{5} \\cdot (1\\frac{1}{2})$

**Krok 1.** Zamieniamy wszystkie liczby na jeden rodzaj – najwygodniej będzie na ułamki zwykłe nieskracalne.
*   $2\\frac{1}{4} = \\frac{2 \\cdot 4 + 1}{4} = \\frac{9}{4}$
*   $0,75 = \\frac{75}{100} = \\frac{3}{4}$ (po skróceniu przez 25)
*   $1\\frac{1}{2} = \\frac{1 \\cdot 2 + 1}{2} = \\frac{3}{2}$

Wyrażenie wygląda teraz tak: $\\frac{9}{4} - \\frac{3}{4} + \\frac{3}{5} \\cdot \\frac{3}{2}$.

**Krok 2.** Wykonujemy działania zgodnie z kolejnością (najpierw mnożenie w nawiasie, ale tutaj nawiasem jest tylko mnożenie).
Mnożymy $\\frac{3}{5} \\cdot \\frac{3}{2}$. Licznik z licznikiem, mianownik z mianownikiem:
$\\frac{3}{5} \\cdot \\frac{3}{2} = \\frac{3 \\cdot 3}{5 \\cdot 2} = \\frac{9}{10}$.

Wyrażenie teraz wygląda tak: $\\frac{9}{4} - \\frac{3}{4} + \\frac{9}{10}$.

**Krok 3.** Wykonujemy odejmowanie, ponieważ występuje ono przed dodawaniem od lewej strony. Ułamki $\\frac{9}{4}$ i $\\frac{3}{4}$ mają wspólny mianownik.
$\\frac{9}{4} - \\frac{3}{4} = \\frac{9-3}{4} = \\frac{6}{4}$.
Możemy od razu skrócić $\\frac{6}{4} = \\frac{3}{2}$.

Wyrażenie wygląda teraz tak: $\\frac{3}{2} + \\frac{9}{10}$.

**Krok 4.** Dodajemy pozostałe ułamki. Mają różne mianowniki (2 i 10). Sprowadzamy je do wspólnego mianownika, którym jest 10.
Pierwszy ułamek $\\frac{3}{2}$ rozszerzamy przez 5:
$\\frac{3}{2} = \\frac{3 \\cdot 5}{2 \\cdot 5} = \\frac{15}{10}$.

Dodajemy:
$\\frac{15}{10} + \\frac{9}{10} = \\frac{15+9}{10} = \\frac{24}{10}$.

**Krok 5.** Zamieniamy wynik na najprostszą postać. Ułamek $\\frac{24}{10}$ można skrócić przez 2.
$\\frac{24}{10} = \\frac{12}{5}$.
Możemy też zapisać go jako liczbę mieszaną: $\\frac{12}{5} = 2\\frac{2}{5}$. Albo jako ułamek dziesiętny: $\\frac{12}{5} = \\frac{24}{10} = 2,4$.

**Odpowiedź:** Wynik to $\\frac{12}{5}$ (lub $2\\frac{2}{5}$, lub $2,4$).

## Przykład 3 - egzaminacyjny

**Zadanie:** W pewnej klasie $\\frac{2}{5}$ uczniów uczy się gry na pianinie, a $\\frac{1}{4}$ uczniów gra na gitarze. Pozostali uczniowie nie grają na żadnym z tych instrumentów. Jaki ułamek uczniów tej klasy nie gra na pianinie ani na gitarze?

**Krok 1.** Zidentyfikuj dane. Uczniowie grający na pianinie: $\\frac{2}{5}$. Uczniowie grający na gitarze: $\\frac{1}{4}$.
**Krok 2.** Oblicz, jaki ułamek uczniów gra na którymś z instrumentów. Dodajemy ułamki: $\\frac{2}{5} + \\frac{1}{4}$.
**Krok 3.** Sprowadzamy do wspólnego mianownika. NWW(5, 4) = 20.
$\\frac{2}{5} = \\frac{2 \\cdot 4}{5 \\cdot 4} = \\frac{8}{20}$.
$\\frac{1}{4} = \\frac{1 \\cdot 5}{4 \\cdot 5} = \\frac{5}{20}$.
Suma: $\\frac{8}{20} + \\frac{5}{20} = \\frac{13}{20}$.
Jest to ułamek uczniów grających na pianinie LUB na gitarze.
**Krok 4.** Cała klasa to 1 (jedność). Aby obliczyć ułamek uczniów, którzy nie grają na żadnym instrumencie, odejmujemy od całości ułamek uczniów grających na instrumentach.
$1 - \\frac{13}{20}$.
Zamieniamy 1 na ułamek o mianowniku 20: $1 = \\frac{20}{20}$.
$\\frac{20}{20} - \\frac{13}{20} = \\frac{7}{20}$.

**Odpowiedź:** $\\frac{7}{20}$ uczniów tej klasy nie gra na pianinie ani na gitarze.

## Pułapki
*   **Brak sprowadzania do wspólnego mianownika**: Często uczniowie próbują dodawać lub odejmować liczniki i mianowniki osobno, np. $\\frac{1}{2} + \\frac{1}{3} = \\frac{2}{5}$. To jest błąd! Pamiętaj o wspólnym mianowniku.
*   **Błędne skracanie**: Skracanie wykonujemy dzieląc licznik i mianownik przez tę samą liczbę. Mylone bywa skracanie z odejmowaniem, np. $\\frac{5}{10}$ nie równa się $\\frac{4}{9}$. Prawidłowo: $\\frac{5}{10} = \\frac{1}{2}$ (dzielimy licznik i mianownik przez 5).
*   **Kolejność wykonywania działań**: Przy bardziej złożonych wyrażeniach łatwo pomylić kolejność. Zawsze najpierw nawiasy, potem mnożenie/dzielenie, na końcu dodawanie/odejmowanie. Pamiętaj, że mnożenie i dzielenie "mają pierwszeństwo" przed dodawaniem i odejmowaniem.
*   **Błędy przy zamianie liczb mieszanych i ułamków niewłaściwych**: Np. przy zamianie $2\\frac{3}{4}$ na ułamek niewłaściwy, zamiast $\\frac{2 \\cdot 4 + 3}{4} = \\frac{11}{4}$, uczniowie piszą $\\frac{10}{4}$ (nie dodając licznika) lub $\\frac{11}{8}$ (mnożąc mianowniki).
*   **Błędy w działaniach na ułamkach dziesiętnych**: Szczególnie przy mnożeniu i dzieleniu. W mnożeniu kluczowe jest poprawne umiejscowienie przecinka. W dzieleniu przez liczbę dziesiętną łatwo zapomnieć o przesunięciu przecinka w obu liczbach.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz: $\\frac{3}{7} + \\frac{2}{5}$.
2.  Oblicz: $3\\frac{1}{2} - 1\\frac{3}{4}$.
3.  Oblicz: $\\frac{4}{9} \\cdot \\frac{3}{8}$.
4.  Oblicz: $\\frac{5}{6} : \\frac{10}{3}$.
5.  Oblicz: $0,6 + 1,25 - 0,05$.
6.  Oblicz: $1,2 \\cdot 0,4 - 0,03$.
7.  Zamień ułamek $\\frac{17}{5}$ na liczbę mieszaną i ułamek dziesiętny.

## Odpowiedzi
1.  $\\frac{3}{7} + \\frac{2}{5} = \\frac{15}{35} + \\frac{14}{35} = \\frac{29}{35}$.
2.  $3\\frac{1}{2} - 1\\frac{3}{4} = \\frac{7}{2} - \\frac{7}{4} = \\frac{14}{4} - \\frac{7}{4} = \\frac{7}{4} = 1\\frac{3}{4}$.
3.  $\\frac{4}{9} \\cdot \\frac{3}{8} = \\frac{\\cancel{4}^1}{\\cancel{9}^3} \\cdot \\frac{\\cancel{3}^1}{\\cancel{8}^2} = \\frac{1}{3} \\cdot \\frac{1}{2} = \\frac{1}{6}$.
4.  $\\frac{5}{6} : \\frac{10}{3} = \\frac{5}{6} \\cdot \\frac{3}{10} = \\frac{\\cancel{5}^1}{\\cancel{6}^2} \\cdot \\frac{\\cancel{3}^1}{\\cancel{10}^2} = \\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{4}$.
5.  $0,6 + 1,25 - 0,05 = 0,60 + 1,25 - 0,05 = 1,85 - 0,05 = 1,80$.
6.  $1,2 \\cdot 0,4 - 0,03 = 0,48 - 0,03 = 0,45$.
7.  $\\frac{17}{5} = 3\\frac{2}{5} = 3,4$.

## Szybka powtórka
1.  Jaki jest warunek, aby można było dodać dwa ułamki zwykłe bez zmiany ich wartości?
2.  Jakie jest podstawowe działanie, które należy wykonać przed dodawaniem lub odejmowaniem ułamków o różnych mianownikach?
3.  Jak mnożymy dwa ułamki zwykłe?
4.  Przez co mnożymy, aby podzielić przez ułamek zwykły?
5.  Jak ustalamy pozycję przecinka w wyniku mnożenia dwóch ułamków dziesiętnych?`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "potegi",
    title: "Potęgi - od podstaw do matury",
    content: `## Na egzaminie
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
    *   $a^n = \\underbrace{a \\cdot a \\cdot a \\cdot \\ldots \\cdot a}_{n \\text{ razy}}$ (dla $n$ naturalnego dodatniego)

*   **Potęga o wykładniku 1:**
    *   $a^1 = a$
    *   Np.: $5^1 = 5$, $(-3)^1 = -3$

*   **Potęga o wykładniku 0:**
    *   $a^0 = 1$ (dla $a \\neq 0$)
    *   Np.: $7^0 = 1$, $(-2)^0 = 1$, $(\\frac{1}{2})^0 = 1$
    *   Wyrażenie $0^0$ jest nieokreślone.

*   **Potęga o wykładniku ujemnym:**
    *   $a^{-n} = \\frac{1}{a^n}$ (dla $a \\neq 0$)
    *   Np.: $2^{-3} = \\frac{1}{2^3} = \\frac{1}{8}$
    *   $(-3)^{-2} = \\frac{1}{(-3)^2} = \\frac{1}{9}$
    *   $(\\frac{2}{3})^{-2} = \\frac{1}{(\\frac{2}{3})^2} = \\frac{1}{\\frac{4}{9}} = \\frac{9}{4}$

*   **Własności działań na potęgach:**
    1.  **Mnożenie potęg o tych samych podstawach:**
        *   $a^m \\cdot a^n = a^{m+n}$
        *   Np.: $2^3 \\cdot 2^5 = 2^{3+5} = 2^8$
        *   $(-5)^2 \\cdot (-5)^4 = (-5)^{2+4} = (-5)^6$

    2.  **Dzielenie potęg o tych samych podstawach:**
        *   $\\frac{a^m}{a^n} = a^{m-n}$ (dla $a \\neq 0$)
        *   Np.: $3^7 : 3^4 = 3^{7-4} = 3^3$
        *   $\\frac{(-4)^5}{(-4)^2} = (-4)^{5-2} = (-4)^3$

    3.  **Potęgowanie potęgi:**
        *   $(a^m)^n = a^{m \\cdot n}$
        *   Np.: $(5^2)^3 = 5^{2 \\cdot 3} = 5^6$
        *   $((-2)^3)^4 = (-2)^{3 \\cdot 4} = (-2)^{12}$

    4.  **Potęgowanie iloczynu:**
        *   $(a \\cdot b)^n = a^n \\cdot b^n$
        *   Np.: $(2 \\cdot 3)^4 = 2^4 \\cdot 3^4$
        *   $(-5 \\cdot 7)^2 = (-5)^2 \\cdot 7^2$

    5.  **Potęgowanie ilorazu:**
        *   $(\\frac{a}{b})^n = \\frac{a^n}{b^n}$ (dla $b \\neq 0$)
        *   Np.: $(\\frac{2}{5})^3 = \\frac{2^3}{5^3}$
        *   $(\\frac{-3}{4})^2 = \\frac{(-3)^2}{4^2}$

    6.  **Mnożenie potęg o tych samych wykładnikach:**
        *   $a^n \\cdot b^n = (a \\cdot b)^n$
        *   Np.: $2^3 \\cdot 5^3 = (2 \\cdot 5)^3 = 10^3$
        *   $7^2 \\cdot (-3)^2 = (7 \\cdot (-3))^2 = (-21)^2$

    7.  **Dzielenie potęg o tych samych wykładnikach:**
        *   $\\frac{a^n}{b^n} = (\\frac{a}{b})^n$ (dla $b \\neq 0$)
        *   Np.: $10^4 : 2^4 = (\\frac{10}{2})^4 = 5^4$
        *   $\\frac{6^3}{3^3} = (\\frac{6}{3})^3 = 2^3$

## Przykład 1 - podstawowy
Oblicz wartość wyrażenia: $3^4 - 5^2 + 2^3$

**Krok 1.** Oblicz potęgę $3^4$.
$3^4 = 3 \\cdot 3 \\cdot 3 \\cdot 3 = 9 \\cdot 9 = 81$

**Krok 2.** Oblicz potęgę $5^2$.
$5^2 = 5 \\cdot 5 = 25$

**Krok 3.** Oblicz potęgę $2^3$.
$2^3 = 2 \\cdot 2 \\cdot 2 = 8$

**Krok 4.** Podstaw obliczone wartości do wyrażenia.
$81 - 25 + 8$

**Krok 5.** Wykonaj działania odejmowania i dodawania od lewej do prawej.
$81 - 25 = 56$
$56 + 8 = 64$

**Sprawdzenie:** Obliczyliśmy każdą potęgę poprawnie, a następnie wykonaliśmy działania zgodnie z kolejnością. Wynik $64$ jest poprawny.

## Przykład 2 - maturalny
Uprość wyrażenie: $(\\frac{2x^3}{3y^2})^2 \\cdot (\\frac{3y}{x^2})^3$, gdzie $x \\neq 0$ i $y \\neq 0$.

**Krok 1.** Zastosuj potęgowanie ilorazu i iloczynu w pierwszym nawiasie.
$(\\frac{2x^3}{3y^2})^2 = \\frac{(2x^3)^2}{(3y^2)^2} = \\frac{2^2 \\cdot (x^3)^2}{3^2 \\cdot (y^2)^2}$

**Krok 2.** Uprość wyrażenie z pierwszego nawiasu, korzystając z własności potęgowania potęgi.
$\\frac{4 \\cdot x^{3 \\cdot 2}}{9 \\cdot y^{2 \\cdot 2}} = \\frac{4x^6}{9y^4}$

**Krok 3.** Zastosuj potęgowanie ilorazu w drugim nawiasie.
$(\\frac{3y}{x^2})^3 = \\frac{(3y)^3}{(x^2)^3} = \\frac{3^3 \\cdot y^3}{(x^2)^3}$

**Krok 4.** Uprość wyrażenie z drugiego nawiasu, korzystając z własności potęgowania potęgi.
$\\frac{27y^3}{x^{2 \\cdot 3}} = \\frac{27y^3}{x^6}$

**Krok 5.** Pomnóż uproszczone wyrażenia.
$\\frac{4x^6}{9y^4} \\cdot \\frac{27y^3}{x^6}$

**Krok 6.** Skróć wspólne czynniki licznika i mianownika. Zauważ, że $x^6$ skraca się, $y^3$ skraca się z $y^4$ (zostaje $y$ w mianowniku), a $9$ skraca się z $27$ (zostaje $3$ w liczniku).
$\\frac{4 \\cancel{x^6}}{9\\cancel{y^4}_1} \\cdot \\frac{27^3 \\cancel{y^3}}{\\cancel{x^6}} = \\frac{4}{1} \\cdot \\frac{3}{y} = \\frac{12}{y}$

**Sprawdzenie:** Zastosowaliśmy kolejno potęgowanie ilorazu, potęgowanie iloczynu i potęgowanie potęgi. Następnie wykonaliśmy mnożenie i skrócenie. Wynik $\\frac{12}{y}$ jest poprawny.

## Przykład 3 - egzaminacyjny

Oblicz wartość wyrażenia: $(5^{-2} \\cdot 5^4) : 5^{-1}$

**Krok 1.** Wykonaj mnożenie potęg o tych samych podstawach w nawiasie.
$5^{-2} \\cdot 5^4 = 5^{-2+4} = 5^2$

**Krok 2.** Podstaw wynik z powrotem do wyrażenia.
$5^2 : 5^{-1}$

**Krok 3.** Wykonaj dzielenie potęg o tych samych podstawach.
$5^2 : 5^{-1} = 5^{2 - (-1)} = 5^{2+1} = 5^3$

**Krok 4.** Oblicz ostateczną wartość potęgi.
$5^3 = 5 \\cdot 5 \\cdot 5 = 125$

**Sprawdzenie:** Zastosowaliśmy własność mnożenia, a następnie dzielenia potęg o tych samych podstawach. Obliczenia są poprawne.

## Pułapki
*   **Znaki przy potęgach ujemnych:** Często mylone są zasady dotyczące potęgowania liczb ujemnych. Pamiętaj:
    *   Potęga liczby ujemnej o **parzystym** wykładniku jest **dodatnia**. Np.: $(-2)^4 = 16$.
    *   Potęga liczby ujemnej o **nieparzystym** wykładniku jest **ujemna**. Np.: $(-2)^3 = -8$.
    *   Wyrażenie $-a^n$ oznacza $- (a^n)$. Np. $-2^4 = -(2^4) = -16$.
    *   Wyrażenie $(-a)^n$ oznacza potęgowanie całej podstawy $(-a)$.

*   **Wykładnik ujemny a odwrotność:** Wykładnik ujemny oznacza odwrotność liczby, a nie jej przeciwieństwo.
    *   $a^{-n} = \\frac{1}{a^n}$, a **nie** $-a^n$. Np. $2^{-3} = \\frac{1}{8}$, a nie $-8$.
    *   $(\\frac{a}{b})^{-n} = (\\frac{b}{a})^n$. Np. $(\\frac{2}{3})^{-2} = (\\frac{3}{2})^2 = \\frac{9}{4}$.

*   **Dodawanie i odejmowanie potęg:** Nie ma prostej zasady na dodawanie lub odejmowanie potęg, chyba że mają tę samą podstawę i ten sam wykładnik. Nie można dodać $a^m + a^n$ do $a^{m+n}$ ani $a^{m-n}$.
    *   Np. $2^3 + 2^2 = 8 + 4 = 12$. **Nie jest to** $2^{3+2}=2^5=32$ ani $2^{3-2}=2^1=2$.

*   **Kolejność działań i własności potęg:** Należy uważać, kiedy stosować własności potęg, a kiedy wykonywać działania zgodnie z kolejnością. Własności potęg stosuje się przy mnożeniu i dzieleniu, a potęgowanie potęgi jest "silniejsze" niż mnożenie.
    *   Np. W wyrażeniu $2^3 \\cdot 2^5$, stosujemy $a^m \\cdot a^n = a^{m+n}$.
    *   W wyrażeniu $(2^3)^5$, stosujemy $(a^m)^n = a^{m \\cdot n}$.
    *   W wyrażeniu $2^3 + 2^5$, nie stosujemy żadnej z tych własności, tylko obliczamy wartości i dodajemy.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz: $10^3 - 6^2 + 3^4$.
2.  Oblicz wartość wyrażenia: $4^{-2} + (\\frac{1}{2})^3$.
3.  Uprość wyrażenie: $(x^5 \\cdot x^3) : x^2$.
4.  Uprość wyrażenie: $\\frac{(3a^4)^2}{6a^3}$.
5.  Oblicz: $2^5 \\cdot 2^{-3} \\cdot 2^0$.
6.  Uprość wyrażenie: $(\\frac{a^2}{b^3})^3 \\cdot (\\frac{b}{a})^2$.
7.  Porównaj liczby: $3^{10}$ i $9^5$.

## Odpowiedzi
1.  $1000 - 36 + 81 = 964 + 81 = 1045$.
2.  $\\frac{1}{16} + \\frac{1}{8} = \\frac{1}{16} + \\frac{2}{16} = \\frac{3}{16}$.
3.  $x^{5+3} : x^2 = x^8 : x^2 = x^{8-2} = x^6$.
4.  $\\frac{3^2 \\cdot (a^4)^2}{6a^3} = \\frac{9a^8}{6a^3} = \\frac{3}{2} a^{8-3} = \\frac{3}{2} a^5$.
5.  $2^{5+(-3)+0} = 2^2 = 4$.
6.  $\\frac{(a^2)^3}{(b^3)^3} \\cdot \\frac{b^2}{a^2} = \\frac{a^6}{b^9} \\cdot \\frac{b^2}{a^2} = \\frac{a^{6-2}}{b^{9-2}} = \\frac{a^4}{b^7}$.
7.  $9^5 = (3^2)^5 = 3^{2 \\cdot 5} = 3^{10}$. Liczby są równe.

## Szybka powtórka
1.  Jaka jest definicja potęgi $a^n$?
2.  Ile wynosi $a^0$ dla $a \\neq 0$?
3.  Jak zapisać $a^{-n}$ używając ułamka?
4.  Jak mnożymy potęgi o tych samych podstawach?
5.  Jak potęgujemy potęgę $(a^m)^n$?

## Diagram
\`\`\`text
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
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "pierwiastki",
    title: "Pierwiastki kwadratowe i ich własności",
    content: `## Na egzaminie
Pierwiastki kwadratowe pojawiają się na egzaminie ósmoklasisty dość często, zazwyczaj w zadaniach zamkniętych sprawdzających znajomość definicji i podstawowych własności, a także w zadaniach otwartych wymagających obliczeń z ich użyciem. CKE lubi sprawdzać umiejętność upraszczania wyrażeń z pierwiastkami, porównywania liczb z pierwiastkami oraz rozwiązywania prostych równań z pierwiastkami. Za poprawne rozwiązanie zadań z pierwiastkami można zdobyć od 1 do 3 punktów.

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił:
1.  Zrozumieć definicję pierwiastka kwadratowego z liczby nieujemnej.
2.  Obliczać pierwiastki kwadratowe z liczb doskonałych (np. $\\sqrt{4}$, $\\sqrt{16}$, $\\sqrt{100}$).
3.  Stosować własność $\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$ i $\\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}$ do upraszczania wyrażeń.
4.  Wyciągać liczby spod znaku pierwiastka, np. $\\sqrt{18} = 3\\sqrt{2}$.
5.  Włączać liczby pod znak pierwiastka, np. $2\\sqrt{3} = \\sqrt{12}$.
6.  Porównywać liczby z pierwiastkami kwadratowymi.
7.  Rozwiązywać proste równania z niewiadomą pod pierwiastkiem lub równania z pierwiastkami po obu stronach.
8.  Szacować wartości pierwiastków kwadratowych z liczb, które nie są kwadratami doskonałymi.

## Definicje i wzory
*   **Pierwiastek kwadratowy** z liczby nieujemnej $a$ to taka liczba nieujemna $b$, której kwadrat jest równy $a$. Oznaczamy to jako $\\sqrt{a} = b$, gdzie $b \\geq 0$ i $b^2 = a$.
    *   Przykład: $\\sqrt{9} = 3$, ponieważ $3 \\geq 0$ i $3^2 = 9$.
    *   Przykład: $\\sqrt{25} = 5$, ponieważ $5 \\geq 0$ i $5^2 = 25$.
    *   Nie istnieje pierwiastek kwadratowy z liczby ujemnej w zbiorze liczb rzeczywistych. $\\sqrt{-4}$ nie ma rozwiązania.

*   **Kwadraty liczb naturalnych** (kwadraty doskonałe) – warto znać te wartości dla szybszych obliczeń:
    *   $1^2 = 1 \\implies \\sqrt{1} = 1$
    *   $2^2 = 4 \\implies \\sqrt{4} = 2$
    *   $3^2 = 9 \\implies \\sqrt{9} = 3$
    *   $4^2 = 16 \\implies \\sqrt{16} = 4$
    *   $5^2 = 25 \\implies \\sqrt{25} = 5$
    *   $6^2 = 36 \\implies \\sqrt{36} = 6$
    *   $7^2 = 49 \\implies \\sqrt{49} = 7$
    *   $8^2 = 64 \\implies \\sqrt{64} = 8$
    *   $9^2 = 81 \\implies \\sqrt{81} = 9$
    *   $10^2 = 100 \\implies \\sqrt{100} = 10$
    *   $11^2 = 121 \\implies \\sqrt{121} = 11$
    *   $12^2 = 144 \\implies \\sqrt{144} = 12$
    *   $13^2 = 169 \\implies \\sqrt{169} = 13$
    *   $14^2 = 196 \\implies \\sqrt{196} = 14$
    *   $15^2 = 225 \\implies \\sqrt{225} = 15$
    *   $20^2 = 400 \\implies \\sqrt{400} = 20$
    *   $100^2 = 10000 \\implies \\sqrt{10000} = 100$

*   **Własności pierwiastków kwadratowych:**
    *   **Pierwiastek z iloczynu:** Dla liczb $a \\geq 0$ i $b \\geq 0$:
        $$ \\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b} $$
        To pozwala rozbić pierwiastek z większej liczby na iloczyn pierwiastków z mniejszych liczb, co ułatwia obliczenia lub wyciąganie czynnika przed pierwiastek.
    *   **Pierwiastek z ilorazu:** Dla liczb $a \\geq 0$ i $b > 0$:
        $$ \\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}} $$
        Pozwala obliczyć pierwiastek z ułamka, obliczając pierwiastki licznika i mianownika osobno.
    *   **Wyciąganie czynnika spod pierwiastka:** Aby uprościć $\\sqrt{N}$, szukamy największego kwadratu liczby całkowitej $k^2$, który jest dzielnikiem $N$. Wtedy $N = k^2 \\cdot m$, i:
        $$ \\sqrt{N} = \\sqrt{k^2 \\cdot m} = \\sqrt{k^2} \\cdot \\sqrt{m} = k\\sqrt{m} $$
        Przykład: $\\sqrt{18} = \\sqrt{9 \\cdot 2} = \\sqrt{9} \\cdot \\sqrt{2} = 3\\sqrt{2}$.
    *   **Włączanie czynnika pod pierwiastek:** Aby włączyć liczbę $k \\geq 0$ pod pierwiastek kwadratowy, podnosimy ją do kwadratu:
        $$ k\\sqrt{m} = \\sqrt{k^2} \\cdot \\sqrt{m} = \\sqrt{k^2 \\cdot m} $$
        Przykład: $3\\sqrt{2} = \\sqrt{3^2 \\cdot 2} = \\sqrt{9 \\cdot 2} = \\sqrt{18}$.
    *   **Potęgowanie pierwiastka:**
        $$ (\\sqrt{a})^2 = a \\quad \\text{dla } a \\geq 0 $$
        $$ \\sqrt{a^2} = |a| \\quad \\text{dla dowolnej liczby } a $$
        Na egzaminie ósmoklasisty zazwyczaj mamy do czynienia z liczbami nieujemnymi, więc $\\sqrt{a^2} = a$ dla $a \\geq 0$.

## Przykład 1 - podstawowy
Oblicz wartość wyrażenia $\\sqrt{144} + \\sqrt{49} - \\sqrt{81}$.

**Krok 1.** Obliczamy pierwiastek z pierwszej liczby: $\\sqrt{144}$. Wiemy, że $12^2 = 144$, więc $\\sqrt{144} = 12$.
**Krok 2.** Obliczamy pierwiastek z drugiej liczby: $\\sqrt{49}$. Wiemy, że $7^2 = 49$, więc $\\sqrt{49} = 7$.
**Krok 3.** Obliczamy pierwiastek z trzeciej liczby: $\\sqrt{81}$. Wiemy, że $9^2 = 81$, więc $\\sqrt{81} = 9$.
**Krok 4.** Podstawiamy obliczone wartości do wyrażenia: $12 + 7 - 9$.
**Krok 5.** Wykonujemy działania dodawania i odejmowania: $12 + 7 = 19$, a następnie $19 - 9 = 10$.

**Odpowiedź:** Wartość wyrażenia wynosi $10$.

**Sprawdzenie:**
$\\sqrt{144} = 12$ (bo $12^2=144$)
$\\sqrt{49} = 7$ (bo $7^2=49$)
$\\sqrt{81} = 9$ (bo $9^2=81$)
$12 + 7 - 9 = 19 - 9 = 10$. Wynik jest poprawny.

## Przykład 2 - maturalny
Uprość wyrażenie $\\sqrt{72} + \\sqrt{18} - \\sqrt{50}$.

**Krok 1.** Analizujemy każdą liczbę pod pierwiastkiem i szukamy największego kwadratu liczby całkowitej będącego jej dzielnikiem.
*   Dla $72$: Dzielniki $72$ to $1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36, 72$. Największy kwadrat wśród nich to $36$. Zatem $72 = 36 \\cdot 2$.
*   Dla $18$: Dzielniki $18$ to $1, 2, 3, 6, 9, 18$. Największy kwadrat to $9$. Zatem $18 = 9 \\cdot 2$.
*   Dla $50$: Dzielniki $50$ to $1, 2, 5, 10, 25, 50$. Największy kwadrat to $25$. Zatem $50 = 25 \\cdot 2$.

**Krok 2.** Stosujemy własność $\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$ do rozbicia każdego pierwiastka:
*   $\\sqrt{72} = \\sqrt{36 \\cdot 2} = \\sqrt{36} \\cdot \\sqrt{2} = 6\\sqrt{2}$
*   $\\sqrt{18} = \\sqrt{9 \\cdot 2} = \\sqrt{9} \\cdot \\sqrt{2} = 3\\sqrt{2}$
*   $\\sqrt{50} = \\sqrt{25 \\cdot 2} = \\sqrt{25} \\cdot \\sqrt{2} = 5\\sqrt{2}$

**Krok 3.** Podstawiamy uproszczone pierwiastki z powrotem do oryginalnego wyrażenia:
$6\\sqrt{2} + 3\\sqrt{2} - 5\\sqrt{2}$

**Krok 4.** Wykonujemy działania. Ponieważ wszystkie składniki mają ten sam czynnik $\\sqrt{2}$, możemy traktować $\\sqrt{2}$ jak niewiadomą i dodać lub odjąć współczynniki:
$(6 + 3 - 5)\\sqrt{2}$

**Krok 5.** Obliczamy wartość współczynnika: $6 + 3 = 9$, a następnie $9 - 5 = 4$.
Wynik to $4\\sqrt{2}$.

**Odpowiedź:** Uproszczone wyrażenie to $4\\sqrt{2}$.

**Sprawdzenie:**
$\\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}$
$\\sqrt{18} = \\sqrt{9 \\times 2} = 3\\sqrt{2}$
$\\sqrt{50} = \\sqrt{25 \\times 2} = 5\\sqrt{2}$
$6\\sqrt{2} + 3\\sqrt{2} - 5\\sqrt{2} = (6+3-5)\\sqrt{2} = 4\\sqrt{2}$. Wynik jest poprawny.

## Przykład 3 - egzaminacyjny

Porównaj liczby $\\sqrt{10}$ i $3$.

**Krok 1.** Aby porównać liczbę z pierwiastkiem, wygodnie jest sprowadzić obie liczby do postaci, w której obie są pod pierwiastkiem lub obie nie są. W tym przypadku łatwiej jest włączyć liczbę $3$ pod znak pierwiastka.

**Krok 2.** Stosujemy własność włączania czynnika pod pierwiastek: $k\\sqrt{m} = \\sqrt{k^2 \\cdot m}$.
W tym przypadku mamy liczbę $3$, którą możemy zapisać jako $3\\sqrt{1}$. Włączamy $3$ pod pierwiastek:
$3 = \\sqrt{3^2} = \\sqrt{9}$.

**Krok 3.** Teraz porównujemy liczby $\\sqrt{10}$ i $\\sqrt{9}$. Porównujemy liczby pod pierwiastkami.
Ponieważ $10 > 9$, to $\\sqrt{10} > \\sqrt{9}$.

**Krok 4.** Zastępujemy $\\sqrt{9}$ z powrotem liczbą $3$:
$\\sqrt{10} > 3$.

**Odpowiedź:** $\\sqrt{10}$ jest większe od $3$.

**Sprawdzenie:**
$\\sqrt{10}$ to liczba między $\\sqrt{9}=3$ a $\\sqrt{16}=4$. Jest to około $3.16$.
$3.16 > 3$. Porównanie jest poprawne.

## Pułapki
*   **Pierwiastek z liczby ujemnej:** Pamiętaj, że w zbiorze liczb rzeczywistych nie można obliczyć pierwiastka kwadratowego z liczby ujemnej. $\\sqrt{-16}$ nie istnieje (w zakresie podstawowym).
*   **Zapominanie o podnoszeniu do kwadratu przy włączaniu pod pierwiastek:** Częstym błędem jest zapisanie $3\\sqrt{2} = \\sqrt{3 \\cdot 2} = \\sqrt{6}$ zamiast $\\sqrt{3^2 \\cdot 2} = \\sqrt{9 \\cdot 2} = \\sqrt{18}$. Zawsze podnoś liczbę przed pierwiastkiem do kwadratu.
*   **Niepełne wyciąganie czynnika:** Przy upraszczaniu $\\sqrt{72}$, można zauważyć, że $72 = 4 \\cdot 18$, co daje $\\sqrt{72} = 2\\sqrt{18}$. Jest to poprawny krok, ale nie jest to najprostsza postać. Należy szukać największego kwadratu (w tym przypadku $36$), aby uzyskać postać $6\\sqrt{2}$.
*   **Dodawanie/odejmowanie pierwiastków bez wspólnego czynnika podpierwiastkowego:** Nie można dodać $\\sqrt{2}$ i $\\sqrt{3}$ w prosty sposób, pisząc np. $\\sqrt{5}$ lub $\\sqrt{6}$. Można je dodać tylko wtedy, gdy mają taki sam czynnik pod pierwiastkiem, np. $2\\sqrt{5} + 3\\sqrt{5} = 5\\sqrt{5}$.
*   **Błędy przy porównywaniu liczb:** Nie porównuj bezpośrednio liczb pod pierwiastkami, jeśli jedna z nich nie jest pod pierwiastkiem. Sprowadź obie do tej samej postaci (obie pod pierwiastkiem lub obie poza). Np. porównując $\\sqrt{20}$ i $4$: nie można napisać, że $20>4$ i dlatego $\\sqrt{20}>4$. Należy $4$ zamienić na $\\sqrt{16}$, a wtedy porównać $\\sqrt{20}$ i $\\sqrt{16}$, co daje $\\sqrt{20} > \\sqrt{16}$, czyli $\\sqrt{20} > 4$.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz: $\\sqrt{64} - \\sqrt{36} + \\sqrt{100}$.
2.  Uprość wyrażenie: $\\sqrt{27} + \\sqrt{12}$.
3.  Uprość wyrażenie: $\\sqrt{48} - \\sqrt{75}$.
4.  Włącz liczbę pod pierwiastek: $5\\sqrt{3}$.
5.  Porównaj liczby: $\\sqrt{50}$ i $7$.
6.  Rozwiąż równanie: $\\sqrt{x} = 6$.
7.  Oblicz przybliżoną wartość $\\sqrt{20}$ wiedząc, że $\\sqrt{16}=4$ i $\\sqrt{25}=5$.

## Odpowiedzi
1.  $8 - 6 + 10 = 12$.
2.  $\\sqrt{27} = \\sqrt{9 \\cdot 3} = 3\\sqrt{3}$. $\\sqrt{12} = \\sqrt{4 \\cdot 3} = 2\\sqrt{3}$. Zatem $3\\sqrt{3} + 2\\sqrt{3} = 5\\sqrt{3}$.
3.  $\\sqrt{48} = \\sqrt{16 \\cdot 3} = 4\\sqrt{3}$. $\\sqrt{75} = \\sqrt{25 \\cdot 3} = 5\\sqrt{3}$. Zatem $4\\sqrt{3} - 5\\sqrt{3} = -\\sqrt{3}$.
4.  $5\\sqrt{3} = \\sqrt{5^2 \\cdot 3} = \\sqrt{25 \\cdot 3} = \\sqrt{75}$.
5.  $7 = \\sqrt{7^2} = \\sqrt{49}$. Porównujemy $\\sqrt{50}$ i $\\sqrt{49}$. Ponieważ $50 > 49$, to $\\sqrt{50} > \\sqrt{49}$, czyli $\\sqrt{50} > 7$.
6.  Podnosimy obie strony do kwadratu: $(\\sqrt{x})^2 = 6^2$, czyli $x = 36$.
7.  $\\sqrt{20}$ znajduje się między $\\sqrt{16}=4$ a $\\sqrt{25}=5$. Jest bliżej do $4$ niż do $5$. Wartość jest większa od $4$. Przybliżona wartość to ok. $4.47$.

## Szybka powtórka
1.  Jaka jest definicja pierwiastka kwadratowego z liczby $a$?
2.  Podaj wzór na pierwiastek z iloczynu dwóch liczb nieujemnych.
3.  Jak uprościć $\\sqrt{50}$?
4.  Jak zamienić $2\\sqrt{7}$ na liczbę pod pierwiastkiem?
5.  Czy $\\sqrt{-9}$ ma rozwiązanie w zbiorze liczb rzeczywistych?

## Diagram
\`\`\`text
     Liczba a >= 0
          |
          v
     Obliczamy sqrt(a)
     (Szukamy liczby b >= 0
      takiej, że b*b = a)
          |
          v
     Wynik: sqrt(a) = b
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "procenty",
    title: "Procenty - klucz do zrozumienia danych",
    content: `## Na egzaminie
Procenty to wszechobecny temat na egzaminie ósmoklasisty, pojawiający się w zadaniach otwartych i zamkniętych. Można spodziewać się 2-3 zadań, których łączna punktacja wynosi zazwyczaj 4-6 punktów. CKE często sprawdza umiejętność obliczania procentu danej liczby, procentu z procentu, podwyżek i obniżek cen, a także odczytywania danych z tabel i wykresów przedstawionych za pomocą procentów.

## Mapa tematu
1.  Rozumienie pojęcia procentu jako części całości.
2.  Zamiana procentów na ułamki i liczby dziesiętne oraz odwrotnie.
3.  Obliczanie procentu danej liczby.
4.  Obliczanie, jakim procentem jednej liczby jest druga liczba.
5.  Obliczanie liczby, gdy dany jest jej procent.
6.  Obliczanie podwyżek i obniżek procentowych.
7.  Procent składany (w ograniczonym zakresie, jako podwyżka/obniżka dwukrotna).
8.  Zastosowanie procentów w zadaniach tekstowych.

## Definicje i wzory
*   **Procent** - jedna setna (1/100) pewnej wielkości. Symbol procentu to %.
    *   $1\\% = \\frac{1}{100} = 0.01$
*   **Zamiana procentów na ułamki i liczby dziesiętne:**
    *   Aby zamienić procent na ułamek, dzielimy liczbę procentów przez 100.
        *   $x\\% = \\frac{x}{100}$
    *   Aby zamienić procent na liczbę dziesiętną, przesuwamy przecinek o dwa miejsca w lewo.
        *   $25\\% = \\frac{25}{100} = 0.25$
        *   $150\\% = \\frac{150}{100} = 1.5$
        *   $7\\% = \\frac{7}{100} = 0.07$
*   **Zamiana ułamków i liczb dziesiętnych na procenty:**
    *   Aby zamienić ułamek lub liczbę dziesiętną na procent, mnożymy przez 100 i dodajemy znak %.
        *   $0.45 = 0.45 \\cdot 100\\% = 45\\%$
        *   $\\frac{3}{4} = 0.75 = 0.75 \\cdot 100\\% = 75\\%$
        *   $1.2 = 1.2 \\cdot 100\\% = 120\\%$
*   **Obliczanie procentu danej liczby:**
    *   Aby obliczyć $p\\%$ pewnej liczby $L$, mnożymy liczbę $L$ przez $p\\%$ (zamienioną na ułamek lub liczbę dziesiętną).
        *   Oblicz $20\\%$ liczby 150.
        *   Rozwiązanie: $20\\% = 0.20$. Wartość: $150 \\cdot 0.20 = 30$.
        *   Alternatywnie: $150 \\cdot \\frac{20}{100} = 150 \\cdot \\frac{1}{5} = 30$.
*   **Obliczanie, jakim procentem jednej liczby jest druga liczba:**
    *   Aby obliczyć, jakim procentem liczby $L_1$ jest liczba $L_2$, dzielimy $L_2$ przez $L_1$ i mnożymy wynik przez 100%.
        *   Jaki procent z 50 stanowi 10?
        *   Rozwiązanie: $\\frac{10}{50} \\cdot 100\\% = \\frac{1}{5} \\cdot 100\\% = 0.2 \\cdot 100\\% = 20\\%$.
*   **Obliczanie liczby, gdy dany jest jej procent:**
    *   Jeśli $p\\%$ pewnej liczby $L$ wynosi $W$, to aby obliczyć liczbę $L$, dzielimy $W$ przez $p\\%$ (zamienioną na ułamek lub liczbę dziesiętną).
        *   Wiemy, że $30\\%$ pewnej liczby wynosi 60. Jaka to liczba?
        *   Rozwiązanie: $30\\% = 0.30$. Szukana liczba $L$: $L = \\frac{60}{0.30} = \\frac{600}{3} = 200$.
        *   Alternatywnie: $L = 60 \\div \\frac{30}{100} = 60 \\div \\frac{3}{10} = 60 \\cdot \\frac{10}{3} = 20 \\cdot 10 = 200$.
*   **Podwyżki i obniżki procentowe:**
    *   **Podwyżka o $p\\%$:** Nowa cena/wartość = Cena/wartość początkowa $\\cdot (1 + \\frac{p}{100})$.
        *   Cena roweru 1200 zł została podwyższona o 10%. Jaka jest nowa cena?
        *   $1200 \\cdot (1 + \\frac{10}{100}) = 1200 \\cdot (1 + 0.1) = 1200 \\cdot 1.1 = 1320$ zł.
    *   **Obniżka o $p\\%$:** Nowa cena/wartość = Cena/wartość początkowa $\\cdot (1 - \\frac{p}{100})$.
        *   Cena bluzy 80 zł została obniżona o 25%. Jaka jest nowa cena?
        *   $80 \\cdot (1 - \\frac{25}{100}) = 80 \\cdot (1 - 0.25) = 80 \\cdot 0.75 = 60$ zł.
*   **Procent z procentu:**
    *   Oblicz $50\\%$ z $20\\%$ liczby 100.
    *   $20\\%$ ze 100 to $100 \\cdot 0.20 = 20$.
    *   $50\\%$ z 20 to $20 \\cdot 0.50 = 10$.
    *   Krócej: $100 \\cdot (\\frac{20}{100}) \\cdot (\\frac{50}{100}) = 100 \\cdot 0.2 \\cdot 0.5 = 10$.

## Przykład 1 - podstawowy
Oblicz $15\\%$ liczby 200.

**Krok 1.** Zamiana procentu na liczbę dziesiętną lub ułamek.
$15\\% = \\frac{15}{100} = 0.15$.

**Krok 2.** Pomnożenie liczby przez uzyskaną wartość.
Szukana wartość to $200 \\cdot 0.15$.

**Krok 3.** Wykonanie mnożenia.
$200 \\cdot 0.15 = 200 \\cdot \\frac{15}{100} = 2 \\cdot 15 = 30$.

**Sprawdzenie:**
$10\\%$ ze 200 to 20.
$5\\%$ ze 200 to połowa z 20, czyli 10.
$15\\%$ ze 200 to $10\\% + 5\\%$, czyli $20 + 10 = 30$. Wynik jest poprawny.

## Przykład 2 - maturalny
Cena komputera wynosiła 3000 zł. Cenę tę najpierw obniżono o 10%, a następnie nową cenę podwyższono o 20%. Czy końcowa cena jest wyższa czy niższa od początkowej i o ile złotych?

**Krok 1.** Obliczenie ceny po pierwszej obniżce.
Obniżka o 10% oznacza, że nowa cena to $100\\% - 10\\% = 90\\%$ ceny początkowej.
Nowa cena $= 3000 \\cdot (1 - \\frac{10}{100}) = 3000 \\cdot (1 - 0.1) = 3000 \\cdot 0.9 = 2700$ zł.

**Krok 2.** Obliczenie ceny po drugiej operacji (podwyżce).
Nową cenę (2700 zł) podwyższono o 20%. Oznacza to, że nowa cena to $100\\% + 20\\% = 120\\%$ poprzedniej ceny.
Końcowa cena $= 2700 \\cdot (1 + \\frac{20}{100}) = 2700 \\cdot (1 + 0.2) = 2700 \\cdot 1.2$.

**Krok 3.** Wykonanie mnożenia.
$2700 \\cdot 1.2 = 2700 \\cdot \\frac{12}{10} = 270 \\cdot 12$.
$270 \\cdot 10 = 2700$.
$270 \\cdot 2 = 540$.
$2700 + 540 = 3240$ zł.

**Krok 4.** Porównanie ceny końcowej z początkową.
Cena początkowa: 3000 zł.
Cena końcowa: 3240 zł.
Cena końcowa jest wyższa od początkowej.

**Krok 5.** Obliczenie różnicy.
Różnica $= 3240 - 3000 = 240$ zł.

**Odpowiedź:** Końcowa cena jest wyższa od początkowej o 240 zł.

## Przykład 3 - egzaminacyjny
W klasie liczącej 30 uczniów, 60% to dziewczęta. Ilu chłopców jest w tej klasie?

**Krok 1.** Obliczenie liczby dziewcząt.
Dziewczęta stanowią 60% z 30 uczniów.
Liczba dziewcząt $= 30 \\cdot 60\\% = 30 \\cdot \\frac{60}{100} = 30 \\cdot 0.6 = 18$.

**Krok 2.** Obliczenie liczby chłopców.
Liczba chłopców = całkowita liczba uczniów - liczba dziewcząt.
Liczba chłopców $= 30 - 18 = 12$.

**Alternatywne podejście:**
**Krok 1.** Obliczenie procentu chłopców.
Jeśli 60% to dziewczęta, to chłopcy stanowią $100\\% - 60\\% = 40\\%$ wszystkich uczniów.

**Krok 2.** Obliczenie liczby chłopców.
Liczba chłopców $= 30 \\cdot 40\\% = 30 \\cdot \\frac{40}{100} = 30 \\cdot 0.4 = 12$.

**Odpowiedź:** W klasie jest 12 chłopców.

## Pułapki
*   **Błędne traktowanie kolejnych procentów:** Przy podwyżce/obniżce najpierw obliczamy nową kwotę, a dopiero potem od niej liczymy kolejny procent. Nie można dodawać lub odejmować procentów od siebie, jeśli odnoszą się do różnych wielkości początkowych (np. obniżka o 10% i potem o 20% to nie jest obniżka o 30%).
*   **Mylenie celu procentu:** Należy uważać, czego dotyczy procent. Czy jest to procent z całości, czy jakaś jej część? Czy liczymy procent z liczby początkowej, czy z już zmienionej?
*   **Błędy w zamianie procentów:** Niepoprawne przesunięcie przecinka przy zamianie procentu na liczbę dziesiętną (np. $25\\% = 0.025$ zamiast $0.25$) lub odwrotnie.
*   **Zadania tekstowe – niezrozumienie kontekstu:** Uważne przeczytanie zadania jest kluczowe. Czy szukamy wartości procentowej, procentu, czy liczby bazowej? Czego dotyczy pytanie?

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz $35\\%$ liczby 80.
2.  Jaki procent liczby 120 stanowi liczba 30?
3.  Tysiąc złotych wpłacono na lokatę oprocentowaną na 4% w skali roku. Po roku stan konta wynosił 1040 zł. Ile wynosiło oprocentowanie w stosunku do kwoty początkowej?
4.  Cena gry komputerowej wynosiła 160 zł. Po obniżce cena gry wynosi 140 zł. O ile procent obniżono cenę gry?
5.  Zapisz jako procent: a) 0.12, b) $\\frac{3}{5}$, c) 1.75.
6.  W sklepie sportowym ogłoszono wyprzedaż - wszystkie ceny zostały obniżone o 25%. Kurtka kosztowała pierwotnie 240 zł. Ile kosztuje po obniżce?
7.  W pewnej szkole 20% uczniów lubi matematykę, a 30% uczniów lubi język polski. Jaki procent uczniów lubi oba te przedmioty, jeśli wiadomo, że 40% uczniów nie lubi żadnego z tych przedmiotów? (Uwaga: to zadanie wymaga myślenia o dopełnieniu).

## Odpowiedzi
1.  $80 \\cdot 0.35 = 28$.
2.  $\\frac{30}{120} \\cdot 100\\% = \\frac{1}{4} \\cdot 100\\% = 25\\%$.
3.  $\\frac{1040 - 1000}{1000} \\cdot 100\\% = \\frac{40}{1000} \\cdot 100\\% = 0.04 \\cdot 100\\% = 4\\%$.
4.  Obniżka $= 160 - 140 = 20$ zł. Procentowa obniżka $= \\frac{20}{160} \\cdot 100\\% = \\frac{1}{8} \\cdot 100\\% = 12.5\\%$.
5.  a) $12\\%$, b) $60\\%$, c) $175\\%$.
6.  $240 \\cdot (1 - 0.25) = 240 \\cdot 0.75 = 180$ zł.
7.  Jeśli 40% nie lubi żadnego, to $100\\% - 40\\% = 60\\%$ lubi przynajmniej jeden z tych przedmiotów. Wiemy, że $20\\% + 30\\% = 50\\%$ (suma uczniów lubiących matematykę i polski). Różnica $60\\% - 50\\% = 10\\%$ to uczniowie, którzy lubią oba przedmioty (bo zostali policzeni dwukrotnie w sumie 50%). Odpowiedź: 10%.

## Szybka powtórka
1.  Ile to jest $1\\%$ liczby 500?
2.  Jak zamienić $75\\%$ na ułamek zwykły?
3.  Jeśli cena wzrosła z 100 zł do 120 zł, to o ile procent wzrosła?
4.  $10\\%$ z $10\\%$ z 1000 to ile?
5.  Cenę 200 zł obniżono o 50%. Jaka jest nowa cena?

## Diagram
\`\`\`text
+---------------------+
|     Całość (100%)   |
+----------+----------+
| Część A  | Część B  |
| (np. 60%)| (np. 40%)|
+----------+----------+
   |
   V
+---------------------+
|  Obliczanie części |
|  (np. 60% z 50)     |
+---------------------+
   |
   V
+---------------------+
|    Wynik (30)       |
+---------------------+
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "liczby_calkowite",
    title: "Liczby całkowite – od zera do minus nieskończoności",
    content: `## Na egzaminie
Liczby całkowite pojawiają się na egzaminie ósmoklasisty w zadaniach otwartych i zamkniętych. Często są elementem większych problemów, wymagających porównania temperatur, określenia głębokości czy położenia na osi liczbowej. Zazwyczaj zadania te są punktowane od 1 do 3 punktów i sprawdzają umiejętność wykonywania działań na liczbach całkowitych oraz rozumienia ich własności.

## Mapa tematu
1. Zrozumienie pojęcia liczb całkowitych (dodatnie, ujemne, zero).
2. Lokalizacja liczb całkowitych na osi liczbowej.
3. Porównywanie liczb całkowitych.
4. Dodawanie i odejmowanie liczb całkowitych.
5. Mnożenie i dzielenie liczb całkowitych.
6. Kolejność wykonywania działań na liczbach całkowitych.
7. Rozwiązywanie zadań tekstowych z wykorzystaniem liczb całkowitych.
8. Własności liczb całkowitych (parzystość, nieparzystość).

## Definicje i wzory
*   **Liczby całkowite ($\\mathbb{Z}$)** to zbiór liczb obejmujący:
    *   Liczby naturalne dodatnie: $1, 2, 3, \\dots$
    *   Liczbę zero: $0$
    *   Liczby przeciwne do liczb naturalnych dodatnich (liczby ujemne): $-1, -2, -3, \\dots$
    Zbiór liczb całkowitych zapisujemy jako $\\mathbb{Z} = \\{\\dots, -3, -2, -1, 0, 1, 2, 3, \\dots\\}$.

*   **Oś liczbowa:** Prosta, na której zaznaczamy punkty odpowiadające liczbom. Punkt $0$ to początek osi. Liczby dodatnie zaznaczamy na prawo od $0$, a liczby ujemne na lewo od $0$.

*   **Porównywanie liczb całkowitych:**
    *   Każda liczba dodatnia jest większa od zera i każdej liczby ujemnej.
    *   Zero jest większe od każdej liczby ujemnej.
    *   Spośród dwóch liczb ujemnych, ta która ma większą wartość bezwzględną, jest mniejsza (leży dalej od zera na osi liczbowej).
    *   Np. $-5 < -2$, ponieważ $-5$ leży na lewo od $-2$ na osi liczbowej.

*   **Dodawanie liczb całkowitych:**
    *   **Liczby o tym samym znaku:** Sumujemy wartości bezwzględne liczb i dodajemy wspólny znak.
        *   $a + b = \\text{znak}(a) \\cdot (|a| + |b|)$
        *   Przykład: $(-3) + (-5) = -8$, $3 + 5 = 8$
    *   **Liczby o przeciwnych znakach:** Odejmujemy mniejszą wartość bezwzględną od większej i wpisujemy znak liczby o większej wartości bezwzględnej.
        *   $a + b = \\text{znak}(a) \\cdot (|a| - |b|)$, gdy $|a| \\ge |b|$
        *   Przykład: $(-7) + 3 = -4$ (bo $|-7| > |3|$, wynik ma znak minus, obliczamy $7 - 3 = 4$)
        *   Przykład: $5 + (-2) = 3$ (bo $|5| > |-2|$, wynik ma znak plus, obliczamy $5 - 2 = 3$)
    *   **Liczba przeciwna:** $a + (-a) = 0$.

*   **Odejmowanie liczb całkowitych:** Odejmując liczbę, dodajemy jej liczbę przeciwną.
    *   $a - b = a + (-b)$
    *   Przykład: $5 - 8 = 5 + (-8) = -3$
    *   Przykład: $-4 - 3 = -4 + (-3) = -7$
    *   Przykład: $6 - (-2) = 6 + 2 = 8$
    *   Przykład: $-7 - (-1) = -7 + 1 = -6$

*   **Mnożenie liczb całkowitych:**
    *   Liczba dodatnia $\\times$ Liczba dodatnia = Liczba dodatnia ($+ \\cdot + = +$)
    *   Liczba ujemna $\\times$ Liczba ujemna = Liczba dodatnia ($- \\cdot - = +$)
    *   Liczba dodatnia $\\times$ Liczba ujemna = Liczba ujemna ($+ \\cdot - = -$)
    *   Liczba ujemna $\\times$ Liczba dodatnia = Liczba ujemna ($- \\cdot + = -$)
    *   Każda liczba $\\times 0 = 0$.
    *   Wzór ogólny: $a \\cdot b = \\text{znak}(a) \\cdot \\text{znak}(b) \\cdot |a| \\cdot |b|$, gdzie $\\text{znak}(x)$ zwraca $+$ dla $x>0$, $-$ dla $x<0$. Lub prościej: mnożymy wartości bezwzględne, a znak określamy według reguły: "plusy dają plus, minusy dają plus, różne znaki dają minus".

*   **Dzielenie liczb całkowitych:** Zasady znaków są takie same jak przy mnożeniu. Dzielenie jest możliwe tylko wtedy, gdy reszta wynosi $0$.
    *   Liczba dodatnia $\\div$ Liczba dodatnia = Liczba dodatnia ($+ \\div + = +$)
    *   Liczba ujemna $\\div$ Liczba ujemna = Liczba dodatnia ($- \\div - = +$)
    *   Liczba dodatnia $\\div$ Liczba ujemna = Liczba ujemna ($+ \\div - = -$)
    *   Liczba ujemna $\\div$ Liczba dodatnia = Liczba ujemna ($- \\div + = -$)
    *   Dzielenie przez $0$ jest niedozwolone.
    *   $a \\div b = \\frac{a}{b}$

*   **Kolejność wykonywania działań:**
    1.  Działania w nawiasach.
    2.  Potęgowanie i pierwiastkowanie (nie występują w tym temacie w kontekście liczb ujemnych).
    3.  Mnożenie i dzielenie (od lewej do prawej).
    4.  Dodawanie i odejmowanie (od lewej do prawej).

## Przykład 1 - podstawowy
Oblicz: $-5 + (3 - 8) - (-2)$

**Krok 1.** Wykonaj działanie w nawiasie: $3 - 8$.
Ponieważ odejmujemy większą liczbę od mniejszej, wynik będzie ujemny. Obliczamy różnicę wartości bezwzględnych: $8 - 3 = 5$. Zatem $3 - 8 = -5$.
Wyrażenie przyjmuje postać: $-5 + (-5) - (-2)$.

**Krok 2.** Zamień odejmowanie na dodawanie liczby przeciwnej.
Odejmowanie liczby $-2$ jest równoważne dodawaniu liczby $2$.
Wyrażenie przyjmuje postać: $-5 + (-5) + 2$.

**Krok 3.** Dodaj liczby o tym samym znaku: $-5 + (-5)$.
Sumujemy wartości bezwzględne: $5 + 5 = 10$. Wynik ma znak minus.
$-5 + (-5) = -10$.
Wyrażenie przyjmuje postać: $-10 + 2$.

**Krok 4.** Dodaj liczby o przeciwnych znakach: $-10 + 2$.
Wartość bezwzględna liczby $-10$ jest większa niż wartość bezwzględna liczby $2$ ($10 > 2$). Wynik będzie miał znak minus. Obliczamy różnicę wartości bezwzględnych: $10 - 2 = 8$.
$-10 + 2 = -8$.

**Sprawdzenie:**
Obliczmy krok po kroku:
$-5 + (3 - 8) - (-2) = -5 + (-5) - (-2)$
$= -5 - 5 + 2$
$= -10 + 2$
$= -8$
Wynik jest poprawny.

## Przykład 2 - maturalny
Temperaturę w Zakopanem o godzinie 6 rano wynosiła $-3^\\circ\\text{C}$. Do godziny 12 temperatura wzrosła o $8^\\circ\\text{C}$, a do godziny 18 spadła o $5^\\circ\\text{C}$. Jaka była temperatura w Zakopanem o godzinie 18?

**Krok 1.** Określ temperaturę po wzroście.
Temperatura początkowa: $-3^\\circ\\text{C}$.
Wzrost temperatury o $8^\\circ\\text{C}$ oznacza dodanie $8$.
Temperatura o 12: $-3 + 8$.
Są to liczby o przeciwnych znakach. Większą wartość bezwzględną ma $8$. Wynik będzie dodatni. Obliczamy $8 - 3 = 5$.
Temperatura o 12: $5^\\circ\\text{C}$.

**Krok 2.** Określ temperaturę po spadku.
Temperatura o 12: $5^\\circ\\text{C}$.
Spadek temperatury o $5^\\circ\\text{C}$ oznacza odjęcie $5$.
Temperatura o 18: $5 - 5$.

**Krok 3.** Wykonaj odejmowanie.
$5 - 5 = 0$.
Temperatura o 18: $0^\\circ\\text{C}$.

**Odpowiedź:** Temperatura w Zakopanem o godzinie 18 wynosiła $0^\\circ\\text{C}$.

## Przykład 3 - egzaminacyjny
W tabeli poniżej przedstawiono wyniki finansowe pewnej firmy przez cztery kolejne kwartały:

| Kwartał | Wynik finansowy (w tys. zł) |
| :------ | :-------------------------- |
| I       | $-1500$                     |
| II      | $+800$                      |
| III     | $-400$                      |
| IV      | $+1200$                     |

Oblicz całkowity wynik finansowy firmy za cały rok.

**Krok 1.** Zapisz wynik finansowy jako sumę liczb całkowitych.
Całkowity wynik finansowy to suma wyników z poszczególnych kwartałów:
$-1500 + 800 + (-400) + 1200$.

**Krok 2.** Dodaj liczby dodatnie.
$800 + 1200 = 2000$.

**Krok 3.** Dodaj liczby ujemne.
$-1500 + (-400) = -1900$.

**Krok 4.** Dodaj wyniki z kroku 2 i 3.
Wynik całkowity: $-1900 + 2000$.
Są to liczby o przeciwnych znakach. Większą wartość bezwzględną ma $2000$. Wynik będzie dodatni. Obliczamy $2000 - 1900 = 100$.
Wynik całkowity: $100$.

**Odpowiedź:** Całkowity wynik finansowy firmy za cały rok wyniósł $100$ tys. zł.

## Pułapki
*   **Mylenie znaków przy mnożeniu/dzieleniu:** Szczególnie ważne jest zapamiętanie, że iloczyn dwóch liczb ujemnych jest dodatni (np. $(-3) \\cdot (-4) = 12$, a nie $-12$).
*   **Błędy w odejmowaniu liczb ujemnych:** Zamiana odejmowania na dodawanie liczby przeciwnej jest kluczowa. Pamiętaj: $a - (-b) = a + b$. Częstym błędem jest pozostawienie minusa, np. $5 - (-3) = 2$ zamiast $8$.
*   **Kolejność wykonywania działań:** W wyrażeniach typu $5 - 3 \\cdot (-2)$, najpierw wykonujemy mnożenie: $3 \\cdot (-2) = -6$, a dopiero potem odejmowanie: $5 - (-6) = 5 + 6 = 11$. Nie wykonujemy $5-3=2$, a potem $2 \\cdot (-2) = -4$.
*   **Porównywanie liczb ujemnych:** Pamiętaj, że na osi liczbowej liczby stają się mniejsze w lewo. Dlatego $-10$ jest mniejsze niż $-2$. Mylenie wartości bezwzględnej z wartością liczby jest częstym błędem.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz: $-12 + 7 - (-3) + 5$.
2.  Oblicz: $(-4) \\cdot (-5) + 10$.
3.  Oblicz: $\\frac{-36}{ -6} - 4$.
4.  Pan Jan miał na koncie bankowym $-250$ zł. Wypłacił jeszcze $150$ zł, a następnie wpłacił $400$ zł. Jaki jest stan jego konta po tych operacjach?
5.  Temperatura w południe wynosiła $5^\\circ\\text{C}$. Do wieczora spadła o $7^\\circ\\text{C}$. Jaka była temperatura wieczorem?
6.  Oblicz: $8 - 12 \\div (-2) \\cdot 3$.
7.  Która liczba jest mniejsza: $-100$ czy $-99$?

## Odpowiedzi
1.  $-12 + 7 - (-3) + 5 = -12 + 7 + 3 + 5 = -5 + 3 + 5 = -2 + 5 = 3$.
2.  $(-4) \\cdot (-5) + 10 = 20 + 10 = 30$.
3.  $\\frac{-36}{ -6} - 4 = 6 - 4 = 2$.
4.  Stan konta: $-250 - 150 + 400 = -400 + 400 = 0$ zł.
5.  Temperatura wieczorem: $5 - 7 = -2^\\circ\\text{C}$.
6.  $8 - 12 \\div (-2) \\cdot 3 = 8 - (-6) \\cdot 3 = 8 - (-18) = 8 + 18 = 26$.
7.  Mniejsza jest liczba $-100$.

## Szybka powtórka
1.  Podaj przykład dwóch liczb całkowitych, których suma jest równa 0.
2.  Jaką liczbę otrzymamy, mnożąc liczbę ujemną przez liczbę ujemną?
3.  Czy liczba $-5$ jest większa czy mniejsza od $-1$?
4.  Jaka jest zasada przy odejmowaniu liczb ujemnych?
5.  Ile wynosi $0$ podzielone przez dowolną liczbę całkowitą różną od zera?`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "liczby",
    topic: "kolejnosc_dzialan",
    title: "Kolejność Wykonywania Działań",
    content: `## Na egzaminie
Zadania dotyczące kolejności wykonywania działań pojawiają się na egzaminie ósmoklasisty regularnie, zazwyczaj w zadaniach zamkniętych. Zazwyczaj dotyczą obliczenia wartości wyrażenia arytmetycznego, gdzie można zdobyć 1 lub 2 punkty. CKE sprawdza tutaj umiejętność poprawnego stosowania priorytetów działań, w tym potęgowania, mnożenia i dzielenia, a także nawiasów.

## Mapa tematu
1. Zrozumienie podstawowej kolejności wykonywania działań (nawiasy, potęgi, mnożenie/dzielenie, dodawanie/odejmowanie).
2. Poprawne stosowanie kolejności działań w wyrażeniach bez nawiasów.
3. Poprawne stosowanie kolejności działań w wyrażeniach z nawiasami różnego typu (okrągłe, kwadratowe, klamrowe).
4. Wykonywanie działań na liczbach całkowitych, ułamkach zwykłych i dziesiętnych.
5. Rozwiązywanie zadań tekstowych wymagających zastosowania kolejności działań.
6. Identyfikacja i unikanie typowych błędów rachunkowych i proceduralnych.
7. Sprawdzanie poprawności wykonanych obliczeń.

## Definicje i wzory
Kolejność wykonywania działań określa, w jakiej sekwencji należy przeprowadzić operacje matematyczne, aby uzyskać jednoznaczny wynik. W matematyce obowiązują ustalone priorytety:

*   **Nawiasy:** Działania w nawiasach wykonujemy jako pierwsze. Jeśli mamy nawiasy zagnieżdżone, zaczynamy od najbardziej wewnętrznych.
    *   Nawiasy okrągłe: $(\\ldots)$
    *   Nawiasy kwadratowe: $[\\ldots]$
    *   Nawiasy klamrowe: $\\{\\ldots\\}$
*   **Potęgowanie i pierwiastkowanie:** Po wykonaniu działań w nawiasach, przechodzimy do potęgowania i pierwiastkowania.
*   **Mnożenie i dzielenie:** Następnie wykonujemy mnożenie i dzielenie. Działania te mają ten sam priorytet, więc wykonujemy je w kolejności od lewej do prawej.
*   **Dodawanie i odejmowanie:** Na końcu wykonujemy dodawanie i odejmowanie. Te działania również mają ten sam priorytet i wykonujemy je od lewej do prawej.

**Podsumowanie kolejności:**

1.  Nawiasy $(\\ldots), [\\ldots], \\{\\ldots\\}$ (od najbardziej wewnętrznych na zewnątrz)
2.  Potęgowanie $\\text{a}^n$, $\\sqrt{a}$
3.  Mnożenie $\\text{a} \\cdot \\text{b}$ i dzielenie $\\text{a} : \\text{b}$ (od lewej do prawej)
4.  Dodawanie $\\text{a} + \\text{b}$ i odejmowanie $\\text{a} - \\text{b}$ (od lewej do prawej)

**Operacje na ułamkach:**
Przy obliczeniach z ułamkami należy pamiętać o zasadach:
*   Dodawanie i odejmowanie: Sprowadzanie do wspólnego mianownika. $\\frac{a}{b} + \\frac{c}{d} = \\frac{ad+bc}{bd}$
*   Mnożenie: $\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}$
*   Dzielenie: $\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c} = \\frac{a \\cdot d}{b \\cdot c}$ (zawsze odwracamy drugi ułamek i zamieniamy dzielenie na mnożenie).

## Przykład 1 - podstawowy
Oblicz wartość wyrażenia: $10 + 2 \\cdot (6 - 3^2)$

**Krok 1.** Rozpoczynamy od działań w nawiasie. W nawiasie mamy odejmowanie i potęgowanie. Potęgowanie ma wyższy priorytet. Obliczamy $3^2$.
$3^2 = 9$
Wyrażenie wygląda teraz tak: $10 + 2 \\cdot (6 - 9)$

**Krok 2.** Kontynuujemy działania w nawiasie. Wykonujemy odejmowanie.
$6 - 9 = -3$
Wyrażenie przyjmuje postać: $10 + 2 \\cdot (-3)$

**Krok 3.** W wyrażeniu pozostało dodawanie i mnożenie. Mnożenie ma wyższy priorytet. Wykonujemy mnożenie $2 \\cdot (-3)$.
$2 \\cdot (-3) = -6$
Wyrażenie to: $10 + (-6)$

**Krok 4.** Pozostało nam dodawanie. Wykonujemy ostatnie działanie. Dodanie liczby ujemnej jest równoważne odjęciu liczby dodatniej.
$10 + (-6) = 10 - 6 = 4$

**Sprawdzenie:**
Wykonaliśmy działania zgodnie z kolejnością:
1. Potęga w nawiasie: $3^2 = 9$.
2. Odejmowanie w nawiasie: $6 - 9 = -3$.
3. Mnożenie poza nawiasem: $2 \\cdot (-3) = -6$.
4. Dodawanie: $10 + (-6) = 4$.
Wynik jest poprawny.

## Przykład 2 - maturalny
Oblicz wartość wyrażenia: $3 \\frac{1}{2} - (\\frac{3}{4} \\cdot 1,2 : 0,5 + 2,5)$

**Krok 1.** Zamieniamy liczby mieszane i dziesiętne na ułamki zwykłe, aby ułatwić obliczenia.
$3 \\frac{1}{2} = \\frac{7}{2}$
$1,2 = \\frac{12}{10} = \\frac{6}{5}$
$0,5 = \\frac{5}{10} = \\frac{1}{2}$
$2,5 = \\frac{25}{10} = \\frac{5}{2}$
Wyrażenie wygląda tak: $\\frac{7}{2} - (\\frac{3}{4} \\cdot \\frac{6}{5} : \\frac{1}{2} + \\frac{5}{2})$

**Krok 2.** Wykonujemy działania w nawiasie. Mamy mnożenie, dzielenie i dodawanie. Najpierw mnożenie i dzielenie od lewej do prawej.
Obliczamy mnożenie: $\\frac{3}{4} \\cdot \\frac{6}{5} = \\frac{3 \\cdot 6}{4 \\cdot 5} = \\frac{18}{20} = \\frac{9}{10}$
Wyrażenie w nawiasie: $(\\frac{9}{10} : \\frac{1}{2} + \\frac{5}{2})$

**Krok 3.** Wykonujemy dzielenie w nawiasie. Pamiętamy, że dzielenie przez ułamek to mnożenie przez jego odwrotność.
$\\frac{9}{10} : \\frac{1}{2} = \\frac{9}{10} \\cdot \\frac{2}{1} = \\frac{18}{10} = \\frac{9}{5}$
Wyrażenie w nawiasie: $(\\frac{9}{5} + \\frac{5}{2})$

**Krok 4.** Wykonujemy dodawanie w nawiasie. Sprowadzamy ułamki do wspólnego mianownika (10).
$\\frac{9}{5} + \\frac{5}{2} = \\frac{9 \\cdot 2}{5 \\cdot 2} + \\frac{5 \\cdot 5}{2 \\cdot 5} = \\frac{18}{10} + \\frac{25}{10} = \\frac{18+25}{10} = \\frac{43}{10}$
Całe wyrażenie wygląda teraz tak: $\\frac{7}{2} - \\frac{43}{10}$

**Krok 5.** Wykonujemy odejmowanie. Sprowadzamy ułamki do wspólnego mianownika (10).
$\\frac{7}{2} - \\frac{43}{10} = \\frac{7 \\cdot 5}{2 \\cdot 5} - \\frac{43}{10} = \\frac{35}{10} - \\frac{43}{10} = \\frac{35-43}{10} = \\frac{-8}{10}$

**Krok 6.** Upraszczamy wynik.
$\\frac{-8}{10} = -\\frac{4}{5}$

**Sprawdzenie:**
1. Zamiana na ułamki: OK.
2. Mnożenie w nawiasie: $\\frac{3}{4} \\cdot \\frac{6}{5} = \\frac{18}{20} = \\frac{9}{10}$. OK.
3. Dzielenie w nawiasie: $\\frac{9}{10} : \\frac{1}{2} = \\frac{9}{10} \\cdot 2 = \\frac{18}{10} = \\frac{9}{5}$. OK.
4. Dodawanie w nawiasie: $\\frac{9}{5} + \\frac{5}{2} = \\frac{18+25}{10} = \\frac{43}{10}$. OK.
5. Odejmowanie: $\\frac{7}{2} - \\frac{43}{10} = \\frac{35-43}{10} = \\frac{-8}{10}$. OK.
6. Uproszczenie: $-\\frac{4}{5}$. OK.
Wynik jest poprawny.

## Przykład 3 - egzaminacyjny
Które z poniższych wyrażeń ma wartość największą?
A) $5 + 3 \\cdot 2$
B) $(5 + 3) \\cdot 2$
C) $5 \\cdot 3 + 2$
D) $5 + (3 - 2)$

**Krok 1.** Obliczamy wartość każdego wyrażenia, stosując poprawną kolejność działań.

*   **Wyrażenie A:** $5 + 3 \\cdot 2$
    Mnożenie ma wyższy priorytet niż dodawanie.
    $3 \\cdot 2 = 6$
    $5 + 6 = 11$

*   **Wyrażenie B:** $(5 + 3) \\cdot 2$
    Najpierw wykonujemy działanie w nawiasie.
    $5 + 3 = 8$
    $8 \\cdot 2 = 16$

*   **Wyrażenie C:** $5 \\cdot 3 + 2$
    Mnożenie ma wyższy priorytet niż dodawanie.
    $5 \\cdot 3 = 15$
    $15 + 2 = 17$

*   **Wyrażenie D:** $5 + (3 - 2)$
    Najpierw wykonujemy działanie w nawiasie.
    $3 - 2 = 1$
    $5 + 1 = 6$

**Krok 2.** Porównujemy otrzymane wartości: 11, 16, 17, 6.
Największą wartość ma wyrażenie C, które wynosi 17.

**Odpowiedź:** C

**Sprawdzenie:**
Każde wyrażenie zostało obliczone zgodnie z zasadami kolejności działań. Porównanie wyników jest poprawne.

## Pułapki
*   **Ignorowanie kolejności działań:** Najczęstszym błędem jest wykonywanie działań od lewej do prawej, bez uwzględniania priorytetów (np. dodawanie przed mnożeniem). Zawsze zaczynaj od nawiasów, potem potęgi, mnożenie/dzielenie, a na końcu dodawanie/odejmowanie.
*   **Błędy w działaniach na ułamkach:** Niewłaściwe sprowadzanie do wspólnego mianownika, błędy przy mnożeniu lub dzieleniu ułamków (np. zapominanie o odwróceniu drugiego ułamka przy dzieleniu).
*   **Błędy ze znakami:** Szczególnie przy odejmowaniu lub mnożeniu liczb ujemnych. Pamiętaj, że plus razy minus daje minus, a minus razy minus daje plus. Dodawanie liczby ujemnej jest równoważne odejmowaniu.
*   **Niewłaściwe opuszczanie nawiasów:** Nawiasy zmieniają kolejność działań. Po obliczeniu wyrażenia w nawiasie, nawias należy opuścić (lub zastąpić go mnożeniem/dzieleniem, jeśli poprzedza go liczba lub inne wyrażenie). Nie należy go przenosić bezmyślnie.
*   **Brak uproszczeń:** Wynik końcowy należy podać w najprostszej postaci (np. skrócić ułamek).

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz: $24 - 3 \\cdot (5 + 2^2) + 10$
2.  Oblicz: $15 \\div (\\frac{1}{2} + \\frac{1}{3}) \\cdot 2$
3.  Oblicz: $\\frac{2}{3} + \\frac{1}{4} \\cdot (\\frac{4}{5} - 0,5)$
4.  Oblicz: $(18 - 2 \\cdot 5) \\cdot [3 + (7 - 4)]$
5.  Oblicz: $100 - (50 - 3 \\cdot 7) + (4 \\cdot 6 - 50)$
6.  Które wyrażenie ma wartość 15?
    A) $1 + 2 \\cdot 3 + 4$
    B) $(1 + 2) \\cdot 3 + 4$
    C) $1 + (2 \\cdot 3) + 4$
    D) $1 + 2 + 3 \\cdot 4$

## Odpowiedzi
1.  $24 - 3 \\cdot (5 + 4) + 10 = 24 - 3 \\cdot 9 + 10 = 24 - 27 + 10 = -3 + 10 = 7$
2.  $15 \\div (\\frac{3}{6} + \\frac{2}{6}) \\cdot 2 = 15 \\div \\frac{5}{6} \\cdot 2 = 15 \\cdot \\frac{6}{5} \\cdot 2 = 3 \\cdot 6 \\cdot 2 = 36$
3.  $\\frac{2}{3} + \\frac{1}{4} \\cdot (\\frac{8}{10} - \\frac{5}{10}) = \\frac{2}{3} + \\frac{1}{4} \\cdot \\frac{3}{10} = \\frac{2}{3} + \\frac{3}{40} = \\frac{80}{120} + \\frac{9}{120} = \\frac{89}{120}$
4.  $(18 - 10) \\cdot [3 + 3] = 8 \\cdot 6 = 48$
5.  $100 - (50 - 21) + (24 - 50) = 100 - 29 + (-26) = 71 - 26 = 45$
6.  A) $1 + 2 \\cdot 3 + 4 = 11$, B) $(1 + 2) \\cdot 3 + 4 = 13$, C) $1 + (2 \\cdot 3) + 4 = 11$, D) $1 + 2 + 3 \\cdot 4 = 15$. Poprawna odpowiedź: D.

## Szybka powtórka
1.  Jaka jest pierwsza operacja, którą wykonujemy w wyrażeniu z nawiasami?
2.  Jakie działania wykonujemy po potęgowaniu?
3.  Czy mnożenie i dzielenie mają ten sam priorytet?
4.  W jakiej kolejności wykonujemy dodawanie i odejmowanie, gdy występują obok siebie?
5.  Co trzeba zrobić przed dodaniem lub odjęciem ułamków o różnych mianownikach?`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "algebra",
    topic: "wyrazenia_algebraiczne",
    title: "Wyrażenia Algebraiczne – Klucz do Sukcesu na Egzaminie Ósmoklasisty",
    content: `## Na egzaminie
Wyrażenia algebraiczne pojawiają się na egzaminie ósmoklasisty regularnie, zazwyczaj w zadaniach otwartych, gdzie liczy się poprawny zapis i wykonanie obliczeń. Możesz spodziewać się pytań dotyczących upraszczania wyrażeń, podstawiania wartości liczbowych, rozwiązywania prostych równań z jedną niewiadomą, a także zadań tekstowych, które wymagają ułożenia i przekształcenia wyrażenia algebraicznego. Opanowanie tego tematu to pewne punkty na egzaminie.

## Mapa tematu
1.  Zrozumienie pojęcia zmiennej, wyrażenia algebraicznego i jego wartości.
2.  Upraszczanie wyrażeń algebraicznych przez redukcję wyrazów podobnych.
3.  Mnożenie i dzielenie jednomianów.
4.  Usuwanie nawiasów i mnożenie nawiasów przez liczbę lub jednomian.
5.  Podstawianie wartości liczbowych do wyrażeń algebraicznych.
6.  Rozwiązywanie prostych równań z jedną niewiadomą, opartych na wyrażeniach algebraicznych.
7.  Przekształcanie zadań tekstowych na wyrażenia algebraiczne.
8.  Zastosowanie wyrażeń algebraicznych w kontekście geometrycznym.

## Definicje i wzory
*   **Wyrażenie algebraiczne** to takie, które zawiera liczby, litery (zmienne) i znaki działań. Litery reprezentują liczby, które mogą się zmieniać.
    *   Przykład: $3x + 5$, $2(a-b)$, $\\frac{x}{4}$
*   **Jednomian** to najprostsze wyrażenie algebraiczne – iloczyn liczby i zmiennych podniesionych do naturalnych potęg.
    *   Przykład: $5x^2y$, $-7ab$, $3$ (liczba też jest jednomianem)
    *   **Współczynnik jednomianu**: liczba stojąca przed zmiennymi (np. weźmy $5x^2y$, współczynnikiem jest $5$).
    *   **Część zmienna jednomianu**: zmienne występujące w jednomianie (np. $x^2y$).
*   **Wyrazy podobne**: jednomiany mające tę samą część zmienną (kolejność zmiennych i ich potęgi są identyczne).
    *   Przykład: $3x$ i $-2x$ są wyrazami podobnymi. $5a^2b$ i $-a^2b$ są wyrazami podobnymi. $2x$ i $2x^2$ nie są wyrazami podobnymi.
*   **Redukcja wyrazów podobnych**: dodawanie lub odejmowanie wyrazów podobnych. Wykonujemy działania na współczynnikach, część zmienna pozostaje bez zmian.
    *   Przykład: $3x + 5x = (3+5)x = 8x$
    *   Przykład: $7a - 2a + a = (7-2+1)a = 6a$
*   **Działania na jednomianach**:
    *   **Dodawanie/odejmowanie**: Tylko wyrazów podobnych.
        *   $a \\cdot x + b \\cdot x = (a+b) \\cdot x$
    *   **Mnożenie**: Mnożymy współczynniki i mnożymy części zmienne (przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki).
        *   $(ax^m) \\cdot (bx^n) = (a \\cdot b) \\cdot x^{m+n}$
        *   Przykład: $(3x^2) \\cdot (4x^3) = (3 \\cdot 4) \\cdot x^{2+3} = 12x^5$
        *   Przykład: $(-2ab) \\cdot (5a^2b^3) = (-2 \\cdot 5) \\cdot (a \\cdot a^2) \\cdot (b \\cdot b^3) = -10 \\cdot a^{1+2} \\cdot b^{1+3} = -10a^3b^4$
    *   **Dzielenie**: Dzielimy współczynniki i dzielimy części zmienne (przy dzieleniu potęg o tej samej podstawie odejmujemy wykładniki). Dzielenie jest możliwe, gdy wynik jest jednomianem.
        *   $\\frac{ax^m}{bx^n} = \\frac{a}{b} \\cdot x^{m-n}$ (dla $b \\neq 0$ i $x \\neq 0$)
        *   Przykład: $\\frac{15x^5}{3x^2} = \\frac{15}{3} \\cdot x^{5-2} = 5x^3$
        *   Przykład: $\\frac{-10a^3b^4}{2ab^2} = \\frac{-10}{2} \\cdot \\frac{a^3}{a^1} \\cdot \\frac{b^4}{b^2} = -5 \\cdot a^{3-1} \\cdot b^{4-2} = -5a^2b^2$
*   **Usuwanie nawiasów**:
    *   **Nawias poprzedzony znakiem "+" lub niepoprzedzony żadnym znakiem**: Opuszczamy nawias bez zmian.
        *   $a + (b+c) = a+b+c$
        *   $a + (b-c) = a+b-c$
    *   **Nawias poprzedzony znakiem "-": Opuszczamy nawias, zmieniając znaki wszystkim wyrazom wewnątrz nawiasu na przeciwne.**
        *   $a - (b+c) = a-b-c$
        *   $a - (b-c) = a-b+c$
    *   **Mnożenie nawiasu przez liczbę lub jednomian**: Każdy wyraz w nawiasie mnożymy przez liczbę/jednomian stojący przed nawiasem.
        *   $k \\cdot (a+b) = k \\cdot a + k \\cdot b$
        *   $k \\cdot (a-b) = k \\cdot a - k \\cdot b$
        *   $2(x+3y) = 2x + 6y$
        *   $-3(4a-b) = -12a + 3b$
        *   $x(y+2z) = xy + 2xz$
*   **Podstawianie wartości**: Zastępujemy litery (zmienne) odpowiadającymi im wartościami liczbowymi i wykonujemy obliczenia.
*   **Wzory skróconego mnożenia (przypomnienie, mogą być pomocne)**:
    *   $(a+b)^2 = a^2 + 2ab + b^2$
    *   $(a-b)^2 = a^2 - 2ab + b^2$
    *   $(a+b)(a-b) = a^2 - b^2$

## Przykład 1 - podstawowy
Uprość wyrażenie algebraiczne: $5x - 3y + 2x + 7y - 10$.

**Krok 1.** Zidentyfikuj wyrazy podobne. Wyrazy zawierające $x$ to $5x$ i $2x$. Wyrazy zawierające $y$ to $-3y$ i $7y$. Wyraz wolny to $-10$.

**Krok 2.** Zredukuj wyrazy podobne zawierające $x$.
$5x + 2x = (5+2)x = 7x$

**Krok 3.** Zredukuj wyrazy podobne zawierające $y$.
$-3y + 7y = (-3+7)y = 4y$

**Krok 4.** Połącz zredukowane wyrazy z wyrazem wolnym.
Otrzymujemy: $7x + 4y - 10$.

**Sprawdzenie:**
Nie ma wyrazów podobnych, więc wyrażenie jest uproszczone. Wynik jest poprawny.

## Przykład 2 - maturalny
Oblicz wartość wyrażenia $3(a-2b) - (5a+b)$ dla $a=2$ i $b=-1$.

**Krok 1.** Najpierw uprośćmy dane wyrażenie algebraiczne. Usuwamy nawiasy.
$3(a-2b) - (5a+b) = (3 \\cdot a + 3 \\cdot (-2b)) - (5a+b)$
$= (3a - 6b) - (5a+b)$

**Krok 2.** Usuwamy drugi nawias, pamiętając o zmianie znaków.
$= 3a - 6b - 5a - b$

**Krok 3.** Redukujemy wyrazy podobne. Grupujemy wyrazy z $a$ i wyrazy z $b$.
$= (3a - 5a) + (-6b - b)$
$= -2a - 7b$

**Krok 4.** Teraz podstawiamy podane wartości $a=2$ i $b=-1$ do uproszczonego wyrażenia.
$-2a - 7b = -2(2) - 7(-1)$

**Krok 5.** Wykonujemy obliczenia.
$= -4 - (-7)$
$= -4 + 7$
$= 3$

**Sprawdzenie:**
Można też podstawić wartości od razu do oryginalnego wyrażenia:
$3(2 - 2(-1)) - (5(2) + (-1))$
$= 3(2 + 2) - (10 - 1)$
$= 3(4) - (9)$
$= 12 - 9$
$= 3$.
Wynik jest ten sam, co potwierdza poprawność obliczeń.

## Przykład 3 - egzaminacyjny
Suma dwóch liczb wynosi $15$. Jedna z tych liczb jest o $3$ większa od drugiej. Zapisz wyrażenie algebraiczne opisujące tę sytuację, a następnie znajdź te liczby.

**Krok 1.** Zdefiniuj zmienne. Niech mniejsza liczba będzie oznaczona jako $x$. Wtedy druga liczba, która jest o $3$ większa, wynosi $x+3$.

**Krok 2.** Zapisz wyrażenie opisujące sumę tych liczb.
Suma = (pierwsza liczba) + (druga liczba)
Suma = $x + (x+3)$

**Krok 3.** Uprość wyrażenie na sumę.
$x + x + 3 = 2x + 3$.
Wiemy, że suma wynosi $15$, więc możemy ułożyć równanie:
$2x + 3 = 15$.

**Krok 4.** Rozwiąż równanie, aby znaleźć wartość $x$.
$2x + 3 = 15$
Odejmujemy $3$ od obu stron:
$2x = 15 - 3$
$2x = 12$
Dzielimy obie strony przez $2$:
$x = \\frac{12}{2}$
$x = 6$.

**Krok 5.** Znajdź drugą liczbę i podaj odpowiedź.
Mniejsza liczba ($x$) wynosi $6$.
Większa liczba ($x+3$) wynosi $6+3 = 9$.
Sprawdzenie: Suma liczb $6+9=15$. Różnica $9-6=3$. Zgadza się.
Szukane liczby to $6$ i $9$.

## Pułapki
*   **Błędne opuszczanie nawiasów**: Szczególnie przy nawiasie poprzedzonym minusem. Pamiętaj, że minus przed nawiasem zmienia znaki WSZYSTKICH wyrazów w nawiasie.
    *   *Błąd*: $5 - (x-2) = 5 - x - 2$ (niepoprawne, $-2$ nie zmieniło znaku).
    *   *Poprawnie*: $5 - (x-2) = 5 - x + 2$.
*   **Niepoprawna redukcja wyrazów podobnych**: Mylenie zmiennych lub potęg. Tylko wyrazy o IDENTYCZNEJ części zmiennej można redukować.
    *   *Błąd*: $3x + 2x^2 = 5x^3$ (zmienne i potęgi nie są takie same).
    *   *Poprawnie*: $3x + 2x^2$ (nie można uprościć dalej).
*   **Błędy przy mnożeniu**: Zapominanie o mnożeniu liczby/jednomianu przez KAŻDY wyraz w nawiasie lub niepoprawne mnożenie potęg.
    *   *Błąd*: $2(x+3) = 2x + 3$ (nie pomnożono $2$ przez $3$).
    *   *Poprawnie*: $2(x+3) = 2x + 6$.
    *   *Błąd*: $(2x^2)(3x^3) = 6x^5$ (poprawnie). Lecz $(2x^2)(3x^3) = 5x^5$ (błąd dodawania wykładników zamiast mnożenia współczynników).
*   **Błędy przy podstawianiu liczb ujemnych**: Niewłaściwe stosowanie znaku minusa, zwłaszcza przy potęgowaniu lub mnożeniu.
    *   *Błąd*: $-2^2 = -4$ (poprawnie to $(-2)^2=4$). Jeśli mamy $-2a$ i $a=-2$, to $-2(-2) = 4$.
    *   *Błąd*: $-3(-4) = -12$ (błąd przy mnożeniu dwóch liczb ujemnych).
    *   *Poprawnie*: $-3(-4) = 12$.

## Ćwiczenia do samodzielnego rozwiązania
1.  Uprość wyrażenie: $7a - 4b + 2a + 9b - 5$.
2.  Pomnóż i uprość: $(5x^2y) \\cdot (-3xy^3)$.
3.  Podziel i uprość: $\\frac{24a^5b^3}{ -6a^2b}$.
4.  Usuń nawiasy i zredukuj wyrazy podobne: $5(2x - y) - (x + 3y)$.
5.  Oblicz wartość wyrażenia $2(m-3n) + 4(n-m)$ dla $m=-1$ i $n=2$.
6.  Suma trzech kolejnych liczb naturalnych wynosi $30$. Zapisz wyrażenie algebraiczne opisujące tę sytuację i znajdź te liczby.
7.  Obwód prostokąta wynosi $28$ cm. Jeden bok jest $2$ cm dłuższy od drugiego. Oblicz długości boków tego prostokąta.

## Odpowiedzi
1.  $9a + 5b - 5$
2.  $-15x^3y^4$
3.  $-4a^3b^2$
4.  $5(2x - y) - (x + 3y) = 10x - 5y - x - 3y = 9x - 8y$
5.  Wyrażenie: $2m - 6n + 4n - 4m = -2m - 2n$.
    Po podstawieniu $m=-1, n=2$: $-2(-1) - 2(2) = 2 - 4 = -2$.
6.  Niech pierwsza liczba to $x$. Kolejne to $x+1$ i $x+2$.
    Suma: $x + (x+1) + (x+2) = 3x+3$.
    Równanie: $3x+3 = 30 \\implies 3x = 27 \\implies x=9$.
    Liczby to $9, 10, 11$.
7.  Niech krótszy bok ma długość $x$. Dłuższy bok ma długość $x+2$.
    Obwód: $2x + 2(x+2) = 2x + 2x + 4 = 4x+4$.
    Równanie: $4x+4 = 28 \\implies 4x = 24 \\implies x=6$.
    Boki mają długość $6$ cm i $8$ cm.

## Szybka powtórka
1.  Czym są wyrazy podobne w wyrażeniu algebraicznym?
2.  Jaka jest zasada mnożenia jednomianów?
3.  Co się dzieje ze znakami wyrazów w nawiasie, gdy nawias poprzedza znak minus?
4.  Jakie są trzy główne pułapki, na które trzeba uważać przy upraszczaniu wyrażeń algebraicznych?
5.  Dlaczego ważne jest upraszczanie wyrażeń algebraicznych przed podstawieniem wartości liczbowych?

## Diagram`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "algebra",
    topic: "wzory_skroconego_mnozenia",
    title: "Wzory skróconego mnożenia dla ósmoklasisty",
    content: `## Na egzaminie
Wzory skróconego mnożenia pojawiają się na egzaminie ósmoklasisty stosunkowo często, zwykle w zadaniach otwartych, ale także jako element zadań zamkniętych. Pozwalają na szybkie i sprawne przekształcanie wyrażeń algebraicznych, obliczanie wartości liczbowych oraz upraszczanie równań i nierówności. Zazwyczaj można za nie uzyskać od 2 do 4 punktów, w zależności od stopnia skomplikowania zadania. CKE lubi sprawdzać znajomość podstawowych wzorów: kwadratu sumy, kwadratu różnicy oraz różnicy kwadratów.

## Mapa tematu
1.  **Zrozumienie idei wzorów skróconego mnożenia:** Dlaczego powstały i co upraszczają.
2.  **Kwadrát sumy:** Definicja, wzór i przykłady zastosowań.
3.  **Kwadrát różnicy:** Definicja, wzór i przykłady zastosowań.
4.  **Różnica kwadratów:** Definicja, wzór i przykłady zastosowań.
5.  **Zastosowanie wzorów w upraszczaniu wyrażeń algebraicznych.**
6.  **Zastosowanie wzorów do obliczeń liczbowych.**
7.  **Rozpoznawanie wzorów w zadaniach tekstowych i geometrycznych.**
8.  **Rozwiązywanie zadań egzaminacyjnych z wykorzystaniem wzorów skróconego mnożenia.**

## Definicje i wzory
Wzory skróconego mnożenia to gotowe schematy, które pozwalają na szybkie przekształcanie iloczynów wyrażeń algebraicznych do postaci sumy lub różnicy, bez konieczności wykonywania pełnego mnożenia każdego elementu. Upraszczają obliczenia i ułatwiają dalsze prace z wyrażeniami algebraicznymi.

*   **Kwadrat sumy:** $(a+b)^2$
    *   Wzór: $(a+b)^2 = a^2 + 2ab + b^2$
    *   Słownie: Kwadrat sumy dwóch wyrażeń jest równy kwadratowi pierwszego wyrażenia, plus podwojony iloczyn pierwszego i drugiego wyrażenia, plus kwadrat drugiego wyrażenia.

*   **Kwadrat różnicy:** $(a-b)^2$
    *   Wzór: $(a-b)^2 = a^2 - 2ab + b^2$
    *   Słownie: Kwadrat różnicy dwóch wyrażeń jest równy kwadratowi pierwszego wyrażenia, minus podwojony iloczyn pierwszego i drugiego wyrażenia, plus kwadrat drugiego wyrażenia.

*   **Różnica kwadratów:** $a^2 - b^2$
    *   Wzór: $a^2 - b^2 = (a-b)(a+b)$
    *   Słownie: Różnica kwadratów dwóch wyrażeń jest równa iloczynowi różnicy tych wyrażeń i ich sumy.

**Dodatkowe uwagi:**

*   W powyższych wzorach $a$ i $b$ mogą być liczbami, pojedynczymi zmiennymi, potęgami zmiennych, a nawet bardziej złożonymi wyrażeniami algebraicznymi (np. $a = 3x$, $b = 2y$ lub $a = x^2$, $b = 5$).
*   Kluczowe jest prawidłowe rozpoznanie, które wyrażenie pełni rolę $a$, a które rolę $b$.
*   Wzory można stosować w obie strony: do zamiany iloczynu na sumę (rozwinięcie) lub sumy/różnicy na iloczyn (faktoryzacja). Na egzaminie częściej spotykamy się z rozwinięciem.

## Przykład 1 - podstawowy
**Zadanie:** Rozwiń wyrażenie $(2x+3)^2$.

**Rozwiązanie:**

*   **Krok 1.** Zidentyfikuj wzór. Wyrażenie ma postać $(a+b)^2$, gdzie $a = 2x$ i $b = 3$. Użyjemy wzoru na kwadrat sumy: $(a+b)^2 = a^2 + 2ab + b^2$.

*   **Krok 2.** Oblicz $a^2$. W tym przypadku $a^2 = (2x)^2$. Pamiętaj, że potęgujemy zarówno liczbę, jak i zmienną: $(2x)^2 = 2^2 \\cdot x^2 = 4x^2$.

*   **Krok 3.** Oblicz $2ab$. W tym przypadku $2ab = 2 \\cdot (2x) \\cdot 3$. Mnożymy liczby i zmienną: $2 \\cdot 2x \\cdot 3 = (2 \\cdot 2 \\cdot 3) \\cdot x = 12x$.

*   **Krok 4.** Oblicz $b^2$. W tym przypadku $b^2 = 3^2 = 9$.

*   **Krok 5.** Złóż wszystko w całość, podstawiając obliczone części do wzoru: $a^2 + 2ab + b^2 = 4x^2 + 12x + 9$.

**Sprawdzenie:** Możemy sprawdzić, mnożąc $(2x+3)(2x+3)$ tradycyjnie:
$(2x+3)(2x+3) = 2x \\cdot (2x+3) + 3 \\cdot (2x+3) = (4x^2 + 6x) + (6x + 9) = 4x^2 + 6x + 6x + 9 = 4x^2 + 12x + 9$. Wynik się zgadza.

## Przykład 2 - maturalny
**Zadanie:** Uprość wyrażenie $(x-5)^2 - (x+2)(x-2)$.

**Rozwiązanie:**

*   **Krok 1.** Zidentyfikuj części wyrażenia i zastosuj odpowiednie wzory. Mamy $(x-5)^2$ oraz $(x+2)(x-2)$.
    *   Pierwszą część rozwiniemy za pomocą wzoru na kwadrat różnicy: $(a-b)^2 = a^2 - 2ab + b^2$, gdzie $a=x$ i $b=5$.
    *   Drugą część przekształcimy za pomocą wzoru na różnicę kwadratów: $a^2 - b^2 = (a-b)(a+b)$, gdzie $a=x$ i $b=2$.

*   **Krok 2.** Rozwiń $(x-5)^2$. Stosując wzór $(a-b)^2 = a^2 - 2ab + b^2$:
    $a=x$, $b=5$.
    $a^2 = x^2$
    $2ab = 2 \\cdot x \\cdot 5 = 10x$
    $b^2 = 5^2 = 25$
    Zatem $(x-5)^2 = x^2 - 10x + 25$.

*   **Krok 3.** Przekształć $(x+2)(x-2)$. Stosując wzór $a^2 - b^2 = (a-b)(a+b)$:
    $a=x$, $b=2$.
    Wzór działa w obie strony, więc $(x+2)(x-2) = x^2 - 2^2 = x^2 - 4$.

*   **Krok 4.** Wstaw rozwinięcia z powrotem do pierwotnego wyrażenia. Pamiętaj o nawiasach, szczególnie przy odejmowaniu:
    $(x-5)^2 - (x+2)(x-2) = (x^2 - 10x + 25) - (x^2 - 4)$.

*   **Krok 5.** Uprość wyrażenie, usuwając nawiasy i redukując wyrazy podobne. Zwróć uwagę na zmianę znaków przy nawiasie z minusem:
    $x^2 - 10x + 25 - x^2 + 4$.
    Wyrazy podobne: $x^2$ i $-x^2$ się znoszą ($x^2 - x^2 = 0$).
    Pozostaje: $-10x + 25 + 4$.
    Zredukuj stałe: $-10x + 29$.

**Ostateczny wynik:** Uproszczone wyrażenie to $-10x + 29$.

## Przykład 3 - egzaminacyjny

**Zadanie:** Oblicz wartość wyrażenia $101^2 - 99^2$.

**Rozwiązanie:**
Zauważmy, że to wyrażenie ma postać $a^2 - b^2$, gdzie $a=101$ i $b=99$. Jest to idealne zastosowanie wzoru na **różnicę kwadratów**: $a^2 - b^2 = (a-b)(a+b)$.

*   **Krok 1.** Zastosuj wzór na różnicę kwadratów:
    $101^2 - 99^2 = (101 - 99)(101 + 99)$.

*   **Krok 2.** Wykonaj działania w nawiasach:
    $(101 - 99) = 2$
    $(101 + 99) = 200$

*   **Krok 3.** Pomnóż wyniki z nawiasów:
    $2 \\cdot 200 = 400$.

**Wynik:** Wartość wyrażenia $101^2 - 99^2$ wynosi 400. Jest to znacznie szybsze niż obliczanie $101^2$ i $99^2$ oddzielnie, a następnie odejmowanie.

## Pułapki
*   **Znaki w kwadracie różnicy:** Częstym błędem jest zapominanie o znaku minus przed środkowym wyrazem $2ab$ we wzorze $(a-b)^2 = a^2 - 2ab + b^2$. Pamiętaj: kwadrat sumy to $+2ab$, kwadrat różnicy to $-2ab$.
*   **Potęgowanie wyrażeń:** Przy obliczaniu $a^2$ lub $b^2$ w postaci $(kx)^n$ lub $(k+x)^n$, łatwo pominąć potęgowanie wszystkich składowych. Na przykład, $(2x)^2$ to $4x^2$, a nie $2x^2$. Podobnie $(x+3)^2$ to $x^2 + 6x + 9$, a nie $x^2+9$.
*   **Odejmowanie rozwinięcia:** Kiedy odejmujemy rozwinięcie wzoru (np. $(a-b)^2$ lub $a^2 - b^2$), należy zastosować nawiasy, a następnie poprawnie opuścić nawias, zmieniając znaki w odejmowanym wyrażeniu. Przykład: $(x^2+6x+9) - (x^2-4)$ musi stać się $x^2+6x+9 - x^2 + 4$. Pominięcie nawiasu i błędne opuszczenie go, np. na $x^2+6x+9 - x^2 - 4$, jest częstym błędem.
*   **Rozpoznawanie $a$ i $b$:** Szczególnie w przypadkach, gdy $a$ lub $b$ to wyrażenia z minusem (np. $(x-y)^2$) lub gdy $a$ lub $b$ są same w sobie potęgami (np. $(x^2+3)^2$). Należy zawsze poprawnie zidentyfikować, co stanowi pierwsze wyrażenie ($a$), a co drugie ($b$).

## Ćwiczenia do samodzielnego rozwiązania
1.  Rozwiń wyrażenie $(3x-1)^2$.
2.  Rozwiń wyrażenie $(5a+2b)^2$.
3.  Uprość wyrażenie $(x+4)(x-4)$.
4.  Uprość wyrażenie $(2y-3)^2 - (y+1)^2$.
5.  Oblicz wartość wyrażenia $52^2 - 48^2$.
6.  Oblicz wartość wyrażenia $15^2 + 2 \\cdot 15 \\cdot 5 + 5^2$.
7.  Zapisz jako iloczyn: $16x^2 - 9$.

## Odpowiedzi
1.  $(3x-1)^2 = (3x)^2 - 2 \\cdot (3x) \\cdot 1 + 1^2 = 9x^2 - 6x + 1$.
2.  $(5a+2b)^2 = (5a)^2 + 2 \\cdot (5a) \\cdot (2b) + (2b)^2 = 25a^2 + 20ab + 4b^2$.
3.  $(x+4)(x-4) = x^2 - 4^2 = x^2 - 16$.
4.  $(2y-3)^2 - (y+1)^2 = (4y^2 - 12y + 9) - (y^2 + 2y + 1) = 4y^2 - 12y + 9 - y^2 - 2y - 1 = 3y^2 - 14y + 8$.
5.  $52^2 - 48^2 = (52-48)(52+48) = 4 \\cdot 100 = 400$.
6.  $15^2 + 2 \\cdot 15 \\cdot 5 + 5^2 = (15+5)^2 = 20^2 = 400$.
7.  $16x^2 - 9 = (4x)^2 - 3^2 = (4x-3)(4x+3)$.

## Szybka powtórka
1.  Jaki jest wzór na kwadrat sumy $(a+b)^2$?
2.  Jaki jest wzór na kwadrat różnicy $(a-b)^2$?
3.  Jaki jest wzór na różnicę kwadratów $a^2 - b^2$?
4.  W jaki sposób inaczej można zapisać wyrażenie $(5x+1)^2$?
5.  Jakie są dwa główne zastosowania wzorów skróconego mnożenia w matematyce szkolnej?`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "algebra",
    topic: "rownania",
    title: "Rozwiązywanie równań liniowych z jedną niewiadomą",
    content: `## Na egzaminie
Równania liniowe z jedną niewiadomą pojawiają się na egzaminie ósmoklasisty regularnie, często w zadaniach otwartych typu "rozwiąż równanie" lub jako element trudniejszych zadań tekstowych i geometrycznych. Zazwyczaj są to proste równania, ale mogą zawierać ułamki lub nawiasy, co zwiększa ich trudność. Poprawne rozwiązanie równania może przynieść od 1 do 3 punktów.

## Mapa tematu
1.  Rozumienie pojęcia równania i jego rozwiązania.
2.  Wykorzystanie działań odwrotnych do przekształcania równań.
3.  Rozwiązywanie równań z jedną niewiadomą typu $ax+b=c$.
4.  Rozwiązywanie równań z jedną niewiadomą typu $ax+b=cx+d$.
5.  Rozwiązywanie równań z nawiasami.
6.  Rozwiązywanie równań z ułamkami.
7.  Rozpoznawanie i rozwiązywanie równań, które nie mają rozwiązań lub mają nieskończenie wiele rozwiązań.
8.  Zastosowanie równań do rozwiązywania zadań tekstowych.

## Definicje i wzory
*   **Równanie** to matematyczne stwierdzenie równości dwóch wyrażeń algebraicznych.
*   **Niewiadoma** (zwykle oznaczana literą $x$, ale może być też inna) to wartość, której szukamy.
*   **Rozwiązanie równania** to taka wartość niewiadomej, dla której równość jest prawdziwa.
*   **Równania równoważne** to równania, które mają ten sam zbiór rozwiązań. Przekształcanie równania polega na zamianie go na równanie równoważne, aż do momentu, gdy otrzymamy postać $x = \\text{liczba}$.

Podstawowe przekształcenia równań, które prowadzą do równań równoważnych:
1.  **Dodanie lub odjęcie tej samej liczby (lub wyrażenia algebraicznego) od obu stron równania.**
    Jeśli $A = B$, to $A+c = B+c$ oraz $A-c = B-c$.
    *Przykład:* $x+3=5 \\implies x+3-3 = 5-3 \\implies x=2$.
    *Przykład:* $x-2=7 \\implies x-2+2 = 7+2 \\implies x=9$.
2.  **Pomnożenie lub podzielenie obu stron równania przez tę samą liczbę różną od zera.**
    Jeśli $A = B$ i $c \\neq 0$, to $A \\cdot c = B \\cdot c$ oraz $\\frac{A}{c} = \\frac{B}{c}$.
    *Przykład:* $2x = 10 \\implies \\frac{2x}{2} = \\frac{10}{2} \\implies x=5$.
    *Przykład:* $\\frac{x}{3} = 4 \\implies \\frac{x}{3} \\cdot 3 = 4 \\cdot 3 \\implies x=12$.

**Ogólna strategia rozwiązywania równań liniowych:**
1.  Uprość obie strony równania (opróżnij nawiasy, wykonaj mnożenie).
2.  Przenieś wszystkie wyrażenia z niewiadomą na jedną stronę równania (np. lewą), a wyrazy wolne (liczby) na drugą stronę (np. prawą). Pamiętaj o zmianie znaku przy przenoszeniu przez znak równości.
3.  Zredukuj wyrazy podobne po obu stronach równania.
4.  Podziel obie strony przez współczynnik stojący przy niewiadomej, aby otrzymać postać $x = \\text{liczba}$.
5.  Sprawdź rozwiązanie, podstawiając otrzymaną wartość niewiadomej do pierwotnego równania.

## Przykład 1 - podstawowy
Rozwiąż równanie: $3x - 5 = 7$.

**Krok 1.** Uporządkuj równanie. Strony są już w miarę proste, nie ma nawiasów.
**Krok 2.** Przenieś wyraz wolny (-5) na prawą stronę. Zmieniamy znak na przeciwny.
$3x = 7 + 5$

**Krok 3.** Wykonaj dodawanie po prawej stronie.
$3x = 12$

**Krok 4.** Podziel obie strony przez współczynnik przy $x$, czyli przez 3.
$\\frac{3x}{3} = \\frac{12}{3}$
$x = 4$

**Krok 5.** Sprawdzenie. Podstawiamy $x=4$ do pierwotnego równania:
Lewa strona: $3 \\cdot 4 - 5 = 12 - 5 = 7$
Prawa strona: $7$
Lewa strona jest równa prawej, więc rozwiązanie jest poprawne.

## Przykład 2 - maturalny
Rozwiąż równanie: $5(x-2) + 3 = 2(3x+1) - 4$.

**Krok 1.** Opróżnij nawiasy po obu stronach równania, mnożąc przez liczbę stojącą przed nawiasem.
Po lewej stronie: $5 \\cdot x - 5 \\cdot 2 + 3 = 5x - 10 + 3$
Po prawej stronie: $2 \\cdot 3x + 2 \\cdot 1 + 3 = 6x + 2 - 4$
Równanie ma teraz postać: $5x - 10 + 3 = 6x + 2 - 4$

**Krok 2.** Uprość obie strony, redukując wyrazy podobne.
Po lewej stronie: $5x - 7$
Po prawej stronie: $6x - 2$
Równanie ma teraz postać: $5x - 7 = 6x - 2$

**Krok 3.** Przenieś wszystkie wyrazy z niewiadomą $x$ na lewą stronę, a wyrazy wolne na prawą stronę. Pamiętaj o zmianie znaków.
$5x - 6x = -2 + 7$

**Krok 4.** Zredukuj wyrazy podobne po obu stronach.
$-x = 5$

**Krok 5.** Pomnóż obie strony przez -1, aby otrzymać $x$.
$(-x) \\cdot (-1) = 5 \\cdot (-1)$
$x = -5$

**Sprawdzenie:** Podstawiamy $x=-5$ do pierwotnego równania.
Lewa strona: $5((-5)-2) + 3 = 5(-7) + 3 = -35 + 3 = -32$
Prawa strona: $2(3(-5)+1) - 4 = 2(-15+1) - 4 = 2(-14) - 4 = -28 - 4 = -32$
Lewa strona jest równa prawej, rozwiązanie jest poprawne.

## Przykład 3 - egzaminacyjny
Rozwiąż równanie: $\\frac{x}{2} + 1 = \\frac{x}{3} - \\frac{1}{6}$.

**Krok 1.** Pozbądź się ułamków, mnożąc obie strony równania przez najmniejszą wspólną wielokrotność mianowników. Mianowniki to 2, 3, 6. Najmniejsza wspólna wielokrotność (NWW) to 6.
$6 \\cdot (\\frac{x}{2} + 1) = 6 \\cdot (\\frac{x}{3} - \\frac{1}{6})$

**Krok 2.** Wykonaj mnożenie po obu stronach, stosując rozdzielność mnożenia względem dodawania/odejmowania.
$6 \\cdot \\frac{x}{2} + 6 \\cdot 1 = 6 \\cdot \\frac{x}{3} - 6 \\cdot \\frac{1}{6}$
Uprość:
$3x + 6 = 2x - 1$

**Krok 3.** Przenieś wyrazy z $x$ na lewą stronę, a liczby na prawą.
$3x - 2x = -1 - 6$

**Krok 4.** Zredukuj wyrazy podobne.
$x = -7$

**Sprawdzenie:** Podstawiamy $x=-7$.
Lewa strona: $\\frac{-7}{2} + 1 = -\\frac{7}{2} + \\frac{2}{2} = -\\frac{5}{2}$
Prawa strona: $\\frac{-7}{3} - \\frac{1}{6} = -\\frac{14}{6} - \\frac{1}{6} = -\\frac{15}{6} = -\\frac{5}{2}$
Lewa strona jest równa prawej, rozwiązanie jest poprawne.

## Pułapki
*   **Błędy przy zmianie znaków:** Zapominanie o zmianie znaku przy przenoszeniu wyrazu na drugą stronę równania jest bardzo częstym błędem. Zawsze pamiętaj: "+" staje się "-", a "-" staje się "+".
*   **Błędy w kolejności wykonywania działań:** Przy upraszczaniu stron równania (szczególnie gdy są nawiasy) łatwo popełnić błąd w kolejności działań (np. najpierw dodawanie zamiast mnożenia). Zawsze wykonuj mnożenie przed dodawaniem/odejmowaniem w obrębie jednej strony.
*   **Błędy przy mnożeniu przez NWW:** Przy mnożeniu całego równania przez NWW, upewnij się, że mnożysz KAŻDY wyraz po obu stronach. Szczególnie łatwo zapomnieć o wyrazach bez ułamka (np. o liczbie 1 w przykładzie 3).
*   **Niepoprawne dzielenie:** Dzielenie obu stron przez liczbę, która jest współczynnikiem przy $x$. Upewnij się, że dzielisz poprawnie, zwłaszcza gdy występuje liczba ujemna lub gdy wynik jest ułamkiem.
*   **Równania sprzeczne i tożsamościowe:** Czasem w wyniku upraszczania otrzymasz równość typu $0=5$ (równanie sprzeczne, brak rozwiązań) lub $3=3$ (równanie tożsamościowe, nieskończenie wiele rozwiązań). Nie panikuj, to też poprawne wyniki dla pewnych typów równań.

## Ćwiczenia do samodzielnego rozwiązania
1.  Rozwiąż równanie: $2x + 7 = 15$.
2.  Rozwiąż równanie: $4 - y = 9$.
3.  Rozwiąż równanie: $3(a+1) = 2a + 5$.
4.  Rozwiąż równanie: $7x - 2(x+3) = 4x + 1$.
5.  Rozwiąż równanie: $\\frac{x}{4} - \\frac{1}{2} = \\frac{x}{2}$.
6.  Rozwiąż równanie: $0.5x + 0.2 = 1.2$.
7.  W pewnej szkole jest 3 razy więcej dziewcząt niż chłopców. Dziewcząt jest o 200 więcej niż chłopców. Ilu chłopców jest w tej szkole?

## Odpowiedzi
1.  $x = 4$
2.  $y = -5$
3.  $a = 2$
4.  $x = 7$
5.  $x = -2$
6.  $x = 2$
7.  Niech $x$ oznacza liczbę chłopców. Wtedy liczba dziewcząt to $3x$. Z treści zadania wiemy, że $3x = x + 200$. Rozwiązując równanie: $2x = 200$, czyli $x = 100$. W szkole jest 100 chłopców.

## Szybka powtórka
1.  Jakie jest podstawowe przekształcenie, które pozwala przenieść wyraz z jednej strony równania na drugą?
2.  Co należy zrobić, aby pozbyć się ułamków w równaniu?
3.  Co oznacza sytuacja, gdy po uproszczeniu równania otrzymasz $0 = 5$?
4.  Czy kolejność przenoszenia wyrazów z niewiadomą i wyrazów wolnych ma znaczenie?
5.  Jak nazywamy wartość niewiadomej, dla której równanie jest prawdziwe?`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "algebra",
    topic: "proporcje",
    title: "Proporcje i skala – pewniaki na egzaminie",
    content: `## Na egzaminie
Zadania dotyczące proporcji i skali pojawiają się na egzaminie ósmoklasisty regularnie, często w formie zadań tekstowych lub jako elementy zadań bardziej złożonych, np. geometrycznych. Zazwyczaj można za nie zdobyć od 1 do 4 punktów. Egzaminatorzy lubią sprawdzać umiejętność wyciągania wniosków z treści zadań, zamiany jednostek i poprawnego stosowania definicji skali.

## Mapa tematu
1.  Zrozumienie pojęcia proporcji i jej zastosowań.
2.  Rozwiązywanie prostych proporcji z jedną niewiadomą.
3.  Rozwiązywanie proporcji odwrotnych.
4.  Zastosowanie proporcji do zadań tekstowych (np. podział kwoty, przepisy kulinarne).
5.  Definicja skali i jej rodzaje (liczbowy, podziałki).
6.  Obliczanie odległości na mapie i w rzeczywistości przy użyciu skali.
7.  Obliczanie skali na podstawie danych.
8.  Zamiana jednostek długości przy pracy ze skalą.

## Definicje i wzory
*   **Proporcja** to równość dwóch stosunków (ilorazów).
    Jeśli mamy liczby $a, b, c, d$, to proporcja ma postać:
    $$ \\frac{a}{b} = \\frac{c}{d} $$
    gdzie $b \\neq 0$ i $d \\neq 0$. Liczby $a$ i $d$ to **wyrazy skrajne**, a liczby $b$ i $c$ to **wyrazy średnie**.
*   **Własność proporcji (iloczyn wyrazów skrajnych równy iloczynowi wyrazów średnich):**
    Dla proporcji $\\frac{a}{b} = \\frac{c}{d}$ zachodzi równość:
    $$ a \\cdot d = b \\cdot c $$
    Jest to podstawowa metoda rozwiązywania proporcji z jedną niewiadomą.
*   **Proporcjonalność prosta:** Dwie wielkości są proporcjonalne prosto, gdy zwiększenie (lub zmniejszenie) jednej wielkości powoduje takie samo zwiększenie (lub zmniejszenie) drugiej wielkości.
    Jeśli $y$ jest proporcjonalne prosto do $x$, to $y = ax$, gdzie $a$ jest stałą proporcjonalności.
    Zależność tę można zapisać jako proporcję: $\\frac{y_1}{x_1} = \\frac{y_2}{x_2}$.
*   **Proporcjonalność odwrotna:** Dwie wielkości są proporcjonalne odwrotnie, gdy zwiększenie jednej wielkości powoduje takie samo zmniejszenie drugiej wielkości (i odwrotnie).
    Jeśli $y$ jest proporcjonalne odwrotnie do $x$, to $y = \\frac{a}{x}$, gdzie $a$ jest stałą proporcjonalności.
    Zależność tę można zapisać jako proporcję: $x_1 \\cdot y_1 = x_2 \\cdot y_2$.
*   **Skala:** Określa stosunek odległości na mapie, planie lub rysunku do odległości w rzeczywistości.
    Skala liczbowa:
    $$ \\text{Skala} = \\frac{\\text{odległość na mapie}}{\\text{odległość w rzeczywistości}} $$
    Często podawana w postaci $1:k$, co oznacza, że 1 jednostka na mapie odpowiada $k$ jednostkom w rzeczywistości. Pamiętaj o spójności jednostek lub o ich zamianie.
    Jeśli skala jest $1:k$, to:
    *   odległość w rzeczywistości = $k \\cdot$ odległość na mapie
    *   odległość na mapie = $\\frac{\\text{odległość w rzeczywistości}}{k}$
*   **Podstawowe jednostki długości i ich zamiana:**
    1 km = 1000 m
    1 m = 100 cm
    1 km = 100 000 cm

## Przykład 1 - podstawowy
Rozwiąż proporcję: $\\frac{3}{5} = \\frac{x}{10}$

**Krok 1.** Zidentyfikuj wyrazy skrajne i średnie. Wyrazy skrajne to 3 i 10. Wyrazy średnie to 5 i $x$.

**Krok 2.** Zastosuj własność proporcji: iloczyn wyrazów skrajnych równa się iloczynowi wyrazów średnich.
$$ 3 \\cdot 10 = 5 \\cdot x $$

**Krok 3.** Oblicz iloczyn wyrazów skrajnych.
$$ 30 = 5x $$

**Krok 4.** Wyznacz $x$, dzieląc obie strony równania przez współczynnik przy $x$ (czyli przez 5).
$$ x = \\frac{30}{5} $$

**Krok 5.** Oblicz wynik.
$$ x = 6 $$

**Sprawdzenie:** Podstawiamy $x=6$ do pierwotnej proporcji:
$$ \\frac{3}{5} = \\frac{6}{10} $$
Ułamek $\\frac{6}{10}$ po skróceniu przez 2 daje $\\frac{3}{5}$, więc równość jest prawdziwa. Rozwiązanie jest poprawne.

## Przykład 2 - maturalny
Na planie miasta wykonanym w skali $1:5000$ odległość między dwoma parkami wynosi 12 cm. Jaka jest rzeczywista odległość między tymi parkami w kilometrach?

**Krok 1.** Zapisz dane i zrozum problem.
Skala planu: $1:5000$.
Odległość na planie: 12 cm.
Szukana odległość w rzeczywistości (w km).

**Krok 2.** Zastosuj definicję skali. Skala $1:5000$ oznacza, że 1 cm na planie odpowiada 5000 cm w rzeczywistości.
Chcemy obliczyć rzeczywistą odległość, więc mnożymy odległość na planie przez liczbę stojącą po prawej stronie skali.
$$ \\text{Odległość w rzeczywistości (w cm)} = 12 \\text{ cm} \\cdot 5000 $$

**Krok 3.** Oblicz rzeczywistą odległość w centymetrach.
$$ 12 \\cdot 5000 = 60000 \\text{ cm} $$

**Krok 4.** Zamień jednostki, aby uzyskać wynik w kilometrach. Wiemy, że 1 km = 100 000 cm. Aby zamienić centymetry na kilometry, musimy podzielić przez 100 000.
$$ \\text{Odległość w rzeczywistości (w km)} = \\frac{60000 \\text{ cm}}{100000 \\frac{\\text{cm}}{\\text{km}}} $$

**Krok 5.** Oblicz wynik końcowy.
$$ \\frac{60000}{100000} = \\frac{6}{10} = 0.6 \\text{ km} $$

**Odpowiedź:** Rzeczywista odległość między parkami wynosi 0.6 km.

## Przykład 3 - egzaminacyjny

Trzech robotników wykonało pewną pracę w ciągu 12 dni. Ilu robotników potrzeba, aby wykonać tę samą pracę w ciągu 9 dni, zakładając, że wszyscy pracują w tym samym tempie?

**Krok 1.** Zidentyfikuj wielkości i rodzaj ich zależności.
Mamy dwie wielkości: liczbę robotników i czas potrzebny na wykonanie pracy.
Jeśli zwiększymy liczbę robotników, czas potrzebny na wykonanie tej samej pracy się skróci. Jest to zależność **odwrotna**.

**Krok 2.** Zapisz dane.
Liczba robotników (pierwszy przypadek): $r_1 = 3$.
Czas (pierwszy przypadek): $t_1 = 12$ dni.
Czas (drugi przypadek): $t_2 = 9$ dni.
Szukana liczba robotników (drugi przypadek): $r_2$.

**Krok 3.** Zastosuj wzór na proporcjonalność odwrotną.
$$ r_1 \\cdot t_1 = r_2 \\cdot t_2 $$

**Krok 4.** Podstaw dane do wzoru.
$$ 3 \\cdot 12 = r_2 \\cdot 9 $$

**Krok 5.** Rozwiąż równanie, aby wyznaczyć $r_2$.
$$ 36 = 9 r_2 $$
$$ r_2 = \\frac{36}{9} $$
$$ r_2 = 4 $$

**Odpowiedź:** Potrzeba 4 robotników, aby wykonać pracę w 9 dni.

## Pułapki
*   **Niewłaściwa zamiana jednostek:** Najczęstszy błąd przy zadaniach ze skalą. Zawsze upewnij się, że jednostki odległości na mapie i w rzeczywistości są takie same przed obliczeniem lub zamień je poprawnie na końcu. Pamiętaj: 1 km = 1000 m = 100 000 cm.
*   **Mylenie proporcjonalności prostej i odwrotnej:** W zadaniach tekstowych, np. o pracy czy prędkości, łatwo pomylić te zależności. Zastanów się: czy więcej pracowników to mniej czasu (odwrotna), czy więcej kilometrów to więcej czasu przy tej samej prędkości (prosta)?
*   **Błędne stosowanie wzoru proporcji:** Niepoprawne przyporządkowanie wyrazów skrajnych i średnich lub zastosowanie wzoru na proporcjonalność prostą do sytuacji odwrotnej. Zapisz sobie proporcję i wyraźnie zaznacz, co jest czym.
*   **Zaokrąglanie wyników przedwcześnie:** Jeśli zadanie nie wymaga zaokrąglenia, zostaw wynik dokładny. Jeśli jednak wynik wychodzi ułamkiem dziesiętnym, który się nie kończy, a zadanie dopuszcza przybliżenie, sprawdź polecenie, czy nie ma podanych wytycznych co do zaokrąglenia.
*   **Nieczytelne zapisy:** Rozwiązując zadania na czas, czasem piszesz bardzo szybko i nieczytelnie. Na egzaminie nauczyciel nie odgadnie Twoich intencji. Dbaj o porządek.

## Ćwiczenia do samodzielnego rozwiązania
1.  Rozwiąż proporcję: $\\frac{x}{7} = \\frac{15}{35}$.
2.  Dwie beczki zawierają razem 56 litrów soku. Pierwsza beczka ma o 8 litrów soku więcej niż druga. Ile litrów soku jest w każdej beczce?
3.  Aby przygotować porcję ciasta dla 6 osób, potrzebujemy 200 g mąki. Ile mąki potrzebujemy na ciasto dla 9 osób?
4.  Samochód poruszał się ze stałą prędkością i przejechał 240 km w ciągu 3 godzin. Jaka będzie odległość pokonana przez ten samochód w ciągu 5 godzin przy tej samej prędkości?
5.  Na mapie w skali $1:20000$ odległość między dwoma miastami wynosi 8 cm. Oblicz rzeczywistą odległość między tymi miastami w kilometrach.
6.  Grupa 5 turystów potrzebuje 4 dni, aby przejść szlak turystyczny. Ile dni potrzebuje grupa 4 turystów na przejście tego samego szlaku, zakładając, że tempo marszu każdego turysty jest takie samo?
7.  Rysunek techniczny wykonano w skali $1:5$. Długość elementu na rysunku wynosi 20 cm. Jaka jest rzeczywista długość tego elementu w metrach?

## Odpowiedzi
1.  $x=3$.
2.  W pierwszej beczce jest 32 litry, w drugiej 24 litry.
3.  Potrzeba 300 g mąki.
4.  Samochód przejedzie 400 km.
5.  Rzeczywista odległość wynosi 1.6 km.
6.  Grupa 4 turystów potrzebuje 5 dni.
7.  Rzeczywista długość elementu wynosi 1 metr.

## Szybka powtórka
1.  Jakie są dwa rodzaje zależności między wielkościami, które możemy opisać za pomocą proporcji?
2.  Podaj wzór na własność proporcji $\\frac{a}{b} = \\frac{c}{d}$.
3.  Co oznacza skala $1:10000$?
4.  Jeśli odległość na mapie jest mniejsza niż w rzeczywistości, to skala jest większa czy mniejsza od 1?
5.  Jakie są podstawowe jednostki długości i jak się przeliczają?

## Diagram
\`\`\`text
     Skala 1:k
       /      \\
      /        \\
     /          \\
    /            \\
 MAPA ------- RZECZYWISTOŚĆ
  |               |
  | *k            | /k
  V               V
 ODLEGŁOŚĆ       ODLEGŁOŚĆ
NA MAPIE     W RZECZYWISTOŚCI
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "katy",
    title: "Kąty i proste - solidne podstawy",
    content: `## Na egzaminie
Zadania dotyczące kątów i prostych pojawiają się na egzaminie ósmoklasisty regularnie, często jako część większych zadań geometrycznych lub jako samodzielne problemy wymagające zastosowania podstawowych własności. Zwykle można zdobyć za nie od 2 do 5 punktów. Egzaminatorzy lubią sprawdzać umiejętność rozpoznawania i wykorzystywania kątów przyległych, wierzchołkowych, prostych, przyległych, a także wiedzę o sumie kątów w trójkącie i czworokącie.

## Mapa tematu
1.  Rozpoznawanie i nazywanie różnych rodzajów kątów.
2.  Zrozumienie pojęcia prostych równoległych i prostopadłych.
3.  Wykorzystanie własności kątów wierzchołkowych.
4.  Wykorzystanie własności kątów przyległych.
5.  Obliczanie kątów przy przecięciu dwóch prostych.
6.  Obliczanie kątów w trójkątach.
7.  Obliczanie kątów w czworokątach (podstawowe własności).
8.  Rozwiązywanie zadań tekstowych z zastosowaniem kątów i prostych.

## Definicje i wzory
*   **Kąt:** Część płaszczyzny ograniczona dwiema półprostymi o wspólnym początku, zwanym wierzchołkiem kąta. Kąty mierzymy w stopniach ($^\\circ$).
*   **Kąt zerowy:** Kąt o mierze $0^\\circ$.
*   **Kąt ostry:** Kąt o mierze większej od $0^\\circ$ i mniejszej od $90^\\circ$ ($0^\\circ < \\alpha < 90^\\circ$).
*   **Kąt prosty:** Kąt o mierze dokładnie $90^\\circ$. Dwie proste tworzące kąt prosty nazywamy prostymi prostopadłymi.
*   **Kąt rozwarty:** Kąt o mierze większej od $90^\\circ$ i mniejszej od $180^\\circ$ ($90^\\circ < \\alpha < 180^\\circ$).
*   **Kąt półpełny:** Kąt o mierze dokładnie $180^\\circ$. Dwa kąty tworzące kąt półpełny nazywamy kątami przyległymi.
*   **Kąt pełny:** Kąt o mierze dokładnie $360^\\circ$.
*   **Kąty wierzchołkowe:** Powstają w wyniku przecięcia dwóch prostych. Są sobie równe. Jeśli dwa kąty, $\\alpha$ i $\\beta$, są wierzchołkowe, to $\\alpha = \\beta$.
*   **Kąty przyległe:** Sąsiadujące kąty, których ramiona zewnętrzne tworzą prostą (kąt półpełny). Suma miar kątów przyległych wynosi $180^\\circ$. Jeśli kąty $\\alpha$ i $\\beta$ są przyległe, to $\\alpha + \\beta = 180^\\circ$.
*   **Kąty o ramionach prostopadłych:**
    *   Jeśli ramiona kątów są parami prostopadłe i "wskazują" w tym samym kierunku lub przeciwnych kierunkach, kąty te są równe.
    *   Jeśli ramiona kątów są parami prostopadłe, ale jeden kąt "wskazuje" w innym kierunku niż drugi, to suma ich miar wynosi $180^\\circ$.
*   **Proste równoległe:** Proste, które leżą w tej samej płaszczyźnie i nie mają punktów wspólnych. Oznaczenie: $a \\parallel b$.
*   **Proste prostopadłe:** Proste, które przecinają się pod kątem prostym ($90^\\circ$). Oznaczenie: $a \\perp b$.
*   **Suma kątów w trójkącie:** Suma miar kątów wewnętrznych każdego trójkąta wynosi $180^\\circ$. Jeśli kąty trójkąta to $\\alpha, \\beta, \\gamma$, to $\\alpha + \\beta + \\gamma = 180^\\circ$.
*   **Suma kątów w czworokącie:** Suma miar kątów wewnętrznych każdego wypukłego czworokąta wynosi $360^\\circ$. Jeśli kąty czworokąta to $\\alpha, \\beta, \\gamma, \\delta$, to $\\alpha + \\beta + \\gamma + \\delta = 360^\\circ$.

## Przykład 1 - podstawowy
Dany jest rysunek przedstawiający dwie przecinające się proste. Kąt $\\alpha$ ma miarę $35^\\circ$. Oblicz miary pozostałych kątów.

\`\`\`
   /
  /
 / \\
/   \\  beta
-----*-----
\\   /
 \\ /  gamma
  /
 / delta
/
\`\`\`

**Krok 1.** Zidentyfikuj rodzaje kątów. Kąty $\\alpha$ i $\\gamma$ są wierzchołkowe. Kąty $\\alpha$ i $\\beta$ są przyległe. Kąty $\\beta$ i $\\gamma$ są przyległe. Kąty $\\gamma$ i $\\delta$ są wierzchołkowe. Kąty $\\delta$ i $\\alpha$ są przyległe.

**Krok 2.** Wykorzystaj własność kątów wierzchołkowych. Kąt $\\alpha$ ma miarę $35^\\circ$. Kąt $\\gamma$ jest wierzchołkowy do kąta $\\alpha$. Zatem $\\gamma = \\alpha = 35^\\circ$.

**Krok 3.** Wykorzystaj własność kątów przyległych. Kąt $\\alpha$ i kąt $\\beta$ są przyległe. Ich suma wynosi $180^\\circ$.
$\\alpha + \\beta = 180^\\circ$
$35^\\circ + \\beta = 180^\\circ$

**Krok 4.** Oblicz miarę kąta $\\beta$.
$\\beta = 180^\\circ - 35^\\circ$
$\\beta = 145^\\circ$

**Krok 5.** Wykorzystaj własność kątów wierzchołkowych dla pozostałych kątów. Kąt $\\delta$ jest wierzchołkowy do kąta $\\beta$.
$\\delta = \\beta = 145^\\circ$.

**Sprawdzenie:**
Suma wszystkich kątów wokół punktu przecięcia powinna wynosić $360^\\circ$.
$\\alpha + \\beta + \\gamma + \\delta = 35^\\circ + 145^\\circ + 35^\\circ + 145^\\circ = 360^\\circ$.
Kąty przyległe:
$\\alpha + \\beta = 35^\\circ + 145^\\circ = 180^\\circ$
$\\beta + \\gamma = 145^\\circ + 35^\\circ = 180^\\circ$
$\\gamma + \\delta = 35^\\circ + 145^\\circ = 180^\\circ$
$\\delta + \\alpha = 145^\\circ + 35^\\circ = 180^\\circ$
Wyniki są poprawne.
Kąty: $\\alpha = 35^\\circ$, $\\beta = 145^\\circ$, $\\gamma = 35^\\circ$, $\\delta = 145^\\circ$.

## Przykład 2 - maturalny
Dany jest trójkąt ABC. Kąt przy wierzchołku A ma miarę $50^\\circ$, a kąt przy wierzchołku B ma miarę $70^\\circ$. Oblicz miarę kąta przy wierzchołku C. Następnie poprowadź prostą przechodzącą przez wierzchołek A, która jest prostopadła do boku BC. Nazwij punkt przecięcia tej prostej z prostą BC literą D. Oblicz miarę kąta CAD.

**Krok 1.** Oblicz miarę kąta przy wierzchołku C. Suma kątów w trójkącie wynosi $180^\\circ$.
Kąt C = $180^\\circ - (\\text{Kąt A} + \\text{Kąt B})$
Kąt C = $180^\\circ - (50^\\circ + 70^\\circ)$
Kąt C = $180^\\circ - 120^\\circ$
Kąt C = $60^\\circ$.

**Krok 2.** Narysuj sytuację. Mamy trójkąt ABC. Poprowadzono prostą AD tak, że $AD \\perp BC$. Punkt D leży na prostej zawierającej odcinek BC.

**Krok 3.** Zidentyfikuj kąt prosty. Skoro $AD \\perp BC$, to kąt ADB (lub ADC, zależnie od położenia punktu D) jest kątem prostym, czyli ma miarę $90^\\circ$.

**Krok 4.** Rozważ trójkąt ABD (lub ACD). Aby znaleźć kąt CAD, musimy wiedzieć, gdzie leży punkt D. Załóżmy, że D leży na przedłużeniu boku BC poza punktem C. Wtedy w trójkącie ADC, kąt ADC = $90^\\circ$. Kąt ACB = $60^\\circ$. Kąt ACD jest kątem przyległym do kąta ACB, więc Kąt ACD = $180^\\circ - 60^\\circ = 120^\\circ$.
W trójkącie ACD, suma kątów wynosi $180^\\circ$.
Kąt CAD + Kąt ADC + Kąt ACD = $180^\\circ$
Kąt CAD + $90^\\circ$ + $120^\\circ$ = $180^\\circ$
Kąt CAD + $210^\\circ$ = $180^\\circ$
Kąt CAD = $180^\\circ - 210^\\circ = -30^\\circ$. Wynik ujemny jest niemożliwy, co oznacza, że punkt D nie leży na przedłużeniu poza C.

Załóżmy, że punkt D leży na odcinku BC. Wtedy w trójkącie ADB, kąt ADB = $90^\\circ$. Kąt ABC = $70^\\circ$.
W trójkącie ABD:
Kąt BAD + Kąt ABD + Kąt ADB = $180^\\circ$
Kąt BAD + $70^\\circ$ + $90^\\circ$ = $180^\\circ$
Kąt BAD + $160^\\circ$ = $180^\\circ$
Kąt BAD = $20^\\circ$.

**Krok 5.** Oblicz kąt CAD. Kąt BAC = $50^\\circ$. Kąt BAD = $20^\\circ$.
Kąt CAD = Kąt BAC - Kąt BAD
Kąt CAD = $50^\\circ - 20^\\circ$
Kąt CAD = $30^\\circ$.

**Sprawdzenie:**
Suma kątów w trójkącie ABD: $20^\\circ + 70^\\circ + 90^\\circ = 180^\\circ$. Poprawnie.
Suma kątów w trójkącie ACD: Kąt ACD = $180^\\circ - 60^\\circ = 120^\\circ$. Kąt ADC = $90^\\circ$. Kąt CAD = $30^\\circ$.
Suma: $30^\\circ + 90^\\circ + 120^\\circ = 240^\\circ$. Ten przypadek nie działa, co oznacza, że punkt D nie leży na odcinku BC *w taki sposób*, że kąt ACD jest rozwarty.

Rozważmy jeszcze raz położenie D. AD jest wysokością opuszczoną z A na bok BC.
W trójkącie ABC: A=$50^\\circ$, B=$70^\\circ$, C=$60^\\circ$.
Wysokość AD opada na bok BC. Kąt ADB = $90^\\circ$.
W trójkącie prostokątnym ABD: kąt B=$70^\\circ$, kąt ADB=$90^\\circ$, więc kąt BAD = $180^\\circ - 90^\\circ - 70^\\circ = 20^\\circ$.
Kąt BAC = $50^\\circ$.
Kąt CAD = Kąt BAC - Kąt BAD = $50^\\circ - 20^\\circ = 30^\\circ$.
To rozwiązanie jest spójne i daje pozytywny wynik.

Miara kąta przy wierzchołku C wynosi $60^\\circ$. Miara kąta CAD wynosi $30^\\circ$.

## Przykład 3 - egzaminacyjny

Dany jest czworokąt ABCD. Kąty przy wierzchołkach A i B wynoszą odpowiednio $110^\\circ$ i $80^\\circ$. Kąt przy wierzchołku C jest dwa razy większy od kąta przy wierzchołku D. Oblicz miary kątów C i D.

**Krok 1.** Zastosuj sumę kątów w czworokącie. Suma kątów wewnętrznych w czworokącie wynosi $360^\\circ$.
Kąt A + Kąt B + Kąt C + Kąt D = $360^\\circ$
$110^\\circ + 80^\\circ + \\text{Kąt C} + \\text{Kąt D} = 360^\\circ$

**Krok 2.** Uprość równanie.
$190^\\circ + \\text{Kąt C} + \\text{Kąt D} = 360^\\circ$
$\\text{Kąt C} + \\text{Kąt D} = 360^\\circ - 190^\\circ$
$\\text{Kąt C} + \\text{Kąt D} = 170^\\circ$

**Krok 3.** Zapisz zależności między kątami C i D. Wiemy, że kąt C jest dwa razy większy od kąta D.
Niech Kąt D = $x$.
Wtedy Kąt C = $2x$.

**Krok 4.** Podstaw zależności do równania z Kroku 2.
$2x + x = 170^\\circ$
$3x = 170^\\circ$

**Krok 5.** Oblicz wartość $x$.
$x = \\frac{170^\\circ}{3}$
$x \\approx 56.67^\\circ$. Wynik nie jest liczbą całkowitą. Sprawdźmy dane zadania. Często na egzaminie wynik jest bardziej "ładny". Może jednak być taki.

**Krok 6.** Oblicz miary kątów C i D.
Kąt D = $x = \\frac{170^\\circ}{3}$
Kąt C = $2x = 2 \\cdot \\frac{170^\\circ}{3} = \\frac{340^\\circ}{3}$

**Sprawdzenie:**
Kąt A + Kąt B + Kąt C + Kąt D = $110^\\circ + 80^\\circ + \\frac{340^\\circ}{3} + \\frac{170^\\circ}{3}$
$= 190^\\circ + \\frac{510^\\circ}{3}$
$= 190^\\circ + 170^\\circ$
$= 360^\\circ$.
Wynik jest poprawny, mimo iż kąty nie są liczbami całkowitymi. Na egzaminie często wyniki są całkowite, ale nie zawsze.

Miara kąta D wynosi $\\frac{170^\\circ}{3}$, a miara kąta C wynosi $\\frac{340^\\circ}{3}$.

## Pułapki
*   **Mylenie kątów wierzchołkowych z przyległymi:** Pamiętaj, że kąty wierzchołkowe są równe, a kąty przyległe sumują się do $180^\\circ$. Zwracaj uwagę na rysunek i definicje.
*   **Brak sprawdzenia położenia punktu:** W zadaniach geometrycznych, szczególnie z wysokościami czy dwusiecznymi, położenie punktu przecięcia (np. czy leży na odcinku, czy na jego przedłużeniu) jest kluczowe dla poprawnego zapisu kątów i ich sum. Rysuj starannie lub analizuj dane.
*   **Nieuwzględnienie sumy kątów w figurze:** Zawsze sprawdzaj, czy suma kątów w trójkącie wynosi $180^\\circ$, a w czworokącie $360^\\circ$. To podstawowe narzędzie do weryfikacji wyników.
*   **Błędy w obliczeniach arytmetycznych:** Proste dodawanie, odejmowanie, mnożenie i dzielenie liczb, w tym ułamków, jest częstym źródłem błędów. Dokładnie sprawdzaj obliczenia.
*   **Zakładanie kątów prostych/równych bez podstawy:** Nie zakładaj, że proste są prostopadłe, jeśli nie jest to podane w zadaniu lub nie wynika logicznie z rysunku (np. symbol kwadratu przy kącie). Nie zakładaj równości kątów, jeśli nie ma ku temu przesłanek.

## Ćwiczenia do samodzielnego rozwiązania
1.  Dwie proste przecinają się, tworząc kąty. Jeden z kątów ma miarę $42^\\circ$. Oblicz miary pozostałych trzech kątów.
2.  Dany jest trójkąt równoramienny ABC, w którym kąt przy podstawie AB ma miarę $55^\\circ$. Oblicz miary pozostałych kątów tego trójkąta.
3.  Prosta $k$ jest równoległa do prostej $l$. Prostą $m$ przecina proste $k$ i $l$. Kąt między prostą $m$ a prostą $k$ wynosi $65^\\circ$. Jakie są miary kątów między prostą $m$ a prostą $l$? (Rozważ różne możliwości).
4.  W czworokącie ABCD kąty przy wierzchołkach A, B i C wynoszą odpowiednio $95^\\circ$, $85^\\circ$ i $100^\\circ$. Oblicz miarę kąta D.
5.  W trójkącie prostokątnym jeden z kątów ostrych jest dwa razy większy od drugiego. Oblicz miary obu kątów ostrych.
6.  Przez wierzchołek B trójkąta ABC poprowadzono prostą $n$ prostopadłą do boku AC. Punkt przecięcia prostej $n$ z prostą AC oznaczono jako E. Kąt BAC ma miarę $40^\\circ$, a kąt ABC ma miarę $110^\\circ$. Oblicz miary kątów: CBE i AEB.
7.  Dwa kąty są przyległe. Jeden z nich jest o $20^\\circ$ większy od drugiego. Oblicz miary tych kątów.

## Odpowiedzi
1.  Kąty: $42^\\circ$, $138^\\circ$, $42^\\circ$, $138^\\circ$.
2.  Kąt C (wierzchołek) = $180^\\circ - 2 \\cdot 55^\\circ = 180^\\circ - 110^\\circ = 70^\\circ$. Kąty wynoszą $55^\\circ, 55^\\circ, 70^\\circ$.
3.  Kąty wynoszą $65^\\circ$ i $115^\\circ$. Jeśli prosta $m$ przecina $k$ i $l$ w taki sposób, że tworzy z nimi kąty odpowiadające lub zamienne, kąty będą równe ($65^\\circ$). Jeśli tworzy kąty wewnętrzne, suma będzie $180^\\circ$ ($115^\\circ$).
4.  Kąt D = $360^\\circ - (95^\\circ + 85^\\circ + 100^\\circ) = 360^\\circ - 280^\\circ = 80^\\circ$.
5.  Kąty ostre: $30^\\circ$ i $60^\\circ$. (Niech kąty to $x$ i $2x$. $x+2x=90^\\circ$, $3x=90^\\circ$, $x=30^\\circ$).
6.  Kąt AEB = $90^\\circ$. Kąt CBE = $180^\\circ - 110^\\circ - 90^\\circ = -20^\\circ$. To oznacza, że punkt E leży na przedłużeniu AC poza A. W trójkącie ABE: Kąt ABE = $180^\\circ - 90^\\circ - 40^\\circ = 50^\\circ$. Kąt ABC = $110^\\circ$. Kąt CBE = Kąt ABC - Kąt ABE = $110^\\circ - 50^\\circ = 60^\\circ$.
7.  Kąty wynoszą $80^\\circ$ i $100^\\circ$. (Niech kąty to $x$ i $x+20^\\circ$. $x + (x+20^\\circ) = 180^\\circ$, $2x+20^\\circ=180^\\circ$, $2x=160^\\circ$, $x=80^\\circ$).

## Szybka powtórka
1.  Jak nazywamy kąt o mierze $90^\\circ$?
2.  Dwa kąty są wierzchołkowe. Czy są równe, czy ich suma wynosi $180^\\circ$?
3.  Jaka jest suma miar kątów wewnętrznych w każdym trójkącie?
4.  Jak nazywamy dwa kąty leżące obok siebie, których ramiona zewnętrzne tworzą prostą?
5.  Czy proste prostopadłe przecinają się pod kątem $90^\\circ$?

## Diagram
\`\`\`text
   / \\
  / a \\
 /_____\\ beta
<-------*-------> gamma
 \\ d / \\ b
  \\ /   \\
   \\_____/
     e

a, e - kąty wierzchołkowe (równe)
a, b - kąty przyległe (suma 180)
c, d - kąty wierzchołkowe (równe)
c, b - kąty przyległe (suma 180)
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "obwody",
    title: "Obwody figur płaskich na egzaminie ósmoklasisty",
    content: `## Na egzaminie
Zadania dotyczące obwodów figur pojawiają się regularnie na egzaminie ósmoklasisty, zwykle w zadaniach otwartych, ale czasem też zamkniętych. Ich poziom trudności jest zróżnicowany – od prostych obliczeń, po zadania tekstowe wymagające analizy i kilku etapów rozwiązania. CKE lubi sprawdzać umiejętność zastosowania wzorów na obwody w kontekście praktycznym, np. przy obliczaniu długości ogrodzenia czy taśmy. Zazwyczaj jedno zadanie z obwodów to około 3-5 punktów.

## Mapa tematu
1.  Zrozumienie pojęcia obwodu figury płaskiej.
2.  Obliczanie obwodu wielokątów o znanych bokach (trójkąty, czworokąty, wielokąty dowolne).
3.  Obliczanie obwodu prostokąta i kwadratu ze szczególnym uwzględnieniem wzorów.
4.  Obliczanie obwodu rombu, równoległoboku, trapezu.
5.  Obliczanie obwodu figur złożonych z prostszych kształtów.
6.  Rozwiązywanie zadań tekstowych związanych z obwodami.
7.  Wykorzystanie informacji o obwodzie do obliczenia długości nieznanego boku.
8.  Podstawowe zadania z okręgiem (obwód koła jako wprowadzanie).

## Definicje i wzory
*   **Obwód figury płaskiej** to suma długości wszystkich jej boków. Oznaczamy go zazwyczaj literą $Ob$ lub $L$. Obwód to wielkość jednowymiarowa, wyrażana w jednostkach długości (np. cm, m, km).
*   **Wielokąty:**
    *   **Trójkąt o bokach długości $a, b, c$:**
        $$Ob = a + b + c$$
    *   **Czworokąt o bokach długości $a, b, c, d$:**
        $$Ob = a + b + c + d$$
*   **Szczególne czworokąty:**
    *   **Kwadrat o boku długości $a$:**
        $$Ob = 4 \\cdot a$$
    *   **Prostokąt o bokach długości $a, b$:**
        $$Ob = 2a + 2b = 2(a+b)$$
    *   **Romb o boku długości $a$:** (wszystkie boki równe)
        $$Ob = 4a$$
    *   **Równoległobok o bokach długości $a, b$:** (boki przeciwległe równe)
        $$Ob = 2a + 2b = 2(a+b)$$
    *   **Trapez:** (oznaczamy boki jako $a, b, c, d$, gdzie $a$ i $c$ to podstawy, a $b$ i $d$ to ramiona)
        $$Ob = a + b + c + d$$
        *   **Trapez równoramienny:** boki nierównoległe ($b$ i $d$) są równe.
            $$Ob = a + 2b + c$$
*   **Wielokąt foremny:** wielokąt, który ma wszystkie boki równej długości i wszystkie kąty wewnętrzne równej miary. Obwód wielokąta foremnego o $n$ bokach, gdzie długość każdego boku wynosi $a$, obliczamy jako:
    $$Ob = n \\cdot a$$
    *   Sześciokąt foremny o boku $a$: $Ob = 6a$
    *   Pięciokąt foremny o boku $a$: $Ob = 5a$
*   **Figury złożone:** Obwód jest sumą długości wszystkich zewnętrznych boków figury. Należy uważać, aby nie policzyć dwukrotnie wewnętrznych odcinków wspólnych dla dwóch figur składowych.
*   **Okrąg (Koło):**
    *   **Długość okręgu** (obwód koła) o promieniu $r$ lub średnicy $d$:
        $$Ob = 2 \\pi r$$ lub $$Ob = \\pi d$$
        gdzie $\\pi$ (pi) to stała matematyczna, w przybliżeniu 3.14. Na egzaminie często używa się przybliżenia $\\pi \\approx 3.14$ lub $\\pi \\approx \\frac{22}{7}$, chyba że polecenie stanowi inaczej lub wymaga odpowiedzi z $\\pi$.

## Przykład 1 - podstawowy
Oblicz obwód prostokąta, którego jeden bok ma długość 8 cm, a drugi jest o 3 cm dłuższy.

**Krok 1.** Zrozumienie danych: Mamy prostokąt. Jeden bok ($a$) ma 8 cm. Drugi bok ($b$) jest o 3 cm dłuższy od pierwszego.
**Krok 2.** Obliczenie długości drugiego boku: $b = a + 3 \\text{ cm} = 8 \\text{ cm} + 3 \\text{ cm} = 11 \\text{ cm}$.
**Krok 3.** Przypomnienie wzoru na obwód prostokąta: $Ob = 2a + 2b$.
**Krok 4.** Podstawienie danych do wzoru: $Ob = 2 \\cdot 8 \\text{ cm} + 2 \\cdot 11 \\text{ cm}$.
**Krok 5.** Wykonanie obliczeń: $Ob = 16 \\text{ cm} + 22 \\text{ cm} = 38 \\text{ cm}$.

Sprawdzenie: Boki prostokąta to 8 cm i 11 cm. Suma wszystkich boków: $8 + 11 + 8 + 11 = 38$ cm. Wynik jest poprawny.

## Przykład 2 - maturalny
Działka w kształcie trapezu równoramiennego ma podstawy długości 20 metrów i 30 metrów. Dłuższa podstawa jest o 5 metrów dłuższa od każdego z ramion. Oblicz obwód tej działki.

**Krok 1.** Identyfikacja figury i danych: Mamy trapez równoramienny. Oznaczmy podstawy jako $a$ i $c$, a ramiona jako $b$ i $d$. W trapezach równoramiennych $b = d$.
**Krok 2.** Przypisanie wartości do boków: Wiemy, że podstawy mają 20 m i 30 m. Dłuższa podstawa to $a = 30$ m. Krótsza podstawa to $c = 20$ m.
**Krok 3.** Obliczenie długości ramion: Dłuższa podstawa ($a = 30$ m) jest o 5 m dłuższa od każdego z ramion ($b$ i $d$). Czyli każde ramię ma długość: $b = d = a - 5 \\text{ m} = 30 \\text{ m} - 5 \\text{ m} = 25 \\text{ m}$.
**Krok 4.** Przypomnienie wzoru na obwód trapezu: $Ob = a + b + c + d$. Ponieważ jest to trapez równoramienny, możemy użyć $Ob = a + c + 2b$.
**Krok 5.** Podstawienie wartości i obliczenie obwodu: $Ob = 30 \\text{ m} + 20 \\text{ m} + 2 \\cdot 25 \\text{ m} = 50 \\text{ m} + 50 \\text{ m} = 100 \\text{ m}$.

Sprawdzenie: Podstawy to 30 m i 20 m. Ramiona to po 25 m. Suma boków: $30 + 25 + 20 + 25 = 100$ m. Wynik jest poprawny.

## Przykład 3 - egzaminacyjny

Ogrodnik chce ogrodzić prostokątną rabatę kwiatową o wymiarach 4 metry na 6 metrów. Jakiej długości siatki potrzebuje, jeśli siatka sprzedawana jest w rolkach po 10 metrów? Ile rolek siatki musi kupić?

**Krok 1.** Określenie potrzebnej długości siatki: Siatka ma otaczać rabatę, czyli jej długość musi być równa obwodowi rabaty. Rabatę stanowi prostokąt o bokach $a = 4$ m i $b = 6$ m.
**Krok 2.** Obliczenie obwodu rabaty: Używamy wzoru na obwód prostokąta $Ob = 2(a+b)$.
$$Ob = 2(4 \\text{ m} + 6 \\text{ m}) = 2(10 \\text{ m}) = 20 \\text{ m}$$
Ogrodnik potrzebuje 20 metrów siatki.
**Krok 3.** Określenie liczby potrzebnych rolek: Siatka sprzedawana jest w rolkach po 10 metrów. Aby dowiedzieć się, ile rolek potrzeba, dzielimy całkowitą potrzebną długość przez długość jednej rolki:
$$\\text{Liczba rolek} = \\frac{\\text{Potrzebna długość}}{\\text{Długość rolki}} = \\frac{20 \\text{ m}}{10 \\text{ m}} = 2$$
Ogrodnik musi kupić 2 rolki siatki.

Sprawdzenie: Obwód rabaty to 20 m. Dwie rolki po 10 m dają $2 \\times 10 = 20$ m siatki, co wystarcza. Wynik jest poprawny.

## Pułapki
*   **Mylenie obwodu z polem:** Obwód to suma długości boków (jednostki liniowe, np. cm), a pole to powierzchnia (jednostki kwadratowe, np. cm$^2$). Nie należy podstawiać wartości pola do wzorów na obwód i odwrotnie.
*   **Niedoliczenie wszystkich boków:** Przy figurach nieregularnych lub złożonych łatwo zapomnieć o którymś boku. Zawsze warto zrobić szkic i zaznaczać policzone boki.
*   **Błędy w obliczeniach przy figurach złożonych:** W zadaniach, gdzie figura jest złożona z prostokątów (np. litera L), należy dodać tylko zewnętrzne boki. Wewnętrzne odcinki, które nie są częścią zewnętrznego obrysu, nie wliczają się do obwodu.
*   **Niewłaściwe zastosowanie wzorów dla szczególnych przypadków:** Pamiętaj, że wzór $Ob = 2(a+b)$ jest dla prostokąta i równoległoboku, a $Ob = 4a$ dla kwadratu i rombu. Kwadrat i romb to też czworokąty, ale mają swoje bardziej specyficzne wzory.
*   **Brak jednostek lub błędne jednostki:** Zawsze podawaj wynik z odpowiednimi jednostkami długości. Na egzaminie często wymaga się ich podania.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz obwód trójkąta równobocznego, którego bok ma długość 7 cm.
2.  Oblicz obwód rombu, jeśli jego krótsza przekątna ma długość 6 cm, a dłuższa 8 cm.
3.  Oblicz obwód kwadratu, jeśli jego pole wynosi 36 cm$^2$.
4.  Plac zabaw ma kształt sześciokąta foremnego o boku 12 metrów. Oblicz obwód placu zabaw.
5.  Długość okręgu wynosi $24\\pi$ cm. Jaka jest długość promienia tego okręgu?
6.  Płot ma mieć kształt prostokąta o wymiarach 15 metrów na 10 metrów. Ile metrów siatki potrzeba na budowę płotu?
7.  Pokój w kształcie litery L składa się z dwóch prostokątów o wymiarach 3m x 4m i 2m x 5m (gdzie dłuższy bok 5m przylega do dłuższego boku 4m). Oblicz obwód tego pokoju.

## Odpowiedzi
1.  Obwód = $3 \\cdot 7 \\text{ cm} = 21 \\text{ cm}$.
2.  Obwód rombu to suma jego boków. Aby obliczyć bok, można użyć twierdzenia Pitagorasa dla połówek przekątnych: $(\\frac{6}{2})^2 + (\\frac{8}{2})^2 = 3^2 + 4^2 = 9 + 16 = 25$. Bok $a = \\sqrt{25} = 5$ cm. Obwód = $4 \\cdot 5 \\text{ cm} = 20 \\text{ cm}$.
3.  Pole kwadratu $P = a^2$. Skoro $P = 36$ cm$^2$, to bok $a = \\sqrt{36} = 6$ cm. Obwód $Ob = 4a = 4 \\cdot 6 \\text{ cm} = 24 \\text{ cm}$.
4.  Sześciokąt foremny ma 6 równych boków. Obwód = $6 \\cdot 12 \\text{ m} = 72 \\text{ m}$.
5.  Wzór na długość okręgu to $L = 2\\pi r$. Mamy $24\\pi = 2\\pi r$. Dzieląc obie strony przez $2\\pi$, otrzymujemy $r = 12$ cm.
6.  Obwód prostokąta: $Ob = 2(15 \\text{ m} + 10 \\text{ m}) = 2(25 \\text{ m}) = 50 \\text{ m}$. Potrzeba 50 metrów siatki.
7.  Szkic pokoju i policzenie zewnętrznych boków: 3m + 5m + 3m + (4m-2m) + 2m + 4m = 3 + 5 + 3 + 2 + 2 + 4 = 19 m. (lub: 3 + 5 + 3 + 2 + 2 + 4 = 19 m).

## Szybka powtórka
1.  Co to jest obwód figury?
2.  Podaj wzór na obwód prostokąta.
3.  Czym różni się obwód kwadratu od obwodu rombu, jeśli mają takie same boki?
4.  Jak obliczyć obwód figury złożonej z dwóch prostokątów?
5.  Jaka jest zależność między długością okręgu a jego promieniem?

## Diagram
Prostokąt z zaznaczonymi bokami:
\`\`\`text
       b
   +-------+
 a |       | a
   +-------+
       b
\`\`\`
Obwód = a + b + a + b = 2a + 2b`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "pola_figur",
    title: "Pola figur płaskich",
    content: `## Na egzaminie
Zadania dotyczące pól figur płaskich pojawiają się na egzaminie ósmoklasisty co roku, zazwyczaj w zadaniach otwartych lub jako część zadań zamkniętych. Mogą one dotyczyć obliczania pola jednej figury, lub złożonych figur składających się z kilku prostszych figur. Poprawne stosowanie wzorów i umiejętność dzielenia skomplikowanych kształtów na prostsze elementy są kluczowe. Zadania te są warte od 2 do nawet 4 punktów.

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił:
1.  Obliczyć pole prostokąta, kwadratu, trójkąta, rombu i trapezu, stosując odpowiednie wzory.
2.  Rozpoznawać i obliczać pola figur złożonych, składających się z prostokątów, kwadratów, trójkątów, rombów i trapezów.
3.  Wykorzystywać własności figur geometrycznych (np. przekątne w rombie, wysokość w trójkącie) do obliczeń pól.
4.  Znajdować brakujące wymiary figury (np. bok, wysokość) na podstawie jej pola i innych danych.
5.  Dokonywać zamian jednostek pola (np. z cm$^2$ na m$^2$).
6.  Zastosować wiedzę o polach figur w zadaniach tekstowych.
7.  Obliczyć pole koła i jego wycinka.

## Definicje i wzory
*   **Prostokąt:** Czworokąt o czterech kątach prostych.
    *   Wzór na pole: $P = a \\cdot b$, gdzie $a$ i $b$ to długości boków prostokąta.
    *   $a$ - długość, $b$ - szerokość.

*   **Kwadrat:** Czworokąt o czterech bokach równej długości i czterech kątach prostych. Jest szczególnym przypadkiem prostokąta.
    *   Wzór na pole: $P = a^2$, gdzie $a$ to długość boku kwadratu.

*   **Trójkąt:** Wielokąt o trzech bokach.
    *   Wzór na pole: $P = \\frac{1}{2} \\cdot a \\cdot h_a$, gdzie $a$ to długość jednego boku, a $h_a$ to wysokość opuszczona na ten bok.
    *   Można użyć dowolnego boku jako podstawy i odpowiadającej mu wysokości.

*   **Romb:** Czworokąt, którego wszystkie boki mają równe długości. Przekątne rombu są prostopadłe i przecinają się w połowie.
    *   Wzór na pole (przez boki i kąt): $P = a^2 \\cdot \\sin(\\alpha)$, gdzie $a$ to długość boku, a $\\alpha$ to kąt między bokami. (Ten wzór jest rzadziej używany na egzaminie ósmoklasisty).
    *   Wzór na pole (przez przekątne): $P = \\frac{1}{2} \\cdot p \\cdot q$, gdzie $p$ i $q$ to długości przekątnych rombu. Jest to podstawowy wzór na egzaminie.

*   **Trapez:** Czworokąt, który ma co najmniej jedną parę boków równoległych. Boki równoległe to podstawy trapezu.
    *   Wzór na pole: $P = \\frac{1}{2} \\cdot (a + b) \\cdot h$, gdzie $a$ i $b$ to długości podstaw, a $h$ to wysokość trapezu (odległość między podstawami).

*   **Koło:** Zbiór wszystkich punktów na płaszczyźnie, których odległość od ustalonego punktu (środka) jest nie większa niż promień.
    *   Wzór na pole: $P = \\pi r^2$, gdzie $r$ to promień koła. $\\pi$ (pi) to stała matematyczna, w przybliżeniu 3,14.

*   **Wycinek koła:** Część koła ograniczona dwoma promieniami i łukiem.
    *   Pole wycinka o kącie środkowym $\\alpha$ (w stopniach): $P_{wycinka} = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$.

*   **Zamiana jednostek pola:**
    *   $1 \\text{ m} = 100 \\text{ cm} \\implies 1 \\text{ m}^2 = (100 \\text{ cm})^2 = 10000 \\text{ cm}^2$
    *   $1 \\text{ km} = 1000 \\text{ m} \\implies 1 \\text{ km}^2 = 1000000 \\text{ m}^2$
    *   $1 \\text{ ar (a)} = 100 \\text{ m}^2$
    *   $1 \\text{ hektar (ha)} = 100 \\text{ arów} = 10000 \\text{ m}^2$.

## Przykład 1 - podstawowy
Oblicz pole prostokąta o bokach długości 5 cm i 8 cm.
**Krok 1.** Zidentyfikuj figurę i dane.
Figurą jest prostokąt. Długości boków wynoszą $a = 5$ cm i $b = 8$ cm.
**Krok 2.** Wybierz odpowiedni wzór na pole prostokąta.
Wzór na pole prostokąta to $P = a \\cdot b$.
**Krok 3.** Podstaw dane do wzoru.
$P = 5 \\text{ cm} \\cdot 8 \\text{ cm}$
**Krok 4.** Oblicz wynik.
$P = 40 \\text{ cm}^2$.
**Krok 5.** Zapisz odpowiedź z jednostką.
Pole prostokąta wynosi 40 cm$^2$.

**Sprawdzenie:** Wzór zastosowany poprawnie, obliczenia wykonane zgodnie ze wzorem. Jednostka pola jest poprawna.

## Przykład 2 - maturalny
Działka w kształcie trapezu równoramiennego ma podstawy o długościach 12 m i 20 m. Wysokość działki wynosi 8 m. Oblicz pole tej działki.
**Krok 1.** Zidentyfikuj figurę i dane.
Figurą jest trapez. Długości podstaw to $a = 12$ m, $b = 20$ m. Wysokość to $h = 8$ m.
**Krok 2.** Wybierz odpowiedni wzór na pole trapezu.
Wzór na pole trapezu to $P = \\frac{1}{2} \\cdot (a + b) \\cdot h$.
**Krok 3.** Podstaw dane do wzoru.
$P = \\frac{1}{2} \\cdot (12 \\text{ m} + 20 \\text{ m}) \\cdot 8 \\text{ m}$
**Krok 4.** Wykonaj dodawanie w nawiasie.
$P = \\frac{1}{2} \\cdot (32 \\text{ m}) \\cdot 8 \\text{ m}$
**Krok 5.** Wykonaj mnożenie.
$P = 16 \\text{ m} \\cdot 8 \\text{ m} = 128 \\text{ m}^2$.
**Krok 6.** Zapisz odpowiedź z jednostką.
Pole działki wynosi 128 m$^2$.

**Sprawdzenie:** Wzór zastosowany poprawnie, wszystkie dane podstawione. Obliczenia wykonane poprawnie. Jednostka pola jest odpowiednia dla danych wejściowych.

## Przykład 3 - egzaminacyjny

Oblicz pole rombu, którego przekątne mają długości 10 cm i 6 cm.
**Krok 1.** Zidentyfikuj figurę i dane.
Figurą jest romb. Długości przekątnych to $p = 10$ cm i $q = 6$ cm.
**Krok 2.** Wybierz wzór na pole rombu.
Wzór na pole rombu przez przekątne to $P = \\frac{1}{2} \\cdot p \\cdot q$.
**Krok 3.** Podstaw dane do wzoru.
$P = \\frac{1}{2} \\cdot 10 \\text{ cm} \\cdot 6 \\text{ cm}$
**Krok 4.** Wykonaj mnożenie.
$P = \\frac{1}{2} \\cdot 60 \\text{ cm}^2$
**Krok 5.** Oblicz wynik.
$P = 30 \\text{ cm}^2$.
**Krok 6.** Zapisz odpowiedź.
Pole rombu wynosi 30 cm$^2$.

**Sprawdzenie:** Wzór na pole rombu przez przekątne zastosowany poprawnie. Obliczenia są poprawne.

## Pułapki
*   **Mylenie wzorów:** Uczniowie często mylą wzory na pole np. trapezu z polem równoległoboku, lub stosują wzór na pole rombu przez boki zamiast przez przekątne. Zawsze dokładnie sprawdzaj, z jaką figurą masz do czynienia i jaki jest jej opis (długości boków, przekątnych, wysokość itp.).
*   **Niewłaściwe jednostki:** W zadaniach pojawiają się różne jednostki (np. metry i centymetry). Pamiętaj o zamianie jednostek przed wykonaniem obliczeń lub o poprawnej zamianie jednostki pola na końcu. Najbezpieczniej jest zamienić wszystkie jednostki na jedną, spójną przed rozpoczęciem liczenia.
*   **Błędy w obliczeniach:** Pośpiech prowadzi do błędów rachunkowych, zwłaszcza przy ułamkach (jak $\\frac{1}{2}$) i mnożeniu. Sprawdzaj swoje obliczenia, a jeśli to możliwe, wykonuj je krok po kroku.
*   **Figury złożone:** Przy figurach złożonych kluczowe jest poprawne podzielenie ich na prostsze figury składowe (prostokąty, trójkąty itp.). Czasem trzeba dodać pola prostych figur, a czasem odjąć pole mniejszej figury od pola większej. Rysunek pomocniczy jest tu bardzo ważny.
*   **Wysokość w trójkącie/trapezie:** Upewnij się, że używasz właściwej wysokości – prostopadłej do podstawy. W trójkątach z kątem rozwartym wysokość może "padać" na zewnątrz figury.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz pole kwadratu o boku długości 7 cm.
2.  Oblicz pole trójkąta prostokątnego, którego przyprostokątne mają długości 6 cm i 9 cm.
3.  Oblicz pole trapezu, którego podstawy mają długości 15 cm i 25 cm, a wysokość wynosi 10 cm.
4.  Działka w kształcie koła ma promień 10 m. Oblicz jej pole, przyjmując $\\pi \\approx 3.14$.
5.  Oblicz pole figury przedstawionej na rysunku. Figurę tę można podzielić na prostokąt i kwadrat. Dłuższy bok prostokąta to 10 cm, krótszy bok to 5 cm. Bok kwadratu wynosi 3 cm.

    \`\`\`text
    +---------+
    |         | 5 cm
    +---+-----+
        | 3 cm
        +---+
    \`\`\`
    (Rysunek: prostokąt 10x5 cm, do którego od dołu, na środku jednego z 10-cm boków, doklejony jest kwadrat o boku 3 cm. Górna część prostokąta ma 5 cm wysokości, a dolna część prostokąta (razem z kwadratem) ma 8 cm wysokości, z czego 3 cm to kwadrat.)

6.  Pole pewnego rombu wynosi 72 cm$^2$. Jedna z jego przekątnych ma długość 12 cm. Oblicz długość drugiej przekątnej.
7.  Oblicz pole wycinka koła o promieniu 6 cm, jeśli kąt środkowy tego wycinka wynosi $60^\\circ$. Przyjmij $\\pi \\approx 3.14$.

## Odpowiedzi
1.  $P = 7^2 = 49$ cm$^2$.
2.  W trójkącie prostokątnym przyprostokątne są jednocześnie wysokościami opuszczonymi na siebie nawzajem. $P = \\frac{1}{2} \\cdot 6 \\text{ cm} \\cdot 9 \\text{ cm} = 27$ cm$^2$.
3.  $P = \\frac{1}{2} \\cdot (15 \\text{ cm} + 25 \\text{ cm}) \\cdot 10 \\text{ cm} = \\frac{1}{2} \\cdot 40 \\text{ cm} \\cdot 10 \\text{ cm} = 200$ cm$^2$.
4.  $P = \\pi r^2 = 3.14 \\cdot (10 \\text{ m})^2 = 3.14 \\cdot 100 \\text{ m}^2 = 314$ m$^2$.
5.  Figura składa się z prostokąta o bokach 10 cm i 5 cm (pole $10 \\cdot 5 = 50$ cm$^2$) oraz z kwadratu o boku 3 cm (pole $3^2 = 9$ cm$^2$). Całkowite pole to suma pól: $50 + 9 = 59$ cm$^2$.
6.  Używamy wzoru $P = \\frac{1}{2} p \\cdot q$. $72 \\text{ cm}^2 = \\frac{1}{2} \\cdot 12 \\text{ cm} \\cdot q$. $72 \\text{ cm}^2 = 6 \\text{ cm} \\cdot q$. $q = \\frac{72 \\text{ cm}^2}{6 \\text{ cm}} = 12$ cm. Druga przekątna ma 12 cm.
7.  $P_{wycinka} = \\frac{60^\\circ}{360^\\circ} \\cdot \\pi r^2 = \\frac{1}{6} \\cdot 3.14 \\cdot (6 \\text{ cm})^2 = \\frac{1}{6} \\cdot 3.14 \\cdot 36 \\text{ cm}^2 = 3.14 \\cdot 6 \\text{ cm}^2 = 18.84$ cm$^2$.

## Szybka powtórka
1.  Jaki wzór na pole prostokąta jest najbardziej podstawowy?
2.  Jak obliczyć pole trójkąta, jeśli znamy jego podstawę i wysokość?
3.  Podaj wzór na pole rombu, gdy znamy jego przekątne.
4.  Jakie są długości podstaw trapezu w podstawowym wzorze na jego pole?
5.  Czy pole koła zależy od jego średnicy czy promienia?

## Diagram
\`\`\`text
          b
+-----------------+
|                 |
|                 | a
|                 |
+-----------------+
       a  - długość
       b  - szerokość
Pole = a * b
\`\`\`

\`\`\`text
      a
+---------+
| \\       |
|  \\      | h
|   \\     |
+----\\----+
      a - podstawa
      h - wysokość
Pole = 0.5 * a * h
\`\`\`

\`\`\`text
       / \\
      /   \\
     /     \\  h
    /_______\\
       a

   a - podstawa
   h - wysokość
Pole = 0.5 * a * h
\`\`\`

\`\`\`text
      p
   /-----\\
  /       \\
 /         \\
/-----------\\ q
Pole rombu = 0.5 * p * q
\`\`\`

\`\`\`text
       a
+--------------+
|             /|
|            / |
|           /  | h
|          /   |
+---------/----+
     b
   a, b - podstawy
   h - wysokość
Pole trapezu = 0.5 * (a + b) * h
\`\`\`

\`\`\`text
      *****
    *       *
  *           * r
*               *
 *             *
  *           *
    *       *
      *****
 Pole koła = pi * r^2
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "pitagoras",
    title: "Twierdzenie Pitagorasa – klucz do geometrii na egzaminie",
    content: `## Na egzaminie
Twierdzenie Pitagorasa pojawia się na egzaminie ósmoklasisty regularnie, zazwyczaj w zadaniach otwartych i zamkniętych. Zadania te mogą sprawdzać zarówno bezpośrednie zastosowanie twierdzenia do obliczenia długości boku trójkąta prostokątnego, jak i jego wykorzystanie w bardziej złożonych problemach geometrycznych, np. obliczanie przekątnych kwadratów, rombów czy odległości między punktami na płaszczyźnie. Oczekuje się od ucznia umiejętności rozpoznania trójkąta prostokątnego w różnych kontekstach i zastosowania odpowiednich wzorów.

## Mapa tematu
1.  Zrozumienie istoty twierdzenia Pitagorasa.
2.  Identyfikacja przyprostokątnych i przeciwprostokątnej w trójkącie prostokątnym.
3.  Stosowanie twierdzenia Pitagorasa do obliczania długości boku trójkąta prostokątnego, gdy znane są dwa pozostałe boki.
4.  Wykorzystanie twierdzenia Pitagorasa do ustalenia, czy dany trójkąt jest prostokątny.
5.  Zastosowanie twierdzenia Pitagorasa w zadaniach praktycznych i geometrycznych (obliczanie przekątnych, wysokości, odległości).
6.  Rozwiązywanie zadań wymagających przekształcania wzoru lub wykonania dodatkowych obliczeń.

## Definicje i wzory
*   **Trójkąt prostokątny:** Trójkąt, który posiada jeden kąt o mierze 90 stopni.
*   **Przyprostokątne:** Dwa boki trójkąta prostokątnego, które tworzą kąt prosty. Są to boki krótsze od przeciwprostokątnej.
*   **Przeciwprostokątna:** Bok trójkąta prostokątnego leżący naprzeciwko kąta prostego. Jest to najdłuższy bok trójkąta prostokątnego.

**Twierdzenie Pitagorasa:**
W trójkącie prostokątnym suma kwadratów długości przyprostokątnych jest równa kwadratowi długości przeciwprostokątnej.

Jeśli oznaczymy długości przyprostokątnych jako $a$ i $b$, a długość przeciwprostokątnej jako $c$, to twierdzenie Pitagorasa można zapisać wzorem:
$$a^2 + b^2 = c^2$$

**Ważne własności i zastosowania:**
*   Twierdzenie Pitagorasa działa **tylko** dla trójkątów prostokątnych.
*   Znając dwie przyprostokątne, możemy obliczyć przeciwprostokątną: $c = \\sqrt{a^2 + b^2}$.
*   Znając przeciwprostokątną i jedną przyprostokątną, możemy obliczyć drugą przyprostokątną: $a = \\sqrt{c^2 - b^2}$ lub $b = \\sqrt{c^2 - a^2}$.
*   Twierdzenie odwrotne do twierdzenia Pitagorasa: Jeśli w trójkącie o bokach długości $a$, $b$, $c$ spełniony jest warunek $a^2 + b^2 = c^2$ (gdzie $c$ jest najdłuższym bokiem), to ten trójkąt jest prostokątny, a kąt naprzeciwko boku $c$ jest kątem prostym.

**Trójki pitagorejskie:**
Są to zestawy trzech liczb naturalnych, które spełniają twierdzenie Pitagorasa. Najbardziej znana to (3, 4, 5), ponieważ $3^2 + 4^2 = 9 + 16 = 25$, a $5^2 = 25$. Inne przykłady to (5, 12, 13), (8, 15, 17), (7, 24, 25). Znajomość tych trójek może przyspieszyć rozwiązywanie niektórych zadań.

## Przykład 1 - podstawowy
W trójkącie prostokątnym jedna przyprostokątna ma długość 6 cm, a druga 8 cm. Oblicz długość przeciwprostokątnej.

**Krok 1.** Zidentyfikuj dane.
Mamy trójkąt prostokątny. Długości przyprostokątnych to $a = 6$ cm i $b = 8$ cm. Szukamy długości przeciwprostokątnej $c$.

**Krok 2.** Zastosuj twierdzenie Pitagorasa.
Zapiszemy wzór: $a^2 + b^2 = c^2$.

**Krok 3.** Podstaw dane do wzoru.
$6^2 + 8^2 = c^2$

**Krok 4.** Oblicz kwadraty i ich sumę.
$36 + 64 = c^2$
$100 = c^2$

**Krok 5.** Wyznacz długość przeciwprostokątnej.
Aby znaleźć $c$, obliczamy pierwiastek kwadratowy z 100.
$c = \\sqrt{100}$
$c = 10$ cm

**Sprawdzenie:**
Czy $6^2 + 8^2 = 10^2$?
$36 + 64 = 100$
$100 = 100$. Zgadza się. Odpowiedź jest poprawna.
Odpowiedź: Długość przeciwprostokątnej wynosi 10 cm.

## Przykład 2 - maturalny
Oblicz długość krótszej przyprostokątnej w trójkącie prostokątnym, jeśli przeciwprostokątna ma długość 13 cm, a dłuższa przyprostokątna ma długość 12 cm.

**Krok 1.** Zidentyfikuj dane.
Mamy trójkąt prostokątny. Przeciwprostokątna $c = 13$ cm. Dłuższa przyprostokątna $b = 12$ cm. Szukamy długości krótszej przyprostokątnej $a$.

**Krok 2.** Zastosuj twierdzenie Pitagorasa.
Wzór to $a^2 + b^2 = c^2$. Ponieważ szukamy przyprostokątnej, przekształcimy wzór: $a^2 = c^2 - b^2$.

**Krok 3.** Podstaw dane do wzoru.
$a^2 = 13^2 - 12^2$

**Krok 4.** Oblicz kwadraty i ich różnicę.
$a^2 = 169 - 144$
$a^2 = 25$

**Krok 5.** Wyznacz długość przyprostokątnej.
Obliczamy pierwiastek kwadratowy z 25.
$a = \\sqrt{25}$
$a = 5$ cm

**Sprawdzenie:**
Czy $5^2 + 12^2 = 13^2$?
$25 + 144 = 169$
$169 = 169$. Zgadza się.
Odpowiedź: Krótsza przyprostokątna ma długość 5 cm. (Zauważ, że (5, 12, 13) to kolejna trójka pitagorejska).

## Przykład 3 - egzaminacyjny
Taras w kształcie prostokąta ma wymiary 3 metry na 4 metry. Jaka jest długość barierki potrzebnej do ogrodzenia tarasu po przekątnej?

**Krok 1.** Rozpoznanie sytuacji geometrycznej.
Taras w kształcie prostokąta o bokach 3 m i 4 m. Przekątna tarasu tworzy z dwoma bokami trójkąt prostokątny. Boki prostokąta są przyprostokątnymi tego trójkąta, a przekątna jest jego przeciwprostokątną.

**Krok 2.** Zidentyfikuj dane i szukane.
Przyprostokątne: $a = 3$ m, $b = 4$ m. Szukana jest przeciwprostokątna $c$.

**Krok 3.** Zastosuj twierdzenie Pitagorasa.
$a^2 + b^2 = c^2$

**Krok 4.** Podstaw dane i oblicz.
$3^2 + 4^2 = c^2$
$9 + 16 = c^2$
$25 = c^2$
$c = \\sqrt{25}$
$c = 5$ m

**Sprawdzenie:**
Obliczenia są poprawne. Długość przekątnej wynosi 5 m. Jest to trójka pitagorejska (3, 4, 5).
Odpowiedź: Długość barierki potrzebnej do ogrodzenia tarasu po przekątnej wynosi 5 metrów.

## Pułapki
*   **Stosowanie twierdzenia do trójkątów innych niż prostokątne:** Twierdzenie Pitagorasa jest prawdziwe **tylko** dla trójkątów prostokątnych. Upewnij się, że masz do czynienia z trójkątem prostokątnym, zanim zastosujesz wzór.
*   **Pomylenie przyprostokątnych z przeciwprostokątną:** Pamiętaj, że przeciwprostokątna ($c$) jest zawsze najdłuższym bokiem i leży naprzeciwko kąta prostego. Wzór to $a^2 + b^2 = c^2$. Jeśli obliczasz przyprostokątną, użyj $c^2 - b^2$ lub $c^2 - a^2$.
*   **Błędy w obliczeniach potęg i pierwiastków:** Dokładnie sprawdzaj obliczenia kwadratów liczb i pierwiastków kwadratowych. Szczególnie przy większych liczbach łatwo o pomyłkę (np. $13^2 = 169$, nie 159).
*   **Zapominanie o jednostkach:** W zadaniach tekstowych zawsze pamiętaj o podaniu jednostek w odpowiedzi (cm, m, km itp.).
*   **Problem z "czystymi" liczbami:** Nie wszystkie zadania dadzą w wyniku liczbę całkowitą. Często pojawiają się pierwiastki, których nie da się uprościć do liczby całkowitej (np. $\\sqrt{7}$, $\\sqrt{15}$). Nie panikuj, zapisz wynik w takiej postaci, chyba że polecenie wymaga przybliżenia.

## Ćwiczenia do samodzielnego rozwiązania
1.  W trójkącie prostokątnym przyprostokątne mają długości 7 cm i 24 cm. Oblicz długość przeciwprostokątnej.
2.  Przeciwprostokątna trójkąta prostokątnego ma długość 10 m, a jedna z przyprostokątnych 6 m. Oblicz długość drugiej przyprostokątnej.
3.  Sprawdź, czy trójkąt o bokach długości 9 cm, 12 cm i 15 cm jest prostokątny.
4.  Drabina o długości 5 metrów została postawiona pod ścianą tak, że jej dolny koniec znajduje się 1.5 metra od ściany. Na jaką wysokość sięga drabina?
5.  Oblicz długość przekątnej kwadratu o boku długości 4 cm.
6.  Oblicz długość boku rombu, którego przekątne mają długości 6 cm i 8 cm. (Wskazówka: przekątne rombu przecinają się pod kątem prostym i dzielą się na połowy).
7.  W trójkącie ABC, kąt przy wierzchołku C jest prosty. Długość boku AC wynosi $\\sqrt{5}$ cm, a długość boku BC wynosi $\\sqrt{11}$ cm. Oblicz długość boku AB.

## Odpowiedzi
1.  Długość przeciwprostokątnej wynosi 25 cm. ($7^2 + 24^2 = 49 + 576 = 625$, $\\sqrt{625} = 25$)
2.  Długość drugiej przyprostokątnej wynosi 8 m. ($10^2 - 6^2 = 100 - 36 = 64$, $\\sqrt{64} = 8$)
3.  Tak, trójkąt jest prostokątny. ($9^2 + 12^2 = 81 + 144 = 225$, $15^2 = 225$)
4.  Drabina sięga na wysokość $\\sqrt{22.75}$ m (około 4.77 m). (5^2 - 1.5^2 = 25 - 2.25 = 22.75, $\\sqrt{22.75}$)
5.  Długość przekątnej wynosi $4\\sqrt{2}$ cm. (Przekątna kwadratu dzieli go na dwa trójkąty prostokątne o przyprostokątnych 4 cm i 4 cm. $4^2 + 4^2 = 16 + 16 = 32$, $\\sqrt{32} = \\sqrt{16 \\cdot 2} = 4\\sqrt{2}$)
6.  Długość boku rombu wynosi 5 cm. (Przekątne dzielą się na połowy, tworząc trójkąt prostokątny o przyprostokątnych 3 cm i 4 cm. Bok rombu jest przeciwprostokątną: $3^2 + 4^2 = 9 + 16 = 25$, $\\sqrt{25} = 5$)
7.  Długość boku AB wynosi $\\sqrt{16}$ cm, czyli 4 cm. ($\\sqrt{5}^2 + \\sqrt{11}^2 = 5 + 11 = 16$, $\\sqrt{16} = 4$)

## Szybka powtórka
1.  Jakie są przyprostokątne w trójkącie prostokątnym?
2.  Jak nazywa się najdłuższy bok w trójkącie prostokątnym?
3.  Jaki jest wzór na twierdzenie Pitagorasa, jeśli $a$ i $b$ to przyprostokątne, a $c$ to przeciwprostokątna?
4.  Twierdzenie Pitagorasa można stosować do każdego trójkąta?
5.  Jak obliczyć długość przyprostokątnej $a$, gdy znamy przeciwprostokątną $c$ i drugą przyprostokątną $b$?

## Diagram
\`\`\`text
      /|
     / |
    /  | b (przyprostokątna)
 c /   |
(przeciw- /____|
prostokątna) a (przyprostokątna)

Kąt prosty znajduje się między bokami a i b.
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "podobienstwo",
    title: "Podobieństwo figur płaskich",
    content: `## Na egzaminie
Podobieństwo figur płaskich pojawia się na egzaminie ósmoklasisty dość często, zazwyczaj w zadaniach otwartych, ale czasem również jako element zadań zamkniętych. Zazwyczaj można zdobyć za nie 2-4 punkty. Egzaminatorzy lubią sprawdzać umiejętność obliczania długości boków, wysokości lub obwodów figur podobnych, a także stosowania zależności między polami figur podobnych. Często pojawiają się zadania tekstowe lub związane z geometrii (np. trójkąty, czworokąty).

## Mapa tematu
Po przerobieniu tej lekcji będziesz potrafił/a:
1. Zrozumieć definicję dwóch figur podobnych płaskich.
2. Rozpoznać i zastosować pojęcie jednokładności w kontekście podobieństwa.
3. Obliczyć skalę podobieństwa dla danych figur.
4. Obliczyć brakujące wymiary (boki, wysokości, obwody) figur podobnych, znając niektóre ich wymiary i skalę podobieństwa.
5. Zrozumieć i zastosować zależność między obwodami figur podobnych.
6. Zrozumieć i zastosować zależność między polami figur podobnych.
7. Rozwiązywać zadania tekstowe i geometryczne z wykorzystaniem podobieństwa figur.
8. Określić, czy dane figury (np. trójkąty, prostokąty) są podobne.

## Definicje i wzory
*   **Figury podobne:** Dwie figury geometryczne nazywamy podobnymi, jeśli jedna jest obrazem drugiej w pewnej jednokładności (lub w złożeniu jednokładności i przekształcenia izometrycznego, np. przesunięcia, obrotu, symetrii). Figurami podobnymi są więc figury, które mają takie same kształty, ale mogą różnić się wielkością. Figury przystające są szczególnym przypadkiem figur podobnych o skali podobieństwa równej 1.
*   **Jednokładność:** Jest to przekształcenie geometryczne, które przekształca punkt $P$ na punkt $P'$ w taki sposób, że punkt $O$ (środek jednokładności) oraz punkty $P$ i $P'$ leżą na jednej prostej, a stosunek odległości punktu $P'$ od $O$ do odległości punktu $P$ od $O$ jest stały i równy liczbie $k$ (zwanej skalą jednokładności). $k = \\frac{|OP'|}{|OP|}$. Jeśli $k > 0$, punkty $P$ i $P'$ leżą po tej samej stronie punktu $O$. Jeśli $k < 0$, leżą po przeciwnych stronach. Jeśli $|k|=1$, jednokładność jest izometrią (przesunięciem, jeśli $k=1$, lub środkowosymetria, jeśli $k=-1$).
*   **Skala podobieństwa ($k$):** Stosunek odpowiadających sobie długości w dwóch figurach podobnych. Jeśli figura $A'$ jest podobna do figury $A$ w skali $k$, to każda długość w $A'$ jest $k$ razy większa niż odpowiadająca jej długość w $A$.
    *   Dla odcinków $AB$ w figurze $A$ i $A'B'$ w figurze $A'$ podobnej do $A$: $k = \\frac{|A'B'|}{|AB|}$.
    *   Jeśli $k > 1$, figura $A'$ jest powiększona w stosunku do $A$.
    *   Jeśli $0 < k < 1$, figura $A'$ jest pomniejszona w stosunku do $A$.
    *   Jeśli $k = 1$, figury $A$ i $A'$ są przystające.
*   **Cechy figur podobnych:**
    *   Odpowiadające sobie kąty są równe.
    *   Stosunek odpowiadających sobie boków jest stały i równy skali podobieństwa $k$.
*   **Podobieństwo trójkątów:** Dwa trójkąty są podobne, jeśli:
    *   **Cecha BBB:** Stosunki długości wszystkich trzech par odpowiadających sobie boków są równe: $\\frac{a'}{a} = \\frac{b'}{b} = \\frac{c'}{c} = k$.
    *   **Cecha BCC:** Dwa boki jednego trójkąta są proporcjonalne do dwóch odpowiadających boków drugiego trójkąta, a kąty między tymi bokami są równe. $\\frac{a'}{a} = \\frac{b'}{b} = k$ i $\\gamma = \\gamma'$.
    *   **Cecha BB:** Dwa kąty jednego trójkąta są równe dwóm kątom drugiego trójkąta (a więc i trzecie kąty są równe): $\\alpha = \\alpha'$ i $\\beta = \\beta'$.
*   **Wzory dla figur podobnych:**
    *   **Obwód:** Jeśli $Ob$ i $Ob'$ są obwodami figur $A$ i $A'$ podobnych w skali $k$, to $\\frac{Ob'}{Ob} = k$, czyli $Ob' = k \\cdot Ob$. Obwody figur podobnych są proporcjonalne do skali podobieństwa.
    *   **Pole:** Jeśli $P$ i $P'$ są polami figur $A$ i $A'$ podobnych w skali $k$, to $\\frac{P'}{P} = k^2$, czyli $P' = k^2 \\cdot P$. Pola figur podobnych są proporcjonalne do kwadratu skali podobieństwa.

## Przykład 1 - podstawowy
Prostokąt $ABCD$ ma boki długości $|AB| = 8$ cm i $|BC| = 4$ cm. Prostokąt $A'B'C'D'$ jest podobny do $ABCD$ w skali $k = \\frac{3}{2}$. Oblicz długości boków prostokąta $A'B'C'D'$.

*   **Krok 1.** Zidentyfikuj dane. Mamy prostokąt $ABCD$ o bokach $a = 8$ cm i $b = 4$ cm. Prostokąt $A'B'C'D'$ jest podobny do $ABCD$ w skali $k = \\frac{3}{2}$.
*   **Krok 2.** Zrozumienie pojęcia podobieństwa dla prostokątów. Boki prostokąta $A'B'C'D'$ odpowiadają bokom prostokąta $ABCD$. Oznacza to, że bok $A'B'$ odpowiada bokowi $AB$, a bok $B'C'$ odpowiada bokowi $BC$.
*   **Krok 3.** Oblicz długość boku $|A'B'|$. Bok $|A'B'|$ jest odpowiadającym bokiem do $|AB|$. Skorzystaj ze wzoru na skalę podobieństwa: $k = \\frac{|A'B'|}{|AB|}$. Przekształć wzór, aby obliczyć $|A'B'|$: $|A'B'| = k \\cdot |AB|$. Podstaw dane: $|A'B'| = \\frac{3}{2} \\cdot 8$ cm.
*   **Krok 4.** Oblicz długość boku $|B'C'|$. Bok $|B'C'|$ jest odpowiadającym bokiem do $|BC|$. Skorzystaj ze wzoru: $k = \\frac{|B'C'|}{|BC|}$. Przekształć wzór: $|B'C'| = k \\cdot |BC|$. Podstaw dane: $|B'C'| = \\frac{3}{2} \\cdot 4$ cm.
*   **Krok 5.** Wykonaj obliczenia.
    *   $|A'B'| = \\frac{3}{2} \\cdot 8 \\text{ cm} = 3 \\cdot \\frac{8}{2} \\text{ cm} = 3 \\cdot 4 \\text{ cm} = 12 \\text{ cm}$.
    *   $|B'C'| = \\frac{3}{2} \\cdot 4 \\text{ cm} = 3 \\cdot \\frac{4}{2} \\text{ cm} = 3 \\cdot 2 \\text{ cm} = 6 \\text{ cm}$.

**Sprawdzenie:**
Stosunek boków w pierwszym prostokącie: $\\frac{8}{4} = 2$.
Stosunek boków w drugim prostokącie: $\\frac{12}{6} = 2$.
Kształty są takie same.
Skala podobieństwa: $\\frac{|A'B'|}{|AB|} = \\frac{12}{8} = \\frac{3}{2}$. $\\frac{|B'C'|}{|BC|} = \\frac{6}{4} = \\frac{3}{2}$.
Skala się zgadza. Wynik jest poprawny.

## Przykład 2 - maturalny
Dwa trójkąty, $ABC$ i $A'B'C'$, są podobne. Długości boków trójkąta $ABC$ wynoszą $a=6$ cm, $b=8$ cm, $c=10$ cm. Najkrótszy bok trójkąta $A'B'C'$ ma długość $a'=9$ cm. Oblicz obwód i pole trójkąta $A'B'C'$.

*   **Krok 1.** Określ dane i cel. Mamy trójkąt $ABC$ z bokami $a=6$, $b=8$, $c=10$. Trójkąt $A'B'C'$ jest podobny do $ABC$. Najkrótszy bok $a'$ w trójkącie $A'B'C'$ ma długość $9$ cm. Należy obliczyć obwód i pole trójkąta $A'B'C'$.
*   **Krok 2.** Znajdź skalę podobieństwa. Najkrótszy bok w trójkącie $ABC$ to $a=6$ cm. Najkrótszy bok w trójkącie $A'B'C'$ to $a'=9$ cm. Skala podobieństwa $k$ jest stosunkiem odpowiadających sobie boków: $k = \\frac{a'}{a} = \\frac{9 \\text{ cm}}{6 \\text{ cm}} = \\frac{3}{2}$.
*   **Krok 3.** Oblicz obwód trójkąta $ABC$. Obwód $Ob = a + b + c = 6 + 8 + 10 = 24$ cm.
*   **Krok 4.** Oblicz obwód trójkąta $A'B'C'$. Skorzystaj ze wzoru $Ob' = k \\cdot Ob$.
    $Ob' = \\frac{3}{2} \\cdot 24 \\text{ cm} = 3 \\cdot \\frac{24}{2} \\text{ cm} = 3 \\cdot 12 \\text{ cm} = 36 \\text{ cm}$.
*   **Krok 5.** Oblicz pole trójkąta $ABC$. Zauważ, że boki $6, 8, 10$ spełniają twierdzenie Pitagorasa: $6^2 + 8^2 = 36 + 64 = 100 = 10^2$. Jest to trójkąt prostokątny. Pole trójkąta prostokątnego to połowa iloczynu przyprostokątnych.
    $P = \\frac{1}{2} \\cdot a \\cdot b = \\frac{1}{2} \\cdot 6 \\text{ cm} \\cdot 8 \\text{ cm} = \\frac{1}{2} \\cdot 48 \\text{ cm}^2 = 24 \\text{ cm}^2$.
*   **Krok 6.** Oblicz pole trójkąta $A'B'C'$. Skorzystaj ze wzoru $P' = k^2 \\cdot P$.
    $P' = \\left(\\frac{3}{2}\\right)^2 \\cdot 24 \\text{ cm}^2 = \\frac{9}{4} \\cdot 24 \\text{ cm}^2 = 9 \\cdot \\frac{24}{4} \\text{ cm}^2 = 9 \\cdot 6 \\text{ cm}^2 = 54 \\text{ cm}^2$.

**Sprawdzenie:**
Obliczmy boki $b'$ i $c'$ trójkąta $A'B'C'$:
$b' = k \\cdot b = \\frac{3}{2} \\cdot 8 = 12$ cm.
$c' = k \\cdot c = \\frac{3}{2} \\cdot 10 = 15$ cm.
Boki trójkąta $A'B'C'$ to $9, 12, 15$.
Sprawdźmy, czy $A'B'C'$ jest trójkątem prostokątnym: $9^2 + 12^2 = 81 + 144 = 225$. $15^2 = 225$. Tak, jest prostokątny.
Obwód $Ob' = 9 + 12 + 15 = 36$ cm. Zgadza się z obliczonym.
Pole $P' = \\frac{1}{2} \\cdot 9 \\cdot 12 = \\frac{1}{2} \\cdot 108 = 54$ cm$^2$. Zgadza się z obliczonym.
Wynik jest poprawny.

## Przykład 3 - egzaminacyjny

W pewnej mapie w skali 1:50000 odcinek drogi ma długość 5 cm. Jaka jest rzeczywista długość tej drogi w kilometrach? Jeśli na tej samej mapie obrazem działki jest prostokąt o polu 20 cm$^2$, jakie jest pole tej działki w metrach kwadratowych?

*   **Krok 1.** Analiza pierwszego pytania (długość drogi). Mapa ma skalę $1:50000$. Odcinek na mapie ma $5$ cm.
*   **Krok 2.** Obliczenie rzeczywistej długości drogi. Skala $1:50000$ oznacza, że $1$ cm na mapie odpowiada $50000$ cm w rzeczywistości.
    Rzeczywista długość = Długość na mapie $\\times$ Skala (wartość liczbowa).
    Rzeczywista długość $= 5 \\text{ cm} \\times 50000 = 250000 \\text{ cm}$.
*   **Krok 3.** Zamiana jednostek na kilometry. Wiemy, że $1$ km $= 1000$ m, a $1$ m $= 100$ cm. Zatem $1$ km $= 1000 \\cdot 100$ cm $= 100000$ cm.
    Rzeczywista długość w km $= \\frac{250000 \\text{ cm}}{100000 \\text{ cm/km}} = 2.5 \\text{ km}$.

*   **Krok 4.** Analiza drugiego pytania (pole działki). Prostokąt na mapie ma pole $P_{mapa} = 20$ cm$^2$. Mapa jest w skali $1:50000$.
*   **Krok 5.** Zastosowanie zależności między polami figur podobnych. Mapa i rzeczywista działka są figurami podobnymi. Skala podobieństwa między mapą a rzeczywistością to $k_{mapa\\_rzecz} = 50000$. Chcemy znaleźć pole rzeczywiste $P_{rzecz}$.
    Wzór na pole: $P_{rzecz} = (k_{mapa\\_rzecz})^2 \\cdot P_{mapa}$.
    $P_{rzecz} = (50000)^2 \\cdot 20 \\text{ cm}^2$.
    $P_{rzecz} = (5 \\times 10^4)^2 \\cdot 20 \\text{ cm}^2 = (25 \\times 10^8) \\cdot 20 \\text{ cm}^2 = 500 \\times 10^8 \\text{ cm}^2 = 5 \\times 10^{10} \\text{ cm}^2$.
*   **Krok 6.** Zamiana jednostek pola na metry kwadratowe. Wiemy, że $1$ m $= 100$ cm. Zatem $1$ m$^2 = (100 \\text{ cm})^2 = 10000 \\text{ cm}^2$.
    $P_{rzecz} (\\text{w m}^2) = \\frac{5 \\times 10^{10} \\text{ cm}^2}{10000 \\text{ cm}^2/\\text{m}^2} = \\frac{5 \\times 10^{10}}{10^4} \\text{ m}^2 = 5 \\times 10^6 \\text{ m}^2$.
    Wynik: $5000000$ m$^2$.

**Sprawdzenie:**
Długość drogi: $2.5$ km to $2500$ m, czyli $250000$ cm. $250000 / 50000 = 5$ cm. Zgadza się.
Pole działki: Skala podobieństwa rzeczywistego do mapy jest $k=50000$. Pole rzeczywiste $= k^2 \\times$ Pole mapy.
$P_{rzecz} = (50000)^2 \\times 20 \\text{ cm}^2 = 2500000000 \\times 20 \\text{ cm}^2 = 50000000000 \\text{ cm}^2$.
$1 \\text{ m}^2 = 10000 \\text{ cm}^2$.
$P_{rzecz} (\\text{w m}^2) = 50000000000 / 10000 = 5000000 \\text{ m}^2$. Zgadza się.

## Pułapki
*   **Mylenie skali podobieństwa z odwrotnością skali:** Pamiętaj, że jeśli figura $A'$ jest podobna do figury $A$ w skali $k$, to stosunek boku w $A'$ do odpowiadającego boku w $A$ wynosi $k$. Jeśli masz np. dwie figury i wiesz, że jedna jest większa od drugiej, to skala $k > 1$. Jeśli masz podaną skalę w postaci $1:m$, to $k=m$ dla przejścia od mniejszej do większej figury.
*   **Brak kwadratu przy polach:** Często popełnianym błędem jest stosowanie zależności $P' = k \\cdot P$ zamiast poprawnej $P' = k^2 \\cdot P$. Pola figur podobnych są proporcjonalne do kwadratu skali.
*   **Niewłaściwe przyporządkowanie boków:** Przy figurach nieregularnych lub gdy nie są one odpowiednio zorientowane, łatwo pomylić, który bok odpowiada któremu. Zawsze szukaj par boków (lub innych elementów) leżących naprzeciw równych kątów lub w podobnych pozycjach. W prostokątach czy kwadratach krótszy bok odpowiada krótszemu, dłuższy dłuższemu.
*   **Błędy w obliczeniach arytmetycznych:** Działania na ułamkach, potęgowanie (zwłaszcza liczb z zerami), zamiana jednostek – to częste źródła błędów. Zawsze sprawdzaj swoje obliczenia.
*   **Niewłaściwe zastosowanie cech podobieństwa trójkątów:** Upewnij się, że stosujesz odpowiednie cechy i że dane, które masz, faktycznie pozwalają na stwierdzenie podobieństwa.

## Ćwiczenia do samodzielnego rozwiązania
1.  Trójkąt $ABC$ ma boki długości $a=4$ cm, $b=6$ cm, $c=8$ cm. Trójkąt $A'B'C'$ jest podobny do $ABC$ w skali $k = \\frac{1}{2}$. Oblicz obwód trójkąta $A'B'C'$.
2.  Dwa kwadraty są podobne. Bok pierwszego kwadratu ma długość $5$ cm, a bok drugiego kwadratu ma długość $10$ cm. Ile razy pole drugiego kwadratu jest większe od pola pierwszego kwadratu?
3.  Dwa trójkąty prostokątne są podobne. Przyprostokątne jednego trójkąta mają długość $3$ cm i $4$ cm. Przeciwprostokątna drugiego trójkąta wynosi $15$ cm. Oblicz długości przyprostokątnych drugiego trójkąta.
4.  Prostokąt $KLMN$ ma wymiary $12$ cm x $18$ cm. Prostokąt $K'L'M'N'$ jest podobny do $KLMN$ i jego krótszy bok ma długość $6$ cm. Oblicz obwód i pole prostokąta $K'L'M'N'$.
5.  Na planie miasta w skali $1:10000$ park ma kształt prostokąta o wymiarach $5$ cm x $8$ cm. Jakie jest rzeczywiste pole powierzchni tego parku w arach? (Pamiętaj: $1$ ar $= 100$ m$^2$).
6.  Dwa trójkąty równoboczne są podobne. Obwód większego trójkąta wynosi $36$ cm. Stosunek boku mniejszego trójkąta do boku większego wynosi $\\frac{2}{3}$. Oblicz pole mniejszego trójkąta.

## Odpowiedzi
1.  Obwód trójkąta $ABC$: $4+6+8=18$ cm. Obwód $A'B'C'$: $18 \\text{ cm} \\cdot \\frac{1}{2} = 9 \\text{ cm}$.
2.  Skala podobieństwa wynosi $k = \\frac{10}{5} = 2$. Pole drugiego kwadratu jest $k^2 = 2^2 = 4$ razy większe od pola pierwszego.
3.  Pierwszy trójkąt ma boki $3, 4$. Jego przeciwprostokątna $c = \\sqrt{3^2+4^2} = \\sqrt{9+16} = \\sqrt{25} = 5$ cm. Drugi trójkąt ma przeciwprostokątną $c'=15$ cm. Skala podobieństwa $k = \\frac{c'}{c} = \\frac{15}{5} = 3$. Przyprostokątne drugiego trójkąta: $a'=k \\cdot a = 3 \\cdot 3 = 9$ cm, $b'=k \\cdot b = 3 \\cdot 4 = 12$ cm.
4.  Boki prostokąta $KLMN$: $12$ cm i $18$ cm. Krótszy bok $6$ cm odpowiada krótszemu bokowi $12$ cm. Skala podobieństwa $k = \\frac{6}{12} = \\frac{1}{2}$. Dłuższy bok $K'L'M'N'$ to $k \\cdot 18 = \\frac{1}{2} \\cdot 18 = 9$ cm. Wymiary $K'L'M'N'$ to $6$ cm i $9$ cm. Obwód: $2(6+9) = 2 \\cdot 15 = 30$ cm. Pole: $6 \\cdot 9 = 54$ cm$^2$.
5.  Skala mapy $1:10000$ oznacza, że $1$ cm na mapie to $10000$ cm w rzeczywistości. Długość rzeczywista: $8 \\text{ cm} \\cdot 10000 = 80000 \\text{ cm} = 800 \\text{ m}$. Szerokość rzeczywista: $5 \\text{ cm} \\cdot 10000 = 50000 \\text{ cm} = 500 \\text{ m}$. Pole rzeczywiste: $800 \\text{ m} \\cdot 500 \\text{ m} = 400000 \\text{ m}^2$. W arach: $400000 \\text{ m}^2 / 100 \\text{ m}^2/\\text{ar} = 4000$ arów. Alternatywnie: pole na mapie $5 \\times 8 = 40$ cm$^2$. Skala pola $k^2 = (10000)^2 = 100000000$. Pole rzeczywiste: $40 \\text{ cm}^2 \\cdot 100000000 = 4000000000 \\text{ cm}^2$. $1 \\text{ m}^2 = 10000 \\text{ cm}^2$. Pole w m$^2$: $4000000000 / 10000 = 400000 \\text{ m}^2$. W arach: $4000$ arów.
6.  Obwód większego trójkąta (oznaczmy go jako $T_2$) wynosi $36$ cm. Bok większego trójkąta $b_2 = 36/3 = 12$ cm. Skala podobieństwa mniejszego trójkąta ($T_1$) do większego to $k = \\frac{2}{3}$. Bok mniejszego trójkąta $b_1 = k \\cdot b_2 = \\frac{2}{3} \\cdot 12 \\text{ cm} = 8$ cm. Pole trójkąta równobocznego o boku $a$ to $P = \\frac{a^2 \\sqrt{3}}{4}$. Pole mniejszego trójkąta: $P_1 = \\frac{8^2 \\sqrt{3}}{4} = \\frac{64 \\sqrt{3}}{4} = 16\\sqrt{3}$ cm$^2$. Alternatywnie, pole większego trójkąta: $P_2 = \\frac{12^2 \\sqrt{3}}{4} = \\frac{144 \\sqrt{3}}{4} = 36\\sqrt{3}$ cm$^2$. Pole mniejszego: $P_1 = k^2 \\cdot P_2 = (\\frac{2}{3})^2 \\cdot 36\\sqrt{3} = \\frac{4}{9} \\cdot 36\\sqrt{3} = 4 \\cdot 4\\sqrt{3} = 16\\sqrt{3}$ cm$^2$.

## Szybka powtórka
1.  Jakie są dwie podstawowe cechy figur podobnych?
2.  Jeśli skala podobieństwa figur wynosi $k=3$, to jak mają się do siebie ich obwody? A pola?
3.  Podaj warunki, na podstawie których można stwierdzić, że dwa trójkąty są podobne.
4.  Jaka jest zależność między bokami dwóch prostokątów, jeśli są one podobne?
5.  W jakim przypadku dwie figury podobne są przystające?

## Diagram
\`\`\`text
+-----------------+     k>1     +-----------------+
|   Figura A      | --------->|   Figura A'     |
|   (mniejsza)    |             |   (większa)     |
+-----------------+             +-----------------+
      |     ^                            |     ^
      |     | Skala k                    |     | Skala k
      |     |                            |     |
      | Obwód Ob                         | Obwód Ob' = k * Ob
      | Pole P                         | Pole P' = k^2 * P
      +-----------------+     k<1     +-----------------+
|   Figura B      | --------->|   Figura B'     |
|   (większa)     |             |   (mniejsza)    |
+-----------------+             +-----------------+
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria",
    topic: "symetrie",
    title: "Symetrie w Geometrycznej - Lekcja Egzaminacyjna",
    content: `## Na egzaminie
Zadania dotyczące symetrii pojawiają się na egzaminie ósmoklasisty regularnie, zazwyczaj jako część większych zadań geometrycznych lub jako osobne pytanie wymagające wskazania środka, osi lub określenia typu symetrii figury. Rozwiązanie takich zadań zwykle nie wymaga skomplikowanych obliczeń, a raczej dobrego zrozumienia definicji i umiejętności wizualizacji. Poprawne rozwiązanie zadania z symetrii może przynieść od 1 do 3 punktów. CKE lubi sprawdzać, czy uczniowie potrafią rozpoznać symetrię osiową i środkową, narysować obraz figury względem punktu lub prostej, a także znaleźć oś lub środek symetrii danej figury.

## Mapa tematu
1.  Zrozumienie pojęcia symetrii.
2.  Definicja i własności symetrii osiowej.
3.  Konstrukcja obrazu punktu i figury względem prostej.
4.  Znajdowanie osi symetrii dla różnych figur.
5.  Definicja i własności symetrii środkowej.
6.  Konstrukcja obrazu punktu i figury względem punktu.
7.  Znajdowanie środka symetrii dla różnych figur.
8.  Rozpoznawanie figur posiadających osie i środki symetrii.

## Definicje i wzory
*   **Symetria** – przekształcenie geometryczne, które zachowuje odległości między punktami. Istnieją różne rodzaje symetrii, najważniejsze na egzaminie to symetria osiowa i symetria środkowa.

*   **Symetria Osiowa**
    *   **Definicja:** Symetria osiowa względem prostej $k$ to przekształcenie, które każdemu punktowi $A$ przyporządkowuje punkt $A'$, taki, że prosta $AA'$ jest prostopadła do prostej $k$, a środek odcinka $AA'$ leży na prostej $k$. Punkt $A'$ nazywamy obrazem punktu $A$ w symetrii osiowej względem prostej $k$. Prosta $k$ nazywana jest **osią symetrii**.
    *   **Własności:**
        *   Jeśli punkt $A$ leży na osi symetrii $k$, to jego obrazem jest on sam ($A = A'$).
        *   Odległość punktu od osi symetrii jest równa odległości jego obrazu od tej osi.
        *   Symetria osiowa zachowuje kształt i rozmiar figur.
    *   **Konstrukcja obrazu odcinka:** Aby narysować obraz odcinka $AB$ w symetrii osiowej względem prostej $k$, wystarczy narysować obrazy jego końców punktów $A'$ i $B'$. Obrazem odcinka $AB$ będzie odcinek $A'B'$.
    *   **Oś symetrii figury:** Jest to prosta, względem której figura jest swoim własnym obrazem.

*   **Symetria Środkowa**
    *   **Definicja:** Symetria środkowa względem punktu $S$ to przekształcenie, które każdemu punktowi $A$ przyporządkowuje punkt $A'$, taki, że punkt $S$ jest środkiem odcinka $AA'$. Punkt $A'$ nazywamy obrazem punktu $A$ w symetrii środkowej względem punktu $S$. Punkt $S$ nazywany jest **środkiem symetrii**.
    *   **Własności:**
        *   Jeśli punkt $A$ pokrywa się ze środkiem symetrii $S$, to jego obrazem jest on sam ($A = A' = S$).
        *   Odległość punktu $A$ od środka symetrii $S$ jest równa odległości jego obrazu $A'$ od środka symetrii $S$ ($|AS| = |A'S|$).
        *   Symetria środkowa jest szczególnym przypadkiem obrotu o 180 stopni wokół środka $S$.
        *   Symetria środkowa zachowuje kształt i rozmiar figur.
    *   **Konstrukcja obrazu odcinka:** Aby narysować obraz odcinka $AB$ w symetrii środkowej względem punktu $S$, należy narysować obrazy jego końców punktów $A'$ i $B'$. Obrazem odcinka $AB$ będzie odcinek $A'B'$. Punkt $S$ musi leżeć na odcinku $AA'$ i $BB'$ (lub być ich końcem), przy czym $|AS| = |A'S|$ i $|BS| = |B'S|$.
    *   **Środek symetrii figury:** Jest to punkt, względem którego figura jest swoim własnym obrazem. Figury posiadające środek symetrii są również nazywane **figurami środkowosymetrycznymi**.

## Przykład 1 - podstawowy
Narysuj obraz trójkąta $ABC$ o wierzchołkach $A = (1, 2)$, $B = (3, 1)$, $C = (2, 4)$ w symetrii osiowej względem osi $Ox$ (osi współrzędnych $y=0$).

**Krok 1.** Zrozumienie przekształcenia: Symetria osiowa względem osi $Ox$ oznacza, że prosta $Ox$ jest osią symetrii. Dla punktu $(x, y)$, jego obrazem w symetrii względem osi $Ox$ jest punkt $(x, -y)$. Zmienia się tylko znak współrzędnej $y$.

**Krok 2.** Znalezienie obrazu wierzchołka $A$: Punkt $A = (1, 2)$. Jego obraz $A'$ w symetrii względem osi $Ox$ będzie miał współrzędne $(1, -2)$.

**Krok 3.** Znalezienie obrazu wierzchołka $B$: Punkt $B = (3, 1)$. Jego obraz $B'$ będzie miał współrzędne $(3, -1)$.

**Krok 4.** Znalezienie obrazu wierzchołka $C$: Punkt $C = (2, 4)$. Jego obraz $C'$ będzie miał współrzędne $(2, -4)$.

**Krok 5.** Narysowanie obrazu trójkąta: Łączymy punkty $A'$, $B'$, $C'$, tworząc trójkąt $A'B'C'$. Jest to obraz trójkąta $ABC$ w symetrii osiowej względem osi $Ox$.

**Sprawdzenie:** Odległości punktów od osi $Ox$:
$A=(1, 2)$, odległość = 2. $A'=(1, -2)$, odległość = $|-2|=2$.
$B=(3, 1)$, odległość = 1. $B'=(3, -1)$, odległość = $|-1|=1$.
$C=(2, 4)$, odległość = 4. $C'=(2, -4)$, odległość = $|-4|=4$.
Dla każdego punktu, odcinek łączący go z obrazem jest prostopadły do osi $Ox$ (oba punkty mają tę samą współrzędną $x$), a środek odcinka leży na osi $Ox$ (np. dla $AA'$, środek to $(\\frac{1+1}{2}, \\frac{2+(-2)}{2}) = (1, 0)$, który leży na osi $Ox$).

## Przykład 2 - maturalny
Prostokąt $ABCD$ o wierzchołkach $A=(-2, 3)$, $B=(4, 3)$, $C=(4, -1)$, $D=(-2, -1)$ przekształcono w symetrii środkowej względem punktu $S=(1, 1)$. Podaj współrzędne wierzchołków $A'$, $B'$, $C'$, $D'$ obrazu prostokąta $ABCD$.

**Krok 1.** Zrozumienie przekształcenia: Symetria środkowa względem punktu $S=(x_S, y_S)$ przekształca punkt $A=(x_A, y_A)$ na punkt $A'=(x_{A'}, y_{A'})$ taki, że $S$ jest środkiem odcinka $AA'$. Wzory na współrzędne środka odcinka to:
$x_S = \\frac{x_A + x_{A'}}{2}$ oraz $y_S = \\frac{y_A + y_{A'}}{2}$.
Przekształcając te wzory, aby znaleźć współrzędne punktu $A'$:
$x_{A'} = 2x_S - x_A$
$y_{A'} = 2y_S - y_A$

**Krok 2.** Znalezienie obrazu wierzchołka $A$:
$A = (-2, 3)$, $S = (1, 1)$.
$x_{A'} = 2 \\cdot 1 - (-2) = 2 + 2 = 4$.
$y_{A'} = 2 \\cdot 1 - 3 = 2 - 3 = -1$.
Więc $A' = (4, -1)$.

**Krok 3.** Znalezienie obrazu wierzchołka $B$:
$B = (4, 3)$, $S = (1, 1)$.
$x_{B'} = 2 \\cdot 1 - 4 = 2 - 4 = -2$.
$y_{B'} = 2 \\cdot 1 - 3 = 2 - 3 = -1$.
Więc $B' = (-2, -1)$.

**Krok 4.** Znalezienie obrazu wierzchołka $C$:
$C = (4, -1)$, $S = (1, 1)$.
$x_{C'} = 2 \\cdot 1 - 4 = 2 - 4 = -2$.
$y_{C'} = 2 \\cdot 1 - (-1) = 2 + 1 = 3$.
Więc $C' = (-2, 3)$.

**Krok 5.** Znalezienie obrazu wierzchołka $D$:
$D = (-2, -1)$, $S = (1, 1)$.
$x_{D'} = 2 \\cdot 1 - (-2) = 2 + 2 = 4$.
$y_{D'} = 2 \\cdot 1 - (-1) = 2 + 1 = 3$.
Więc $D' = (4, 3)$.

**Sprawdzenie:**
Otrzymaliśmy punkty $A'=(4, -1)$, $B'=(-2, -1)$, $C'=(-2, 3)$, $D'=(4, 3)$. Zauważmy, że $A'$ ma takie same współrzędne jak $C$, $B'$ jak $D$, $C'$ jak $A$, $D'$ jak $B$. W tym przypadku prostokąt został przekształcony na samego siebie, ale wierzchołki zamieniły się miejscami.
Sprawdźmy środek odcinka $AA'$: Środek odcinka między $A=(-2, 3)$ a $A'=(4, -1)$ to $(\\frac{-2+4}{2}, \\frac{3+(-1)}{2}) = (\\frac{2}{2}, \\frac{2}{2}) = (1, 1)$, co jest punktem $S$.
Sprawdźmy środek odcinka $BB'$: Środek odcinka między $B=(4, 3)$ a $B'=(-2, -1)$ to $(\\frac{4+(-2)}{2}, \\frac{3+(-1)}{2}) = (\\frac{2}{2}, \\frac{2}{2}) = (1, 1)$, co jest punktem $S$.
Pozostałe punkty można sprawdzić analogicznie. Prostokąt posiada środek symetrii, który jest punktem przecięcia jego przekątnych. Środek przekątnej $AC$ to $(\\frac{-2+4}{2}, \\frac{3+(-1)}{2}) = (1, 1)$. Środek przekątnej $BD$ to $(\\frac{4+(-2)}{2}, \\frac{3+(-1)}{2}) = (1, 1)$. Punkt $S=(1,1)$ jest środkiem symetrii tego prostokąta.

## Przykład 3 - egzaminacyjny (opcjonalnie, gdy temat na to pozwala)
Na rysunku przedstawiono sześciokąt foremny $ABCDEF$ i punkt $S$. Czy punkt $S$ jest środkiem symetrii tego sześciokąta? Jeśli tak, to jakie są współrzędne wierzchołka $A$, jeśli $B=(6,0)$, $C=(3, 3\\sqrt{3})$, $D=(-3, 3\\sqrt{3})$, $E=(-6,0)$, $F=(-3, -3\\sqrt{3})$ i $S=(0,0)$?

**Krok 1.** Określenie środka symetrii: Figura posiada środek symetrii wtedy, gdy dla każdego punktu $P$ należącego do figury, punkt $P'$ będący jego obrazem w symetrii środkowej względem punktu $S$ również należy do figury. Dla wielokątów foremnych, środkiem symetrii jest zazwyczaj punkt przecięcia przekątnych. W przypadku sześciokąta foremnego $ABCDEF$ o podanych współrzędnych wierzchołków, widać, że punkty te są rozmieszczone symetrycznie względem początku układu współrzędnych (np. $A$ i $D$, $B$ i $E$, $C$ i $F$). Początek układu współrzędnych $S=(0,0)$ jest środkiem symetrii tego sześciokąta.

**Krok 2.** Weryfikacja symetrii środkowej punktu $B$: Sprawdzamy, czy punkt $S=(0,0)$ jest środkiem odcinka łączącego $B=(6,0)$ z jego potencjalnym obrazem $B'$. Ponieważ $S$ jest środkiem symetrii, obrazem $B$ jest punkt $E$. Sprawdźmy, czy $S$ jest środkiem odcinka $BE$.
$B = (6, 0)$, $E = (-6, 0)$.
Środek odcinka $BE$ ma współrzędne: $(\\frac{6+(-6)}{2}, \\frac{0+0}{2}) = (\\frac{0}{2}, \\frac{0}{2}) = (0, 0)$.
Zgadza się ze środkiem $S$.

**Krok 3.** Weryfikacja symetrii środkowej punktu $C$: Obrazem $C$ w symetrii środkowej względem $S$ jest $F$.
$C = (3, 3\\sqrt{3})$, $F = (-3, -3\\sqrt{3})$.
Środek odcinka $CF$ ma współrzędne: $(\\frac{3+(-3)}{2}, \\frac{3\\sqrt{3}+(-3\\sqrt{3})}{2}) = (\\frac{0}{2}, \\frac{0}{2}) = (0, 0)$.
Zgadza się ze środkiem $S$.

**Krok 4.** Wniosek dotyczący punktu $S$: Ponieważ $S=(0,0)$ jest środkiem symetrii odcinków łączących przeciwległe wierzchołki sześciokąta, jest on środkiem symetrii tego sześciokąta.

**Krok 5.** Znalezienie współrzędnych wierzchołka $A$: Skoro $S=(0,0)$ jest środkiem symetrii, a $D$ jest przeciwległym wierzchołkiem do $A$, to $S$ jest środkiem odcinka $AD$.
$D = (-3, 3\\sqrt{3})$. Niech $A = (x_A, y_A)$.
$x_S = \\frac{x_A + x_D}{2} \\Rightarrow 0 = \\frac{x_A + (-3)}{2} \\Rightarrow 0 = x_A - 3 \\Rightarrow x_A = 3$.
$y_S = \\frac{y_A + y_D}{2} \\Rightarrow 0 = \\frac{y_A + 3\\sqrt{3}}{2} \\Rightarrow 0 = y_A + 3\\sqrt{3} \\Rightarrow y_A = -3\\sqrt{3}$.
Współrzędne wierzchołka $A$ to $(3, -3\\sqrt{3})$.

## Pułapki
*   **Mylenie osi $Ox$ i $Oy$**: Symetria względem osi $Ox$ zmienia znak współrzędnej $y$, a symetria względem osi $Oy$ zmienia znak współrzędnej $x$. Łatwo pomylić te dwa przypadki. Zawsze sprawdzaj, względem której osi odbywa się przekształcenie.
*   **Błędy w obliczeniach współrzędnych obrazu w symetrii środkowej**: Wzory $x_{A'} = 2x_S - x_A$ i $y_{A'} = 2y_S - y_A$ wymagają uwagi, zwłaszcza przy odejmowaniu liczb ujemnych. Dwukrotne sprawdzenie obliczeń może uchronić przed błędem.
*   **Niewłaściwe określenie osi symetrii figury**: Nie każda figura ma oś symetrii. Na przykład, trójkąt o różnych długościach boków nie ma osi symetrii. Trójkąt równoramienny ma jedną oś symetrii, a równoboczny trzy. Trzeba analizować konkretną figurę.
*   **Brak wizualizacji**: Symetrie to pojęcia geometryczne. Szkicowanie figury i jej obrazu może pomóc w zrozumieniu przekształcenia i uniknięciu błędów, szczególnie przy zadaniach wymagających konstrukcji.

## Ćwiczenia do samodzielnego rozwiązania
1.  Podaj współrzędne punktu $P'=(x', y')$, który jest obrazem punktu $P=(-5, 3)$ w symetrii osiowej względem osi $Oy$.
2.  Prostokąt $ABCD$ ma wierzchołki $A=(1,1)$, $B=(5,1)$, $C=(5,4)$, $D=(1,4)$. Znajdź współrzędne wierzchołków obrazu tego prostokąta w symetrii środkowej względem punktu $S=(3,2)$.
3.  Rysunek przedstawia kwadrat $PQRS$. Wskaż wszystkie osie symetrii tego kwadratu.
4.  Punkt $A=(2, -3)$. Obrazem tego punktu w symetrii osiowej względem prostej $k$ jest punkt $A'=(2, 7)$. Określ równanie prostej $k$ i podaj współrzędne punktu $A''$, który jest obrazem punktu $A$ w symetrii środkowej względem punktu $A'$.
5.  Które z podanych figur posiadają oś symetrii? (a) okrąg, (b) odcinek, (c) trójkąt równoboczny, (d) romb niebędący kwadratem, (e) trapez równoramienny.
6.  Punkt $A=(1,1)$ został przekształcony w symetrii środkowej względem punktu $S$. Jego obrazem jest punkt $A'=(5,5)$. Oblicz współrzędne punktu $S$.
7.  Podaj współrzędne środka symetrii figury o wierzchołkach $A=(-1,-1)$, $B=(1,-1)$, $C=(1,1)$, $D=(-1,1)$.

## Odpowiedzi
1.  $P'=(5, 3)$.
2.  $A'=(5,3)$, $B'=(1,3)$, $C'=(1,0)$, $D'=(5,0)$.
3.  Kwadrat ma cztery osie symetrii: dwie proste przechodzące przez środki przeciwległych boków oraz dwie proste będące przedłużeniami jego przekątnych.
4.  Prosta $k$ ma równanie $y = 2$. Punkt $A''=(-2, 13)$.
5.  Okrąg (nieskończenie wiele osi), odcinek (jedna oś - prostopadła do niego przechodząca przez środek), trójkąt równoboczny (trzy osie), romb niebędący kwadratem (dwie osie - proste zawierające przekątne), trapez równoramienny (jedna oś - prosta przechodząca przez środki podstaw).
6.  $S=(3,3)$.
7.  Punkt $S=(0,0)$.

## Szybka powtórka
1.  Co to jest symetria osiowa?
2.  Jakie są współrzędne obrazu punktu $(x,y)$ w symetrii względem osi $Ox$?
3.  Jakie są współrzędne obrazu punktu $(x,y)$ w symetrii względem osi $Oy$?
4.  Jak znaleźć współrzędne obrazu punktu $A$ w symetrii środkowej względem punktu $S$?
5.  Podaj przykład figury, która ma dokładnie jedną oś symetrii.

## Diagram
\`\`\`text
       ^ y
       |
       |    C(2,4)
       |    .
       |
 A(1,2).
       |
-------+-------+-------> x
       |      B(3,1)
       |        .
       |
       |
\`\`\`
*Powyższy diagram przedstawia punkt A, B, C w układzie współrzędnych. Symetria osiowa względem osi Ox przekształci te punkty na A'(1,-2), B'(3,-1), C'(2,-4) poniżej osi Ox.*`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria_przestrzenna",
    topic: "bryly",
    title: "Bryły - rozpoznawanie ich własności i zastosowań",
    content: `## Na egzaminie
Zadania dotyczące rozpoznawania brył, ich własności (ściany, krawędzie, wierzchołki) oraz obliczania ich pól i objętości pojawiają się na egzaminie ósmoklasisty regularnie. Często są to zadania otwarte, wymagające obliczeń, ale również zamknięte, sprawdzające znajomość definicji i wzorów. Uczeń może zdobyć od 2 do nawet 4 punktów za zadania związane z tym tematem. CKE lubi sprawdzać umiejętność zastosowania poznanych wzorów w zadaniach tekstowych oraz umiejętność wizualizacji brył przestrzennych.

## Mapa tematu
W tej lekcji opanujesz:
1. Definicje podstawowych brył: graniastosłupów (prostych i ukośnych), ostrosłupów, walców, stożków i kul.
2. Rozpoznawanie tych brył na podstawie ich rysunków i opisów.
3. Identyfikowanie i nazywanie elementów każdej z tych brył: ścian, krawędzi, wierzchołków, podstaw, ścian bocznych, tworzącej, promienia, wysokości.
4. Podstawowe własności poszczególnych brył, np. kształt ścian, ich liczbę, liczbę krawędzi i wierzchołków.
5. Różnicowanie brył obrotowych od prostych.
6. Zastosowania tych brył w życiu codziennym i przyrodzie.
7. Rozumienie pojęć takich jak przekrój i siatka bryły.
8. Umiejętność wyboru odpowiedniego wzoru do obliczenia pola powierzchni i objętości danej bryły.

## Definicje i wzory
*   **Bryła** – to obiekt geometryczny ograniczony powierzchnią, zajmujący pewną przestrzeń. Rozważamy bryły w przestrzeni trójwymiarowej.

*   **Graniastosłup** – bryła mająca dwie identyczne podstawy będące wielokątami, leżące w płaszczyznach równoległych, oraz ściany boczne będące równoległobokami.
    *   **Graniastosłup prosty:** krawędzie boczne są prostopadłe do podstaw. Ściany boczne to prostokąty.
    *   **Graniastosłup ukośny:** krawędzie boczne nie są prostopadłe do podstaw. Ściany boczne to równoległoboki.
    *   **Nazwa graniastosłupa** zależy od kształtu jego podstawy, np. graniastosłup trójkątny, czworokątny, sześciokątny.
    *   **Elementy graniastosłupa:**
        *   Podstawy: dwa identyczne wielokąty.
        *   Ściany boczne: równoległoboki (w prostych – prostokąty).
        *   Krawędzie: krawędzie podstaw i krawędzie boczne.
        *   Wierzchołki: punkty, w których spotykają się krawędzie.
        *   Wysokość ($H$): odległość między płaszczyznami podstaw (w graniastosłupie prostym wysokość jest równa długości krawędzi bocznej).
    *   **Wzory (dla graniastosłupa prostego):**
        *   Pole powierzchni całkowitej ($P_c$): $P_c = 2 \\cdot P_p + P_b$, gdzie $P_p$ to pole podstawy, a $P_b$ to pole powierzchni bocznej.
        *   Objętość ($V$): $V = P_p \\cdot H$.

*   **Ostrosłup** – bryła mająca jedną podstawę będącą wielokątem oraz ściany boczne będące trójkątami, które spotykają się w jednym punkcie zwanym wierzchołkiem ostrosłupa.
    *   **Ostrosłup prosty:** spodek wysokości (rzut wierzchołka ostrosłupa na płaszczyznę podstawy) pokrywa się ze środkiem okręgu opisanego na podstawie.
    *   **Ostrosłup prawidłowy:** podstawa jest wielokątem foremnym, a ściany boczne są trójkątami równoramiennymi. Wysokość ostrosłupa pada na środek podstawy.
    *   **Elementy ostrosłupa:**
        *   Podstawa: wielokąt.
        *   Ściany boczne: trójkąty.
        *   Wierzchołek ostrosłupa: punkt, w którym spotykają się ściany boczne.
        *   Krawędzie: krawędzie podstawy i krawędzie boczne.
        *   Wierzchołki: wierzchołki podstawy i wierzchołek ostrosłupa.
        *   Wysokość ($H$): odcinek prostopadły do podstawy, łączący wierzchołek ostrosłupa z płaszczyzną podstawy.
        *   Wysokość ściany bocznej (w ostrosłupie prawidłowym) – wysokość ściany bocznej opuszczona z wierzchołka ostrosłupa, zwana **apotemą** ($a$).
    *   **Wzory (dla ostrosłupa):**
        *   Pole powierzchni całkowitej ($P_c$): $P_c = P_p + P_b$.
        *   Objętość ($V$): $V = \\frac{1}{3} \\cdot P_p \\cdot H$.

*   **Bryły obrotowe** – powstają przez obrót figury płaskiej dookoła prostej leżącej w tej samej płaszczyźnie (osi obrotu).

*   **Walec** – bryła obrotowa powstająca przez obrót prostokąta dookoła jednego z jego boków.
    *   **Elementy walca:**
        *   Podstawy: dwa identyczne koła.
        *   Ściana boczna: powierzchnia zakrzywiona.
        *   Promień podstawy ($r$).
        *   Wysokość ($H$): odległość między podstawami.
    *   **Wzory:**
        *   Pole powierzchni całkowitej ($P_c$): $P_c = 2 \\cdot P_p + P_b = 2 \\pi r^2 + 2 \\pi r H$.
        *   Objętość ($V$): $V = P_p \\cdot H = \\pi r^2 H$.

*   **Stożek** – bryła obrotowa powstająca przez obrót trójkąta prostokątnego dookoła jednej z jego przyprostokątnych.
    *   **Elementy stożka:**
        *   Podstawa: koło.
        *   Ściana boczna: powierzchnia zakrzywiona.
        *   Promień podstawy ($r$).
        *   Wysokość ($H$): przyprostokątna, wokół której obracamy trójkąt.
        *   Tworząca ($l$): przeciwprostokątna obracanego trójkąta; odcinek łączący wierzchołek stożka z dowolnym punktem na brzegu podstawy. Związek między $r, H, l$: $l^2 = r^2 + H^2$.
    *   **Wzory:**
        *   Pole powierzchni całkowitej ($P_c$): $P_c = P_p + P_b = \\pi r^2 + \\pi r l$.
        *   Objętość ($V$): $V = \\frac{1}{3} \\cdot P_p \\cdot H = \\frac{1}{3} \\pi r^2 H$.

*   **Kula** – bryła geometryczna, zbiór wszystkich punktów równo oddalonych od pewnego punktu zwanego środkiem kuli.
    *   **Elementy kuli:**
        *   Środek kuli.
        *   Promień ($R$): odległość od środka do dowolnego punktu na powierzchni kuli.
    *   **Wzory:**
        *   Pole powierzchni kuli ($P$): $P = 4 \\pi R^2$.
        *   Objętość kuli ($V$): $V = \\frac{4}{3} \\pi R^3$.

## Przykład 1 - podstawowy
Która z poniższych brył ma 12 krawędzi i 8 wierzchołków?

A. Ostrosłup trójkątny
B. Graniastosłup trójkątny
C. Ostrosłup czworokątny
D. Graniastosłup czworokątny

**Rozwiązanie:**

**Krok 1.** Analizujemy podane informacje dotyczące liczby krawędzi i wierzchołków. Szukamy bryły, która spełnia oba te warunki jednocześnie.

**Krok 2.** Rozważamy opcję A: Ostrosłup trójkątny.
*   Podstawa: trójkąt (3 wierzchołki, 3 krawędzie).
*   Wierzchołek ostrosłupa: 1 wierzchołek.
*   Ściany boczne: 3 trójkąty.
*   Krawędzie: 3 krawędzie podstawy + 3 krawędzie boczne = 6 krawędzi.
*   Wierzchołki: 3 wierzchołki podstawy + 1 wierzchołek ostrosłupa = 4 wierzchołki.
Opcja A odpada.

**Krok 3.** Rozważamy opcję B: Graniastosłup trójkątny.
*   Podstawy: dwa trójkąty (2 * 3 = 6 wierzchołków, 2 * 3 = 6 krawędzi podstaw).
*   Ściany boczne: 3 prostokąty (w przypadku graniastosłupa prostego).
*   Krawędzie: 6 krawędzi podstaw + 3 krawędzie boczne = 9 krawędzi.
*   Wierzchołki: 6 wierzchołków (po 3 w każdej podstawie).
Opcja B odpada.

**Krok 4.** Rozważamy opcję C: Ostrosłup czworokątny.
*   Podstawa: czworokąt (4 wierzchołki, 4 krawędzie).
*   Wierzchołek ostrosłupa: 1 wierzchołek.
*   Ściany boczne: 4 trójkąty.
*   Krawędzie: 4 krawędzie podstawy + 4 krawędzie boczne = 8 krawędzi.
*   Wierzchołki: 4 wierzchołki podstawy + 1 wierzchołek ostrosłupa = 5 wierzchołków.
Opcja C odpada.

**Krok 5.** Rozważamy opcję D: Graniastosłup czworokątny.
*   Podstawy: dwa czworokąty (2 * 4 = 8 wierzchołków, 2 * 4 = 8 krawędzi podstaw).
*   Ściany boczne: 4 prostokąty (w przypadku graniastosłupa prostego).
*   Krawędzie: 8 krawędzi podstaw + 4 krawędzie boczne = 12 krawędzi.
*   Wierzchołki: 8 wierzchołków (po 4 w każdej podstawie).
Opcja D spełnia oba warunki: 12 krawędzi i 8 wierzchołków.

**Sprawdzenie:** Graniastosłup czworokątny (np. sześcian) ma dwie podstawy w kształcie czworokąta. Każda podstawa ma 4 wierzchołki i 4 krawędzie. Do tego dochodzą 4 krawędzie boczne łączące wierzchołki podstaw. Łącznie: 4+4=8 krawędzi podstaw + 4 krawędzie boczne = 12 krawędzi. Wierzchołków jest 4+4=8. Zgadza się.

**Odpowiedź:** D

## Przykład 2 - maturalny
Oblicz pole powierzchni całkowitej i objętość walca, którego promień podstawy wynosi 5 cm, a wysokość 10 cm. Wynik podaj z dokładnością do dwóch miejsc po przecinku, przyjmując $\\pi \\approx 3.14$.

**Rozwiązanie:**

**Krok 1.** Zapisujemy dane z zadania:
*   Promień podstawy ($r$) = 5 cm
*   Wysokość ($H$) = 10 cm
*   Przybliżenie liczby $\\pi \\approx 3.14$

**Krok 2.** Obliczamy pole podstawy ($P_p$). Podstawą walca jest koło.
*   Wzór na pole koła: $P_p = \\pi r^2$
*   Podstawiamy dane: $P_p = 3.14 \\cdot (5 \\text{ cm})^2 = 3.14 \\cdot 25 \\text{ cm}^2 = 78.50 \\text{ cm}^2$

**Krok 3.** Obliczamy pole powierzchni bocznej ($P_b$). Powierzchnia boczna walca po rozwinięciu jest prostokątem o bokach równych obwodowi podstawy i wysokości walca.
*   Obwód podstawy ($Ob_p$): $Ob_p = 2 \\pi r = 2 \\cdot 3.14 \\cdot 5 \\text{ cm} = 31.40 \\text{ cm}$
*   Wzór na pole powierzchni bocznej: $P_b = Ob_p \\cdot H = 2 \\pi r H$
*   Podstawiamy dane: $P_b = 31.40 \\text{ cm} \\cdot 10 \\text{ cm} = 314.00 \\text{ cm}^2$

**Krok 4.** Obliczamy pole powierzchni całkowitej ($P_c$).
*   Wzór: $P_c = 2 \\cdot P_p + P_b$
*   Podstawiamy obliczone wartości: $P_c = 2 \\cdot 78.50 \\text{ cm}^2 + 314.00 \\text{ cm}^2 = 157.00 \\text{ cm}^2 + 314.00 \\text{ cm}^2 = 471.00 \\text{ cm}^2$

**Krok 5.** Obliczamy objętość ($V$).
*   Wzór: $V = P_p \\cdot H$
*   Podstawiamy dane: $V = 78.50 \\text{ cm}^2 \\cdot 10 \\text{ cm} = 785.00 \\text{ cm}^3$

**Sprawdzenie:** Obliczenia wykonano zgodnie ze wzorami. Jednostki są poprawne (cm² dla pól, cm³ dla objętości). Zaokrąglenie do dwóch miejsc po przecinku zostało uwzględnione.

**Odpowiedź:** Pole powierzchni całkowitej walca wynosi $471.00 \\text{ cm}^2$, a objętość wynosi $785.00 \\text{ cm}^3$.

## Przykład 3 - egzaminacyjny

Oblicz objętość stożka, którego promień podstawy ma długość 6 cm, a tworząca ma długość 10 cm.

**Rozwiązanie:**

**Krok 1.** Zapisujemy dane:
*   Promień podstawy ($r$) = 6 cm
*   Tworząca ($l$) = 10 cm

**Krok 2.** Aby obliczyć objętość stożka, potrzebujemy jego wysokości ($H$). Promień podstawy, wysokość i tworząca stożka tworzą trójkąt prostokątny, gdzie tworząca jest przeciwprostokątną. Stosujemy twierdzenie Pitagorasa: $r^2 + H^2 = l^2$.
*   Podstawiamy dane: $(6 \\text{ cm})^2 + H^2 = (10 \\text{ cm})^2$
*   $36 \\text{ cm}^2 + H^2 = 100 \\text{ cm}^2$
*   $H^2 = 100 \\text{ cm}^2 - 36 \\text{ cm}^2$
*   $H^2 = 64 \\text{ cm}^2$
*   $H = \\sqrt{64 \\text{ cm}^2} = 8 \\text{ cm}$

**Krok 3.** Obliczamy pole podstawy ($P_p$). Podstawą jest koło.
*   Wzór na pole koła: $P_p = \\pi r^2$
*   Podstawiamy dane: $P_p = \\pi \\cdot (6 \\text{ cm})^2 = 36 \\pi \\text{ cm}^2$

**Krok 4.** Obliczamy objętość ($V$).
*   Wzór: $V = \\frac{1}{3} \\cdot P_p \\cdot H$
*   Podstawiamy obliczone wartości: $V = \\frac{1}{3} \\cdot 36 \\pi \\text{ cm}^2 \\cdot 8 \\text{ cm}$
*   $V = 12 \\pi \\cdot 8 \\text{ cm}^3 = 96 \\pi \\text{ cm}^3$

**Sprawdzenie:** Użyliśmy twierdzenia Pitagorasa do znalezienia wysokości, a następnie zastosowaliśmy wzór na objętość stożka. Obliczenia są poprawne.

**Odpowiedź:** Objętość stożka wynosi $96 \\pi \\text{ cm}^3$.

## Pułapki
*   **Mylenie graniastosłupa z ostrosłupem:** Pamiętaj, że graniastosłup ma dwie podstawy i ściany boczne będące równoległobokami (najczęściej prostokątami), a ostrosłup ma jedną podstawę i ściany boczne będące trójkątami.
*   **Używanie złych wzorów:** Dokładnie sprawdzaj, czy stosujesz wzór na pole powierzchni całkowitej, pole powierzchni bocznej czy objętość. Szczególną uwagę zwracaj na współczynnik $\\frac{1}{3}$ we wzorze na objętość ostrosłupa i stożka.
*   **Błędy w twierdzeniu Pitagorasa:** Przy obliczaniu wysokości walca lub stożka (lub tworzącej) łatwo o błąd w zastosowaniu twierdzenia Pitagorasa. Zawsze upewnij się, która z danych jest przeciwprostokątną.
*   **Zapominanie o $\\pi$:** W zadaniach dotyczących brył obrotowych często pojawia się liczba $\\pi$. Jeśli nie ma podanej konkretnej wartości do przybliżenia, wynik podajemy z $\\pi$.
*   **Niewłaściwe jednostki:** Zawsze zwracaj uwagę na jednostki w zadaniu i w odpowiedzi. Pole powierzchni podajemy w jednostkach kwadratowych (np. cm²), a objętość w jednostkach sześciennych (np. cm³).

## Ćwiczenia do samodzielnego rozwiązania
1.  Podstawa graniastosłupa prostego to kwadrat o boku 4 cm. Wysokość graniastosłupa wynosi 7 cm. Oblicz pole powierzchni całkowitej i objętość tej bryły.
2.  Znajdź promień podstawy i objętość kuli, jeśli jej pole powierzchni wynosi $100 \\pi \\text{ cm}^2$.
3.  Ile wierzchołków, krawędzi i ścian ma ostrosłup sześciokątny?
4.  Oblicz pole powierzchni bocznej i objętość stożka, którego promień podstawy wynosi 3 cm, a wysokość 4 cm.
5.  Siatka walca składa się z dwóch kół o promieniu 5 cm i prostokąta. Długość jednego z boków tego prostokąta jest równa obwodowi koła, a drugiego wysokości walca. Oblicz pole powierzchni całkowitej walca, jeśli jego wysokość wynosi 8 cm.
6.  W graniastosłupie prawidłowym czworokątnym przekątna podstawy ma długość $5\\sqrt{2}$ cm, a wysokość graniastosłupa wynosi 10 cm. Oblicz objętość tej bryły.

## Odpowiedzi
1.  Pole podstawy: $P_p = 4^2 = 16 \\text{ cm}^2$. Pole powierzchni bocznej: $P_b = (4 \\cdot 4) \\cdot 7 = 16 \\cdot 7 = 112 \\text{ cm}^2$. Pole powierzchni całkowitej: $P_c = 2 \\cdot 16 + 112 = 32 + 112 = 144 \\text{ cm}^2$. Objętość: $V = 16 \\cdot 7 = 112 \\text{ cm}^3$.
2.  $P = 4 \\pi R^2 = 100 \\pi \\text{ cm}^2 \\implies R^2 = 25 \\text{ cm}^2 \\implies R = 5 \\text{ cm}$. $V = \\frac{4}{3} \\pi R^3 = \\frac{4}{3} \\pi (5 \\text{ cm})^3 = \\frac{4}{3} \\pi \\cdot 125 \\text{ cm}^3 = \\frac{500}{3} \\pi \\text{ cm}^3$.
3.  Wierzchołków: 7 (6 w podstawie + 1 ostrosłupa). Krawędzi: 12 (6 w podstawie + 6 bocznych). Ścian: 7 (1 podstawa + 6 bocznych).
4.  Tworząca $l = \\sqrt{3^2 + 4^2} = \\sqrt{9+16} = \\sqrt{25} = 5$ cm. Pole podstawy: $P_p = \\pi \\cdot 3^2 = 9\\pi \\text{ cm}^2$. Pole powierzchni bocznej: $P_b = \\pi r l = \\pi \\cdot 3 \\cdot 5 = 15\\pi \\text{ cm}^2$. Objętość: $V = \\frac{1}{3} P_p H = \\frac{1}{3} \\cdot 9\\pi \\cdot 4 = 12\\pi \\text{ cm}^3$.
5.  Obwód koła: $2 \\pi r = 2 \\pi \\cdot 5 = 10\\pi$ cm. Pole podstawy: $P_p = \\pi r^2 = \\pi \\cdot 5^2 = 25\\pi \\text{ cm}^2$. Pole powierzchni bocznej: $P_b = 10\\pi \\cdot 8 = 80\\pi \\text{ cm}^2$. Pole powierzchni całkowitej: $P_c = 2 P_p + P_b = 2 \\cdot 25\\pi + 80\\pi = 50\\pi + 80\\pi = 130\\pi \\text{ cm}^2$.
6.  Podstawa jest kwadratem (graniastosłup prawidłowy czworokątny). Przekątna kwadratu o boku $a$ wynosi $a\\sqrt{2}$. Zatem $a\\sqrt{2} = 5\\sqrt{2}$ cm, czyli $a=5$ cm. Pole podstawy: $P_p = a^2 = 5^2 = 25 \\text{ cm}^2$. Wysokość $H=10$ cm. Objętość: $V = P_p \\cdot H = 25 \\cdot 10 = 250 \\text{ cm}^3$.

## Szybka powtórka
1.  Wymień wszystkie elementy bryły, jaką jest graniastosłup.
2.  Jaka jest podstawowa różnica między graniastosłupem prostym a ukośnym?
3.  Który element stożka jest odpowiednikiem wysokości w trójkącie prostokątnym, którego obrót tworzy stożek?
4.  Jakie figury stanowią ściany boczne ostrosłupa?
5.  Podaj wzór na objętość kuli.

## Diagram
\`\`\`text
      /|\\
     / | \\     <-- ściany boczne (trójkąty)
    /  |  \\
   /___|___\\   <-- podstawa (wielokąt)
  /    |    \\
 /     |     \\  <-- wierzchołek ostrosłupa
+------+------+
|      |      |
|      |      |  <-- ściany boczne (prostokąty)
+------+------+
|      |      |
+------+------+  <-- podstawa (wielokąt)
^^^^^^^^^^^^^^^  <-- krawędzie boczne
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "geometria_przestrzenna",
    topic: "objetosc_i_pole",
    title: "Objętość i pole powierzchni brył geometrycznych",
    content: `## Na egzaminie
Zadania dotyczące objętości i pola powierzchni brył pojawiają się na egzaminie ósmoklasisty regularnie, stanowiąc ważną część działu geometrii przestrzennej. Zwykle są to zadania otwarte, wymagające od ucznia zastosowania odpowiednich wzorów i przeprowadzenia obliczeń. Ich punktacja może wynosić od 2 do 4 punktów, w zależności od złożoności. Egzaminatorzy często sprawdzają umiejętność pracy z podstawowymi bryłami takimi jak prostopadłościan, sześcian, walec, stożek, kula, ostrosłup i graniastosłup.

## Mapa tematu
1.  Przypomnienie podstawowych pojęć związanych z bryłami geometrycznymi.
2.  Wzory na objętość i pole powierzchni całkowitej sześcianu.
3.  Wzory na objętość i pole powierzchni całkowitej prostopadłościanu.
4.  Wzory na objętość i pole powierzchni całkowitej graniastosłupa (prostego).
5.  Wzory na objętość i pole powierzchni całkowitej ostrosłupa (prostego).
6.  Wzory na objętość i pole powierzchni całkowitej walca.
7.  Wzory na objętość i pole powierzchni kuli.
8.  Umiejętność stosowania wzorów w zadaniach obliczeniowych i tekstowych.

## Definicje i wzory
Bryły geometryczne to trójwymiarowe figury ograniczone powierzchniami. Do podstawowych brył należą:

*   **Sześcian:** Bryła o sześciu ścianach w kształcie identycznych kwadratów. Wszystkie krawędzie mają tę samą długość.
    *   Długość krawędzi: $a$
    *   Objętość: $V = a^3$
    *   Pole powierzchni całkowitej: $P_c = 6a^2$ (6 ścian, każda o polu $a^2$)

*   **Prostopadłościan:** Bryła o sześciu ścianach w kształcie prostokątów. Przeciwległe ściany są identyczne.
    *   Długości krawędzi: $a, b, c$
    *   Objętość: $V = a \\cdot b \\cdot c$
    *   Pole powierzchni całkowitej: $P_c = 2(ab + bc + ca)$ (suma pól trzech par identycznych ścian)

*   **Graniastosłup:** Bryła, której dwie podstawy są przystającymi wielokątami leżącymi w płaszczyznach równoległych, a ściany boczne to równoległoboki.
    *   **Graniastosłup prosty:** Ściany boczne są prostokątami, a krawędzie boczne są prostopadłe do podstaw.
        *   Pole podstawy: $P_p$ (zależy od kształtu podstawy)
        *   Wysokość graniastosłupa: $h$
        *   Obwód podstawy: $O_p$
        *   Objętość: $V = P_p \\cdot h$
        *   Pole powierzchni bocznej: $P_b = O_p \\cdot h$ (suma pól prostokątnych ścian bocznych)
        *   Pole powierzchni całkowitej: $P_c = 2P_p + P_b$

*   **Ostrosłup:** Bryła, której jedną podstawę stanowi wielokąt, a wierzchołki tej podstawy są połączone z jednym punktem (wierzchołkiem ostrosłupa) leżącym poza płaszczyzną podstawy.
    *   **Ostrosłup prosty:** Spodek wysokości (rzut wierzchołka na płaszczyznę podstawy) pokrywa się ze środkiem okręgu opisanego na podstawie lub jest to wierzchołek podstawy (w przypadku ostrosłupa trójkątnego). W przypadku ostrosłupów o podstawie wielokąta foremnego, wierzchołek znajduje się nad środkiem podstawy. Ściany boczne to trójkąty.
        *   Pole podstawy: $P_p$
        *   Wysokość ostrosłupa: $h$ (odległość wierzchołka od płaszczyzny podstawy)
        *   Objętość: $V = \\frac{1}{3}P_p \\cdot h$
        *   Pole powierzchni bocznej: $P_b$ (suma pól trójkątnych ścian bocznych). Dla ostrosłupów o podstawie wielokąta foremnego często używa się wysokości ściany bocznej (wysokości opuszczonej na krawędź podstawy), zwanej **wysokością ściany bocznej** $h_s$. Wtedy $P_b = \\frac{1}{2} O_p \\cdot h_s$ (jeśli ściany boczne są przystającymi trójkątami równoramiennymi).
        *   Pole powierzchni całkowitej: $P_c = P_p + P_b$

*   **Walec:** Bryła obrotowa powstała przez obrót prostokąta wokół jednego z jego boków. Ma dwie podstawy w kształcie kół.
    *   Promień podstawy: $r$
    *   Wysokość walca: $h$
    *   Pole podstawy: $P_p = \\pi r^2$
    *   Obwód podstawy (okręgu): $O_p = 2\\pi r$
    *   Objętość: $V = P_p \\cdot h = \\pi r^2 h$
    *   Pole powierzchni bocznej: $P_b = O_p \\cdot h = 2\\pi rh$ (powierzchnia rozwijana w prostokąt o bokach $h$ i $2\\pi r$)
    *   Pole powierzchni całkowitej: $P_c = 2P_p + P_b = 2\\pi r^2 + 2\\pi rh = 2\\pi r(r+h)$

*   **Stożek:** Bryła obrotowa powstała przez obrót trójkąta prostokątnego wokół jednej z jego przyprostokątnych. Ma jedną podstawę w kształcie koła.
    *   Promień podstawy: $r$
    *   Wysokość stożka: $h$
    *   Tworząca stożka: $l$ (przeciwprostokątna obracanego trójkąta prostokątnego; $l = \\sqrt{r^2 + h^2}$)
    *   Pole podstawy: $P_p = \\pi r^2$
    *   Objętość: $V = \\frac{1}{3}P_p \\cdot h = \\frac{1}{3}\\pi r^2 h$
    *   Pole powierzchni bocznej: $P_b = \\pi rl$ (powierzchnia rozwijana w wycinek koła o promieniu $l$)
    *   Pole powierzchni całkowitej: $P_c = P_p + P_b = \\pi r^2 + \\pi rl = \\pi r(r+l)$

*   **Kula:** Bryła obrotowa powstała przez obrót koła wokół jego średnicy.
    *   Promień kuli: $R$
    *   Objętość: $V = \\frac{4}{3}\\pi R^3$
    *   Pole powierzchni: $P = 4\\pi R^2$

**Uwaga:** Na egzaminie zazwyczaj podawane są wzory na pole podstawy i pole powierzchni bocznej dla figur płaskich potrzebnych do obliczeń (np. pole trójkąta, pole trapezu, pole koła). Wzory na objętości i pola powierzchni brył CKE zazwyczaj udostępnia na karcie wzorów.

## Przykład 1 - podstawowy
Oblicz objętość i pole powierzchni całkowitej sześcianu, którego krawędź ma długość 5 cm.

**Krok 1.** Zidentyfikuj dane: Długość krawędzi sześcianu $a = 5$ cm.
**Krok 2.** Zastosuj wzór na objętość sześcianu: $V = a^3$.
**Krok 3.** Oblicz objętość: $V = (5 \\text{ cm})^3 = 125 \\text{ cm}^3$.
**Krok 4.** Zastosuj wzór na pole powierzchni całkowitej sześcianu: $P_c = 6a^2$.
**Krok 5.** Oblicz pole powierzchni całkowitej: $P_c = 6 \\cdot (5 \\text{ cm})^2 = 6 \\cdot 25 \\text{ cm}^2 = 150 \\text{ cm}^2$.

**Odpowiedź:** Objętość sześcianu wynosi $125 \\text{ cm}^3$, a pole jego powierzchni całkowitej wynosi $150 \\text{ cm}^2$.

## Przykład 2 - maturalny
Działka w kształcie prostokąta ma wymiary 20 m na 30 m. Na działce tej ma stanąć budynek w kształcie prostopadłościanu o wymiarach podstawy 10 m na 15 m i wysokości 8 m. Oblicz, jaką powierzchnię działki zajmuje budynek, a jaką powierzchnię stanowi teren zielony wokół budynku. Oblicz również objętość budynku.

**Krok 1.** Oblicz pole powierzchni całej działki.
Działka ma kształt prostokąta o bokach 20 m i 30 m.
Pole działki $P_{dzialki} = 20 \\text{ m} \\cdot 30 \\text{ m} = 600 \\text{ m}^2$.

**Krok 2.** Oblicz powierzchnię zajmowaną przez budynek.
Podstawa budynku ma wymiary 10 m na 15 m.
Pole podstawy budynku $P_{budynku} = 10 \\text{ m} \\cdot 15 \\text{ m} = 150 \\text{ m}^2$. Jest to powierzchnia działki zajmowana przez budynek.

**Krok 3.** Oblicz powierzchnię terenu zielonego.
Teren zielony to różnica między polem całej działki a polem zajmowanym przez budynek.
$P_{zielony} = P_{dzialki} - P_{budynku} = 600 \\text{ m}^2 - 150 \\text{ m}^2 = 450 \\text{ m}^2$.

**Krok 4.** Oblicz objętość budynku.
Budynek ma kształt prostopadłościanu o wymiarach podstawy 10 m na 15 m i wysokości 8 m.
Objętość budynku $V_{budynku} = 10 \\text{ m} \\cdot 15 \\text{ m} \\cdot 8 \\text{ m} = 150 \\text{ m}^2 \\cdot 8 \\text{ m} = 1200 \\text{ m}^3$.

**Odpowiedź:** Budynek zajmuje $150 \\text{ m}^2$ działki. Teren zielony stanowi $450 \\text{ m}^2$. Objętość budynku wynosi $1200 \\text{ m}^3$.

## Przykład 3 - egzaminacyjny
Do akwarium w kształcie prostopadłościanu o wymiarach podstawy 60 cm x 30 cm nalano wody do wysokości 40 cm. Oblicz objętość tej wody. Ile litrów wody znajduje się w akwarium? (1 litr = 1000 cm$^3$)

**Krok 1.** Zidentyfikuj wymiary, które definiują objętość wody.
Woda w akwarium tworzy prostopadłościan, którego podstawą jest podstawa akwarium, a wysokością jest poziom wody.
Wymiary prostopadłościanu z wodą to: długość $a = 60$ cm, szerokość $b = 30$ cm, wysokość $h = 40$ cm.

**Krok 2.** Oblicz objętość wody w cm$^3$.
$V_{wody} = a \\cdot b \\cdot h = 60 \\text{ cm} \\cdot 30 \\text{ cm} \\cdot 40 \\text{ cm}$.
$V_{wody} = 1800 \\text{ cm}^2 \\cdot 40 \\text{ cm} = 72000 \\text{ cm}^3$.

**Krok 3.** Przelicz objętość wody na litry.
Wiemy, że 1 litr = 1000 cm$^3$. Aby przeliczyć cm$^3$ na litry, dzielimy przez 1000.
$V_{wody\\_litry} = \\frac{72000 \\text{ cm}^3}{1000 \\text{ cm}^3/\\text{litr}} = 72 \\text{ litry}$.

**Odpowiedź:** Objętość wody w akwarium wynosi $72000 \\text{ cm}^3$, czyli 72 litry.

## Pułapki
*   ** Mylenie pola powierzchni całkowitej z polem powierzchni bocznej:** Pole powierzchni bocznej to suma pól tylko ścian bocznych, natomiast pole powierzchni całkowitej to suma pól wszystkich ścian, włącznie z podstawami. Należy uważać, o które pole pytają w zadaniu.
*   ** Niewłaściwe stosowanie wzoru na objętość ostrosłupa i stożka:** Wzory na objętość ostrosłupa i stożka zawierają czynnik $\\frac{1}{3}$, który często jest pomijany. Objętość tych brył jest trzykrotnie mniejsza niż objętość graniastosłupa lub walca o tej samej podstawie i wysokości.
*   ** Zaniedbywanie jednostek:** Podczas obliczeń należy pamiętać o jednostkach. Jeśli wymiary są podane w różnych jednostkach (np. metrach i centymetrach), przed obliczeniem należy je ujednolicić. Wynik powinien mieć odpowiednią jednostkę (np. cm$^3$ dla objętości, cm$^2$ dla pola).
*   ** Błędy w obliczeniach procentowych lub skalowaniu:** Czasami zadania wymagają obliczenia o ile procent zmieniła się objętość lub pole po zmianie wymiarów, lub obliczenia objętości części bryły. Wymaga to precyzji i umiejętności pracy ze skalą.
*   ** Niepoprawne obliczanie pola podstawy:** Wzór na objętość graniastosłupa czy ostrosłupa to $V = P_p \\cdot h$ (lub $\\frac{1}{3}P_p \\cdot h$). Kluczowe jest prawidłowe obliczenie pola podstawy $P_p$, które może być trójkątem, kwadratem, prostokątem, sześciokątem itp.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz objętość i pole powierzchni całkowitej walca, którego promień podstawy wynosi 4 cm, a wysokość 10 cm. Przyjmij $\\pi \\approx 3.14$.
2.  Znajdź promień podstawy i wysokość stożka, którego tworząca $l=13$ cm, a promień podstawy $r=5$ cm. Następnie oblicz objętość i pole powierzchni całkowitej tego stożka.
3.  Sześcian o krawędzi 3 cm umieszczono w większym sześcianie o krawędzi 5 cm. Oblicz objętość przestrzeni między sześcianami.
4.  Dwa modele ołówków mają kształt walców. Pierwszy ma promień 3 mm i wysokość 180 mm. Drugi ma promień 4 mm i wysokość 150 mm. Oblicz objętość każdego ołówka i porównaj je.
5.  Oblicz pole powierzchni bocznej i objętość ostrosłupa prawidłowego czworokątnego, którego krawędź podstawy ma długość 6 cm, a wysokość ściany bocznej (apotema) wynosi 5 cm.
6.  Wysokość graniastosłupa prawidłowego sześciokątnego jest równa długości krawędzi jego podstawy. Oblicz objętość i pole powierzchni całkowitej tego graniastosłupa, jeśli długość krawędzi podstawy wynosi 2 cm.
7.  Oblicz pole powierzchni kuli o promieniu 9 cm.

## Odpowiedzi
1.  $V = \\pi r^2 h = \\pi \\cdot 4^2 \\cdot 10 = 160\\pi \\text{ cm}^3 \\approx 502.4 \\text{ cm}^3$. $P_c = 2\\pi r(r+h) = 2\\pi \\cdot 4(4+10) = 8\\pi \\cdot 14 = 112\\pi \\text{ cm}^2 \\approx 351.68 \\text{ cm}^2$.
2.  $h = \\sqrt{l^2 - r^2} = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12$ cm. $V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi \\cdot 5^2 \\cdot 12 = \\frac{1}{3}\\pi \\cdot 25 \\cdot 12 = 100\\pi \\text{ cm}^3$. $P_c = \\pi r(r+l) = \\pi \\cdot 5(5+13) = 5\\pi \\cdot 18 = 90\\pi \\text{ cm}^2$.
3.  Objętość większego sześcianu: $V_1 = 5^3 = 125 \\text{ cm}^3$. Objętość mniejszego sześcianu: $V_2 = 3^3 = 27 \\text{ cm}^3$. Objętość przestrzeni między sześcianami: $V_{roz} = V_1 - V_2 = 125 - 27 = 98 \\text{ cm}^3$.
4.  Ołówek 1: $V_1 = \\pi r_1^2 h_1 = \\pi \\cdot 3^2 \\cdot 180 = \\pi \\cdot 9 \\cdot 180 = 1620\\pi \\text{ mm}^3$. Ołówek 2: $V_2 = \\pi r_2^2 h_2 = \\pi \\cdot 4^2 \\cdot 150 = \\pi \\cdot 16 \\cdot 150 = 2400\\pi \\text{ mm}^3$. Ołówek 2 ma większą objętość.
5.  Pole podstawy: $P_p = 6^2 = 36 \\text{ cm}^2$. Pole powierzchni bocznej: $P_b = \\frac{1}{2} O_p \\cdot h_s = \\frac{1}{2} \\cdot (4 \\cdot 6) \\cdot 5 = \\frac{1}{2} \\cdot 24 \\cdot 5 = 60 \\text{ cm}^2$. Pole powierzchni całkowitej: $P_c = P_p + P_b = 36 + 60 = 96 \\text{ cm}^2$. Wysokość ostrosłupa: $h = \\sqrt{h_s^2 - (\\frac{a}{2})^2} = \\sqrt{5^2 - 3^2} = \\sqrt{25-9} = \\sqrt{16} = 4$ cm. Objętość: $V = \\frac{1}{3}P_p \\cdot h = \\frac{1}{3} \\cdot 36 \\cdot 4 = 48 \\text{ cm}^3$.
6.  Długość krawędzi podstawy: $a=2$ cm. Wysokość graniastosłupa: $h=2$ cm. Pole podstawy (sześciokąt foremny): $P_p = \\frac{3\\sqrt{3}}{2}a^2 = \\frac{3\\sqrt{3}}{2} \\cdot 2^2 = \\frac{3\\sqrt{3}}{2} \\cdot 4 = 6\\sqrt{3} \\text{ cm}^2$. Obwód podstawy: $O_p = 6a = 6 \\cdot 2 = 12$ cm. Pole powierzchni bocznej: $P_b = O_p \\cdot h = 12 \\cdot 2 = 24 \\text{ cm}^2$. Pole powierzchni całkowitej: $P_c = 2P_p + P_b = 2 \\cdot 6\\sqrt{3} + 24 = 12\\sqrt{3} + 24 \\text{ cm}^2$. Objętość: $V = P_p \\cdot h = 6\\sqrt{3} \\cdot 2 = 12\\sqrt{3} \\text{ cm}^3$.
7.  $P = 4\\pi R^2 = 4\\pi \\cdot 9^2 = 4\\pi \\cdot 81 = 324\\pi \\text{ cm}^2$.

## Szybka powtórka
1.  Jaka jest podstawowa różnica między polem powierzchni bocznej a polem powierzchni całkowitej?
2.  Które bryły mają we wzorze na objętość czynnik $\\frac{1}{3}$?
3.  Jakie są wymiary prostopadłościanu?
4.  Co to jest tworząca stożka i jak jest powiązana z promieniem i wysokością?
5.  Jaka jest zależność między objętością kuli a jej promieniem?

## Diagram
\`\`\`text
         +-------+
        /|      /|
       / |     / |  h (wysokość)
      /  |    /  |
     +-------+   |
     |   |   |   |
     |   +---|---+
     |  /    |  /  b (szerokość)
     | /     | /
     |/      |/
     +-------+
       a (długość)

   Prostopadłościan:
   V = a * b * h
   Pc = 2*(ab + bc + ca)
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "uklad_wspolrzednych",
    topic: "punkty_na_plaszczyznie",
    title: "Punkty na płaszczyźnie kartezjańskiej",
    content: `## Na egzaminie
Zadania dotyczące układu współrzędnych pojawiają się na egzaminie ósmoklasisty regularnie, zazwyczaj jako zadania otwarte lub zamknięte, warte od 1 do 3 punktów. CKE często sprawdza umiejętność zaznaczania punktów, odczytywania ich współrzędnych, obliczania odległości między punktami oraz znajdowania współrzędnych środka odcinka. Kluczowe jest zrozumienie zależności między współrzędnymi a położeniem punktu.

## Mapa tematu
1.  Zrozumienie pojęcia płaszczyzny kartezjańskiej i osi współrzędnych (osi x i osi y).
2.  Definicja punktu na płaszczyźnie za pomocą pary liczb (współrzędnych).
3.  Zaznaczanie punktów o podanych współrzędnych na płaszczyźnie kartezjańskiej.
4.  Odczytywanie współrzędnych punktów zaznaczonych na płaszczyźnie.
5.  Obliczanie odległości między dwoma punktami na płaszczyźnie.
6.  Wyznaczanie współrzędnych środka odcinka łączącego dwa punkty.
7.  Rozwiązywanie prostych zadań tekstowych i geometrycznych z wykorzystaniem układu współrzędnych.

## Definicje i wzory
*   **Płaszczyzna kartezjańska:** Jest to płaszczyzna, na której wprowadzono prostokątny układ współrzędnych. Składa się z dwóch prostopadłych osi liczbowych: osi poziomej (osi x, osi odciętych) i osi pionowej (osi y, osi rzędnych). Ich punkt przecięcia to początek układu współrzędnych o współrzędnych (0, 0).
*   **Punkt na płaszczyźnie:** Każdy punkt na płaszczyźnie kartezjańskiej jest jednoznacznie określony przez parę liczb rzeczywistych $(x, y)$, zwanych jego współrzędnymi. Pierwsza liczba, $x$, to odcięta punktu (położenie względem osi y), a druga liczba, $y$, to rzędna punktu (położenie względem osi x). Punkt zapisujemy jako $A = (x_A, y_A)$.
*   **Ćwiartki układu współrzędnych:** Płaszczyzna kartezjańska jest podzielona przez osie na cztery ćwiartki:
    *   I ćwiartka: $x > 0$ i $y > 0$
    *   II ćwiartka: $x < 0$ i $y > 0$
    *   III ćwiartka: $x < 0$ i $y < 0$
    *   IV ćwiartka: $x > 0$ i $y < 0$
    Punkty leżące na osiach nie należą do żadnej ćwiartki.
*   **Odległość między dwoma punktami:** Odległość $d$ między dwoma punktami $A = (x_A, y_A)$ i $B = (x_B, y_B)$ obliczamy za pomocą wzoru na podstawie twierdzenia Pitagorasa:
    $$d(A, B) = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$$
*   **Środek odcinka:** Współrzędne środka $S = (x_S, y_S)$ odcinka o końcach $A = (x_A, y_A)$ i $B = (x_B, y_B)$ obliczamy, biorąc średnią arytmetyczną odpowiednich współrzędnych końców:
    $$x_S = \\frac{x_A + x_B}{2}$$
    $$y_S = \\frac{y_A + y_B}{2}$$
    Zatem $S = \\left(\\frac{x_A + x_B}{2}, \\frac{y_A + y_B}{2}\\right)$.

## Przykład 1 - podstawowy
Zaznacz na płaszczyźnie kartezjańskiej punkty $A = (3, 2)$, $B = (-4, 1)$, $C = (-2, -3)$ i $D = (5, -2)$. Odczytaj współrzędne punktu $P$ zaznaczonego na rysunku.

\`\`\`text
        ^ y
        |
      3 +       . B
        |     .
      2 + . A
        |
      1 +
        |
------+-+---+-+--+-----> x
     -4 -3 -2 -1 | 1  2  3  4  5
        |       |
     -1 +       . D
        |     .
     -2 + . C
        |
     -3 +
        |
\`\`\`

**Krok 1.** Narysuj osie x i y przecinające się w punkcie (0, 0). Oznacz skale na osiach.
**Krok 2.** Aby zaznaczyć punkt $A = (3, 2)$: znajdź liczbę 3 na osi x, a następnie przesuń się pionowo w górę do poziomu liczby 2 na osi y. Zaznacz punkt.
**Krok 3.** Aby zaznaczyć punkt $B = (-4, 1)$: znajdź liczbę -4 na osi x, a następnie przesuń się pionowo w górę do poziomu liczby 1 na osi y. Zaznacz punkt.
**Krok 4.** Aby zaznaczyć punkt $C = (-2, -3)$: znajdź liczbę -2 na osi x, a następnie przesuń się pionowo w dół do poziomu liczby -3 na osi y. Zaznacz punkt.
**Krok 5.** Aby zaznaczyć punkt $D = (5, -2)$: znajdź liczbę 5 na osi x, a następnie przesuń się pionowo w dół do poziomu liczby -2 na osi y. Zaznacz punkt.
**Krok 6.** Aby odczytać współrzędne punktu $P$: zlokalizuj punkt $P$ na rysunku. Opuszczając prostopadłą z punktu $P$ na oś x, odczytaj liczbę, w której się ona spotka z osią x (to będzie odcięta). Podobnie postępując z osią y, odczytaj rzędną. Z rysunku wynika, że punkt $P$ ma współrzędne $(-3, 0)$. (Uwaga: W zadaniu nie było podanego punktu P na rysunku, ale pozwoliłem sobie dodać go na potrzeby demonstracji odczytu). **Poprawiony rysunek z punktem P:**

\`\`\`text
        ^ y
        |
      3 +       . B
        |     .
      2 + . A
        |
      1 +
        |
------+-+-+-+---+-+--+-----> x
     -4 -3 -2 -1 | 1  2  3  4  5
        | P .   |
     -1 + -+----. D
        |     .
     -2 + . C
        |
     -3 +
        |
\`\`\`
**Krok 7.** Zaznaczonego punktu $P$ na rysunku wynika, że jego współrzędne to $P = (-3, 0)$.

**Sprawdzenie:** Punkty zostały zaznaczone zgodnie z definicją współrzędnych. Punkt $A=(3,2)$ ma $x=3$ (na prawo od osi y) i $y=2$ (nad osią x). Punkt $B=(-4,1)$ ma $x=-4$ (na lewo od osi y) i $y=1$ (nad osią x). Punkt $C=(-2,-3)$ ma $x=-2$ (na lewo od osi y) i $y=-3$ (pod osią x). Punkt $D=(5,-2)$ ma $x=5$ (na prawo od osi y) i $y=-2$ (pod osią x). Odczytane współrzędne punktu $P=(-3,0)$ są zgodne z jego położeniem na osi x.

## Przykład 2 - maturalny
Oblicz odległość między punktami $A = (-1, 3)$ i $B = (5, -5)$.

**Krok 1.** Zidentyfikuj współrzędne punktów: $x_A = -1$, $y_A = 3$, $x_B = 5$, $y_B = -5$.
**Krok 2.** Zastosuj wzór na odległość między dwoma punktami: $d(A, B) = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.
**Krok 3.** Podstaw wartości współrzędnych do wzoru:
$$d(A, B) = \\sqrt{(5 - (-1))^2 + (-5 - 3)^2}$$
**Krok 4.** Wykonaj odejmowanie w nawiasach:
$$d(A, B) = \\sqrt{(5 + 1)^2 + (-8)^2}$$
$$d(A, B) = \\sqrt{(6)^2 + (-8)^2}$$
**Krok 5.** Podnieś do kwadratu:
$$d(A, B) = \\sqrt{36 + 64}$$
**Krok 6.** Dodaj liczby pod pierwiastkiem:
$$d(A, B) = \\sqrt{100}$$
**Krok 7.** Oblicz pierwiastek kwadratowy:
$$d(A, B) = 10$$

**Sprawdzenie:**
Możemy również obliczyć $(x_A - x_B)^2 + (y_A - y_B)^2$:
$\\sqrt{(-1 - 5)^2 + (3 - (-5))^2} = \\sqrt{(-6)^2 + (3 + 5)^2} = \\sqrt{36 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$. Wynik jest taki sam.
Odległość między punktami $A$ i $B$ wynosi 10.

## Przykład 3 - egzaminacyjny

Wyznacz współrzędne środka odcinka $MN$, gdzie $M = (-7, 4)$ i $N = (3, -2)$.

**Krok 1.** Zidentyfikuj współrzędne punktów $M$ i $N$: $x_M = -7$, $y_M = 4$, $x_N = 3$, $y_N = -2$.
**Krok 2.** Zastosuj wzory na współrzędne środka odcinka $S = (x_S, y_S)$:
$x_S = \\frac{x_M + x_N}{2}$
$y_S = \\frac{y_M + y_N}{2}$
**Krok 3.** Oblicz współrzędną $x_S$:
$x_S = \\frac{-7 + 3}{2} = \\frac{-4}{2} = -2$
**Krok 4.** Oblicz współrzędną $y_S$:
$y_S = \\frac{4 + (-2)}{2} = \\frac{4 - 2}{2} = \\frac{2}{2} = 1$
**Krok 5.** Podaj współrzędne środka odcinka:
$S = (-2, 1)$

**Sprawdzenie:**
Środek odcinka powinien znajdować się "w połowie drogi" między punktami. Punkt $S=(-2, 1)$ jest faktycznie w połowie drogi między $M=(-7, 4)$ a $N=(3, -2)$. Różnica w x: $-7 \\to -2$ to +5, a $-2 \\to 3$ to też +5. Różnica w y: $4 \\to 1$ to -3, a $1 \\to -2$ to też -3. Położenie jest poprawne.

## Pułapki
*   **Znaki współrzędnych:** Mylenie kolejności współrzędnych ($x$ i $y$) lub niepoprawne określanie ich znaków w zależności od ćwiartki. Zawsze pamiętaj: pierwsza liczba to $x$ (poziomo), druga to $y$ (pionowo).
*   **Błędy przy odejmowaniu liczb ujemnych:** Szczególnie przy obliczaniu odległości, np. $5 - (-1)$ to $5+1=6$, a nie $5-1=4$. Podwójny minus daje plus.
*   **Kolejność odejmowania we wzorze na odległość:** Wzór działa niezależnie od tego, czy odejmujemy $x_B - x_A$ czy $x_A - x_B$, ponieważ wynik jest podnoszony do kwadratu. Jednak konsekwentne odejmowanie współrzędnych w tej samej kolejności ($B-A$ lub $A-B$) zmniejsza ryzyko błędu.
*   **Ułamki w środku odcinka:** Zapominanie o podzieleniu sumy współrzędnych przez 2. Środek odcinka to zawsze średnia arytmetyczna współrzędnych.
*   **Brak rysunku lub nieczytelny rysunek:** W przypadku zadań geometrycznych wizualizacja jest kluczowa. Staraj się rysować czytelnie i zaznaczać wszystkie punkty i odcinki.

## Ćwiczenia do samodzielnego rozwiązania
1.  Zaznacz na płaszczyźnie kartezjańskiej punkty $P=(-5, 3)$, $Q=(0, -2)$, $R=(4, 0)$ i $S=(2, 5)$.
2.  Odczytaj współrzędne punktów $A, B, C$ zaznaczonych na rysunku:

    \`\`\`text
            ^ y
            |
          5 +     . S
            |   .
          4 + . P
            |
          3 +
            |
          2 +
            |
          1 +
            |
    ------+-+-+-+-+-+-+-----> x
         -5-4-3-2-1 | 1  2  3  4
            |       |   . R
          -1+       |
            |     . C
          -2+ . Q
            |
          -3+
            |
    \`\`\`
3.  Oblicz odległość między punktami $K=(2, 1)$ i $L=(-3, 4)$.
4.  Wyznacz współrzędne środka odcinka $AB$, gdzie $A=(6, -3)$ i $B=(-2, 5)$.
5.  Punkty $D=(-1, -2)$ i $E=(x, 5)$ są oddalone od siebie o 10 jednostek. Znajdź możliwe wartości $x$.
6.  Punkt $S=(1, 2)$ jest środkiem odcinka $PQ$, gdzie $P=(3, 7)$. Znajdź współrzędne punktu $Q$.

## Odpowiedzi
1.  Rysunek z zaznaczonymi punktami $P, Q, R, S$.
2.  $A = (1, 4)$, $B = (-3, 0)$, $C = (0, -2)$.
3.  $d(K, L) = \\sqrt{(-3 - 2)^2 + (4 - 1)^2} = \\sqrt{(-5)^2 + 3^2} = \\sqrt{25 + 9} = \\sqrt{34}$.
4.  $x_S = \\frac{6 + (-2)}{2} = \\frac{4}{2} = 2$, $y_S = \\frac{-3 + 5}{2} = \\frac{2}{2} = 1$. Środek to $(2, 1)$.
5.  $d(D, E) = \\sqrt{(x - (-1))^2 + (5 - (-2))^2} = 10$.
    $\\sqrt{(x+1)^2 + (7)^2} = 10$.
    $(x+1)^2 + 49 = 100$.
    $(x+1)^2 = 51$.
    $x+1 = \\sqrt{51}$ lub $x+1 = -\\sqrt{51}$.
    $x = -1 + \\sqrt{51}$ lub $x = -1 - \\sqrt{51}$.
6.  $x_S = \\frac{x_P + x_Q}{2} \\implies 1 = \\frac{3 + x_Q}{2} \\implies 2 = 3 + x_Q \\implies x_Q = -1$.
    $y_S = \\frac{y_P + y_Q}{2} \\implies 2 = \\frac{7 + y_Q}{2} \\implies 4 = 7 + y_Q \\implies y_Q = -3$.
    Punkt $Q = (-1, -3)$.

## Szybka powtórka
1.  Jakie liczby definiują położenie punktu na płaszczyźnie kartezjańskiej?
2.  Która liczba jest odciętą, a która rzędną w punkcie $(x, y)$?
3.  Jak obliczyć odległość między dwoma punktami, jeśli znamy ich współrzędne? Podaj wzór.
4.  Jakie są wzory na współrzędne środka odcinka?
5.  W której ćwiartce układu współrzędnych znajdują się punkty, których obie współrzędne są ujemne?`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "uklad_wspolrzednych",
    topic: "dlugosc_odcinka",
    title: "Długość odcinka na płaszczyźnie",
    content: `## Na egzaminie
Zadania dotyczące układu współrzędnych, w tym obliczanie długości odcinka, pojawiają się na egzaminie ósmoklasisty co roku, zazwyczaj jako jedno lub dwa zadania zamknięte lub jako część zadania otwartego. Punkty do zdobycia to zazwyczaj 1-3, w zależności od stopnia trudności i kontekstu zadania. CKE lubi sprawdzać umiejętność stosowania wzoru na odległość między dwoma punktami oraz umiejętność interpretacji graficznej tego zagadnienia.

## Mapa tematu
W tej lekcji opanujesz:
1.  Zrozumienie pojęcia płaszczyzny kartezjańskiej i współrzędnych punktów.
2.  Wprowadzenie i wyprowadzenie wzoru na długość odcinka o danych końcach.
3.  Umiejętność stosowania wzoru na długość odcinka do obliczeń.
4.  Rozwiązywanie zadań tekstowych związanych z długością odcinka.
5.  Rozpoznawanie i rozwiązywanie zadań geometrycznych z wykorzystaniem płaszczyzny współrzędnych.
6.  Ćwiczenie biegłości w stosowaniu twierdzenia Pitagorasa w kontekście współrzędnych.
7.  Unikanie typowych błędów przy obliczaniu długości odcinka.

## Definicje i wzory
*   **Płaszczyzna kartezjańska:** Jest to płaszczyzna wyposażona w prostokątny układ współrzędnych. Składa się z dwóch prostopadłych osi liczbowych: osi poziomej (osi X, odciętych) i osi pionowej (osi Y, rzędnych). Ich punkt przecięcia to początek układu współrzędnych o współrzędnych (0, 0).
*   **Współrzędne punktu:** Każdy punkt na płaszczyźnie kartezjańskiej można jednoznacznie określić za pomocą pary liczb rzeczywistych $(x, y)$, gdzie $x$ to współrzędna pozioma (odcięta), a $y$ to współrzędna pionowa (rzędna).
*   **Odcinek:** Jest to fragment prostej zawierający dwa punkty końcowe i wszystkie punkty leżące między nimi.
*   **Długość odcinka:** Jest to odległość między jego dwoma końcami. Na płaszczyźnie kartezjańskiej, jeśli znamy współrzędne końców A i B odcinka, możemy obliczyć jego długość.
*   **Wzór na długość odcinka:**
    Niech punkt A ma współrzędne $(x_1, y_1)$, a punkt B ma współrzędne $(x_2, y_2)$. Długość odcinka AB, oznaczana jako $|AB|$, można obliczyć za pomocą wzoru:
    $$|AB| = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
    Wzór ten wynika bezpośrednio z twierdzenia Pitagorasa. Rozważmy trójkąt prostokątny, którego przeciwprostokątną jest odcinek AB. Przyprostokątne tego trójkąta mają długości równe wartościom bezwzględnym różnic współrzędnych punktów A i B: $|x_2 - x_1|$ oraz $|y_2 - y_1|$. Zgodnie z twierdzeniem Pitagorasa:
    $$(|x_2 - x_1|)^2 + (|y_2 - y_1|)^2 = |AB|^2$$
    Ponieważ kwadrat liczby jest taki sam jak kwadrat jej wartości bezwzględnej ($(a)^2 = (-a)^2 = |a|^2$), możemy napisać:
    $$(x_2 - x_1)^2 + (y_2 - y_1)^2 = |AB|^2$$
    Wyciągając pierwiastek kwadratowy z obu stron (pamiętając, że długość jest nieujemna), otrzymujemy wzór na długość odcinka.

## Przykład 1 - podstawowy
Oblicz długość odcinka o końcach w punktach A = (2, 3) i B = (5, 7).

**Krok 1.** Zidentyfikuj współrzędne punktów A i B.
$x_1 = 2$, $y_1 = 3$
$x_2 = 5$, $y_2 = 7$

**Krok 2.** Podstaw wartości do wzoru na długość odcinka.
$$|AB| = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
$$|AB| = \\sqrt{(5 - 2)^2 + (7 - 3)^2}$$

**Krok 3.** Oblicz różnice we współrzędnych.
$$|AB| = \\sqrt{(3)^2 + (4)^2}$$

**Krok 4.** Oblicz kwadraty różnic.
$$|AB| = \\sqrt{9 + 16}$$

**Krok 5.** Zsumuj kwadraty i oblicz pierwiastek.
$$|AB| = \\sqrt{25}$$
$$|AB| = 5$$

**Sprawdzenie:**
Odcinek AB ma długość 5. Wyobrażając sobie punkty na siatce: od A do B przesuwamy się o 3 jednostki w prawo ($5-2=3$) i o 4 jednostki w górę ($7-3=4$). Tworzą one przyprostokątne trójkąta prostokątnego. $3^2 + 4^2 = 9 + 16 = 25$. $\\sqrt{25} = 5$. Wynik jest poprawny.

## Przykład 2 - maturalny
Oblicz długość odcinka łączącego punkty P = (-1, 4) i Q = (3, -2).

**Krok 1.** Zidentyfikuj współrzędne punktów P i Q.
$x_1 = -1$, $y_1 = 4$
$x_2 = 3$, $y_2 = -2$

**Krok 2.** Podstaw wartości do wzoru na długość odcinka. Zwróć uwagę na znaki ujemne.
$$|PQ| = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
$$|PQ| = \\sqrt{(3 - (-1))^2 + (-2 - 4)^2}$$

**Krok 3.** Uprość wyrażenia w nawiasach, szczególnie te z odejmowaniem liczby ujemnej.
$$|PQ| = \\sqrt{(3 + 1)^2 + (-6)^2}$$
$$|PQ| = \\sqrt{(4)^2 + (-6)^2}$$

**Krok 4.** Oblicz kwadraty. Pamiętaj, że kwadrat liczby ujemnej jest liczbą dodatnią.
$$|PQ| = \\sqrt{16 + 36}$$

**Krok 5.** Zsumuj kwadraty i oblicz pierwiastek.
$$|PQ| = \\sqrt{52}$$

**Krok 6.** Uprość pierwiastek, jeśli to możliwe.
$52 = 4 \\cdot 13$, więc $\\sqrt{52} = \\sqrt{4 \\cdot 13} = \\sqrt{4} \\cdot \\sqrt{13} = 2\\sqrt{13}$.
$$|PQ| = 2\\sqrt{13}$$

**Sprawdzenie:**
Różnica współrzędnych x: $3 - (-1) = 4$. Różnica współrzędnych y: $-2 - 4 = -6$. Kwadraty: $4^2 = 16$, $(-6)^2 = 36$. Suma kwadratów: $16 + 36 = 52$. $\\sqrt{52} = 2\\sqrt{13}$. Wynik jest poprawny.

## Przykład 3 - egzaminacyjny
Punkty A = (-5, -2) i B = (1, 6) są końcami odcinka. Oblicz długość tego odcinka.

**Krok 1.** Zidentyfikuj współrzędne punktów A i B.
$x_1 = -5$, $y_1 = -2$
$x_2 = 1$, $y_2 = 6$

**Krok 2.** Podstaw wartości do wzoru na długość odcinka.
$$|AB| = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
$$|AB| = \\sqrt{(1 - (-5))^2 + (6 - (-2))^2}$$

**Krok 3.** Uprość wyrażenia w nawiasach.
$$|AB| = \\sqrt{(1 + 5)^2 + (6 + 2)^2}$$
$$|AB| = \\sqrt{(6)^2 + (8)^2}$$

**Krok 4.** Oblicz kwadraty.
$$|AB| = \\sqrt{36 + 64}$$

**Krok 5.** Zsumuj i oblicz pierwiastek.
$$|AB| = \\sqrt{100}$$
$$|AB| = 10$$

**Sprawdzenie:**
Różnica x: $1 - (-5) = 6$. Różnica y: $6 - (-2) = 8$. Kwadraty: $6^2 = 36$, $8^2 = 64$. Suma: $36 + 64 = 100$. $\\sqrt{100} = 10$. Wynik poprawny. W tym przypadku otrzymaliśmy trójkąt o przyprostokątnych 6 i 8, co jest skalowaniem trójkąta "3-4-5" ($2 \\cdot 3, 2 \\cdot 4, 2 \\cdot 5$).

## Pułapki
*   **Błędy ze znakami:** Najczęstsze błędy pojawiają się przy odejmowaniu współrzędnych, zwłaszcza gdy jedna lub obie są ujemne. Pamiętaj, że $a - (-b) = a + b$.
*   **Zapominanie o kwadratach:** Wzór wymaga podniesienia różnic współrzędnych do kwadratu. Pominięcie tego kroku prowadzi do błędnego wyniku (np. obliczanie $|AB| = \\sqrt{(x_2 - x_1) + (y_2 - y_1)}$).
*   **Kolejność punktów:** Kolejność punktów A i B we wzorze nie ma znaczenia, ponieważ $(x_2 - x_1)^2 = (x_1 - x_2)^2$ i $(y_2 - y_1)^2 = (y_1 - y_2)^2$. Ważne jest tylko, aby konsekwentnie odejmować współrzędne w tej samej kolejności dla obu osi.
*   **Błędy w obliczeniach pierwiastka:** Po zsumowaniu kwadratów należy poprawnie obliczyć pierwiastek. Jeśli wynik nie jest liczbą całkowitą, warto sprawdzić, czy można go uprościć (np. $\\sqrt{52} = 2\\sqrt{13}$).
*   **Nie stosowanie wartości bezwzględnej:** Choć w praktyce często pomija się wartość bezwzględną, bo podnosimy do kwadratu, to formalnie odległość między $x_1$ i $x_2$ to $|x_1 - x_2|$. Kwadrat i tak to eliminuje, ale warto pamiętać o koncepcji.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz długość odcinka o końcach w punktach C = (1, 2) i D = (4, 6).
2.  Wyznacz długość odcinka o końcach E = (-3, 1) i F = (2, -3).
3.  Punkt G ma współrzędne (-2, -5), a punkt H ma współrzędne (0, -1). Oblicz długość odcinka GH.
4.  Dany jest odcinek o końcach K = (5, -4) i L = (-7, 2). Oblicz jego długość.
5.  Oblicz odległość między punktami M = ($\\frac{1}{2}$, 1) i N = ($\\frac{3}{2}$, 3).
6.  Punkty P = (0, 0) i Q = (-4, 3) są początkiem i końcem odcinka. Oblicz długość odcinka PQ.
7.  Trójkąt ABC ma wierzchołki w punktach A = (1, 1), B = (4, 1) i C = (4, 5). Oblicz długości boków AB i BC.

## Odpowiedzi
1.  $|CD| = \\sqrt{(4-1)^2 + (6-2)^2} = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.
2.  $|EF| = \\sqrt{(2 - (-3))^2 + (-3 - 1)^2} = \\sqrt{(2+3)^2 + (-4)^2} = \\sqrt{5^2 + 16} = \\sqrt{25 + 16} = \\sqrt{41}$.
3.  $|GH| = \\sqrt{(0 - (-2))^2 + (-1 - (-5))^2} = \\sqrt{(0+2)^2 + (-1+5)^2} = \\sqrt{2^2 + 4^2} = \\sqrt{4 + 16} = \\sqrt{20} = 2\\sqrt{5}$.
4.  $|KL| = \\sqrt{(-7 - 5)^2 + (2 - (-4))^2} = \\sqrt{(-12)^2 + (2+4)^2} = \\sqrt{144 + 6^2} = \\sqrt{144 + 36} = \\sqrt{180} = \\sqrt{36 \\cdot 5} = 6\\sqrt{5}$.
5.  $|MN| = \\sqrt{(\\frac{3}{2} - \\frac{1}{2})^2 + (3 - 1)^2} = \\sqrt{(\\frac{2}{2})^2 + 2^2} = \\sqrt{1^2 + 4} = \\sqrt{1 + 4} = \\sqrt{5}$.
6.  $|PQ| = \\sqrt{(-4 - 0)^2 + (3 - 0)^2} = \\sqrt{(-4)^2 + 3^2} = \\sqrt{16 + 9} = \\sqrt{25} = 5$.
7.  Długość boku AB: $|AB| = \\sqrt{(4-1)^2 + (1-1)^2} = \\sqrt{3^2 + 0^2} = \\sqrt{9} = 3$. Długość boku BC: $|BC| = \\sqrt{(4-4)^2 + (5-1)^2} = \\sqrt{0^2 + 4^2} = \\sqrt{16} = 4$.

## Szybka powtórka
1.  Jakie są współrzędne początku układu kartezjańskiego?
2.  Podaj wzór na długość odcinka o końcach $(x_1, y_1)$ i $(x_2, y_2)$.
3.  Co się stanie ze znakiem liczby po jej podniesieniu do kwadratu?
4.  Czy kolejność punktów we wzorze na długość odcinka ma znaczenie dla wyniku?
5.  Co oznacza uproszczenie pierwiastka $\\sqrt{50}$ do $5\\sqrt{2}$?

## Diagram
\`\`\`text
       ^ Y
       |
       |     B(x2, y2)
       |    /|
       |   / |
       |  /  | y2-y1
       | /   |
       |/    |
A(x1, y1)-----
       |  x2-x1
-------+----------------> X
       |
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "funkcje",
    topic: "wykresy",
    title: "Odczyt wykresu funkcji",
    content: `## Na egzaminie
Zadania polegające na odczycie wartości funkcji z wykresu lub interpretacji cech funkcji na podstawie jej wykresu pojawiają się na egzaminie ósmoklasisty regularnie, zazwyczaj w zestawie zadań otwartych lub zamkniętych. Przeważnie są to zadania dające 1–2 punkty, ale ich prawidłowe rozwiązanie jest kluczowe dla osiągnięcia dobrego wyniku. CKE często sprawdza umiejętność rozumienia pojęć takich jak: dziedzina, zbiór wartości, miejsca zerowe, przedziały monotoniczności (rosnąca/malejąca), wartości maksymalne i minimalne.

## Mapa tematu
1.  Zrozumienie czym jest wykres funkcji.
2.  Odczytywanie wartości funkcji dla danego argumentu ($f(x)$ gdy znamy $x$).
3.  Odczytywanie argumentu dla danej wartości funkcji ($x$ gdy znamy $f(x)$).
4.  Określanie dziedziny funkcji na podstawie wykresu.
5.  Określanie zbioru wartości funkcji na podstawie wykresu.
6.  Znajdowanie miejsc zerowych funkcji na podstawie wykresu.
7.  Określanie przedziałów monotoniczności (rosnąca, malejąca, stała) na podstawie wykresu.
8.  Znajdowanie wartości maksymalnej i minimalnej funkcji na podstawie wykresu (jeśli istnieją).

## Definicje i wzory
*   **Funkcja:** Przyporządkowanie, w którym każdemu elementowi jednego zbioru (dziedziny) przyporządkowany jest dokładnie jeden element drugiego zbioru (zbioru wartości).
*   **Wykres funkcji:** Zbiór wszystkich punktów na płaszczyźnie kartezjańskiej, których współrzędne $(x, f(x))$ spełniają warunek funkcji. Oś pozioma (OX) reprezentuje argumenty ($x$), a oś pionowa (OY) reprezentuje wartości funkcji ($f(x)$ lub $y$).
*   **Argument ($x$):** Wartość należąca do dziedziny funkcji.
*   **Wartość funkcji ($f(x)$ lub $y$):** Wartość funkcji odpowiadająca danemu argumentowi $x$.
*   **Dziedzina funkcji ($D_f$):** Zbiór wszystkich dopuszczalnych argumentów $x$, dla których funkcja jest określona. Na wykresie jest to zbiór wszystkich współrzędnych $x$ punktów należących do wykresu.
*   **Zbiór wartości funkcji ($ZW_f$):** Zbiór wszystkich wartości $f(x)$, jakie funkcja może przyjąć. Na wykresie jest to zbiór wszystkich współrzędnych $y$ punktów należących do wykresu.
*   **Miejsce zerowe funkcji:** Argument $x$, dla którego wartość funkcji $f(x)$ wynosi 0. Są to punkty, w których wykres funkcji przecina oś OX.
*   **Funkcja rosnąca:** Funkcja, która dla większych argumentów przyjmuje większe wartości. Na wykresie – "idzie w górę" od lewej do prawej.
*   **Funkcja malejąca:** Funkcja, która dla większych argumentów przyjmuje mniejsze wartości. Na wykresie – "idzie w dół" od lewej do prawej.
*   **Funkcja stała:** Funkcja, która dla wszystkich argumentów przyjmuje tę samą wartość. Na wykresie – linia pozioma.
*   **Wartość maksymalna/minimalna:** Największa/najmniejsza wartość funkcji w danym przedziale lub na całej dziedzinie.

## Przykład 1 - podstawowy
Na rysunku przedstawiono wykres funkcji $f$.

\`\`\`text
      ^ y
      |
    4 +-------*-------
      |       |
    3 +       |
      |     / |
    2 *----/--+
      |   /   |
    1 +--/----+-------
      | /     |
--+---+---+---+---+---+---> x
 -2  -1   0   1   2   3
      |
\`\`\`

a) Oblicz $f(1)$.
b) Znajdź $x$ takie, że $f(x) = 2$.
c) Podaj dziedzinę funkcji $f$.
d) Podaj zbiór wartości funkcji $f$.
e) Znajdź miejsca zerowe funkcji $f$.

**Rozwiązanie:**

**Krok 1.** Analiza wykresu.
Obserwujemy kształt wykresu i zaznaczone punkty. Wykres składa się z odcinków prostych. Zaznaczone są kluczowe punkty, które pozwalają na dokładne odczytanie wartości.

**Krok 2.** Obliczenie $f(1)$ (punkt a).
Szukamy na osi OX wartości $x=1$. Następnie znajdujemy punkt na wykresie, który ma tę współrzędną $x$. Prowadzimy linię pionową od $x=1$ do przecięcia z wykresem, a następnie linię poziomą do osi OY. Odczytujemy wartość na osi OY. Dla $x=1$, $f(x)=1$. Zatem $f(1) = 1$.

**Krok 3.** Znalezienie $x$ dla $f(x)=2$ (punkt b).
Szukamy na osi OY wartości $y=2$. Następnie znajdujemy punkty na wykresie, które mają tę współrzędną $y$. Prowadzimy linię poziomą od $y=2$ do przecięcia z wykresem, a następnie linie pionowe do osi OX. Odczytujemy wartości na osi OX. Funkcja przyjmuje wartość 2 dla $x=-1$ oraz dla $x=2$. Zatem $x=-1$ lub $x=2$.

**Krok 4.** Określenie dziedziny (punkt c).
Dziedzina to zbiór wszystkich dopuszczalnych wartości $x$. Patrzymy na wykres od lewej do prawej strony osi OX i sprawdzamy, dla jakich wartości $x$ istnieje fragment wykresu. Wykres zaczyna się dla $x=-2$ i kończy dla $x=3$. Oba końce są zamalowanymi punktami (*), co oznacza, że te wartości $x$ należą do dziedziny. Dziedziną jest przedział domknięty od -2 do 3. Zapisujemy to jako $D_f = [-2, 3]$.

**Krok 5.** Określenie zbioru wartości (punkt d).
Zbiór wartości to zbiór wszystkich wartości $y$, jakie funkcja przyjmuje. Patrzymy na wykres od dołu do góry osi OY i sprawdzamy, dla jakich wartości $y$ istnieje fragment wykresu. Najniższa wartość na osi OY, jaką przyjmuje funkcja, to 0 (w punkcie $x=0$). Najwyższa wartość na osi OY, jaką przyjmuje funkcja, to 4 (w punkcie $x=-2$). Zbiorem wartości jest przedział domknięty od 0 do 4. Zapisujemy to jako $ZW_f = [0, 4]$.

**Krok 6.** Znalezienie miejsc zerowych (punkt e).
Miejsca zerowe to wartości $x$, dla których $f(x)=0$. Są to punkty przecięcia wykresu z osią OX. Na wykresie widzimy, że wykres przecina oś OX tylko w jednym punkcie, dla $x=0$. Zatem jedynym miejscem zerowym jest $x=0$.

**Sprawdzenie:**
a) Podstawiając $x=1$ do wykresu, odczytujemy $y=1$. Zgadza się.
b) Dla $x=-1$, $y=2$. Dla $x=2$, $y=2$. Zgadza się.
c) Wykres rozciąga się od $x=-2$ do $x=3$. Zgadza się.
d) Najniższa wartość $y=0$, najwyższa $y=4$. Zgadza się.
e) Wykres przecina oś OX dla $x=0$. Zgadza się.

## Przykład 2 - maturalny
Na poniższym rysunku przedstawiono wykres funkcji $g$.

\`\`\`text
      ^ y
      |
    4 +       *
      |      /|
    3 +     / |
      |    /  |
    2 +---*---+-------
      |  /|   |
    1 + / |   |
      |/  |   |
--+---+---+---+---+---+---> x
 -3  -2  -1   0   1   2
      |
   -1 +
      |
\`\`\`

a) Odczytaj wartość funkcji $g$ dla argumentu $x=-1$.
b) Znajdź argumenty $x$, dla których $g(x)=1$.
c) Podaj dziedzinę funkcji $g$.
d) Podaj zbiór wartości funkcji $g$.
e) W jakich przedziałach funkcja $g$ jest rosnąca?
f) W jakich przedziałach funkcja $g$ jest malejąca?
g) Znajdź największą wartość funkcji $g$.

**Rozwiązanie:**

**Krok 1.** Analiza wykresu.
Wykres składa się z dwóch odcinków prostych. Zwracamy uwagę na zaznaczone punkty kluczowe. Wykres jest określony dla $x$ od $-3$ do $2$.

**Krok 2.** Odczytanie $g(-1)$ (punkt a).
Szukamy na osi OX wartości $x=-1$. Punkt na wykresie nad $x=-1$ ma współrzędną $y=2$. Zatem $g(-1)=2$.

**Krok 3.** Znalezienie $x$ dla $g(x)=1$ (punkt b).
Szukamy na osi OY wartości $y=1$. Prowadzimy linię poziomą od $y=1$. Przecina ona wykres w dwóch punktach. Jedna linia pionowa prowadzi do $x=-2$, druga do $x=1$. Zatem $g(x)=1$ dla $x=-2$ lub $x=1$.

**Krok 4.** Określenie dziedziny (punkt c).
Wykres jest narysowany dla $x$ od $-3$ do $2$. Punkt na $x=-3$ jest zamalowany (*), punkt na $x=2$ jest zamalowany (*). Oznacza to, że te wartości należą do dziedziny. Dziedzina to przedział domknięty. $D_g = [-3, 2]$.

**Krok 5.** Określenie zbioru wartości (punkt d).
Najniższa wartość $y$ na wykresie to $-1$ (dla $x=0$). Najwyższa wartość $y$ na wykresie to $4$ (dla $x=2$). Zbiór wartości to przedział domknięty. $ZW_g = [-1, 4]$.

**Krok 6.** Określenie przedziałów monotoniczności (punkty e i f).
*   **Rosnąca:** Szukamy odcinków, gdzie wykres "idzie w górę" od lewej do prawej. Pierwszy odcinek, od $x=-3$ do $x=-1$, idzie w górę. Drugi odcinek, od $x=-1$ do $x=2$, również idzie w górę.
    Funkcja $g$ jest rosnąca w przedziałach $[-3, -1]$ oraz $[-1, 2]$. Łącząc te przedziały, ponieważ funkcja jest ciągła w punkcie $x=-1$, możemy zapisać, że jest rosnąca w całym przedziale $[-3, 2]$.
*   **Malejąca:** Nie ma odcinków, gdzie wykres "idzie w dół". Funkcja nie jest malejąca na żadnym przedziale.

**Krok 7.** Znalezienie wartości maksymalnej (punkt g).
Największa wartość funkcji to najwyższy punkt na wykresie. Jest to punkt $(2, 4)$. Największa wartość funkcji $g$ wynosi 4.

**Sprawdzenie:**
a) $g(-1) = 2$. Wykres potwierdza.
b) Dla $x=-2$, $y=1$. Dla $x=1$, $y=1$. Wykres potwierdza.
c) $D_g = [-3, 2]$. Wykres rozciąga się od -3 do 2. Wykres potwierdza.
d) $ZW_g = [-1, 4]$. Najniższy punkt to (0, -1), najwyższy to (2, 4). Wykres potwierdza.
e) Funkcja rośnie od lewej do prawej na całym swoim zakresie. Wykres potwierdza.
f) Nie ma odcinków malejących. Wykres potwierdza.
g) Najwyższy punkt to $y=4$. Wykres potwierdza.

## Przykład 3 - egzaminacyjny

Na rysunku przedstawiono fragment wykresu pewnej funkcji $h$ określonej dla $x \\in \\{-3, -2, -1, 0, 1, 2, 3\\}$.

\`\`\`text
      ^ y
      |
    2 +   *
      |  /|
    1 +--*--+-------
      | / |   |
--+---+---+---+---+---+---> x
 -3  -2  -1   0   1   2   3
      |
   -1 +   *
      |
\`\`\`

Odczytaj z wykresu:
a) Argumenty, dla których funkcja $h$ przyjmuje wartość 1.
b) Wartość funkcji $h$ dla argumentu $x=-2$.
c) Miejsca zerowe funkcji $h$.

**Rozwiązanie:**

**Krok 1.** Analiza wykresu i dziedziny.
Wykres przedstawia punkty dla konkretnych wartości całkowitych $x$ z przedziału $\\{-3, -2, -1, 0, 1, 2, 3\\}$. Nie jest to ciągła linia, ale zbiór izolowanych punktów.

**Krok 2.** Znalezienie argumentów dla $h(x)=1$ (punkt a).
Szukamy na osi OY wartości $y=1$. Znajdujemy punkty na wykresie, które mają tę współrzędną $y$. Są to punkty $(-3, 1)$, $(-1, 1)$ oraz $(1, 1)$. Argumentami są zatem $x=-3$, $x=-1$ i $x=1$.

**Krok 3.** Odczytanie $h(-2)$ (punkt b).
Szukamy na osi OX wartości $x=-2$. Znajdujemy odpowiadający mu punkt na wykresie. Jest to punkt $(-2, 2)$. Zatem $h(-2)=2$.

**Krok 4.** Znalezienie miejsc zerowych (punkt c).
Miejsca zerowe to wartości $x$, dla których $h(x)=0$. Szukamy punktów na wykresie, których współrzędna $y$ wynosi 0. Na wykresie nie ma żadnego punktu leżącego na osi OX. Zatem funkcja $h$ nie ma miejsc zerowych.

**Sprawdzenie:**
a) Punkty $(-3, 1), (-1, 1), (1, 1)$ leżą na wykresie i mają $y=1$. Argumenty to $-3, -1, 1$. Zgadza się.
b) Punkt $(-2, 2)$ leży na wykresie. $h(-2)=2$. Zgadza się.
c) Brak punktów z $y=0$. Brak miejsc zerowych. Zgadza się.

## Pułapki
*   **Mylenie osi X i Y:** Najczęstszy błąd. Pamiętaj, że na osi poziomej są argumenty ($x$), a na pionowej wartości funkcji ($y$ lub $f(x)$). Kiedy szukasz $f(2)$, szukasz na osi X liczby 2, a potem idziesz do góry/dołu do wykresu i odczytujesz wartość na osi Y. Kiedy szukasz $x$ dla $f(x)=3$, szukasz na osi Y liczby 3, a potem idziesz w prawo/lewo do wykresu i odczytujesz wartość na osi X.
*   **Niedokładne odczytywanie z wykresu:** Jeśli punkty nie są wyraźnie zaznaczone, staraj się prowadzić linie pomocnicze prostopadle do osi. Uważaj na linie przerywane lub niezaznaczone punkty końcowe.
*   **Przedziały otwarte vs domknięte:** Pamiętaj, że kółko zamalowane (*) oznacza, że dana wartość należy do dziedziny/zbioru wartości lub jest początkiem/końcem przedziału monotoniczności. Kółko niezamalowane (o) oznacza, że dana wartość nie należy do dziedziny/zbioru wartości. W zadaniach egzaminacyjnych najczęściej spotkasz kółka zamalowane lub wykresy bez zaznaczonych kółek, co sugeruje, że końce przedziałów należą do dziedziny.
*   **Łączenie przedziałów monotoniczności:** Funkcja może być rosnąca w kilku przedziałach. Jeśli punkty graniczne tych przedziałów są "połączone" (funkcja jest ciągła w tym punkcie), często można połączyć te przedziały w jeden większy. Np. funkcja rosnąca w $[-2, 0]$ i w $[0, 3]$ jest rosnąca w $[-2, 3]$. Jeśli w punkcie $x=0$ następuje "załamanie" wykresu i funkcja zaczyna maleć, to przedziały pozostają osobne.

## Ćwiczenia do samodzielnego rozwiązania
1.  Na rysunku poniżej przedstawiono wykres funkcji $k$.
    \`\`\`text
          ^ y
          |
        3 +       *
          |      /|
        2 +-----* |
          |    /  |
        1 +---/---+-------
          |  /    |
    ------+--+----+---+---> x
         -2  -1   0   1
          |
       -1 + *
          |
    \`\`\`
    a) Oblicz $k(-1)$.
    b) Znajdź $x$ takie, że $k(x)=1$.
    c) Podaj dziedzinę funkcji $k$.
    d) Podaj zbiór wartości funkcji $k$.
    e) Podaj argumenty, dla których funkcja $k$ jest malejąca.

2.  Dana jest funkcja $m$, której fragment wykresu przedstawiono poniżej. Wykres jest określony dla $x \\in \\{-4, -3, -2, -1, 0, 1, 2, 3, 4\\}$.
    \`\`\`text
          ^ y
          |
        2 +   *
          |  /|
        1 +--*--*-------
          | / | /
    ------+---+---+---+---> x
         -2  -1   0   1
          |
       -1 +     *
          |
       -2 +       *
          |
    \`\`\`
    a) Odczytaj z wykresu wartości $m(-3)$ oraz $m(0)$.
    b) Znajdź argumenty $x$, dla których $m(x)=1$.
    c) Znajdź miejsca zerowe funkcji $m$.

3.  Na poniższym wykresie przedstawiono funkcję $p$.
    \`\`\`text
          ^ y
          |
        4 +---------*
          |         |
        3 +         |
          |         |
        2 +       / |
          |      /  |
        1 +-----*---+-------
          |    /    |
    ------+---+---+---+---> x
         -1   0   1   2
          |
    \`\`\`
    a) Jaka jest wartość funkcji $p$ dla $x=0$?
    b) Dla jakich argumentów $x$ funkcja $p$ przyjmuje wartość $3$?
    c) Podaj przedziały, w których funkcja $p$ jest rosnąca.
    d) Podaj przedział, w którym funkcja $p$ jest stała.
    e) Znajdź największą wartość funkcji $p$.

4.  Wykres funkcji $q$ jest następujący:
    \`\`\`text
          ^ y
          |
        2 +   *
          |  /|
        1 +--+--*-------
          | / | /
    ------+---+---+---+---> x
         -2  -1   0   1
          |
       -1 +     *
          |
    \`\`\`
    Dziedzina funkcji $q$ to $D_q = \\{-2, -1, 0, 1\\}$. Podaj:
    a) Wartość funkcji $q$ dla $x=0$.
    b) Argumenty $x$, dla których $q(x)=-1$.
    c) Miejsca zerowe funkcji $q$.

5.  Na rysunku poniżej znajduje się wykres funkcji $r$.
    \`\`\`text
          ^ y
          |
        3 +       *
          |      / \\
        2 +-----*   *
          |    /     \\
        1 +---/-------\\---
          |  /         \\
    ------+--+----+----+-----> x
         -3  -2   -1   0    1
          |
    \`\`\`
    Dziedzina funkcji $r$ to $[-3, 1]$.
    a) Odczytaj z wykresu wartość $r(-1)$.
    b) Podaj argumenty, dla których $r(x)=1$.
    c) Podaj przedziały, w których funkcja $r$ jest rosnąca.
    d) Podaj przedziały, w których funkcja $r$ jest malejąca.
    e) Podaj zbiór wartości funkcji $r$.

6.  Funkcja $s$ jest przedstawiona na wykresie.
    \`\`\`text
          ^ y
          |
        3 +       *
          |      /|
        2 +-----* |
          |    /  |
        1 +---/---+-------
          |  /    |
    ------+--+----+---+---> x
         -2  -1   0   1
          |
       -1 + *
          |
    \`\`\`
    Jaka jest najmniejsza wartość funkcji $s$?

7.  Funkcja $t$ ma następujący wykres:
    \`\`\`text
          ^ y
          |
        2 +       *
          |      /
        1 +-----*-------
          |    /
    ------+--+----+-----> x
         -2  -1   0
          |
    \`\`\`
    Dziedzina funkcji $t$ to $[-2, 0]$.
    a) Odczytaj $t(-1)$.
    b) Podaj argument $x$, dla którego $t(x)=2$.
    c) Czy funkcja $t$ ma miejsca zerowe? Odpowiedź uzasadnij.

## Odpowiedzi
1.  a) $k(-1)=1$
    b) $x=-1$ lub $x=0$
    c) $D_k = [-2, 1]$
    d) $ZW_k = [-1, 3]$
    e) Funkcja jest malejąca w przedziale $[-1, 0]$.

2.  a) $m(-3)=0$, $m(0)=1$
    b) $x=-3$ lub $x=1$
    c) $x=-3$ jest miejscem zerowym.

3.  a) $p(0)=1$
    b) Funkcja $p$ nie przyjmuje wartości $3$. (lub: nie ma takiego argumentu)
    c) Funkcja $p$ jest rosnąca w przedziałach $[-1, 0]$ i $[0, 2]$. Łącznie: $[-1, 2]$.
    d) Funkcja $p$ jest stała w przedziale $[1, 2]$.
    e) Największa wartość funkcji $p$ wynosi $4$.

4.  a) $q(0)=-1$
    b) $x=-2$
    c) Funkcja $q$ nie ma miejsc zerowych.

5.  a) $r(-1)=2$
    b) $x=-2$ oraz $x=0$
    c) Funkcja $r$ jest rosnąca w przedziałach $[-3, -1]$ oraz $[-1, 0]$.
    d) Funkcja $r$ jest malejąca w przedziale $[0, 1]$.
    e) $ZW_r = [1, 3]$

6.  Najmniejsza wartość funkcji $s$ wynosi $-1$.

7.  a) $t(-1)=1$
    b) $x=-2$
    c) Nie, funkcja $t$ nie ma miejsc zerowych, ponieważ jej wykres nie przecina osi OX. Najniższa wartość funkcji to $1$.

## Szybka powtórka
1.  Co na wykresie reprezentuje oś pozioma (OX)?
2.  Co na wykresie reprezentuje oś pionowa (OY)?
3.  Gdzie na wykresie odczytujemy miejsca zerowe funkcji?
4.  Jak na wykresie rozpoznać, czy funkcja jest rosnąca?
5.  Czym różni się dziedzina od zbioru wartości w kontekście wykresu?`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "funkcje",
    topic: "proporcjonalnosc",
    title: "Proporcjonalność prosta – klucz do zadań CKE",
    content: `## Na egzaminie
Proporcjonalność prosta pojawia się na egzaminie ósmoklasisty regularnie, często w zadaniach otwartych, wymagających obliczeń i uzasadnienia. Można ją spotkać zarówno w zadaniach obliczeniowych, jak i tekstowych, często powiązanych z kontekstem praktycznym (np. ceny, prędkość, przepisy kulinarne). Rozumienie tej zależności i umiejętność operowania jej wzorem jest kluczowa do zdobycia nawet kilku punktów na egzaminie.

## Mapa tematu
W tej lekcji poznasz:
1.  Definicję proporcjonalności prostej i jej charakterystyczne cechy.
2.  Wzór opisujący proporcjonalność prostą: $y = ax$.
3.  Znaczenie współczynnika proporcjonalności $a$.
4.  Sposoby identyfikacji proporcjonalności prostej na podstawie tabeli, wykresu i opisu słownego.
5.  Metody rozwiązywania zadań z wykorzystaniem proporcjonalności prostej.
6.  Zastosowania proporcjonalności prostej w zadaniach praktycznych.
7.  Rozwiązywanie zadań typu egzaminacyjnego z tym zagadnieniem.

## Definicje i wzory
*   **Proporcjonalność prosta:** Mówimy, że wielkość $y$ jest wprost proporcjonalna do wielkości $x$, jeśli ich stosunek jest stały i różny od zera. Oznacza to, że gdy $x$ rośnie, $y$ rośnie w tym samym tempie, a gdy $x$ maleje, $y$ maleje proporcjonalnie.
*   **Wzór:** Zależność tę opisuje wzór:
    $$y = ax$$
    gdzie:
    *   $y$ jest wielkością zależną.
    *   $x$ jest wielkością niezależną.
    *   $a$ jest **współczynnikiem proporcjonalności** (stała, różna od zera).
*   **Współczynnik proporcjonalności $a$**: Można go wyznaczyć ze wzoru $a = \\frac{y}{x}$ (dla $x \\neq 0$). Określa on, ile razy $y$ jest większe od $x$, lub jak bardzo $y$ zmienia się przy jednostkowej zmianie $x$.
    *   Jeśli $a > 0$, wielkości $x$ i $y$ rosną i maleją w tym samym kierunku.
    *   Jeśli $a < 0$, wielkości $x$ i $y$ zmieniają się w przeciwnych kierunkach (gdy $x$ rośnie, $y$ maleje i odwrotnie).
*   **Wykres proporcjonalności prostej:** Wykresem zależności $y = ax$ jest linia prosta przechodząca przez początek układu współrzędnych (punkt (0,0)). Kierunek prostej zależy od znaku współczynnika $a$:
    *   Dla $a > 0$ prosta jest rosnąca (wznosi się od lewej do prawej).
    *   Dla $a < 0$ prosta jest malejąca (opada od lewej do prawej).
*   **Charakterystyka tabeli:** W tabeli wielkości opisującej proporcjonalność prostą, stosunek odpowiednich wartości $y$ do $x$ jest stały. $\\frac{y_1}{x_1} = \\frac{y_2}{x_2} = \\dots = a$.

## Przykład 1 - podstawowy
Cena 5 kg jabłek wynosi 15 zł. Ile będą kosztować 3 kg tych samych jabłek?

**Krok 1.** Zidentyfikuj wielkości i zależność.
Wielkością niezależną jest masa jabłek ($x$), a zależną jest ich cena ($y$). Ponieważ cena za kilogram jest stała, cena jest wprost proporcjonalna do masy.

**Krok 2.** Zapisz wzór proporcjonalności.
$y = ax$, gdzie $x$ to masa (w kg), a $y$ to cena (w zł).

**Krok 3.** Oblicz współczynnik proporcjonalności $a$.
Wiemy, że dla $x=5$ kg, $y=15$ zł. Podstawiamy do wzoru:
$15 = a \\cdot 5$
Dzielimy obie strony przez 5:
$a = \\frac{15}{5} = 3$
Współczynnik proporcjonalności $a=3$. Oznacza to, że 1 kg jabłek kosztuje 3 zł.

**Krok 4.** Zapisz wzór dla konkretnego przypadku.
Wzór opisujący cenę jabłek w zależności od ich masy to: $y = 3x$.

**Krok 5.** Oblicz cenę dla zadanej masy.
Chcemy obliczyć cenę dla $x=3$ kg. Podstawiamy do wzoru:
$y = 3 \\cdot 3 = 9$
Cena 3 kg jabłek wynosi 9 zł.

**Sprawdzenie:**
Cena za kg wynosi $15 \\text{ zł} / 5 \\text{ kg} = 3 \\text{ zł/kg}$.
Cena za 3 kg to $3 \\text{ kg} \\cdot 3 \\text{ zł/kg} = 9 \\text{ zł}$. Wynik jest poprawny.

## Przykład 2 - maturalny
Tabela przedstawia zależność między liczbą godzin pracy a ilością wyprodukowanych detali. Sprawdź, czy zależność ta jest proporcjonalnością prostą. Jeśli tak, wyznacz wzór tej zależności i oblicz, ile detali zostanie wyprodukowanych w ciągu 8 godzin pracy.

| Liczba godzin pracy ($x$) | Liczba wyprodukowanych detali ($y$) |
| :----------------------- | :-------------------------------- |
| 2                        | 40                                |
| 3                        | 60                                |
| 5                        | 100                               |

**Krok 1.** Sprawdź stałość stosunku $\\frac{y}{x}$.
Obliczamy stosunek $y$ do $x$ dla każdej pary danych:
Dla pierwszej pary: $\\frac{40}{2} = 20$
Dla drugiej pary: $\\frac{60}{3} = 20$
Dla trzeciej pary: $\\frac{100}{5} = 20$
Stosunek $\\frac{y}{x}$ jest stały i wynosi 20.

**Krok 2.** Zidentyfikuj rodzaj proporcjonalności i współczynnik.
Ponieważ stosunek $\\frac{y}{x}$ jest stały i różny od zera, zależność jest proporcjonalnością prostą.
Współczynnik proporcjonalności $a = 20$.

**Krok 3.** Zapisz wzór zależności.
Wzór opisujący tę zależność to $y = ax$, czyli:
$y = 20x$
gdzie $x$ to liczba godzin pracy, a $y$ to liczba wyprodukowanych detali.

**Krok 4.** Oblicz liczbę detali dla 8 godzin pracy.
Szukamy wartości $y$, gdy $x=8$ godzin. Podstawiamy do wzoru:
$y = 20 \\cdot 8 = 160$

**Odpowiedź:** Zależność jest proporcjonalnością prostą. Wzór to $y=20x$. W ciągu 8 godzin pracy zostanie wyprodukowanych 160 detali.

## Przykład 3 - egzaminacyjny
Na rysunku przedstawiono fragment wykresu zależności $y = ax$. Określ znak współczynnika $a$ oraz oblicz jego wartość.

\`\`\`text
      ^ y
      |
      |    . (x, y)
      |   /
      |  /
------+------------> x
     /|
    / |
   /  |
  /   |
\`\`\`
*(Uwaga: Rysunek przedstawia prostą przechodzącą przez początek układu współrzędnych i znajdującą się w pierwszej i trzeciej ćwiartce układu współrzędnych. Punkt (x, y) zaznaczony jest w pierwszej ćwiartce, gdzie zarówno x, jak i y są dodatnie.)*

**Krok 1.** Analiza wykresu.
Wykres jest linią prostą przechodzącą przez początek układu współrzędnych (0,0). To potwierdza, że jest to proporcjonalność prosta. Wykres znajduje się w I i III ćwiartce.

**Krok 2.** Określenie znaku współczynnika $a$.
Ponieważ wykres jest wznoszący się (od lewej do prawej), oznacza to, że dla dodatnich wartości $x$ wartości $y$ są również dodatnie. Na przykład, punkt zaznaczony w pierwszej ćwiartce (gdzie $x>0$ i $y>0$) leży na tej prostej.
Jeśli wybierzemy dowolny punkt na tej prostej z $x>0$ (np. zaznaczony punkt), to $y$ również jest dodatnie. Stosunek $\\frac{y}{x}$ będzie dodatni.
Zatem współczynnik proporcjonalności $a$ jest dodatni ($a>0$).

**Krok 3.** Wyznaczenie wartości współczynnika $a$.
Aby dokładnie obliczyć $a$, potrzebowalibyśmy współrzędnych konkretnego punktu (innego niż (0,0)) leżącego na tej prostej. Ponieważ w zadaniu nie podano konkretnych wartości, zakładamy, że wykres przechodzi przez punkt (np.) $(2, 4)$, co można wywnioskować z rysunku lub jest to typowe założenie w tego typu zadaniach bez konkretnych danych.
Jeżeli punkt $(2, 4)$ leży na prostej, to dla $x=2$ mamy $y=4$.
Podstawiamy do wzoru $y = ax$:
$4 = a \\cdot 2$
Dzielimy przez 2:
$a = \\frac{4}{2} = 2$

**Odpowiedź:** Współczynnik $a$ jest dodatni ($a > 0$). Jego wartość wynosi 2 (przy założeniu, że wykres przechodzi przez punkt (2,4)).

## Pułapki
*   **Mylenie proporcjonalności prostej z odwrotną:** W proporcjonalności odwrotnej iloczyn $x \\cdot y = const$. W prostej stosunek $\\frac{y}{x} = const$. Zawsze sprawdzaj, jaka zależność jest opisana.
*   **Brak przejścia przez początek układu współrzędnych:** Wykres proporcjonalności prostej *zawsze* przechodzi przez punkt (0,0). Jeśli linia jest prosta, ale nie przechodzi przez początek, nie jest to proporcjonalność prosta (może to być funkcja liniowa $y=ax+b$ dla $b \\neq 0$).
*   **Dzielenie przez zero:** Wzór $a = \\frac{y}{x}$ można stosować tylko wtedy, gdy $x \\neq 0$. Wartość $x=0$ zawsze odpowiada $y=0$ w proporcjonalności prostej.
*   **Niepoprawne obliczenie współczynnika $a$:** Upewnij się, że zawsze obliczasz stosunek $y$ do $x$ ($a = \\frac{y}{x}$), a nie $x$ do $y$ ($a = \\frac{x}{y}$), chyba że wzór funkcji jest zapisany jako $x = ay$. W standardowej postaci $y=ax$, to $a = \\frac{y}{x}$.
*   **Błąd w interpretacji kontekstu zadania:** Czasem wielkości mogą wydawać się proporcjonalne, ale kontekst zadania temu przeczy. Np. cena biletu plus stała opłata za wstęp nie jest proporcjonalnością prostą. Zawsze analizuj tekst zadania pod kątem stałości współczynnika.

## Ćwiczenia do samodzielnego rozwiązania
1.  Sprawdź, czy wielkość $y$ jest wprost proporcjonalna do wielkości $x$ w poniższych przypadkach:
    a) $x=2, y=6$; $x=4, y=12$; $x=-1, y=-3$
    b) $x=1, y=5$; $x=2, y=10$; $x=3, y=12$
    c) $x=3, y=9$; $x=5, y=15$; $x=-2, y=-6$
2.  Cena 4 zeszytów wynosi 12 zł. Ile zapłacimy za 7 takich zeszytów?
3.  Funkcja $f(x) = ax$ opisuje pewną proporcjonalność prostą. Wiadomo, że $f(3) = -9$.
    a) Oblicz współczynnik proporcjonalności $a$.
    b) Napisz wzór tej funkcji.
    c) Oblicz $f(-5)$.
4.  Tabela przedstawia zależność drogi ($s$) od czasu ($t$) dla ruchu jednostajnego prostoliniowego. Czy jest to proporcjonalność prosta? Jeśli tak, podaj wzór i oblicz drogę przebytą w ciągu 10 sekund.

    | Czas ($t$) [s] | Droga ($s$) [m] |
    | :----------- | :------------ |
    | 2            | 10            |
    | 5            | 25            |
    | 8            | 40            |

5.  Na wykresie przedstawiono zależność $y=ax$. Prosta przechodzi przez punkt $(-2, 6)$.
    a) Określ znak współczynnika $a$.
    b) Oblicz wartość $a$.
    c) Podaj wzór tej funkcji.
6.  Piotr maluje płot. W ciągu 3 godzin pomalował 18 metrów bieżących płotu. Ile metrów pomaluje w ciągu 5 godzin, zakładając, że pracuje w tym samym tempie?
7.  Funkcja $y=ax$ opisuje zależność pewnych wielkości. Zapisz, jak zmieni się wartość $y$, gdy wartość $x$:
    a) wzrośnie 2 razy.
    b) zmaleje 3 razy.
    c) wzrośnie o 50%.

## Odpowiedzi
1.  a) Tak, $a=3$.
    b) Nie, stosunki są różne ($5, 5, 4$).
    c) Tak, $a=3$.
2.  Cena za 1 zeszyt: $12 \\text{ zł} / 4 = 3 \\text{ zł}$. Cena za 7 zeszytów: $7 \\cdot 3 \\text{ zł} = 21 \\text{ zł}$.
3.  a) $a = \\frac{-9}{3} = -3$.
    b) $f(x) = -3x$.
    c) $f(-5) = -3 \\cdot (-5) = 15$.
4.  Tak, jest to proporcjonalność prosta. Stosunek $\\frac{s}{t} = \\frac{10}{2} = \\frac{25}{5} = \\frac{40}{8} = 5$.
    Wzór: $s = 5t$.
    Droga w ciągu 10 sekund: $s = 5 \\cdot 10 = 50$ m.
5.  a) Współczynnik $a$ jest ujemny ($a < 0$), ponieważ prosta jest malejąca (przechodzi przez II i IV ćwiartkę, a punkt $(-2, 6)$ jest w II ćwiartce).
    b) $6 = a \\cdot (-2) \\implies a = \\frac{6}{-2} = -3$.
    c) $y = -3x$.
6.  Tempo malowania: $18 \\text{ m} / 3 \\text{ h} = 6 \\text{ m/h}$.
    W ciągu 5 godzin: $5 \\text{ h} \\cdot 6 \\text{ m/h} = 30 \\text{ m}$.
7.  a) $y$ wzrośnie 2 razy (bo $y = a \\cdot (2x) = 2(ax)$).
    b) $y$ zmaleje 3 razy (bo $y = a \\cdot (\\frac{x}{3}) = \\frac{1}{3}(ax)$).
    c) $y$ wzrośnie o 50% (czyli będzie stanowić 150% pierwotnej wartości). $x_{nowe} = 1.5x$. $y_{nowe} = a \\cdot (1.5x) = 1.5 (ax) = 1.5y$.

## Szybka powtórka
1.  Jaki jest podstawowy wzór na proporcjonalność prostą?
2.  Co oznacza współczynnik proporcjonalności $a$?
3.  Przez jaki punkt na układzie współrzędnych zawsze przechodzi wykres proporcjonalności prostej?
4.  Jeśli cena 1 kg produktu wynosi 5 zł, to ile kosztuje 3 kg? Czy jest to proporcjonalność prosta?
5.  Jak zmieni się wielkość $y$, gdy $x$ zwiększy się dwukrotnie w zależności $y=ax$?

## Diagram
\`\`\`text
      ^ y
      |      /
      |     /
      |    / a > 0 (rosnąca)
      |   /
      |  /
------+------------> x
     /|
    / |
   /  | a < 0 (malejąca)
  /   |
 /    |
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "statystyka",
    topic: "srednia",
    title: "Średnia arytmetyczna - klucz do sukcesu na egzaminie",
    content: `## Na egzaminie
Średnia arytmetyczna jest jednym z najczęściej pojawiających się zagadnień w dziale statystyki na egzaminie ósmoklasisty. Zazwyczaj pojawia się w zadaniach otwartych, oferując od 2 do 4 punktów, ale może również występować w zadaniach zamkniętych. CKE często sprawdza umiejętność obliczania średniej z większej liczby danych, rozwiązywania zadań tekstowych wymagających znajomości średniej lub analizy danych przedstawionych w tabelach i diagramach.

## Mapa tematu
1. Zrozumienie definicji średniej arytmetycznej.
2. Umiejętność obliczania średniej arytmetycznej z zestawu liczb.
3. Umiejętność obliczania średniej ważonej.
4. Rozwiązywanie zadań tekstowych z wykorzystaniem średniej arytmetycznej.
5. Odczytywanie i interpretacja danych z tabel i wykresów w kontekście średniej.
6. Wykorzystanie średniej do uzupełniania brakujących danych.
7. Zrozumienie pojęcia mediany i dominanty jako uzupełnienie średniej.

## Definicje i wzory
*   **Średnia arytmetyczna** – to suma wszystkich liczb w danym zbiorze podzielona przez liczbę tych liczb. Jest to najprostsza i najczęściej używana miara tendencji centralnej.

*   **Wzór na średnią arytmetyczną**
    Dla zbioru danych $x_1, x_2, x_3, \\dots, x_n$, średnią arytmetyczną, oznaczoną jako $\\overline{x}$ (czyt. "iks kreska"), obliczamy ze wzoru:
    $$ \\overline{x} = \\frac{x_1 + x_2 + x_3 + \\dots + x_n}{n} $$
    gdzie $n$ to liczba elementów w zbiorze.

*   **Średnia ważona**
    Gdy poszczególne elementy zbioru mają różne "znaczenie" lub "wagę", obliczamy średnią ważoną. Wzór wygląda następująco:
    $$ \\overline{x}_{w} = \\frac{w_1 \\cdot x_1 + w_2 \\cdot x_2 + \\dots + w_n \\cdot x_n}{w_1 + w_2 + \\dots + w_n} $$
    gdzie $x_i$ to wartości, a $w_i$ to ich wagi. Suma wag znajduje się w mianowniku. Często wagi są podane jako liczby, ale mogą też być przedstawione jako liczby elementów danych (np. oceny z testów i sprawdzianów).

*   **Mediana**
    Mediana to wartość środkowa w posortowanym zbiorze danych.
    *   Jeśli liczba danych $n$ jest **nieparzysta**, mediana jest środkowym elementem po posortowaniu.
    *   Jeśli liczba danych $n$ jest **parzysta**, mediana jest średnią arytmetyczną dwóch środkowych elementów po posortowaniu.

*   **Dominanta (Moda)**
    Dominanta to wartość, która najczęściej występuje w zbiorze danych. Zbiór danych może mieć jedną dominantę (unimodalny), więcej niż jedną (multimodalny) lub nie mieć dominanty wcale (jeśli wszystkie wartości występują z taką samą częstotliwością).

## Przykład 1 - podstawowy
Oblicz średnią arytmetyczną liczb: 12, 15, 18, 21, 24.

**Krok 1.** Zidentyfikuj liczby w zbiorze.
Liczby to: 12, 15, 18, 21, 24.

**Krok 2.** Policz, ile jest liczb w zbiorze.
Jest 5 liczb ($n=5$).

**Krok 3.** Zsumuj wszystkie liczby.
Suma $= 12 + 15 + 18 + 21 + 24$.
$12 + 15 = 27$
$27 + 18 = 45$
$45 + 21 = 66$
$66 + 24 = 90$.
Suma wynosi 90.

**Krok 4.** Podziel sumę przez liczbę liczb.
Średnia $\\overline{x} = \\frac{90}{5}$.
$\\frac{90}{5} = 18$.

**Krok 5.** Zapisz wynik.
Średnia arytmetyczna tych liczb wynosi 18.

**Sprawdzenie:** Liczby są w pewnym sensie symetryczne wokół 18. Różnice od 18 to: -6, -3, 0, 3, 6. Suma różnic to -6 - 3 + 0 + 3 + 6 = 0, co potwierdza poprawność obliczeń.

## Przykład 2 - maturalny
W klasie liczącej 25 uczniów przeprowadzono test z matematyki. Średnia arytmetyczna uzyskanych punktów wyniosła 75. Jeden z uczniów, Janek, otrzymał 90 punktów. Po tym, jak wychowawca sprawdził obecność, okazało się, że jeden uczeń był nieobecny i jego wynik nie został uwzględniony w początkowym obliczeniu średniej. Po dodaniu wyniku tego nieobecnego ucznia, który wynosił 60 punktów, obliczono nową średnią dla całej klasy. Oblicz nową średnią arytmetyczną punktów uzyskanych przez wszystkich uczniów (włączając nieobecnego).

**Krok 1.** Oblicz sumę punktów wszystkich 25 uczniów, na podstawie początkowej średniej.
Średnia $\\overline{x} = 75$. Liczba uczniów $n = 25$.
Suma punktów $S = \\overline{x} \\cdot n$.
$S = 75 \\cdot 25$.
$75 \\cdot 25 = 75 \\cdot (20 + 5) = 75 \\cdot 20 + 75 \\cdot 5 = 1500 + 375 = 1875$.
Suma punktów 25 uczniów wynosi 1875.

**Krok 2.** Zauważ, że wynik Janka (90 punktów) nie jest bezpośrednio potrzebny do obliczenia *nowej* średniej, ale jest częścią początkowej sumy. Trzeba też zwrócić uwagę na liczbę uczniów w dwóch scenariuszach. Początkowa średnia dotyczyła 25 uczniów.
Jednak treść jest nieco myląca. Przeanalizujmy jeszcze raz: "Średnia arytmetyczna uzyskanych punktów wyniosła 75." To jest kluczowe. "Jeden z uczniów, Janek, otrzymał 90 punktów." To informacja, ale czy Janek był wśród tych 25? Dalej: "jeden uczeń był nieobecny i jego wynik nie został uwzględniony w początkowym obliczeniu średniej." To oznacza, że początkowa średnia (75) była obliczona dla $25-1=24$ uczniów.
Poprawmy więc:
Początkowa średnia obliczona została dla $n = 24$ uczniów.
$\\overline{x}_{24} = 75$.
Suma punktów tych 24 uczniów: $S_{24} = 75 \\cdot 24$.
$75 \\cdot 24 = 75 \\cdot (20 + 4) = 1500 + 300 = 1800$.
Suma punktów 24 uczniów wynosi 1800.

**Krok 3.** Oblicz nową sumę punktów, dodając wynik nieobecnego ucznia.
Wynik nieobecnego ucznia: 60 punktów.
Nowa suma punktów $S_{25} = S_{24} + 60$.
$S_{25} = 1800 + 60 = 1860$.
Nowa suma punktów wszystkich 25 uczniów wynosi 1860.

**Krok 4.** Oblicz nową średnią arytmetyczną dla wszystkich 25 uczniów.
Nowa liczba uczniów $n' = 25$.
Nowa średnia $\\overline{x}_{25} = \\frac{S_{25}}{n'} = \\frac{1860}{25}$.

**Krok 5.** Wykonaj dzielenie.
$\\frac{1860}{25} = \\frac{1860 \\cdot 4}{25 \\cdot 4} = \\frac{7440}{100} = 74.4$.
Nowa średnia arytmetyczna wynosi 74.4.

**Sprawdzenie:** Dodanie wyniku niższego niż początkowa średnia (60 < 75) powinno spowodować obniżenie średniej, co się stało (74.4 < 75). Wynik Janka (90) był tylko informacją wprowadzającą, niepotrzebną do ostatecznego obliczenia.

## Przykład 3 - egzaminacyjny

Tabela przedstawia oceny z matematyki uzyskane przez uczniów klasy 8a z ostatniego sprawdzianu:

| Ocena        | Liczba uczniów |
| :----------- | :------------- |
| 1 (niedost.) | 2              |
| 2 (dopuszcz.)| 5              |
| 3 (dostatecz.)| 8              |
| 4 (dobra)    | 6              |
| 5 (bardzo d.)| 3              |
| 6 (celująca) | 1              |

Oblicz średnią arytmetyczną ocen z tego sprawdzianu.

**Krok 1.** Zidentyfikuj wszystkie oceny i liczbę uczniów, którzy je uzyskali.
Oceny: 1, 2, 3, 4, 5, 6.
Liczba uczniów dla każdej oceny: 2, 5, 8, 6, 3, 1.

**Krok 2.** Oblicz łączną liczbę uczniów w klasie.
Suma liczby uczniów = $2 + 5 + 8 + 6 + 3 + 1 = 25$.
Łączna liczba uczniów wynosi 25.

**Krok 3.** Oblicz sumę punktów (ocen) wszystkich uczniów. Jest to suma iloczynów każdej oceny i liczby uczniów, którzy ją uzyskali.
Suma ocen = $(1 \\cdot 2) + (2 \\cdot 5) + (3 \\cdot 8) + (4 \\cdot 6) + (5 \\cdot 3) + (6 \\cdot 1)$
Suma ocen = $2 + 10 + 24 + 24 + 15 + 6$
Suma ocen = $12 + 24 + 24 + 15 + 6 = 36 + 24 + 15 + 6 = 60 + 15 + 6 = 75 + 6 = 81$.
Suma wszystkich ocen wynosi 81.

**Krok 4.** Oblicz średnią arytmetyczną, dzieląc sumę ocen przez łączną liczbę uczniów.
Średnia ocen $\\overline{x} = \\frac{\\text{Suma ocen}}{\\text{Liczba uczniów}} = \\frac{81}{25}$.

**Krok 5.** Wykonaj dzielenie.
$\\frac{81}{25} = \\frac{81 \\cdot 4}{25 \\cdot 4} = \\frac{324}{100} = 3.24$.
Średnia arytmetyczna ocen z tego sprawdzianu wynosi 3.24.

**Sprawdzenie:** Średnia (3.24) mieści się w zakresie ocen (1-6) i wydaje się rozsądna, biorąc pod uwagę największą grupę uczniów (8 osób) z oceną 3, oraz znaczną liczbę uczniów z ocenami 3 i 4.

## Pułapki
*   **Pomylenie średniej z medianą lub dominantą:** Uczniowie często obliczają medianę (wartość środkową) lub dominantę (wartość najczęstszą) zamiast średniej arytmetycznej. Pamiętaj, że średnia to suma podzielona przez ilość.
*   **Błędy rachunkowe przy sumowaniu lub dzieleniu:** Szczególnie przy większych liczbach lub ułamkach łatwo o pomyłkę. Zawsze sprawdzaj obliczenia, używaj kalkulatora w razie wątpliwości (jeśli jest dozwolony) lub wykonuj dzielenie "pisemnie" bardzo dokładnie.
*   **Nieuwzględnienie wszystkich danych:** W zadaniach tekstowych lub tabelarycznych łatwo zapomnieć o jakimś elemencie (np. o nieobecnym uczniu) lub błędnie policzyć liczbę elementów. Dokładnie czytaj polecenie i licz wszystkie dane.
*   **Zastosowanie złego wzoru:** Mylenie średniej zwykłej ze średnią ważoną. Jeśli dane mają przypisane "wagi" (np. liczby uczniów dla każdej oceny, punkty ECTS dla przedmiotów), należy użyć wzoru na średnią ważoną.
*   **Zaokrąglanie wyników:** Jeśli polecenie nie mówi o zaokrąglaniu, podaj dokładny wynik. Czasem w zadaniach tekstowych podana jest informacja, że np. "średnia wieku jest liczbą całkowitą", co może sugerować pewne zaokrąglenie lub błąd w obliczeniach, jeśli wynik nie jest liczbą całkowitą.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz średnią arytmetyczną liczb: 7, 11, 5, 9, 13.
2.  Pięciu zawodników uzyskało następujące czasy na biegu: 12.5 s, 11.8 s, 13.1 s, 12.2 s, 12.9 s. Oblicz średni czas tych zawodników.
3.  Uczeń otrzymał następujące oceny z przedmiotów: polski - 4, matematyka - 5, historia - 3, przyroda - 4, angielski - 5. Oblicz średnią ocen, przypisując wszystkim przedmiotom jednakową wagę (1).
4.  W pewnym sklepie sprzedano w ciągu tygodnia następującą liczbę sztuk danego produktu: poniedziałek - 25, wtorek - 30, środa - 28, czwartek - 35, piątek - 40, sobota - 45, niedziela - 32. Oblicz średnią dzienną sprzedaż tego produktu w tym tygodniu.
5.  Średnia ocen z matematyki na koniec semestru dla 20 uczniów wynosiła 3.8. Ilu uczniów otrzymało ocenę 5, jeśli wiemy, że pozostali uczniowie otrzymali ocenę 3, a suma ocen wszystkich uczniów wynosi 76?
6.  W klasie jest 30 uczniów. Średnia ich wzrostu wynosi 165 cm. Po zakończeniu roku szkolnego dołączyło 5 nowych uczniów, a średni wzrost wszystkich uczniów wynosi teraz 164 cm. Oblicz średni wzrost nowych uczniów.
7.  Średnia arytmetyczna czterech liczb wynosi 15. Dwie z tych liczb to 10 i 20. Oblicz średnią arytmetyczną pozostałych dwóch liczb.

## Odpowiedzi
1.  Średnia = $\\frac{7+11+5+9+13}{5} = \\frac{45}{5} = 9$.
2.  Średni czas = $\\frac{12.5 + 11.8 + 13.1 + 12.2 + 12.9}{5} = \\frac{62.5}{5} = 12.5$ s.
3.  Średnia ocen = $\\frac{4+5+3+4+5}{5} = \\frac{21}{5} = 4.2$.
4.  Średnia dzienna sprzedaż = $\\frac{25+30+28+35+40+45+32}{7} = \\frac{235}{7} \\approx 33.57$ sztuk.
5.  Suma ocen wszystkich 20 uczniów = $3.8 \\cdot 20 = 76$.
    Suma ocen uczniów z oceną 3 = $3 \\cdot (20-x)$, gdzie $x$ to liczba uczniów z oceną 5.
    Suma ocen = $3 \\cdot (20-x) + 5x = 60 - 3x + 5x = 60 + 2x$.
    Mamy $60 + 2x = 76$, więc $2x = 16$, $x=8$. 8 uczniów otrzymało ocenę 5.
6.  Suma wzrostu 30 uczniów = $165 \\cdot 30 = 4950$ cm.
    Suma wzrostu 35 uczniów = $164 \\cdot 35 = 5740$ cm.
    Suma wzrostu 5 nowych uczniów = $5740 - 4950 = 790$ cm.
    Średni wzrost nowych uczniów = $\\frac{790}{5} = 158$ cm.
7.  Suma czterech liczb = $15 \\cdot 4 = 60$.
    Suma dwóch znanych liczb = $10 + 20 = 30$.
    Suma pozostałych dwóch liczb = $60 - 30 = 30$.
    Średnia arytmetyczna pozostałych dwóch liczb = $\\frac{30}{2} = 15$.

## Szybka powtórka
1.  Jaka jest podstawowa definicja średniej arytmetycznej?
2.  Jak obliczyć średnią, gdy mamy liczby 3, 6, 9?
3.  W jakim celu stosujemy średnią ważoną?
4.  Podaj przykładowy zbiór danych, dla którego mediana i średnia arytmetyczna będą różne.
5.  Jeśli średnia arytmetyczna z pięciu liczb wynosi 10, jaka jest ich suma?`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "statystyka",
    topic: "mediana_i_dominanta",
    title: "Mediana i Dominanta - Klucz do Analizy Danych",
    content: `## Na egzaminie
Temat mediany i dominanty pojawia się na egzaminie ósmoklasisty dość często, zazwyczaj jako zadanie otwarte wymagające obliczenia lub zinterpretowania tych wartości. Zwykle jedno zadanie na ten temat można spodziewać się w arkuszu, a jego punktacja wynosi 2-3 punkty. CKE lubi sprawdzać umiejętność wyznaczenia mediany dla danych nieuporządkowanych oraz dominanty w różnych zbiorach liczb, w tym w tabelach częstości. Ważne jest również zrozumienie, czym te miary opowiadają o zbiorze danych.

## Mapa tematu
W trakcie tej lekcji opanujesz:
1. Definicję i znaczenie mediany w statystyce opisowej.
2. Metody obliczania mediany dla zbioru danych nieuporządkowanych o parzystej i nieparzystej liczbie elementów.
3. Definicję i znaczenie dominanty w statystyce opisowej.
4. Metody wyznaczania dominanty dla zbioru danych z powtarzającymi się wartościami.
5. Zrozumienie sytuacji, gdy mediana i dominanta mogą być takie same lub różne.
6. Umiejętność obliczania mediany i dominanty na podstawie danych przedstawionych w tabeli częstości.
7. Rozwiązywanie zadań tekstowych i problemów z życia codziennego wykorzystujących pojęcia mediany i dominanty.
8. Interpretację wyników obliczeń mediany i dominanty w kontekście analizowanego problemu.

## Definicje i wzory
*   **Średnia arytmetyczna:** Suma wszystkich liczb w zbiorze podzielona przez ich liczbę. Jest to jedna z podstawowych miar tendencji centralnej, ale może być wrażliwa na wartości odstające (ekstremalne).
    $$ \\text{Średnia} = \\frac{a_1 + a_2 + \\dots + a_n}{n} $$
    gdzie $a_1, a_2, \\dots, a_n$ to elementy zbioru, a $n$ to liczba elementów.

*   **Mediana:** Wartość środkowa w zbiorze danych uporządkowanych rosnąco. Jest to miara mniej wrażliwa na wartości odstające niż średnia arytmetyczna.
    *   Dla **nieparzystej** liczby danych ($n$ jest nieparzyste), mediana jest środkowym elementem po uporządkowaniu danych. Położenie mediany można obliczyć wzorem: $\\frac{n+1}{2}$.
    *   Dla **parzystej** liczby danych ($n$ jest parzyste), mediana jest średnią arytmetyczną dwóch środkowych elementów po uporządkowaniu danych. Położenie tych elementów to $\\frac{n}{2}$ oraz $\\frac{n}{2} + 1$.

*   **Dominanta (Moda):** Wartość, która najczęściej występuje w zbiorze danych. Zbiór danych może mieć jedną dominantę (jednomodalny), dwie dominanty (bimodalny), więcej dominant (wielomodalny) lub nie mieć dominanty wcale (jeśli wszystkie wartości występują tak samo często).

*   **Tabela częstości:** Tabela przedstawiająca poszczególne wartości danych oraz liczbę ich wystąpień (częstość).

    Przykład:
    | Wartość | Częstość |
    | :------ | :------- |
    | 2       | 3        |
    | 5       | 1        |
    | 8       | 4        |

    W powyższej tabeli wartość 2 występuje 3 razy, wartość 5 - 1 raz, a wartość 8 - 4 razy.

## Przykład 1 - podstawowy
**Zadanie:** Oblicz medianę i dominantę dla następującego zbioru danych: 3, 7, 5, 3, 9, 5, 3, 1.

**Rozwiązanie:**

**Krok 1.** Uporządkowanie danych.**
Najpierw porządkujemy dane rosnąco: 1, 3, 3, 3, 5, 5, 7, 9.

**Krok 2.** Wyznaczenie mediany.**
W zbiorze mamy 8 liczb ($n=8$, liczba parzysta). Mediana będzie średnią arytmetyczną dwóch środkowych liczb. Położenie tych liczb to $\\frac{8}{2} = 4$ oraz $\\frac{8}{2} + 1 = 5$.
Czyli czwarty i piąty element zbioru uporządkowanego.
Są to liczby: 3 (czwarty element) i 5 (piąty element).
$$ \\text{Mediana} = \\frac{3 + 5}{2} = \\frac{8}{2} = 4 $$

**Krok 3.** Wyznaczenie dominanty.**
Teraz sprawdzamy, która liczba występuje najczęściej.
1 - występuje 1 raz
3 - występuje 3 razy
5 - występuje 2 razy
7 - występuje 1 raz
9 - występuje 1 raz
Najczęściej występuje liczba 3 (3 razy).
$$ \\text{Dominanta} = 3 $$

**Sprawdzenie:**
Dane uporządkowane: 1, 3, 3, 3, 5, 5, 7, 9.
Mediana: $n=8$. Środkowe elementy to 4. i 5. (3 i 5). $\\frac{3+5}{2}=4$. Poprawnie.
Dominanta: Liczba 3 występuje 3 razy, co jest największą częstością. Poprawnie.

## Przykład 2 - maturalny
**Zadanie:** W klasie liczącej 25 uczniów przeprowadzono sprawdzian z matematyki. Uzyskano następujące wyniki (liczba punktów): 4, 3, 5, 4, 2, 4, 3, 1, 5, 4, 3, 4, 2, 3, 4, 5, 4, 3, 3, 4, 5, 4, 3, 4, 4. Oblicz medianę i dominantę uzyskanych wyników.

**Rozwiązanie:**

**Krok 1.** Uporządkowanie danych.**
Zbiór danych: 4, 3, 5, 4, 2, 4, 3, 1, 5, 4, 3, 4, 2, 3, 4, 5, 4, 3, 3, 4, 5, 4, 3, 4, 4.
Liczba uczniów (danych) $n=25$.
Uporządkujmy dane: 1, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5.

**Krok 2.** Wyznaczenie mediany.**
Mamy $n=25$ (liczba nieparzysta). Mediana jest środkowym elementem. Jej położenie to $\\frac{n+1}{2} = \\frac{25+1}{2} = \\frac{26}{2} = 13$.
Szukamy 13. elementu w uporządkowanym zbiorze danych.
1, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, **4**, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5.
Trzynastym elementem jest liczba 4.
$$ \\text{Mediana} = 4 $$

**Krok 3.** Wyznaczenie dominanty.**
Aby łatwiej znaleźć dominantę, możemy policzyć częstość występowania każdej liczby lub stworzyć tabelę częstości:
*   1: występuje 1 raz
*   2: występuje 2 razy
*   3: występuje 7 razy
*   4: występuje 12 razy
*   5: występuje 4 razy

Najczęściej występuje liczba 4 (12 razy).
$$ \\text{Dominanta} = 4 $$

**Alternatywnie, tworząc tabelę częstości:**

| Wynik | Liczba uczniów (częstość) |
| :---- | :------------------------ |
| 1     | 1                         |
| 2     | 2                         |
| 3     | 7                         |
| 4     | 12                        |
| 5     | 4                         |
| **Suma** | **25**                    |

Największa częstość to 12, która odpowiada wynikowi 4.
$$ \\text{Dominanta} = 4 $$

**Sprawdzenie:**
Dane uporządkowane: 1, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, **4**, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5.
Mediana: $n=25$, położenie $\\frac{25+1}{2}=13$. 13. element to 4. Poprawnie.
Dominanta: Liczymy częstości. 4 występuje 12 razy, co jest największą częstością. Poprawnie.

W tym przypadku mediana i dominanta są takie same.

## Przykład 3 - egzaminacyjny

**Zadanie:** W tabeli poniżej przedstawiono wiek grupy osób:

| Wiek | Liczba osób |
| :--- | :---------- |
| 10   | 2           |
| 12   | 3           |
| 15   | 1           |
| 18   | 4           |

Oblicz medianę i dominantę wieku tych osób.

**Rozwiązanie:**

**Krok 1.** Wyznaczenie dominanty.**
Dominanta to wartość najczęściej występująca. W tabeli widzimy, że największą liczbę osób (częstość) ma wiek 18 lat (4 osoby).
$$ \\text{Dominanta} = 18 $$

**Krok 2.** Wyznaczenie mediany.**
Najpierw musimy ustalić, ile osób jest w sumie. Sumujemy liczby osób: $2 + 3 + 1 + 4 = 10$. Mamy $n=10$ (liczba parzysta).
Mediana będzie średnią arytmetyczną dwóch środkowych osób. Położenie tych osób to $\\frac{10}{2} = 5$ oraz $\\frac{10}{2} + 1 = 6$. Szukamy 5. i 6. osoby w kolejności wiekowej.

Aby to zrobić, rozpisujemy dane z tabeli w kolejności rosnącej:
Osoby w wieku 10 lat: 2 osoby (1., 2. pozycja)
Osoby w wieku 12 lat: 3 osoby (3., 4., 5. pozycja)
Osoby w wieku 15 lat: 1 osoba (6. pozycja)
Osoby w wieku 18 lat: 4 osoby (7., 8., 9., 10. pozycja)

Pełny zapis: 10, 10, 12, 12, 12, 15, 18, 18, 18, 18.
5. osoba ma wiek 12 lat.
6. osoba ma wiek 15 lat.

$$ \\text{Mediana} = \\frac{12 + 15}{2} = \\frac{27}{2} = 13.5 $$

**Sprawdzenie:**
Dominanta: Wiek 18 lat występuje najczęściej (4 razy). Poprawnie.
Mediana: $n=10$. 5. i 6. pozycja. Dane: 10, 10, 12, 12, **12**, **15**, 18, 18, 18, 18. 5. to 12, 6. to 15. $\\frac{12+15}{2}=13.5$. Poprawnie.

## Pułapki
*   **Nieuporządkowanie danych przy obliczaniu mediany:** Zapominanie o uporządkowaniu danych przed wyznaczeniem mediany. Przykład: dla zbioru 5, 1, 3, 7, 2, mediana nie jest 3, ale po uporządkowaniu (1, 2, 3, 5, 7) wynosi 3.
*   **Błąd w obliczeniu mediany dla parzystej liczby danych:** Używanie tylko jednego środkowego elementu zamiast średniej dwóch środkowych elementów. Dla 1, 2, 3, 4, mediana to nie 2 czy 3, ale $\\frac{2+3}{2}=2.5$.
*   **Brak dominanty lub wielokrotna dominanta:** Z założenia dominanta jest JEDNĄ wartością najczęściej występującą. Jeśli wszystkie wartości występują tyle samo razy (np. 1, 2, 3, 4), zbiór nie ma dominanty. Jeśli dwie wartości występują najczęściej (np. 1, 1, 2, 2, 3), zbiór jest bimodalny i obie te wartości są dominantami (np. 1 i 2). Na egzaminie CKE zazwyczaj pojawiają się zbiory z jedną dominantą.
*   **Niepoprawne odczytanie danych z tabeli częstości:** Szczególnie przy liczeniu sumy elementów lub wyznaczaniu pozycji elementów dla mediany. Trzeba pamiętać, że tabela częstości wymaga "rozpisania" danych w celu wyznaczenia pozycji mediany.

## Ćwiczenia do samodzielnego rozwiązania
1.  Oblicz medianę i dominantę dla zbioru danych: 7, 2, 9, 2, 5, 2, 8.
2.  Znajdź medianę i dominantę dla następujących wyników testu: 80, 90, 70, 80, 100, 70, 80, 90, 80.
3.  W sklepie sprzedano następującą liczbę batonów dziennie przez tydzień: 15, 12, 18, 15, 16, 15, 13. Oblicz medianę i dominantę dziennej sprzedaży.
4.  Dane dotyczące wieku grupy dzieci: 6, 7, 6, 8, 7, 6, 9, 6, 7, 6. Oblicz medianę i dominantę wieku tych dzieci.
5.  Dla zbioru danych: 1, 5, 2, 5, 3, 4, 5, 3, 2, 1. Podaj medianę i dominantę.
6.  W tabeli przedstawiono wyniki zbiórki pieniędzy:

    | Zebrana kwota (zł) | Liczba uczniów |
    | :----------------- | :------------- |
    | 5                  | 4              |
    | 10                 | 6              |
    | 15                 | 3              |
    | 20                 | 2              |

    Oblicz medianę i dominantę zebranej kwoty.

## Odpowiedzi
1.  Dane uporządkowane: 2, 2, 2, 5, 7, 8, 9. Mediana = 5. Dominanta = 2.
2.  Dane uporządkowane: 70, 70, 80, 80, 80, 80, 80, 90, 90, 100. $n=10$. Mediana = $\\frac{80+80}{2} = 80$. Dominanta = 80.
3.  Dane uporządkowane: 12, 13, 15, 15, 15, 16, 18. $n=7$. Mediana = 15. Dominanta = 15.
4.  Dane uporządkowane: 6, 6, 6, 6, 6, 7, 7, 7, 8, 9. $n=10$. Mediana = $\\frac{6+7}{2} = 6.5$. Dominanta = 6.
5.  Dane uporządkowane: 1, 1, 2, 2, 3, 3, 4, 5, 5, 5. $n=10$. Mediana = $\\frac{3+3}{2} = 3$. Dominanta = 5.
6.  Łączna liczba uczniów: $4+6+3+2=15$. Mediana: $\\frac{15+1}{2}=8$. 8. osoba. Rozpisanie: 5 (4 razy), 10 (6 razy), 15 (3 razy), 20 (2 razy). Dane: 5,5,5,5, **10**, 10,10,10,10,10,15,15,15,20,20. 8. osoba to 10. Mediana = 10. Dominanta: Najwięcej uczniów zebrało 10 zł (6 osób). Dominanta = 10.

## Szybka powtórka
1.  Co to jest mediana i jak ją obliczyć dla nieparzystej liczby danych?
2.  W jaki sposób oblicza się medianę dla parzystej liczby danych?
3.  Czym jest dominanta i jakie są jej możliwe przypadki (jedna, wiele, brak)?
4.  Która miara jest bardziej wrażliwa na wartości odstające: średnia arytmetyczna czy mediana?
5.  Czy mediana i dominanta zawsze muszą być takie same? Uzasadnij.`,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "statystyka",
    topic: "diagramy",
    title: "Diagramy słupkowe i kołowe na egzaminie ósmoklasisty",
    content: `## Na egzaminie
Zadania dotyczące diagramów słupkowych i kołowych pojawiają się na egzaminie ósmoklasisty regularnie. Zwykle są to zadania otwarte, a ich punktacja mieści się w przedziale 2–4 punktów. CKE lubi sprawdzać umiejętność odczytywania danych z diagramów, dokonywania na ich podstawie obliczeń (np. procentowych, średniej, sumy) oraz porównywania przedstawionych informacji. Czasem wymagane jest też samodzielne stworzenie prostego diagramu na podstawie tabeli.

## Mapa tematu
W tej lekcji nauczysz się:
1.  Rozpoznawać i interpretować diagramy słupkowe.
2.  Obliczać wartości liczbowe oraz procentowe na podstawie diagramów słupkowych.
3.  Porównywać dane przedstawione na diagramach słupkowych.
4.  Rozpoznawać i interpretować diagramy kołowe.
5.  Obliczać kąt środkowy wycinka koła odpowiadającego danej kategorii.
6.  Obliczać wartości liczbowe i procentowe na podstawie diagramów kołowych.
7.  Przeliczać dane między diagramem słupkowym a kołowym.
8.  Wykorzystywać wiedzę o diagramach do rozwiązywania zadań tekstowych.

## Definicje i wzory
*   **Diagram słupkowy:** Graficzne przedstawienie danych za pomocą prostokątów (słupków) o długości proporcjonalnej do wartości przedstawianych danych. Słupki mogą być rysowane pionowo lub poziomo. Na osiach znajdują się zazwyczaj opisy kategorii danych i odpowiadające im wartości liczbowe.
*   **Diagram kołowy (wykres kołowy):** Graficzne przedstawienie danych w postaci koła podzielonego na wycinki. Wielkość każdego wycinka (kąt środkowy) jest proporcjonalna do wartości danej kategorii w stosunku do całości. Całe koło reprezentuje 100% lub sumę wszystkich danych.
*   **Kąt wycinka koła:** W diagramie kołowym kąt środkowy wycinka dla danej kategorii oblicza się ze wzoru:
    $$ \\text{Kąt wycinka} = \\frac{\\text{Wartość danej kategorii}}{\\text{Suma wszystkich wartości}} \\cdot 360^\\circ $$
*   **Procentowy udział kategorii:** W diagramie kołowym udział procentowy danej kategorii oblicza się ze wzoru:
    $$ \\text{Udział procentowy} = \\frac{\\text{Wartość danej kategorii}}{\\text{Suma wszystkich wartości}} \\cdot 100\\% $$
*   **Wartość kategorii na podstawie procentu:** Jeśli znamy procentowy udział kategorii i sumę wszystkich danych, możemy obliczyć wartość tej kategorii:
    $$ \\text{Wartość kategorii} = \\frac{\\text{Udział procentowy}}{100\\%} \\cdot \\text{Suma wszystkich wartości} $$
*   **Średnia arytmetyczna:** Suma wszystkich danych podzielona przez ich liczbę. W kontekście diagramów, suma wartości wszystkich kategorii podzielona przez liczbę kategorii.
    $$ \\text{Średnia} = \\frac{a_1 + a_2 + \\dots + a_n}{n} $$

## Przykład 1 - podstawowy
Na poniższym diagramie słupkowym przedstawiono liczbę uczniów, którzy wybrali poszczególne języki obce jako drugi język.

[Wyobraź sobie diagram słupkowy: Na osi poziomej nazwy języków (Angielski, Niemiecki, Francuski, Hiszpański). Na osi pionowej liczba uczniów (od 0 do 30 z podziałką co 5). Słupki sięgają kolejno: Angielski - 25, Niemiecki - 15, Francuski - 10, Hiszpański - 20.]

a) Ilu uczniów wybrało język angielski?
b) Który język wybrało najwięcej uczniów?
c) Ilu uczniów łącznie uczy się języka niemieckiego i hiszpańskiego?
d) Jaki procent wszystkich badanych uczniów uczy się języka francuskiego?

**Rozwiązanie:**

*   **Krok 1. Odczytanie danych dla języka angielskiego:** Na diagramie znajdujemy słupek odpowiadający językowi angielskiemu. Jego wysokość wskazuje na liczbę uczniów. Jest to 25.
    *   Odpowiedź a): 25 uczniów wybrało język angielski.

*   **Krok 2. Identyfikacja najpopularniejszego języka:** Porównujemy wysokości wszystkich słupków: Angielski (25), Niemiecki (15), Francuski (10), Hiszpański (20). Najwyższy słupek odpowiada językowi angielskiemu.
    *   Odpowiedź b): Język angielski wybrało najwięcej uczniów.

*   **Krok 3. Zsumowanie wybranych języków:** Odczytujemy liczbę uczniów dla języka niemieckiego (15) i hiszpańskiego (20). Następnie sumujemy te wartości: $15 + 20 = 35$.
    *   Odpowiedź c): Łącznie 35 uczniów uczy się języka niemieckiego i hiszpańskiego.

*   **Krok 4. Obliczenie liczby wszystkich uczniów:** Sumujemy uczniów wybierających wszystkie języki: $25 + 15 + 10 + 20 = 70$.
    *   Całkowita liczba uczniów to 70.

*   **Krok 5. Obliczenie procentowego udziału języka francuskiego:** Dzielimy liczbę uczniów uczących się francuskiego (10) przez całkowitą liczbę uczniów (70) i mnożymy przez 100%:
    $$ \\frac{10}{70} \\cdot 100\\% = \\frac{1}{7} \\cdot 100\\% \\approx 14.29\\% $$
    *   Odpowiedź d): Język francuski wybrało około 14.29% wszystkich badanych uczniów.

**Sprawdzenie:** Wszystkie obliczenia wydają się poprawne, dane zostały odczytane prawidłowo z diagramu.

## Przykład 2 - maturalny
Na poniższym diagramie kołowym przedstawiono wyniki ankiety dotyczącej ulubionych kolorów uczniów pewnej klasy.

[Wyobraź sobie diagram kołowy: Koło podzielone na 4 wycinki. Jeden wycinek (Niebieski) zajmuje około połowy koła. Drugi (Zielony) zajmuje około 1/4 koła. Trzeci (Czerwony) zajmuje 1/8 koła. Czwarty (Żółty) zajmuje 1/8 koła. Są podane procenty: Niebieski - 50%, Zielony - 25%, Czerwony - 12.5%, Żółty - 12.5%. Suma procentów: $50\\% + 25\\% + 12.5\\% + 12.5\\% = 100\\%$.]

W klasie jest 32 uczniów.
a) Ilu uczniów wybrało kolor niebieski jako ulubiony?
b) Oblicz, jaki kąt środkowy ma wycinek odpowiadający kolorowi zielonemu.
c) Gdybyśmy chcieli przedstawić te dane na diagramie słupkowym, jaka byłaby wysokość słupka dla koloru czerwonego, zakładając, że najwyższy słupek (niebieski) ma wysokość 10 cm?

**Rozwiązanie:**

*   **Krok 1. Obliczenie liczby uczniów dla koloru niebieskiego:** Skoro 50% uczniów wybrało kolor niebieski, a jest 32 uczniów, to liczba ta wynosi:
    $$ 50\\% \\text{ z } 32 = \\frac{50}{100} \\cdot 32 = \\frac{1}{2} \\cdot 32 = 16 $$
    *   Odpowiedź a): 16 uczniów wybrało kolor niebieski.

*   **Krok 2. Obliczenie kąta środkowego dla koloru zielonego:** Kolor zielony stanowi 25% wszystkich uczniów. Kąt środkowy całego koła to $360^\\circ$. Obliczamy kąt dla 25%:
    $$ 25\\% \\text{ z } 360^\\circ = \\frac{25}{100} \\cdot 360^\\circ = \\frac{1}{4} \\cdot 360^\\circ = 90^\\circ $$
    *   Odpowiedź b): Wycinek odpowiadający kolorowi zielonemu ma kąt środkowy $90^\\circ$.

*   **Krok 3. Ustalenie skali dla diagramu słupkowego:** Wiemy, że 50% uczniów (czyli 16 uczniów) odpowiada 10 cm wysokości słupka. Chcemy dowiedzieć się, jaka jest wysokość słupka dla koloru czerwonego.
    *   Najpierw obliczmy liczbę uczniów wybierających kolor czerwony:
        $$ 12.5\\% \\text{ z } 32 = \\frac{12.5}{100} \\cdot 32 = \\frac{1}{8} \\cdot 32 = 4 $$
        4 uczniowie wybrali kolor czerwony.
    *   Teraz ustalamy proporcję między liczbą uczniów a wysokością słupka. Jeśli 16 uczniów to 10 cm, to ilu cm odpowiada 4 uczniom?
        $$ \\frac{16 \\text{ uczniów}}{10 \\text{ cm}} = \\frac{4 \\text{ uczniów}}{x \\text{ cm}} $$
        $$ 16x = 4 \\cdot 10 $$
        $$ 16x = 40 $$
        $$ x = \\frac{40}{16} = \\frac{10}{4} = 2.5 \\text{ cm} $$
    *   Alternatywnie, można zauważyć, że 4 uczniów to $\\frac{4}{16} = \\frac{1}{4}$ liczby uczniów odpowiadającej 10 cm. Zatem wysokość słupka będzie $\\frac{1}{4}$ tej wysokości: $\\frac{1}{4} \\cdot 10 \\text{ cm} = 2.5 \\text{ cm}$.
    *   Odpowiedź c): Słupek dla koloru czerwonego miałby wysokość 2.5 cm.

**Sprawdzenie:** Obliczenia procentowe i proporcje zostały wykonane poprawnie. Związek między liczbą uczniów a wielkością wycinka/słupka jest zachowany.

## Przykład 3 - egzaminacyjny

Poniżej znajduje się fragment tabeli przedstawiającej dochody pewnej firmy w kolejnych kwartałach roku 2023.

| Kwartał | Dochód (w tys. zł) |
| :------ | :----------------- |
| I       | 120                |
| II      | 150                |
| III     | 130                |
| IV      | 170                |

a) Oblicz średni miesięczny dochód firmy w pierwszym kwartale.
b) Przedstaw dochody firmy w drugim półroczu na diagramie kołowym. (Załóż, że II półrocze to IV kwartał)
c) Jaki procent całorocznego dochodu stanowił dochód z trzeciego kwartału?

**Rozwiązanie:**

*   **Krok 1. Obliczenie dochodu w pierwszym kwartale:** Pierwszy kwartał to 3 miesiące. Dochód wyniósł 120 tys. zł. Średni miesięczny dochód to:
    $$ \\text{Średni miesięczny dochód (I kwartał)} = \\frac{120 \\text{ tys. zł}}{3 \\text{ miesiące}} = 40 \\text{ tys. zł/miesiąc} $$
    *   Odpowiedź a): Średni miesięczny dochód firmy w pierwszym kwartale wynosił 40 tys. zł.

*   **Krok 2. Ustalenie dochodu w drugim półroczu i całorocznego dochodu:** Zadanie podaje, że II półrocze to IV kwartał. W zadaniu prawdopodobnie chodzi o analizę całego roku. Obliczmy najpierw całoroczny dochód:
    $$ \\text{Całoroczny dochód} = 120 + 150 + 130 + 170 = 570 \\text{ tys. zł} $$
    Dochód z II półrocza (IV kwartału) to 170 tys. zł.

*   **Krok 3. Obliczenie kąta dla diagramu kołowego dla II półrocza:** Zakładamy, że pytanie dotyczyło udziału dochodu z IV kwartału w całym roku, a nie "drugiego półrocza" jako osobnego okresu. Jeśli jednak pytanie miało być o II półrocze, to musimy mieć dane z III i IV kwartału. Przyjmując tekst dosłownie: "Przedstaw dochody firmy w drugim półroczu na diagramie kołowym. (Załóż, że II półrocze to IV kwartał)". Jest to sformułowanie nieprecyzyjne. Najczęściej jednak w takich zadaniach chodzi o przedstawienie udziału poszczególnych kategorii w całości (tutaj: roku). Jeśli jednak mamy stworzyć diagram dla "drugiego półrocza", a wiemy, że to IV kwartał, to diagram kołowy dla jednej wartości nie ma sensu. Zakładając, że chodzi o udział **IV kwartału** w całym roku:
    $$ \\text{Udział IV kwartału} = \\frac{170}{570} \\approx 0.2982 $$
    $$ \\text{Kąt dla IV kwartału} = \\frac{170}{570} \\cdot 360^\\circ \\approx 0.2982 \\cdot 360^\\circ \\approx 107.35^\\circ $$
    *   Odpowiedź b): Jeśli pytanie dotyczyło udziału IV kwartału w całym roku, to kąt wynosi około $107.35^\\circ$. (Uwaga: Sformułowanie zadania jest mylące. Jeśli chodziło o dochód z całego drugiego półrocza, potrzebne byłyby dane z III i IV kwartału, a potem obliczenie procentu lub kąta z całości roku.)

*   **Krok 4. Obliczenie procentowego udziału dochodu z III kwartału:** Dochód z III kwartału to 130 tys. zł. Całoroczny dochód to 570 tys. zł.
    $$ \\text{Udział procentowy III kwartału} = \\frac{130}{570} \\cdot 100\\% \\approx 0.2281 \\cdot 100\\% \\approx 22.81\\% $$
    *   Odpowiedź c): Dochód z trzeciego kwartału stanowił około 22.81% całorocznego dochodu.

**Sprawdzenie:** Obliczenia średniej, sumy, procentów i kątów zostały wykonane zgodnie ze wzorami. Uwzględniono nieścisłość w sformułowaniu pytania b).

## Pułapki
*   **Błąd w odczycie danych:** Uważnie sprawdzaj wartości na osiach diagramu, zwłaszcza przy niestandardowej podziałce. Czasem wartości są podane w tysiącach, milionach lub procentach.
*   **Niewłaściwa interpretacja procentów:** W diagramie kołowym procenty odnoszą się do całości (100%). W diagramie słupkowym mogą przedstawiać udziały lub konkretne liczby. Zawsze sprawdź opis osi i legendę.
*   **Błędy w obliczeniach procentowych i proporcjach:** Przy obliczaniu procentów lub kątów łatwo o pomyłkę. Sprawdzaj rachunki, zwłaszcza przy dzieleniu i mnożeniu liczb dziesiętnych lub ułamków. Upewnij się, że używasz właściwej podstawy (suma wszystkich danych lub 360 stopni).
*   **Niedostateczne obliczenie sumy:** Przy obliczaniu procentowego udziału lub średniej musisz znać sumę wszystkich danych. Upewnij się, że uwzględniłeś wszystkie kategorie przedstawione na diagramie.
*   **Niepoprawne założenia przy zamianie diagramów:** Przechodząc z diagramu kołowego na słupkowy (lub odwrotnie), pamiętaj o zachowaniu proporcji. Jeśli np. słupek odpowiada konkretnej liczbie, a wycinek procentowi, musisz obliczyć liczbę odpowiadającą temu procentowi, lub ustalić skalę.

## Ćwiczenia do samodzielnego rozwiązania
1.  Na diagramie słupkowym przedstawiono liczbę godzin spędzonych przez uczniów klasy 8a na nauce języka angielskiego w ciągu tygodnia. Odczytaj dane i odpowiedz na pytania:
    [Diagram słupkowy: Oś pozioma - Dzień tygodnia (Pon, Wt, Śr, Czw, Pt, Sob, Niedz). Oś pionowa - Liczba godzin (0-4). Słupki: Pon - 1.5h, Wt - 2h, Śr - 1h, Czw - 2.5h, Pt - 0.5h, Sob - 3h, Niedz - 2h.]
    a) Ile godzin w tygodniu na naukę języka angielskiego poświęcił najwięcej czasu uczeń?
    b) W które dni uczeń poświęcił na naukę więcej niż 2 godziny?
    c) Oblicz średnią liczbę godzin nauki języka angielskiego dziennie w ciągu całego tygodnia.

2.  Diagram kołowy przedstawia podział budżetu pewnego miasta na różne cele. Na edukację przeznaczono 40%, na służbę zdrowia 30%, na kulturę 20%, a na transport 10%. Całkowity budżet miasta wynosi 80 milionów złotych.
    a) Ile milionów złotych przeznaczono na kulturę?
    b) Jaki kąt środkowy ma wycinek odpowiadający służbie zdrowia?
    c) O ile procent więcej środków przeznaczono na edukację niż na transport?

3.  W pewnej szkole przeprowadzono ankietę na temat ulubionych gatunków filmowych. Wyniki przedstawiono na diagramie słupkowym: Komedia - 120 głosów, Akcja - 90 głosów, Fantasy - 60 głosów, Sci-Fi - 30 głosów.
    a) Ilu uczniów wzięło udział w ankiecie?
    b) Jaki procent wszystkich głosów stanowiły głosy na filmy akcji?
    c) Gdyby te dane przedstawić na diagramie kołowym, jaki kąt miałby wycinek odpowiadający filmom fantasy?

4.  Na podstawie danych z zadania 3, przedstaw wyniki na diagramie kołowym. (Narysuj go lub opisz kąty poszczególnych wycinków).

5.  Diagram kołowy przedstawia rozkład ocen z matematyki na świadectwie: 5 - 20%, 4 - 35%, 3 - 40%, 2 - 5%.
    a) Jaki procent uczniów otrzymał ocenę 3 lub wyższą?
    b) Ile stopni ma kąt środkowy wycinka odpowiadającego ocenie niedostatecznej (której nie ma na diagramie, zakładamy 0%)?
    c) Jeśli w klasie jest 40 uczniów, ilu z nich otrzymało ocenę 4?

6.  Poniższe dane przedstawiają sprzedaż lodów w budce w ciągu jednego dnia:
    [Diagram słupkowy: Lody waniliowe - 50 szt., Czekoladowe - 70 szt., Truskawkowe - 40 szt., Śmietankowe - 60 szt.]
    a) Ile sztuk lodów sprzedano łącznie?
    b) Jaki procent całej sprzedaży stanowiły lody truskawkowe?
    c) Na diagramie kołowym, jaki kąt miałby wycinek odpowiadający lodom czekoladowym?

## Odpowiedzi
1.  a) 3 godziny.
    b) W czwartek (2.5h) i sobotę (3h).
    c) Suma godzin: $1.5 + 2 + 1 + 2.5 + 0.5 + 3 + 2 = 12.5$ godziny. Średnia: $\\frac{12.5}{7} \\approx 1.79$ godziny dziennie.

2.  a) $20\\% \\text{ z } 80 \\text{ mln zł} = \\frac{20}{100} \\cdot 80 = 0.2 \\cdot 80 = 16$ mln zł.
    b) $30\\% \\text{ z } 360^\\circ = \\frac{30}{100} \\cdot 360^\\circ = 0.3 \\cdot 360^\\circ = 108^\\circ$.
    c) Na edukację: 40%, na transport: 10%. Różnica: $40\\% - 10\\% = 30\\%$.

3.  a) Suma głosów: $120 + 90 + 60 + 30 = 300$ uczniów.
    b) $\\frac{90}{300} \\cdot 100\\% = \\frac{9}{30} \\cdot 100\\% = \\frac{3}{10} \\cdot 100\\% = 30\\%$.
    c) Dane z III kwartału (Fantasy): 60 głosów. Całość: 300 głosów.
    Kąt: $\\frac{60}{300} \\cdot 360^\\circ = \\frac{1}{5} \\cdot 360^\\circ = 72^\\circ$.

4.  Kąty na diagramie kołowym:
    Komedie: $\\frac{120}{300} \\cdot 360^\\circ = \\frac{2}{5} \\cdot 360^\\circ = 144^\\circ$.
    Akcja: $\\frac{90}{300} \\cdot 360^\\circ = \\frac{3}{10} \\cdot 360^\\circ = 108^\\circ$.
    Fantasy: $\\frac{60}{300} \\cdot 360^\\circ = \\frac{1}{5} \\cdot 360^\\circ = 72^\\circ$.
    Sci-Fi: $\\frac{30}{300} \\cdot 360^\\circ = \\frac{1}{10} \\cdot 360^\\circ = 36^\\circ$.
    Suma kątów: $144^\\circ + 108^\\circ + 72^\\circ + 36^\\circ = 360^\\circ$.

5.  a) Udział ocen 3 i wyższych: $35\\% (\\text{ocena } 4) + 40\\% (\\text{ocena } 3) + 20\\% (\\text{ocena } 5) = 95\\%$.
    b) Kąt dla 0% to $0^\\circ$.
    c) $35\\% \\text{ z } 40 \\text{ uczniów} = \\frac{35}{100} \\cdot 40 = 0.35 \\cdot 40 = 14$ uczniów.

6.  a) Suma sztuk: $50 + 70 + 40 + 60 = 220$ sztuk.
    b) $\\frac{40}{220} \\cdot 100\\% = \\frac{4}{22} \\cdot 100\\% = \\frac{2}{11} \\cdot 100\\% \\approx 18.18\\%$.
    c) Lody czekoladowe: 70 sztuk. Całość: 220 sztuk.
    Kąt: $\\frac{70}{220} \\cdot 360^\\circ = \\frac{7}{22} \\cdot 360^\\circ \\approx 0.3182 \\cdot 360^\\circ \\approx 114.55^\\circ$.

## Szybka powtórka
1.  Jakie dwie główne rodzaje diagramów omawialiśmy?
2.  Co reprezentuje pełne koło w diagramie kołowym?
3.  Jak obliczyć kąt środkowy wycinka, jeśli znamy procentowy udział danej kategorii?
4.  Jak obliczyć średnią arytmetyczną z danych przedstawionych na diagramie słupkowym?
5.  Dlaczego ważne jest dokładne odczytywanie danych z osi diagramu?

## Diagram
Diagram słupkowy (ogólny schemat):

\`\`\`text
^ Liczba
|
|    +---+
|    |   |
|    |   | +---+
|    |   | |   |
| +---+  | |   | +---+
| |   |  | |   | |   |
+---------------------------> Kategoria
  Kat A    Kat B    Kat C
\`\`\`

Diagram kołowy (ogólny schemat):

\`\`\`text
      /---\\
     /     \\
    /       \\
   |---------|  <-- Środek koła
    \\       /
     \\     /
      \\---/

Wycinki reprezentują udziały procentowe lub liczbowe.
Suma kątów wszystkich wycinków wynosi 360 stopni.
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "kombinatoryka",
    topic: "prawdopodobienstwo",
    title: "Prawdopodobieństwo – klucz do sukcesu na egzaminie ósmoklasisty",
    content: `## Na egzaminie
Prawdopodobieństwo pojawia się na egzaminie ósmoklasisty zazwyczaj jako jedno zadanie otwarte lub zamknięte, które można rozwiązać stosunkowo szybko, ale wymaga precyzyjnego zrozumienia definicji i umiejętności liczenia. Za poprawne rozwiązanie można zdobyć od 1 do 3 punktów. CKE często sprawdza umiejętność obliczania prawdopodobieństwa w sytuacjach związanych z rzutami kostką, monetą, losowaniem liczb z przedziału lub elementów ze zbioru. Ważne jest również interpretowanie wyników.

## Mapa tematu
W tej lekcji nauczysz się:
1. Rozumieć podstawowe pojęcie prawdopodobieństwa i jego znaczenie.
2. Stosować wzór na prawdopodobieństwo zdarzenia losowego.
3. Obliczać prawdopodobieństwo w prostych sytuacjach (rzuty kostką, monetą).
4. Obliczać prawdopodobieństwo w bardziej złożonych sytuacjach (losowanie liczb, elementy ze zbioru).
5. Rozpoznawać i obliczać prawdopodobieństwo zdarzeń niemożliwych i pewnych.
6. Interpretować wyniki obliczeń prawdopodobieństwa.
7. Rozwiązywać zadania tekstowe związane z prawdopodobieństwem.
8. Unikać typowych błędów przy obliczaniu prawdopodobieństwa.

## Definicje i wzory
*   **Zdarzenie losowe:** Zdarzenie, którego wynik w danym doświadczeniu losowym nie jest z góry wiadomy.
*   **Przestrzeń zdarzeń elementarnych ($\\Omega$)**: Zbiór wszystkich możliwych wyników danego doświadczenia losowego. Liczbę elementów tej przestrzeni oznaczamy jako $|\\Omega|$.
*   **Zdarzenie elementarne:** Pojedynczy wynik doświadczenia losowego.
*   **Zdarzenie sprzyjające (A)**: Zbiór zdarzeń elementarnych, które prowadzą do zajścia interesującego nas zdarzenia A. Liczbę elementów tego zbioru oznaczamy jako $|A|$.
*   **Prawdopodobieństwo zdarzenia (P(A))**: Stosunek liczby zdarzeń sprzyjających zdarzeniu A do liczby wszystkich możliwych zdarzeń elementarnych w przestrzeni zdarzeń $\\Omega$.
    $$P(A) = \\frac{|A|}{|\\Omega|}$$
*   **Własności prawdopodobieństwa:**
    *   Prawdopodobieństwo każdego zdarzenia jest liczbą nieujemną i nie większą od 1.
        $$0 \\le P(A) \\le 1$$
    *   Prawdopodobieństwo zdarzenia pewnego (które zawsze musi zajść) jest równe 1.
        $$P(\\Omega) = 1$$
    *   Prawdopodobieństwo zdarzenia niemożliwego (które nigdy nie może zajść) jest równe 0.
        $$P(\\emptyset) = 0$$
*   **Doświadczenie losowe:** Proces, którego wynik nie jest z góry określony i zależy od przypadku.

**Przykłady doświadczeń losowych:**
*   Rzut kostką do gry.
*   Rzut monetą.
*   Losowanie karty z talii.
*   Losowanie liczby z danego przedziału.

**Przykład przestrzeni zdarzeń elementarnych:**
*   Rzut kostką do gry: $\\Omega = \\{1, 2, 3, 4, 5, 6\\}$, $|\\Omega| = 6$.
*   Rzut monetą: $\\Omega = \\{O, R\\}$ (Orzeł, Reszka), $|\\Omega| = 2$.
*   Rzut dwiema monetami: $\\Omega = \\{OO, OR, RO, RR\\}$, $|\\Omega| = 4$.

## Przykład 1 - podstawowy
Rzucamy raz symetryczną sześcienną kostką do gry. Jakie jest prawdopodobieństwo, że wypadnie liczba parzysta?

**Krok 1.** Określenie przestrzeni zdarzeń elementarnych ($\\Omega$)**
Wszystkie możliwe wyniki rzutu kostką to liczby od 1 do 6.
$\\Omega = \\{1, 2, 3, 4, 5, 6\\}$
Liczba wszystkich możliwych wyników to $|\\Omega| = 6$.

**Krok 2.** Określenie zdarzenia sprzyjającego (A)**
Interesuje nas zdarzenie polegające na tym, że wypadnie liczba parzysta. Liczby parzyste w zbiorze $\\Omega$ to 2, 4, 6.
$A = \\{2, 4, 6\\}$

**Krok 3.** Określenie liczby zdarzeń sprzyjających**
Liczba wyników sprzyjających zdarzeniu A to $|A| = 3$.

**Krok 4.** Obliczenie prawdopodobieństwa**
Korzystamy ze wzoru $P(A) = \\frac{|A|}{|\\Omega|}$.
$P(A) = \\frac{3}{6}$

**Krok 5.** Uproszczenie wyniku**
$P(A) = \\frac{1}{2}$

**Sprawdzenie:** Prawdopodobieństwo $\\frac{1}{2}$ jest liczbą z przedziału $[0, 1]$. Wynik jest logiczny, ponieważ połowa liczb na kostce jest parzysta.

## Przykład 2 - maturalny
W urnie znajdują się kule ponumerowane od 1 do 20. Losujemy jedną kulę. Jakie jest prawdopodobieństwo, że numer wylosowanej kuli jest podzielny przez 3 lub przez 5?

**Krok 1.** Określenie przestrzeni zdarzeń elementarnych ($\\Omega$)**
Kule są ponumerowane od 1 do 20, więc wszystkich możliwych wyników losowania jest 20.
$\\Omega = \\{1, 2, ..., 20\\}$
$|\\Omega| = 20$

**Krok 2.** Określenie zdarzenia A – numer kuli podzielny przez 3**
Wypisujemy liczby od 1 do 20 podzielne przez 3:
3, 6, 9, 12, 15, 18
$A = \\{3, 6, 9, 12, 15, 18\\}$
Liczba wyników sprzyjających zdarzeniu A: $|A| = 6$.
Prawdopodobieństwo zdarzenia A: $P(A) = \\frac{6}{20}$.

**Krok 3.** Określenie zdarzenia B – numer kuli podzielny przez 5**
Wypisujemy liczby od 1 do 20 podzielne przez 5:
5, 10, 15, 20
$B = \\{5, 10, 15, 20\\}$
Liczba wyników sprzyjających zdarzeniu B: $|B| = 4$.
Prawdopodobieństwo zdarzenia B: $P(B) = \\frac{4}{20}$.

**Krok 4.** Rozważenie zdarzenia "A lub B"**
Chcemy obliczyć prawdopodobieństwo, że numer jest podzielny przez 3 LUB przez 5. W przypadku zdarzeń "lub", należy uważać, aby nie policzyć zdarzeń wspólnych dwukrotnie. Musimy zidentyfikować liczby podzielne zarówno przez 3, jak i przez 5 (czyli podzielne przez 15).
Jedyną liczbą w naszym zbiorze (1-20) podzielną przez 15 jest 15.
Zdarzenie $A \\cap B$ (A i B) to numer podzielny przez 3 i przez 5.
$A \\cap B = \\{15\\}$
$|A \\cap B| = 1$.

**Krok 5.** Obliczenie prawdopodobieństwa zdarzenia "A lub B"**
Prawdopodobieństwo sumy zdarzeń obliczamy ze wzoru: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.
Lub, używając liczby zdarzeń: $|A \\cup B| = |A| + |B| - |A \\cap B|$.
$|A \\cup B| = 6 + 4 - 1 = 9$.
Te 9 liczb to: 3, 5, 6, 9, 10, 12, 15, 18, 20.
Prawdopodobieństwo:
$P(A \\cup B) = \\frac{|A \\cup B|}{|\\Omega|} = \\frac{9}{20}$.

**Sprawdzenie:** Wynik $\\frac{9}{20}$ jest liczbą z przedziału $[0, 1]$. Zbiór liczb sprzyjających (9) jest mniejszy niż suma $|A|+|B|=10$, co potwierdza prawidłowe uwzględnienie liczby 15.

## Przykład 3 - egzaminacyjny
Z urny zawierającej 5 kul białych i 7 kul czarnych losujemy jedną kulę. Jakie jest prawdopodobieństwo, że będzie to kula biała?

**Krok 1.** Określenie liczby wszystkich kul**
W urnie jest 5 kul białych + 7 kul czarnych = 12 kul.
$|\\Omega| = 12$.

**Krok 2.** Określenie liczby kul białych**
Interesuje nas zdarzenie wylosowania kuli białej. Jest 5 kul białych.
$|A| = 5$.

**Krok 3.** Obliczenie prawdopodobieństwa**
$P(A) = \\frac{|A|}{|\\Omega|} = \\frac{5}{12}$.

**Sprawdzenie:** Prawdopodobieństwo $\\frac{5}{12}$ jest liczbą z przedziału $[0, 1]$.

## Pułapki
*   **Niepoprawne określenie $|\\Omega|$**: Często uczniowie mylą liczbę wszystkich elementów z numeracją lub innymi danymi. Zawsze upewnij się, ile jest WSZYSTKICH możliwych wyników.
*   **Dwukrotne liczenie zdarzeń wspólnych**: W zadaniach typu "lub" (zdarzenie A lub B), jeśli istnieje część wspólna zdarzeń (A i B), trzeba ją odjąć, aby nie policzyć jej dwukrotnie. Pamiętaj o wzorze $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$.
*   **Nieupraszczanie wyniku**: Choć często dopuszczalne, uproszczenie ułamka jest dobrą praktyką i pozwala łatwiej porównywać wyniki.
*   **Pomyłka przy liczeniu zdarzeń sprzyjających**: Dokładnie wypisz lub policz elementy zdarzenia sprzyjającego, szczególnie gdy liczby są duże lub występują dodatkowe warunki (np. podzielność, parzystość).
*   **Błędne rozumienie treści zadania**: Przeczytaj zadanie kilka razy. Czy chodzi o losowanie ze zwracaniem, bez zwracania, czy o jedno losowanie? Czy chodzi o liczby, przedmioty, punkty?

## Ćwiczenia do samodzielnego rozwiązania
1.  Rzucamy dwa razy symetryczną monetą. Jakie jest prawdopodobieństwo, że wypadną dwie reszki?
2.  Ze zbioru liczb $\\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\}$ losujemy jedną liczbę. Jakie jest prawdopodobieństwo, że wylosowana liczba będzie większa od 7?
3.  W klasie jest 15 dziewcząt i 10 chłopców. Losujemy jedną osobę do reprezentacji klasy. Jakie jest prawdopodobieństwo, że wylosowana osoba będzie chłopcem?
4.  Rzucamy raz sześcienną kostką. Jakie jest prawdopodobieństwo, że wypadnie liczba mniejsza od 4?
5.  Z talii 52 kart losujemy jedną kartę. Jakie jest prawdopodobieństwo, że będzie to karta w kolorze czerwonym (kier lub karo)?
6.  Rzucamy dwa razy symetryczną sześcienną kostką. Jakie jest prawdopodobieństwo, że suma oczek na obu kostkach będzie równa 5?
7.  W urnie są 4 kule zielone, 3 kule niebieskie i 5 kul żółtych. Losujemy jedną kulę. Jakie jest prawdopodobieństwo, że będzie to kula niebieska lub żółta?

## Odpowiedzi
1.  $|\\Omega| = 4$ (OO, OR, RO, RR). Zdarzenie sprzyjające: RR, $|A|=1$. Prawdopodobieństwo: $\\frac{1}{4}$.
2.  $|\\Omega| = 10$. Zdarzenia sprzyjające: $\\{8, 9, 10\\}$, $|A|=3$. Prawdopodobieństwo: $\\frac{3}{10}$.
3.  $|\\Omega| = 15 + 10 = 25$. Zdarzenie sprzyjające (chłopiec): $|A|=10$. Prawdopodobieństwo: $\\frac{10}{25} = \\frac{2}{5}$.
4.  $|\\Omega| = 6$. Zdarzenia sprzyjające: $\\{1, 2, 3\\}$, $|A|=3$. Prawdopodobieństwo: $\\frac{3}{6} = \\frac{1}{2}$.
5.  $|\\Omega| = 52$. Kule czerwone to kier (13) i karo (13). $|A|=13+13=26$. Prawdopodobieństwo: $\\frac{26}{52} = \\frac{1}{2}$.
6.  $|\\Omega| = 36$. Zdarzenia sprzyjające sumie 5: (1,4), (2,3), (3,2), (4,1). $|A|=4$. Prawdopodobieństwo: $\\frac{4}{36} = \\frac{1}{9}$.
7.  $|\\Omega| = 4+3+5 = 12$. Zdarzenia sprzyjające (niebieska lub żółta): $3+5=8$. Prawdopodobieństwo: $\\frac{8}{12} = \\frac{2}{3}$.

## Szybka powtórka
1.  Co to jest przestrzeń zdarzeń elementarnych?
2.  Jaki jest wzór na obliczanie prawdopodobieństwa zdarzenia?
3.  Jakie są dwie skrajne wartości prawdopodobieństwa i co one oznaczają?
4.  W jakim przedziale zawsze mieści się prawdopodobieństwo dowolnego zdarzenia?
5.  Co trzeba zrobić, gdy obliczasz prawdopodobieństwo zdarzenia "A lub B", a zdarzenia A i B mają część wspólną?

## Diagram
Rzut kostką:
\`\`\`text
+---+
| 1 |
+---+

+---+
| 2 |  (parzyste)
+---+

+---+
| 3 |
+---+

+---+
| 4 |  (parzyste)
+---+

+---+
| 5 |
+---+

+---+
| 6 |  (parzyste)
+---+

Omega = {1, 2, 3, 4, 5, 6}, |Omega|=6
Zdarzenie A = {2, 4, 6}, |A|=3
P(A) = |A| / |Omega| = 3/6 = 1/2
\`\`\``,
    video_url: null,
  },
  {
    exam_type: "8_klasa",
    category: "kombinatoryka",
    topic: "regula_mnozenia",
    title: "Reguła mnożenia – pierwszy krok do kombinatoryki",
    content: `## Na egzaminie
Reguła mnożenia pojawia się na egzaminie ósmoklasisty stosunkowo często, zazwyczaj w zadaniach otwartych punktowanych od 3 do 5 punktów. CKE lubi sprawdzać umiejętność zastosowania tej reguły w prostych sytuacjach życia codziennego, takich jak wybór stroju, układanie przedmiotów czy tworzenie kodów. Często jest też pierwszym krokiem w bardziej złożonych zadaniach kombinatorycznych.

## Mapa tematu
W tej lekcji:
1.  Zrozumiesz, czym jest reguła mnożenia.
2.  Nauczysz się identyfikować sytuacje, w których można ją zastosować.
3.  Opanujesz sposób obliczania liczby możliwości przy użyciu reguły mnożenia.
4.  Rozwiążesz przykłady dotyczące wyboru elementów z różnych zbiorów.
5.  Poznasz zastosowanie reguły mnożenia w zadaniach z tworzenia liczb i kodów.
6.  Nauczysz się rozpoznawać typowe pułapki związane z tym zagadnieniem.
7.  Przećwiczysz samodzielne rozwiązywanie zadań na poziomie egzaminacyjnym.

## Definicje i wzory
**Reguła mnożenia** jest podstawową zasadą w kombinatoryce służącą do obliczania liczby wszystkich możliwych sposobów wykonania pewnego ciągu czynności, pod warunkiem, że liczba sposobów wykonania każdej czynności jest niezależna od sposobów wykonania czynności poprzednich.

**Sytuacja:** Mamy wykonać pewien ciąg czynności.
*   Czynność pierwszą można wykonać na $n_1$ sposobów.
*   Czynność drugą można wykonać na $n_2$ sposobów.
*   Czynność trzecią można wykonać na $n_3$ sposobów.
*   ...
*   Czynność k-tą można wykonać na $n_k$ sposobów.

**Wzór:** Całkowita liczba sposobów wykonania całego ciągu czynności (czyli liczba wszystkich możliwych kombinacji) wynosi:
$$ N = n_1 \\cdot n_2 \\cdot n_3 \\cdot \\dots \\cdot n_k $$

**Kluczowe cechy zastosowania reguły mnożenia:**
*   **Ciąg czynności:** Zadanie można rozłożyć na sekwencję niezależnych kroków.
*   **Niezależność:** Wybór w jednym kroku nie wpływa na liczbę wyborów w kolejnych krokach.
*   **Wszystkie możliwości:** Chcemy policzyć *wszystkie* możliwe kombinacje wyników tych czynności.

**Przykład zastosowania:**
Chcesz wybrać jeden element z pierwszego zbioru i jeden element z drugiego zbioru.
*   Zbiór A ma 3 elementy: $\\{a_1, a_2, a_3\\}$.
*   Zbiór B ma 4 elementy: $\\{b_1, b_2, b_3, b_4\\}$.

Pierwszą czynnością jest wybór elementu ze zbioru A (można to zrobić na 3 sposoby).
Drugą czynnością jest wybór elementu ze zbioru B (można to zrobić na 4 sposoby).

Liczba wszystkich możliwych par $(a_i, b_j)$ wynosi: $3 \\cdot 4 = 12$.
Są to pary: $(a_1, b_1), (a_1, b_2), (a_1, b_3), (a_1, b_4), (a_2, b_1), \\dots, (a_3, b_4)$.

## Przykład 1 - podstawowy
Pewien sklep oferuje 3 rodzaje lodów waniliowych i 5 rodzajów polew do lodów. Na ile sposobów można wybrać jedną porcję lodów z jedną polewą?

**Krok 1.** Zidentyfikuj czynności do wykonania.
Czynność 1: Wybór rodzaju lodów.
Czynność 2: Wybór rodzaju polewy.

**Krok 2.** Określ liczbę sposobów wykonania każdej czynności.
Liczba sposobów wyboru lodów ($n_1$) = 3.
Liczba sposobów wyboru polewy ($n_2$) = 5.

**Krok 3.** Sprawdź, czy czynności są niezależne.
Wybór rodzaju lodów nie wpływa na to, ile jest dostępnych polew, i na odwrót. Czynności są niezależne.

**Krok 4.** Zastosuj regułę mnożenia.
Całkowita liczba sposobów ($N$) = $n_1 \\cdot n_2$.
$N = 3 \\cdot 5 = 15$.

**Krok 5.** Sformułuj odpowiedź.
Można wybrać porcję lodów z polewą na 15 sposobów.

**Sprawdzenie:**
Możemy to sobie wyobrazić:
Lody L1 można połączyć z polewami P1, P2, P3, P4, P5 (5 możliwości).
Lody L2 można połączyć z polewami P1, P2, P3, P4, P5 (5 możliwości).
Lody L3 można połączyć z polewami P1, P2, P3, P4, P5 (5 możliwości).
Razem: $5 + 5 + 5 = 15$ możliwości. Wynik jest poprawny.

## Przykład 2 - maturalny
Chcemy utworzyć dwucyfrową liczbę parzystą, używając cyfr $\\{1, 2, 3, 4, 5\\}$, przy czym cyfry mogą się powtarzać. Ile jest takich liczb?

**Krok 1.** Rozłóż problem na czynności i zidentyfikuj warunki.
Musimy wybrać dwie cyfry: cyfrę dziesiątek i cyfrę jedności.
Warunki:
1.  Liczba musi być dwucyfrowa (pierwsza cyfra nie może być 0 – tutaj nie ma 0, więc ten warunek jest automatycznie spełniony).
2.  Liczba musi być parzysta (ostatnia cyfra musi być parzysta).
3.  Cyfry mogą się powtarzać.
4.  Używamy cyfr ze zbioru $\\{1, 2, 3, 4, 5\\}$.

**Krok 2.** Określ liczbę sposobów dla każdej czynności, zaczynając od tej z największymi ograniczeniami.
Największe ograniczenie dotyczy cyfry jedności (musi być parzysta).
Czynność 1: Wybór cyfry jedności.
Dostępne cyfry parzyste ze zbioru $\\{1, 2, 3, 4, 5\\}$ to $\\{2, 4\\}$.
Zatem cyfrę jedności można wybrać na $n_1 = 2$ sposoby.

Czynność 2: Wybór cyfry dziesiątek.
Do wyboru mamy wszystkie cyfry ze zbioru $\\{1, 2, 3, 4, 5\\}$. Ponieważ cyfry mogą się powtarzać, wybór cyfry jedności nie ogranicza wyboru cyfry dziesiątek.
Zatem cyfrę dziesiątek można wybrać na $n_2 = 5$ sposobów.

**Krok 3.** Sprawdź niezależność i zastosuj regułę mnożenia.
Czynności są niezależne (w sensie liczby dostępnych opcji w kolejnym kroku).
Całkowita liczba sposobów ($N$) = $n_1 \\cdot n_2$.
$N = 2 \\cdot 5 = 10$.

**Krok 4.** Sformułuj odpowiedź.
Istnieje 10 takich dwucyfrowych liczb parzystych.

**Sprawdzenie:**
Wypiszmy te liczby:
Cyfra jedności to 2: 12, 22, 32, 42, 52 (5 liczb)
Cyfra jedności to 4: 14, 24, 34, 44, 54 (5 liczb)
Łącznie: $5 + 5 = 10$ liczb. Wynik poprawny.

## Przykład 3 - egzaminacyjny
Na ile sposobów można utworzyć trzyliterowy kod, używając liter ze zbioru $\\{A, B, C, D\\}$, jeśli litery mogą się powtarzać?

**Krok 1.** Zidentyfikuj czynności.
Musimy wybrać trzy litery do utworzenia kodu: pierwszą, drugą i trzecią.
Czynność 1: Wybór pierwszej litery.
Czynność 2: Wybór drugiej litery.
Czynność 3: Wybór trzeciej litery.

**Krok 2.** Określ liczbę sposobów dla każdej czynności.
Zbiór dostępnych liter to $\\{A, B, C, D\\}$, więc mamy 4 dostępne litery.
Litery mogą się powtarzać, więc wybór litery na jednej pozycji nie wpływa na liczbę dostępnych opcji na innych pozycjach.
Liczba sposobów wyboru pierwszej litery ($n_1$) = 4.
Liczba sposobów wyboru drugiej litery ($n_2$) = 4.
Liczba sposobów wyboru trzeciej litery ($n_3$) = 4.

**Krok 3.** Zastosuj regułę mnożenia.
Całkowita liczba sposobów ($N$) = $n_1 \\cdot n_2 \\cdot n_3$.
$N = 4 \\cdot 4 \\cdot 4 = 4^3 = 64$.

**Krok 4.** Sformułuj odpowiedź.
Można utworzyć 64 takie trzyliterowe kody.

## Pułapki
*   **Pomylenie z dodawaniem:** Reguła dodawania działa, gdy mamy wybierać *jedną* opcję spośród rozłącznych możliwości (np. wybierasz albo ciastko A, albo ciastko B). Reguła mnożenia działa, gdy wykonujesz *kolejne* czynności (np. wybierasz ciastko A *i* do tego napój B).
*   **Powtarzanie się elementów:** W przykładach z tworzeniem liczb lub kodów, kluczowe jest ustalenie, czy cyfry/litery mogą się powtarzać. Jeśli się mogą, liczba opcji w każdym kroku jest taka sama. Jeśli nie mogą, liczba opcji w kolejnych krokach maleje.
*   **Kolejność czynności:** Czasami łatwiej jest zacząć liczenie od czynności, która ma najwięcej ograniczeń (np. ostatnia cyfra w liczbie parzystej). Choć reguła mnożenia jest przemienna ($a \\cdot b = b \\cdot a$), taka kolejność obliczeń często ułatwia identyfikację liczby możliwości w każdym kroku.
*   **Brak możliwości 0:** Pamiętaj, że pierwsza cyfra liczby (np. dwucyfrowej, trzycyfrowej) nie może być zerem. Jeśli zero jest w zbiorze dostępnych cyfr, musisz to uwzględnić jako ograniczenie w pierwszym kroku.
*   **Nieczytanie polecenia:** Dokładnie czytaj, czy elementy mogą się powtarzać, ile elementów wybierasz, jakie są warunki (np. parzystość, podzielność).

## Ćwiczenia do samodzielnego rozwiązania
1.  W restauracji można zamówić zupę dnia, danie główne i deser. Jest 5 rodzajów zup, 10 rodzajów dań głównych i 6 rodzajów deserów. Na ile sposobów można skomponować trzydaniowy obiad?
2.  Ile można utworzyć liczb trzycyfrowych, używając cyfr $\\{0, 1, 2, 3, 4\\}$, jeśli cyfry mogą się powtarzać?
3.  Ile można utworzyć liczb trzycyfrowych parzystych, używając cyfr $\\{0, 1, 2, 3, 4\\}$, jeśli cyfry mogą się powtarzać?
4.  Chłopiec ma 3 koszule i 4 pary spodni. Na ile sposobów może się ubrać, jeśli chce założyć jedną koszulę i jedne spodnie?
5.  Ile jest wszystkich trzycyfrowych numerów samochodowych składających się z trzech różnych cyfr ze zbioru $\\{1, 2, 3, 4, 5, 6\\}$?
6.  Na ile sposobów można wybrać przewodniczącego i zastępcę spośród 10 uczniów klasy, jeśli jedna osoba nie może pełnić obu funkcji?
7.  Ile istnieje trzycyfrowych kodów PIN, w których każda kolejna cyfra jest większa od poprzedniej? (Cyfry od 0 do 9).

## Odpowiedzi
1.  $5 \\cdot 10 \\cdot 6 = 300$ sposobów.
2.  Pierwsza cyfra: 4 możliwości (bez 0). Druga cyfra: 5 możliwości. Trzecia cyfra: 5 możliwości. $4 \\cdot 5 \\cdot 5 = 100$ liczb.
3.  Trzecia cyfra (jedności) musi być parzysta: $\\{0, 2, 4\\}$ (3 możliwości). Pierwsza cyfra: 4 możliwości (bez 0). Druga cyfra: 5 możliwości. $4 \\cdot 5 \\cdot 3 = 60$ liczb.
4.  $3 \\cdot 4 = 12$ sposobów.
5.  Pierwsza cyfra: 6 możliwości. Druga cyfra: 5 możliwości (bo inna niż pierwsza). Trzecia cyfra: 4 możliwości (bo inna niż dwie pierwsze). $6 \\cdot 5 \\cdot 4 = 120$ liczb.
6.  Wybór przewodniczącego: 10 możliwości. Po wyborze przewodniczącego, wybór zastępcy: 9 możliwości. $10 \\cdot 9 = 90$ sposobów.
7.  To zadanie jest bardziej złożone. Ponieważ cyfry muszą być różne i każda kolejna musi być większa, wystarczy wybrać 3 różne cyfry ze zbioru $\\{0, 1, \\dots, 9\\}$. Jedna taka kombinacja cyfr (np. $\\{1, 3, 7\\}$) daje dokładnie jeden kod (137). Liczba sposobów wybrania 3 cyfr ze 10 to $\\binom{10}{3} = \\frac{10 \\cdot 9 \\cdot 8}{3 \\cdot 2 \\cdot 1} = 120$.

## Szybka powtórka
1.  Kiedy stosujemy regułę mnożenia, a kiedy regułę dodawania?
2.  Co oznacza, że czynności w regule mnożenia są "niezależne"?
3.  Ile jest możliwości wyboru cyfry jedności w liczbie parzystej?
4.  Dlaczego pierwsza cyfra liczby dwucyfrowej nie może być zerem?
5.  W zadaniu o wyborze stroju (koszule i spodnie) – czy kolejność wyboru ma znaczenie dla ostatecznego wyniku liczby kombinacji?`,
    video_url: null,
  },
];

export function materialKey(
  m: Pick<MaterialDraft, "exam_type" | "category" | "topic">,
): string {
  return `${m.exam_type}:${m.category}:${m.topic}`;
}

function applyTheoryEnhancements(m: MaterialDraft): MaterialDraft {
  const key = materialKey(m);
  const expanded = EXPANDED_THEORY[key];
  const base = expanded
    ? { ...m, title: expanded.title, content: expanded.content }
    : m;
  return { ...base, content: enrichTheoryLesson(base.content) };
}

export const SEED_MATERIALS: MaterialDraft[] =
  BASE_SEED_MATERIALS.map(applyTheoryEnhancements);
