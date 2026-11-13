import { gcd, uniqueChoices } from "@/lib/baza-zadan/task-generators";
import type { Task } from "@/lib/baza-zadan/types";

const FOR_BOTH = ["sp", "srednia"] as const;

function t(id: string, data: Omit<Task, "id">): Task {
  return { id, ...data };
}

function table(
  headers: readonly string[],
  rows: readonly (readonly (string | number)[])[],
): string {
  const head = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers
    .map((_, index) => (index === 0 ? "---" : "---:"))
    .join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return [head, divider, body].join("\n");
}

function money(value: number): string {
  return `${value} zł`;
}

function offers(): Task[] {
  const providers = [
    "NetLink",
    "Światłowód+",
    "FiberGo",
    "DomNet",
    "SzybkiNet",
    "Orbita",
    "TeleStrumień",
    "Megaline",
    "Wavenet",
    "PixelNet",
  ];
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const base = 45 + (i % 5) * 10;
    const prices = [base, base + 20, base + 40];
    const activation = [0, 49, 0, 39, 29][i % 5]!;
    const routers = [99, 0, 49][i % 3]!;
    const oneTime = [
      activation + routers,
      activation,
      0,
    ];
    const totals = prices.map((price, index) => price * 12 + oneTime[index]!);
    const cheapest = Math.min(...totals);
    const wrongs = [
      totals[0]!,
      totals[1]!,
      totals[2]!,
      prices[0]! * 12,
      cheapest + 60,
    ]
      .filter((value) => value !== cheapest)
      .map(money);
    const { choices, correctIndex } = uniqueChoices(money(cheapest), wrongs);

    tasks.push(
      t(`gen-offer-${i + 1}`, {
        title: `Oferta internetu #${i + 1}`,
        category: "arytmetyka",
        difficulty: i % 3 === 0 ? "trudny" : "sredni",
        forPaths: FOR_BOTH,
        prompt: [
          `Porównaj oferty internetu na 12 miesięcy.`,
          "",
          table(
            ["Dostawca", "Miesiąc", "Aktywacja", "Router"],
            [
              [providers[i]!, money(prices[0]!), money(activation), money(routers)],
              [providers[(i + 1) % providers.length]!, money(prices[1]!), money(oneTime[1]!), money(0)],
              [providers[(i + 2) % providers.length]!, money(prices[2]!), money(0), money(oneTime[2]!)],
            ],
          ),
          "",
          "Ile wynosi najniższy koszt całkowity po 12 miesiącach?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Koszt pierwszej oferty to 12 · ${prices[0]} + ${oneTime[0]} = ${totals[0]} zł, drugiej ${totals[1]} zł, trzeciej ${totals[2]} zł. Najtaniej wychodzi ${cheapest} zł.`,
        solutionSteps: [
          `Policz 12 miesięcy dla pierwszej oferty: 12 · ${prices[0]} zł = ${prices[0]! * 12} zł, dodaj ${oneTime[0]} zł, razem ${totals[0]} zł.`,
          `Dla drugiej oferty: 12 · ${prices[1]} zł + ${oneTime[1]} zł = ${totals[1]} zł.`,
          `Dla trzeciej oferty: 12 · ${prices[2]} zł + ${oneTime[2]} zł = ${totals[2]} zł.`,
          `Najniższa suma to ${cheapest} zł.`,
        ],
        hint: "Do opłaty miesięcznej dodaj wszystkie jednorazowe koszty.",
      }),
    );
  }

  return tasks;
}

