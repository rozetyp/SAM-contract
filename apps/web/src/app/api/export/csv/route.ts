import { NextRequest, NextResponse } from 'next/server';
import { makeDb, makePool, searches, sentNoticeIds, users } from '@sam/db';
import { and, eq, gte, lte } from 'drizzle-orm';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * CSV Export API endpoint
 * Exports user's daily digest data as CSV file
 * 
 * Query params:
 * - email: User email for authentication
 * - date: YYYY-MM-DD format (optional, defaults to yesterday)
 * - token: Simple auth token for security
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const dateParam = searchParams.get('date');
    const token = searchParams.get('token');

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
      const expectedToken = Buffer.from(`export:${user.id}:${email}`).toString('base64');
      if (token !== expectedToken) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      // Parse target date (default to yesterday)
      const targetDate = dateParam ? new Date(dateParam) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Get user's sent notices for the target date
      const sentNotices = await db
        .select()
        .from(sentNoticeIds)
        .where(
          and(
            eq(sentNoticeIds.userId, user.id),
            gte(sentNoticeIds.sentAt, startOfDay),
            lte(sentNoticeIds.sentAt, endOfDay)
          )
        );

      // For now, we'll return basic data structure
      // In production, you'd want to join with a notices table or cache the full opportunity data
      const csvData = sentNotices.map(notice => ({
        noticeId: notice.noticeId,
        sentDate: notice.sentAt.toISOString().split('T')[0],
        sentTime: notice.sentAt.toISOString(),
        // Note: In full implementation, you'd join with opportunity data
        // title: opportunity.title,
        // agency: opportunity.agency,
        // deadline: opportunity.deadline,
        // naics: opportunity.naics,
        // psc: opportunity.psc,
        // setAside: opportunity.setAside,
        samUrl: `https://sam.gov/opp/${notice.noticeId}/view`
      }));

      // Generate CSV content
      const csvHeaders = [
        'Notice ID',
        'Sent Date',
        'Sent Time',
        'SAM.gov URL'
        // Future: 'Title', 'Agency', 'Deadline', 'NAICS', 'PSC', 'Set Aside'
      ];

      const csvRows = csvData.map(row => [
        row.noticeId,
        row.sentDate,
        row.sentTime,
        row.samUrl
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Return CSV file
      const filename = `sam-digest-${targetDate.toISOString().split('T')[0]}.csv`;
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'private, no-cache'
        },
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('Error in CSV export API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
