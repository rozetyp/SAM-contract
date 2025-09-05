import { NextResponse } from 'next/server';
import { makeDb, makePool, cronRuns } from '@/lib';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const pool = makePool();
    const db = makeDb(pool);
    const last = await db.select().from(cronRuns).orderBy(desc(cronRuns.ranAt)).limit(1);
    await pool.end();
    return NextResponse.json({ ok: true, ts: Date.now(), lastCron: last[0] ?? null });
  } catch {
    return NextResponse.json({ ok: true, ts: Date.now(), lastCron: null });
  }
}