import { daysUntilExam, examDateLabel, isValidExamDate } from "@/lib/exam-date";
import {
  schoolClassLabel,
  type SchoolClassPath,
} from "@/lib/learning-path";
import { getClassPlan } from "@/lib/trening/class-plan";

export type WeeklyPlanTaskKind =
  | "review"
  | "warmup"
  | "topic"
  | "challenge"
  | "exam";

export type WeeklyPlanTask = {
  id: string;
  kind: WeeklyPlanTaskKind;
  title: string;
  href: string;
  minutes: number;
  xp: number;
  completed: boolean;
};

export type WeeklyPlanDay = {
  dateKey: string;
  weekday: string;
  dateLabel: string;
  isToday: boolean;
  isPast: boolean;
  isRest: boolean;
  tasks: WeeklyPlanTask[];
  completedCount: number;
  totalCount: number;
  completed: boolean;
};

export type WeeklyPlan = {
  weekStart: string;
  weekLabel: string;
  classLabel: string;
  examDate: string | null;
  examDateLabel: string | null;
  daysUntilExam: number | null;
  focusLabel: string;
  hasClassPlan: boolean;
  reviewDueCount: number;
  reviewTotalCount: number;
  days: WeeklyPlanDay[];
  today: WeeklyPlanDay | null;
  totalTasks: number;
  completedTasks: number;
  totalMinutes: number;
};

export type WeeklyPlanInput = {
  schoolClass: SchoolClassPath;
  examDate: string | null;
  now?: Date;
  dueReviewCount?: number;
  reviewTotalCount?: number;
  weakestCategory?: string | null;
  recentTopic?: {
    id: string;
    title: string;
    href: string;
  } | null;
  completedTaskIds?: readonly string[];
};

const WEEKDAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"] as const;

const DAY_TEMPLATES: readonly (readonly WeeklyPlanTaskKind[])[] = [
  ["review", "topic", "challenge"],
  ["topic", "challenge"],
  ["review", "topic"],
  ["topic", "challenge"],
  ["topic", "challenge"],
  ["exam", "topic"],
  [],
] as const;

const MINUTE_BY_KIND: Record<WeeklyPlanTaskKind, number> = {
  review: 12,
  warmup: 5,
  topic: 15,
  challenge: 5,
  exam: 25,
};

