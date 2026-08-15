import type { AlgorithmRunner } from '../types/step';
import { runBubbleSort } from './bubbleSort';
import { runSelectionSort } from './selectionSort';
import { runInsertionSort } from './insertionSort';
import { runBinarySearch } from './binarySearch';
import { runTwoPointers } from './twoPointers';
import { runSlidingWindow } from './slidingWindow';
import { runStackDemo } from './stackDemo';
import { runQueueDemo } from './queueDemo';
import { runGraphDfs } from './graphDfs';
import { runGraphBfs } from './graphBfs';
import { runTopologicalSort } from './topologicalSort';
import { runDijkstra } from './dijkstra';
import { runLinkedListOps } from './linkedListOps';
import { runTreeTraversal } from './treeTraversal';
import { runFibonacci } from './fibonacci';
import { runKnapsack } from './knapsack';
import { runQuickSort } from './quickSort';
import { runMergeSort } from './mergeSort';
import { runHeapSort } from './heapSort';
import { runHashTable } from './hashTable';
import { runBellmanFord } from './bellmanFord';
import { runFloydWarshall } from './floydWarshall';
import { runPrim } from './prim';
import { runKruskal } from './kruskal';

/** Runner 注册表：meta.runnerId → 执行器 */
const runners: Record<string, AlgorithmRunner> = {
  'bubble-sort': runBubbleSort,
  'selection-sort': runSelectionSort,
  'insertion-sort': runInsertionSort,
  'binary-search': runBinarySearch,
  'two-pointers': runTwoPointers,
  'sliding-window': runSlidingWindow,
  'stack-demo': runStackDemo,
  'queue-demo': runQueueDemo,
  'dfs': runGraphDfs,
  'bfs': runGraphBfs,
  'topological-sort': runTopologicalSort,
  'dijkstra': runDijkstra,
  'linked-list-ops': runLinkedListOps,
  'tree-traversal': runTreeTraversal,
  'fibonacci': runFibonacci,
  'knapsack': runKnapsack,
  'quick-sort': runQuickSort,
  'merge-sort': runMergeSort,
  'heap-sort': runHeapSort,
  'hash-table': runHashTable,
  'bellman-ford': runBellmanFord,
  'floyd-warshall': runFloydWarshall,
  'prim': runPrim,
  'kruskal': runKruskal,
};

export function getRunner(runnerId: string): AlgorithmRunner | undefined {
  return runners[runnerId];
}

export function registerRunner(runnerId: string, runner: AlgorithmRunner): void {
  runners[runnerId] = runner;
}
