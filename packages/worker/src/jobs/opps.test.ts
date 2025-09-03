import { describe, it, expect } from 'vitest';

function validateContract({ postedFrom, postedTo, limit }: { postedFrom?: string; postedTo?: string; limit?: number }) {
  if (!postedFrom || !postedTo) throw new Error('postedFrom/postedTo required');
  const from = new Date(postedFrom);
  const to = new Date(postedTo);
  const span = (to.getTime() - from.getTime()) / (1000 * 3600 * 24);
  if (span > 366) throw new Error('>1 year window');
  if ((limit ?? 0) > 1000) throw new Error('limit>1000');
}

describe('SAM contract tests', () => {
  it('rejects missing dates', () => {
    expect(() => validateContract({ postedFrom: undefined, postedTo: '2024-01-01' })).toThrow();
  });
  it('rejects >1yr', () => {
    expect(() => validateContract({ postedFrom: '2020-01-01', postedTo: '2022-06-01' })).toThrow();
  });
  it('rejects limit>1000', () => {
    expect(() => validateContract({ postedFrom: '2024-01-01', postedTo: '2024-01-02', limit: 1001 })).toThrow();
  });
});

describe('Idempotency', () => {
  it('ignores duplicates by (user_id, notice_id)', () => {
    const seen = new Set<string>();
    const rows = [
      { userId: 1, noticeId: 'A' },
      { userId: 1, noticeId: 'A' },
      { userId: 2, noticeId: 'A' }
    ];
    const inserted: typeof rows = [];
    for (const r of rows) {
      const key = `${r.userId}:${r.noticeId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      inserted.push(r);
    }
    expect(inserted).toEqual([
      { userId: 1, noticeId: 'A' },
      { userId: 2, noticeId: 'A' }
    ]);
  });
});