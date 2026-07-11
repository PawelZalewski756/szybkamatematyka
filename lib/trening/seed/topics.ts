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

/** Tematy z drzewa CKE (matura + egzamin 8-kl.). */
export function buildSeedTopicSlots(): SeedTopicSlot[] {
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

  return slots;
}

export const SEED_TOPIC_SLOTS: SeedTopicSlot[] = buildSeedTopicSlots();

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
