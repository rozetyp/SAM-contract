import { NextRequest, NextResponse } from 'next/server';
import { makeDb, makePool, searches } from '@sam/db';
import { eq } from 'drizzle-orm';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * API endpoint for muting agencies or terms from email links
 * This allows users to quickly mute content directly from their digest emails
 * 
 * Expected query params:
 * - userId: User ID
 * - type: 'agency' | 'term'  
 * - value: The agency name or term to mute
 * - token: Simple auth token (user email hash for security)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const value = searchParams.get('value');
    const token = searchParams.get('token');

    // Validate required parameters
    if (!userId || !type || !value || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, type, value, token' },
        { status: 400 }
      );
    }

    if (!['agency', 'term'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "agency" or "term"' },
        { status: 400 }
      );
    }

    const pool = makePool();
    const db = makeDb(pool);

    try {
      // Get user's search configuration
      const [search] = await db
        .select()
        .from(searches)
        .where(eq(searches.userId, parseInt(userId)));

      if (!search) {
        return NextResponse.json(
          { error: 'User search configuration not found' },
          { status: 404 }
        );
      }

      // Simple token validation (matches email generation)
      const expectedToken = Buffer.from(`${userId}:${userId}`).toString('base64');
      if (token !== expectedToken) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      // Update the appropriate mute array
      if (type === 'agency') {
        const currentMuteAgencies = search.muteAgencies || [];
        if (!currentMuteAgencies.includes(value)) {
          const updatedMuteAgencies = [...currentMuteAgencies, value];
          await db
            .update(searches)
            .set({ muteAgencies: updatedMuteAgencies })
            .where(eq(searches.userId, parseInt(userId)));
        }
      } else if (type === 'term') {
        const currentMuteTerms = search.muteTerms || [];
        if (!currentMuteTerms.includes(value)) {
          const updatedMuteTerms = [...currentMuteTerms, value];
          await db
            .update(searches)
            .set({ muteTerms: updatedMuteTerms })
            .where(eq(searches.userId, parseInt(userId)));
        }
      }

      // Return success page
      const successHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Muted Successfully - BidBeacon</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              max-width: 600px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }
            .container {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
            }
            .success-icon { 
              font-size: 48px; 
              color: #28a745; 
              margin-bottom: 20px;
            }
            h1 { 
              color: #005ea2; 
              margin-bottom: 20px;
            }
            .muted-item {
              background: #e9ecef;
              padding: 10px 15px;
              border-radius: 5px;
              margin: 10px 0;
              font-weight: 500;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #6c757d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Successfully Muted</h1>
            <p>The following ${type} has been added to your mute list:</p>
            <div class="muted-item">${value}</div>
            <p>You will no longer receive opportunities from this ${type} in your daily digests.</p>
            <div class="footer">
              <p>You can manage your mute settings in your <a href="${process.env.NEXT_PUBLIC_URL || 'https://bidbeacon.ai'}/settings">account settings</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(successHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });

    } finally {
      await pool.end();
    }

  } catch (error) {
    console.error('Error in mute API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
