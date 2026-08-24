const REQUEST_ID_HEADER = "x-request-id";

export function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function readRequestId(request: Request): string {
  const incoming = request.headers.get(REQUEST_ID_HEADER)?.trim();
  if (incoming && incoming.length <= 128) return incoming;
  return createRequestId();
}

export function requestIdHeaders(requestId: string): Record<string, string> {
  return { [REQUEST_ID_HEADER]: requestId };
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}
