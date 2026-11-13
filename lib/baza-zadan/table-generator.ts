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
  return `${value} zĹ‚`;
}

function offers(): Task[] {
  const providers = [
    "NetLink",
    "ĹšwiatĹ‚owĂłd+",
    "FiberGo",
    "DomNet",
    "SzybkiNet",
    "Orbita",
    "TeleStrumieĹ„",
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
          `PorĂłwnaj oferty internetu na 12 miesiÄ™cy.`,
          "",
          table(
            ["Dostawca", "MiesiÄ…c", "Aktywacja", "Router"],
            [
              [providers[i]!, money(prices[0]!), money(activation), money(routers)],
              [providers[(i + 1) % providers.length]!, money(prices[1]!), money(oneTime[1]!), money(0)],
              [providers[(i + 2) % providers.length]!, money(prices[2]!), money(0), money(oneTime[2]!)],
            ],
          ),
          "",
          "Ile wynosi najniĹĽszy koszt caĹ‚kowity po 12 miesiÄ…cach?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Koszt pierwszej oferty to 12 Â· ${prices[0]} + ${oneTime[0]} = ${totals[0]} zĹ‚, drugiej ${totals[1]} zĹ‚, trzeciej ${totals[2]} zĹ‚. Najtaniej wychodzi ${cheapest} zĹ‚.`,
        solutionSteps: [
          `Policz 12 miesiÄ™cy dla pierwszej oferty: 12 Â· ${prices[0]} zĹ‚ = ${prices[0]! * 12} zĹ‚, dodaj ${oneTime[0]} zĹ‚, razem ${totals[0]} zĹ‚.`,
          `Dla drugiej oferty: 12 Â· ${prices[1]} zĹ‚ + ${oneTime[1]} zĹ‚ = ${totals[1]} zĹ‚.`,
          `Dla trzeciej oferty: 12 Â· ${prices[2]} zĹ‚ + ${oneTime[2]} zĹ‚ = ${totals[2]} zĹ‚.`,
          `NajniĹĽsza suma to ${cheapest} zĹ‚.`,
        ],
        hint: "Do opĹ‚aty miesiÄ™cznej dodaj wszystkie jednorazowe koszty.",
      }),
    );
  }

  return tasks;
}

function budgets(): Task[] {
  const trips = [
    "KrakĂłw",
    "GdaĹ„sk",
    "WrocĹ‚aw",
    "PoznaĹ„",
    "Zakopane",
    "ToruĹ„",
    "Lublin",
    "Szczecin",
    "BiaĹ‚ystok",
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
        title: `BudĹĽet wycieczki #${i + 1}`,
        category: "arytmetyka",
        difficulty: i % 4 === 0 ? "sredni" : "latwy",
        forPaths: FOR_BOTH,
        prompt: [
          `Wycieczka do ${trips[i]} ma budĹĽet ${money(budget)}. W tabeli zapisano planowane wydatki.`,
          "",
          table(
            ["Wydatek", "Kwota"],
            [
              ["Transport", money(transport)],
              ["Nocleg", money(hotel)],
              ["WyĹĽywienie", money(food)],
              ["Bilety", money(tickets)],
            ],
          ),
          "",
          "Ile pieniÄ™dzy zostanie z budĹĽetu?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Suma wydatkĂłw to ${transport} + ${hotel} + ${food} + ${tickets} = ${total} zĹ‚. Z budĹĽetu ${budget} zĹ‚ zostaje ${left} zĹ‚.`,
        solutionSteps: [
          `Dodaj wydatki: ${transport} + ${hotel} + ${food} + ${tickets} = ${total} zĹ‚.`,
          `Odejmij sumÄ™ od budĹĽetu: ${budget} - ${total} = ${left} zĹ‚.`,
        ],
        hint: "Najpierw zsumuj wszystkie wydatki, potem odejmij je od budĹĽetu.",
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
      ["ĹšpiwĂłr", 240],
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
      ["Ĺadowarka", 80],
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
          "W tabeli podano ceny produktĂłw i rabat na kaĹĽdy z nich.",
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
          "Ile zapĹ‚acisz Ĺ‚Ä…cznie po rabatach?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: values
          .map(
            (item) =>
              `${item.name}: ${item.price} - ${item.percent}% = ${item.final} zĹ‚`,
          )
          .concat(`Razem: ${total} zĹ‚.`)
          .join(" "),
        solutionSteps: values.map(
          (item) =>
            `Policz rabat dla produktu ${item.name}: ${item.percent}% z ${item.price} zĹ‚ to ${item.price - item.final} zĹ‚, wiÄ™c zostaje ${item.final} zĹ‚.`,
        ),
        hint: "Rabat licz od ceny kaĹĽdego produktu osobno.",
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
        title: `Ĺšrednia ocen #${i + 1}`,
        category: "arytmetyka",
        difficulty: "latwy",
        forPaths: FOR_BOTH,
        prompt: [
          "W tabeli podano oceny z piÄ™ciu przedmiotĂłw.",
          "",
          table(
            ["Przedmiot", "Ocena"],
            subjects.map((subject, index) => [subject, values[index]!]),
          ),
          "",
          "Jaka jest Ĺ›rednia ocen z tych przedmiotĂłw?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Suma ocen to ${values.join(" + ")} = ${sum}. Dzielimy przez 5: ${sum} : 5 = ${average}.`,
        solutionSteps: [
          `Dodaj oceny: ${values.join(" + ")} = ${sum}.`,
          `Podziel sumÄ™ przez liczbÄ™ przedmiotĂłw: ${sum} : 5 = ${average}.`,
        ],
      }),
    );
  }

  return tasks;
}

