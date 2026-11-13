import { uniqueChoices } from "@/lib/baza-zadan/task-generators";
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

/** 60 unikalnych wariantów z tabelami, po 10 na rodzinę. */
export function generateTableTasks(): Task[] {
  return [
    ...offers(),
    ...budgets(),
    ...discounts(),
    ...averages(),
    ...recipes(),
    ...ticketSales(),
  ];
}
