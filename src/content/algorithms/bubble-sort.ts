import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 冒泡排序：每一轮把未排序部分的最大值"冒泡"到末尾
void bubbleSort(vector<int>& a) {          //>func
    int n = (int)a.size();                 //>init
    for (int i = 0; i < n - 1; ++i) {      //>outer
        for (int j = 0; j < n - 1 - i; ++j) { //>inner
            if (a[j] > a[j + 1]) {         //>compare
                swap(a[j], a[j + 1]);      //>swap
            }
        }
    }
}                                          //>end`;

const csharpSource = `using System;

class BubbleSortDemo
{
    // 冒泡排序：每一轮把未排序部分的最大值"冒泡"到末尾
    static void BubbleSort(int[] a) {              //>func
        int n = a.Length;                          //>init
        for (int i = 0; i < n - 1; i++) {          //>outer
            for (int j = 0; j < n - 1 - i; j++) {  //>inner
                if (a[j] > a[j + 1]) {             //>compare
                    (a[j], a[j + 1]) = (a[j + 1], a[j]); //>swap
                }
            }
        }
    }                                              //>end
}`;

const pythonSource = `# 冒泡排序：每一轮把未排序部分的最大值"冒泡"到末尾
def bubble_sort(a):                 #>func
    n = len(a)                      #>init
    for i in range(n - 1):          #>outer
        for j in range(n - 1 - i):  #>inner
            if a[j] > a[j + 1]:     #>compare
                a[j], a[j + 1] = a[j + 1], a[j]  #>swap
    return a                        #>end`;

const pseudocode = `bubbleSort(a):                        #>func
  n = len(a)                          #>init
  for i = 0 .. n-2:                   #>outer
    for j = 0 .. n-i-2:               #>inner
      if a[j] > a[j+1]:               #>compare
        swap(a[j], a[j+1])            #>swap
  return a                            #>end`;

export const bubbleSortMeta: AlgorithmMeta = {
  id: 'bubble-sort',
  name: { zh: '冒泡排序', en: 'Bubble Sort' },
  category: 'sorting',
  difficulty: 'easy',
  description: {
    zh: '冒泡排序是最直观的交换排序：每一轮从头开始两两比较相邻元素，把未排序部分的最大值"冒泡"到末尾。经过 n-1 轮后数组有序。它是理解"比较 + 交换"排序思想的起点。',
    en: 'Bubble sort is the most intuitive swap-based sort: each pass compares adjacent pairs from the start and bubbles the largest value of the unsorted part to the end. After n-1 passes the array is sorted. It is the starting point for understanding compare-and-swap sorting.',
  },
  complexity: {
    time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
  },
  prerequisites: [],
  tags: ['排序', '交换', '入门'],
  inputSpec: {
    name: 'a',
    kind: 'int-array',
    minLen: 0,
    maxLen: 20,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
  },
  defaultInput: '5, 3, 8, 1, 9, 2',
  presets: [
    { name: { zh: '已排序数组', en: 'Sorted array' }, input: '1, 2, 3, 4, 5' },
    { name: { zh: '逆序数组', en: 'Reversed array' }, input: '9, 7, 5, 3, 1' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单个元素', en: 'Single element' }, input: '7' },
    { name: { zh: '两个元素', en: 'Two elements' }, input: '2, 1' },
    { name: { zh: '全部相等', en: 'All equal' }, input: '4, 4, 4, 4' },
  ],
  runnerId: 'bubble-sort',
  visualKind: 'array-bars',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '内层边界写成 j < n-1', en: 'Writing the inner bound as j < n-1' },
      detail: {
        zh: '若内层循环用 j < n-1 而不是 j < n-1-i，会把已排好的后缀再次比较，甚至访问越界。外层每完成一轮，末尾就多一个已就位元素，内层上界必须随之收缩。',
        en: 'Using j < n-1 instead of j < n-1-i re-compares the sorted suffix. Each finished pass fixes one more element at the end, so the inner bound must shrink accordingly.',
      },
      code: 'for (int j = 0; j < n - 1 - i; ++j)  // 正确\n// for (int j = 0; j < n - 1; ++j) // 错误：重复比较已排序后缀',
    },
    {
      title: { zh: '没有利用"提前终止"优化', en: 'Missing the early-exit optimization' },
      detail: {
        zh: '标准实现无论输入如何都是 O(n²)。若某一轮没有发生任何交换，说明数组已有序，可以提前结束，最好情况降为 O(n)。本演示展示的是标准版本。',
        en: 'The standard version is O(n²) regardless of input. If a pass performs no swaps the array is already sorted and we can stop early, improving the best case to O(n). This demo shows the standard version.',
      },
      code: 'bool swapped = true;\nwhile (swapped) { swapped = false; /* …交换时置 true */ }',
    },
    {
      title: { zh: '稳定性：相等元素不交换', en: 'Stability: never swap equal elements' },
      detail: {
        zh: '只有当 a[j] > a[j+1] 时才交换（严格大于）。相等元素保持原有相对顺序，因此冒泡排序是稳定排序。若误写成 >= 会破坏稳定性。',
        en: 'Swap only when a[j] > a[j+1] (strictly greater). Equal elements keep their relative order, making bubble sort stable. Writing >= breaks stability.',
      },
    },
  ],
};