function budgets(): Task[] {
  const trips = [
    "Kraków",
    "Gdańsk",
    "Wrocław",
    "Poznań",
    "Zakopane",
    "Toruń",
    "Lublin",
    "Szczecin",
    "Białystok",
    "Kielce",
  ];
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const budget = 1200 + (i % 4) * 100;
    const transport = 240 + (i % 3) * 30;
    const hotel = 360 + (i % 4) * 40;
    const food = 180 + (i % 5) * 20;
    const tickets = 90 + (i % 2) * 30;
    const total = transport + hotel + food + tickets;
    const left = budget - total;
    const { choices, correctIndex } = uniqueChoices(money(left), [
      money(left + 50),
      money(left - 40),
      money(total),
      money(budget),
    ]);

    tasks.push(
      t(`gen-budget-${i + 1}`, {
        title: `Budżet wycieczki #${i + 1}`,
        category: "arytmetyka",
        difficulty: i % 4 === 0 ? "sredni" : "latwy",
        forPaths: FOR_BOTH,
        prompt: [
          `Wycieczka do ${trips[i]} ma budżet ${money(budget)}. W tabeli zapisano planowane wydatki.`,
          "",
          table(
            ["Wydatek", "Kwota"],
            [
              ["Transport", money(transport)],
              ["Nocleg", money(hotel)],
              ["Wyżywienie", money(food)],
              ["Bilety", money(tickets)],
            ],
          ),
          "",
          "Ile pieniędzy zostanie z budżetu?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Suma wydatków to ${transport} + ${hotel} + ${food} + ${tickets} = ${total} zł. Z budżetu ${budget} zł zostaje ${left} zł.`,
        solutionSteps: [
          `Dodaj wydatki: ${transport} + ${hotel} + ${food} + ${tickets} = ${total} zł.`,
          `Odejmij sumę od budżetu: ${budget} - ${total} = ${left} zł.`,
        ],
        hint: "Najpierw zsumuj wszystkie wydatki, potem odejmij je od budżetu.",
      }),
    );
  }

  return tasks;
}

function discounts(): Task[] {
  const sets = [
    [
      ["Kurtka", 240],
      ["Buty", 180],
      ["Plecak", 120],
    ],
    [
      ["Namiot", 360],
      ["Śpiwór", 240],
      ["Latarka", 80],
    ],
    [
      ["Rower", 800],
      ["Kask", 240],
      ["Licznik", 160],
    ],
    [
      ["Telefon", 1200],
      ["Etui", 120],
      ["Ładowarka", 80],
    ],
    [
      ["Fotel", 600],
      ["Lampa", 240],
      ["Dywan", 360],
    ],
  ] as const;
  const discounts = [10, 20, 25, 50] as const;
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const set = sets[i % sets.length]!;
    const values = set.map(([, price], index) => {
      const percent = discounts[(i + index) % discounts.length]!;
      return {
        name: set[index]![0],
        price,
        percent,
        final: price - (price * percent) / 100,
      };
    });
    const total = values.reduce((sum, item) => sum + item.final, 0);
    const before = values.reduce((sum, item) => sum + item.price, 0);
    const { choices, correctIndex } = uniqueChoices(money(total), [
      money(before),
      money(total + 20),
      money(total - 10),
      money(values[0]!.price),
    ]);

    tasks.push(
      t(`gen-discount-${i + 1}`, {
        title: `Rabat na zakupy #${i + 1}`,
        category: "procenty",
        difficulty: i % 3 === 0 ? "trudny" : "sredni",
        forPaths: FOR_BOTH,
        prompt: [
          "W tabeli podano ceny produktów i rabat na każdy z nich.",
          "",
          table(
            ["Produkt", "Cena", "Rabat"],
            values.map((item) => [
              item.name,
              money(item.price),
              `${item.percent}%`,
            ]),
          ),
          "",
          "Ile zapłacisz łącznie po rabatach?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: values
          .map(
            (item) =>
              `${item.name}: ${item.price} - ${item.percent}% = ${item.final} zł`,
          )
          .concat(`Razem: ${total} zł.`)
          .join(" "),
        solutionSteps: values.map(
          (item) =>
            `Policz rabat dla produktu ${item.name}: ${item.percent}% z ${item.price} zł to ${item.price - item.final} zł, więc zostaje ${item.final} zł.`,
        ),
        hint: "Rabat licz od ceny każdego produktu osobno.",
      }),
    );
  }

  return tasks;
}

