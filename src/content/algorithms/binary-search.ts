import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 二分搜索：在有序数组 a 中查找 target，返回下标或 -1
int binarySearch(const vector<int>& a, int target) { //>func
    int lo = 0, hi = (int)a.size() - 1;              //>init
    while (lo <= hi) {                               //>while
        int mid = lo + (hi - lo) / 2;                //>mid
        if (a[mid] == target) {                      //>compare
            return mid;                              //>found
        } else if (a[mid] < target) {                //>up-lo
            lo = mid + 1;
        } else {                                     //>up-hi
            hi = mid - 1;
        }
    }
    return -1;                                       //>not-found
}`;

const csharpSource = `using System;

class BinarySearchDemo
{
    // 二分搜索：在有序数组 a 中查找 target，返回下标或 -1
    static int BinarySearch(int[] a, int target) {   //>func
        int lo = 0, hi = a.Length - 1;               //>init
        while (lo <= hi) {                           //>while
            int mid = lo + (hi - lo) / 2;            //>mid
            if (a[mid] == target) {                  //>compare
                return mid;                          //>found
            } else if (a[mid] < target) {            //>up-lo
                lo = mid + 1;
            } else {                                 //>up-hi
                hi = mid - 1;
            }
        }
        return -1;                                   //>not-found
    }
}`;

const pythonSource = `# 二分搜索：在有序数组 a 中查找 target，返回下标或 -1
def binary_search(a, target):       #>func
    lo, hi = 0, len(a) - 1          #>init
    while lo <= hi:                 #>while
        mid = (lo + hi) // 2        #>mid
        if a[mid] == target:        #>compare
            return mid              #>found
        elif a[mid] < target:       #>up-lo
            lo = mid + 1
        else:                       #>up-hi
            hi = mid - 1
    return -1                       #>not-found`;

const pseudocode = `binarySearch(a, target):        #>func
  lo, hi = 0, len(a)-1           #>init
  while lo <= hi:                #>while
    mid = (lo + hi) / 2          #>mid
    if a[mid] == target:         #>compare
      return mid                 #>found
    elif a[mid] < target:        #>up-lo
      lo = mid + 1
    else:                        #>up-hi
      hi = mid - 1
  return -1                      #>not-found`;

export const binarySearchMeta: AlgorithmMeta = {
  id: 'binary-search',
  name: { zh: '二分搜索', en: 'Binary Search' },
  category: 'searching',
  difficulty: 'easy',
  description: {
    zh: '二分搜索在有序数组中每次取中点与目标比较，将搜索区间缩小一半，直到找到目标或区间为空。时间复杂度 O(log n)，是"减而治之"思想的经典入门。',
    en: 'Binary search repeatedly compares the middle element of a sorted array with the target and halves the search range until the target is found or the range is empty. O(log n) time — the classic introduction to decrease-and-conquer.',
  },
  complexity: {
    time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    space: 'O(1)',
  },
  prerequisites: [],
  tags: ['搜索', '分治', '有序数组'],
  inputSpec: {
    name: 'a',
    kind: 'int-array',
    minLen: 0,
    maxLen: 20,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
    aux: { name: { zh: '目标值 target', en: 'Target value' }, kind: 'int', min: 1, max: 99, default: 23 },
  },
  defaultInput: '2, 5, 8, 12, 16, 23, 38, 45, 56, 72',
  presets: [
    { name: { zh: '标准有序数组', en: 'Standard sorted array' }, input: '1, 4, 7, 10, 15, 20, 23, 33' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单元素命中', en: 'Single hit' }, input: '7', aux: 7 },
    { name: { zh: '目标不存在', en: 'Target missing' }, input: '2, 5, 8, 12, 16, 38', aux: 77 },
    { name: { zh: '目标在左边界', en: 'Target at left edge' }, input: '2, 5, 8, 12, 16, 23, 38', aux: 2 },
  ],
  runnerId: 'binary-search',
  visualKind: 'array-blocks',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: 'mid 计算溢出', en: 'mid overflow' },
      detail: {
        zh: '在 C++/C# 中 (lo + hi) / 2 在 lo、hi 接近整数上限时会溢出。应写 lo + (hi - lo) / 2。Python 大整数不受影响，但习惯保持一致更好。',
        en: 'In C++/C#, (lo + hi) / 2 can overflow when lo and hi are near the integer limit. Prefer lo + (hi - lo) / 2.',
      },
      code: 'int mid = lo + (hi - lo) / 2;  // 安全写法',
    },
    {
      title: { zh: '区间更新写成 mid 而非 mid±1', en: 'Updating bounds with mid instead of mid ± 1' },
      detail: {
        zh: '若写成 lo = mid（而不是 mid + 1），当区间只剩两个元素且目标在右侧时可能死循环。排除中点必须使用 mid ± 1。',
        en: 'Using lo = mid instead of mid + 1 can loop forever when two elements remain. Always exclude the midpoint with mid ± 1.',
      },
    },
    {
      title: { zh: '忘记数组必须有序', en: 'Forgetting the sorted precondition' },
      detail: {
        zh: '二分搜索依赖有序性：无序数组上"缩小一半"没有意义。本演示在无序输入时给出明确提示。',
        en: 'Binary search relies on sorted order; halving an unsorted array is meaningless. This demo shows an explicit error for unsorted input.',
      },
    },
  ],
};
