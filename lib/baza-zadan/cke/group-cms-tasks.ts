import type { ZadanieWithArkusz } from "@/lib/supabase/baza-zadan";
import {
  compareArkuszSession,
  sessionFromGroup,
} from "@/lib/baza-zadan/cke/sort-arkusze";

/** Arkusze z oficjalnych sesji maturalnych CKE (import seed:cke-matura). */
export function isCkeMaturaArkusz(z: ZadanieWithArkusz): boolean {
  const { typ, nazwa } = z.arkusz;
  if (typ !== "matura") return false;
  return (
    nazwa.startsWith("Matura -") ||
    nazwa.includes("poziom podstawowy") ||
    nazwa.includes("CKE")
  );
}

export type MaturaPoziom = "podstawowa" | "rozszerzona" | "inne";

/** Poziom matury z nazwy arkusza (brak osobnej kolumny w schemacie). */
export function maturaPoziomFromNazwa(nazwa: string): MaturaPoziom {
  if (/rozszerzon/i.test(nazwa)) return "rozszerzona";
  if (/podstawow/i.test(nazwa)) return "podstawowa";
  return "inne";
}

/** Krótka etykieta źródła arkusza na liście /arkusze. */
export function arkuszMaturaBadge(z: ZadanieWithArkusz): string {
  if (z.arkusz.typ !== "matura") return "";
  if (isCkeMaturaArkusz(z)) {
    const poziom = maturaPoziomFromNazwa(z.arkusz.nazwa);
    return poziom === "podstawowa" ? "CKE · podstawowa" : `CKE · ${poziom}`;
  }
  const poziom = maturaPoziomFromNazwa(z.arkusz.nazwa);
  return poziom === "inne" ? "Trening · matura" : `Trening · ${poziom}`;
}

export type CmsArkuszGroup = {
  arkuszId: string;
  label: string;
  typ: ZadanieWithArkusz["arkusz"]["typ"];
  tasks: ZadanieWithArkusz[];
};

export function groupCmsTasksByArkusz(
  tasks: ZadanieWithArkusz[],
): CmsArkuszGroup[] {
  const map = new Map<string, ZadanieWithArkusz[]>();

  for (const z of tasks) {
    const list = map.get(z.arkusz_id) ?? [];
    list.push(z);
    map.set(z.arkusz_id, list);
  }

  const groups: CmsArkuszGroup[] = [];

  for (const [, list] of map) {
    const sorted = [...list].sort(
      (a, b) => a.numer_zadania - b.numer_zadania,
    );
    const first = sorted[0];
    if (!first) continue;
    groups.push({
      arkuszId: first.arkusz_id,
      label: first.arkusz.nazwa,
      typ: first.arkusz.typ,
      tasks: sorted,
    });
  }

  return groups.sort((a, b) =>
    compareArkuszSession(
      sessionFromGroup(a.tasks[0]),
      sessionFromGroup(b.tasks[0]),
    ),
  );
}

export type CmsYearGroup = {
  year: number;
  groups: CmsArkuszGroup[];
};

/** Grupuje arkusze CMS po roku (malejąco) - czytelniejszy katalog bazy. */
export function groupCmsTasksByYear(
  groups: CmsArkuszGroup[],
): CmsYearGroup[] {
  const map = new Map<number, CmsArkuszGroup[]>();

  for (const group of groups) {
    const year = group.tasks[0]?.arkusz.rok ?? 0;
    const list = map.get(year) ?? [];
    list.push(group);
    map.set(year, list);
  }

  return [...map.entries()]
    .sort(([yearA], [yearB]) => yearB - yearA)
    .map(([year, yearGroups]) => ({
      year,
      groups: [...yearGroups].sort((a, b) =>
        compareArkuszSession(
          sessionFromGroup(a.tasks[0]),
          sessionFromGroup(b.tasks[0]),
        ),
      ),
    }));
}

export function splitCmsTasks(tasks: ZadanieWithArkusz[]) {
  const cke: ZadanieWithArkusz[] = [];
  const other: ZadanieWithArkusz[] = [];

  for (const z of tasks) {
    if (isCkeMaturaArkusz(z)) cke.push(z);
    else other.push(z);
  }

  return {
    ckeGroups: groupCmsTasksByArkusz(cke),
    otherGroups: groupCmsTasksByArkusz(other),
  };
}
