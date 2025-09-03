import { NextResponse } from 'next/server';
import { makeDb, makePool, users } from '@sam/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'disabled' }, { status: 403 });
  }

  try {
    const pool = makePool();
    const db = makeDb(pool);
    
    // Get all users to debug the issue
    const allUsers = await db.select().from(users);
    
    await pool.end();
    
    return NextResponse.json({ 
      users: allUsers.map(u => ({
        id: u.id,
        email: u.email,
        plan: u.plan,
        stripeCustomerId: u.stripeCustomerId,
        createdAt: u.createdAt
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Allow this specific admin action even in production
  try {
    const { email, action, adminKey } = await req.json();
    
    // Simple admin key check for this one-time fix
    if (adminKey !== 'fix-anton-plan-2025') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }
    
    if (action === 'upgrade_to_paid' && email === 'anton.a.zaytsev@gmail.com') {
      const pool = makePool();
      const db = makeDb(pool);
      
      // Update user plan to paid
      const result = await db.update(users)
        .set({ plan: 'paid' })
        .where(eq(users.email, email))
        .returning();
      
      await pool.end();
      
      if (result.length === 0) {
        return NextResponse.json({ error: 'User not found', email }, { status: 404 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Updated ${email} to paid plan`,
        user: {
          id: result[0].id,
          email: result[0].email,
          plan: result[0].plan
        }
      });
    }
    
    return NextResponse.json({ error: 'Invalid action or email' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
