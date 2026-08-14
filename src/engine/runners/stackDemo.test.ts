import { describe, expect, it } from 'vitest';
import type { AlgorithmStep, LinearStructureSnapshot } from '../types/step';
import { runStackDemo, STACK_LINES } from './stackDemo';

function run(values: number[]) {
  return runStackDemo({ kind: 'int-array', value: values });
}

/** 取出步骤中的栈结构快照（本 runner 每步都恰好含一个 kind='stack' 的快照） */
function stackOf(step: AlgorithmStep): LinearStructureSnapshot {
  const s = step.structures[0];
  if (!s || s.kind !== 'stack') throw new Error('missing stack snapshot');
  return s;
}

describe('runStackDemo', () => {
  it('入栈出栈序列正确：LIFO 后进先出', () => {
    const result = run([3, 7, 2, 9, 5]);
    // 最后入栈的 5 最先出栈
    expect(result.summary.result).toBe('5, 9, 2, 7, 3');
    const last = result.steps[result.steps.length - 1];
    expect(last?.output).toEqual(['5', '9', '2', '7', '3']);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([4, 1, 3, 2]);
    const b = run([4, 1, 3, 2]);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run([3, 1, 2]);
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    // 向第 0 步（init）的栈里塞一个元素，不应影响第 1 步
    stackOf(steps[0]!).items.push({ id: 'stack:99', value: 999, state: 'done' });
    expect(steps[1]).toEqual(snapshot);
  });

  it('空数组与单元素数组', () => {
    const empty = run([]);
    expect(empty.steps.length).toBe(2); // init + end
    expect(empty.summary.result).toBe('');
    expect(empty.steps[0]?.operation).toBe('init');
    expect(empty.steps[1]?.operation).toBe('finalize');

    const single = run([7]);
    expect(single.summary.result).toBe('7');
    expect(single.steps.length).toBe(6); // init + push-loop + push + pop-loop + pop + end
  });

  it('结构快照存在且 items 长度随 push/pop 正确变化', () => {
    const { steps } = run([3, 7, 2]);
    const pushSteps = steps.filter((s) => s.operation === 'push');
    expect(pushSteps.map((s) => stackOf(s).items.length)).toEqual([1, 2, 3]);
    // 入栈后栈顶为最后入栈的元素（active），栈底为第一个入栈元素（idle）
    const lastPush = pushSteps[2]!;
    expect(stackOf(lastPush).items[2]?.value).toBe(2);
    expect(stackOf(lastPush).items[2]?.state).toBe('active');
    expect(stackOf(lastPush).items[0]?.value).toBe(3);
    expect(stackOf(lastPush).items[0]?.state).toBe('idle');

    const popSteps = steps.filter((s) => s.operation === 'pop');
    expect(popSteps.map((s) => stackOf(s).items.length)).toEqual([2, 1, 0]);
    // 出栈后新栈顶（7）成为新的 active 元素
    const firstPop = popSteps[0]!;
    expect(stackOf(firstPop).items[1]?.value).toBe(7);
    expect(stackOf(firstPop).items[1]?.state).toBe('active');
    expect(stackOf(firstPop).items[0]?.state).toBe('idle');
  });

  it('关键 codeLineId 都出现过', () => {
    const { steps } = run([3, 1, 2]);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(STACK_LINES.init);
    expect(ids).toContain(STACK_LINES.pushLoop);
    expect(ids).toContain(STACK_LINES.push);
    expect(ids).toContain(STACK_LINES.popLoop);
    expect(ids).toContain(STACK_LINES.pop);
    expect(ids[ids.length - 1]).toBe(STACK_LINES.end);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { stackDemoMeta } = await import('../../content/algorithms/stack-demo');
    const maps = stackDemoMeta.codeExamples;
    const { steps } = run([3, 2, 1]);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('统计累计正确：n 次 push + n 次 pop', () => {
    const { summary } = run([3, 7, 2, 9, 5]);
    expect(summary.stats.accesses).toBe(10);
    expect(summary.stats.writes).toBe(10);
    expect(summary.stats.comparisons).toBe(0);
    expect(summary.stats.swaps).toBe(0);
  });

  it('变量 top/size/capacity 正确更新', () => {
    const { steps } = run([3, 7]);
    expect(steps[0]?.variables).toMatchObject({ top: -1, size: 0, capacity: 8 });
    const pushStep = steps.find((s) => s.operation === 'push' && stackOf(s).items.length === 2);
    expect(pushStep?.variables).toMatchObject({ top: 1, size: 2, capacity: 8 });
    const last = steps[steps.length - 1];
    expect(last?.variables).toMatchObject({ top: -1, size: 0, capacity: 8 });
  });
});
