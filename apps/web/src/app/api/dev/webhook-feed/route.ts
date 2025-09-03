import { NextResponse } from 'next/server';
import { getDevEvents } from '../../../../lib/devFeed';

export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'disabled' }, { status: 403 });
  return NextResponse.json({ events: getDevEvents() });
}
