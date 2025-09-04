# SAM.gov Rate Limiting - Testing Guide
# ======================================

## 🎯 Testing Objectives
- Verify rate limiting works correctly
- Confirm no 429 errors occur
- Validate proper delays between API calls
- Test error handling and recovery

## 📋 Test Scenarios

### 1. Local Testing (Fast Iteration)
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

### 2. Railway Testing (Production Environment)
```bash
# Test the deployed cron job
railway run --service cron-digest pnpm --filter=worker run cron:opps
```

### 3. Manual API Testing (Web Interface)
```bash
# Test via the web API endpoint
curl -X POST https://web-production-8e472.up.railway.app/api/dev/run-cron
```

## 🔍 What to Monitor

### ✅ Success Indicators
- **API Call Counting:** Logs show "API call #1", "#2", etc.
- **Delays Working:** "Waiting X seconds between API calls..."
- **Per-User Limits:** "Reached max API calls (10) for user..."
- **No 429 Errors:** No rate limit error messages
- **Database Updates:** New entries in cron_runs table

### ❌ Failure Indicators
- **429 Errors:** "SAM API error 429 Too Many Requests"
- **No Delays:** Rapid-fire API calls without pauses
- **Infinite Loops:** Continuous API calls beyond limits
- **Missing Logs:** No API call counting in logs

## 📊 Log Analysis

### Good Log Output:
```
📄 Fetching page at offset 0 (API call #1)...
⏳ Waiting 2 seconds between API calls...
📄 Fetching page at offset 100 (API call #2)...
✅ User user@example.com processing complete
⏳ Waiting 5 seconds before processing next user...
```

### Bad Log Output:
```
📄 Fetching page at offset 0...
📄 Fetching page at offset 100...
📄 Fetching page at offset 200...
SAM API error 429 Too Many Requests
```

## 🧪 Test Commands

### Check Database Results:
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

### Monitor Railway Logs:
```bash
# Watch cron service logs in real-time
railway logs --service cron-digest --follow
```

## ⚙️ Configuration Testing

### Test Different Scenarios:
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

## 🚨 Troubleshooting

### If Still Getting Rate Limits:
1. **Check Configuration:** Verify environment variables are set
2. **Increase Delays:** Try longer delays between calls
3. **Reduce API Calls:** Lower SAM_MAX_API_CALLS_PER_USER
4. **Check Logs:** Look for API call counting in logs

### If No Delays Working:
1. **Environment Variables:** Ensure they're properly exported
2. **Code Changes:** Verify the rate limiting code is deployed
3. **Log Output:** Check for delay messages in logs

## 📈 Success Metrics

- **0 rate limit errors** in logs
- **Consistent delays** between API calls
- **Proper API call limits** respected
- **Successful cron runs** with status 'completed'
- **Emails sent** to users (if opportunities found)</content>
<parameter name="filePath">/Users/antonzaytsev/Downloads/SAM-contract/RATE_LIMITING_TEST.md
