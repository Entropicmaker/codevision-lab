import { describe, expect, it } from 'vitest';
import { runPrim, PRIM_LINES } from './prim';
import type { EdgePair } from '../inputs/parsers';

const DEFAULT_EDGES: EdgePair[] = [
  [0, 1, undefined, 2],
  [0, 3, undefined, 6],
  [1, 2, undefined, 3],
  [1, 3, undefined, 8],
  [1, 4, undefined, 5],
  [2, 4, undefined, 7],
  [3, 4, undefined, 9],
];

const TRIANGLE_EDGES: EdgePair[] = [
  [0, 1, undefined, 1],
  [1, 2, undefined, 1],
  [0, 2, undefined, 3],
];

function run(edges: EdgePair[] = DEFAULT_EDGES, aux = 0) {
  return runPrim({ kind: 'edge-list', value: { array: edges, aux } });
}

function nodeLabels(steps: ReturnType<typeof run>['steps'], stepIdx: number): Array<string | undefined> {
  const graph = steps[stepIdx]!.structures.find((s) => s.kind === 'graph');
  return (graph as { nodes: Array<{ label?: string }> }).nodes.map((nd) => nd.label);
}

function edgeStates(steps: ReturnType<typeof run>['steps'], stepIdx: number): Array<string | undefined> {
  const graph = steps[stepIdx]!.structures.find((s) => s.kind === 'graph');
  return (graph as { edges: Array<{ state?: string }> }).edges.map((e) => e.state);
}

describe('runPrim', () => {
  it('默认图起点 0 的 MST 总权为 16', () => {
    const { steps, summary } = run();
    const last = steps[steps.length - 1]!;
    expect(summary.resultValue).toBe(16);
    expect(last.variables.totalWeight).toBe(16);
    expect(last.variables.inTreeCount).toBe(5);
    // 最终每个节点的 key 均已确定
    expect(nodeLabels(steps, steps.length - 1)).toEqual(['key=0', 'key=2', 'key=3', 'key=6', 'key=5']);
    // 所有节点均入树（done）
    const graph = last.structures.find((s) => s.kind === 'graph') as {
      nodes: Array<{ state: string }>;
    };
    expect(graph.nodes.map((nd) => nd.state)).toEqual(['done', 'done', 'done', 'done', 'done']);
  });

  it('默认图恰好选中 4 条树边并标 done（其余边保持 idle）', () => {
    const { steps } = run();
    const states = edgeStates(steps, steps.length - 1);
    // 输入顺序：0-1, 0-3, 1-2, 1-3, 1-4, 2-4, 3-4；MST 边为 0-1、0-3、1-2、1-4
    expect(states.filter((s) => s === 'done')).toHaveLength(4);
    expect(states.filter((s) => s === 'idle')).toHaveLength(3);
  });

  it('三角形图：总权 2，重边 0-2 不被选入', () => {
    const { steps, summary } = run(TRIANGLE_EDGES);
    expect(summary.resultValue).toBe(2);
    const states = edgeStates(steps, steps.length - 1);
    // 输入顺序：0-1(1), 1-2(1), 0-2(3)；MST 边为 0-1、1-2
    expect(states.filter((s) => s === 'done')).toHaveLength(2);
    expect(states[2]).toBe('idle'); // 0-2 未选入
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    expect(run().steps).toEqual(run().steps);
  });

  it('默认输入步骤数规模为 31 步', () => {
    expect(run().summary.totalSteps).toBe(31);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run();
    const second = JSON.parse(JSON.stringify(steps[1]!));
    (steps[0]!.structures[0] as { nodes: Array<{ state: string }> }).nodes[0]!.state = 'invalid';
    steps[0]!.output.push('999');
    expect(steps[1]).toEqual(second);
  });

  it('每一步都包含 graph 结构快照', () => {
    const { steps } = run();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.structures.some((s) => s.kind === 'graph')).toBe(true);
    }
  });

  it('节点 key 随扩张更新（节点 1: ∞→2，节点 3: ∞→6→8 不更新保持 6）', () => {
    const { steps } = run();
    const labelsOf = (i: number): Array<string | undefined> =>
      steps.map((s) => {
        const g = s.structures.find((x) => x.kind === 'graph');
        return (g as { nodes: Array<{ label?: string }> }).nodes[i]!.label;
      });
    expect(labelsOf(1)).toContain('key=∞');
    expect(labelsOf(1)).toContain('key=2');
    expect(labelsOf(1)[labelsOf(1).length - 1]).toBe('key=2');
    expect(labelsOf(3)).toContain('key=∞');
    expect(labelsOf(3)).toContain('key=6');
    expect(labelsOf(3)[labelsOf(3).length - 1]).toBe('key=6');
    // 1-3 权重 8 不更新 key[3]（保持 6）
    expect(labelsOf(3)).not.toContain('key=8');
  });

  it('关键 codeLineId 都出现，且首步为 init', () => {
    const ids = run().steps.map((s) => s.codeLineId);
    for (const id of Object.values(PRIM_LINES)) {
      expect(ids).toContain(id);
    }
    expect(run().steps[0]!.codeLineId).toBe(PRIM_LINES.init);
  });

  it('存在 select-min / visit / update / tree-edge 操作，u 最终为最后一个节点', () => {
    const { steps } = run();
    const ops = steps.map((s) => s.operation);
    expect(ops).toContain('compare');
    expect(ops).toContain('visit');
    expect(ops).toContain('assign');
    const last = steps[steps.length - 1]!;
    expect(last.variables.u).toBe(3); // 默认图最后一个入树的是节点 3
    expect(last.variables.inTreeCount).toBe(5);
  });

  it('起点越界产生显式错误步骤', () => {
    const result = run(DEFAULT_EDGES, 99);
    expect(result.summary.result).toBe('input error');
    expect(result.steps[result.steps.length - 1]!.explanation.zh).toContain('不在节点范围');
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { primMeta } = await import('../../content/algorithms/prim');
    const maps = primMeta.codeExamples;
    const { steps } = run();
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('三语言 + 伪代码 codeLineId 集合完全一致', async () => {
    const { primMeta } = await import('../../content/algorithms/prim');
    const { extractLineMap, extractPseudocodeLines } = await import('../codeMap/extract');
    const srcIds = Object.keys(extractLineMap(primMeta.codeExamples.cpp.source)).sort();
    expect(Object.keys(primMeta.codeExamples.csharp.lineMap).sort()).toEqual(srcIds);
    expect(Object.keys(primMeta.codeExamples.python.lineMap).sort()).toEqual(srcIds);
    const pseudoIds = extractPseudocodeLines(primMeta.pseudocode)
      .map((l) => l.codeLineId)
      .filter((id): id is string => id !== null)
      .sort();
    expect(pseudoIds).toEqual(srcIds);
  });
});
