import type {
  AlgorithmRunner,
  AlgorithmStep,
  ElementState,
  OpStats,
  OperationType,
  ParsedInput,
  Primitive,
  RunnerResult,
} from '../types/step';
import { emptyStats } from '../types/step';

/** 斐波那契（自底向上 DP）逻辑代码行 id */
export const FIB_LINES = {
  func: 'func',
  init: 'init',
  base: 'base',
  loop: 'loop',
  compute: 'compute',
  end: 'end',
} as const;

export interface FibonacciInput {
  /** 数组输入固定为空，真正输入为 aux = n */
  array: number[];
  aux: number;
}

/** DP 表单元格（行恒为 0 的一维表） */
interface FibCell {
  id: string;
  value: number;
  state: ElementState;
  row: number;
  col: number;
}

/**
 * 斐波那契数列执行器：自底向上填一维 DP 表，展示转移来源箭头。
 * 纯函数、确定性；每一步为完整快照（深拷贝）。
 */
export const runFibonacci: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { aux } = input.value as FibonacciInput;
  const n = Math.max(0, Math.floor(aux));
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每步 push 前深拷贝进快照
  const values: number[] = [];
  const cells: FibCell[] = [];
  for (let c = 0; c <= n; c += 1) {
    values.push(0);
    cells.push({ id: `dp:${c}`, value: 0, state: 'idle', row: 0, col: c });
  }
  let i: number | null = null;
  let edges: Array<{ from: { row: number; col: number }; to: { row: number; col: number }; state?: ElementState }> = [];

  const variables = (): Record<string, Primitive> => ({
    n,
    i,
    'dp[i-1]': i !== null && i - 1 >= 0 ? (values[i - 1] ?? null) : null,
    'dp[i-2]': i !== null && i - 2 >= 0 ? (values[i - 2] ?? null) : null,
    'dp[i]': i !== null && i <= n ? (values[i] ?? null) : null,
  });

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: { zh: string; en: string },
    output: string[] = [],
  ): void => {
    steps.push({
      stepId: steps.length,
      codeLineId,
      operation,
      containers: {},
      structures: [
        {
          kind: 'table',
          id: 'dp-table',
          rows: 1,
          cols: n + 1,
          colHeaders: Array.from({ length: n + 1 }, (_, c) => String(c)),
          rowHeaders: ['n'],
          cells: cells.map((c) => ({ ...c })),
          sourceEdges: edges.map((e) => ({ from: { ...e.from }, to: { ...e.to }, state: e.state })),
        },
      ],
      variables: variables(),
      pointers: [],
      callStack: [],
      output,
      explanation,
      stats: { ...stats },
    });
  };

  // 初始化：建立 DP 表并写入基本情况
  stats.writes += 1;
  values[0] = 0;
  cells[0]!.state = 'done';
  if (n >= 1) {
    stats.writes += 1;
    values[1] = 1;
    cells[1]!.state = 'done';
  }
  push(FIB_LINES.init, 'init', {
    zh: `自底向上计算斐波那契：建立长度为 n+1 = ${n + 1} 的 DP 表，写入基本情况 dp[0] = 0、dp[1] = 1（绿色为已确定）。`,
    en: `Bottom-up Fibonacci: build a DP table of length n+1 = ${n + 1} and set base cases dp[0] = 0, dp[1] = 1 (green = final).`,
  });

  if (n < 2) {
    // 基本情况：无需递推，直接返回
    stats.accesses += 1;
    push(FIB_LINES.base, 'return', {
      zh: `n = ${n} < 2，无需递推，直接返回 dp[${n}] = ${values[n]}。`,
      en: `n = ${n} < 2, no recurrence needed; return dp[${n}] = ${values[n]}.`,
    }, [`fib(${n}) = ${values[n]}`]);
    return {
      steps,
      summary: { result: String(values[n]), resultValue: values[n], totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 逐 i = 2..n 递推
  for (let idx = 2; idx <= n; idx += 1) {
    i = idx;
    const a = values[idx - 1] ?? 0;
    const b = values[idx - 2] ?? 0;
    const result = a + b;
    // 计算步：当前格 active，来源格 comparing，画两条转移箭头
    values[idx] = result;
    cells[idx]!.value = result;
    cells[idx]!.state = 'active';
    cells[idx - 1]!.state = 'comparing';
    cells[idx - 2]!.state = 'comparing';
    edges = [
      { from: { row: 0, col: idx - 1 }, to: { row: 0, col: idx }, state: 'comparing' },
      { from: { row: 0, col: idx - 2 }, to: { row: 0, col: idx }, state: 'comparing' },
    ];
    stats.accesses += 2;
    push(FIB_LINES.compute, 'assign', {
      zh: `计算 dp[${idx}]：由转移方程 dp[i] = dp[i-1] + dp[i-2] 得 dp[${idx}] = dp[${idx - 1}] + dp[${idx - 2}] = ${a} + ${b} = ${result}（黄色为转移来源，箭头指向当前格）。`,
      en: `Compute dp[${idx}]: recurrence dp[i] = dp[i-1] + dp[i-2] gives dp[${idx}] = dp[${idx - 1}] + dp[${idx - 2}] = ${a} + ${b} = ${result} (yellow = sources, arrows point to the current cell).`,
    });

    // 写入步：当前格 done，来源格恢复 done
    cells[idx]!.state = 'done';
    cells[idx - 1]!.state = 'done';
    cells[idx - 2]!.state = 'done';
    edges = [];
    stats.writes += 1;
    push(FIB_LINES.compute, 'assign', {
      zh: `写入 dp[${idx}] = ${result}，该值已确定。`,
      en: `Write dp[${idx}] = ${result}; the value is now final.`,
    });
  }

  // 结束：输出结果
  i = null;
  stats.accesses += 1;
  push(FIB_LINES.end, 'return', {
    zh: `填表完成，结果为 F(${n}) = dp[${n}] = ${values[n]}。`,
    en: `Table complete; the result is F(${n}) = dp[${n}] = ${values[n]}.`,
  }, [`fib(${n}) = ${values[n]}`]);

  return {
    steps,
    summary: { result: String(values[n]), resultValue: values[n], totalSteps: steps.length, stats: { ...stats } },
  };
};
