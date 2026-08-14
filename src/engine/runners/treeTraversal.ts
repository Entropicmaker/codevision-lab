import type {
  AlgorithmRunner,
  AlgorithmStep,
  CallFrame,
  DisplayItem,
  OpStats,
  OperationType,
  ParsedInput,
  Primitive,
  RunnerResult,
  TreeEdge,
} from '../types/step';
import { emptyStats, item } from '../types/step';

/** 二叉树遍历逻辑代码行 id（与三种语言源码 / 伪代码中的标记一致） */
export const TREE_TRAVERSAL_LINES = {
  func: 'func',
  init: 'init',
  visit: 'visit',
  left: 'left',
  right: 'right',
  end: 'end',
} as const;

/** 树遍历输入：层序数组（null = 空节点）+ 遍历方式 aux（1=前序 2=中序 3=后序） */
export interface TreeTraversalInput {
  array: (number | null)[];
  aux?: number;
}

type Order = 'preorder' | 'inorder' | 'postorder';
type StageName = 'visit' | 'left' | 'right';

const ORDER_ZH: Record<Order, string> = {
  preorder: '前序',
  inorder: '中序',
  postorder: '后序',
};

/** 每种遍历的帧内阶段顺序（标准递归实现中 visit 的位置不同） */
const STAGE_SEQ: Record<Order, StageName[]> = {
  preorder: ['visit', 'left', 'right'],
  inorder: ['left', 'visit', 'right'],
  postorder: ['left', 'right', 'visit'],
};

/** 显式栈中的模拟帧（内部状态，不直接暴露） */
interface SimFrame {
  nodeIndex: number;
  depth: number;
  /** 0..2 → STAGE_SEQ 下标；3 = 本帧全部完成 */
  stage: number;
}

const parentIndexOf = (i: number): number => (i > 0 ? Math.floor((i - 1) / 2) : -1);

/**
 * 二叉树遍历执行器（前序 / 中序 / 后序）。
 * 用显式栈模拟递归：每帧记录 节点 / 深度 / 阶段，callStack 面板实时展示帧；
 * 递归入口（根调用）与子递归（左 / 右）都产生 push 帧步骤，帧完成时产生 pop 步骤。
 * 纯函数、确定性；每一步为完整快照（nodes / edges 深拷贝）。
 */
