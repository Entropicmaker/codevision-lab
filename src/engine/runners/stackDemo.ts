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

/** 栈演示逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const STACK_LINES = {
  func: 'func',
  init: 'init',
  pushLoop: 'push-loop',
  push: 'push',
  popLoop: 'pop-loop',
  pop: 'pop',
  end: 'end',
} as const;

/** 栈的固定容量（与 meta.inputSpec.maxLen 一致） */
const CAPACITY = 8;

/**
 * 栈（push/pop）演示执行器：纯函数、确定性。
 * 依次将输入元素压入栈顶（LIFO），全部入栈后再依次弹出，
 * 每一步都是完整状态快照，直观展示"后进先出"的访问顺序。
 */
export const runStackDemo: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const values = (input.value as number[]).slice();
  const n = values.length;
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 可变工作副本：每步 push 时深拷贝进快照，保证步骤之间互不影响
  const stackItems: DisplayItem[] = [];
  let top = -1;
  let size = 0;
  const output: string[] = [];

  const structure = (): LinearStructureSnapshot => ({
    kind: 'stack',
    id: 'stack',
    capacity: CAPACITY,
    items: stackItems.map((el) => ({ ...el })),
  });

  const variables = (): Record<string, Primitive> => ({
    top,
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

  // 初始状态：空栈
  push(STACK_LINES.init, 'init', {
    zh:
      n === 0
        ? '栈为空。栈是后进先出（LIFO）结构：最后入栈的元素最先出栈。'
        : `开始栈演示：依次将 ${n} 个元素压入栈。栈是后进先出（LIFO）结构，只允许在栈顶进行 push / pop。`,
    en:
      n === 0
        ? 'The stack is empty. A stack is LIFO: the last element pushed is the first one popped.'
        : `Start the stack demo: push ${n} elements one by one. A stack is LIFO — push / pop happen only at the top.`,
  });

  // 依次入栈
  for (let i = 0; i < n; i += 1) {
    const v = values[i] as number;
    push(STACK_LINES.pushLoop, 'no-op', {
      zh: `第 ${i + 1} 个元素 ${v} 待处理：进入入栈循环。`,
      en: `Element ${v} (#${i + 1}) is next: enter the push loop.`,
    });

    // push：写入栈顶
    stats.accesses += 1;
    stats.writes += 1;
    if (stackItems.length > 0) {
      (stackItems[stackItems.length - 1] as DisplayItem).state = 'idle';
    }
    stackItems.push(item(`stack:${i}`, v, 'active'));
    top = i;
    size = i + 1;
    push(STACK_LINES.push, 'push', {
      zh: `将 ${v} 压入栈顶，成为新的栈顶。top = ${top}，size = ${size}。`,
      en: `Push ${v} onto the top; it becomes the new top. top = ${top}, size = ${size}.`,
    });
  }

  // 依次出栈（LIFO：后进先出）
  for (let i = 0; i < n; i += 1) {
    const topValue = (stackItems[stackItems.length - 1] as DisplayItem).value;
    (stackItems[stackItems.length - 1] as DisplayItem).state = 'active';
    push(STACK_LINES.popLoop, 'no-op', {
      zh: `栈非空，进入出栈循环：当前栈顶为 ${String(topValue)}。`,
      en: `Stack is not empty, enter the pop loop: current top is ${String(topValue)}.`,
    });

    // pop：读取栈顶并移除
    stats.accesses += 1;
    stats.writes += 1;
    const popped = stackItems.pop() as DisplayItem;
    output.push(String(popped.value));
    top -= 1;
    size -= 1;
    if (stackItems.length > 0) {
      (stackItems[stackItems.length - 1] as DisplayItem).state = 'active';
    }
    push(STACK_LINES.pop, 'pop', {
      zh: `弹出栈顶元素 ${String(popped.value)}。top = ${top}，size = ${size}。`,
      en: `Pop the top element ${String(popped.value)}. top = ${top}, size = ${size}.`,
    });
  }

  // 结束：栈空，output 为完整弹出序列
  push(STACK_LINES.end, 'finalize', {
    zh:
      n === 0
        ? '栈为空，演示结束：没有元素可弹出。'
        : `出栈完成！弹出序列为 [${output.join(', ')}]。验证 LIFO：最后入栈的 ${String(values[n - 1])} 最先出栈。`,
    en:
      n === 0
        ? 'The stack is empty, demo finished: nothing to pop.'
        : `All popped! Pop sequence: [${output.join(', ')}]. LIFO verified: ${String(values[n - 1])} (pushed last) was popped first.`,
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