function averages(): Task[] {
  const subjectSets = [
    ["Matematyka", "Polski", "Angielski", "Historia", "Biologia"],
    ["Fizyka", "Chemia", "Biologia", "Geografia", "Informatyka"],
    ["Matematyka", "Fizyka", "Informatyka", "Angielski", "Niemiecki"],
    ["Historia", "WOS", "Polski", "Angielski", "Geografia"],
    ["Matematyka", "Chemia", "Fizyka", "Biologia", "Geografia"],
  ];
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const subjects = subjectSets[i % subjectSets.length]!;
    const average = 3 + (i % 3);
    const values = [
      average - 1,
      average,
      average + 1,
      average,
      average,
    ];
    const sum = values.reduce((total, value) => total + value, 0);
    const { choices, correctIndex } = uniqueChoices(String(average), [
      String(average + 1),
      String(average - 1),
      String(sum),
      String(average + 2),
    ]);

    tasks.push(
      t(`gen-average-${i + 1}`, {
        title: `Średnia ocen #${i + 1}`,
        category: "arytmetyka",
        difficulty: "latwy",
        forPaths: FOR_BOTH,
        prompt: [
          "W tabeli podano oceny z pięciu przedmiotów.",
          "",
          table(
            ["Przedmiot", "Ocena"],
            subjects.map((subject, index) => [subject, values[index]!]),
          ),
          "",
          "Jaka jest średnia ocen z tych przedmiotów?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Suma ocen to ${values.join(" + ")} = ${sum}. Dzielimy przez 5: ${sum} : 5 = ${average}.`,
        solutionSteps: [
          `Dodaj oceny: ${values.join(" + ")} = ${sum}.`,
          `Podziel sumę przez liczbę przedmiotów: ${sum} : 5 = ${average}.`,
        ],
      }),
    );
  }

  return tasks;
}

function recipes(): Task[] {
  const dishes = [
    ["Naleśniki", [["Mąka", 200, "g"], ["Mleko", 300, "ml"], ["Jajka", 2, "szt."]]],
    ["Koktajl", [["Banan", 2, "szt."], ["Mleko", 400, "ml"], ["Miód", 100, "g"]]],
    ["Zupa", [["Ziemniaki", 600, "g"], ["Marchew", 200, "g"], ["Bulion", 800, "ml"]]],
    ["Ciasto", [["Mąka", 400, "g"], ["Cukier", 200, "g"], ["Masło", 200, "g"]]],
    ["Sałatka", [["Pomidory", 400, "g"], ["Ogórek", 200, "g"], ["Feta", 200, "g"]]],
  ] as const;
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const [dish, ingredients] = dishes[i % dishes.length]!;
    const selected = ingredients[i % ingredients.length]!;
    const [name, amount, unit] = selected;
    const needed = amount * 2.5;
    const correct = `${needed} ${unit}`;
    const { choices, correctIndex } = uniqueChoices(correct, [
      `${amount} ${unit}`,
      `${amount * 2} ${unit}`,
      `${amount * 3} ${unit}`,
      `${needed + 50} ${unit}`,
    ]);

    tasks.push(
      t(`gen-recipe-${i + 1}`, {
        title: `Przepis #${i + 1}`,
        category: "procenty",
        difficulty: "sredni",
        forPaths: FOR_BOTH,
        prompt: [
          `Przepis na ${dish} podaje ilości na 4 porcje. Chcesz przygotować 10 porcji.`,
          "",
          table(
            ["Składnik", "Na 4 porcje"],
            ingredients.map(([ingredientName, ingredientAmount, ingredientUnit]) => [
              ingredientName,
              `${ingredientAmount} ${ingredientUnit}`,
            ]),
          ),
          "",
          `Ile ${name.toLowerCase()} potrzeba na 10 porcji?`,
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `10 porcji to 2,5 razy więcej niż 4 porcje. ${amount} ${unit} · 2,5 = ${needed} ${unit}.`,
        solutionSteps: [
          "Oblicz stosunek porcji: 10 : 4 = 2,5.",
          `Pomnóż ilość: ${amount} ${unit} · 2,5 = ${needed} ${unit}.`,
        ],
        hint: "Ile razy więcej porcji przygotowujesz?",
      }),
    );
  }

  return tasks;
}

