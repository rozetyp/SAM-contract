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
          
        const muteSection = muteAgencyLink ? `
          <div style="margin-top:4px;font-size:11px;">
            <a href="${muteAgencyLink}" style="color:#666;text-decoration:none;">🔇 Mute this agency</a>
          </div>
        ` : '';

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
          ${muteSection}
        </li>`;
      }
    )
    .join('');
  return `
  <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:16px">
    <h2 style="margin:0 0 12px">Your SAM.gov daily digest</h2>
    <p style="margin:0 0 16px">Hi ${escapeHtml(email)}, here are new opportunities:</p>
    <ul style="padding-left:20px">${items}</ul>
    <p style="color:#666;font-size:12px">You received this because you subscribed to SAM Alerts.</p>
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