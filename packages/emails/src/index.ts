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
          <div style="margin-top:4px;font-size:11px;">
            <a href="${muteAgencyLink}" style="color:#666;text-decoration:none;">🔇 Mute this agency</a>
          </div>
        ` : '';

        const calendarSection = `
          <div style="margin-top:4px;font-size:11px;">
            <a href="${calendarLink}" style="color:#0b5fff;text-decoration:none;">📅 Add to calendar</a>
          </div>
        `;

        return `
        <li style="margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #eee">
          <a href="${r.url || '#'}" style="font-weight:600;color:#0b5fff;text-decoration:none;">
            ${escapeHtml(r.title || r.noticeId)}
          </a>
          <div style="color:#444;font-size:12px;margin-top:2px;">
            ${r.noticeId}${r.ptype ? ` · ${r.ptype}` : ''}${r.postedDate ? ` · ${r.postedDate}` : ''}
          </div>
          <div style="color:#666;font-size:12px;margin-top:2px;">
            Agency: ${escapeHtml(agency)}
          </div>
          ${calendarSection}
          ${muteSection}
        </li>`;
      }
    )
    .join('');

  // Generate export links
  const exportToken = userId ? btoa(`export:${userId}:${email}`) : '';
  const calendarToken = userId ? btoa(`calendar:${userId}:${email}`) : '';
  const unsubscribeToken = btoa(`unsubscribe:${email}`);
  const todayDate = new Date().toISOString().split('T')[0];
  
  const exportLinks = userId && exportToken && calendarToken ? `
    <div style="margin:20px 0;padding:16px;background:#f8f9fa;border-radius:8px;text-align:center;">
      <h4 style="margin:0 0 8px;color:#333;font-size:14px;">📊 Export Options</h4>
      <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
        <a href="${baseUrl}/api/export/csv?email=${encodeURIComponent(email)}&token=${exportToken}&date=${todayDate}" style="color:#0b5fff;text-decoration:none;font-size:12px;">📄 Download CSV</a>
        <a href="${baseUrl}/api/calendar/daily?email=${encodeURIComponent(email)}&token=${calendarToken}" style="color:#0b5fff;text-decoration:none;font-size:12px;">📅 Calendar Feed</a>
      </div>
    </div>
  ` : '';

  return `
  <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:16px">
    <h2 style="margin:0 0 12px;color:#005ea2;">Your SAM.gov Daily Digest</h2>
    <p style="margin:0 0 16px">Hi ${escapeHtml(email)}, here are <strong>${records.length} new opportunities</strong>:</p>
    <ul style="padding-left:20px">${items}</ul>
    ${exportLinks}
    <div style="margin:20px 0;padding:16px;background:#f8f9fa;border-radius:8px;font-size:12px;color:#666;text-align:center;">
      <p style="margin:0 0 8px;">💡 <strong>Pro Tips:</strong></p>
      <p style="margin:0 0 4px;">• Click "📅 Add to calendar" to never miss a deadline</p>
      <p style="margin:0 0 4px;">• Use "🔇 Mute this agency" to filter out unwanted sources</p>
      <p style="margin:0;">• Download CSV for spreadsheet analysis and reporting</p>
    </div>
    <p style="color:#666;font-size:12px;text-align:center;margin-top:20px;">
      You received this because you subscribed to <a href="${baseUrl}" style="color:#005ea2;">BidBeacon</a> SAM.gov alerts.<br>
      <a href="${baseUrl}/settings" style="color:#666;">Manage your preferences</a> | 
      <a href="${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}" style="color:#666;">Unsubscribe</a>
    </p>
  </div>`;
}

function escapeHtml(str: string) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}