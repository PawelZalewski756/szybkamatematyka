import { buildLesson, type AdditionalMaterial } from "@/lib/trening/seed/additional-materials";

export const E8_COVERAGE_MATERIALS: AdditionalMaterial[] = [
  buildLesson({
    exam_type: "8_klasa",
    category: "liczby",
    topic: "notacja_wykladnicza",
    title: "Notacja wykładnicza - duże i małe liczby",
    examNote:
      "Notacja wykładnicza jest wymagana na egzaminie ósmoklasisty od 2025 roku. Pozwala zapisywać bardzo duże i bardzo małe liczby w postaci $a\\cdot10^n$, gdzie $1\\le a<10$, a $n$ jest liczbą całkowitą. Na egzaminie trzeba zamieniać zapis w obie strony i porównywać takie liczby.",
    map:
      "1. Rozpoznasz postać $a\\cdot10^n$.\n2. Zamienisz liczbę na notację wykładniczą.\n3. Zamienisz notację na zwykły zapis.\n4. Pomnożysz i podzielisz liczby w notacji.\n5. Porównasz liczby zapisane wykładniczo.",
    definitions:
      "Notacja wykładnicza ma postać $a\\cdot10^n$, gdzie $1\\le a<10$ i $n\\in\\mathbb{Z}$. Na przykład $3200=3{,}2\\cdot10^3$, a $0{,}0045=4{,}5\\cdot10^{-3}$.\n\nPrzy mnożeniu mnożymy współczynniki i dodajemy wykładniki: $(a\\cdot10^m)(b\\cdot10^n)=ab\\cdot10^{m+n}$. Przy dzieleniu dzielimy współczynniki i odejmujemy wykładniki. Jeśli współczynnik wypada poza przedział $[1,10)$, przesuwamy przecinek i korygujemy wykładnik.",
    example1:
      "Zapisz $0{,}00072$ w notacji wykładniczej. Przesuwamy przecinek o $4$ miejsca w prawo, otrzymując $7{,}2$, więc $0{,}00072=7{,}2\\cdot10^{-4}$.",
    example2:
      "Oblicz $(2\\cdot10^3)\\cdot(3\\cdot10^4)$. Mnożymy $2\\cdot3=6$ i dodajemy wykładniki $3+4=7$. Wynik to $6\\cdot10^7$, czyli $60\\,000\\,000$.",
    pitfalls:
      "* Współczynnik musi być od $1$ do $10$ (mniejszy od $10$).\n* Przy przesuwaniu przecinka w lewo wykładnik rośnie, w prawo maleje.\n* $10^0=1$, a $10^{-1}=0{,}1$.\n* Przy mnożeniu nie mnożymy wykładników, tylko je dodajemy.\n* Uważaj na znak wykładnika przy bardzo małych liczbach.",
    exercises:
      "1. Zapisz $4500$ w notacji wykładniczej.\n2. Zapisz $0{,}00031$ w notacji wykładniczej.\n3. Zamień $5{,}6\\cdot10^4$ na zwykły zapis.\n4. Oblicz $(4\\cdot10^2)\\cdot(2\\cdot10^5)$.\n5. Oblicz $\\frac{8\\cdot10^6}{2\\cdot10^3}$.\n6. Porównaj $3\\cdot10^5$ i $2{,}9\\cdot10^5$.",
    answers:
      "1. $4{,}5\\cdot10^3$.\n2. $3{,}1\\cdot10^{-4}$.\n3. $56\\,000$.\n4. $8\\cdot10^7$.\n5. $4\\cdot10^3$.\n6. $3\\cdot10^5$ jest większe.",
    recap:
      "1. Jaki warunek spełnia współczynnik w notacji wykładniczej?\n2. Jak zapisać bardzo małą liczbę?\n3. Co robimy z wykładnikami przy mnożeniu?\n4. Co robimy z wykładnikami przy dzieleniu?\n5. Jak porównać dwie liczby w notacji?",
    diagram:
      "liczba → a·10^n\n  1 ≤ a < 10\n  duża: n > 0\n  mała: n < 0\nmnożenie: dodaj wykładniki\ndzielenie: odejmij wykładniki",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    topic: "czas_droga_predkosc",
    title: "Czas, droga i prędkość",
    examNote:
      "Zadania o ruchu są stałym elementem egzaminu ósmoklasisty. Trzeba swobodnie korzystać ze wzoru $s=v\\cdot t$ i przekształcać go w obie strony. Często trzeba zamienić jednostki: minuty na godziny albo km/h na m/s.",
    map:
      "1. Rozpoznasz wielkości: droga, prędkość, czas.\n2. Użyjesz wzoru $s=v\\cdot t$.\n3. Przekształcisz wzór na $v$ lub $t$.\n4. Zamienisz jednostki czasu i prędkości.\n5. Rozwiążesz zadanie z dwoma etapami ruchu.",
    definitions:
      "$s$ oznacza drogę, $v$ - prędkość, a $t$ - czas. Podstawowy wzór to $s=v\\cdot t$. Wynikają z niego $v=\\frac{s}{t}$ oraz $t=\\frac{s}{v}$.\n\nJeśli prędkość jest w km/h, to czas trzeba podać w godzinach. Zamiana: $1$ h $=60$ min, $1$ min $=\\frac1{60}$ h. Zamiana km/h na m/s: dzielimy przez $3{,}6$. Zamiana m/s na km/h: mnożymy przez $3{,}6$.",
    example1:
      "Samochód jedzie $120$ km w $2$ godziny. Prędkość wynosi $v=\\frac{120}{2}=60$ km/h. Gdyby jechał $90$ km/h, czas wyniósłby $t=\\frac{120}{90}=\\frac43$ h, czyli $1$ h $20$ min.",
    example2:
      "Rowerzysta jedzie $15$ km/h przez $20$ minut. Zamieniamy czas: $20$ min $=\\frac{20}{60}=\\frac13$ h. Droga to $s=15\\cdot\\frac13=5$ km.",
    pitfalls:
      "* Nie mieszaj godzin i minut w jednym obliczeniu.\n* Prędkość średnia to cała droga podzielona przez cały czas, a nie średnia prędkości.\n* $1$ km/h to około $0{,}278$ m/s, a nie $3{,}6$ m/s.\n* Przy dwóch etapach dodaj drogi i czasy, a nie prędkości.\n* Jednostka wyniku musi pasować do jednostek danych.",
    exercises:
      "1. Oblicz prędkość: $180$ km w $3$ h.\n2. Oblicz drogę: $60$ km/h przez $2{,}5$ h.\n3. Oblicz czas: $240$ km przy $80$ km/h.\n4. Zamień $72$ km/h na m/s.\n5. Ile to $45$ minut w godzinach?\n6. Rowerzysta jedzie $12$ km/h przez $25$ min. Oblicz drogę.",
    answers:
      "1. $60$ km/h.\n2. $150$ km.\n3. $3$ h.\n4. $20$ m/s.\n5. $0{,}75$ h.\n6. $5$ km.",
    recap:
      "1. Jaki jest wzór na drogę?\n2. Jak obliczyć prędkość?\n3. Jak obliczyć czas?\n4. Jak zamienić km/h na m/s?\n5. Dlaczego przy dwóch etapach nie uśredniamy prędkości?",
    diagram:
      "s = v · t\n  ↙    ↘\nv = s/t  t = s/v\njednostki:\nkm/h ↔ m/s  (÷ lub × 3,6)\nmin → h  (÷ 60)",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "obliczenia_praktyczne",
    topic: "jednostki_i_pieniadze",
    title: "Jednostki, czas i pieniądze",
    examNote:
      "Zadania praktyczne łączą zamianę jednostek z obliczeniami pieniężnymi. Na egzaminie trzeba przeliczyć długość, masę, czas i pojemność, a potem policzyć koszt, resztę albo cenę za jednostkę. Uwaga na jednostki w odpowiedzi i zaokrąglanie do groszy.",
    map:
      "1. Zamienisz jednostki długości, masy i czasu.\n2. Obliczysz koszt zakupów.\n3. Obliczysz resztę i cenę za jednostkę.\n4. Zastosujesz procenty do ceny.\n5. Zapisz wynik z właściwą jednostką.",
    definitions:
      "Długość: $1$ km $=1000$ m, $1$ m $=100$ cm, $1$ cm $=10$ mm. Masa: $1$ kg $=1000$ g, $1$ t $=1000$ kg. Czas: $1$ h $=60$ min, $1$ min $=60$ s. Pojemność: $1$ l $=1000$ ml.\n\nKoszt to cena jednostkowa pomnożona przez liczbę jednostek. Reszta to kwota zapłacona minus koszt. Cena za kilogram to koszt podzielony przez masę w kilogramach. Procent ceny obliczamy, mnożąc cenę przez procent zapisany jako ułamek.",
    example1:
      "Kupiono $2{,}5$ kg jabłek po $4{,}80$ zł za kilogram. Koszt to $2{,}5\\cdot4{,}80=12$ zł. Przy płatności $20$ zł reszta wynosi $8$ zł.",
    example2:
      "Film trwał $1$ h $45$ min, czyli $105$ min. Jeśli zaczął się o $18{:}20$, to skończył się o $20{:}05$, bo $18{:}20+1$ h $=19{:}20$, a $19{:}20+45$ min $=20{:}05$.",
    pitfalls:
      "* Nie mieszaj gramów i kilogramów w jednym działaniu.\n* $1$ t to $1000$ kg, a nie $100$ kg.\n* Przy dodawaniu czasu pamiętaj, że godzina ma $60$ minut.\n* Cena za kilogram wymaga masy w kilogramach.\n* Zaokrąglaj pieniądze do groszy dopiero na końcu.",
    exercises:
      "1. Zamień $3{,}2$ kg na gramy.\n2. Zamień $2$ m $35$ cm na centymetry.\n3. Ile minut ma $2$ h $15$ min?\n4. Kupiono $3$ zeszyty po $4{,}50$ zł. Ile zapłacono?\n5. Zapłacono $50$ zł za zakupy za $37{,}20$ zł. Ile wynosi reszta?\n6. $1{,}5$ kg bananów kosztuje $9$ zł. Jaka jest cena za kilogram?",
    answers:
      "1. $3200$ g.\n2. $235$ cm.\n3. $135$ min.\n4. $13{,}50$ zł.\n5. $12{,}80$ zł.\n6. $6$ zł/kg.",
    recap:
      "1. Ile gramów ma kilogram?\n2. Ile centymetrów ma metr?\n3. Ile minut ma godzina?\n4. Jak obliczyć resztę?\n5. Jak obliczyć cenę za kilogram?",
    diagram:
      "jednostki\n  długość: km m cm mm\n  masa: t kg g\n  czas: h min s\n  pojemność: l ml\n       ↓\nkoszt = cena × ilość\nreszta = zapłata - koszt",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "zadania_tekstowe",
    topic: "zadania_tekstowe",
    title: "Zadania tekstowe z treścią",
    examNote:
      "Zadania tekstowe sprawdzają, czy uczeń potrafi wybrać dane, ułożyć plan i połączyć różne działy. Na egzaminie ósmoklasisty są to często zadania otwarte na 2-3 punkty. Trzeba zapisać obliczenia, a nie tylko wynik, i sprawdzić, czy odpowiedź ma sens.",
    map:
      "1. Przeczytasz treść i wypiszesz dane.\n2. Ustalasz, czego szukasz.\n3. Wybierzesz działania i ułożysz plan.\n4. Wykonasz obliczenia krok po kroku.\n5. Sprawdzisz wynik i zapiszesz odpowiedź.",
    definitions:
      "W zadaniu tekstowym ważne jest rozróżnienie danych, szukanej i warunków. Często trzeba oznaczyć niewiadomą literą i zapisać równanie. Jednostki muszą być spójne. Jeśli zadanie ma kilka etapów, zapisuj wyniki pośrednie, bo za nie również są punkty.\n\nSchemat: dane, szukane, plan, obliczenia, sprawdzenie, odpowiedź. Przy zadaniach o procentach, ruchu i geometrii warto najpierw zapisać wzór, a dopiero potem podstawić liczby.",
    example1:
      "Ola ma $120$ zł. Kupiła $3$ książki po $24$ zł i notes za $12$ zł. Ile jej zostało? Koszt książek to $3\\cdot24=72$ zł, razem z notesem $72+12=84$ zł. Reszta wynosi $120-84=36$ zł.",
    example2:
      "Prostokątny ogród ma wymiary $8$ m i $12$ m. Ile metrów siatki potrzeba na ogrodzenie, jeśli brama ma $2$ m szerokości? Obwód wynosi $2(8+12)=40$ m. Od obwodu odejmujemy bramę: $40-2=38$ m siatki.",
    pitfalls:
      "* Nie odpowiadaj tylko liczbą, jeśli zadanie wymaga obliczeń.\n* Sprawdź, czy wszystkie jednostki są takie same.\n* Nie odejmuj bramy od pola, tylko od obwodu.\n* Przy procentach uważaj, od jakiej liczby liczysz procent.\n* Wynik musi być sensowny w kontekście zadania.",
    exercises:
      "1. Ania ma $150$ zł. Kupiła $4$ bilety po $25$ zł. Ile jej zostało?\n2. Prostokąt ma boki $7$ cm i $9$ cm. Oblicz obwód i pole.\n3. W klasie jest $28$ uczniów, $25\\%$ to chłopcy. Ilu chłopców jest w klasie?\n4. Samochód przejechał $180$ km w $2{,}5$ h. Oblicz prędkość.\n5. Ogród ma $10$ m na $15$ m. Ile metrów siatki potrzeba na ogrodzenie bez bramy?\n6. Książka kosztowała $40$ zł, a po obniżce $32$ zł. O ile procent obniżono cenę?",
    answers:
      "1. $50$ zł.\n2. Obwód $32$ cm, pole $63$ cm$^2$.\n3. $7$ chłopców.\n4. $72$ km/h.\n5. $50$ m.\n6. O $20\\%$.",
    recap:
      "1. Jakie etapy ma dobre rozwiązanie zadania tekstowego?\n2. Dlaczego trzeba zapisywać obliczenia pośrednie?\n3. Jak sprawdzić sensowność wyniku?\n4. Co zrobić, gdy w zadaniu są różne jednostki?\n5. Jak oznaczyć niewiadomą?",
    diagram:
      "treść\n ↓\ndane + szukane\n ↓\nplan / wzór\n ↓\nobliczenia krok po kroku\n ↓\nsprawdzenie\n ↓\nodpowiedź z jednostką",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "geometria",
    topic: "symetralna_i_dwusieczna",
    title: "Symetralna odcinka i dwusieczna kąta",
    examNote:
      "Symetralna odcinka i dwusieczna kąta to konstrukcje geometryczne wymagane od 2025 roku. Na egzaminie trzeba znać ich własności: symetralna jest zbiorem punktów jednakowo odległych od końców odcinka, a dwusieczna dzieli kąt na dwa równe kąty.",
    map:
      "1. Rozpoznasz symetralną odcinka.\n2. Wykorzystasz równość odległości od końców.\n3. Rozpoznasz dwusieczną kąta.\n4. Wykorzystasz równość kątów.\n5. Wskażesz przecięcie symetralnych i dwusiecznych.",
    definitions:
      "Symetralna odcinka $AB$ to prosta prostopadła do $AB$ przechodząca przez jego środek. Każdy punkt symetralnej jest jednakowo odległy od $A$ i $B$. Odwrotnie, jeśli punkt jest jednakowo odległy od $A$ i $B$, to leży na symetralnej.\n\nDwusieczna kąta to półprosta wychodząca z wierzchołka i dzieląca kąt na dwa kąty równej miary. Każdy punkt dwusiecznej jest jednakowo odległy od ramion kąta. W trójkącie dwusieczna dzieli przeciwległy bok proporcjonalnie do długości boków tworzących kąt.",
    example1:
      "Odcinek $AB$ ma długość $10$ cm. Symetralna przechodzi przez jego środek, więc dzieli go na dwa odcinki po $5$ cm. Punkt $P$ leży na symetralnej, więc $|PA|=|PB|$.",
    example2:
      "Kąt ma miarę $80^\\circ$. Dwusieczna dzieli go na dwa kąty po $40^\\circ$. Jeśli punkt $P$ leży na dwusiecznej, to jego odległości od obu ramion kąta są równe.",
    pitfalls:
      "* Symetralna jest prostopadła do odcinka, a nie równoległa.\n* Symetralna przechodzi przez środek odcinka.\n* Dwusieczna wychodzi z wierzchołka kąta.\n* Nie myl symetralnej z wysokością trójkąta.\n* Środek okręgu opisanego to przecięcie symetralnych, a wpisanego - dwusiecznych.",
    exercises:
      "1. Odcinek ma $14$ cm. Jakie odcinki wyznacza symetralna?\n2. Punkt $P$ leży na symetralnej $AB$ i $|PA|=7$ cm. Ile wynosi $|PB|$?\n3. Kąt $120^\\circ$ dzieli dwusieczna. Podaj miary kątów.\n4. Kąt $90^\\circ$ dzieli dwusieczna. Podaj miary kątów.\n5. Gdzie leży środek okręgu opisanego na trójkącie?\n6. Gdzie leży środek okręgu wpisanego w trójkąt?",
    answers:
      "1. Dwa odcinki po $7$ cm.\n2. $7$ cm.\n3. Po $60^\\circ$.\n4. Po $45^\\circ$.\n5. W przecięciu symetralnych boków.\n6. W przecięciu dwusiecznych kątów.",
    recap:
      "1. Czym jest symetralna odcinka?\n2. Jaką własność mają punkty symetralnej?\n3. Czym jest dwusieczna kąta?\n4. Jaką własność mają punkty dwusiecznej?\n5. Co to jest środek okręgu wpisanego i opisanego?",
    diagram:
      "symetralna: ⊥ przez środek\n   |PA| = |PB|\ndwusieczna: dzieli kąt na pół\n   odległości od ramion równe\nprzecięcia:\n symetralne → okrąg opisany\ndwusieczne → okrąg wpisany",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "geometria",
    topic: "wielokaty",
    title: "Wielokąty i wielokąty foremne",
    examNote:
      "Wielokąty pojawiają się w zadaniach o polach, obwodach, przekątnych i kątach. Na egzaminie ósmoklasisty trzeba znać wzory na pole trójkąta, prostokąta, równoległoboku, rombu i trapezu oraz umieć obliczyć kąty wielokąta foremnego.",
    map:
      "1. Rozpoznasz wielokąty i ich nazwy.\n2. Obliczysz sumę kątów wewnętrznych.\n3. Obliczysz miarę kąta wielokąta foremnego.\n4. Policzysz liczbę przekątnych.\n5. Obliczysz pola i obwody.",
    definitions:
      "Wielokąt foremny ma wszystkie boki równe i wszystkie kąty równe. Suma kątów wewnętrznych $n$-kąta wynosi $(n-2)\\cdot180^\\circ$. W wielokącie foremnym każdy kąt ma miarę $\\frac{(n-2)\\cdot180^\\circ}{n}$.\n\nLiczba przekątnych $n$-kąta to $\\frac{n(n-3)}{2}$. Pola: trójkąt $\\frac12ah$, prostokąt $ab$, równoległobok $ah$, romb $\\frac12d_1d_2$, trapez $\\frac12(a+b)h$. Obwód to suma długości boków.",
    example1:
      "Sześciokąt foremny ma $n=6$. Suma kątów wynosi $(6-2)\\cdot180^\\circ=720^\\circ$, a każdy kąt ma $720^\\circ:6=120^\\circ$. Liczba przekątnych to $\\frac{6\\cdot3}{2}=9$.",
    example2:
      "Trapez ma podstawy $6$ cm i $10$ cm oraz wysokość $4$ cm. Pole wynosi $\\frac12(6+10)\\cdot4=32$ cm$^2$. Obwód to suma wszystkich czterech boków, więc potrzebujemy jeszcze długości ramion.",
    pitfalls:
      "* Suma kątów zależy od liczby boków, a nie od długości.\n* W wielokącie foremnym wszystkie kąty są równe.\n* Przekątna nie może być bokiem.\n* Pole trapezu wymaga średniej arytmetycznej podstaw.\n* Nie myl obwodu z polem i jednostek liniowych z kwadratowymi.",
    exercises:
      "1. Oblicz sumę kątów pięciokąta.\n2. Oblicz miarę kąta sześciokąta foremnego.\n3. Ile przekątnych ma ośmiokąt?\n4. Oblicz pole trapezu o podstawach $4$ i $8$ oraz wysokości $5$.\n5. Oblicz pole rombu o przekątnych $6$ i $8$.\n6. Oblicz obwód trójkąta o bokach $3,4,5$.",
    answers:
      "1. $540^\\circ$.\n2. $120^\\circ$.\n3. $20$.\n4. $30$.\n5. $24$.\n6. $12$.",
    recap:
      "1. Jaki wzór daje sumę kątów $n$-kąta?\n2. Jaki wzór daje miarę kąta wielokąta foremnego?\n3. Jak policzyć przekątne?\n4. Jaki jest wzór na pole trapezu?\n5. Czym różni się pole od obwodu?",
    diagram:
      "n-kąt\n  ↓\nsuma kątów (n-2)·180°\n  ↓\nforemny: kąt = suma/n\n  ↓\nprzekątne n(n-3)/2\n  ↓\npola: trójkąt, prostokąt, trapez, romb",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "geometria",
    topic: "proste_i_odcinki",
    title: "Proste, półproste i odcinki",
    examNote:
      "Podstawowe pojęcia geometryczne pojawiają się w każdym zadaniu z geometrii. Na egzaminie trzeba rozróżniać prostą, półprostą i odcinek, rozpoznawać proste prostopadłe i równoległe oraz rozumieć odległość punktu od prostej.",
    map:
      "1. Rozróżnisz prostą, półprostą i odcinek.\n2. Rozpoznasz proste równoległe i prostopadłe.\n3. Wyznaczysz środek odcinka.\n4. Obliczysz odległość punktu od prostej.\n5. Zaznaczysz punkty na prostej.",
    definitions:
      "Prosta nie ma początku ani końca. Półprosta ma początek, ale nie ma końca. Odcinek ma dwa końce i skończoną długość. Dwie proste mogą być równoległe (nie mają punktów wspólnych) albo przecinać się w jednym punkcie.\n\nProste prostopadłe przecinają się pod kątem $90^\\circ$. Odległość punktu od prostej to długość najkrótszego odcinka łączącego punkt z prostą, czyli odcinka prostopadłego. Środek odcinka dzieli go na dwie równe części.",
    example1:
      "Odcinek $AB$ ma $12$ cm. Jego środek $M$ dzieli go na dwa odcinki po $6$ cm, więc $|AM|=|MB|=6$ cm.",
    example2:
      "Punkt $P$ leży w odległości $3$ cm od prostej. Najkrótszy odcinek łączący $P$ z prostą ma długość $3$ cm i jest prostopadły do prostej. Każdy inny odcinek będzie dłuższy.",
    pitfalls:
      "* Prosta nie ma końca, a odcinek ma dwa końce.\n* Półprosta ma tylko jeden koniec.\n* Odległość punktu od prostej mierzy się po prostopadłej.\n* Proste równoległe nie przecinają się.\n* Dwie proste prostopadłe tworzą cztery kąty proste.",
    exercises:
      "1. Ile końców ma półprosta?\n2. Ile końców ma odcinek?\n3. Odcinek ma $18$ cm. Jaką długość ma każda połowa?\n4. Pod jakim kątem przecinają się proste prostopadłe?\n5. Czy proste równoległe mają punkt wspólny?\n6. Punkt jest oddalony od prostej o $5$ cm. Jaką długość ma najkrótszy odcinek do prostej?",
    answers:
      "1. Jeden.\n2. Dwa.\n3. $9$ cm.\n4. $90^\\circ$.\n5. Nie.\n6. $5$ cm.",
    recap:
      "1. Czym różni się prosta od półprostej?\n2. Czym różni się półprosta od odcinka?\n3. Kiedy proste są równoległe?\n4. Kiedy proste są prostopadłe?\n5. Jak mierzymy odległość punktu od prostej?",
    diagram:
      "prosta  ←────────→\npółprosta •────────→\nodcinek  •────────•\nrównoległe: ||\nprostopadłe: ⊥ (90°)\nodległość: najkrótszy ⊥",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "uklad_wspolrzednych",
    topic: "os_liczbowa",
    title: "Oś liczbowa - zaznaczanie i odległość",
    examNote:
      "Oś liczbowa pojawia się w zadaniach o liczbach całkowitych, ułamkach i odległości. Na egzaminie trzeba zaznaczyć liczbę, porównać położenie, obliczyć odległość między punktami i wyznaczyć środek odcinka.",
    map:
      "1. Zaznaczysz liczbę na osi.\n2. Porównasz położenie liczb.\n3. Obliczysz odległość między punktami.\n4. Wyznaczysz środek odcinka.\n5. Zaznaczysz przedział na osi.",
    definitions:
      "Oś liczbowa to prosta z zaznaczonym punktem zerowym, jednostką i kierunkiem. Liczby dodatnie leżą po prawej stronie zera, a ujemne po lewej. Im dalej w prawo, tym liczba większa.\n\nOdległość między liczbami $a$ i $b$ na osi wynosi $|a-b|$. Środek odcinka o końcach $a$ i $b$ ma współrzędną $\\frac{a+b}{2}$. Liczba przeciwna do $a$ to $-a$; leży po drugiej stronie zera w tej samej odległości.",
    example1:
      "Odległość między $-3$ i $5$ wynosi $|5-(-3)|=|8|=8$. Środek tego odcinka ma współrzędną $\\frac{-3+5}{2}=1$.",
    example2:
      "Na osi zaznaczono przedział $(-2,4]$. Liczba $-2$ nie należy do przedziału, a $4$ należy. Liczby z tego przedziału spełniają $-2<x\\le4$.",
    pitfalls:
      "* Odległość jest zawsze nieujemna.\n* Przy odejmowaniu liczby ujemnej zmienia się znak: $5-(-3)=8$.\n* Środek to średnia arytmetyczna końców.\n* Liczba przeciwna do $-4$ to $4$.\n* Na osi nie ma przerw między liczbami rzeczywistymi.",
    exercises:
      "1. Oblicz odległość między $-4$ i $6$.\n2. Oblicz środek odcinka o końcach $-2$ i $8$.\n3. Podaj liczbę przeciwną do $-7$.\n4. Która liczba jest większa: $-5$ czy $-2$?\n5. Zaznacz przedział $[1,4)$ i podaj, czy $4$ należy.\n6. Oblicz odległość między $0$ i $-3$.",
    answers:
      "1. $10$.\n2. $3$.\n3. $7$.\n4. $-2$.\n5. $4$ nie należy.\n6. $3$.",
    recap:
      "1. Po której stronie zera leżą liczby ujemne?\n2. Jak obliczyć odległość między liczbami?\n3. Jak wyznaczyć środek odcinka?\n4. Co to jest liczba przeciwna?\n5. Co oznaczają nawiasy przedziału?",
    diagram:
      "←───┼───┼───┼───┼───→\n   -3  -2  -1   0   1\nodległość |a-b|\nśrodek (a+b)/2\nprzedział: [ ] lub ( )",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "liczby",
    topic: "system_rzymski",
    title: "System rzymski - zapis i odczyt liczb",
    examNote:
      "System rzymski pojawia się w zadaniach o liczbach i w sytuacjach praktycznych, np. przy zapisie roku, wieku lub numeru rozdziału. Na egzaminie trzeba odczytać liczbę zapisaną cyframi rzymskimi i zapisać liczbę arabską w tym systemie, pamiętając o zasadzie odejmowania.",
    map:
      "1. Rozpoznasz symbole rzymskie i ich wartości.\n2. Odczytasz liczbę zapisaną cyframi rzymskimi.\n3. Zapiszesz liczbę arabską cyframi rzymskimi.\n4. Zastosujesz zasadę odejmowania.\n5. Unikniesz niedozwolonych powtórzeń.",
    definitions:
      "Symbole rzymskie: $I=1$, $V=5$, $X=10$, $L=50$, $C=100$, $D=500$, $M=1000$. Zapis czytamy od lewej do prawej, dodając wartości. Jeśli mniejsza wartość stoi przed większą, odejmujemy ją, np. $IV=4$, $IX=9$, $XL=40$, $XC=90$, $CD=400$, $CM=900$.\n\nSymbole $I$, $X$, $C$ i $M$ można powtórzyć najwyżej trzy razy, np. $III=3$, $XXX=30$. Symbole $V$, $L$ i $D$ nie powtarzają się. Zapis tworzymy od największych wartości do najmniejszych, rozkładając liczbę na tysiące, setki, dziesiątki i jedności.",
    example1:
      "Odczytaj $XIV$. Zapis to $X$ (10) oraz $IV$ (4), więc $XIV=14$. Podobnie $XL=40$, $XC=90$, a $MCM=1000+900=1900$.",
    example2:
      "Zapisz $1984$. Rozkład: $1000+900+80+4$. Kolejno: $M$, $CM$, $LXXX$, $IV$, więc $1984=MCMLXXXIV$. Sprawdzamy, że nie ma czterech powtórzeń tego samego symbolu.",
    pitfalls:
      "* Nie zapisuj $4$ jako $IIII$; poprawnie jest $IV$.\n* Nie zapisuj $9$ jako $VIIII$; poprawnie jest $IX$.\n* Zasada odejmowania działa tylko dla wybranych par, np. $IV$, $IX$, $XL$, $XC$, $CD$, $CM$.\n* $V$, $L$ i $D$ nie powtarzają się.\n* Zapis czytaj od lewej do prawej, ale mniejszy symbol przed większym odejmuj.",
    exercises:
      "1. Odczytaj $XIV$.\n2. Odczytaj $MCMXC$.\n3. Zapisz $24$ cyframi rzymskimi.\n4. Zapisz $49$ cyframi rzymskimi.\n5. Zapisz $1984$ cyframi rzymskimi.\n6. Która liczba jest większa: $XL$ czy $LX$?",
    answers:
      "1. $14$.\n2. $1990$.\n3. $XXIV$.\n4. $XLIX$.\n5. $MCMLXXXIV$.\n6. $LX=60$ jest większe od $XL=40$.",
    recap:
      "1. Jakie wartości mają $I$, $V$, $X$, $L$, $C$, $D$, $M$?\n2. Kiedy odejmujemy wartość symbolu?\n3. Które symbole mogą się powtarzać?\n4. Jak zapisać $4$ i $9$?\n5. Jak zamienić dużą liczbę na zapis rzymski?",
    diagram:
      "I=1  V=5  X=10  L=50\nC=100  D=500  M=1000\n   ↓\n IV=4  IX=9  XL=40\n XC=90  CD=400  CM=900\n   ↓\nczytaj od lewej, mniejszy przed większym odejmuj",
  }),
];
