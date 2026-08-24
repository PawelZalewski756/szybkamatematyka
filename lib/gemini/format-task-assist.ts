export type TaskGradeVerdict = "correct" | "partial" | "wrong";

export type TaskGradeResult = {
  verdict: TaskGradeVerdict;
  feedback: string;
  acceptAsCorrect: boolean;
  awardedPoints?: number;
};

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return (fenced?.[1] ?? trimmed).trim();
}

export function parseTaskGradeResponse(raw: string): TaskGradeResult | null {
  const json = stripCodeFence(raw);
  try {
    const row = JSON.parse(json) as Record<string, unknown>;
    const verdict = String(row.verdict ?? "").toLowerCase();
    if (verdict !== "correct" && verdict !== "partial" && verdict !== "wrong") {
      return null;
    }
    const feedback = String(row.feedback ?? "").trim();
    if (!feedback) return null;
    const acceptAsCorrect =
      verdict === "correct" && row.acceptAsCorrect !== false;
    const awardedRaw = Number(row.awardedPoints);
    const awardedPoints = Number.isFinite(awardedRaw)
      ? Math.max(0, Math.round(awardedRaw))
      : undefined;
    return {
      verdict,
      feedback,
      acceptAsCorrect,
      awardedPoints,
    };
  } catch {
    return null;
  }
}

export function normalizeHintText(raw: string): string {
  return raw.trim().replace(/\r\n/g, "\n");
}
