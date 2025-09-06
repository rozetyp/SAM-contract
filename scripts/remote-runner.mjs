#!/usr/bin/env node
import('../dist/jobs/opps.js').then(async (mod) => {
  try {
    console.log('remote-runner: starting runOppsDigest');
    await mod.runOppsDigest({ daysBack: 2 });
    console.log('remote-runner: runOppsDigest completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('remote-runner: ERROR', err);
    process.exit(1);
  }
}).catch((e) => {
  console.error('remote-runner import failed', e);
  process.exit(1);
});
