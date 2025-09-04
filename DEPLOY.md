# Railway Deployment Guide

## Production URLs
- Web App: `https://web-production-8e472.up.railway.app`
- Health Check: `https://web-production-8e472.up.railway.app/api/health`
- Stripe Webhook: `https://web-production-8e472.up.railway.app/api/stripe/webhook`

## Prerequisites
1. Push your code to GitHub
2. Have Railway account ready
3. Gather all environment variables from .env.example

## Deployment Steps

### 1. Create Railway Project
```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new
```

### 2. Add Database
- In Railway dashboard: Add PostgreSQL service
- Copy DATABASE_URL from Railway Postgres service

### 3. Deploy Web Service
```bash
# Deploy web app
railway up --service web

# Set environment variables in Railway dashboard:
# - DATABASE_URL (from Railway Postgres)
# - APP_BASE_URL (your Railway app URL, e.g., https://yourapp.railway.app)
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - STRIPE_PRICE_ID
# - RESEND_API_KEY
# - SAM_OPPS_API_KEY
# - SAM_EXCL_API_KEY (optional)
```

### 4. Run Database Migrations
```bash
# Connect to your Railway project
railway shell

# Run migrations
pnpm -w run db:migrate
```

### 5. Set Up Cron Job
In Railway dashboard:
- Create cron trigger
- Schedule: `0 13 * * *` (daily at 1 PM UTC)
- Command: `pnpm -w run cron:opps`

### 6. Configure Stripe Webhook
- Point Stripe webhook to: `https://yourapp.railway.app/api/stripe/webhook`
- Events: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted

### 7. Test Deployment
- Visit your app URL
- Test /api/health endpoint
- Try settings save and Stripe checkout flow
- Verify cron job execution in Railway logs

## Environment Variables Checklist
```
DATABASE_URL=postgresql://...
APP_BASE_URL=https://yourapp.railway.app
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
SAM_OPPS_API_KEY=your_sam_key
SAM_EXCL_API_KEY=your_sam_excl_key
```

## Monitoring
- Railway dashboard shows logs and metrics
- /api/health endpoint reports cron status
- Settings page shows cron failure banner if needed
