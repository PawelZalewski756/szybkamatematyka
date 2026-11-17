/**
 * Prosty limiter żądań w pamięci procesu.
 *
 * Uwaga: na Vercel każda instancja ma własną pamięć, więc limit jest
 * przybliżony (N instancji = N × limit). To wystarcza jako pierwsza linia
 * obrony przed spamem i pętlami; limity krytyczne (Szybka próba, asysta AI)
 * są atomowe w bazie.
 *
 * Klucz budujemy z adresu IP i nazwy akcji, żeby jeden endpoint nie zjadał
 * limitu drugiemu.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export type RateLimitOptions = {
  limit: number;
  windowMs: number;
  now?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  { limit, windowMs, now = Date.now() }: RateLimitOptions,
): RateLimitResult {
  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  const existing = buckets.get(key);
  const bucket =
    !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : existing;

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.resetAt - now) / 1000),
    );
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** Adres klienta: Vercel ustawia `x-vercel-forwarded-for`, proxery `x-forwarded-for`. */
export function clientIp(request: Request): string {
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]!.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();

  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();

  return "unknown";
}

export function rateLimitResponse(retryAfterSeconds: number): Response {
  return Response.json(
    { error: "Zbyt wiele żądań. Spróbuj ponownie później." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

/** Tylko do testów. */
export function resetRateLimit(): void {
  buckets.clear();
}
