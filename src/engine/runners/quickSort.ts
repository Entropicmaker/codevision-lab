import type {
  AlgorithmRunner,
  AlgorithmStep,
  CallFrame,
  DisplayItem,
  ElementState,
  OpStats,
  OperationType,
  ParsedInput,
  PointerState,
  Primitive,
  RunnerResult,
} from '../types/step';
import { emptyStats, item } from '../types/step';

/** 快速排序（Lomuto 分区）逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const QUICK_SORT_LINES = {
  func: 'func',
  init: 'init',
  partition: 'partition',
  pivot: 'pivot',
  scan: 'scan',
  compare: 'compare',
  swap: 'swap',
  place: 'place',
  left: 'left',
  right: 'right',
  end: 'end',
} as const;

/**
 * 显式栈中的模拟帧：每个 quickSort(l, r) 调用对应一帧。
 * stage 表示该帧的递归进度：partition（尚未分区）→ left（处理左半）→ right（处理右半）→ done（返回）。
 */
interface QuickFrame {
  id: string;
  l: number;
  r: number;
  /** 分区完成后的轴位置（分区前为 null） */
  pivotIdx: number | null;
  /** 递归层数（从 1 开始） */
  depth: number;
  stage: 'partition' | 'left' | 'right' | 'done';
}

/**
 * 快速排序执行器（Lomuto 分区）。
 * 用显式栈模拟递归：每一帧表示一个 quickSort(l, r) 调用，帧内完成一次分区
 * （选最右元素为轴 → i=l-1 边界 → j 扫描比较 → 交换 → 轴就位），随后依次递归
 * 左半帧与右半帧（先左后右，符合递归 DFS 顺序）。
 * callStack 面板实时展示"祖先链"，帧 { id, function:'quickSort', args:{l,r}, locals:{pivotIdx} }。
 * 纯函数、确定性；每一步为完整快照（containers.a 深拷贝）。
 */
