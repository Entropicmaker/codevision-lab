import { describe, expect, it } from 'vitest';
import { runBubbleSort, BUBBLE_SORT_LINES } from './bubbleSort';
import { extractLineMap } from '../codeMap/extract';

function run(values: number[]) {
  return runBubbleSort({ kind: 'int-array', value: values });
}

describe('runBubbleSort', () => {
  it('对乱序数组产生正确排序结果', () => {
    const result = run([5, 3, 8, 1, 9, 2]);
    expect(result.summary.result).toBe('1, 2, 3, 5, 8, 9');
    const last = result.steps[result.steps.length - 1];
    expect(last?.containers.a?.map((el) => el.value)).toEqual([1, 2, 3, 5, 8, 9]);
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

  it('统计正确：n 个元素比较 n(n-1)/2 次', () => {
    const { summary } = run([5, 4, 3, 2, 1]);
    expect(summary.stats.comparisons).toBe(10); // 5*4/2
    // 逆序数组每对都交换
    expect(summary.stats.swaps).toBe(10);
  });

  it('已排序数组不产生任何交换', () => {
    const { summary } = run([1, 2, 3, 4]);
    expect(summary.stats.swaps).toBe(0);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    // 从内容注册表取三语言源码验证映射完整性
    const { bubbleSortMeta } = await import('../../content/algorithms/bubble-sort');
    const maps = bubbleSortMeta.codeExamples;
    const { steps } = run([3, 2, 1]);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('关键逻辑行都出现过：compare 与 swap', () => {
    const { steps } = run([3, 1, 2]);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids).toContain(BUBBLE_SORT_LINES.compare);
    expect(ids).toContain(BUBBLE_SORT_LINES.swap);
    expect(ids[0]).toBe(BUBBLE_SORT_LINES.init);
  });

  it('交换步的容器快照确实交换了两个元素', () => {
    const { steps } = run([2, 1, 3]);
    const swapStep = steps.find((s) => s.operation === 'swap');
    expect(swapStep).toBeDefined();
    const values = swapStep?.containers['a']?.map((el) => el.value);
    expect(values).toEqual([1, 2, 3]);
  });

  it('指针随步骤指向正确元素', () => {
    const { steps } = run([3, 2, 1]);
    const compareStep = steps.find((s) => s.operation === 'compare');
    const jPointer = compareStep?.pointers.find((p) => p.name === 'j');
    expect(jPointer?.target).toBe('a:0');
  });
});

describe('extractLineMap 与冒泡排序源码标记一致', () => {
  it('三语言映射包含相同的关键行 id', () => {
    const source = `//>func\n//>init\n//>outer\n//>inner\n//>compare\n//>swap\n//>end`;
    const map = extractLineMap(source);
    expect(Object.keys(map).sort()).toEqual(
      ['compare', 'end', 'func', 'init', 'inner', 'outer', 'swap'].sort(),
    );
  });
});