function ticketSales(): Task[] {
  const events = [
    "Koncert",
    "Festiwal",
    "Mecz",
    "Teatr",
    "Kino",
    "Wystawa",
    "Kabaret",
    "Stand-up",
    "Opera",
    "Balet",
  ];
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const days = ["piątek", "sobota", "niedziela"];
    const counts = [30 + (i % 4) * 10, 50 + (i % 5) * 10, 40 + (i % 3) * 10];
    const prices = [20 + (i % 3) * 5, 20 + (i % 3) * 5, 25 + (i % 4) * 5];
    const revenues = counts.map((count, index) => count * prices[index]!);
    const total = revenues.reduce((sum, value) => sum + value, 0);
    const { choices, correctIndex } = uniqueChoices(money(total), [
      money(revenues[0]!),
      money(revenues[1]!),
      money(total + 100),
      money(total - 50),
    ]);

    tasks.push(
      t(`gen-tickets-${i + 1}`, {
        title: `Sprzedaż biletów #${i + 1}`,
        category: "arytmetyka",
        difficulty: "sredni",
        forPaths: FOR_BOTH,
        prompt: [
          `W tabeli podano sprzedaż biletów na ${events[i]!.toLowerCase()} w kolejne dni.`,
          "",
          table(
            ["Dzień", "Liczba biletów", "Cena biletu"],
            days.map((day, index) => [
              day,
              counts[index]!,
              money(prices[index]!),
            ]),
          ),
          "",
          "Jaki był łączny przychód ze sprzedaży biletów?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: days
          .map(
            (day, index) =>
              `${day}: ${counts[index]} · ${prices[index]} = ${revenues[index]} zł`,
          )
          .concat(`Razem: ${total} zł.`)
          .join(" "),
        solutionSteps: [
          `Policz przychód w piątek: ${counts[0]} · ${prices[0]} = ${revenues[0]} zł.`,
          `Policz sobotę: ${counts[1]} · ${prices[1]} = ${revenues[1]} zł.`,
          `Policz niedzielę: ${counts[2]} · ${prices[2]} = ${revenues[2]} zł.`,
          `Dodaj: ${revenues[0]} + ${revenues[1]} + ${revenues[2]} = ${total} zł.`,
        ],
      }),
    );
  }

  return tasks;
}

