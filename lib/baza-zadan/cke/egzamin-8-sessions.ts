export type Egzamin8Session = {
  id: string;
  title: string;
  year: number;
  month: number;
  taskPdfUrl: string;
  scoringPdfUrl: string;
};

const CKE_ROOT =
  "https://cke.gov.pl/images/_EGZAMIN_OSMOKLASISTY/Arkusze-egzaminacyjne";

/** Oficjalne standardowe arkusze matematyczne, wersja X. */
export const EGZAMIN_8_SESSIONS: readonly Egzamin8Session[] = [
  {
    id: "e8-2025-maj",
    title: "Egzamin ósmoklasisty — matematyka — maj 2025",
    year: 2025,
    month: 5,
    taskPdfUrl: `${CKE_ROOT}/2025/matematyka/OMAP-100-X-2505-zeszyt-zadan.pdf`,
    scoringPdfUrl: `${CKE_ROOT}/2025/matematyka/OMAP-100-2505-zasady.pdf`,
  },
  {
    id: "e8-2024-maj",
    title: "Egzamin ósmoklasisty — matematyka — maj 2024",
    year: 2024,
    month: 5,
    taskPdfUrl: `${CKE_ROOT}/2024/matematyka/OMAP-100-X-2405-zeszyt-zadan.pdf`,
    scoringPdfUrl: `${CKE_ROOT}/2024/matematyka/OMAP-100-2405-zasady.pdf`,
  },
] as const;

