import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 插入排序：把每个元素插入到已排序前缀的正确位置
void insertionSort(vector<int>& a) {         //>func
    int n = (int)a.size();                    //>init
    for (int i = 1; i < n; ++i) {             //>outer
        int key = a[i];                       //>key
        int j = i - 1;
        while (j >= 0) {                      //>shift-loop
            if (a[j] <= key) break;           //>compare
            a[j + 1] = a[j];                  //>shift
            --j;
        }
        a[j + 1] = key;                       //>insert
    }
}                                             //>end`;

const csharpSource = `using System;

class InsertionSortDemo
{
    // 插入排序：把每个元素插入到已排序前缀的正确位置
    static void InsertionSort(int[] a) {         //>func
        int n = a.Length;                        //>init
        for (int i = 1; i < n; i++) {            //>outer
            int key = a[i];                      //>key
            int j = i - 1;
            while (j >= 0) {                     //>shift-loop
                if (a[j] <= key) break;          //>compare
                a[j + 1] = a[j];                 //>shift
                j--;
            }
            a[j + 1] = key;                      //>insert
        }
    }                                            //>end
}`;

const pythonSource = `# 插入排序：把每个元素插入到已排序前缀的正确位置
def insertion_sort(a):              #>func
    n = len(a)                      #>init
    for i in range(1, n):           #>outer
        key = a[i]                  #>key
        j = i - 1
        while j >= 0:               #>shift-loop
            if a[j] <= key:         #>compare
                break
            a[j + 1] = a[j]         #>shift
            j -= 1
        a[j + 1] = key              #>insert
    return a                        #>end`;

const pseudocode = `insertionSort(a):                    #>func
  n = len(a)                         #>init
  for i = 1 .. n-1:                  #>outer
    key = a[i]                       #>key
    j = i - 1
    while j >= 0:                    #>shift-loop
      if a[j] <= key: break          #>compare
      a[j+1] = a[j]                  #>shift
      j = j - 1
    a[j+1] = key                     #>insert
  return a                           #>end`;

export const insertionSortMeta: AlgorithmMeta = {
  id: 'insertion-sort',
  name: { zh: '插入排序', en: 'Insertion Sort' },
  category: 'sorting',
  difficulty: 'easy',
  description: {
    zh: '插入排序把每个元素插入到已排序前缀的正确位置：先取出 key，向左扫描把比 key 大的元素依次后移，最后把 key 插入空位。已排序数组最好情况只需 n-1 次比较（O(n)），平均与最坏为 O(n²)；它是稳定排序，空间 O(1)。',
    en: 'Insertion sort inserts each element into the correct position of the sorted prefix: it takes a key, scans leftward shifting every larger element right, then inserts the key into the gap. On an already-sorted array the best case is n-1 comparisons (O(n)); average and worst are O(n²). It is stable and uses O(1) space.',
  },
  complexity: {
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
  },
  prerequisites: ['bubble-sort'],
  tags: ['排序', '插入', '稳定', '入门'],
  inputSpec: {
    name: 'a',
    kind: 'int-array',
    minLen: 0,
    maxLen: 20,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
  },
  defaultInput: '29, 10, 14, 37, 13, 5, 48, 2',
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
  runnerId: 'insertion-sort',
  visualKind: 'array-bars',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '稳定性：相等元素不得移位', en: 'Stability: never shift equal elements' },
      detail: {
        zh: '只有当 a[j] > key 时才后移（严格大于）。相等元素保持原有相对顺序，因此插入排序是稳定排序。若误写成 a[j] >= key，会把相等元素也后移，破坏稳定性。',
        en: 'Shift only when a[j] > key (strictly greater). Equal elements keep their relative order, making insertion sort stable. Writing a[j] >= key shifts equal elements too and breaks stability.',
      },
      code: 'while (j >= 0 && a[j] > key)  // 正确：严格大于\n// while (j >= 0 && a[j] >= key) // 错误：破坏稳定性',
    },
    {
      title: { zh: '忘记先用临时变量保存 key', en: 'Forgetting to save key in a temporary variable' },
      detail: {
        zh: '后移操作 a[j+1] = a[j] 会覆盖 a[i]，所以必须先 int key = a[i] 保存待插入值。若直接对 a[i] 操作，key 的值会在第一次移位时被冲掉。',
        en: 'The shift a[j+1] = a[j] overwrites a[i], so you must first save the value in a temporary key = a[i]. Without it, the key value is lost on the first shift.',
      },
      code: 'int key = a[i];  // 必须保存，移位会覆盖 a[i]',
    },
    {
      title: { zh: '误以为插入排序总是 O(n²)', en: 'Assuming insertion sort is always O(n²)' },
      detail: {
        zh: '插入排序在已排序数组上最好情况只需 n-1 次比较（内层循环一次都不移位），复杂度为 O(n)。它对"基本有序"的输入非常高效，这一点常被用来优化小规模排序。',
        en: 'On an already-sorted array insertion sort only needs n-1 comparisons (the inner loop never shifts), giving O(n). It is very efficient on nearly-sorted input, which is why it is used to optimize small subarrays.',
      },
    },
  ],
};
