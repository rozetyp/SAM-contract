#!/bin/bash

# SAM.gov Rate Limiting Test Script
# ================================

echo "🧪 Testing SAM.gov Rate Limiting Implementation"
echo "=============================================="

# Set test environment variables
export SAM_MAX_API_CALLS_PER_USER=3
export SAM_DELAY_BETWEEN_API_CALLS=1000
export SAM_DELAY_BETWEEN_USERS=2000
export SAM_MAX_RETRIES=2

echo "📋 Test Configuration:"
echo "  - Max API calls per user: $SAM_MAX_API_CALLS_PER_USER"
echo "  - Delay between API calls: ${SAM_DELAY_BETWEEN_API_CALLS}ms"
echo "  - Delay between users: ${SAM_DELAY_BETWEEN_USERS}ms"
echo "  - Max retries: $SAM_MAX_RETRIES"
echo ""

echo "🚀 Running cron job with test settings..."
echo "----------------------------------------"

# Run the cron job
pnpm --filter=worker run cron:opps

echo ""
echo "✅ Test completed!"
echo "📊 Check the logs above for:"
echo "  - API call counting (#1, #2, #3)"
echo "  - Delay messages between calls"
echo "  - No 429 rate limit errors"
echo "  - Proper user processing sequence"
