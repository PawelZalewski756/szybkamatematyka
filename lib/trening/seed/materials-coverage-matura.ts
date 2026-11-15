import { buildLesson, type AdditionalMaterial } from "@/lib/trening/seed/additional-materials";

export const MATURA_COVERAGE_MATERIALS: AdditionalMaterial[] = [
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "optymalizacja",
    topic: "zadania_optymalizacyjne",
    title: "Zadania optymalizacyjne z funkcją kwadratową",
    examNote:
      "Zadania optymalizacyjne na poziomie podstawowym opisują sytuację praktyczną funkcją kwadratową. Trzeba zbudować wzór, wyznaczyć dziedzinę i znaleźć wierzchołek paraboli. Od 2025 roku to osobna sekcja wymagań CKE, dlatego warto rozpoznawać typowe schematy: ogrodzenie, prostokąt, przychód i koszt.",
    map:
      "1. Oznaczysz niewiadomą i zapiszesz wielkość, którą optymalizujesz.\n2. Wykorzystasz warunek z treści, aby wyeliminować drugą zmienną.\n3. Wyznaczysz dziedzinę funkcji.\n4. Znajdziesz wierzchołek paraboli.\n5. Sprawdzisz, czy wynik należy do dziedziny i odpowiedź ma sens.",
    definitions:
      "Funkcja kwadratowa $f(x)=ax^2+bx+c$ dla $a<0$ osiąga największą wartość w wierzchołku $p=\\frac{-b}{2a}$. Dla $a>0$ w wierzchołku jest wartość najmniejsza. W zadaniach optymalizacyjnych zwykle $a<0$, bo szukamy maksimum: pola, przychodu albo zysku.\n\nSchemat: jedna zmienna $x$, druga zależność $y$ wyznaczona z warunku, funkcja celu $P(x)$ i dziedzina wynikająca z długości dodatnich. Na końcu obliczasz wartość funkcji w wierzchołku i odpowiadasz zdaniem.",
    example1:
      "Prostokąt ma obwód $20$. Boki oznaczymy $x$ i $10-x$. Pole wynosi $P(x)=x(10-x)=-x^2+10x$. Wierzchołek ma $p=\\frac{-10}{-2}=5$, więc największe pole otrzymujemy dla kwadratu o boku $5$. Pole jest wtedy równe $25$.",
    example2:
      "Ogród przylega do ściany, a na trzy pozostałe boki mamy $24$ m siatki. Boki prostopadłe do ściany mają długość $x$, a bok równoległy $24-2x$. Pole $P(x)=x(24-2x)=-2x^2+24x$. Wierzchołek $p=\\frac{-24}{-4}=6$, więc wymiary to $6$ m i $12$ m, a pole $72$ m$^2$.",
    pitfalls:
      "* Nie zapominaj o dziedzinie: długości muszą być dodatnie.\n* Nie podstawiaj $x$ z wierzchołka, jeśli nie należy do dziedziny.\n* Pole prostokąta to iloczyn boków, a nie obwód.\n* Przy funkcji $a<0$ wierzchołek daje maksimum.\n* Odpowiedź zapisz z jednostką i w kontekście zadania.",
    exercises:
      "1. Suma dwóch liczb wynosi $18$. Dla jakich liczb iloczyn jest największy?\n2. Prostokąt ma obwód $32$. Podaj wymiary o największym polu.\n3. Pole prostokąta o bokach $x$ i $12-x$ jest funkcją $P$. Podaj $x$, dla którego $P$ jest największe.\n4. Przychód opisuje $R(x)=x(80-x)$. Podaj $x$, dla którego przychód jest największy.\n5. Funkcja $f(x)=-x^2+8x-7$ ma największą wartość w wierzchołku. Podaj tę wartość.\n6. Ogród przy ścianie ma $30$ m siatki na trzy boki. Podaj największe pole.",
    answers:
      "1. $9$ i $9$, iloczyn $81$.\n2. Kwadrat o boku $8$, pole $64$.\n3. $x=6$.\n4. $x=40$.\n5. $f(4)=9$.\n6. Boki $7{,}5$ m i $15$ m, pole $112{,}5$ m$^2$.",
    recap:
      "1. Jaki wzór daje współrzędną wierzchołka paraboli?\n2. Kiedy wierzchołek daje maksimum?\n3. Skąd bierze się dziedzina w zadaniu o ogrodzeniu?\n4. Czym różni się funkcja celu od warunku z treści?\n5. Dlaczego wynik trzeba sprawdzić w dziedzinie?",
    diagram:
      "treść zadania\n   ↓\n oznacz x i y\n   ↓\n warunek → y(x)\n   ↓\n funkcja celu P(x)\n   ↓\n dziedzina\n   ↓\n wierzchołek paraboli\n   ↓\n odpowiedź z jednostką",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "wielomiany",
    title: "Wielomiany - działania, rozkład i pierwiastki",
    examNote:
      "Wielomiany pojawiają się w zadaniach o rozkładzie na czynniki, miejscach zerowych, dzieleniu przez dwumian i wartościach. CKE sprawdza też umiejętność łączenia wzorów skróconego mnożenia z wyłączaniem wspólnego czynnika. Na maturze podstawowej wystarczy sprawne przekształcanie i rozpoznawanie pierwiastków.",
    map:
      "1. Rozpoznasz stopień i współczynniki wielomianu.\n2. Dodasz, odejmiesz i pomnożysz wielomiany.\n3. Wyłączysz wspólny czynnik przed nawias.\n4. Rozłożysz wielomian metodą grupowania.\n5. Znajdziesz pierwiastki i obliczysz wartość $W(a)$.",
    definitions:
      "Wielomian jednej zmiennej ma postać $W(x)=a_nx^n+\\ldots+a_1x+a_0$, gdzie $a_n\\ne0$. Stopień wielomianu to najwyższa potęga $x$. Wartość $W(a)$ obliczamy, podstawiając $a$ w miejsce $x$.\n\nTwierdzenie Bézouta: reszta z dzielenia $W(x)$ przez $x-a$ jest równa $W(a)$. Dlatego $a$ jest pierwiastkiem wtedy i tylko wtedy, gdy $W(a)=0$. Rozkład zaczynamy od wspólnego czynnika, potem szukamy wzorów skróconego mnożenia albo grupujemy wyrazy.",
    example1:
      "Rozłóż $W(x)=x^3-4x$. Wyłączamy $x$: $W(x)=x(x^2-4)$. Następnie używamy różnicy kwadratów: $x(x-2)(x+2)$. Pierwiastki to $0$, $2$ i $-2$.",
    example2:
      "Oblicz resztę z dzielenia $W(x)=x^3-2x+5$ przez $x-2$. Z twierdzenia Bézouta reszta jest równa $W(2)=8-4+5=9$. Nie trzeba wykonywać dzielenia pisemnego.",
    pitfalls:
      "* Stopień wielomianu to najwyższa potęga, a nie liczba wyrazów.\n* Przy wyłączaniu czynnika nie zgub znaku.\n* $x^2-4=(x-2)(x+2)$, a nie $(x-4)(x+1)$.\n* Pierwiastek wielomianu to argument, dla którego wartość wynosi $0$.\n* Reszta z dzielenia przez $x-a$ to $W(a)$, a nie $W(0)$.",
    exercises:
      "1. Podaj stopień $W(x)=4x^5-2x^2+7$.\n2. Oblicz $W(2)$ dla $W(x)=x^3-3x+1$.\n3. Rozłóż $x^2-9$.\n4. Rozłóż $x^3+2x^2$.\n5. Sprawdź, czy $1$ jest pierwiastkiem $W(x)=x^3-1$.\n6. Podaj resztę z dzielenia $W(x)=x^2+3x+2$ przez $x+1$.",
    answers:
      "1. $5$.\n2. $3$.\n3. $(x-3)(x+3)$.\n4. $x^2(x+2)$.\n5. Tak, $W(1)=0$.\n6. $W(-1)=0$.",
    recap:
      "1. Co to jest stopień wielomianu?\n2. Jak obliczyć wartość wielomianu w punkcie?\n3. Co mówi twierdzenie Bézouta?\n4. Jak zacząć rozkład wielomianu na czynniki?\n5. Kiedy liczba jest pierwiastkiem wielomianu?",
    diagram:
      "W(x)\n ↓\n wspólny czynnik\n ↓\n wzór skróconego mnożenia\n ↓\n grupowanie\n ↓\n iloczyn czynników\n ↓\n pierwiastki",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "algebra",
    topic: "wyrazenia_wymierne",
    title: "Wyrażenia i równania wymierne",
    examNote:
      "Wyrażenia wymierne to ilorazy wielomianów. Na maturze podstawowej trzeba skracać, dodawać i rozwiązywać proste równania wymierne, pamiętając o dziedzinie. Często pojawia się równanie postaci $\\frac{V(x)}{W(x)}=0$, w którym licznik musi być zerem, a mianownik nie może być zerem.",
    map:
      "1. Wyznaczysz dziedzinę wyrażenia wymiernego.\n2. Skrócisz wspólne czynniki.\n3. Dodasz i odejmiesz wyrażenia o różnych mianownikach.\n4. Rozwiążesz równanie wymierne.\n5. Odrzucisz rozwiązania spoza dziedziny.",
    definitions:
      "Wyrażenie wymierne ma postać $\\frac{P(x)}{Q(x)}$, gdzie $Q(x)\\ne0$. Dziedzinę wyznaczamy, rozwiązując $Q(x)\\ne0$. Przy skracaniu zakładamy, że skracany czynnik jest różny od zera.\n\nRównanie $\\frac{P(x)}{Q(x)}=0$ jest równoważne układowi $P(x)=0$ i $Q(x)\\ne0$. Przy dodawaniu ułamków sprowadzamy do wspólnego mianownika. Wynik zawsze sprawdzamy z dziedziną.",
    example1:
      "Uprość $\\frac{x^2-1}{x-1}$. Licznik rozkładamy: $(x-1)(x+1)$. Po skróceniu otrzymujemy $x+1$, przy założeniu $x\\ne1$.",
    example2:
      "Rozwiąż $\\frac{x-3}{x+2}=0$. Licznik musi być zerem: $x-3=0$, więc $x=3$. Mianownik dla $x=3$ jest równy $5\\ne0$, więc rozwiązanie należy do dziedziny. Odpowiedź: $x=3$.",
    pitfalls:
      "* Nie skracaj, zanim nie wyznaczysz dziedziny.\n* Mianownik nie może być zerem, nawet jeśli po skróceniu znika.\n* W równaniu wymiernym sprawdzaj każde rozwiązanie z dziedziną.\n* Przy dodawaniu ułamków nie dodawaj mianowników.\n* Pamiętaj o wzorach skróconego mnożenia przy rozkładzie licznika.",
    exercises:
      "1. Podaj dziedzinę $\\frac{1}{x-4}$.\n2. Uprość $\\frac{x^2-4}{x+2}$.\n3. Rozwiąż $\\frac{x+1}{x-2}=0$.\n4. Uprość $\\frac{x^2-9}{x-3}$.\n5. Rozwiąż $\\frac{2x-6}{x+1}=0$.\n6. Podaj dziedzinę $\\frac{x}{x^2-1}$.",
    answers:
      "1. $x\\ne4$.\n2. $x-2$ dla $x\\ne-2$.\n3. $x=-1$.\n4. $x+3$ dla $x\\ne3$.\n5. $x=3$.\n6. $x\\ne-1$ i $x\\ne1$.",
    recap:
      "1. Jak wyznaczyć dziedzinę wyrażenia wymiernego?\n2. Kiedy równanie wymierne jest równoważne równaniu licznika?\n3. Dlaczego trzeba sprawdzać rozwiązania?\n4. Jak dodać dwa wyrażenia wymierne?\n5. Co się dzieje, gdy skracany czynnik może być zerem?",
    diagram:
      "P(x)/Q(x)\n   ↓\n Q(x)≠0 → dziedzina\n   ↓\n rozkład licznika i mianownika\n   ↓\n skracanie\n   ↓\n równanie: P(x)=0\n   ↓\n sprawdzenie z dziedziną",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "funkcja_logarytmiczna",
    title: "Funkcja logarytmiczna - definicja i własności",
    examNote:
      "Logarytmy i funkcja logarytmiczna pojawiają się w zadaniach o dziedzinie, wartości, równaniach i zastosowaniach praktycznych, np. skali Richtera albo pH. Trzeba znać definicję $\\log_a b$, własności logarytmów oraz dziedzinę funkcji $\\log_a x$.",
    map:
      "1. Obliczysz logarytm z definicji.\n2. Zastosujesz wzory na logarytm iloczynu, ilorazu i potęgi.\n3. Wyznaczysz dziedzinę funkcji logarytmicznej.\n4. Rozwiążesz proste równanie logarytmiczne.\n5. Rozpoznasz monotoniczność funkcji.",
    definitions:
      "Dla $a>0$, $a\\ne1$ i $b>0$ logarytm $\\log_a b$ to wykładnik potęgi, do której trzeba podnieść $a$, aby otrzymać $b$: $\\log_a b=c \\iff a^c=b$. Wynika stąd $\\log_a 1=0$ oraz $\\log_a a=1$.\n\nWłasności: $\\log_a(xy)=\\log_a x+\\log_a y$, $\\log_a\\frac{x}{y}=\\log_a x-\\log_a y$, $\\log_a x^n=n\\log_a x$. Funkcja $f(x)=\\log_a x$ ma dziedzinę $x>0$. Dla $a>1$ rośnie, a dla $0<a<1$ maleje.",
    example1:
      "Oblicz $\\log_2 8$. Szukamy wykładnika $c$ takiego, że $2^c=8$. Ponieważ $2^3=8$, więc $\\log_2 8=3$. Podobnie $\\log_3\\frac{1}{9}=-2$, bo $3^{-2}=\\frac{1}{9}$.",
    example2:
      "Rozwiąż $\\log_2(x-1)=3$. Z definicji $x-1=2^3=8$, więc $x=9$. Dziedzina wymaga $x-1>0$, czyli $x>1$; otrzymany wynik spełnia ten warunek.",
    pitfalls:
      "* Logarytm istnieje tylko dla liczby dodatniej.\n* Podstawa logarytmu musi być dodatnia i różna od $1$.\n* $\\log_a(x+y)$ to nie jest $\\log_a x+\\log_a y$.\n* $\\log_a 1=0$, a nie $1$.\n* Po rozwiązaniu równania sprawdź dziedzinę.",
    exercises:
      "1. Oblicz $\\log_3 27$.\n2. Oblicz $\\log_5 1$.\n3. Oblicz $\\log_2\\frac{1}{4}$.\n4. Podaj dziedzinę $\\log_3(x-2)$.\n5. Rozwiąż $\\log_2 x=4$.\n6. Uprość $\\log_2 4+\\log_2 8$.",
    answers:
      "1. $3$.\n2. $0$.\n3. $-2$.\n4. $x>2$.\n5. $x=16$.\n6. $2+3=5$.",
    recap:
      "1. Co oznacza zapis $\\log_a b=c$?\n2. Jaki warunek spełnia podstawa logarytmu?\n3. Jaka jest dziedzina funkcji logarytmicznej?\n4. Kiedy funkcja logarytmiczna rośnie?\n5. Jak zamienić logarytm iloczynu na sumę?",
    diagram:
      "log_a b = c\n   ⇔\n  a^c = b\n   ↓\n a>0, a≠1, b>0\n   ↓\n dziedzina x>0\n   ↓\n a>1 rośnie\n 0<a<1 maleje",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "trygonometria",
    topic: "twierdzenie_sinusow_cosinusow",
    title: "Twierdzenie sinusów i cosinusów",
    examNote:
      "Twierdzenia sinusów i cosinusów pozwalają rozwiązywać trójkąty, gdy nie ma kąta prostego. Na maturze podstawowej trzeba wybrać właściwe twierdzenie, podstawić dane i obliczyć bok lub kąt. Często łączą się z wzorem na pole $P=\\frac12ab\\sin\\gamma$.",
    map:
      "1. Rozpoznasz, kiedy użyć twierdzenia sinusów, a kiedy cosinusów.\n2. Zapiszesz proporcję lub równanie kwadratowe.\n3. Obliczysz brakujący bok lub kąt.\n4. Zastosujesz wzór na pole z sinusem.\n5. Sprawdzisz, czy wynik ma sens geometryczny.",
    definitions:
      "Twierdzenie sinusów: w trójkącie o bokach $a,b,c$ i kątach $\\alpha,\\beta,\\gamma$ zachodzi $\\frac{a}{\\sin\\alpha}=\\frac{b}{\\sin\\beta}=\\frac{c}{\\sin\\gamma}=2R$, gdzie $R$ to promień okręgu opisanego.\n\nTwierdzenie cosinusów: $c^2=a^2+b^2-2ab\\cos\\gamma$, gdzie $\\gamma$ jest kątem między bokami $a$ i $b$. Dla $\\gamma=90^\\circ$ otrzymujemy twierdzenie Pitagorasa. Pole trójkąta: $P=\\frac12ab\\sin\\gamma$.",
    example1:
      "W trójkącie $a=5$, $b=8$, a kąt między nimi wynosi $60^\\circ$. Pole to $P=\\frac12\\cdot5\\cdot8\\cdot\\sin60^\\circ=20\\cdot\\frac{\\sqrt3}{2}=10\\sqrt3$.",
    example2:
      "W trójkącie $a=3$, $b=4$, a kąt między nimi ma $90^\\circ$. Z twierdzenia cosinusów $c^2=3^2+4^2-2\\cdot3\\cdot4\\cdot\\cos90^\\circ=9+16-0=25$, więc $c=5$. To potwierdza twierdzenie Pitagorasa.",
    pitfalls:
      "* Kąt w twierdzeniu cosinusów musi być kątem między dwoma znanymi bokami.\n* $\\cos90^\\circ=0$, a $\\sin90^\\circ=1$.\n* W twierdzeniu sinusów boki i kąty muszą sobie odpowiadać.\n* Pamiętaj, że $\\sin(180^\\circ-\\alpha)=\\sin\\alpha$.\n* Wynik ujemny długości oznacza błąd w obliczeniach.",
    exercises:
      "1. Oblicz pole trójkąta o bokach $6$ i $10$ oraz kącie $30^\\circ$ między nimi.\n2. W trójkącie $a=4$, $b=5$, kąt między nimi $60^\\circ$. Oblicz $c^2$.\n3. W trójkącie $a=7$, $\\alpha=30^\\circ$, $b=14$. Oblicz $\\sin\\beta$.\n4. Oblicz pole trójkąta o bokach $8$ i $8$ oraz kącie $60^\\circ$.\n5. W trójkącie prostokątnym przyprostokątne mają $5$ i $12$. Oblicz przeciwprostokątną.\n6. Kąt między bokami $3$ i $5$ ma $120^\\circ$. Oblicz $c^2$.",
    answers:
      "1. $15$.\n2. $21$.\n3. $\\sin\\beta=1$.\n4. $16\\sqrt3$.\n5. $13$.\n6. $9+25-2\\cdot3\\cdot5\\cdot(-\\frac12)=49$.",
    recap:
      "1. Kiedy stosujemy twierdzenie sinusów?\n2. Kiedy stosujemy twierdzenie cosinusów?\n3. Jaki wzór opisuje pole trójkąta z sinusem?\n4. Co się dzieje dla kąta $90^\\circ$ w twierdzeniu cosinusów?\n5. Dlaczego długość nie może być ujemna?",
    diagram:
      "trójkąt bez kąta prostego\n   ↙            ↘\n znane 2 boki   znane boki i kąty\n i kąt między   naprzeciw siebie\n   ↓                 ↓\n cosinusów          sinusów\n   ↓                 ↓\n brakujący bok      brakujący bok/kąt",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "geometria",
    topic: "tales_dwusieczna_okrag",
    title: "Twierdzenie Talesa, dwusieczna i okrąg wpisany",
    examNote:
      "Te twierdzenia pojawiają się w zadaniach o proporcjach odcinków, kątach w kole i punktach szczególnych trójkąta. CKE sprawdza je zarówno w zadaniach zamkniętych, jak i otwartych z rysunkiem. Warto znać nie tylko wzory, ale też warunki ich stosowania.",
    map:
      "1. Zastosujesz twierdzenie Talesa do odcinków proporcjonalnych.\n2. Użyjesz twierdzenia o dwusiecznej kąta.\n3. Obliczysz kąty wpisane i środkowe.\n4. Wykorzystasz własności okręgu wpisanego i opisanego.\n5. Wskażesz punkty szczególne trójkąta.",
    definitions:
      "Twierdzenie Talesa: jeśli proste równoległe przecinają dwa ramiona kąta, to odcinki na jednym ramieniu są proporcjonalne do odpowiednich odcinków na drugim ramieniu: $\\frac{|OA|}{|OB|}=\\frac{|OC|}{|OD|}$.\n\nTwierdzenie o dwusiecznej: dwusieczna kąta w trójkącie dzieli przeciwległy bok w stosunku długości boków tworzących ten kąt: $\\frac{|BD|}{|DC|}=\\frac{|AB|}{|AC|}$. Kąt wpisany jest dwa razy mniejszy od kąta środkowego opartego na tym samym łuku. Środek okręgu wpisanego to przecięcie dwusiecznych, a opisanego - symetralnych.",
    example1:
      "Proste równoległe przecinają ramiona kąta. Na jednym ramieniu odcinki mają $2$ i $3$, a na drugim pierwszy odcinek ma $4$. Z twierdzenia Talesa $\\frac{2}{3}=\\frac{4}{x}$, więc $2x=12$ i $x=6$.",
    example2:
      "W trójkącie $|AB|=6$, $|AC|=9$, a dwusieczna z wierzchołka $A$ dzieli bok $BC$ na odcinki $|BD|$ i $|DC|$. Z twierdzenia o dwusiecznej $\\frac{|BD|}{|DC|}=\\frac{6}{9}=\\frac{2}{3}$. Jeśli $|BC|=15$, to $|BD|=6$, a $|DC|=9$.",
    pitfalls:
      "* Twierdzenie Talesa wymaga prostych równoległych.\n* W twierdzeniu o dwusiecznej stosunek dotyczy boków przy kącie, a nie całego obwodu.\n* Kąt wpisany i środkowy muszą być oparte na tym samym łuku.\n* Środek okręgu wpisanego to przecięcie dwusiecznych, a nie symetralnych.\n* Symetralne przecinają się w środku okręgu opisanego.",
    exercises:
      "1. Na ramionach kąta odcinki wynoszą $3,5$ oraz $6,x$. Oblicz $x$.\n2. W trójkącie $|AB|=4$, $|AC|=6$, $|BC|=10$. Dwusieczna z $A$ dzieli $BC$. Oblicz krótszy odcinek.\n3. Kąt środkowy ma $80^\\circ$. Oblicz kąt wpisany oparty na tym samym łuku.\n4. Kąt wpisany ma $35^\\circ$. Oblicz kąt środkowy.\n5. Ile wynosi suma kątów trójkąta?\n6. W trójkącie równobocznym wskaż środek okręgu wpisanego.",
    answers:
      "1. $x=10$.\n2. Odcinki $4$ i $6$, krótszy $4$.\n3. $40^\\circ$.\n4. $70^\\circ$.\n5. $180^\\circ$.\n6. Pokrywa się ze środkiem ciężkości i środkiem okręgu opisanego.",
    recap:
      "1. Jakie warunki musi spełnić twierdzenie Talesa?\n2. Co dzieli dwusieczna w trójkącie?\n3. Jaki jest związek kąta wpisanego i środkowego?\n4. Gdzie leży środek okręgu wpisanego?\n5. Gdzie leży środek okręgu opisanego?",
    diagram:
      "Tales: równoległe → proporcje\nDwusieczna: kąt → stosunek boków\nOkrąg: wpisany = dwusieczne\n        opisany = symetralne\nKąt wpisany = ½ kąta środkowego",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "kombinatoryka",
    topic: "statystyka_zaawansowana",
    title: "Statystyka opisowa - średnia ważona i odchylenie",
    examNote:
      "Na maturze podstawowej statystyka obejmuje nie tylko średnią arytmetyczną, medianę i dominantę, ale też średnią ważoną, odchylenie standardowe, skalę centylową i wartość oczekiwaną. Zadania są zwykle krótkie, ale wymagają zrozumienia pojęć i poprawnego podstawienia do wzoru.",
    map:
      "1. Obliczysz średnią ważoną.\n2. Zinterpretujesz medianę i dominantę.\n3. Obliczysz wariancję i odchylenie standardowe.\n4. Wyjaśnisz skalę centylową.\n5. Obliczysz wartość oczekiwaną w prostej grze losowej.",
    definitions:
      "Średnia ważona: $\\bar{x}=\\frac{\\sum x_iw_i}{\\sum w_i}$, gdzie $w_i$ to wagi. Wariancja: $\\sigma^2=\\frac{1}{n}\\sum(x_i-\\bar{x})^2$. Odchylenie standardowe $\\sigma=\\sqrt{\\sigma^2}$ ma tę samą jednostkę co dane.\n\nMediana to środkowa wartość uporządkowanego zbioru, a dominanta to najczęstsza wartość. Skala centylowa mówi, jaki procent wyników jest niższy lub równy danemu. Wartość oczekiwana $E(X)=\\sum x_iP(x_i)$ to średni wynik w długiej serii losowań.",
    example1:
      "Oceny ucznia to $3$ (waga $2$), $4$ (waga $3$) i $5$ (waga $1$). Średnia ważona wynosi $\\frac{3\\cdot2+4\\cdot3+5\\cdot1}{2+3+1}=\\frac{23}{6}\\approx3{,}83$.",
    example2:
      "Dla danych $2,4,6,8$ średnia wynosi $5$. Wariancja to $\\frac{(2-5)^2+(4-5)^2+(6-5)^2+(8-5)^2}{4}=\\frac{20}{4}=5$, a odchylenie standardowe $\\sigma=\\sqrt5$.",
    pitfalls:
      "* W średniej ważonej dzielisz przez sumę wag, a nie przez liczbę ocen.\n* Odchylenie standardowe to pierwiastek z wariancji.\n* Mediana wymaga uporządkowania danych.\n* Dominanta może nie istnieć lub być wielokrotna.\n* Wartość oczekiwana nie musi być jedną z możliwych wartości.",
    exercises:
      "1. Oblicz średnią ważoną: $2$ (waga $1$), $4$ (waga $2$), $5$ (waga $2$).\n2. Oblicz medianę zbioru $1,3,3,7,9$.\n3. Podaj dominantę zbioru $2,2,3,4,4,4$.\n4. Oblicz wariancję dla $1,3,5$.\n5. Oblicz odchylenie standardowe dla $2,2,2,2$.\n6. W grze wygrywasz $10$ zł z prawdopodobieństwem $0{,}2$ i $0$ zł w pozostałych przypadkach. Oblicz wartość oczekiwaną.\n7. Co oznacza 80. centyl?",
    answers:
      "1. $\\frac{2+8+10}{5}=4$.\n2. $3$.\n3. $4$.\n4. $\\frac{(1-3)^2+(3-3)^2+(5-3)^2}{3}=\\frac{8}{3}$.\n5. $0$.\n6. $2$ zł.\n7. Że około $80\\%$ wyników jest niższych lub równych temu wynikowi.",
    recap:
      "1. Czym różni się średnia ważona od arytmetycznej?\n2. Jak obliczyć wariancję?\n3. Jaki jest związek wariancji i odchylenia standardowego?\n4. Co mówi skala centylowa?\n5. Co to jest wartość oczekiwana?",
    diagram:
      "dane\n ↓\n średnia → odchylenia\n ↓            ↓\n mediana     wariancja\n dominanta      ↓\n            odchylenie standardowe\n centyl, wartość oczekiwana",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "proporcjonalnosc_odwrotna",
    title: "Proporcjonalność odwrotna i funkcja f(x)=a/x",
    examNote:
      "Proporcjonalność odwrotna opisuje sytuacje, w których iloczyn dwóch wielkości jest stały: więcej pracowników oznacza mniej czasu, większa prędkość oznacza krótszy czas przejazdu. Na maturze trzeba rozpoznać zależność, wyznaczyć stałą i obliczyć brakującą wartość. Wykresem funkcji $f(x)=\\frac{a}{x}$ jest hiperbola.",
    map:
      "1. Rozpoznasz proporcjonalność odwrotną.\n2. Wyznaczysz stałą $a$ z pary danych.\n3. Obliczysz $y$ dla danego $x$.\n4. Obliczysz $x$ dla danego $y$.\n5. Zinterpretujesz wynik w zadaniu praktycznym.",
    definitions:
      "Dwie wielkości są odwrotnie proporcjonalne, gdy ich iloczyn jest stały: $x\\cdot y=a$, gdzie $a\\ne0$. Równoważnie $y=\\frac{a}{x}$ dla $x\\ne0$. Dziedziną funkcji jest zbiór liczb rzeczywistych różnych od zera.\n\nDla $a>0$ wykres leży w pierwszej i trzeciej ćwiartce, a funkcja maleje w każdym z przedziałów $(-\\infty,0)$ i $(0,\\infty)$. Dla $a<0$ wykres leży w drugiej i czwartej ćwiartce, a funkcja rośnie w każdym z tych przedziałów. W zadaniach praktycznych stała $a$ ma wymiar iloczynu dwóch wielkości, np. pracy i czasu.",
    example1:
      "Wielkości są odwrotnie proporcjonalne i $y=\\frac{12}{x}$. Dla $x=3$ mamy $y=4$. Dla $x=6$ mamy $y=2$. Iloczyn $x\\cdot y$ jest zawsze równy $12$.",
    example2:
      "Sześciu pracowników wykona pracę w $8$ dni. Iloczyn jest stały: $6\\cdot8=48$. Dla czterech pracowników czas wynosi $\\frac{48}{4}=12$ dni. Im mniej pracowników, tym więcej dni, co potwierdza proporcjonalność odwrotną.",
    pitfalls:
      "* Nie myl proporcjonalności odwrotnej z prostą: tam iloraz jest stały, tutaj iloczyn.\n* Dziedzina wyklucza $x=0$.\n* Stała $a$ nie zmienia się w trakcie zadania.\n* Przy $a>0$ funkcja maleje, ale nie jest malejąca w całej dziedzinie.\n* Wynik sprawdź w kontekście: więcej pracowników powinno skrócić czas.",
    exercises:
      "1. Dla $y=\\frac{18}{x}$ oblicz $y$ dla $x=3$.\n2. Dla $y=\\frac{18}{x}$ oblicz $x$ dla $y=6$.\n3. Wielkości odwrotnie proporcjonalne spełniają $x\\cdot y=24$. Oblicz $y$ dla $x=8$.\n4. Ośmiu pracowników wykona pracę w $6$ dni. W ilu dniach zrobi ją dwunastu pracowników?\n5. Podaj dziedzinę $f(x)=\\frac{5}{x}$.\n6. Czy funkcja $f(x)=\\frac{10}{x}$ jest rosnąca, czy malejąca dla $x>0$?",
    answers:
      "1. $6$.\n2. $3$.\n3. $3$.\n4. $4$ dni, bo $8\\cdot6=48$ i $48:12=4$.\n5. $x\\ne0$.\n6. Malejąca.",
    recap:
      "1. Jaki iloczyn jest stały w proporcjonalności odwrotnej?\n2. Jaki jest wzór funkcji?\n3. Jaka jest dziedzina?\n4. W których ćwiartkach leży wykres dla $a>0$?\n5. Jak rozpoznać proporcjonalność odwrotną w zadaniu tekstowym?",
    diagram:
      "x · y = a\n   ↓\ny = a/x, x ≠ 0\n   ↓\na > 0: I i III ćwiartka\na < 0: II i IV ćwiartka\n   ↓\nwięcej x → mniej y (a > 0)",
  }),
];
