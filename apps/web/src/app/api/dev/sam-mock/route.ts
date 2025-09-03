import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'disabled' }, { status: 403 });
  return NextResponse.json({
    totalRecords: 2,
    opportunitiesData: [
      {
        noticeId: 'N1',
        title: 'Network upgrade (base, not amendment)',
        ptype: 'o',
        postedDate: '2025-08-31',
        naicsCodes: [{ naicsCode: '541512' }],
        classificationCode: 'D399',
        setAside: 'SB',
        uiLink: 'https://sam.gov/opp/N1'
      },
      {
        noticeId: 'N2',
        title: 'Cloud services MODIF 1',
        ptype: 'p',
        postedDate: '2025-08-31',
        naicsCodes: [{ naicsCode: '541519' }],
        classificationCode: 'R708',
        setAside: '',
        uiLink: 'https://sam.gov/opp/N2'
      }
    ]
  });
}