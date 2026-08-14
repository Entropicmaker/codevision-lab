import type {
  AlgorithmRunner,
  AlgorithmStep,
  DisplayItem,
  ElementState,
  GraphEdge,
  LinearStructureSnapshot,
  LocalizedText,
  OpStats,
  OperationType,
  ParsedInput,
  PointerState,
  Primitive,
  RunnerResult,
  StructureSnapshot,
} from '../types/step';
import { emptyStats, item } from '../types/step';
import type { EdgePair } from '../inputs/parsers';

/** 广度优先搜索逻辑代码行 id（与三语言源码 / 伪代码中的标记一致） */
export const BFS_LINES = {
  func: 'func',
  init: 'init',
  enqueueStart: 'enqueue-start',
  dequeue: 'dequeue',
  visit: 'visit',
  checkEdge: 'check-edge',
  enqueueNext: 'enqueue-next',
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
 * 广度优先搜索执行器（队列 + 层级距离）。
 * 纯函数、确定性；每一步为完整快照，图 + 队列两个结构同步展示。
 */
export const runGraphBfs: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
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
  const distArr: (number | null)[] = new Array<number | null>(n).fill(null);
  const queue: number[] = []; // 队列：items[0]=队首
  const visited = new Set<number>(); // 入队即标记，避免重复入队
  const output: string[] = [];
  let current = -1;

  const variables = (): Record<string, Primitive> => ({
    current: current >= 0 ? current : null,
    visitedCount: visited.size,
    queueSize: queue.length,
    dist: current >= 0 ? distArr[current] : null,
  });

  const graphStructure = (): StructureSnapshot => ({
    kind: 'graph',
    id: 'graph',
    nodes: baseNodes.map((nd, i) => ({
      ...nd,
      state: nodeStates[i]!,
      label: distArr[i] !== null ? `d=${distArr[i]}` : undefined,
    })),
    edges: baseEdges.map((e) => ({ ...e })),
  });

  const queueStructure = (): LinearStructureSnapshot => ({
    kind: 'queue',
    id: 'queue',
    capacity: n,
    items: queue.map((nodeId, i) => ({
      id: `q:${i}`,
      value: nodeId,
      state: nodeStates[nodeId]!,
      label: distArr[nodeId] !== null ? `d=${distArr[nodeId]}` : undefined,
    })),
  });

  const pointers = (): PointerState[] => {
    if (queue.length === 0) return [];
    return [
      { id: 'p-front', name: 'front', target: 'q:0' },
      { id: 'p-rear', name: 'rear', target: `q:${queue.length - 1}` },
    ];
  };

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
      structures: [graphStructure(), queueStructure()],
      variables: variables(),
      pointers: pointers(),
      callStack: [],
      output: output.slice(),
      explanation,
      stats: { ...stats },
    });
  };

  // 初始化：构建图结构 + 空队列
  push(BFS_LINES.init, 'init', {
    zh: `初始化：无向图共 ${n} 个节点、${baseEdges.length} 条边，起点为 ${start}。队列为空。`,
    en: `Init: undirected graph with ${n} nodes and ${baseEdges.length} edges; start at ${start}. The queue is empty.`,
  });

  // 输入校验：起点越界或图为空 → 显式错误步骤
  if (n === 0 || start < 0 || start >= n) {
    for (let i = 0; i < n; i += 1) nodeStates[i] = 'invalid';
    push(BFS_LINES.init, 'init', {
      zh: `起点 ${start} 不在节点范围 [0, ${Math.max(0, n - 1)}] 内，无法开始遍历。`,
      en: `Start ${start} is out of node range [0, ${Math.max(0, n - 1)}], cannot start traversal.`,
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 进入 bfs 函数：开始逐层扩散
  push(BFS_LINES.func, 'no-op', {
    zh: `进入 bfs(adj, ${start})：开始广度优先搜索，队列为空，准备将起点入队。`,
    en: `Enter bfs(adj, ${start}): start the breadth-first search; the queue is empty, ready to enqueue the source.`,
  });

  // 起点入队：标记已访问，距离 d=0
  current = start;
  visited.add(start);
  distArr[start] = 0;
  nodeStates[start] = 'active';
  queue.push(start);
  stats.writes += 1;
  push(BFS_LINES.enqueueStart, 'enqueue', {
    zh: `起点 ${start} 入队：标记为已访问，距离 d=0。`,
    en: `Enqueue the start node ${start}: mark it visited with distance d=0.`,
  });

  // 主循环
  while (queue.length > 0) {
    const u = queue.shift()!;
    current = u;

    // 出队
    push(BFS_LINES.dequeue, 'dequeue', {
      zh: `出队节点 ${u}（队首），准备访问。`,
      en: `Dequeue node ${u} from the front, ready to visit.`,
    });

    // 访问
    nodeStates[u] = 'done';
    output.push(String(u));
    push(BFS_LINES.visit, 'visit', {
      zh: `访问节点 ${u}：记录到 BFS 序列（距离 d=${distArr[u]}）。`,
      en: `Visit node ${u}: append to the BFS order (distance d=${distArr[u]}).`,
    });

    // 检查邻接边
    for (const v of adj[u]) {
      const edge = edgeByKey.get(edgeKey(u, v));
      if (!edge) continue; // 理论不可达
      stats.comparisons += 1;
      stats.accesses += 2;

      if (visited.has(v)) {
        // 已访问/已入队 → 跳过：树边保持绿色，其余标红
        if (edge.state !== 'done') edge.state = 'invalid';
        push(BFS_LINES.checkEdge, 'compare', {
          zh: `检查边 (${u}, ${v})：${v} 已访问/已入队，跳过。`,
          en: `Check edge (${u}, ${v}): ${v} is already visited/queued, skip.`,
        });
        continue;
      }

      // 未访问 → 入队并标记距离 d+1
      edge.state = 'comparing';
      push(BFS_LINES.checkEdge, 'compare', {
        zh: `检查边 (${u}, ${v})：${v} 未访问，准备入队。`,
        en: `Check edge (${u}, ${v}): ${v} is unvisited, about to enqueue.`,
      });

      edge.state = 'done';
      visited.add(v);
      distArr[v] = (distArr[u] ?? 0) + 1;
      nodeStates[v] = 'active';
      queue.push(v);
      stats.writes += 1;
      push(BFS_LINES.enqueueNext, 'enqueue', {
        zh: `邻居 ${v} 入队：标记为已访问，距离 d=${distArr[v]}。`,
        en: `Enqueue neighbor ${v}: mark it visited, distance d=${distArr[v]}.`,
      });
    }
  }

  // 结束：输出访问序列与各节点距离
  const distZh = baseNodes.map((_, i) => `d(${i})=${distArr[i] ?? '∞'}`).join('，');
  const distEn = baseNodes.map((_, i) => `d(${i})=${distArr[i] ?? '∞'}`).join(', ');
  const unreachable = n - visited.size;
  push(BFS_LINES.end, 'finalize', {
    zh:
      unreachable > 0
        ? `BFS 遍历完成：访问顺序为 ${output.join(' → ')}；各节点距离：${distZh}（另有 ${unreachable} 个节点不可达）。`
        : `BFS 遍历完成：访问顺序为 ${output.join(' → ')}；各节点距离：${distZh}。`,
    en:
      unreachable > 0
        ? `BFS complete: visit order is ${output.join(' → ')}; distances: ${distEn} (${unreachable} nodes unreachable).`
        : `BFS complete: visit order is ${output.join(' → ')}; distances: ${distEn}.`,
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
