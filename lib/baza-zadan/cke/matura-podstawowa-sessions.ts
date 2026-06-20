/**
 * Oficjalne arkusze maturalne — matematyka, poziom podstawowy.
 * Źródło treści przy imporcie: publiczne zestawienia zadań (sesje CKE).
 * Uczniowie widzą tylko treść w Supabase — bez linków zewnętrznych.
 */

export type CkeMaturaSession = {
  /** Unikalny slug do source_id, np. m23-maj */
  id: string;
  /** Nazwa arkusza w bazie, np. „Matura — maj 2023 — poziom podstawowy” */
  nazwa: string;
  rok: number;
  miesiac: number;
  /** URL strony z listą zadań (tylko do skryptu importu) */
  importUrl: string;
  /** Czy arkusz ma pełne dane w kodzie (bez fetch) */
  bundled?: boolean;
  /**
   * false = na stronie źródłowej brak pełnej treści zadań (tylko PDF).
   * Takie arkusze pomijamy w imporcie automatycznym.
   */
  importable?: boolean;
};

const BASE =
  "https://www.dlamaturzysty.info/s/1625/36234-Matura-arkusze-maturalne";

function u(path: string): string {
  return `${BASE}/${path}`;
}

/** Wszystkie sesje podstawowe w katalogu (nie wszystkie mają treść online). */
export const CKE_MATURA_PODSTAWOWA_SESSIONS: CkeMaturaSession[] = [
  {
    id: "m26-probna",
    nazwa: "Matura — próbna 2026 — poziom podstawowy",
    rok: 2026,
    miesiac: 3,
    importUrl: u(
      "141972-Matematyka-matura-2026-probna-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
    importable: false,
  },
  {
    id: "m25-maj",
    nazwa: "Matura — maj 2025 — poziom podstawowy",
    rok: 2025,
    miesiac: 5,
    importUrl: u(
      "141921-Matematyka-matura-2025-maj-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m25-probna",
    nazwa: "Matura — próbna 2025 — poziom podstawowy",
    rok: 2025,
    miesiac: 12,
    importUrl: u(
      "141892-Matematyka-matura-2025-probna-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
    importable: false,
  },
  {
    id: "m24-maj",
    nazwa: "Matura — maj 2024 — poziom podstawowy",
    rok: 2024,
    miesiac: 5,
    importUrl: u(
      "141838-Matematyka-matura-2024-maj-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
    bundled: true,
  },
  {
    id: "m23-maj",
    nazwa: "Matura — maj 2023 — poziom podstawowy",
    rok: 2023,
    miesiac: 5,
    importUrl: u(
      "141695-Matematyka-matura-2023-maj-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m23-probna-xii",
    nazwa: "Matura — próbna grudzień 2023 — poziom podstawowy",
    rok: 2023,
    miesiac: 12,
    importUrl: u(
      "141596-Matematyka-matura-2023-probna-grudzien-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m23-probna-ix",
    nazwa: "Matura — próbna wrzesień 2023 — poziom podstawowy",
    rok: 2023,
    miesiac: 9,
    importUrl: u(
      "141609-Matematyka-matura-2023-probna-wrzesien-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m23-przykladowa",
    nazwa: "Matura — przykładowa 2023 — poziom podstawowy",
    rok: 2023,
    miesiac: 3,
    importUrl: u(
      "141647-Matematyka-matura-2023-przykladowa-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m22-maj",
    nazwa: "Matura — maj 2022 — poziom podstawowy",
    rok: 2022,
    miesiac: 5,
    importUrl: u(
      "141524-Matematyka-matura-2022-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m21-maj",
    nazwa: "Matura — maj 2021 — poziom podstawowy",
    rok: 2021,
    miesiac: 5,
    importUrl: u(
      "141462-Matematyka-matura-2021-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m21-probna",
    nazwa: "Matura — próbna 2021 — poziom podstawowy",
    rok: 2021,
    miesiac: 3,
    importUrl: u(
      "141427-Matematyka-matura-probna-2021-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m20-czerwiec",
    nazwa: "Matura — czerwiec 2020 — poziom podstawowy",
    rok: 2020,
    miesiac: 6,
    importUrl: u(
      "141352-Matematyka-matura-2020-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m20-probna",
    nazwa: "Matura — próbna 2020 — poziom podstawowy",
    rok: 2020,
    miesiac: 4,
    importUrl: u(
      "141416-Matematyka-matura-2020-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m19-maj",
    nazwa: "Matura — maj 2019 — poziom podstawowy",
    rok: 2019,
    miesiac: 5,
    importUrl: u(
      "141264-Matematyka-matura-2019-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m18-maj",
    nazwa: "Matura — maj 2018 — poziom podstawowy",
    rok: 2018,
    miesiac: 5,
    importUrl: u(
      "141184-Matematyka-matura-2018-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m17-maj",
    nazwa: "Matura — maj 2017 — poziom podstawowy",
    rok: 2017,
    miesiac: 5,
    importUrl: u(
      "137071-Matematyka-matura-2017-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m16-maj",
    nazwa: "Matura — maj 2016 — poziom podstawowy",
    rok: 2016,
    miesiac: 5,
    importUrl: u(
      "133100-Matematyka-matura-2016-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m15-maj",
    nazwa: "Matura — maj 2015 — poziom podstawowy",
    rok: 2015,
    miesiac: 5,
    importUrl: u(
      "133052-Matematyka-matura-2015-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m15-probna",
    nazwa: "Matura — próbna 2015 — poziom podstawowy",
    rok: 2015,
    miesiac: 12,
    importUrl: u(
      "141421-Matematyka-matura-probna-2015-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m15-przykladowa",
    nazwa: "Matura — przykładowa 2015 — poziom podstawowy",
    rok: 2015,
    miesiac: 12,
    importUrl: u(
      "141423-Matematyka-matura-przykladowa-dla-formuly-2015-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
  },
  {
    id: "m14-maj",
    nazwa: "Matura — maj 2014 — poziom podstawowy",
    rok: 2014,
    miesiac: 5,
    importUrl: u(
      "132998-Matematyka-matura-2014-poziom-podstawowy-pytania-i-odpowiedzi.htm",
    ),
    importable: false,
  },
  {
    id: "m13-maj",
    nazwa: "Matura — maj 2013 — poziom podstawowy",
    rok: 2013,
    miesiac: 5,
    importUrl: u("132892-Matematyka-matura-2013-poziom-podstawowy.htm"),
    importable: false,
  },
  {
    id: "m12-maj",
    nazwa: "Matura — maj 2012 — poziom podstawowy",
    rok: 2012,
    miesiac: 5,
    importUrl: u("132695-Matematyka-matura-2012-poziom-podstawowy.htm"),
    importable: false,
  },
  {
    id: "m11-maj",
    nazwa: "Matura — maj 2011 — poziom podstawowy",
    rok: 2011,
    miesiac: 5,
    importUrl: u("132523-Matematyka-matura-2011-poziom-podstawowy.htm"),
    importable: false,
  },
  {
    id: "m10-maj",
    nazwa: "Matura — maj 2010 — poziom podstawowy",
    rok: 2010,
    miesiac: 5,
    importUrl: u("132330-Matematyka-matura-2010-poziom-podstawowy.htm"),
    importable: false,
  },
  {
    id: "m09-maj",
    nazwa: "Matura — maj 2009 — poziom podstawowy",
    rok: 2009,
    miesiac: 5,
    importUrl: u(
      "131992-Matematyka-matura-2009-arkusz-I-poziom-podstawowy.htm",
    ),
    importable: false,
  },
  {
    id: "m08-maj",
    nazwa: "Matura — maj 2008 — poziom podstawowy",
    rok: 2008,
    miesiac: 5,
    importUrl: u(
      "131896-Matematyka-matura-2008-arkusz-I-poziom-podstawowy.htm",
    ),
    importable: false,
  },
  {
    id: "m07-maj",
    nazwa: "Matura — maj 2007 — poziom podstawowy",
    rok: 2007,
    miesiac: 5,
    importUrl: u("131759-Matematyka-matura-2007-arkusz-poziom-podstawowy.htm"),
    importable: false,
  },
];

/** Sesje z pełną treścią zadań do automatycznego importu (2015–2025 + próbne). */
export const CKE_MATURA_IMPORTABLE_SESSIONS = CKE_MATURA_PODSTAWOWA_SESSIONS.filter(
  (s) => s.importable !== false,
);

export const CKE_MATURA_CKE_URL =
  "https://cke.gov.pl/egzamin-maturalny/egzamin-maturalny-w-formule-2023/arkusze/";
