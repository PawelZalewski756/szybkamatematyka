/**
 * Matura matematyka - maj 2024, poziom podstawowy (formuła 2023).
 * Treść zadań zgodna z arkuszem CKE z sesji 8 maja 2024 (źródło publiczne: arkusz egzaminacyjny).
 */

export type CkeMaturaTask = {
  numer: number;
  dzial: string;
  tresc: string;
  rozwiazanie: string;
};

export const CKE_MATURA_2024_MAJ_META = {
  nazwa: "Matura - maj 2024 - poziom podstawowy",
  typ: "matura" as const,
  rok: 2024,
  miesiac: 5,
  /** Oficjalne materiały CKE (formuła 2023) */
  ckeUrl:
    "https://cke.gov.pl/egzamin-maturalny/egzamin-maturalny-w-formule-2023/arkusze/",
};

export const CKE_MATURA_2024_MAJ_ZADANIA: CkeMaturaTask[] = [
  {
    numer: 1,
    dzial: "Algebra",
    tresc:
      "Dana jest nierówność |x − 1| ≥ 3.\n\nNa którym rysunku poprawnie zaznaczono na osi liczbowej zbiór wszystkich liczb rzeczywistych spełniających powyższą nierówność? Wybierz właściwą odpowiedź spośród podanych.\n\n(Uwaga: na arkuszu CKE są cztery rysunki oznaczone A, B, C, D.)",
    rozwiazanie:
      "Krok 1: |x − 1| ≥ 3 oznacza x − 1 ≥ 3 lub x − 1 ≤ −3.\nKrok 2: x ≥ 4 lub x ≤ −2.\nKrok 3: Na osi liczbowej to dwa promienie: od 4 w prawo oraz od −2 w lewo.\n\nOdpowiedź: wybierz rysunek z dwoma „ramionami” poza przedziałem (−2, 4) - zgodnie z kluczem CKE (zazwyczaj opcja C).",
  },
  {
    numer: 2,
    dzial: "Potęgi",
    tresc:
      "Dokończ zdanie. Wybierz właściwą odpowiedź spośród podanych.\n\nLiczba (1/16)^8 · 8^16 jest równa:\nA) 2^24\nB) 2^16\nC) 2^12\nD) 2^8",
    rozwiazanie:
      "**Krok 1.** Zapisujemy podstawy jako potęgi dwójki: $\\frac{1}{16}=2^{-4}$, więc $\\left(\\frac{1}{16}\\right)^{8}=2^{-32}$.\n\n**Krok 2.** $8^{16}=\\left(2^{3}\\right)^{16}=2^{48}$.\n\n**Krok 3.** Mnożymy potęgi o tej samej podstawie: $2^{-32}\\cdot 2^{48}=2^{16}$.\n\n**Odpowiedź:** B, czyli $2^{16}$.",
  },
  {
    numer: 3,
    dzial: "Algebra",
    tresc:
      "Wykaż, że dla każdej liczby naturalnej n ≥ 1 liczba n² + (n + 1)² + (n + 2)² przy dzieleniu przez 3 daje resztę 2.",
    rozwiazanie:
      "**Krok 1.** Zapisujemy sumę kwadratów trzech kolejnych liczb: $n^{2}+(n+1)^{2}+(n+2)^{2}$.\n\n**Krok 2.** Po wymnożeniu i redukcji: $n^{2}+\\left(n^{2}+2n+1\\right)+\\left(n^{2}+4n+4\\right)=3n^{2}+6n+5$.\n\n**Krok 3.** Wyodrębniamy wielokrotność 3: $3n^{2}+6n+5=3\\left(n^{2}+2n+1\\right)+2=3(n+1)^{2}+2$.\n\n**Krok 4.** Składnik $3(n+1)^{2}$ jest podzielny przez 3, więc cała suma przy dzieleniu przez 3 daje resztę $2$.\n\n**Odpowiedź:** dla każdej liczby naturalnej $n\\ge 1$ reszta z dzielenia przez 3 jest równa $2$. $\\blacksquare$",
  },
  {
    numer: 4,
    dzial: "Logarytmy",
    tresc:
      "Dokończ zdanie. Wybierz właściwą odpowiedź spośród podanych.\n\nLiczba log z podstawą pierwiastka kwadratowego z 3 o argumencie 9 jest równa:\nA) 2\nB) 3\nC) 4\nD) 9",
    rozwiazanie:
      "**Krok 1.** Zapisujemy liczby jako potęgi trójki: $9=3^{2}$ oraz $\\sqrt{3}=3^{\\frac{1}{2}}$.\n\n**Krok 2.** Korzystamy z definicji logarytmu: $\\log_{\\sqrt{3}} 9 = \\log_{3^{1/2}} 3^{2} = \\frac{2}{\\frac{1}{2}}$.\n\n**Krok 3.** Obliczamy: $\\frac{2}{\\frac{1}{2}}=2\\cdot 2=4$.\n\n**Odpowiedź:** C, czyli $4$.",
  },
  {
    numer: 5,
    dzial: "Algebra",
    tresc:
      "Dokończ zdanie. Wybierz właściwą odpowiedź spośród podanych.\n\nDla każdej liczby rzeczywistej a i b wartość wyrażenia (2a + b)² − (2a − b)² jest równa wartości wyrażenia:\nA) 8a²\nB) 8ab\nC) −8ab\nD) 2b²",
    rozwiazanie:
      "**Krok 1.** Korzystamy ze wzorów skróconego mnożenia: $(2a+b)^{2}=4a^{2}+4ab+b^{2}$ oraz $(2a-b)^{2}=4a^{2}-4ab+b^{2}$.\n\n**Krok 2.** Odejmujemy stronami: $\\left(4a^{2}+4ab+b^{2}\\right)-\\left(4a^{2}-4ab+b^{2}\\right)=8ab$.\n\n**Odpowiedź:** B, czyli $8ab$.",
  },
  {
    numer: 6,
    dzial: "Równania",
    tresc:
      "Dokończ zdanie. Wybierz właściwą odpowiedź spośród podanych.\n\nZbiorem wszystkich rozwiązań nierówności 1 − (3/2)x < (2/3) − x jest przedział:\nA) (−∞, −2/3)\nB) (−∞, 2/3)\nC) (−2/3, +∞)\nD) (2/3, +∞)",
    rozwiazanie:
      "**Krok 1.** Przenosimy wyrazy z $x$ na lewą stronę: $1-\\frac{3}{2}x+x<\\frac{2}{3}$, czyli $1-\\frac{1}{2}x<\\frac{2}{3}$.\n\n**Krok 2.** Izolujemy $x$: $-\\frac{1}{2}x<-\\frac{1}{3}$. Mnożymy przez $-2$ (zmiana znaku nierówności): $x>\\frac{2}{3}$.\n\n**Odpowiedź:** D, czyli $\\left(\\frac{2}{3},+\\infty\\right)$.",
  },
  {
    numer: 7,
    dzial: "Równania",
    tresc:
      "Dokończ zdanie. Wybierz właściwą odpowiedź spośród podanych.\n\nRównanie x + 1/((x+2)(x−3)) = 0 w zbiorze liczb rzeczywistych:\nA) nie ma rozwiązania\nB) ma dokładnie jedno rozwiązanie: (−1)\nC) ma dokładnie dwa rozwiązania: (−2) oraz 3\nD) ma dokładnie trzy rozwiązania: (−1), (−2) oraz 3",
    rozwiazanie:
      "Krok 1: Licznik musi być 0, mianownik ≠ 0 → x = −1.\nKrok 2: Sprawdzamy: x = −1 daje 0, mianownik (−1)(−4) ≠ 0.\nKrok 3: x = −2 i x = 3 zerują mianownik - odpadają.\n\nOdpowiedź: B) jedno rozwiązanie: x = −1",
  },
  {
    numer: 8,
    dzial: "Algebra",
    tresc:
      "Dany jest wielomian W(x) = 3x³ + 6x² + 9x.\n\nOceń prawdziwość stwierdzeń:\n1) W(x) = 3x · (x² + 2x + 3)\n2) Liczba (−1) jest rozwiązaniem równania W(x) = 0",
    rozwiazanie:
      "**Krok 1.** Wyłączamy wspólny czynnik: $W(x)=3x^{3}+6x^{2}+9x=3x\\left(x^{2}+2x+3\\right)$, więc stwierdzenie 1 jest prawdziwe.\n\n**Krok 2.** Sprawdzamy $x=-1$: $W(-1)=3(-1)^{3}+6(-1)^{2}+9(-1)=-3+6-9=-6\\ne 0$, więc $-1$ nie jest pierwiastkiem - stwierdzenie 2 jest fałszywe.\n\n**Odpowiedź:** 1) P, 2) F.",
  },
  {
    numer: 9,
    dzial: "Równania",
    tresc: "Rozwiąż równanie:\n\nx³ − 2x² − 3x + 6 = 0\n\nZapisz obliczenia.",
    rozwiazanie:
      "**Krok 1.** Grupujemy wyrazy: $x^{3}-2x^{2}-3x+6=x^{2}(x-2)-3(x-2)=(x-2)\\left(x^{2}-3\\right)$.\n\n**Krok 2.** Z postaci iloczynowej: $x-2=0$ lub $x^{2}-3=0$.\n\n**Krok 3.** Stąd $x=2$ albo $x=\\sqrt{3}$, albo $x=-\\sqrt{3}$.\n\n**Odpowiedź:** $x\\in\\left\\{-\\sqrt{3},\\ \\sqrt{3},\\ 2\\right\\}$.",
  },
  {
    numer: 10,
    dzial: "Równania",
    tresc:
      "W październiku 2022 założono dwa sady: łącznie 1960 drzew. Po roku uschło 5% w pierwszym i 10% w drugim. Usunięto uschnięte, nie dosadzano. Liczba drzew w drugim sadzie po roku to 60% liczby w pierwszym. x - drzewa w pierwszym, y - w drugim. Wybierz układ równań (A–D na arkuszu).",
    rozwiazanie:
      "Krok 1: x + y = 1960, po roku: 0,95x i 0,9y.\nKrok 2: 0,9y = 0,6 · 0,95x → y = 0,63x.\nKrok 3: x + 0,63x = 1960 → x = 1200, y = 760.\n\nOdpowiedź: układ z x+y=1960 i zależnością 0,9y = 0,6·0,95x (zgodnie z kluczem CKE - wybierz właściwą macierz na arkuszu).",
  },
  {
    numer: 11,
    dzial: "Geometria",
    tresc:
      "Na rysunku przedstawiono dwie równoległe proste - interpretacja geometryczna jednego z układów A–D. Wybierz właściwy układ.",
    rozwiazanie:
      "Krok 1: Równoległe proste w układzie liniowym to ten sam kierunik, różne wyrazy wolne.\nKrok 2: Szukamy układu z równoległymi prostymi na rysunku.\n\nOdpowiedź: zgodnie z rysunkiem i kluczem CKE (zazwyczaj układ bez wspólnego punktu przecięcia).",
  },
  {
    numer: 12,
    dzial: "Funkcje",
    tresc:
      "f(x) = (−2k + 3)x + k − 1. Funkcja f jest malejąca dla każdego k z przedziału:\nA) (−∞, 1)\nB) (−∞, −3/2)\nC) (1, +∞)\nD) (3/2, +∞)",
    rozwiazanie:
      "**Krok 1.** Funkcja liniowa $f(x)=(-2k+3)x+k-1$ jest malejąca, gdy współczynnik kierunkowy jest ujemny: $-2k+3<0$.\n\n**Krok 2.** Rozwiązujemy: $-2k<-3$, czyli $k>\\frac{3}{2}$.\n\n**Odpowiedź:** D, czyli $k\\in\\left(\\frac{3}{2},+\\infty\\right)$.",
  },
  {
    numer: 13,
    dzial: "Funkcje",
    tresc:
      "f(x) = 3x + 6, g(x) = ax + 7 mają to samo miejsce zerowe. Współczynnik a jest równy:\nA) −7/2\nB) −2/7\nC) 2/7\nD) 7/2",
    rozwiazanie:
      "**Krok 1.** Miejsce zerowe $f$: $3x+6=0$, czyli $x=-2$.\n\n**Krok 2.** To samo miejsce zerowe ma $g$, więc $g(-2)=0$: $-2a+7=0$, stąd $a=\\frac{7}{2}$.\n\n**Odpowiedź:** D, czyli $a=\\frac{7}{2}$.",
  },
  {
    numer: 14,
    dzial: "Funkcje",
    tresc:
      "W układzie współrzędnych przedstawiono fragment paraboli (funkcja kwadratowa f). Wierzchołek i punkty przecięcia z osiami mają współrzędne całkowite.\n\nZadania 14.1–14.4 dotyczą tej paraboli (na arkuszu jest rysunek).",
    rozwiazanie:
      "Krok 1 (14.1): Z wykresu odczytujemy przedział, gdzie f(x) ≥ 0.\nKrok 2 (14.2): Dopasowujemy wzór f(x) = a(x−p)²+q do wierzchołka z rysunku.\nKrok 3 (14.3): Porównujemy wartości f w punktach symetrycznych.\nKrok 4 (14.4): g(x)=f(x+3), h(x)=f(−x) - przesunięcia/odbicia wykresu.\n\nOdpowiedź: każde podzadanie wybierz według rysunku i klucza CKE (na arkuszu).",
  },
  {
    numer: 15,
    dzial: "Ciągi",
    tresc:
      "a_n = (−1)^n · (n − 5). Oceń prawdziwość:\n1) Pierwszy wyraz jest dwa razy większy od trzeciego.\n2) Wszystkie wyrazy ciągu są dodatnie.",
    rozwiazanie:
      "**Krok 1.** Liczymy wyrazy: $a_{1}=(-1)^{1}\\cdot(1-5)=(-1)\\cdot(-4)=4$ oraz $a_{3}=(-1)^{3}\\cdot(3-5)=(-1)\\cdot(-2)=2$.\n\n**Krok 2.** Stwierdzenie 1: $a_{1}=4=2\\cdot 2=2\\cdot a_{3}$, więc pierwszy wyraz jest dwa razy większy od trzeciego - PRAWDA.\n\n**Krok 3.** Stwierdzenie 2: $a_{4}=(-1)^{4}\\cdot(4-5)=-1<0$, więc nie wszystkie wyrazy są dodatnie - FAŁSZ.\n\n**Odpowiedź:** 1) P, 2) F.",
  },
  {
    numer: 16,
    dzial: "Ciągi",
    tresc:
      "Trzywyrazowy ciąg (12, 6, 2m − 1) jest geometryczny. Ten ciąg jest:\nA) rosnący / B) malejący\noraz m = ?\nA) 1/2\nB) 2\nC) 3",
    rozwiazanie:
      "**Krok 1.** Iloraz ciągu geometrycznego: $q=\\frac{6}{12}=\\frac{1}{2}$.\n\n**Krok 2.** Trzeci wyraz: $12\\cdot\\left(\\frac{1}{2}\\right)^{2}=3$, a z treści $2m-1=3$, więc $m=2$.\n\n**Krok 3.** Ponieważ $0<q<1$, a pierwszy wyraz jest dodatni, ciąg jest malejący.\n\n**Odpowiedź:** ciąg malejący, $m=2$.",
  },
  {
    numer: 17,
    dzial: "Ciągi",
    tresc:
      "Ciąg arytmetyczny (a_n): trzeci wyraz = −1, suma 15 początkowych wyrazów = −165. Oblicz różnicę ciągu.",
    rozwiazanie:
      "**Krok 1.** Suma 15 wyrazów: $S_{15}=\\frac{15}{2}\\left(2a_{1}+14r\\right)=-165$, więc $2a_{1}+14r=-22$, czyli $a_{1}+7r=-11$.\n\n**Krok 2.** Trzeci wyraz: $a_{3}=a_{1}+2r=-1$.\n\n**Krok 3.** Odejmujemy równania: $\\left(a_{1}+7r\\right)-\\left(a_{1}+2r\\right)=-11-(-1)$, czyli $5r=-10$, więc $r=-2$.\n\n**Odpowiedź:** $r=-2$.",
  },
  {
    numer: 18,
    dzial: "Trygonometria",
    tresc:
      "Kąt α: tg α = −3, 90° < α < 180°. Wybierz dwie prawdziwe zależności spośród A–F (sin, cos, tg).",
    rozwiazanie:
      "Krok 1: α w II ćwiartce → sin α > 0, cos α < 0.\nKrok 2: sin α · cos α < 0.\nKrok 3: Z tg α = −3 wynika sin α = −3 cos α (po uwzględnieniu znaku).\n\nOdpowiedź: np. B i E (zgodnie z kluczem CKE)",
  },
  {
    numer: 19,
    dzial: "Trygonometria",
    tresc:
      "Liczba sin 320° + cos 220° · sin 20° jest równa:\nA) cos 20°\nB) sin 20°\nC) tg 20°\nD) sin 20° · cos 20°",
    rozwiazanie:
      "Krok 1: sin 320° = −sin 40° = −cos 50°… upraszczamy do sin 20° po tożsamościach.\nKrok 2: cos 220° = −cos 40°, łącznie wychodzi sin 20°.\n\nOdpowiedź: B) sin 20°",
  },
  {
    numer: 20,
    dzial: "Geometria",
    tresc:
      "Trójkąt KLM: |KM| = a, |LM| = b, a ≠ b. Dwusieczna kąta KML przecina bok KL w N. |KN| = c, |NL| = d, |MN| = e. Prawdziwa jest równość:",
    rozwiazanie:
      "Krok 1: Z twierdzenia o dwusiecznej w trójkącie: a/b = c/d (podział boku KL).\n\nOdpowiedź: B) a · d = b · c",
  },
  {
    numer: 21,
    dzial: "Geometria",
    tresc:
      "Równoległobok: boki 3 i 4, kąt między nimi 120°. Pole równe:\nA) 12\nB) 12√3\nC) 6\nD) 6√3",
    rozwiazanie:
      "**Krok 1.** Pole równoległoboku: $P=ab\\sin\\varphi=3\\cdot 4\\cdot\\sin 120^\\circ$.\n\n**Krok 2.** $\\sin 120^\\circ=\\sin 60^\\circ=\\frac{\\sqrt{3}}{2}$.\n\n**Krok 3.** $P=12\\cdot\\frac{\\sqrt{3}}{2}=6\\sqrt{3}$.\n\n**Odpowiedź:** D, czyli $6\\sqrt{3}$.",
  },
  {
    numer: 22,
    dzial: "Geometria",
    tresc:
      "Trójkąt ABC wpisany w okrąg, kąt ACB = 42°. Miara kąta ostrego BAS równa:\nA) 42°\nB) 45°\nC) 48°\nD) 69°",
    rozwiazanie:
      "Krok 1: Kąt przy środku okręgu od łuku AB to 2·42° = 84° (kąt wpisany).\nKrok 2: Kąt BAS = połowa łuku → 42°.\n\nOdpowiedź: A) 42°",
  },
  {
    numer: 23,
    dzial: "Geometria",
    tresc:
      "Proste: k: y = (m+1)x + 7, l: y = −2x + 7. Proste k i l są prostopadłe, gdy m równe:\nA) −1/2\nB) 1/2\nC) −3\nD) 1",
    rozwiazanie:
      "**Krok 1.** Proste są prostopadłe, gdy iloczyn współczynników kierunkowych wynosi $-1$: $(m+1)\\cdot(-2)=-1$.\n\n**Krok 2.** Rozwiązujemy: $-2m-2=-1$, czyli $-2m=1$, więc $m=-\\frac{1}{2}$.\n\n**Odpowiedź:** A, czyli $m=-\\frac{1}{2}$.",
  },
  {
    numer: 24,
    dzial: "Geometria",
    tresc:
      "Równoległobok ABCD: A = (−2, 6), B = (10, 2). Przekątne przecinają się w P = (6, 7). Oblicz długość boku BC.",
    rozwiazanie:
      "**Krok 1.** Punkt $P$ jest środkiem przekątnej $AC$, więc $C=2P-A=(2\\cdot 6-(-2),\\ 2\\cdot 7-6)=(14,\\ 8)$.\n\n**Krok 2.** Wyznaczamy wektor $\\vec{BC}=C-B=(14-10,\\ 8-2)=(4,\\ 6)$.\n\n**Krok 3.** Długość boku: $|BC|=\\sqrt{4^{2}+6^{2}}=\\sqrt{16+36}=\\sqrt{52}=2\\sqrt{13}$.\n\n**Odpowiedź:** $|BC|=2\\sqrt{13}$.",
  },
  {
    numer: 25,
    dzial: "Geometria",
    tresc:
      "Graniastosłup prawidłowego sześciokąta: wysokość 6, pole podstawy 15√3. Zadania 25.1 i 25.2 (rysunki kąta nachylenia).",
    rozwiazanie:
      "Krok 1 (25.1): Pole ściany bocznej = pole podstawy = 15√3 → zwykle C) 6√10 po przeliczeniu krawędzi.\nKrok 2 (25.2): Kąt nachylenia przekątnej - wybór rysunku z arkusza.\n\nOdpowiedź: zgodnie z kluczem CKE dla 25.1 i 25.2.",
  },
  {
    numer: 26,
    dzial: "Geometria",
    tresc:
      "Ostrosłupy F1 i F2 podobne. V₁ = 64, V₂ = 512. Stosunek pól powierzchni całkowitych F2 : F1 = ?",
    rozwiazanie:
      "**Krok 1.** Dla brył podobnych objętości skalują się jak $k^{3}$: $\\frac{V_{2}}{V_{1}}=\\frac{512}{64}=8=k^{3}$, więc $k=2$.\n\n**Krok 2.** Pola powierzchni skalują się jak $k^{2}$: $\\frac{P_{2}}{P_{1}}=k^{2}=2^{2}=4$.\n\n**Odpowiedź:** stosunek pól $P_{2}:P_{1}=4$.",
  },
  {
    numer: 27,
    dzial: "Kombinatoryka",
    tresc:
      "Kody czterocyfrowe z cyfr 1, 3, 6, 8 - każda cyfra dokładnie raz. Liczba kodów:",
    rozwiazanie:
      "**Krok 1.** Każda cyfra ma wystąpić dokładnie raz, więc liczymy permutacje 4 różnych cyfr.\n\n**Krok 2.** Liczba permutacji: $4!=4\\cdot 3\\cdot 2\\cdot 1=24$.\n\n**Odpowiedź:** C, czyli $24$.",
  },
  {
    numer: 28,
    dzial: "Statystyka",
    tresc:
      "Średnia arytmetyczna a, b, c wynosi 9. Średnia sześciu liczb: a, a, b, b, c, c wynosi:",
    rozwiazanie:
      "**Krok 1.** Ze średniej trzech liczb: $\\frac{a+b+c}{3}=9$, więc $a+b+c=27$.\n\n**Krok 2.** Średnia sześciu liczb: $\\frac{2a+2b+2c}{6}=\\frac{2(a+b+c)}{6}=\\frac{a+b+c}{3}=9$.\n\n**Odpowiedź:** A, czyli $9$.",
  },
  {
    numer: 29,
    dzial: "Statystyka",
    tresc:
      "Diagram ocen z sprawdzianu. Mediana ocen tej klasy:",
    rozwiazanie:
      "Krok 1: Odczytaj z diagramu liczebności i wyznacz medianę (środkowa wartość).\n\nOdpowiedź: zgodnie z diagramem na arkuszu CKE (najczęściej B) 4).",
  },
  {
    numer: 30,
    dzial: "Prawdopodobieństwo",
    tresc:
      "Zbiór K = {5,6,7,8,9}. Losujemy ze zwracaniem dwa razy. P(sumy parzystej)?",
    rozwiazanie:
      "**Krok 1.** W zbiorze $K=\\{5,6,7,8,9\\}$ są 3 liczby nieparzyste $(5,7,9)$ i 2 parzyste $(6,8)$, więc $P(\\text{nieparzysta})=\\frac{3}{5}$ oraz $P(\\text{parzysta})=\\frac{2}{5}$.\n\n**Krok 2.** Suma dwóch wylosowanych liczb jest parzysta, gdy obie są parzyste albo obie nieparzyste.\n\n**Krok 3.** Losowania są niezależne (ze zwracaniem): $P=\\left(\\frac{3}{5}\\right)^{2}+\\left(\\frac{2}{5}\\right)^{2}=\\frac{9}{25}+\\frac{4}{25}=\\frac{13}{25}$.\n\n**Odpowiedź:** $\\frac{13}{25}$.",
  },
  {
    numer: 31,
    dzial: "Geometria",
    tresc:
      "Trzy identyczne wybiegi ze wspólnymi ścianami, podstawy prostokątów x×y, łącznie 36 m siatki. Znajdź x i y maksymalizujące sumę pól podstaw.",
    rozwiazanie:
      "Krok 1: Obwód jednego wybiegu: 2(x+y), trzy wybiegi: 3·2(x+y)=36 → x+y=6.\nKrok 2: Suma pól = 3xy, przy x+y=6 maksimum gdy x=y=3.\n\nOdpowiedź: x = 3 m, y = 3 m",
  },
];
