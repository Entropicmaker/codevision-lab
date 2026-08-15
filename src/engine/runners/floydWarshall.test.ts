import { describe, expect, it } from 'vitest';
import { runFloydWarshall, FLOYD_LINES } from './floydWarshall';
import type { TableSnapshot } from '../types/step';
import type { EdgePair } from '../inputs/parsers';

function run(edges: EdgePair[]) {
  return runFloydWarshall({ kind: 'edge-list', value: edges });
}

/** 默认有向加权图：0->1:4, 0->2:1, 1->3:1, 2->1:2, 2->3:5 */
const defaultEdges: EdgePair[] = [
  [0, 1, true, 4],
  [0, 2, true, 1],
  [1, 3, true, 1],
  [2, 1, true, 2],
  [2, 3, true, 5],
];

/** 取某一步的距离矩阵快照 */
function tableOf(steps: ReturnType<typeof run>['steps'], index: number): TableSnapshot {
  return steps[index]!.structures[0] as TableSnapshot;
}

/** 从表格读取 dp[r][c] 的显示值 */
function cellValue(table: TableSnapshot, r: number, c: number): string | number | boolean | null {
  return table.cells.find((cell) => cell.row === r && cell.col === c)?.value ?? null;
}

describe('runFloydWarshall', () => {
  it('正确性：默认图全源最短距离符合手算', () => {
    const { steps } = run(defaultEdges);
    const last = tableOf(steps, steps.length - 1);
    expect(cellValue(last, 0, 1)).toBe(3); // 0->2->1 = 1+2
    expect(cellValue(last, 0, 2)).toBe(1);
    expect(cellValue(last, 0, 3)).toBe(4); // 0->2->1->3 = 1+2+1
    expect(cellValue(last, 1, 3)).toBe(1);
    expect(cellValue(last, 2, 1)).toBe(2);
    expect(cellValue(last, 2, 3)).toBe(3); // 2->1->3 = 2+1
    expect(cellValue(last, 3, 1)).toBe('∞');
    expect(cellValue(last, 0, 0)).toBe(0); // 对角线
  });

  it('无向边双向展开', () => {
    const { steps } = run([[0, 1, undefined, 5]]);
    const last = tableOf(steps, steps.length - 1);
    expect(cellValue(last, 0, 1)).toBe(5);
    expect(cellValue(last, 1, 0)).toBe(5); // 无向边反向也可达
  });

  it('有向边不反向展开', () => {
    const { steps } = run([[0, 1, true, 5]]);
    const last = tableOf(steps, steps.length - 1);
    expect(cellValue(last, 0, 1)).toBe(5);
    expect(cellValue(last, 1, 0)).toBe('∞');
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run(defaultEdges);
    const b = run(defaultEdges);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步', () => {
    const { steps } = run(defaultEdges);
    const second = JSON.parse(JSON.stringify(steps[1]));
    const firstTable = tableOf(steps, 0);
    firstTable.cells[0]!.value = 999;
    expect(steps[1]).toEqual(second);
  });

  it('表格结构 rows/cols/表头正确', () => {
    const { steps } = run(defaultEdges);
    const table = tableOf(steps, 0);
    expect(table.kind).toBe('table');
    expect(table.rows).toBe(4);
    expect(table.cols).toBe(4);
    expect(table.rowHeaders).toEqual(['0', '1', '2', '3']);
    expect(table.colHeaders).toEqual(['0', '1', '2', '3']);
    expect(table.cells).toHaveLength(16);
  });

  it('松弛步存在两条转移来源箭头', () => {
    const { steps } = run(defaultEdges);
    const relaxStep = steps.find((s) => s.codeLineId === FLOYD_LINES.relax);
    expect(relaxStep).toBeDefined();
    const table = relaxStep!.structures[0] as TableSnapshot;
    expect(table.sourceEdges).toHaveLength(2);
    // 箭头均指向当前格 (i,j)
    const target = table.sourceEdges[0]!.to;
    expect(table.sourceEdges[1]!.to).toEqual(target);
  });

  it('更新步写入新值且当前格为 done', () => {
    const { steps } = run(defaultEdges);
    const updateStep = steps.find((s) => s.codeLineId === FLOYD_LINES.update);
    expect(updateStep).toBeDefined();
    const table = updateStep!.structures[0] as TableSnapshot;
    const activeOrDone = table.cells.filter((c) => c.state === 'done');
    expect(activeOrDone.length).toBeGreaterThan(0);
  });

  it('关键 codeLineId 都出现过', () => {
    const { steps } = run(defaultEdges);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(FLOYD_LINES.init);
    expect(ids).toContain(FLOYD_LINES.loopK);
    expect(ids).toContain(FLOYD_LINES.relax);
    expect(ids).toContain(FLOYD_LINES.update);
    expect(ids).toContain(FLOYD_LINES.end);
  });

  it('统计累计只增', () => {
    const { steps } = run(defaultEdges);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!.stats.comparisons).toBeGreaterThanOrEqual(steps[i - 1]!.stats.comparisons);
      expect(steps[i]!.stats.accesses).toBeGreaterThanOrEqual(steps[i - 1]!.stats.accesses);
      expect(steps[i]!.stats.writes).toBeGreaterThanOrEqual(steps[i - 1]!.stats.writes);
    }
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { floydWarshallMeta } = await import('../../content/algorithms/floyd-warshall');
    const maps = floydWarshallMeta.codeExamples;
    const { steps } = run(defaultEdges);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});
