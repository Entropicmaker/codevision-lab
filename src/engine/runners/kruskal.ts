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

/** Kruskal 最小生成树逻辑代码行 id（与三语言源码 / 伪代码中的标记一致） */
export const KRUSKAL_LINES = {
  func: 'func',
  init: 'init',
  sort: 'sort',
  check: 'check',
  find: 'find',
  union: 'union',
  skip: 'skip',
  'tree-edge': 'tree-edge',
  end: 'end',
} as const;

/** 排序后的边记录：两端点 + 权重 + 对应 GraphEdge 下标 */
interface EdgeRec {
  a: number;
  b: number;
  w: number;
  edgeIndex: number;
}

/**
 * Kruskal 最小生成树执行器（按权排序 + 并查集防环）。
 * 输入为无向加权边列表（无 aux，直接 Array.isArray 判断）。
 * 纯函数、确定性；每一步为完整图快照，节点 label 显示并查集根、边 label 显示权重。
 */
export const runKruskal: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const edgesRaw: EdgePair[] = Array.isArray(input.value) ? (input.value as EdgePair[]) : [];
  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 构建无向加权图结构（边规范化 a<b，只保留一条无向边）
  const n = edgesRaw.reduce((max, [a, b]) => Math.max(max, a, b), -1) + 1;
  const baseNodes: DisplayItem[] = Array.from({ length: n }, (_, i) => item(`n:${i}`, i, 'idle'));
  const baseEdges: GraphEdge[] = [];
  const recs: EdgeRec[] = [];
  for (const [aRaw, bRaw, , weightRaw] of edgesRaw) {
    const a = Math.min(aRaw, bRaw);
    const b = Math.max(aRaw, bRaw);
    const w = weightRaw ?? 1;
    const idx = baseEdges.length;
    baseEdges.push({ from: `n:${a}`, to: `n:${b}`, directed: false, label: String(w), state: 'idle' });
    recs.push({ a, b, w, edgeIndex: idx });
  }
  // 按权重升序排序；权重相同时按端点编号排序保证确定性
  const sorted: EdgeRec[] = [...recs].sort((x, y) => x.w - y.w || x.a - y.a || x.b - y.b);

  // 可变工作状态：每步 push 前统一深拷贝进快照，保证步骤之间互不影响
  const nodeStates: ElementState[] = new Array<ElementState>(n).fill('idle');
  const parent: number[] = Array.from({ length: n }, (_, i) => i);
  const output: string[] = [];
  const treeEdges: string[] = [];
  let totalWeight = 0;
  let edgeCount = 0;
  let setCount = n;

  // 并查集 find：只读查找根（不路径压缩，避免在快照函数内改变状态）
  const findRoot = (x: number): number => {
    let r = x;
    while (parent[r] !== r) r = parent[r]!;
    return r;
  };

  const variables = (): Record<string, Primitive> => ({
    edgeCount,
    totalWeight,
    sets: setCount,
  });

  const graphStructure = (): StructureSnapshot => ({
    kind: 'graph',
    id: 'graph',
    nodes: baseNodes.map((nd, i) => ({
      ...nd,
      state: nodeStates[i]!,
      label: `set:${findRoot(i)}`,
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

  // 空图 → 显式错误步骤
  if (n === 0) {
    push(KRUSKAL_LINES.init, 'init', {
      zh: '图为空，无法计算最小生成树。',
      en: 'The graph is empty, cannot compute a minimum spanning tree.',
    });
    return {
      steps,
      summary: { result: 'input error', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 1. 初始化：每个节点一个集合
  push(KRUSKAL_LINES.init, 'init', {
    zh: `初始化：无向加权图共 ${n} 个节点、${baseEdges.length} 条无向边。并查集初始化——每个节点自成集合（set:i），用于判断两端是否已连通。`,
    en: `Init: undirected weighted graph with ${n} nodes and ${baseEdges.length} undirected edges. Union-find is initialized — each node is its own set (set:i) to detect connectivity.`,
  });

  // 2. 进入函数
  push(KRUSKAL_LINES.func, 'no-op', {
    zh: `进入 kruskal(n, edges)：先按权重升序排序所有边，再逐边尝试加入；用并查集判断两端是否同集合，避免成环。`,
    en: `Enter kruskal(n, edges): sort all edges by weight ascending, then try each edge; use union-find to check whether both ends share a set, avoiding cycles.`,
  });

  // 3. 排序：展示按权重升序后的处理顺序
  const orderZh = sorted.map((e) => `${e.a}-${e.b}(${e.w})`).join('、');
  push(KRUSKAL_LINES.sort, 'compare', {
    zh: `按权重升序排序后的边顺序：${orderZh}。贪心策略从最轻的边开始尝试。`,
    en: `Edges sorted by weight ascending: ${sorted.map((e) => `${e.a}-${e.b}(${e.w})`).join(', ')}. The greedy strategy starts from the lightest edge.`,
  });

  // 4. 主循环：逐边 check → find → 选入（tree-edge + union）或跳过（skip）
  for (const { a, b, w, edgeIndex } of sorted) {
    const edge = baseEdges[edgeIndex]!;
    nodeStates[a] = 'active';
    nodeStates[b] = 'active';
    edge.state = 'comparing';
    push(KRUSKAL_LINES.check, 'compare', {
      zh: `处理边 ${a}-${b}（权重 ${w}）：当前已选 ${edgeCount} 条边，尝试加入这条边。`,
      en: `Process edge ${a}-${b} (weight ${w}): ${edgeCount} edges selected so far, try to add this edge.`,
    });

    const ru = findRoot(a);
    const rv = findRoot(b);
    stats.comparisons += 1;
    stats.accesses += 2;
    push(KRUSKAL_LINES.find, 'compare', {
      zh: `find(${a})=${ru}，find(${b})=${rv}：查找两端各自所在的集合根。`,
      en: `find(${a})=${ru}, find(${b})=${rv}: look up the set root of each endpoint.`,
    });

    if (ru !== rv) {
      // 不同集合 → 选入 MST
      edge.state = 'done';
      totalWeight += w;
      edgeCount += 1;
      output.push(`${a}-${b}`);
      treeEdges.push(`${a}-${b}:${w}`);
      stats.writes += 1;
      push(KRUSKAL_LINES['tree-edge'], 'assign', {
        zh: `两端属于不同集合（${ru} ≠ ${rv}），选入边 ${a}-${b}（权重 ${w}）加入 MST：totalWeight=${totalWeight}，edgeCount=${edgeCount}。`,
        en: `The two ends belong to different sets (${ru} ≠ ${rv}); select edge ${a}-${b} (weight ${w}) into the MST: totalWeight=${totalWeight}, edgeCount=${edgeCount}.`,
      });

      // union：合并两个集合
      parent[ru] = rv;
      setCount -= 1;
      stats.writes += 1;
      push(KRUSKAL_LINES.union, 'assign', {
        zh: `合并集合：将根 ${ru} 并入根 ${rv}，集合数变为 ${setCount}（两端的节点统一标注为 set:${rv}）。`,
        en: `Union: attach root ${ru} under root ${rv}; the number of sets becomes ${setCount} (both endpoints are relabeled set:${rv}).`,
      });

      nodeStates[a] = 'idle';
      nodeStates[b] = 'idle';
    } else {
      // 同集合 → 成环，跳过
      edge.state = 'invalid';
      nodeStates[a] = 'comparing';
      nodeStates[b] = 'comparing';
      stats.comparisons += 1;
      push(KRUSKAL_LINES.skip, 'compare', {
        zh: `两端属于同一集合（find(${a})=find(${b})=${ru}），加入边 ${a}-${b} 会形成环，跳过（标红）。`,
        en: `Both ends belong to the same set (find(${a})=find(${b})=${ru}); adding edge ${a}-${b} would form a cycle, so skip it (marked red).`,
      });
      nodeStates[a] = 'idle';
      nodeStates[b] = 'idle';
    }
  }

  // 5. end：输出 MST 总权
  if (edgeCount === n - 1) {
    push(KRUSKAL_LINES.end, 'finalize', {
      zh: `Kruskal 完成：已选 ${edgeCount} 条边（= n-1），MST 树边为 ${treeEdges.join('、')}，总权 = ${totalWeight}。`,
      en: `Kruskal complete: ${edgeCount} edges selected (= n-1); MST edges are ${treeEdges.join(', ')}, total weight = ${totalWeight}.`,
    });
  } else {
    push(KRUSKAL_LINES.end, 'finalize', {
      zh: `Kruskal 结束：仅选中 ${edgeCount} 条边（< n-1），图不连通，不存在最小生成树（当前集合数 ${setCount} > 1）。`,
      en: `Kruskal ended: only ${edgeCount} edges selected (< n-1); the graph is disconnected, no spanning tree exists (${setCount} sets remain > 1).`,
    });
  }

  const connected = edgeCount === n - 1;
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
