import { test, expect } from '@playwright/test';

/** 移动端：标签页布局与核心操作可用性 */
test.describe('移动端冒泡排序', () => {
  test.skip(({ isMobile }) => isMobile !== true, '仅移动端布局');

  test('标签页切换与基本操作', async ({ page }) => {
    await page.goto('/algorithms/bubble-sort');
    await expect(page.getByRole('tab', { name: '动画' })).toBeVisible();

    // 状态标签页：变量面板可用
    await page.getByRole('tab', { name: '状态' }).click();
    await expect(page.getByText('变量', { exact: true })).toBeVisible();

    // 代码标签页：编辑器加载
    await page.getByRole('tab', { name: '代码' }).click();
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 30_000 });

    // 回到动画页，操作控制栏
    await page.getByRole('tab', { name: '动画' }).click();
    await page.getByTestId('btn-next').click();
    await expect(page.getByTestId('step-counter')).toContainText('第 2 /');
    await page.getByTestId('btn-jump-end').click();
    await expect(page.getByText('已完成').first()).toBeVisible();
  });

  test('移动端菜单导航可用', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '打开菜单' }).click();
    await expect(page.getByRole('link', { name: '算法可视化' })).toBeVisible();
    await page.getByRole('link', { name: '算法可视化' }).click();
    await expect(page).toHaveURL(/\/algorithms/);
  });
});
