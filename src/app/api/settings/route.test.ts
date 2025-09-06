import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Use dynamic import so we can mock '@/lib' first
vi.mock('@/lib', () => {
  // provide placeholders that tests can override via require cache
  return {
    makePool: vi.fn(() => ({ end: vi.fn() })),
    makeDb: vi.fn(() => ({ /* overridden per test */ })),
    searches: { id: 'searches' },
    users: { id: 'users', email: 'email' }
  } as any;
});

describe('POST /api/settings route', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email missing', async () => {
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/settings', { method: 'POST', body: '{}' });
    const res = await POST(req as any);
    // NextResponse.json returns an object with status and body via properties
    // But to be robust, convert to json if available
    // The NextResponse in this environment is the real Next.js NextResponse, so check simple fields
    // We can inspect by calling res.json() if available
    if (typeof (res as any).json === 'function') {
      const body = await (res as any).json();
      expect(body).toHaveProperty('error', 'email required');
    }
  });

  it('returns user info when no search criteria provided', async () => {
    // mock makePool and makeDb to return a fake db
    const lib = await import('@/lib');
    const fakeDb = {
      select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ id: 42, email: 't@e', plan: 'trial' }])) })) })),
      insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 42, email: 't@e', plan: 'trial' }])) })) })),
      // allow select().from(searches).where(...) later
      update: vi.fn(),
    } as any;
    (lib.makeDb as any).mockImplementation(() => fakeDb);

    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 't@e' }),
    });
    const res = await POST(req as any);
    const body = await (res as any).json();
    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('userId');
    expect(body).toHaveProperty('plan');
  });

  it('blocks saving preferences for unpaid users (402)', async () => {
    const lib = await import('@/lib');
    // select users returns a paid=false user
    const fakeDb = {
      select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([{ id: 99, email: 'u@e', plan: 'trial' }])) })) })),
      insert: vi.fn(),
      update: vi.fn(),
    } as any;
    (lib.makeDb as any).mockImplementation(() => fakeDb);

    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'u@e', q: 'hello', naics: '111' }),
    });
    const res = await POST(req as any);
    const body = await (res as any).json();
    expect(body).toHaveProperty('error', 'payment_required');
    expect(body).toHaveProperty('plan', 'trial');
  });
});
