import { NextRequest, NextResponse } from 'next/server';
import { makeDb, makePool, searches, users } from '../../../lib/index.js';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const pool = makePool();
  const db = makeDb(pool);
  try {
    const existing = await db.select().from(users).where(eq(users.email, email));
    const user = existing[0] || (await db.insert(users).values({ email, plan: 'trial' as any }).returning())[0];
    if (!user) return NextResponse.json({ error: 'user not found/created' }, { status: 500 });

    // Always fetch existing search preferences
    const existingSearch = await db.select().from(searches).where(eq(searches.userId, user.id));

    // If no search criteria provided, just return current preferences
    const hasSearchCriteria = body.naics || body.psc || body.setaside || body.agency ||
                             body.includeWords || body.excludeWords || body.muteAgencies || body.muteTerms;

    if (!hasSearchCriteria) {
      return NextResponse.json({
        ok: true,
        userId: user.id,
        plan: user.plan,
        search: existingSearch[0] || null
      });
    }

    // Save/update preferences
    const searchData = {
      q: body.q || '',
      naics: Array.isArray(body.naics) ? body.naics : String(body.naics || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      psc: Array.isArray(body.psc) ? body.psc : String(body.psc || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      setaside: Array.isArray(body.setaside) ? body.setaside : String(body.setaside || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      agency: body.agency || '',
      includeWords: body.includeWords || '',
      excludeWords: body.excludeWords || '',
      muteAgencies: Array.isArray(body.muteAgencies) ? body.muteAgencies : [],
      muteTerms: Array.isArray(body.muteTerms) ? body.muteTerms : []
    };

    if (user.plan !== 'paid') {
      return NextResponse.json({ error: 'payment_required', plan: user.plan }, { status: 402 });
    }

    if (existingSearch[0]) {
      await db.update(searches).set(searchData).where(eq(searches.id, existingSearch[0].id));
    } else {
      await db.insert(searches).values({ userId: user.id, ...searchData });
    }

    return NextResponse.json({ ok: true, userId: user.id, plan: user.plan });
  } finally {
    await pool.end();
  }
}