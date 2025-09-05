# Rate Limiting Control Guide

The SAM API rate limiting can be controlled with a simple environment variable.

## How to Switch Modes

### Option 1: Environment Variable (Recommended)
Set `SAM_RATE_LIMIT_MODE` in your environment:

```bash
# Conservative mode (safe for testing/development)
export SAM_RATE_LIMIT_MODE=conservative

# Production mode (full service capacity)  
export SAM_RATE_LIMIT_MODE=production
```

### Option 2: Manual Override
You can override specific limits with individual environment variables:

```bash
export SAM_MAX_API_CALLS_PER_USER=5
export SAM_DELAY_BETWEEN_API_CALLS=2000
export SAM_DELAY_BETWEEN_USERS=5000
```

## Current Behavior

### Conservative Mode (Default)
- **2 API calls** per user max
- **50 records** per API call  
- **3-8 second delays** between calls/users
- **Total per user**: Up to 100 records
- **Safe for**: Testing, development, debugging

### Production Mode
- **8 API calls** per user max
- **500 records** per API call
- **1-3 second delays** between calls/users  
- **Total per user**: Up to 4,000 records
- **Used for**: Live service, comprehensive results

## Railway Configuration

To set production mode on Railway:
1. Go to your Railway project
2. Click on your service
3. Go to Variables tab
4. Add: `SAM_RATE_LIMIT_MODE` = `production`
5. Redeploy

## Local Testing

```bash
# Test with conservative limits (default)
npm run build && node dist/jobs/opps.js

# Test with production limits locally
SAM_RATE_LIMIT_MODE=production npm run build && node dist/jobs/opps.js
```

The current mode will be logged when the job runs:
```
🔧 Rate limit mode: conservative
⚙️  Rate limiting config:
  - Mode: conservative
  - Max API calls per user: 2
  - Records per API call: 50
```
