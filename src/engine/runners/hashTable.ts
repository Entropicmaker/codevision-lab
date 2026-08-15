import type {
  AlgorithmRunner,
  AlgorithmStep,
  DisplayItem,
  ElementState,
  HashTableSnapshot,
  OpStats,
  OperationType,
  ParsedInput,
  Primitive,
  RunnerResult,
} from '../types/step';
import { emptyStats, item } from '../types/step';

/** 哈希表（拉链法）逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const HASH_TABLE_LINES = {
  func: 'func',
  init: 'init',
  insert: 'insert',
  hash: 'hash',
  check: 'check',
  chain: 'chain',
  found: 'found',
  end: 'end',
} as const;

/** 哈希表输入：array 为待插入的键序列，aux 为桶数量 m */
export interface HashTableInput {
  array: number[];
  aux: number;
}

/**
 * 哈希表（拉链法）执行器：纯函数、确定性。
 * 哈希函数 h(k) = k % m；冲突（不同键落到同一桶）通过把新键挂到桶尾的链上解决。
 * 依次插入全部键，再查找数组最后一个键，展示"计算哈希 → 沿链比较 → 命中"的完整过程。
 * 每一步都是完整状态快照，buckets 与 hashNotes 均深拷贝，保证步骤之间互不影响。
 */
