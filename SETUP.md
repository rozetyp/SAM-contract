# SAM.gov Contract Digest Service - Setup Guide

## Overview
This is a production-ready SAM.gov contract digest service built with:
- **Next.js 14** (Web UI/API)
- **Railway** (Deployment platform)
- **PostgreSQL** (Database)
- **Drizzle ORM** (Database queries)
- **Stripe** (Payments)
- **Resend** (Email delivery)
- **SAM.gov API** (Contract data)

## Architecture
- **2-service setup**: Web service + Cron service
- **Daily cron job**: Runs at 1 PM UTC to fetch SAM.gov opportunities
- **Email digests**: Sent to subscribed users based on their search criteria

## Prerequisites
- Node.js 18+
- pnpm
- Railway account
- Stripe account
- Resend account
- SAM.gov API key

## Quick Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd sam-contract
pnpm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:

```bash
# Database
DATABASE_URL="postgresql://..."

# SAM.gov API
SAM_OPPS_API_KEY="your-sam-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."

# App
APP_BASE_URL="https://your-domain.com"
NEXT_PUBLIC_URL="https://your-domain.com"
```

### 3. Database Setup
```bash
# Generate migration files
pnpm --filter=@sam/db db:generate

# Push schema to database
pnpm --filter=@sam/db db:push

# (Optional) Seed with test data
pnpm --filter=@sam/db db:seed
```

### 4. Railway Deployment

#### Create Railway Project
```bash
railway login
railway init
```

#### Add Services
```bash
# Add PostgreSQL database
railway add postgres

# Add web service
railway add --name web

# Add cron service
railway add --name cron-digest
```

#### Configure Environment Variables
Set these variables in Railway dashboard or via CLI:

**Web Service:**
```bash
APP_BASE_URL=https://web-production-xxxx.up.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
RAILWAY_START_COMMAND=pnpm --filter=web run start
RESEND_API_KEY=your-resend-key
SAM_OPPS_API_KEY=your-sam-api-key
STRIPE_PRICE_ID=your-stripe-price-id
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

**Cron Service:**
```bash
APP_BASE_URL=https://web-production-xxxx.up.railway.app
CRON_SCHEDULE=0 13 * * *
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
NIXPACKS_BUILD_CMD=true
NIXPACKS_START_CMD=true
RAILWAY_CRON_ENABLED=true
RAILWAY_RESTART_POLICY=never
RAILWAY_RUN_CMD=pnpm -w run cron:opps
RESEND_API_KEY=your-resend-key
SAM_OPPS_API_KEY=your-sam-api-key
STRIPE_PRICE_ID=your-stripe-price-id
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

### 5. Deploy
```bash
railway up
```

## Project Structure

```
sam-contract/
├── apps/
│   └── web/                 # Next.js web application
│       ├── src/
│       │   ├── app/         # Next.js 14 app router
│       │   ├── components/  # React components
│       │   └── lib/         # Utilities and data files
│       └── package.json
├── packages/
│   ├── db/                  # Database package (Drizzle ORM)
│   │   ├── src/
│   │   │   ├── client.ts    # Database client
│   │   │   ├── index.ts     # Exports
│   │   │   └── schema.ts    # Database schema
│   │   └── drizzle.config.ts
│   ├── emails/              # Email templates (Resend)
│   │   └── src/
│   │       └── index.ts     # Email templates
│   └── worker/              # Cron job worker
│       └── src/
│           └── jobs/
│               └── opps.ts  # Main cron job logic
├── drizzle/                 # Database migrations
├── scripts/                 # Utility scripts
├── .env.example             # Environment template
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # Workspace configuration
└── railway.json             # Railway configuration
```

## Key Features

### User Management
- Trial/Paid subscriptions via Stripe
- Search criteria configuration (NAICS, PSC, SetAside codes)
- Email preferences

### SAM.gov Integration
- Daily opportunity fetching (last 2 days)
- Filtering by user criteria
- Rate limiting protection (3s between users)
- Deduplication against sent notices

### Email System
- HTML digest emails via Resend
- Opportunity details with links
- Unsubscribe functionality

### Database Schema
- Users table (email, plan, stripe_customer_id)
- Searches table (user search criteria)
- Sent notices tracking (prevent duplicates)
- Cron runs logging (success/failure tracking)

## Development

### Local Development
```bash
# Start web service
pnpm --filter=web run dev

# Start worker (one-time run)
pnpm --filter=worker run cron:opps

# Database operations
pnpm --filter=@sam/db db:generate
pnpm --filter=@sam/db db:push
pnpm --filter=@sam/db db:studio
```

### Testing
```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter=@sam/worker test
```

### Building
```bash
# Build all packages
pnpm build

# Build specific service
pnpm --filter=web run build
pnpm --filter=@sam/worker run build
```

## Monitoring & Maintenance

### Health Checks
- Web service: `GET /api/health`
- Database connectivity check
- Last cron run status

### Cron Job Monitoring
- Check Railway logs for cron service
- Monitor database `cron_runs` table
- Rate limiting status

### Common Issues

#### Rate Limiting
- SAM.gov API has strict rate limits
- System includes 3s delays between users
- Monitor `cron_runs` table for `rate_limited` status

#### Database Issues
- Check Railway PostgreSQL service
- Verify `DATABASE_URL` environment variable
- Run migrations: `pnpm --filter=@sam/db db:push`

#### Email Issues
- Verify Resend API key
- Check spam folders
- Monitor Resend dashboard

## API Endpoints

### Public Endpoints
- `GET /` - Main application
- `GET /api/health` - Health check
- `POST /api/settings` - User settings (requires auth)
- `POST /api/stripe/checkout` - Payment processing
- `POST /api/stripe/webhook` - Stripe webhooks

### Development Endpoints
- `GET /api/dev/digest-preview` - Preview email digest
- `POST /api/dev/run-cron` - Manual cron trigger
- `GET /api/dev/debug-users` - User debugging

## Security Considerations
- Environment variables for all secrets
- Stripe webhook signature verification
- Production-only development endpoints
- Database connection pooling
- Rate limiting on API calls

## Performance Optimization
- Database connection pooling
- Efficient queries with indexes
- Caching where appropriate
- Minimal API calls to external services

## Troubleshooting

### Cron Job Not Running
1. Check Railway cron service logs
2. Verify `RAILWAY_CRON_ENABLED=true`
3. Check `CRON_SCHEDULE` format
4. Ensure `RAILWAY_RUN_CMD` is correct

### Database Connection Issues
1. Verify `DATABASE_URL` in Railway
2. Check PostgreSQL service status
3. Run `railway connect postgres` for debugging

### Build Failures
1. Check Railway build logs
2. Verify `NIXPACKS_*` variables are not set to "none"
3. Ensure all dependencies are in `package.json`

### Email Not Sending
1. Check Resend API key
2. Verify `RESEND_API_KEY` environment variable
3. Monitor Resend dashboard for errors

## Contributing
1. Follow existing code patterns
2. Add tests for new features
3. Update documentation
4. Test locally before deploying

## License
[Add your license here]
