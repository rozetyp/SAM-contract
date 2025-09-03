import { NextResponse } from 'next/server';
import { makeDb, makePool, users, searches } from '@sam/db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  // Handle guided filters format - support both spec names and legacy names
  const naics = Array.isArray(body.naics) ? body.naics : 
                Array.isArray(body.ncode) ? body.ncode :
                String(body.naics || body.ncode || '').split(',').map((s) => s.trim()).filter(Boolean);
  const psc = Array.isArray(body.psc) ? body.psc : 
              Array.isArray(body.ccode) ? body.ccode :
              String(body.psc || body.ccode || '').split(',').map((s) => s.trim()).filter(Boolean);
  const setaside = Array.isArray(body.setaside) ? body.setaside : 
                   Array.isArray(body.typeOfSetAside) ? body.typeOfSetAside :
                   String(body.setaside || body.typeOfSetAside || '').split(',').map((s) => s.trim()).filter(Boolean);
  
  // Agency handling - support both name and code
  const agency = String(body.agency || body.organizationName || '').trim();
  const agencyCode = String(body.organizationCode || '').trim();
  
  // Keywords handling - support both single string and array formats
  const includeWords = body.includeWords ? String(body.includeWords).trim() : '';
  const excludeWords = body.excludeWords ? String(body.excludeWords).trim() : '';
  const qKeywordsInclude = Array.isArray(body.qKeywordsInclude) ? body.qKeywordsInclude : 
                          includeWords ? [includeWords] : [];
  const qKeywordsExclude = Array.isArray(body.qKeywordsExclude) ? body.qKeywordsExclude :
                          excludeWords ? [excludeWords] : [];
  
  // Legacy support for 'q' field (convert to includeWords)
  const q = body.q ? String(body.q).trim() : '';
  const finalIncludeWords = includeWords || q;
  const finalIncludeArray = qKeywordsInclude.length ? qKeywordsInclude : (finalIncludeWords ? [finalIncludeWords] : []);

  const pool = makePool();
  const db = makeDb(pool);
  try {
    const existing = await db.select().from(users).where(eq(users.email, email));
    const user = existing[0] || (await db.insert(users).values({ email, plan: 'unpaid' as any }).returning())[0]; // Start as unpaid until Stripe subscription
    if (!user) return NextResponse.json({ error: 'user not found/created' }, { status: 500 });

    // If just checking status (no search criteria provided), return current status
    if (!naics.length && !psc.length && !setaside.length && !agency && !finalIncludeWords && !excludeWords) {
      const existingSearch = await db.select().from(searches).where(eq(searches.userId, user.id));
      return NextResponse.json({ 
        ok: true, 
        userId: user.id, 
        plan: user.plan,
        search: existingSearch[0] ? {
          // Return both spec-compliant and legacy field names for compatibility
          naics: existingSearch[0].naics || existingSearch[0].ncode || [],
          psc: existingSearch[0].psc || existingSearch[0].ccode || [],
          setaside: existingSearch[0].setaside || existingSearch[0].typeOfSetAside || [],
          agency: existingSearch[0].agency || existingSearch[0].organizationName || '',
          includeWords: existingSearch[0].includeWords || (existingSearch[0].qKeywordsInclude || []).join(' ') || '',
          excludeWords: existingSearch[0].excludeWords || (existingSearch[0].qKeywordsExclude || []).join(' ') || '',
          // Spec-compliant names
          ncode: existingSearch[0].ncode || existingSearch[0].naics || [],
          ccode: existingSearch[0].ccode || existingSearch[0].psc || [],
          typeOfSetAside: existingSearch[0].typeOfSetAside || existingSearch[0].setaside || [],
          organizationName: existingSearch[0].organizationName || existingSearch[0].agency || '',
          organizationCode: existingSearch[0].organizationCode || '',
          qKeywordsInclude: existingSearch[0].qKeywordsInclude || (existingSearch[0].includeWords ? [existingSearch[0].includeWords] : []),
          qKeywordsExclude: existingSearch[0].qKeywordsExclude || (existingSearch[0].excludeWords ? [existingSearch[0].excludeWords] : [])
        } : null
      });
    }

    if (user.plan !== 'paid') {
      return NextResponse.json({ error: 'payment_required', plan: user.plan }, { status: 402 });
    }

    const old = await db.select().from(searches).where(eq(searches.userId, user.id));
    if (old[0]) {
      await db.update(searches).set({ 
        // Legacy fields for backward compatibility
        q: finalIncludeWords,
        naics, 
        psc, 
        setaside,
        agency,
        includeWords: finalIncludeWords,
        excludeWords,
        // Spec-compliant fields
        ncode: naics,
        ccode: psc,
        typeOfSetAside: setaside,
        organizationName: agency,
        organizationCode: agencyCode,
        qKeywordsInclude: finalIncludeArray,
        qKeywordsExclude: qKeywordsExclude
      }).where(eq(searches.id, old[0].id));
    } else {
      await db.insert(searches).values({ 
        userId: user.id,
        // Legacy fields for backward compatibility 
        q: finalIncludeWords,
        naics, 
        psc, 
        setaside,
        agency,
        includeWords: finalIncludeWords,
        excludeWords,
        // Spec-compliant fields
        ncode: naics,
        ccode: psc,
        typeOfSetAside: setaside,
        organizationName: agency,
        organizationCode: agencyCode,
        qKeywordsInclude: finalIncludeArray,
        qKeywordsExclude: qKeywordsExclude
      });
    }
    return NextResponse.json({ ok: true, userId: user.id, plan: user.plan });
  } finally {
    await pool.end();
  }
}