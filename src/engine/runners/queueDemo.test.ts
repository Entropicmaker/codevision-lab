import { describe, expect, it } from 'vitest';
import type { AlgorithmStep, LinearStructureSnapshot } from '../types/step';
import { runQueueDemo, QUEUE_LINES } from './queueDemo';

function run(values: number[]) {
  return runQueueDemo({ kind: 'int-array', value: values });
}

/** 取出步骤中的队列结构快照（本 runner 每步都恰好含一个 kind='queue' 的快照） */
function queueOf(step: AlgorithmStep): LinearStructureSnapshot {
  const s = step.structures[0];
  if (!s || s.kind !== 'queue') throw new Error('missing queue snapshot');
  return s;
}

describe('runQueueDemo', () => {
  it('入队出队序列正确：FIFO 先进先出', () => {
    const result = run([3, 7, 2, 9, 5]);
    // 最先入队的 3 最先出队
    expect(result.summary.result).toBe('3, 7, 2, 9, 5');
    const last = result.steps[result.steps.length - 1];
    expect(last?.output).toEqual(['3', '7', '2', '9', '5']);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([4, 1, 3, 2]);
    const b = run([4, 1, 3, 2]);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run([3, 1, 2]);
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    // 向第 0 步（init）的队列里塞一个元素，不应影响第 1 步
    queueOf(steps[0]!).items.push({ id: 'queue:99', value: 999, state: 'done' });
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
    expect(single.steps.length).toBe(6); // init + enqueue-loop + enqueue + dequeue-loop + dequeue + end
  });

  it('结构快照存在、items 长度随 enqueue/dequeue 正确变化，且带固定容量', () => {
    const { steps } = run([3, 7, 2]);
    const enqueueSteps = steps.filter((s) => s.operation === 'enqueue');
    expect(enqueueSteps.map((s) => queueOf(s).items.length)).toEqual([1, 2, 3]);
    expect(enqueueSteps.every((s) => queueOf(s).capacity === 8)).toBe(true);
    // 入队后队首为第一个入队元素（idle），队尾为最后一个入队元素（active）
    const lastEnqueue = enqueueSteps[2]!;
    expect(queueOf(lastEnqueue).items[0]?.value).toBe(3);
    expect(queueOf(lastEnqueue).items[0]?.state).toBe('idle');
    expect(queueOf(lastEnqueue).items[2]?.value).toBe(2);
    expect(queueOf(lastEnqueue).items[2]?.state).toBe('active');

    const dequeueSteps = steps.filter((s) => s.operation === 'dequeue');
    expect(dequeueSteps.map((s) => queueOf(s).items.length)).toEqual([2, 1, 0]);
    // 出队后新队首为 7（active）
    const firstDequeue = dequeueSteps[0]!;
    expect(queueOf(firstDequeue).items[0]?.value).toBe(7);
    expect(queueOf(firstDequeue).items[0]?.state).toBe('active');
  });

  it('关键 codeLineId 都出现过', () => {
    const { steps } = run([3, 1, 2]);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(QUEUE_LINES.init);
    expect(ids).toContain(QUEUE_LINES.enqueueLoop);
    expect(ids).toContain(QUEUE_LINES.enqueue);
    expect(ids).toContain(QUEUE_LINES.dequeueLoop);
    expect(ids).toContain(QUEUE_LINES.dequeue);
    expect(ids[ids.length - 1]).toBe(QUEUE_LINES.end);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { queueDemoMeta } = await import('../../content/algorithms/queue-demo');
    const maps = queueDemoMeta.codeExamples;
    const { steps } = run([3, 2, 1]);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('统计累计正确：n 次 enqueue + n 次 dequeue', () => {
    const { summary } = run([3, 7, 2, 9, 5]);
    expect(summary.stats.accesses).toBe(10);
    expect(summary.stats.writes).toBe(10);
    expect(summary.stats.comparisons).toBe(0);
    expect(summary.stats.swaps).toBe(0);
  });

  it('变量 front/rear/size/capacity 正确更新', () => {
    const { steps } = run([3, 7]);
    expect(steps[0]?.variables).toMatchObject({ front: 0, rear: -1, size: 0, capacity: 8 });
    const enqueueStep = steps.find((s) => s.operation === 'enqueue' && queueOf(s).items.length === 2);
    expect(enqueueStep?.variables).toMatchObject({ front: 0, rear: 1, size: 2, capacity: 8 });
    const dequeueStep = steps.find((s) => s.operation === 'dequeue' && queueOf(s).items.length === 1);
    expect(dequeueStep?.variables).toMatchObject({ front: 1, rear: 1, size: 1, capacity: 8 });
  });
});
