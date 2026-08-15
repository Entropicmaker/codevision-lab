import { describe, expect, it } from 'vitest';
import { runDijkstra, DIJKSTRA_LINES } from './dijkstra';
import type { EdgePair } from '../inputs/parsers';

const DEFAULT_EDGES: EdgePair[] = [
  [0, 1, true, 4],
  [0, 2, true, 1],
  [1, 3, true, 1],
  [2, 1, true, 2],
  [2, 3, true, 5],
];

const UNDIRECTED_EDGES: EdgePair[] = [
  [0, 1, undefined, 4],
  [0, 2, undefined, 1],
  [1, 3, undefined, 1],
  [2, 1, undefined, 2],
  [2, 3, undefined, 5],
];

// 含冗余边：2->1 无法改进 dist[1]，触发"不满足松弛条件，跳过"（codeLineId=relax）
const REDUNDANT_EDGES: EdgePair[] = [
  [0, 1, true, 2],
  [0, 2, true, 1],
  [2, 1, true, 3],
];

function run(edges: EdgePair[] = DEFAULT_EDGES, aux = 0) {
  return runDijkstra({ kind: 'edge-list', value: { array: edges, aux } });
}

function nodeLabels(steps: ReturnType<typeof run>['steps'], stepIdx: number): Array<string | undefined> {
  const graph = steps[stepIdx]!.structures.find((s) => s.kind === 'graph');
  return (graph as { nodes: Array<{ label?: string }> }).nodes.map((nd) => nd.label);
}

