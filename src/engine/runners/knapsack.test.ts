import { describe, expect, it } from 'vitest';
import { runKnapsack, KNAPSACK_LINES } from './knapsack';
import type { TableSnapshot } from '../types/step';

function run(values: number[], W: number) {
  return runKnapsack({ kind: 'int-array', value: { array: values, aux: W } });
}

/** 独立暴力枚举：第 i 件物品（1-based）重量 = i+1 */
function bruteForce(values: number[], W: number): number {
  let best = 0;
  const n = values.length;
  for (let mask = 0; mask < 1 << n; mask += 1) {
    let weight = 0;
    let value = 0;
    for (let i = 0; i < n; i += 1) {
      if (mask & (1 << i)) {
        weight += i + 2;
        value += values[i]!;
      }
    }
    if (weight <= W && value > best) best = value;
  }
  return best;
}

describe('runKnapsack', () => {
  it('正确性：默认示例最大价值为 35，选中物品 1 和 2', () => {
    const result = run([15, 20, 30, 25], 5);
    expect(result.summary.resultValue).toBe(35);
    expect(result.summary.result).toBe('selected: 1, 2 (total 35)');
    const last = result.steps[result.steps.length - 1];
    expect(last?.output).toContain('selected: 1, 2');
    expect(last?.output).toContain('total value: 35');
  });

  it('正确性：与暴力枚举一致（多组输入）', () => {
    const cases: Array<[number[], number]> = [
      [[7, 3, 9, 2, 8], 6],
      [[5, 10, 3, 8], 4],
      [[1, 2, 3], 5],
      [[9, 9, 9], 3],
    ];
    for (const [values, W] of cases) {
      const { summary } = run(values, W);
      expect(summary.resultValue).toBe(bruteForce(values, W));
    }
  });

  it('容量 W=1 时什么都装不下（最小重量为 2）', () => {
    const { summary } = run([15, 20, 30, 25], 1);
    expect(summary.resultValue).toBe(0);
    expect(summary.result).toContain('none');
  });

  it('单个物品：装得下就取，装不下为 0', () => {
    expect(run([42], 5).summary.resultValue).toBe(42); // 物品1 重量 2 ≤ 5
    expect(run([42], 1).summary.resultValue).toBe(0); // 物品1 重量 2 > 1
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run([15, 20, 30, 25], 5);
    const b = run([15, 20, 30, 25], 5);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步', () => {
    const { steps } = run([15, 20, 30, 25], 5);
    const second = JSON.parse(JSON.stringify(steps[1]));
    const firstTable = steps[0]!.structures[0] as TableSnapshot;
    firstTable.cells[0]!.value = 999;
    expect(steps[1]).toEqual(second);
  });

  it('表格结构 rows/cols/表头正确', () => {
    const { steps } = run([15, 20, 30, 25], 5);
    const table = steps[0]!.structures[0] as TableSnapshot;
    expect(table.kind).toBe('table');
    expect(table.rows).toBe(5); // 物品 0..4
    expect(table.cols).toBe(6); // 容量 0..5
    expect(table.rowHeaders).toEqual(['0', '1', '2', '3', '4']);
    expect(table.colHeaders).toEqual(['0', '1', '2', '3', '4', '5']);
    expect(table.cells).toHaveLength(30);
  });

  it('take 计算步有两条转移来源箭头，skip 步只有一条', () => {
    const { steps } = run([15, 20, 30, 25], 5);
    const takeStep = steps.find((s) => s.codeLineId === KNAPSACK_LINES.take);
    expect(takeStep).toBeDefined();
    const takeTable = takeStep?.structures[0] as TableSnapshot | undefined;
    expect(takeTable?.sourceEdges).toHaveLength(2);

    const skipStep = steps.find((s) => s.codeLineId === KNAPSACK_LINES.skip);
    expect(skipStep).toBeDefined();
    const skipTable = skipStep?.structures[0] as TableSnapshot | undefined;
    expect(skipTable?.sourceEdges).toHaveLength(1);
  });

  it('回溯步存在，且最终表值正确', () => {
    const { steps } = run([15, 20, 30, 25], 5);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids).toContain(KNAPSACK_LINES.backtrack);

    const last = steps[steps.length - 1];
    const table = last?.structures[0] as TableSnapshot;
    const cell = table.cells.find((c) => c.row === 4 && c.col === 5);
    expect(cell?.value).toBe(35);
    expect(cell?.state).toBe('done');
  });

  it('关键 codeLineId 都出现过', () => {
    const { steps } = run([15, 20, 30, 25], 5);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(KNAPSACK_LINES.init);
    expect(ids).toContain(KNAPSACK_LINES.take);
    expect(ids).toContain(KNAPSACK_LINES.skip);
    expect(ids).toContain(KNAPSACK_LINES.backtrack);
    expect(ids).toContain(KNAPSACK_LINES.end);
  });

  it('统计累计只增', () => {
    const { steps } = run([15, 20, 30, 25], 5);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!.stats.comparisons).toBeGreaterThanOrEqual(steps[i - 1]!.stats.comparisons);
      expect(steps[i]!.stats.accesses).toBeGreaterThanOrEqual(steps[i - 1]!.stats.accesses);
      expect(steps[i]!.stats.writes).toBeGreaterThanOrEqual(steps[i - 1]!.stats.writes);
    }
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { knapsackMeta } = await import('../../content/algorithms/knapsack');
    const maps = knapsackMeta.codeExamples;
    const { steps } = run([15, 20, 30, 25], 5);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});
