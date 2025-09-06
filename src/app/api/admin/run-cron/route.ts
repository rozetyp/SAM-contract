import { NextResponse } from 'next/server';
import { runOppsDigest } from '@/jobs/opps';

// Protected admin trigger for the cron job.
// Usage: set ADMIN_RUN_SECRET in the environment (in Railway variables) and call:
// curl -X POST -H "x-admin-run-secret: <secret>" https://<YOUR_WEB_URL>/api/admin/run-cron

export async function POST(req: Request) {
  const secret = process.env.ADMIN_RUN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'admin trigger not enabled' }, { status: 403 });
  }

  const provided = String(req.headers.get('x-admin-run-secret') || '');
  if (!provided || provided !== secret) {
    return NextResponse.json({ error: 'invalid secret' }, { status: 401 });
  }

  try {
    // Run the digest in dry-run mode (RESEND_DRY should be set for safety in prod test)
    await runOppsDigest({ daysBack: 1 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
