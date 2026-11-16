import {
  ALL_SCHOOL_CLASS_OPTIONS,
  schoolClassLabel,
  type SchoolClassPath,
} from "@/lib/learning-path";
import { buildTopicHref } from "@/lib/trening/slugs";
import {
  TRAINING_CURRICULUM,
  type TreningExamKey,
} from "@/lib/trening/curriculum";

export type ClassPlanTopic = {
  id: string;
  name: string;
  href: string;
};

export type ClassPlanCategory = {
  id: string;
  name: string;
  topics: ClassPlanTopic[];
};

export type ClassPlan = {
  value: SchoolClassPath;
  label: string;
  examKey: TreningExamKey | null;
  description: string;
  categories: ClassPlanCategory[];
  topicCount: number;
};

const E8_ALL = TRAINING_CURRICULUM["8_klasa"].categories.flatMap((category) =>
  category.topics.map((topic) => topic.id),
);

const MATURA_ALL = TRAINING_CURRICULUM.matura_podstawowa.categories.flatMap(
  (category) => category.topics.map((topic) => topic.id),
);

/**
 * Orientacyjne przypisanie tematów do klas. To nie jest oficjalna podstawa
 * programowa - szkoły mogą mieć inną kolejność. Celem jest plan „co warto
 * przerobić w tym roku”, a nie egzaminacyjna lista działów.
 */
const CLASS_TOPICS: Partial<Record<SchoolClassPath, readonly string[]>> = {
  "klasa-1": [],
  "klasa-2": [],
  "klasa-3": [],
  "klasa-4": [
    "liczby_calkowite",
    "ulamki",
    "kolejnosc_dzialan",
    "proste_i_odcinki",
    "katy",
    "obwody",
    "pola_figur",
    "symetrie",
    "os_liczbowa",
  ],
  "klasa-5": [
    "liczby_calkowite",
    "ulamki",
    "pola_figur",
    "obwody",
    "wielokaty",
    "bryly",
    "jednostki_i_pieniadze",
    "proste_i_odcinki",
    "katy",
    "symetrie",
  ],
  "klasa-6": [
    "ulamki",
    "procenty",
    "wyrazenia_algebraiczne",
    "rownania",
    "proporcje",
    "pola_figur",
    "obwody",
    "bryly",
    "objetosc_i_pole",
    "srednia",
    "diagramy",
    "proste_i_odcinki",
    "katy",
  ],
  "klasa-7": [
    "potegi",
    "pierwiastki",
    "notacja_wykladnicza",
    "podzielnosc",
    "pitagoras",
    "podobienstwo",
    "proporcjonalnosc",
    "katy",
    "wielokaty",
    "okrag_i_kolo",
    "symetrie",
    "procenty",
  ],
  "klasa-8": E8_ALL,
  "liceum-1": [
    "potegi",
    "logarytmy",
    "procenty",
    "zbiory_i_przedzialy",
    "wartosc_bezwzgledna",
    "kolejnosc_dzialan",
    "wyrazenia_algebraiczne",
    "wzory_skroconego_mnozenia",
    "rownania_liniowe",
    "nierownosci",
    "uklady_rownan",
    "funkcja_liniowa",
    "planimetria",
    "pitagoras_i_podobienstwo",
  ],
  "liceum-2": [
    "funkcja_kwadratowa",
    "wielomiany",
    "wyrazenia_wymierne",
    "ciag_arytmetyczny",
    "ciag_geometryczny",
    "sin_cos_tg",
    "twierdzenie_sinusow_cosinusow",
    "okrag_i_kolo",
    "kombinatoryka",
    "statystyka",
    "funkcja_wykladnicza",
  ],
  "liceum-3": [
    "funkcja_logarytmiczna",
    "proporcjonalnosc_odwrotna",
    "wlasnosci_funkcji",
    "odczyt_wykresu",
    "stereometria",
    "geometria_analityczna",
    "prawdopodobienstwo",
    "statystyka_zaawansowana",
    "zastosowania_trygonometrii",
    "tales_dwusieczna_okrag",
    "zadania_optymalizacyjne",
  ],
  "liceum-4": MATURA_ALL,
  "technikum-1": [],
  "technikum-2": [],
  "technikum-3": [],
  "technikum-4": [],
  "technikum-5": MATURA_ALL,
  "zawodowa-1": [],
  "zawodowa-2": [],
  "zawodowa-3": [],
  "zawodowa-4": MATURA_ALL,
  "zawodowa-5": MATURA_ALL,
};

// Technikum i branżowa korzystają z planu maturalnego, ale bez udawania, że
// program jest identyczny - opis w UI mówi o planie orientacyjnym.
CLASS_TOPICS["technikum-1"] = CLASS_TOPICS["liceum-1"];
CLASS_TOPICS["technikum-2"] = CLASS_TOPICS["liceum-2"];
CLASS_TOPICS["technikum-3"] = CLASS_TOPICS["liceum-3"];
CLASS_TOPICS["technikum-4"] = CLASS_TOPICS["liceum-4"];
CLASS_TOPICS["zawodowa-1"] = CLASS_TOPICS["liceum-1"];
CLASS_TOPICS["zawodowa-2"] = CLASS_TOPICS["liceum-2"];
CLASS_TOPICS["zawodowa-3"] = CLASS_TOPICS["liceum-3"];

function examKeyForClass(value: SchoolClassPath): TreningExamKey | null {
  if (value.startsWith("klasa-")) return "8_klasa";
  if (
    value.startsWith("liceum-") ||
    value.startsWith("technikum-") ||
    value.startsWith("zawodowa-")
  ) {
    return "matura_podstawowa";
  }
  return null;
}

export function getClassPlanOptions(): ReadonlyArray<{
  value: SchoolClassPath;
  label: string;
}> {
  return ALL_SCHOOL_CLASS_OPTIONS;
}

export function getClassPlan(value: SchoolClassPath): ClassPlan {
  const label = schoolClassLabel(value);
  const examKey = examKeyForClass(value);
  const allowed = new Set(CLASS_TOPICS[value] ?? []);

  if (!examKey || allowed.size === 0) {
    return {
      value,
      label,
      examKey,
      description:
        "Dla klas 1–3 nie mamy jeszcze osobnego planu tematycznego. Skorzystaj z minigier i działów szkoły podstawowej.",
      categories: [],
      topicCount: 0,
    };
  }

  const categories = TRAINING_CURRICULUM[examKey].categories
    .map((category) => {
      const topics = category.topics
        .filter((topic) => allowed.has(topic.id))
        .map((topic) => ({
          id: topic.id,
          name: topic.name,
          href: buildTopicHref(examKey, category.id, topic.id),
        }));
      return { id: category.id, name: category.name, topics };
    })
    .filter((category) => category.topics.length > 0);

  return {
    value,
    label,
    examKey,
    description:
      "Plan orientacyjny: tematy, które warto przerobić w tym roku. Kolejność może różnić się od programu Twojej szkoły.",
    categories,
    topicCount: categories.reduce(
      (sum, category) => sum + category.topics.length,
      0,
    ),
  };
}

/** Wszystkie slugi użyte w mapie - do testu spójności z drzewem CKE. */
export function allMappedTopicIds(): Set<string> {
  const ids = new Set<string>();
  for (const list of Object.values(CLASS_TOPICS)) {
    for (const id of list ?? []) ids.add(id);
  }
  return ids;
}
