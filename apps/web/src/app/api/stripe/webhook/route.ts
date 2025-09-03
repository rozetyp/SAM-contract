import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { makeDb, makePool, users } from '@sam/db';
import { eq } from 'drizzle-orm';
import { addDevEvent } from '../../../../lib/devFeed';

export async function POST(req: Request) {
  const sig = headers().get('stripe-signature');
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !sig) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  addDevEvent({ ts: Date.now(), type: event.type, id: (event as any).id, summary: { live: event.livemode } });

  // If no DB configured (local quick test), acknowledge event without persisting
  if (!process.env.DATABASE_URL) {
    // eslint-disable-next-line no-console
    console.log('stripe_webhook(no-db)', { type: event.type });
    return NextResponse.json({ received: true, note: 'no DATABASE_URL; skipped DB writes' });
  }

  const pool = makePool();
  const db = makeDb(pool);
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const sess = event.data.object as Stripe.Checkout.Session;
        const email = (sess.customer_details?.email || (sess.metadata as any)?.email || sess.client_reference_id || '').trim();
        const customerId = typeof sess.customer === 'string' ? sess.customer : (sess.customer as any)?.id;
        if (email) {
          const existing = await db.select().from(users).where(eq(users.email, email));
          // Do NOT set plan here; rely on subscription.created/updated events to set 'trial' or 'paid'.
          if (existing[0]) {
            await db
              .update(users)
              .set({ stripeCustomerId: (customerId as any) || existing[0].stripeCustomerId })
              .where(eq(users.id, existing[0].id));
          } else {
            await db.insert(users).values({ email, plan: 'unpaid' as any, stripeCustomerId: customerId as any }); // Start as unpaid until subscription events
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        const status = sub.status; // trialing | active | past_due | canceled | incomplete | etc
        const cancelNow = Boolean((sub as any).cancel_at_period_end) || status === 'canceled' || status === 'incomplete_expired';
        // If user canceled during trial (cancel_at_period_end while trialing), stop digests immediately
        let plan: any | undefined;
        if (cancelNow) plan = 'canceled' as any;
        else if (status === 'trialing' || status === 'active') plan = 'paid' as any; // Trial and active both get full access

        if (customerId && plan) {
          await db.update(users).set({ plan }).where(eq(users.stripeCustomerId, customerId as any));
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        if (customerId) {
          await db.update(users).set({ plan: 'canceled' }).where(eq(users.stripeCustomerId, customerId as any));
        }
        break;
      }
      case 'invoice.payment_failed': {
        // Optionally downgrade or notify
        break;
      }
      default:
        break;
    }
  } finally {
    await pool.end();
  }

  return NextResponse.json({ received: true });
}