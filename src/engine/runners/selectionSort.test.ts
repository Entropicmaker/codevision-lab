import { describe, expect, it } from 'vitest';
import { runSelectionSort, SELECTION_SORT_LINES } from './selectionSort';

function run(values: number[]) {
  return runSelectionSort({ kind: 'int-array', value: values });
}

describe('runSelectionSort', () => {
  it('对乱序数组产生正确排序结果', () => {
    const result = run([34, 7, 23, 32, 5, 62, 1, 18]);
    expect(result.summary.result).toBe('1, 5, 7, 18, 23, 32, 34, 62');
    const last = result.steps[result.steps.length - 1];
    expect(last?.containers.a?.map((el) => el.value)).toEqual([1, 5, 7, 18, 23, 32, 34, 62]);
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
    expect(single.summary.stats.swaps).toBe(0);
  });

  it('统计正确：比较次数恒为 n(n-1)/2，交换最多 n-1 次', () => {
    const reversed = run([5, 4, 3, 2, 1]);
    expect(reversed.summary.stats.comparisons).toBe(10); // 5*4/2
    expect(reversed.summary.stats.swaps).toBeLessThanOrEqual(4); // 最多 n-1

    const sorted = run([1, 2, 3, 4, 5]);
    expect(sorted.summary.stats.comparisons).toBe(10); // 比较次数与输入无关
    expect(sorted.summary.stats.swaps).toBe(0);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { selectionSortMeta } = await import('../../content/algorithms/selection-sort');
    const maps = selectionSortMeta.codeExamples;
    const { steps } = run([3, 2, 1]);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('关键逻辑行都出现过：compare、update-min 与 swap', () => {
    const { steps } = run([3, 1, 2]);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids).toContain(SELECTION_SORT_LINES.compare);
    expect(ids).toContain(SELECTION_SORT_LINES['update-min']);
    expect(ids).toContain(SELECTION_SORT_LINES.swap);
    expect(ids[0]).toBe(SELECTION_SORT_LINES.init);
  });

  it('交换步的容器快照确实交换了两个元素', () => {
    const { steps } = run([2, 1, 3]);
    const swapStep = steps.find((s) => s.operation === 'swap');
    expect(swapStep).toBeDefined();
    const values = swapStep?.containers['a']?.map((el) => el.value);
    expect(values).toEqual([1, 2, 3]);
  });

  it('update-min 步骤的 min 指针指向新的最小值位置', () => {
    const { steps } = run([3, 2, 1]);
    const updateMin = steps
      .filter((s) => s.codeLineId === SELECTION_SORT_LINES['update-min'])
      .pop();
    expect(updateMin).toBeDefined();
    const minPointer = updateMin?.pointers.find((p) => p.name === 'min');
    expect(minPointer?.target).toBe(`a:${updateMin?.variables.minIndex}`);
  });

  it('变量表包含 n、i、j、minIndex 与 a[min]', () => {
    const { steps } = run([3, 1, 2]);
    const step = steps.find((s) => s.variables.minIndex !== undefined);
    expect(step).toBeDefined();
    expect(step?.variables['a[min]']).toBeDefined();
    expect(step?.variables.n).toBe(3);
  });
});
