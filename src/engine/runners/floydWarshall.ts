import type {
  AlgorithmRunner,
  AlgorithmStep,
  ElementState,
  OpStats,
  OperationType,
  ParsedInput,
  Primitive,
  RunnerResult,
  TableCell,
  TableSnapshot,
} from '../types/step';
import { emptyStats } from '../types/step';
import type { EdgePair } from '../inputs/parsers';

/** Floyd-Warshall 全源最短路逻辑代码行 id（与三语言源码 / 伪代码标记一致） */
export const FLOYD_LINES = {
  func: 'func',
  init: 'init',
  loopK: 'loop-k',
  loopI: 'loop-i',
  loopJ: 'loop-j',
  relax: 'relax',
  update: 'update',
  end: 'end',
} as const;

const INF = Number.POSITIVE_INFINITY;

/** 数值 → 显示值：有限数用数字，不可达用字符串 '∞' */
const display = (x: number): Primitive => (Number.isFinite(x) ? x : '∞');

/**
 * Floyd-Warshall 全源最短路执行器：DP 距离矩阵 + 三重循环逐步放开中间节点。
 * 输入 value 直接为 EdgePair[]（无 aux）；无向边双向展开，有向边单向。
 * 纯函数、确定性；每一步为完整快照（cells / sourceEdges 深拷贝）。
 */
