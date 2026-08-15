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

/** Bellman-Ford 逻辑代码行 id（与三语言源码 / 伪代码中的标记一致） */
export const BELLMAN_FORD_LINES = {
  func: 'func',
  init: 'init',
  round: 'round',
  relax: 'relax',
  update: 'update',
  checkCycle: 'check-cycle',
  end: 'end',
} as const;

/** 输入：{ array: 加权边列表（有向/无向、可负权）, aux: 起点编号 } */
export interface BellmanFordInput {
  array: EdgePair[];
  aux: number;
}

/**
 * Bellman-Ford 单源最短路执行器（含负权边与负环检测）。
 * 纯函数、确定性；V-1 轮全边松弛 + 第 V 轮负环检测，每步为完整快照。
 */
export const runBellmanFord: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { array: edgePairs, aux: start } = input.value as BellmanFordInput;
  const edgesRaw: EdgePair[] = Array.isArray(edgePairs) ? edgePairs : [];
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 构建边列表：有向边保留单条，无向边双向展开（同一 GraphEdge 供双向松弛高亮）
  const n = edgesRaw.reduce((max, [a, b]) => Math.max(max, a, b), -1) + 1;
  const baseEdges: GraphEdge[] = [];
  const relaxList: Array<{ u: number; v: number; w: number; edgeIdx: number }> = [];
  for (const [a, b, directed, weight] of edgesRaw) {
    const w = weight ?? 1;
    const isDirected = directed === true;
    const idx = baseEdges.length;
    baseEdges.push({ from: `n:${a}`, to: `n:${b}`, directed: isDirected, label: String(w), state: 'idle' });
    relaxList.push({ u: a, v: b, w, edgeIdx: idx });
    if (!isDirected) {
      relaxList.push({ u: b, v: a, w, edgeIdx: idx });
    }
  }

  // 可变工作状态：每步 push 前统一深拷贝进快照，保证步骤之间互不影响
  const nodeStates: ElementState[] = new Array<ElementState>(n).fill('idle');
  const dist: (number | null)[] = new Array<number | null>(n).fill(null);
  const baseNodes: DisplayItem[] = Array.from({ length: n }, (_, i) => item(`n:${i}`, i, 'idle'));
  const output: string[] = [];
  let round = 0;
  let u = -1;
  let v = -1;
  let w = 0;

  const variables = (): Record<string, Primitive> => ({
    round,
    u: u >= 0 ? u : null,
    v: v >= 0 ? v : null,
    w: u >= 0 ? w : null,
    distV: v >= 0 ? dist[v] : null,
  });

  const graphStructure = (): StructureSnapshot => ({
    kind: 'graph',
    id: 'graph',
    nodes: baseNodes.map((nd, i) => ({
      ...nd,
      state: nodeStates[i]!,
      label: dist[i] !== null ? `d=${dist[i]}` : '∞',
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

  // 输入校验：起点越界或图为空 → 显式错误步骤
  if (n === 0 || start < 0 || start >= n) {
    for (let i = 0; i < n; i += 1) nodeStates[i] = 'invalid';
    push(BELLMAN_FORD_LINES.init, 'init', {
      zh: `起点 ${start} 不在节点范围 [0, ${Math.max(0, n - 1)}] 内，无法开始求最短路。`,
      en: `Source ${start} is out of node range [0, ${Math.max(0, n - 1)}], cannot start the shortest-path search.`,
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 初始化：起点距离 0，其余 ∞；允许负权边，进行 V-1 轮全边松弛
  dist[start] = 0;
  nodeStates[start] = 'active';
  push(BELLMAN_FORD_LINES.init, 'init', {
    zh: `初始化：加权图共 ${n} 个节点、${baseEdges.length} 条边，起点 ${start}。允许负权边：进行 V-1 = ${n - 1} 轮全边松弛，再用第 V 轮检测负环。dist[${start}]=0，其余为 ∞。`,
    en: `Init: weighted graph with ${n} nodes and ${baseEdges.length} edges, source ${start}. Negative weights are allowed: run V-1 = ${n - 1} rounds of full-edge relaxation, then a V-th round to detect negative cycles. dist[${start}]=0, others are ∞.`,
  });

  // 进入函数
  push(BELLMAN_FORD_LINES.func, 'no-op', {
    zh: `进入 bellmanFord(n, edges, ${start})：松弛的含义是——若 dist[v] > dist[u] + w，就用 dist[u] + w 更新 dist[v]。每条边在每轮恰好检查一次。`,
    en: `Enter bellmanFord(n, edges, ${start}): relaxation means updating dist[v] to dist[u] + w whenever dist[v] > dist[u] + w. Every edge is checked exactly once per round.`,
  });

  const V = n;

  // 松弛判定：dist[u] 有限且 (dist[v] 未定 或 dist[u]+w 更小)
  const canRelax = (a: number, b: number, weight: number): boolean => {
    if (dist[a] === null) return false;
    if (dist[b] === null) return true;
    return dist[a]! + weight < dist[b]!;
  };

  // 主循环：V-1 轮全边松弛
  for (round = 1; round <= V - 1; round += 1) {
    for (const e of baseEdges) e.state = 'idle';
    for (let i = 0; i < n; i += 1) nodeStates[i] = 'idle';
    nodeStates[start] = 'active';
    u = -1;
    v = -1;
    w = 0;
    push(BELLMAN_FORD_LINES.round, 'no-op', {
      zh: `第 ${round}/${V - 1} 轮：依次松弛全部 ${relaxList.length} 条边。经过 V-1 轮后，任何简单最短路径（至多 V-1 条边）都会被传播到位。`,
      en: `Round ${round}/${V - 1}: relax all ${relaxList.length} edges in order. After V-1 rounds, every simple shortest path (at most V-1 edges) has been propagated.`,
    });

    for (const re of relaxList) {
      u = re.u;
      v = re.v;
      w = re.w;
      const edge = baseEdges[re.edgeIdx];
      edge.state = 'comparing';
      stats.accesses += 1;
      stats.comparisons += 1;
      push(BELLMAN_FORD_LINES.relax, 'compare', {
        zh: `检查边 ${u}→${v}（权重 ${w}）：dist[${v}]=${dist[v] ?? '∞'}，dist[${u}]+${w}=${dist[u] === null ? '∞' : dist[u]! + w}。`,
        en: `Check edge ${u}→${v} (weight ${w}): dist[${v}]=${dist[v] ?? '∞'}, dist[${u}]+${w}=${dist[u] === null ? '∞' : dist[u]! + w}.`,
      });

      if (canRelax(u, v, w)) {
        dist[v] = dist[u]! + w;
        nodeStates[v] = 'active';
        edge.state = 'done';
        stats.writes += 1;
        push(BELLMAN_FORD_LINES.update, 'assign', {
          zh: `松弛成功：dist[${v}] 更新为 ${dist[v]}（经 ${u}→${v}）。`,
          en: `Relaxation succeeds: dist[${v}] updated to ${dist[v]} (via ${u}→${v}).`,
        });
      } else {
        edge.state = 'idle';
        push(BELLMAN_FORD_LINES.relax, 'no-op', {
          zh: `不更新：dist[${v}]=${dist[v] ?? '∞'} 不大于 dist[${u}]+${w}，保持不变。`,
          en: `No update: dist[${v}]=${dist[v] ?? '∞'} is not greater than dist[${u}]+${w}, keep it unchanged.`,
        });
      }
    }
  }

  // 第 V 轮：负环检测
  round = V;
  u = -1;
  v = -1;
  w = 0;
  for (const e of baseEdges) e.state = 'idle';
  for (let i = 0; i < n; i += 1) nodeStates[i] = 'idle';
  nodeStates[start] = 'active';
  push(BELLMAN_FORD_LINES.checkCycle, 'no-op', {
    zh: `第 ${V} 轮（负环检测）：再对全部边做一次松弛尝试。若仍能松弛，说明从起点可达的某条路径能无限变短，即存在负权环。`,
    en: `Round ${V} (negative-cycle detection): try relaxing every edge once more. Any successful relaxation means some path from the source can be shortened indefinitely — a negative cycle exists.`,
  });

  let hasNegativeCycle = false;
  for (const re of relaxList) {
    u = re.u;
    v = re.v;
    w = re.w;
    stats.accesses += 1;
    stats.comparisons += 1;
    if (canRelax(u, v, w)) {
      const edge = baseEdges[re.edgeIdx];
      edge.state = 'invalid';
      nodeStates[u] = 'invalid';
      nodeStates[v] = 'invalid';
      hasNegativeCycle = true;
      push(BELLMAN_FORD_LINES.checkCycle, 'compare', {
        zh: `边 ${u}→${v}（权重 ${w}）仍可松弛：dist[${u}]+${w}=${dist[u]! + w} < dist[${v}]=${dist[v] ?? '∞'}。存在负权环，最短路无定义。`,
        en: `Edge ${u}→${v} (weight ${w}) can still be relaxed: dist[${u}]+${w}=${dist[u]! + w} < dist[${v}]=${dist[v] ?? '∞'}. A negative cycle exists; shortest paths are undefined.`,
      });
      break;
    }
  }

  u = -1;
  v = -1;
  w = 0;

  if (hasNegativeCycle) {
    push(BELLMAN_FORD_LINES.end, 'finalize', {
      zh: `结束：检测到负权环（红色边与相关节点），最短路径无定义。`,
      en: `End: a negative cycle was detected (red edge and related nodes); shortest paths are undefined.`,
    });
    return {
      steps,
      summary: {
        result: 'negative cycle detected',
        resultValue: null,
        totalSteps: steps.length,
        stats: { ...stats },
      },
    };
  }

  // 无负环：可达节点标记完成
  for (let i = 0; i < n; i += 1) {
    nodeStates[i] = dist[i] !== null ? 'done' : 'idle';
  }
  const distZh = baseNodes.map((_, i) => `d(${i})=${dist[i] ?? '∞'}`).join('，');
  const distEn = baseNodes.map((_, i) => `d(${i})=${dist[i] ?? '∞'}`).join(', ');
  output.push(...baseNodes.map((_, i) => `d(${i})=${dist[i] ?? '∞'}`));
  push(BELLMAN_FORD_LINES.end, 'finalize', {
    zh: `验证通过，无负环。各节点到起点 ${start} 的最短距离：${distZh}。`,
    en: `Verification passed, no negative cycle. Shortest distances from source ${start}: ${distEn}.`,
  });

  const resultText = baseNodes.map((_, i) => `d(${i})=${dist[i] ?? '∞'}`).join(', ');
  return {
    steps,
    summary: {
      result: resultText,
      resultValue: resultText,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
