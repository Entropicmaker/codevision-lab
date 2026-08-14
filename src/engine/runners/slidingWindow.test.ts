import { describe, expect, it } from 'vitest';
import { runSlidingWindow, SLIDING_WINDOW_LINES } from './slidingWindow';

function run(values: number[], k: number) {
  return runSlidingWindow({ kind: 'int-array', value: { array: values, aux: k } });
}

describe('runSlidingWindow', () => {
  it('默认输入求出正确最大窗口和', () => {
    const result = run([2, 1, 5, 1, 3, 2, 8, 4], 3);
    expect(result.summary.result).toBe('max window sum = 14');
    expect(result.summary.resultValue).toBe(14);
    const last = result.steps[result.steps.length - 1];
    expect(last?.operation).toBe('finalize');
    expect(last?.output).toEqual(['max window sum = 14']);
    // 最优窗口 a[5..7] 应为 done（绿色）
    const a = last?.containers['a'];
    expect(a?.[5]?.state).toBe('done');
    expect(a?.[6]?.state).toBe('done');
    expect(a?.[7]?.state).toBe('done');
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([2, 1, 5, 1, 3, 2, 8, 4], 3);
    const b = run([2, 1, 5, 1, 3, 2, 8, 4], 3);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run([2, 1, 5, 1, 3, 2, 8, 4], 3);
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    steps[0]!.containers['a']![0]!.value = 999;
    expect(steps[1]).toEqual(snapshot);
  });

  it('k 大于数组长度时产生显式 invalid 错误步骤', () => {
    const result = run([1, 2, 3], 5);
    expect(result.summary.result).toBe('input error');
    expect(result.steps.length).toBe(2);
    const errorStep = result.steps[1];
    expect(errorStep?.containers['a']?.every((el) => el.state === 'invalid')).toBe(true);
  });

  it('空数组在 k>=1 时同样触发 k>n 错误', () => {
    const result = run([], 1);
    expect(result.summary.result).toBe('input error');
    expect(result.steps.length).toBe(2);
  });

  it('k=1：每个元素单独成窗，最大值为数组最大元素', () => {
    const result = run([3, 1, 4, 1, 5], 1);
    expect(result.summary.resultValue).toBe(5);
    // 5 个单元素窗口 → 4 次比较、5 次访问
    expect(result.summary.stats.comparisons).toBe(4);
    expect(result.summary.stats.accesses).toBe(5);
  });

  it('k=n：窗口覆盖整个数组，不滑动直接结束', () => {
    const result = run([1, 2, 3], 3);
    expect(result.summary.resultValue).toBe(6);
    expect(result.summary.stats.comparisons).toBe(0);
    expect(result.steps.length).toBe(3); // init + build-window + end
  });

  it('统计正确：默认输入 5 次滑动、8 次访问', () => {
    const { summary } = run([2, 1, 5, 1, 3, 2, 8, 4], 3);
    expect(summary.stats.comparisons).toBe(5); // n - k = 5
    expect(summary.stats.accesses).toBe(8); // k + (n - k) = 3 + 5
    expect(summary.stats.swaps).toBe(0);
  });

  it('关键逻辑行都出现过：build-window、slide-in、slide-out、update-max、end', () => {
    const { steps } = run([2, 1, 5, 1, 3, 2, 8, 4], 3);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(SLIDING_WINDOW_LINES.init);
    expect(ids).toContain(SLIDING_WINDOW_LINES.buildWindow);
    expect(ids).toContain(SLIDING_WINDOW_LINES.slideIn);
    expect(ids).toContain(SLIDING_WINDOW_LINES.slideOut);
    expect(ids).toContain(SLIDING_WINDOW_LINES.updateMax);
    expect(ids).toContain(SLIDING_WINDOW_LINES.end);
    // 每次滑动恰好一次 update-max 比较
    const compares = steps.filter((s) => s.operation === 'compare');
    expect(compares.length).toBe(5);
  });

  it('构建窗口步骤：变量与指针正确', () => {
    const { steps } = run([2, 1, 5, 1, 3, 2, 8, 4], 3);
    const build = steps.find((s) => s.codeLineId === SLIDING_WINDOW_LINES.buildWindow);
    expect(build).toBeDefined();
    expect(build?.variables).toMatchObject({ windowSum: 8, maxSum: 8, left: 0, right: 2 });
    const leftPointer = build?.pointers.find((p) => p.name === 'left');
    const rightPointer = build?.pointers.find((p) => p.name === 'right');
    expect(leftPointer?.target).toBe('a:0');
    expect(rightPointer?.target).toBe('a:2');
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { slidingWindowMeta } = await import('../../content/algorithms/sliding-window');
    const maps = slidingWindowMeta.codeExamples;
    const { steps } = run([2, 1, 5, 1, 3, 2, 8, 4], 3);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});
