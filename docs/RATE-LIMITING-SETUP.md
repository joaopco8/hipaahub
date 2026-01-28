# Rate Limiting Setup Guide

## Overview

Rate limiting protects our APIs from abuse and ensures fair usage. For HIPAA Hub, we need to implement rate limiting on critical endpoints.

## Implementation Options

### Option 1: Upstash Redis (Recommended)

Upstash provides serverless Redis with a free tier, perfect for rate limiting.

#### Installation

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

#### Setup

1. Create an account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Get your REST URL and token
4. Add to `.env`:

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=your-token
```

#### Usage Example

Create `lib/rate-limit.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter for document generation (10 requests per minute)
export const documentGenerationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: '@hipaa-hub/document-generation',
});

// Rate limiter for evidence upload (20 requests per minute)
export const evidenceUploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
  prefix: '@hipaa-hub/evidence-upload',
});

// Rate limiter for API routes (100 requests per hour for unauthenticated)
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
  prefix: '@hipaa-hub/api',
});
```

#### Use in API Routes

```typescript
import { documentGenerationLimiter } from '@/lib/rate-limit';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Get user ID for rate limiting
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const identifier = user?.id || request.headers.get('x-forwarded-for') || 'anonymous';
  
  const { success, limit, remaining, reset } = await documentGenerationLimiter.limit(identifier);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }
  
  // Continue with your logic...
}
```

### Option 2: In-Memory Rate Limiting (Development Only)

For development, you can use a simple in-memory rate limiter. **Do not use in production.**

```typescript
// lib/rate-limit-memory.ts (DEV ONLY)
const requests = new Map<string, number[]>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userRequests = requests.get(identifier) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter((time) => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  recentRequests.push(now);
  requests.set(identifier, recentRequests);
  
  return { allowed: true, remaining: maxRequests - recentRequests.length };
}
```

## Rate Limits by Endpoint

### Critical Endpoints

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `/api/documents/generate` | 10 | 1 minute | Per user |
| `/api/evidence/upload` | 20 | 1 minute | Per user |
| `/api/compliance-evidence/upload` | 15 | 1 minute | Per user |
| `/api/webhooks/stripe` | 100 | 1 minute | IP-based + signature verification |
| `/api/auth/*` | 5 | 1 minute | Per IP (prevent brute force) |

### General API Limits

| Type | Limit | Window |
|------|-------|--------|
| Authenticated users | 1000 | 1 hour |
| Unauthenticated | 100 | 1 hour |

## Implementation Checklist

- [ ] Install Upstash Redis package
- [ ] Create Upstash account and database
- [ ] Add environment variables
- [ ] Create `lib/rate-limit.ts` with limiters
- [ ] Add rate limiting to `/api/documents/generate`
- [ ] Add rate limiting to `/api/evidence/upload`
- [ ] Add rate limiting to `/api/compliance-evidence/upload`
- [ ] Add IP-based rate limiting to `/api/webhooks/stripe`
- [ ] Add rate limiting to auth endpoints
- [ ] Test rate limits in development
- [ ] Monitor rate limit hits in production
- [ ] Adjust limits based on usage patterns

## Testing

Test rate limiting with a simple script:

```typescript
// scripts/test-rate-limit.ts
async function testRateLimit() {
  const endpoint = 'http://localhost:3000/api/documents/generate';
  
  for (let i = 0; i < 15; i++) {
    const response = await fetch(endpoint, { method: 'POST' });
    console.log(`Request ${i + 1}: ${response.status}`);
    
    if (response.status === 429) {
      console.log('Rate limit hit!');
      const reset = response.headers.get('X-RateLimit-Reset');
      console.log(`Reset at: ${new Date(Number(reset) * 1000).toISOString()}`);
      break;
    }
  }
}
```

## Monitoring

Monitor rate limit hits in your error tracking service (Sentry). Set up alerts if rate limits are hit frequently, as this might indicate:
- Legitimate high usage (consider increasing limits)
- Abuse or attack (investigate and block)
- Bug causing excessive requests (fix the bug)
