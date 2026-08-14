import { describe, expect, it } from 'vitest';
import { runMergeSort, MERGE_SORT_LINES } from './mergeSort';
import { mergeSortMeta } from '../../content/algorithms/merge-sort';

function run(values: number[]) {
  return runMergeSort({ kind: 'int-array', value: values });
}

describe('runMergeSort', () => {
  it('对乱序数组产生正确排序结果', () => {
    const result = run([38, 27, 43, 3, 9, 82, 10]);
    expect(result.summary.result).toBe('3, 9, 10, 27, 38, 43, 82');
    const last = result.steps[result.steps.length - 1];
    expect(last?.containers.a?.map((el) => el.value)).toEqual([3, 9, 10, 27, 38, 43, 82]);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([4, 1, 3, 2, 5]);
    const b = run([4, 1, 3, 2, 5]);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run([3, 1, 2]);
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    steps[0]!.containers['a']![0]!.value = 999;
    expect(steps[1]).toEqual(snapshot);
  });

  it('空数组与单元素数组正确完成', () => {
    const empty = run([]);
    expect(empty.steps.length).toBe(2);
    expect(empty.summary.stats.comparisons).toBe(0);

    const single = run([7]);
    expect(single.summary.result).toBe('7');
    expect(single.summary.stats.comparisons).toBe(0);
    expect(single.summary.stats.swaps).toBe(0);
  });

  it('统计正确：逆序 5 元素比较 5 次、写回 12 次、零交换', () => {
    const { summary } = run([5, 4, 3, 2, 1]);
    expect(summary.stats.swaps).toBe(0); // 归并排序不交换
    expect(summary.stats.comparisons).toBe(5);
    // 写回 = 所有合并区间长度之和：merge(2) + merge(2) + merge(3) + merge(5) = 12
    expect(summary.stats.writes).toBe(12);
    expect(summary.stats.accesses).toBeGreaterThan(0);
  });

  it('callStack 非空，depth 从 1 开始且随递归加深，函数名统一为 mergeSort', () => {
    const { steps } = run([3, 1, 2, 4]);
    expect(steps.some((s) => s.callStack.length > 0)).toBe(true);
    const maxDepth = Math.max(
      ...steps.map((s) => s.callStack.reduce((m, f) => Math.max(m, f.depth), 0)),
    );
    expect(maxDepth).toBeGreaterThanOrEqual(2);
    for (const step of steps) {
      let prevDepth = 0;
      step.callStack.forEach((frame) => {
        expect(frame.function).toBe('mergeSort');
        expect(frame.args).toHaveProperty('l');
        expect(frame.args).toHaveProperty('r');
        expect(frame.depth).toBeGreaterThanOrEqual(1);
        // 从栈底到栈顶，递归层数单调不减（兄弟帧同层、子帧 +1）
        expect(frame.depth).toBeGreaterThanOrEqual(prevDepth);
        prevDepth = frame.depth;
      });
      // 栈底（根帧）的递归层数恒为 1
      if (step.callStack.length > 0) {
        expect(step.callStack[0]!.depth).toBe(1);
      }
    }
  });

  it('合并写回步骤正确更新容器值', () => {
    const { steps } = run([2, 1]);
    const copySteps = steps.filter((s) => s.codeLineId === MERGE_SORT_LINES.copy);
    expect(copySteps.length).toBeGreaterThan(0);
    const lastCopy = copySteps[copySteps.length - 1];
    expect(lastCopy?.containers.a?.map((el) => el.value)).toEqual([1, 2]);
    // 写回步骤的最终状态为 done
    expect(lastCopy?.containers.a?.every((el) => el.state === 'done')).toBe(true);
  });

  it('比较步骤带有 i、j 指针', () => {
    const { steps } = run([3, 2, 1]);
    const compareStep = steps.find((s) => s.codeLineId === MERGE_SORT_LINES.compare);
    expect(compareStep).toBeDefined();
    const names = compareStep?.pointers.map((p) => p.name);
    expect(names).toContain('i');
    expect(names).toContain('j');
  });

  it('关键逻辑行都出现过', () => {
    const { steps } = run([4, 2, 5, 1, 3]);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(MERGE_SORT_LINES.init);
    expect(ids).toContain(MERGE_SORT_LINES.divide);
    expect(ids).toContain(MERGE_SORT_LINES.mid);
    expect(ids).toContain(MERGE_SORT_LINES.merge);
    expect(ids).toContain(MERGE_SORT_LINES.compare);
    expect(ids).toContain(MERGE_SORT_LINES.copy);
    expect(ids).toContain(MERGE_SORT_LINES.end);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', () => {
    const maps = mergeSortMeta.codeExamples;
    const { steps } = run([3, 2, 1]);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('三语言 lineMap 的 codeLineId 集合完全一致且包含全部 10 个 id', () => {
    const keys = (['cpp', 'csharp', 'python'] as const).map((lang) =>
      Object.keys(mergeSortMeta.codeExamples[lang].lineMap).sort(),
    );
    expect(keys[1]).toEqual(keys[0]);
    expect(keys[2]).toEqual(keys[0]);
    expect(keys[0]).toEqual(
      ['compare', 'copy', 'divide', 'end', 'func', 'init', 'left', 'merge', 'mid', 'right'].sort(),
    );
  });
});
