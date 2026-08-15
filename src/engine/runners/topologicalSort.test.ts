import { describe, expect, it } from 'vitest';
import { runTopologicalSort, TOPO_LINES } from './topologicalSort';
import type { EdgePair } from '../inputs/parsers';

const DEFAULT_EDGES: EdgePair[] = [
  [0, 1, true],
  [0, 2, true],
  [1, 3, true],
  [2, 3, true],
  [3, 4, true],
];

const CYCLE_EDGES: EdgePair[] = [
  [0, 1, true],
  [1, 2, true],
  [2, 0, true],
];

function run(edges: EdgePair[] = DEFAULT_EDGES) {
  return runTopologicalSort({ kind: 'edge-list', value: edges });
}

describe('runTopologicalSort', () => {
  it('默认输入产生合法拓扑序（每条有向边 from 在 to 之前）', () => {
    const result = run();
    const order = result.summary.result.split(', ').map(Number);
    const pos = new Map(order.map((n, i) => [n, i]));
    for (const [a, b] of DEFAULT_EDGES) {
      expect(pos.get(a)!).toBeLessThan(pos.get(b)!);
    }
    expect(result.summary.result).toBe('0, 1, 2, 3, 4');
  });

  it('含环输入产生环检测步骤并标记 invalid 节点', () => {
    const result = run(CYCLE_EDGES);
    expect(result.summary.result).toBe('cycle detected');
    const detectStep = result.steps.find((s) => s.codeLineId === TOPO_LINES.detectCycle);
    expect(detectStep).toBeDefined();
    const graph = detectStep?.structures.find((s) => s.kind === 'graph');
    const states = (graph as { nodes: Array<{ state: string }> }).nodes.map((nd) => nd.state);
    expect(states).toEqual(['invalid', 'invalid', 'invalid']);
  });

  it('链式与两节点输入输出正确', () => {
    expect(run([[0, 1, true], [1, 2, true]]).summary.result).toBe('0, 1, 2');
    expect(run([[0, 1, true]]).summary.result).toBe('0, 1');
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    expect(run().steps).toEqual(run().steps);
  });

  it('默认输入步骤数规模为 19 步', () => {
    expect(run().summary.totalSteps).toBe(19);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run();
    const second = JSON.parse(JSON.stringify(steps[1]));
    (steps[0]!.structures[0] as { nodes: Array<{ state: string }> }).nodes[0]!.state = 'invalid';
    steps[0]!.output.push('999');
    expect(steps[1]).toEqual(second);
  });

  it('每一步都包含 graph 与 queue 两个结构快照', () => {
    const { steps } = run();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      const kinds = step.structures.map((s) => s.kind);
      expect(kinds).toContain('graph');
      expect(kinds).toContain('queue');
    }
  });

  it('入度 label 正确：初始 in 值，最终全部归零', () => {
    const { steps } = run();
    const initGraph = steps[0]!.structures.find((s) => s.kind === 'graph') as {
      nodes: Array<{ label?: string }>;
    };
    expect(initGraph.nodes.map((nd) => nd.label)).toEqual([
      'in=0',
      'in=1',
      'in=1',
      'in=2',
      'in=1',
    ]);
    const lastGraph = steps[steps.length - 1]!.structures.find((s) => s.kind === 'graph') as {
      nodes: Array<{ label?: string }>;
    };
    expect(lastGraph.nodes.map((nd) => nd.label)).toEqual([
      'in=0',
      'in=0',
      'in=0',
      'in=0',
      'in=0',
    ]);
  });

  it('关键 codeLineId 都出现（含环分支），且首步为 init', () => {
    const dagIds = run().steps.map((s) => s.codeLineId);
    const cycleIds = run(CYCLE_EDGES).steps.map((s) => s.codeLineId);
    const all = [...dagIds, ...cycleIds];
    for (const id of Object.values(TOPO_LINES)) {
      expect(all).toContain(id);
    }
    expect(dagIds[0]).toBe(TOPO_LINES.init);
  });

  it('enqueue/dequeue 操作出现，visitedCount 最终等于节点数，accesses 等于边数', () => {
    const { steps, summary } = run();
    const ops = steps.map((s) => s.operation);
    expect(ops).toContain('enqueue');
    expect(ops).toContain('dequeue');
    const last = steps[steps.length - 1];
    expect(last?.variables.visitedCount).toBe(5);
    expect(last?.variables.queueSize).toBe(0);
    expect(summary.stats.accesses).toBe(5);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { topologicalSortMeta } = await import('../../content/algorithms/topological-sort');
    const maps = topologicalSortMeta.codeExamples;
    const { steps } = run();
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});
