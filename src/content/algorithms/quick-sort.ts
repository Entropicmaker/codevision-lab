import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 快速排序（Lomuto 分区）：选最右元素为轴，小于轴的移到左侧
void quickSort(vector<int>& a, int l, int r) {   //>func
    if (l >= r) return;                          //>init
    int pivot = a[r];                            //>pivot
    int i = l - 1;
    for (int j = l; j < r; ++j) {                //>scan
        if (a[j] < pivot) {                      //>compare
            ++i;
            swap(a[i], a[j]);                    //>swap
        }
    }
    swap(a[i + 1], a[r]);                        //>place
    int pIdx = i + 1;                            //>partition
    quickSort(a, l, pIdx - 1);                   //>left
    quickSort(a, pIdx + 1, r);                   //>right
}                                                //>end`;

const csharpSource = `using System;

class QuickSortDemo
{
    // 快速排序（Lomuto 分区）：选最右元素为轴，小于轴的移到左侧
    static void QuickSort(int[] a, int l, int r) {   //>func
        if (l >= r) return;                          //>init
        int pivot = a[r];                            //>pivot
        int i = l - 1;
        for (int j = l; j < r; j++) {                //>scan
            if (a[j] < pivot) {                      //>compare
                i++;
                (a[i], a[j]) = (a[j], a[i]);         //>swap
            }
        }
        (a[i + 1], a[r]) = (a[r], a[i + 1]);         //>place
        int pIdx = i + 1;                            //>partition
        QuickSort(a, l, pIdx - 1);                   //>left
        QuickSort(a, pIdx + 1, r);                   //>right
    }                                                //>end
}`;

const pythonSource = `# 快速排序（Lomuto 分区）：选最右元素为轴，小于轴的移到左侧
def quick_sort(a, l, r):                #>func
    if l >= r:                          #>init
        return
    pivot = a[r]                        #>pivot
    i = l - 1
    for j in range(l, r):               #>scan
        if a[j] < pivot:                #>compare
            i += 1
            a[i], a[j] = a[j], a[i]     #>swap
    a[i + 1], a[r] = a[r], a[i + 1]     #>place
    pIdx = i + 1                        #>partition
    quick_sort(a, l, pIdx - 1)          #>left
    quick_sort(a, pIdx + 1, r)          #>right
    # 本帧执行完毕，返回上一层          #>end`;

const pseudocode = `quickSort(a, l, r):                 #>func
  if l >= r: return                 #>init
  pivot = a[r]                      #>pivot
  i = l - 1
  for j = l .. r-1:                 #>scan
    if a[j] < pivot:                #>compare
      i += 1
      swap(a[i], a[j])              #>swap
  swap(a[i+1], a[r])                #>place
  pIdx = i + 1                      #>partition
  quickSort(a, l, pIdx-1)           #>left
  quickSort(a, pIdx+1, r)           #>right
  # 本帧执行完毕                    #>end`;

export const quickSortMeta: AlgorithmMeta = {
  id: 'quick-sort',
  name: { zh: '快速排序', en: 'Quick Sort' },
  category: 'sorting',
  difficulty: 'hard',
  description: {
    zh: '快速排序是分治思想的经典应用：每次选一个"轴"（pivot），把区间划分成"小于轴"与"大于轴"两部分，再对左右子区间递归地做同样的事。轴经过一次分区就落在最终位置上。本演示采用 Lomuto 分区（选最右元素为轴），并用显式栈模拟递归，调用栈面板可实时观察每一帧的入栈 / 出栈。平均与最好 O(n log n)，最坏 O(n²)（已排序输入且选最右轴时），空间 O(log n)（递归深度）。',
    en: 'Quick sort is a classic divide-and-conquer algorithm: it picks a pivot, partitions the range into "less than pivot" and "greater than pivot" halves, then recurses on each half. After one partition the pivot lands in its final position. This demo uses Lomuto partitioning (rightmost element as pivot) and simulates recursion with an explicit stack, so the call-stack panel shows every frame being pushed and popped. Average and best case O(n log n), worst case O(n²) (sorted input with a rightmost pivot), O(log n) space (recursion depth).',
  },
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(log n)',
  },
  prerequisites: ['merge-sort'],
  tags: ['排序', '分治', '递归', '原地'],
  inputSpec: {
    name: 'a',
    kind: 'int-array',
    minLen: 0,
    maxLen: 20,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
  },
  defaultInput: '8, 3, 5, 1, 9, 2, 7, 4',
  presets: [
    { name: { zh: '乱序数组', en: 'Random array' }, input: '8, 3, 5, 1, 9, 2, 7, 4' },
    { name: { zh: '已排序数组（最坏情况）', en: 'Sorted array (worst case)' }, input: '1, 2, 3, 4, 5, 6, 7, 8' },
    { name: { zh: '逆序数组', en: 'Reversed array' }, input: '9, 7, 5, 3, 1' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单个元素', en: 'Single element' }, input: '7' },
    { name: { zh: '两个元素', en: 'Two elements' }, input: '2, 1' },
    { name: { zh: '全部相等', en: 'All equal' }, input: '4, 4, 4, 4' },
  ],
  runnerId: 'quick-sort',
  visualKind: 'array-bars',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '最坏情况：已排序输入 + 选最右元素为轴', en: 'Worst case: sorted input with a rightmost pivot' },
      detail: {
        zh: '若数组已经有序且总是选最右元素为轴，每次分区只会缩小一个元素，退化成 O(n²)。工程上常用"随机化选轴"或"三数取中"（首、中、尾三个元素取中间值）来规避，使平均复杂度稳定在 O(n log n)。',
        en: 'If the array is already sorted and the rightmost element is always chosen as pivot, each partition shrinks by only one element and the algorithm degrades to O(n²). Randomizing the pivot or using median-of-three (first/middle/last) avoids this and keeps the average at O(n log n).',
      },
      code: 'int mid = l + (r - l) / 2;\n// 三数取中：把首/中/尾的中位数换到末尾作为轴\nif (a[mid] < a[l]) swap(a[l], a[mid]);\nif (a[r] < a[l]) swap(a[l], a[r]);\nif (a[mid] < a[r]) swap(a[mid], a[r]);',
    },
    {
      title: { zh: 'i 的初始值写成 l（off-by-one）', en: 'Initializing i as l instead of l-1' },
      detail: {
        zh: 'Lomuto 分区中 i 表示"小于轴区域"的右边界，初始应为 l-1。若误写成 l，第一个小于轴的元素会把 i 先自增到 l+1 再交换，位置 l 的元素就永远留在错误的一侧，最终数组无法正确排序。',
        en: 'In Lomuto partitioning, i is the right boundary of the "less than pivot" region and must start at l-1. If you write l instead, the first element smaller than the pivot increments i to l+1 before swapping, leaving position l stuck on the wrong side and producing an incorrectly sorted array.',
      },
      code: 'int i = l - 1;  // 正确\n// int i = l;    // 错误：位置 l 会被跳过',
    },
    {
      title: { zh: '稳定性：分区交换会打乱相等元素顺序', en: 'Stability: partition swaps reorder equal elements' },
      detail: {
        zh: '快速排序（尤其 Lomuto 分区）在把元素往两侧搬移时会跨越多个位置交换，因此相同值的元素相对顺序可能改变，属于不稳定排序。若需要稳定排序，应改用归并排序，或改用记录原始下标等额外手段。',
        en: 'Quick sort (especially Lomuto partitioning) swaps elements across positions, so equal-valued elements may change relative order: it is an unstable sort. If you need stability, prefer merge sort or carry the original indices as a tie-breaker.',
      },
    },
  ],
};
