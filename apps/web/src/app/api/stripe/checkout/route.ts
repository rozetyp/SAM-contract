import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.APP_BASE_URL || !process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  const body = await req.json().catch(() => ({} as any));
  const email = typeof body.email === 'string' ? body.email : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    success_url: `${process.env.APP_BASE_URL}/settings?status=success`,
    cancel_url: `${process.env.APP_BASE_URL}/settings?status=cancel`,
    customer_email: email,
    client_reference_id: email,
    metadata: email ? { email } : undefined
  });
  return NextResponse.json({ id: session.id, url: session.url });
}