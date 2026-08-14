import { describe, expect, it } from 'vitest';
import { runTwoPointers, TWO_POINTERS_LINES } from './twoPointers';

function run(values: number[], target: number) {
  return runTwoPointers({ kind: 'int-array', value: { array: values, aux: target } });
}

describe('runTwoPointers', () => {
  it('默认有序数组能找到两数之和', () => {
    const result = run([1, 3, 4, 6, 8, 10, 12, 15], 11);
    expect(result.summary.result).toBe('found at 0, 5');
    expect(result.summary.resultValue).toBe('0,5');
    const last = result.steps[result.steps.length - 1];
    expect(last?.operation).toBe('found');
    expect(last?.output).toEqual(['found at indices 0 and 5']);
    // 两个命中元素应为 done（绿色）
    const a = last?.containers['a'];
    expect(a?.[0]?.state).toBe('done');
    expect(a?.[5]?.state).toBe('done');
  });

  it('无解时返回 not found', () => {
    const result = run([2, 5, 8, 12], 11);
    expect(result.summary.result).toBe('not found');
    const last = result.steps[result.steps.length - 1];
    expect(last?.codeLineId).toBe(TWO_POINTERS_LINES.notFound);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([1, 3, 4, 6, 8, 10, 12, 15], 11);
    const b = run([1, 3, 4, 6, 8, 10, 12, 15], 11);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run([1, 3, 4, 6, 8, 10, 12, 15], 11);
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    steps[0]!.containers['a']![0]!.value = 999;
    expect(steps[1]).toEqual(snapshot);
  });

  it('无序输入产生显式 invalid 错误步骤', () => {
    const result = run([3, 1, 2], 4);
    expect(result.summary.result).toBe('input error');
    expect(result.steps.length).toBe(2);
    const errorStep = result.steps[1];
    expect(errorStep?.containers['a']?.every((el) => el.state === 'invalid')).toBe(true);
  });

  it('空数组与单元素数组直接 not found', () => {
    const empty = run([], 5);
    expect(empty.summary.result).toBe('not found');
    expect(empty.steps.length).toBe(2);

    const single = run([7], 7);
    expect(single.summary.result).toBe('not found');
    expect(single.steps.length).toBe(2);
  });

  it('统计正确：每次求和比较 +1、访问 +2', () => {
    const { summary } = run([1, 3, 4, 6, 8, 10, 12, 15], 11);
    expect(summary.stats.comparisons).toBe(3);
    expect(summary.stats.accesses).toBe(6);

    // 无解：5 个元素全部排除 → 5 次求和
    const miss = run([1, 2, 3, 4, 5, 6], 100);
    expect(miss.summary.stats.comparisons).toBe(5);
    expect(miss.summary.stats.accesses).toBe(10);
    expect(miss.summary.stats.swaps).toBe(0);
  });

  it('关键逻辑行都出现过：sum、up-left、up-right、found', () => {
    // 该输入依次经历 up-right（16>12）、up-left（11<12）、found（12==12）
    const { steps } = run([1, 2, 3, 6, 10, 15], 12);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(TWO_POINTERS_LINES.init);
    expect(ids).toContain(TWO_POINTERS_LINES.sum);
    expect(ids).toContain(TWO_POINTERS_LINES.upLeft);
    expect(ids).toContain(TWO_POINTERS_LINES.upRight);
    expect(ids).toContain(TWO_POINTERS_LINES.found);
  });

  it('指针随步骤指向正确的左右下标', () => {
    const { steps } = run([1, 3, 4, 6, 8, 10, 12, 15], 11);
    const foundStep = steps.find((s) => s.operation === 'found');
    expect(foundStep).toBeDefined();
    const leftPointer = foundStep?.pointers.find((p) => p.name === 'left');
    const rightPointer = foundStep?.pointers.find((p) => p.name === 'right');
    expect(leftPointer?.target).toBe('a:0');
    expect(rightPointer?.target).toBe('a:5');
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { twoPointersMeta } = await import('../../content/algorithms/two-pointers');
    const maps = twoPointersMeta.codeExamples;
    const { steps } = run([1, 3, 4, 6, 8, 10, 12, 15], 11);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});
