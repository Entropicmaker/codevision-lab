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

/** 双指针（两数之和）逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const TWO_POINTERS_LINES = {
  func: 'func',
  init: 'init',
  while: 'while',
  sum: 'sum',
  found: 'found',
  upLeft: 'up-left',
  upRight: 'up-right',
  notFound: 'not-found',
} as const;

export interface TwoPointersInput {
  array: number[];
  aux: number;
}

const isSorted = (a: number[]): boolean => a.every((v, i) => i === 0 || a[i - 1]! <= v);

/**
 * 双指针（两数之和）执行器：在有序数组两端放置 left / right 指针，
 * 根据当前两数之和与 target 的大小关系移动指针。要求输入数组有序；
 * 无序输入会生成显式错误步骤（诚实反馈）。纯函数、确定性；每一步为完整快照。
 */
export const runTwoPointers: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { array, aux: target } = input.value as TwoPointersInput;
  const arr = array.slice();
  const n = arr.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  let left = 0;
  let right = n - 1;
  let sum = 0;

  const base = arr.map((v, i) => item(`a:${i}`, v, 'idle'));
  const sortedOk = isSorted(arr);

  const variables = (): Record<string, Primitive> => ({
    n,
    target,
    left,
    right,
    sum,
    'a[left]': n > 0 && left >= 0 && left < n ? (base[left]?.value ?? null) : null,
    'a[right]': n > 0 && right >= 0 && right < n ? (base[right]?.value ?? null) : null,
  });

  const pointers = (): PointerState[] => {
    const list: PointerState[] = [];
    if (n > 0) {
      list.push({ id: 'p-left', name: 'left', target: `a:${Math.max(0, Math.min(left, n - 1))}` });
      list.push({ id: 'p-right', name: 'right', target: `a:${Math.max(0, Math.min(right, n - 1))}` });
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
  push(TWO_POINTERS_LINES.init, 'init', {
    zh: `开始双指针：在有序数组（${n} 个元素）中找两个数使其和等于 target = ${target}。左指针 left = ${left}，右指针 right = ${right}。`,
    en: `Start two pointers: find two numbers in the sorted array (${n} elements) that sum to target = ${target}. left pointer = ${left}, right pointer = ${right}.`,
  });

  if (!sortedOk) {
    // 无序输入：明确报错，不假装执行
    for (let k = 0; k < n; k += 1) base[k]!.state = 'invalid';
    push(TWO_POINTERS_LINES.init, 'init', {
      zh: '输入数组不是升序排列。双指针两数之和依赖数组有序性，请先对数组排序后再试。',
      en: 'The input array is not sorted. Two-pointer two-sum relies on the sorted order — sort it first.',
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  if (n < 2) {
    push(TWO_POINTERS_LINES.notFound, 'not-found', {
      zh: n === 0
        ? '数组为空，无法找到两个数。'
        : `数组只有一个元素，无法找到两个数使其和为 ${target}。`,
      en: n === 0
        ? 'Array is empty; cannot find two numbers.'
        : `Only one element; cannot find two numbers summing to ${target}.`,
    }, ['not found']);
    return {
      steps,
      summary: { result: 'not found', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  let found = false;
  while (left < right) {
    // 计算当前两数之和
    sum = (base[left]!.value as number) + (base[right]!.value as number);
    stats.comparisons += 1;
    stats.accesses += 2;
    base[left]!.state = 'comparing';
    base[right]!.state = 'comparing';
    push(TWO_POINTERS_LINES.sum, 'compare', {
      zh: `计算 sum = a[${left}] + a[${right}] = ${base[left]!.value} + ${base[right]!.value} = ${sum}（黄色为当前比较的两个候选）。`,
      en: `Compute sum = a[${left}] + a[${right}] = ${base[left]!.value} + ${base[right]!.value} = ${sum} (yellow = the two candidates).`,
    });

    if (sum === target) {
      found = true;
      base[left]!.state = 'done';
      base[right]!.state = 'done';
      push(TWO_POINTERS_LINES.found, 'found', {
        zh: `sum == ${target}，找到答案！a[${left}] + a[${right}] = ${target}，返回下标 (${left}, ${right})。`,
        en: `sum == ${target}, found! a[${left}] + a[${right}] = ${target}; return indices (${left}, ${right}).`,
      }, [`found at indices ${left} and ${right}`]);
      break;
    }
    if (sum < target) {
      // 和太小：排除左侧候选，左指针右移
      base[left]!.state = 'done';
      const excluded = left;
      left += 1;
      push(TWO_POINTERS_LINES.upLeft, 'shift', {
        zh: `sum = ${sum} < ${target}，和太小：a[${excluded}] = ${base[excluded]!.value} 已被排除（绿色），左指针右移：left = ${left}。`,
        en: `sum = ${sum} < ${target}, too small: a[${excluded}] = ${base[excluded]!.value} is excluded (green); left pointer moves right to ${left}.`,
      });
    } else {
      // 和太大：排除右侧候选，右指针左移
      base[right]!.state = 'done';
      const excluded = right;
      right -= 1;
      push(TWO_POINTERS_LINES.upRight, 'shift', {
        zh: `sum = ${sum} > ${target}，和太大：a[${excluded}] = ${base[excluded]!.value} 已被排除（绿色），右指针左移：right = ${right}。`,
        en: `sum = ${sum} > ${target}, too large: a[${excluded}] = ${base[excluded]!.value} is excluded (green); right pointer moves left to ${right}.`,
      });
    }
  }

  if (!found) {
    push(TWO_POINTERS_LINES.notFound, 'not-found', {
      zh: `left(${left}) >= right(${right})，两指针相遇：数组中不存在和为 ${target} 的两个数。`,
      en: `left(${left}) >= right(${right}), pointers have met: no two numbers in the array sum to ${target}.`,
    }, ['not found']);
  }

  return {
    steps,
    summary: {
      result: found ? `found at ${left}, ${right}` : 'not found',
      resultValue: found ? `${left},${right}` : null,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
