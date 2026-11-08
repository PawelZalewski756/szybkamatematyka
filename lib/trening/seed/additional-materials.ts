import type { ExamType } from "@/types/database";

type AdditionalMaterial = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  content: string;
  video_url: string | null;
};

type LessonSpec = {
  exam_type: ExamType;
  category: string;
  topic: string;
  title: string;
  examNote: string;
  map: string;
  definitions: string;
  example1: string;
  example2: string;
  pitfalls: string;
  exercises: string;
  answers: string;
  recap: string;
  diagram: string;
};

function buildLesson(spec: LessonSpec): AdditionalMaterial {
  return {
    exam_type: spec.exam_type,
    category: spec.category,
    topic: spec.topic,
    title: spec.title,
    video_url: null,
    content: `## Na egzaminie
${spec.examNote}

## Mapa tematu
${spec.map}

## Definicje i wzory
${spec.definitions}

## Przykład 1 - podstawowy
${spec.example1}

## Przykład 2 - maturalny
${spec.example2}

## Pułapki
${spec.pitfalls}

## Ćwiczenia do samodzielnego rozwiązania
${spec.exercises}

## Odpowiedzi
${spec.answers}

## Szybka powtórka
${spec.recap}

## Diagram
\`\`\`text
${spec.diagram}
\`\`\``,
  };
}

