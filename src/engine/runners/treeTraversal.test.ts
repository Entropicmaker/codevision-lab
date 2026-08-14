import { describe, expect, it } from 'vitest';
import { runTreeTraversal, TREE_TRAVERSAL_LINES } from './treeTraversal';
import type { AlgorithmStep } from '../types/step';

function run(array: (number | null)[], aux?: number) {
  return runTreeTraversal({ kind: 'tree-array', value: { array, aux } });
}

/** 最后一步（finalize）的输出序列 */
function finalOutput(result: ReturnType<typeof run>): string[] {
  return result.steps[result.steps.length - 1]!.output;
}

/** 某一步的 callStack 帧深度列表（按栈底到栈顶） */
function depthsOf(step: AlgorithmStep): number[] {
  return step.callStack.map((f) => f.depth);
}

describe('runTreeTraversal', () => {
  it('前序（aux=1）遍历满二叉树输出正确', () => {
    const result = run([1, 2, 3, 4, 5, 6, 7], 1);
    expect(finalOutput(result)).toEqual(['1', '2', '4', '5', '3', '6', '7']);
    expect(result.summary.result).toBe('1, 2, 4, 5, 3, 6, 7');
  });

  it('中序（aux=2）遍历满二叉树输出正确', () => {
    const result = run([1, 2, 3, 4, 5, 6, 7], 2);
    expect(finalOutput(result)).toEqual(['4', '2', '5', '1', '6', '3', '7']);
  });

  it('后序（aux=3）遍历满二叉树输出正确', () => {
    const result = run([1, 2, 3, 4, 5, 6, 7], 3);
    expect(finalOutput(result)).toEqual(['4', '5', '2', '6', '7', '3', '1']);
  });

  it('左斜树（1, 2, null, 3）三种遍历输出正确', () => {
    // 结构：1 → 左孩子 2 → 左孩子 3（每个节点只有左孩子）
    expect(finalOutput(run([1, 2, null, 3], 1))).toEqual(['1', '2', '3']);
    expect(finalOutput(run([1, 2, null, 3], 2))).toEqual(['3', '2', '1']);
    expect(finalOutput(run([1, 2, null, 3], 3))).toEqual(['3', '2', '1']);
  });

  it('单节点树三种遍历输出一致', () => {
    expect(finalOutput(run([7], 1))).toEqual(['7']);
    expect(finalOutput(run([7], 2))).toEqual(['7']);
    expect(finalOutput(run([7], 3))).toEqual(['7']);
  });

  it('缺省 aux 默认为前序', () => {
    const noAux = run([1, 2, 3]);
    const aux1 = run([1, 2, 3], 1);
    expect(noAux.steps).toEqual(aux1.steps);
    expect(finalOutput(noAux)).toEqual(['1', '2', '3']);
  });

  it('callStack 快照存在：根帧深度为 1，左斜树最大深度为 3', () => {
    const result = run([1, 2, null, 3], 1);
    const rootPush = result.steps.find((s) => s.codeLineId === TREE_TRAVERSAL_LINES.func)!;
    expect(rootPush.callStack).toHaveLength(1);
    expect(rootPush.callStack[0]!.depth).toBe(1);
    expect(rootPush.callStack[0]!.function).toBe('preorder');
    expect(rootPush.callStack[0]!.args).toEqual({ node: 'n:0' });

    // 左斜树 1→2→3：存在深度 3 的帧
    const maxDepth = Math.max(...result.steps.map((s) => Math.max(0, ...depthsOf(s))));
    expect(maxDepth).toBe(3);
  });

  it('callStack 随 push/pop 单调变化且最终为空', () => {
    const { steps } = run([1, 2, 3, 4, 5, 6, 7], 1);
    const sizes = steps.map((s) => s.callStack.length);
    expect(sizes[0]).toBe(0); // init 步骤栈为空
    expect(steps[steps.length - 1]!.callStack).toHaveLength(0); // 结束步骤栈为空
    // 栈大小在过程中出现过 1..3
    expect(sizes).toContain(1);
    expect(sizes).toContain(2);
    expect(sizes).toContain(3);
  });

  it('遍历边：进入左子树时边 active，返回后变 done', () => {
    const { steps } = run([1, 2, 3], 1);
    const leftPush = steps.find((s) => s.codeLineId === TREE_TRAVERSAL_LINES.left)!;
    const tree = leftPush.structures.find((s) => s.kind === 'tree');
    if (!tree || tree.kind !== 'tree') throw new Error('no tree');
    const edge = tree.edges.find((e) => e.from === 'n:0' && e.to === 'n:1');
    expect(edge?.state).toBe('active');
    // 结束时全部 done
    const last = steps[steps.length - 1]!;
    const lastTree = last.structures.find((s) => s.kind === 'tree');
    if (!lastTree || lastTree.kind !== 'tree') throw new Error('no tree');
    expect(lastTree.edges.every((e) => e.state === 'done')).toBe(true);
  });

  it('步骤统计只增不减：accesses = 节点数', () => {
    const { steps, summary } = run([1, 2, 3, 4, 5, 6, 7], 1);
    expect(summary.stats.accesses).toBe(7);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!.stats.accesses).toBeGreaterThanOrEqual(steps[i - 1]!.stats.accesses);
    }
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([1, 2, null, 3], 2);
    const b = run([1, 2, null, 3], 2);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run([1, 2, 3], 1);
    const snapshot = JSON.parse(JSON.stringify(steps[1]));
    const firstStruct = steps[0]!.structures[0];
    if (firstStruct && firstStruct.kind === 'tree' && firstStruct.nodes[0]) {
      firstStruct.nodes[0]!.value = 999;
    }
    expect(steps[1]).toEqual(snapshot);
  });

  it('关键逻辑行都出现过', () => {
    const { steps } = run([1, 2, 3, 4], 2);
    const ids = steps.map((s) => s.codeLineId);
    for (const id of Object.values(TREE_TRAVERSAL_LINES)) {
      expect(ids, `缺少 codeLineId "${id}"`).toContain(id);
    }
  });

  it('push 帧步骤操作类型为 push，pop 步骤为 return', () => {
    const { steps } = run([1, 2, 3], 1);
    const pushSteps = steps.filter((s) => s.codeLineId === TREE_TRAVERSAL_LINES.left || s.codeLineId === TREE_TRAVERSAL_LINES.right);
    expect(pushSteps.length).toBeGreaterThan(0);
    expect(pushSteps.every((s) => s.operation === 'push')).toBe(true);
    const popSteps = steps.filter((s) => s.codeLineId === TREE_TRAVERSAL_LINES.end && s.operation === 'return');
    expect(popSteps.length).toBe(3); // 3 个节点各 pop 一次
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { treeTraversalMeta } = await import('../../content/algorithms/tree-traversal');
    const maps = treeTraversalMeta.codeExamples;
    const { steps } = run([1, 2, null, 3], 3);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});