function probabilityTasks(): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const total = 50;
    const counts = [
      10 + (i % 4),
      12 + (i % 3),
      10 + ((i * 3) % 5),
    ];
    const last = total - counts[0]! - counts[1]! - counts[2]!;
    const values = [...counts, last];
    const even = values[1]! + values[3]!;
    const divisor = gcd(even, total);
    const correct = `${even / divisor}/${total / divisor}`;
    const other = total - even;
    const otherDivisor = gcd(other, total);
    const wrongs = [
      `${other / otherDivisor}/${total / otherDivisor}`,
      `${values[1]}/${total}`,
      `${values[3]}/${total}`,
      `${even / divisor + 1}/${total / divisor}`,
    ];
    const { choices, correctIndex } = uniqueChoices(correct, wrongs);

    tasks.push(
      t(`gen-probability-${i + 1}`, {
        title: `Prawdopodobieństwo z tabeli #${i + 1}`,
        category: "egzamin-8",
        difficulty: "sredni",
        forPaths: FOR_BOTH,
        prompt: [
          "W tabeli zapisano wyniki 50 rzutów kostką czworościenną.",
          "",
          table(
            ["Wynik", "1", "2", "3", "4"],
            [["Liczba rzutów", values[0]!, values[1]!, values[2]!, values[3]!]],
          ),
          "",
          "Jakie jest prawdopodobieństwo, że w kolejnym rzucie wypadnie liczba parzysta, jeśli oszacujemy je na podstawie tabeli?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Liczby parzyste to 2 i 4, czyli ${values[1]} + ${values[3]} = ${even} rzutów. Wszystkich rzutów było 50, więc prawdopodobieństwo to ${even}/50 = ${correct}.`,
        solutionSteps: [
          `Dodaj rzuty z parzystymi wynikami: ${values[1]} + ${values[3]} = ${even}.`,
          `Zapisz ułamek: ${even}/50.`,
          `Skróć ułamek przez ${divisor}: ${correct}.`,
        ],
        hint: "Najpierw policz sumę rzutów dla wyników parzystych.",
      }),
    );
  }

  return tasks;
}

function speedTasks(): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const distances = [
      60 + (i % 3) * 20,
      90 + (i % 4) * 10,
      120 + (i % 2) * 20,
    ];
    const times = [1, 1 + (i % 2), 2];
    const totalDistance = distances.reduce((sum, value) => sum + value, 0);
    const totalTime = times.reduce((sum, value) => sum + value, 0);
    const average = totalDistance / totalTime;
    const format = (value: number) =>
      Number.isInteger(value)
        ? `${value} km/h`
        : `${value.toFixed(1).replace(".", ",")} km/h`;
    const correct = format(average);
    const { choices, correctIndex } = uniqueChoices(correct, [
      format(average + 5),
      format(average - 5),
      format(distances[0]! / times[0]!),
      format(totalDistance / 2),
    ]);

    tasks.push(
      t(`gen-speed-${i + 1}`, {
        title: `Średnia prędkość #${i + 1}`,
        category: "funkcje",
        difficulty: "trudny",
        forPaths: ["srednia"],
        prompt: [
          "Autokar pokonał trzy odcinki trasy. W tabeli podano drogę i czas każdego odcinka.",
          "",
          table(
            ["Odcinek", "Droga", "Czas"],
            [
              ["A-B", `${distances[0]} km`, `${times[0]} h`],
              ["B-C", `${distances[1]} km`, `${times[1]} h`],
              ["C-D", `${distances[2]} km`, `${times[2]} h`],
            ],
          ),
          "",
          "Jaka była średnia prędkość autokaru na całej trasie?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Cała droga to ${distances[0]} + ${distances[1]} + ${distances[2]} = ${totalDistance} km. Cały czas to ${times[0]} + ${times[1]} + ${times[2]} = ${totalTime} h. Średnia prędkość to ${totalDistance} : ${totalTime} = ${format(average)}.`,
        solutionSteps: [
          `Dodaj drogę: ${distances[0]} + ${distances[1]} + ${distances[2]} = ${totalDistance} km.`,
          `Dodaj czas: ${times[0]} + ${times[1]} + ${times[2]} = ${totalTime} h.`,
          `Podziel drogę przez czas: ${totalDistance} : ${totalTime} = ${format(average)}.`,
        ],
        hint: "Średnia prędkość to cała droga podzielona przez cały czas, nie średnia prędkości z odcinków.",
      }),
    );
  }

  return tasks;
}

