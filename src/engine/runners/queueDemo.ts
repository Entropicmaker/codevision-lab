import type {
  AlgorithmRunner,
  AlgorithmStep,
  DisplayItem,
  LinearStructureSnapshot,
  OpStats,
  OperationType,
  ParsedInput,
  Primitive,
  RunnerResult,
} from '../types/step';
import { emptyStats, item } from '../types/step';

/** 队列演示逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const QUEUE_LINES = {
  func: 'func',
  init: 'init',
  enqueueLoop: 'enqueue-loop',
  enqueue: 'enqueue',
  dequeueLoop: 'dequeue-loop',
  dequeue: 'dequeue',
  end: 'end',
} as const;

/** 队列的固定容量（与 meta.inputSpec.maxLen 一致），展示循环队列形态 */
const CAPACITY = 8;

/**
 * 队列（enqueue/dequeue）演示执行器：纯函数、确定性。
 * 依次将输入元素从队尾入队（FIFO），全部入队后再从队首依次出队，
 * 每一步都是完整状态快照，直观展示"先进先出"的访问顺序。
 */
export const runQueueDemo: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const values = (input.value as number[]).slice();
  const n = values.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每步 push 时深拷贝进快照，保证步骤之间互不影响
  const queueItems: DisplayItem[] = [];
  let front = 0;
  let rear = -1;
  let size = 0;
  const output: string[] = [];

  const structure = (): LinearStructureSnapshot => ({
    kind: 'queue',
    id: 'queue',
    capacity: CAPACITY,
    items: queueItems.map((el) => ({ ...el })),
  });

  const variables = (): Record<string, Primitive> => ({
    front,
    rear,
    size,
    capacity: CAPACITY,
  });

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: { zh: string; en: string },
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
      output: output.slice(),
      explanation,
      stats: { ...stats },
    });
  };

  // 初始状态：空队列
  push(QUEUE_LINES.init, 'init', {
    zh:
      n === 0
        ? '队列为空。队列是先进先出（FIFO）结构：最先入队的元素最先出队。'
        : `开始队列演示：依次将 ${n} 个元素从队尾入队。队列是先进先出（FIFO）结构，容量固定为 ${CAPACITY}。`,
    en:
      n === 0
        ? 'The queue is empty. A queue is FIFO: the first element enqueued is the first one dequeued.'
        : `Start the queue demo: enqueue ${n} elements at the rear. A queue is FIFO, with a fixed capacity of ${CAPACITY}.`,
  });

  // 依次入队
  for (let i = 0; i < n; i += 1) {
    const v = values[i] as number;
    push(QUEUE_LINES.enqueueLoop, 'no-op', {
      zh: `第 ${i + 1} 个元素 ${v} 待处理：进入入队循环。`,
      en: `Element ${v} (#${i + 1}) is next: enter the enqueue loop.`,
    });

    // enqueue：写入队尾，rear 循环前进
    stats.accesses += 1;
    stats.writes += 1;
    rear = (rear + 1) % CAPACITY;
    if (queueItems.length > 0) {
      (queueItems[queueItems.length - 1] as DisplayItem).state = 'idle';
    }
    queueItems.push(item(`queue:${i}`, v, 'active'));
    size = i + 1;
    push(QUEUE_LINES.enqueue, 'enqueue', {
      zh: `将 ${v} 入队到队尾。front = ${front}，rear = ${rear}，size = ${size}。`,
      en: `Enqueue ${v} at the rear. front = ${front}, rear = ${rear}, size = ${size}.`,
    });
  }

  // 依次出队（FIFO：先进先出）
  for (let i = 0; i < n; i += 1) {
    const frontValue = (queueItems[0] as DisplayItem).value;
    (queueItems[0] as DisplayItem).state = 'active';
    push(QUEUE_LINES.dequeueLoop, 'no-op', {
      zh: `队列非空，进入出队循环：队首为 ${String(frontValue)}。`,
      en: `Queue is not empty, enter the dequeue loop: front is ${String(frontValue)}.`,
    });

    // dequeue：读取队首并移除，front 循环前进
    stats.accesses += 1;
    stats.writes += 1;
    const dequeued = queueItems.shift() as DisplayItem;
    output.push(String(dequeued.value));
    front = (front + 1) % CAPACITY;
    size -= 1;
    if (queueItems.length > 0) {
      (queueItems[0] as DisplayItem).state = 'active';
    }
    push(QUEUE_LINES.dequeue, 'dequeue', {
      zh: `队首元素 ${String(dequeued.value)} 出队。front = ${front}，rear = ${rear}，size = ${size}。`,
      en: `Dequeue the front element ${String(dequeued.value)}. front = ${front}, rear = ${rear}, size = ${size}.`,
    });
  }

  // 结束：队列空，output 为完整出队序列
  push(QUEUE_LINES.end, 'finalize', {
    zh:
      n === 0
        ? '队列为空，演示结束：没有元素可出队。'
        : `出队完成！出队序列为 [${output.join(', ')}]。验证 FIFO：最先入队的 ${String(values[0])} 最先出队。此时 size = ${size}，front = ${front}、rear = ${rear}，可见判断队列空/满应依据 size 而不是 front == rear。`,
    en:
      n === 0
        ? 'The queue is empty, demo finished: nothing to dequeue.'
        : `All dequeued! Dequeue sequence: [${output.join(', ')}]. FIFO verified: ${String(values[0])} (enqueued first) was dequeued first. With size = ${size} (front = ${front}, rear = ${rear}) the queue is empty — check emptiness/fullness with size, not front == rear.`,
  });

  return {
    steps,
    summary: {
      result: output.join(', '),
      resultValue: output.join(', '),
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
