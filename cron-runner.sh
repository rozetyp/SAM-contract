#!/bin/bash
# Cron job runner for Railway
# This script runs the SAM.gov opportunities digest

echo "🚀 Starting scheduled SAM.gov cron job..."
echo "📅 Current time: $(date)"
echo "⏰ Schedule: Daily at 1 PM UTC (0 13 * * *)"

# Only change directory if we're in Railway container
if [ -d "/app" ]; then
  cd /app
fi

# Run the opportunities digest
echo "📊 Running opportunities digest..."
pnpm -w run cron:opps

echo "✅ Opportunities digest completed at: $(date)"