function linearTasks(): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const a = 2 + (i % 3);
    const b = 1 + (i % 4);
    const xs = [-2, -1, 0, 1, 2];
    const values = xs.map((x) => a * x + b);
    const correct = a * 5 + b;
    const { choices, correctIndex } = uniqueChoices(String(correct), [
      String(a * 4 + b),
      String(a * 6 + b),
      String(correct + 1),
      String(correct - 2),
    ]);

    tasks.push(
      t(`gen-linear-${i + 1}`, {
        title: `Funkcja liniowa #${i + 1}`,
        category: "funkcje",
        difficulty: "sredni",
        forPaths: ["srednia"],
        prompt: [
          "W tabeli podano kilka wartości funkcji liniowej f.",
          "",
          table(["x", "f(x)"], xs.map((x, index) => [x, values[index]!])),
          "",
          "Jaka jest wartość f(5)?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Z tabeli widać, że każde zwiększenie x o 1 zwiększa f(x) o ${a}. Wzór to f(x) = ${a}x + ${b}, więc f(5) = ${a} · 5 + ${b} = ${correct}.`,
        solutionSteps: [
          `Odczytaj różnicę: f(0) = ${b}, f(1) = ${a + b}, więc współczynnik kierunkowy to ${a}.`,
          `Zapisz wzór: f(x) = ${a}x + ${b}.`,
          `Policz f(5): ${a} · 5 + ${b} = ${correct}.`,
        ],
      }),
    );
  }

  return tasks;
}

function quadraticTasks(): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const p = -2 + (i % 3);
    const q = 1 + (i % 4);
    const xs = [-2, -1, 0, 1, 2];
    const values = xs.map((x) => x * x + p * x + q);
    const correct = 9 + 3 * p + q;
    const { choices, correctIndex } = uniqueChoices(String(correct), [
      String(9 - 3 * p + q),
      String(4 + 2 * p + q),
      String(correct + 1),
      String(16 + 4 * p + q),
    ]);

    tasks.push(
      t(`gen-quadratic-${i + 1}`, {
        title: `Funkcja kwadratowa #${i + 1}`,
        category: "funkcje",
        difficulty: "trudny",
        forPaths: ["srednia"],
        prompt: [
          "W tabeli podano kilka wartości funkcji kwadratowej f.",
          "",
          table(["x", "f(x)"], xs.map((x, index) => [x, values[index]!])),
          "",
          "Jaka jest wartość f(3)?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Z tabeli można odtworzyć wzór f(x) = x² ${p < 0 ? "-" : "+"} ${Math.abs(p)}x + ${q}. Dla x = 3: 9 ${p < 0 ? "-" : "+"} ${Math.abs(3 * p)} + ${q} = ${correct}.`,
        solutionSteps: [
          `Zapisz wzór funkcji: f(x) = x² ${p < 0 ? "-" : "+"} ${Math.abs(p)}x + ${q}.`,
          `Podstaw x = 3: 9 ${p < 0 ? "-" : "+"} ${Math.abs(3 * p)} + ${q}.`,
          `Policz wynik: ${correct}.`,
        ],
      }),
    );
  }

  return tasks;
}

function arithmeticTasks(): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const first = 2 + (i % 5);
    const difference = 2 + (i % 4);
    const values = [1, 2, 3, 4].map(
      (n) => first + (n - 1) * difference,
    );
    const correct = first + 9 * difference;
    const { choices, correctIndex } = uniqueChoices(String(correct), [
      String(first + 8 * difference),
      String(first + 10 * difference),
      String(first * 10),
      String(first + 9 * difference + 2),
    ]);

    tasks.push(
      t(`gen-arithmetic-${i + 1}`, {
        title: `Ciąg arytmetyczny #${i + 1}`,
        category: "ciagi",
        difficulty: "sredni",
        forPaths: ["srednia"],
        prompt: [
          "W tabeli podano pierwsze wyrazy ciągu arytmetycznego.",
          "",
          table(
            ["n", "aₙ"],
            values.map((value, index) => [index + 1, value]),
          ),
          "",
          "Ile wynosi dziesiąty wyraz tego ciągu?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Pierwszy wyraz to ${first}, a różnica to ${difference}. Wzór: aₙ = ${first} + (n - 1) · ${difference}. Dla n = 10: ${first} + 9 · ${difference} = ${correct}.`,
        solutionSteps: [
          `Odczytaj pierwszy wyraz: a₁ = ${first}.`,
          `Oblicz różnicę: a₂ - a₁ = ${values[1]} - ${first} = ${difference}.`,
          `Podstaw do wzoru: a₁₀ = ${first} + 9 · ${difference} = ${correct}.`,
        ],
      }),
    );
  }

  return tasks;
}

