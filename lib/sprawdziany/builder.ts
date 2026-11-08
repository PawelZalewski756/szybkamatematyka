import { shuffle } from "@/lib/sprawdziany/helpers";
import { SPRAWDZIAN_TOPICS } from "@/lib/sprawdziany/topics";
import type {
  Rng,
  SprawdzianQuestion,
  SprawdzianTopic,
} from "@/lib/sprawdziany/types";

export const DEFAULT_QUESTION_COUNT = 10;

export function getTopicsForClass(schoolClass: number): SprawdzianTopic[] {
  return SPRAWDZIAN_TOPICS.filter((t) => t.classes.includes(schoolClass))
    .map((t) => ({
      ...t,
      templates: t.templates.filter(
        (tpl) => !tpl.classes || tpl.classes.includes(schoolClass),
      ),
    }))
    .filter((t) => t.templates.length > 0);
}

export function getAvailableClasses(): number[] {
  const all = new Set<number>();
  for (const topic of SPRAWDZIAN_TOPICS) {
    for (const c of topic.classes) all.add(c);
  }
  return [...all].sort((a, b) => a - b);
}

/**
 * Losuje sprawdzian: pytania rozkładane po równo między wybrane tematy,
 * bez powtórzeń treści, od łatwiejszych do trudniejszych.
 */
export function buildSprawdzian(options: {
  schoolClass: number;
  topicIds: readonly string[];
  count?: number;
  rng?: Rng;
}): SprawdzianQuestion[] {
  const { schoolClass, topicIds, count = DEFAULT_QUESTION_COUNT } = options;
  const rng = options.rng ?? Math.random;
  const topics = getTopicsForClass(schoolClass).filter((t) =>
    topicIds.includes(t.id),
  );
  if (topics.length === 0) return [];

  const queues = new Map(
    topics.map((t) => [t.id, shuffle(rng, t.templates)] as const),
  );
  const cursor = new Map<string, number>(topics.map((t) => [t.id, 0]));
  const seen = new Set<string>();
  const questions: SprawdzianQuestion[] = [];
  const order = shuffle(rng, topics);
  const maxAttempts = count * 40;
  let attempts = 0;
  let turn = 0;

  while (questions.length < count && attempts < maxAttempts) {
    attempts += 1;
    const topic = order[turn % order.length];
    const queue = queues.get(topic.id)!;
    const index = cursor.get(topic.id)!;
    cursor.set(topic.id, index + 1);
    const template = queue[index % queue.length];
    const generated = template.generate(rng);
    if (seen.has(generated.prompt)) continue;
    seen.add(generated.prompt);
    turn += 1;
    questions.push({
      ...generated,
      id: `q${questions.length + 1}`,
      topicId: topic.id,
      level: template.level,
    });
  }

  return questions
    .map((q, i) => ({ q, i }))
    .sort((a, b) => a.q.level - b.q.level || a.i - b.i)
    .map(({ q }, i) => ({ ...q, id: `q${i + 1}` }));
}
