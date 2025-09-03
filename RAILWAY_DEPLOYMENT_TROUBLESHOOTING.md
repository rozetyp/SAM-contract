# Railway Deployment Troubleshooting Guide

## Issues Resolved

### 1. Initial 502 Bad Gateway Errors

**Problem**: All Railway services returning HTTP 502 "Application failed to respond"

**Root Cause**: Database imports at module level causing startup failures when `DATABASE_URL` environment variable wasn't properly loaded during app initialization.

**Solution**:
- Modified `/apps/web/src/app/api/health/route.ts` to use dynamic imports only when `DATABASE_URL` is available
- Changed from top-level imports to conditional runtime imports:

```typescript
// Before (caused startup failure):
import { makeDb, makePool, cronRuns } from '@sam/db';

// After (conditional loading):
if (process.env.DATABASE_URL) {
  const { makeDb, makePool, cronRuns } = await import('@sam/db');
  // ... use database
} else {
  return NextResponse.json({ ok: true, ts: Date.now(), lastCron: null, note: 'no database' });
}
```

### 2. Railway Start Command Configuration

**Problem**: Railway was using a generic start command for all services, causing wrong service behavior.

**Root Cause**: The `railway.json` configuration had a global `deploy.startCommand` that applied to all services.

**Solution**: 
- Updated `railway.json` to use service-specific configurations:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "services": {
    "web": {
      "startCommand": "pnpm start"
    },
    "cron-digest": {
      "startCommand": "pnpm -w run cron:run"
    },
    "worker": {
      "startCommand": "pnpm -C packages/worker start"
    }
  },
  "cron": {
    "schedule": "0 13 * * *",
    "command": "pnpm -w run cron:opps"
  }
}
```

### 3. Missing Script Commands

**Problem**: Railway trying to execute `pnpm -w run cron:run` but script didn't exist.

**Solution**: 
- Added `cron:run` script to root `package.json`:
```json
{
  "scripts": {
    "cron:run": "pnpm -C packages/worker cron:opps"
  }
}
```

- Added `cron:run` alias to worker `package.json`:
```json
{
  "scripts": {
    "cron:run": "pnpm -w run cron:opps"
  }
}
```

### 4. Cron-Digest Service Running Web Application

**Problem**: The cron-digest service was starting the Next.js web application instead of running cron jobs.

**Root Cause**: All services inherited the same start command from global Railway configuration.

**Solution**: Implemented service-specific start commands as documented in issue #2 above.

## Final Service Configuration

After resolution, each Railway service runs correctly:

- **web**: `pnpm start` → Starts Next.js web application on port 8080
- **cron-digest**: `pnpm -w run cron:run` → Executes SAM.gov opportunities digest 
- **worker**: `pnpm -C packages/worker start` → Runs background worker processes

## Verification Commands

```bash
# Check web service
curl -I https://web-production-8e472.up.railway.app/
curl https://web-production-8e472.up.railway.app/api/health

# Check service logs
railway service web && railway logs
railway service cron-digest && railway logs  
railway service worker && railway logs

# Check environment variables
railway variables
```

## Environment Variables Required

- `DATABASE_URL`: PostgreSQL connection string
- `RESEND_API_KEY`: For email sending
- `SAM_OPPS_API_KEY`: For SAM.gov API access
- `STRIPE_SECRET_KEY`: For payment processing
- `STRIPE_WEBHOOK_SECRET`: For Stripe webhooks
- `APP_BASE_URL`: Base URL for the application

## Key Lessons Learned

1. **Conditional Database Loading**: Always check for environment variables before importing modules that require them
2. **Service-Specific Configuration**: Use Railway's service-specific configuration instead of global settings when services have different purposes
3. **Script Consistency**: Ensure all referenced npm scripts exist in the correct package.json files
4. **Deployment Testing**: Test each service individually after configuration changes

## Files Modified

- `/apps/web/src/app/api/health/route.ts` - Fixed database import issue
- `/railway.json` - Added service-specific configurations  
- `/package.json` - Added `cron:run` script
- `/packages/worker/package.json` - Added `cron:run` alias

## Commit History

1. `Fix health endpoint to not require DATABASE_URL at startup` (08694bf)
2. `Explicitly set Railway start command` (88b65e1)  
3. `Restore complex landing page without react-icons` (d58936b)
4. `Updated cron scripts: added cron:run alias mapping to cron:opps` (574d9fc)
5. `Fix Railway config: separate start commands for web and cron-digest services` (d9c8229)
6. `Add worker service configuration to Railway config` (e075510)
