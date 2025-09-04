import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * Calendar (.ics) export for individual notice deadlines
 * Creates RFC 5545 compliant iCalendar event
 * 
 * Path: /api/calendar/notice/[noticeId].ics
 * 
 * Query params:
 * - title: Opportunity title (optional)
 * - agency: Agency name (optional)
 * - deadline: ISO date string for deadline
 * - url: SAM.gov URL for the opportunity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { noticeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { noticeId } = params;
    
    const title = searchParams.get('title') || `SAM Opportunity ${noticeId}`;
    const agency = searchParams.get('agency') || 'Federal Agency';
    const deadline = searchParams.get('deadline');
    const url = searchParams.get('url') || `https://sam.gov/opp/${noticeId}/view`;

    if (!deadline) {
      return NextResponse.json(
        { error: 'deadline parameter is required' },
        { status: 400 }
      );
    }

    // Parse deadline date
    let deadlineDate: Date;
    try {
      deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid deadline date format. Use ISO date string.' },
        { status: 400 }
      );
    }

    // Generate unique UID for the event
    const uid = `${noticeId}@bidbeacon.ai`;
    
    // Current timestamp for DTSTAMP
    const now = new Date();
    const dtstamp = formatDateForICS(now);
    
    // Format deadline for ICS (assume deadline is end of business day)
    const dtstart = formatDateForICS(deadlineDate);
    const dtend = formatDateForICS(new Date(deadlineDate.getTime() + 60 * 60 * 1000)); // 1 hour duration

    // Create ICS content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BidBeacon//SAM Opportunity Tracker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${escapeICSText(title)}`,
      `DESCRIPTION:Federal contract opportunity deadline\\n\\nAgency: ${escapeICSText(agency)}\\nNotice ID: ${noticeId}\\n\\nView opportunity: ${url}`,
      `URL:${url}`,
      `LOCATION:${escapeICSText(agency)}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:SAM Opportunity Deadline Reminder',
      'TRIGGER:-P1D', // 1 day before
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY', 
      'DESCRIPTION:SAM Opportunity Deadline - Today!',
      'TRIGGER:PT0M', // At the time
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="sam-${noticeId}.ics"`,
        'Cache-Control': 'private, no-cache'
      },
    });

  } catch (error) {
    console.error('Error generating ICS file:', error);
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

/**
 * Escape text for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}