function recipes(): Task[] {
  const dishes = [
    ["NaleĹ›niki", [["MÄ…ka", 200, "g"], ["Mleko", 300, "ml"], ["Jajka", 2, "szt."]]],
    ["Koktajl", [["Banan", 2, "szt."], ["Mleko", 400, "ml"], ["MiĂłd", 100, "g"]]],
    ["Zupa", [["Ziemniaki", 600, "g"], ["Marchew", 200, "g"], ["Bulion", 800, "ml"]]],
    ["Ciasto", [["MÄ…ka", 400, "g"], ["Cukier", 200, "g"], ["MasĹ‚o", 200, "g"]]],
    ["SaĹ‚atka", [["Pomidory", 400, "g"], ["OgĂłrek", 200, "g"], ["Feta", 200, "g"]]],
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
          `Przepis na ${dish} podaje iloĹ›ci na 4 porcje. Chcesz przygotowaÄ‡ 10 porcji.`,
          "",
          table(
            ["SkĹ‚adnik", "Na 4 porcje"],
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
        explanation: `10 porcji to 2,5 razy wiÄ™cej niĹĽ 4 porcje. ${amount} ${unit} Â· 2,5 = ${needed} ${unit}.`,
        solutionSteps: [
          "Oblicz stosunek porcji: 10 : 4 = 2,5.",
          `PomnĂłĹĽ iloĹ›Ä‡: ${amount} ${unit} Â· 2,5 = ${needed} ${unit}.`,
        ],
        hint: "Ile razy wiÄ™cej porcji przygotowujesz?",
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
    const days = ["piÄ…tek", "sobota", "niedziela"];
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
        title: `SprzedaĹĽ biletĂłw #${i + 1}`,
        category: "arytmetyka",
        difficulty: "sredni",
        forPaths: FOR_BOTH,
        prompt: [
          `W tabeli podano sprzedaĹĽ biletĂłw na ${events[i]!.toLowerCase()} w kolejne dni.`,
          "",
          table(
            ["DzieĹ„", "Liczba biletĂłw", "Cena biletu"],
            days.map((day, index) => [
              day,
              counts[index]!,
              money(prices[index]!),
            ]),
          ),
          "",
          "Jaki byĹ‚ Ĺ‚Ä…czny przychĂłd ze sprzedaĹĽy biletĂłw?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: days
          .map(
            (day, index) =>
              `${day}: ${counts[index]} Â· ${prices[index]} = ${revenues[index]} zĹ‚`,
          )
          .concat(`Razem: ${total} zĹ‚.`)
          .join(" "),
        solutionSteps: [
          `Policz przychĂłd w piÄ…tek: ${counts[0]} Â· ${prices[0]} = ${revenues[0]} zĹ‚.`,
          `Policz sobotÄ™: ${counts[1]} Â· ${prices[1]} = ${revenues[1]} zĹ‚.`,
          `Policz niedzielÄ™: ${counts[2]} Â· ${prices[2]} = ${revenues[2]} zĹ‚.`,
          `Dodaj: ${revenues[0]} + ${revenues[1]} + ${revenues[2]} = ${total} zĹ‚.`,
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
        title: `PrawdopodobieĹ„stwo z tabeli #${i + 1}`,
        category: "egzamin-8",
        difficulty: "sredni",
        forPaths: FOR_BOTH,
        prompt: [
          "W tabeli zapisano wyniki 50 rzutĂłw kostkÄ… czworoĹ›ciennÄ….",
          "",
          table(
            ["Wynik", "1", "2", "3", "4"],
            [["Liczba rzutĂłw", values[0]!, values[1]!, values[2]!, values[3]!]],
          ),
          "",
          "Jakie jest prawdopodobieĹ„stwo, ĹĽe w kolejnym rzucie wypadnie liczba parzysta, jeĹ›li oszacujemy je na podstawie tabeli?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Liczby parzyste to 2 i 4, czyli ${values[1]} + ${values[3]} = ${even} rzutĂłw. Wszystkich rzutĂłw byĹ‚o 50, wiÄ™c prawdopodobieĹ„stwo to ${even}/50 = ${correct}.`,
        solutionSteps: [
          `Dodaj rzuty z parzystymi wynikami: ${values[1]} + ${values[3]} = ${even}.`,
          `Zapisz uĹ‚amek: ${even}/50.`,
          `SkrĂłÄ‡ uĹ‚amek przez ${divisor}: ${correct}.`,
        ],
        hint: "Najpierw policz sumÄ™ rzutĂłw dla wynikĂłw parzystych.",
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
        title: `Ĺšrednia prÄ™dkoĹ›Ä‡ #${i + 1}`,
        category: "funkcje",
        difficulty: "trudny",
        forPaths: ["srednia"],
        prompt: [
          "Autokar pokonaĹ‚ trzy odcinki trasy. W tabeli podano drogÄ™ i czas kaĹĽdego odcinka.",
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
          "Jaka byĹ‚a Ĺ›rednia prÄ™dkoĹ›Ä‡ autokaru na caĹ‚ej trasie?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `CaĹ‚a droga to ${distances[0]} + ${distances[1]} + ${distances[2]} = ${totalDistance} km. CaĹ‚y czas to ${times[0]} + ${times[1]} + ${times[2]} = ${totalTime} h. Ĺšrednia prÄ™dkoĹ›Ä‡ to ${totalDistance} : ${totalTime} = ${format(average)}.`,
        solutionSteps: [
          `Dodaj drogÄ™: ${distances[0]} + ${distances[1]} + ${distances[2]} = ${totalDistance} km.`,
          `Dodaj czas: ${times[0]} + ${times[1]} + ${times[2]} = ${totalTime} h.`,
          `Podziel drogÄ™ przez czas: ${totalDistance} : ${totalTime} = ${format(average)}.`,
        ],
        hint: "Ĺšrednia prÄ™dkoĹ›Ä‡ to caĹ‚a droga podzielona przez caĹ‚y czas, nie Ĺ›rednia prÄ™dkoĹ›ci z odcinkĂłw.",
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
          "W tabeli podano kilka wartoĹ›ci funkcji liniowej f.",
          "",
          table(["x", "f(x)"], xs.map((x, index) => [x, values[index]!])),
          "",
          "Jaka jest wartoĹ›Ä‡ f(5)?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Z tabeli widaÄ‡, ĹĽe kaĹĽde zwiÄ™kszenie x o 1 zwiÄ™ksza f(x) o ${a}. WzĂłr to f(x) = ${a}x + ${b}, wiÄ™c f(5) = ${a} Â· 5 + ${b} = ${correct}.`,
        solutionSteps: [
          `Odczytaj rĂłĹĽnicÄ™: f(0) = ${b}, f(1) = ${a + b}, wiÄ™c wspĂłĹ‚czynnik kierunkowy to ${a}.`,
          `Zapisz wzĂłr: f(x) = ${a}x + ${b}.`,
          `Policz f(5): ${a} Â· 5 + ${b} = ${correct}.`,
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
          "W tabeli podano kilka wartoĹ›ci funkcji kwadratowej f.",
          "",
          table(["x", "f(x)"], xs.map((x, index) => [x, values[index]!])),
          "",
          "Jaka jest wartoĹ›Ä‡ f(3)?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Z tabeli moĹĽna odtworzyÄ‡ wzĂłr f(x) = xÂ˛ ${p < 0 ? "-" : "+"} ${Math.abs(p)}x + ${q}. Dla x = 3: 9 ${p < 0 ? "-" : "+"} ${Math.abs(3 * p)} + ${q} = ${correct}.`,
        solutionSteps: [
          `Zapisz wzĂłr funkcji: f(x) = xÂ˛ ${p < 0 ? "-" : "+"} ${Math.abs(p)}x + ${q}.`,
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
        title: `CiÄ…g arytmetyczny #${i + 1}`,
        category: "ciagi",
        difficulty: "sredni",
        forPaths: ["srednia"],
        prompt: [
          "W tabeli podano pierwsze wyrazy ciÄ…gu arytmetycznego.",
          "",
          table(
            ["n", "aâ‚™"],
            values.map((value, index) => [index + 1, value]),
          ),
          "",
          "Ile wynosi dziesiÄ…ty wyraz tego ciÄ…gu?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Pierwszy wyraz to ${first}, a rĂłĹĽnica to ${difference}. WzĂłr: aâ‚™ = ${first} + (n - 1) Â· ${difference}. Dla n = 10: ${first} + 9 Â· ${difference} = ${correct}.`,
        solutionSteps: [
          `Odczytaj pierwszy wyraz: aâ‚ = ${first}.`,
          `Oblicz rĂłĹĽnicÄ™: aâ‚‚ - aâ‚ = ${values[1]} - ${first} = ${difference}.`,
          `Podstaw do wzoru: aâ‚â‚€ = ${first} + 9 Â· ${difference} = ${correct}.`,
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
        title: `CiÄ…g geometryczny #${i + 1}`,
        category: "ciagi",
        difficulty: "sredni",
        forPaths: ["srednia"],
        prompt: [
          "W tabeli podano pierwsze wyrazy ciÄ…gu geometrycznego.",
          "",
          table(
            ["n", "aâ‚™"],
            values.map((value, index) => [index + 1, value]),
          ),
          "",
          "Ile wynosi szĂłsty wyraz tego ciÄ…gu?",
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `Pierwszy wyraz to ${first}, a iloraz to ${ratio}. WzĂłr: aâ‚™ = ${first} Â· ${ratio}âżâ»Âą. Dla n = 6: ${first} Â· ${ratio}âµ = ${correct}.`,
        solutionSteps: [
          `Odczytaj pierwszy wyraz: aâ‚ = ${first}.`,
          `Oblicz iloraz: aâ‚‚ : aâ‚ = ${values[1]} : ${first} = ${ratio}.`,
          `Podstaw do wzoru: aâ‚† = ${first} Â· ${ratio}âµ = ${correct}.`,
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
          "W tabeli podano kolejne potÄ™gi pewnej liczby.",
          "",
          table(
            ["PotÄ™ga", "WartoĹ›Ä‡"],
            [1, 2, 3, 4].map((power) => [
              `${base}^${power}`,
              base ** power,
            ]),
          ),
          "",
          `Ile wynosi log_${base}(${value})?`,
        ].join("\n"),
        choices,
        correctIndex,
        explanation: `${base} podniesione do potÄ™gi ${exponent} daje ${value}, wiÄ™c log_${base}(${value}) = ${exponent}.`,
        solutionSteps: [
          `Szukamy wykĹ‚adnika x, dla ktĂłrego ${base}^x = ${value}.`,
          `Z tabeli odczytujemy, ĹĽe ${base}^${exponent} = ${value}.`,
          `Zatem log_${base}(${value}) = ${exponent}.`,
        ],
      }),
    );
  }

  return tasks;
}

function trigonometryTasks(): Task[] {
  const questions = [
    {
      text: "Ile wynosi sin 30Â° + cos 60Â°?",
      correct: "1",
      wrongs: ["1/2", "0", "2"],
      explanation: "sin 30Â° = 1/2 i cos 60Â° = 1/2, wiÄ™c suma wynosi 1.",
    },
    {
      text: "Ile wynosi sin 45Â° Â· cos 45Â°?",
      correct: "1/2",
      wrongs: ["1", "1/4", "âš2/2"],
      explanation: "sin 45Â° = âš2/2 i cos 45Â° = âš2/2, wiÄ™c iloczyn to 2/4 = 1/2.",
    },
    {
      text: "Ile wynosi sin 60Â° : cos 30Â°?",
      correct: "1",
      wrongs: ["âš3", "1/2", "2"],
      explanation: "sin 60Â° = âš3/2 i cos 30Â° = âš3/2, wiÄ™c iloraz wynosi 1.",
    },
    {
      text: "Ile wynosi cos 60Â° + sin 30Â°?",
      correct: "1",
      wrongs: ["1/2", "âš3/2", "0"],
      explanation: "cos 60Â° = 1/2 i sin 30Â° = 1/2, wiÄ™c suma wynosi 1.",
    },
    {
      text: "Ile wynosi sin 30Â° Â· cos 60Â°?",
      correct: "1/4",
      wrongs: ["1/2", "1", "0"],
      explanation: "sin 30Â° = 1/2 i cos 60Â° = 1/2, wiÄ™c iloczyn to 1/4.",
    },
    {
      text: "Ile wynosi cos 30Â° Â· cos 60Â°?",
      correct: "âš3/4",
      wrongs: ["âš3/2", "1/2", "3/4"],
      explanation: "cos 30Â° = âš3/2 i cos 60Â° = 1/2, wiÄ™c iloczyn to âš3/4.",
    },
    {
      text: "Ile wynosi sin 90Â° - cos 0Â°?",
      correct: "0",
      wrongs: ["1", "2", "-1"],
      explanation: "sin 90Â° = 1 i cos 0Â° = 1, wiÄ™c rĂłĹĽnica wynosi 0.",
    },
    {
      text: "Ile wynosi sin 45Â° + cos 45Â°?",
      correct: "âš2",
      wrongs: ["1", "âš2/2", "2"],
      explanation: "sin 45Â° = âš2/2 i cos 45Â° = âš2/2, wiÄ™c suma to âš2.",
    },
    {
      text: "Ile wynosi cos 30Â° : sin 60Â°?",
      correct: "1",
      wrongs: ["âš3", "1/2", "2"],
      explanation: "cos 30Â° = âš3/2 i sin 60Â° = âš3/2, wiÄ™c iloraz wynosi 1.",
    },
    {
      text: "Ile wynosi sin 60Â° Â· cos 30Â°?",
      correct: "3/4",
      wrongs: ["1/2", "âš3/4", "1"],
      explanation: "sin 60Â° = âš3/2 i cos 30Â° = âš3/2, wiÄ™c iloczyn to 3/4.",
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
          "W tabeli podano wartoĹ›ci funkcji trygonometrycznych dla wybranych kÄ…tĂłw.",
          "",
          table(
            ["KÄ…t", "sin", "cos"],
            [
              ["0Â°", "0", "1"],
              ["30Â°", "1/2", "âš3/2"],
              ["45Â°", "âš2/2", "âš2/2"],
              ["60Â°", "âš3/2", "1/2"],
              ["90Â°", "1", "0"],
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

/** 140 unikalnych wariantĂłw z tabelami, po 10 na rodzinÄ™. */
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