function geometricTasks(): Task[] {
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const first = 2 + (i % 5);
    const ratio = 2 + (i % 2);
    const values = [1, 2, 3, 4].map(
      (n) => first * ratio ** (n - 1),
    );
    const correct = first * ratio ** 5;
    const { choices, correctIndex } = uniqueChoices(String(correct), [
      String(first * ratio ** 4),
      String(first * ratio ** 6),
      String(first * 6),
      String(correct + ratio),
    ]);

    tasks.push(
      t(`gen-geometric-${i + 1}`, {
        title: `Ciąg geometryczny #${i + 1}`,
        category: "ciagi",
        difficulty: "sredni",
        forPaths: ["srednia"],
        prompt: [
          "W tabeli podano pierwsze wyrazy ciągu geometrycznego.",
          "",
          table(
            ["n", "aₙ"],
            values.map((value, index) => [index + 1, value]),
          ),
          "",
          "Ile wynosi szósty wyraz tego ciągu?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Pierwszy wyraz to ${first}, a iloraz to ${ratio}. Wzór: aₙ = ${first} · ${ratio}ⁿ⁻¹. Dla n = 6: ${first} · ${ratio}⁵ = ${correct}.`,
        solutionSteps: [
          `Odczytaj pierwszy wyraz: a₁ = ${first}.`,
          `Oblicz iloraz: a₂ : a₁ = ${values[1]} : ${first} = ${ratio}.`,
          `Podstaw do wzoru: a₆ = ${first} · ${ratio}⁵ = ${correct}.`,
        ],
      }),
    );
  }

  return tasks;
}

function logarithmTasks(): Task[] {
  const bases = [2, 3, 5];
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const base = bases[i % bases.length]!;
    const exponent = 2 + (i % 4);
    const value = base ** exponent;
    const { choices, correctIndex } = uniqueChoices(String(exponent), [
      String(exponent + 1),
      String(exponent - 1),
      String(value),
      String(exponent + 2),
    ]);

    tasks.push(
      t(`gen-logarithm-${i + 1}`, {
        title: `Logarytm z tabeli #${i + 1}`,
        category: "logarytmy",
        difficulty: "sredni",
        forPaths: ["srednia"],
        prompt: [
          "W tabeli podano kolejne potęgi pewnej liczby.",
          "",
          table(
            ["Potęga", "Wartość"],
            [1, 2, 3, 4].map((power) => [
              `$${base}^{${power}}$`,
              base ** power,
            ]),
          ),
          "",
          `Ile wynosi $\\log_{${base}}(${value})$?`,
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `${base} podniesione do potęgi ${exponent} daje ${value}, więc $\\log_{${base}}(${value}) = ${exponent}$.`,
        solutionSteps: [
          `Szukamy wykładnika $x$, dla którego $${base}^x = ${value}$.`,
          `Z tabeli odczytujemy, że $${base}^{${exponent}} = ${value}$.`,
          `Zatem $\\log_{${base}}(${value}) = ${exponent}$.`,
        ],
      }),
    );
  }

  return tasks;
}

