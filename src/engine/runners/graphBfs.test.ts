import { describe, expect, it } from 'vitest';
import { runGraphBfs, BFS_LINES } from './graphBfs';
import { extractLineMap } from '../codeMap/extract';

type EdgePair = [number, number];

const DEFAULT_EDGES: EdgePair[] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 5],
];

function run(edges: EdgePair[] = DEFAULT_EDGES, aux = 0) {
  return runGraphBfs({ kind: 'edge-list', value: { array: edges, aux } });
}

describe('runGraphBfs', () => {
  it('默认图产生正确的 BFS 访问序列', () => {
    const result = run();
    // 逐层扩散：0 → 1,2 → 3,4 → 5
    expect(result.summary.result).toBe('0, 1, 2, 3, 4, 5');
    const last = result.steps[result.steps.length - 1];
    expect(last?.output).toEqual(['0', '1', '2', '3', '4', '5']);
  });

  it('BFS 距离正确：节点 label 显示 d 值', () => {
    const { steps } = run();
    const last = steps[steps.length - 1];
    const graph = last?.structures.find((s) => s.kind === 'graph');
    const labels = graph?.nodes.map((nd) => nd.label);
    // dist: 0:0, 1:1, 2:1, 3:2, 4:2, 5:3
    expect(labels).toEqual(['d=0', 'd=1', 'd=1', 'd=2', 'd=2', 'd=3']);
  });

  it('两节点一条边、星形图、含环图访问序列与距离正确', () => {
    const two = run([[0, 1]]);
    expect(two.summary.result).toBe('0, 1');
    const star = run([[0, 1], [0, 2], [0, 3]]);
    expect(star.summary.result).toBe('0, 1, 2, 3');
    const cycle = run([[0, 1], [1, 2], [2, 0]]);
    expect(cycle.summary.result).toBe('0, 1, 2');
    const cycleGraph = cycle.steps[cycle.steps.length - 1]?.structures.find((s) => s.kind === 'graph');
    expect(cycleGraph?.nodes.map((nd) => nd.label)).toEqual(['d=0', 'd=1', 'd=1']);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    expect(run().steps).toEqual(run().steps);
  });

  it('默认输入步骤数规模：init+func+入队起点+6次出队/访问+17次边检查+end = 33 步', () => {
    const { summary } = run();
    expect(summary.totalSteps).toBe(33);
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

  it('关键 codeLineId 都出现过，且首步为 init', () => {
    const ids = run().steps.map((s) => s.codeLineId);
    for (const id of Object.values(BFS_LINES)) {
      expect(ids).toContain(id);
    }
    expect(ids[0]).toBe(BFS_LINES.init);
  });

  it('存在 enqueue 与 dequeue 操作，visitedCount 最终等于节点数', () => {
    const { steps } = run();
    const ops = steps.map((s) => s.operation);
    expect(ops).toContain('enqueue');
    expect(ops).toContain('dequeue');
    const last = steps[steps.length - 1];
    expect(last?.variables.visitedCount).toBe(6);
    expect(last?.variables.queueSize).toBe(0);
    expect(last?.variables.dist).toBe(3); // 最后访问的节点 5 距离为 3
  });

  it('含环图中每个节点只入队一次（入队即标记）', () => {
    const { steps } = run([[0, 1], [1, 2], [2, 0]]);
    const enqueueSteps = steps.filter((s) => s.operation === 'enqueue');
    // 起点 + 两个邻居，共 3 次入队，不重复
    expect(enqueueSteps.length).toBe(3);
  });

  it('起点越界产生显式错误步骤', () => {
    const result = run(DEFAULT_EDGES, 99);
    expect(result.summary.result).toBe('input error');
    const errorStep = result.steps[result.steps.length - 1];
    expect(errorStep?.explanation.zh).toContain('不在节点范围');
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { bfsMeta } = await import('../../content/algorithms/bfs');
    const maps = bfsMeta.codeExamples;
    const { steps } = run();
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});

describe('extractLineMap 与 BFS 源码标记一致', () => {
  it('三语言映射包含相同的关键行 id', () => {
    const source = `//>func\n//>init\n//>enqueue-start\n//>dequeue\n//>visit\n//>check-edge\n//>enqueue-next\n//>end`;
    const map = extractLineMap(source);
    expect(Object.keys(map).sort()).toEqual(
      ['check-edge', 'dequeue', 'end', 'enqueue-next', 'enqueue-start', 'func', 'init', 'visit'].sort(),
    );
  });
});
