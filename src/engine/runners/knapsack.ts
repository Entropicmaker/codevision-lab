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

/** 0-1 背包（二维 DP）逻辑代码行 id */
export const KNAPSACK_LINES = {
  func: 'func',
  init: 'init',
  loopI: 'loop-i',
  loopJ: 'loop-j',
  skip: 'skip',
  take: 'take',
  backtrack: 'backtrack',
  end: 'end',
} as const;

export interface KnapsackInput {
  /** 物品价值数组（第 i 件物品价值 = array[i-1]） */
  array: number[];
  /** 背包容量 W */
  aux: number;
}

/** DP 表单元格 */
interface KnapCell {
  id: string;
  value: number;
  state: ElementState;
  row: number;
  col: number;
}

/** 第 i 件物品的重量固定为 i+1（i 从 1 开始） */
const weightOf = (i: number): number => i + 1;

/**
 * 0-1 背包执行器：二维 DP 表 + 转移来源箭头 + 回溯选中物品。
 * 物品重量固定 w[i] = i + 1；每件物品只能选（1）或不选（0）。
 * 纯函数、确定性；每一步为完整快照（深拷贝）。
 */
export const runKnapsack: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { array, aux } = input.value as KnapsackInput;
  const values = array.slice();
  const n = values.length;
  const W = Math.max(0, Math.floor(aux));
  const rows = n + 1;
  const cols = W + 1;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：dp 值 + 单元格状态（行主序）
  const dp: number[][] = [];
  const cells: KnapCell[] = [];
  for (let r = 0; r < rows; r += 1) {
    dp.push([]);
    for (let c = 0; c < cols; c += 1) {
      dp[r]!.push(0);
      cells.push({ id: `dp:${r}:${c}`, value: 0, state: 'idle', row: r, col: c });
    }
  }
  const cellAt = (r: number, c: number): KnapCell => cells[r * cols + c]!;

  let i: number | null = null;
  let j: number | null = null;
  let weight: number | null = null;
  let value: number | null = null;
  let edges: Array<{ from: { row: number; col: number }; to: { row: number; col: number }; state?: ElementState }> = [];
  let output: string[] = [];

  const variables = (): Record<string, Primitive> => ({
    n,
    W,
    i,
    j,
    weight,
    value,
    'dp[i][j]': i !== null && j !== null ? (dp[i]?.[j] ?? null) : null,
  });

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: { zh: string; en: string },
    nextOutput?: string[],
  ): void => {
    if (nextOutput) output = nextOutput;
    steps.push({
      stepId: steps.length,
      codeLineId,
      operation,
      containers: {},
      structures: [
        {
          kind: 'table',
          id: 'dp-table',
          rows,
          cols,
          colHeaders: Array.from({ length: cols }, (_, c) => String(c)),
          rowHeaders: Array.from({ length: rows }, (_, r) => String(r)),
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

  // 初始化：建立二维 DP 表，全部为 0（idle）
  stats.writes += rows * cols;
  push(KNAPSACK_LINES.init, 'init', {
    zh: `初始化二维 DP 表：行 0..${n} 表示已考虑的物品数，列 0..${W} 表示容量。第 i 件物品的重量固定为 i+1、价值为输入数组的第 i 个元素。所有格子初始为 0（灰色为未计算）。`,
    en: `Initialize the 2-D DP table: rows 0..${n} = items considered, columns 0..${W} = capacity. Item i has fixed weight i+1 and value = input[i-1]. All cells start at 0 (grey = not computed).`,
  });

  // 逐行逐列计算 dp[i][j]
  for (let ri = 1; ri <= n; ri += 1) {
    const w = weightOf(ri);
    const v = values[ri - 1] ?? 0;
    for (let cj = 0; cj <= W; cj += 1) {
      i = ri;
      j = cj;
      weight = w;
      value = v;

      const skipValue = dp[ri - 1]![cj] ?? 0;
      let result = skipValue;
      const takeOption = cj >= w ? (dp[ri - 1]![cj - w] ?? 0) + v : null;
      if (takeOption !== null && takeOption > skipValue) {
        result = takeOption;
      }

      // 计算步：当前格 active，来源格 comparing + 箭头
      dp[ri]![cj] = result;
      cellAt(ri, cj).value = result;
      cellAt(ri, cj).state = 'active';
      cellAt(ri - 1, cj).state = 'comparing';
      edges = [{ from: { row: ri - 1, col: cj }, to: { row: ri, col: cj }, state: 'comparing' }];
      if (cj >= w) {
        cellAt(ri - 1, cj - w).state = 'comparing';
        edges.push({ from: { row: ri - 1, col: cj - w }, to: { row: ri, col: cj }, state: 'comparing' });
      }
      if (takeOption !== null) {
        stats.comparisons += 1;
        stats.accesses += 2;
      } else {
        stats.accesses += 1;
      }
      if (cj >= w) {
        push(KNAPSACK_LINES.take, 'assign', {
          zh: `计算 dp[${ri}][${cj}]：容量 ${cj} ≥ 物品 ${ri} 重量 ${w}，可装下。取 max(不选 dp[${ri - 1}][${cj}] = ${skipValue}，选 dp[${ri - 1}][${cj - w}] + v[${ri}] = ${takeOption}) = ${result}（两条黄色来源与箭头）。`,
          en: `Compute dp[${ri}][${cj}]: capacity ${cj} >= weight ${w} of item ${ri}, it fits. max(skip dp[${ri - 1}][${cj}] = ${skipValue}, take dp[${ri - 1}][${cj - w}] + v[${ri}] = ${takeOption}) = ${result} (two yellow sources with arrows).`,
        });
      } else {
        push(KNAPSACK_LINES.skip, 'assign', {
          zh: `计算 dp[${ri}][${cj}]：容量 ${cj} < 物品 ${ri} 重量 ${w}，装不下，只能不选：dp[${ri}][${cj}] = dp[${ri - 1}][${cj}] = ${skipValue}（黄色为来源格）。`,
          en: `Compute dp[${ri}][${cj}]: capacity ${cj} < weight ${w} of item ${ri}, it cannot fit; skip only: dp[${ri}][${cj}] = dp[${ri - 1}][${cj}] = ${skipValue} (yellow = source cell).`,
        });
      }

      // 写入步：当前格 done，来源格恢复 done
      cellAt(ri, cj).state = 'done';
      cellAt(ri - 1, cj).state = 'done';
      if (cj >= w) cellAt(ri - 1, cj - w).state = 'done';
      edges = [];
      stats.writes += 1;
      push(cj >= w ? KNAPSACK_LINES.take : KNAPSACK_LINES.skip, 'assign', {
        zh: `写入 dp[${ri}][${cj}] = ${result}，该值已确定。`,
        en: `Write dp[${ri}][${cj}] = ${result}; the value is now final.`,
      });
    }
  }

  // 回溯：从 dp[n][W] 沿选择路径回退
  const selected: number[] = [];
  let bj = W;
  for (let bi = n; bi >= 1; bi -= 1) {
    i = bi;
    j = bj;
    weight = weightOf(bi);
    value = values[bi - 1] ?? 0;
    stats.comparisons += 1;
    stats.accesses += 2;

    const cur = dp[bi]![bj] ?? 0;
    const above = dp[bi - 1]![bj] ?? 0;
    const taken = cur !== above;
    cellAt(bi, bj).state = 'active';
    cellAt(bi - 1, bj).state = 'comparing';

    if (taken) {
      selected.push(bi);
      bj -= weightOf(bi);
      const nextOutput = [...output, `select item ${bi} (value ${value}, weight ${weight})`];
      push(KNAPSACK_LINES.backtrack, 'backtrack', {
        zh: `回溯：dp[${bi}][${j}] = ${cur} ≠ dp[${bi - 1}][${j}] = ${above}，说明第 ${bi} 件物品被选中（价值 ${value}、重量 ${weight}），剩余容量变为 ${bj}。`,
        en: `Backtrack: dp[${bi}][${j}] = ${cur} != dp[${bi - 1}][${j}] = ${above}; item ${bi} is selected (value ${value}, weight ${weight}); remaining capacity becomes ${bj}.`,
      }, nextOutput);
    } else {
      push(KNAPSACK_LINES.backtrack, 'backtrack', {
        zh: `回溯：dp[${bi}][${j}] = dp[${bi - 1}][${j}] = ${cur}，说明第 ${bi} 件物品未被选中，容量保持 ${bj}。`,
        en: `Backtrack: dp[${bi}][${j}] = dp[${bi - 1}][${j}] = ${cur}; item ${bi} is NOT selected; capacity stays ${bj}.`,
      });
    }

    cellAt(bi, bj).state = 'done';
    cellAt(bi - 1, bj).state = 'done';
  }

  // 结束：输出选中物品与总价值
  i = null;
  j = null;
  weight = null;
  value = null;
  for (const cell of cells) cell.state = 'done';
  const total = dp[n]?.[W] ?? 0;
  const selText = [...selected].reverse().join(', ') || 'none';
  stats.accesses += 1;
  push(KNAPSACK_LINES.end, 'return', {
    zh: `回溯完成：选中物品 [${selText}]，总价值 dp[${n}][${W}] = ${total}。`,
    en: `Backtracking done: selected items [${selText}], total value dp[${n}][${W}] = ${total}.`,
  }, [...output, `selected: ${selText}`, `total value: ${total}`]);

  return {
    steps,
    summary: {
      result: `selected: ${selText} (total ${total})`,
      resultValue: total,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
