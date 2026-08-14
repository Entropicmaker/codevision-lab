import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 选择排序：每轮从未排序部分选出最小值，放到已排序前缀末尾
void selectionSort(vector<int>& a) {         //>func
    int n = (int)a.size();                    //>init
    for (int i = 0; i < n - 1; ++i) {         //>outer
        int minIndex = i;
        for (int j = i + 1; j < n; ++j) {     //>inner
            if (a[j] < a[minIndex]) {         //>compare
                minIndex = j;                 //>update-min
            }
        }
        swap(a[i], a[minIndex]);              //>swap
    }
}                                             //>end`;

const csharpSource = `using System;

class SelectionSortDemo
{
    // 选择排序：每轮从未排序部分选出最小值，放到已排序前缀末尾
    static void SelectionSort(int[] a) {                  //>func
        int n = a.Length;                                 //>init
        for (int i = 0; i < n - 1; i++) {                 //>outer
            int minIndex = i;
            for (int j = i + 1; j < n; j++) {             //>inner
                if (a[j] < a[minIndex]) {                 //>compare
                    minIndex = j;                         //>update-min
                }
            }
            (a[i], a[minIndex]) = (a[minIndex], a[i]);    //>swap
        }
    }                                                     //>end
}`;

const pythonSource = `# 选择排序：每轮从未排序部分选出最小值，放到已排序前缀末尾
def selection_sort(a):                  #>func
    n = len(a)                          #>init
    for i in range(n - 1):              #>outer
        min_index = i
        for j in range(i + 1, n):       #>inner
            if a[j] < a[min_index]:     #>compare
                min_index = j           #>update-min
        a[i], a[min_index] = a[min_index], a[i]  #>swap
    return a                            #>end`;

const pseudocode = `selectionSort(a):                    #>func
  n = len(a)                         #>init
  for i = 0 .. n-2:                  #>outer
    minIndex = i
    for j = i+1 .. n-1:              #>inner
      if a[j] < a[minIndex]:         #>compare
        minIndex = j                 #>update-min
    swap(a[i], a[minIndex])          #>swap
  return a                           #>end`;

export const selectionSortMeta: AlgorithmMeta = {
  id: 'selection-sort',
  name: { zh: '选择排序', en: 'Selection Sort' },
  category: 'sorting',
  difficulty: 'easy',
  description: {
    zh: '选择排序每轮从未排序部分选出最小值，与未排序部分的第一个元素交换，逐步扩大已排序前缀。它简单直观，比较次数恒为 n(n-1)/2（与输入无关，无法提前终止），但交换次数少，最多 n-1 次。适合在"交换代价高、比较代价低"的场景使用。',
    en: 'Selection sort finds the minimum of the unsorted part each round and swaps it with the first element of that part, growing the sorted prefix. It is simple and intuitive: the number of comparisons is always n(n-1)/2 (independent of input, no early exit), but swaps are few — at most n-1. It suits scenarios where swaps are expensive and comparisons are cheap.',
  },
  complexity: {
    time: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
  },
  prerequisites: ['bubble-sort'],
  tags: ['排序', '选择', '入门'],
  inputSpec: {
    name: 'a',
    kind: 'int-array',
    minLen: 0,
    maxLen: 20,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
  },
  defaultInput: '34, 7, 23, 32, 5, 62, 1, 18',
  presets: [
    { name: { zh: '已排序数组', en: 'Sorted array' }, input: '1, 2, 3, 4, 5' },
    { name: { zh: '逆序数组', en: 'Reversed array' }, input: '9, 7, 5, 3, 1' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单个元素', en: 'Single element' }, input: '7' },
    { name: { zh: '已排序', en: 'Already sorted' }, input: '1, 2, 3, 4, 5' },
    { name: { zh: '逆序', en: 'Reversed' }, input: '9, 7, 5, 3, 1' },
    { name: { zh: '全部相等', en: 'All equal' }, input: '4, 4, 4, 4' },
  ],
  runnerId: 'selection-sort',
  visualKind: 'array-bars',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '内层循环从 0 开始而不是 i+1', en: 'Starting the inner loop at 0 instead of i+1' },
      detail: {
        zh: '前 i 个元素已经是排序好的前缀，无需再参与比较。内层应从 j = i+1 开始，在 [i, n-1] 中找最小值；若从 0 开始会重复比较已排序前缀，结果虽仍正确却浪费了比较次数。',
        en: 'The first i elements already form a sorted prefix and need not be compared again. The inner loop should start at j = i+1 to find the minimum in [i, n-1]; starting at 0 re-scans the sorted prefix and wastes comparisons.',
      },
      code: 'for (int j = i + 1; j < n; ++j)  // 正确\n// for (int j = 0; j < n; ++j)  // 错误：重复扫描已排序前缀',
    },
    {
      title: { zh: '误以为选择排序能提前终止', en: 'Assuming selection sort can exit early' },
      detail: {
        zh: '选择排序必须每轮完整扫描剩余区间才能确定最小值，因此比较次数恒为 n(n-1)/2，最好、平均、最坏都是 O(n²)。这与冒泡/插入排序（可提前终止到 O(n)）不同。',
        en: 'Selection sort must scan the whole remaining range each round to locate the minimum, so comparisons are always n(n-1)/2 and best/avg/worst are all O(n²). This differs from bubble/insertion sort, which can exit early.',
      },
    },
    {
      title: { zh: '稳定性：交换可能跨越相等元素', en: 'Stability: a swap can jump over equal elements' },
      detail: {
        zh: '当 a[i] 与远处更小的 a[min] 交换时，可能把一个相等元素跳过，从而打乱相等元素的相对顺序，因此选择排序通常是不稳定排序。若需要稳定排序，应改用插入排序或冒泡排序。',
        en: 'Swapping a[i] with a farther smaller a[min] can leap over equal elements and break their relative order, so selection sort is generally unstable. Use insertion sort or bubble sort when stability is required.',
      },
    },
  ],
};
