import { describe, expect, it } from 'vitest';
import { runBellmanFord, BELLMAN_FORD_LINES } from './bellmanFord';
import type { EdgePair } from '../inputs/parsers';

const DEFAULT_EDGES: EdgePair[] = [
  [0, 1, true, 4],
  [0, 2, true, 5],
  [1, 2, true, -3],
  [2, 3, true, 4],
  [1, 3, true, 2],
];

const NEG_CYCLE_EDGES: EdgePair[] = [
  [0, 1, true, 1],
  [1, 2, true, -1],
  [2, 0, true, -1],
];

function run(edges: EdgePair[] = DEFAULT_EDGES, aux = 0) {
  return runBellmanFord({ kind: 'edge-list', value: { array: edges, aux } });
}

function graphOf(step: { structures: Array<{ kind: string }> }) {
  return step.structures.find((s) => s.kind === 'graph') as
    | { nodes: Array<{ label?: string; state: string }>; edges: Array<{ state?: string }> }
    | undefined;
}

describe('runBellmanFord', () => {
  it('默认图产生正确的最短距离（含负权边、无负环）', () => {
    const result = run();
    // 手算：d[0]=0, d[1]=4（仅 0→1 到达）, d[2]=1（0→1→2 = 4-3）, d[3]=5（0→1→2→3 = 4-3+4）
    expect(result.summary.result).toBe('d(0)=0, d(1)=4, d(2)=1, d(3)=5');
    const last = result.steps[result.steps.length - 1];
    expect(last?.output).toEqual(['d(0)=0', 'd(1)=4', 'd(2)=1', 'd(3)=5']);
  });

  it('最终节点 label 显示各节点最短距离', () => {
    const { steps } = run();
    const graph = graphOf(steps[steps.length - 1]!);
    expect(graph?.nodes.map((nd) => nd.label)).toEqual(['d=0', 'd=4', 'd=1', 'd=5']);
    expect(graph?.nodes.map((nd) => nd.state)).toEqual(['done', 'done', 'done', 'done']);
  });

  it('初始步骤：起点 d=0、其余 ∞，边 label 显示权重', () => {
    const { steps } = run();
    const initGraph = graphOf(steps[0]!);
    expect(initGraph?.nodes.map((nd) => nd.label)).toEqual(['d=0', '∞', '∞', '∞']);
    const edgeLabels = initGraph?.edges.map((e) => (e as { label?: string }).label);
    expect(edgeLabels).toEqual(['4', '5', '-3', '4', '2']);
  });

  it('负环图产生 invalid 检测步骤并报告负环', () => {
    const result = run(NEG_CYCLE_EDGES);
    expect(result.summary.result).toBe('negative cycle detected');
    expect(result.summary.resultValue).toBeNull();
    const detectStep = result.steps.find(
      (s) =>
        s.codeLineId === BELLMAN_FORD_LINES.checkCycle &&
        graphOf(s)?.edges.some((e) => e.state === 'invalid'),
    );
    expect(detectStep).toBeDefined();
    const graph = graphOf(detectStep!);
    expect(graph?.nodes.some((nd) => nd.state === 'invalid')).toBe(true);
  });

  it('单边与链式输入结果正确', () => {
    expect(run([[0, 1, true, 5]]).summary.result).toBe('d(0)=0, d(1)=5');
    expect(run([[0, 1, true, 2], [1, 2, true, 3], [2, 3, true, 4]]).summary.result).toBe(
      'd(0)=0, d(1)=2, d(2)=5, d(3)=9',
    );
  });

  it('无向边双向展开：负权无向边等价于负环', () => {
    // 无向边 0↔1（权重 -1）双向展开后构成负环
    const result = run([[0, 1, undefined, -1]]);
    expect(result.summary.result).toBe('negative cycle detected');
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    expect(run().steps).toEqual(run().steps);
    expect(run(NEG_CYCLE_EDGES).steps).toEqual(run(NEG_CYCLE_EDGES).steps);
  });

  it('默认输入步骤数规模为 37 步', () => {
    // init + func + 3 轮(round + 5 边×2 步) + 负环检测声明 + end = 2 + 3×11 + 1 + 1
    expect(run().summary.totalSteps).toBe(37);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run();
    const second = JSON.parse(JSON.stringify(steps[1]));
    (steps[0]!.structures[0] as { nodes: Array<{ state: string }> }).nodes[0]!.state = 'invalid';
    steps[0]!.output.push('999');
    expect(steps[1]).toEqual(second);
  });

  it('每一步都包含 graph 结构快照，且首步为 init', () => {
    const { steps } = run();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.structures.map((s) => s.kind)).toContain('graph');
    }
    expect(steps[0]?.codeLineId).toBe(BELLMAN_FORD_LINES.init);
  });

  it('关键 codeLineId 都出现（含负环分支）', () => {
    const ids = run().steps.map((s) => s.codeLineId);
    const cycleIds = run(NEG_CYCLE_EDGES).steps.map((s) => s.codeLineId);
    const all = [...ids, ...cycleIds];
    for (const id of Object.values(BELLMAN_FORD_LINES)) {
      expect(all).toContain(id);
    }
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { bellmanFordMeta } = await import('../../content/algorithms/bellman-ford');
    const maps = bellmanFordMeta.codeExamples;
    const { steps } = run();
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});
