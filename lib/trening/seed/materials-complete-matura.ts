import {
  buildLesson,
  type AdditionalMaterial,
} from "@/lib/trening/seed/additional-materials";

/**
 * Lekcje teorii dla nowych tematów matury podstawowej z drzewa CKE.
 * Każda lekcja korzysta z buildLesson, więc ma sekcję "## Na egzaminie"
 * i pełny układ: mapa, definicje, przykłady, pułapki, ćwiczenia, odpowiedzi.
 */
export const COMPLETE_MATURA_MATERIALS: AdditionalMaterial[] = [
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "pierwiastki",
    title: "Pierwiastki dowolnego stopnia - własności i upraszczanie",
    examNote:
      "Pierwiastki pojawiają się w zadaniach na upraszczanie wyrażeń, usuwanie niewymierności i obliczanie wartości. CKE najczęściej sprawdza wyłączanie czynnika przed znak pierwiastka oraz działania na pierwiastkach tego samego stopnia.",
    map:
      "1. Odczytasz pierwiastek arytmetyczny i jego stopień.\n2. Wyłączysz pełny kwadrat lub sześcian przed znak pierwiastka.\n3. Pomnożysz i podzielisz pierwiastki tego samego stopnia.\n4. Usuniesz niewymierność z mianownika.\n5. Odróżnisz pierwiastek parzystego i nieparzystego stopnia.",
    definitions:
      "**Pierwiastek arytmetyczny** $\\sqrt[n]{a}$ to nieujemna liczba, której $n$-ta potęga wynosi $a$. Dla pierwiastka kwadratowego $\\sqrt{a}\\ge0$ i $(\\sqrt{a})^2=a$. Dla stopnia nieparzystego pierwiastek liczby ujemnej jest ujemny, np. $\\sqrt[3]{-8}=-2$.\n\nDla $a,b\\ge0$ zachodzi $\\sqrt{a\\cdot b}=\\sqrt a\\cdot\\sqrt b$ oraz $\\sqrt{\\frac ab}=\\frac{\\sqrt a}{\\sqrt b}$ dla $b>0$. Wyłączanie czynnika polega na zapisie $\\sqrt{k^2m}=k\\sqrt m$. Niewymierność usuwamy, mnożąc licznik i mianownik przez pierwiastek: $\\frac1{\\sqrt a}=\\frac{\\sqrt a}{a}$.",
    example1:
      "Uprość $\\sqrt{72}$. Rozkładamy $72=36\\cdot2=6^2\\cdot2$, więc $\\sqrt{72}=\\sqrt{6^2\\cdot2}=6\\sqrt2$. Czynnik $6$ wyszedł przed pierwiastek, a pod pierwiastkiem został czynnik bez pełnego kwadratu.",
    example2:
      "Oblicz $\\sqrt3\\cdot\\sqrt{12}$. Najpierw łączymy pierwiastki: $\\sqrt3\\cdot\\sqrt{12}=\\sqrt{36}=6$. Alternatywnie $\\sqrt{12}=2\\sqrt3$, więc iloczyn to $2\\cdot3=6$. Wynik jest liczbą wymierną, choć oba czynniki były niewymierne.",
    pitfalls:
      "* $\\sqrt{a+b}\\ne\\sqrt a+\\sqrt b$ - pierwiastek nie rozdziela się na sumę.\n* Dla parzystego stopnia $\\sqrt{x^2}=|x|$, a nie zawsze $x$.\n* Nie można wyłączyć czynnika, jeśli nie tworzy on pełnej potęgi o danym stopniu.\n* Przy usuwaniu niewymierności mnożymy przez cały pierwiastek, nie przez samą liczbę pod pierwiastkiem.\n* Pierwiastek stopnia parzystego z liczby ujemnej nie istnieje w zbiorze liczb rzeczywistych.",
    exercises:
      "1. Uprość $\\sqrt{50}$.\n2. Oblicz $\\sqrt2\\cdot\\sqrt8$.\n3. Usuń niewymierność z mianownika $\\frac{3}{\\sqrt6}$.\n4. Uprość $\\sqrt[3]{54}$.\n5. Oblicz $(\\sqrt{11})^2$.\n6. Uprość $\\sqrt{18}+\\sqrt{8}$.",
    answers:
      "1. $5\\sqrt2$.\n2. $4$.\n3. $\\frac{\\sqrt6}{2}$.\n4. $3\\sqrt[3]{2}$.\n5. $11$.\n6. $3\\sqrt2+2\\sqrt2=5\\sqrt2$.",
    recap:
      "1. Kiedy $\\sqrt{x^2}=|x|$?\n2. Jak wyłączyć czynnik przed znak pierwiastka?\n3. Jak usunąć niewymierność z mianownika?\n4. Czy $\\sqrt{a+b}=\\sqrt a+\\sqrt b$?\n5. Kiedy pierwiastek stopnia parzystego nie istnieje?",
    diagram:
      "pierwiastek\n   ↓\n rozkład na czynniki\n   ↓\n pełna potęga? → wyłącz\n   ↓\n działania: √a·√b = √(ab)\n   ↓\n usuń niewymierność",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "dowody_podzielnosci",
    title: "Dowody podzielności - cechy i reszty",
    examNote:
      "Zadania o podzielności sprawdzają rozumowanie i znajomość cech podzielności. Na maturze podstawowej wystarczy uzasadnić podzielność przez rozkład na czynniki, zapis liczby jako wielokrotności lub obliczenie reszty.",
    map:
      "1. Zastosujesz cechy podzielności przez 2, 3, 5 i 9.\n2. Zapiszesz liczbę w postaci $n=ak+r$.\n3. Rozłożysz wyrażenie na czynniki, aby wykazać podzielność.\n4. Uzasadnisz podzielność iloczynu liczb kolejnych.\n5. Obliczysz resztę bez dzielenia pisemnego.",
    definitions:
      "Mówimy, że $a$ dzieli $b$, gdy istnieje całkowite $k$ takie, że $b=a\\cdot k$; zapisujemy $a\\mid b$. W dzieleniu z resztą $b=aq+r$, gdzie $0\\le r<a$.\n\nLiczba dzieli się przez $2$, gdy jest parzysta; przez $5$, gdy kończy się na $0$ lub $5$; przez $3$ i $9$, gdy suma jej cyfr dzieli się odpowiednio przez $3$ i $9$. Iloczyn $n(n+1)$ jest zawsze parzysty, a iloczyn $n(n+1)(n+2)$ dzieli się przez $6$. Liczba $10^k-1$ składa się z $k$ dziewiątek, więc dzieli się przez $9$.",
    example1:
      "Wykaż, że $n(n+1)$ jest podzielne przez $2$. Liczby $n$ i $n+1$ są kolejne, więc jedna z nich jest parzysta. Iloczyn liczby parzystej i dowolnej liczby całkowitej jest parzysty, czyli dzieli się przez $2$.",
    example2:
      "Oblicz resztę z dzielenia $4^{5}-1$ przez $3$. Ponieważ $4\\equiv1\\pmod3$, to $4^5\\equiv1\\pmod3$, więc $4^5-1\\equiv0\\pmod3$. Reszta wynosi $0$; istotnie $4^5-1=1023=3\\cdot341$.",
    pitfalls:
      "* Cecha podzielności przez $3$ dotyczy sumy cyfr, a nie ostatniej cyfry.\n* Reszta musi być mniejsza od dzielnika.\n* Iloczyn dwóch kolejnych liczb jest parzysty, ale nie zawsze dzieli się przez $4$.\n* Przy dowodzie nie wystarczy sprawdzić kilku przykładów - trzeba uzasadnić dla dowolnego $n$.\n* Zapis $4\\equiv1\\pmod3$ pozwala podnosić obie strony do potęgi.",
    exercises:
      "1. Sprawdź, czy $4716$ dzieli się przez $3$ i $9$.\n2. Podaj resztę z dzielenia $1234$ przez $9$.\n3. Uzasadnij, że $10^4-1$ dzieli się przez $9$.\n4. Wykaż, że iloczyn trzech kolejnych liczb całkowitych dzieli się przez $6$.\n5. Podaj resztę z dzielenia $7^2-1$ przez $3$.\n6. Czy $n^3-n$ jest zawsze podzielne przez $6$?",
    answers:
      "1. Suma cyfr $18$, więc przez $3$ i $9$ tak.\n2. $1+2+3+4=10$, reszta $1$.\n3. $10^4-1=9999=9\\cdot1111$.\n4. Jedna z liczb jest parzysta, a jedna dzieli się przez $3$, więc iloczyn dzieli się przez $6$.\n5. $49-1=48$, reszta $0$.\n6. Tak, $n^3-n=(n-1)n(n+1)$ to iloczyn trzech kolejnych liczb.",
    recap:
      "1. Jaki warunek spełnia reszta z dzielenia?\n2. Jak brzmi cecha podzielności przez $9$?\n3. Dlaczego iloczyn dwóch kolejnych liczb jest parzysty?\n4. Jak wykorzystać kongruencję do liczenia reszt?\n5. Kiedy iloczyn trzech kolejnych liczb dzieli się przez $6$?",
    diagram:
      "liczba n\n  ↓\n postać n = aq + r\n  ↓\n cechy podzielności\n  ↓\n rozkład na czynniki\n  ↓\n wniosek: a | n",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "przeksztalcanie_wyrazen",
    title: "Przekształcanie wyrażeń - nawiasy i redukcja",
    examNote:
      "Przekształcanie wyrażeń jest narzędziem w niemal każdym zadaniu algebraicznym. CKE sprawdza opanowanie wzorów skróconego mnożenia, opuszczanie nawiasów i redukcję wyrazów podobnych.",
    map:
      "1. Opuścisz nawiasy, pamiętając o znakach.\n2. Pomnożysz sumy przez siebie.\n3. Zastosujesz wzory skróconego mnożenia.\n4. Zredukujesz wyrazy podobne.\n5. Rozłożysz prosty trójmian na czynniki.",
    definitions:
      "**Wyrazy podobne** mają tę samą część literową, np. $3x^2$ i $-5x^2$. Redukcja polega na dodaniu ich współczynników. Przy opuszczaniu nawiasu ze znakiem minus zmieniamy znak każdego wyrazu w nawiasie.\n\nWzory: $(a+b)^2=a^2+2ab+b^2$, $(a-b)^2=a^2-2ab+b^2$ oraz $a^2-b^2=(a-b)(a+b)$. Iloczyn $(x+a)(x+b)=x^2+(a+b)x+ab$. Trójmian $x^2+(a+b)x+ab$ rozkłada się na $(x+a)(x+b)$.",
    example1:
      "Uprość $3(x-2)-2(x+5)$. Opuszczamy nawiasy: $3x-6-2x-10$. Redukujemy: $x-16$. Znak minus przed drugim nawiasem zmienił znak zarówno $x$, jak i $5$.",
    example2:
      "Rozłóż na czynniki $x^2-7x+12$. Szukamy liczb o sumie $-7$ i iloczynie $12$: są to $-3$ i $-4$. Zatem $x^2-7x+12=(x-3)(x-4)$. Sprawdzenie: po wymnożeniu otrzymujemy $x^2-4x-3x+12=x^2-7x+12$.",
    pitfalls:
      "* $(a+b)^2\\ne a^2+b^2$ - brakuje wyrazu $2ab$.\n* Minus przed nawiasem zmienia znaki wszystkich wyrazów.\n* $x^2$ i $x$ to różne wyrazy podobne.\n* Przy redukcji nie zmieniaj wykładników.\n* Sprawdzaj rozkład przez wymnożenie nawiasów.",
    exercises:
      "1. Uprość $2(x+3)-4(x-1)$.\n2. Rozwiń $(x+6)^2$.\n3. Rozłóż $x^2-5x+6$.\n4. Uprość $(x-3)(x+3)$.\n5. Rozwiń $(2x-1)(x+4)$.\n6. Zredukuj $5x^2-2x+3-3x^2+7x-8$.",
    answers:
      "1. $2x+6-4x+4=-2x+10$.\n2. $x^2+12x+36$.\n3. $(x-2)(x-3)$.\n4. $x^2-9$.\n5. $2x^2+8x-x-4=2x^2+7x-4$.\n6. $2x^2+5x-5$.",
    recap:
      "1. Czym są wyrazy podobne?\n2. Jak zmienia się znak przy opuszczaniu nawiasu z minusem?\n3. Podaj wzór na $(a-b)^2$.\n4. Jak rozłożyć $x^2+(a+b)x+ab$?\n5. Dlaczego $(a+b)^2\\ne a^2+b^2$?",
    diagram:
      "wyrażenie\n   ↓\n opuść nawiasy\n   ↓\n wymnóż / wzory\n   ↓\n redukuj wyrazy podobne\n   ↓\n wynik lub rozkład",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "dzielenie_wielomianow",
    title: "Dzielenie wielomianów i twierdzenie Bézouta",
    examNote:
      "Dzielenie wielomianów na maturze podstawowej zwykle sprowadza się do prostego dzielenia przez dwumian $x-a$ lub do obliczenia reszty. Kluczowe jest twierdzenie Bézouta: reszta z dzielenia $W(x)$ przez $x-a$ to $W(a)$.",
    map:
      "1. Rozpoznasz stopień wielomianu i dzielnika.\n2. Wykonasz dzielenie przez $x-a$.\n3. Obliczysz resztę z twierdzenia Bézouta.\n4. Sprawdzisz wynik przez wymnożenie.\n5. Wykorzystasz podzielność do wyznaczenia parametru.",
    definitions:
      "Dzielenie wielomianów przypomina dzielenie liczb: $W(x)=Q(x)\\cdot P(x)+R(x)$, gdzie stopień reszty $R$ jest mniejszy od stopnia $P$. Jeśli $R(x)=0$, to $P$ dzieli $W$.\n\n**Twierdzenie Bézouta:** reszta z dzielenia $W(x)$ przez $x-a$ jest równa $W(a)$. W szczególności $x-a$ dzieli $W(x)$ wtedy i tylko wtedy, gdy $W(a)=0$. Znany wzór $x^3-a^3=(x-a)(x^2+ax+a^2)$ pozwala dzielić bez rachunków.",
    example1:
      "Podziel $x^2-5x+6$ przez $x-2$. Ponieważ $x^2-5x+6=(x-2)(x-3)$, iloraz to $x-3$, a reszta wynosi $0$. Sprawdzenie: $(x-2)(x-3)=x^2-5x+6$.",
    example2:
      "Wyznacz $k$, jeśli $x-3$ dzieli $W(x)=x^2+kx-12$. Z twierdzenia Bézouta $W(3)=0$, czyli $9+3k-12=0$. Stąd $3k=3$ i $k=1$. Istotnie $x^2+x-12=(x-3)(x+4)$.",
    pitfalls:
      "* Reszta ma stopień mniejszy od dzielnika, a nie od dzielnej.\n* W twierdzeniu Bézouta podstawiamy $x=a$, a nie $x=-a$.\n* Przy dzieleniu przez $x+a$ podstawiamy $x=-a$.\n* Iloraz trzeba sprawdzić przez wymnożenie.\n* Stopień ilorazu to różnica stopni dzielnej i dzielnika.",
    exercises:
      "1. Podziel $x^2-7x+10$ przez $x-2$.\n2. Oblicz resztę z dzielenia $W(x)=x^3-2x+5$ przez $x-1$.\n3. Wyznacz $k$, jeśli $x+2$ dzieli $x^2+kx+6$.\n4. Podziel $x^3-8$ przez $x-2$.\n5. Jaki jest stopień ilorazu wielomianu stopnia $5$ przez $x^2+1$?\n6. Czy $x-1$ dzieli $x^3-3x^2+4$?",
    answers:
      "1. $x-5$, reszta $0$.\n2. $W(1)=1-2+5=4$.\n3. $W(-2)=4-2k+6=0$, więc $k=5$.\n4. $x^2+2x+4$.\n5. $5-2=3$.\n6. $W(1)=1-3+4=2\\ne0$, więc nie.",
    recap:
      "1. Jak zapisać dzielenie z resztą?\n2. Co mówi twierdzenie Bézouta?\n3. Kiedy $x-a$ dzieli wielomian?\n4. Jaki stopień ma iloraz?\n5. Jak sprawdzić wynik dzielenia?",
    diagram:
      "W(x) : (x-a)\n   ↓\n W(a) = reszta\n   ↓\n reszta 0? → dzieli\n   ↓\n iloraz Q(x)\n   ↓\n sprawdź: Q(x)(x-a)",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "rownania_wielomianowe",
    title: "Równania wielomianowe - rozkład i pierwiastki",
    examNote:
      "Równania wielomianowe rozwiązuje się przez rozkład na czynniki i wykorzystanie własności iloczynu równego zeru. Na poziomie podstawowym najczęściej pojawia się wyłączanie $x$ oraz wzory na różnicę kwadratów i sześcianów.",
    map:
      "1. Przeniesiesz wszystko na jedną stronę.\n2. Wyłączysz wspólny czynnik.\n3. Użyjesz wzorów skróconego mnożenia.\n4. Rozłożysz na czynniki liniowe.\n5. Odczytasz pierwiastki i ich krotność.",
    definitions:
      "Pierwiastek wielomianu $W$ to liczba $a$ taka, że $W(a)=0$. Jeśli $W(x)=(x-a)(x-b)(x-c)$, to pierwiastkami są $a,b,c$. Iloczyn jest równy zeru wtedy i tylko wtedy, gdy co najmniej jeden czynnik jest zerem.\n\nPodstawowe rozkłady: $x^3-a^3=(x-a)(x^2+ax+a^2)$, $x^3+a^3=(x+a)(x^2-ax+a^2)$ oraz $x^3-a^2x=x(x-a)(x+a)$. Czynnik $(x-a)^2$ oznacza pierwiastek dwukrotny, ale nadal jeden pierwiastek różny.",
    example1:
      "Rozwiąż $x^3-4x=0$. Wyłączamy $x$: $x(x^2-4)=0$, czyli $x(x-2)(x+2)=0$. Pierwiastki to $-2$, $0$ i $2$.",
    example2:
      "Rozwiąż $x^3-27=0$. Korzystamy ze wzoru $x^3-3^3=(x-3)(x^2+3x+9)=0$. Drugi czynnik ma wyróżnik $9-36<0$, więc nie daje pierwiastków rzeczywistych. Jedynym rozwiązaniem jest $x=3$.",
    pitfalls:
      "* Nie dziel obu stron przez $x$ - możesz zgubić pierwiastek $x=0$.\n* Pierwiastek dwukrotny nadal jest jednym rozwiązaniem.\n* Wzór na różnicę sześcianów ma trzy składniki w drugim nawiasie.\n* Sprawdzaj, czy drugi czynnik nie ma pierwiastków rzeczywistych.\n* Po rozkładzie odczytuj znaki pierwiastków, a nie wartości bezwzględne.",
    exercises:
      "1. Rozwiąż $x^3-9x=0$.\n2. Rozwiąż $x(x-3)(x+5)=0$.\n3. Rozwiąż $x^3-8=0$.\n4. Rozwiąż $x^3+2x^2=0$.\n5. Ile różnych pierwiastków ma $(x-1)^2(x+4)=0$?\n6. Rozwiąż $x^3-6x^2+8x=0$.",
    answers:
      "1. $x(x-3)(x+3)=0$, więc $-3,0,3$.\n2. $-5,0,3$.\n3. $x=2$.\n4. $x^2(x+2)=0$, więc $0$ i $-2$.\n5. Dwa: $1$ i $-4$.\n6. $x(x-2)(x-4)=0$, więc $0,2,4$.",
    recap:
      "1. Kiedy iloczyn jest równy zeru?\n2. Jak rozłożyć $x^3-a^2x$?\n3. Dlaczego nie wolno dzielić przez $x$?\n4. Co oznacza pierwiastek dwukrotny?\n5. Podaj wzór na $x^3-a^3$.",
    diagram:
      "W(x) = 0\n   ↓\n wspólny czynnik\n   ↓\n wzory skróconego mnożenia\n   ↓\n iloczyn czynników\n   ↓\n każdy czynnik = 0",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "rownania_wymierne",
    title: "Równania wymierne - dziedzina i rozwiązania",
    examNote:
      "Równania wymierne wymagają ustalenia dziedziny i odrzucenia rozwiązań, które zerują mianownik. CKE sprawdza mnożenie na krzyż, skracanie oraz warunki $x\\ne a$.",
    map:
      "1. Wyznaczysz dziedzinę równania.\n2. Sprowadzisz równanie do postaci iloczynowej.\n3. Rozwiążesz równanie wielomianowe.\n4. Odrzucisz rozwiązania spoza dziedziny.\n5. Zapiszesz ostateczną odpowiedź.",
    definitions:
      "Wyrażenie wymierne to iloraz dwóch wielomianów. Równanie wymierne ma sens, gdy mianownik jest różny od zera. Dziedzinę wyznaczamy przed rozwiązywaniem.\n\nUłamek $\\frac{A(x)}{B(x)}$ jest równy zeru wtedy i tylko wtedy, gdy $A(x)=0$ i $B(x)\\ne0$. Równanie $\\frac{A}{B}=\\frac{C}{D}$ rozwiązujemy, mnożąc na krzyż: $A\\cdot D=B\\cdot C$, pamiętając o $B\\ne0$ i $D\\ne0$.",
    example1:
      "Rozwiąż $\\frac{x-3}{x-5}=0$. Licznik musi być zerem: $x-3=0$, więc $x=3$. Mianownik jest wtedy równy $-2\\ne0$, więc rozwiązanie należy do dziedziny.",
    example2:
      "Rozwiąż $\\frac{1}{x-2}=\\frac{1}{4}$. Dziedzina: $x\\ne2$. Przy równych licznikach mianowniki są równe: $x-2=4$, więc $x=6$. Sprawdzenie: $\\frac{1}{4}=\\frac{1}{4}$.",
    pitfalls:
      "* Nie pomiń dziedziny - rozwiązanie zerujące mianownik trzeba odrzucić.\n* Przy skracaniu zaznacz warunek dla skracanego czynnika.\n* Mnożenie na krzyż nie zwalnia z kontroli mianowników.\n* Równanie sprzeczne może wyglądać jak zwykłe równanie liniowe.\n* Po rozwiązaniu zawsze sprawdź, czy $x$ nie jest zakazane.",
    exercises:
      "1. Rozwiąż $\\frac{x-4}{x-1}=0$.\n2. Podaj dziedzinę $\\frac{1}{x^2-9}$.\n3. Rozwiąż $\\frac{x}{x-3}=2$.\n4. Rozwiąż $\\frac{x^2-16}{x-4}=0$.\n5. Rozwiąż $\\frac{2}{x-1}=\\frac{1}{x-4}$.\n6. Rozwiąż $\\frac{x+2}{x-2}=0$.",
    answers:
      "1. $x=4$.\n2. $x\\ne-3$ i $x\\ne3$.\n3. $x=2(x-3)$, więc $x=6$.\n4. $x=-4$ (dla $x=4$ mianownik jest zerem).\n5. $2(x-4)=x-1$, więc $x=7$.\n6. $x=-2$.",
    recap:
      "1. Jak wyznaczyć dziedzinę równania wymiernego?\n2. Kiedy ułamek jest równy zeru?\n3. Na czym polega mnożenie na krzyż?\n4. Dlaczego trzeba sprawdzić rozwiązanie?\n5. Co zrobić z rozwiązaniem zerującym mianownik?",
    diagram:
      "ułamek = 0\n   ↓\n mianownik ≠ 0 (dziedzina)\n   ↓\n licznik = 0\n   ↓\n sprawdź dziedzinę\n   ↓\n odpowiedź",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "nierownosci_kwadratowe",
    title: "Nierówności kwadratowe - znak paraboli",
    examNote:
      "Nierówności kwadratowe rozwiązuje się, odczytując znak paraboli względem miejsc zerowych. CKE często prosi o zapis odpowiedzi w postaci przedziału oraz o analizę położenia ramion paraboli.",
    map:
      "1. Wyznaczysz miejsca zerowe.\n2. Ustalasz kierunek ramion paraboli.\n3. Odczytasz przedziały ze znakiem dodatnim lub ujemnym.\n4. Zapiszesz rozwiązanie jako przedział.\n5. Sprawdzisz, czy końce należą do zbioru.",
    definitions:
      "Dla $a>0$ parabola $y=ax^2+bx+c$ ma ramiona skierowane w górę, a dla $a<0$ - w dół. Jeśli $x_1<x_2$ są miejscami zerowymi, to dla $a>0$ trójmian jest ujemny w $(x_1,x_2)$, a dodatni poza tym przedziałem.\n\nNierówność $x^2<a^2$ ma rozwiązanie $(-a,a)$, a $x^2\\ge a^2$ - zbiór $(-\\infty,-a]\\cup[a,\\infty)$. Gdy $\\Delta<0$ i $a>0$, trójmian jest dodatni dla wszystkich $x$.",
    example1:
      "Rozwiąż $(x-2)(x-5)<0$. Miejsca zerowe to $2$ i $5$, ramiona w górę. Wartości ujemne są między pierwiastkami, więc $x\\in(2,5)$.",
    example2:
      "Rozwiąż $x^2-6x+9\\le0$. Lewa strona to $(x-3)^2$, a kwadrat jest nieujemny. Nierówność jest spełniona tylko dla $x=3$, czyli zbiorem rozwiązań jest $\\{3\\}$.",
    pitfalls:
      "* Przy $a<0$ odwróć przedziały znaku.\n* $\\le$ i $\\ge$ oznaczają domknięte końce.\n* Nie zapisuj sumy przedziałów, gdy rozwiązaniem jest jeden przedział.\n* Sprawdź, czy delta jest dodatnia, zanim wyznaczysz pierwiastki.\n* Dla $\\Delta=0$ rozwiązaniem może być zbiór pusty, jeden punkt lub cały zbiór.",
    exercises:
      "1. Rozwiąż $(x-1)(x-4)<0$.\n2. Rozwiąż $x^2<25$.\n3. Rozwiąż $x^2\\ge9$.\n4. Rozwiąż $x^2-7x+10\\le0$.\n5. Rozwiąż $x^2+1>0$.\n6. Rozwiąż $(x-3)^2\\le0$.",
    answers:
      "1. $(1,4)$.\n2. $(-5,5)$.\n3. $(-\\infty,-3]\\cup[3,\\infty)$.\n4. $[2,5]$.\n5. Zbiór liczb rzeczywistych.\n6. $\\{3\\}$.",
    recap:
      "1. Od czego zależy kierunek ramion paraboli?\n2. Gdzie trójmian z $a>0$ jest ujemny?\n3. Co zmieniają nawiasy domknięte?\n4. Jak rozwiązać $x^2<a^2$?\n5. Co się dzieje, gdy $\\Delta=0$?",
    diagram:
      "ax²+bx+c\n   ↓\n Δ i miejsca zerowe\n   ↓\n ramiona a>0 / a<0\n   ↓\n znak w przedziałach\n   ↓\n zapis zbioru",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "rownania_z_wartoscia_bezwzgledna",
    title: "Równania z wartością bezwzględną",
    examNote:
      "Wartość bezwzględna opisuje odległość na osi liczbowej. CKE sprawdza równania $|x-a|=b$, nierówności oraz interpretację geometryczną, rzadziej skomplikowane przypadki z dwiema wartościami bezwzględnymi.",
    map:
      "1. Odczytasz wartość bezwzględną jako odległość.\n2. Rozwiążesz $|x-a|=b$.\n3. Rozwiążesz nierówność $|x-a|<b$.\n4. Zinterpretujesz sumę odległości.\n5. Odrzucisz równania sprzeczne.",
    definitions:
      "Wartość bezwzględna $|x|$ to odległość liczby $x$ od zera. Dla $a\\ge0$ równanie $|x|=a$ ma dwa rozwiązania: $x=-a$ lub $x=a$. Równanie $|x-a|=b$ dla $b>0$ oznacza, że $x$ jest odległe od $a$ o $b$, więc $x=a-b$ lub $x=a+b$.\n\nNierówność $|x-a|<b$ opisuje przedział $(a-b,a+b)$, a $|x-a|>b$ - zbiór $(-\\infty,a-b)\\cup(a+b,\\infty)$. Wartość bezwzględna jest zawsze nieujemna, więc $|x|=-a$ dla $a>0$ nie ma rozwiązań.",
    example1:
      "Rozwiąż $|x-3|=5$. Odległość $x$ od $3$ wynosi $5$, więc $x=3-5=-2$ lub $x=3+5=8$. Rozwiązaniem jest $x\\in\\{-2,8\\}$.",
    example2:
      "Rozwiąż $|x-2|<4$. Odległość od $2$ jest mniejsza od $4$, więc $x\\in(2-4,2+4)=(-2,6)$. Końce nie należą do zbioru, bo nierówność jest ostra.",
    pitfalls:
      "* $|x-a|=b$ ma dwa rozwiązania tylko dla $b>0$.\n* Dla $b=0$ rozwiązaniem jest tylko $x=a$.\n* $|x|=-3$ jest sprzeczne.\n* Przy nierówności $<$ otrzymujemy przedział, a przy $>$ sumę dwóch przedziałów.\n* Nie opuszczaj wartości bezwzględnej bez rozważenia znaku.",
    exercises:
      "1. Rozwiąż $|x|=7$.\n2. Rozwiąż $|x-1|=4$.\n3. Rozwiąż $|x+2|=3$.\n4. Rozwiąż $|x-3|<2$.\n5. Rozwiąż $|x-1|>5$.\n6. Rozwiąż $|x|=-2$.",
    answers:
      "1. $x=-7$ lub $x=7$.\n2. $x=-3$ lub $x=5$.\n3. $x=-5$ lub $x=1$.\n4. $(1,5)$.\n5. $(-\\infty,-4)\\cup(6,\\infty)$.\n6. Brak rozwiązań.",
    recap:
      "1. Co oznacza $|x-a|$ geometrycznie?\n2. Ile rozwiązań ma $|x-a|=b$ dla $b>0$?\n3. Jak zapisać zbiór $|x-a|<b$?\n4. Kiedy równanie z wartością bezwzględną jest sprzeczne?\n5. Czym różnią się zbiory dla $<$ i $>$?",
    diagram:
      "|x-a| = b\n   ↓\n odległość od a\n   ↓\n x = a-b  lub  x = a+b\n   ↓\n nierówność < → przedział\n nierówność > → suma",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "wzory_viete",
    title: "Wzory Viète'a - suma i iloczyn pierwiastków",
    examNote:
      "Wzory Viète'a pozwalają obliczać funkcje pierwiastków bez ich wyznaczania. CKE wykorzystuje je do zadań o sumie, iloczynie, sumie kwadratów i znakach pierwiastków.",
    map:
      "1. Odczytasz współczynniki $a,b,c$.\n2. Obliczysz sumę pierwiastków.\n3. Obliczysz iloczyn pierwiastków.\n4. Wyrazisz $x_1^2+x_2^2$ przez sumę i iloczyn.\n5. Zbudujesz równanie o danych pierwiastkach.",
    definitions:
      "Dla równania $ax^2+bx+c=0$ z $a\\ne0$ i pierwiastkami $x_1,x_2$ zachodzi $x_1+x_2=-\\frac ba$ oraz $x_1x_2=\\frac ca$. Wzory działają także wtedy, gdy pierwiastki są równe.\n\nPrzydatne przekształcenia: $x_1^2+x_2^2=(x_1+x_2)^2-2x_1x_2$, $\\frac1{x_1}+\\frac1{x_2}=\\frac{x_1+x_2}{x_1x_2}$ oraz $|x_1-x_2|=\\sqrt{(x_1+x_2)^2-4x_1x_2}$. Równanie o pierwiastkach $x_1,x_2$ ma postać $x^2-(x_1+x_2)x+x_1x_2=0$.",
    example1:
      "Dla $x^2-6x+5=0$ suma pierwiastków wynosi $-\\frac{-6}{1}=6$, a iloczyn $\\frac51=5$. Rzeczywiście pierwiastki to $1$ i $5$.",
    example2:
      "Dla $x^2-4x+1=0$ oblicz $x_1^2+x_2^2$. Mamy $x_1+x_2=4$ i $x_1x_2=1$, więc $x_1^2+x_2^2=4^2-2\\cdot1=14$. Nie trzeba wyznaczać pierwiastków.",
    pitfalls:
      "* We wzorze na sumę jest minus: $x_1+x_2=-b/a$.\n* Iloczyn to $c/a$, a nie $c$.\n* Wzory wymagają $a\\ne0$ i rzeczywistych pierwiastków.\n* Przy $x_1^2+x_2^2$ nie zapomnij odjąć $2x_1x_2$.\n* $|x_1-x_2|$ to pierwiastek z $(x_1+x_2)^2-4x_1x_2$.",
    exercises:
      "1. Podaj sumę pierwiastków $x^2-7x+10=0$.\n2. Podaj iloczyn pierwiastków $x^2+3x-4=0$.\n3. Dla $x^2-5x+6=0$ oblicz $x_1^2+x_2^2$.\n4. Zbuduj równanie o pierwiastkach $1$ i $4$.\n5. Dla $x^2-2x-3=0$ oblicz $\\frac1{x_1}+\\frac1{x_2}$.\n6. Podaj $|x_1-x_2|$ dla $x^2-6x+8=0$.",
    answers:
      "1. $7$.\n2. $-4$.\n3. $5^2-2\\cdot6=13$.\n4. $x^2-5x+4=0$.\n5. $\\frac{2}{-3}=-\\frac23$.\n6. $\\sqrt{36-32}=2$.",
    recap:
      "1. Podaj wzór na sumę pierwiastków.\n2. Podaj wzór na iloczyn pierwiastków.\n3. Jak obliczyć $x_1^2+x_2^2$?\n4. Jak zbudować równanie z pierwiastków?\n5. Jak wyrazić $\\frac1{x_1}+\\frac1{x_2}$?",
    diagram:
      "ax²+bx+c=0\n   ↓\n S = -b/a,  P = c/a\n   ↓\n x₁²+x₂² = S²-2P\n   ↓\n równanie: x²-Sx+P=0",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "uklady_liniowo_kwadratowe",
    title: "Układy liniowo-kwadratowe - metoda podstawiania",
    examNote:
      "Układ złożony z równania liniowego i kwadratowego rozwiązuje się przez podstawienie. CKE sprawdza liczbę rozwiązań, współrzędne punktów przecięcia oraz związek z wyróżnikiem.",
    map:
      "1. Wyrazisz jedną zmienną z równania liniowego.\n2. Podstawisz do równania kwadratowego.\n3. Obliczysz wyróżnik i pierwiastki.\n4. Wyznaczysz drugą współrzędną.\n5. Zinterpretujesz wynik geometrycznie.",
    definitions:
      "Układ $y=x^2$ i $y=kx+m$ po podstawieniu daje $x^2-kx-m=0$. Liczba rozwiązań zależy od wyróżnika: $\\Delta>0$ - dwa punkty przecięcia, $\\Delta=0$ - jeden punkt styczności, $\\Delta<0$ - brak punktów.\n\nRozwiązaniem układu jest para $(x,y)$ spełniająca oba równania. Po wyznaczeniu $x$ wartość $y$ obliczamy z równania liniowego, bo jest prostsze.",
    example1:
      "Rozwiąż $y=x^2$ i $y=x+2$. Podstawiamy: $x^2=x+2$, czyli $x^2-x-2=0$. Pierwiastki to $-1$ i $2$. Wtedy $y=1$ i $y=4$, więc rozwiązania to $(-1,1)$ i $(2,4)$.",
    example2:
      "Ile rozwiązań ma układ $y=x^2$ i $y=2x-3$? Równanie $x^2-2x+3=0$ ma $\\Delta=4-12=-8<0$, więc prosta nie przecina paraboli. Układ nie ma rozwiązań.",
    pitfalls:
      "* Po podstawieniu uporządkuj równanie do postaci $ax^2+bx+c=0$.\n* Liczba pierwiastków $x$ równa się liczbie punktów przecięcia.\n* Nie zapomnij obliczyć $y$ dla każdego $x$.\n* Sprawdź, czy podstawienie nie zgubiło rozwiązania.\n* $\\Delta=0$ oznacza styczność, a nie brak rozwiązań.",
    exercises:
      "1. Rozwiąż $y=x^2$ i $y=4$.\n2. Rozwiąż $y=x^2$ i $y=x+2$.\n3. Ile rozwiązań ma $y=x^2$ i $y=x-1$?\n4. Rozwiąż $y=x^2$ i $y=2x+3$.\n5. Ile rozwiązań ma $y=x^2$ i $y=0$?\n6. Rozwiąż $y=x^2$ i $y=-x+2$.",
    answers:
      "1. $(-2,4)$ i $(2,4)$.\n2. $(-1,1)$ i $(2,4)$.\n3. $\\Delta=1-4<0$, brak rozwiązań.\n4. $x=-1$ lub $x=3$, punkty $(-1,1)$ i $(3,9)$.\n5. Jedno: $(0,0)$.\n6. $x=-2$ lub $x=1$, punkty $(-2,4)$ i $(1,1)$.",
    recap:
      "1. Jak rozwiązać układ metodą podstawiania?\n2. Co oznacza $\\Delta>0$ dla liczby punktów przecięcia?\n3. Jak obliczyć $y$ po znalezieniu $x$?\n4. Co oznacza $\\Delta=0$?\n5. Kiedy układ nie ma rozwiązań?",
    diagram:
      "y = x²  i  y = kx+m\n       ↓\n x²-kx-m=0\n       ↓\n Δ >0 → 2 punkty\n Δ =0 → 1 punkt\n Δ <0 → 0 punktów",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "zadania_tekstowe_uklady",
    title: "Zadania tekstowe z układami równań",
    examNote:
      "Zadania tekstowe wymagają zapisania dwóch zależności jako układu równań. CKE najczęściej prosi o liczby, wiek, bilety lub wymiary, a rozwiązanie jest liczbą całkowitą.",
    map:
      "1. Oznaczysz niewiadome literami.\n2. Zapiszesz dwa warunki z treści.\n3. Rozwiążesz układ metodą podstawiania lub przeciwnych współczynników.\n4. Sprawdzisz wynik z treścią.\n5. Zapiszesz odpowiedź z jednostką.",
    definitions:
      "Układ dwóch równań liniowych rozwiązujemy przez podstawienie lub dodanie stron. W zadaniach tekstowych ważne jest poprawne oznaczenie niewiadomych i jednostek.\n\nTypowe zależności: suma $x+y=S$, różnica $x-y=D$, związek $x=ky$ oraz koszt $ax+by=K$. Po rozwiązaniu sprawdzamy, czy wynik spełnia oba warunki i czy jest sensowny w kontekście (np. liczba osób jest całkowita).",
    example1:
      "Suma dwóch liczb wynosi $20$, a ich różnica $4$. Oznaczamy większą przez $x$, mniejszą przez $y$. Wtedy $x+y=20$ i $x-y=4$. Dodając równania, mamy $2x=24$, więc $x=12$ i $y=8$.",
    example2:
      "Bilet dla dorosłego kosztuje $20$ zł, a dla dziecka $10$ zł. Za $5$ biletów zapłacono $70$ zł. Niech $x$ oznacza dorosłych, $y$ dzieci. Wtedy $x+y=5$ i $20x+10y=70$. Po podstawieniu $y=5-x$ otrzymujemy $10x=20$, więc $x=2$ i $y=3$.",
    pitfalls:
      "* Nie mieszaj jednostek i osi liczbowych.\n* Sprawdź, czy rozwiązanie spełnia oba równania.\n* Uważaj na znaki przy odejmowaniu równań.\n* Liczba osób lub biletów musi być całkowita i nieujemna.\n* Nie zapomnij odpowiedzieć na pytanie z treści.",
    exercises:
      "1. Suma liczb wynosi $30$, różnica $6$. Podaj większą liczbę.\n2. Jedna liczba jest $3$ razy większa od drugiej, a ich suma to $48$. Podaj mniejszą.\n3. $2$ kg jabłek i $1$ kg gruszek kosztuje $18$ zł, a $1$ kg jabłek i $1$ kg gruszek $12$ zł. Podaj cenę jabłek.\n4. Ojciec jest $4$ razy starszy od syna, razem mają $50$ lat. Ile lat ma syn?\n5. Prostokąt ma obwód $24$ cm i różnicę boków $4$ cm. Podaj dłuższy bok.\n6. Za $3$ bilety normalne i $2$ ulgowe zapłacono $44$ zł, a bilet normalny jest o $3$ zł droższy. Podaj cenę normalnego.",
    answers:
      "1. $18$.\n2. $12$.\n3. $6$ zł.\n4. $10$ lat.\n5. $8$ cm.\n6. $10$ zł.",
    recap:
      "1. Jak oznaczyć niewiadome w zadaniu tekstowym?\n2. Jakie dwie zależności najczęściej tworzą układ?\n3. Jak sprawdzić wynik?\n4. Dlaczego rozwiązanie musi być sensowne w kontekście?\n5. Kiedy stosować dodawanie równań?",
    diagram:
      "treść zadania\n   ↓\n niewiadome x, y\n   ↓\n dwa równania\n   ↓\n rozwiąż układ\n   ↓\n sprawdź i odpowiedz",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "przeksztalcenia_wykresow",
    title: "Przekształcenia wykresów funkcji",
    examNote:
      "Przekształcenia wykresów sprawdzają zrozumienie związku między wzorem a obrazem. CKE pyta o przesunięcia, symetrie i rozciąganie oraz o wierzchołek paraboli po przesunięciu.",
    map:
      "1. Rozpoznasz przesunięcie pionowe i poziome.\n2. Zastosujesz symetrię względem osi OX i OY.\n3. Odbijesz część wykresu wartością bezwzględną.\n4. Rozciągniesz wykres w kierunku osi OY.\n5. Odczytasz wierzchołek paraboli z postaci kanonicznej.",
    definitions:
      "Wykres $g(x)=f(x)+a$ powstaje przez przesunięcie wykresu $f$ o $a$ jednostek w górę (dla $a>0$). Wykres $g(x)=f(x-a)$ powstaje przez przesunięcie o $a$ jednostek w prawo.\n\n$g(x)=-f(x)$ to symetria względem osi $OX$, a $g(x)=f(-x)$ - symetria względem osi $OY$. $g(x)=|f(x)|$ odbija części leżące pod osią $OX$ nad tę oś. $g(x)=kf(x)$ dla $k>1$ rozciąga wykres $k$ razy w kierunku osi $OY$.",
    example1:
      "Wykres $g(x)=(x-2)^2+3$ powstaje z paraboli $y=x^2$ przez przesunięcie o $2$ jednostki w prawo i $3$ w górę. Wierzchołek to $(2,3)$, bo postać kanoniczna ma $(x-p)^2+q$.",
    example2:
      "Naszkicuj $g(x)=|x^2-4|$. Najpierw rysujemy parabolę $y=x^2-4$, która przecina oś $OX$ w $-2$ i $2$. Część między pierwiastkami leży pod osią, więc odbijamy ją nad oś. Otrzymujemy wykres w kształcie litery W z zerami w $-2$ i $2$.",
    pitfalls:
      "* $f(x-a)$ przesuwa w prawo, a nie w lewo.\n* $f(x)+a$ przesuwa pionowo, a $f(x+a)$ poziomo.\n* $|f(x)|$ nie zmienia części leżącej nad osią.\n* Symetria względem $OY$ dotyczy $f(-x)$, a nie $-f(x)$.\n* Przy rozciąganiu zmieniają się rzędne, a nie odcięte.",
    exercises:
      "1. Jak przesunie się wykres $y=x^2$, jeśli powstanie $y=(x-4)^2$?\n2. Podaj wierzchołek $y=(x+3)^2-2$.\n3. Jak powstaje $y=-f(x)$?\n4. Jak powstaje $y=f(-x)$?\n5. Co robi $y=|f(x)|$ z częścią pod osią OX?\n6. Jak zmieni się wykres $y=x^2$ po pomnożeniu wartości przez $2$?",
    answers:
      "1. O $4$ jednostki w prawo.\n2. $(-3,-2)$.\n3. Symetria względem osi OX.\n4. Symetria względem osi OY.\n5. Odbija ją nad oś OX.\n6. Rozciąga go dwukrotnie w kierunku osi OY.",
    recap:
      "1. Jak działa $f(x-a)$?\n2. Jak działa $f(x)+a$?\n3. Czym różnią się $f(-x)$ i $-f(x)$?\n4. Co robi wartość bezwzględna na wykresie?\n5. Jak odczytać wierzchołek paraboli?",
    diagram:
      "f(x)\n ├─ +a  → w górę\n ├─ f(x-a) → w prawo\n ├─ -f(x) → symetria OX\n ├─ f(-x) → symetria OY\n └─ |f(x)| → odbicie nad OX",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "ciagi",
    topic: "wyrazy_ciagu",
    title: "Wyrazy ciągu i monotoniczność",
    examNote:
      "Zadania o ciągach sprawdzają obliczanie wyrazów ze wzoru ogólnego, odczytywanie numeru wyrazu oraz badanie monotoniczności. Na poziomie podstawowym wystarczy różnica $a_{n+1}-a_n$.",
    map:
      "1. Obliczysz wyraz $a_n$ z wzoru ogólnego.\n2. Znajdziesz numer wyrazu o danej wartości.\n3. Zbadasz monotoniczność przez różnicę.\n4. Zastosujesz wzór rekurencyjny.\n5. Odróżnisz ciąg rosnący, malejący i stały.",
    definitions:
      "Ciąg to funkcja określona na liczbach naturalnych dodatnich; $a_n$ oznacza $n$-ty wyraz. Wzór ogólny podaje $a_n$ bezpośrednio, a wzór rekurencyjny - zależność od poprzedniego wyrazu.\n\nCiąg jest rosnący, gdy $a_{n+1}>a_n$ dla każdego $n$; malejący, gdy $a_{n+1}<a_n$; stały, gdy wszystkie wyrazy są równe. Dla $a_n=kn+b$ różnica $a_{n+1}-a_n=k$, więc znak $k$ rozstrzyga monotoniczność.",
    example1:
      "Dla $a_n=3n-2$ oblicz $a_5$. Podstawiamy $n=5$: $a_5=3\\cdot5-2=13$. Aby znaleźć $n$ dla $a_n=16$, rozwiązujemy $3n-2=16$, czyli $n=6$.",
    example2:
      "Zbadaj monotoniczność $a_n=\\frac{n+2}{n}$. Zapisujemy $a_n=1+\\frac2n$. Wraz ze wzrostem $n$ ułamek $\\frac2n$ maleje, więc ciąg jest malejący. Formalnie $a_{n+1}-a_n=\\frac{2}{n+1}-\\frac2n<0$.",
    pitfalls:
      "* $a_n$ to wartość, a $n$ to numer wyrazu - nie myl ich.\n* Wzór rekurencyjny wymaga wyrazu początkowego.\n* Ciąg może być ani rosnący, ani malejący.\n* Przy badaniu monotoniczności nie wystarczą dwa wyrazy.\n* Ułamek $(n+2)/n$ maleje, choć licznik i mianownik rosną.",
    exercises:
      "1. Dla $a_n=2n+1$ oblicz $a_7$.\n2. Dla $a_n=n^2-3n$ oblicz $a_4$.\n3. Zbadaj monotoniczność $a_n=4n-1$.\n4. Dla $a_n=3n-5$ podaj $n$, dla którego $a_n=16$.\n5. Ciąg spełnia $a_1=2$ i $a_{n+1}=a_n+3$. Podaj $a_5$.\n6. Oblicz $a_6$ dla $a_n=(-1)^n\\cdot n$.",
    answers:
      "1. $15$.\n2. $16-12=4$.\n3. Rosnący, bo różnica wynosi $4$.\n4. $3n=21$, więc $n=7$.\n5. $2+4\\cdot3=14$.\n6. $6$.",
    recap:
      "1. Czym różni się wzór ogólny od rekurencyjnego?\n2. Jak obliczyć $a_k$?\n3. Jak zbadać monotoniczność?\n4. Kiedy ciąg jest stały?\n5. Dlaczego dwa wyrazy nie wystarczą do wniosku o monotoniczności?",
    diagram:
      "a_n = wzór\n   ↓\n podstaw n → wartość\n   ↓\n a_{n+1}-a_n\n   ↓\n >0 rosnący\n <0 malejący\n =0 stały",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "ciagi",
    topic: "granica_ciagu",
    title: "Granica ciągu - ilorazy i potęgi",
    examNote:
      "Granice ciągów na maturze podstawowej dotyczą ilorazów wielomianów, wyrażeń z pierwiastkami oraz potęg o podstawie z przedziału $(0,1)$. Wystarczy dzielić przez najwyższą potęgę $n$.",
    map:
      "1. Rozpoznasz stopnie licznika i mianownika.\n2. Podzielisz przez najwyższą potęgę $n$.\n3. Obliczysz granice typu $\\frac{an+b}{cn+d}$.\n4. Uprościsz wyrażenia z pierwiastkami przez sprzężenie.\n5. Zastosujesz $\\lim q^n=0$ dla $|q|<1$.",
    definitions:
      "Ciąg $a_n$ ma granicę $g$, jeśli wyrazy zbliżają się do $g$ nieograniczenie blisko. Piszemy $\\lim_{n\\to\\infty}a_n=g$. Podstawowe granice: $\\lim\\frac1n=0$ oraz $\\lim q^n=0$ dla $|q|<1$.\n\nDla ilorazu wielomianów decyduje najwyższa potęga $n$: gdy stopnie są równe, granica to iloraz współczynników; gdy mianownik ma wyższy stopień, granica wynosi $0$. Wyrażenia $\\sqrt{n^2+kn}-n$ przekształcamy, mnożąc przez sprzężenie.",
    example1:
      "Oblicz $\\lim_{n\\to\\infty}\\frac{3n+1}{2n-5}$. Dzielimy licznik i mianownik przez $n$: $\\frac{3+\\frac1n}{2-\\frac5n}\\to\\frac32$. Stopnie są równe, więc wynik to iloraz współczynników $3$ i $2$.",
    example2:
      "Oblicz $\\lim_{n\\to\\infty}(\\sqrt{n^2+n}-n)$. Mnożymy przez sprzężenie: $\\frac{n}{\\sqrt{n^2+n}+n}=\\frac{1}{\\sqrt{1+\\frac1n}+1}\\to\\frac12$. Granica wynosi $\\frac12$, a nie $0$.",
    pitfalls:
      "* Nie podstawiaj $\\infty$ bezpośrednio - to symbol, nie liczba.\n* Przy równych stopniach liczy się iloraz współczynników, nie różnica.\n* $\\sqrt{n^2+n}\\ne n+\\frac12$ dokładnie, ale granica jest taka sama.\n* Dla $|q|<1$ granica $q^n$ wynosi $0$, a dla $q>1$ jest nieskończona.\n* Sprzężenie stosuj do różnicy pierwiastków.",
    exercises:
      "1. Oblicz $\\lim\\frac{2n+3}{n}$.\n2. Oblicz $\\lim\\frac{3n^2+n}{6n^2-1}$.\n3. Oblicz $\\lim\\left(\\frac12\\right)^n$.\n4. Oblicz $\\lim\\frac{n+1}{2n+3}$.\n5. Oblicz $\\lim(\\sqrt{n^2+4n}-n)$.\n6. Oblicz $\\lim\\frac{5}{n^2}$.",
    answers:
      "1. $2$.\n2. $\\frac36=\\frac12$.\n3. $0$.\n4. $\\frac12$.\n5. $\\frac42=2$.\n6. $0$.",
    recap:
      "1. Jak obliczyć granicę ilorazu wielomianów?\n2. Kiedy granica wynosi $0$?\n3. Dla jakich $q$ ciąg $q^n$ dąży do $0$?\n4. Po co stosuje się sprzężenie?\n5. Czym różni się granica od wartości wyrazu?",
    diagram:
      "iloraz wielomianów\n   ↓\n najwyższa potęga n\n   ↓\n równe stopnie → a/c\n mianownik wyżej → 0\n   ↓\n granica",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "ciagi",
    topic: "szereg_geometryczny",
    title: "Szereg geometryczny i ułamki okresowe",
    examNote:
      "Szereg geometryczny pojawia się w zadaniach o sumie nieskończonego ciągu oraz zamianie ułamka okresowego na zwykły. Warunek zbieżności $|q|<1$ jest obowiązkowy.",
    map:
      "1. Rozpoznasz pierwszy wyraz i iloraz.\n2. Sprawdzisz warunek zbieżności.\n3. Obliczysz sumę ze wzoru.\n4. Zapiszesz ułamek okresowy jako szereg.\n5. Zamienisz go na ułamek zwykły.",
    definitions:
      "Szereg geometryczny to suma $a_1+a_1q+a_1q^2+\\ldots$. Jest zbieżny dokładnie wtedy, gdy $|q|<1$, a jego suma wynosi $S=\\frac{a_1}{1-q}$.\n\nUłamek okresowy można potraktować jako szereg geometryczny. Na przykład $0{,}777\\ldots=\\frac{7}{10}+\\frac{7}{100}+\\ldots$, gdzie $a_1=\\frac7{10}$ i $q=\\frac1{10}$. Stąd $0{,}(7)=\\frac{7}{9}$.",
    example1:
      "Oblicz sumę $3+1+\\frac13+\\ldots$. Pierwszy wyraz to $3$, iloraz $q=\\frac13$, a $|q|<1$. Suma wynosi $S=\\frac{3}{1-\\frac13}=\\frac{3}{\\frac23}=\\frac92$.",
    example2:
      "Zamień $0{,}121212\\ldots$ na ułamek zwykły. To szereg z $a_1=\\frac{12}{100}$ i $q=\\frac1{100}$, więc $S=\\frac{\\frac{12}{100}}{1-\\frac1{100}}=\\frac{12}{99}=\\frac4{33}$.",
    pitfalls:
      "* Wzór na sumę działa tylko dla $|q|<1$.\n* Iloraz to stosunek kolejnych wyrazów, nie różnica.\n* Ułamek okresowy jednocyfrowy ma mianownik $9$, a dwucyfrowy $99$.\n* Nie skracaj tylko jednego składnika ułamka.\n* Dla $|q|\\ge1$ suma jest nieskończona lub nie istnieje.",
    exercises:
      "1. Oblicz sumę $2+1+\\frac12+\\ldots$.\n2. Oblicz sumę $\\frac12+\\frac14+\\frac18+\\ldots$.\n3. Zamień $0{,}333\\ldots$ na ułamek zwykły.\n4. Zamień $0{,}272727\\ldots$ na ułamek zwykły.\n5. Dla jakich $q$ szereg jest zbieżny?\n6. Pierwszy wyraz to $4$, a suma $8$. Podaj $q$.",
    answers:
      "1. $4$.\n2. $1$.\n3. $\\frac13$.\n4. $\\frac{27}{99}=\\frac3{11}$.\n5. $|q|<1$.\n6. $1-q=\\frac48=\\frac12$, więc $q=\\frac12$.",
    recap:
      "1. Podaj wzór na sumę szeregu geometrycznego.\n2. Kiedy szereg jest zbieżny?\n3. Jak zamienić $0{,}(7)$ na ułamek?\n4. Skąd bierze się mianownik $99$?\n5. Czym jest iloraz $q$?",
    diagram:
      "a₁ + a₁q + a₁q² + ...\n        ↓\n |q| < 1 ?\n   tak → S = a₁/(1-q)\n   nie → brak sumy",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "trygonometria",
    topic: "tozsamosci_trygonometryczne",
    title: "Tożsamości trygonometryczne - jedynka i tangens",
    examNote:
      "Tożsamości trygonometryczne łączą sinus, cosinus i tangens tego samego kąta. CKE sprawdza jedynkę trygonometryczną, związek tangensa z ilorazem oraz przekształcanie wyrażeń.",
    map:
      "1. Zastosujesz jedynkę $\\sin^2\\alpha+\\cos^2\\alpha=1$.\n2. Obliczysz sinus lub cosinus z drugiej funkcji.\n3. Wykorzystasz $\\operatorname{tg}\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha}$.\n4. Użyjesz $1+\\operatorname{tg}^2\\alpha=\\frac1{\\cos^2\\alpha}$.\n5. Uprościsz wyrażenia z potęgami funkcji.",
    definitions:
      "Dla każdego kąta $\\alpha$ zachodzi $\\sin^2\\alpha+\\cos^2\\alpha=1$. Tangens jest określony dla $\\cos\\alpha\\ne0$ i wynosi $\\operatorname{tg}\\alpha=\\frac{\\sin\\alpha}{\\cos\\alpha}$.\n\nDzieląc jedynkę przez $\\cos^2\\alpha$, otrzymujemy $1+\\operatorname{tg}^2\\alpha=\\frac1{\\cos^2\\alpha}$. Przydatne są też $\\sin^4\\alpha+\\cos^4\\alpha=1-2\\sin^2\\alpha\\cos^2\\alpha$ oraz $(\\sin\\alpha+\\cos\\alpha)^2=1+2\\sin\\alpha\\cos\\alpha$.",
    example1:
      "Kąt $\\alpha$ jest ostry i $\\sin\\alpha=\\frac35$. Wtedy $\\cos^2\\alpha=1-\\frac9{25}=\\frac{16}{25}$. Ponieważ kąt jest ostry, $\\cos\\alpha=\\frac45$. Tangens wynosi $\\frac{3/5}{4/5}=\\frac34$.",
    example2:
      "Wiadomo, że $\\sin\\alpha\\cos\\alpha=\\frac14$. Oblicz $(\\sin\\alpha+\\cos\\alpha)^2$. Rozwijamy kwadrat: $\\sin^2\\alpha+2\\sin\\alpha\\cos\\alpha+\\cos^2\\alpha=1+2\\cdot\\frac14=\\frac32$.",
    pitfalls:
      "* $\\sin^2\\alpha$ to $(\\sin\\alpha)^2$, a nie $\\sin(\\alpha^2)$.\n* Przy pierwiastkowaniu jedynki wybierz znak zgodny z ćwiartką.\n* Tangens nie istnieje dla $\\cos\\alpha=0$.\n* $\\sin^2\\alpha+\\cos^2\\alpha=1$ dotyczy tego samego kąta.\n* Nie myl $\\operatorname{tg}^2\\alpha$ z $\\operatorname{tg}(\\alpha^2)$.",
    exercises:
      "1. Kąt ostry ma $\\sin\\alpha=\\frac45$. Oblicz $\\cos\\alpha$.\n2. Kąt ostry ma $\\cos\\alpha=\\frac5{13}$. Oblicz $\\sin\\alpha$.\n3. Oblicz $\\operatorname{tg}\\alpha$, jeśli $\\sin\\alpha=\\frac{12}{13}$ i $\\cos\\alpha=\\frac5{13}$.\n4. Oblicz $3(\\sin^2\\alpha+\\cos^2\\alpha)-1$.\n5. Wiadomo, że $\\sin\\alpha\\cos\\alpha=\\frac13$. Oblicz $(\\sin\\alpha+\\cos\\alpha)^2$.\n6. Uprość $\\sin^2\\alpha+\\cos^2\\alpha+\\operatorname{tg}^2\\alpha$.",
    answers:
      "1. $\\frac35$.\n2. $\\frac{12}{13}$.\n3. $\\frac{12}{5}$.\n4. $2$.\n5. $1+\\frac23=\\frac53$.\n6. $1+\\operatorname{tg}^2\\alpha=\\frac1{\\cos^2\\alpha}$.",
    recap:
      "1. Podaj jedynkę trygonometryczną.\n2. Jak obliczyć cosinus, znając sinus?\n3. Jak wyrazić tangens przez sinus i cosinus?\n4. Podaj związek $1+\\operatorname{tg}^2\\alpha$.\n5. Jak rozwinąć $(\\sin\\alpha+\\cos\\alpha)^2$?",
    diagram:
      "sin²α + cos²α = 1\n       ↓\n tg α = sin α / cos α\n       ↓\n 1 + tg²α = 1/cos²α\n       ↓\n upraszczanie wyrażeń",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "trygonometria",
    topic: "miara_lukowa",
    title: "Miara łukowa kąta - radiany",
    examNote:
      "Miara łukowa jest potrzebna w zadaniach o łuku i wycinku oraz w trygonometrii. CKE sprawdza przeliczanie stopni na radiany i odwrotnie oraz długość łuku $l=r\\theta$.",
    map:
      "1. Zamienisz stopnie na radiany.\n2. Zamienisz radiany na stopnie.\n3. Obliczysz długość łuku.\n4. Odczytasz ćwiartkę kąta.\n5. Użyjesz przybliżenia $1$ rad $\\approx57^\\circ$.",
    definitions:
      "Kąt pełny ma $360^\\circ$, czyli $2\\pi$ radianów. Dlatego $\\alpha$ stopni to $\\frac{\\alpha\\pi}{180}$ radianów, a $\\theta$ radianów to $\\frac{180\\theta}{\\pi}$ stopni.\n\nDługość łuku okręgu o promieniu $r$ i kącie środkowym $\\theta$ (w radianach) wynosi $l=r\\theta$. Jeden radian to około $57{,}3^\\circ$. Miara łukowa jest bezwymiarowa, ale długość łuku wyrażamy w jednostkach długości.",
    example1:
      "Zamień $150^\\circ$ na radiany. Obliczamy $\\frac{150\\pi}{180}=\\frac{5\\pi}{6}$. Kąt $150^\\circ$ leży w drugiej ćwiartce, między $\\frac{\\pi}{2}$ a $\\pi$.",
    example2:
      "Łuk okręgu o promieniu $6$ cm wyznacza kąt $\\frac{\\pi}{3}$. Długość łuku to $l=6\\cdot\\frac{\\pi}{3}=2\\pi$ cm. Kąt $\\frac{\\pi}{3}$ to $60^\\circ$.",
    pitfalls:
      "* $180^\\circ=\\pi$ rad, a nie $2\\pi$.\n* We wzorze $l=r\\theta$ kąt musi być w radianach.\n* Nie dopisuj stopni do miary łukowej.\n* $\\frac{3\\pi}{2}$ to $270^\\circ$, a nie $180^\\circ$.\n* Przy zamianie radianów na stopnie mnóż przez $\\frac{180}{\\pi}$.",
    exercises:
      "1. Zamień $90^\\circ$ na radiany.\n2. Zamień $\\frac{\\pi}{4}$ na stopnie.\n3. Zamień $270^\\circ$ na radiany.\n4. Oblicz długość łuku dla $r=4$ i $\\theta=\\frac{\\pi}{2}$.\n5. W której ćwiartce leży kąt $\\frac{5\\pi}{6}$?\n6. Ile stopni ma $2\\pi$ rad?",
    answers:
      "1. $\\frac{\\pi}{2}$.\n2. $45^\\circ$.\n3. $\\frac{3\\pi}{2}$.\n4. $2\\pi$.\n5. W drugiej.\n6. $360^\\circ$.",
    recap:
      "1. Ile radianów ma kąt pełny?\n2. Jak zamienić stopnie na radiany?\n3. Jak zamienić radiany na stopnie?\n4. Podaj wzór na długość łuku.\n5. Ile stopni ma w przybliżeniu $1$ rad?",
    diagram:
      "360° = 2π rad\n   ↓\n α° = απ/180\n   θ rad = 180θ/π\n   ↓\n l = rθ",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "trygonometria",
    topic: "wzory_redukcyjne",
    title: "Wzory redukcyjne - kąty spoza pierwszej ćwiartki",
    examNote:
      "Wzory redukcyjne pozwalają sprowadzić funkcje dowolnego kąta do kąta ostrego. CKE sprawdza znaki w ćwiartkach oraz wartości typu $\\sin150^\\circ$ i $\\cos120^\\circ$.",
    map:
      "1. Wskażesz ćwiartkę kąta.\n2. Ustalasz znak funkcji w tej ćwiartce.\n3. Sprowadzisz kąt do kąta ostrego.\n4. Zastosujesz wzór redukcyjny.\n5. Obliczysz wartość dokładną.",
    definitions:
      "Zachodzą wzory: $\\sin(180^\\circ-\\alpha)=\\sin\\alpha$, $\\cos(180^\\circ-\\alpha)=-\\cos\\alpha$, $\\sin(180^\\circ+\\alpha)=-\\sin\\alpha$, $\\cos(180^\\circ+\\alpha)=-\\cos\\alpha$ oraz $\\cos(360^\\circ-\\alpha)=\\cos\\alpha$.\n\nDla tangensa $\\operatorname{tg}(180^\\circ-\\alpha)=-\\operatorname{tg}\\alpha$ i $\\operatorname{tg}(180^\\circ+\\alpha)=\\operatorname{tg}\\alpha$. Dodatkowo $\\sin(90^\\circ+\\alpha)=\\cos\\alpha$ i $\\cos(90^\\circ-\\alpha)=\\sin\\alpha$. Znak ustalamy na podstawie ćwiartki kąta.",
    example1:
      "Oblicz $\\sin150^\\circ$. Kąt $150^\\circ=180^\\circ-30^\\circ$, więc $\\sin150^\\circ=\\sin30^\\circ=\\frac12$. Sinus w drugiej ćwiartce jest dodatni, co potwierdza wynik.",
    example2:
      "Oblicz $\\cos120^\\circ$. Mamy $120^\\circ=180^\\circ-60^\\circ$, więc $\\cos120^\\circ=-\\cos60^\\circ=-\\frac12$. Cosinus w drugiej ćwiartce jest ujemny.",
    pitfalls:
      "* Znak funkcji zależy od ćwiartki, a nie od kąta ostrego.\n* $\\sin(180^\\circ-\\alpha)=\\sin\\alpha$, ale $\\cos(180^\\circ-\\alpha)=-\\cos\\alpha$.\n* $\\sin(90^\\circ+\\alpha)=\\cos\\alpha$, a nie $\\sin\\alpha$.\n* Nie zamieniaj stopni na radiany w wzorach ze stopniami.\n* Tangens nie istnieje dla $90^\\circ$ i $270^\\circ$.",
    exercises:
      "1. Oblicz $\\sin150^\\circ$.\n2. Oblicz $\\cos120^\\circ$.\n3. Oblicz $\\operatorname{tg}135^\\circ$.\n4. Uprość $\\sin(180^\\circ-\\alpha)$.\n5. Uprość $\\cos(360^\\circ-\\alpha)$.\n6. Oblicz $\\sin(90^\\circ+30^\\circ)$.",
    answers:
      "1. $\\frac12$.\n2. $-\\frac12$.\n3. $-1$.\n4. $\\sin\\alpha$.\n5. $\\cos\\alpha$.\n6. $\\cos30^\\circ=\\frac{\\sqrt3}{2}$.",
    recap:
      "1. Jakie znaki mają funkcje w drugiej ćwiartce?\n2. Podaj wzór na $\\sin(180^\\circ-\\alpha)$.\n3. Podaj wzór na $\\cos(180^\\circ+\\alpha)$.\n4. Ile wynosi $\\sin(90^\\circ+\\alpha)$?\n5. Jak obliczyć $\\operatorname{tg}150^\\circ$?",
    diagram:
      "kąt → ćwiartka\n   ↓\n znak funkcji\n   ↓\n kąt ostry + wzór\n   ↓\n wartość dokładna",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "wielokaty_foremne",
    title: "Wielokąty foremne - kąty i przekątne",
    examNote:
      "Wielokąty foremne łączą geometrię z obliczeniami kątów. CKE sprawdza miarę kąta wewnętrznego, kąt środkowy, liczbę przekątnych i obwód.",
    map:
      "1. Obliczysz sumę kątów wewnętrznych.\n2. Wyznaczysz miarę jednego kąta.\n3. Obliczysz kąt środkowy.\n4. Policzysz przekątne.\n5. Obliczysz obwód i wykorzystasz własności symetrii.",
    definitions:
      "Suma kątów wewnętrznych $n$-kąta wynosi $(n-2)\\cdot180^\\circ$, więc kąt wewnętrzny wielokąta foremnego ma $\\frac{(n-2)180^\\circ}{n}$. Kąt środkowy między sąsiednimi wierzchołkami to $\\frac{360^\\circ}{n}$.\n\nLiczba przekątnych $n$-kąta to $\\frac{n(n-3)}{2}$. Obwód wielokąta foremnego o boku $a$ wynosi $na$. W wielokącie foremnym wszystkie boki i kąty są równe, a okrąg opisany i wpisany mają ten sam środek.",
    example1:
      "Oblicz kąt wewnętrzny sześciokąta foremnego. Dla $n=6$ mamy $\\frac{(6-2)\\cdot180^\\circ}{6}=\\frac{720^\\circ}{6}=120^\\circ$. Kąt środkowy wynosi $\\frac{360^\\circ}{6}=60^\\circ$.",
    example2:
      "Ile przekątnych ma ośmiokąt? Korzystamy ze wzoru $\\frac{8(8-3)}{2}=\\frac{8\\cdot5}{2}=20$. Ośmiokąt ma $20$ przekątnych.",
    pitfalls:
      "* Suma kątów to $(n-2)180^\\circ$, a nie $n\\cdot180^\\circ$.\n* Kąt środkowy to $360^\\circ/n$, a kąt wewnętrzny jest inny.\n* Wzór na przekątne wymaga $n\\ge3$.\n* Nie myl liczby przekątnych z liczbą boków.\n* Kąt zewnętrzny i środkowy mają tę samą miarę $360^\\circ/n$.",
    exercises:
      "1. Oblicz kąt wewnętrzny pięciokąta foremnego.\n2. Oblicz sumę kątów wewnętrznych dziesięciokąta.\n3. Ile przekątnych ma siedmiokąt?\n4. Oblicz kąt środkowy dwunastokąta foremnego.\n5. Obwód sześciokąta foremnego o boku $5$ cm.\n6. Kąt wewnętrzny wielokąta foremnego ma $150^\\circ$. Ile ma boków?",
    answers:
      "1. $108^\\circ$.\n2. $8\\cdot180^\\circ=1440^\\circ$.\n3. $\\frac{7\\cdot4}{2}=14$.\n4. $30^\\circ$.\n5. $30$ cm.\n6. $n=12$.",
    recap:
      "1. Podaj wzór na sumę kątów $n$-kąta.\n2. Jak obliczyć kąt wewnętrzny wielokąta foremnego?\n3. Podaj wzór na liczbę przekątnych.\n4. Ile wynosi kąt środkowy?\n5. Jak znaleźć $n$ z danego kąta wewnętrznego?",
    diagram:
      "n-kąt foremny\n   ↓\n suma = (n-2)·180°\n   ↓\n kąt = suma/n\n   ↓\n przekątne = n(n-3)/2",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "punkty_szczegolne_trojkata",
    title: "Punkty szczególne trójkąta",
    examNote:
      "Punkty szczególne trójkąta to środek ciężkości, ortocentrum, środek okręgu wpisanego i opisanego. CKE sprawdza ich definicje oraz podział środkowej w stosunku $2:1$.",
    map:
      "1. Rozpoznasz środek ciężkości i jego własność.\n2. Wskażesz ortocentrum.\n3. Wskażesz środek okręgu wpisanego.\n4. Wskażesz środek okręgu opisanego.\n5. Wykorzystasz własności trójkąta prostokątnego i równobocznego.",
    definitions:
      "**Środek ciężkości** to przecięcie środkowych; dzieli każdą środkową w stosunku $2:1$, licząc od wierzchołka. **Ortocentrum** to przecięcie wysokości. **Środek okręgu wpisanego** to przecięcie dwusiecznych kątów, a **środek okręgu opisanego** - przecięcie symetralnych boków.\n\nW trójkącie prostokątnym środek okręgu opisanego leży w połowie przeciwprostokątnej, więc $R=\\frac c2$. W trójkącie równobocznym wszystkie cztery punkty szczególne pokrywają się oraz $R=2r$.",
    example1:
      "Środkowa trójkąta ma długość $12$ cm. Środek ciężkości dzieli ją w stosunku $2:1$, więc odległość od wierzchołka wynosi $\\frac23\\cdot12=8$ cm, a od boku $\\frac13\\cdot12=4$ cm.",
    example2:
      "Trójkąt prostokątny ma przyprostokątne $6$ cm i $8$ cm. Przeciwprostokątna ma $10$ cm, więc promień okręgu opisanego wynosi $R=\\frac{10}{2}=5$ cm. Środek tego okręgu leży w połowie przeciwprostokątnej.",
    pitfalls:
      "* Środek ciężkości jest bliżej boku, a nie wierzchołka.\n* Ortocentrum to przecięcie wysokości, a nie środkowych.\n* Środek okręgu wpisanego wyznaczają dwusieczne, a opisanego - symetralne.\n* W trójkącie rozwartokątnym ortocentrum leży poza trójkątem.\n* Nie myl promienia okręgu wpisanego z opisanym.",
    exercises:
      "1. Środkowa ma $18$ cm. Jak daleko od wierzchołka jest środek ciężkości?\n2. Gdzie leży ortocentrum trójkąta prostokątnego?\n3. Przeciwprostokątna ma $14$ cm. Podaj $R$.\n4. Które punkty wyznaczają środek okręgu wpisanego?\n5. W trójkącie równobocznym $R=6$. Podaj $r$.\n6. Środek ciężkości jest oddalony od boku o $5$ cm. Podaj długość środkowej.",
    answers:
      "1. $12$ cm.\n2. W wierzchołku kąta prostego.\n3. $7$ cm.\n4. Przecięcie dwusiecznych kątów.\n5. $r=3$.\n6. Środkowa ma $15$ cm.",
    recap:
      "1. W jakim stosunku środek ciężkości dzieli środkową?\n2. Czym jest ortocentrum?\n3. Co wyznacza środek okręgu wpisanego?\n4. Co wyznacza środek okręgu opisanego?\n5. Gdzie leży środek okręgu opisanego na trójkącie prostokątnym?",
    diagram:
      "środkowe → środek ciężkości (2:1)\nwysokości → ortocentrum\ndwusieczne → okrąg wpisany\nsymetralne → okrąg opisany",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "wycinek_i_luk",
    title: "Wycinek koła i łuk okręgu",
    examNote:
      "Zadania o wycinku i łuku sprawdzają proporcję kąta do kąta pełnego. CKE podaje promień i kąt środkowy, a prosi o długość łuku, pole wycinka lub obwód wycinka.",
    map:
      "1. Obliczysz długość łuku.\n2. Obliczysz pole wycinka.\n3. Wyznaczysz obwód wycinka.\n4. Odczytasz kąt z danych.\n5. Zapiszesz wynik z $\\pi$ lub przybliżeniem.",
    definitions:
      "Łuk odpowiadający kątowi środkowemu $\\alpha$ stanowi $\\frac{\\alpha}{360}$ całego okręgu. Długość łuku wynosi $l=\\frac{\\alpha}{360}\\cdot2\\pi r$, a pole wycinka $P=\\frac{\\alpha}{360}\\cdot\\pi r^2$.\n\nObwód wycinka to dwa promienie i łuk: $2r+l$. Dla kąta w radianach $l=r\\theta$ oraz $P=\\frac12r^2\\theta$. Jeśli kąt jest większy od $180^\\circ$, wycinek jest większy od połowy koła.",
    example1:
      "Koło ma promień $6$ cm, a kąt środkowy $60^\\circ$. Długość łuku to $\\frac{60}{360}\\cdot2\\pi\\cdot6=2\\pi$ cm. Pole wycinka wynosi $\\frac{60}{360}\\cdot\\pi\\cdot36=6\\pi$ cm$^2$.",
    example2:
      "Wycinek ma promień $4$ cm i kąt $90^\\circ$. Jego obwód to $2\\cdot4+\\frac{90}{360}\\cdot2\\pi\\cdot4=8+2\\pi$ cm. Pole wycinka to $\\frac14\\cdot16\\pi=4\\pi$ cm$^2$.",
    pitfalls:
      "* We wzorze na pole jest $r^2$, a nie $r$.\n* Kąt w mianowniku to zawsze $360$, a nie $180$.\n* Obwód wycinka zawiera dwa promienie.\n* Nie mieszaj jednostek długości i pola.\n* Wynik można zostawić z $\\pi$, jeśli polecenie nie każe zaokrąglać.",
    exercises:
      "1. Oblicz długość łuku dla $r=6$ i $\\alpha=60^\\circ$.\n2. Oblicz pole wycinka dla $r=4$ i $\\alpha=90^\\circ$.\n3. Oblicz obwód wycinka dla $r=3$ i $\\alpha=120^\\circ$.\n4. Jaką częścią koła jest wycinek o kącie $45^\\circ$?\n5. Oblicz pole wycinka dla $r=2$ i $\\alpha=180^\\circ$.\n6. Długość łuku wynosi $\\pi$, a promień $2$. Podaj kąt w stopniach.",
    answers:
      "1. $2\\pi$ cm.\n2. $4\\pi$ cm$^2$.\n3. $6+2\\pi$ cm.\n4. $\\frac18$.\n5. $2\\pi$ cm$^2$.\n6. $90^\\circ$.",
    recap:
      "1. Jak obliczyć długość łuku?\n2. Jak obliczyć pole wycinka?\n3. Co zawiera obwód wycinka?\n4. Jaką częścią koła jest wycinek $90^\\circ$?\n5. Jaki wzór wiąże łuk z kątem w radianach?",
    diagram:
      "wycinek α\n   ↓\n α/360 części koła\n   ↓\n l = α/360 · 2πr\n P = α/360 · πr²",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "katy_w_brylach",
    title: "Kąty w bryłach - sześcian, ostrosłup, stożek",
    examNote:
      "Kąty w bryłach wymagają wskazania odpowiedniego trójkąta prostokątnego. CKE najczęściej pyta o kąt przekątnej sześcianu z podstawą, kąt krawędzi bocznej ostrosłupa i kąt tworzącej stożka.",
    map:
      "1. Wskażesz rzut odcinka na podstawę.\n2. Zbudujesz trójkąt prostokątny.\n3. Użyjesz tangensa lub cosinusa.\n4. Rozpoznasz kąty $30^\\circ$, $45^\\circ$, $60^\\circ$.\n5. Obliczysz kąt bez przybliżeń, jeśli to możliwe.",
    definitions:
      "Kąt między odcinkiem a płaszczyzną to kąt między tym odcinkiem a jego rzutem prostokątnym na płaszczyznę. W sześcianie krawędź, przekątna ściany i przekątna sześcianu tworzą trójkąty prostokątne.\n\nPrzekątna ściany sześcianu o krawędzi $a$ ma $a\\sqrt2$, a przekątna sześcianu $a\\sqrt3$. Kąt przekątnej sześcianu z podstawą ma $\\cos\\alpha=\\frac{a\\sqrt2}{a\\sqrt3}=\\frac{\\sqrt6}{3}$. W stożku $\\operatorname{tg}\\alpha=\\frac hr$, gdzie $\\alpha$ to kąt tworzącej z podstawą.",
    example1:
      "W sześcianie o krawędzi $a$ przekątne dwóch sąsiednich ścian wychodzą z tego samego wierzchołka. Ich końce tworzą trójkąt równoboczny o bokach $a\\sqrt2$, więc kąt między przekątnymi wynosi $60^\\circ$.",
    example2:
      "Stożek ma wysokość równą promieniowi podstawy. Wtedy $\\operatorname{tg}\\alpha=\\frac hr=1$, więc kąt między tworzącą a podstawą wynosi $45^\\circ$. Ten sam wynik daje ostrosłup prawidłowy, w którym wysokość równa się połowie przekątnej podstawy.",
    pitfalls:
      "* Kąt z podstawą mierzymy do rzutu, a nie do krawędzi podstawy.\n* Przekątna sześcianu to $a\\sqrt3$, a nie $a\\sqrt2$.\n* W stożku przeciwprostokątna to tworząca, a nie wysokość.\n* Nie zakładaj $45^\\circ$ bez sprawdzenia stosunku boków.\n* Kąt między przekątnymi ścian to nie to samo co kąt z podstawą.",
    exercises:
      "1. Jaki kąt tworzy przekątna ściany sześcianu z krawędzią?\n2. Jaki kąt tworzą przekątne dwóch sąsiednich ścian sześcianu?\n3. Stożek ma $h=r$. Podaj kąt tworzącej z podstawą.\n4. Walec ma $h=2r$. Podaj kąt przekątnej przekroju osiowego z podstawą.\n5. Cosinus kąta przekątnej sześcianu z podstawą.\n6. Ostrosłup ma wysokość równą połowie przekątnej podstawy. Podaj kąt krawędzi bocznej z podstawą.",
    answers:
      "1. $45^\\circ$.\n2. $60^\\circ$.\n3. $45^\\circ$.\n4. $45^\\circ$.\n5. $\\frac{\\sqrt6}{3}$.\n6. $45^\\circ$.",
    recap:
      "1. Jak definiujemy kąt odcinka z płaszczyzną?\n2. Ile wynosi przekątna sześcianu?\n3. Jak obliczyć kąt tworzącej stożka?\n4. Kiedy kąt wynosi $45^\\circ$?\n5. Dlaczego przekątne sąsiednich ścian tworzą $60^\\circ$?",
    diagram:
      "bryła\n  ↓\n rzut na podstawę\n  ↓\n trójkąt prostokątny\n  ↓\n tg / cos kąta",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "przekroje_bryl",
    title: "Przekroje brył - co powstaje z przecięcia",
    examNote:
      "Przekroje brył sprawdzają wyobraźnię przestrzenną i umiejętność obliczenia pola figury przekroju. CKE najczęściej pyta o przekrój sześcianu, walca i stożka.",
    map:
      "1. Rozpoznasz kształt przekroju.\n2. Wskażesz wymiary figury przekroju.\n3. Obliczysz jej pole.\n4. Odróżnisz przekrój osiowy od równoległego do podstawy.\n5. Wykorzystasz twierdzenie Pitagorasa.",
    definitions:
      "Przekrój bryły to figura powstała z przecięcia bryły płaszczyzną. Przekrój sześcianu równoległy do ściany jest kwadratem, a przekrój przechodzący przez przekątną podstawy i krawędź boczną - prostokątem o bokach $a$ i $a\\sqrt2$.\n\nPrzekrój osiowy walca to prostokąt $2r\\times h$, a stożka - trójkąt równoramienny o podstawie $2r$ i wysokości $h$. Przekrój kuli przez środek jest kołem wielkim o polu $\\pi r^2$.",
    example1:
      "Sześcian o krawędzi $3$ przecięto płaszczyzną równoległą do ściany. Przekrój jest kwadratem o boku $3$, więc jego pole wynosi $9$.",
    example2:
      "Walec ma promień $2$ i wysokość $5$. Przekrój osiowy jest prostokątem o bokach $4$ i $5$, więc jego pole to $20$. Przekrój równoległy do podstawy byłby kołem o polu $4\\pi$.",
    pitfalls:
      "* Przekrój równoległy do podstawy walca jest kołem, a nie prostokątem.\n* Przekrój osiowy stożka ma podstawę $2r$, a nie $r$.\n* Pole przekroju sześcianu przez trzy wierzchołki nie jest kwadratem.\n* Nie myl przekroju kuli z jej powierzchnią.\n* Rysunek pomocniczy ułatwia ustalenie wymiarów.",
    exercises:
      "1. Podaj pole przekroju sześcianu o krawędzi $4$ równoległego do ściany.\n2. Podaj pole przekroju osiowego walca o $r=3$ i $h=6$.\n3. Podaj pole przekroju osiowego stożka o $r=2$ i $h=5$.\n4. Jaki kształt ma przekrój kuli przez środek?\n5. Przekrój sześcianu przez przekątną podstawy i krawędź boczną ma boki $a$ i $a\\sqrt2$. Podaj pole dla $a=2$.\n6. Jaki kształt ma przekrój walca płaszczyzną równoległą do podstawy?",
    answers:
      "1. $16$.\n2. $36$.\n3. $10$.\n4. Koło wielkie.\n5. $2\\cdot2\\sqrt2=4\\sqrt2$.\n6. Koło.",
    recap:
      "1. Czym jest przekrój bryły?\n2. Jaki przekrój daje płaszczyzna równoległa do podstawy walca?\n3. Jakie wymiary ma przekrój osiowy stożka?\n4. Jaki jest przekrój sześcianu przez przekątną podstawy?\n5. Jaki przekrój kuli przechodzi przez jej środek?",
    diagram:
      "płaszczyzna cięcia\n   ↓\n figura przekroju\n   ↓\n wymiary z bryły\n   ↓\n pole",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "bryly_podobne",
    title: "Bryły podobne - skala, pola i objętości",
    examNote:
      "Podobieństwo brył opisuje, jak zmieniają się długości, pola i objętości. CKE sprawdza skalę $k$, stosunek pól $k^2$ i stosunek objętości $k^3$.",
    map:
      "1. Wyznaczysz skalę podobieństwa.\n2. Zastosujesz stosunek pól $k^2$.\n3. Zastosujesz stosunek objętości $k^3$.\n4. Wrócisz ze stosunku objętości do skali.\n5. Rozwiążesz zadanie o zwiększeniu wymiarów.",
    definitions:
      "Dwie bryły są podobne w skali $k$, jeśli każda długość jednej bryły jest $k$ razy większa od odpowiadającej długości drugiej. Wtedy stosunek pól powierzchni wynosi $k^2$, a stosunek objętości $k^3$.\n\nJeśli stosunek objętości jest równy $V_1:V_2$, to skala długości jest pierwiastkiem trzeciego stopnia tego stosunku. Przykładowo $V_1:V_2=8:27$ daje skalę $2:3$, a $V_1:V_2=64:1$ - skalę $4:1$.",
    example1:
      "Krawędź sześcianu zwiększono dwa razy. Pole powierzchni wzrosło $2^2=4$ razy, a objętość $2^3=8$ razy. Dzieje się tak, bo wszystkie długości zmieniły się w tej samej skali.",
    example2:
      "Dwie bryły podobne mają objętości w stosunku $8:27$. Skala podobieństwa to $\\sqrt[3]{\\frac8{27}}=\\frac23$, więc stosunek pól wynosi $\\frac49$. Mniejsza bryła jest podobna do większej w skali $2:3$.",
    pitfalls:
      "* Pola zmieniają się jak $k^2$, a objętości jak $k^3$.\n* Ze stosunku objętości nie przechodzi się liniowo do skali.\n* Skala $k$ dotyczy długości, a nie pól.\n* Stosunek $1:k$ i $k:1$ opisuje tę samą parę brył, ale w odwrotnej kolejności.\n* Nie dodawaj stosunków objętości.",
    exercises:
      "1. Skala podobieństwa wynosi $3$. Ile razy większa jest objętość?\n2. Skala wynosi $4$. Ile razy większe jest pole?\n3. Objętości brył podobnych są w stosunku $27:64$. Podaj skalę.\n4. Pola brył podobnych są w stosunku $25:9$. Podaj skalę.\n5. Krawędź sześcianu zwiększono $3$ razy. Ile razy wzrosła objętość?\n6. Promień kuli zwiększono $2$ razy. Ile razy wzrosło pole?",
    answers:
      "1. $27$ razy.\n2. $16$ razy.\n3. $3:4$.\n4. $5:3$.\n5. $27$ razy.\n6. $4$ razy.",
    recap:
      "1. Jak zmieniają się pola przy skali $k$?\n2. Jak zmieniają się objętości?\n3. Jak ze stosunku objętości wyznaczyć skalę?\n4. Co oznacza skala $2:3$?\n5. Dlaczego pole rośnie szybciej niż długość?",
    diagram:
      "skala k\n ├─ długości ×k\n ├─ pola ×k²\n └─ objętości ×k³",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "walce_stozki_kule",
    title: "Walec, stożek i kula - objętości i pola",
    examNote:
      "Bryły obrotowe pojawiają się w zadaniach na objętość i pole powierzchni. CKE podaje wymiary i prosi o wynik z $\\pi$; trzeba poprawnie dobrać wzór i jednostki.",
    map:
      "1. Rozpoznasz bryłę i jej wymiary.\n2. Obliczysz objętość walca i stożka.\n3. Obliczysz objętość i pole kuli.\n4. Obliczysz pole boczne oraz całkowite.\n5. Wyznaczysz tworzącą stożka.",
    definitions:
      "Walec: $V=\\pi r^2h$, $P_b=2\\pi rh$, $P_c=2\\pi r(r+h)$. Stożek: $V=\\frac13\\pi r^2h$, $P_b=\\pi rl$, gdzie $l=\\sqrt{r^2+h^2}$ jest tworzącą.\n\nKula: $V=\\frac43\\pi r^3$ oraz $P=4\\pi r^2$. Objętość stożka jest trzy razy mniejsza od objętości walca o tej samej podstawie i wysokości. Jednostki objętości są sześcienne, a pola - kwadratowe.",
    example1:
      "Walec ma $r=3$ cm i $h=5$ cm. Objętość wynosi $\\pi\\cdot9\\cdot5=45\\pi$ cm$^3$, a pole boczne $2\\pi\\cdot3\\cdot5=30\\pi$ cm$^2$.",
    example2:
      "Stożek ma $r=3$ i $h=4$. Tworząca $l=\\sqrt{9+16}=5$. Objętość to $\\frac13\\pi\\cdot9\\cdot4=12\\pi$, a pole boczne $\\pi\\cdot3\\cdot5=15\\pi$.",
    pitfalls:
      "* W objętości stożka jest współczynnik $\\frac13$.\n* Tworząca to przeciwprostokątna, nie wysokość.\n* Pole kuli to $4\\pi r^2$, a objętość $\\frac43\\pi r^3$.\n* Pole boczne walca nie zawiera pól podstaw.\n* Nie mieszaj jednostek $\\text{cm}^2$ i $\\text{cm}^3$.",
    exercises:
      "1. Oblicz objętość walca $r=2$, $h=6$.\n2. Oblicz objętość stożka $r=3$, $h=5$.\n3. Oblicz objętość kuli $r=3$.\n4. Oblicz pole powierzchni kuli $r=5$.\n5. Oblicz pole boczne walca $r=4$, $h=3$.\n6. Stożek ma $r=6$, $h=8$. Oblicz tworzącą.",
    answers:
      "1. $24\\pi$.\n2. $15\\pi$.\n3. $36\\pi$.\n4. $100\\pi$.\n5. $24\\pi$.\n6. $l=10$.",
    recap:
      "1. Podaj wzór na objętość walca.\n2. Podaj wzór na objętość stożka.\n3. Podaj wzór na objętość kuli.\n4. Jak wyznaczyć tworzącą stożka?\n5. Czym różni się pole boczne od całkowitego?",
    diagram:
      "walec: V=πr²h\nstożek: V=⅓πr²h, l=√(r²+h²)\nkula: V=(4/3)πr³",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "rownanie_okregu",
    title: "Równanie okręgu - środek i promień",
    examNote:
      "Równanie okręgu łączy geometrię analityczną z algebraią. CKE sprawdza odczyt środka i promienia, zapis równania oraz sprawdzenie, czy punkt należy do okręgu.",
    map:
      "1. Zapiszesz równanie z postaci kanonicznej.\n2. Odczytasz środek i promień.\n3. Przejdziesz z postaci ogólnej do kanonicznej.\n4. Sprawdzisz przynależność punktu.\n5. Wyznaczysz okrąg z średnicy.",
    definitions:
      "Okrąg o środku $S=(a,b)$ i promieniu $r$ opisuje równanie $(x-a)^2+(y-b)^2=r^2$. W postaci ogólnej $x^2+y^2+Dx+Ey+F=0$ środek ma współrzędne $\\left(-\\frac D2,-\\frac E2\\right)$, a promień spełnia $r^2=\\left(\\frac D2\\right)^2+\\left(\\frac E2\\right)^2-F$.\n\nPunkt $(x_0,y_0)$ należy do okręgu, gdy jego odległość od środka wynosi $r$. Okrąg o środku w początku układu ma równanie $x^2+y^2=r^2$.",
    example1:
      "Okrąg $(x-2)^2+(y+3)^2=25$ ma środek $(2,-3)$ i promień $5$. Uwaga na znak: $y+3=y-(-3)$, więc druga współrzędna środka to $-3$.",
    example2:
      "Okrąg $x^2+y^2-6x+4y-3=0$ ma środek $\\left(3,-2\\right)$. Promień wyznaczamy z $r^2=3^2+(-2)^2-(-3)=9+4+3=16$, więc $r=4$. Równanie kanoniczne to $(x-3)^2+(y+2)^2=16$.",
    pitfalls:
      "* W równaniu $(x-a)^2$ środek ma współrzędną $a$, a nie $-a$.\n* Promień w równaniu jest podniesiony do kwadratu.\n* W postaci ogólnej środek to $(-D/2,-E/2)$, a nie $(D,E)$.\n* Sprawdzając punkt, podstawiaj obie współrzędne.\n* Promień musi być dodatni.",
    exercises:
      "1. Podaj środek i promień $(x-1)^2+(y-2)^2=9$.\n2. Zapisz równanie okręgu o środku $(0,0)$ i $r=4$.\n3. Podaj środek $x^2+y^2-4x+6y-12=0$.\n4. Czy punkt $(5,2)$ należy do $(x-1)^2+(y-2)^2=16$?\n5. Średnica ma końce $(0,0)$ i $(6,0)$. Podaj promień.\n6. Podaj promień $x^2+y^2=49$.",
    answers:
      "1. $S=(1,2)$, $r=3$.\n2. $x^2+y^2=16$.\n3. $S=(2,-3)$.\n4. Tak, odległość od $(1,2)$ wynosi $4$.\n5. $r=3$.\n6. $r=7$.",
    recap:
      "1. Podaj kanoniczne równanie okręgu.\n2. Jak odczytać środek z postaci ogólnej?\n3. Jak sprawdzić, czy punkt należy do okręgu?\n4. Co oznacza $r^2$ we wzorze?\n5. Jak wyznaczyć środek ze średnicy?",
    diagram:
      "(x-a)² + (y-b)² = r²\n        ↓\n S=(a,b), r\n        ↓\n postać ogólna\n        ↓\n S=(-D/2,-E/2)",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "odleglosc_punktu_od_prostej",
    title: "Odległość punktu od prostej",
    examNote:
      "Odległość punktu od prostej oblicza się ze wzoru z wartością bezwzględną. CKE sprawdza podstawienie do wzoru, odległość prostych równoległych oraz odległość od osi układu.",
    map:
      "1. Zapiszesz prostą w postaci $Ax+By+C=0$.\n2. Podstawisz współrzędne punktu.\n3. Obliczysz mianownik $\\sqrt{A^2+B^2}$.\n4. Wyznaczysz odległość prostych równoległych.\n5. Odróżnisz odległość od osi OX i OY.",
    definitions:
      "Odległość punktu $P=(x_0,y_0)$ od prostej $Ax+By+C=0$ wynosi $d=\\frac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}$. Wartość bezwzględna jest konieczna, bo odległość nie może być ujemna.\n\nOdległość między prostymi równoległymi $Ax+By+C_1=0$ i $Ax+By+C_2=0$ to $\\frac{|C_1-C_2|}{\\sqrt{A^2+B^2}}$. Odległość punktu od osi $OX$ to $|y|$, a od osi $OY$ - $|x|$.",
    example1:
      "Oblicz odległość $P=(1,2)$ od prostej $3x+4y-10=0$. Licznik to $|3\\cdot1+4\\cdot2-10|=|1|=1$, a mianownik $\\sqrt{9+16}=5$. Odległość wynosi $\\frac15$.",
    example2:
      "Odległość między prostymi $3x+4y-2=0$ i $3x+4y+8=0$ to $\\frac{|-2-8|}{5}=\\frac{10}{5}=2$. Proste są równoległe, bo mają te same współczynniki przy $x$ i $y$.",
    pitfalls:
      "* Nie pomiń wartości bezwzględnej w liczniku.\n* Mianownik to pierwiastek z sumy kwadratów $A$ i $B$.\n* Prostą trzeba najpierw zapisać w postaci ogólnej.\n* Wzór na proste równoległe wymaga jednakowych $A$ i $B$.\n* Odległość od osi OX to $|y|$, a nie $x$.",
    exercises:
      "1. Oblicz odległość $(0,0)$ od $3x+4y-10=0$.\n2. Oblicz odległość $(2,1)$ od $x=5$.\n3. Oblicz odległość $(3,-1)$ od $y=2$.\n4. Oblicz odległość między $3x+4y=0$ i $3x+4y=10$.\n5. Oblicz odległość $(1,1)$ od $5x+12y-13=0$.\n6. Odległość punktu od osi OX, gdy $y=-4$.",
    answers:
      "1. $2$.\n2. $3$.\n3. $3$.\n4. $2$.\n5. $\\frac{|5+12-13|}{13}=\\frac4{13}$.\n6. $4$.",
    recap:
      "1. Podaj wzór na odległość punktu od prostej.\n2. Dlaczego w liczniku jest wartość bezwzględna?\n3. Jak obliczyć odległość prostych równoległych?\n4. Jak zapisać prostą w postaci ogólnej?\n5. Ile wynosi odległość od osi OX?",
    diagram:
      "Ax+By+C=0\n   ↓\n |Ax₀+By₀+C|\n   ↓\n √(A²+B²)\n   ↓\n odległość d",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "wektory",
    title: "Wektory - współrzędne, długość i iloczyn skalarny",
    examNote:
      "Wektory służą do opisu przesunięć i prostopadłości. CKE sprawdza współrzędne wektora $\\vec{AB}$, długość, sumę, iloczyn skalarny oraz warunki równoległości i prostopadłości.",
    map:
      "1. Wyznaczysz współrzędne wektora z punktów.\n2. Obliczysz długość wektora.\n3. Dodasz i odejmiesz wektory.\n4. Obliczysz iloczyn skalarny.\n5. Zastosujesz warunek prostopadłości i równoległości.",
    definitions:
      "Dla $A=(x_1,y_1)$ i $B=(x_2,y_2)$ wektor $\\vec{AB}=[x_2-x_1,y_2-y_1]$. Jego długość wynosi $|\\vec u|=\\sqrt{u_x^2+u_y^2}$.\n\nSuma wektorów to suma odpowiednich współrzędnych. Iloczyn skalarny $\\vec u\\circ\\vec v=u_xv_x+u_yv_y$. Wektory są prostopadłe, gdy ich iloczyn skalarny wynosi $0$, a równoległe, gdy ich współrzędne są proporcjonalne.",
    example1:
      "Dla $A=(1,2)$ i $B=(4,6)$ wektor $\\vec{AB}=[3,4]$. Jego długość to $\\sqrt{9+16}=5$. Wektor przeciwny ma współrzędne $[-3,-4]$.",
    example2:
      "Wektory $\\vec u=[2,3]$ i $\\vec v=[3,-2]$ są prostopadłe, bo $2\\cdot3+3\\cdot(-2)=0$. Ich iloczyn skalarny jest zerem, choć żaden z wektorów nie jest zerowy.",
    pitfalls:
      "* Kolejność punktów ma znaczenie: $\\vec{AB}=-\\vec{BA}$.\n* Długość to pierwiastek z sumy kwadratów, a nie suma współrzędnych.\n* Iloczyn skalarny jest liczbą, a nie wektorem.\n* Prostą prostopadłość sprawdzaj iloczynem skalarnym, nie iloczynem współrzędnych.\n* Wektor zerowy jest prostopadły do każdego, ale nie ma kierunku.",
    exercises:
      "1. Dla $A=(2,1)$, $B=(5,5)$ podaj $\\vec{AB}$.\n2. Oblicz długość $[6,8]$.\n3. Oblicz $[1,2]+[3,-1]$.\n4. Oblicz iloczyn skalarny $[2,1]\\circ[3,4]$.\n5. Czy $[1,2]$ i $[2,-1]$ są prostopadłe?\n6. Podaj środek odcinka o końcach $(0,0)$ i $(4,6)$.",
    answers:
      "1. $[3,4]$.\n2. $10$.\n3. $[4,1]$.\n4. $10$.\n5. Tak, $1\\cdot2+2\\cdot(-1)=0$.\n6. $(2,3)$.",
    recap:
      "1. Jak wyznaczyć $\\vec{AB}$?\n2. Podaj wzór na długość wektora.\n3. Jak dodać wektory?\n4. Kiedy wektory są prostopadłe?\n5. Kiedy wektory są równoległe?",
    diagram:
      "A(x₁,y₁), B(x₂,y₂)\n   ↓\n AB = [x₂-x₁, y₂-y₁]\n   ↓\n |AB| = √(uₓ²+u_y²)\n   ↓\n u∘v = 0 → prostopadłe",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "regula_mnozenia",
    title: "Reguła mnożenia i dodawania",
    examNote:
      "Reguła mnożenia liczy sposoby wykonania kolejnych czynności, a reguła dodawania - wybór jednej z rozłącznych możliwości. CKE sprawdza kody, numery, zestawy i liczenie dróg.",
    map:
      "1. Rozłożysz zadanie na kolejne czynności.\n2. Sprawdzisz, czy wybory są niezależne.\n3. Pomnożysz liczby możliwości.\n4. Użyjesz dodawania dla rozłącznych grup.\n5. Uwzględnisz brak powtórzeń i zero na początku.",
    definitions:
      "**Reguła mnożenia:** jeśli pierwszą czynność można wykonać na $m$ sposobów, a drugą na $n$ sposobów, to obie razem na $m\\cdot n$ sposobów. Stosujemy ją przy kolejnych, niezależnych wyborach.\n\n**Reguła dodawania:** jeśli wybieramy dokładnie jeden element z rozłącznych grup o $m$ i $n$ elementach, to mamy $m+n$ możliwości. W kodach z powtórzeniami każda pozycja ma tyle samo opcji; bez powtórzeń liczba opcji maleje.",
    example1:
      "Kod składa się z trzech liter wybieranych z $5$ liter, litery mogą się powtarzać. Każdą pozycję wybieramy na $5$ sposobów, więc kodów jest $5^3=125$.",
    example2:
      "Liczba dwucyfrowa parzysta z cyfr $\\{1,2,3,4,5\\}$ bez powtórzeń: cyfrę jedności wybieramy na $2$ sposoby ($2$ lub $4$), a cyfrę dziesiątek na $4$ sposoby (bez wybranej). Razem $2\\cdot4=8$ liczb.",
    pitfalls:
      "* Nie dodawaj liczby możliwości, gdy czynności wykonujesz kolejno.\n* Uważaj, czy elementy mogą się powtarzać.\n* Pierwsza cyfra liczby nie może być zerem.\n* Reguła dodawania wymaga rozłącznych grup.\n* Kolejność wyboru nie zmienia wyniku mnożenia, ale ułatwia liczenie.",
    exercises:
      "1. $3$ koszule i $4$ pary spodni - ile zestawów?\n2. Kod z $2$ cyfr, cyfry mogą się powtarzać - ile kodów?\n3. $4$ zupy albo $5$ dań - ile możliwości wyboru jednej potrawy?\n4. Trzyliterowy kod z $4$ liter bez powtórzeń.\n5. Ile liczb dwucyfrowych z cyfr $1$-$4$ z powtórzeniami?\n6. Na ile sposobów można wybrać przewodniczącego i zastępcę spośród $6$ osób?",
    answers:
      "1. $12$.\n2. $100$.\n3. $9$.\n4. $4\\cdot3\\cdot2=24$.\n5. $4\\cdot4=16$.\n6. $6\\cdot5=30$.",
    recap:
      "1. Kiedy stosujemy regułę mnożenia?\n2. Kiedy regułę dodawania?\n3. Co zmienia możliwość powtarzania?\n4. Dlaczego zero nie może stać na początku liczby?\n5. Jak policzyć kody bez powtórzeń?",
    diagram:
      "czynność 1 → m sposobów\nczynność 2 → n sposobów\n   ↓\n razem m·n\n   ↓\n albo rozłączne grupy → m+n",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "permutacje",
    title: "Permutacje - ustawienia i powtórzenia",
    examNote:
      "Permutacje liczą ustawienia elementów, gdy kolejność ma znaczenie. CKE sprawdza $n!$, ustawienia z powtórzeniami liter oraz ustawienia w kole i z ograniczeniem.",
    map:
      "1. Rozpoznasz permutację zbioru.\n2. Obliczysz $n!$.\n3. Uwzględnisz powtarzające się litery.\n4. Zastosujesz permutacje cykliczne.\n5. Policzysz ustawienia z blokiem.",
    definitions:
      "Permutacja to ustawienie wszystkich elementów zbioru w kolejności. Liczba permutacji $n$ różnych elementów wynosi $n!=1\\cdot2\\cdot\\ldots\\cdot n$, przy czym $0!=1$.\n\nJeśli elementy się powtarzają, dzielimy przez silnie powtórzeń: liczba różnych ustawień liter wyrazu z powtórzeniami to $\\frac{n!}{n_1!n_2!\\ldots}$. Przy okrągłym stole liczba ustawień $n$ osób to $(n-1)!$, a para stojąca obok siebie daje $2\\cdot(n-1)!$.",
    example1:
      "Na ile sposobów można ustawić $5$ różnych książek? Odpowiedź to $5!=120$. Każda kolejność jest innym ustawieniem.",
    example2:
      "Ile różnych słów można utworzyć z liter wyrazu ANANAS? Liter jest $6$: trzy A i dwie N. Liczba ustawień wynosi $\\frac{6!}{3!\\,2!}=\\frac{720}{12}=60$.",
    pitfalls:
      "* $n!$ rośnie bardzo szybko - nie licz ręcznie dużych silni.\n* Przy powtórzeniach dzielisz przez silnie, a nie odejmujesz.\n* Przy okrągłym stole obroty utożsamiamy, stąd $(n-1)!$.\n* Blok zajmuje jedno miejsce, ale ma $2$ ustawienia wewnętrzne.\n* $0!=1$, a nie $0$.",
    exercises:
      "1. Ile ustawień $4$ różnych osób?\n2. Ile różnych słów z liter KOTEK?\n3. Ile ustawień $5$ osób przy okrągłym stole?\n4. Ile ustawień $4$ osób, jeśli para ma stać obok siebie?\n5. Oblicz $\\frac{6!}{5!}$.\n6. Ile ustawień $5$ osób, jeśli pierwsza jest ustalona?",
    answers:
      "1. $24$.\n2. $\\frac{5!}{2!}=60$.\n3. $4!=24$.\n4. $2\\cdot3!=12$.\n5. $6$.\n6. $4!=24$.",
    recap:
      "1. Co to jest permutacja?\n2. Podaj wzór na liczbę permutacji z powtórzeniami.\n3. Dlaczego przy stole jest $(n-1)!$?\n4. Jak traktować parę stojącą obok siebie?\n5. Ile wynosi $0!$?",
    diagram:
      "n różnych elementów\n   ↓\n n!\n   ↓\n powtórzenia: n!/(n₁!...)\n   ↓\n koło: (n-1)!",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "kombinacje",
    title: "Kombinacje - wybór bez kolejności",
    examNote:
      "Kombinacje liczą wybory, w których kolejność nie ma znaczenia. CKE sprawdza wybór komisji, parę osób, uściski dłoni oraz wartość symbolu Newtona.",
    map:
      "1. Rozpoznasz, że kolejność nie ma znaczenia.\n2. Zapiszesz symbol $\\binom nk$.\n3. Obliczysz go ze wzoru.\n4. Zastosujesz do wyboru osób lub przedmiotów.\n5. Odróżnisz kombinacje od permutacji.",
    definitions:
      "Liczba $k$-elementowych podzbiorów zbioru $n$-elementowego wynosi $\\binom nk=\\frac{n!}{k!(n-k)!}$ dla $0\\le k\\le n$. Kolejność wyboru nie ma znaczenia.\n\nZachodzi $\\binom nk=\\binom n{n-k}$, $\\binom n0=\\binom nn=1$ oraz $\\binom n1=n$. Liczba par w zbiorze $n$ osób to $\\binom n2=\\frac{n(n-1)}2$, co odpowiada liczbie uścisków dłoni.",
    example1:
      "Na ile sposobów można wybrać $3$ osoby z $10$? Kolejność nie ma znaczenia, więc $\\binom{10}{3}=\\frac{10\\cdot9\\cdot8}{3\\cdot2\\cdot1}=120$.",
    example2:
      "Na spotkaniu jest $8$ osób i każde dwie podają sobie rękę raz. Liczba uścisków to $\\binom82=\\frac{8\\cdot7}{2}=28$. Nie liczymy podwójnie, bo uścisk A-B to ten sam co B-A.",
    pitfalls:
      "* Kombinacje nie liczą kolejności - nie używaj $n!$ bez dzielenia.\n* $\\binom nk$ wymaga $k\\le n$.\n* $\\binom n2$ to nie $n(n-1)$, bo dzielimy przez $2$.\n* Wybór komisji to kombinacja, a ustawienie w rzędzie - permutacja.\n* $\\binom n0=1$, bo jest jeden zbiór pusty.",
    exercises:
      "1. Oblicz $\\binom52$.\n2. Oblicz $\\binom63$.\n3. Wybór $2$ osób z $7$.\n4. Liczba uścisków $10$ osób.\n5. Oblicz $\\binom{9}{8}$.\n6. Wybór $2$ kolorów z $5$.",
    answers:
      "1. $10$.\n2. $20$.\n3. $21$.\n4. $45$.\n5. $9$.\n6. $10$.",
    recap:
      "1. Kiedy stosujemy kombinacje?\n2. Podaj wzór na $\\binom nk$.\n3. Dlaczego $\\binom nk=\\binom n{n-k}$?\n4. Jak policzyć liczbę uścisków?\n5. Czym różni się kombinacja od permutacji?",
    diagram:
      "wybór bez kolejności\n   ↓\n C(n,k) = n!/(k!(n-k)!)\n   ↓\n para: C(n,2)\n   ↓\n wynik",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "prawdopodobienstwo_warunkowe",
    title: "Prawdopodobieństwo warunkowe",
    examNote:
      "Prawdopodobieństwo warunkowe opisuje sytuację, gdy wiemy, że zaszło pewne zdarzenie. CKE sprawdza wzór $P(A|B)=\\frac{P(A\\cap B)}{P(B)}$ oraz zadania z kostką, kartami i urną.",
    map:
      "1. Rozpoznasz warunek ograniczający przestrzeń.\n2. Wyznaczysz $P(B)$.\n3. Wyznaczysz $P(A\\cap B)$.\n4. Podzielisz prawdopodobieństwa.\n5. Zinterpretujesz wynik w kontekście.",
    definitions:
      "Prawdopodobieństwo warunkowe zdarzenia $A$ pod warunkiem $B$ wynosi $P(A|B)=\\frac{P(A\\cap B)}{P(B)}$ dla $P(B)>0$. Warunek $B$ zawęża przestrzeń zdarzeń do $B$.\n\nW zadaniach z kostką liczymy wyniki sprzyjające wśród wyników spełniających warunek, a nie w całej przestrzeni. W urnie bez zwracania prawdopodobieństwo drugiego losowania zależy od wyniku pierwszego.",
    example1:
      "Rzucamy kostką. Wiadomo, że wypadła liczba większa od $3$. Prawdopodobieństwo, że jest parzysta, wynosi $\\frac{2}{3}$, bo wśród $\\{4,5,6\\}$ parzyste są $4$ i $6$.",
    example2:
      "W urnie są $4$ kule białe i $3$ czarne. Losujemy bez zwracania. Jeśli pierwsza była biała, zostają $3$ białe i $6$ kul razem, więc $P(\\text{druga biała}|\\text{pierwsza biała})=\\frac36=\\frac12$.",
    pitfalls:
      "* Nie dziel przez $P(B)=0$ - warunek jest wtedy niemożliwy.\n* Przestrzeń ogranicza się do $B$, a nie do całego zbioru.\n* Przy losowaniu bez zwracania zmienia się liczba kul.\n* $P(A|B)\\ne P(B|A)$ na ogół.\n* Uważaj, czy warunek dotyczy pierwszej, czy drugiej kuli.",
    exercises:
      "1. Kostka: wiadomo, że wypadło więcej niż $4$. Prawdopodobieństwo parzystej.\n2. Karta czerwona - prawdopodobieństwo, że to król.\n3. Urna $3$ białe i $2$ czarne; pierwsza biała, druga biała.\n4. $P(A\\cap B)=0{,}2$, $P(B)=0{,}5$. Oblicz $P(A|B)$.\n5. Dwie kostki: suma większa od $8$, prawdopodobieństwo sumy $10$.\n6. W klasie $10$ dziewcząt i $10$ chłopców, matematykę lubi $4$ dziewczyny i $6$ chłopców. $P$ dziewczyna pod warunkiem, że lubi matematykę.",
    answers:
      "1. $\\frac12$.\n2. $\\frac1{13}$.\n3. $\\frac24=\\frac12$.\n4. $0{,}4$.\n5. $\\frac3{10}$.\n6. $\\frac4{10}=\\frac25$.",
    recap:
      "1. Podaj wzór na prawdopodobieństwo warunkowe.\n2. Co oznacza warunek $B$?\n3. Kiedy wzór nie ma sensu?\n4. Jak zmienia się losowanie bez zwracania?\n5. Czy $P(A|B)=P(B|A)$?",
    diagram:
      "P(A|B)\n   ↓\n P(A∩B) / P(B)\n   ↓\n przestrzeń zawężona do B\n   ↓\n wynik",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "schemat_bernoulliego",
    title: "Schemat Bernoulliego - powtarzane próby",
    examNote:
      "Schemat Bernoulliego opisuje $n$ niezależnych prób z tym samym prawdopodobieństwem sukcesu. CKE sprawdza dokładnie $k$ sukcesów, co najmniej jeden sukces oraz prawdopodobieństwo porażki.",
    map:
      "1. Rozpoznasz próby niezależne i stałe $p$.\n2. Ustalasz $n$, $k$ i $p$.\n3. Zastosujesz wzór Bernoulliego.\n4. Obliczysz prawdopodobieństwo co najmniej jednego sukcesu.\n5. Wykorzystasz zdarzenie przeciwne.",
    definitions:
      "W schemacie Bernoulliego wykonujemy $n$ niezależnych prób, w których prawdopodobieństwo sukcesu wynosi $p$, a porażki $1-p$. Prawdopodobieństwo dokładnie $k$ sukcesów wynosi $P_n(k)=\\binom nk p^k(1-p)^{n-k}$.\n\nPrawdopodobieństwo co najmniej jednego sukcesu to $1-(1-p)^n$, czyli jedynka minus prawdopodobieństwo samych porażek. Prawdopodobieństwo samych sukcesów to $p^n$, a braku sukcesu - $(1-p)^n$.",
    example1:
      "Rzucamy $4$ razy monetą. Prawdopodobieństwo dokładnie $3$ orłów wynosi $\\binom43\\left(\\frac12\\right)^3\\cdot\\frac12=\\frac4{16}=\\frac14$.",
    example2:
      "Rzucamy $3$ razy kostką. Prawdopodobieństwo co najmniej jednej szóstki to $1-\\left(\\frac56\\right)^3=1-\\frac{125}{216}=\\frac{91}{216}$. Liczymy przez zdarzenie przeciwne, bo bezpośrednio byłoby więcej przypadków.",
    pitfalls:
      "* Próby muszą być niezależne i mieć stałe $p$.\n* Nie zapomnij współczynnika $\\binom nk$.\n* Wykładnik przy $1-p$ to $n-k$.\n* „Co najmniej jeden” najłatwiej liczyć przez zdarzenie przeciwne.\n* Nie mieszaj liczby sukcesów z liczbą prób.",
    exercises:
      "1. $3$ rzuty monetą, dokładnie $2$ orły.\n2. $4$ rzuty kostką, dokładnie jedna szóstka.\n3. $2$ rzuty monetą, co najmniej jeden orzeł.\n4. $3$ próby z $p=\\frac13$, dokładnie $2$ sukcesy.\n5. $2$ próby z $p=\\frac12$, same sukcesy.\n6. $3$ rzuty monetą, same reszki.",
    answers:
      "1. $\\frac38$.\n2. $\\frac{125}{324}$.\n3. $1-\\frac14=\\frac34$.\n4. $3\\cdot\\frac19\\cdot\\frac23=\\frac29$.\n5. $\\frac14$.\n6. $\\frac18$.",
    recap:
      "1. Podaj wzór Bernoulliego.\n2. Co oznacza $n$ i $k$?\n3. Jak obliczyć co najmniej jeden sukces?\n4. Jakie warunki muszą spełniać próby?\n5. Jakie jest prawdopodobieństwo samych porażek?",
    diagram:
      "n prób, p sukcesu\n   ↓\n C(n,k)p^k(1-p)^(n-k)\n   ↓\n dokładnie k sukcesów\n   ↓\n co najmniej 1: 1-(1-p)^n",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "srednia_wazona",
    title: "Średnia ważona",
    examNote:
      "Średnia ważona uwzględnia różne znaczenie danych. CKE sprawdza obliczanie średniej ocen z wagami, wynik z procentami oraz wyznaczanie brakującej wartości.",
    map:
      "1. Odczytasz wartości i wagi.\n2. Pomnożysz każdą wartość przez wagę.\n3. Zsumujesz iloczyny.\n4. Podzielisz przez sumę wag.\n5. Zinterpretujesz wynik.",
    definitions:
      "Średnia ważona wartości $x_1,\\ldots,x_n$ z wagami $w_1,\\ldots,w_n$ wynosi $\\bar{x}_w=\\frac{w_1x_1+\\ldots+w_nx_n}{w_1+\\ldots+w_n}$. Wagi muszą być dodatnie.\n\nGdy wagi są procentami, suma wag wynosi $100\\%$, ale można ją traktować jako $1$. Średnia ważona leży między najmniejszą i największą wartością; jeśli wagi są równe, redukuje się do zwykłej średniej arytmetycznej.",
    example1:
      "Oceny $5$ (waga $2$), $4$ (waga $3$) i $3$ (waga $1$) dają $\\frac{10+12+3}{6}=\\frac{25}{6}\\approx4{,}17$. Wyższa waga oceny $4$ zbliża wynik do $4$.",
    example2:
      "$60\\%$ uczniów ma średnią $4$, a $40\\%$ - średnią $3$. Średnia całej grupy to $0{,}6\\cdot4+0{,}4\\cdot3=2{,}4+1{,}2=3{,}6$. Wagi procentowe sumują się do $1$.",
    pitfalls:
      "* Dziel przez sumę wag, a nie przez liczbę wartości.\n* Wagi nie mogą być ujemne ani zerowe.\n* Przy procentach zamień je na ułamki lub pamiętaj o mianowniku $100$.\n* Średnia ważona nie musi być równa zwykłej średniej.\n* Sprawdź, czy wynik mieści się między skrajnymi wartościami.",
    exercises:
      "1. Wartości $2,4,6$ z wagami $1,2,3$.\n2. Oceny $5$ (waga $1$), $4$ (waga $2$), $3$ (waga $1$).\n3. $50\\%$ grupy ma średnią $4$, $50\\%$ - $2$.\n4. Wartości $3$ (waga $2$) i $5$ (waga $2$).\n5. Średnia ważona trzech ocen wynosi $4$, dwie to $5$ i $3$ z wagami $1$ i $1$. Jaka jest trzecia przy wadze $1$?\n6. $70\\%$ uczniów ma średnią $3$, $30\\%$ - $5$.",
    answers:
      "1. $\\frac{2+8+18}{6}=\\frac{28}{6}\\approx4{,}67$.\n2. $\\frac{5+8+3}{4}=4$.\n3. $3$.\n4. $4$.\n5. $4$.\n6. $3{,}6$.",
    recap:
      "1. Podaj wzór na średnią ważoną.\n2. Przez co dzielimy?\n3. Co się dzieje, gdy wagi są równe?\n4. Jak traktować wagi procentowe?\n5. Gdzie leży średnia ważona względem wartości skrajnych?",
    diagram:
      "x₁·w₁ + x₂·w₂ + ...\n        ↓\n   Σ(x·w) / Σw\n        ↓\n   średnia ważona",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "odchylenie_standardowe",
    title: "Odchylenie standardowe i wariancja",
    examNote:
      "Odchylenie standardowe mierzy rozproszenie danych wokół średniej. CKE sprawdza wariancję, pierwiastek z wariancji oraz zmianę rozproszenia przy skalowaniu danych.",
    map:
      "1. Obliczysz średnią.\n2. Wyznaczysz odchylenia od średniej.\n3. Podniesiesz je do kwadratu.\n4. Obliczysz wariancję.\n5. Pierwiastkiem otrzymasz odchylenie standardowe.",
    definitions:
      "Wariancja to średnia kwadratów odchyleń od średniej: $\\sigma^2=\\frac{(x_1-\\bar x)^2+\\ldots+(x_n-\\bar x)^2}{n}$. Odchylenie standardowe to $\\sigma=\\sqrt{\\sigma^2}$.\n\nOdchylenie standardowe jest nieujemne i ma tę samą jednostkę co dane. Dla danych $2,4,6,8$ średnia wynosi $5$, wariancja $5$, a odchylenie $\\sqrt5\\approx2{,}24$. Jeśli wszystkie dane pomnożymy przez $k$, odchylenie rośnie $|k|$ razy, a wariancja $k^2$ razy.",
    example1:
      "Dane $1,3,5$. Średnia to $3$, odchylenia to $-2,0,2$, a ich kwadraty $4,0,4$. Wariancja wynosi $\\frac83\\approx2{,}67$, więc odchylenie $\\sqrt{\\frac83}\\approx1{,}63$.",
    example2:
      "Dane $4,4,4,4$ mają średnią $4$ i zerowe odchylenia. Wariancja i odchylenie standardowe wynoszą $0$. Brak rozproszenia oznacza, że wszystkie wartości są identyczne.",
    pitfalls:
      "* Dziel przez liczbę danych, a nie przez $n-1$ (w szkole średniej z $n$).\n* Wariancja jest w jednostkach kwadratowych, odchylenie - w zwykłych.\n* Nie zapomnij spierwiastkować wariancji.\n* Odchylenie nie może być ujemne.\n* Przesunięcie danych nie zmienia odchylenia, skalowanie zmienia.",
    exercises:
      "1. Oblicz wariancję $2,4,6,8$.\n2. Oblicz odchylenie standardowe $2,4,6,8$.\n3. Jakie jest odchylenie danych $5,5,5$?\n4. Odchylenie wynosi $3$. Podaj wariancję.\n5. Dane $1,2,3,4,5$ - podaj wariancję.\n6. Dane pomnożono przez $2$. Ile razy wzrośnie odchylenie?",
    answers:
      "1. $5$.\n2. $\\sqrt5\\approx2{,}24$.\n3. $0$.\n4. $9$.\n5. $2$.\n6. Dwa razy.",
    recap:
      "1. Podaj wzór na wariancję.\n2. Jak obliczyć odchylenie standardowe?\n3. Co oznacza odchylenie równe $0$?\n4. Jak zmienia się odchylenie przy skalowaniu?\n5. Jaki jednostki ma odchylenie?",
    diagram:
      "dane → średnia\n   ↓\n odchylenia → kwadraty\n   ↓\n wariancja σ²\n   ↓\n σ = √σ²",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "optymalizacja",
    topic: "granice_funkcji",
    title: "Granice funkcji - podstawianie i skracanie",
    examNote:
      "Granice funkcji na maturze podstawowej dotyczą prostych podstawień oraz symboli nieoznaczonych $\\frac00$. CKE sprawdza skracanie czynników i granice w nieskończoności.",
    map:
      "1. Podstawisz argument do funkcji ciągłej.\n2. Rozpoznasz symbol $\\frac00$.\n3. Rozłożysz licznik na czynniki.\n4. Skrócisz wspólny czynnik.\n5. Obliczysz granicę w nieskończoności.",
    definitions:
      "Granica $\\lim_{x\\to a}f(x)$ opisuje zachowanie funkcji przy $x$ bliskim $a$, niezależnie od wartości w samym $a$. Dla wielomianów i funkcji wymiernych poza miejscami zerowania mianownika wystarczy podstawienie.\n\nGdy otrzymamy $\\frac00$, rozkładamy licznik i mianownik na czynniki i skracamy. Przykładowo $\\frac{x^2-a^2}{x-a}=x+a$ dla $x\\ne a$, więc granica wynosi $2a$. W nieskończoności decyduje najwyższa potęga $x$.",
    example1:
      "Oblicz $\\lim_{x\\to2}\\frac{x^2-4}{x-2}$. Licznik to $(x-2)(x+2)$, więc po skróceniu zostaje $x+2$. Granica wynosi $4$.",
    example2:
      "Oblicz $\\lim_{x\\to\\infty}\\frac{3x^2+2x}{x^2-1}$. Dzielimy przez $x^2$: $\\frac{3+\\frac2x}{1-\\frac1{x^2}}\\to3$. Stopnie są równe, więc granica to iloraz współczynników $3$ i $1$.",
    pitfalls:
      "* Granica nie musi być równa wartości funkcji w punkcie.\n* $\\frac00$ nie jest wynikiem - trzeba przekształcić wyrażenie.\n* Skracany czynnik musi być różny od zera w otoczeniu punktu.\n* W nieskończoności nie podstawiaj $\\infty$ bezpośrednio.\n* Po skróceniu podstaw ponownie $x=a$.",
    exercises:
      "1. $\\lim_{x\\to2}(x^2+3x)$.\n2. $\\lim_{x\\to3}\\frac{x^2-9}{x-3}$.\n3. $\\lim_{x\\to0}\\frac{x^2+5x}{x}$.\n4. $\\lim_{x\\to4}\\frac{x^2-16}{x-4}$.\n5. $\\lim_{x\\to\\infty}\\frac{2x^2+1}{x^2+3}$.\n6. $\\lim_{x\\to-2}\\frac{x^2-4}{x+2}$.",
    answers:
      "1. $10$.\n2. $6$.\n3. $5$.\n4. $8$.\n5. $2$.\n6. $-4$.",
    recap:
      "1. Kiedy można podstawić $x=a$?\n2. Co zrobić z symbolem $\\frac00$?\n3. Jak obliczyć granicę w nieskończoności?\n4. Dlaczego granica może różnić się od wartości funkcji?\n5. Jak skrócić $\\frac{x^2-a^2}{x-a}$?",
    diagram:
      "x → a\n  ↓\n podstawienie\n  ↓\n 0/0? → rozkład i skrócenie\n  ↓\n granica",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "optymalizacja",
    topic: "pochodna",
    title: "Pochodna funkcji - wzory i interpretacja",
    examNote:
      "Pochodna opisuje tempo zmian i nachylenie stycznej. CKE sprawdza pochodne potęg, wartość pochodnej w punkcie oraz związek z monotonicznością.",
    map:
      "1. Zastosujesz wzór $(x^n)'=nx^{n-1}$.\n2. Obliczysz pochodną sumy.\n3. Obliczysz wartość pochodnej w punkcie.\n4. Odczytasz nachylenie stycznej.\n5. Znajdziesz miejsca zerowe pochodnej.",
    definitions:
      "Pochodna funkcji $f$ w punkcie $x_0$ to granica ilorazu różnicowego i zarazem współczynnik kierunkowy stycznej. Dla potęg $(x^n)'=nx^{n-1}$, a pochodna stałej wynosi $0$.\n\nDodatkowo $(\\sqrt x)'=\\frac1{2\\sqrt x}$ oraz $\\left(\\frac1x\\right)'=-\\frac1{x^2}$. Pochodna sumy to suma pochodnych. Jeśli $f'(x_0)>0$, funkcja rośnie w otoczeniu $x_0$; jeśli $f'(x_0)=0$, możliwe jest ekstremum.",
    example1:
      "Dla $f(x)=x^3-3x^2+2$ pochodna wynosi $f'(x)=3x^2-6x$. W punkcie $x=2$ mamy $f'(2)=12-12=0$, więc styczna jest pozioma.",
    example2:
      "Dla $f(x)=x^2-4x$ pochodna $f'(x)=2x-4$. W punkcie $x=1$ nachylenie stycznej wynosi $-2$, a w $x=3$ wynosi $2$. Miejsce zerowe pochodnej to $x=2$, gdzie funkcja ma minimum.",
    pitfalls:
      "* Pochodna stałej to $0$, a nie $1$.\n* $(x^n)'=nx^{n-1}$, a nie $x^{n-1}$.\n* Pochodna $\\frac1x$ jest ujemna.\n* $f'(x_0)$ to liczba, a nie funkcja.\n* $f'(x)=0$ nie zawsze oznacza ekstremum.",
    exercises:
      "1. Pochodna $x^3$.\n2. Pochodna $x^2+5x$.\n3. $f'(2)$ dla $f(x)=x^3$.\n4. Pochodna $\\frac1x$.\n5. Pochodna $\\sqrt x$.\n6. Dla $f(x)=x^2-6x$ podaj $x$, dla którego $f'(x)=0$.",
    answers:
      "1. $3x^2$.\n2. $2x+5$.\n3. $12$.\n4. $-\\frac1{x^2}$.\n5. $\\frac1{2\\sqrt x}$.\n6. $2x-6=0$, więc $x=3$.",
    recap:
      "1. Podaj wzór na pochodną $x^n$.\n2. Ile wynosi pochodna stałej?\n3. Co oznacza $f'(x_0)$ geometrycznie?\n4. Podaj pochodną $\\frac1x$.\n5. Jak znaleźć miejsce zerowe pochodnej?",
    diagram:
      "f(x)\n  ↓\n f'(x) = nachylenie\n  ↓\n f'(x₀) > 0 → rośnie\n f'(x₀) = 0 → możliwe ekstremum",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "optymalizacja",
    topic: "monotonicznosc_i_ekstrema",
    title: "Monotoniczność i ekstrema funkcji",
    examNote:
      "Znak pochodnej rozstrzyga o monotoniczności, a jej miejsca zerowe wskazują kandydatów na ekstrema. CKE sprawdza przedziały monotoniczności i współrzędne wierzchołka paraboli.",
    map:
      "1. Obliczysz pochodną.\n2. Wyznaczysz jej miejsca zerowe.\n3. Ustalasz znak pochodnej w przedziałach.\n4. Wskażesz maksimum i minimum.\n5. Obliczysz wartość ekstremum.",
    definitions:
      "Jeśli $f'(x)>0$ w przedziale, funkcja jest w nim rosnąca; jeśli $f'(x)<0$ - malejąca. W punkcie, w którym pochodna zmienia znak z dodatniego na ujemny, funkcja ma maksimum lokalne; ze zmiany ujemnego na dodatni - minimum.\n\nDla paraboli $f(x)=ax^2+bx+c$ ekstremum jest w wierzchołku $x=-\\frac b{2a}$; dla $a>0$ jest to minimum, a dla $a<0$ maksimum. Wartość ekstremum obliczamy, podstawiając $x$ do wzoru funkcji.",
    example1:
      "Funkcja $f(x)=x^2-4x$ ma $f'(x)=2x-4$. Pochodna jest ujemna dla $x<2$ i dodatnia dla $x>2$, więc w $x=2$ jest minimum. Wartość najmniejsza to $f(2)=-4$.",
    example2:
      "Funkcja $f(x)=x^3-3x$ ma $f'(x)=3x^2-3=3(x-1)(x+1)$. Pochodna zmienia znak z dodatniego na ujemny w $x=-1$ (maksimum) i z ujemnego na dodatni w $x=1$ (minimum). Wartości: $f(-1)=2$, $f(1)=-2$.",
    pitfalls:
      "* Dodatnia pochodna oznacza wzrost, a nie ekstremum.\n* Miejsce zerowe pochodnej to kandydat, nie zawsze ekstremum.\n* Sprawdź zmianę znaku pochodnej.\n* Wartość ekstremum to $f(x)$, a nie $x$.\n* Dla $a<0$ wierzchołek paraboli jest maksimum.",
    exercises:
      "1. Podaj przedział, w którym $f(x)=x^2-4x$ rośnie.\n2. Podaj minimum $f(x)=x^2-4x$.\n3. Ekstrema $f(x)=x^3-3x$.\n4. Maksimum $f(x)=-x^2+6x$.\n5. Dla $f(x)=x^2+2x+3$ podaj wartość najmniejszą.\n6. Ile ekstremów ma $f(x)=x^3+x$?",
    answers:
      "1. $(2,\\infty)$.\n2. $-4$ dla $x=2$.\n3. Maksimum $2$ dla $x=-1$, minimum $-2$ dla $x=1$.\n4. $9$ dla $x=3$.\n5. $2$ dla $x=-1$.\n6. Zero, bo $f'(x)=3x^2+1>0$.",
    recap:
      "1. Co oznacza $f'(x)>0$?\n2. Co oznacza $f'(x)<0$?\n3. Kiedy w miejscu zerowym pochodnej jest maksimum?\n4. Jak znaleźć wierzchołek paraboli?\n5. Czym jest wartość ekstremum?",
    diagram:
      "f'(x)\n ├─ >0 → rośnie\n ├─ <0 → maleje\n └─ =0 → kandydat na ekstremum\n        ↓\n zmiana znaku?",
  }),
];
