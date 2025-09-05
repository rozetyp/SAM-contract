'use client';
import { useState } from 'react';

// Prevent static generation for dev pages
export const dynamic = 'force-dynamic';

export default function DevConsole() {
  const [echoResp, setEchoResp] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [samResp, setSamResp] = useState('');
  const [cronResp, setCronResp] = useState('');

  return (
    <div>
      <h2>Dev Console</h2>
      <section>
        <h3>Echo API</h3>
        <button
          onClick={async () => {
            const r = await fetch('/api/dev/echo', { method: 'POST', body: JSON.stringify({ hello: 'world' }) });
            setEchoResp(JSON.stringify(await r.json(), null, 2));
          }}
        >POST /api/dev/echo</button>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{echoResp}</pre>
      </section>

      <section>
        <h3>Digest Preview</h3>
        <button
          onClick={async () => {
            const r = await fetch('/api/dev/digest-preview');
            setPreviewHtml(await r.text());
          }}
        >GET /api/dev/digest-preview</button>
        <div style={{ border: '1px solid #ddd', padding: 8, marginTop: 8 }} dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </section>

      <section>
        <h3>SAM Mock Preview</h3>
        <button
          onClick={async () => {
            const r = await fetch('/api/dev/sam-mock');
            setSamResp(JSON.stringify(await r.json(), null, 2));
          }}
        >GET /api/dev/sam-mock</button>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{samResp}</pre>
      </section>

      <section>
        <h3>Run Cron (Dev)</h3>
        <button
          onClick={async () => {
            const r = await fetch('/api/dev/run-cron', { method: 'POST' });
            setCronResp(JSON.stringify(await r.json(), null, 2));
          }}
        >POST /api/dev/run-cron</button>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{cronResp}</pre>
      </section>
    </div>
  );
}