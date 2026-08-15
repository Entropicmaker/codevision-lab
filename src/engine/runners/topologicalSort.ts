import type {
  AlgorithmRunner,
  AlgorithmStep,
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

/** 拓扑排序（Kahn 算法）逻辑代码行 id（与三语言源码 / 伪代码中的标记一致） */
export const TOPO_LINES = {
  func: 'func',
  init: 'init',
  indegree: 'indegree',
  enqueue: 'enqueue',
  dequeue: 'dequeue',
  relax: 'relax',
  enqueueNext: 'enqueue-next',
  detectCycle: 'detect-cycle',
  end: 'end',
} as const;

/**
 * 拓扑排序执行器（Kahn 算法：入度法 + 队列）。
 * 输入为有向边列表（无 aux 起点），纯函数、确定性；每一步为完整快照，
 * 有向图（入度标注）+ 候选队列两个结构同步展示。
 */
export const runTopologicalSort: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const edgesRaw: EdgePair[] = Array.isArray(input.value) ? (input.value as EdgePair[]) : [];
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 构建有向图：出邻接表 + 入度数组 + 图结构基础数据（边 directed:true）
  const n = edgesRaw.reduce((max, [a, b]) => Math.max(max, a, b), -1) + 1;
  const outAdj: number[][] = Array.from({ length: n }, () => []);
  const outEdgeIdx: number[][] = Array.from({ length: n }, () => []);
  const inDeg: number[] = new Array<number>(n).fill(0);
  const baseEdges: GraphEdge[] = [];
  for (const [a, b] of edgesRaw) {
    const edge: GraphEdge = { from: `n:${a}`, to: `n:${b}`, directed: true, state: 'idle' };
    baseEdges.push(edge);
    outAdj[a].push(b);
    outEdgeIdx[a].push(baseEdges.length - 1);
    inDeg[b] += 1;
  }

  // 可变工作状态：每步 push 前统一深拷贝进快照，保证步骤之间互不影响
  const nodeStates: ElementState[] = new Array<ElementState>(n).fill('idle');
  const queue: number[] = []; // 候选队列：items[0]=队首
  const output: string[] = [];
  let visitedCount = 0;
  let current = -1;

  const variables = (): Record<string, Primitive> => ({
    visitedCount,
    queueSize: queue.length,
    current: current >= 0 ? current : null,
  });

  const graphStructure = (): StructureSnapshot => ({
    kind: 'graph',
    id: 'graph',
    nodes: Array.from({ length: n }, (_, i) =>
      item(`n:${i}`, i, nodeStates[i], `in=${inDeg[i]}`),
    ),
    edges: baseEdges.map((e) => ({ ...e })),
  });

  const queueStructure = (): LinearStructureSnapshot => ({
    kind: 'queue',
    id: 'queue',
    capacity: n,
    items: queue.map((nodeId, i) => ({
      id: `q:${i}`,
      value: nodeId,
      state: nodeStates[nodeId],
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

  // 1. 初始化：构建有向图结构，展示每个节点的入度
  push(TOPO_LINES.init, 'init', {
    zh: `初始化：有向图共 ${n} 个节点、${baseEdges.length} 条有向边。拓扑排序只适用于有向无环图（DAG）：将节点排成线性顺序，使每条边 u→v 都满足 u 在 v 之前。`,
    en: `Init: directed graph with ${n} nodes and ${baseEdges.length} directed edges. Topological sort applies only to a DAG (directed acyclic graph): arrange nodes linearly so that every edge u→v places u before v.`,
  });

  // 2. 进入函数
  push(TOPO_LINES.func, 'no-op', {
    zh: `进入 topologicalSort(n, adj)：使用 Kahn 算法（入度法）——反复挑选入度为零的节点输出，并移除其出边。`,
    en: `Enter topologicalSort(n, adj): use Kahn's algorithm (in-degree method) — repeatedly output zero in-degree nodes and remove their outgoing edges.`,
  });

  // 3. 扫描所有节点，找出入度为零的候选
  const candidates: number[] = [];
  for (let u = 0; u < n; u += 1) {
    if (inDeg[u] === 0) candidates.push(u);
  }
  stats.comparisons += n;
  for (const u of candidates) nodeStates[u] = 'comparing';
  push(TOPO_LINES.indegree, 'compare', {
    zh:
      candidates.length > 0
        ? `扫描所有节点，找出入度为零的候选：${candidates.join('、')}。入度为零意味着没有前置依赖，可立即输出。`
        : `扫描所有节点：没有任何入度为零的节点，说明图中存在环，无法开始拓扑排序。`,
    en:
      candidates.length > 0
        ? `Scan all nodes for zero in-degree candidates: ${candidates.join(', ')}. Zero in-degree means no prerequisite, so they can be output immediately.`
        : `Scan all nodes: no zero in-degree node exists, so the graph contains a cycle and topological sort cannot start.`,
  });

  // 4. 所有入度为零的节点入队
  for (const u of candidates) {
    nodeStates[u] = 'active';
    queue.push(u);
    stats.writes += 1;
    push(TOPO_LINES.enqueue, 'enqueue', {
      zh: `节点 ${u} 入度为零，入队（候选就绪）。`,
      en: `Node ${u} has zero in-degree; enqueue it (candidate ready).`,
    });
  }

  // 5. 主循环：出队 → 输出 → 松弛出边 → 邻居入度减一 → 归零则入队
  while (queue.length > 0) {
    const u = queue.shift() as number;
    current = u;
    nodeStates[u] = 'done';
    output.push(String(u));
    visitedCount += 1;
    stats.writes += 1;
    push(TOPO_LINES.dequeue, 'dequeue', {
      zh: `出队节点 ${u}：输出到拓扑序列，visitedCount=${visitedCount}。`,
      en: `Dequeue node ${u}: append to the topological order, visitedCount=${visitedCount}.`,
    });

    for (let j = 0; j < outAdj[u].length; j += 1) {
      const v = outAdj[u][j];
      const edge = baseEdges[outEdgeIdx[u][j]];
      // 松弛：移除该出边，邻居入度减一
      edge.state = 'comparing';
      inDeg[v] -= 1;
      stats.accesses += 1;
      stats.writes += 1;
      stats.comparisons += 1;
      push(TOPO_LINES.relax, 'compare', {
        zh: `移除出边 ${u}→${v}：邻居 ${v} 的入度减一（in=${inDeg[v]}）。`,
        en: `Remove edge ${u}→${v}: decrement in-degree of neighbor ${v} (in=${inDeg[v]}).`,
      });
      edge.state = 'done';

      if (inDeg[v] === 0) {
        nodeStates[v] = 'active';
        queue.push(v);
        stats.writes += 1;
        push(TOPO_LINES.enqueueNext, 'enqueue', {
          zh: `节点 ${v} 的入度归零，入队。`,
          en: `Node ${v}'s in-degree reached zero; enqueue it.`,
        });
      }
    }
  }

  // 6. 队列空 → 结束判断：输出数是否等于节点数
  if (visitedCount === n) {
    push(TOPO_LINES.end, 'finalize', {
      zh: `拓扑排序完成：拓扑序为 ${output.join(' → ')}。所有节点均已输出，得到合法拓扑序。`,
      en: `Topological sort complete: the order is ${output.join(' → ')}. All nodes are output; the order is valid.`,
    });
  } else {
    for (let u = 0; u < n; u += 1) {
      if (nodeStates[u] !== 'done') nodeStates[u] = 'invalid';
    }
    stats.comparisons += 1;
    push(TOPO_LINES.detectCycle, 'compare', {
      zh: `队列已空但仅输出 ${visitedCount}/${n} 个节点：剩余 ${n - visitedCount} 个节点的入度始终不为零，图中存在环，无法进行拓扑排序。`,
      en: `Queue is empty but only ${visitedCount}/${n} nodes were output: the remaining ${n - visitedCount} nodes never reach zero in-degree, so the graph contains a cycle and cannot be topologically sorted.`,
    });
    push(TOPO_LINES.end, 'finalize', {
      zh: `结束：检测到环，无法得到拓扑序（红色节点构成环）。`,
      en: `End: a cycle was detected, no topological order exists (red nodes form the cycle).`,
    });
  }

  const isDag = visitedCount === n;
  return {
    steps,
    summary: {
      result: isDag ? output.join(', ') : 'cycle detected',
      resultValue: isDag ? output.join(', ') : null,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
