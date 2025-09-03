import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Only try database if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      const { makeDb, makePool, cronRuns } = await import('@sam/db');
      const { desc } = await import('drizzle-orm');
      
      const pool = makePool();
      const db = makeDb(pool);
      const last = await db.select().from(cronRuns).orderBy(desc(cronRuns.ranAt)).limit(1);
      await pool.end();
      return NextResponse.json({ ok: true, ts: Date.now(), lastCron: last[0] ?? null });
    } else {
      return NextResponse.json({ ok: true, ts: Date.now(), lastCron: null, note: 'no database' });
    }
  } catch (error) {
    return NextResponse.json({ ok: true, ts: Date.now(), lastCron: null, error: String(error) });
  }
}