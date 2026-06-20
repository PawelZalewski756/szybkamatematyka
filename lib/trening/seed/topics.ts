import { CKE_EGZAMIN_8 } from "@/lib/trening/cke-egzamin-8";
import { CKE_MATURA_PODSTAWOWA } from "@/lib/trening/cke-matura-podstawowa";
import type { ExamType } from "@/types/database";

export type SeedTopicSlot = {
  exam_type: ExamType;
  category: string;
  topic: string;
  /** Waga przy podziale liczby zadań (większa = więcej zadań). */
  weight: number;
};

/** Wszystkie tematy z drzewa CKE matury podstawowej. */
function maturaSlots(): SeedTopicSlot[] {
  const slots: SeedTopicSlot[] = [];
  for (const cat of CKE_MATURA_PODSTAWOWA.categories) {
    for (const topic of cat.topics) {
      slots.push({
        exam_type: "matura_podstawowa",
        category: cat.slug,
        topic: topic.slug,
        weight: 3,
      });
    }
  }
  return slots;
}

/** Tematy egzaminu 8-klasisty (rozszerzone o działy CKE poza minimalnym drzewem UI). */
function osmoklasistaSlots(): SeedTopicSlot[] {
  const slots: SeedTopicSlot[] = [];
  for (const cat of CKE_EGZAMIN_8.categories) {
    for (const topic of cat.topics) {
      slots.push({
        exam_type: "8_klasa",
        category: cat.slug,
        topic: topic.slug,
        weight: 3,
      });
    }
  }
  const extra: Omit<SeedTopicSlot, "exam_type">[] = [
    { category: "liczby", topic: "potegi", weight: 2 },
    { category: "liczby", topic: "procenty", weight: 2 },
    { category: "algebra", topic: "wyrazenia_algebraiczne", weight: 2 },
    { category: "algebra", topic: "rownania", weight: 2 },
    { category: "geometria", topic: "obwody", weight: 2 },
    { category: "geometria", topic: "katy", weight: 2 },
    { category: "funkcje", topic: "wykresy", weight: 2 },
    { category: "statystyka", topic: "srednia", weight: 2 },
    { category: "statystyka", topic: "diagramy", weight: 2 },
    { category: "kombinatoryka", topic: "prawdopodobienstwo", weight: 2 },
  ];
  const seen = new Set(slots.map((s) => `${s.category}:${s.topic}`));
  for (const e of extra) {
    const key = `${e.category}:${e.topic}`;
    if (seen.has(key)) continue;
    seen.add(key);
    slots.push({ exam_type: "8_klasa", ...e });
  }
  return slots;
}

export const SEED_TOPIC_SLOTS: SeedTopicSlot[] = [
  ...maturaSlots(),
  ...osmoklasistaSlots(),
];

export function allocateCounts(
  slots: SeedTopicSlot[],
  total: number,
): Map<string, number> {
  const weightSum = slots.reduce((s, x) => s + x.weight, 0);
  const counts = new Map<string, number>();
  let assigned = 0;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]!;
    const key = slotKey(slot);
    const isLast = i === slots.length - 1;
    const share = isLast
      ? total - assigned
      : Math.max(1, Math.round((total * slot.weight) / weightSum));
    counts.set(key, (counts.get(key) ?? 0) + share);
    assigned += share;
  }

  while (assigned < total) {
    const key = slotKey(slots[assigned % slots.length]!);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    assigned += 1;
  }

  while (assigned > total) {
    let maxKey = "";
    let maxVal = 0;
    for (const [k, v] of counts) {
      if (v > maxVal) {
        maxVal = v;
        maxKey = k;
      }
    }
    if (maxVal <= 1) break;
    counts.set(maxKey, maxVal - 1);
    assigned -= 1;
  }

  return counts;
}

export function slotKey(slot: Pick<SeedTopicSlot, "exam_type" | "category" | "topic">): string {
  return `${slot.exam_type}:${slot.category}:${slot.topic}`;
}
