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

/** 滑动窗口（固定大小最大和）逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const SLIDING_WINDOW_LINES = {
  func: 'func',
  init: 'init',
  buildWindow: 'build-window',
  slideIn: 'slide-in',
  slideOut: 'slide-out',
  updateMax: 'update-max',
  end: 'end',
} as const;

export interface SlidingWindowInput {
  array: number[];
  aux: number;
}

/**
 * 滑动窗口执行器：固定窗口大小 k，先构建初始窗口 [0, k-1]，
 * 再每步右移窗口（新元素进入、旧元素移出、增量更新 windowSum），
 * 比较并更新最大窗口和。k 大于数组长度时生成显式错误步骤。
 * 纯函数、确定性；每一步为完整快照。
 */
export const runSlidingWindow: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { array, aux: k } = input.value as SlidingWindowInput;
  const arr = array.slice();
  const n = arr.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  const base = arr.map((v, i) => item(`a:${i}`, v, 'idle'));
  let left = 0;
  let right = k - 1;
  let windowSum = 0;
  let maxSum = 0;
  let bestLeft = 0;
  let bestRight = Math.min(k - 1, n - 1);

  const variables = (): Record<string, Primitive> => ({
    k,
    n,
    left,
    right,
    windowSum,
    maxSum,
  });

  const pointers = (): PointerState[] => {
    const list: PointerState[] = [];
    if (n > 0 && left >= 0 && left < n) {
      list.push({ id: 'p-left', name: 'left', target: `a:${Math.max(0, Math.min(left, n - 1))}` });
    }
    if (n > 0 && right >= 0 && right < n) {
      list.push({ id: 'p-right', name: 'right', target: `a:${Math.max(0, Math.min(right, n - 1))}` });
    }
    return list;
  };

  /** 依据当前窗口 [left, right] 刷新所有元素状态（窗口内 active，其余 idle） */
  const refreshWindow = (): void => {
    for (let i = 0; i < n; i += 1) {
      base[i]!.state = i >= left && i <= right ? 'active' : 'idle';
    }
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
  push(SLIDING_WINDOW_LINES.init, 'init', {
    zh: `开始滑动窗口：数组共 ${n} 个元素，窗口大小 k = ${k}。将构建窗口 [0, ${k - 1}] 并求出最大窗口和。`,
    en: `Start sliding window: array has ${n} elements, window size k = ${k}. Build window [0, ${k - 1}] and find the maximum window sum.`,
  });

  if (k < 1 || k > n) {
    // 非法窗口大小：明确报错，不假装执行
    for (let i = 0; i < n; i += 1) base[i]!.state = 'invalid';
    push(SLIDING_WINDOW_LINES.init, 'init', {
      zh: k < 1
        ? `窗口大小 k = ${k} 必须为正数。`
        : `窗口大小 k = ${k} 大于数组长度 n = ${n}，无法构造窗口。`,
      en: k < 1
        ? `Window size k = ${k} must be positive.`
        : `Window size k = ${k} exceeds array length n = ${n}; cannot build a window.`,
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 构建初始窗口 [0, k-1]
  refreshWindow();
  for (let i = 0; i < k; i += 1) windowSum += base[i]!.value as number;
  stats.accesses += k;
  maxSum = windowSum;
  push(SLIDING_WINDOW_LINES.buildWindow, 'assign', {
    zh: `构建初始窗口 a[${left}..${right}] = [${arr.slice(0, k).join(', ')}]（蓝色为窗口内元素），windowSum = ${windowSum}，当前最大和 maxSum = ${maxSum}。`,
    en: `Build initial window a[${left}..${right}] = [${arr.slice(0, k).join(', ')}] (blue = in window), windowSum = ${windowSum}, current maxSum = ${maxSum}.`,
  });

  // 窗口逐步右滑
  while (right + 1 < n) {
    // 新元素从右侧进入窗口
    right += 1;
    windowSum += base[right]!.value as number;
    stats.accesses += 1;
    refreshWindow();
    push(SLIDING_WINDOW_LINES.slideIn, 'shift', {
      zh: `窗口右滑：right = ${right}，a[${right}] = ${base[right]!.value} 进入窗口（蓝色），windowSum += ${base[right]!.value} → ${windowSum}。`,
      en: `Slide right: right = ${right}, a[${right}] = ${base[right]!.value} enters the window (blue); windowSum += ${base[right]!.value} → ${windowSum}.`,
    });

    // 旧左端元素移出窗口
    const leaving = left;
    windowSum -= base[left]!.value as number;
    left += 1;
    refreshWindow();
    push(SLIDING_WINDOW_LINES.slideOut, 'shift', {
      zh: `左端移出：a[${leaving}] = ${base[leaving]!.value} 离开窗口（恢复灰色），windowSum -= ${base[leaving]!.value} → ${windowSum}，left = ${left}。`,
      en: `Left end leaves: a[${leaving}] = ${base[leaving]!.value} exits the window (grey again); windowSum -= ${base[leaving]!.value} → ${windowSum}, left = ${left}.`,
    });

    // 比较 windowSum 与 maxSum 并更新
    stats.comparisons += 1;
    const prevMax = maxSum;
    for (let i = left; i <= right; i += 1) base[i]!.state = 'comparing';
    if (windowSum > maxSum) {
      maxSum = windowSum;
      bestLeft = left;
      bestRight = right;
    }
    push(SLIDING_WINDOW_LINES.updateMax, 'compare', {
      zh: windowSum > prevMax
        ? `比较 windowSum = ${windowSum} 与 maxSum = ${prevMax}：${windowSum} > ${prevMax}，更新 maxSum = ${maxSum}（窗口 a[${bestLeft}..${bestRight}] 为当前最优）。`
        : `比较 windowSum = ${windowSum} 与 maxSum = ${prevMax}：未超过当前最大值，maxSum 保持 ${maxSum}。`,
      en: windowSum > prevMax
        ? `Compare windowSum = ${windowSum} with maxSum = ${prevMax}: ${windowSum} > ${prevMax}, update maxSum = ${maxSum} (window a[${bestLeft}..${bestRight}] is currently best).`
        : `Compare windowSum = ${windowSum} with maxSum = ${prevMax}: not greater, maxSum stays ${maxSum}.`,
    });
  }

  // 结束：标出取得最大和的窗口
  refreshWindow();
  for (let i = bestLeft; i <= bestRight; i += 1) base[i]!.state = 'done';
  push(SLIDING_WINDOW_LINES.end, 'finalize', {
    zh: `滑动结束。最大窗口和为 ${maxSum}，由窗口 a[${bestLeft}..${bestRight}] = [${arr.slice(bestLeft, bestRight + 1).join(', ')}] 取得（绿色）。`,
    en: `Sliding complete. Maximum window sum is ${maxSum}, achieved by window a[${bestLeft}..${bestRight}] = [${arr.slice(bestLeft, bestRight + 1).join(', ')}] (green).`,
  }, [`max window sum = ${maxSum}`]);

  return {
    steps,
    summary: {
      result: `max window sum = ${maxSum}`,
      resultValue: maxSum,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