const XP_BY_KIND: Record<WeeklyPlanTaskKind, number> = {
  review: 15,
  warmup: 10,
  topic: 20,
  challenge: 15,
  exam: 30,
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function startOfWeek(now: Date): Date {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return date;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Klucz poniedziałku bieżącego tygodnia - używany też przez zapis postępu. */
export function getWeekStartKey(now: Date = new Date()): string {
  return dateKey(startOfWeek(now));
}

function dayLabel(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function weekLabel(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
  });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function plural(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  if (count >= 2 && count <= 4) return few;
  return many;
}

type TopicLike = {
  id: string;
  name: string;
  href: string;
};

function buildTopicQueue(
  schoolClass: SchoolClassPath,
  weekStart: Date,
  recentTopic: WeeklyPlanInput["recentTopic"],
): { topics: TopicLike[]; hasClassPlan: boolean } {
  const classPlan = getClassPlan(schoolClass);
  const classTopics = classPlan.categories.flatMap((category) => category.topics);

  const withoutRecent = recentTopic
    ? classTopics.filter(
        (topic) =>
          topic.id !== recentTopic.id && topic.href !== recentTopic.href,
      )
    : classTopics;

  const base: TopicLike[] = recentTopic
    ? [
        {
          id: recentTopic.id,
          name: recentTopic.title,
          href: recentTopic.href,
        },
        ...withoutRecent,
      ]
    : classTopics;

  if (base.length === 0) {
    return { topics: [], hasClassPlan: false };
  }

  const seed = hashString(`${schoolClass}:${dateKey(weekStart)}`);
  const offset = recentTopic ? 0 : seed % base.length;

  return {
    topics: [...base.slice(offset), ...base.slice(0, offset)],
    hasClassPlan: classPlan.topicCount > 0,
  };
}

export function buildWeeklyPlan(input: WeeklyPlanInput): WeeklyPlan {
  const now = input.now ?? new Date();
  const weekStartDate = startOfWeek(now);
  const weekEndDate = addDays(weekStartDate, 6);
  const today = dateKey(now);
  const completedSet = new Set(input.completedTaskIds ?? []);
  const dueReviewCount = Math.max(0, input.dueReviewCount ?? 0);
  const { topics, hasClassPlan } = buildTopicQueue(
    input.schoolClass,
    weekStartDate,
    input.recentTopic ?? null,
  );

  let topicCursor = 0;
  let reviewSlot = 0;
  const usedTopicIds = new Set<string>();

  const nextTopic = (): TopicLike | null => {
    if (topics.length === 0) return null;
    for (let attempt = 0; attempt < topics.length; attempt += 1) {
      const topic = topics[(topicCursor + attempt) % topics.length];
      if (topic && !usedTopicIds.has(topic.id)) {
        usedTopicIds.add(topic.id);
        topicCursor = (topicCursor + attempt + 1) % topics.length;
        return topic;
      }
    }
    const fallback = topics[topicCursor % topics.length] ?? null;
    topicCursor = (topicCursor + 1) % topics.length;
    return fallback;
  };

  const makeTask = (
    dayKey: string,
    kind: WeeklyPlanTaskKind,
    title: string,
    href: string,
    slug: string,
  ): WeeklyPlanTask => {
    const id = `${dayKey}:${kind}:${slug}`;
    return {
      id,
      kind,
      title,
      href,
      minutes: MINUTE_BY_KIND[kind],
      xp: XP_BY_KIND[kind],
      completed: completedSet.has(id),
    };
  };

  const reviewTask = (dayKey: string): WeeklyPlanTask => {
    const firstReviewSlot = reviewSlot === 0;
    reviewSlot += 1;

    if (dueReviewCount > 0) {
      return makeTask(
        dayKey,
        "review",
        firstReviewSlot
          ? `Powtórki: ${dueReviewCount} ${plural(
              dueReviewCount,
              "zadanie",
              "zadania",
              "zadań",
            )}`
          : "Powtórka błędów",
        "/powtorki",
        "due",
      );
    }

    return makeTask(
      dayKey,
      "warmup",
      firstReviewSlot ? "Rozgrzewka: 5 minut" : "Minigra na rozgrzewkę",
      "/minigry",
      "warmup",
    );
  };

  const examSoon =
    input.examDate !== null &&
    isValidExamDate(input.examDate) &&
    (daysUntilExam(input.examDate, now) ?? 999) <= 14;

  const days: WeeklyPlanDay[] = WEEKDAYS.map((weekday, index) => {
    const date = addDays(weekStartDate, index);
    const dayKey = dateKey(date);
    const template =
      index === 6 && examSoon ? (["review"] as const) : DAY_TEMPLATES[index] ?? [];
    const tasks: WeeklyPlanTask[] = [];

    for (const kind of template) {
      if (kind === "review") {
        tasks.push(reviewTask(dayKey));
        continue;
      }

      if (kind === "topic") {
        const topic = nextTopic();
        if (!topic) continue;
        tasks.push(
          makeTask(
            dayKey,
            "topic",
            `Temat: ${topic.name}`,
            topic.href,
            topic.id,
          ),
        );
        continue;
      }

      if (kind === "challenge") {
        tasks.push(
          makeTask(
            dayKey,
            "challenge",
            "Wyzwanie dnia",
            "/wyzwania",
            "daily",
          ),
        );
        continue;
      }

      if (kind === "exam") {
        tasks.push(
          makeTask(
            dayKey,
            "exam",
            "Fragment arkusza CKE",
            "/trening/arkusze",
            "cke",
          ),
        );
      }
    }

    const completedCount = tasks.filter((task) => task.completed).length;
    const totalCount = tasks.length;

    return {
      dateKey: dayKey,
      weekday,
      dateLabel: dayLabel(date),
      isToday: dayKey === today,
      isPast: dayKey < today,
      isRest: totalCount === 0,
      tasks,
      completedCount,
      totalCount,
      completed: totalCount > 0 && completedCount === totalCount,
    };
  });

  const allTasks = days.flatMap((day) => day.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((task) => task.completed).length;
  const totalMinutes = allTasks.reduce((sum, task) => sum + task.minutes, 0);
  const examDate = input.examDate && isValidExamDate(input.examDate)
    ? input.examDate
    : null;

  return {
    weekStart: dateKey(weekStartDate),
    weekLabel: weekLabel(weekStartDate, weekEndDate),
    classLabel: schoolClassLabel(input.schoolClass),
    examDate,
    examDateLabel: examDate ? examDateLabel(examDate) : null,
    daysUntilExam: examDate ? daysUntilExam(examDate, now) : null,
    focusLabel: input.weakestCategory
      ? `Skupienie: ${input.weakestCategory}`
      : "Regularny rytm",
    hasClassPlan,
    reviewDueCount: dueReviewCount,
    reviewTotalCount: Math.max(dueReviewCount, input.reviewTotalCount ?? 0),
    days,
    today: days.find((day) => day.isToday) ?? null,
    totalTasks,
    completedTasks,
    totalMinutes,
  };
}
