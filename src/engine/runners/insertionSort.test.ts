import { describe, expect, it } from 'vitest';
import { runInsertionSort, INSERTION_SORT_LINES } from './insertionSort';

function run(values: number[]) {
  return runInsertionSort({ kind: 'int-array', value: values });
}

describe('runInsertionSort', () => {
  it('对乱序数组产生正确排序结果', () => {
    const result = run([29, 10, 14, 37, 13, 5, 48, 2]);
    expect(result.summary.result).toBe('2, 5, 10, 13, 14, 29, 37, 48');
    const last = result.steps[result.steps.length - 1];
    expect(last?.containers.a?.map((el) => el.value)).toEqual([2, 5, 10, 13, 14, 29, 37, 48]);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([4, 1, 3, 2]);
    const b = run([4, 1, 3, 2]);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run([3, 1, 2]);
    const first = steps[0];
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    first.containers['a']![0]!.value = 999;
    expect(steps[1]).toEqual(snapshot);
  });

  it('空数组与单元素数组直接完成', () => {
    const empty = run([]);
    expect(empty.steps.length).toBe(2);
    expect(empty.summary.stats.comparisons).toBe(0);

    const single = run([7]);
    expect(single.summary.result).toBe('7');
    expect(single.summary.stats.comparisons).toBe(0);
    expect(single.summary.stats.writes).toBe(0);
  });

  it('统计正确：已排序输入不发生任何移位（最好情况 O(n)）', () => {
    const { steps, summary } = run([1, 2, 3, 4, 5]);
    const shifts = steps.filter((s) => s.operation === 'shift');
    expect(shifts.length).toBe(0);
    expect(summary.stats.comparisons).toBe(4); // n-1
  });

  it('统计正确：逆序输入移位 n(n-1)/2 次', () => {
    const { steps, summary } = run([5, 4, 3, 2, 1]);
    const shifts = steps.filter((s) => s.operation === 'shift');
    expect(shifts.length).toBe(10); // 5*4/2
    expect(summary.stats.comparisons).toBe(10);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { insertionSortMeta } = await import('../../content/algorithms/insertion-sort');
    const maps = insertionSortMeta.codeExamples;
    const { steps } = run([3, 2, 1]);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('关键逻辑行都出现过：key、compare、shift 与 insert', () => {
    const { steps } = run([3, 1, 2]);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids).toContain(INSERTION_SORT_LINES.key);
    expect(ids).toContain(INSERTION_SORT_LINES.compare);
    expect(ids).toContain(INSERTION_SORT_LINES.shift);
    expect(ids).toContain(INSERTION_SORT_LINES.insert);
    expect(ids[0]).toBe(INSERTION_SORT_LINES.init);
  });

  it('key 变量在 key 步骤中等于当前待插入元素', () => {
    const { steps } = run([4, 1, 3]);
    const keyStep = steps.find((s) => s.codeLineId === INSERTION_SORT_LINES.key);
    expect(keyStep?.variables.key).toBe(1);
  });

  it('插入步骤后前缀保持有序', () => {
    const { steps } = run([4, 3, 2, 1]);
    const insertStep = steps.find((s) => s.codeLineId === INSERTION_SORT_LINES.insert);
    const values = insertStep?.containers['a']?.map((el) => el.value) ?? [];
    expect((values[0] as number)).toBeLessThanOrEqual(values[1] as number);
  });
});
