import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <cstdlib>
using namespace std;

// N 皇后：逐行回溯，找到第一个可行解
bool isSafe(int row, int col, const vector<int>& board) {
    for (int r = 0; r < row; r++) {
        if (board[r] == col) return false;                     //>check-col
        if (abs(row - r) == abs(col - board[r])) return false; //>check-diag
    }
    return true;
}

bool solve(vector<int>& board, int row, int n) {              //>func
    if (row == n) return true;                                //>found
    for (int col = 0; col < n; col++) {                       //>place
        if (isSafe(row, col, board)) {
            board[row] = col;
            if (solve(board, row + 1, n)) return true;
            board[row] = -1;                                  //>backtrack
        }
    }
    return false;
}

int solveNQueens(int n) {                                     //>init
    vector<int> board(n, -1);
    solve(board, 0, n);
    return 0;                                                 //>end
}`;

const csharpSource = `using System;

class NQueensDemo
{
    // N 皇后：逐行回溯，找到第一个可行解
    static bool IsSafe(int row, int col, int[] board)
    {
        for (int r = 0; r < row; r++)
        {
            if (board[r] == col) return false;                         //>check-col
            if (Math.Abs(row - r) == Math.Abs(col - board[r])) return false; //>check-diag
        }
        return true;
    }

    static bool Solve(int[] board, int row, int n)             //>func
    {
        if (row == n) return true;                             //>found
        for (int col = 0; col < n; col++)                      //>place
        {
            if (IsSafe(row, col, board))
            {
                board[row] = col;
                if (Solve(board, row + 1, n)) return true;
                board[row] = -1;                               //>backtrack
            }
        }
        return false;
    }

    static int SolveNQueens(int n)                             //>init
    {
        int[] board = new int[n];
        for (int i = 0; i < n; i++) board[i] = -1;
        Solve(board, 0, n);
        return 0;                                              //>end
    }
}`;

const pythonSource = `# N 皇后：逐行回溯，找到第一个可行解
def is_safe(row, col, board):
    for r in range(row):
        if board[r] == col:                      #>check-col
            return False
        if abs(row - r) == abs(col - board[r]):  #>check-diag
            return False
    return True

def solve(board, row, n):                        #>func
    if row == n:                                 #>found
        return True
    for col in range(n):                         #>place
        if is_safe(row, col, board):
            board[row] = col
            if solve(board, row + 1, n):
                return True
            board[row] = -1                      #>backtrack
    return False

def solve_n_queens(n):                           #>init
    board = [-1] * n
    solve(board, 0, n)
    return 0                                     #>end`;

const pseudocode = `solve(board, row, n):                    #>func
  if row == n: return true               #>found
  for col in 0 .. n-1:                   #>place
    if isSafe(row, col, board):
      board[row] = col
      if solve(board, row+1, n): return true
      board[row] = -1                    #>backtrack

isSafe(row, col, board):                 # 辅助：判断同列/对角线冲突
  for r in 0 .. row-1:
    if board[r] == col: return false     #>check-col
    if |row-r| == |col-board[r]|: return false  #>check-diag
  return true

solveNQueens(n):                         #>init
  board = [-1] * n
  solve(board, 0, n)
  return solution                        #>end`;

