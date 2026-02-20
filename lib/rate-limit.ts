type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [, store] of stores) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export type RateLimitConfig = {
  /** Unique identifier for the limiter (e.g. endpoint name) */
  name: string;
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window size in seconds */
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds until reset
};

/**
 * Check rate limit for a given key (typically IP address).
 * Returns whether the request is allowed and how many requests remain.
 */
export function checkRateLimit(
  config: RateLimitConfig,
  key: string
): RateLimitResult {
  if (!stores.has(config.name)) {
    stores.set(config.name, new Map());
  }
  const store = stores.get(config.name)!;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      retryAfter: 0,
    };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    retryAfter: 0,
  };
}

/**
 * Get the client IP from a NextRequest.
 */
export function getClientIp(req: Request): string {
  const forwarded =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return forwarded;
}

/**
 * Create a rate limit response (429).
 */
export function rateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: "Te veel verzoeken. Probeer het later opnieuw.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}

// Pre-configured limiters
export const RATE_LIMITS = {
  generate: { name: "rie-generate", maxRequests: 3, windowSeconds: 3600 } as RateLimitConfig,
  chat: { name: "chat", maxRequests: 30, windowSeconds: 3600 } as RateLimitConfig,
  checkout: { name: "checkout", maxRequests: 10, windowSeconds: 3600 } as RateLimitConfig,
  pdf: { name: "pdf", maxRequests: 20, windowSeconds: 3600 } as RateLimitConfig,
} as const;
