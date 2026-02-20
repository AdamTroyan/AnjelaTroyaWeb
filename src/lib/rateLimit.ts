type RateLimitOptions = {
  windowMs: number;
  limit: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  retryAfter: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

type RateLimitCache = Map<string, unknown>;

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: RateLimitStore | undefined;
}

const store: RateLimitStore = globalThis.__rateLimitStore ?? new Map();
globalThis.__rateLimitStore = store;

/* ── Periodic cleanup of expired entries (every 60 s) ── */
declare global {
  // eslint-disable-next-line no-var
  var __rateLimitCleanupTimer: ReturnType<typeof setInterval> | undefined;
}
if (!globalThis.__rateLimitCleanupTimer) {
  globalThis.__rateLimitCleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) {
      if (v.resetAt <= now) store.delete(k);
    }
  }, 60_000);
  // Allow Node to exit without waiting for this timer
  if (globalThis.__rateLimitCleanupTimer && typeof globalThis.__rateLimitCleanupTimer === "object" && "unref" in globalThis.__rateLimitCleanupTimer) {
    globalThis.__rateLimitCleanupTimer.unref();
  }
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitCache: RateLimitCache | undefined;
}

const rateLimitCache: RateLimitCache = globalThis.__rateLimitCache ?? new Map();
globalThis.__rateLimitCache = rateLimitCache;

async function getUpstashRateLimit(limit: number, windowMs: number) {
  if (!upstashUrl || !upstashToken) {
    return null;
  }

  const cacheKey = `${limit}:${windowMs}`;
  const cached = rateLimitCache.get(cacheKey);
  if (cached) {
    return cached as {
      limit: (key: string) => Promise<{ success: boolean; reset: number }>;
    };
  }

  const [{ Ratelimit }, { Redis }] = await Promise.all([
    import("@upstash/ratelimit"),
    import("@upstash/redis"),
  ]);

  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const windowValue = (windowSeconds % 60 === 0
    ? `${windowSeconds / 60} m`
    : `${windowSeconds} s`) as `${number} s` | `${number} m`;

  const redis = new Redis({ url: upstashUrl, token: upstashToken });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, windowValue),
  });

  rateLimitCache.set(cacheKey, limiter);
  return limiter;
}

export async function checkRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const upstashLimiter = await getUpstashRateLimit(options.limit, options.windowMs);
  if (upstashLimiter) {
    const result = await upstashLimiter.limit(key);
    if (result.success) {
      return { ok: true, retryAfter: 0 };
    }
    const retryAfter = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000));
    return { ok: false, retryAfter };
  }

  // In-memory fallback — fine for long-lived processes (VPS / PM2), not for serverless
  if (process.env.VERCEL || process.env.NETLIFY) {
    console.warn("[rateLimit] Upstash Redis not configured — in-memory fallback is unreliable in serverless");
  }

  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count <= options.limit) {
    store.set(key, entry);
    return { ok: true, retryAfter: 0 };
  }

  const retryAfter = Math.max(0, Math.ceil((entry.resetAt - now) / 1000));
  return { ok: false, retryAfter };
}

function extractClientIp(headers: Headers) {
  const netlify = headers.get("x-nf-client-connection-ip");
  if (netlify) {
    return netlify.trim();
  }

  const cloudflare = headers.get("cf-connecting-ip");
  if (cloudflare) {
    return cloudflare.trim();
  }

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function getClientIp(request: Request) {
  return extractClientIp(request.headers);
}

export function getClientIpFromHeaders(headers: Headers) {
  return extractClientIp(headers);
}
