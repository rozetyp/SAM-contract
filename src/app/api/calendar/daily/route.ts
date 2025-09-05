import { NextRequest, NextResponse } from 'next/server';
import { makeDb, makePool, sentNoticeIds, users } from '@sam/db';
import { and, eq, gte } from 'drizzle-orm';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * Daily calendar feed for all user's upcoming deadlines
 * Creates aggregated .ics file with all opportunities
 * 
 * Query params:
 * - email: User email for authentication
 * - token: Simple auth token for security
 * - days: Number of days ahead to include (default: 30)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 30;

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters: email, token' },
        { status: 400 }
      );
    }

    const pool = makePool();
    const db = makeDb(pool);

    try {
      // Get user and validate token
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Simple token validation
      const expectedToken = Buffer.from(`calendar:${user.id}:${email}`).toString('base64');
      if (token !== expectedToken) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      // Get recent sent notices (as proxy for upcoming deadlines)
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const sentNotices = await db
        .select()
        .from(sentNoticeIds)
        .where(
          and(
            eq(sentNoticeIds.userId, user.id),
            gte(sentNoticeIds.sentAt, cutoffDate)
          )
        )
        .limit(50); // Reasonable limit

      // Current timestamp for DTSTAMP
      const now = new Date();
      const dtstamp = formatDateForICS(now);
      
      // Generate events for each notice
      const events = sentNotices.map((notice, index) => {
        // For demo: create deadline 2 weeks from sent date
        const deadlineDate = new Date(notice.sentAt.getTime() + 14 * 24 * 60 * 60 * 1000);
        const uid = `${notice.noticeId}@bidbeacon.ai`;
        const dtstart = formatDateForICS(deadlineDate);
        const dtend = formatDateForICS(new Date(deadlineDate.getTime() + 60 * 60 * 1000));
        
        return [
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART:${dtstart}`,
          `DTEND:${dtend}`,
          `SUMMARY:SAM Opportunity Deadline - ${notice.noticeId}`,
          `DESCRIPTION:Federal contract opportunity deadline\\n\\nNotice ID: ${notice.noticeId}\\nSent: ${notice.sentAt.toDateString()}\\n\\nView: https://sam.gov/opp/${notice.noticeId}/view`,
          `URL:https://sam.gov/opp/${notice.noticeId}/view`,
          'STATUS:CONFIRMED',
          'TRANSP:OPAQUE',
          'BEGIN:VALARM',
          'ACTION:DISPLAY',
          'DESCRIPTION:SAM Opportunity Deadline Reminder',
          'TRIGGER:-P1D',
          'END:VALARM',
          'END:VEVENT'
        ].join('\r\n');
      });

      // Create ICS content
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BidBeacon//SAM Daily Feed//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:SAM.gov Opportunities - ${email}`,
        'X-WR-CALDESC:Federal contract opportunity deadlines from BidBeacon',
        ...events,
        'END:VCALENDAR'
      ].join('\r\n');

      return new NextResponse(icsContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar',
          'Content-Disposition': `attachment; filename="sam-daily-feed.ics"`,
          'Cache-Control': 'private, no-cache, max-age=3600' // Cache for 1 hour
        },
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('Error generating daily calendar feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Format date for ICS format (YYYYMMDDTHHMMSSZ)
 */
function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