export const runQuickSort: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const arr = (input.value as number[]).slice();
  const n = arr.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每步 push 时深拷贝进快照，保证步骤之间互不影响
  const base: DisplayItem[] = arr.map((v, i) => item(`a:${i}`, v, 'idle'));
  const frames: QuickFrame[] = [];

  // 当前分区过程的临时状态（供 variables / pointers 快照读取）
  let pivotVal: number | null = null;
  let pivotPos: number | null = null;
  let i: number | null = null;
  let j: number | null = null;
  let pIdx: number | null = null;

  const setState = (idx: number | null, state: ElementState): void => {
    if (idx !== null && idx >= 0 && idx < n && base[idx]) base[idx]!.state = state;
  };

  const swapAt = (x: number, y: number): void => {
    const tmp = base[x] as DisplayItem;
    const oth = base[y] as DisplayItem;
    base[x] = { ...oth, id: `a:${x}` };
    base[y] = { ...tmp, id: `a:${y}` };
  };

  const resetPartitionState = (): void => {
    pivotVal = null;
    pivotPos = null;
    i = null;
    j = null;
    pIdx = null;
  };

  const callStackSnapshot = (): CallFrame[] =>
    frames.map((f) => ({
      id: f.id,
      function: 'quickSort',
      args: { l: f.l, r: f.r },
      locals: { pivotIdx: f.pivotIdx ?? null },
      depth: f.depth,
    }));

  const variables = (): Record<string, Primitive> => {
    const top = frames[frames.length - 1];
    return {
      l: top ? top.l : null,
      r: top ? top.r : null,
      pivot: pivotVal,
      i,
      j,
      pIdx,
    };
  };

  const pointers = (): PointerState[] => {
    const top = frames[frames.length - 1];
    const l = top ? top.l : -1;
    const r = top ? top.r : -1;
    const list: PointerState[] = [];
    if (i !== null && i >= l && i <= r) list.push({ id: 'p-i', name: 'i', target: `a:${i}` });
    if (j !== null && j >= l && j <= r) list.push({ id: 'p-j', name: 'j', target: `a:${j}` });
    if (pivotPos !== null && pivotPos >= 0 && pivotPos < n) {
      list.push({ id: 'p-pivot', name: 'pivot', target: `a:${pivotPos}` });
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
      containers: { a: base.map((el) => ({ ...el })) },
      structures: [],
      variables: variables(),
      pointers: pointers(),
      callStack: callStackSnapshot(),
      output,
      explanation,
      stats: { ...stats },
    };
    steps.push(step);
  };

  // 1. 初始调用：压入 quickSort(0, n-1) 根帧
  if (n > 0) {
    frames.push({ id: `f:0:${n - 1}`, l: 0, r: n - 1, pivotIdx: null, depth: 1, stage: 'partition' });
  }
  push(QUICK_SORT_LINES.init, 'init', {
    zh:
      n === 0
        ? '数组为空，无需排序。'
        : `开始快速排序：调用 quickSort(0, ${n - 1})，压入根帧，整个数组待排序。`,
    en:
      n === 0
        ? 'Array is empty, nothing to sort.'
        : `Start quick sort: call quickSort(0, ${n - 1}) and push the root frame; the whole array is unsorted.`,
  });

  // 2. 显式栈模拟递归
  while (frames.length > 0) {
    const top = frames[frames.length - 1]!;

    if (top.stage === 'partition') {
      if (top.l >= top.r) {
        // 单元素 / 空区间：天然有序，直接弹帧（返回）
        const value = top.l === top.r ? (base[top.l]!.value as number) : null;
        if (top.l === top.r) setState(top.l, 'done');
        frames.pop();
        resetPartitionState();
        push(QUICK_SORT_LINES.init, 'return', {
          zh: `区间长度 ≤ 1（[${top.l}, ${top.r}]），天然有序${
            value !== null ? `，元素 ${value} 已就位` : ''
          }。弹出该帧。`,
          en: `Range length <= 1 ([${top.l}, ${top.r}]), naturally sorted${
            value !== null ? `; element ${value} is in place` : ''
          }. Pop the frame.`,
        });
        continue;
      }

      // --- 对 [l, r] 做 Lomuto 分区 ---
      const l = top.l;
      const r = top.r;

      // 选 pivot = a[r]
      const pivot = base[r]!.value as number;
      pivotVal = pivot;
      pivotPos = r;
      i = l - 1;
      j = null;
      pIdx = null;
      setState(r, 'active');
      push(QUICK_SORT_LINES.pivot, 'assign', {
        zh: `选最右元素 a[${r}]=${pivot} 为轴（pivot），其余元素将按"小于轴 / 大于轴"分成左右两侧。`,
        en: `Choose the rightmost element a[${r}]=${pivot} as the pivot; the rest will be partitioned into "less than pivot" and "greater than pivot".`,
      });

      // i = l-1（小于轴区域的边界）
      push(QUICK_SORT_LINES.scan, 'assign', {
        zh: `初始化 i = ${l - 1}（小于轴区域的右边界）；j 将从 ${l} 向右扫描到 ${r - 1}。`,
        en: `Initialize i = ${l - 1} (right boundary of the less-than-pivot region); j will scan from ${l} to ${r - 1}.`,
      });

      // j 扫描 [l, r-1]，与 pivot 比较
      for (let jj = l; jj < r; jj += 1) {
        j = jj;
        const aj = base[jj]!.value as number;
        stats.comparisons += 1;
        stats.accesses += 2;
        setState(jj, 'comparing');
        setState(r, 'comparing');
        push(QUICK_SORT_LINES.compare, 'compare', {
          zh: `比较 a[${jj}]=${aj} 与轴 pivot=${pivot}。`,
          en: `Compare a[${jj}]=${aj} with pivot=${pivot}.`,
        });

        if (aj < pivot) {
          i = i! + 1;
          if (i === jj) {
            setState(jj, 'idle');
            setState(r, 'active');
            push(QUICK_SORT_LINES.swap, 'no-op', {
              zh: `a[${jj}]=${aj} < pivot=${pivot}：i 前进到 ${i}，此时 i == j，元素已在左侧区域，无需交换。`,
              en: `a[${jj}]=${aj} < pivot=${pivot}: i advances to ${i}; since i == j the element is already in the left region, no swap needed.`,
            });
          } else {
            swapAt(i, jj);
            stats.swaps += 1;
            stats.writes += 2;
            setState(i, 'idle');
            setState(jj, 'idle');
            setState(r, 'active');
            push(QUICK_SORT_LINES.swap, 'swap', {
              zh: `a[${jj}]=${aj} < pivot=${pivot}：i 前进到 ${i}，交换 a[${i}] 与 a[${jj}]，把较小元素移到左侧区域。`,
              en: `a[${jj}]=${aj} < pivot=${pivot}: i advances to ${i}; swap a[${i}] and a[${jj}] to move the smaller element into the left region.`,
            });
          }
        } else {
          setState(jj, 'idle');
          setState(r, 'active');
          push(QUICK_SORT_LINES.scan, 'no-op', {
            zh: `a[${jj}]=${aj} ≥ pivot=${pivot}，保持位置，继续向右扫描。`,
            en: `a[${jj}]=${aj} >= pivot=${pivot}, keep it in place and continue scanning right.`,
          });
        }
      }

      // 把轴放到 i+1 位置（轴就位）
      pIdx = i! + 1;
      if (pIdx !== r) {
        swapAt(pIdx, r);
        stats.swaps += 1;
        stats.writes += 2;
        setState(r, 'idle');
      }
      setState(pIdx, 'done');
      pivotPos = pIdx;
      i = null;
      j = null;
      push(QUICK_SORT_LINES.place, 'swap', {
        zh: `扫描完成：把轴 pivot=${pivot} 放到位置 ${pIdx}（${
          pIdx === r ? '轴本就在末尾，无需移动' : `交换 a[${pIdx}] 与 a[${r}]`
        }）。轴已就位，左侧都小于它、右侧都大于它。`,
        en: `Scan complete: place pivot=${pivot} at position ${pIdx} (${
          pIdx === r ? 'it was already at the end' : `swap a[${pIdx}] and a[${r}]`
        }). The pivot is in place; all left elements are smaller and all right elements are larger.`,
      });

      // 记录分区结果，进入"左半递归"阶段
      top.pivotIdx = pIdx;
      push(QUICK_SORT_LINES.partition, 'assign', {
        zh: `分区完成：pIdx = ${pIdx}，左半区间 [${l}, ${pIdx - 1}]、右半区间 [${pIdx + 1}, ${r}]。`,
        en: `Partition done: pIdx = ${pIdx}; left half [${l}, ${pIdx - 1}], right half [${pIdx + 1}, ${r}].`,
      });
      top.stage = 'left';
      resetPartitionState();
      continue;
    }

    if (top.stage === 'left') {
      if (top.l <= top.pivotIdx! - 1) {
        top.stage = 'right';
        frames.push({
          id: `f:${top.l}:${top.pivotIdx! - 1}`,
          l: top.l,
          r: top.pivotIdx! - 1,
          pivotIdx: null,
          depth: top.depth + 1,
          stage: 'partition',
        });
        push(QUICK_SORT_LINES.left, 'push', {
          zh: `递归调用 quickSort(${top.l}, ${top.pivotIdx! - 1})：压入左半区间帧。`,
          en: `Recurse quickSort(${top.l}, ${top.pivotIdx! - 1}): push the left-half frame.`,
        });
        continue;
      }
      top.stage = 'right';
      // 左半为空，直接进入右半
    }

    if (top.stage === 'right') {
      if (top.pivotIdx! + 1 <= top.r) {
        top.stage = 'done';
        frames.push({
          id: `f:${top.pivotIdx! + 1}:${top.r}`,
          l: top.pivotIdx! + 1,
          r: top.r,
          pivotIdx: null,
          depth: top.depth + 1,
          stage: 'partition',
        });
        push(QUICK_SORT_LINES.right, 'push', {
          zh: `递归调用 quickSort(${top.pivotIdx! + 1}, ${top.r})：压入右半区间帧。`,
          en: `Recurse quickSort(${top.pivotIdx! + 1}, ${top.r}): push the right-half frame.`,
        });
        continue;
      }
      top.stage = 'done';
      // 右半为空，本帧完成
    }

    // top.stage === 'done'：左右子区间均处理完，弹出（返回调用者）
    const doneL = top.l;
    const doneR = top.r;
    frames.pop();
    resetPartitionState();
    push(QUICK_SORT_LINES.end, 'return', {
      zh: `quickSort(${doneL}, ${doneR}) 执行完毕：弹出该帧，控制权返回调用者。`,
      en: `quickSort(${doneL}, ${doneR}) finished: pop its frame; control returns to the caller.`,
    });
  }

  // 3. 全部就位
  if (n > 0) for (let k = 0; k < n; k += 1) base[k]!.state = 'done';
  const sorted = base.map((b) => b.value as number);
  push(
    QUICK_SORT_LINES.end,
    'finalize',
    {
      zh: `排序完成：数组已按升序排列为 [${sorted.join(', ')}]。`,
      en: `Sorted: the array is now ascending [${sorted.join(', ')}].`,
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
