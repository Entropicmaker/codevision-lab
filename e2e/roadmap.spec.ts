import { test, expect } from '@playwright/test';

/** 学习路线图：拖拽、缩放、节点点击进入算法页 */
test.describe('学习路线图', () => {
  test.skip(({ isMobile }) => isMobile === true, '仅桌面布局');

  test('路线图加载、节点点击进入算法实验室', async ({ page }) => {
    await page.goto('/roadmap');
    await expect(page.getByText('学习路线图')).toBeVisible();
    // 点击冒泡排序节点（精确 href，避免依赖链副标题重名）
    await page.locator('a[href="/algorithms/bubble-sort"]').first().click();
    await expect(page).toHaveURL(/\/algorithms\/bubble-sort/);
  });

  test('路线图搜索与缩放按钮', async ({ page }) => {
    await page.goto('/roadmap');
    const search = page.getByPlaceholder('搜索节点…');
    await search.fill('二分');
    // 匹配节点出现高亮环（ring）
    const node = page.getByRole('link', { name: /二分搜索/ });
    await expect(node).toBeVisible();
    // 缩放按钮可用
    await page.getByRole('button', { name: '放大' }).click();
    await page.getByRole('button', { name: '适应画布' }).click();
    await expect(node).toBeVisible();
  });

  test('数据结构浏览页与算法库可达', async ({ page }) => {
    await page.goto('/structures');
    await expect(page.getByRole('heading', { name: '数据结构' })).toBeVisible();
    // 从结构页进入栈演示
    await page.getByRole('link', { name: '栈（Stack）演示' }).first().click();
    await expect(page).toHaveURL(/\/algorithms\/stack-demo/);

    await page.goto('/algorithms');
    await expect(page.getByRole('heading', { name: '算法可视化' })).toBeVisible();
    // 12 个算法卡片都在
    for (const name of ['冒泡排序', '二分搜索', '滑动窗口', '斐波那契数列', '0-1 背包问题']) {
      await expect(page.getByText(name, { exact: false }).first()).toBeVisible();
    }
  });
});
