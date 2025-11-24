type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();
const cooldowns = new Map<string, number>();

export function tokenBucketAllow(key: string, ratePerMin: number, burst: number): boolean {
  const now = Date.now();
  const refillIntervalMs = 60000; // per minute
  const refillAmountPerMs = ratePerMin / refillIntervalMs;

  let b = buckets.get(key);
  if (!b) {
    b = { tokens: burst, lastRefill: now };
    buckets.set(key, b);
  }

  // Refill tokens proportionally by time elapsed
  const elapsed = now - b.lastRefill;
  b.tokens = Math.min(burst, b.tokens + elapsed * refillAmountPerMs);
  b.lastRefill = now;

  if (b.tokens >= 1) {
    b.tokens -= 1;
    return true;
  }
  return false;
}

export function enforceCooldown(key: string, cooldownMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const availableAt = cooldowns.get(key) ?? 0;
  if (now < availableAt) {
    return { allowed: false, retryAfterMs: availableAt - now };
  }
  cooldowns.set(key, now + cooldownMs);
  return { allowed: true, retryAfterMs: 0 };
}


