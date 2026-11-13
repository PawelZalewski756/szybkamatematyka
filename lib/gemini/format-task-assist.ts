import { normalizeMathText } from "@/lib/math/normalize-math-text";

export type TaskGradeVerdict = "correct" | "partial" | "wrong";

export type TaskGradeResult = {
  verdict: TaskGradeVerdict;
  feedback: string;
  acceptAsCorrect: boolean;
  awardedPoints?: number;
};

function jsonCandidates(text: string): string[] {
  const trimmed = text.trim();
  const candidates = [trimmed];

  for (const match of trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)) {
    if (match[1]?.trim()) candidates.push(match[1].trim());
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    candidates.push(trimmed.slice(start, end + 1));
  }

  return [...new Set(candidates)];
}

export function parseTaskGradeResponse(
  raw: string,
  maxPoints?: number,
): TaskGradeResult | null {
  for (const json of jsonCandidates(raw)) {
    try {
      const row = JSON.parse(json) as Record<string, unknown>;
      const verdict = String(row.verdict ?? "").toLowerCase();
      if (
        verdict !== "correct" &&
        verdict !== "partial" &&
        verdict !== "wrong"
      ) {
        continue;
      }
      const feedback = normalizeMathText(String(row.feedback ?? "").trim());
      if (!feedback || feedback.length > 1_200) continue;
      const acceptAsCorrect =
        verdict === "correct" && row.acceptAsCorrect !== false;
      const awardedRaw = Number(row.awardedPoints);
      const upperBound =
        maxPoints != null && Number.isFinite(maxPoints)
          ? Math.max(0, Math.round(maxPoints))
          : Number.POSITIVE_INFINITY;
      const awardedPoints = Number.isFinite(awardedRaw)
        ? Math.min(upperBound, Math.max(0, Math.round(awardedRaw)))
        : undefined;
      return {
        verdict,
        feedback,
        acceptAsCorrect,
        awardedPoints,
      };
    } catch {
      // Try the next candidate when the model wrapped JSON in commentary.
    }
  }
  return null;
}

export function normalizeHintText(raw: string): string {
  return normalizeMathText(raw.trim().replace(/\r\n/g, "\n"));
}
