import { NextResponse } from 'next/server';
import { makeDb, makePool, users, searches } from '@sam/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const q = (body.q ?? '') as string;
  const naics = Array.isArray(body.naics) ? body.naics : String(body.naics || '').split(',').map((s) => s.trim()).filter(Boolean);
  const psc = Array.isArray(body.psc) ? body.psc : String(body.psc || '').split(',').map((s) => s.trim()).filter(Boolean);
  const setaside = Array.isArray(body.setaside) ? body.setaside : String(body.setaside || '').split(',').map((s) => s.trim()).filter(Boolean);

  const pool = makePool();
  const db = makeDb(pool);
  try {
    const existing = await db.select().from(users).where(eq(users.email, email));
  const user = existing[0] || (await db.insert(users).values({ email, plan: 'trial' as any }).returning())[0];
    if (!user) return NextResponse.json({ error: 'user not found/created' }, { status: 500 });

    if (user.plan !== 'paid') {
      return NextResponse.json({ error: 'payment_required', plan: user.plan }, { status: 402 });
    }

    const old = await db.select().from(searches).where(eq(searches.userId, user.id));
    if (old[0]) {
      await db.update(searches).set({ q, naics, psc, setaside }).where(eq(searches.id, old[0].id));
    } else {
      await db.insert(searches).values({ userId: user.id, q, naics, psc, setaside });
    }
  return NextResponse.json({ ok: true, userId: user.id, plan: user.plan });
  } finally {
    await pool.end();
  }
}