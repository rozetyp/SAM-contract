import { NextResponse } from 'next/server';
import { createDigestHtml } from '@sam/emails';

export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'disabled' }, { status: 403 });
  const html = createDigestHtml({
    email: 'test@example.com',
    records: [
      { noticeId: 'N1', title: 'Cybersecurity services', url: 'https://sam.gov/opportunity/N1', ptype: 'o', postedDate: '2025-08-30' },
      { noticeId: 'N2', title: 'Cloud migration support', url: 'https://sam.gov/opportunity/N2', ptype: 'k', postedDate: '2025-08-31' }
    ]
  });
  return new Response(html, { headers: { 'content-type': 'text/html' } });
}