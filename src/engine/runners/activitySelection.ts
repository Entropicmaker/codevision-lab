import type {
  AlgorithmRunner,
  AlgorithmStep,
  DisplayItem,
  OpStats,
  OperationType,
  ParsedInput,
  Primitive,
  RunnerResult,
} from '../types/step';
import { emptyStats, item } from '../types/step';

/** 活动选择（贪心）逻辑代码行 id（与三语言源码 / 伪代码中的标记一致） */
export const ACTIVITY_LINES = {
  func: 'func',
  init: 'init',
  sort: 'sort',
  check: 'check',
  select: 'select',
  skip: 'skip',
  end: 'end',
} as const;

type Interval = [number, number];

const fmt = (s: number, e: number): string => `${s}-${e}`;

/**
 * 活动选择执行器（贪心：按结束时间最早优先）。
 * 输入为区间列表（[start, end] 对，来自 interval-list 解析）；
 * 纯函数、确定性，每一步都是完整快照。
 */
export const runActivitySelection: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const intervals: Interval[] = (input.value as Interval[]).slice();
  const n = intervals.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 确定性排序：结束时间升序 → 开始时间升序 → 原始下标（稳定）
  const sorted = intervals
    .map((iv, i) => ({ s: iv[0], e: iv[1], orig: i }))
    .sort((a, b) => a.e - b.e || a.s - b.s || a.orig - b.orig);

  // 原始顺序（func / init 快照）
  const originalItems: DisplayItem[] = intervals.map((iv, i) =>
    item(`a:${i}`, fmt(iv[0], iv[1]), 'idle'),
  );
  // 排序后的可变工作副本（主快照）
  const base: DisplayItem[] = sorted.map((a, i) => item(`a:${i}`, fmt(a.s, a.e), 'idle'));

  let lastEnd = -1;
  let count = 0;
  let current = -1;
  const selected: string[] = [];

  const variables = (): Record<string, Primitive> => ({
    lastEnd,
    count,
    current,
  });

  const originalSnapshot = (): Record<string, DisplayItem[]> => ({
    activities: originalItems.map((o) => ({ ...o })),
  });

  const sortedSnapshot = (): Record<string, DisplayItem[]> => ({
    activities: base.map((b) => ({ ...b })),
  });

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: { zh: string; en: string },
    containers: Record<string, DisplayItem[]>,
    output: string[] = [],
  ): void => {
    steps.push({
      stepId: steps.length,
      codeLineId,
      operation,
      containers,
      structures: [],
      variables: variables(),
      pointers: [],
      callStack: [],
      output,
      explanation,
      stats: { ...stats },
    });
  };

  // 空输入：显式反馈
  if (n === 0) {
    push(ACTIVITY_LINES.init, 'init', {
      zh: '活动列表为空，无需选择。',
      en: 'The activity list is empty, nothing to select.',
    }, originalSnapshot());
    push(ACTIVITY_LINES.end, 'finalize', {
      zh: '结果：选中 0 个活动。',
      en: 'Result: 0 activities selected.',
    }, originalSnapshot(), []);
    return {
      steps,
      summary: { result: '', resultValue: 0, totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 1. 进入函数
  push(ACTIVITY_LINES.func, 'no-op', {
    zh: `进入 activitySelection：共 ${n} 个活动（区间 [start, end]），目标是选出数量最多、两两互不重叠（相容）的活动子集。`,
    en: `Enter activitySelection: ${n} activities (intervals [start, end]); the goal is to pick a maximum-size subset of pairwise non-overlapping (compatible) activities.`,
  }, originalSnapshot());

  // 2. 初始化变量
  push(ACTIVITY_LINES.init, 'init', {
    zh: '初始化：lastEnd = -1（尚无已选活动），count = 0。',
    en: 'Init: lastEnd = -1 (no activity selected yet), count = 0.',
  }, originalSnapshot());

  // 3. 贪心第一步：按结束时间升序排序
  const order = sorted.map((a) => fmt(a.s, a.e)).join(', ');
  push(ACTIVITY_LINES.sort, 'assign', {
    zh: `贪心策略第一步：按结束时间升序排序 → [${order}]。每次优先选结束最早的活动，给后续留下最多时间。`,
    en: `Greedy step one: sort by finish time ascending → [${order}]. Always pick the earliest-finishing activity first to leave the most room for the rest.`,
  }, sortedSnapshot());

  // 4. 逐个活动考察
  for (let i = 0; i < n; i += 1) {
    current = i;
    const { s, e } = sorted[i];
    const prevLast = lastEnd;

    base[i].state = 'active';
    push(ACTIVITY_LINES.check, 'assign', {
      zh: `当前考察第 ${i + 1} 个活动 [${fmt(s, e)}]（蓝色）。`,
      en: `Examine activity #${i + 1} [${fmt(s, e)}] (blue).`,
    }, sortedSnapshot());

    base[i].state = 'comparing';
    stats.comparisons += 1;
    stats.accesses += 2;
    push(ACTIVITY_LINES.check, 'compare', {
      zh: `比较开始时间 s=${s} 与已选活动的结束时间 lastEnd=${prevLast}：${s >= prevLast ? `${s} ≥ ${prevLast}，相容` : `${s} < ${prevLast}，重叠`}。`,
      en: `Compare start s=${s} with the last selected finish lastEnd=${prevLast}: ${s >= prevLast ? `${s} >= ${prevLast}, compatible` : `${s} < ${prevLast}, overlap`}.`,
    }, sortedSnapshot());

    if (s >= prevLast) {
      base[i].state = 'done';
      lastEnd = e;
      count += 1;
      selected.push(fmt(s, e));
      stats.writes += 1;
      push(ACTIVITY_LINES.select, 'assign', {
        zh: `相容（${s} ≥ ${prevLast}）：选中活动 [${fmt(s, e)}]，更新 lastEnd = ${e}，count = ${count}。`,
        en: `Compatible (${s} >= ${prevLast}): select [${fmt(s, e)}], update lastEnd = ${e}, count = ${count}.`,
      }, sortedSnapshot());
    } else {
      base[i].state = 'invalid';
      push(ACTIVITY_LINES.skip, 'no-op', {
        zh: `重叠（${s} < ${prevLast}）：与已选活动冲突，跳过 [${fmt(s, e)}]（红色）。`,
        en: `Overlap (${s} < ${prevLast}): conflicts with the selected activity, skip [${fmt(s, e)}] (red).`,
      }, sortedSnapshot());
    }
  }

  // 5. 结束
  push(ACTIVITY_LINES.end, 'finalize', {
    zh: `结束：共选中 ${count} 个活动 [${selected.join(', ')}]。按结束时间排序的贪心对活动选择问题是最优的（可用交换论证证明）。`,
    en: `Done: ${count} activities selected [${selected.join(', ')}]. The finish-time-first greedy is optimal for activity selection (proved by an exchange argument).`,
  }, sortedSnapshot(), [selected.join(', ')]);

  return {
    steps,
    summary: {
      result: selected.join(', '),
      resultValue: count,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