export const runHashTable: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { array, aux } = input.value as HashTableInput;
  const keys = array.slice();
  const n = keys.length;
  // 桶数量 m：输入约定 m >= 3；此处仅作防御，避免除零
  const m = Number.isSafeInteger(aux) && aux > 0 ? aux : 1;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每个桶是一条冲突链（items 顺序 = 插入顺序）
  const buckets: DisplayItem[][] = Array.from({ length: m }, () => []);
  const hashNotes: Record<string, string> = {};
  let activeBucket: number | undefined;
  let key: number | null = null;
  let h = 0;
  let target: number | null = null;
  let found: boolean | null = null;

  const hashOf = (k: number): number => ((k % m) + m) % m;

  const markAll = (state: ElementState): void => {
    for (const bucket of buckets) {
      for (const el of bucket) el.state = state;
    }
  };

  const structure = (): HashTableSnapshot => ({
    kind: 'hash-table',
    id: 'ht',
    size: m,
    buckets: buckets.map((b, i) => ({ index: i, items: b.map((el) => ({ ...el })) })),
    hashNotes: { ...hashNotes },
    activeBucket,
  });

  const variables = (): Record<string, Primitive> => ({
    m,
    key,
    h,
    chainLength: h >= 0 && h < m ? buckets[h]!.length : 0,
    target,
    found,
    loadFactor: Math.round((n / m) * 100) / 100,
  });

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: { zh: string; en: string },
    output: string[] = [],
  ): void => {
    steps.push({
      stepId: steps.length,
      codeLineId,
      operation,
      containers: {},
      structures: [structure()],
      variables: variables(),
      pointers: [],
      callStack: [],
      output,
      explanation,
      stats: { ...stats },
    });
  };

  // 1. 入口：说明哈希函数与冲突解决策略
  push(HASH_TABLE_LINES.func, 'init', {
    zh:
      n === 0
        ? `开始哈希表（拉链法）演示：输入为空，只有 ${m} 个空桶。哈希函数 h(k) = k % m。`
        : `开始哈希表（拉链法）演示：将 ${n} 个键插入 ${m} 个桶。哈希函数 h(k) = k % m；不同键可能落到同一桶（冲突），用拉链法解决。`,
    en:
      n === 0
        ? `Start the hash table (chaining) demo: the input is empty, leaving ${m} empty buckets. Hash function h(k) = k % m.`
        : `Start the hash table (chaining) demo: insert ${n} keys into ${m} buckets. Hash function h(k) = k % m; distinct keys may collide into one bucket, resolved by chaining.`,
  });

  // 2. 初始化：创建 m 个空桶
  push(HASH_TABLE_LINES.init, 'init', {
    zh: `创建 ${m} 个空桶（下标 0..${m - 1}）。每个桶是一条链（列表），冲突元素按插入顺序挂到链尾。`,
    en: `Create ${m} empty buckets (indices 0..${m - 1}). Each bucket is a chain (list); colliding elements are appended to its tail in insertion order.`,
  });

  // 3. 逐个插入键
  for (let i = 0; i < n; i += 1) {
    const k = keys[i] as number;
    key = k;
    markAll('done'); // 清除上一个键遗留的 active / comparing / invalid

    // 进入插入
    push(HASH_TABLE_LINES.insert, 'no-op', {
      zh: `插入第 ${i + 1} 个键 ${k}。`,
      en: `Insert key #${i + 1}: ${k}.`,
    });

    // 计算哈希
    h = hashOf(k);
    activeBucket = h;
    hashNotes[`k:${k}`] = `${k} % ${m} = ${h}`;
    push(HASH_TABLE_LINES.hash, 'assign', {
      zh: `计算哈希：h = ${k} % ${m} = ${h}，键 ${k} 应放入桶 [${h}]。`,
      en: `Compute the hash: h = ${k} % ${m} = ${h}; key ${k} belongs to bucket [${h}].`,
    });

    // 检查桶内冲突链：是否已存在 / 找到链尾
    const chain = buckets[h] as DisplayItem[];
    let exists = false;
    let matchEl: DisplayItem | null = null;
    for (let p = 0; p < chain.length; p += 1) {
      markAll('done');
      const el = chain[p] as DisplayItem;
      el.state = 'comparing';
      stats.comparisons += 1;
      stats.accesses += 2;
      const x = el.value as number;
      push(HASH_TABLE_LINES.check, 'compare', {
        zh: `检查桶 [${h}] 链上的元素 ${x}：${x} == ${k}？${x === k ? '是，已存在。' : '否，继续向后找链尾。'}`,
        en: `Check chain element ${x} in bucket [${h}]: ${x} == ${k}? ${x === k ? 'Yes, already present.' : 'No, keep moving toward the tail.'}`,
      });
      if (x === k) {
        exists = true;
        matchEl = el;
        break;
      }
    }

    if (exists) {
      // 重复键：不插入
      markAll('done');
      if (matchEl) matchEl.state = 'invalid';
      push(HASH_TABLE_LINES.chain, 'no-op', {
        zh: `${k} 已存在于桶 [${h}] 的链中，跳过重复插入。`,
        en: `${k} already exists in bucket [${h}]'s chain, skip the duplicate insertion.`,
      });
      activeBucket = undefined;
      key = null;
      continue;
    }

    // 放入：无冲突直接进桶 / 有冲突挂链尾
    markAll('done');
    stats.writes += 1;
    const wasEmpty = chain.length === 0;
    chain.push(item(`k:${k}`, k, 'active'));
    push(HASH_TABLE_LINES.chain, 'assign', {
      zh: wasEmpty
        ? `桶 [${h}] 原本为空，键 ${k} 直接进入该桶。`
        : `桶 [${h}] 已有 ${chain.length - 1} 个元素（发生冲突），键 ${k} 挂到链尾，冲突解决。`,
      en: wasEmpty
        ? `Bucket [${h}] was empty; key ${k} goes straight in.`
        : `Bucket [${h}] already holds ${chain.length - 1} element(s) (collision); key ${k} is appended to the tail, resolving the collision.`,
    });
    activeBucket = undefined;
    key = null;
  }

  // 4. 查找阶段：查找数组最后一个键
  if (n > 0) {
    target = keys[n - 1] as number;
    key = target;
    found = false;
    markAll('done');
    h = hashOf(target);
    activeBucket = h;
    push(HASH_TABLE_LINES.hash, 'assign', {
      zh: `查找阶段：在哈希表中查找 ${target}。计算哈希 h = ${target} % ${m} = ${h}，去桶 [${h}] 的链中找。`,
      en: `Search phase: look up ${target}. Compute h = ${target} % ${m} = ${h}, then walk the chain in bucket [${h}].`,
    });

    const chain = buckets[h] as DisplayItem[];
    for (let p = 0; p < chain.length; p += 1) {
      markAll('done');
      const el = chain[p] as DisplayItem;
      el.state = 'comparing';
      stats.comparisons += 1;
      stats.accesses += 2;
      const x = el.value as number;
      push(HASH_TABLE_LINES.check, 'compare', {
        zh: `沿桶 [${h}] 链比较：${x} == ${target}？${x === target ? '是，命中！' : '否，继续比较下一个。'}`,
        en: `Compare along bucket [${h}]'s chain: ${x} == ${target}? ${x === target ? 'Yes, hit!' : 'No, compare the next one.'}`,
      });
      if (x === target) {
        found = true;
        markAll('done');
        el.state = 'done';
        activeBucket = h;
        push(HASH_TABLE_LINES.found, 'found', {
          zh: `命中！在桶 [${h}] 的链中第 ${p + 1} 个位置找到 ${target}。`,
          en: `Hit! Found ${target} at position ${p + 1} in bucket [${h}]'s chain.`,
        }, [`found key ${target} in bucket ${h}`]);
        break;
      }
    }
    activeBucket = undefined;
    key = null;
  }

  // 5. 结束：汇总桶数、负载因子与平均复杂度
  markAll('done');
  const maxChain = buckets.reduce((acc, b) => Math.max(acc, b.length), 0);
  const load = m > 0 ? n / m : 0;
  push(HASH_TABLE_LINES.end, 'finalize', {
    zh:
      n === 0
        ? `结束：哈希表为空（0 个键，${m} 个桶）。`
        : `结束：${n} 个键已分布到 ${m} 个桶，负载因子 = ${n}/${m} = ${load.toFixed(2)}，最长冲突链长度 ${maxChain}。平均情况下插入与查找均为 O(1)。`,
    en:
      n === 0
        ? `Done: the hash table is empty (0 keys, ${m} buckets).`
        : `Done: ${n} keys distributed into ${m} buckets; load factor = ${n}/${m} = ${load.toFixed(2)}, longest chain length ${maxChain}. Insertion and lookup are O(1) on average.`,
  }, [
    `buckets: ${m}`,
    `load factor: ${n}/${m} = ${load.toFixed(2)}`,
    ...(n > 0 && target !== null ? [`found key ${target} in bucket ${hashOf(target)}`] : []),
  ]);

  return {
    steps,
    summary: {
      result:
        n === 0
          ? `0 keys in ${m} buckets`
          : `${n} keys in ${m} buckets; found ${target as number} in bucket ${h}`,
      resultValue: n === 0 ? null : target,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
