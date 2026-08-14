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

/** 归并排序逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const MERGE_SORT_LINES = {
  func: 'func',
  init: 'init',
  divide: 'divide',
  mid: 'mid',
  left: 'left',
  right: 'right',
  merge: 'merge',
  compare: 'compare',
  copy: 'copy',
  end: 'end',
} as const;

/** 显式栈中的模拟帧（内部状态，不直接暴露给渲染器） */
interface SimFrame {
  id: string;
  l: number;
  r: number;
  depth: number;
  /** 0 = 待分解（刚入栈）; 1 = 左右子区间已排序，待合并 */
  stage: 0 | 1;
  mid: number;
  i: number;
  j: number;
  k: number;
}

const zh = {
  init: (n: number) =>
    `开始归并排序：共 ${n} 个元素。核心思想是"分治"——先把数组不断二分到单个元素，再两两合并成有序区间。`,
  initEn: (n: number) =>
    `Start merge sort on ${n} elements. The core idea is divide-and-conquer: keep splitting the array into single elements, then merge them pairwise into sorted runs.`,
  empty: '数组为空，无需排序。',
  emptyEn: 'The array is empty; nothing to sort.',
  divide: (l: number, r: number) =>
    `分解区间 a[${l}..${r}]：长度 ${r - l + 1} > 1，需要递归二分（当前区间标为蓝色）。`,
  divideEn: (l: number, r: number) =>
    `Split range a[${l}..${r}]: length ${r - l + 1} > 1, so recurse (the range is marked blue).`,
  base: (l: number) => `区间 a[${l}..${l}] 长度为 1，天然有序，直接返回（弹出帧）。`,
  baseEn: (l: number) => `Range a[${l}..${l}] has length 1 and is trivially sorted; return immediately (pop the frame).`,
  mid: (l: number, r: number, mid: number) =>
    `计算中点 mid = (${l} + ${r}) / 2 = ${mid}，把区间分成左右两半。`,
  midEn: (l: number, r: number, mid: number) =>
    `Compute mid = (${l} + ${r}) / 2 = ${mid}, splitting the range into a left and a right half.`,
  right: (l: number, r: number) =>
    `递归调用 mergeSort(${l}, ${r})：右半区间帧入栈（先压栈，后处理）。`,
  rightEn: (l: number, r: number) =>
    `Call mergeSort(${l}, ${r}): push the right-half frame (pushed first, processed later).`,
  left: (l: number, r: number) =>
    `递归调用 mergeSort(${l}, ${r})：左半区间帧入栈（栈顶，先处理）。`,
  leftEn: (l: number, r: number) =>
    `Call mergeSort(${l}, ${r}): push the left-half frame (top of the stack, processed first).`,
  merge: (l: number, mid: number, r: number) =>
    `合并区间 a[${l}..${mid}] 与 a[${mid + 1}..${r}]：两段都已有序，用双指针 i、j 归并。`,
  mergeEn: (l: number, mid: number, r: number) =>
    `Merge a[${l}..${mid}] and a[${mid + 1}..${r}]: both halves are sorted; merge them with two pointers i, j.`,
  compare: (i: number, j: number, x: number, y: number, takeLeft: boolean) =>
    `比较 a[${i}]=${x} 与 a[${j}]=${y}：${takeLeft ? `${x} ≤ ${y}，取 ${x}` : `${y} < ${x}，取 ${y}`} 写入临时数组。`,
  compareEn: (i: number, j: number, x: number, y: number, takeLeft: boolean) =>
    `Compare a[${i}]=${x} and a[${j}]=${y}: ${takeLeft ? `${x} <= ${y}, take ${x}` : `${y} < ${x}, take ${y}`} into the temp array.`,
  remainder: (side: string, count: number) =>
    `${side}区间剩余 ${count} 个元素已有序，直接拷贝到临时数组（无需比较）。`,
  remainderEn: (side: string, count: number) =>
    `The remaining ${count} element(s) of the ${side} half are already sorted; copy them straight into the temp array (no comparison needed).`,
  copy: (pos: number, val: number) => `把临时数组写回 a[${pos}] = ${val}（依次写回，标绿）。`,
  copyEn: (pos: number, val: number) => `Write the temp array back: a[${pos}] = ${val} (written back one by one, marked green).`,
  mergeDone: (l: number, r: number) => `区间 a[${l}..${r}] 合并完成，已整体有序（弹出帧，返回上层）。`,
  mergeDoneEn: (l: number, r: number) =>
    `Range a[${l}..${r}] is merged and sorted; pop the frame and return to the caller.`,
  done: (arr: number[]) => `排序完成：数组已按升序排列为 [${arr.join(', ')}]。`,
  doneEn: (arr: number[]) => `Sorted: the array is now ascending [${arr.join(', ')}].`,
};

