import type { AlgorithmMeta, CategoryId } from '../../engine/types/algorithm';
import { bubbleSortMeta } from './bubble-sort';
import { selectionSortMeta } from './selection-sort';
import { insertionSortMeta } from './insertion-sort';
import { binarySearchMeta } from './binary-search';
import { twoPointersMeta } from './two-pointers';
import { slidingWindowMeta } from './sliding-window';
import { stackDemoMeta } from './stack-demo';
import { queueDemoMeta } from './queue-demo';
import { dfsMeta } from './dfs';
import { bfsMeta } from './bfs';
import { topologicalSortMeta } from './topological-sort';
import { dijkstraMeta } from './dijkstra';
import { fibonacciMeta } from './fibonacci';
import { knapsackMeta } from './knapsack';
import { linkedListOpsMeta } from './linked-list-ops';
import { treeTraversalMeta } from './tree-traversal';
import { quickSortMeta } from './quick-sort';
import { mergeSortMeta } from './merge-sort';
import { heapSortMeta } from './heap-sort';
import { hashTableMeta } from './hash-table';
import { bellmanFordMeta } from './bellman-ford';
import { floydWarshallMeta } from './floyd-warshall';
import { primMeta } from './prim';
import { kruskalMeta } from './kruskal';
import { nQueensMeta } from './n-queens';
import { kmpMeta } from './kmp';
import { activitySelectionMeta } from './activity-selection';

/** 全部算法元数据（内容注册表，新增算法在此登记） */
export const algorithmMetas: AlgorithmMeta[] = [
  bubbleSortMeta,
  selectionSortMeta,
  insertionSortMeta,
  binarySearchMeta,
  twoPointersMeta,
  slidingWindowMeta,
  stackDemoMeta,
  queueDemoMeta,
  dfsMeta,
  bfsMeta,
  topologicalSortMeta,
  dijkstraMeta,
  fibonacciMeta,
  knapsackMeta,
  linkedListOpsMeta,
  treeTraversalMeta,
  quickSortMeta,
  mergeSortMeta,
  heapSortMeta,
  hashTableMeta,
  bellmanFordMeta,
  floydWarshallMeta,
  primMeta,
  kruskalMeta,
  nQueensMeta,
  kmpMeta,
  activitySelectionMeta,
];

export function getAlgorithmMeta(id: string): AlgorithmMeta | undefined {
  return algorithmMetas.find((m) => m.id === id);
}

export function getCategories(): Array<{ id: CategoryId; count: number }> {
  const counts = new Map<CategoryId, number>();
  for (const meta of algorithmMetas) {
    counts.set(meta.category, (counts.get(meta.category) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([id, count]) => ({ id, count }));
}

export function filterAlgorithms(options: {
  query?: string;
  category?: CategoryId | 'all';
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
}): AlgorithmMeta[] {
  const q = options.query?.trim().toLowerCase() ?? '';
  return algorithmMetas.filter((meta) => {
    if (options.category && options.category !== 'all' && meta.category !== options.category) {
      return false;
    }
    if (options.difficulty && options.difficulty !== 'all' && meta.difficulty !== options.difficulty) {
      return false;
    }
    if (q) {
      const haystack = `${meta.name.zh} ${meta.name.en} ${meta.tags.join(' ')} ${meta.id}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
