import { describe, expect, it } from 'vitest';
import { runNQueens, N_QUEENS_LINES } from './nQueens';
import type { TableSnapshot } from '../types/step';

function run(n: number) {
  return runNQueens({ kind: 'int-array', value: { array: [], aux: n } });
}

/** 从棋盘快照提取皇后位置列表（row → col 对） */
function queensOf(table: TableSnapshot): Array<[number, number]> {
  return table.cells
    .filter((c) => c.value === '♛')
    .map((c) => [c.row, c.col] as [number, number]);
}

/** 程序化验证皇后布局是否合法：每行恰一个、无同列、无对角线冲突 */
function isValidLayout(queens: Array<[number, number]>, n: number): boolean {
  if (queens.length !== n) return false;
  const rows = queens.map(([r]) => r).sort((a, b) => a - b);
  for (let i = 0; i < n; i += 1) {
    if (rows[i] !== i) return false; // 每行恰一个皇后
  }
  for (let i = 0; i < queens.length; i += 1) {
    for (let j = i + 1; j < queens.length; j += 1) {
      const [r1, c1] = queens[i]!;
      const [r2, c2] = queens[j]!;
      if (c1 === c2) return false; // 同列
      if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) return false; // 同对角线
    }
  }
  return true;
}

function lastTable(steps: ReturnType<typeof run>['steps']): TableSnapshot {
  const last = steps[steps.length - 1];
  return last?.structures[0] as TableSnapshot;
}

describe('runNQueens', () => {
  it('正确性：N=4 找到合法解（每行恰一个、无同列、无对角线冲突）', () => {
    const { steps } = run(4);
    const table = lastTable(steps);
    const queens = queensOf(table);
    expect(isValidLayout(queens, 4)).toBe(true);
  });

  it('table rows/cols = N，表头为 0..N-1', () => {
    const { steps } = run(4);
    const table = steps[0]!.structures[0] as TableSnapshot;
    expect(table.kind).toBe('table');
    expect(table.rows).toBe(4);
    expect(table.cols).toBe(4);
    expect(table.colHeaders).toEqual(['0', '1', '2', '3']);
    expect(table.rowHeaders).toEqual(['0', '1', '2', '3']);
    expect(table.cells).toHaveLength(16);
  });

  it('最终棋盘上 ♛ 数量为 N', () => {
    const { steps } = run(4);
    const queens = queensOf(lastTable(steps));
    expect(queens).toHaveLength(4);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run(4);
    const b = run(4);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步', () => {
    const { steps } = run(4);
    const second = JSON.parse(JSON.stringify(steps[1])) as typeof steps[1];
    const firstTable = steps[0]!.structures[0] as TableSnapshot;
    firstTable.cells[0]!.value = 'X';
    firstTable.cells[0]!.state = 'invalid';
    expect(steps[1]).toEqual(second);
  });

  it('关键 codeLineId 都出现过', () => {
    const { steps } = run(4);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids).toContain(N_QUEENS_LINES.init);
    expect(ids).toContain(N_QUEENS_LINES.place);
    expect(ids).toContain(N_QUEENS_LINES.checkCol);
    expect(ids).toContain(N_QUEENS_LINES.checkDiag);
    expect(ids).toContain(N_QUEENS_LINES.backtrack);
    expect(ids).toContain(N_QUEENS_LINES.found);
    expect(ids).toContain(N_QUEENS_LINES.end);
  });

  it('found 步骤输出包含解坐标', () => {
    const { steps } = run(4);
    const found = steps.find((s) => s.codeLineId === N_QUEENS_LINES.found);
    expect(found).toBeDefined();
    expect(found!.output.join(' ')).toContain('found');
  });

  it('stats 累计只增', () => {
    const { steps } = run(4);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!.stats.comparisons).toBeGreaterThanOrEqual(steps[i - 1]!.stats.comparisons);
      expect(steps[i]!.stats.swaps).toBeGreaterThanOrEqual(steps[i - 1]!.stats.swaps);
      expect(steps[i]!.stats.accesses).toBeGreaterThanOrEqual(steps[i - 1]!.stats.accesses);
      expect(steps[i]!.stats.writes).toBeGreaterThanOrEqual(steps[i - 1]!.stats.writes);
    }
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { nQueensMeta } = await import('../../content/algorithms/n-queens');
    const maps = nQueensMeta.codeExamples;
    const { steps } = run(4);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});
