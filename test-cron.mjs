#!/usr/bin/env node

// Manual cron test script
import { runOppsDigest } from './dist/jobs/opps.js';

console.log('🧪 Manual cron test starting...');
console.log('📅 Current time:', new Date().toISOString());

runOppsDigest()
  .then(() => {
    console.log('✅ Manual cron test completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Manual cron test failed:', err);
    process.exit(1);
  });
