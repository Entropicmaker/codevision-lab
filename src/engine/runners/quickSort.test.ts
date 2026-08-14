import { describe, expect, it } from 'vitest';
import { runQuickSort, QUICK_SORT_LINES } from './quickSort';

function run(values: number[]) {
  return runQuickSort({ kind: 'int-array', value: values });
}

describe('runQuickSort', () => {
  it('对乱序数组产生正确排序结果', () => {
    const result = run([8, 3, 5, 1, 9, 2, 7, 4]);
    expect(result.summary.result).toBe('1, 2, 3, 4, 5, 7, 8, 9');
    const last = result.steps[result.steps.length - 1];
    expect(last?.containers.a?.map((el) => el.value)).toEqual([1, 2, 3, 4, 5, 7, 8, 9]);
  });

  it('对已排序 / 逆序 / 全相等 / 单元素输入都正确', () => {
    expect(run([1, 2, 3, 4, 5]).summary.result).toBe('1, 2, 3, 4, 5');
    expect(run([9, 7, 5, 3, 1]).summary.result).toBe('1, 3, 5, 7, 9');
    expect(run([4, 4, 4, 4]).summary.result).toBe('4, 4, 4, 4');
    expect(run([7]).summary.result).toBe('7');
  });

  it('空数组直接完成且无比较', () => {
    const empty = run([]);
    expect(empty.steps.length).toBe(2);
    expect(empty.summary.stats.comparisons).toBe(0);
    expect(empty.summary.stats.swaps).toBe(0);
  });

  it('单元素数组不产生比较与交换', () => {
    const single = run([7]);
    expect(single.summary.result).toBe('7');
    expect(single.summary.stats.comparisons).toBe(0);
    expect(single.summary.stats.swaps).toBe(0);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([8, 3, 5, 1, 9, 2, 7, 4]);
    const b = run([8, 3, 5, 1, 9, 2, 7, 4]);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run([3, 1, 2]);
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    steps[0]!.containers['a']![0]!.value = 999;
    expect(steps[1]).toEqual(snapshot);
  });

  it('callStack 存在且 depth 随递归变化', () => {
    const { steps } = run([8, 3, 5, 1, 9, 2, 7, 4]);
    const depths = steps
      .map((s) => s.callStack.map((f) => f.depth))
      .filter((d) => d.length > 0)
      .map((d) => Math.max(...d));
    expect(depths.length).toBeGreaterThan(0);
    expect(Math.max(...depths)).toBeGreaterThan(1);
    // 深度不是恒定值：递归深入后应回到更浅层
    expect(new Set(depths).size).toBeGreaterThan(1);
  });

  it('callStack 帧结构符合约定（function/args/locals）', () => {
    const { steps } = run([3, 1, 2]);
    const frameStep = steps.find((s) => s.callStack.length > 0);
    expect(frameStep).toBeDefined();
    const frame = frameStep!.callStack[0];
    expect(frame?.function).toBe('quickSort');
    expect(frame?.args).toHaveProperty('l');
    expect(frame?.args).toHaveProperty('r');
    expect(frame?.locals).toHaveProperty('pivotIdx');
  });

  it('pivot 就位（place）步骤后：该元素被标记为 done', () => {
    const { steps } = run([8, 3, 5, 1, 9, 2, 7, 4]);
    const placeStep = steps.find((s) => s.codeLineId === QUICK_SORT_LINES.place);
    expect(placeStep).toBeDefined();
    const pIdx = placeStep!.variables.pIdx as number;
    expect(placeStep!.containers['a']![pIdx]!.state).toBe('done');
  });

  it('关键 codeLineId 都出现过', () => {
    const { steps } = run([8, 3, 5, 1, 9, 2, 7, 4]);
    const ids = steps.map((s) => s.codeLineId);
    for (const key of [
      QUICK_SORT_LINES.init,
      QUICK_SORT_LINES.pivot,
      QUICK_SORT_LINES.scan,
      QUICK_SORT_LINES.compare,
      QUICK_SORT_LINES.swap,
      QUICK_SORT_LINES.place,
      QUICK_SORT_LINES.partition,
      QUICK_SORT_LINES.left,
      QUICK_SORT_LINES.right,
      QUICK_SORT_LINES.end,
    ]) {
      expect(ids, `缺少 codeLineId "${key}"`).toContain(key);
    }
    expect(ids[0]).toBe(QUICK_SORT_LINES.init);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { quickSortMeta } = await import('../../content/algorithms/quick-sort');
    const maps = quickSortMeta.codeExamples;
    const { steps } = run([3, 2, 1]);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('统计单调递增且比较次数为正', () => {
    const { steps, summary } = run([8, 3, 5, 1, 9, 2, 7, 4]);
    expect(summary.stats.comparisons).toBeGreaterThan(0);
    for (let k = 1; k < steps.length; k += 1) {
      const prev = steps[k - 1]!.stats;
      const cur = steps[k]!.stats;
      expect(cur.comparisons).toBeGreaterThanOrEqual(prev.comparisons);
      expect(cur.swaps).toBeGreaterThanOrEqual(prev.swaps);
    }
  });

  it('最终所有元素均为 done（全绿）', () => {
    const { steps } = run([8, 3, 5, 1, 9, 2, 7, 4]);
    const last = steps[steps.length - 1];
    expect(last?.containers['a']?.every((el) => el.state === 'done')).toBe(true);
  });
});
