import { NextRequest, NextResponse } from 'next/server';
import { makeDb, makePool, users } from '@sam/db';
import { eq } from 'drizzle-orm';

/**
 * Unsubscribe endpoint for email compliance
 * Handles both GET (form) and POST (action) requests
 * 
 * Query params for GET:
 * - email: User email
 * - token: Simple auth token for security
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  // Validate token if provided
  let isValidToken = false;
  if (email && token) {
    const expectedToken = Buffer.from(`unsubscribe:${email}`).toString('base64');
    isValidToken = token === expectedToken;
  }

  const unsubscribeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unsubscribe - BidBeacon</title>
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
        h1 { 
          color: #005ea2; 
          margin-bottom: 20px;
        }
        input, button {
          padding: 12px 16px;
          margin: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        button {
          background: #dc3545;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background: #c82333;
        }
        .note {
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Unsubscribe from BidBeacon</h1>
        <p>We're sorry to see you go! You can unsubscribe from all SAM.gov opportunity alerts below.</p>
        
        <form method="POST" action="/api/unsubscribe">
          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email address"
              value="${email || ''}"
              ${isValidToken ? 'readonly' : ''}
              required
              style="width: 300px;"
            />
          </div>
          <div>
            <button type="submit">Unsubscribe</button>
          </div>
          ${isValidToken ? `<input type="hidden" name="token" value="${token}" />` : ''}
        </form>
        
        <div class="note">
          <p><strong>Alternative options:</strong></p>
          <p>• <a href="${process.env.NEXT_PUBLIC_URL || 'https://bidbeacon.ai'}/settings">Manage your alert preferences</a> instead of unsubscribing</p>
          <p>• Use the mute functionality in your emails to filter specific agencies or terms</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(unsubscribeHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const token = formData.get('token') as string;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate token if provided
    if (token) {
      const expectedToken = Buffer.from(`unsubscribe:${email}`).toString('base64');
      if (token !== expectedToken) {
        return NextResponse.json(
          { error: 'Invalid unsubscribe token' },
          { status: 401 }
        );
      }
    }

    const pool = makePool();
    const db = makeDb(pool);

    try {
      // Update user plan to 'unsubscribed'
      const result = await db
        .update(users)
        .set({ plan: 'unsubscribed' as any })
        .where(eq(users.email, email))
        .returning();

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Email not found in our system' },
          { status: 404 }
        );
      }

      // Return success page
      const successHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed Successfully - BidBeacon</title>
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Successfully Unsubscribed</h1>
            <p>You have been unsubscribed from all BidBeacon email alerts.</p>
            <p><strong>Email:</strong> ${email}</p>
            <p>You will no longer receive SAM.gov opportunity digests.</p>
            <div style="margin-top: 30px; font-size: 14px; color: #666;">
              <p>Changed your mind? You can always <a href="${process.env.NEXT_PUBLIC_URL || 'https://bidbeacon.ai'}/settings">resubscribe</a> later.</p>
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
    console.error('Error in unsubscribe API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
