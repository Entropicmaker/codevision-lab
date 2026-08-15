import type {
  AlgorithmRunner,
  AlgorithmStep,
  DisplayItem,
  ElementState,
  GraphEdge,
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

/** Dijkstra 单源最短路逻辑代码行 id（与三语言源码 / 伪代码中的标记一致） */
export const DIJKSTRA_LINES = {
  func: 'func',
  init: 'init',
  'select-min': 'select-min',
  visit: 'visit',
  relax: 'relax',
  update: 'update',
  end: 'end',
} as const;

/** 输入：{ array: 加权边列表, aux: 起点编号 } */
export interface DijkstraInput {
  array: EdgePair[];
  aux: number;
}

/** 邻接表项：目标节点 + 权重 + 对应 GraphEdge 下标 */
interface OutEdge {
  to: number;
  weight: number;
  edgeIndex: number;
}

/** 距离格式化：Infinity → '∞' */
const fmt = (d: number): string => (d === Infinity ? '∞' : String(d));

/**
 * Dijkstra 单源最短路执行器（教学版：每轮扫描未确定节点选距离最小者，O(V²)）。
 * 纯函数、确定性；每一步为完整图快照，节点 label 显示距离、边 label 显示权重。
 */
export const runDijkstra: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { array: edgePairs, aux: start } = input.value as DijkstraInput;
  const edgesRaw: EdgePair[] = Array.isArray(edgePairs) ? edgePairs : [];
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 构建加权邻接表 + 图结构基础数据。无向边双向展开成两条有向边。
  const n = edgesRaw.reduce((max, [a, b]) => Math.max(max, a, b), -1) + 1;
  const baseNodes: DisplayItem[] = Array.from({ length: n }, (_, i) => item(`n:${i}`, i, 'idle'));
  const baseEdges: GraphEdge[] = [];
  const outAdj: OutEdge[][] = Array.from({ length: n }, () => []);
  for (const [a, b, directed, weightRaw] of edgesRaw) {
    const weight = weightRaw ?? 1;
    if (directed === true) {
      baseEdges.push({ from: `n:${a}`, to: `n:${b}`, directed: true, label: String(weight), state: 'idle' });
      outAdj[a]!.push({ to: b, weight, edgeIndex: baseEdges.length - 1 });
    } else {
      baseEdges.push({ from: `n:${a}`, to: `n:${b}`, directed: true, label: String(weight), state: 'idle' });
      outAdj[a]!.push({ to: b, weight, edgeIndex: baseEdges.length - 1 });
      baseEdges.push({ from: `n:${b}`, to: `n:${a}`, directed: true, label: String(weight), state: 'idle' });
      outAdj[b]!.push({ to: a, weight, edgeIndex: baseEdges.length - 1 });
    }
  }

  // 可变工作状态：每步 push 前统一深拷贝进快照，保证步骤之间互不影响
  const nodeStates: ElementState[] = new Array<ElementState>(n).fill('idle');
  const dist: number[] = new Array<number>(n).fill(Infinity);
  const done: boolean[] = new Array<boolean>(n).fill(false);
  const output: string[] = [];
  let visitedCount = 0;
  let current = -1;

  const variables = (): Record<string, Primitive> => ({
    u: current >= 0 ? current : null,
    'dist[u]': current >= 0 ? (dist[current] === Infinity ? '∞' : dist[current]) : null,
    visitedCount,
    infinity: '∞',
  });

  const graphStructure = (): StructureSnapshot => ({
    kind: 'graph',
    id: 'graph',
    nodes: baseNodes.map((nd, i) => ({
      ...nd,
      state: nodeStates[i]!,
      label: dist[i] === Infinity ? '∞' : `d=${dist[i]}`,
    })),
    edges: baseEdges.map((e) => ({ ...e })),
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
      structures: [graphStructure()],
      variables: variables(),
      pointers: [],
      callStack: [],
      output: output.slice(),
      explanation,
      stats: { ...stats },
    });
  };

  // 输入校验：图为空或起点越界 → 显式错误步骤
  if (n === 0 || start < 0 || start >= n) {
    for (let i = 0; i < n; i += 1) nodeStates[i] = 'invalid';
    push(DIJKSTRA_LINES.init, 'init', {
      zh: `起点 ${start} 不在节点范围 [0, ${Math.max(0, n - 1)}] 内，无法计算最短路。`,
      en: `Start ${start} is out of node range [0, ${Math.max(0, n - 1)}], cannot compute shortest paths.`,
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 1. 初始化：dist[start]=0，其余 ∞
  dist[start] = 0;
  push(DIJKSTRA_LINES.init, 'init', {
    zh: `初始化：加权图共 ${n} 个节点、${baseEdges.length} 条有向边，起点为 ${start}。dist[${start}]=0，其余节点距离初始化为 ∞（单源最短路，贪心扩展）。`,
    en: `Init: weighted graph with ${n} nodes and ${baseEdges.length} directed edges; source is ${start}. dist[${start}]=0 and all other distances are initialized to ∞ (single-source shortest path, greedy expansion).`,
  });

  // 2. 进入函数
  push(DIJKSTRA_LINES.func, 'no-op', {
    zh: `进入 dijkstra(adj, ${start})：反复从"未确定"节点中选出距离最小者确定，并用它松弛邻居（教学版 O(V²)，堆优化可达 O((V+E) log V)）。`,
    en: `Enter dijkstra(adj, ${start}): repeatedly pick the smallest-distance undetermined node, finalize it, and relax its neighbors (teaching version O(V²); heap optimization reaches O((V+E) log V)).`,
  });

  // 3. 主循环：select-min → visit → relax
  while (true) {
    // select-min：扫描未确定节点，选距离最小者 u
    let u = -1;
    let best = Infinity;
    let candidateCount = 0;
    for (let v = 0; v < n; v += 1) {
      if (done[v]) continue;
      candidateCount += 1;
      stats.comparisons += 1;
      stats.accesses += 2;
      if (dist[v]! < best) {
        best = dist[v]!;
        u = v;
      }
    }

    // 无可达的未确定节点（全部确定或不可达）→ 结束循环
    if (u === -1) break;

    current = u;
    nodeStates[u] = 'active';
    push(DIJKSTRA_LINES['select-min'], 'compare', {
      zh: `扫描 ${candidateCount} 个未确定节点，选出距离最小的节点 u=${u}（dist=${fmt(best)}）。`,
      en: `Scan ${candidateCount} undetermined nodes and pick the smallest-distance node u=${u} (dist=${fmt(best)}).`,
    });

    // visit：u 标 done，最短距离已确定
    nodeStates[u] = 'done';
    done[u] = true;
    visitedCount += 1;
    output.push(String(u));
    push(DIJKSTRA_LINES.visit, 'visit', {
      zh: `确定节点 ${u}：dist[${u}]=${fmt(dist[u]!)} 已是最短距离，输出并标记为已确定（visitedCount=${visitedCount}）。`,
      en: `Finalize node ${u}: dist[${u}]=${fmt(dist[u]!)} is now the shortest distance; output it and mark it done (visitedCount=${visitedCount}).`,
    });

    // relax：遍历 u 的出边，尝试松弛
    for (const { to: v, weight: w, edgeIndex } of outAdj[u]!) {
      const edge = baseEdges[edgeIndex]!;
      edge.state = 'comparing';

      if (done[v]) {
        push(DIJKSTRA_LINES.relax, 'compare', {
          zh: `跳过边 ${u}→${v}（权重 ${w}）：节点 ${v} 已确定（dist=${fmt(dist[v]!)}），不参与后续松弛。`,
          en: `Skip edge ${u}→${v} (weight ${w}): node ${v} is already finalized (dist=${fmt(dist[v]!)}), does not participate in further relaxation.`,
        });
        edge.state = 'idle';
        continue;
      }

      stats.comparisons += 1;
      stats.accesses += 2;

      if (dist[v]! > dist[u]! + w) {
        const old = dist[v]!;
        dist[v] = dist[u]! + w;
        nodeStates[v] = 'comparing';
        stats.writes += 1;
        push(DIJKSTRA_LINES.update, 'assign', {
          zh: `松弛边 ${u}→${v}（权重 ${w}）：dist[${v}]=${fmt(old)} > dist[${u}]+${w}=${dist[u]! + w}，松弛成功，dist[${v}] 降为 ${dist[v]!}。`,
          en: `Relax edge ${u}→${v} (weight ${w}): dist[${v}]=${fmt(old)} > dist[${u}]+${w}=${dist[u]! + w}; relaxation succeeds, dist[${v}] becomes ${dist[v]!}.`,
        });
        nodeStates[v] = 'idle';
      } else {
        push(DIJKSTRA_LINES.relax, 'compare', {
          zh: `松弛边 ${u}→${v}（权重 ${w}）：dist[${v}]=${fmt(dist[v]!)} ≤ dist[${u}]+${w}=${dist[u]! + w}，不满足松弛条件，跳过。`,
          en: `Relax edge ${u}→${v} (weight ${w}): dist[${v}]=${fmt(dist[v]!)} ≤ dist[${u}]+${w}=${dist[u]! + w}; no improvement, skip.`,
        });
      }
      edge.state = 'idle';
    }
  }

  // 4. end：输出各节点最短距离，不可达节点保持 ∞
  const unreachable = n - visitedCount;
  const distZh = baseNodes.map((_, i) => `d(${i})=${fmt(dist[i]!)}`).join('，');
  const distEn = baseNodes.map((_, i) => `d(${i})=${fmt(dist[i]!)}`).join(', ');
  push(DIJKSTRA_LINES.end, 'finalize', {
    zh:
      unreachable > 0
        ? `Dijkstra 完成：各节点到起点 ${start} 的最短距离为 ${distZh}（另有 ${unreachable} 个节点不可达，保持 ∞）。`
        : `Dijkstra 完成：各节点到起点 ${start} 的最短距离为 ${distZh}。`,
    en:
      unreachable > 0
        ? `Dijkstra complete: shortest distances from source ${start} are ${distEn} (${unreachable} nodes unreachable, left as ∞).`
        : `Dijkstra complete: shortest distances from source ${start} are ${distEn}.`,
  });

  const distSummary = baseNodes.map((_, i) => fmt(dist[i]!)).join(', ');
  return {
    steps,
    summary: {
      result: distSummary,
      resultValue: distSummary,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