function trigonometryTasks(): Task[] {
  const questions = [
    {
      text: "Ile wynosi sin 30° + cos 60°?",
      correct: "1",
      wrongs: ["1/2", "0", "2"],
      explanation: "sin 30° = 1/2 i cos 60° = 1/2, więc suma wynosi 1.",
    },
    {
      text: "Ile wynosi sin 45° · cos 45°?",
      correct: "1/2",
      wrongs: ["1", "1/4", "√2/2"],
      explanation: "sin 45° = √2/2 i cos 45° = √2/2, więc iloczyn to 2/4 = 1/2.",
    },
    {
      text: "Ile wynosi sin 60° : cos 30°?",
      correct: "1",
      wrongs: ["√3", "1/2", "2"],
      explanation: "sin 60° = √3/2 i cos 30° = √3/2, więc iloraz wynosi 1.",
    },
    {
      text: "Ile wynosi cos 60° + sin 30°?",
      correct: "1",
      wrongs: ["1/2", "√3/2", "0"],
      explanation: "cos 60° = 1/2 i sin 30° = 1/2, więc suma wynosi 1.",
    },
    {
      text: "Ile wynosi sin 30° · cos 60°?",
      correct: "1/4",
      wrongs: ["1/2", "1", "0"],
      explanation: "sin 30° = 1/2 i cos 60° = 1/2, więc iloczyn to 1/4.",
    },
    {
      text: "Ile wynosi cos 30° · cos 60°?",
      correct: "√3/4",
      wrongs: ["√3/2", "1/2", "3/4"],
      explanation: "cos 30° = √3/2 i cos 60° = 1/2, więc iloczyn to √3/4.",
    },
    {
      text: "Ile wynosi sin 90° - cos 0°?",
      correct: "0",
      wrongs: ["1", "2", "-1"],
      explanation: "sin 90° = 1 i cos 0° = 1, więc różnica wynosi 0.",
    },
    {
      text: "Ile wynosi sin 45° + cos 45°?",
      correct: "√2",
      wrongs: ["1", "√2/2", "2"],
      explanation: "sin 45° = √2/2 i cos 45° = √2/2, więc suma to √2.",
    },
    {
      text: "Ile wynosi cos 30° : sin 60°?",
      correct: "1",
      wrongs: ["√3", "1/2", "2"],
      explanation: "cos 30° = √3/2 i sin 60° = √3/2, więc iloraz wynosi 1.",
    },
    {
      text: "Ile wynosi sin 60° · cos 30°?",
      correct: "3/4",
      wrongs: ["1/2", "√3/4", "1"],
      explanation: "sin 60° = √3/2 i cos 30° = √3/2, więc iloczyn to 3/4.",
    },
  ];
  const tasks: Task[] = [];

  for (let i = 0; i < 10; i++) {
    const question = questions[i % questions.length]!;
    const { choices, correctIndex } = uniqueChoices(
      question.correct,
      question.wrongs,
    );

    tasks.push(
      t(`gen-trigonometry-${i + 1}`, {
        title: `Trygonometria z tabeli #${i + 1}`,
        category: "trygonometria",
        difficulty: "sredni",
        forPaths: ["srednia"],
        prompt: [
          "W tabeli podano wartości funkcji trygonometrycznych dla wybranych kątów.",
          "",
          table(
            ["Kąt", "sin", "cos"],
            [
              ["0°", "0", "1"],
              ["30°", "1/2", "√3/2"],
              ["45°", "√2/2", "√2/2"],
              ["60°", "√3/2", "1/2"],
              ["90°", "1", "0"],
            ],
          ),
          "",
          question.text,
        ].join("\n"),
        choices,
        correctIndex,
        explanation: question.explanation,
      }),
    );
  }

  return tasks;
}

/** 140 unikalnych wariantów z tabelami, po 10 na rodzinę. */
export function generateTableTasks(): Task[] {
  return [
    ...offers(),
    ...budgets(),
    ...discounts(),
    ...averages(),
    ...recipes(),
    ...ticketSales(),
    ...probabilityTasks(),
    ...speedTasks(),
    ...linearTasks(),
    ...quadraticTasks(),
    ...arithmeticTasks(),
    ...geometricTasks(),
    ...logarithmTasks(),
    ...trigonometryTasks(),
  ];
}