export const runTreeTraversal: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const raw = input.value;
  const array: (number | null)[] = Array.isArray(raw)
    ? (raw as (number | null)[])
    : ((raw as TreeTraversalInput | null)?.array ?? []);
  const aux = Array.isArray(raw) ? undefined : (raw as TreeTraversalInput | null)?.aux;
  const order: Order = aux === 2 ? 'inorder' : aux === 3 ? 'postorder' : 'preorder';
  const n = array.length;

  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  const nodeExists = (i: number): boolean => i < n && array[i] !== null;

  /** 可变工作副本：每步 push 时深拷贝进快照 */
  const baseNodes: DisplayItem[] = [];
  for (let i = 0; i < n; i += 1) {
    if (nodeExists(i)) baseNodes.push(item(`n:${i}`, array[i]!, 'idle'));
  }
  const baseEdges: TreeEdge[] = [];
  for (let i = 0; i < n; i += 1) {
    if (!nodeExists(i)) continue;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (nodeExists(l)) baseEdges.push({ from: `n:${i}`, to: `n:${l}`, state: 'idle' });
    if (nodeExists(r)) baseEdges.push({ from: `n:${i}`, to: `n:${r}`, state: 'idle' });
  }

  const nodeById = (id: string): DisplayItem | undefined => baseNodes.find((x) => x.id === id);
  const edgeBy = (from: number, to: number): TreeEdge | undefined =>
    baseEdges.find((e) => e.from === `n:${from}` && e.to === `n:${to}`);

  const frames: SimFrame[] = [];
  const visited: boolean[] = new Array(n).fill(false);
  let output: string[] = [];

  const callStackSnapshot = (): CallFrame[] => {
    const seq = STAGE_SEQ[order];
    return frames.map((f) => ({
      id: `f:n:${f.nodeIndex}`,
      function: order,
      args: { node: `n:${f.nodeIndex}` },
      locals: { next: f.stage < 3 ? seq[f.stage]! : 'return' },
      depth: f.depth,
    }));
  };

  const variables = (): Record<string, Primitive> => ({
    order,
    'output size': output.length,
    stackDepth: frames.length,
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
      structures: [
        {
          kind: 'tree',
          id: 'tree',
          nodes: baseNodes.map((el) => ({ ...el })),
          edges: baseEdges.map((el) => ({ ...el })),
          rootId: baseNodes.length > 0 ? 'n:0' : null,
        },
      ],
      variables: variables(),
      pointers: [],
      callStack: callStackSnapshot(),
      output: output.slice(),
      explanation,
      stats: { ...stats },
    });
  };

  // 0. 构建树结构快照（全部 idle）
  push(TREE_TRAVERSAL_LINES.init, 'init', {
    zh: `构建二叉树结构快照（${baseNodes.length} 个节点，${baseEdges.length} 条边，均为未访问状态）。准备以${ORDER_ZH[order]}遍历（根 → 左 → 右 的顺序因遍历方式而异）。`,
    en: `Build the binary tree snapshot (${baseNodes.length} nodes, ${baseEdges.length} edges, all idle). About to traverse in ${order} order.`,
  });

  if (n === 0 || !nodeExists(0)) {
    push(TREE_TRAVERSAL_LINES.end, 'finalize', {
      zh: '树为空：没有节点可供遍历。',
      en: 'The tree is empty: no nodes to traverse.',
    });
    return {
      steps,
      summary: { result: 'empty', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 1. 根帧入栈（递归入口）
  frames.push({ nodeIndex: 0, depth: 1, stage: 0 });
  nodeById('n:0')!.state = 'active';
  push(TREE_TRAVERSAL_LINES.func, 'push', {
    zh: `调用 ${order}(${array[0]})：根帧入栈（深度 1），当前节点为根节点 ${array[0]}。`,
    en: `Call ${order}(${array[0]}): push the root frame (depth 1); the current node is root ${array[0]}.`,
  });

  // 2. 显式栈模拟递归
  const seq = STAGE_SEQ[order];
  while (frames.length > 0) {
    const top = frames[frames.length - 1]!;
    const stageName: StageName | 'done' = top.stage < 3 ? seq[top.stage]! : 'done';

    if (stageName === 'visit') {
      // 访问当前节点：标记 done，追加输出
      top.stage += 1;
      const value = array[top.nodeIndex]!;
      nodeById(`n:${top.nodeIndex}`)!.state = 'done';
      visited[top.nodeIndex] = true;
      stats.accesses += 1;
      output = output.concat([String(value)]);
      push(TREE_TRAVERSAL_LINES.visit, 'visit', {
        zh: `访问节点 ${value}（${ORDER_ZH[order]}顺序）：标记为已访问（done），并将 ${value} 追加到输出序列（当前长度 ${output.length}）。`,
        en: `Visit node ${value} (${order} order): mark it visited (done) and append ${value} to the output sequence (length ${output.length}).`,
      });
    } else if (stageName === 'left' || stageName === 'right') {
      // 处理左 / 右子树：子节点非空则推入子帧
      top.stage += 1;
      const childIdx = stageName === 'left' ? top.nodeIndex * 2 + 1 : top.nodeIndex * 2 + 2;
      if (nodeExists(childIdx)) {
        frames.push({ nodeIndex: childIdx, depth: top.depth + 1, stage: 0 });
        nodeById(`n:${childIdx}`)!.state = 'active';
        const parent = nodeById(`n:${top.nodeIndex}`);
        if (parent) parent.state = visited[top.nodeIndex] ? 'done' : 'idle';
        const edge = edgeBy(top.nodeIndex, childIdx);
        if (edge) edge.state = 'active';
        const childValue = array[childIdx];
        push(
          stageName === 'left' ? TREE_TRAVERSAL_LINES.left : TREE_TRAVERSAL_LINES.right,
          'push',
          {
            zh: `递归调用 ${order}(${childValue})：${stageName === 'left' ? '左' : '右'}子树帧入栈（深度 ${top.depth + 1}），子节点 ${childValue} 成为当前节点，父子边标记为进行中（active）。`,
            en: `Recurse ${order}(${childValue}): push the ${stageName === 'left' ? 'left' : 'right'} child frame (depth ${top.depth + 1}); child ${childValue} becomes the current node; the parent edge is marked active.`,
          },
        );
      }
      // 子节点为空：真实递归会立即返回，不产生新帧（也无需步骤）
    } else {
      // 本帧完成：弹出，返回调用者
      frames.pop();
      const parentIdx = parentIndexOf(top.nodeIndex);
      if (parentIdx >= 0 && nodeExists(parentIdx)) {
        const edge = edgeBy(parentIdx, top.nodeIndex);
        if (edge) edge.state = 'done';
        const parent = nodeById(`n:${parentIdx}`);
        if (parent) parent.state = 'active';
      }
      const nodeValue = array[top.nodeIndex];
      push(TREE_TRAVERSAL_LINES.end, 'return', {
        zh: `${order}(${nodeValue}) 执行完毕：弹出该帧，控制权返回调用者${
          parentIdx >= 0 && nodeExists(parentIdx) ? `（节点 ${array[parentIdx]}）` : '（主程序）'
        }。`,
        en: `${order}(${nodeValue}) finished: pop its frame; control returns to the caller${
          parentIdx >= 0 && nodeExists(parentIdx) ? ` (node ${array[parentIdx]})` : ' (main)'
        }.`,
      });
    }
  }

  // 3. 结束：全部节点 / 边标记完成
  for (const node of baseNodes) node.state = 'done';
  for (const edge of baseEdges) edge.state = 'done';
  push(TREE_TRAVERSAL_LINES.end, 'finalize', {
    zh: `${ORDER_ZH[order]}遍历完成：访问序列为 ${output.join(', ')}，全部节点与遍历路径边标记为完成（done）。`,
    en: `${order} traversal complete: visit sequence is ${output.join(', ')}; all nodes and traversed edges are marked done.`,
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
