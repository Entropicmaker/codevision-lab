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

/** 选择排序逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const SELECTION_SORT_LINES = {
  func: 'func',
  init: 'init',
  outer: 'outer',
  inner: 'inner',
  compare: 'compare',
  'update-min': 'update-min',
  swap: 'swap',
  end: 'end',
} as const;

const zh = {
  init: (n: number) =>
    n === 0
      ? '数组为空，无需排序。'
      : `开始选择排序：共 ${n} 个元素。每轮从未排序部分选出最小值，放到已排序前缀末尾。`,
  initEn: (n: number) =>
    n === 0
      ? 'Array is empty, nothing to sort.'
      : `Start selection sort: ${n} elements. Each round selects the minimum of the unsorted part and places it at the end of the sorted prefix.`,
  outer: (round: number, from: number, to: number) =>
    `第 ${round} 轮：在 a[${from}..${to}] 中寻找最小值，将与 a[${from}] 交换（绿色为已排序前缀）。`,
  outerEn: (round: number, from: number, to: number) =>
    `Round ${round}: find the minimum in a[${from}..${to}] and swap it with a[${from}] (green is the sorted prefix).`,
  inner: (j: number) => `内层扫描推进：j = ${j}，比较 a[${j}] 与当前最小值 a[min]。`,
  innerEn: (j: number) => `Inner scan advances: j = ${j}, compare a[${j}] with the current minimum a[min].`,
  compare: (j: number, x: number, min: number, y: number) =>
    `比较 a[${j}]=${x} 与 a[${min}]=${y}：${x < y ? `${x} < ${y}，发现更小值。` : `${x} ≥ ${y}，min 不变。`}`,
  compareEn: (j: number, x: number, min: number, y: number) =>
    `Compare a[${j}]=${x} and a[${min}]=${y}: ${x < y ? `${x} < ${y}, a smaller value found.` : `${x} >= ${y}, min unchanged.`}`,
  updateMin: (j: number, x: number, oldMin: number) =>
    `a[${j}]=${x} 更小，更新 min = ${j}（原 min = ${oldMin}）。`,
  updateMinEn: (j: number, x: number, oldMin: number) =>
    `a[${j}]=${x} is smaller, update min = ${j} (was ${oldMin}).`,
  swap: (i: number, min: number, x: number, y: number) =>
    `交换 a[${i}] 与 a[min]=a[${min}]：${y} ⇄ ${x}，最小值就位。`,
  swapEn: (i: number, min: number, x: number, y: number) =>
    `Swap a[${i}] and a[min]=a[${min}]: ${y} ⇄ ${x}, the minimum is now in place.`,
  noSwap: (i: number, x: number) => `a[${i}]=${x} 已是最小值，无需交换。`,
  noSwapEn: (i: number, x: number) => `a[${i}]=${x} is already the minimum, no swap needed.`,
  done: (arr: number[]) => `排序完成：数组已按升序排列为 [${arr.join(', ')}]。`,
  doneEn: (arr: number[]) => `Sorted: the array is now ascending [${arr.join(', ')}].`,
};

/**
 * 选择排序执行器：纯函数、确定性。
 * 每轮在未排序区间 [i, n-1] 选出最小值，与 a[i] 交换；已排序前缀逐步扩大。
 * 比较次数恒为 n(n-1)/2，交换次数最多 n-1 次。
 */
