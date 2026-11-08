import type {
  SprawdzianQuestion,
  SprawdzianResult,
} from "@/lib/sprawdziany/types";

export type SchoolGrade = { value: 1 | 2 | 3 | 4 | 5 | 6; label: string };

/** Typowa skala szkolna: progi procentowe → ocena. */
export function gradeForPercent(percent: number): SchoolGrade {
  if (percent >= 98) return { value: 6, label: "celujący" };
  if (percent >= 90) return { value: 5, label: "bardzo dobry" };
  if (percent >= 75) return { value: 4, label: "dobry" };
  if (percent >= 50) return { value: 3, label: "dostateczny" };
  if (percent >= 30) return { value: 2, label: "dopuszczający" };
  return { value: 1, label: "niedostateczny" };
}

export function scoreSprawdzian(
  questions: readonly SprawdzianQuestion[],
  answers: Readonly<Record<string, number | undefined>>,
) {
  const byTopic: SprawdzianResult["byTopic"] = {};
  let correct = 0;
  for (const q of questions) {
    const entry = (byTopic[q.topicId] ??= { correct: 0, total: 0 });
    entry.total += 1;
    if (answers[q.id] === q.correctIndex) {
      entry.correct += 1;
      correct += 1;
    }
  }
  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percent, grade: gradeForPercent(percent), byTopic };
}

/** Tematy z wynikiem poniżej progu — kandydaci do powtórki. */
export function weakTopicIds(
  byTopic: SprawdzianResult["byTopic"],
  threshold = 0.6,
): string[] {
  return Object.entries(byTopic)
    .filter(([, v]) => v.total > 0 && v.correct / v.total < threshold)
    .map(([id]) => id);
}
