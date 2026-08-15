import { describe, expect, it } from 'vitest';
import { runKruskal, KRUSKAL_LINES } from './kruskal';
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

function run(edges: EdgePair[] = DEFAULT_EDGES) {
  return runKruskal({ kind: 'edge-list', value: edges });
}

function nodeLabels(steps: ReturnType<typeof run>['steps'], stepIdx: number): Array<string | undefined> {
  const graph = steps[stepIdx]!.structures.find((s) => s.kind === 'graph');
  return (graph as { nodes: Array<{ label?: string }> }).nodes.map((nd) => nd.label);
}

function edgeStates(steps: ReturnType<typeof run>['steps'], stepIdx: number): Array<string | undefined> {
  const graph = steps[stepIdx]!.structures.find((s) => s.kind === 'graph');
  return (graph as { edges: Array<{ state?: string }> }).edges.map((e) => e.state);
}

describe('runKruskal', () => {
  it('默认图 MST 总权为 16', () => {
    const { steps, summary } = run();
    const last = steps[steps.length - 1]!;
    expect(summary.resultValue).toBe(16);
    expect(last.variables.totalWeight).toBe(16);
    expect(last.variables.edgeCount).toBe(4);
    expect(last.variables.sets).toBe(1);
    // 最终所有节点归入同一个集合（单一 set）
    const finalLabels = nodeLabels(steps, steps.length - 1);
    expect(new Set(finalLabels).size).toBe(1);
  });

  it('默认图选中 4 条树边（done）、跳过 3 条成环边（invalid）', () => {
    const { steps } = run();
    const states = edgeStates(steps, steps.length - 1);
    expect(states.filter((s) => s === 'done')).toHaveLength(4);
    expect(states.filter((s) => s === 'invalid')).toHaveLength(3);
    expect(states.filter((s) => s === 'idle')).toHaveLength(0);
  });

  it('三角形图：总权 2，边 0-2 因成环被跳过（invalid）', () => {
    const { steps, summary } = run(TRIANGLE_EDGES);
    expect(summary.resultValue).toBe(2);
    const states = edgeStates(steps, steps.length - 1);
    // 输入顺序：0-1(1), 1-2(1), 0-2(3)；0-1、1-2 选入，0-2 成环跳过
    expect(states[0]).toBe('done');
    expect(states[1]).toBe('done');
    expect(states[2]).toBe('invalid');
    // 存在 skip 步骤且说明提到"成环"
    const skipSteps = steps.filter((s) => s.codeLineId === KRUSKAL_LINES.skip);
    expect(skipSteps.length).toBe(1);
    expect(skipSteps[0]!.explanation.zh).toContain('成环');
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    expect(run().steps).toEqual(run().steps);
  });

  it('默认输入步骤数规模为 29 步', () => {
    expect(run().summary.totalSteps).toBe(29);
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

  it('节点集合 label 随 union 合并（最终 set 数量从 5 降到 1）', () => {
    const { steps } = run();
    const setCounts = steps.map((s) => s.variables.sets);
    expect(setCounts[0]).toBe(5); // init 时 5 个集合
    expect(setCounts[setCounts.length - 1]).toBe(1);
    // 存在 label 从 set:<自身> 变为统一根的过程
    expect(nodeLabels(steps, 0)).toEqual(['set:0', 'set:1', 'set:2', 'set:3', 'set:4']);
  });

  it('关键 codeLineId 都出现，且首步为 init', () => {
    const ids = run().steps.map((s) => s.codeLineId);
    for (const id of Object.values(KRUSKAL_LINES)) {
      expect(ids).toContain(id);
    }
    expect(run().steps[0]!.codeLineId).toBe(KRUSKAL_LINES.init);
  });

  it('按权重升序处理：sort 步骤说明包含正确顺序', () => {
    const { steps } = run();
    const sortStep = steps.find((s) => s.codeLineId === KRUSKAL_LINES.sort);
    expect(sortStep).toBeDefined();
    expect(sortStep!.explanation.zh).toContain('0-1(2)');
    expect(sortStep!.explanation.zh).toContain('3-4(9)');
    // 最轻的边 0-1 排在最前
    expect(sortStep!.explanation.zh.indexOf('0-1(2)')).toBeLessThan(
      sortStep!.explanation.zh.indexOf('1-2(3)'),
    );
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { kruskalMeta } = await import('../../content/algorithms/kruskal');
    const maps = kruskalMeta.codeExamples;
    const { steps } = run();
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('三语言 + 伪代码 codeLineId 集合完全一致', async () => {
    const { kruskalMeta } = await import('../../content/algorithms/kruskal');
    const { extractLineMap, extractPseudocodeLines } = await import('../codeMap/extract');
    const srcIds = Object.keys(extractLineMap(kruskalMeta.codeExamples.cpp.source)).sort();
    expect(Object.keys(kruskalMeta.codeExamples.csharp.lineMap).sort()).toEqual(srcIds);
    expect(Object.keys(kruskalMeta.codeExamples.python.lineMap).sort()).toEqual(srcIds);
    const pseudoIds = extractPseudocodeLines(kruskalMeta.pseudocode)
      .map((l) => l.codeLineId)
      .filter((id): id is string => id !== null)
      .sort();
    expect(pseudoIds).toEqual(srcIds);
  });
});
