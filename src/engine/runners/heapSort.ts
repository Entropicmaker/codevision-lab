import type {
  AlgorithmRunner,
  AlgorithmStep,
  DisplayItem,
  OpStats,
  OperationType,
  ParsedInput,
  PointerState,
  Primitive,
  RunnerResult,
  TreeEdge,
  TreeSnapshot,
} from '../types/step';
import { emptyStats, item } from '../types/step';

/** 堆排序逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const HEAP_SORT_LINES = {
  func: 'func',
  init: 'init',
  buildHeap: 'build-heap',
  siftDown: 'sift-down',
  compare: 'compare',
  swap: 'swap',
  place: 'place',
  extract: 'extract',
  end: 'end',
} as const;

/**
 * 堆排序执行器（大顶堆）。
 * 数组同时以「数组视图（containers.a）」与「完全二叉树视图（structures.tree）」双视图呈现：
 * - 树节点 id 为 `n:<数组下标>`（完全二叉树布局），父→子边 `n:i` → `n:2i+1` / `n:2i+2`；
 * - 两个视图共享同一份元素状态，同一元素（同一下标）在两侧同色高亮。
 * 算法：先自底向上建大顶堆（从最后一个非叶节点 floor(n/2)-1 起 siftDown），
 * 再反复交换堆顶与堆尾、缩小堆并下沉根以恢复堆，最终得到升序数组。
 * 下沉用循环实现（等价于递归 siftDown，无需维护 callStack）。
 * 纯函数、确定性；每一步为完整快照（containers.a 与 structures 均深拷贝）。
 */
