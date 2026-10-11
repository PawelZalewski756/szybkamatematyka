const CONSENT_KEY = "sm-analytics-consent";
const VISITOR_ID_KEY = "sm-analytics-visitor-id";
const EVENT_PREFIX = "sm-analytics-event-";
const SESSION_EVENT_PREFIX = "sm-analytics-session-event-";

export type AnalyticsEventName = "signup_completed" | "first_task_solved" | "session_start";

const eventsInFlight = new Set<string>();

export function hasAnalyticsConsent(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function getOrCreateVisitorId(): string | null {
  try {
    const storedId = window.localStorage.getItem(VISITOR_ID_KEY);
    if (
      storedId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        storedId,
      )
    ) {
      return storedId;
    }

    const visitorId = window.crypto.randomUUID();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
    return visitorId;
  } catch (error) {
    console.error("Could not initialize anonymous analytics:", error);
    return null;
  }
}

export async function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  pagePath: string,
): Promise<void> {
  if (!hasAnalyticsConsent()) return;
  const visitorId = getOrCreateVisitorId();
  if (!visitorId) return;

  const key =
    eventName === "session_start"
      ? `${SESSION_EVENT_PREFIX}${eventName}`
      : `${EVENT_PREFIX}${eventName}`;
  const inFlightKey = `${key}:${visitorId}`;

  try {
    const storage =
      eventName === "session_start" ? window.sessionStorage : window.localStorage;
    if (storage.getItem(key) || eventsInFlight.has(inFlightKey)) return;
    eventsInFlight.add(inFlightKey);

    const response = await fetch("/api/analytics/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId, eventName, path: pagePath }),
      keepalive: true,
    });
    if (!response.ok) {
      console.error("Analytics event request failed:", response.status);
      return;
    }
    storage.setItem(key, "1");
  } catch (error) {
    console.error("Analytics event request failed:", error);
  } finally {
    eventsInFlight.delete(inFlightKey);
  }
}

export function clearStoredAnalyticsIdentity(): void {
  try {
    window.localStorage.removeItem(VISITOR_ID_KEY);
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(EVENT_PREFIX)) window.localStorage.removeItem(key);
    }
    for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith(SESSION_EVENT_PREFIX)) {
        window.sessionStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Could not clear analytics identity:", error);
  }
}
