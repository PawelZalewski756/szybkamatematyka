import { getServiceSupabaseOrNull } from "@/lib/stripe/service-supabase";
import { logWarn } from "@/lib/observability/logger";

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSec: number;
  remaining: number;
  source: "database" | "memory";
};

type MemoryBucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, MemoryBucket>();

export function consumeMemoryRateLimit(
  key: string,
  max: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  const bucket = memoryBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      retryAfterSec: 0,
      remaining: Math.max(0, max - 1),
      source: "memory",
    };
  }

  if (bucket.count >= max) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      remaining: 0,
      source: "memory",
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: Math.max(0, max - bucket.count),
    source: "memory",
  };
}

type DbRateRow = {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
};

async function consumeDatabaseRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const sb = getServiceSupabaseOrNull();
  if (!sb) return null;

  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const { data, error } = await sb.rpc("consume_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    logWarn("rate_limit.db_failed", { message: error.message.slice(0, 200) });
    return null;
  }

  const row = (Array.isArray(data) ? data[0] : data) as DbRateRow | null;
  if (!row) return null;

  return {
    allowed: Boolean(row.allowed),
    retryAfterSec: Math.max(0, Number(row.retry_after_seconds) || 0),
    remaining: Math.max(0, Number(row.remaining) || 0),
    source: "database",
  };
}

/**
 * Atomowy limit w bazie (gdy jest service role). Bez konfiguracji — pamięć procesu.
 */
export async function consumeRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const fromDb = await consumeDatabaseRateLimit(key, max, windowMs);
  if (fromDb) return fromDb;
  return consumeMemoryRateLimit(key, max, windowMs);
}
