import { createHash } from "node:crypto";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidVisitorId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function hashVisitorId(visitorId: string): string {
  return createHash("sha256").update(visitorId.toLowerCase()).digest("hex");
}

export function isValidPagePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 200 &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[?#\r\n]/.test(value)
  );
}

export function isValidAnalyticsSource(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 64 &&
    /^[a-z0-9_-]+$/.test(value)
  );
}

export function isValidReferrerDomain(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 253 &&
    !/^[0-9.]+$/.test(value) &&
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(
      value,
    )
  );
}

export function getAnalyticsSource(search: string): string | null {
  const source = new URLSearchParams(search).get("utm_source")?.trim().toLowerCase();
  return source && isValidAnalyticsSource(source) ? source : null;
}

export function getAnalyticsReferrerDomain(
  referrer: string,
  currentHost: string,
): string | null {
  try {
    const domain = new URL(referrer).hostname.toLowerCase().replace(/\.$/, "");
    return domain !== currentHost.toLowerCase() &&
      isValidReferrerDomain(domain)
      ? domain
      : null;
  } catch {
    return null;
  }
}
