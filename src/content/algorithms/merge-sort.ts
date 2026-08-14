import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 归并排序：分治——把区间二分，分别排序后再合并
void merge(vector<int>& a, int l, int mid, int r) {
    vector<int> tmp(r - l + 1);
    int i = l, j = mid + 1, k = 0;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];   //>compare
        else              tmp[k++] = a[j++];
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r)   tmp[k++] = a[j++];
    for (k = 0; k < r - l + 1; ++k)            //>copy
        a[l + k] = tmp[k];
}

// 递归辅助函数：对 a[l..r] 归并排序
void mergeSort(vector<int>& a, int l, int r) {
    if (l >= r) return;                        //>divide
    int mid = l + (r - l) / 2;                 //>mid
    mergeSort(a, l, mid);                      //>left
    mergeSort(a, mid + 1, r);                  //>right
    merge(a, l, mid, r);                       //>merge
}

void mergeSort(vector<int>& a) {               //>func
    mergeSort(a, 0, (int)a.size() - 1);        //>init
}                                              //>end`;

const csharpSource = `using System;

class MergeSortDemo
{
    // 归并排序：分治——把区间二分，分别排序后再合并
    static void Merge(int[] a, int l, int mid, int r) {
        int[] tmp = new int[r - l + 1];
        int i = l, j = mid + 1, k = 0;
        while (i <= mid && j <= r) {
            if (a[i] <= a[j]) tmp[k++] = a[i++];   //>compare
            else              tmp[k++] = a[j++];
        }
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= r)   tmp[k++] = a[j++];
        for (k = 0; k < r - l + 1; k++)            //>copy
            a[l + k] = tmp[k];
    }

    // 递归辅助函数：对 a[l..r] 归并排序
    static void MergeSort(int[] a, int l, int r) {
        if (l >= r) return;                        //>divide
        int mid = l + (r - l) / 2;                 //>mid
        MergeSort(a, l, mid);                      //>left
        MergeSort(a, mid + 1, r);                  //>right
        Merge(a, l, mid, r);                       //>merge
    }

    static void MergeSort(int[] a) {               //>func
        MergeSort(a, 0, a.Length - 1);             //>init
    }                                              //>end
}`;

const pythonSource = `# 归并排序：分治——把区间二分，分别排序后再合并
def merge(a, l, mid, r):
    tmp = [0] * (r - l + 1)
    i, j, k = l, mid + 1, 0
    while i <= mid and j <= r:
        if a[i] <= a[j]:            #>compare
            tmp[k] = a[i]
            i += 1
        else:
            tmp[k] = a[j]
            j += 1
        k += 1
    while i <= mid:
        tmp[k] = a[i]
        i += 1
        k += 1
    while j <= r:
        tmp[k] = a[j]
        j += 1
        k += 1
    for k in range(r - l + 1):      #>copy
        a[l + k] = tmp[k]

def merge_sort(a):                  #>func
    _merge_sort(a, 0, len(a) - 1)   #>init
    # 排序完成，返回               #>end

def _merge_sort(a, l, r):
    if l >= r:                      #>divide
        return
    mid = l + (r - l) // 2          #>mid
    _merge_sort(a, l, mid)          #>left
    _merge_sort(a, mid + 1, r)      #>right
    merge(a, l, mid, r)             #>merge`;

const pseudocode = `mergeSort(a):                     #>func
  mergeSort(a, 0, n-1)            #>init
  # 排序完成，返回                #>end

mergeSort(a, l, r):
  if l >= r: return               #>divide
  mid = (l + r) / 2               #>mid
  mergeSort(a, l, mid)            #>left
  mergeSort(a, mid+1, r)          #>right
  merge(a, l, mid, r)             #>merge

merge(a, l, mid, r):
  tmp = 新数组(r-l+1)
  i = l, j = mid+1, k = 0
  while i <= mid and j <= r:
    if a[i] <= a[j]:              #>compare
      tmp[k++] = a[i++]
    else:
      tmp[k++] = a[j++]
  while i <= mid: tmp[k++] = a[i++]
  while j <= r:   tmp[k++] = a[j++]
  for k = 0 .. r-l:               #>copy
    a[l+k] = tmp[k]`;