/**
 * 归并排序执行器：纯函数、确定性。
 * 用显式栈模拟递归：帧 {l, r, mid, depth, stage} 记录当前分解/合并进度，
 * callStack 面板实时展示每一帧的入栈 / 出栈。合并阶段用双指针 + 临时数组，
 * 每一步都是完整状态快照（深拷贝）。
 */
export const runMergeSort: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const arr = (input.value as number[]).slice();
  const n = arr.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每步 push 时深拷贝进快照，保证步骤之间互不影响
  const base: DisplayItem[] = arr.map((v, i) => item(`a:${i}`, v, 'idle'));

  let frameCounter = 0;
  const frames: SimFrame[] = [];

  const newFrame = (l: number, r: number, depth: number): SimFrame => {
    const f: SimFrame = { id: `f${frameCounter}`, l, r, depth, stage: 0, mid: -1, i: -1, j: -1, k: -1 };
    frameCounter += 1;
    return f;
  };

  const markRange = (l: number, r: number, state: ElementState): void => {
    for (let idx = l; idx <= r; idx += 1) {
      if (idx >= 0 && idx < n) base[idx]!.state = state;
    }
  };

  const setStates = (ids: number[], state: ElementState): void => {
    for (const id of ids) {
      const el = base[id];
      if (el) el.state = state;
    }
  };

  const callStackSnapshot = (): CallFrame[] =>
    frames.map((f) => ({
      id: f.id,
      function: 'mergeSort',
      args: { l: f.l, r: f.r },
      locals: {
        mid: f.mid >= 0 ? f.mid : null,
        i: f.i >= 0 ? f.i : null,
        j: f.j >= 0 ? f.j : null,
        k: f.k >= 0 ? f.k : null,
      },
      depth: f.depth,
    }));

  const variables = (): Record<string, Primitive> => {
    const top = frames[frames.length - 1];
    return {
      n,
      l: top ? top.l : null,
      r: top ? top.r : null,
      mid: top && top.mid >= 0 ? top.mid : null,
      i: top && top.i >= 0 ? top.i : null,
      j: top && top.j >= 0 ? top.j : null,
      k: top && top.k >= 0 ? top.k : null,
    };
  };

  const pointers = (): PointerState[] => {
    const top = frames[frames.length - 1];
    if (!top || top.stage !== 1 || top.i < 0 || top.j < 0) return [];
    const list: PointerState[] = [];
    if (top.i <= top.mid) list.push({ id: 'p-i', name: 'i', target: `a:${top.i}` });
    if (top.j <= top.r) list.push({ id: 'p-j', name: 'j', target: `a:${top.j}` });
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

  // 空数组：直接结束
  if (n === 0) {
    push(MERGE_SORT_LINES.init, 'init', { zh: zh.empty, en: zh.emptyEn });
    push(MERGE_SORT_LINES.end, 'finalize', { zh: zh.done([]), en: zh.doneEn([]) }, ['sorted: []']);
    return {
      steps,
      summary: { result: '', resultValue: '', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 1. 根帧入栈（递归入口）
  frames.push(newFrame(0, n - 1, 1));
  push(MERGE_SORT_LINES.init, 'init', { zh: zh.init(n), en: zh.initEn(n) });

  // 2. 显式栈模拟递归：分解 → 合并 → 弹出
  while (frames.length > 0) {
    const top = frames[frames.length - 1]!;

    if (top.stage === 0) {
      // 分解阶段：判断是否为单元素区间
      if (top.l >= top.r) {
        // 单元素：天然有序，直接弹出
        if (top.l >= 0 && top.l < n) base[top.l]!.state = 'done';
        frames.pop();
        push(MERGE_SORT_LINES.divide, 'pop', { zh: zh.base(top.l), en: zh.baseEn(top.l) });
      } else {
        const mid = Math.floor((top.l + top.r) / 2);
        top.mid = mid;
        top.stage = 1;
        markRange(top.l, top.r, 'active');
        push(MERGE_SORT_LINES.divide, 'assign', {
          zh: zh.divide(top.l, top.r),
          en: zh.divideEn(top.l, top.r),
        });
        push(MERGE_SORT_LINES.mid, 'assign', {
          zh: zh.mid(top.l, top.r, mid),
          en: zh.midEn(top.l, top.r, mid),
        });
        // 先压右、再压左：左在栈顶，先被处理
        frames.push(newFrame(mid + 1, top.r, top.depth + 1));
        push(MERGE_SORT_LINES.right, 'push', {
          zh: zh.right(mid + 1, top.r),
          en: zh.rightEn(mid + 1, top.r),
        });
        frames.push(newFrame(top.l, mid, top.depth + 1));
        push(MERGE_SORT_LINES.left, 'push', {
          zh: zh.left(top.l, mid),
          en: zh.leftEn(top.l, mid),
        });
      }
    } else {
      // 合并阶段：两段有序子区间归并到临时数组后写回
      const { l, r, mid } = top;
      const temp: number[] = [];
      let i = l;
      let j = mid + 1;

      markRange(l, r, 'active');
      top.i = i;
      top.j = j;
      top.k = 0;
      push(MERGE_SORT_LINES.merge, 'assign', { zh: zh.merge(l, mid, r), en: zh.mergeEn(l, mid, r) });

      // 双指针比较，选中较小者写入临时数组
      while (i <= mid && j <= r) {
        setStates([i, j], 'comparing');
        stats.comparisons += 1;
        stats.accesses += 2;
        const x = base[i]!.value as number;
        const y = base[j]!.value as number;
        top.i = i;
        top.j = j;
        top.k = temp.length;
        push(MERGE_SORT_LINES.compare, 'compare', {
          zh: zh.compare(i, j, x, y, x <= y),
          en: zh.compareEn(i, j, x, y, x <= y),
        });
        if (x <= y) {
          temp.push(x);
          base[i]!.state = 'idle';
          i += 1;
        } else {
          temp.push(y);
          base[j]!.state = 'idle';
          j += 1;
        }
      }

      // 剩余元素直接拷贝
      top.i = -1;
      top.j = -1;
      let remainderCount = 0;
      let leftRemainder = false;
      if (i <= mid) {
        leftRemainder = true;
        while (i <= mid) {
          temp.push(base[i]!.value as number);
          stats.accesses += 1;
          base[i]!.state = 'idle';
          i += 1;
          remainderCount += 1;
        }
      } else if (j <= r) {
        while (j <= r) {
          temp.push(base[j]!.value as number);
          stats.accesses += 1;
          base[j]!.state = 'idle';
          j += 1;
          remainderCount += 1;
        }
      }
      if (remainderCount > 0) {
        top.k = temp.length;
        const sideZh = leftRemainder ? '左' : '右';
        const sideEn = leftRemainder ? 'left' : 'right';
        push(MERGE_SORT_LINES.merge, 'assign', {
          zh: zh.remainder(sideZh, remainderCount),
          en: zh.remainderEn(sideEn, remainderCount),
        });
      }

      // 把临时数组写回 a[l..r]（依次标 done）
      for (let w = 0; w < temp.length; w += 1) {
        base[l + w]!.value = temp[w]!;
        base[l + w]!.state = 'done';
        stats.writes += 1;
        top.k = w;
        push(MERGE_SORT_LINES.copy, 'assign', {
          zh: zh.copy(l + w, temp[w]!),
          en: zh.copyEn(l + w, temp[w]!),
        });
      }

      // 合并完成，弹出帧
      frames.pop();
      push(MERGE_SORT_LINES.merge, 'return', { zh: zh.mergeDone(l, r), en: zh.mergeDoneEn(l, r) });
    }
  }

  // 3. 结束：全部标 done，输出排序结果
  markRange(0, n - 1, 'done');
  const sorted = base.map((b) => b.value as number);
  push(MERGE_SORT_LINES.end, 'finalize', { zh: zh.done(sorted), en: zh.doneEn(sorted) }, [
    `sorted: [${sorted.join(', ')}]`,
  ]);

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
