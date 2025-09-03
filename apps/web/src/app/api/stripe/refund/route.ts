import { NextResponse } from 'next/server';

// Note: Operational refunds should be performed via Stripe Dashboard or a secure admin tool.
// This endpoint is a placeholder to document the 14-day refund policy; it denies by default.

export async function POST() {
  return NextResponse.json(
    {
      error: 'Refunds are processed manually within 14 days of purchase. Please contact support@sam-alerts.com.'
    },
    { status: 403 }
  );
}
