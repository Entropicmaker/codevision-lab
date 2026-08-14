import type {
  AlgorithmRunner,
  AlgorithmStep,
  CallFrame,
  DisplayItem,
  ElementState,
  GraphEdge,
  LinearStructureSnapshot,
  LocalizedText,
  OpStats,
  OperationType,
  ParsedInput,
  Primitive,
  RunnerResult,
  StructureSnapshot,
} from '../types/step';
import { emptyStats, item } from '../types/step';
import type { EdgePair } from '../inputs/parsers';

/** 深度优先搜索逻辑代码行 id（与三语言源码 / 伪代码中的标记一致） */
export const DFS_LINES = {
  func: 'func',
  init: 'init',
  visit: 'visit',
  checkEdge: 'check-edge',
  recurse: 'recurse',
  backtrack: 'backtrack',
  end: 'end',
} as const;

/** 输入：{ array: 无向图边列表, aux: 起点编号 } */
export interface GraphTraversalInput {
  array: EdgePair[];
  aux: number;
}

/** 无向边规范化键：小号-大号 */
const edgeKey = (a: number, b: number): string => `${Math.min(a, b)}-${Math.max(a, b)}`;

/**
 * 深度优先搜索执行器（递归视角，显式栈 + 调用栈面板）。
 * 纯函数、确定性；每一步为完整快照，图 + 栈两个结构同步展示。
 */