export const mergeSortMeta: AlgorithmMeta = {
  id: 'merge-sort',
  name: { zh: '归并排序', en: 'Merge Sort' },
  category: 'sorting',
  difficulty: 'medium',
  description: {
    zh: '归并排序是分治思想的典型代表：先把数组递归地二分，直到每个区间只剩一个元素（天然有序），再把两个有序区间合并成一个更大的有序区间。无论输入如何，时间复杂度始终是 O(n log n)，且是稳定排序；代价是需要 O(n) 的临时数组空间。本演示用显式栈模拟递归，调用栈面板可实时观察每一帧的入栈 / 出栈与合并过程。若已学过选择排序或插入排序，会更容易理解"比较 + 写回"的排序过程。',
    en: 'Merge sort is the classic divide-and-conquer algorithm: recursively split the array in half until each range holds a single (trivially sorted) element, then merge two sorted ranges into a larger sorted one. Time is O(n log n) regardless of input, and it is a stable sort; the trade-off is O(n) auxiliary space for the temp array. This demo simulates recursion with an explicit stack so the call-stack panel shows every frame being pushed/popped and every merge. If you already know selection or insertion sort, the compare-and-write-back process will feel familiar.',
  },
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
  },
  prerequisites: [],
  tags: ['排序', '分治', '递归', '稳定'],
  inputSpec: {
    name: 'a',
    kind: 'int-array',
    minLen: 0,
    maxLen: 20,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
  },
  defaultInput: '38, 27, 43, 3, 9, 82, 10',
  presets: [
    { name: { zh: '乱序数组', en: 'Shuffled array' }, input: '38, 27, 43, 3, 9, 82, 10' },
    { name: { zh: '已排序数组', en: 'Sorted array' }, input: '1, 2, 3, 4, 5, 6, 7, 8' },
    { name: { zh: '逆序数组', en: 'Reversed array' }, input: '8, 7, 6, 5, 4, 3, 2, 1' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单个元素', en: 'Single element' }, input: '7' },
    { name: { zh: '两个元素', en: 'Two elements' }, input: '2, 1' },
    { name: { zh: '全部相等', en: 'All equal' }, input: '5, 5, 5, 5, 5' },
  ],
  runnerId: 'merge-sort',
  visualKind: 'array-bars',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '合并后忘记把临时数组写回', en: 'Forgetting to copy the temp array back' },
      detail: {
        zh: '合并的结果存在临时数组 tmp 里，最后必须把 tmp 写回 a[l..r]。若漏掉这一步，原数组不会更新，排序结果丢失——这是归并排序最常见的错误。',
        en: 'The merged result lives in the temp array; the final loop must copy tmp back into a[l..r]. Skipping it leaves the original array unchanged and silently loses the sorted result — the most common merge-sort bug.',
      },
      code: 'for (k = 0; k < r - l + 1; ++k) a[l + k] = tmp[k];  // 写回，别漏',
    },
    {
      title: { zh: '合并时忘记处理剩余元素', en: 'Forgetting to flush the remaining elements' },
      detail: {
        zh: '双指针循环结束后，必有一侧还有剩余元素（因为每轮只消耗一个指针）。必须用两个 while 把剩余元素直接拷贝进 tmp，否则会丢数据。',
        en: 'After the two-pointer loop ends, one side is guaranteed to have leftover elements (each round advances only one pointer). You must flush them into tmp with two while loops, or data will be lost.',
      },
      code: 'while (i <= mid) tmp[k++] = a[i++];\nwhile (j <= r)   tmp[k++] = a[j++];',
    },
    {
      title: { zh: '为省空间做原地合并却破坏稳定性', en: 'Breaking stability with an in-place optimization' },
      detail: {
        zh: '标准归并用 O(n) 临时数组，稳定且直观。有人尝试"原地合并"省空间，但旋转 / 移动元素的技巧既难写又容易破坏稳定性（相等元素相对顺序被打乱）。初学阶段应先写对带临时数组的稳定版本。',
        en: 'Standard merge sort uses O(n) auxiliary space and is stable and clear. Some try an "in-place merge" to save space, but the rotate-and-shift tricks are error-prone and easily break stability (equal elements get reordered). Start with the stable, temp-array version.',
      },
    },
  ],
};
