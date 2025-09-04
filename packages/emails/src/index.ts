type Record = {
  noticeId: string;
  title?: string;
  description?: string;
  url?: string;
  ptype?: string;
  postedDate?: string;
  fullParentPathName?: string;
  organizationName?: string;
};

export function createDigestHtml({ 
  email, 
  records, 
  userId,
  baseUrl = 'https://bidbeacon.ai' 
}: { 
  email: string; 
  records: Record[];
  userId?: number;
  baseUrl?: string;
}) {
  // Generate simple auth token for mute links (moved to caller)
  const generateMuteToken = (userId: number) => {
    // Simple hash - in production should use proper crypto
    return btoa(`${userId}:${userId}`);
  };

  const muteToken = userId ? generateMuteToken(userId) : '';

  const items = records
    .map(
      (r) => {
        const agency = r.fullParentPathName || r.organizationName || 'Unknown Agency';
        
        // Create mute links if we have userId
        const muteAgencyLink = userId && muteToken 
          ? `${baseUrl}/api/mute?userId=${userId}&type=agency&value=${encodeURIComponent(agency)}&token=${muteToken}`
          : '';
          
        // Create calendar link for individual opportunity (assuming deadline is 2 weeks from posted date)
        const deadlineDate = r.postedDate 
          ? new Date(new Date(r.postedDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
          
        const calendarLink = `${baseUrl}/api/calendar/notice/${r.noticeId}?title=${encodeURIComponent(r.title || r.noticeId)}&agency=${encodeURIComponent(agency)}&deadline=${deadlineDate}&url=${encodeURIComponent(r.url || '')}`;
          
        const muteSection = muteAgencyLink ? `
          <tr>
            <td style="padding:8px 0 0 0;">
              <a href="${muteAgencyLink}" style="color:#6b7280;text-decoration:none;font-size:11px;display:inline-block;padding:4px 8px;border:1px solid #e5e7eb;border-radius:4px;">🔇 Mute this agency</a>
            </td>
          </tr>
        ` : '';

        const calendarSection = `
          <tr>
            <td style="padding:8px 0 0 0;">
              <a href="${calendarLink}" style="color:#667eea;text-decoration:none;font-size:11px;display:inline-block;padding:4px 8px;border:1px solid #667eea;border-radius:4px;background:#f8fafc;">📅 Add to calendar</a>
            </td>
          </tr>
        `;

        return `
        <table width="100%" style="border-collapse:collapse;margin-bottom:20px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:20px;background:#ffffff;">
              <table width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0;">
                    <a href="${r.url || '#'}" style="font-weight:600;color:#1f2937;text-decoration:none;font-size:16px;line-height:1.4;display:block;margin-bottom:8px;">
                      ${escapeHtml(r.title || r.noticeId)}
                    </a>
                    <table width="100%" style="border-collapse:collapse;margin-bottom:12px;">
                      <tr>
                        <td style="padding:0;font-size:13px;color:#6b7280;">
                          <strong>ID:</strong> ${r.noticeId}${r.ptype ? ` • <strong>Type:</strong> ${r.ptype}` : ''}${r.postedDate ? ` • <strong>Posted:</strong> ${r.postedDate}` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0 0 0;font-size:13px;color:#6b7280;">
                          <strong>Agency:</strong> ${escapeHtml(agency)}
                        </td>
                      </tr>
                    </table>
                    ${calendarSection}
                    ${muteSection}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
      }
    )
    .join('');

  // Generate export links
  const exportToken = userId ? btoa(`export:${userId}:${email}`) : '';
  const calendarToken = userId ? btoa(`calendar:${userId}:${email}`) : '';
  const unsubscribeToken = btoa(`unsubscribe:${email}`);
  const todayDate = new Date().toISOString().split('T')[0];
  
  const exportLinks = userId && exportToken && calendarToken ? `
    <table width="100%" style="border-collapse:collapse;margin:24px 0;">
      <tr>
        <td style="padding:20px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:8px;text-align:center;">
          <h4 style="margin:0 0 12px;color:#ffffff;font-size:16px;font-weight:600;">📊 Export & Sync Options</h4>
          <table width="100%" style="border-collapse:collapse;">
            <tr>
              <td style="padding:0;text-align:center;">
                <a href="${baseUrl}/api/export/csv?email=${encodeURIComponent(email)}&token=${exportToken}&date=${todayDate}" style="color:#ffffff;text-decoration:none;font-size:13px;display:inline-block;padding:8px 16px;border:1px solid rgba(255,255,255,0.3);border-radius:6px;margin:0 4px;background:rgba(255,255,255,0.1);">📄 Download CSV</a>
                <a href="${baseUrl}/api/calendar/daily?email=${encodeURIComponent(email)}&token=${calendarToken}" style="color:#ffffff;text-decoration:none;font-size:13px;display:inline-block;padding:8px 16px;border:1px solid rgba(255,255,255,0.3);border-radius:6px;margin:0 4px;background:rgba(255,255,255,0.1);">📅 Calendar Feed</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  ` : '';

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Your SAM.gov Daily Digest - BidBeacon</title>
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .mobile-full { width: 100% !important; }
        .mobile-center { text-align: center !important; }
        .mobile-padding { padding: 16px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;">
    <table width="100%" style="border-collapse:collapse;background:#f8fafc;">
      <tr>
        <td style="padding:20px 0;">
          <table class="container" width="600" style="border-collapse:collapse;margin:0 auto;max-width:600px;width:100%;">
            
            <!-- Header -->
            <tr>
              <td style="padding:0 20px 24px 20px;text-align:center;">
                <table width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:0;text-align:center;">
                      <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:inline-block;padding:16px 24px;border-radius:8px;margin-bottom:16px;">
                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">BidBeacon</h1>
                      </div>
                      <h2 style="margin:8px 0 0 0;color:#1f2937;font-size:20px;font-weight:600;">Your SAM.gov Daily Digest</h2>
                      <p style="margin:8px 0 0 0;color:#6b7280;font-size:14px;">Clean contract opportunities, zero noise</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Greeting -->
            <tr>
              <td style="padding:0 20px 20px 20px;">
                <table width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:20px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
                      <h3 style="margin:0 0 8px 0;color:#1f2937;font-size:16px;">Hi ${escapeHtml(email)},</h3>
                      <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">
                        Here are <strong style="color:#667eea;">${records.length} new opportunities</strong> matching your preferences:
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Opportunities -->
            <tr>
              <td style="padding:0 20px;">
                ${items}
              </td>
            </tr>
            
            <!-- Export Options -->
            ${exportLinks}
            
            <!-- Pro Tips -->
            <tr>
              <td style="padding:0 20px 20px 20px;">
                <table width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;">
                      <h4 style="margin:0 0 12px 0;color:#1f2937;font-size:14px;font-weight:600;">💡 Pro Tips</h4>
                      <ul style="margin:0;padding-left:20px;color:#6b7280;font-size:13px;line-height:1.6;">
                        <li><strong>Calendar Integration:</strong> Click "📅 Add to calendar" to never miss a deadline</li>
                        <li><strong>Smart Filtering:</strong> Use "🔇 Mute this agency" to filter out unwanted sources</li>
                        <li><strong>Data Export:</strong> Download CSV for spreadsheet analysis and reporting</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding:20px;text-align:center;">
                <table width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:0;text-align:center;border-top:1px solid #e5e7eb;padding-top:20px;">
                      <p style="margin:0 0 8px 0;color:#6b7280;font-size:12px;">
                        You received this because you subscribed to <a href="${baseUrl}" style="color:#667eea;text-decoration:none;font-weight:500;">BidBeacon</a> SAM.gov alerts.
                      </p>
                      <table width="100%" style="border-collapse:collapse;">
                        <tr>
                          <td style="padding:0;text-align:center;">
                            <a href="${baseUrl}/settings" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 8px;display:inline-block;">⚙️ Manage Preferences</a>
                            <span style="color:#d1d5db;margin:0 8px;">|</span>
                            <a href="${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 8px;display:inline-block;">🚪 Unsubscribe</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:12px 0 0 0;color:#9ca3af;font-size:11px;">
                        © 2025 BidBeacon. All rights reserved.<br>
                        Questions? Contact us at <a href="mailto:support@bidbeacon.ai" style="color:#667eea;text-decoration:none;">support@bidbeacon.ai</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

function escapeHtml(str: string) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}