type Record = {
  noticeId: string;
  title?: string;
  url?: string;
  ptype?: string;
  postedDate?: string;
};

export function createDigestHtml({ email, records }: { email: string; records: Record[] }) {
  const items = records
    .map(
      (r) => `
      <li style="margin-bottom:8px">
        <a href="${r.url || '#'}" style="font-weight:600;color:#0b5fff">${escapeHtml(
          r.title || r.noticeId
        )}</a>
        <div style="color:#444;font-size:12px">${r.noticeId}${r.ptype ? ` · ${r.ptype}` : ''}$${
          r.postedDate ? ` · ${r.postedDate}` : ''
        }</div>
      </li>`
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