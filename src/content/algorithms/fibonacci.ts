import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 斐波那契：自底向上 DP，dp[i] = dp[i-1] + dp[i-2]
int fib(int n) {                         //>func
    if (n < 2) return n;                 //>base
    vector<int> dp(n + 1);               //>init
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) {       //>loop
        dp[i] = dp[i - 1] + dp[i - 2];   //>compute
    }
    return dp[n];                        //>end
}`;

const csharpSource = `using System;

class FibDemo
{
    // 斐波那契：自底向上 DP，dp[i] = dp[i-1] + dp[i-2]
    static int Fib(int n) {              //>func
        if (n < 2) return n;             //>base
        int[] dp = new int[n + 1];       //>init
        dp[0] = 0; dp[1] = 1;
        for (int i = 2; i <= n; i++) {   //>loop
            dp[i] = dp[i - 1] + dp[i - 2];   //>compute
        }
        return dp[n];                    //>end
    }
}`;

const pythonSource = `# 斐波那契：自底向上 DP，dp[i] = dp[i-1] + dp[i-2]
def fib(n):                     #>func
    if n < 2:                   #>base
        return n
    dp = [0] * (n + 1)          #>init
    dp[0], dp[1] = 0, 1
    for i in range(2, n + 1):   #>loop
        dp[i] = dp[i - 1] + dp[i - 2]   #>compute
    return dp[n]                #>end`;

const pseudocode = `fib(n):                     #>func
  if n < 2: return n           #>base
  dp = array(n+1)              #>init
  dp[0] = 0; dp[1] = 1
  for i = 2 .. n:              #>loop
    dp[i] = dp[i-1] + dp[i-2]  #>compute
  return dp[n]                 #>end`;

export const fibonacciMeta: AlgorithmMeta = {
  id: 'fibonacci',
  name: { zh: '斐波那契数列（动态规划）', en: 'Fibonacci Sequence (DP)' },
  category: 'dp',
  difficulty: 'easy',
  description: {
    zh: '斐波那契数列满足 F(n) = F(n-1) + F(n-2)，存在大量重叠子问题：朴素递归会反复计算相同的子问题，复杂度高达 O(2^n)。动态规划自底向上填表，每个子问题只算一次，把时间降到 O(n)。本演示用一张一维 DP 表逐步展示 dp[i] = dp[i-1] + dp[i-2] 的转移过程，并用箭头标出每个值的两个来源。',
    en: 'The Fibonacci sequence obeys F(n) = F(n-1) + F(n-2) and has heavily overlapping subproblems: naive recursion recomputes the same subproblems, giving O(2^n). Dynamic programming fills the table bottom-up so each subproblem is solved once, reducing time to O(n). This demo uses a 1-D DP table to show each transition dp[i] = dp[i-1] + dp[i-2] with arrows pointing at the two sources.',
  },
  complexity: {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  prerequisites: [],
  tags: ['动态规划', '递推', '重叠子问题', '自底向上'],
  inputSpec: {
    name: 'n',
    kind: 'int-array',
    minLen: 0,
    maxLen: 0,
    valueMin: 0,
    valueMax: 0,
    allowEmpty: true,
    aux: { name: { zh: '项数 n', en: 'Index n' }, kind: 'int', min: 0, max: 20, default: 8 },
  },
  // 数组输入固定为空（maxLen = 0），真正输入是 aux = n
  defaultInput: '',
  presets: [{ name: { zh: '默认 n=8', en: 'Default n=8' }, input: '' }],
  boundaryCases: [
    // chips 只设置数组字段（必须为空）；实际 n 由右侧 aux 输入框决定
    { name: { zh: 'n=0（最小项）', en: 'n=0 (minimum)' }, input: '' },
    { name: { zh: 'n=1（边界）', en: 'n=1 (edge)' }, input: ' ' },
    { name: { zh: 'n=2（首次递推）', en: 'n=2 (first recurrence)' }, input: '  ' },
  ],
  runnerId: 'fibonacci',
  visualKind: 'table',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '递归不加记忆化导致指数爆炸', en: 'Exponential blowup without memoization' },
      detail: {
        zh: '朴素递归 fib(n) = fib(n-1) + fib(n-2) 会重复计算大量相同的子问题，时间复杂度 O(2^n)。要么加记忆化（自顶向下），要么自底向上填表（本演示采用后者）。',
        en: 'Naive recursion fib(n) = fib(n-1) + fib(n-2) recomputes the same subproblems, giving O(2^n) time. Add memoization (top-down) or fill the table bottom-up (as this demo does).',
      },
      code: 'return fib(n - 1) + fib(n - 2);  // 无记忆化 → O(2^n)',
    },
    {
      title: { zh: 'n=0 或 n=1 时数组越界', en: 'Out-of-bounds access for n=0 or n=1' },
      detail: {
        zh: '若在 n < 2 时仍访问 dp[1] 或 dp[i-2]，会越界。应先处理基本情况 dp[0]=0、dp[1]=1，并让循环从 i=2 开始。',
        en: 'Accessing dp[1] or dp[i-2] when n < 2 goes out of bounds. Set base cases dp[0]=0, dp[1]=1 first and start the loop at i=2.',
      },
    },
  ],
};
