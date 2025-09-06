import { describe, it, expect } from 'vitest';
import { stringify, buildQuery, isBaseType, dropAmendment, shouldInclude, shouldExclude, formatMMDDYYYY } from './opps.helpers';

describe('opps helpers', () => {
  it('stringify encodes params correctly', () => {
    const out = stringify({ a: 'x', b: 2 });
    // order not guaranteed so check parts
    expect(out).toContain('a=x');
    expect(out).toContain('b=2');
  });

  it('buildQuery flattens arrays and ignores undefined', () => {
    const q = buildQuery({ q: 'test', ncode: ['11', '22'], missing: undefined });
    expect(q.q).toBe('test');
    expect(q.ncode).toBe('11,22');
    expect(Object.prototype.hasOwnProperty.call(q, 'missing')).toBe(false);
  });

  it('isBaseType detects allowed types', () => {
    expect(isBaseType('o')).toBe(true);
    expect(isBaseType('k')).toBe(true);
    expect(isBaseType('p')).toBe(true);
    expect(isBaseType('x')).toBe(false);
    expect(isBaseType(undefined)).toBe(true);
  });

  it('dropAmendment filters amendment titles', () => {
    expect(dropAmendment('This is an amendment')).toBe(false);
    expect(dropAmendment('Corrigendum issued')).toBe(false);
    expect(dropAmendment('Regular opportunity')).toBe(true);
    expect(dropAmendment(undefined)).toBe(true);
  });

  it('shouldInclude honors include words', () => {
    const title = 'Supply of test widgets';
    expect(shouldInclude(title, undefined, '')).toBe(true);
    expect(shouldInclude(title, 'desc', 'widgets')).toBe(true);
    expect(shouldInclude(title, 'desc', 'nothing')).toBe(false);
    expect(shouldInclude(title, 'desc', 'supply widgets')).toBe(true);
  });

  it('shouldExclude honors exclude words', () => {
    const title = 'Confidential procurement for secret items';
    expect(shouldExclude(title, undefined, '')).toBe(false);
    expect(shouldExclude(title, undefined, 'secret')).toBe(true);
    expect(shouldExclude(title, undefined, 'nothing')).toBe(false);
    expect(shouldExclude(title, undefined, 'confidential,secreT')).toBe(true);
  });

  it('formatMMDDYYYY produces expected format', () => {
    const d = new Date('2024-03-05T12:00:00Z');
    expect(formatMMDDYYYY(d)).toBe('03/05/2024');
    const d2 = new Date('1999-12-31T00:00:00Z');
    expect(formatMMDDYYYY(d2)).toBe('12/31/1999');
  });
});
