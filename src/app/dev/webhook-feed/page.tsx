'use client';
import { useEffect, useState } from 'react';

// Prevent static generation for dev pages
export const dynamic = 'force-dynamic';

type EventRow = { ts: number; type: string; id?: string; summary?: any };

export default function WebhookFeedPage() {
  const [events, setEvents] = useState<EventRow[]>([]);

  async function load() {
    const r = await fetch('/api/dev/webhook-feed', { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    setEvents(j.events || []);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <h2>Webhook Feed (dev)</h2>
      <p>Auto-refreshing every 2s. Latest first.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Time</th>
            <th style={{ textAlign: 'left' }}>Type</th>
            <th style={{ textAlign: 'left' }}>ID</th>
            <th style={{ textAlign: 'left' }}>Summary</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, idx) => (
            <tr key={idx}>
              <td>{new Date(e.ts).toLocaleTimeString()}</td>
              <td>{e.type}</td>
              <td style={{ fontFamily: 'monospace' }}>{e.id}</td>
              <td><pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(e.summary)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
