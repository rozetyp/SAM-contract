import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Top-level mocks for modules imported by src/jobs/opps.ts so dynamic import doesn't fail
vi.mock('@/emails', () => ({ createDigestHtml: (_opts: any) => '<html/>' }));
vi.mock('resend', () => ({ Resend: function () { return { emails: { send: async () => ({ id: 'sent' }) } }; } }));
// Mock the timers promise to avoid real delays in tests
vi.mock('node:timers/promises', () => ({ setTimeout: (_ms: number) => Promise.resolve() }));

// Helper to build a minimal mock DB that satisfies the calls made by runOppsDigest
function makeMockDb({ user = { id: 1, email: 'u@example.com', plan: 'paid' }, search = {} } = {}) {
  const db = {
    insert: (table: any) => ({
      values: (_v: any) => ({
        returning: async () => [{ id: 1 }]
      })
    }),
    select: () => ({
      from: (_table: any) => ({
        where: async (..._args: any[]) => {
          // Return by table hint based on how runOppsDigest uses it
          // callers expect users, searches, sentNoticeIds
          return [] as any;
        }
      })
    }),
    update: () => ({ set: () => ({ where: async () => {} }) })
  } as any;

  // Replace select().from(...).where behavior with table-aware results by patching the chain
  db.select = () => ({
    from: (table: any) => ({
      where: async (..._args: any[]) => {
        const name = String(table);
        if (name.includes('users')) return [user];
        if (name.includes('searches')) return [Object.assign({ userId: user.id, q: '', naics: [], psc: [], setaside: [], includeWords: '', excludeWords: '' }, search)];
        if (name.includes('sentNoticeIds')) return [];
        return [];
      }
    })
  });

  return db;
}

describe('runOppsDigest - rate limiting & API key usage', () => {
  beforeEach(() => {
    vi.resetModules();
    // clear any previous global.fetch
    // @ts-ignore
    delete globalThis.fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes SAM_OPPS_API_KEY in query and honors per-user API call limit', async () => {
    // Configure environment before importing module so RATE_LIMIT_CONFIG is computed with test values
    process.env.SAM_MAX_API_CALLS_PER_USER = '1';
    process.env.SAM_DELAY_BETWEEN_API_CALLS = '0';
    process.env.SAM_DELAY_BETWEEN_USERS = '0';
    process.env.SAM_MAX_RETRIES = '1';
    process.env.SAM_OPPS_API_KEY = 'TESTKEY123';
    process.env.RESEND_API_KEY = 'DUMMY';
    process.env.RESEND_DRY = 'true';
    process.env.DATABASE_URL = 'postgres://';

    // Mock '@/lib' used by the module
    vi.mock('@/lib', () => ({
      makePool: () => ({ end: async () => {} }),
      makeDb: () => makeMockDb(),
      // simple string tokens for table identifiers - our mock DB checks includes
      searches: 'searches',
      sentNoticeIds: 'sentNoticeIds',
      users: 'users',
      cronRuns: 'cronRuns'
    }));

    // Mock fetch to return a large page so pagination would normally continue
    const pageItems = new Array(200).fill(null).map((_, i) => ({ noticeId: `N${i}`, title: 'Test title', ptype: 'o', postedDate: '09/01/2025' }));
    const fetchMock = vi.fn().mockImplementation(async (url: string) => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: (_: string) => null },
      json: async () => ({ totalRecords: 10000, opportunitiesData: pageItems }),
      text: async () => 'OK'
    }));
    // @ts-ignore
    globalThis.fetch = fetchMock;

    const mod = await import('./opps');
    await mod.runOppsDigest({ daysBack: 1 });

    // fetch should have been called but limited to 1 call per user by env
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock.mock.calls.length).toBe(1);

    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain('api_key=TESTKEY123');
  });

  it('retries on 429 and throws after maxRetries exhausted', async () => {
    process.env.SAM_MAX_API_CALLS_PER_USER = '5';
    process.env.SAM_MAX_RETRIES = '2';
    process.env.SAM_DELAY_BETWEEN_API_CALLS = '0';
    process.env.SAM_DELAY_BETWEEN_USERS = '0';
    process.env.SAM_OPPS_API_KEY = 'KEY-429';
    process.env.RESEND_API_KEY = 'DUMMY';
    process.env.RESEND_DRY = 'true';
    process.env.DATABASE_URL = 'postgres://';

    vi.mock('@/lib', () => ({
      makePool: () => ({ end: async () => {} }),
      makeDb: () => makeMockDb(),
      searches: 'searches',
      sentNoticeIds: 'sentNoticeIds',
      users: 'users',
      cronRuns: 'cronRuns'
    }));

    // fetch always returns 429
    const fetchMock = vi.fn().mockImplementation(async () => ({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: { get: (_: string) => null },
      json: async () => ({}),
      text: async () => 'rate limited'
    }));
    // @ts-ignore
    globalThis.fetch = fetchMock;

  const mod = await import('./opps');
  await expect(mod.runOppsDigest({ daysBack: 1 })).rejects.toThrow(/Max retries|rate limit|429/i);
  });
});
