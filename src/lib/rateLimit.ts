type Bucket = {
  tokens: number;
  lastRefill: number;
};

const buckets = new Map<string, Bucket>();
const cooldowns = new Map<string, number>();

let whitelistCache: Set<string> | null = null;

function getIpWhitelist(): Set<string> {
  if (whitelistCache !== null) {
    return whitelistCache;
  }

  const whitelistEnv = process.env.TWILIO_IP_WHITELIST;
  if (!whitelistEnv) {
    whitelistCache = new Set();
    return whitelistCache;
  }

  const ips = whitelistEnv
    .split(',')
    .map(ip => ip.trim())
    .filter(ip => ip.length > 0);
  
  whitelistCache = new Set(ips);
  return whitelistCache;
}

export function isIpWhitelisted(ip: string): boolean {
  if (!ip || ip === 'unknown') {
    return false;
  }
  const whitelist = getIpWhitelist();
  return whitelist.has(ip);
}

export function tokenBucketAllow(key: string, ratePerMin: number, burst: number, ip?: string): boolean {
  if (ip && isIpWhitelisted(ip)) {
    return true;
  }

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

export function enforceCooldown(key: string, cooldownMs: number, ip?: string): { allowed: boolean; retryAfterMs: number } {
  if (ip && isIpWhitelisted(ip)) {
    return { allowed: true, retryAfterMs: 0 };
  }

  const now = Date.now();
  const availableAt = cooldowns.get(key) ?? 0;
  if (now < availableAt) {
    return { allowed: false, retryAfterMs: availableAt - now };
  }
  cooldowns.set(key, now + cooldownMs);
  return { allowed: true, retryAfterMs: 0 };
}


