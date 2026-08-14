import { describe, expect, it } from 'vitest';
import { parseIntArray } from './parsers';

const SPEC = {
  name: 'a',
  kind: 'int-array' as const,
  minLen: 0,
  maxLen: 20,
  valueMin: 1,
  valueMax: 99,
  allowEmpty: true,
};

describe('parseIntArray', () => {
  it('解析合法输入', () => {
    const r = parseIntArray('5, 3, 8', SPEC);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([5, 3, 8]);
  });

  it('支持正负号与空白', () => {
    const r = parseIntArray(' -2 , +7 , 10 ', { name: 'a', kind: 'int-array' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([-2, 7, 10]);
  });

  it('空输入在 allowEmpty 时合法', () => {
    const r = parseIntArray('', SPEC);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([]);
  });

  it('空输入在不允许时返回 emptyInput', () => {
    const r = parseIntArray('   ', { ...SPEC, allowEmpty: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.key).toBe('emptyInput');
  });

  it('非法 token 返回 invalidArray', () => {
    for (const bad of ['1.5, 2', '1 2', 'a, 2', '1,,2', '1, 2.0']) {
      const r = parseIntArray(bad, SPEC);
      expect(r.ok, `input: ${bad}`).toBe(false);
      if (!r.ok) expect(r.error.key).toBe('invalidArray');
    }
  });

  it('超出数量上限返回 tooManyItems', () => {
    const r = parseIntArray('1,2,3,4,5', { ...SPEC, maxLen: 3 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.key).toBe('tooManyItems');
  });

  it('数值越界返回 outOfRange', () => {
    const low = parseIntArray('0, 5', { ...SPEC, valueMin: 1 });
    expect(low.ok).toBe(false);
    if (!low.ok) expect(low.error.key).toBe('outOfRange');

    const high = parseIntArray('100, 5', { ...SPEC, valueMax: 99 });
    expect(high.ok).toBe(false);
    if (!high.ok) expect(high.error.key).toBe('outOfRange');
  });
});
