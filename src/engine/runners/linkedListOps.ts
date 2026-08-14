import type {
  AlgorithmRunner,
  AlgorithmStep,
  DisplayItem,
  OpStats,
  OperationType,
  ParsedInput,
  PointerState,
  Primitive,
  RunnerResult,
} from '../types/step';
import { emptyStats, item } from '../types/step';

/** 链表基础操作逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const LINKED_LIST_LINES = {
  func: 'func',
  init: 'init',
  buildLoop: 'build-loop',
  build: 'build',
  traverseLoop: 'traverse-loop',
  visit: 'visit',
  insert: 'insert',
  delete: 'delete',
  end: 'end',
} as const;

/** 链表输入：节点值数组 + 可选插入位置（1..n；缺省 / 0 则只做构建 + 遍历） */
export interface LinkedListOpsInput {
  array: number[];
  aux?: number;
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));

const isDetached = (el: DisplayItem): boolean => el.label === 'detached';

/**
 * 链表基础操作执行器：构建 → 遍历 → 插入 → 删除。
 * - 按数组值用尾插法构建链表；
 * - 从头遍历并输出访问序列；
 * - 若提供 aux（插入位置 1..n），在指定位置插入新节点（值固定为 99）；
 * - 随后删除头节点之后的第 1 个节点（链表中第 2 个节点），目标节点移入游离区（label='detached'）。
 * 纯函数、确定性；每一步为完整快照（items 深拷贝）。
 */
