import { describe, expect, it } from 'vitest';
import { runFibonacci, FIB_LINES } from './fibonacci';
import type { TableSnapshot } from '../types/step';

function run(n: number) {
  return runFibonacci({ kind: 'int-array', value: { array: [], aux: n } });
}

describe('runFibonacci', () => {
  it('正确性：fib(8) = 21', () => {
    const result = run(8);
    expect(result.summary.resultValue).toBe(21);
    expect(result.summary.result).toBe('21');
    const last = result.steps[result.steps.length - 1];
    expect(last?.output).toEqual(['fib(8) = 21']);
  });

  it('n=0 与 n=1 直接结束', () => {
    const r0 = run(0);
    expect(r0.summary.resultValue).toBe(0);
    expect(r0.steps.length).toBe(2); // init + return

    const r1 = run(1);
    expect(r1.summary.resultValue).toBe(1);
    expect(r1.steps.length).toBe(2);
  });

  it('n=2 时恰好完成一次递推（init + compute + 写入 + end）', () => {
    const { steps } = run(2);
    expect(steps.length).toBe(4);
    // 写入步（下标 2）展示 i=2、dp[i]=dp[1]+dp[0]=1
    const writeStep = steps[2];
    expect(writeStep?.variables['i']).toBe(2);
    expect(writeStep?.variables['dp[i]']).toBe(1);
    expect(writeStep?.variables['dp[i-1]']).toBe(1);
    expect(writeStep?.variables['dp[i-2]']).toBe(0);
  });

  it('是确定性的：同一输入两次运行产生完全相同的步骤', () => {
    const a = run(8);
    const b = run(8);
    expect(a.steps).toEqual(b.steps);
  });

  it('步骤快照彼此独立：修改某一步不影响其他步', () => {
    const { steps } = run(5);
    const second = JSON.parse(JSON.stringify(steps[1]));
    const firstTable = steps[0]!.structures[0] as TableSnapshot;
    firstTable.cells[2]!.value = 999;
    expect(steps[1]).toEqual(second);
  });

  it('表格结构 rows/cols/表头正确', () => {
    const { steps } = run(8);
    const table = steps[0]!.structures[0] as TableSnapshot;
    expect(table.kind).toBe('table');
    expect(table.rows).toBe(1);
    expect(table.cols).toBe(9);
    expect(table.colHeaders).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8']);
    expect(table.rowHeaders).toEqual(['n']);
    expect(table.cells).toHaveLength(9);
    // 基本情况已标 done
    expect(table.cells.find((c) => c.col === 0)?.state).toBe('done');
    expect(table.cells.find((c) => c.col === 1)?.state).toBe('done');
  });

  it('计算步展示转移来源：两条箭头、当前格 active、来源格 comparing', () => {
    const { steps } = run(4);
    const compute = steps.find((s) => s.codeLineId === FIB_LINES.compute);
    const table = compute?.structures[0] as TableSnapshot | undefined;
    expect(table).toBeDefined();
    expect(table?.sourceEdges).toHaveLength(2);
    expect(table?.cells.find((c) => c.col === 2)?.state).toBe('active');
    expect(table?.cells.find((c) => c.col === 0)?.state).toBe('comparing');
    expect(table?.cells.find((c) => c.col === 1)?.state).toBe('comparing');
  });

  it('统计累计只增，最终值与手动计算一致', () => {
    const { steps, summary } = run(8);
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!.stats.accesses).toBeGreaterThanOrEqual(steps[i - 1]!.stats.accesses);
      expect(steps[i]!.stats.writes).toBeGreaterThanOrEqual(steps[i - 1]!.stats.writes);
    }
    // 每个 i=2..8 读两个来源（7×2）+ 结束读一次 = 15
    expect(summary.stats.accesses).toBe(15);
    // init 写 2 个基础值 + 每个 i 写 1 个 = 9
    expect(summary.stats.writes).toBe(9);
  });

  it('关键 codeLineId 都出现过', () => {
    const { steps } = run(8);
    const ids = steps.map((s) => s.codeLineId);
    expect(ids[0]).toBe(FIB_LINES.init);
    expect(ids).toContain(FIB_LINES.compute);
    expect(ids).toContain(FIB_LINES.end);
  });

  it('每步 codeLineId 都能映射到三种语言源码行号', async () => {
    const { fibonacciMeta } = await import('../../content/algorithms/fibonacci');
    const maps = fibonacciMeta.codeExamples;
    const { steps } = run(8);
    for (const step of steps) {
      if (step.codeLineId === null) continue;
      for (const lang of ['cpp', 'csharp', 'python'] as const) {
        expect(maps[lang].lineMap[step.codeLineId]).toBeTypeOf('number');
      }
    }
  });
});
