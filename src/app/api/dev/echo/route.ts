import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'disabled' }, { status: 403 });
  const body = await req.text();
  return NextResponse.json({ ok: true, echo: body, ts: Date.now() });
}