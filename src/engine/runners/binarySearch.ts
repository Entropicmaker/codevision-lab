import type {
  AlgorithmRunner,
  AlgorithmStep,
  OpStats,
  OperationType,
  ParsedInput,
  PointerState,
  Primitive,
  RunnerResult,
} from '../types/step';
import { emptyStats, item } from '../types/step';

/** 二分搜索逻辑代码行 id */
export const BINARY_SEARCH_LINES = {
  func: 'func',
  init: 'init',
  while: 'while',
  mid: 'mid',
  compare: 'compare',
  found: 'found',
  upLo: 'up-lo',
  upHi: 'up-hi',
  notFound: 'not-found',
} as const;

export interface BinarySearchInput {
  array: number[];
  aux: number;
}

const isSorted = (a: number[]): boolean => a.every((v, i) => i === 0 || a[i - 1]! <= v);

/**
 * 二分搜索执行器：要求输入数组有序；无序输入会生成显式错误步骤（诚实反馈）。
 * 纯函数、确定性；每一步为完整快照。
 */
export const runBinarySearch: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { array, aux: target } = input.value as BinarySearchInput;
  const arr = array.slice();
  const n = arr.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  let lo = 0;
  let hi = n - 1;
  let mid = 0;

  const base = arr.map((v, i) => item(`a:${i}`, v, 'idle'));
  const sortedOk = isSorted(arr);

  const variables = (): Record<string, Primitive> => ({
    n,
    target,
    lo,
    hi,
    mid,
    'a[mid]': n > 0 && mid >= 0 && mid < n ? (base[mid]?.value ?? null) : null,
  });

  const pointers = (): PointerState[] => {
    const list: PointerState[] = [];
    if (n > 0) {
      list.push({ id: 'p-lo', name: 'lo', target: `a:${Math.max(0, Math.min(lo, n - 1))}` });
      list.push({ id: 'p-mid', name: 'mid', target: `a:${Math.max(0, Math.min(mid, n - 1))}` });
      list.push({ id: 'p-hi', name: 'hi', target: `a:${Math.max(0, Math.min(hi, n - 1))}` });
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
      structures: [],
      variables: variables(),
      pointers: pointers(),
      callStack: [],
      output,
      explanation,
      stats: { ...stats },
    };
    steps.push(step);
  };

  // 初始
  push(BINARY_SEARCH_LINES.init, 'init', {
    zh: `开始二分搜索：在有序数组（${n} 个元素）中查找 target = ${target}。初始区间 [${lo}, ${hi}]。`,
    en: `Start binary search for target = ${target} in the sorted array (${n} elements). Initial range [${lo}, ${hi}].`,
  });

  if (!sortedOk) {
    // 无序输入：明确报错，不假装执行
    for (let k = 0; k < n; k += 1) base[k]!.state = 'invalid';
    push(BINARY_SEARCH_LINES.init, 'init', {
      zh: '输入数组不是升序排列。二分搜索的前提是数组有序，请先对数组排序后再试。',
      en: 'The input array is not sorted. Binary search requires a sorted array — sort it first.',
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  if (n === 0) {
    push(BINARY_SEARCH_LINES.notFound, 'not-found', {
      zh: `数组为空，未找到 ${target}。`,
      en: `Array is empty, ${target} not found.`,
    }, ['not found']);
    return {
      steps,
      summary: { result: 'not found', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  let found = false;
  while (lo <= hi) {
    mid = Math.floor((lo + hi) / 2);
    // 计算中点
    for (let k = 0; k < lo; k += 1) base[k]!.state = 'done'; // 已排除左侧
    for (let k = hi + 1; k < n; k += 1) base[k]!.state = 'done'; // 已排除右侧
    base[mid]!.state = 'active';
    push(BINARY_SEARCH_LINES.mid, 'assign', {
      zh: `计算中点：mid = (${lo} + ${hi}) / 2 = ${mid}，当前候选 a[${mid}] = ${base[mid]!.value}。`,
      en: `Compute mid = (${lo} + ${hi}) / 2 = ${mid}; candidate a[${mid}] = ${base[mid]!.value}.`,
    });

    // 比较
    stats.comparisons += 1;
    stats.accesses += 1;
    const midValue = base[mid]!.value as number;
    base[mid]!.state = 'comparing';
    push(BINARY_SEARCH_LINES.compare, 'compare', {
      zh: `比较 a[${mid}] = ${midValue} 与 target = ${target}。`,
      en: `Compare a[${mid}] = ${midValue} with target = ${target}.`,
    });

    if (midValue === target) {
      found = true;
      base[mid]!.state = 'done';
      push(BINARY_SEARCH_LINES.found, 'found', {
        zh: `a[${mid}] == ${target}，找到目标！返回下标 ${mid}。`,
        en: `a[${mid}] == ${target}, found! Return index ${mid}.`,
      }, [`found at index ${mid}`]);
      break;
    }
    if (midValue < target) {
      // 排除左半区
      for (let k = lo; k <= mid; k += 1) base[k]!.state = 'done';
      lo = mid + 1;
      push(BINARY_SEARCH_LINES.upLo, 'shift', {
        zh: `a[${mid}] = ${midValue} < ${target}，目标在右半区：更新 lo = mid + 1 = ${lo}。`,
        en: `a[${mid}] = ${midValue} < ${target}; target is in the right half: lo = mid + 1 = ${lo}.`,
      });
    } else {
      // 排除右半区
      for (let k = mid; k <= hi; k += 1) base[k]!.state = 'done';
      hi = mid - 1;
      push(BINARY_SEARCH_LINES.upHi, 'shift', {
        zh: `a[${mid}] = ${midValue} > ${target}，目标在左半区：更新 hi = mid - 1 = ${hi}。`,
        en: `a[${mid}] = ${midValue} > ${target}; target is in the left half: hi = mid - 1 = ${hi}.`,
      });
    }
  }

  if (!found) {
    push(BINARY_SEARCH_LINES.notFound, 'not-found', {
      zh: `lo(${lo}) > hi(${hi})，搜索区间为空：数组中不存在 ${target}，返回 -1。`,
      en: `lo(${lo}) > hi(${hi}), search range is empty: ${target} is not in the array; return -1.`,
    }, ['not found']);
  }

  return {
    steps,
    summary: {
      result: found ? String(mid) : 'not found',
      resultValue: found ? mid : null,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
