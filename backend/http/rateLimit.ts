/**
 * Minimal in-memory token-bucket rate limiter. Single-instance only — the
 * bucket map lives in process memory, so this does nothing useful across
 * multiple server instances/processes. A real distributed limiter (Redis-
 * backed, etc.) is an infra decision (OD-012-class), not made here. This
 * exists to close the specific gap flagged in docs/phases/02-production-foundation.md
 * ("Rate limiting... not yet implemented") for the highest-risk unauthenticated
 * endpoints: login and registration.
 */

type Bucket = { tokens: number; lastRefillAt: number };

const buckets = new Map<string, Bucket>();

const MAX_TOKENS = 10;
const REFILL_INTERVAL_MS = 60_000; // 1 token per 6s, i.e. 10 attempts/minute burst

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: MAX_TOKENS, lastRefillAt: now };

  const elapsed = now - bucket.lastRefillAt;
  const refilled = Math.floor((elapsed / REFILL_INTERVAL_MS) * MAX_TOKENS);
  if (refilled > 0) {
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refilled);
    bucket.lastRefillAt = now;
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    const msPerToken = REFILL_INTERVAL_MS / MAX_TOKENS;
    const retryAfterSeconds = Math.ceil(msPerToken / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { allowed: true };
}

// Prevents unbounded memory growth from one-off/abandoned keys (e.g. IPs that never return).
const MAX_BUCKETS = 10_000;
export function pruneRateLimitBuckets() {
  if (buckets.size <= MAX_BUCKETS) return;
  const cutoff = Date.now() - REFILL_INTERVAL_MS * 10;
  for (const [key, bucket] of buckets) {
    if (bucket.lastRefillAt < cutoff) buckets.delete(key);
  }
}
