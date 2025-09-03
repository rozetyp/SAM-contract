# 🏛️ SAM.gov Contract Alerts - MVP

A micro-SaaS application that delivers personalized government contract opportunities from SAM.gov directly to your inbox. Users can set up custom search criteria and receive daily email digests with relevant federal contracting opportunities.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=flat&logo=github)](https://github.com/rozetyp/SAM-contract)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)
![Railway](https://img.shields.io/badge/Railway-Deployed-purple?style=flat&logo=railway)
![Stripe](https://img.shields.io/badge/Stripe-Payments-blue?style=flat&logo=stripe)

## 🚀 Features

- **🔍 Custom Search Criteria**: Keywords, NAICS codes, PSC codes, set-aside programs
- **📧 Daily Email Digests**: Automated delivery at 1 PM UTC
- **💳 Stripe Integration**: $19/month subscription with 7-day trial
- **🎯 Smart Filtering**: Base contracts only, no amendments
- **🔄 Deduplication**: Never receive the same opportunity twice
- **📊 Real-time Dashboard**: Manage search criteria and subscription
- **🏥 Health Monitoring**: Built-in health checks and logging

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14.2, TypeScript, React 18
- **Backend**: Next.js API routes, Drizzle ORM
- **Database**: PostgreSQL (Railway)
- **Email**: Resend with domain verification
- **Payments**: Stripe with webhooks
- **Deployment**: Railway (Web + Worker services)
- **Cron Jobs**: Railway cron scheduler

### Services Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Service   │    │ Worker Service  │    │   Database      │
│                 │    │                 │    │                 │
│ • Next.js App   │    │ • Cron Jobs     │    │ • PostgreSQL    │
│ • API Routes    │◄──►│ • SAM.gov API   │◄──►│ • User Data     │
│ • Stripe Webhooks│    │ • Email Sending │    │ • Search Config │
│ • Settings UI   │    │ • Health Checks │    │ • Sent Notices  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│     Stripe      │    │    SAM.gov      │
│   (Payments)    │    │  (Opportunities)│
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│     Resend      │    │  Email Delivery │
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18.17.0 or higher
- pnpm 9.6.0
- Railway CLI
- Stripe account
- Resend account
- SAM.gov API key
   ```bash
   git clone <repository-url>
   cd SAM-contract
   pnpm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Fill in all required environment variables
   ```

3. **Database Setup**
   ```bash
   ```bash
   pnpm run dev
   ```

### Environment Variables

#### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Application
APP_BASE_URL=https://your-domain.com

# Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Stripe Payments
STRIPE_SECRET_KEY=sk_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx

# SAM.gov API
SAM_OPPS_API_KEY=your_sam_api_key
SAM_EXCL_API_KEY=reserved_for_future

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd SAM-contract
   pnpm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Fill in all required environment variables
   ```

3. **Database Setup**
   ```bash
   pnpm run db:generate
   pnpm run db:migrate
   ```

4. **Development Server**
   ```bash
   pnpm run dev
   ```

### Service Configuration

#### Web Service
- **Purpose**: Next.js application with API routes
- **Build Command**: `pnpm run build`
- **Start Command**: `pnpm run start`
- **Environment**: All environment variables
- **Domain**: Custom domain or Railway subdomain

#### Worker Service  
- **Purpose**: Cron jobs and background processing
- **Build Command**: `pnpm -C packages/worker build`
- **Cron Schedule**: `0 13 * * *` (daily at 1 PM UTC)
- **Command**: `pnpm -w run cron:opps`
- **Environment**: Same as web service

#### Database Service
- **Type**: PostgreSQL addon
- **Purpose**: User data, search configurations, sent notices
- **Backup**: Automatic Railway backups

### Deployment Steps

✅ **Production Deployment Complete**

The application is fully deployed on Railway with the following services:

1. **Web Service**: Next.js application
   - Start Command: `pnpm -C apps/web start`
   - URL: https://web-production-8e472.up.railway.app
   - Build: Auto from GitHub main branch

2. **Worker Service**: Background job processor  
   - Start Command: `pnpm -C packages/worker start`
   - Environment: `NIXPACKS_START_CMD=pnpm -C packages/worker start`
   - Build: Auto from GitHub main branch

3. **Cron-Digest Service**: Scheduled daily digest
   - Start Command: `pnpm -w run cron:opps`
   - Schedule: Daily at 1 PM UTC
   - Build: Auto from GitHub main branch

4. **PostgreSQL Database**: Railway managed database
   - Connection: Automatic via `DATABASE_URL`
   - Backups: Managed by Railway

#### Manual Setup (if recreating):

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Railway Project**
   ```bash
   railway project create sam-contract-alerts
   ```

3. **Add Database**
   ```bash
   railway add --database postgresql
   ```

4. **Deploy Services**
   ```bash
   railway up --service web
   railway up --service worker
   railway up --service cron-digest
   ```

5. **Configure Worker Service**
   ```bash
   railway variables --set "NIXPACKS_START_CMD=pnpm -C packages/worker start" --service worker
   ```

6. **Set Environment Variables**
   ```bash
   railway variables --set "RESEND_API_KEY=your_key" --service web
   railway variables --set "STRIPE_SECRET_KEY=your_key" --service web
   # Repeat for all required variables
   ```

## 💳 Stripe Integration

### Product Setup
1. **Create Product** in Stripe Dashboard
   - Name: "SAM Contract Alerts"
   - Pricing: $19/month (recurring)
   - Trial: 7 days (trial_period_days)
   - Refunds: 14-day money-back guarantee (processed manually)

2. **Webhook Configuration**
   - Endpoint: `{APP_BASE_URL}/api/stripe/webhook`
   - Events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated` 
     - `customer.subscription.deleted`

### Payment Flow
```mermaid
sequenceDiagram
    participant User
    participant App
    participant Stripe
    participant Database

    User->>App: Click "Upgrade to Paid"
    App->>Stripe: Create checkout session
    Stripe-->>App: Return checkout URL
    App-->>User: Redirect to Stripe
    User->>Stripe: Complete payment
   Stripe->>App: Webhook: checkout.session.completed
   App->>Database: Link customerId (plan remains trial until subscription active)
    App-->>User: Redirect to settings (paid)
```

## 📧 Email Configuration

### Resend Setup
1. **Create Account** at [resend.com](https://resend.com)
2. **Verify Domain** (required for production)
3. **Get API Key** from dashboard
4. **Configure From Address**: `alerts@yourdomain.com`

### Email Templates
- **Subject**: "Your SAM.gov daily digest"
- **Format**: HTML with responsive design
- **Content**: Contract opportunities with titles, agencies, deadlines
- **Frequency**: Daily at 1 PM UTC
 - **From**: Defaults to `onboarding@resend.dev` in code; set `RESEND_FROM=alerts@yourdomain.com` and verify your domain in Resend for production.

### Development Mode
- **Test Mode**: Emails only sent to verified sender
- **Dry Run**: Set `RESEND_DRY=true` to log instead of send
- **Mock Data**: Use `/api/dev/digest-preview` for template testing

## 🔧 API Reference

### Settings API
```typescript
POST /api/settings
Content-Type: application/json

{
   "email": "user@example.com",
   "q": "software development",
   "naics": ["541511", "541512"],
   "psc": ["D316", "D317"],
   "setaside": ["SBA", "WOSB"]
}
```

Behavior:
- plan transitions: `trial` -> `paid` when Stripe subscription becomes `active`.
- cancel during trial or cancellation effective immediately: plan set to `canceled`; digests stop.

### Health Check
```typescript
GET /api/health
Response: {
   ok: true,
   ts: 1693683000000,
   lastCron: { id, job, ok, error, ranAt } | null
}
```

### Development APIs
```typescript
// Echo test
POST /api/dev/echo
Body: { "message": "test" }

// Preview email template  
GET /api/dev/digest-preview

// Mock SAM.gov data
GET /api/dev/sam-mock

// Trigger cron in dev (disabled in production)
POST /api/dev/run-cron
```

## 🎯 SAM.gov Integration

### API Configuration
- **Base URL**: `https://api.sam.gov/opportunities/v2/search`
- **Authentication**: API key in query parameter
- **Rate Limits**: Respect SAM.gov rate limiting
- **Date Format**: MM/dd/yyyy (required by SAM.gov)

### Search Parameters
| Parameter | Description | Example |
|-----------|-------------|---------|
| `q` | Keywords search | `"software development"` |
| `ncode` | NAICS codes | `"541511"` |
| `ccode` | PSC classification codes | `"D316"` |
| `typeOfSetAside` | Set-aside programs | `"SBA"` |
| `postedFrom` | Start date | `"08/31/2025"` |
| `postedTo` | End date | `"09/02/2025"` |
| `limit` | Results per page | `1000` |
| `ptype` | Procurement types | `"o,k,p"` |

Notes:
- postedFrom/postedTo required in MM/dd/yyyy; 1-year max span.
- Use limit ≤ 1000 with offset paging; stop when offset + pageCount ≥ totalRecords.
- The API returns the latest active version; filter by base types (ptype o,k,p) and drop amendments by title.

### Data Processing
1. **Fetch** opportunities from SAM.gov API
2. **Filter** base contract types (no amendments)
3. **Deduplicate** against sent notices
4. **Format** for email template
5. **Record** sent notice IDs

Security & deliverability notes:
- Stripe webhook verification uses the raw request body (no JSON parse) and signature header.
- Resend requires domain verification for production sending; set `RESEND_FROM` to your verified sender.

## 🔄 Cron Job System

### Schedule
- **Frequency**: Daily
- **Time**: 1:00 PM UTC
- **Cron Expression**: `0 13 * * *`
- **Service**: Railway Worker

### Time Zone Conversions
| UTC 13:00 | Local Time |
|-----------|------------|
| EST (Winter) | 8:00 AM |
| EST (Summer) | 9:00 AM | 
| PST (Winter) | 5:00 AM |
| PST (Summer) | 6:00 AM |
| CET (Winter) | 2:00 PM |
| CET (Summer) | 3:00 PM |

### Execution Flow
```mermaid
flowchart TD
    A[Cron Trigger] --> B[Load Paid Users]
    B --> C[For Each User]
    C --> D[Load Search Criteria]
    D --> E{Has Criteria?}
    E -->|No| F[Skip User]
    E -->|Yes| G[Query SAM.gov API]
    G --> H[Filter Results]
    H --> I[Check Duplicates]
    I --> J{New Results?}
    J -->|No| K[Skip Email]
    J -->|Yes| L[Generate Email]
    L --> M[Send via Resend]
    M --> N[Record Sent IDs]
    N --> O[Next User]
    F --> O
    K --> O
    O --> P{More Users?}
    P -->|Yes| C
    P -->|No| Q[Complete]
```

### Manual Execution
```bash
# Run cron job manually
pnpm run cron:opps

# Run with Railway
railway run --service worker pnpm -w run cron:opps

# Health check
pnpm run cron:health
```

## 🗄️ Database Schema

### Tables (current implementation)

#### users
```sql
CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   email VARCHAR(255) UNIQUE NOT NULL,
   plan VARCHAR(32) NOT NULL DEFAULT 'paid',
   stripe_customer_id VARCHAR(255),
   created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### searches
```sql
CREATE TABLE searches (
   id SERIAL PRIMARY KEY,
   user_id INTEGER NOT NULL,
   q TEXT,
   naics TEXT[],
   psc TEXT[],
   setaside TEXT[]
);
```

#### sent_notice_ids
```sql
CREATE TABLE sent_notice_ids (
   user_id INTEGER NOT NULL,
   notice_id VARCHAR(128) NOT NULL,
   sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
   PRIMARY KEY (user_id, notice_id)
);
```

#### cron_runs
```sql
CREATE TABLE cron_runs (
   id SERIAL PRIMARY KEY,
   job VARCHAR(64) NOT NULL,
   ok BOOLEAN NOT NULL DEFAULT true,
   error TEXT,
   ran_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Migrations
```bash
# Generate new migration
pnpm run db:generate

# Apply migrations
pnpm run db:migrate

# Check migration status
pnpm -C packages/db drizzle-kit status
```

## 🧪 Testing

### Manual Testing Flow
1. **User Registration**: Sign up flow
2. **Payment**: Complete Stripe checkout
3. **Settings**: Configure search criteria
4. **Cron Execution**: Run manual cron job
5. **Email Delivery**: Verify email received

### API Testing
```bash
# Health check
curl https://your-app.railway.app/api/health

# Echo test
curl -X POST https://your-app.railway.app/api/dev/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Preview email template
curl https://your-app.railway.app/api/dev/digest-preview
```

### E2E Testing Script
```bash
# 1. Set up test environment
export DATABASE_URL="your_test_db_url"
pnpm run db:migrate

# 2. Seed test user
psql $DATABASE_URL -c "
   INSERT INTO users (email, plan) VALUES ('test@example.com', 'paid');
   INSERT INTO searches (user_id, q, naics, psc, setaside)
   VALUES (1, 'software development', ARRAY['541511'], ARRAY['D316'], ARRAY['SBA']);
"

# 3. Run cron job
pnpm run cron:opps

# 4. Verify email sent
# Check Resend dashboard or logs
```

## 📊 Monitoring & Logging

### Health Checks
- **Endpoint**: `/api/health`
- **Database**: Connection verification  
- **Environment**: Variable validation
- **Services**: Status monitoring

### Logging Levels
- **Info**: Successful operations
- **Warn**: Recoverable issues
- **Error**: Critical failures
- **Debug**: Development details

### Key Metrics
- **Users**: Total, paid, trial
- **Emails**: Sent, failed, bounced
- **API Calls**: SAM.gov requests, rate limits
- **Performance**: Response times, job duration

### Railway Monitoring
- **Build Logs**: Deployment status
- **Runtime Logs**: Application output  
- **Metrics**: CPU, memory, network
- **Alerts**: Error notifications

## 🚨 Troubleshooting

### Common Issues

#### Email Delivery Problems
```bash
# Check Resend configuration
curl -H "Authorization: Bearer $RESEND_API_KEY" \
  https://api.resend.com/domains

# Verify domain status
# Problem: 403 Forbidden
# Solution: Verify domain in Resend dashboard
```

#### SAM.gov API Errors
```bash
# Check API key validity
curl "https://api.sam.gov/opportunities/v2/search?api_key=$SAM_OPPS_API_KEY&limit=1"

# Common Issues:
# - 401: Invalid API key
# - 400: Wrong date format (use MM/dd/yyyy)
# - 429: Rate limit exceeded
```

#### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check migrations
pnpm run db:migrate

# Verify table structure
psql $DATABASE_URL -c "\dt"
```

#### Stripe Webhook Problems
```bash
# Test webhook endpoint
curl -X POST https://your-app.railway.app/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test" \
  -d '{"type": "test"}'

# Check webhook configuration in Stripe dashboard
# Verify STRIPE_WEBHOOK_SECRET matches
```

### Debug Commands
```bash
# View Railway logs
railway logs --service web
railway logs --service worker

# Run health check
pnpm run cron:health

# Test email template
curl https://your-app.railway.app/api/dev/digest-preview

# Database debug
railway run psql $DATABASE_URL -c "SELECT * FROM users LIMIT 5;"
```

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build production application |
| `pnpm run start` | Start production server |
| `pnpm run db:generate` | Generate database migrations |
| `pnpm run db:migrate` | Apply database migrations |
| `pnpm run cron:opps` | Run SAM.gov digest cron job |
| `pnpm run cron:health` | Run cron service health check |
| `pnpm run test` | Run test suite |

## 🔒 Security Considerations

### Environment Security
- **Never commit** `.env` files
- **Rotate API keys** regularly  
- **Use Railway secrets** for production
- **Verify webhook signatures** from Stripe

### Database Security  
- **Use connection pooling** for performance
- **Implement query timeouts** 
- **Validate all inputs** before queries
- **Use parameterized queries** (Drizzle handles this)

### API Security
- **Rate limiting** on API endpoints
- **Input validation** and sanitization
- **CORS configuration** for browser requests
- **HTTPS only** in production

## 🚀 Future Enhancements

### Planned Features
- [ ] **Advanced Filters**: Award amount ranges, location-based
- [ ] **Multiple Alerts**: Different schedules per search
- [ ] **Agency Tracking**: Follow specific government agencies  
- [ ] **Contract History**: Track opportunity lifecycle
- [ ] **Mobile App**: React Native or PWA
- [ ] **API Access**: Public API for developers
- [ ] **Team Accounts**: Multiple users per subscription

### Technical Improvements
- [ ] **Redis Caching**: Cache API responses
- [ ] **Queue System**: Background job processing
- [ ] **CDN Integration**: Static asset optimization
- [ ] **Multi-region**: Deploy across regions
- [ ] **Advanced Monitoring**: APM integration
- [ ] **Load Balancing**: Handle increased traffic

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For technical support or questions:
- **Email**: support@sam-alerts.com
- **Documentation**: See `/docs` folder
- **Railway Support**: [Railway Help](https://railway.app/help)
- **Stripe Support**: [Stripe Docs](https://stripe.com/docs)

## 📊 Current Status

✅ **Production Deployed**: All services running on Railway  
✅ **Web Application**: Next.js app deployed at `web-production-8e472.up.railway.app`  
✅ **Worker Service**: Background job processing active  
✅ **Cron Service**: Daily digest automation operational  
✅ **Database**: PostgreSQL connected and functional  
✅ **Payment Integration**: Stripe subscriptions working  
✅ **Email Delivery**: Resend integration functional  
✅ **Auto-deployment**: GitHub connected to Railway  

**Fully operational and ready for users!** 🚀

### Service URLs
- **Web App**: https://web-production-8e472.up.railway.app
- **GitHub**: https://github.com/rozetyp/SAM-contract
- **Railway Project**: bidbeacon-dev (production environment)