import { describe, expect, it } from 'vitest';
import { runLinkedListOps, LINKED_LIST_LINES } from './linkedListOps';
import type { AlgorithmStep } from '../types/step';

function run(array: number[], aux?: number) {
  return runLinkedListOps({ kind: 'int-array', value: { array, aux } });
}

function lastStructure(step: AlgorithmStep) {
  return step.structures.find((s) => s.kind === 'linked-list');
}

/** 最终快照中链序（非 detached）的值 */
function finalChain(result: ReturnType<typeof run>): (number | string | boolean | null)[] {
  const last = result.steps[result.steps.length - 1]!;
  const struct = lastStructure(last);
  if (!struct || struct.kind !== 'linked-list') return [];
  return struct.items.filter((el) => el.label !== 'detached').map((el) => el.value);
}

/** 最终快照中游离区（detached）的值 */
function finalDetached(result: ReturnType<typeof run>): (number | string | boolean | null)[] {
  const last = result.steps[result.steps.length - 1]!;
  const struct = lastStructure(last);
  if (!struct || struct.kind !== 'linked-list') return [];
  return struct.items.filter((el) => el.label === 'detached').map((el) => el.value);
}

describe('runLinkedListOps', () => {
  it('默认输入（aux=2）：构建后插入 99 到第 2 位，再删除头节点之后的第 1 个节点（即刚插入的 99）', () => {
    const result = run([3, 7, 2, 9], 2);
    expect(finalChain(result)).toEqual([3, 7, 2, 9]);
    expect(finalDetached(result)).toEqual([99]);
    expect(result.summary.result).toBe('3, 7, 2, 9');
  });

  it('aux=1：99 插入到头部成为新头，删除原头节点之后的第 1 个节点（原第 1 个节点）', () => {
    const result = run([3, 7, 2, 9], 1);
    expect(finalChain(result)).toEqual([99, 7, 2, 9]);
    expect(finalDetached(result)).toEqual([3]);
  });

  it('aux=4：99 插入到第 4 位，删除第 2 个节点（原 7）', () => {
    const result = run([3, 7, 2, 9], 4);
    expect(finalChain(result)).toEqual([3, 2, 99, 9]);
    expect(finalDetached(result)).toEqual([7]);
  });

  it('无 aux（或 aux=0）：只做构建 + 遍历，不插入不删除', () => {
    const noAux = run([3, 7, 2, 9]);
    expect(finalChain(noAux)).toEqual([3, 7, 2, 9]);
    expect(finalDetached(noAux)).toEqual([]);

    const zeroAux = run([3, 7, 2, 9], 0);
    expect(finalChain(zeroAux)).toEqual([3, 7, 2, 9]);
    const ids = zeroAux.steps.map((s) => s.codeLineId);
    expect(ids).not.toContain(LINKED_LIST_LINES.insert);
    expect(ids).not.toContain(LINKED_LIST_LINES.delete);
  });

  it('单节点链表（aux=1）：插入 99 成为新头，删除原唯一节点', () => {
    const result = run([7], 1);
    expect(finalChain(result)).toEqual([99]);
    expect(finalDetached(result)).toEqual([7]);
  });

  it('空数组：仅初始化与结束步骤，结果为空', () => {
    const result = run([], 2);
    expect(result.summary.result).toBe('empty');
    expect(result.steps.length).toBe(3); // func / init / end
  });

  it('遍历阶段输出访问序列', () => {
    const { steps } = run([3, 7, 2, 9]);
    const visitSteps = steps.filter((s) => s.codeLineId === LINKED_LIST_LINES.visit);
    expect(visitSteps.map((s) => s.output.join(', '))).toEqual(['3', '3, 7', '3, 7, 2', '3, 7, 2, 9']);
    expect(visitSteps[0]!.operation).toBe('visit');
  });

  it('步骤统计只增不减：默认输入 writes = 构建 4 + 插入 1 + 删除 1 = 6，accesses = 4', () => {
    const { steps, summary } = run([3, 7, 2, 9], 2);
    expect(summary.stats.writes).toBe(6);
    expect(summary.stats.accesses).toBe(4);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!.stats.writes).toBeGreaterThanOrEqual(steps[i - 1]!.stats.writes);
      expect(steps[i]!.stats.accesses).toBeGreaterThanOrEqual(steps[i - 1]!.stats.accesses);
    }
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([5, 1, 8], 2);
    const b = run([5, 1, 8], 2);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run([3, 1, 2], 2);
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    const firstStruct = steps[0]!.structures[0];
    if (firstStruct && firstStruct.kind === 'linked-list' && firstStruct.items[0]) {
      firstStruct.items[0]!.value = 999;
    }
    expect(steps[1]).toEqual(snapshot);
  });

  it('关键逻辑行都出现过', () => {
    const { steps } = run([3, 7, 2, 9], 2);
    const ids = steps.map((s) => s.codeLineId);
    for (const id of Object.values(LINKED_LIST_LINES)) {
      expect(ids, `缺少 codeLineId "${id}"`).toContain(id);
    }
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { linkedListOpsMeta } = await import('../../content/algorithms/linked-list-ops');
    const maps = linkedListOpsMeta.codeExamples;
    const { steps } = run([3, 1, 2], 2);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('删除步骤后目标节点从链序移入游离区', () => {
    const { steps } = run([3, 7, 2, 9], 2);
    const deleteStep = steps.find((s) => s.codeLineId === LINKED_LIST_LINES.delete)!;
    const struct = lastStructure(deleteStep);
    if (!struct || struct.kind !== 'linked-list') throw new Error('no structure');
    const chained = struct.items.filter((el) => el.label !== 'detached').map((el) => el.value);
    const detached = struct.items.filter((el) => el.label === 'detached').map((el) => el.value);
    expect(chained).toEqual([3, 7, 2, 9]);
    expect(detached).toEqual([99]);
  });
});
