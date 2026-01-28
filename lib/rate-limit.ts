/**
 * Rate Limiting Configuration
 * 
 * Uses Upstash Redis for serverless rate limiting.
 * Falls back to in-memory rate limiting in development if Upstash is not configured.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (only if Upstash is configured)
let redis: Redis | null = null;
let useUpstash = false;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    useUpstash = true;
  } catch (error) {
    console.warn('Failed to initialize Upstash Redis, falling back to in-memory rate limiting');
  }
}

// In-memory rate limiting fallback (development only)
const memoryStore = new Map<string, { count: number; resetTime: number }>();

function getMemoryRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const key = identifier;
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Math.floor((now + windowSeconds * 1000) / 1000),
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.floor(record.resetTime / 1000),
    };
  }

  record.count++;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: Math.floor(record.resetTime / 1000),
  };
}

// Rate limiter for document generation (10 requests per minute)
export const documentGenerationLimiter = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: '@hipaa-hub/document-generation',
    })
  : {
      limit: async (identifier: string) => {
        return getMemoryRateLimit(identifier, 10, 60);
      },
    };

// Rate limiter for evidence upload (20 requests per minute)
export const evidenceUploadLimiter = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: '@hipaa-hub/evidence-upload',
    })
  : {
      limit: async (identifier: string) => {
        return getMemoryRateLimit(identifier, 20, 60);
      },
    };

// Rate limiter for compliance evidence upload (15 requests per minute)
export const complianceEvidenceUploadLimiter = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, '1 m'),
      analytics: true,
      prefix: '@hipaa-hub/compliance-evidence-upload',
    })
  : {
      limit: async (identifier: string) => {
        return getMemoryRateLimit(identifier, 15, 60);
      },
    };

// Rate limiter for Stripe webhook (100 requests per minute, IP-based)
export const stripeWebhookLimiter = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: '@hipaa-hub/stripe-webhook',
    })
  : {
      limit: async (identifier: string) => {
        return getMemoryRateLimit(identifier, 100, 60);
      },
    };

// Rate limiter for general API routes (1000 requests per hour for authenticated)
export const authenticatedApiLimiter = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1000, '1 h'),
      analytics: true,
      prefix: '@hipaa-hub/api-authenticated',
    })
  : {
      limit: async (identifier: string) => {
        return getMemoryRateLimit(identifier, 1000, 3600);
      },
    };

// Rate limiter for unauthenticated API routes (100 requests per hour)
export const unauthenticatedApiLimiter = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 h'),
      analytics: true,
      prefix: '@hipaa-hub/api-unauthenticated',
    })
  : {
      limit: async (identifier: string) => {
        return getMemoryRateLimit(identifier, 100, 3600);
      },
    };

// Rate limiter for auth endpoints (5 requests per minute, IP-based)
export const authLimiter = useUpstash && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: '@hipaa-hub/auth',
    })
  : {
      limit: async (identifier: string) => {
        return getMemoryRateLimit(identifier, 5, 60);
      },
    };

/**
 * Get client identifier for rate limiting
 * Uses user ID if authenticated, otherwise falls back to IP address
 */
export function getRateLimitIdentifier(
  userId: string | null | undefined,
  request: Request
): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP address from headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(
  limit: number,
  remaining: number,
  reset: number
): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: reset - Math.floor(Date.now() / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Retry-After': (reset - Math.floor(Date.now() / 1000)).toString(),
      },
    }
  );
}
