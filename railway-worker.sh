#!/bin/bash
# Railway deployment script for worker/cron service
pnpm -C packages/worker build

# Check if running as cron job
if [ "$RAILWAY_CRON" = "true" ]; then
  echo "Running as scheduled cron job..."
  pnpm -w run cron:opps
else
  echo "Worker built. Cron scheduled for daily 1 PM UTC: pnpm -w run cron:opps"
fi
