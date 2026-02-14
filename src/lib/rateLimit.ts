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

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: RateLimitStore | undefined;
}

const store: RateLimitStore = globalThis.__rateLimitStore ?? new Map();
globalThis.__rateLimitStore = store;

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
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

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}
