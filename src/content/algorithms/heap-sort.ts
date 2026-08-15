import type { AlgorithmMeta } from '../../engine/types/algorithm';
import { extractLineMap } from '../../engine/codeMap/extract';

const cppSource = `#include <vector>
using namespace std;

// 大顶堆下沉：维持 a[i] 为根的子树满足大顶堆性质（循环版等价于递归）
void siftDown(vector<int>& a, int i, int size) {  //>sift-down
    while (true) {
        int l = 2 * i + 1;
        int r = 2 * i + 2;
        int largest = i;
        if (l < size && a[l] > a[largest])         //>compare
            largest = l;
        if (r < size && a[r] > a[largest])
            largest = r;
        if (largest == i) break;
        swap(a[i], a[largest]);                    //>swap
        i = largest;
    }
}

// 堆排序：先建大顶堆，再反复提取堆顶最大值
void heapSort(vector<int>& a) {                    //>func
    int n = (int)a.size();                         //>init
    for (int i = n / 2 - 1; i >= 0; --i)           //>build-heap
        siftDown(a, i, n);
    for (int heapSize = n; heapSize > 1; --heapSize) { //>extract
        swap(a[0], a[heapSize - 1]);               //>place
        siftDown(a, 0, heapSize - 1);
    }
}                                                  //>end`;

const csharpSource = `using System;

class HeapSortDemo
{
    // 大顶堆下沉：维持 a[i] 为根的子树满足大顶堆性质（循环版等价于递归）
    static void SiftDown(int[] a, int i, int size) {   //>sift-down
        while (true) {
            int l = 2 * i + 1;
            int r = 2 * i + 2;
            int largest = i;
            if (l < size && a[l] > a[largest])         //>compare
                largest = l;
            if (r < size && a[r] > a[largest])
                largest = r;
            if (largest == i) break;
            (a[i], a[largest]) = (a[largest], a[i]);   //>swap
            i = largest;
        }
    }

    // 堆排序：先建大顶堆，再反复提取堆顶最大值
    static void HeapSort(int[] a) {                    //>func
        int n = a.Length;                              //>init
        for (int i = n / 2 - 1; i >= 0; i--)           //>build-heap
            SiftDown(a, i, n);
        for (int heapSize = n; heapSize > 1; heapSize--) { //>extract
            (a[0], a[heapSize - 1]) = (a[heapSize - 1], a[0]); //>place
            SiftDown(a, 0, heapSize - 1);
        }
    }                                                  //>end
}`;

const pythonSource = `# 大顶堆下沉：维持 a[i] 为根的子树满足大顶堆性质（循环版等价于递归）
def sift_down(a, i, size):              #>sift-down
    while True:
        l = 2 * i + 1
        r = 2 * i + 2
        largest = i
        if l < size and a[l] > a[largest]:  #>compare
            largest = l
        if r < size and a[r] > a[largest]:
            largest = r
        if largest == i:
            break
        a[i], a[largest] = a[largest], a[i]  #>swap
        i = largest

# 堆排序：先建大顶堆，再反复提取堆顶最大值
def heap_sort(a):                       #>func
    n = len(a)                          #>init
    for i in range(n // 2 - 1, -1, -1):  #>build-heap
        sift_down(a, i, n)
    for heap_size in range(n, 1, -1):    #>extract
        a[0], a[heap_size - 1] = a[heap_size - 1], a[0]  #>place
        sift_down(a, 0, heap_size - 1)
    return a                            #>end`;

const pseudocode = `siftDown(a, i, size):                 #>sift-down
  while i has a child:
    l = 2*i + 1
    r = 2*i + 2
    largest = i
    if l < size and a[l] > a[largest]:   #>compare
      largest = l
    if r < size and a[r] > a[largest]:
      largest = r
    if largest == i: break
    swap(a[i], a[largest])               #>swap
    i = largest

heapSort(a):                            #>func
  n = len(a)                            #>init
  for i = n//2 - 1 down to 0:           #>build-heap
    siftDown(a, i, n)
  for heapSize = n down to 2:           #>extract
    swap(a[0], a[heapSize-1])           #>place
    siftDown(a, 0, heapSize-1)
  return a                              #>end`;