describe('runDijkstra', () => {
  it('默认图起点 0 的最短距离正确：d[0]=0, d[1]=3, d[2]=1, d[3]=4', () => {
    const { steps, summary } = run();
    const last = steps[steps.length - 1]!;
    expect(nodeLabels(steps, steps.length - 1)).toEqual(['d=0', 'd=3', 'd=1', 'd=4']);
    expect(summary.result).toBe('0, 3, 1, 4');
    // 最终所有可达节点均标记为 done
    const graph = last.structures.find((s) => s.kind === 'graph') as {
      nodes: Array<{ state: string }>;
    };
    expect(graph.nodes.map((nd) => nd.state)).toEqual(['done', 'done', 'done', 'done']);
  });

  it('无向边双向展开后距离同样正确', () => {
    const { steps, summary } = run(UNDIRECTED_EDGES);
    expect(nodeLabels(steps, steps.length - 1)).toEqual(['d=0', 'd=3', 'd=1', 'd=4']);
    expect(summary.result).toBe('0, 3, 1, 4');
    // 无向边展开为双向有向边：默认 5 条无向边 → 10 条有向边
    const graph = steps[0]!.structures.find((s) => s.kind === 'graph') as {
      edges: Array<{ directed?: boolean }>;
    };
    expect(graph.edges).toHaveLength(10);
    expect(graph.edges.every((e) => e.directed === true)).toBe(true);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    expect(run().steps).toEqual(run().steps);
  });

  it('默认输入步骤数规模为 16 步', () => {
    expect(run().summary.totalSteps).toBe(16);
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

  it('节点 label 距离随松弛更新（节点 1: ∞→d=4→d=3，节点 3: ∞→d=6→d=4）', () => {
    const { steps } = run();
    const labelsOf = (i: number): Array<string | undefined> =>
      steps.map((s) => {
        const g = s.structures.find((x) => x.kind === 'graph');
        return (g as { nodes: Array<{ label?: string }> }).nodes[i]!.label;
      });
    expect(labelsOf(1)).toContain('∞');
    expect(labelsOf(1)).toContain('d=4');
    expect(labelsOf(1)).toContain('d=3');
    expect(labelsOf(1)[labelsOf(1).length - 1]).toBe('d=3');
    expect(labelsOf(3)).toContain('∞');
    expect(labelsOf(3)).toContain('d=6');
    expect(labelsOf(3)).toContain('d=4');
    expect(labelsOf(3)[labelsOf(3).length - 1]).toBe('d=4');
  });

  it('已确定（done）节点的距离在后续步骤中不再改变', () => {
    const { steps } = run();
    for (let i = 0; i < 4; i += 1) {
      const states = steps.map((s) => {
        const g = s.structures.find((x) => x.kind === 'graph');
        return (g as { nodes: Array<{ label?: string; state: string }> }).nodes[i]!;
      });
      const doneIdx = states.findIndex((nd) => nd.state === 'done');
      expect(doneIdx).toBeGreaterThanOrEqual(0);
      const finalized = states[doneIdx]!.label;
      for (let k = doneIdx + 1; k < states.length; k += 1) {
        expect(states[k]!.label, `节点 ${i} 在确定后距离被修改`).toBe(finalized);
      }
    }
  });

  it('关键 codeLineId 都出现，且首步为 init', () => {
    // 默认图覆盖 select-min/visit/update；冗余边图额外覆盖 relax（跳过分支）
    const ids = [...run().steps, ...run(REDUNDANT_EDGES).steps].map((s) => s.codeLineId);
    for (const id of Object.values(DIJKSTRA_LINES)) {
      expect(ids).toContain(id);
    }
    expect(run().steps[0]!.codeLineId).toBe(DIJKSTRA_LINES.init);
  });

  it('冗余边不满足松弛条件时跳过（codeLineId=relax），距离不变', () => {
    const { steps } = run(REDUNDANT_EDGES);
    const relaxSteps = steps.filter((s) => s.codeLineId === DIJKSTRA_LINES.relax);
    expect(relaxSteps.length).toBeGreaterThan(0);
    expect(relaxSteps[0]!.explanation.zh).toContain('不满足松弛条件');
    expect(nodeLabels(steps, steps.length - 1)).toEqual(['d=0', 'd=2', 'd=1']);
  });

  it('存在 visit 与 assign 操作，visitedCount 最终等于节点数', () => {
    const { steps } = run();
    const ops = steps.map((s) => s.operation);
    expect(ops).toContain('visit');
    expect(ops).toContain('assign');
    const last = steps[steps.length - 1]!;
    expect(last.variables.visitedCount).toBe(4);
    expect(last.variables.u).toBe(3);
  });

  it('不可达节点保持 ∞（label 与 summary）', () => {
    const { steps, summary } = run([[0, 1, true, 2], [2, 3, true, 1]], 0);
    expect(nodeLabels(steps, steps.length - 1)).toEqual(['d=0', 'd=2', '∞', '∞']);
    expect(summary.result).toBe('0, 2, ∞, ∞');
  });

  it('起点越界产生显式错误步骤', () => {
    const result = run(DEFAULT_EDGES, 99);
    expect(result.summary.result).toBe('input error');
    expect(result.steps[result.steps.length - 1]!.explanation.zh).toContain('不在节点范围');
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { dijkstraMeta } = await import('../../content/algorithms/dijkstra');
    const maps = dijkstraMeta.codeExamples;
    const { steps } = run();
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });

  it('三语言 + 伪代码 codeLineId 集合完全一致', async () => {
    const { dijkstraMeta } = await import('../../content/algorithms/dijkstra');
    const { extractLineMap } = await import('../codeMap/extract');
    const { extractPseudocodeLines } = await import('../codeMap/extract');
    const srcIds = Object.keys(extractLineMap(dijkstraMeta.codeExamples.cpp.source)).sort();
    expect(Object.keys(dijkstraMeta.codeExamples.csharp.lineMap).sort()).toEqual(srcIds);
    expect(Object.keys(dijkstraMeta.codeExamples.python.lineMap).sort()).toEqual(srcIds);
    const pseudoIds = extractPseudocodeLines(dijkstraMeta.pseudocode)
      .map((l) => l.codeLineId)
      .filter((id): id is string => id !== null)
      .sort();
    expect(pseudoIds).toEqual(srcIds);
  });
});
