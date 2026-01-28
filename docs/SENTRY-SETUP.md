# Sentry Error Tracking Setup Guide

## Overview

Sentry provides error tracking, performance monitoring, and release management. For HIPAA Hub, it's critical for monitoring production errors while maintaining HIPAA compliance.

## Installation

```bash
pnpm add @sentry/nextjs
```

## Setup

### 1. Initialize Sentry

Run the Sentry wizard:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.mjs`
- Add environment variables

### 2. Configure Environment Variables

Add to `.env.local`:

```env
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=hipaa-hub
SENTRY_AUTH_TOKEN=your-auth-token
```

### 3. Update Configuration Files

#### `sentry.client.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Adjust sample rate for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Remove sensitive data from errors
    if (event.request) {
      // Remove headers that might contain tokens
      delete event.request.headers;
      
      // Remove query params that might contain sensitive data
      if (event.request.url) {
        const url = new URL(event.request.url);
        url.searchParams.forEach((value, key) => {
          if (key.toLowerCase().includes('token') || 
              key.toLowerCase().includes('key') ||
              key.toLowerCase().includes('secret')) {
            url.searchParams.set(key, '[REDACTED]');
          }
        });
        event.request.url = url.toString();
      }
    }
    
    // Remove user data that might contain PHI
    if (event.user) {
      event.user = {
        id: event.user.id,
        // Don't include email, name, or other PHI
      };
    }
    
    return event;
  },
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    // Network errors that are expected
    'NetworkError',
    'Failed to fetch',
  ],
});
```

#### `sentry.server.config.ts`

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  tracesSampleRate: 0.1,
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove database connection strings
    if (event.extra) {
      Object.keys(event.extra).forEach((key) => {
        if (key.toLowerCase().includes('password') ||
            key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('key') ||
            key.toLowerCase().includes('token')) {
          event.extra[key] = '[REDACTED]';
        }
      });
    }
    
    return event;
  },
});
```

### 4. Replace console.error

Create a utility function:

```typescript
// lib/logger.ts
import * as Sentry from '@sentry/nextjs';

export function logError(error: Error, context?: Record<string, any>) {
  // Log to Sentry
  Sentry.captureException(error, {
    extra: context,
    tags: {
      component: context?.component || 'unknown',
    },
  });
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error, context);
  }
}
```

### 5. Update Error Boundaries

Update `app/error.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // ... rest of component
}
```

### 6. Update API Routes

Replace `console.error` with Sentry:

```typescript
// Before
try {
  // ...
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

// After
import { logError } from '@/lib/logger';

try {
  // ...
} catch (error) {
  logError(error instanceof Error ? error : new Error(String(error)), {
    component: 'api/documents/generate',
    userId: user?.id,
  });
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

## HIPAA Compliance Considerations

### Data Filtering

- **Never log PHI**: Filter out any patient health information
- **Never log credentials**: Remove passwords, tokens, API keys
- **Sanitize user data**: Only log user IDs, not names or emails
- **Filter database queries**: Don't log SQL queries that might contain PHI

### Access Control

- Limit Sentry access to authorized personnel only
- Use Sentry's access control features
- Regularly audit who has access to error logs

### Data Retention

- Configure Sentry data retention policies
- Ensure compliance with your data retention policy
- Set up automatic deletion of old errors

## Source Maps

Source maps help debug production errors. Configure in `next.config.mjs`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // ... your config
};

module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry options
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Next.js options
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

## Monitoring & Alerts

Set up alerts in Sentry for:
- Critical errors (500s)
- High error rates
- Performance degradation
- Security-related errors

## Implementation Checklist

- [ ] Install `@sentry/nextjs`
- [ ] Run Sentry wizard
- [ ] Configure environment variables
- [ ] Update `sentry.client.config.ts` with data filtering
- [ ] Update `sentry.server.config.ts` with data filtering
- [ ] Create `lib/logger.ts` utility
- [ ] Replace all `console.error` with `logError`
- [ ] Update error boundaries
- [ ] Update API routes
- [ ] Configure source maps
- [ ] Set up alerts
- [ ] Test error reporting
- [ ] Document data filtering rules
- [ ] Review Sentry access permissions

## Testing

Test error reporting:

```typescript
// In a test API route or component
import { logError } from '@/lib/logger';

// Test error
logError(new Error('Test error'), {
  component: 'test',
  test: true,
});
```

Check Sentry dashboard to verify the error appears correctly filtered.