export const runLinkedListOps: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const raw = input.value;
  const array: number[] = Array.isArray(raw)
    ? (raw as number[])
    : ((raw as LinkedListOpsInput | null)?.array ?? []);
  const aux = Array.isArray(raw) ? undefined : (raw as LinkedListOpsInput | null)?.aux;
  const n = array.length;

  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  /** 链序 items：链表节点按链序排列；游离节点（label='detached'）排在末尾 */
  const items: DisplayItem[] = [];
  let length = 0;
  let current: string | null = null;
  let newNode: number | null = null;
  let output: string[] = [];

  const chained = (): DisplayItem[] => items.filter((el) => !isDetached(el));

  const pointers = (): PointerState[] => {
    const list: PointerState[] = [];
    const chain = chained();
    if (chain.length > 0) {
      list.push({ id: 'p-head', name: 'head', target: chain[0]!.id });
    }
    if (current !== null && chain.some((el) => el.id === current)) {
      list.push({ id: 'p-cur', name: 'current', target: current });
    }
    return list;
  };

  const variables = (): Record<string, Primitive> => ({ length, current, newNode });

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: { zh: string; en: string },
    nextOutput?: string[],
  ): void => {
    if (nextOutput) output = nextOutput;
    steps.push({
      stepId: steps.length,
      codeLineId,
      operation,
      containers: {},
      structures: [
        {
          kind: 'linked-list',
          id: 'list',
          items: items.map((el) => ({ ...el })),
          linked: true,
        },
      ],
      variables: variables(),
      pointers: pointers(),
      callStack: [],
      output: output.slice(),
      explanation,
      stats: { ...stats },
    });
  };

  // 0. 进入函数
  push(
    LINKED_LIST_LINES.func,
    'init',
    {
      zh: `进入 linkedListOps 函数：演示链表基础操作（构建 → 遍历 → 插入 → 删除）。输入节点值：${
        n > 0 ? array.join(', ') : '（空）'
      }。`,
      en: `Enter linkedListOps: demo of basic linked-list operations (build → traverse → insert → delete). Node values: ${
        n > 0 ? array.join(', ') : '(empty)'
      }.`,
    },
    [],
  );

  // 1. 初始化空链表
  push(LINKED_LIST_LINES.init, 'init', {
    zh: '初始化空链表：head = null，tail = null，length = 0。',
    en: 'Initialize an empty list: head = null, tail = null, length = 0.',
  });

  if (n === 0) {
    push(
      LINKED_LIST_LINES.end,
      'finalize',
      {
        zh: '链表为空：没有节点可供构建与遍历，插入 / 删除一并跳过。',
        en: 'The list is empty: no nodes to build or traverse; insert/delete are skipped.',
      },
      [],
    );
    return {
      steps,
      summary: { result: 'empty', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 2. 逐节点构建（尾插法）
  for (let i = 0; i < n; i += 1) {
    if (i > 0) items[i - 1]!.state = 'idle'; // 前驱恢复 idle
    items.push(item(`node:${i}`, array[i]!, 'active'));
    length = i + 1;
    current = `node:${i}`;
    stats.writes += 1;
    push(
      i === 0 ? LINKED_LIST_LINES.buildLoop : LINKED_LIST_LINES.build,
      'assign',
      i === 0
        ? {
            zh: `进入构建循环：创建第一个节点 ${array[i]} 作为头节点 head（length = 1）。`,
            en: `Enter the build loop: create the first node ${array[i]} as head (length = 1).`,
          }
        : {
            zh: `创建节点 ${array[i]}：将尾节点（值 ${array[i - 1]}）的 next 指针指向它并更新 tail（length = ${i + 1}）。`,
            en: `Create node ${array[i]}: point the tail's (value ${array[i - 1]}) next pointer to it and update tail (length = ${i + 1}).`,
          },
    );
  }
  current = null;

  // 3. 从头遍历
  current = 'node:0';
  push(LINKED_LIST_LINES.traverseLoop, 'no-op', {
    zh: '开始从头遍历：current = head（第 1 个节点）。',
    en: 'Start traversing from the head: current = head (the 1st node).',
  });

  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < i; j += 1) items[j]!.state = 'done'; // 已访问节点
    items[i]!.state = 'active';
    current = `node:${i}`;
    stats.accesses += 1;
    const visited = array.slice(0, i + 1).map(String);
    push(
      LINKED_LIST_LINES.visit,
      'visit',
      {
        zh: `访问第 ${i + 1} 个节点：值 ${array[i]}，加入访问序列。`,
        en: `Visit the ${i + 1}-th node: value ${array[i]}, appended to the visit sequence.`,
      },
      visited,
    );
  }
  for (let j = 0; j < n; j += 1) items[j]!.state = 'done';
  current = null;
  push(
    LINKED_LIST_LINES.traverseLoop,
    'no-op',
    {
      zh: `遍历完成：访问序列为 ${array.join(', ')}，所有节点标记为已访问（done）。`,
      en: `Traversal complete: visit sequence is ${array.join(', ')}; all nodes are marked visited (done).`,
    },
    array.map(String),
  );

  // 4. 插入（aux = 插入位置 1..n；插入值固定为 99）
  const doInsert = aux !== undefined && aux > 0;
  if (doInsert) {
    const pos = clamp(aux as number, 1, n);
    newNode = 99;
    const newItem = item('node:new', 99, 'active', 'new');
    items.splice(pos - 1, 0, newItem);
    length += 1;
    current = 'node:new';
    stats.writes += 1;
    push(
      LINKED_LIST_LINES.insert,
      'assign',
      pos === 1
        ? {
            zh: `插入新节点（值固定为 99）到第 1 个位置：它成为新的头节点 head，其 next 指向原头节点 ${array[0]}。length = ${length}。`,
            en: `Insert a new node (value fixed at 99) at position 1: it becomes the new head; its next points to the old head ${array[0]}. length = ${length}.`,
          }
        : {
            zh: `插入新节点（值固定为 99）到第 ${pos} 个位置：前驱（${array[pos - 2] ?? '?'}）的 next 指向它，它的 next 指向原第 ${pos} 个节点（${array[pos - 1]}）。length = ${length}。`,
            en: `Insert a new node (value fixed at 99) at position ${pos}: the predecessor (${array[pos - 2] ?? '?'}) points to it, and it points to the old ${pos}-th node (${array[pos - 1]}). length = ${length}.`,
          },
    );
  }

  // 5. 删除头节点之后的第 1 个节点
  if (doInsert) {
    const chain = chained();
    const target = chain[1];
    if (target) {
      target.label = 'detached';
      target.state = 'invalid';
      const idx = items.findIndex((el) => el.id === target.id);
      if (idx >= 0) {
        items.splice(idx, 1);
        items.push(target);
      }
      length -= 1;
      current = null;
      stats.writes += 1;
      push(LINKED_LIST_LINES.delete, 'assign', {
        zh: `删除头节点之后的第 1 个节点（链表中第 2 个节点）：值 ${String(target.value)}。断开前驱 next 的指向，节点移出链序（detached 游离区）。length = ${length}。`,
        en: `Delete the 1st node after head (the 2nd node in the chain): value ${String(target.value)}. Unlink the predecessor's next; the node moves out of the chain (detached area). length = ${length}.`,
      });
    }
  }

  // 6. 结束
  for (const el of chained()) el.state = 'done';
  const finalChain = chained().map((el) => String(el.value));
  push(LINKED_LIST_LINES.end, 'finalize', {
    zh: `操作完成：最终链表为 [${finalChain.join(', ')}]${doInsert ? '，被删除的节点已游离。' : '（未执行插入 / 删除）。'}`,
    en: `Done: final list is [${finalChain.join(', ')}]${doInsert ? '; the deleted node is now detached.' : ' (insert/delete skipped).'}`,
  });

  return {
    steps,
    summary: {
      result: finalChain.join(', '),
      resultValue: finalChain.join(', '),
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