export const heapSortMeta: AlgorithmMeta = {
  id: 'heap-sort',
  name: { zh: '堆排序', en: 'Heap Sort' },
  category: 'sorting',
  difficulty: 'hard',
  description: {
    zh: '堆排序利用完全二叉树的「大顶堆」结构：先自底向上把数组建成大顶堆（每个父节点都大于等于孩子），此时堆顶是最大值；再反复把堆顶与堆尾交换、缩小堆并下沉根恢复堆，最终得到升序数组。它在原地完成（空间 O(1)），时间复杂度稳定为 O(n log n)，但属于不稳定排序。',
    en: "Heap sort uses a complete binary tree organized as a max-heap: it first builds a max-heap bottom-up (every parent is >= its children), where the root is the maximum; then it repeatedly swaps the root with the heap tail, shrinks the heap, and sinks the root to restore the heap, yielding a sorted array. It sorts in place (O(1) space) with a guaranteed O(n log n) time, but it is not stable.",
  },
  complexity: {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(1)',
  },
  prerequisites: ['quick-sort'],
  tags: ['排序', '堆', '树', '选择排序'],
  inputSpec: {
    name: 'a',
    kind: 'int-array',
    minLen: 0,
    maxLen: 15,
    valueMin: 1,
    valueMax: 99,
    allowEmpty: true,
  },
  defaultInput: '4, 10, 3, 5, 1, 8, 2',
  presets: [
    { name: { zh: '随机数组', en: 'Random array' }, input: '7, 2, 9, 4, 6, 1, 8, 3' },
    { name: { zh: '已排序数组', en: 'Sorted array' }, input: '1, 2, 3, 4, 5, 6, 7' },
  ],
  boundaryCases: [
    { name: { zh: '空数组', en: 'Empty array' }, input: '' },
    { name: { zh: '单个元素', en: 'Single element' }, input: '7' },
    { name: { zh: '已排序数组', en: 'Sorted array' }, input: '1, 2, 3, 4, 5' },
    { name: { zh: '逆序数组', en: 'Reversed array' }, input: '5, 4, 3, 2, 1' },
    { name: { zh: '全部相等', en: 'All equal' }, input: '4, 4, 4, 4, 4' },
  ],
  runnerId: 'heap-sort',
  visualKind: 'heap',
  codeExamples: {
    cpp: { language: 'cpp', source: cppSource, lineMap: extractLineMap(cppSource) },
    csharp: { language: 'csharp', source: csharpSource, lineMap: extractLineMap(csharpSource) },
    python: { language: 'python', source: pythonSource, lineMap: extractLineMap(pythonSource) },
  },
  pseudocode,
  commonMistakes: [
    {
      title: { zh: '建堆起点写成 n/2 而非 n/2-1', en: 'Starting the build at n/2 instead of n/2-1' },
      detail: {
        zh: '最后一个非叶节点的下标是 floor(n/2)-1（完全二叉树下标从 0 开始）。若从 n/2 开始，会把第一个叶子节点当作内部节点处理；而叶子节点天然满足堆性质，无需下沉。起点错一位会导致少处理一个真正的父节点，最终堆序被破坏。',
        en: 'The last non-leaf index is floor(n/2)-1 (0-based complete binary tree). Starting at n/2 treats the first leaf as an internal node; leaves already satisfy the heap property and never need sifting. Being off by one skips a real parent and breaks the heap order.',
      },
      code: 'for (int i = n / 2 - 1; i >= 0; --i)  // 正确\n// for (int i = n / 2; i >= 0; --i)    // 错误：把叶子当父节点',
    },
    {
      title: { zh: '孩子下标 2i+1 / 2i+2 忘记越界检查', en: 'Forgetting bounds checks on children 2i+1 / 2i+2' },
      detail: {
        zh: '下沉时必须先判断 l < size 与 r < size 再访问 a[l]、a[r]，否则在堆缩小的提取阶段，下标会越过有效堆范围，读到已就位的元素甚至越界。孩子下标 2i+1、2i+2 只对堆内有效下标才有意义。',
        en: 'Before accessing a[l] and a[r], always check l < size and r < size. Otherwise, once the heap shrinks during extraction, the indices fall outside the valid heap and may read already-placed elements or go out of bounds. The child formulas 2i+1 and 2i+2 are only meaningful for valid heap indices.',
      },
      code: 'if (l < size && a[l] > a[largest]) largest = l;\nif (r < size && a[r] > a[largest]) largest = r;',
    },
    {
      title: { zh: '堆排序不稳定的原因', en: 'Why heap sort is not stable' },
      detail: {
        zh: '下沉交换是跨距离的：父节点可能与相隔很远的后代交换，且建堆与提取过程中相等元素会被任意打乱相对顺序，因此堆排序不是稳定排序。若要求稳定，应改用归并排序等稳定算法。',
        en: 'Sift-down swaps are long-distance: a parent may swap with a far descendant, and equal elements get arbitrarily reordered during both heapify and extraction, so heap sort is not stable. If stability is required, use a stable sort such as merge sort instead.',
      },
    },
  ],
};