export const runFloydWarshall: AlgorithmRunner = (input: ParsedInput): RunnerResult => {
  const edgePairs: EdgePair[] = Array.isArray(input.value) ? (input.value as EdgePair[]) : [];

  // 确定节点数 n = 最大节点编号 + 1（输入经 parseEdgeList 保证编号 0..max 连续）
  let n = 0;
  for (const [a, b] of edgePairs) {
    n = Math.max(n, a, b);
  }
  n = edgePairs.length > 0 ? n + 1 : 0;

  const steps: AlgorithmStep[] = [];
  const stats: OpStats = emptyStats();

  // 距离矩阵（内部用 Infinity 表示不可达）
  const dp: number[][] = Array.from({ length: n }, () => Array.from<number>({ length: n }).fill(INF));
  for (let i = 0; i < n; i += 1) dp[i]![i] = 0;
  for (const [a, b, directed, weight = 1] of edgePairs) {
    dp[a]![b] = Math.min(dp[a]![b]!, weight);
    if (!directed) dp[b]![a] = Math.min(dp[b]![a]!, weight);
  }

  // 单元格状态（可变工作副本，每次 push 前深拷贝进快照）
  const cellState: ElementState[][] = Array.from({ length: n }, () =>
    Array.from<ElementState>({ length: n }).fill('idle'),
  );

  let k: number | null = null;
  let i: number | null = null;
  let j: number | null = null;
  let sourceEdges: Array<{
    from: { row: number; col: number };
    to: { row: number; col: number };
    state?: ElementState;
  }> = [];
  let output: string[] = [];

  const tableSnapshot = (): TableSnapshot => {
    const cells: TableCell[] = [];
    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        cells.push({
          id: `dp:${r}:${c}`,
          row: r,
          col: c,
          value: display(dp[r]![c]!),
          state: cellState[r]![c]!,
        });
      }
    }
    return {
      kind: 'table',
      id: 'dist-matrix',
      rows: n,
      cols: n,
      colHeaders: Array.from({ length: n }, (_, c) => String(c)),
      rowHeaders: Array.from({ length: n }, (_, r) => String(r)),
      cells,
      sourceEdges: sourceEdges.map((e) => ({ from: { ...e.from }, to: { ...e.to }, state: e.state })),
    };
  };

  const variables = (): Record<string, Primitive> => ({
    k,
    i,
    j,
    'dp[i][j]': i !== null && j !== null ? display(dp[i]![j]!) : null,
    'dp[i][k]': i !== null && k !== null ? display(dp[i]![k]!) : null,
    'dp[k][j]': k !== null && j !== null ? display(dp[k]![j]!) : null,
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
      structures: [tableSnapshot()],
      variables: variables(),
      pointers: [],
      callStack: [],
      output: output.slice(),
      explanation,
      stats: { ...stats },
    });
  };

  // 初始化：构建距离矩阵（对角线 0、直接边为权、其余 ∞）
  stats.writes += n * n;
  push(FLOYD_LINES.init, 'init', {
    zh: `初始化距离矩阵 dp：${n} 个节点，对角线 dp[i][i]=0（节点到自身），直接边取权值（无向边双向展开），其余为 ∞（不可达）。dp[i][j] 表示从 i 到 j 的最短距离。`,
    en: `Initialize the distance matrix dp (${n} nodes): diagonal dp[i][i]=0, direct edges use their weights (undirected edges expanded both ways), others ∞ (unreachable). dp[i][j] is the shortest distance from i to j.`,
  });

  if (n === 0) {
    push(FLOYD_LINES.end, 'finalize', {
      zh: '输入为空，没有节点，无法计算最短距离。',
      en: 'Empty input: no nodes, nothing to compute.',
    });
    return {
      steps,
      summary: { result: 'no nodes', totalSteps: steps.length, stats: { ...stats } },
    };
  }

  // 三重循环：k 逐步放开中间节点
  for (let kk = 0; kk < n; kk += 1) {
    k = kk;

    // 每 k 开始：高亮第 k 行 / 第 k 列（经由 k 的相关格）
    const saved: ElementState[] = [];
    for (let r = 0; r < n; r += 1) {
      saved.push(cellState[r]![kk]!);
      cellState[r]![kk] = 'comparing';
    }
    for (let c = 0; c < n; c += 1) {
      if (c !== kk) {
        saved.push(cellState[kk]![c]!);
        cellState[kk]![c] = 'comparing';
      }
    }
    push(FLOYD_LINES.loopK, 'no-op', {
      zh: `中间节点 k=${kk}：允许经过节点 0..${kk} 作为中间点。第 ${kk} 行与第 ${kk} 列（黄色）是本次松弛要读取的 dp[i][${kk}] 与 dp[${kk}][j]。`,
      en: `Intermediate k=${kk}: nodes 0..${kk} may now be used as intermediates. Row/col ${kk} (yellow) hold dp[i][${kk}] and dp[${kk}][j] read during this pass.`,
    });
    let idx = 0;
    for (let r = 0; r < n; r += 1) cellState[r]![kk] = saved[idx++]!;
    for (let c = 0; c < n; c += 1) if (c !== kk) cellState[kk]![c] = saved[idx++]!;

    for (let ii = 0; ii < n; ii += 1) {
      for (let jj = 0; jj < n; jj += 1) {
        // 交叉格（i==k 或 j==k）因 dp[k][k]=0 恒为无变化的平凡松弛，跳过
        if (ii === kk || jj === kk) continue;
        i = ii;
        j = jj;

        const dik = dp[ii]![kk]!; // dp[i][k]
        const dkj = dp[kk]![jj]!; // dp[k][j]
        const cur = dp[ii]![jj]!; // dp[i][j]
        const cand = dik + dkj;
        const improved = cand < cur;

        stats.comparisons += 1;
        stats.accesses += 3;

        const src1 = cellState[ii]![kk]!;
        const src2 = cellState[kk]![jj]!;
        cellState[ii]![jj] = 'active';
        cellState[ii]![kk] = 'comparing';
        cellState[kk]![jj] = 'comparing';
        sourceEdges = [
          { from: { row: ii, col: kk }, to: { row: ii, col: jj }, state: 'comparing' },
          { from: { row: kk, col: jj }, to: { row: ii, col: jj }, state: 'comparing' },
        ];

        if (improved) {
          push(FLOYD_LINES.relax, 'compare', {
            zh: `松弛 dp[${ii}][${jj}]：候选 = dp[${ii}][${kk}] + dp[${kk}][${jj}] = ${display(dik)} + ${display(dkj)} = ${display(cand)}，比当前 ${display(cur)} 更小，将更新。`,
            en: `Relax dp[${ii}][${jj}]: candidate = dp[${ii}][${kk}] + dp[${kk}][${jj}] = ${display(dik)} + ${display(dkj)} = ${display(cand)} < current ${display(cur)}; will update.`,
          });
          dp[ii]![jj] = cand;
          stats.writes += 1;
          cellState[ii]![jj] = 'done';
          cellState[ii]![kk] = src1;
          cellState[kk]![jj] = src2;
          sourceEdges = [];
          push(FLOYD_LINES.update, 'assign', {
            zh: `更新 dp[${ii}][${jj}]：${display(cur)} → ${display(cand)}（写入，旧值被更短路径替换）。`,
            en: `Update dp[${ii}][${jj}]: ${display(cur)} → ${display(cand)} (the old value is replaced by a shorter path).`,
          });
        } else {
          push(FLOYD_LINES.relax, 'compare', {
            zh: `检查 dp[${ii}][${jj}]：候选 = dp[${ii}][${kk}] + dp[${kk}][${jj}] = ${display(dik)} + ${display(dkj)} = ${display(cand)}，不小于当前 ${display(cur)}，无改善，保持。`,
            en: `Check dp[${ii}][${jj}]: candidate = dp[${ii}][${kk}] + dp[${kk}][${jj}] = ${display(dik)} + ${display(dkj)} = ${display(cand)}, not smaller than ${display(cur)}; no improvement, keep.`,
          });
          cellState[ii]![jj] = 'done';
          cellState[ii]![kk] = src1;
          cellState[kk]![jj] = src2;
          sourceEdges = [];
        }
      }
    }
  }

  // 结束：汇总各节点间最短距离
  i = null;
  j = null;
  k = null;
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) cellState[r]![c] = 'done';
  }
  const pairs: string[] = [];
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (r !== c && Number.isFinite(dp[r]![c]!)) pairs.push(`${r}→${c}=${dp[r]![c]}`);
    }
  }
  output = pairs.slice();
  stats.accesses += 1;
  push(FLOYD_LINES.end, 'finalize', {
    zh: `算法完成：全源最短距离已确定。${pairs.join('，') || '（无可达点对）'}。`,
    en: `Done: all-pairs shortest distances computed. ${pairs.join(', ') || '(no reachable pairs)'}.`,
  });

  return {
    steps,
    summary: {
      result: pairs.join(', ') || 'no reachable pairs',
      totalSteps: steps.length,
      stats: { ...stats },
    },
  };
};
