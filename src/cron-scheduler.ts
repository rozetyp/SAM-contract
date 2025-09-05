import cron from 'node-cron';
import { runOppsDigest } from '@/jobs/opps';

// Run SAM opportunities digest daily at 1 PM UTC
cron.schedule('0 13 * * *', async () => {
  console.log('🕐 Scheduled cron job starting...');
  try {
    await runOppsDigest();
    console.log('✅ Scheduled cron job completed successfully');
  } catch (error) {
    console.error('❌ Scheduled cron job failed:', error);
  }
});

console.log('📅 Cron scheduler initialized - will run daily at 1 PM UTC');
