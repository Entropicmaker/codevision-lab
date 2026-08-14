import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 滑动窗口：固定窗口大小 k，求最大窗口和
int maxWindowSum(const vector<int>& a, int k) {       //>func
    int n = (int)a.size();                            //>init
    int windowSum = 0, maxSum = 0;                    //>build-window
    for (int i = 0; i < k; ++i) windowSum += a[i];
    maxSum = windowSum;
    int left = 0, right = k - 1;
    while (right + 1 < n) {
        ++right;
        windowSum += a[right];                        //>slide-in
        windowSum -= a[left];                         //>slide-out
        ++left;
        if (windowSum > maxSum) maxSum = windowSum;   //>update-max
    }
    return maxSum;                                    //>end
}`;

const csharpSource = `using System;

class MaxWindowSumDemo
{
    // 滑动窗口：固定窗口大小 k，求最大窗口和
    static int MaxWindowSum(int[] a, int k) {         //>func
        int n = a.Length;                             //>init
        int windowSum = 0, maxSum = 0;                //>build-window
        for (int i = 0; i < k; ++i) windowSum += a[i];
        maxSum = windowSum;
        int left = 0, right = k - 1;
        while (right + 1 < n) {
            ++right;
            windowSum += a[right];                    //>slide-in
            windowSum -= a[left];                     //>slide-out
            ++left;
            if (windowSum > maxSum) maxSum = windowSum; //>update-max
        }
        return maxSum;                                //>end
    }
}`;

const pythonSource = `# 滑动窗口：固定窗口大小 k，求最大窗口和
def max_window_sum(a, k):           #>func
    n = len(a)                      #>init
    window_sum, max_sum = 0, 0      #>build-window
    for i in range(k):
        window_sum += a[i]
    max_sum = window_sum
    left, right = 0, k - 1
    while right + 1 < n:
        right += 1
        window_sum += a[right]      #>slide-in
        window_sum -= a[left]       #>slide-out
        left += 1
        if window_sum > max_sum:    #>update-max
            max_sum = window_sum
    return max_sum                  #>end`;

const pseudocode = `maxWindowSum(a, k):              #>func
  n = len(a)                      #>init
  windowSum, maxSum = 0, 0        #>build-window
  for i = 0 .. k-1: windowSum += a[i]
  maxSum = windowSum
  left, right = 0, k-1
  while right + 1 < n:
    right += 1
    windowSum += a[right]         #>slide-in
    windowSum -= a[left]          #>slide-out
    left += 1
    if windowSum > maxSum:        #>update-max
      maxSum = windowSum
  return maxSum                   #>end`;

export const slidingWindowMeta: AlgorithmMeta = {
  id: 'sliding-window',
  name: { zh: '滑动窗口（固定大小最大和）', en: 'Sliding Window (Fixed-Size Max Sum)' },
  category: 'sliding-window',
  difficulty: 'medium',
  description: {
    zh: '滑动窗口用一个固定大小为 k 的窗口在数组上从左向右滑动：先构建初始窗口 [0, k-1] 并求和，之后每步只让一个新元素从右侧进入、一个旧元素从左侧离开，通过增量更新窗口和避免重复计算。求固定窗口最大和因此从 O(n·k) 降到 O(n)，是"用增量维护代替重复计算"的代表技巧。',
    en: 'A sliding window moves a fixed-size window of length k across the array from left to right: build the initial window [0, k-1] and sum it, then each step lets one new element enter on the right and one old element leave on the left, updating the window sum incrementally instead of recomputing it. Finding the maximum fixed-window sum thus drops from O(n·k) to O(n) — the classic "maintain incrementally instead of recomputing" technique.',
  },
  complexity: {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
  },
  prerequisites: [],
  tags: ['滑动窗口', '前缀和', '数组', 'O(n)'],
  inputSpec: {
    name: 'a',
    kind: 'int-array',
    minLen: 0,
    maxLen: 20,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
    aux: { name: { zh: '窗口大小 k', en: 'Window size k' }, kind: 'int', min: 1, max: 8, default: 3 },
  },
  defaultInput: '2, 1, 5, 1, 3, 2, 8, 4',
  presets: [
    { name: { zh: '标准案例', en: 'Standard case' }, input: '3, 1, 4, 1, 5, 9, 2, 6' },
    { name: { zh: '单调递增', en: 'Increasing array' }, input: '1, 2, 3, 4, 5, 6' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: 'k=n（窗口覆盖全数组）', en: 'k = n (window covers the array)' }, input: '1, 2, 3' },
    { name: { zh: 'k=1（每个元素单独成窗）', en: 'k = 1 (single-element windows)' }, input: '3, 1, 4, 1, 5' },
    { name: { zh: 'k 大于数组长度', en: 'k larger than the array' }, input: '1, 2' },
  ],
  runnerId: 'sliding-window',
  visualKind: 'array-blocks',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '固定窗口大小 k 时没有先构建初始窗口', en: 'Not building the initial window first (fixed k)' },
      detail: {
        zh: '固定窗口大小 k 的滑动窗口必须先构建 [0, k-1] 的初始窗口并求出 windowSum，再开始滑动。若直接从空窗口开始每步"加一个进、减一个出"，边界处理会出错。',
        en: 'For a fixed window size k, you must first build the initial window [0, k-1] and compute its sum before sliding. Starting from an empty window and adding/removing per step makes boundary handling wrong.',
      },
    },
    {
      title: { zh: 'k 大于数组长度时越界', en: 'k larger than the array length' },
      detail: {
        zh: '当 k > n 时根本不存在长度为 k 的窗口，直接构建会访问越界或得到错误结果。应先校验：本演示在 k > n 时给出明确错误步骤。',
        en: 'When k > n there is no window of length k; building one reads out of bounds or yields a wrong result. Validate first — this demo shows an explicit error step for k > n.',
      },
    },
    {
      title: { zh: '每步重新求和（忘记增量更新）', en: 'Recomputing the whole window sum each step' },
      detail: {
        zh: '滑动窗口的核心价值是增量更新：新窗口和 = 旧窗口和 + 新进入元素 - 移出元素。若每步都对 k 个元素重新求和，复杂度退化为 O(n·k)，失去了滑动窗口的意义。',
        en: 'The core value of sliding window is incremental updates: new sum = old sum + entering element − leaving element. Re-summing all k elements each step degrades complexity back to O(n·k).',
      },
    },
  ],
};
