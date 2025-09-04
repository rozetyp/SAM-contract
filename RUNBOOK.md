# Runbook

Cron jobs:
- SAM.gov Opportunities Digest: pnpm -w run cron:opps (schedule daily 13:00 UTC)
	- Requirement: job must finish and exit cleanly (DB pool closed) per Railway cron.

Environment:
- Set envs from .env.example in Railway project variables.

Migrations:
- pnpm -w run db:generate
- pnpm -w run db:migrate

Release checks:
- One successful production digest email sent for each SAM job.
- 401/429 logs visible and **advanced rate limit backoff behavior verified**:
  - API call counting (API call #1, #2, etc.)
  - 2-second delays between API calls
  - 5-second delays between users
  - Exponential backoff retry logic
  - Per-user API call limits (max 10)
- Zero-record window warns but does not fail.

Monitoring:
- Health: GET /api/health returns { ok: true }
- Stripe webhook logs
- Cron failure banner on settings (placeholder) if last run failed.
- **Rate Limiting Monitoring**:
  - Check Railway logs for "API call #X" messages
  - Monitor "Waiting X seconds between API calls" delays
  - Watch for "Reached max API calls" safety limits
  - Review `cron_runs` table for `rate_limited` vs `failed` status
  - Check for exponential backoff: "Rate limited - waiting Xms before retry..."
  - Monitor retry success rates and safety mechanism triggers

## Troubleshooting

### Rate Limiting Issues
**Symptoms:**
- Cron job fails with "Max retries exceeded" errors
- 429 "Too Many Requests" in logs
- No "API call #X" counting messages

**Official Data.gov Limits:**
- 1,000 requests per hour across all services
- Rolling hourly reset
- Temporary API key blocking when exceeded

**Scaling Considerations:**
- **10 users**: ~100 calls over ~4 minutes (safe)
- **100 users**: ~1,000 calls over ~38 minutes (monitor closely)
- **100+ users**: Reduce SAM_MAX_API_CALLS_PER_USER or increase delays

**Solutions:**
1. **Check Environment Variables:**
   ```bash
   # Verify rate limiting config in Railway
   railway variables --service cron-digest | grep SAM_
   ```

2. **Adjust Rate Limiting (if needed):**
   ```bash
   # More conservative settings
   SAM_MAX_API_CALLS_PER_USER=5
   SAM_DELAY_BETWEEN_API_CALLS=3000
   SAM_DELAY_BETWEEN_USERS=8000
   ```

3. **Monitor Logs:**
   ```bash
   railway logs --service cron-digest
   # Look for: API call counting, delays, rate limit errors
   ```

4. **Check Database:**
   ```sql
   SELECT status, err_code, notes 
   FROM cron_runs 
   ORDER BY ran_at DESC 
   LIMIT 5;
   ```

### Common Issues
- **No API call counting**: Rebuild worker package (`pnpm --filter=@sam/worker build`)
- **Missing delays**: Check environment variables are set
- **Immediate 429 errors**: SAM.gov API may have IP-based limits
- **Database connection fails**: Verify Railway PostgreSQL service

Stripe Setup:
- Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET.
- Configure a webhook endpoint to {APP_BASE_URL}/api/stripe/webhook for events:
	checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted.
- Trial users receive digests; cancellation downgrades to canceled and disables digests.

## Testing

### Rate Limiting Testing

#### Local Testing (Fast Iteration)
```bash
# Set aggressive rate limiting for testing
export SAM_MAX_API_CALLS_PER_USER=3
export SAM_DELAY_BETWEEN_API_CALLS=500   # 0.5s
export SAM_DELAY_BETWEEN_USERS=1000      # 1s

# Run the cron job
pnpm --filter=worker run cron:opps
```

**Expected Results:**
- ✅ See "API call #1", "API call #2", "API call #3" in logs
- ✅ See "Waiting 0.5 seconds between API calls..."
- ✅ See "Waiting 1 seconds before processing next user..."
- ✅ No 429 rate limit errors

#### Railway Testing (Production Environment)
```bash
# Test the deployed cron job
railway run --service cron-digest pnpm --filter=worker run cron:opps
```

#### Manual API Testing (Web Interface)
```bash
# Test via the web API endpoint
curl -X POST https://web-production-8e472.up.railway.app/api/dev/run-cron
```

#### High-Load Testing (100 Users Scenario)
```bash
# Test with settings that would handle 100 users
export SAM_MAX_API_CALLS_PER_USER=5        # Reduce per-user calls
export SAM_DELAY_BETWEEN_API_CALLS=3000    # Increase delay between calls
export SAM_DELAY_BETWEEN_USERS=8000        # Increase delay between users

# This would result in: 100 users × 5 calls = 500 total calls
# Over ~13 minutes (well under 1,000/hour limit)
```

### Test Commands

#### Check Database Results:
```bash
# Check cron runs
railway run --service web psql $DATABASE_URL -c "
SELECT id, job, ok, status, ran_at, api_call_count
FROM cron_runs
ORDER BY ran_at DESC
LIMIT 5;"

# Check sent notices
railway run --service web psql $DATABASE_URL -c "
SELECT COUNT(*) as notices_sent_today
FROM sent_notice_ids
WHERE sent_at >= CURRENT_DATE;"
```

#### Monitor Railway Logs:
```bash
# Watch cron service logs in real-time
railway logs --service cron-digest --follow
```

### Configuration Testing

#### Test Different Scenarios:
```bash
# Conservative settings (production)
export SAM_MAX_API_CALLS_PER_USER=10
export SAM_DELAY_BETWEEN_API_CALLS=2000
export SAM_DELAY_BETWEEN_USERS=5000

# Aggressive settings (testing)
export SAM_MAX_API_CALLS_PER_USER=3
export SAM_DELAY_BETWEEN_API_CALLS=500
export SAM_DELAY_BETWEEN_USERS=1000

# Minimal settings (stress test)
export SAM_MAX_API_CALLS_PER_USER=1
export SAM_DELAY_BETWEEN_API_CALLS=100
export SAM_DELAY_BETWEEN_USERS=500
```

#### Test Retry and Backoff Logic:
```bash
# Force rate limiting to test retry logic
export SAM_MAX_RETRIES=3
export SAM_DELAY_BETWEEN_API_CALLS=100  # Very short to trigger rate limits

# Run with limited API calls to force retries
export SAM_MAX_API_CALLS_PER_USER=2
```

**Expected Results:**
- ✅ See retry attempts: "SAM API error 429 Too Many Requests (attempt 1/3)"
- ✅ See exponential backoff: "Rate limited - waiting 2000ms before retry..."
- ✅ See progressive delays: 2000ms, 4000ms, 8000ms for retries
- ✅ See successful recovery after retries

### Success Metrics
- **0 rate limit errors** in logs after retries
- **Consistent delays** between API calls
- **Proper API call limits** respected
- **Successful cron runs** with status 'completed'
- **Retry success rate** > 80% for rate limited requests
- **Exponential backoff** working (increasing delays)
- **Safety mechanisms** preventing infinite loops
- **Emails sent** to users (if opportunities found)

## 🔍 Monitoring & Log Analysis

### ✅ Success Indicators
- **API Call Counting:** Logs show "API call #1", "#2", etc.
- **Delays Working:** "Waiting X seconds between API calls..."
- **Exponential Backoff:** "Rate limited - waiting Xms before retry..." for 429 errors
- **Retry Logic:** Multiple attempts shown in logs for failed requests
- **Per-User Limits:** "Reached max API calls (10) for user..."
- **Safety Mechanisms:** No infinite loops, proper error categorization
- **No 429 Errors:** No rate limit error messages after retries
- **Database Updates:** New entries in cron_runs table with api_call_count

### ❌ Failure Indicators
- **429 Errors:** "SAM API error 429 Too Many Requests"
- **No Delays:** Rapid-fire API calls without pauses
- **Infinite Loops:** Continuous API calls beyond limits
- **Missing Logs:** No API call counting in logs

### Good Log Output:
```
📄 Fetching page at offset 0 (API call #1)...
⏳ Waiting 2 seconds between API calls...
📄 Fetching page at offset 100 (API call #2)...
✅ User user@example.com processing complete
⏳ Waiting 5 seconds before processing next user...
```

### Good Log Output with Retry:
```
📄 Fetching page at offset 0 (API call #1)...
SAM API error 429 Too Many Requests (attempt 1/3)
⏳ Rate limited - waiting 2000ms before retry...
📄 Fetching page at offset 0 (API call #1 retry)...
✅ Successfully fetched data after retry
```

### Bad Log Output:
```
📄 Fetching page at offset 0...
📄 Fetching page at offset 100...
📄 Fetching page at offset 200...
SAM API error 429 Too Many Requests
```

## 🚨 Troubleshooting Rate Limiting

### If Still Getting Rate Limits:
1. **Check Configuration:** Verify environment variables are set
2. **Increase Delays:** Try longer delays between calls
3. **Reduce API Calls:** Lower SAM_MAX_API_CALLS_PER_USER
4. **Check Logs:** Look for API call counting in logs
5. **Verify Retries:** Ensure exponential backoff is working

### If No Delays Working:
1. **Environment Variables:** Ensure they're properly exported
2. **Code Changes:** Verify the rate limiting code is deployed
3. **Log Output:** Check for delay messages in logs

### If Retries Not Working:
1. **Check SAM_MAX_RETRIES:** Ensure it's set (default: 3)
2. **Verify Backoff Logic:** Look for "Rate limited - waiting Xms" messages
3. **Check Error Types:** Different errors have different retry logic
4. **Monitor Success Rate:** Track if retries eventually succeed
- **Consistent delays** between API calls
- **Proper API call limits** respected
- **Successful cron runs** with status 'completed'
- **Retry success rate** > 80% for rate limited requests
- **Exponential backoff** working (increasing delays)
- **Safety mechanisms** preventing infinite loops
- **Emails sent** to users (if opportunities found)