export const ADDITIONAL_SEED_MATERIALS: AdditionalMaterial[] = [
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "liczby_rzeczywiste",
    topic: "zbiory_i_przedzialy",
    title: "Zbiory i przedziały - zapis oraz działania",
    examNote:
      "Zbiory i przedziały są używane w zadaniach CKE do zapisu rozwiązań nierówności, dziedziny i zbioru wartości funkcji. Trzeba rozpoznawać nawiasy otwarte i domknięte, zaznaczać przedziały na osi oraz obliczać sumę i część wspólną. Ten temat porządkuje zapis, który pojawia się także w zadaniach o funkcjach i wartości bezwzględnej.",
    map:
      "1. Rozróżnisz przedziały otwarte, domknięte i jednostronnie domknięte.\n2. Odczytasz przedział z osi liczbowej.\n3. Obliczysz sumę, część wspólną i różnicę przedziałów.\n4. Zapiszesz rozwiązanie nierówności w poprawnej notacji.\n5. Sprawdzisz, czy końce należą do zbioru.",
    definitions:
      "**Przedział domknięty** $[a,b]$ zawiera oba końce: $a\\le x\\le b$. **Przedział otwarty** $(a,b)$ nie zawiera końców: $a<x<b$. W przedziałach mieszanych nawias okrągły oznacza wyłączenie końca, a kwadratowy - jego włączenie.\n\n**Suma zbiorów** $A\\cup B$ zawiera elementy należące do $A$ lub do $B$. **Część wspólna** $A\\cap B$ zawiera elementy należące jednocześnie do obu zbiorów. Przy zapisie nieskończoności zawsze używa się nawiasu okrągłego, np. $(-\\infty,4]$.\n\nNa osi liczbowej pełne kółko oznacza koniec należący do zbioru, a puste kółko - koniec wyłączony. Zanim wykonasz działanie, zaznacz oba przedziały na jednej osi.",
    example1:
      "Wyznacz $[-3,5]\\cap[1,8]$. Wspólny fragment zaczyna się w większym z lewych końców, czyli w $1$, i kończy w mniejszym z prawych końców, czyli w $5$. Oba końce są domknięte, więc wynik to $[1,5]$. Dla sumy tych przedziałów otrzymalibyśmy $[-3,8]$.",
    example2:
      "Rozwiąż nierówność $-2\\le 3x+1<7$ i zapisz zbiór rozwiązań. Odejmujemy $1$: $-3\\le3x<6$. Dzielimy przez dodatnie $3$: $-1\\le x<2$. Lewy koniec należy do zbioru, prawy nie, zatem rozwiązaniem jest $[-1,2)$.",
    pitfalls:
      "* Nie zamieniaj nawiasu okrągłego na kwadratowy tylko dlatego, że liczba jest widoczna na osi.\n* Przy dzieleniu nierówności przez liczbę ujemną zmień zwrot nierówności.\n* Suma rozłącznych przedziałów wymaga znaku $\\cup$, a nie jednego przedziału obejmującego przerwę.\n* Przy nieskończoności nie wolno używać nawiasu kwadratowego.\n* W części wspólnej wybierz większy lewy koniec i mniejszy prawy koniec.",
    exercises:
      "1. Oblicz $[-4,3)\\cap(1,7]$.\n2. Oblicz $(-\\infty,2]\\cup[5,\\infty)$.\n3. Zapisz w postaci przedziału zbiór $-5<x\\le 2$.\n4. Rozwiąż $4x-3\\ge 9$.\n5. Na osi zaznacz $(-2,4]$ i wypisz, czy $-2$ oraz $4$ należą do zbioru.\n6. Wyznacz różnicę $[0,6]\\setminus(2,4]$.",
    answers:
      "1. $(1,3)$.\n2. $(-\\infty,2]\\cup[5,\\infty)$.\n3. $(-5,2]$.\n4. $x\\ge3$, czyli $[3,\\infty)$.\n5. $-2$ nie należy, a $4$ należy.\n6. $[0,2]\\cup(4,6]$.",
    recap:
      "1. Co oznaczają nawiasy okrągły i kwadratowy?\n2. Jak wyznaczyć lewy i prawy koniec części wspólnej?\n3. Dlaczego przy nieskończoności zawsze jest nawias okrągły?\n4. Kiedy używamy znaku $\\cup$?\n5. Jak zmienia się znak nierówności przy dzieleniu przez liczbę ujemną?",
    diagram:
      "nierówność → przekształcenie\n       ↓\n  końce przedziału\n   ↙          ↘\n  otwarty     domknięty\n       ↓\n  oś liczbowa\n       ↓\n  suma / część wspólna",
  }),
  buildLesson({
    exam_type: "matura_podstawowa",
    category: "funkcje",
    topic: "funkcja_wykladnicza",
    title: "Funkcja wykładnicza - wzrost i spadek",
    examNote:
      "Funkcja wykładnicza opisuje szybki wzrost lub spadek, dlatego CKE łączy ją z procentem składanym, skalą i zmianami w czasie. W zadaniach trzeba rozpoznać podstawę, obliczyć wartość funkcji, odczytać monotoniczność i rozwiązać proste równanie o tej samej podstawie.",
    map:
      "1. Rozpoznasz postać $f(x)=a^x$.\n2. Obliczysz wartości dla całkowitych argumentów.\n3. Określisz, czy funkcja rośnie, czy maleje.\n4. Rozwiążesz równanie przez porównanie wykładników.\n5. Zinterpretujesz wzrost i spadek w zadaniu praktycznym.",
    definitions:
      "Funkcja wykładnicza ma postać $f(x)=a^x$, gdzie $a>0$ i $a\\ne1$. Dla $a>1$ jest rosnąca, a dla $0<a<1$ - malejąca. Zawsze przechodzi przez punkt $(0,1)$, bo $a^0=1$.\n\nPodstawowe prawa potęg: $a^u\\cdot a^v=a^{u+v}$, $\\frac{a^u}{a^v}=a^{u-v}$ oraz $(a^u)^v=a^{uv}$. Jeśli $a>0$, $a\\ne1$ i $a^u=a^v$, to $u=v$. W modelu wzrostu $P(t)=P_0\\cdot a^t$ podstawa większa od $1$ oznacza wzrost, a podstawa między $0$ i $1$ - spadek.",
    example1:
      "Dla $f(x)=2^x$ oblicz $f(4)$ oraz $f(-2)$. Mamy $f(4)=2^4=16$. Ponadto $f(-2)=2^{-2}=\\frac1{2^2}=\\frac14$. Funkcja rośnie, bo podstawa $2$ jest większa od $1$.",
    example2:
      "Rozwiąż $3^{x+1}=81$. Zapisujemy $81=3^4$, więc $3^{x+1}=3^4$. Podstawy są takie same i większe od zera, zatem $x+1=4$, czyli $x=3$. W zadaniu o wzroście analogicznie porównuje się potęgi po zapisaniu liczb w tej samej podstawie.",
    pitfalls:
      "* Nie myl $a^x$ z $a\\cdot x$.\n* Wartość $a^0$ wynosi $1$, a nie $0$.\n* Przy podstawie z przedziału $(0,1)$ funkcja maleje.\n* Przed porównaniem wykładników sprowadź obie strony do tej samej podstawy.\n* Ujemny wykładnik daje odwrotność: $a^{-n}=1/a^n$.",
    exercises:
      "1. Oblicz $5^3$.\n2. Oblicz $2^{-3}$.\n3. Rozwiąż $2^x=32$.\n4. Określ, czy $f(x)=(1/3)^x$ rośnie, czy maleje.\n5. Rozwiąż $4^{x-1}=16$.\n6. Kapitał rośnie według $P(t)=1000\\cdot1{,}05^t$. Zapisz kwotę po 2 latach.",
    answers:
      "1. $125$.\n2. $1/8$.\n3. $x=5$.\n4. Maleje.\n5. $x=3$.\n6. $1000\\cdot1{,}05^2=1102{,}50$ zł po zaokrągleniu do groszy.",
    recap:
      "1. Jaki warunek spełnia podstawa funkcji wykładniczej?\n2. Kiedy funkcja wykładnicza rośnie?\n3. Ile wynosi $a^0$?\n4. Jak rozwiązać równanie $a^u=a^v$?\n5. Co oznacza podstawa $1+r$ w modelu wzrostu?",
    diagram:
      "f(x)=a^x\n  a>1  → wzrost\n  0<a<1 → spadek\n       ↓\n  ta sama podstawa\n       ↓\n  porównaj wykładniki",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "liczby",
    topic: "podzielnosc",
    title: "Podzielność liczb - dzielniki, NWD i reszta",
    examNote:
      "Podzielność pojawia się w zadaniach o dzielnikach, wielokrotnościach, rozkładzie liczb i reszcie z dzielenia. Na egzaminie ósmoklasisty ważne są cechy podzielności oraz sprawne używanie największego wspólnego dzielnika i najmniejszej wspólnej wielokrotności.",
    map:
      "1. Rozpoznasz dzielnik i wielokrotność.\n2. Zastosujesz cechy podzielności przez 2, 3, 5, 9 i 10.\n3. Obliczysz NWD i NWW.\n4. Odczytasz resztę z dzielenia.\n5. Rozłożysz liczbę na czynniki pierwsze.",
    definitions:
      "Liczba $a$ dzieli liczbę $b$, gdy istnieje całkowite $k$ takie, że $b=a\\cdot k$. Zapisujemy wtedy $a\\mid b$. Dzielnik nie może być zerem. Wielokrotności liczby $a$ to liczby $a,2a,3a,\\ldots$.\n\nLiczba jest podzielna przez $2$, gdy jej ostatnia cyfra jest parzysta; przez $5$, gdy kończy się na $0$ lub $5$; przez $10$, gdy kończy się na $0$; przez $3$ i $9$, gdy odpowiednio suma jej cyfr jest podzielna przez $3$ lub $9$. NWD to największy wspólny dzielnik, a NWW - najmniejsza wspólna wielokrotność. W dzieleniu z resztą $b=a\\cdot q+r$, gdzie $0\\le r<a$.",
    example1:
      "Sprawdź, czy $738$ jest podzielne przez $3$ i $9$. Suma cyfr wynosi $7+3+8=18$. Ponieważ $18$ dzieli się przez $3$ i przez $9$, liczba $738$ jest podzielna przez obie te liczby.",
    example2:
      "Oblicz NWD liczb $84$ i $126$. Rozkłady to $84=2^2\\cdot3\\cdot7$ oraz $126=2\\cdot3^2\\cdot7$. Wspólne czynniki z najmniejszymi wykładnikami dają $2\\cdot3\\cdot7=42$. Zatem $\\operatorname{NWD}(84,126)=42$.",
    pitfalls:
      "* Reszta musi być mniejsza od dzielnika.\n* Suma cyfr pomaga przy podzielności przez 3 i 9, ale nie przez 6 bez sprawdzenia parzystości.\n* NWD wybiera wspólne czynniki z najmniejszymi wykładnikami.\n* NWW wybiera wszystkie czynniki z największymi wykładnikami.\n* Nie zapisuj zera jako dzielnika.",
    exercises:
      "1. Wypisz dzielniki liczby $18$.\n2. Sprawdź podzielność $4575$ przez $5$, $9$ i $10$.\n3. Oblicz NWD liczb $48$ i $72$.\n4. Oblicz NWW liczb $12$ i $18$.\n5. Podaj resztę z dzielenia $157$ przez $12$.\n6. Rozłóż $180$ na czynniki pierwsze.",
    answers:
      "1. $1,2,3,6,9,18$.\n2. Przez $5$ i $9$ tak, przez $10$ nie.\n3. $24$.\n4. $36$.\n5. $1$.\n6. $180=2^2\\cdot3^2\\cdot5$.",
    recap:
      "1. Co oznacza zapis $a\\mid b$?\n2. Jaka jest cecha podzielności przez 9?\n3. Czym różnią się NWD i NWW?\n4. Jaki warunek spełnia reszta z dzielenia?\n5. Po co rozkłada się liczbę na czynniki pierwsze?",
    diagram:
      "liczba\n  ↓\nczynniki pierwsze\n  ↙          ↘\n NWD         NWW\n  ↓            ↓\nwspólne       wszystkie\n najmniejsze   największe wykładniki",
  }),
  buildLesson({
    exam_type: "8_klasa",
    category: "geometria",
    topic: "okrag_i_kolo",
    title: "Okrąg i koło - promień, obwód i pole",
    examNote:
      "Zadania o okręgu i kole sprawdzają rozróżnienie między obwodem okręgu a polem koła, odczyt promienia lub średnicy oraz podstawienie do wzoru. Często dane są osadzone w sytuacji praktycznej: tarcza, pizza, koło roweru albo figura wpisana w kwadrat.",
    map:
      "1. Odróżnisz okrąg od koła.\n2. Odczytasz promień i średnicę.\n3. Obliczysz obwód okręgu i pole koła.\n4. Przekształcisz wzór, aby znaleźć promień.\n5. Zastosujesz przybliżenie $\\pi$ zgodnie z poleceniem.",
    definitions:
      "Okrąg jest brzegiem koła, a koło obejmuje brzeg i jego wnętrze. Promień $r$ łączy środek z punktem okręgu, a średnica $d$ przechodzi przez środek i spełnia $d=2r$.\n\nDługość okręgu obliczamy ze wzoru $L=2\\pi r=\\pi d$. Pole koła wynosi $P=\\pi r^2$. Jeśli w zadaniu nie podano inaczej, wynik można zostawić z $\\pi$; gdy polecenie wymaga przybliżenia, użyj wskazanej wartości, np. $\\pi\\approx3{,}14$. Jednostki obwodu są liniowe, a pola - kwadratowe.",
    example1:
      "Koło ma promień $r=4$ cm. Jego obwód to $L=2\\pi\\cdot4=8\\pi$ cm, a pole to $P=\\pi\\cdot4^2=16\\pi$ cm$^2$. Nie wolno zamieniać wzorów: obwód zawiera promień w pierwszej potędze, a pole - w drugiej.",
    example2:
      "Okrąg ma średnicę $10$ cm. Najpierw obliczamy promień: $r=10:2=5$ cm. Pole koła wynosi $P=\\pi\\cdot5^2=25\\pi$ cm$^2$. Przy $\\pi\\approx3{,}14$ otrzymujemy $78{,}5$ cm$^2$.",
    pitfalls:
      "* Średnica jest dwa razy dłuższa od promienia.\n* Obwód i pole mają różne wzory oraz różne jednostki.\n* W polu trzeba podnieść promień do kwadratu.\n* Nie zaokrąglaj $\\pi$ wcześniej, jeśli można zostawić wynik dokładny.\n* Przy zmianie skali długości pole zmienia się według kwadratu skali.",
    exercises:
      "1. Oblicz obwód okręgu o promieniu $3$ cm.\n2. Oblicz pole koła o średnicy $12$ cm.\n3. Wyznacz promień koła o obwodzie $14\\pi$ cm.\n4. Użyj $\\pi\\approx3{,}14$ i oblicz pole koła o promieniu $5$ cm.\n5. Ile razy wzrośnie pole, gdy promień zwiększymy dwukrotnie?\n6. Okrąg wpisano w kwadrat o boku $8$ cm. Podaj jego średnicę.",
    answers:
      "1. $6\\pi$ cm.\n2. $36\\pi$ cm$^2$.\n3. $r=7$ cm.\n4. $78{,}5$ cm$^2$.\n5. Cztery razy.\n6. $8$ cm.",
    recap:
      "1. Czym różnią się okrąg i koło?\n2. Jaki jest związek średnicy z promieniem?\n3. Jaki wzór opisuje obwód okręgu?\n4. Dlaczego pole ma jednostkę kwadratową?\n5. Jak zmieni się pole po dwukrotnym zwiększeniu promienia?",
    diagram:
      "      średnica d\n   <------------>\n        • środek\n      r ↗\nokrąg = brzeg, koło = wnętrze\nL=2πr       P=πr²",
  }),
];
