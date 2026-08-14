import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
#include <algorithm>
using namespace std;

// 0-1 背包：第 i 件物品重量固定为 w[i] = i+1，价值为 v[i-1]
int knapsack(vector<int>& v, int W, int n) {        //>func
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));   //>init
    for (int i = 1; i <= n; i++) {                  //>loop-i
        int w = i + 1;                              // 第 i 件物品重量 = i+1
        for (int j = 0; j <= W; j++) {              //>loop-j
            if (j < w) {                            //>skip
                dp[i][j] = dp[i - 1][j];
            } else {                                //>take
                dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - w] + v[i - 1]);
            }
        }
    }
    int j = W;                                      //>backtrack
    for (int i = n; i >= 1; i--) {
        if (dp[i][j] != dp[i - 1][j]) j -= i + 1;   // 选中第 i 件物品
    }
    return dp[n][W];                                //>end
}`;

const csharpSource = `using System;

class KnapsackDemo
{
    // 0-1 背包：第 i 件物品重量固定为 w[i] = i+1，价值为 v[i-1]
    static int Knapsack(int[] v, int W, int n) {    //>func
        int[,] dp = new int[n + 1, W + 1];          //>init
        for (int i = 1; i <= n; i++) {              //>loop-i
            int w = i + 1;                          // 第 i 件物品重量 = i+1
            for (int j = 0; j <= W; j++) {          //>loop-j
                if (j < w) {                        //>skip
                    dp[i, j] = dp[i - 1, j];
                } else {                            //>take
                    dp[i, j] = Math.Max(dp[i - 1, j], dp[i - 1, j - w] + v[i - 1]);
                }
            }
        }
        int j = W;                                  //>backtrack
        for (int i = n; i >= 1; i--) {
            if (dp[i, j] != dp[i - 1, j]) j -= i + 1;   // 选中第 i 件物品
        }
        return dp[n, W];                            //>end
    }
}`;

const pythonSource = `# 0-1 背包：第 i 件物品重量固定为 w[i] = i+1，价值为 v[i-1]
def knapsack(v, W, n):              #>func
    dp = [[0] * (W + 1) for _ in range(n + 1)]      #>init
    for i in range(1, n + 1):       #>loop-i
        w = i + 1                   # 第 i 件物品重量 = i+1
        for j in range(W + 1):      #>loop-j
            if j < w:               #>skip
                dp[i][j] = dp[i - 1][j]
            else:                   #>take
                dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - w] + v[i - 1])
    j = W                           #>backtrack
    for i in range(n, 0, -1):
        if dp[i][j] != dp[i - 1][j]:
            j -= i + 1              # 选中第 i 件物品
    return dp[n][W]                 #>end`;

const pseudocode = `knapsack(v, W, n):            #>func
  dp = table(n+1, W+1, 0)       #>init
  for i = 1 .. n:               #>loop-i
    w = i + 1
    for j = 0 .. W:             #>loop-j
      if j < w:                 #>skip
        dp[i][j] = dp[i-1][j]
      else:                     #>take
        dp[i][j] = max(dp[i-1][j], dp[i-1][j-w] + v[i-1])
  j = W                         #>backtrack
  for i = n .. 1:
    if dp[i][j] != dp[i-1][j]: j -= i + 1
  return dp[n][W]               #>end`;

export const knapsackMeta: AlgorithmMeta = {
  id: 'knapsack',
  name: { zh: '0-1 背包问题', en: '0-1 Knapsack Problem' },
  category: 'dp',
  difficulty: 'hard',
  description: {
    zh: '0-1 背包：有 n 件物品，第 i 件物品的重量固定为 w[i] = i+1（即第 1 件重 2、第 2 件重 3，依此类推），价值为输入数组的第 i 个元素。在总重量不超过容量 W 的前提下选择物品使总价值最大；每件物品只能选（0）或不选（1），不能拆分。转移方程 dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i]] + v[i])，其中 dp[i][j] 表示前 i 件物品、容量为 j 时的最大价值。本演示使用二维 DP 表、转移来源箭头，并在填表完成后回溯展示被选中的物品。',
    en: '0-1 knapsack: with n items, item i has fixed weight w[i] = i+1 (item 1 weighs 2, item 2 weighs 3, and so on) and its value is the i-th element of the input array. Choose a subset whose total weight does not exceed capacity W to maximize total value; each item is either taken (1) or not (0) — no fractions. Recurrence: dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i]] + v[i]), where dp[i][j] is the best value using the first i items within capacity j. This demo uses a 2-D DP table with source arrows, then backtracks from dp[n][W] to list the chosen items.',
  },
  complexity: {
    time: { best: 'O(nW)', average: 'O(nW)', worst: 'O(nW)' },
    space: 'O(nW)',
  },
  prerequisites: ['fibonacci'],
  tags: ['动态规划', '背包', '组合优化', '状态转移'],
  inputSpec: {
    name: 'values',
    kind: 'int-array',
    minLen: 1,
    maxLen: 6,
    valueMin: 1,
    valueMax: 99,
    aux: { name: { zh: '背包容量 W', en: 'Capacity W' }, kind: 'int', min: 1, max: 10, default: 5 },
  },
  defaultInput: '15, 20, 30, 25',
  presets: [
    { name: { zh: '标准四件', en: 'Standard 4 items' }, input: '15, 20, 30, 25' },
    { name: { zh: '三件示例', en: '3-item sample' }, input: '10, 40, 30' },
    { name: { zh: '六件示例', en: '6-item sample' }, input: '12, 5, 20, 8, 15, 9' },
  ],
  boundaryCases: [
    { name: { zh: '容量 W=1', en: 'Capacity W=1' }, input: '15, 20, 30, 25' },
    { name: { zh: '单个物品', en: 'Single item' }, input: '42' },
    { name: { zh: '价值全相等', en: 'Equal values' }, input: '7, 7, 7, 7' },
  ],
  runnerId: 'knapsack',
  visualKind: 'table',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '状态定义混乱', en: 'Confused state definition' },
      detail: {
        zh: '必须明确 dp[i][j] 表示"前 i 件物品、容量为 j 时的最大价值"，并保持下标一致。本演示中第 i 件物品重量为 i+1，价值为输入数组的第 i-1 个元素，混淆"第 i 件"与数组下标会算错转移。',
        en: 'Clearly define dp[i][j] as "max value using the first i items within capacity j" and keep indexing consistent. Here item i has weight i+1 and value = input[i-1]; mixing up "item i" with the array index leads to wrong transitions.',
      },
    },
    {
      title: { zh: '未处理 j < w 的边界', en: 'Missing the j < w boundary' },
      detail: {
        zh: '当容量 j 小于物品重量 w 时物品装不下，必须直接继承 dp[i][j] = dp[i-1][j]，否则访问 dp[i-1][j-w] 会越界。',
        en: 'When capacity j < weight w the item cannot fit; you must copy dp[i][j] = dp[i-1][j], otherwise dp[i-1][j-w] goes out of bounds.',
      },
    },
    {
      title: { zh: '把 0-1 背包当成完全背包', en: 'Treating 0-1 as the unbounded knapsack' },
      detail: {
        zh: '0-1 背包每件物品最多选一次，转移只读上一行 dp[i-1]；若直接复用当前行 dp[i]，就变成可重复选取的完全背包，答案会偏大。',
        en: 'In 0-1 knapsack each item is used at most once, so transitions read only the previous row dp[i-1]; reusing the current row dp[i] makes it the unbounded knapsack and overestimates the answer.',
      },
    },
  ],
};
