import { test, expect } from '@playwright/test';

/**
 * 全部 MVP 算法冒烟测试：
 * 每个算法页面都能加载、执行到最后一步并显示完成状态。
 * （新算法接入后自动被覆盖，无需修改本文件）
 */
const ALGORITHM_IDS = [
  'bubble-sort',
  'selection-sort',
  'insertion-sort',
  'merge-sort',
  'quick-sort',
  'binary-search',
  'two-pointers',
  'sliding-window',
  'stack-demo',
  'queue-demo',
  'linked-list-ops',
  'tree-traversal',
  'dfs',
  'bfs',
  'fibonacci',
  'knapsack',
  'heap-sort',
  'hash-table',
  'topological-sort',
  'dijkstra',
  'bellman-ford',
  'floyd-warshall',
  'prim',
  'kruskal',
];

test.describe('全部算法冒烟测试', () => {
  test.skip(({ isMobile }) => isMobile === true, '仅桌面布局');

  for (const id of ALGORITHM_IDS) {
    test(`${id} 页面加载并执行完成`, async ({ page }) => {
      await page.goto(`/algorithms/${id}`);
      await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 30_000 });
      // 有步骤可走
      await expect(page.getByTestId('step-counter')).toContainText('第 1 /');
      // 跳到结尾 → 完成
      await page.getByTestId('btn-jump-end').click();
      await expect(page.getByTestId('step-counter')).toContainText('已完成');
      // 重置可用
      await page.getByTestId('btn-reset').click();
      await expect(page.getByTestId('step-counter')).toContainText('第 1 /');
    });
  }
});
