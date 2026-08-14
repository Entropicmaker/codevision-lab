import { describe, expect, it } from 'vitest';
import { runGraphDfs, DFS_LINES } from './graphDfs';
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
  return runGraphDfs({ kind: 'edge-list', value: { array: edges, aux } });
}

describe('runGraphDfs', () => {
  it('默认图产生正确的 DFS 访问序列', () => {
    const result = run();
    // 邻接表顺序：0→1→3→5→4→2
    expect(result.summary.result).toBe('0, 1, 3, 5, 4, 2');
    const last = result.steps[result.steps.length - 1];
    expect(last?.output).toEqual(['0', '1', '3', '5', '4', '2']);
  });

  it('两节点一条边与星形图、含环图访问序列正确', () => {
    expect(run([[0, 1]]).summary.result).toBe('0, 1');
    expect(run([[0, 1], [0, 2], [0, 3]]).summary.result).toBe('0, 1, 2, 3');
    // 含环图 0-1-2-0：从 0 出发
    expect(run([[0, 1], [1, 2], [2, 0]]).summary.result).toBe('0, 1, 2');
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    expect(run().steps).toEqual(run().steps);
  });

  it('默认输入步骤数规模：init+func+6次visit+17次边检查+6次回溯+end = 32 步', () => {
    const { summary } = run();
    expect(summary.totalSteps).toBe(32);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步骤', () => {
    const { steps } = run();
    const second = JSON.parse(JSON.stringify(steps[1]));
    (steps[0]!.structures[0] as { nodes: Array<{ state: string }> }).nodes[0]!.state = 'invalid';
    steps[0]!.output.push('999');
    expect(steps[1]).toEqual(second);
  });

  it('每一步都包含 graph 与 stack 两个结构快照', () => {
    const { steps } = run();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      const kinds = step.structures.map((s) => s.kind);
      expect(kinds).toContain('graph');
      expect(kinds).toContain('stack');
    }
  });

  it('关键 codeLineId 都出现过，且首步为 init', () => {
    const ids = run().steps.map((s) => s.codeLineId);
    for (const id of Object.values(DFS_LINES)) {
      expect(ids).toContain(id);
    }
    expect(ids[0]).toBe(DFS_LINES.init);
  });

  it('存在 visit 与 backtrack 操作，且 visitedCount 最终等于节点数', () => {
    const { steps } = run();
    const ops = steps.map((s) => s.operation);
    expect(ops).toContain('visit');
    expect(ops).toContain('backtrack');
    const last = steps[steps.length - 1];
    expect(last?.variables.visitedCount).toBe(6);
    expect(last?.variables.stackSize).toBe(0);
  });

  it('递归调用栈帧随深度增长并在回溯时弹出', () => {
    const { steps } = run();
    const maxFrames = Math.max(...steps.map((s) => s.callStack.length));
    expect(maxFrames).toBeGreaterThanOrEqual(2); // 存在深度 ≥ 2 的递归
    const maxDepth = Math.max(...steps.map((s) => s.callStack.map((f) => f.depth).reduce((a, b) => Math.max(a, b), 0)));
    expect(maxDepth).toBeGreaterThanOrEqual(2);
    const last = steps[steps.length - 1];
    expect(last?.callStack.length).toBe(0); // 结束时栈已清空
  });

  it('起点越界产生显式错误步骤', () => {
    const result = run(DEFAULT_EDGES, 99);
    expect(result.summary.result).toBe('input error');
    const errorStep = result.steps[result.steps.length - 1];
    expect(errorStep?.explanation.zh).toContain('不在节点范围');
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { dfsMeta } = await import('../../content/algorithms/dfs');
    const maps = dfsMeta.codeExamples;
    const { steps } = run();
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});

describe('extractLineMap 与 DFS 源码标记一致', () => {
  it('三语言映射包含相同的关键行 id', () => {
    const source = `//>func\n//>init\n//>visit\n//>check-edge\n//>recurse\n//>backtrack\n//>end`;
    const map = extractLineMap(source);
    expect(Object.keys(map).sort()).toEqual(
      ['backtrack', 'check-edge', 'end', 'func', 'init', 'recurse', 'visit'].sort(),
    );
  });
});
