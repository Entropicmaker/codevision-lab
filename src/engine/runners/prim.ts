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

/** Prim 最小生成树逻辑代码行 id（与三语言源码 / 伪代码中的标记一致） */
export const PRIM_LINES = {
  func: 'func',
  init: 'init',
  'select-min': 'select-min',
  visit: 'visit',
  relax: 'relax',
  update: 'update',
  'tree-edge': 'tree-edge',
  end: 'end',
} as const;

/** 输入：{ array: 无向加权边列表, aux: 起点编号 } */
export interface PrimInput {
  array: EdgePair[];
  aux: number;
}

/** 邻接表项：目标节点 + 权重 + 对应 GraphEdge 下标 */
interface OutEdge {
  to: number;
  weight: number;
  edgeIndex: number;
}

/** 权重格式化：Infinity → '∞' */
const fmt = (d: number): string => (d === Infinity ? '∞' : String(d));

/**
 * Prim 最小生成树执行器（顶点扩张，教学版 O(V²)）。
 * 纯函数、确定性；每一步为完整图快照，节点 label 显示 key、边 label 显示权重。
 * 无向边双向展开邻接，但图结构只保留一条无向边。
 */
export const runPrim: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const { array: edgePairs, aux: start } = input.value as PrimInput;
  const edgesRaw: EdgePair[] = Array.isArray(edgePairs) ? edgePairs : [];
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 构建无向加权邻接表 + 图结构基础数据（无向边规范化 a<b，只保留一条无向边）。
  const n = edgesRaw.reduce((max, [a, b]) => Math.max(max, a, b), -1) + 1;
  const baseNodes: DisplayItem[] = Array.from({ length: n }, (_, i) => item(`n:${i}`, i, 'idle'));
  const baseEdges: GraphEdge[] = [];
  const adj: OutEdge[][] = Array.from({ length: n }, () => []);
  for (const [aRaw, bRaw, , weightRaw] of edgesRaw) {
    const a = Math.min(aRaw, bRaw);
    const b = Math.max(aRaw, bRaw);
    const weight = weightRaw ?? 1;
    const idx = baseEdges.length;
    baseEdges.push({ from: `n:${a}`, to: `n:${b}`, directed: false, label: String(weight), state: 'idle' });
    adj[a]!.push({ to: b, weight, edgeIndex: idx });
    adj[b]!.push({ to: a, weight, edgeIndex: idx });
  }

  // 可变工作状态：每步 push 前统一深拷贝进快照，保证步骤之间互不影响
  const nodeStates: ElementState[] = new Array<ElementState>(n).fill('idle');
  const key: number[] = new Array<number>(n).fill(Infinity);
  const inTree: boolean[] = new Array<boolean>(n).fill(false);
  const parent: number[] = new Array<number>(n).fill(-1);
  const parentEdge: number[] = new Array<number>(n).fill(-1);
  const isTreeEdge: boolean[] = new Array<boolean>(baseEdges.length).fill(false);
  const output: string[] = [];
  const treeEdges: string[] = [];
  let totalWeight = 0;
  let inTreeCount = 0;
  let current = -1;

  const variables = (): Record<string, Primitive> => ({
    u: current >= 0 ? current : null,
    totalWeight,
    inTreeCount,
  });

  const graphStructure = (): StructureSnapshot => ({
    kind: 'graph',
    id: 'graph',
    nodes: baseNodes.map((nd, i) => ({
      ...nd,
      state: nodeStates[i]!,
      label: `key=${fmt(key[i]!)}`,
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
    push(PRIM_LINES.init, 'init', {
      zh: `起点 ${start} 不在节点范围 [0, ${Math.max(0, n - 1)}] 内，无法计算最小生成树。`,
      en: `Start ${start} is out of node range [0, ${Math.max(0, n - 1)}], cannot compute the minimum spanning tree.`,
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 1. 初始化：key[start]=0，其余 ∞
  key[start] = 0;
  push(PRIM_LINES.init, 'init', {
    zh: `初始化：无向加权图共 ${n} 个节点、${baseEdges.length} 条无向边，起点为 ${start}。key[${start}]=0，其余节点 key 初始化为 ∞（MST 顶点扩张，从起点开始生长）。`,
    en: `Init: undirected weighted graph with ${n} nodes and ${baseEdges.length} undirected edges; source is ${start}. key[${start}]=0 and all other keys are initialized to ∞ (MST grows from the source by vertex expansion).`,
  });

  // 2. 进入函数
  push(PRIM_LINES.func, 'no-op', {
    zh: `进入 prim(adj, ${start})：反复从"未入树"节点中选出 key 最小的节点加入生成树，并更新其邻居的 key（教学版 O(V²)，堆优化可达 O(E log V)）。`,
    en: `Enter prim(adj, ${start}): repeatedly pick the smallest-key node not yet in the tree, add it, and update its neighbors' keys (teaching version O(V²); heap optimization reaches O(E log V)).`,
  });

  // 3. 主循环：select-min → visit → tree-edge → relax
  while (true) {
    // select-min：扫描未入树节点，选 key 最小者 u
    let u = -1;
    let best = Infinity;
    let candidateCount = 0;
    for (let v = 0; v < n; v += 1) {
      if (inTree[v]) continue;
      candidateCount += 1;
      stats.comparisons += 1;
      stats.accesses += 2;
      if (key[v]! < best) {
        best = key[v]!;
        u = v;
      }
    }

    // 全部入树或无可达未入树节点（图不连通）→ 结束循环
    if (u === -1) break;
    if (best === Infinity) break;

    current = u;
    nodeStates[u] = 'active';
    push(PRIM_LINES['select-min'], 'compare', {
      zh: `扫描 ${candidateCount} 个未入树节点，选出 key 最小的节点 u=${u}（key=${fmt(best)}）。`,
      en: `Scan ${candidateCount} nodes not yet in the tree and pick the smallest-key node u=${u} (key=${fmt(best)}).`,
    });

    // visit：u 标 done，入树
    nodeStates[u] = 'done';
    inTree[u] = true;
    inTreeCount += 1;
    output.push(String(u));
    push(PRIM_LINES.visit, 'visit', {
      zh: `节点 ${u} 入树（key=${fmt(key[u]!)}），标记为已加入生成树，输出（inTreeCount=${inTreeCount}）。`,
      en: `Node ${u} joins the tree (key=${fmt(key[u]!)}); mark it in-tree and output it (inTreeCount=${inTreeCount}).`,
    });

    // tree-edge：u 的父边（parent[u]-u）成为 MST 树边，标 done
    if (u !== start) {
      const pe = parentEdge[u]!;
      isTreeEdge[pe] = true;
      baseEdges[pe]!.state = 'done';
      totalWeight += key[u]!;
      treeEdges.push(`${parent[u]}-${u}:${key[u]!}`);
      stats.writes += 1;
      push(PRIM_LINES['tree-edge'], 'assign', {
        zh: `树边 ${parent[u]}-${u}（权重 ${key[u]!}）加入 MST，累计总权 totalWeight=${totalWeight}。`,
        en: `Tree edge ${parent[u]}-${u} (weight ${key[u]!}) joins the MST; cumulative totalWeight=${totalWeight}.`,
      });
    }

    // relax：遍历 u 的邻边，尝试更新邻居 key
    for (const { to: v, weight: w, edgeIndex } of adj[u]!) {
      if (inTree[v]) {
        push(PRIM_LINES.relax, 'compare', {
          zh: `跳过边 ${u}-${v}（权重 ${w}）：节点 ${v} 已入树，无需更新 key。`,
          en: `Skip edge ${u}-${v} (weight ${w}): node ${v} is already in the tree, no key update needed.`,
        });
        continue;
      }

      const edge = baseEdges[edgeIndex]!;
      edge.state = 'comparing';
      stats.comparisons += 1;
      stats.accesses += 2;

      if (w < key[v]!) {
        const old = key[v]!;
        key[v] = w;
        parent[v] = u;
        parentEdge[v] = edgeIndex;
        nodeStates[v] = 'comparing';
        stats.writes += 1;
        edge.state = 'active';
        push(PRIM_LINES.update, 'assign', {
          zh: `候选边 ${u}-${v}（权重 ${w}）：key[${v}]=${fmt(old)} > ${w}，key 更新为 ${w}（父节点设为 ${u}）。`,
          en: `Candidate edge ${u}-${v} (weight ${w}): key[${v}]=${fmt(old)} > ${w}; key updated to ${w} (parent set to ${u}).`,
        });
        nodeStates[v] = 'idle';
      } else {
        push(PRIM_LINES.relax, 'compare', {
          zh: `候选边 ${u}-${v}（权重 ${w}）：key[${v}]=${fmt(key[v]!)} ≤ ${w}，不更新。`,
          en: `Candidate edge ${u}-${v} (weight ${w}): key[${v}]=${fmt(key[v]!)} ≤ ${w}; no update.`,
        });
      }
      edge.state = 'idle';
    }
  }

  // 4. end：输出各节点父边 + MST 总权
  if (inTreeCount === n) {
    const edgeZh = treeEdges.join('、');
    push(PRIM_LINES.end, 'finalize', {
      zh: `Prim 完成：MST 树边为 ${edgeZh}，总权 = ${totalWeight}。`,
      en: `Prim complete: MST edges are ${treeEdges.join(', ')}, total weight = ${totalWeight}.`,
    });
  } else {
    for (let v = 0; v < n; v += 1) {
      if (!inTree[v]) nodeStates[v] = 'invalid';
    }
    push(PRIM_LINES.end, 'finalize', {
      zh: `Prim 提前结束：仅 ${inTreeCount}/${n} 个节点入树，图不连通，不存在最小生成树（红色节点为不可达节点）。`,
      en: `Prim stopped early: only ${inTreeCount}/${n} nodes joined the tree, the graph is disconnected, so no spanning tree exists (red nodes are unreachable).`,
    });
  }

  const connected = inTreeCount === n;
  return {
    steps,
    summary: {
      result: connected ? `总权 ${totalWeight}` : 'not connected',
      resultValue: connected ? totalWeight : null,
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
