#!/bin/bash
# Cron job runner for Railway
# This script runs the SAM.gov opportunities digest

echo "🚀 Starting scheduled SAM.gov cron job..."
echo "📅 Current time: $(date)"
echo "⏰ Schedule: Daily at 1 PM UTC (0 13 * * *)"

# Navigate to the app directory
cd /app

# Run the cron job
pnpm -w run cron:opps

echo "✅ Cron job completed at: $(date)"
