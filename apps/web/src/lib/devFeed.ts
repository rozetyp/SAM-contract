// Simple in-memory ring buffer for dev-only event viewing
type FeedEvent = { ts: number; type: string; id?: string; summary?: any };

const CAP = 200;
const buf: FeedEvent[] = [];

export function addDevEvent(evt: FeedEvent) {
  if (process.env.NODE_ENV === 'production') return;
  buf.push(evt);
  if (buf.length > CAP) buf.shift();
}

export function getDevEvents(): FeedEvent[] {
  return process.env.NODE_ENV === 'production' ? [] : [...buf].reverse();
}
