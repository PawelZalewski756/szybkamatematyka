import type { QuestionTrack } from "@/lib/learning-path";
import {
  EGZAMIN_8_CLAIMS,
  MATURA_CLAIMS,
  PODSTAWOWA_CLAIMS,
  type ClaimTemplate,
} from "@/lib/content/claim-banks";
import { mulberry32, shuffle, type Rng } from "@/lib/trening/seed/rng";
import type { ChallengeQuestion, DailyChallenge } from "@/lib/wyzwania/types";

/** Ile pytań w dziennym wyzwaniu. */
export const DAILY_CHALLENGE_QUESTION_COUNT = 5;

const DAILY_BASE_XP = 60;
const DAILY_PER_CORRECT_XP = 12;
const DAILY_STREAK_BONUS_XP = 5;
const DAILY_STREAK_BONUS_CAP = 7;

/**
 * Nagroda XP za ukończenie: baza + bonus za poprawne + bonus za serię.
 * Deterministyczna względem wyniku i serii.
 */
export function challengeXpReward(
  correct: number,
  streakAfter: number,
): number {
  const base = DAILY_BASE_XP + Math.max(0, correct) * DAILY_PER_CORRECT_XP;
  const streakBonus =
    Math.min(Math.max(0, streakAfter), DAILY_STREAK_BONUS_CAP) *
    DAILY_STREAK_BONUS_XP;
  return base + streakBonus;
}

const BANKS: Record<QuestionTrack, readonly ClaimTemplate[]> = {
  podstawowa: PODSTAWOWA_CLAIMS,
  "egzamin-8-klasisty": EGZAMIN_8_CLAIMS,
  matura: MATURA_CLAIMS,
};

const TRACK_SEED: Record<QuestionTrack, number> = {
  podstawowa: 101,
  "egzamin-8-klasisty": 211,
  matura: 307,
};

/** Liczbowy seed z daty YYYY-MM-DD (ten sam dla danego dnia). */
function dateSeed(dateStr: string): number {
  const digits = dateStr.replace(/-/g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

function buildQuestion(
  rng: Rng,
  template: ClaimTemplate,
  dateStr: string,
  index: number,
): ChallengeQuestion {
  const isTrue = rng() < 0.5;
  return {
    id: `${dateStr}-${index}`,
    claim: isTrue ? template.correct : template.wrong,
    isTrue,
  };
}

/**
 * Deterministyczny zestaw na dany dzień i tor — ten sam zestaw przy każdym
 * wejściu tego samego dnia (seedowany datą + torem).
 */
export function generateDailyChallenge(
  track: QuestionTrack,
  dateStr: string,
): DailyChallenge {
  const seed = (dateSeed(dateStr) ^ TRACK_SEED[track]) >>> 0;
  const rng = mulberry32(seed);
  const bank = BANKS[track];

  const chosen = shuffle(rng, [...bank]).slice(
    0,
    Math.min(DAILY_CHALLENGE_QUESTION_COUNT, bank.length),
  );

  const questions = chosen.map((template, index) =>
    buildQuestion(rng, template, dateStr, index),
  );

  return { date: dateStr, track, questions };
}
