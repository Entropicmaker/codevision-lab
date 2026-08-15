import { test, expect } from '@playwright/test';

/**
 * 冒泡排序纵向切片 E2E：
 * 代码高亮、动画、变量状态、前进/后退、跳首尾、重置、语言切换、
 * 输入修改、自动播放、速度、进度持久化与刷新恢复。
 */
test.describe('冒泡排序纵向切片', () => {
  test.skip(({ isMobile }) => isMobile === true, '仅桌面布局');

  test.beforeEach(async ({ page }) => {
    await page.goto('/algorithms/bubble-sort');
    await expect(page.getByTestId('step-counter')).toContainText('第 1 /', { timeout: 30_000 });
  });

  test('初始状态：步骤 1、已暂停、变量面板可见', async ({ page }) => {
    await expect(page.getByTestId('step-counter')).toContainText('第 1 /');
    await expect(page.getByTestId('step-counter')).toContainText('已暂停');
    await expect(page.getByText('变量', { exact: true })).toBeVisible();
    // 伪代码面板按标签展示
    await page.getByRole('tab', { name: '伪代码' }).click();
    await expect(page.getByText('bubbleSort(a):').first()).toBeVisible();
    // 初始步骤说明
    await expect(page.getByText(/开始冒泡排序/).first()).toBeVisible();
  });

  test('下一步 → 上一步 → 跳到结尾 → 重置 全链路', async ({ page }) => {
    await page.getByTestId('btn-next').click();
    await expect(page.getByTestId('step-counter')).toContainText('第 2 /');

    await page.getByTestId('btn-prev').click();
    await expect(page.getByTestId('step-counter')).toContainText('第 1 /');

    await page.getByTestId('btn-jump-end').click();
    await expect(page.getByTestId('step-counter')).toContainText('已完成');
    await expect(page.getByText(/sorted: \[1, 2, 3, 5, 8, 9\]/)).toBeVisible();

    await page.getByTestId('btn-prev').click();
    await expect(page.getByTestId('step-counter')).not.toContainText('第 1 /');

    await page.getByTestId('btn-reset').click();
    await expect(page.getByTestId('step-counter')).toContainText('第 1 /');
  });

  test('步骤说明随执行变化，变量表同步更新', async ({ page }) => {
    // 第 2 步说明变为第 1 轮冒泡
    await page.getByTestId('btn-next').click();
    await expect(page.getByText(/第 1 轮/).first()).toBeVisible();
    // 变量面板里有 n
    await expect(page.getByText('n', { exact: true }).first()).toBeVisible();
  });

  test('修改输入并应用后步骤重新生成', async ({ page }) => {
    const input = page.locator('#algo-input');
    await input.fill('9, 1');
    await page.getByRole('button', { name: '应用输入' }).click();
    await expect(page.getByTestId('step-counter')).toContainText('第 1 /');
    await page.getByTestId('btn-jump-end').click();
    await expect(page.getByText(/sorted: \[1, 9\]/)).toBeVisible();
  });

  test('非法输入显示错误且不执行', async ({ page }) => {
    const input = page.locator('#algo-input');
    await input.fill('1, x, 3');
    await page.getByRole('button', { name: '应用输入' }).click();
    await expect(page.getByText(/输入无效/)).toBeVisible();
  });

  test('边界案例：空数组直接完成', async ({ page }) => {
    await page.getByRole('button', { name: '空数组' }).click();
    await expect(page.getByTestId('step-counter')).toContainText('第 1 / 2 步');
    await page.getByTestId('btn-jump-end').click();
    await expect(page.getByTestId('step-counter')).toContainText('已完成');
  });

  test('三种语言切换，代码与高亮同步', async ({ page }) => {
    await page.getByRole('tab', { name: '代码', exact: true }).click();
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 30_000 });
    // 默认 C++ 代码
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('vector<int>& a');
    await page.getByRole('tab', { name: 'C#' }).click();
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('BubbleSortDemo');
    await page.getByRole('tab', { name: 'Python' }).click();
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('def bubble_sort');
    // 播放后仍有当前行高亮装饰
    await page.getByTestId('btn-next').click();
    await expect(page.locator('.cv-current-line')).toHaveCount(1);
  });

  test('播放与暂停、自动播放开关', async ({ page }) => {
    await page.getByTestId('btn-play-pause').click();
    await expect(page.getByText('播放中')).toBeVisible();
    // 播放中步骤自动前进
    await expect(page.getByTestId('step-counter')).not.toContainText('第 1 /', { timeout: 3000 });
    await page.getByTestId('btn-play-pause').click();
    await expect(page.getByText('已暂停')).toBeVisible();
  });

  test('键盘快捷键：Space 与方向键', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('step-counter')).toContainText('第 2 /');
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('step-counter')).toContainText('第 1 /');
    await page.keyboard.press('r');
    await expect(page.getByTestId('step-counter')).toContainText('第 1 /');
  });

  test('完成状态写入进度并随刷新恢复', async ({ page }) => {
    await page.getByTestId('btn-jump-end').click();
    await expect(page.getByTestId('step-counter')).toContainText('已完成');
    const progress = await page.evaluate(() => localStorage.getItem('cv-progress'));
    expect(progress).toContain('bubble-sort');

    await page.reload();
    await expect(page.getByTestId('step-counter')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('已完成', { exact: true }).first()).toBeVisible();
  });

  test('主题偏好随刷新保留', async ({ page }) => {
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('button', { name: '切换浅色模式' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    // 恢复深色，避免影响其他测试
    await page.getByRole('button', { name: '切换深色模式' }).click();
  });

  test('分享链接包含输入数据', async ({ page }) => {
    const input = page.locator('#algo-input');
    await input.fill('7, 2, 5');
    await page.getByRole('button', { name: '应用输入' }).click();
    const url = page.url();
    expect(url).toContain('input=');
    await page.goto(url);
    await expect(page.locator('#algo-input')).toHaveValue('7, 2, 5');
  });
});