export const runGraphDfs: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { array: edgePairs, aux: start } = input.value as GraphTraversalInput;
  const edgesRaw: EdgePair[] = Array.isArray(edgePairs) ? edgePairs : [];
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 构建无向邻接表（按边列表顺序）+ 图结构快照的基础数据
  const n = edgesRaw.reduce((max, [a, b]) => Math.max(max, a, b), -1) + 1;
  const adj: number[][] = Array.from({ length: n }, () => []);
  const baseNodes: DisplayItem[] = Array.from({ length: n }, (_, i) => item(`n:${i}`, i, 'idle'));
  const baseEdges: GraphEdge[] = [];
  const edgeByKey = new Map<string, GraphEdge>();
  for (const [a, b] of edgesRaw) {
    adj[a]!.push(b);
    adj[b]!.push(a);
    const edge: GraphEdge = { from: `n:${a}`, to: `n:${b}`, state: 'idle' };
    baseEdges.push(edge);
    edgeByKey.set(edgeKey(a, b), edge);
  }

  // 可变工作状态：每步 push 前统一深拷贝进快照，保证步骤之间互不影响
  const nodeStates: ElementState[] = new Array<ElementState>(n).fill('idle');
  const path: number[] = []; // 递归路径（可视化栈，栈底=起点）
  const frames: CallFrame[] = []; // 调用栈帧（递归面板）
  const iterIdx: number[] = []; // 每个路径节点在邻接表中的游标
  const visited = new Set<number>();
  const output: string[] = [];
  let current = -1;

  const variables = (): Record<string, Primitive> => ({
    current: current >= 0 ? current : null,
    visitedCount: visited.size,
    stackSize: path.length,
  });

  const graphStructure = (): StructureSnapshot => ({
    kind: 'graph',
    id: 'graph',
    nodes: baseNodes.map((nd, i) => ({ ...nd, state: nodeStates[i]! })),
    edges: baseEdges.map((e) => ({ ...e })),
  });

  const stackStructure = (): LinearStructureSnapshot => ({
    kind: 'stack',
    id: 'stack',
    items: path.map((nodeId, i) => ({
      id: `s:${i}`,
      value: nodeId,
      state: i === path.length - 1 ? 'active' : nodeStates[nodeId]!,
    })),
  });

  const push = (
    codeLineId: string | null,
    operation: OperationType,
    explanation: LocalizedText,
  ): void => {
    steps.push({
      stepId: steps.length,
      codeLineId,
      operation,
      containers: {},
      structures: [graphStructure(), stackStructure()],
      variables: variables(),
      pointers: [],
      callStack: frames.map((f) => ({ ...f, args: { ...f.args }, locals: { ...f.locals } })),
      output: output.slice(),
      explanation,
      stats: { ...stats },
    });
  };

  // 初始化：构建图结构 + 清空栈
  push(DFS_LINES.init, 'init', {
    zh: `初始化：无向图共 ${n} 个节点、${baseEdges.length} 条边，起点为 ${start}。显式栈为空。`,
    en: `Init: undirected graph with ${n} nodes and ${baseEdges.length} edges; start at ${start}. The explicit stack is empty.`,
  });

  // 输入校验：起点越界或图为空 → 显式错误步骤
  if (n === 0 || start < 0 || start >= n) {
    for (let i = 0; i < n; i += 1) nodeStates[i] = 'invalid';
    push(DFS_LINES.init, 'init', {
      zh: `起点 ${start} 不在节点范围 [0, ${Math.max(0, n - 1)}] 内，无法开始遍历。`,
      en: `Start ${start} is out of node range [0, ${Math.max(0, n - 1)}], cannot start traversal.`,
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 进入起点：调用 dfs(start)
  current = start;
  path.push(start);
  iterIdx.push(0);
  nodeStates[start] = 'active';
  frames.push({ id: `f:${start}`, function: 'dfs', args: { node: start }, locals: {}, depth: 1 });
  push(DFS_LINES.func, 'push', {
    zh: `调用 dfs(${start})：起点 ${start} 压入栈（进入递归），等待访问。`,
    en: `Call dfs(${start}): push the start node ${start} onto the stack (enter recursion), pending visit.`,
  });

  // 访问起点
  visited.add(start);
  nodeStates[start] = 'done';
  output.push(String(start));
  stats.writes += 1;
  push(DFS_LINES.visit, 'visit', {
    zh: `访问节点 ${start}：标记为已访问，记录到 DFS 序列。`,
    en: `Visit node ${start}: mark it visited and append to the DFS order.`,
  });

  // 主循环：模拟递归 dfs（显式栈）
  while (path.length > 0) {
    const u = path[path.length - 1];
    const i = iterIdx[iterIdx.length - 1];

    if (i >= adj[u].length) {
      // 邻接全部检查完 → 回溯：弹出帧与栈
      path.pop();
      iterIdx.pop();
      frames.pop();
      current = path.length > 0 ? path[path.length - 1] : -1;
      push(DFS_LINES.backtrack, 'backtrack', {
        zh:
          current >= 0
            ? `节点 ${u} 的邻接边全部检查完毕：dfs(${u}) 返回（回溯），弹出调用栈帧，回到节点 ${current}。`
            : `节点 ${u} 的邻接边全部检查完毕：dfs(${u}) 返回（回溯），弹出调用栈帧。`,
        en:
          current >= 0
            ? `All edges of ${u} are examined: dfs(${u}) returns (backtrack), pop the frame back to ${current}.`
            : `All edges of ${u} are examined: dfs(${u}) returns (backtrack), pop the frame.`,
      });
      continue;
    }

    const v = adj[u][i];
    iterIdx[iterIdx.length - 1] = i + 1;
    const edge = edgeByKey.get(edgeKey(u, v));
    if (!edge) continue; // 理论不可达
    stats.comparisons += 1;
    stats.accesses += 2;

    if (visited.has(v)) {
      // 已访问 → 跳过（回边）：树边保持绿色，其余标红
      if (edge.state !== 'done') edge.state = 'invalid';
      push(DFS_LINES.checkEdge, 'compare', {
        zh: `检查边 (${u}, ${v})：${v} 已访问，跳过这条回边。`,
        en: `Check edge (${u}, ${v}): ${v} is already visited, skip this back edge.`,
      });
      continue;
    }

    // 未访问 → 递归进入：树边标绿，新节点高亮，压入栈与调用栈帧
    edge.state = 'comparing';
    push(DFS_LINES.checkEdge, 'compare', {
      zh: `检查边 (${u}, ${v})：${v} 未访问，准备递归深入。`,
      en: `Check edge (${u}, ${v}): ${v} is unvisited, about to recurse.`,
    });

    edge.state = 'done';
    current = v;
    nodeStates[v] = 'active';
    path.push(v);
    iterIdx.push(0);
    frames.push({ id: `f:${v}`, function: 'dfs', args: { node: v }, locals: {}, depth: path.length });
    push(DFS_LINES.recurse, 'push', {
      zh: `发现未访问邻居 ${v}：递归调用 dfs(${v})，压入调用栈，节点高亮为待访问。`,
      en: `Found unvisited neighbor ${v}: recurse into dfs(${v}), push onto the call stack; the node is highlighted.`,
    });

    // 访问 v
    visited.add(v);
    nodeStates[v] = 'done';
    output.push(String(v));
    stats.writes += 1;
    push(DFS_LINES.visit, 'visit', {
      zh: `访问节点 ${v}：标记为已访问，记录到 DFS 序列。`,
      en: `Visit node ${v}: mark it visited and append to the DFS order.`,
    });
  }

  // 结束
  const unreachable = n - visited.size;
  push(DFS_LINES.end, 'finalize', {
    zh:
      unreachable > 0
        ? `DFS 遍历完成：访问顺序为 ${output.join(' → ')}（另有 ${unreachable} 个节点不可达）。`
        : `DFS 遍历完成：访问顺序为 ${output.join(' → ')}，所有节点均已访问。`,
    en:
      unreachable > 0
        ? `DFS complete: visit order is ${output.join(' → ')} (${unreachable} nodes unreachable).`
        : `DFS complete: visit order is ${output.join(' → ')}; all nodes visited.`,
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
