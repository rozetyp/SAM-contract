# BidBeacon - SAM.gov Contract Alerts

**What this is**: A micro-SaaS that sends daily email digests of federal contract opportunities from SAM.gov. Users configure search criteria and receive filtered, deduplicated opportunities at $19/month.

## Architecture Overview

**PNPM Monorepo Structure** (packages share dependencies, build in sequence):
- `packages/db/` - Drizzle ORM schema + connection utilities
- `packages/emails/` - HTML email template generation  
- `packages/worker/` - Cron job runner for SAM.gov API + email sending
- `apps/web/` - Next.js frontend with API routes for settings/billing

**Critical Services Pattern**:
- **Web Service**: Next.js app handles UI, Stripe webhooks, user settings (`railway.json` → `web`)
- **Worker Service**: Standalone cron runner (`railway.json` → `cron-digest` → `pnpm -w run cron:opps`)
- **Database**: PostgreSQL with deduplication via `(user_id, notice_id)` unique constraint

## Key Development Patterns

**Database Schema** (`packages/db/src/schema.ts`):
- Dual field strategy: `naics`/`ncode`, `psc`/`ccode` for backward compatibility during SAM.gov API migration
- Arrays stored as PostgreSQL arrays: `text('field').array()`
- Deduplication table: `sentNoticeIds` prevents duplicate emails per user

**SAM.gov API Integration** (`packages/worker/src/jobs/opps.ts`):
- **2-day calendar window**: `postedFrom=yesterday, postedTo=today` (MM/dd/yyyy format required)
- **Pagination**: `limit=1000`, loop `offset` until `offset + count >= totalRecords`
- **Noise filtering**: Only `ptype=o,k,p` (base contracts), drop amendment titles `/amend|modif|corrigen/i`

**Email System** (`packages/emails/` + Resend):
- Template in `packages/emails/src/index.ts` - simple HTML with inline styles
- Sent via Resend from worker, requires SPF/DKIM domain verification
- Delivery: Daily at 13:00 UTC via Railway cron

## Essential Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server
pnpm build                  # Build all packages in dependency order

# Database (uses Drizzle)
pnpm db:generate           # Generate migrations
pnpm db:migrate           # Apply migrations  

# Cron/Worker
pnpm cron:opps            # Run opportunity digest job manually
pnpm test                 # Run Vitest tests

# Deployment (Railway)
git push                  # Auto-deploy via Railway GitHub integration
```

## Critical Integration Points

**Stripe Webhooks** (`apps/web/src/app/api/stripe/webhook/route.ts`):
- Must verify signature on **raw request body** (not parsed JSON)
- `checkout.session.completed` → set user `plan='paid'`

**SAM.gov API Constraints**:
- Date parameters MUST be MM/dd/yyyy format (no time granularity)
- Rate limits require exponential backoff on 429/5xx
- API key goes in `SAM_OPPS_API_KEY` environment variable

**Railway Multi-Service Deployment**:
- `railway.json` defines 3 services: `web`, `cron-digest`, `worker`
- Cron schedule: `"0 13 * * *"` for 13:00 UTC daily
- Each service has different start command, shares same codebase

## Key Files That Define System Behavior

- `packages/worker/src/jobs/opps.ts` - Core business logic (SAM.gov → email)
- `packages/db/src/schema.ts` - Database structure and relationships
- `apps/web/src/app/api/settings/route.ts` - User search configuration
- `railway.json` - Service definitions and cron scheduling
- `packages/emails/src/index.ts` - Email template (keep simple for deliverability)

## Debugging Patterns

**Health Monitoring**: `/api/health` shows last cron run status from `cronRuns` table
**Cron Logs**: Check Railway logs for `packages/worker` service 
**Email Issues**: Verify Resend domain SPF/DKIM, check spam folders
**SAM.gov API**: Rate limit 429s require retry with jitter, log zero-result warnings

When working on this codebase, always consider the data flow: User configures search → Cron fetches SAM.gov → Filter/dedupe → Generate email → Send via Resend → Update sent tracking.
