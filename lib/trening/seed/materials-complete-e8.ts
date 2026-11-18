import {
  buildLesson,
  type AdditionalMaterial,
} from "@/lib/trening/seed/additional-materials";

/**
 * Lekcje teorii dla nowych tematów egzaminu ósmoklasisty (drzewo CKE),
 * które nie miały jeszcze pliku w data/tasks-cache.
 */
export const COMPLETE_E8_MATERIALS: AdditionalMaterial[] = [
  buildLesson({
    exam_type: "8_klasa",
    category: "liczby",
    topic: "liczby_naturalne",
    title: "Liczby naturalne i zapis dziesiątkowy",
    examNote:
      "Zapis dziesiątkowy to podstawa każdego zadania z liczbami. Na egzaminie ósmoklasisty trzeba odczytać cyfrę w podanym rzędzie, zapisać liczbę w postaci sumy składników, porównać liczby i policzyć, ile jest liczb spełniających warunek. Te umiejętności wracają w zadaniach z jednostkami, zaokrąglaniem i odczytywaniem danych.",
    map:
      "1. Rozpoznasz rzędy: jedności, dziesiątki, setki, tysiące.\n2. Odczytasz wartość każdej cyfry w liczbie.\n3. Zapiszesz liczbę w postaci sumy składników.\n4. Porównasz liczby naturalne.\n5. Ułożysz największą lub najmniejszą liczbę z podanych cyfr.",
    definitions:
      "Liczby naturalne to $0, 1, 2, 3, \\ldots$. W zapisie dziesiątkowym wartość cyfry zależy od jej pozycji. Liczba $3547$ ma $3$ tysiące, $5$ setek, $4$ dziesiątki i $7$ jedności, dlatego $3547 = 3 \\cdot 1000 + 5 \\cdot 100 + 4 \\cdot 10 + 7$.\n\nZero w środku liczby jest ważne: $405$ to nie $45$, bo w $405$ nie ma pełnych dziesiątek, a w $45$ są cztery. Zero na początku liczby nie zmienia jej wartości, więc liczby nie zapisujemy w postaci $0405$.\n\nPorównując liczby naturalne, najpierw liczymy cyfry: liczba z większą liczbą cyfr jest większa. Gdy liczby mają tyle samo cyfr, porównujemy je od lewej strony, cyfra po cyfrze.",
    example1:
      "Liczba $2705$ ma cyfrę tysięcy $2$, cyfrę setek $7$, cyfrę dziesiątek $0$ i cyfrę jedności $5$. W postaci sumy składników: $2705 = 2000 + 700 + 5$. Zero na miejscu dziesiątek oznacza, że liczba nie zawiera pełnych dziesiątek.",
    example2:
      "Z cyfr $4, 0, 7, 2$, każdej dokładnie raz, układamy największą liczbę czterocyfrową. Zero nie może stać na początku, więc pierwszą cyfrą jest $7$. Pozostałe cyfry ustawiamy malejąco: $4$, $2$, $0$. Największa liczba to $7420$.",
    pitfalls:
      "* Nie myl cyfry z liczbą: w liczbie $444$ cyfra jedności to $4$, a cała liczba to $444$.\n* Zero w środku liczby musi być zapisane, inaczej zmienia się wartość liczby.\n* Przy porównywaniu nie zaczynaj od prawej strony, tylko od liczby cyfr, a potem od lewej.\n* W postaci sumy składników każdy składnik musi odpowiadać właściwemu rzędowi.\n* Największa liczba z podanych cyfr nie zaczyna się od zera.",
    exercises:
      "1. Podaj cyfrę setek w liczbie $8642$.\n2. Zapisz $5308$ w postaci sumy składników.\n3. Która liczba jest większa: $987$ czy $1023$?\n4. Ułóż najmniejszą liczbę czterocyfrową z cyfr $5, 0, 3, 8$ (każdej raz).\n5. Oblicz sumę cyfr liczby $4079$.\n6. Ile jest liczb dwucyfrowych większych od $95$?",
    answers:
      "1. $6$.\n2. $5000 + 300 + 8$.\n3. $1023$, bo ma cztery cyfry.\n4. $3058$.\n5. $4 + 0 + 7 + 9 = 20$.\n6. Cztery liczby: $96, 97, 98, 99$.",
    recap:
      "1. Jak nazywają się cztery pierwsze rzędy od prawej?\n2. Dlaczego zero w środku liczby jest potrzebne?\n3. Od czego zaczynamy porównywanie dwóch liczb?\n4. Jak zapisać liczbę w postaci sumy składników?\n5. Dlaczego największa liczba z cyfr nie zaczyna się od zera?",
    diagram:
      "tysiące  setki  dziesiątki  jedności\n   3       5        4          7\n   ↓       ↓        ↓          ↓\n 3000  +  500  +   40   +     7  = 3547\nporównanie: liczba cyfr → cyfry od lewej",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "liczby",
    topic: "dzialania_pisemne",
    title: "Działania pisemne - dodawanie, odejmowanie, mnożenie i dzielenie",
    examNote:
      "Działania pisemne pozwalają policzyć wynik bez kalkulatora i bez błędów w przenoszeniu. Na egzaminie ósmoklasisty pojawiają się w zadaniach zamkniętych, w obliczeniach z jednostkami i w sprawdzaniu wyników. Trzeba umieć dodawać i odejmować liczby wielocyfrowe, mnożyć przez liczbę dwucyfrową oraz dzielić z resztą.",
    map:
      "1. Ustawisz liczby w kolumnach według rzędów.\n2. Dodasz liczby z przeniesieniem.\n3. Odejmiesz liczby z pożyczaniem.\n4. Pomnożysz przez liczbę dwucyfrową, używając iloczynów częściowych.\n5. Podzielisz z resztą i sprawdzisz wynik.",
    definitions:
      "Przy dodawaniu pisemnym zapisujemy liczby jedna pod drugą tak, aby jedności były pod jednościami, dziesiątki pod dziesiątkami, a setki pod setkami. Dodajemy od prawej strony. Gdy suma w kolumnie jest większa od $9$, zapisujemy cyfrę jedności, a jedynkę przenosimy do następnej kolumny.\n\nPrzy odejmowaniu również zaczynamy od prawej. Jeśli górna cyfra jest mniejsza od dolnej, pożyczamy $10$ z sąsiedniej kolumny. Wynik odejmowania sprawdzamy dodawaniem: jeśli $a - b = c$, to $b + c = a$.\n\nPrzy mnożeniu przez liczbę dwucyfrową mnożymy najpierw przez jedności, potem przez dziesiątki, a wyniki dodajemy. Przy dzieleniu z resztą $a = b \\cdot q + r$, gdzie $0 \\le r < b$.",
    example1:
      "Obliczamy $486 + 357$. Jedności: $6 + 7 = 13$, zapisujemy $3$ i przenosimy $1$. Dziesiątki: $8 + 5 + 1 = 14$, zapisujemy $4$ i przenosimy $1$. Setki: $4 + 3 + 1 = 8$. Wynik to $843$.",
    example2:
      "Obliczamy $47 \\cdot 36$. Najpierw $47 \\cdot 6 = 282$. Potem $47 \\cdot 30 = 1410$. Dodajemy: $282 + 1410 = 1692$. Sprawdzenie odejmowaniem: $1692 - 1410 = 282$, więc wynik jest poprawny.",
    pitfalls:
      "* Nie ustawiaj liczb według lewej krawędzi - muszą zgadzać się rzędy.\n* Nie zapominaj o przeniesieniu przy dodawaniu.\n* Pożyczanie z zera wymaga pożyczenia z kolejnej kolumny.\n* Przy mnożeniu przez dziesiątki dopisz zero na końcu iloczynu częściowego.\n* Reszta z dzielenia musi być mniejsza od dzielnika.",
    exercises:
      "1. Oblicz $648 + 275$.\n2. Oblicz $803 - 467$.\n3. Oblicz $58 \\cdot 24$.\n4. Wykonaj dzielenie $157 : 12$ i podaj resztę.\n5. Sprawdź, czy $392 + 418 = 810$.\n6. Oblicz $720 : 9$.",
    answers:
      "1. $923$.\n2. $336$.\n3. $1392$.\n4. $157 = 12 \\cdot 13 + 1$, reszta $1$.\n5. Tak, $392 + 418 = 810$.\n6. $80$.",
    recap:
      "1. Jak ustawiamy liczby przy dodawaniu pisemnym?\n2. Kiedy pożyczamy przy odejmowaniu?\n3. Jak liczymy iloczyn przez liczbę dwucyfrową?\n4. Jaki warunek spełnia reszta z dzielenia?\n5. Jak sprawdzić wynik odejmowania?",
    diagram:
      "  486          47           157 : 12 = 13 r. 1\n+ 357        × 36           -144\n-----        -----             13\n  843          282          - 12\n             1410             1\n             -----\n              1692      sprawdzenie: 12·13+1=157",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "liczby",
    topic: "nwd_i_nww",
    title: "NWD i NWW - największy wspólny dzielnik i najmniejsza wspólna wielokrotność",
    examNote:
      "NWD i NWW lubią zadania z treścią: dzielenie cukierków na jednakowe paczki, wyznaczanie wspólnego czasu odjazdu autobusów, wykładanie prostokąta kwadratowymi płytkami. Na egzaminie trzeba rozpoznać, czy szukamy wspólnego dzielnika (NWD), czy wspólnej wielokrotności (NWW), i policzyć ją z rozkładu na czynniki pierwsze.",
    map:
      "1. Rozłożysz liczbę na czynniki pierwsze.\n2. Obliczysz NWD dwóch lub trzech liczb.\n3. Obliczysz NWW dwóch lub trzech liczb.\n4. Rozpoznasz w zadaniu, czy potrzebny jest NWD, czy NWW.\n5. Sprawdzisz wynik prostym dzieleniem.",
    definitions:
      "Dzielnik liczby $a$ to liczba, przez którą $a$ dzieli się bez reszty. Wielokrotność liczby $a$ to liczba postaci $a \\cdot k$, gdzie $k$ jest liczbą naturalną.\n\nNajwiększy wspólny dzielnik $\\operatorname{NWD}(a,b)$ to największa liczba, która dzieli obie liczby. Najmniejsza wspólna wielokrotność $\\operatorname{NWW}(a,b)$ to najmniejsza liczba dodatnia, która jest wielokrotnością obu liczb. Liczby, których NWD wynosi $1$, nazywamy względnie pierwszymi.\n\nWyznaczamy je z rozkładu na czynniki pierwsze. Do NWD bierzemy wspólne czynniki z najmniejszymi wykładnikami, a do NWW wszystkie czynniki z największymi wykładnikami. Zawsze zachodzi $\\operatorname{NWD}(a,b) \\cdot \\operatorname{NWW}(a,b) = a \\cdot b$.",
    example1:
      "Obliczamy $\\operatorname{NWD}(84,126)$. Rozkłady: $84 = 2^2 \\cdot 3 \\cdot 7$ oraz $126 = 2 \\cdot 3^2 \\cdot 7$. Wspólne czynniki to $2$, $3$ i $7$ w najmniejszych wykładnikach, więc $\\operatorname{NWD}(84,126) = 2 \\cdot 3 \\cdot 7 = 42$.",
    example2:
      "Autobus jednej linii odjeżdża co $12$ minut, a drugi co $18$ minut. Oba odjechały razem o 8:00. Ponownie odjadą razem po $\\operatorname{NWW}(12,18)$ minutach. $12 = 2^2 \\cdot 3$, $18 = 2 \\cdot 3^2$, więc NWW $= 2^2 \\cdot 3^2 = 36$. Spotkają się po $36$ minutach, czyli o 8:36.",
    pitfalls:
      "* NWD to dzielnik, a NWW to wielokrotność - nie zamieniaj ich miejscami.\n* Do NWD bierzesz tylko czynniki wspólne dla obu liczb.\n* Do NWW bierzesz wszystkie czynniki, także te, które występują tylko w jednym rozkładzie.\n* Iloczyn liczb nie jest NWW, gdy liczby mają wspólny dzielnik większy od $1$.\n* NWW jest zawsze nie mniejsza od każdej z liczb, a NWD nie większy od nich.",
    exercises:
      "1. Rozłóż $180$ na czynniki pierwsze.\n2. Oblicz $\\operatorname{NWD}(36,60)$.\n3. Oblicz $\\operatorname{NWW}(8,12)$.\n4. Mama ma $18$ jabłek i $24$ gruszki. Ile najwięcej jednakowych paczek może przygotować?\n5. Dwa dzwonki dzwonią co $9$ i co $15$ minut. Po ilu minutach zadzwonią razem?\n6. Oblicz $\\operatorname{NWW}(6,10)$.",
    answers:
      "1. $180 = 2^2 \\cdot 3^2 \\cdot 5$.\n2. $12$.\n3. $24$.\n4. $\\operatorname{NWD}(18,24) = 6$ paczek.\n5. Po $45$ minutach.\n6. $30$.",
    recap:
      "1. Czym różni się dzielnik od wielokrotności?\n2. Które czynniki wybieramy do NWD?\n3. Które czynniki wybieramy do NWW?\n4. Jak rozpoznać, że w zadaniu trzeba użyć NWD?\n5. Jaki związek łączy NWD, NWW i iloczyn liczb?",
    diagram:
      "84 = 2²·3·7      126 = 2·3²·7\nNWD: wspólne, najmniejsze wykładniki → 2·3·7 = 42\nNWW: wszystkie, największe wykładniki  → 2²·3²·7 = 252\nNWD·NWW = 84·126",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "liczby",
    topic: "zaokraglanie_i_szacowanie",
    title: "Zaokrąglanie i szacowanie liczb",
    examNote:
      "Zaokrąglanie pojawia się przy odczytywaniu wyników, w zadaniach z pieniędzmi, jednostkami i statystyką. Szacowanie pozwala szybko sprawdzić, czy wynik ma sens. Na egzaminie trzeba zaokrąglić liczbę do wskazanego rzędu, oszacować sumę lub iloczyn oraz ocenić, który wynik jest realny.",
    map:
      "1. Wskażesz rząd, do którego zaokrąglasz.\n2. Zastosujesz regułę: cyfra $5$ i więcej zaokrągla w górę.\n3. Zaokrąglisz liczby dziesiętne do całkowitych lub do dziesiątych.\n4. Oszacujesz sumę i iloczyn, zaokrąglając składniki.\n5. Ocenisz, czy oszacowanie jest większe, czy mniejsze od dokładnego wyniku.",
    definitions:
      "Zaokrąglanie polega na zastąpieniu liczby najbliższą liczbą o wskazanym rzędzie. Patrzymy na cyfrę stojącą bezpośrednio po rzędzie, do którego zaokrąglamy: jeśli jest to $0, 1, 2, 3$ lub $4$, zaokrąglamy w dół, a jeśli $5, 6, 7, 8$ lub $9$ - w górę.\n\nPrzykłady: $4872$ zaokrąglone do setek to $4900$, bo cyfra dziesiątek to $7$. Liczba $3{,}46$ zaokrąglona do całości to $3$, bo cyfra dziesiątych to $4$. Zaokrąglamy zawsze raz, nie dwa razy pod rząd.\n\nSzacowanie to przybliżanie liczb, żeby szybko policzyć wynik w pamięci. Szacunek nie musi być dokładny, ale powinien być blisko prawdziwego wyniku.",
    example1:
      "Zaokrąglamy $4872$ do pełnych setek. Cyfra setek to $8$, a cyfra dziesiątek to $7$, więc zaokrąglamy w górę: $4900$. Gdybyśmy zaokrąglali do pełnych tysięcy, cyfra setek $8$ też kazałaby zaokrąglić w górę, do $5000$.",
    example2:
      "Oszacujmy $19{,}8 \\cdot 4{,}9$. Zaokrąglamy czynniki do pełnych dziesiątek i jedności: $19{,}8 \\approx 20$, $4{,}9 \\approx 5$. Wtedy $20 \\cdot 5 = 100$. Dokładny wynik to $97{,}02$, więc szacunek $100$ jest blisko.",
    pitfalls:
      "* Nie zaokrąglaj dwa razy: $3{,}46$ to $3$, a nie $4$ przez pośrednie $3{,}5$.\n* Cyfra $5$ zaokrągla w górę, także w liczbach dziesiętnych.\n* Przy zaokrąglaniu do setek patrz na dziesiątki, a nie na jedności.\n* Szacując sumę, zaokrąglaj każdy składnik osobno.\n* Pamiętaj, że szacunek może być większy lub mniejszy od dokładnego wyniku.",
    exercises:
      "1. Zaokrąglij $3764$ do pełnych setek.\n2. Zaokrąglij $6{,}48$ do jednego miejsca po przecinku.\n3. Zaokrąglij $12{,}7$ do liczby całkowitej.\n4. Oszacuj $398 + 203 + 97$, zaokrąglając składniki do setek.\n5. Oszacuj $49 \\cdot 21$, zaokrąglając czynniki do dziesiątek.\n6. Która liczba po zaokrągleniu do dziesiątek daje $350$?",
    answers:
      "1. $3800$.\n2. $6{,}5$.\n3. $13$.\n4. $400 + 200 + 100 = 700$.\n5. $50 \\cdot 20 = 1000$.\n6. Na przykład $347$.",
    recap:
      "1. Na którą cyfrę patrzymy przy zaokrąglaniu?\n2. Kiedy zaokrąglamy w górę?\n3. Dlaczego nie wolno zaokrąglać dwa razy?\n4. Po co stosujemy szacowanie?\n5. Jak oszacować iloczyn dwóch liczb?",
    diagram:
      "3764 → setki\ncyfra setek: 7 | cyfra dziesiątek: 6 → w górę\n3764 ≈ 3800\n\nszacowanie: 19,8·4,9 ≈ 20·5 = 100",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "liczby",
    topic: "ulamki_dziesietne",
    title: "Ułamki dziesiętne - zapis i działania",
    examNote:
      "Ułamki dziesiętne pojawiają się w zadaniach z pieniędzmi, miarami i danymi. Na egzaminie trzeba zapisać ułamek zwykły w postaci dziesiętnej, dodać i odjąć ułamki z różną liczbą miejsc po przecinku, pomnożyć i podzielić przez $10$, $100$ lub $1000$ oraz porównać takie liczby.",
    map:
      "1. Odczytasz rzędy po przecinku: dziesiąte, setne, tysięczne.\n2. Zamienisz ułamek zwykły na dziesiętny.\n3. Dodasz i odejmiesz ułamki dziesiętne.\n4. Pomnożysz i podzielisz przez $10$, $100$, $1000$.\n5. Pomnożysz dwie liczby dziesiętne i porównasz wyniki.",
    definitions:
      "Po przecinku pierwsze miejsce to dziesiąte, drugie - setne, trzecie - tysięczne. Zapis $0{,}375$ oznacza $\\dfrac{375}{1000}$, a $2{,}5$ to $\\dfrac{25}{10}$.\n\nUłamek zwykły zamieniamy na dziesiętny, rozszerzając go do mianownika $10$, $100$ lub $1000$: $\\dfrac{3}{4} = \\dfrac{75}{100} = 0{,}75$.\n\nPrzy dodawaniu i odejmowaniu ustawiamy przecinki w jednej kolumnie, dopisując zera: $3{,}7 + 2{,}45 = 3{,}70 + 2{,}45 = 6{,}15$. Przy mnożeniu mnożymy jak liczby naturalne i wstawiamy przecinek tak, aby miejsc po przecinku było tyle, ile w obu czynnikach razem. Dzielenie przez $10$, $100$, $1000$ przesuwa przecinek odpowiednio o $1$, $2$, $3$ miejsca w lewo.",
    example1:
      "Obliczamy $3{,}7 + 2{,}45$. Dopisujemy zero: $3{,}70 + 2{,}45$. Jedności: $3 + 2 = 5$, dziesiąte: $7 + 4 = 11$, zapisujemy $1$ i przenosimy $1$ do jedności, setne: $0 + 5 = 5$. Wynik to $6{,}15$.",
    example2:
      "Obliczamy $2{,}5 \\cdot 0{,}4$. Mnożymy $25 \\cdot 4 = 100$. W obu czynnikach są razem dwa miejsca po przecinku, więc wynik to $1{,}00 = 1$. Dzielenie $4{,}5 : 0{,}9$ zamieniamy na $45 : 9 = 5$.",
    pitfalls:
      "* Nie ustawiaj przecinków dowolnie - muszą być w jednej kolumnie.\n* $0{,}5 \\cdot 0{,}5 = 0{,}25$, a nie $2{,}5$.\n* Przy dzieleniu przez $100$ przecinek przesuwa się w lewo, a nie w prawo.\n* Zera na końcu zapisu dziesiętnego nie zmieniają wartości liczby, ale pomagają wyrównać miejsca.\n* Porównując ułamki, dopisz zera do jednakowej liczby miejsc po przecinku.",
    exercises:
      "1. Zamień $\\dfrac{7}{20}$ na ułamek dziesiętny.\n2. Oblicz $4{,}6 + 1{,}85$.\n3. Oblicz $7{,}2 - 3{,}45$.\n4. Oblicz $3{,}4 \\cdot 100$.\n5. Oblicz $2{,}4 \\cdot 0{,}5$.\n6. Która liczba jest większa: $0{,}7$ czy $0{,}68$?",
    answers:
      "1. $0{,}35$.\n2. $6{,}45$.\n3. $3{,}75$.\n4. $340$.\n5. $1{,}2$.\n6. $0{,}7$, bo $0{,}70 > 0{,}68$.",
    recap:
      "1. Jak nazywają się trzy pierwsze miejsca po przecinku?\n2. Jak zamienić ułamek zwykły na dziesiętny?\n3. Jak ustawić liczby przy dodawaniu ułamków dziesiętnych?\n4. Jak ustalić położenie przecinka w iloczynie?\n5. W którą stronę przesuwa się przecinek przy dzieleniu przez $100$?",
    diagram:
      "3,70           25 · 4 = 100\n+ 2,45          2,5 · 0,4 = 1,00 = 1\n-------\n  6,15          :10 ← | → ·10\n                :100 ← | → ·100",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    topic: "skala",
    title: "Skala i plan - odległości i pola",
    examNote:
      "Skala pojawia się w zadaniach z planem mieszkania, mapą i modelem. Na egzaminie trzeba obliczyć rzeczywistą długość na podstawie planu, długość na planie na podstawie terenu, ustalić skalę z danych oraz przeliczyć pole figury. Kluczowe jest poprawne zamienianie jednostek: centymetrów, metrów i kilometrów.",
    map:
      "1. Odczytasz skalę $1:k$ i wyjaśnisz jej znaczenie.\n2. Obliczysz długość rzeczywistą z planu.\n3. Obliczysz długość na planie z wymiarów rzeczywistych.\n4. Wyznaczysz skalę na podstawie dwóch długości.\n5. Przeliczysz pole figury ze skali.",
    definitions:
      "Skala $1:k$ oznacza, że $1$ jednostka na planie odpowiada $k$ takim samym jednostkom w rzeczywistości. Na planie w skali $1:500$ odcinek $1$ cm odpowiada $500$ cm, czyli $5$ m.\n\nDługość rzeczywistą obliczamy, mnożąc długość na planie przez $k$. Długość na planie obliczamy, dzieląc długość rzeczywistą przez $k$. Skalę wyznaczamy, dzieląc długość rzeczywistą przez długość na planie - obie w tych samych jednostkach.\n\nPrzy polach skala działa inaczej: jeśli długości zmieniają się $k$ razy, to pole zmienia się $k^2$ razy. Na planie $1:1000$ bok $1$ cm odpowiada $10$ m, więc pole $1$ cm$^2$ odpowiada $100$ m$^2$.",
    example1:
      "Na planie w skali $1:5000$ odcinek ma $3$ cm. Rzeczywista długość to $3 \\cdot 5000 = 15000$ cm. Ponieważ $100$ cm to $1$ m, otrzymujemy $150$ m.",
    example2:
      "Odcinek $20$ m w terenie ma na planie $4$ cm. Zamieniamy $20$ m na centymetry: $2000$ cm. Skala to $2000 : 4 = 500$, czyli $1:500$.",
    pitfalls:
      "* Skala $1:500$ oznacza $1$ cm na planie to $5$ m, a nie $500$ m.\n* Przed dzieleniem zamień obie długości na tę samą jednostkę.\n* Pole zmienia się z kwadratem skali - nie mnożymy pola przez $k$, tylko przez $k^2$.\n* Przy skali mapy $1:1000000$ warto pamiętać, że $1$ cm to $10$ km.\n* Nie odwracaj skali: $1:500$ to nie to samo co $500:1$.",
    exercises:
      "1. Na planie w skali $1:200$ odcinek ma $7$ cm. Ile to metrów?\n2. Odcinek $30$ m ma na planie $6$ cm. Jaka jest skala?\n3. Ile centymetrów na planie w skali $1:500$ ma odcinek $15$ m?\n4. Prostokąt na planie w skali $1:1000$ ma boki $3$ cm i $5$ cm. Jakie jest jego pole w rzeczywistości?\n5. Na mapie w skali $1:500000$ odległość wynosi $4$ cm. Ile to kilometrów?\n6. Ile metrów odpowiada $1$ cm na planie w skali $1:2000$?",
    answers:
      "1. $7 \\cdot 200 = 1400$ cm $= 14$ m.\n2. $3000 : 6 = 500$, skala $1:500$.\n3. $1500 : 500 = 3$ cm.\n4. $30 \\cdot 50 = 1500$ m$^2$.\n5. $4 \\cdot 5 = 20$ km.\n6. $20$ m.",
    recap:
      "1. Co oznacza zapis $1:1000$?\n2. Jak obliczyć długość rzeczywistą z planu?\n3. Jak wyznaczyć skalę z dwóch długości?\n4. Ile metrów to $1$ cm na planie w skali $1:500$?\n5. Jak zmienia się pole przy zmianie skali?",
    diagram:
      "plan 1:500\n1 cm → 500 cm = 5 m\n\nplan → teren: × 500\nteren → plan: : 500\npole: × 500²",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    topic: "zegar_i_kalendarz",
    title: "Zegar i kalendarz - czas, kąty i dni tygodnia",
    examNote:
      "Zadania z czasem sprawdzają odejmowanie godzin i minut, przeliczanie jednostek oraz odczytywanie dni tygodnia. Na egzaminie ósmoklasisty pojawiają się także kąty między wskazówkami zegara. Trzeba pamiętać, że czas liczymy w systemie sześćdziesiątkowym, a nie dziesiątkowym.",
    map:
      "1. Przeliczysz godziny na minuty i odwrotnie.\n2. Obliczysz czas między dwiema godzinami.\n3. Dodasz minuty do godziny.\n4. Obliczysz kąt między wskazówkami zegara.\n5. Ustalysz dzień tygodnia po upływie podanej liczby dni.",
    definitions:
      "$1$ godzina $= 60$ minut, $1$ minuta $= 60$ sekund. Przy obliczaniu różnicy czasów najłatwiej zamienić obie godziny na minuty od początku doby, odjąć i zamienić wynik z powrotem.\n\nTarcza zegara ma $360°$. Wskazówka minutowa obraca się o $360°$ w ciągu godziny, czyli o $6°$ w ciągu minuty. Wskazówka godzinowa obraca się o $30°$ w ciągu godziny. O pełnej godzinie $h$ mniejszy kąt między wskazówkami wynosi $30° \\cdot h$ dla $h \\le 6$ lub $360° - 30° \\cdot h$ dla $h > 6$.\n\nTydzień ma $7$ dni. Dni tygodnia powtarzają się cyklicznie, więc przy przesunięciu o wiele dni liczymy resztę z dzielenia przez $7$.",
    example1:
      "Ile czasu mija od $8{:}45$ do $11{:}20$? Od $8{:}45$ do $9{:}00$ mija $15$ minut, od $9{:}00$ do $11{:}00$ - $2$ godziny, a od $11{:}00$ do $11{:}20$ - $20$ minut. Razem $2$ godziny $35$ minut.",
    example2:
      "O godzinie $4{:}00$ wskazówka godzinowa jest na $4$, a minutowa na $12$. Kąt między nimi to $4 \\cdot 30° = 120°$. Dziś jest wtorek. Za $10$ dni: $10 = 7 + 3$, więc dzień przesuwa się o $3$ - będzie piątek.",
    pitfalls:
      "* Nie odejmuj minut jak liczb dziesiętnych: od $8{:}50$ do $9{:}20$ mija $30$ minut, a nie $70$.\n* Po dodaniu minut sprawdź, czy nie przekroczyłeś pełnej godziny.\n* Kąt mniejszy to nie zawsze $30° \\cdot h$ - dla godzin po $6$ odejmij od $360°$.\n* Przy dniach tygodnia licz resztę z dzielenia przez $7$.\n* Pamiętaj o latach przestępnych, gdy zadanie dotyczy lutego.",
    exercises:
      "1. Ile minut mija od $7{:}50$ do $9{:}05$?\n2. $3$ godziny $25$ minut to ile minut?\n3. Jaki kąt tworzą wskazówki o godzinie $5{:}00$?\n4. Dziś jest poniedziałek. Jaki dzień będzie za $17$ dni?\n5. Zegar wskazuje $11{:}40$. Którą godzinę wskaże po $35$ minutach?\n6. Ile czasu mija od $13{:}15$ do $14{:}05$?",
    answers:
      "1. $75$ minut.\n2. $205$ minut.\n3. $150°$.\n4. $17 = 2 \\cdot 7 + 3$, więc czwartek.\n5. $12{:}15$.\n6. $50$ minut.",
    recap:
      "1. Ile minut ma godzina?\n2. Jak obliczyć różnicę dwóch godzin?\n3. O ile stopni obraca się wskazówka minutowa w ciągu minuty?\n4. Jak wyznaczyć mniejszy kąt między wskazówkami?\n5. Jak ustalić dzień tygodnia po wielu dniach?",
    diagram:
      "12\n 9      3     wskazówki: 30°/h, 6°/min\n 6\n\n8:45 → 11:20 = 2 h 35 min\nwtorek + 10 dni = piątek",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    topic: "temperatura",
    title: "Temperatura - liczby ujemne w praktyce",
    examNote:
      "Temperatura to najprostszy sposób spotkania z liczbami ujemnymi. Na egzaminie trzeba obliczyć wzrost lub spadek temperatury, różnicę między wartościami, średnią temperaturę oraz porównać temperatury. Uwaga na znaki: spadek o $5$ stopni to odejmowanie, a różnica temperatur może być większa niż każda z nich.",
    map:
      "1. Odczytasz temperaturę dodatnią i ujemną.\n2. Obliczysz temperaturę po wzroście i po spadku.\n3. Obliczysz różnicę temperatur.\n4. Obliczysz średnią temperaturę.\n5. Porównasz temperatury na osi liczbowej.",
    definitions:
      "Temperaturę zapisujemy w stopniach Celsjusza. Liczby ujemne oznaczają temperaturę poniżej zera, np. $-7°C$ to siedem stopni poniżej zera. Im bardziej na lewo na osi liczbowej, tym zimniej.\n\nGdy temperatura wzrasta o $k$ stopni, dodajemy $k$ do temperatury początkowej. Gdy spada o $k$ stopni, odejmujemy $k$. Różnica temperatur to wartość większej temperatury minus wartość mniejszej.\n\nŚrednia temperatura to suma temperatur podzielona przez liczbę pomiarów. Średnia może być ujemna, np. dla temperatur $-4°C$, $-2°C$, $2°C$, $4°C$ suma wynosi $0$, więc średnia to $0°C$.",
    example1:
      "Temperatura wynosiła $-4°C$ i wzrosła o $10°C$. Dodajemy: $-4 + 10 = 6$. Temperatura wynosi teraz $6°C$. Gdyby spadła o $10°C$, byłoby $-4 - 10 = -14°C$.",
    example2:
      "O godzinie 6 temperatura wynosiła $-7°C$, a o 14 wzrosła do $8°C$. Różnica to $8 - (-7) = 8 + 7 = 15$ stopni. Uwaga: różnica jest większa niż $8$, bo obie temperatury leżą po przeciwnych stronach zera.",
    pitfalls:
      "* Odejmowanie liczby ujemnej to dodawanie: $8 - (-7) = 15$.\n* Spadek temperatury o $k$ stopni to odejmowanie $k$, a nie dodawanie.\n* Różnica temperatur jest zawsze nieujemna.\n* Przy średniej dodaj wszystkie temperatury razem ze znakami.\n* Im niższa temperatura, tym mniejsza liczba na osi: $-12°C$ leży dalej w lewo niż $-3°C$.",
    exercises:
      "1. Temperatura wynosiła $-9°C$ i wzrosła o $12°C$. Jaka jest teraz?\n2. O ile stopni jest cieplej, gdy jest $5°C$, niż gdy jest $-8°C$?\n3. Temperatura spadła z $3°C$ o $11$ stopni. Jaka jest teraz?\n4. Oblicz średnią temperatur: $-3°C$, $-2°C$, $4°C$, $5°C$.\n5. Która temperatura jest najniższa: $-6°C$, $-11°C$, $2°C$, $-1°C$?\n6. Po spadku o $6°C$ jest $-2°C$. Ile było przed spadkiem?",
    answers:
      "1. $3°C$.\n2. $5 + 8 = 13$ stopni.\n3. $-8°C$.\n4. $(-3 - 2 + 4 + 5) : 4 = 1°C$.\n5. $-11°C$.\n6. $-2 + 6 = 4°C$.",
    recap:
      "1. Co oznacza temperatura $-5°C$?\n2. Jak obliczyć temperaturę po spadku o $k$ stopni?\n3. Jak obliczyć różnicę dwóch temperatur, gdy jedna jest ujemna?\n4. Dlaczego różnica temperatur może być większa od obu wartości?\n5. Jak porównać dwie temperatury ujemne?",
    diagram:
      " -12  -8  -4   0   4   8\n   |   |   |   |   |   |\nzimniej ←----------→ cieplej\n\n8°C - (-7°C) = 15°C",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "algebra",
    topic: "przeksztalcanie_wyrazen",
    title: "Przekształcanie wyrażeń algebraicznych",
    examNote:
      "Upraszczanie wyrażeń jest potrzebne w równaniach, wzorach i zadaniach z treścią. Na egzaminie trzeba zredukować wyrazy podobne, wymnożyć nawias przez liczbę, opuścić nawias z minusem przed nim i obliczyć wartość wyrażenia po podstawieniu liczby. Błąd w znaku psuje całe dalsze rozwiązanie.",
    map:
      "1. Rozpoznasz wyrazy podobne.\n2. Zredukujesz wyrazy podobne.\n3. Wymnożysz nawias przez liczbę.\n4. Opuścisz nawias, gdy przed nim jest minus.\n5. Obliczysz wartość wyrażenia dla podanej liczby.",
    definitions:
      "Wyrażenie algebraiczne to zapis z literami, liczbami i działaniami, np. $3x + 2y - 5$. Wyrazy podobne to wyrazy z tą samą literą w tej samej potędze. Redukcja polega na dodaniu ich współczynników: $5x + 3x = 8x$.\n\nRozdzielność mnożenia względem dodawania: $a(b + c) = ab + ac$. Dlatego $3(2x + 5) = 6x + 15$. Mnożenie potęg o tej samej podstawie: $x \\cdot x = x^2$.\n\nMinus przed nawiasem zmienia znak każdego składnika w nawiasie: $-(x - 4) = -x + 4$. Gdy podstawiamy liczbę, pamiętamy o kolejności działań i o tym, że $x^2$ to $x \\cdot x$, a nie $2x$.",
    example1:
      "Upraszczamy $5x + 3y - 2x + 4y$. Wyrazy z $x$: $5x - 2x = 3x$. Wyrazy z $y$: $3y + 4y = 7y$. Wynik to $3x + 7y$.",
    example2:
      "Upraszczamy $3(2x + 5) - 2(x - 4)$. Wymnażamy nawiasy: $6x + 15 - 2x + 8$. Minus przed drugim nawiasem zmienił znaki. Redukujemy: $4x + 23$. Dla $x = 2$ wartość wynosi $4 \\cdot 2 + 23 = 31$.",
    pitfalls:
      "* $2x + 3 \\ne 5x$ - dodawać można tylko wyrazy podobne.\n* $x \\cdot x = x^2$, a nie $2x$.\n* Minus przed nawiasem zmienia znaki wszystkich składników.\n* Mnożymy przez liczbę każdy składnik nawiasu, także stały.\n* Podstawiając liczbę ujemną, używaj nawiasów: $(-2)^2 = 4$.",
    exercises:
      "1. Zredukuj $7x + 4y - 2x + y$.\n2. Wymnóż $4(3x + 2)$.\n3. Uprość $2(x + 3) - 5(x - 1)$.\n4. Oblicz wartość $3x^2 - 2x + 1$ dla $x = 2$.\n5. Uprość $5x + 2 - (3x - 7)$.\n6. Zapisz $x(x + 6)$ bez nawiasów.",
    answers:
      "1. $5x + 5y$.\n2. $12x + 8$.\n3. $2x + 6 - 5x + 5 = -3x + 11$.\n4. $3 \\cdot 4 - 4 + 1 = 9$.\n5. $2x + 9$.\n6. $x^2 + 6x$.",
    recap:
      "1. Jakie wyrazy nazywamy podobnymi?\n2. Jak działa minus przed nawiasem?\n3. Jak wymnożyć liczbę przez nawias?\n4. Ile wynosi $x \\cdot x$?\n5. Od czego zacząć obliczanie wartości wyrażenia?",
    diagram:
      "wyrażenie\n   ↓\nwymnażanie nawiasów\n   ↓\nredukcja wyrazów podobnych\n   ↓\nwynik\n\n3(2x+5)-2(x-4) = 6x+15-2x+8 = 4x+23",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "algebra",
    topic: "nierownosci",
    title: "Nierówności liniowe z jedną niewiadomą",
    examNote:
      "Nierówności rozwiązujemy podobnie jak równania, ale trzeba pilnować zwrotu znaku. Na egzaminie ósmoklasisty pojawiają się zadania o rozwiązaniu nierówności, o największej lub najmniejszej liczbie całkowitej spełniającej warunek oraz o liczbie rozwiązań naturalnych. Odpowiedź można zapisać nierównością lub na osi liczbowej.",
    map:
      "1. Przeniesiesz liczby na jedną stronę, a wyrazy z $x$ na drugą.\n2. Podzielisz przez współczynnik przy $x$.\n3. Zmienisz zwrot nierówności przy dzieleniu przez liczbę ujemną.\n4. Zaznaczysz rozwiązanie na osi liczbowej.\n5. Wybierzesz największą lub najmniejszą liczbę całkowitą spełniającą nierówność.",
    definitions:
      "Nierówność liniowa ma postać $ax + b < c$ (lub $>$, $\\le$, $\\ge$), gdzie $a \\ne 0$. Rozwiązywanie polega na przekształcaniu do postaci $x < d$ lub $x > d$.\n\nDo obu stron można dodać tę samą liczbę albo odjąć tę samą liczbę - zwrot nierówności się nie zmienia. Można też pomnożyć lub podzielić obie strony przez liczbę dodatnią. Przy mnożeniu lub dzieleniu przez liczbę ujemną zwrot nierówności zmienia się na przeciwny.\n\nRozwiązanie $x > 3$ oznacza wszystkie liczby większe od $3$. Na osi zaznaczamy otwarte kółko w $3$ i strzałkę w prawo. Liczba $3$ nie należy do rozwiązań, ale liczby $4, 5, 6$ już tak.",
    example1:
      "Rozwiązujemy $3x + 5 > 17$. Odejmujemy $5$: $3x > 12$. Dzielimy przez $3$ (liczba dodatnia, zwrot bez zmian): $x > 4$. Najmniejsza liczba całkowita spełniająca nierówność to $5$.",
    example2:
      "Rozwiązujemy $-2x \\ge 8$. Dzielimy przez $-2$ i zmieniamy zwrot: $x \\le -4$. Największa liczba całkowita spełniająca nierówność to $-4$, bo $-4 \\le -4$.",
    pitfalls:
      "* Dzielenie przez liczbę ujemną zmienia zwrot nierówności.\n* Przy $\\le$ i $\\ge$ granica należy do rozwiązań.\n* Najmniejsza liczba całkowita dla $x > 4$ to $5$, nie $4$.\n* Największa liczba całkowita dla $x < 4$ to $3$.\n* Nie przenoś wyrazów bez zmiany znaku na przeciwny.",
    exercises:
      "1. Rozwiąż $4x - 3 > 13$.\n2. Rozwiąż $-3x < 12$.\n3. Rozwiąż $2x + 7 \\le 15$.\n4. Podaj najmniejszą liczbę całkowitą spełniającą $x > 2{,}8$.\n5. Ile liczb całkowitych dodatnich spełnia $x < 7$?\n6. Rozwiąż $5(x - 1) \\le 20$.",
    answers:
      "1. $x > 4$.\n2. $x > -4$.\n3. $x \\le 4$.\n4. $3$.\n5. Sześć liczb: $1, 2, 3, 4, 5, 6$.\n6. $5x - 5 \\le 20$, więc $x \\le 5$.",
    recap:
      "1. Jak zmienia się zwrot nierówności przy dzieleniu przez liczbę ujemną?\n2. Czy liczba $3$ spełnia $x \\ge 3$?\n3. Jak zaznaczyć $x < 2$ na osi liczbowej?\n4. Jak znaleźć najmniejszą liczbę całkowitą spełniającą $x > 4{,}2$?\n5. Czym różni się rozwiązanie $x \\le 5$ od $x < 5$?",
    diagram:
      "3x + 5 > 17\n  3x > 12\n   x > 4\n\n---o=====>\n   4\n\n-2x ≥ 8  →  x ≤ -4\n<====o---\n    -4",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "algebra",
    topic: "wyznaczanie_wielkosci_ze_wzoru",
    title: "Wyznaczanie wielkości ze wzoru",
    examNote:
      "Wzory opisują związki między wielkościami w geometrii i w życiu codziennym. Na egzaminie ósmoklasisty trzeba wyznaczyć z wzoru wskazaną wielkość, a potem podstawić dane liczbowe. Liczy się kolejność działań odwrotnych, dzielenie przez cały iloczyn i poprawne jednostki.",
    map:
      "1. Wskażesz szukaną wielkość we wzorze.\n2. Wykonasz działania odwrotne, aby została sama.\n3. Podzielisz przez cały czynnik, a nie tylko przez pierwszą literę.\n4. Podstawisz dane liczbowe.\n5. Sprawdzisz wynik i jednostkę.",
    definitions:
      "Wyznaczenie wielkości ze wzoru to przekształcenie go tak, aby szukana wielkość stała sama po jednej stronie. Używamy działań odwrotnych do tych, które występują we wzorze.\n\nPodstawowe przekształcenia: ze wzoru $s = v \\cdot t$ otrzymujemy $t = \\dfrac{s}{v}$ oraz $v = \\dfrac{s}{t}$. Ze wzoru $P = \\dfrac{a \\cdot h}{2}$ otrzymujemy $a = \\dfrac{2P}{h}$ oraz $h = \\dfrac{2P}{a}$. Ze wzoru $V = a \\cdot b \\cdot c$ otrzymujemy $c = \\dfrac{V}{a \\cdot b}$. Z obwodu prostokąta $P = 2(a + b)$ mamy $b = \\dfrac{P}{2} - a$.\n\nDzielimy tylko wtedy, gdy dzielnik jest różny od zera. Wynik warto sprawdzić, podstawiając go do wyjściowego wzoru.",
    example1:
      "Ze wzoru $s = v \\cdot t$ wyznaczamy $t$, gdy $s = 120$ km i $v = 60$ km/h. Dzielimy obie strony przez $v$: $t = \\dfrac{s}{v} = \\dfrac{120}{60} = 2$. Czas wynosi $2$ godziny.",
    example2:
      "Pole trójkąta wynosi $24$ cm$^2$, a wysokość $6$ cm. Ze wzoru $P = \\dfrac{a \\cdot h}{2}$ mamy $a = \\dfrac{2P}{h} = \\dfrac{2 \\cdot 24}{6} = 8$. Podstawa ma $8$ cm.",
    pitfalls:
      "* Nie dziel przez samą pierwszą literę iloczynu - dzielisz przez cały iloczyn, np. $c = \\dfrac{V}{a \\cdot b}$.\n* W polu trójkąta najpierw pomnóż przez $2$, a potem dziel przez wysokość.\n* Pamiętaj o kolejności: $b = \\dfrac{P}{2} - a$, a nie $\\dfrac{P}{2 - a}$.\n* Jednostki muszą się zgadzać - km/h i km dają godziny.\n* Nie dziel przez zero - sprawdź, czy mianownik nie jest zerem.",
    exercises:
      "1. Ze wzoru $s = v \\cdot t$ oblicz $t$ dla $s = 240$ km i $v = 80$ km/h.\n2. Pole trójkąta to $30$ cm$^2$, a podstawa $10$ cm. Oblicz wysokość.\n3. Prostokąt ma obwód $26$ cm i bok $7$ cm. Oblicz drugi bok.\n4. Prostopadłościan ma objętość $180$ cm$^3$ i krawędzie $5$ cm i $6$ cm. Oblicz trzecią krawędź.\n5. Ze wzoru $y = 3x + 4$ wyznacz $x$.\n6. Ze wzoru $P = a \\cdot b$ wyznacz $b$ i oblicz je dla $P = 48$ i $a = 8$.",
    answers:
      "1. $t = 3$ h.\n2. $h = 2 \\cdot 30 : 10 = 6$ cm.\n3. $a + b = 13$, więc $b = 6$ cm.\n4. $c = 180 : 30 = 6$ cm.\n5. $x = \\dfrac{y - 4}{3}$.\n6. $b = \\dfrac{P}{a} = 6$.",
    recap:
      "1. Co znaczy wyznaczyć wielkość ze wzoru?\n2. Jak wyznaczyć $t$ ze wzoru $s = v \\cdot t$?\n3. Jak wyznaczyć podstawę trójkąta z wzoru na pole?\n4. Dlaczego dzielimy przez cały iloczyn?\n5. Jak sprawdzić otrzymany wynik?",
    diagram:
      "s = v · t\n  ↓ : v\n t = s / v\n\nP = a·h/2\n  ↓ ·2, :h\n a = 2P / h",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "geometria",
    topic: "trojkaty",
    title: "Trójkąty - kąty, boki i pole",
    examNote:
      "Trójkąty są stałym elementem egzaminu ósmoklasisty. Trzeba obliczyć trzeci kąt, rozpoznać rodzaj trójkąta, zastosować własności trójkąta równoramiennego, sprawdzić warunek trójkąta i obliczyć pole oraz obwód. Uwaga na wysokość - musi być prostopadła do podstawy.",
    map:
      "1. Obliczysz trzeci kąt z sumy $180°$.\n2. Rozpoznasz trójkąt ostrokątny, prostokątny i rozwartokątny.\n3. Wykorzystasz równość kątów przy podstawie.\n4. Sprawdzisz, czy z odcinków można zbudować trójkąt.\n5. Obliczysz pole i obwód.",
    definitions:
      "Suma kątów wewnętrznych każdego trójkąta wynosi $180°$. Trójkąt ostrokątny ma wszystkie kąty ostre, prostokątny ma jeden kąt prosty, a rozwartokątny - jeden kąt rozwarty. Trójkąt równoboczny ma trzy boki równe i trzy kąty po $60°$. Trójkąt równoramienny ma dwa równe boki (ramiona) i równe kąty przy podstawie.\n\nWarunek trójkąta: suma długości każdych dwóch boków musi być większa od długości trzeciego boku. Pole trójkąta to $P = \\dfrac{1}{2} \\cdot a \\cdot h$, gdzie $a$ jest podstawą, a $h$ wysokością prostopadłą do niej. Obwód to suma długości boków. Kąt zewnętrzny przy wierzchołku dopełnia kąt wewnętrzny do $180°$.",
    example1:
      "Dwa kąty trójkąta mają miary $50°$ i $60°$. Trzeci kąt to $180° - 50° - 60° = 70°$. Wszystkie kąty są ostre, więc trójkąt jest ostrokątny.",
    example2:
      "Trójkąt równoramienny ma kąt między ramionami $80°$. Kąty przy podstawie są równe, a razem dają $180° - 80° = 100°$, więc każdy ma $50°$. Gdyby ramię miało $8$ cm, a podstawa $12$ cm, obwód wynosiłby $8 + 8 + 12 = 28$ cm.",
    pitfalls:
      "* Suma kątów trójkąta to $180°$, a nie $360°$.\n* Warunek trójkąta musi być ostry: $a + b > c$, a nie $a + b \\ge c$.\n* Wysokość mierzymy prostopadle do podstawy, nie wzdłuż boku.\n* W trójkącie równoramiennym równe są kąty przy podstawie, a nie przy ramionach.\n* Najdłuższy bok leży naprzeciw największego kąta.",
    exercises:
      "1. Dwa kąty trójkąta mają $35°$ i $85°$. Oblicz trzeci kąt.\n2. Kąt między ramionami trójkąta równoramiennego ma $40°$. Oblicz kąt przy podstawie.\n3. Czy z odcinków $6, 8, 15$ można zbudować trójkąt?\n4. Oblicz pole trójkąta o podstawie $12$ cm i wysokości $7$ cm.\n5. Kąt wewnętrzny trójkąta ma $65°$. Oblicz kąt zewnętrzny przy tym wierzchołku.\n6. Trójkąt równoramienny ma ramię $9$ cm i podstawę $14$ cm. Oblicz obwód.",
    answers:
      "1. $60°$.\n2. $(180° - 40°) : 2 = 70°$.\n3. Nie, bo $6 + 8 = 14 < 15$.\n4. $42$ cm$^2$.\n5. $115°$.\n6. $32$ cm.",
    recap:
      "1. Ile wynosi suma kątów trójkąta?\n2. Jakie kąty ma trójkąt rozwartokątny?\n3. Jaki warunek muszą spełniać boki trójkąta?\n4. Jak obliczyć pole trójkąta?\n5. Jak dopełniają się kąt wewnętrzny i zewnętrzny?",
    diagram:
      "        /\\\n       /  \\\n      /____\\\n   kąty: α + β + γ = 180°\n\nP = ½ · a · h\nwarunek: a + b > c",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "geometria",
    topic: "czworokaty",
    title: "Czworokąty - własności i pola",
    examNote:
      "Czworokąty łączą własności boków, kątów i przekątnych. Na egzaminie trzeba obliczyć czwarty kąt, kąt sąsiedni w równoległoboku, pole równoległoboku, trapezu lub rombu oraz obwód. Trzeba rozróżniać wysokość od boku i pamiętać, że suma kątów czworokąta wynosi $360°$.",
    map:
      "1. Obliczysz czwarty kąt czworokąta.\n2. Wykorzystasz własności równoległoboku.\n3. Obliczysz pole równoległoboku.\n4. Obliczysz pole trapezu.\n5. Obliczysz pole rombu z przekątnych.",
    definitions:
      "Suma kątów wewnętrznych czworokąta wynosi $360°$. W równoległoboku boki przeciwległe są równoległe i równe, a kąty przeciwległe są równe. Kąty sąsiednie przy tym samym boku dopełniają się do $180°$. Pole równoległoboku to $P = a \\cdot h$, gdzie $h$ jest wysokością prostopadłą do boku $a$.\n\nTrapez ma jedną parę boków równoległych. Jego pole to $P = \\dfrac{(a + b) \\cdot h}{2}$, gdzie $a$ i $b$ są długościami podstaw, a $h$ wysokością.\n\nRomb ma cztery równe boki, a jego przekątne są prostopadłe i dzielą się na połowy. Pole rombu można obliczyć jako $P = a \\cdot h$ lub $P = \\dfrac{d_1 \\cdot d_2}{2}$. Prostokąt ma cztery kąty proste, a kwadrat jest jednocześnie prostokątem i rombem.",
    example1:
      "Trapez ma podstawy $6$ cm i $10$ cm oraz wysokość $5$ cm. Pole wynosi $P = \\dfrac{(6 + 10) \\cdot 5}{2} = 40$ cm$^2$. Uwaga: wysokość to odległość między podstawami, a nie długość ramienia.",
    example2:
      "Jeden kąt równoległoboku ma $40°$. Kąt sąsiedni przy tym samym boku ma $180° - 40° = 140°$. Romb o przekątnych $6$ cm i $8$ cm ma pole $P = \\dfrac{6 \\cdot 8}{2} = 24$ cm$^2$.",
    pitfalls:
      "* W trapezie nie licz pola z ramienia zamiast wysokości.\n* W równoległoboku kąty sąsiednie dają $180°$, a nie $360°$.\n* Pole rombu z przekątnych dzielisz przez $2$.\n* Kwadrat jest szczególnym prostokątem i szczególnym rombem.\n* Suma kątów czworokąta to $360°$ - czwarty kąt obliczaj odejmowaniem od $360°$.",
    exercises:
      "1. Trzy kąty czworokąta mają $80°$, $90°$ i $100°$. Oblicz czwarty kąt.\n2. Równoległobok ma bok $9$ cm i wysokość $5$ cm. Oblicz pole.\n3. Trapez ma podstawy $7$ cm i $11$ cm oraz wysokość $6$ cm. Oblicz pole.\n4. Romb ma przekątne $10$ cm i $12$ cm. Oblicz pole.\n5. Jeden kąt równoległoboku ma $125°$. Oblicz kąt sąsiedni.\n6. Kwadrat ma obwód $40$ cm. Oblicz pole.",
    answers:
      "1. $360° - 270° = 90°$.\n2. $45$ cm$^2$.\n3. $54$ cm$^2$.\n4. $60$ cm$^2$.\n5. $55°$.\n6. Bok $10$ cm, pole $100$ cm$^2$.",
    recap:
      "1. Ile wynosi suma kątów czworokąta?\n2. Jakie kąty ma równoległobok przy jednym boku?\n3. Jak obliczyć pole trapezu?\n4. Jak obliczyć pole rombu z przekątnych?\n5. Czym różni się wysokość od boku?",
    diagram:
      "równoległobok        trapez\n  ______              ______\n /     /             /______\\\n/_____/             a         b\nP = a·h             P = (a+b)·h/2\n\nromb: P = d₁·d₂/2",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "geometria",
    topic: "wielokaty_foremne",
    title: "Wielokąty foremne - kąty i przekątne",
    examNote:
      "Wielokąt foremny ma wszystkie boki równe i wszystkie kąty równe. Na egzaminie trzeba obliczyć sumę kątów, miarę jednego kąta wewnętrznego, kąt zewnętrzny oraz liczbę przekątnych. Często trzeba też ustalić liczbę boków na podstawie podanego kąta.",
    map:
      "1. Rozpoznasz wielokąt foremny.\n2. Obliczysz sumę kątów wewnętrznych.\n3. Obliczysz miarę jednego kąta wewnętrznego.\n4. Obliczysz kąt zewnętrzny.\n5. Policzysz przekątne i ustalisz liczbę boków.",
    definitions:
      "Wielokąt foremny to wielokąt, który ma wszystkie boki równe i wszystkie kąty wewnętrzne równe. Przykładami są trójkąt równoboczny, kwadrat, pięciokąt foremny i sześciokąt foremny.\n\nSuma kątów wewnętrznych $n$-kąta wynosi $(n - 2) \\cdot 180°$. W wielokącie foremnym każdy kąt wewnętrzny ma więc miarę $\\dfrac{(n - 2) \\cdot 180°}{n}$.\n\nSuma kątów zewnętrznych każdego wielokąta wynosi $360°$, więc w wielokącie foremnym jeden kąt zewnętrzny to $\\dfrac{360°}{n}$. Kąt zewnętrzny i wewnętrzny przy tym samym wierzchołku dopełniają się do $180°$. Liczba przekątnych $n$-kąta to $\\dfrac{n(n - 3)}{2}$.",
    example1:
      "Ośmiokąt foremny ma $n = 8$. Suma kątów wewnętrznych: $(8 - 2) \\cdot 180° = 1080°$. Jeden kąt wewnętrzny: $1080° : 8 = 135°$. Kąt zewnętrzny: $360° : 8 = 45°$.",
    example2:
      "Kąt wewnętrzny pewnego wielokąta foremnego ma $144°$. Wtedy kąt zewnętrzny ma $180° - 144° = 36°$. Ponieważ $\\dfrac{360°}{n} = 36°$, otrzymujemy $n = 10$. Wielokąt ma $10$ boków.",
    pitfalls:
      "* Suma kątów to $(n - 2) \\cdot 180°$, a nie $n \\cdot 180°$.\n* Kąt zewnętrzny to $\\dfrac{360°}{n}$, a nie $\\dfrac{180°}{n}$.\n* Nie każdy wielokąt jest foremny - foremność wymaga równych boków i równych kątów.\n* Liczbę przekątnych dzielisz przez $2$, bo każda przekątna łączy dwa wierzchołki.\n* Kąt wewnętrzny i zewnętrzny dopełniają się do $180°$.",
    exercises:
      "1. Oblicz sumę kątów wewnętrznych sześciokąta.\n2. Oblicz kąt wewnętrzny pięciokąta foremnego.\n3. Oblicz kąt zewnętrzny dziesięciokąta foremnego.\n4. Ile przekątnych ma siedmiokąt?\n5. Kąt wewnętrzny wielokąta foremnego ma $150°$. Ile ma boków?\n6. Ile wynosi suma kątów zewnętrznych dowolnego wielokąta wypukłego?",
    answers:
      "1. $720°$.\n2. $108°$.\n3. $36°$.\n4. $14$.\n5. $12$.\n6. $360°$.",
    recap:
      "1. Kiedy wielokąt jest foremny?\n2. Jaki jest wzór na sumę kątów $n$-kąta?\n3. Jak obliczyć kąt wewnętrzny wielokąta foremnego?\n4. Ile wynosi suma kątów zewnętrznych?\n5. Jak obliczyć liczbę przekątnych?",
    diagram:
      "n-kąt foremny\nsuma kątów: (n-2)·180°\nkąt wewnętrzny: (n-2)·180°/n\nkąt zewnętrzny: 360°/n\nprzekątne: n(n-3)/2",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "geometria",
    topic: "twierdzenie_talesa",
    title: "Twierdzenie Talesa - proporcje odcinków",
    examNote:
      "Twierdzenie Talesa opisuje proporcję odcinków powstałych przy przecięciu ramion kąta prostymi równoległymi. Na egzaminie służy do obliczania brakującej długości oraz do zadań z cieniem i wysokością. Trzeba poprawnie dobrać odcinki odpowiadające sobie i liczyć od wierzchołka kąta.",
    map:
      "1. Rozpoznasz proste równoległe przecinające ramiona kąta.\n2. Dobierzesz odcinki odpowiadające sobie.\n3. Ułożysz proporcję.\n4. Obliczysz brakującą długość.\n5. Zastosujesz twierdzenie do cienia i wysokości.",
    definitions:
      "Jeżeli ramiona kąta przecinają proste równoległe, to odcinki wyznaczone na jednym ramieniu są proporcjonalne do odpowiadających im odcinków na drugim ramieniu. Licząc od wierzchołka, mamy $\\dfrac{a}{b} = \\dfrac{c}{d}$, gdzie $a$ i $c$ to pierwsze odcinki, a $b$ i $d$ - drugie odcinki na obu ramionach.\n\nZ proporcji wyznaczamy niewiadomą mnożeniem na krzyż: jeśli $\\dfrac{a}{b} = \\dfrac{c}{d}$, to $a \\cdot d = b \\cdot c$.\n\nTwierdzenie Talesa wykorzystujemy też do wyznaczania wysokości drzewa lub budynku na podstawie cienia. Kij i drzewo stoją pionowo, a promienie słoneczne są równoległe, więc stosunek wysokości jest równy stosunkowi długości cieni.",
    example1:
      "Na jednym ramieniu kąta, licząc od wierzchołka, odcinki mają długości $3$ i $5$, a na drugim pierwszy odcinek ma $6$. Z twierdzenia Talesa $\\dfrac{3}{5} = \\dfrac{6}{x}$. Mnożymy na krzyż: $3x = 30$, więc $x = 10$.",
    example2:
      "Kij o wysokości $1{,}5$ m rzuca cień $2$ m. Drzewo w tym samym czasie rzuca cień $12$ m. Z proporcji $\\dfrac{1{,}5}{2} = \\dfrac{h}{12}$ otrzymujemy $h = \\dfrac{1{,}5 \\cdot 12}{2} = 9$. Drzewo ma $9$ m wysokości.",
    pitfalls:
      "* Odcinki muszą być dobrane od wierzchołka kąta - pierwszy do pierwszego, drugi do drugiego.\n* Nie odwracaj proporcji tylko po jednej stronie.\n* Pamiętaj o tej samej jednostce długości.\n* Mnożenie na krzyż to $a \\cdot d = b \\cdot c$, a nie $a \\cdot b = c \\cdot d$.\n* W zadaniu z cieniem porównuj wysokość do cienia, a nie cień do wysokości po przeciwnych stronach.",
    exercises:
      "1. Odcinki na pierwszym ramieniu mają $2$ i $4$, a pierwszy odcinek na drugim ramieniu ma $5$. Oblicz drugi.\n2. Odcinki na jednym ramieniu mają $4$ i $6$, a odpowiadające im na drugim ramieniu $10$ i $x$. Oblicz $x$.\n3. Kij o wysokości $1$ m rzuca cień $1{,}5$ m. Drzewo rzuca cień $6$ m. Oblicz wysokość drzewa.\n4. Odcinek $24$ cm podziel w stosunku $1 : 3$. Oblicz dłuższą część.\n5. Odcinek $30$ cm podziel w stosunku $2 : 3$. Oblicz krótszą część.\n6. Odcinki na ramionach mają $3$ i $7$ oraz $9$ i $x$. Oblicz $x$.",
    answers:
      "1. $x = 10$.\n2. $x = 15$.\n3. $4$ m.\n4. $18$ cm.\n5. $12$ cm.\n6. $x = 21$.",
    recap:
      "1. Jak brzmi twierdzenie Talesa?\n2. Od czego zaczynamy dobieranie odcinków?\n3. Jak rozwiązujemy proporcję?\n4. Jak zastosować twierdzenie do cienia drzewa?\n5. Jak podzielić odcinek w podanym stosunku?",
    diagram:
      "      /\\\n     /  \\\n    /----\\  proste równoległe\n   /------\\\n  a/b = c/d\n\n3/5 = 6/x  →  x = 10",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "geometria_przestrzenna",
    topic: "siatki_bryl",
    title: "Siatki brył - ściany, krawędzie i pole powierzchni",
    examNote:
      "Siatka bryły to jej powierzchnia rozłożona na płaszczyźnie. Na egzaminie trzeba rozpoznać bryłę po siatce, policzyć ściany, krawędzie i wierzchołki oraz obliczyć pole powierzchni. Uwaga na krawędzie, które po złożeniu się sklejają - w siatce występują podwójnie.",
    map:
      "1. Rozpoznasz siatkę sześcianu, prostopadłościanu, graniastosłupa i ostrosłupa.\n2. Policzysz ściany, krawędzie i wierzchołki bryły.\n3. Obliczysz pole powierzchni sześcianu.\n4. Obliczysz pole powierzchni prostopadłościanu.\n5. Wykorzystasz siatkę do sprawdzenia wymiarów.",
    definitions:
      "Siatka bryły powstaje przez rozłożenie wszystkich jej ścian na płaszczyźnie. Po złożeniu siatki otrzymujemy bryłę. Siatka sześcianu składa się z sześciu jednakowych kwadratów. Siatka prostopadłościanu to sześć prostokątów, wśród których mogą być kwadraty.\n\nGraniastosłup o podstawie $n$-kąta ma $n + 2$ ścian, $2n$ wierzchołków i $3n$ krawędzi. Ostrosłup o podstawie $n$-kąta ma $n + 1$ ścian, $n + 1$ wierzchołków i $2n$ krawędzi.\n\nPole powierzchni bryły to suma pól wszystkich jej ścian. Dla sześcianu o krawędzi $a$: $P = 6a^2$. Dla prostopadłościanu o wymiarach $a$, $b$, $c$: $P = 2(ab + ac + bc)$.",
    example1:
      "Sześcian ma krawędź $4$ cm. Jego pole powierzchni to $6 \\cdot 4^2 = 6 \\cdot 16 = 96$ cm$^2$. W siatce widzimy sześć jednakowych kwadratów o boku $4$ cm.",
    example2:
      "Prostopadłościan ma wymiary $3$ cm, $4$ cm i $5$ cm. Pole powierzchni: $2(3 \\cdot 4 + 3 \\cdot 5 + 4 \\cdot 5) = 2(12 + 15 + 20) = 94$ cm$^2$. Trzy pary ścian to ściany $3 \\times 4$, $3 \\times 5$ i $4 \\times 5$.",
    pitfalls:
      "* W siatce niektóre krawędzie występują dwa razy, bo po złożeniu się sklejają.\n* Nie myl pola powierzchni z objętością - pole ma jednostkę kwadratową.\n* W prostopadłościanie uwzględnij wszystkie trzy pary ścian.\n* Siatka z sześciu kwadratów to sześcian, ale siatka z sześciu prostokątów nie musi być sześcianem.\n* Graniastosłup trójkątny ma dwie trójkątne podstawy i trzy prostokątne ściany boczne.",
    exercises:
      "1. Ile krawędzi ma graniastosłup czworokątny?\n2. Ile ścian ma ostrosłup o podstawie pięciokąta?\n3. Sześcian ma krawędź $7$ cm. Oblicz pole powierzchni.\n4. Prostopadłościan ma wymiary $2$ cm, $3$ cm i $6$ cm. Oblicz pole powierzchni.\n5. Siatka składa się z trzech prostokątów i dwóch trójkątów. Jaka to bryła?\n6. Ile wierzchołków ma graniastosłup o podstawie sześciokąta?",
    answers:
      "1. $12$.\n2. $6$.\n3. $294$ cm$^2$.\n4. $72$ cm$^2$.\n5. Graniastosłup trójkątny.\n6. $12$.",
    recap:
      "1. Czym jest siatka bryły?\n2. Z ilu kwadratów składa się siatka sześcianu?\n3. Jak obliczyć pole powierzchni sześcianu?\n4. Jak obliczyć pole powierzchni prostopadłościanu?\n5. Ile krawędzi ma graniastosłup, a ile ostrosłup o podstawie $n$-kąta?",
    diagram:
      "siatka sześcianu:        prostopadłościan:\n ┌─┬─┬─┐                 P = 2(ab+ac+bc)\n ├─┼─┼─┤\n ├─┼─┼─┤                 graniastosłup n-kątny:\n └─┴─┴─┘                 ściany n+2, krawędzie 3n",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "uklad_wspolrzednych",
    topic: "srodek_odcinka",
    title: "Środek odcinka w układzie współrzędnych",
    examNote:
      "Środek odcinka wyznaczamy jako średnią współrzędnych końców. Na egzaminie ósmoklasisty trzeba obliczyć środek na podstawie końców, znaleźć brakujący koniec, gdy dany jest środek, oraz rozpoznać środek na osi liczbowej. Kolejność współrzędnych jest zawsze taka sama: najpierw $x$, potem $y$.",
    map:
      "1. Odczytasz współrzędne punktu.\n2. Obliczysz środek odcinka ze wzoru.\n3. Wyznaczysz brakujący koniec odcinka.\n4. Obliczysz środek na osi liczbowej.\n5. Sprawdzisz wynik, licząc odległości.",
    definitions:
      "Punkt w układzie współrzędnych zapisujemy jako $(x, y)$. Pierwsza współrzędna mówi, ile przesunąć się w prawo (lub w lewo), druga - w górę (lub w dół).\n\nJeżeli $A = (x_1, y_1)$ i $B = (x_2, y_2)$, to środek odcinka $AB$ ma współrzędne $S = \\left(\\dfrac{x_1 + x_2}{2}, \\dfrac{y_1 + y_2}{2}\\right)$. Dodajemy współrzędne i dzielimy przez $2$.\n\nGdy znamy środek $S$ i jeden koniec $A$, drugi koniec obliczamy ze wzoru $B = 2S - A$, czyli $x_B = 2x_S - x_A$ oraz $y_B = 2y_S - y_A$. Na osi liczbowej środek odcinka o końcach $a$ i $b$ ma współrzędną $\\dfrac{a + b}{2}$.",
    example1:
      "Dane są $A = (-3, 2)$ i $B = (5, 6)$. Środek ma współrzędne $x = \\dfrac{-3 + 5}{2} = 1$ oraz $y = \\dfrac{2 + 6}{2} = 4$, czyli $S = (1, 4)$.",
    example2:
      "Środek odcinka $AB$ to $S = (2, 1)$, a $A = (-3, -2)$. Wtedy $B = (2 \\cdot 2 - (-3), 2 \\cdot 1 - (-2)) = (7, 4)$. Sprawdzenie: środek $A$ i $B$ to $\\left(\\dfrac{-3 + 7}{2}, \\dfrac{-2 + 4}{2}\\right) = (2, 1)$.",
    pitfalls:
      "* Nie odejmuj współrzędnych - środek to średnia, więc dodajesz i dzielisz przez $2$.\n* Pamiętaj o nawiasach przy liczbach ujemnych.\n* Nie zamieniaj miejscami $x$ i $y$.\n* Gdy szukasz końca, użyj $B = 2S - A$, a nie $S - A$.\n* Środek odcinka leży dokładnie pośrodku, więc odległości od niego do obu końców są równe.",
    exercises:
      "1. Wyznacz środek odcinka o końcach $(-2, 3)$ i $(4, 7)$.\n2. Wyznacz środek odcinka o końcach $(0, -5)$ i $(6, 1)$.\n3. Punkt $S = (3, 2)$ jest środkiem odcinka $AB$, a $A = (-1, -2)$. Wyznacz $B$.\n4. Na osi liczbowej środek odcinka o końcach $-3$ i $9$ ma współrzędną?\n5. Punkt $S = (0, 0)$ jest środkiem odcinka $AB$. Podaj $B$, gdy $A = (4, -6)$.\n6. Czy punkt $(1, 1)$ jest środkiem odcinka o końcach $(-1, -1)$ i $(3, 3)$?",
    answers:
      "1. $(1, 5)$.\n2. $(3, -2)$.\n3. $B = (7, 6)$.\n4. $3$.\n5. $B = (-4, 6)$.\n6. Tak, bo $\\dfrac{-1 + 3}{2} = 1$ i $\\dfrac{-1 + 3}{2} = 1$.",
    recap:
      "1. Jak zapisujemy współrzędne punktu?\n2. Jaki jest wzór na środek odcinka?\n3. Jak wyznaczyć brakujący koniec odcinka?\n4. Jak obliczyć środek na osi liczbowej?\n5. Jak sprawdzić poprawność wyniku?",
    diagram:
      "A(x₁,y₁)        S        B(x₂,y₂)\n  ●------------●------------●\n       S = ((x₁+x₂)/2, (y₁+y₂)/2)\n       B = 2S - A",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "statystyka",
    topic: "tabele_i_wykresy",
    title: "Tabele i wykresy - odczytywanie danych",
    examNote:
      "Tabele i wykresy są na egzaminie w prawie każdym arkuszu. Trzeba odczytać wartość, obliczyć sumę, różnicę i średnią, wskazać największą lub najmniejszą wartość oraz porównać dane z różnych dni. Liczy się uważne czytanie nagłówków, jednostek i skali.",
    map:
      "1. Odczytasz dane z tabeli i wykresu.\n2. Obliczysz sumę i różnicę wartości.\n3. Obliczysz średnią arytmetyczną.\n4. Wskażesz wartość największą i najmniejszą.\n5. Porównasz dane i wyciągniesz wniosek.",
    definitions:
      "Tabela porządkuje dane w wierszach i kolumnach. Nagłówek kolumny mówi, czego dotyczą liczby, a jednostka - w czym są wyrażone. Wykres słupkowy pokazuje wartości za pomocą wysokości słupków, a wykres kołowy - udział części w całości.\n\nSuma to wynik dodawania wszystkich wartości. Średnia arytmetyczna to suma wartości podzielona przez ich liczbę: $\\bar{x} = \\dfrac{x_1 + x_2 + \\ldots + x_n}{n}$. Różnica między największą i najmniejszą wartością to rozstęp.\n\nPorównując dane, odróżniaj pytanie \"o ile więcej\" (odejmowanie) od \"ile razy więcej\" (dzielenie). Zawsze sprawdź, czy oś pionowa zaczyna się od zera i jaka jednostka jest przy osi.",
    example1:
      "W tabeli zapisano liczbę biletów sprzedanych w czterech dniach:\n\n| Dzień | Bilety |\n| --- | --- |\n| poniedziałek | 12 |\n| wtorek | 16 |\n| środa | 10 |\n| czwartek | 14 |\n\nSuma wynosi $12 + 16 + 10 + 14 = 52$. Średnia to $52 : 4 = 13$ biletów dziennie. Najwięcej sprzedano we wtorek ($16$), a najmniej w środę ($10$).",
    example2:
      "Na wykresie słupkowym sprzedaż wynosiła: poniedziałek $8$, wtorek $12$, środa $6$. We wtorek sprzedano o $12 - 8 = 4$ więcej niż w poniedziałek. Łącznie w trzy dni sprzedano $8 + 12 + 6 = 26$. Średnia to $26 : 3$, czyli około $8{,}67$.",
    pitfalls:
      "* Nie licz średniej jako sumy - podziel sumę przez liczbę wartości.\n* \"O ile więcej\" to różnica, a \"ile razy więcej\" to iloraz.\n* Sprawdź jednostkę i skalę osi - słupek może oznaczać $2$, $5$ lub $10$ jednostek.\n* Uważaj na nagłówki kolumn - można pomylić liczbę osób z liczbą punktów.\n* Przy wykresie kołowym suma procentów wynosi $100\\%$.",
    exercises:
      "1. W tabeli są wartości: $5, 9, 7, 11$. Oblicz sumę i średnią.\n2. Sprzedaż wynosiła: poniedziałek $14$, wtorek $20$, środa $11$. O ile więcej sprzedano we wtorek niż w środę?\n3. Oblicz średnią liczb $3, 5, 7, 9$.\n4. W tabeli: $18, 12, 15, 20$. Jaka jest różnica między największą i najmniejszą wartością?\n5. W czterech dniach sprzedano $10, 12, 14, 16$ biletów. Ile średnio dziennie?\n6. Suma pięciu wartości wynosi $45$. Ile wynosi ich średnia?",
    answers:
      "1. Suma $32$, średnia $8$.\n2. $20 - 11 = 9$.\n3. $6$.\n4. $20 - 12 = 8$.\n5. $13$.\n6. $9$.",
    recap:
      "1. Jak obliczyć średnią arytmetyczną?\n2. Czym różni się pytanie \"o ile więcej\" od \"ile razy więcej\"?\n3. Na co uważać przy odczycie wykresu?\n4. Jak obliczyć różnicę między największą i najmniejszą wartością?\n5. Co mówi nagłówek kolumny w tabeli?",
    diagram:
      "tabela → wiersze i kolumny\n   ↓\nsuma, średnia, różnica\n   ↓\nwniosek\n\nśrednia = suma : liczba wartości",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "kombinatoryka",
    topic: "kombinatoryka",
    title: "Zliczanie obiektów - reguła mnożenia i kombinacje",
    examNote:
      "Zadania z kombinatoryki sprawdzają, czy umiesz policzyć liczbę możliwości bez wypisywania wszystkich. Na egzaminie ósmoklasisty trzeba zastosować regułę mnożenia, policzyć liczby lub kody bez powtórzeń oraz uściski dłoni lub wybór dwóch osób. Kluczowe jest rozstrzygnięcie, czy kolejność ma znaczenie.",
    map:
      "1. Zastosujesz regułę mnożenia.\n2. Policzysz kody i liczby bez powtórzeń.\n3. Policzysz możliwości z powtórzeniami.\n4. Rozpoznasz, kiedy kolejność nie ma znaczenia.\n5. Policzysz uściski dłoni i wybór dwóch obiektów.",
    definitions:
      "Reguła mnożenia: jeśli pierwszy wybór można wykonać na $m$ sposobów, a drugi na $n$ sposobów, to oba wybory razem można wykonać na $m \\cdot n$ sposobów.\n\nTworząc ciąg bez powtórzeń z $n$ elementów, pierwszy element wybieramy na $n$ sposobów, drugi na $n - 1$, trzeci na $n - 2$ itd. Na przykład trzyliterowy kod z czterech liter bez powtórzeń: $4 \\cdot 3 \\cdot 2 = 24$.\n\nGdy kolejność nie ma znaczenia, dzielimy przez liczbę ustawień wybranych elementów. Liczba uścisków dłoni między $n$ osobami to $\\dfrac{n(n - 1)}{2}$, bo każdy uścisk policzylibyśmy dwa razy. Liczba sposobów wyboru dwóch książek z $n$ to również $\\dfrac{n(n - 1)}{2}$.",
    example1:
      "Restauracja oferuje $3$ zupy i $4$ dania główne. Zestaw złożony z zupy i dania można wybrać na $3 \\cdot 4 = 12$ sposobów.",
    example2:
      "Na powitanie $5$ osób wita się każda z każdą. Pierwsza osoba wita $4$ osoby, druga $4$, ale każdy uścisk liczymy podwójnie. Liczba uścisków to $\\dfrac{5 \\cdot 4}{2} = 10$. Trzyliterowe kody z $4$ liter bez powtórzeń: $4 \\cdot 3 \\cdot 2 = 24$.",
    pitfalls:
      "* Nie dodawaj liczby możliwości, gdy wybory są niezależne - mnóż je.\n* Sprawdź, czy elementy mogą się powtarzać.\n* Gdy kolejność nie ma znaczenia, nie zapomnij podzielić przez $2$ (dla dwóch elementów).\n* Nie licz tej samej pary dwa razy.\n* Uważaj na zero na początku kodu lub liczby.",
    exercises:
      "1. Ile zestawów złożonych z $2$ zup i $5$ dań można wybrać?\n2. Ile liczb dwucyfrowych bez powtórzeń można utworzyć z cyfr $1, 2, 3, 4$?\n3. Ile trzyliterowych kodów bez powtórzeń można utworzyć z $5$ liter?\n4. Ile uścisków dłoni wymieni $6$ osób?\n5. Ile liczb dwucyfrowych z powtórzeniami można utworzyć z cyfr $1, 2, 3$?\n6. Na ile sposobów można wybrać $2$ książki z $6$?",
    answers:
      "1. $10$.\n2. $4 \\cdot 3 = 12$.\n3. $5 \\cdot 4 \\cdot 3 = 60$.\n4. $\\dfrac{6 \\cdot 5}{2} = 15$.\n5. $3 \\cdot 3 = 9$.\n6. $\\dfrac{6 \\cdot 5}{2} = 15$.",
    recap:
      "1. Jak działa reguła mnożenia?\n2. Ile możliwości daje ciąg bez powtórzeń?\n3. Kiedy dzielimy przez $2$?\n4. Czym różni się wybór z powtórzeniami od wyboru bez powtórzeń?\n5. Jak policzyć uściski dłoni?",
    diagram:
      "reguła mnożenia: m · n\n\nbez powtórzeń: n·(n-1)·(n-2)…\nkolejność bez znaczenia: :2\n\n5 osób → 5·4/2 = 10 uścisków",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "zadania_tekstowe",
    topic: "zadania_na_dowodzenie",
    title: "Zadania na dowodzenie - parzystość i podzielność",
    examNote:
      "Zadania na dowodzenie wymagają uzasadnienia, że coś zachodzi zawsze, a nie tylko w przykładzie. Na egzaminie ósmoklasisty pojawiają się proste dowody o parzystości, podzielności i sumach kolejnych liczb. Wystarczy zapisać liczby w postaci $2k$ lub $2k + 1$, przekształcić wyrażenie i pokazać jego budowę.",
    map:
      "1. Zapiszesz liczbę parzystą i nieparzystą ogólnie.\n2. Zapiszesz kolejne liczby całkowite.\n3. Przekształcisz wyrażenie algebraicznie.\n4. Wskażesz wspólny czynnik lub resztę.\n5. Uzasadnisz tezę dla wszystkich liczb.",
    definitions:
      "Liczba parzysta ma postać $2k$, gdzie $k$ jest liczbą całkowitą. Liczba nieparzysta ma postać $2k + 1$. Kolejne liczby całkowite to $n$, $n + 1$, $n + 2$.\n\nPodzielność przez $d$ oznacza, że liczbę można zapisać jako $d \\cdot k$, gdzie $k$ jest liczbą całkowitą. Na przykład $3(n + 1)$ jest podzielne przez $3$, bo ma czynnik $3$.\n\nW dowodzie wychodzimy od założenia, wykonujemy przekształcenia i dochodzimy do tezy. Sam przykład nie jest dowodem - trzeba uzasadnić, że własność zachodzi dla każdej liczby spełniającej założenie.",
    example1:
      "Wykażemy, że suma trzech kolejnych liczb całkowitych jest podzielna przez $3$. Niech to będą $n$, $n + 1$, $n + 2$. Suma wynosi $n + (n + 1) + (n + 2) = 3n + 3 = 3(n + 1)$. Wynik ma czynnik $3$, więc dzieli się przez $3$ dla każdej liczby całkowitej $n$.",
    example2:
      "Wykażemy, że kwadrat liczby nieparzystej jest nieparzysty. Niech $n = 2k + 1$. Wtedy $n^2 = (2k + 1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$. Otrzymaliśmy postać $2m + 1$, więc $n^2$ jest nieparzysta.",
    pitfalls:
      "* Jeden przykład nie wystarcza - trzeba uzasadnić dla dowolnego $n$.\n* Pamiętaj o nawiasach przy podnoszeniu do kwadratu: $(2k + 1)^2$, a nie $2k^2 + 1$.\n* Nie zakładaj tezy - wychodź od założenia.\n* Sprawdź, czy każdy przekształcony składnik ma ten sam czynnik.\n* Liczba $0$ jest parzysta i dzieli się przez każdą liczbę różną od zera, o czym czasem trzeba pamiętać.",
    exercises:
      "1. Wykaż, że suma dwóch liczb parzystych jest parzysta.\n2. Wykaż, że iloczyn dwóch kolejnych liczb całkowitych jest parzysty.\n3. Wykaż, że różnica kwadratów dwóch kolejnych liczb całkowitych jest nieparzysta.\n4. Zapisz liczbę nieparzystą w postaci ogólnej.\n5. Wykaż, że liczba $5n + 10$ jest podzielna przez $5$.\n6. Czy liczba $2n + 1$ może być parzysta? Uzasadnij.",
    answers:
      "1. $2a + 2b = 2(a + b)$ - liczba parzysta.\n2. Jedna z dwóch kolejnych liczb jest parzysta, więc iloczyn jest parzysty.\n3. $(n + 1)^2 - n^2 = 2n + 1$ - liczba nieparzysta.\n4. $2k + 1$, gdzie $k$ jest całkowite.\n5. $5n + 10 = 5(n + 2)$.\n6. Nie, bo $2n$ jest parzysta, a dodanie $1$ daje liczbę nieparzystą.",
    recap:
      "1. Jak zapisać liczbę parzystą, a jak nieparzystą?\n2. Jak zapisać trzy kolejne liczby całkowite?\n3. Co to znaczy, że liczba jest podzielna przez $d$?\n4. Dlaczego przykład nie jest dowodem?\n5. Jak uzasadnić parzystość sumy lub iloczynu?",
    diagram:
      "założenie → przekształcenia → teza\n\nparzysta: 2k\nnieparzysta: 2k+1\nkolejne: n, n+1, n+2\n\nn+(n+1)+(n+2) = 3(n+1)",
  }),
];

