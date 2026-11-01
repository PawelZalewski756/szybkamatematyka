type ParametricExplanation = {
  method: string;
  calculation: string;
};

function explain(
  topic: string,
  content: string,
  answer: string,
): ParametricExplanation | null {
  const numbers = content.match(/-?\d+(?:[.,]\d+)?/g)?.map(Number) ?? [];
  const answerLabel = `Otrzymujemy: ${answer}.`;

  switch (topic) {
    case "potegi": {
      const product = content.match(/\$?(\d+)\^\{?(\d+)\}?\s*\\cdot\s*(\d+)\^\{?(\d+)\}?\$?/);
      if (product && product[1] === product[3]) {
        const [base, left, right] = [
          Number(product[1]),
          Number(product[2]),
          Number(product[4]),
        ];
        return {
          method: "Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki.",
          calculation: `$${base}^{${left}}\\cdot${base}^{${right}}=${base}^{${left}+${right}}=${answer}$.`,
        };
      }
      const quotient = content.match(/\\dfrac\{(\d+)\^\{?(\d+)\}?\}\{(\d+)\^\{?(\d+)\}?\}/);
      if (quotient && quotient[1] === quotient[3]) {
        const [base, top, bottom] = [
          Number(quotient[1]),
          Number(quotient[2]),
          Number(quotient[4]),
        ];
        return {
          method: "Przy dzieleniu potęg o tej samej podstawie odejmujemy wykładniki.",
          calculation: `$\\dfrac{${base}^{${top}}}{${base}^{${bottom}}}=${base}^{${top}-${bottom}}=${answer}$.`,
        };
      }
      const power = content.match(/\$\((\d+)\^\{?(\d+)\}?\)\^\{?(\d+)\}?\$/);
      if (power) {
        const [base, inner, outer] = [
          Number(power[1]),
          Number(power[2]),
          Number(power[3]),
        ];
        return {
          method: "Potęgę potęgujemy, mnożąc wykładniki.",
          calculation: `$(${base}^{${inner}})^{${outer}}=${base}^{${inner}\\cdot${outer}}=${answer}$.`,
        };
      }
      return {
        method: "Zastosuj prawa działań na potęgach: przy tej samej podstawie dodaj wykładniki przy mnożeniu, a odejmij przy dzieleniu.",
        calculation: answerLabel,
      };
    }
    case "logarytmy": {
      const match = content.match(/\\log_\{(\d+)\}\s*(\d+)/);
      if (!match) return null;
      const [, base, value] = match;
      return {
        method: "Logarytm odpowiada na pytanie, do jakiej potęgi trzeba podnieść podstawę, aby otrzymać daną liczbę.",
        calculation: `$${base}^{${answer}}=${value}$, więc $\\log_{${base}}${value}=${answer}$.`,
      };
    }
    case "procenty":
    case "diagramy": {
      const match = content.match(
        /(\d+(?:[.,]\d+)?)%\s*(?:z|z liczby|z uczniów)?\s*(\d+)/i,
      );
      if (!match) return null;
      const [, percent, value] = match;
      const normalizedPercent = percent.replace(",", ".");
      return {
        method: "Procent zamień na ułamek o mianowniku 100 i pomnóż przez całość.",
        calculation: `$${normalizedPercent}\\%\\cdot${value}=${normalizedPercent}\\cdot${value}\\div100=${answer}$.`,
      };
    }
    case "rownania_liniowe":
    case "rownania": {
      const match = content.match(/\$(-?\d*)x([+-]\d+)?=(-?\d+)\$/);
      if (!match) return null;
      const [, rawA, rawB = "0", rawC] = match;
      const a = rawA === "" || rawA === "-" ? `${rawA}1` : rawA;
      const b = Number(rawB);
      const c = Number(rawC);
      const x = Number(answer);
      const afterConstant = c - b;
      const equationWithoutConstant =
        b === 0
          ? `$${a}x=${c}`
          : `$${a}x${b < 0 ? b : `+${b}`}=${c}`;
      return {
        method: "Najpierw przenieś wyraz bez x na drugą stronę, zmieniając jego znak. Następnie podziel obie strony przez współczynnik przy x.",
        calculation: `${equationWithoutConstant}\\;\\Rightarrow\\;${a}x=${afterConstant}\\;\\Rightarrow\\;x=${x}$.`,
      };
    }
    case "ulamki": {
      const fractions = [...content.matchAll(/\\frac\{(\d+)\}\{(\d+)\}/g)];
      if (fractions.length !== 2) return null;
      const [, n1, d1] = fractions[0]!;
      const [, n2, d2] = fractions[1]!;
      const commonDenominator = Number(d1) * Number(d2);
      return {
        method: "Sprowadź ułamki do wspólnego mianownika, dodaj liczniki i oblicz wartość.",
        calculation: `$\\dfrac{${n1}}{${d1}}+\\dfrac{${n2}}{${d2}}=\\dfrac{${Number(n1) * Number(d2)}+${Number(n2) * Number(d1)}}{${commonDenominator}}\\approx${answer}$.`,
      };
    }
    case "zbiory_i_przedzialy": {
      const intervals = [...content.matchAll(/\[(-?\d+),\s*(-?\d+)\]/g)];
      if (intervals.length !== 2) return null;
      const [, a, b] = intervals[0]!;
      const [, c, d] = intervals[1]!;
      return {
        method: "Część wspólna to liczby należące do obu przedziałów. Jej lewy koniec to większy z lewych końców, a prawy — mniejszy z prawych.",
        calculation: `$[${a},${b}]\\cap[${c},${d}]=[\\max(${a},${c}),\\min(${b},${d})]=${answer}$.`,
      };
    }
    case "proporcje": {
      const match = content.match(/\$(\d+):(\d+)=(\d+):x\$/);
      if (!match) return null;
      const [, a, b, c] = match;
      return {
        method: "W proporcji iloczyny wyrazów skrajnych i środkowych są równe. Pomnóż na krzyż i podziel przez współczynnik przy x.",
        calculation: `$${a}: ${b}=${c}:x\\;\\Rightarrow\\;${a}x=${Number(b) * Number(c)}\\;\\Rightarrow\\;x=${answer}$.`,
      };
    }
    case "kolejnosc_dzialan": {
      const expression = content.match(
        /\$(\d+)\\cdot\s*(\d+)-(\d+)\$/,
      ) ??
        content.match(/\$(\d+)\+(\d+)\\cdot\s*(\d+)\$/);
      if (!expression) return null;
      const [, rawA, rawB, rawC] = expression;
      const a = Number(rawA);
      const b = Number(rawB);
      const c = Number(rawC);
      const isSubtraction = expression[0]!.includes("-");
      const partial = isSubtraction ? a * b : b * c;
      return {
        method: "Najpierw wykonaj mnożenie, a dopiero potem dodawanie lub odejmowanie.",
        calculation: isSubtraction
          ? `$${a}\\cdot${b}-${c}=${partial}-${c}=${answer}$.`
          : `$${a}+${b}\\cdot${c}=${a}+${partial}=${answer}$.`,
      };
    }
    default: {
      const guide: Record<string, string> = {
        wyrazenia_algebraiczne: "Podstaw podane wartości za zmienne, zachowując kolejność działań.",
        uklady_rownan: "Dodaj równania stronami, aby wyeliminować y, a następnie podziel przez współczynnik przy x.",
        funkcja_liniowa: "Podstaw podane x do wzoru funkcji i wykonaj mnożenie oraz dodawanie.",
        funkcja_kwadratowa: "Podstaw x do wzoru funkcji kwadratowej, oblicz potęgę, mnożenie i dodawanie.",
        planimetria: "Dobierz wzór do figury: pole trójkąta to połowa iloczynu podstawy i wysokości, a w trójkącie prostokątnym użyj twierdzenia Pitagorasa.",
        stereometria: "Dobierz wzór na pole lub objętość bryły i podstaw podane wymiary.",
        prawdopodobienstwo: "Prawdopodobieństwo to iloraz liczby wyników sprzyjających i wszystkich możliwych; ułamek skróć, jeśli można.",
        statystyka: "Średnią arytmetyczną obliczamy, dzieląc sumę danych przez ich liczbę.",
        pola_figur: "Użyj wzoru na pole danej figury i podstaw jej wymiary.",
        obwody: "Zsumuj długości boków; dla koła użyj wzoru na obwód okręgu.",
        katy: "Suma kątów w trójkącie wynosi 180°. Odejmij od niej znane kąty.",
        wykresy: "Podstaw współrzędną x do wzoru funkcji i oblicz odpowiadającą jej wartość y.",
        srednia: "Dodaj wszystkie liczby i podziel sumę przez liczbę elementów.",
        funkcja_wykladnicza: "Zastosuj definicję potęgi lub porównaj wykładniki po zapisaniu obu stron z tą samą podstawą.",
        wartosc_bezwzgledna: "Wartość bezwzględna to odległość liczby od zera, więc nie jest ujemna.",
        wzory_skroconego_mnozenia: "Zastosuj wzór $(a+b)^2=a^2+2ab+b^2$ albo najpierw oblicz sumę w nawiasie i podnieś ją do kwadratu.",
        rownania_kwadratowe: "Rozłóż trójmian na czynniki i skorzystaj z zasady iloczynu równego zero.",
        nierownosci: "Izoluj x jak w równaniu; przy dzieleniu przez liczbę ujemną odwróć znak nierówności.",
        wlasnosci_funkcji: "Miejsce zerowe wyznacz z równania $f(x)=0$.",
        odczyt_wykresu: "Wstaw odczytane z wykresu wartości do wskazanego działania.",
        ciag_arytmetyczny: "Użyj wzoru $a_n=a_1+(n-1)r$.",
        ciag_geometryczny: "Użyj wzoru $a_n=a_1\\cdot q^{n-1}$.",
        sin_cos_tg: "Odczytaj wartość funkcji trygonometrycznej z tablicy wartości szczególnych.",
        zastosowania_trygonometrii: "W trójkącie prostokątnym skorzystaj z twierdzenia Pitagorasa.",
        pitagoras: "Zastosuj twierdzenie Pitagorasa: kwadrat przeciwprostokątnej jest sumą kwadratów przyprostokątnych.",
        pitagoras_i_podobienstwo: "Zastosuj twierdzenie Pitagorasa do kwadratów długości boków.",
        podobienstwo: "W figurach podobnych odpowiadające sobie długości zmieniają się w tej samej skali.",
        okrag_i_kolo: "Pole koła liczymy ze wzoru $P=\\pi r^2$, a obwód ze wzoru $L=2\\pi r$.",
        kombinatoryka: "Zastosuj regułę mnożenia: pomnóż liczbę możliwości na kolejnych etapach wyboru.",
        regula_mnozenia: "Zastosuj regułę mnożenia: pomnóż liczbę możliwości na kolejnych etapach wyboru.",
        pierwiastki: "Pierwiastek kwadratowy z liczby to nieujemna liczba, której kwadrat daje tę liczbę.",
        liczby_calkowite: "Dodawanie liczb całkowitych wykonaj z uwzględnieniem ich znaków.",
        podzielnosc: "Sprawdź podzielność lub wyznacz największy wspólny dzielnik wskazanych liczb.",
        symetrie: "W symetrii względem osi OY zmienia się znak x, a względem osi OX — znak y.",
        bryly: "Objętość prostopadłościanu to iloczyn jego wymiarów, a sześcianu — sześcian długości krawędzi.",
        objetosc_i_pole: "Objętość prostopadłościanu to iloczyn jego wymiarów, a sześcianu — sześcian długości krawędzi.",
        punkty_na_plaszczyznie: "Znaki współrzędnych wyznaczają ćwiartkę: (+,+) I, (−,+) II, (−,−) III, (+,−) IV.",
        dlugosc_odcinka: "Użyj wzoru na odległość punktów: $d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$.",
        proporcjonalnosc: "Wprost proporcjonalność ma postać $y=kx$. Najpierw odczytaj k, a potem pomnóż je przez x.",
        mediana_i_dominanta: "Uporządkuj liczby rosnąco; mediana to środkowa wartość w uporządkowanym zbiorze.",
        notacja_wykladnicza: "Pomnóż współczynnik przez 10 podniesione do wskazanej potęgi.",
      };
      const method = guide[topic];
      if (!method || numbers.length === 0) return null;
      return { method, calculation: answerLabel };
    }
    return null;
  }
}

export function explainParametricTask(
  topic: string,
  content: string,
  answer: string,
): string | null {
  const result = explain(topic, content, answer);
  if (!result) return null;
  return `Jak rozwiązać: ${result.method}\n\nObliczenia: ${result.calculation}`;
}
