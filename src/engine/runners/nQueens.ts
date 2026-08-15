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

/** N 皇后（回溯）逻辑代码行 id（与三语言源码 / 伪代码中的标记一致） */
export const N_QUEENS_LINES = {
  func: 'func',
  init: 'init',
  place: 'place',
  checkCol: 'check-col',
  checkDiag: 'check-diag',
  backtrack: 'backtrack',
  found: 'found',
  end: 'end',
} as const;

export interface NQueensInput {
  /** 数组输入固定为空，真正输入为 aux = N（棋盘大小） */
  array: number[];
  aux: number;
}

/** 棋盘单元格：value 为 '♛'（已放置）或 ''（空） */
interface QueenCell {
  id: string;
  value: string;
  state: ElementState;
  row: number;
  col: number;
}

/**
 * N 皇后执行器：逐行回溯，找到第一个可行解。
 * 棋盘用 table 结构展示（rows = cols = N）；board[r] 记录第 r 行皇后所在列（-1 表示未放）。
 * 纯函数、确定性；每一步为完整快照（cells 深拷贝）。
 */
export const runNQueens: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { aux } = input.value as NQueensInput;
  const n = Math.max(1, Math.floor(aux));
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：N×N 棋盘单元格
  const cells: QueenCell[] = [];
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      cells.push({ id: `q:${r}:${c}`, value: '', state: 'idle', row: r, col: c });
    }
  }
  const cellAt = (r: number, c: number): QueenCell => cells[r * n + c]!;
  const board: number[] = new Array<number>(n).fill(-1);

  let row = 0;
  let col = 0;
  let placed = 0;
  let attempts = 0;

  const variables = (): Record<string, Primitive> => ({
    row,
    col,
    placed,
    attempts,
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
          id: 'board',
          rows: n,
          cols: n,
          colHeaders: Array.from({ length: n }, (_, c) => String(c)),
          rowHeaders: Array.from({ length: n }, (_, r) => String(r)),
          cells: cells.map((c) => ({ ...c })),
          sourceEdges: [],
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

  // 初始化：空棋盘 + 规则说明 + 回溯框架
  push(N_QUEENS_LINES.init, 'init', {
    zh: `初始化 ${n}×${n} 空棋盘。规则：每行放一个皇后，任意两个皇后不能同列、不能同对角线（行差 ≠ 列差）。回溯框架：逐行放置，当前行放不下就回退到上一行换一列。`,
    en: `Initialize an empty ${n}×${n} board. Rules: one queen per row; no two queens may share a column or a diagonal (row distance ≠ column distance). Backtracking framework: place row by row; if a row has no valid column, go back to the previous row and try the next column.`,
  });

  // 主循环：逐行回溯，找到第一个解（或穷尽无解）
  while (row >= 0 && placed < n) {
    if (col >= n) {
      // 本行所有列都试过 → 回溯：撤销上一行的皇后，尝试其下一列
      const exhaustedRow = row;
      row -= 1;
      if (row < 0) break;
      const prevCol = board[row]!;
      board[row] = -1;
      placed -= 1;
      const removed = cellAt(row, prevCol);
      removed.value = '';
      removed.state = 'idle';
      col = prevCol + 1;
      push(N_QUEENS_LINES.backtrack, 'backtrack', {
        zh: `第 ${exhaustedRow} 行的所有列都冲突（本行无解）：撤销第 ${row} 行的皇后（原在列 ${prevCol}），回溯到第 ${row} 行，从列 ${col} 继续尝试。`,
        en: `Every column in row ${exhaustedRow} conflicts (no solution in this row): remove the queen from row ${row} (was at column ${prevCol}), backtrack to row ${row} and continue from column ${col}.`,
      });
      continue;
    }

    // 尝试在 (row, col) 放置皇后
    attempts += 1;
    const candidate = cellAt(row, col);
    candidate.value = '♛';
    candidate.state = 'active';
    push(N_QUEENS_LINES.place, 'assign', {
      zh: `尝试在第 ${row} 行第 ${col} 列放置皇后（蓝色为当前尝试格）。`,
      en: `Try placing a queen at (row ${row}, col ${col}) (blue = current attempt cell).`,
    });

    // 检查与已放置皇后（行 0..row-1）的冲突：同列或对角线
    let conflictRow = -1;
    let conflictType: 'col' | 'diag' = 'col';
    for (let r = 0; r < row; r += 1) {
      const c2 = board[r]!;
      if (c2 < 0) continue;
      stats.comparisons += 1;
      stats.accesses += 2;
      if (c2 === col) {
        conflictRow = r;
        conflictType = 'col';
        break;
      }
      if (Math.abs(row - r) === Math.abs(col - c2)) {
        conflictRow = r;
        conflictType = 'diag';
        break;
      }
    }

    if (conflictRow >= 0) {
      // 冲突：候选格 invalid，冲突皇后 comparing
      candidate.state = 'invalid';
      const queenCol = board[conflictRow]!;
      const queen = cellAt(conflictRow, queenCol);
      queen.state = 'comparing';
      const lineId = conflictType === 'col' ? N_QUEENS_LINES.checkCol : N_QUEENS_LINES.checkDiag;
      const kindZh = conflictType === 'col' ? '同列' : '同对角线';
      const kindEn = conflictType === 'col' ? 'the same column' : 'the same diagonal';
      push(lineId, 'compare', {
        zh: `冲突：候选 (${row}, ${col}) 与已放置的皇后 (${conflictRow}, ${queenCol}) 处于${kindZh}（红色为冲突格，黄色为被检查的皇后），放弃该列，尝试下一列。`,
        en: `Conflict: candidate (${row}, ${col}) and the placed queen (${conflictRow}, ${queenCol}) are on ${kindEn} (red = conflict cell, yellow = checked queen); drop this column and try the next one.`,
      });
      // 恢复：候选格回到空，冲突皇后恢复已放置
      candidate.value = '';
      candidate.state = 'idle';
      queen.state = 'done';
      col += 1;
      continue;
    }

    // 无冲突：安全放置，进入下一行
    candidate.value = '♛';
    candidate.state = 'done';
    board[row] = col;
    placed += 1;
    stats.writes += 1;
    push(N_QUEENS_LINES.place, 'assign', {
      zh: `无冲突：将皇后安全放置在第 ${row} 行第 ${col} 列（绿色），进入下一行。`,
      en: `No conflict: place the queen safely at (row ${row}, col ${col}) (green); move to the next row.`,
    });
    row += 1;
    col = 0;
  }

  const solved = placed === n;

  if (solved) {
    const pairs: string[] = [];
    for (let r = 0; r < n; r += 1) {
      pairs.push(`(${r},${board[r]})`);
    }
    const pairsText = pairs.join(' ');
    row = n - 1;
    col = board[n - 1]!;
    push(N_QUEENS_LINES.found, 'found', {
      zh: `已放置 ${n} 个皇后，找到解：${pairsText}。每行恰一个皇后，且无同列、无对角线冲突。`,
      en: `All ${n} queens placed; solution found: ${pairsText}. Exactly one queen per row, with no column or diagonal conflicts.`,
    }, [`found: ${pairsText}`]);

    push(N_QUEENS_LINES.end, 'return', {
      zh: `回溯求解完成，输出第一个可行解：${pairsText}。`,
      en: `Backtracking complete; first valid solution: ${pairsText}.`,
    }, [`found: ${pairsText}`]);

    return {
      steps,
      summary: {
        result: pairsText,
        resultValue: pairsText,
        totalSteps: steps.length,
        stats: { ...stats },
      },
    };
  }

  // 无解（如 N=2 或 N=3）
  row = -1;
  col = -1;
  push(N_QUEENS_LINES.end, 'return', {
    zh: `回溯穷尽所有可能，未找到可行解（n = ${n} 时 N 皇后问题无解）。`,
    en: `Exhausted all possibilities; no solution exists for n = ${n}.`,
  });

  return {
    steps,
    summary: {
      result: 'no solution',
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
