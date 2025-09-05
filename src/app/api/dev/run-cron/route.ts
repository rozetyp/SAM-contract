import { NextResponse } from 'next/server';
import { runOppsDigest } from '../../../../jobs/opps.js';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  await runOppsDigest();
  return NextResponse.json({ ok: true });
}