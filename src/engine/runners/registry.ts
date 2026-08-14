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
import { runLinkedListOps } from './linkedListOps';
import { runTreeTraversal } from './treeTraversal';
import { runFibonacci } from './fibonacci';
import { runKnapsack } from './knapsack';
import { runQuickSort } from './quickSort';
import { runMergeSort } from './mergeSort';

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
  'linked-list-ops': runLinkedListOps,
  'tree-traversal': runTreeTraversal,
  'fibonacci': runFibonacci,
  'knapsack': runKnapsack,
  'quick-sort': runQuickSort,
  'merge-sort': runMergeSort,
};

export function getRunner(runnerId: string): AlgorithmRunner | undefined {
  return runners[runnerId];
}

export function registerRunner(runnerId: string, runner: AlgorithmRunner): void {
  runners[runnerId] = runner;
}
