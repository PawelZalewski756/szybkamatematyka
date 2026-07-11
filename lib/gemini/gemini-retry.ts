/** Parsuje czas oczekiwania z komunikatu błędu Gemini (429 / quota). */

const RETRY_SECONDS_PATTERNS = [
  /retry in (\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?/i,
  /retry after (\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?/i,
  /try again in (\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?/i,
  /please retry in (\d+(?:\.\d+)?)\s*s(?:ec(?:ond)?s?)?/i,
  /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i,
  /retryDelay.*?(\d+(?:\.\d+)?)\s*s/i,
] as const;

const RETRY_MINUTES_PATTERNS = [
  /retry in (\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?/i,
  /try again in (\d+(?:\.\d+)?)\s*m(?:in(?:ute)?s?)?/i,
] as const;

const RETRY_HOURS_PATTERNS = [
  /retry in (\d+(?:\.\d+)?)\s*h(?:ou?rs?)?/i,
  /try again in (\d+(?:\.\d+)?)\s*h(?:ou?rs?)?/i,
] as const;

/** Bufor po czasie podanym przez API (ms). */
export const GEMINI_RETRY_BUFFER_MS = 2500;

/** Limit dzienny free tier — API i tak podaje krótki „retry in Xs”, ale to nie pomoże. */
export function isDailyQuotaExhausted(message: string): boolean {
  return (
    /GenerateRequestsPerDay|PerDayPerProject|PerDayPerModel|PerDay/i.test(
      message,
    ) ||
    (/free_tier_requests/i.test(message) &&
      /Quota exceeded|429|quota/i.test(message))
  );
}

/** Do resetu limitu Gemini free tier (północ PT + 5 min bufor). */
export function getMsUntilPacificMidnight(now = new Date()): number {
  const tz = "America/Los_Angeles";
  const stepMs = 5 * 60_000;
  const maxMs = 26 * 3_600_000;
  let t = now.getTime() + stepMs;

  for (let elapsed = stepMs; elapsed <= maxMs; elapsed += stepMs) {
    const d = new Date(t);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(d);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 99);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 99);
    if (hour === 0 && minute >= 5 && minute < 15) {
      return elapsed + GEMINI_RETRY_BUFFER_MS;
    }
    t += stepMs;
  }

  return 6 * 3_600_000 + GEMINI_RETRY_BUFFER_MS;
}

export function parseGeminiRetryDelayMs(message: string): number | null {
  for (const pattern of RETRY_SECONDS_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const sec = parseFloat(match[1]!);
      if (Number.isFinite(sec) && sec > 0) {
        return Math.ceil(sec * 1000) + GEMINI_RETRY_BUFFER_MS;
      }
    }
  }

  for (const pattern of RETRY_MINUTES_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const min = parseFloat(match[1]!);
      if (Number.isFinite(min) && min > 0) {
        return Math.ceil(min * 60_000) + GEMINI_RETRY_BUFFER_MS;
      }
    }
  }

  for (const pattern of RETRY_HOURS_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      const hours = parseFloat(match[1]!);
      if (Number.isFinite(hours) && hours > 0) {
        return Math.ceil(hours * 3_600_000) + GEMINI_RETRY_BUFFER_MS;
      }
    }
  }

  return null;
}

export function formatGeminiWaitLabel(ms: number): string {
  if (ms >= 3_600_000) {
    const h = ms / 3_600_000;
    return h >= 10 ? `${Math.round(h)} h` : `${h.toFixed(1)} h`;
  }
  if (ms >= 60_000) {
    const m = ms / 60_000;
    return m >= 10 ? `${Math.round(m)} min` : `${m.toFixed(1)} min`;
  }
  return `${Math.round(ms / 1000)} s`;
}

/** Czas oczekiwania: preferuj dokładny czas z API, inaczej rozsądny fallback. */
export function getGeminiRetryWaitMs(
  message: string,
  attempt: number,
): number {
  if (isDailyQuotaExhausted(message)) {
    const untilReset = getMsUntilPacificMidnight();
    const minWait = Math.min(60 * 60_000, 15 * 60_000 + attempt * 5 * 60_000);
    return Math.max(minWait, untilReset);
  }

  const parsed = parseGeminiRetryDelayMs(message);
  if (parsed !== null) return parsed;

  if (/503|high demand|unavailable|overloaded/i.test(message)) {
    return Math.min(120_000, 10_000 + attempt * 5000);
  }

  return Math.min(180_000, 8000 + attempt * 4000);
}

export function isRetryableGeminiError(message: string): boolean {
  return (
    /429|503|quota|rate limit|too many requests|high demand|unavailable|overloaded|ResourceExhausted/i.test(
      message,
    ) || parseGeminiRetryDelayMs(message) !== null
  );
}

/** @deprecated Użyj isRetryableGeminiError */
export function isRateLimitError(message: string): boolean {
  return isRetryableGeminiError(message);
}

export function isDailyQuotaError(message: string): boolean {
  return isDailyQuotaExhausted(message);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForGeminiRetry(
  message: string,
  attempt: number,
  log?: (line: string) => void,
): Promise<number> {
  const waitMs = getGeminiRetryWaitMs(message, attempt);
  const label = formatGeminiWaitLabel(waitMs);
  const daily = isDailyQuotaExhausted(message);
  const parsed = daily ? null : parseGeminiRetryDelayMs(message);
  const detail = daily
    ? "(limit dzienny free tier — reset ok. północ PT)"
    : parsed !== null
      ? `(API: czekaj ${label})`
      : `(fallback: ${label})`;
  const line = daily
    ? `  ⏳ Limit dzienny Gemini — czekam ${label} ${detail}…`
    : `  ⏳ Limit Gemini — czekam ${label} ${detail}…`;
  if (log) log(line);
  else console.warn(line);
  await sleep(waitMs);
  return waitMs;
}
