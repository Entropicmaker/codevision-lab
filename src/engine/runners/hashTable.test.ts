import { describe, expect, it } from 'vitest';
import { runHashTable, HASH_TABLE_LINES } from './hashTable';
import type { HashTableSnapshot } from '../types/step';

function run(values: number[], m = 7) {
  return runHashTable({ kind: 'int-array', value: { array: values, aux: m } });
}

function lastTable(values: number[], m = 7): HashTableSnapshot {
  const { steps } = run(values, m);
  const last = steps[steps.length - 1]!;
  const ht = last.structures.find((s): s is HashTableSnapshot => s.kind === 'hash-table');
  if (!ht) throw new Error('缺少 hash-table 结构快照');
  return ht;
}

function bucketMap(values: number[], m = 7): Map<number, number[]> {
  const ht = lastTable(values, m);
  const map = new Map<number, number[]>();
  for (const b of ht.buckets) map.set(b.index, b.items.map((el) => el.value as number));
  return map;
}

describe('runHashTable', () => {
  it('默认输入：每个键按 k % m 落入正确桶，冲突元素按插入顺序挂链', () => {
    const map = bucketMap([23, 17, 9, 30, 12, 5, 26], 7);
    expect(map.get(0)).toEqual([]);
    expect(map.get(1)).toEqual([]);
    expect(map.get(2)).toEqual([23, 9, 30]); // 23%7=2, 9%7=2, 30%7=2
    expect(map.get(3)).toEqual([17]); // 17%7=3
    expect(map.get(4)).toEqual([]);
    expect(map.get(5)).toEqual([12, 5, 26]); // 12%7=5, 5%7=5, 26%7=5
    expect(map.get(6)).toEqual([]);
  });

  it('全部同余场景：所有键挂到同一桶且保持插入顺序', () => {
    const map = bucketMap([7, 14, 21], 7);
    expect(map.get(0)).toEqual([7, 14, 21]);
    for (let i = 1; i < 7; i += 1) expect(map.get(i)).toEqual([]);
  });

  it('确定性：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([23, 17, 9, 30, 12, 5, 26], 7);
    const b = run([23, 17, 9, 30, 12, 5, 26], 7);
    expect(a.steps).toEqual(b.steps);
  });

  it('快照独立：buckets 与 hashNotes 深拷贝，修改某步不影响其他步', () => {
    const { steps } = run([9, 16, 23], 7);
    const before = JSON.parse(JSON.stringify(steps[1]!)) as unknown;
    const ht0 = steps[0]!.structures.find((s): s is HashTableSnapshot => s.kind === 'hash-table')!;
    ht0.buckets[0]!.items.push({ id: 'k:999', value: 999, state: 'active' });
    ht0.hashNotes!['k:999'] = '999 % 7 = 5';
    expect(steps[1]).toEqual(before);
  });

  it('hashNotes 存在且计算正确', () => {
    const ht = lastTable([23, 9, 30], 7);
    expect(ht.hashNotes?.['k:23']).toBe('23 % 7 = 2');
    expect(ht.hashNotes?.['k:9']).toBe('9 % 7 = 2');
    expect(ht.hashNotes?.['k:30']).toBe('30 % 7 = 2');
  });

  it('activeBucket 随操作变化并高亮所有涉及到的桶', () => {
    const { steps } = run([23, 17, 9, 30, 12, 5, 26], 7);
    const active = new Set<number>();
    for (const s of steps) {
      const ht = s.structures.find((x): x is HashTableSnapshot => x.kind === 'hash-table')!;
      if (ht.activeBucket !== undefined) active.add(ht.activeBucket);
    }
    expect([...active].sort()).toEqual([2, 3, 5]);
  });

  it('全部关键 codeLineId 都出现过', () => {
    const { steps } = run([23, 9, 30], 7);
    const ids = new Set(steps.map((s) => s.codeLineId));
    for (const id of Object.values(HASH_TABLE_LINES)) {
      expect(ids.has(id), `缺少 codeLineId: ${id}`).toBe(true);
    }
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { hashTableMeta } = await import('../../content/algorithms/hash-table');
    const maps = hashTableMeta.codeExamples;
    const { steps } = run([23, 9, 30], 7);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('空数组：无插入无查找，桶全空', () => {
    const { steps, summary } = run([], 7);
    const ht = steps[steps.length - 1]!.structures.find((s): s is HashTableSnapshot => s.kind === 'hash-table')!;
    expect(ht.buckets.every((b) => b.items.length === 0)).toBe(true);
    expect(summary.stats.comparisons).toBe(0);
    expect(summary.stats.writes).toBe(0);
  });

  it('单键：落入正确桶并查找命中', () => {
    const map = bucketMap([23], 7);
    expect(map.get(2)).toEqual([23]);
    const { summary } = run([23], 7);
    expect(summary.stats.writes).toBe(1);
  });

  it('stats 单调不减，写入次数等于键数，比较次数符合链长之和', () => {
    const { steps, summary } = run([23, 17, 9, 30, 12, 5, 26], 7);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!.stats.comparisons).toBeGreaterThanOrEqual(steps[i - 1]!.stats.comparisons);
      expect(steps[i]!.stats.accesses).toBeGreaterThanOrEqual(steps[i - 1]!.stats.accesses);
      expect(steps[i]!.stats.writes).toBeGreaterThanOrEqual(steps[i - 1]!.stats.writes);
    }
    expect(summary.stats.writes).toBe(7);
    // 插入期链比较：0+0+1+2+0+1+2 = 6；查找最后一个键 26（桶5 链 [12,5,26]）比较 3 次 = 9
    expect(summary.stats.comparisons).toBe(9);
  });
});
