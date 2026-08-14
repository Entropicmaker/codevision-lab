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

/** 插入排序逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const INSERTION_SORT_LINES = {
  func: 'func',
  init: 'init',
  outer: 'outer',
  key: 'key',
  'shift-loop': 'shift-loop',
  compare: 'compare',
  shift: 'shift',
  insert: 'insert',
  end: 'end',
} as const;

const zh = {
  init: (n: number) =>
    n === 0
      ? '数组为空，无需排序。'
      : `开始插入排序：共 ${n} 个元素。第一个元素视为已排序前缀，逐个把后续元素插入正确位置。`,
  initEn: (n: number) =>
    n === 0
      ? 'Array is empty, nothing to sort.'
      : `Start insertion sort: ${n} elements. The first element is the sorted prefix; insert each following element into its correct position.`,
  outer: (round: number, idx: number) =>
    `第 ${round} 轮：将 a[${idx}] 插入到已排序前缀 a[0..${idx - 1}] 的正确位置。`,
  outerEn: (round: number, idx: number) =>
    `Round ${round}: insert a[${idx}] into the correct position of the sorted prefix a[0..${idx - 1}].`,
  key: (idx: number, val: number) => `取出 key = a[${idx}] = ${val}，作为待插入元素。`,
  keyEn: (idx: number, val: number) => `Take key = a[${idx}] = ${val} as the element to insert.`,
  shiftLoop: (j: number) => `内层左移：j = ${j}，比较 a[${j}] 与 key。`,
  shiftLoopEn: (j: number) => `Inner leftward scan: j = ${j}, compare a[${j}] with key.`,
  compare: (j: number, x: number, key: number) =>
    `比较 a[${j}]=${x} 与 key=${key}：${x > key ? `${x} > ${key}，需要向后移位。` : `${x} ≤ ${key}，无需移位。`}`,
  compareEn: (j: number, x: number, key: number) =>
    `Compare a[${j}]=${x} and key=${key}: ${x > key ? `${x} > ${key}, shift it right.` : `${x} <= ${key}, no shift needed.`}`,
  shift: (j: number, x: number) => `a[${j}]=${x} > key，向后移位：a[${j + 1}] = a[${j}]。`,
  shiftEn: (j: number, x: number) => `a[${j}]=${x} > key, shift right: a[${j + 1}] = a[${j}].`,
  noShift: (j: number, x: number, key: number) =>
    `a[${j}]=${x} ≤ key=${key}，key 保持原位，无需移位。`,
  noShiftEn: (j: number, x: number, key: number) =>
    `a[${j}]=${x} <= key=${key}, key stays in place, no shift needed.`,
  insert: (pos: number, key: number) => `插入 key=${key} 到位置 a[${pos}]，前缀 a[0..${pos}] 保持有序。`,
  insertEn: (pos: number, key: number) =>
    `Insert key=${key} into position a[${pos}], prefix a[0..${pos}] stays sorted.`,
  done: (arr: number[]) => `排序完成：数组已按升序排列为 [${arr.join(', ')}]。`,
  doneEn: (arr: number[]) => `Sorted: the array is now ascending [${arr.join(', ')}].`,
};

/**
 * 插入排序执行器：纯函数、确定性。
 * 每轮取出 key = a[i]，向左扫描把比 key 大的元素后移，最后把 key 插入正确位置。
 * 最好情况（已排序）为 O(n)，平均/最坏 O(n²)；空间 O(1)，稳定排序。
 */
export const runInsertionSort: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const arr = (input.value as number[]).slice();
  const n = arr.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每步 push 时深拷贝进快照，保证步骤之间互不影响
  const base: DisplayItem[] = arr.map((v, i) => item(`a:${i}`, v, 'idle'));
  let i = 0;
  let j = 0;
  let key: number | null = null;

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
    return list;
  };

  const variables = (): Record<string, Primitive> => ({
    n,
    i,
    j,
    key,
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

  // 初始状态：第一个元素视为已排序
  push(INSERTION_SORT_LINES.init, 'init', { zh: zh.init(n), en: zh.initEn(n) });
  if (n >= 1) setState(0, 'done');

  for (i = 1; i < n; i += 1) {
    push(INSERTION_SORT_LINES.outer, 'assign', {
      zh: zh.outer(i + 1, i),
      en: zh.outerEn(i + 1, i),
    });

    // 取出 key
    const keyValue = base[i]?.value as number;
    key = keyValue;
    setState(i, 'active');
    push(INSERTION_SORT_LINES.key, 'assign', { zh: zh.key(i, keyValue), en: zh.keyEn(i, keyValue) });

    // 向左扫描，把比 key 大的元素后移
    j = i - 1;
    while (j >= 0) {
      setState(j, 'comparing');
      push(INSERTION_SORT_LINES['shift-loop'], 'assign', {
        zh: zh.shiftLoop(j),
        en: zh.shiftLoopEn(j),
      });

      // 比较
      stats.comparisons += 1;
      stats.accesses += 2;
      const x = base[j]?.value as number;
      push(INSERTION_SORT_LINES.compare, 'compare', {
        zh: zh.compare(j, x, keyValue),
        en: zh.compareEn(j, x, keyValue),
      });

      if (x > keyValue) {
        // 向后移位
        stats.writes += 1;
        const shifted = base[j] as DisplayItem;
        base[j + 1] = { ...shifted, id: `a:${j + 1}` };
        setState(j, 'active');
        setState(j + 1, 'active');
        push(INSERTION_SORT_LINES.shift, 'shift', { zh: zh.shift(j, x), en: zh.shiftEn(j, x) });
        j -= 1;
      } else {
        push(INSERTION_SORT_LINES.compare, 'no-op', {
          zh: zh.noShift(j, x, keyValue),
          en: zh.noShiftEn(j, x, keyValue),
        });
        break;
      }
    }

    // 插入 key
    stats.writes += 1;
    base[j + 1] = { value: keyValue, state: 'done', id: `a:${j + 1}` };
    setStates(Array.from({ length: i + 1 }, (_, k) => k), 'done');
    push(INSERTION_SORT_LINES.insert, 'assign', {
      zh: zh.insert(j + 1, keyValue),
      en: zh.insertEn(j + 1, keyValue),
    });
  }

  // 结束
  if (n >= 1) setStates(Array.from({ length: n }, (_, k) => k), 'done');
  i = Math.max(0, n - 1);
  j = Math.max(0, n - 1);
  key = null;
  const sorted = base.map((b) => b.value as number);
  push(INSERTION_SORT_LINES.end, 'finalize', { zh: zh.done(sorted), en: zh.doneEn(sorted) }, [], [
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
