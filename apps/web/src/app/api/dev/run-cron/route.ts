import { NextResponse } from 'next/server';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  
  // Dynamic import to avoid build-time issues
  const { runOppsDigest } = await import('@sam/worker');
  await runOppsDigest();
  return NextResponse.json({ ok: true });
}