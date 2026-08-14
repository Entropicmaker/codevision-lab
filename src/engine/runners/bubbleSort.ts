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

/** 冒泡排序逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const BUBBLE_SORT_LINES = {
  func: 'func',
  init: 'init',
  outer: 'outer',
  inner: 'inner',
  compare: 'compare',
  swap: 'swap',
  end: 'end',
} as const;

const zh = {
  init: (n: number) =>
    n === 0 ? '数组为空，无需排序。' : `开始冒泡排序：共 ${n} 个元素。每一轮把未排序部分的最大值"冒泡"到末尾。`,
  initEn: (n: number) =>
    n === 0
      ? 'Array is empty, nothing to sort.'
      : `Start bubble sort: ${n} elements. Each pass bubbles the largest value of the unsorted part to the end.`,
  outer: (round: number, bound: number) =>
    `第 ${round} 轮：在 a[0..${bound}] 中找出最大值，冒泡到位置 ${bound}。`,
  outerEn: (round: number, bound: number) =>
    `Pass ${round}: bubble the largest value of a[0..${bound}] to position ${bound}.`,
  inner: (j: number) => `内层循环推进：j = ${j}。`,
  innerEn: (j: number) => `Inner loop advances: j = ${j}.`,
  compare: (j: number, x: number, y: number) =>
    `比较 a[${j}]=${x} 与 a[${j + 1}]=${y}：${x > y ? `${x} > ${y}，需要交换。` : `${x} ≤ ${y}，保持不动。`}`,
  compareEn: (j: number, x: number, y: number) =>
    `Compare a[${j}]=${x} and a[${j + 1}]=${y}: ${x > y ? `${x} > ${y}, swap needed.` : `${x} <= ${y}, keep order.`}`,
  swap: (j: number, x: number, y: number) => `交换 a[${j}] 与 a[${j + 1}]：${y} ⇄ ${x}。`,
  swapEn: (j: number, x: number, y: number) => `Swap a[${j}] and a[${j + 1}]: ${y} ⇄ ${x}.`,
  roundDone: (round: number, pos: number, max: number) =>
    `第 ${round} 轮完成：a[${pos}]=${max} 已就位（绿色区域为已排序后缀）。`,
  roundDoneEn: (round: number, pos: number, max: number) =>
    `Pass ${round} done: a[${pos}]=${max} is in place (green suffix is sorted).`,
  done: (arr: number[]) => `排序完成：数组已按升序排列为 [${arr.join(', ')}]。`,
  doneEn: (arr: number[]) => `Sorted: the array is now ascending [${arr.join(', ')}].`,
};

/**
 * 冒泡排序执行器：纯函数、确定性。
 * 每一步都是完整状态快照，后退恢复无需反向执行。
 */
export const runBubbleSort: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const arr = (input.value as number[]).slice();
  const n = arr.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每步 push 时深拷贝进快照，保证步骤之间互不影响
  const base: DisplayItem[] = arr.map((v, i) => item(`a:${i}`, v, 'idle'));
  let i = 0;
  let j = 0;

  const setStates = (ids: number[], state: ElementState): void => {
    for (const id of ids) {
      const el = base[id];
      if (el) el.state = state;
    }
  };

  const pointers = (): PointerState[] => {
    const list: PointerState[] = [];
    if (i >= 0 && i < n) list.push({ id: 'p-i', name: 'i', target: `a:${i}` });
    if (j >= 0 && j < n) list.push({ id: 'p-j', name: 'j', target: `a:${j}` });
    return list;
  };

  const variables = (): Record<string, Primitive> => ({
    n,
    i,
    j,
    'a[j]': j >= 0 && j < n ? (base[j]?.value ?? null) : null,
    'a[j+1]': j + 1 >= 0 && j + 1 < n ? (base[j + 1]?.value ?? null) : null,
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
  push(BUBBLE_SORT_LINES.init, 'init', { zh: zh.init(n), en: zh.initEn(n) });

  for (i = 0; i < n - 1; i += 1) {
    // 进入第 i 轮：后缀 [n-i, n-1] 已就位（i>0 时）
    if (i > 0) setStates(Array.from({ length: i }, (_, k) => n - 1 - k), 'done');
    push(BUBBLE_SORT_LINES.outer, 'assign', {
      zh: zh.outer(i + 1, n - i - 1),
      en: zh.outerEn(i + 1, n - i - 1),
    });

    for (j = 0; j < n - i - 1; j += 1) {
      push(BUBBLE_SORT_LINES.inner, 'assign', { zh: zh.inner(j), en: zh.innerEn(j) });

      // 比较
      stats.comparisons += 1;
      stats.accesses += 2;
      setStates([j, j + 1], 'comparing');
      const x = base[j]?.value as number;
      const y = base[j + 1]?.value as number;
      push(BUBBLE_SORT_LINES.compare, 'compare', {
        zh: zh.compare(j, x, y),
        en: zh.compareEn(j, x, y),
      });

      if (x > y) {
        // 交换
        stats.swaps += 1;
        stats.writes += 2;
        const tmp = base[j] as DisplayItem;
        const next = base[j + 1] as DisplayItem;
        base[j] = { ...next, id: `a:${j}` };
        base[j + 1] = { ...tmp, id: `a:${j + 1}` };
        setStates([j, j + 1], 'done');
        push(BUBBLE_SORT_LINES.swap, 'swap', {
          zh: zh.swap(j, x, y),
          en: zh.swapEn(j, x, y),
        });
      } else {
        setStates([j, j + 1], 'idle');
      }
    }

    // 本轮结束：a[n-i-1] 就位
    setStates([n - i - 1], 'done');
    push(BUBBLE_SORT_LINES.outer, 'no-op', {
      zh: zh.roundDone(i + 1, n - i - 1, base[n - i - 1]?.value as number),
      en: zh.roundDoneEn(i + 1, n - i - 1, base[n - i - 1]?.value as number),
    });
  }

  // 结束
  if (n > 1) setStates(Array.from({ length: n }, (_, k) => k), 'done');
  i = Math.max(0, n - 2);
  j = Math.max(0, n - 2);
  const sorted = base.map((b) => b.value as number);
  push(BUBBLE_SORT_LINES.end, 'finalize', { zh: zh.done(sorted), en: zh.doneEn(sorted) }, [], [
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