export const runSelectionSort: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const arr = (input.value as number[]).slice();
  const n = arr.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每步 push 时深拷贝进快照，保证步骤之间互不影响
  const base: DisplayItem[] = arr.map((v, i) => item(`a:${i}`, v, 'idle'));
  let i = 0;
  let j = 0;
  let minIndex = 0;

  const setStates = (ids: number[], state: ElementState): void => {
    for (const id of ids) {
      const el = base[id];
      if (el) el.state = state;
    }
  };

  const setState = (id: number, state: ElementState): void => {
    const el = base[id];
    if (el) el.state = state;
  };

  const pointers = (): PointerState[] => {
    const list: PointerState[] = [];
    if (i >= 0 && i < n) list.push({ id: 'p-i', name: 'i', target: `a:${i}` });
    if (j >= 0 && j < n) list.push({ id: 'p-j', name: 'j', target: `a:${j}` });
    if (minIndex >= 0 && minIndex < n)
      list.push({ id: 'p-min', name: 'min', target: `a:${minIndex}` });
    return list;
  };

  const variables = (): Record<string, Primitive> => ({
    n,
    i,
    j,
    minIndex,
    'a[min]': minIndex >= 0 && minIndex < n ? (base[minIndex]?.value ?? null) : null,
  });

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: { zh: string; en: string },
    callStack: CallFrame[] = [],
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
      callStack,
      output,
      explanation,
      stats: { ...stats },
    };
    steps.push(step);
  };

  // 初始状态
  push(SELECTION_SORT_LINES.init, 'init', { zh: zh.init(n), en: zh.initEn(n) });

  for (i = 0; i < n - 1; i += 1) {
    // 已排序前缀 [0..i-1] 标 done
    if (i > 0) setStates(Array.from({ length: i }, (_, k) => k), 'done');
    minIndex = i;
    setState(i, 'active');
    push(SELECTION_SORT_LINES.outer, 'assign', {
      zh: zh.outer(i + 1, i, n - 1),
      en: zh.outerEn(i + 1, i, n - 1),
    });

    for (j = i + 1; j < n; j += 1) {
      setState(j, 'comparing');
      setState(minIndex, 'active');
      push(SELECTION_SORT_LINES.inner, 'assign', { zh: zh.inner(j), en: zh.innerEn(j) });

      // 比较
      stats.comparisons += 1;
      stats.accesses += 2;
      setState(j, 'comparing');
      setState(minIndex, 'comparing');
      const x = base[j]?.value as number;
      const y = base[minIndex]?.value as number;
      push(SELECTION_SORT_LINES.compare, 'compare', {
        zh: zh.compare(j, x, minIndex, y),
        en: zh.compareEn(j, x, minIndex, y),
      });

      if (x < y) {
        // 找到更小值，更新 minIndex
        const oldMin = minIndex;
        minIndex = j;
        setState(minIndex, 'active');
        setState(oldMin, 'idle');
        push(SELECTION_SORT_LINES['update-min'], 'assign', {
          zh: zh.updateMin(j, x, oldMin),
          en: zh.updateMinEn(j, x, oldMin),
        });
      } else {
        setState(j, 'idle');
        setState(minIndex, 'active');
      }
    }

    // 本轮结束：交换 a[i] 与 a[minIndex]（若 min 已在原位则无需交换）
    if (minIndex !== i) {
      stats.swaps += 1;
      stats.writes += 2;
      const tmp = base[i] as DisplayItem;
      const minEl = base[minIndex] as DisplayItem;
      base[i] = { ...minEl, id: `a:${i}` };
      base[minIndex] = { ...tmp, id: `a:${minIndex}` };
      setState(i, 'done');
      setState(minIndex, 'idle');
      push(SELECTION_SORT_LINES.swap, 'swap', {
        zh: zh.swap(i, minIndex, tmp.value as number, minEl.value as number),
        en: zh.swapEn(i, minIndex, tmp.value as number, minEl.value as number),
      });
    } else {
      setState(i, 'done');
      push(SELECTION_SORT_LINES.swap, 'no-op', {
        zh: zh.noSwap(i, base[i]?.value as number),
        en: zh.noSwapEn(i, base[i]?.value as number),
      });
    }
  }

  // 结束
  if (n >= 1) setStates(Array.from({ length: n }, (_, k) => k), 'done');
  i = Math.max(0, n - 1);
  j = Math.max(0, n - 1);
  minIndex = Math.max(0, n - 1);
  const sorted = base.map((b) => b.value as number);
  push(SELECTION_SORT_LINES.end, 'finalize', { zh: zh.done(sorted), en: zh.doneEn(sorted) }, [], [
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