export const nQueensMeta: AlgorithmMeta = {
  id: 'n-queens',
  name: { zh: 'N 皇后（回溯）', en: 'N-Queens (Backtracking)' },
  category: 'backtracking',
  difficulty: 'hard',
  description: {
    zh: 'N 皇后问题要求在 N×N 棋盘上放置 N 个皇后，使任意两个皇后不在同一行、同一列或同一条对角线上。由于每行必须且只能放一个皇后，可以把问题化为「逐行选择列」，用回溯法系统枚举：在当前行尝试每一列，若与已放置的皇后冲突就剪枝，放不下则回退到上一行换一列。最坏情况需要枚举接近 N! 种排列，但剪枝能大幅减少实际搜索。本演示用棋盘表格逐格展示尝试、冲突检查与回溯过程，找到第一个可行解。',
    en: 'The N-queens problem asks to place N queens on an N×N board so that no two queens share a row, column, or diagonal. Since each row must contain exactly one queen, the problem reduces to "choose a column per row", solved by systematic backtracking: try each column in the current row, prune on any conflict with already-placed queens, and if a row has no valid column, backtrack to the previous row and try its next column. In the worst case this approaches N! arrangements, but pruning drastically cuts the real search. This demo shows the attempt, conflict check, and backtracking cell by cell on a board table, stopping at the first valid solution.',
  },
  complexity: {
    time: { best: 'O(N!)', average: 'O(N!)', worst: 'O(N!)' },
    space: 'O(N)',
  },
  prerequisites: ['dfs'],
  tags: ['回溯', 'DFS', '约束满足', '棋盘', '剪枝'],
  inputSpec: {
    name: 'n',
    kind: 'int-array',
    minLen: 0,
    maxLen: 0,
    valueMin: 0,
    valueMax: 0,
    allowEmpty: true,
    aux: { name: { zh: '棋盘大小 N', en: 'Board size N' }, kind: 'int', min: 4, max: 8, default: 4 },
  },
  // 数组输入固定为空（maxLen = 0），真正输入是 aux = N
  defaultInput: '',
  presets: [
    { name: { zh: '默认 N=4', en: 'Default N=4' }, input: '' },
    { name: { zh: 'N=5', en: 'N=5' }, input: '', aux: 5 },
    { name: { zh: 'N=8（经典 8 皇后）', en: 'N=8 (classic 8-queens)' }, input: '', aux: 8 },
  ],
  boundaryCases: [
    { name: { zh: 'N=4（最小可行棋盘）', en: 'N=4 (smallest solvable board)' }, input: '', aux: 4 },
    { name: { zh: 'N=5', en: 'N=5' }, input: '', aux: 5 },
    { name: { zh: 'N=8（经典 8 皇后）', en: 'N=8 (classic 8-queens)' }, input: '', aux: 8 },
  ],
  runnerId: 'n-queens',
  visualKind: 'table',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '对角线冲突判断写错', en: 'Wrong diagonal-conflict test' },
      detail: {
        zh: '两个皇后 (r1,c1) 与 (r2,c2) 在同一条对角线上当且仅当 |r1-r2| == |c1-c2|（等价于行列差相等或行列和相等）。只检查同列而漏掉对角线，或把「行列和」误写成「行列差」，都会漏判冲突、产生错误解。',
        en: 'Queens (r1,c1) and (r2,c2) share a diagonal iff |r1-r2| == |c1-c2| (equivalently, row diff equals col diff). Checking only the same column, or confusing row+col with row-col, misses conflicts and yields wrong solutions.',
      },
      code: 'if (r1 + c1 == r2 + c2 || r1 - c1 == r2 - c2) return false;  // 两条对角线都要查',
    },
    {
      title: { zh: '回溯时忘记撤销状态', en: 'Forgetting to undo state on backtrack' },
      detail: {
        zh: '回溯返回前必须把 board[row] 重置（撤销本行的皇后），否则下一次尝试会基于被污染的棋盘，导致错误解或漏解。',
        en: 'Before returning from a failed branch, reset board[row] (undo this row\'s queen); otherwise the next attempt starts from a polluted board and yields wrong or missing solutions.',
      },
      code: 'board[row] = -1;  // 撤销本行皇后后再返回',
    },
    {
      title: { zh: '忽略 N=2、N=3 无解的边界', en: 'Ignoring that N=2, N=3 have no solution' },
      detail: {
        zh: 'N=2 和 N=3 时 N 皇后问题无解。若代码在这些规模下仍强行返回一个解或陷入死循环，说明回溯的终止条件（行号回退到 0 以下）没有正确处理。',
        en: 'There is no solution for N=2 or N=3. If the code forces a result or loops forever at these sizes, the backtracking terminal condition (row index falling below 0) is not handled correctly.',
      },
    },
  ],
};