export const runHeapSort: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const arr = (input.value as number[]).slice();
  const n = arr.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每步 push 时深拷贝进快照，保证步骤之间互不影响
  const base: DisplayItem[] = arr.map((v, i) => item(`a:${i}`, v, 'idle'));
  let heapSize = n;

  // 当前下沉 / 比较过程的临时下标（供 variables / pointers 快照读取）
  let iVal: number | null = null;
  let largestVal: number | null = null;
  let lVal: number | null = null;
  let rVal: number | null = null;

  const val = (idx: number): number => base[idx]?.value as number;

  const swapAt = (x: number, y: number): void => {
    const tmp = base[x] as DisplayItem;
    const oth = base[y] as DisplayItem;
    base[x] = { ...oth, id: `a:${x}` };
    base[y] = { ...tmp, id: `a:${y}` };
  };

  /** 清空堆内瞬时高亮：heapSize 之内的元素归 idle/active，heapSize 之外（已就位后缀）保持 done */
  const resetTransient = (activeIdx: number | null): void => {
    for (let k = 0; k < heapSize; k += 1) {
      base[k]!.state = k === activeIdx ? 'active' : 'idle';
    }
  };

  /** 完全二叉树结构边：下标 0..n-1，父 → 子（2i+1 / 2i+2，仅存在的下标） */
  const buildEdges = (): TreeEdge[] => {
    const edges: TreeEdge[] = [];
    for (let i = 0; i < n; i += 1) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n) edges.push({ from: `n:${i}`, to: `n:${l}` });
      if (r < n) edges.push({ from: `n:${i}`, to: `n:${r}` });
    }
    return edges;
  };
  const edgesBase = buildEdges();

  /** 树视图快照：与数组视图共享元素状态，节点 id 用 n:<下标> */
  const treeSnapshot = (): TreeSnapshot => ({
    kind: 'tree',
    id: 'heap',
    nodes: base.map((el, i) => item(`n:${i}`, el.value, el.state)),
    edges: edgesBase.map((e) => ({ ...e })),
    rootId: n > 0 ? 'n:0' : null,
  });

  const variables = (): Record<string, Primitive> => ({
    n,
    heapSize,
    i: iVal,
    largest: largestVal,
    l: lVal,
    r: rVal,
  });

  const pointers = (): PointerState[] => {
    const list: PointerState[] = [];
    if (iVal !== null && iVal >= 0 && iVal < n) {
      list.push({ id: 'p-i', name: 'i', target: `a:${iVal}` });
    }
    if (largestVal !== null && largestVal >= 0 && largestVal < n) {
      list.push({ id: 'p-largest', name: 'largest', target: `a:${largestVal}` });
    }
    return list;
  };

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: { zh: string; en: string },
    output: string[] = [],
  ): void => {
    const step: AlgorithmStep = {
      stepId: steps.length,
      codeLineId,
      operation,
      containers: { a: base.map((b) => ({ ...b })) },
      structures: [treeSnapshot()],
      variables: variables(),
      pointers: pointers(),
      callStack: [],
      output,
      explanation,
      stats: { ...stats },
    };
    steps.push(step);
  };

  /** siftDown：循环版下沉（等价于递归下沉，不维护 callStack） */
  const siftDown = (i0: number, size: number): void => {
    iVal = i0;
    largestVal = i0;
    lVal = 2 * i0 + 1;
    rVal = 2 * i0 + 2;
    resetTransient(i0);
    push(HEAP_SORT_LINES.siftDown, 'assign', {
      zh: `siftDown(${i0}, ${size})：从 a[${i0}]=${val(i0)} 开始，沿大孩子方向向下调整，使以 ${i0} 为根的子树满足大顶堆性质（循环等价于递归下沉）。`,
      en: `siftDown(${i0}, ${size}): starting from a[${i0}]=${val(i0)}, sink it toward its larger child so the subtree rooted at ${i0} satisfies the max-heap property (the loop is equivalent to recursive sifting).`,
    });

    let i = i0;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let largest = i;
      iVal = i;
      lVal = l;
      rVal = r;
      largestVal = i;

      if (l < size) {
        stats.comparisons += 1;
        stats.accesses += 2;
        base[i]!.state = 'comparing';
        base[l]!.state = 'comparing';
        push(HEAP_SORT_LINES.compare, 'compare', {
          zh: `比较左孩子 a[${l}]=${val(l)} 与当前最大 a[${largest}]=${val(largest)}：${
            val(l) > val(largest)
              ? `${val(l)} > ${val(largest)}，largest 更新为 ${l}`
              : `${val(l)} ≤ ${val(largest)}，largest 保持 ${largest}`
          }。`,
          en: `Compare left child a[${l}]=${val(l)} with the current max a[${largest}]=${val(largest)}: ${
            val(l) > val(largest)
              ? `${val(l)} > ${val(largest)}, largest becomes ${l}`
              : `${val(l)} <= ${val(largest)}, largest stays ${largest}`
          }.`,
        });
        if (val(l) > val(largest)) largest = l;
        largestVal = largest;
        resetTransient(i);
      }

      if (r < size) {
        stats.comparisons += 1;
        stats.accesses += 2;
        base[largest]!.state = 'comparing';
        base[r]!.state = 'comparing';
        push(HEAP_SORT_LINES.compare, 'compare', {
          zh: `比较右孩子 a[${r}]=${val(r)} 与当前最大 a[${largest}]=${val(largest)}：${
            val(r) > val(largest)
              ? `${val(r)} > ${val(largest)}，largest 更新为 ${r}`
              : `${val(r)} ≤ ${val(largest)}，largest 保持 ${largest}`
          }。`,
          en: `Compare right child a[${r}]=${val(r)} with the current max a[${largest}]=${val(largest)}: ${
            val(r) > val(largest)
              ? `${val(r)} > ${val(largest)}, largest becomes ${r}`
              : `${val(r)} <= ${val(largest)}, largest stays ${largest}`
          }.`,
        });
        if (val(r) > val(largest)) largest = r;
        largestVal = largest;
        resetTransient(i);
      }

      if (largest === i) {
        resetTransient(i);
        push(HEAP_SORT_LINES.compare, 'no-op', {
          zh:
            l < size
              ? `a[${i}]=${val(i)} 已大于等于两个孩子，堆性质满足，siftDown 结束。`
              : `a[${i}]=${val(i)} 是叶子节点（无孩子），堆性质满足，siftDown 结束。`,
          en:
            l < size
              ? `a[${i}]=${val(i)} is already >= both children; the heap property holds, siftDown ends.`
              : `a[${i}]=${val(i)} is a leaf (no children); the heap property holds, siftDown ends.`,
        });
        resetTransient(null);
        break;
      }

      const fromVal = val(i);
      const toVal = val(largest);
      swapAt(i, largest);
      stats.swaps += 1;
      stats.writes += 2;
      resetTransient(largest);
      push(HEAP_SORT_LINES.swap, 'swap', {
        zh: `交换 a[${i}] 与 a[${largest}]：${fromVal} ⇄ ${toVal}，父节点下沉到 ${largest}，继续向下调整。`,
        en: `Swap a[${i}] and a[${largest}]: ${fromVal} ⇄ ${toVal}; the parent sinks to ${largest} and keeps sifting down.`,
      });
      i = largest;
      iVal = i;
      largestVal = i;
    }
  };

  // 1. 初始快照（树 + 数组双视图，说明大顶堆性质）
  push(HEAP_SORT_LINES.init, 'init', {
    zh:
      n === 0
        ? '数组为空，无需排序。'
        : `开始堆排序：共 ${n} 个元素。把数组看作完全二叉树（下标 i 的孩子为 2i+1、2i+2），目标是建成大顶堆（每个父节点 ≥ 孩子），再反复提取堆顶最大值。`,
    en:
      n === 0
        ? 'Array is empty, nothing to sort.'
        : `Start heap sort: ${n} elements. Treat the array as a complete binary tree (children of i are 2i+1 and 2i+2); build a max-heap (every parent >= its children), then repeatedly extract the top maximum.`,
  });

  // 2. 建堆：从最后一个非叶节点 floor(n/2)-1 开始，自底向上 siftDown
  for (let ii = Math.floor(n / 2) - 1; ii >= 0; ii -= 1) {
    iVal = ii;
    largestVal = null;
    lVal = null;
    rVal = null;
    resetTransient(ii);
    push(HEAP_SORT_LINES.buildHeap, 'assign', {
      zh: `建堆：处理最后一个非叶节点 i=${ii}（a[${ii}]=${val(ii)}），对其执行 siftDown。叶子节点天然满足堆性质，无需处理。`,
      en: `Build heap: process the last non-leaf node i=${ii} (a[${ii}]=${val(ii)}) and sift it down. Leaves already satisfy the heap property.`,
    });
    siftDown(ii, n);
  }

  if (n > 1) {
    iVal = null;
    largestVal = null;
    lVal = null;
    rVal = null;
    resetTransient(null);
    push(HEAP_SORT_LINES.buildHeap, 'assign', {
      zh: '大顶堆构建完成：每个父节点都大于等于它的两个孩子，堆顶 a[0] 是当前最大值。',
      en: 'Max-heap built: every parent is >= both children, and the root a[0] holds the current maximum.',
    });
  }

  // 3. 提取阶段：反复交换堆顶与堆尾，缩小堆并下沉根恢复堆
  let extracted = 0;
  while (heapSize > 1) {
    extracted += 1;
    resetTransient(0);
    iVal = 0;
    largestVal = null;
    lVal = null;
    rVal = null;
    push(HEAP_SORT_LINES.extract, 'assign', {
      zh: `提取第 ${extracted} 个最大值：当前堆大小 ${heapSize}，堆顶 a[0]=${val(0)} 是剩余最大值，与堆尾 a[${heapSize - 1}]=${val(heapSize - 1)} 交换。`,
      en: `Extract maximum #${extracted}: heap size is ${heapSize}; the top a[0]=${val(0)} is the remaining maximum, swap it with the tail a[${heapSize - 1}]=${val(heapSize - 1)}.`,
    });

    const maxVal = val(0);
    const tailVal = val(heapSize - 1);
    swapAt(0, heapSize - 1);
    stats.swaps += 1;
    stats.writes += 2;
    base[heapSize - 1]!.state = 'done';
    base[0]!.state = 'active';
    iVal = 0;
    largestVal = null;
    push(HEAP_SORT_LINES.place, 'swap', {
      zh: `交换堆顶与堆尾：${maxVal} ⇄ ${tailVal}；a[${heapSize - 1}]=${maxVal} 已就位（绿色），堆大小减一。`,
      en: `Swap top and tail: ${maxVal} ⇄ ${tailVal}; a[${heapSize - 1}]=${maxVal} is now in place (green) and the heap size decreases by one.`,
    });

    heapSize -= 1;
    siftDown(0, heapSize);
  }

  // 4. 结束：全部就位
  if (n > 0) {
    for (let k = 0; k < n; k += 1) base[k]!.state = 'done';
  }
  iVal = null;
  largestVal = null;
  lVal = null;
  rVal = null;
  const sorted = base.map((b) => b.value as number);
  push(
    HEAP_SORT_LINES.end,
    'finalize',
    {
      zh: n === 0 ? '数组为空，排序完成。' : `堆排序完成：数组已按升序排列为 [${sorted.join(', ')}]。`,
      en: n === 0 ? 'Array is empty, sorting done.' : `Heap sort complete: the array is ascending [${sorted.join(', ')}].`,
    },
    [`sorted: [${sorted.join(', ')}]`],
  );

  return {
    steps,
    summary: {
      result: sorted.join(', '),
      resultValue: sorted.join(', '),
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
