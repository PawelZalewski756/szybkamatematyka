export type HomeFeatureGroupId = "start" | "learn" | "check" | "progress";

export type HomeFeature = {
  id: string;
  group: HomeFeatureGroupId;
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
  featured?: boolean;
};

export const HOME_FEATURE_GROUPS: readonly {
  id: HomeFeatureGroupId;
  label: string;
  description: string;
}[] = [
  {
    id: "start",
    label: "Zacznij tutaj",
    description: "Najkrótsza droga od „nie wiem, od czego zacząć” do pierwszego zadania.",
  },
  {
    id: "learn",
    label: "Ucz się i utrwalaj",
    description: "Teoria, zadania i powtórki ułożone w jeden rytm.",
  },
  {
    id: "check",
    label: "Sprawdzaj i rywalizuj",
    description: "Sprawdziany, gry i ranking — żeby wiedza została na dłużej.",
  },
  {
    id: "progress",
    label: "Twój progres i wsparcie",
    description: "Postępy, asysta AI i rzeczy, które pomagają iść dalej.",
  },
];

export const HOME_FEATURES: readonly HomeFeature[] = [
  {
    id: "trening",
    group: "start",
    title: "Trening tematyczny",
    description:
      "Teoria, zadania i rozwiązania krok po kroku. Wybierasz temat i widzisz, co już umiesz.",
    href: "/trening",
    icon: "BookOpen",
    featured: true,
  },
  {
    id: "diagnoza",
    group: "start",
    title: "Diagnoza startowa",
    description:
      "8 pytań i konkretny wynik: od czego zacząć i co powtórzyć najpierw.",
    href: "/diagnostyka",
    icon: "Target",
  },
  {
    id: "arkusze",
    group: "start",
    title: "Arkusze CKE",
    description:
      "46 arkuszy z lat 2015–2026: matura podstawowa, rozszerzona i egzamin ósmoklasisty. Klucz i pełne rozwiązania w Pro.",
    href: "/trening/arkusze",
    icon: "FileText",
  },
  {
    id: "minigry",
    group: "start",
    title: "Minigry",
    description:
      "34 szybkie gry w trzech trybach. 60 sekund rachunków zamiast przewijania telefonu.",
    href: "/minigry",
    icon: "Gamepad2",
  },
  {
    id: "teoria",
    group: "learn",
    title: "Teoria",
    description:
      "134 lekcje z wzorami i przykładami. Krótko i konkretnie, bez akademickiego lania wody.",
    href: "/trening",
    icon: "ScrollText",
  },
  {
    id: "baza",
    group: "learn",
    title: "Baza zadań",
    description:
      "1926 zadań z filtrami po egzaminie, dziale i poziomie. Rozwiązania krok po kroku odblokowuje Pro.",
    href: "/baza-zadan",
    icon: "Library",
  },
  {
    id: "powtorki",
    group: "learn",
    title: "Powtórki",
    description:
      "Zadania wracają w rytmie spaced repetition — dokładnie wtedy, gdy zaczynasz je zapominać.",
    href: "#powtorki",
    icon: "RefreshCw",
  },
  {
    id: "plan-tygodnia",
    group: "learn",
    title: "Plan tygodnia",
    description:
      "7 dni, 2–3 zadania dziennie i jasny cel. Plan układa się z daty egzaminu i Twoich zaległości.",
    href: "#plan-tygodnia",
    icon: "CalendarRange",
    badge: "Nowe",
  },
  {
    id: "sprawdziany",
    group: "check",
    title: "Sprawdziany",
    description:
      "Generator klasówek: grupy A/B, punktacja, klucz i PDF w minutę. Dla nauczyciela i dla siebie.",
    href: "#sprawdziany",
    icon: "ClipboardCheck",
  },
  {
    id: "wyzwania",
    group: "check",
    title: "Wyzwania",
    description:
      "5 pytań dziennie i seria dni. Mały rytuał, który trzyma Cię w nauce.",
    href: "/wyzwania",
    icon: "Flame",
  },
  {
    id: "pojedynki",
    group: "check",
    title: "Pojedynki",
    description:
      "1v1 na żywo, na kod, na jednym urządzeniu albo z botem. Ten sam zestaw pytań, jeden zwycięzca.",
    href: "/pojedynki",
    icon: "Swords",
  },
  {
    id: "ranking",
    group: "check",
    title: "Ranking i osiągnięcia",
    description:
      "Top 20 w trzech kategoriach i 26 odznak do zdobycia. Sprawdź, ile brakuje Ci do podium.",
    href: "#ranking",
    icon: "Trophy",
  },
  {
    id: "profil",
    group: "progress",
    title: "Profil i postępy",
    description:
      "XP, poziom, seria, historia zadań i raport do druku. Widzisz, że idziesz do przodu.",
    href: "/profil",
    icon: "UserRound",
  },
  {
    id: "ai",
    group: "progress",
    title: "Asystent AI",
    description:
      "Podpowiedź, gdy utkniesz, i ocena zadań otwartych. Bez podawania gotowca.",
    href: "#ai",
    icon: "Sparkles",
    badge: "Pro",
  },
  {
    id: "matura-rozszerzona",
    group: "progress",
    title: "Matura rozszerzona",
    description:
      "12 oficjalnych arkuszy i mapa zakresu. Pełna ścieżka tematyczna w przygotowaniu.",
    href: "/matura-rozszerzona",
    icon: "GraduationCap",
    badge: "W przygotowaniu",
  },
  {
    id: "polecenia",
    group: "progress",
    title: "Program poleceń",
    description:
      "Zaproś 2 znajomych, którzy naprawdę zaczną ćwiczyć, i odbierz 30 dni Pro.",
    href: "/polecenia",
    icon: "Gift",
  },
];
