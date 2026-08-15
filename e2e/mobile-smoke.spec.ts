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
    if ((page.viewportSize()?.width ?? 390) < 640) {
      await expect(page.getByText('更多', { exact: true })).toBeVisible();
    } else {
      await expect(page.getByTestId('btn-reset')).toBeVisible();
    }
  });

  test('移动端菜单导航可用', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '打开菜单' }).click();
    await expect(page.getByRole('link', { name: '算法可视化' })).toBeVisible();
    await page.getByRole('link', { name: '算法可视化' }).click();
    await expect(page).toHaveURL(/\/algorithms/);
  });

  test('书籍页移动目录展开与锚点滚动', async ({ page }) => {
    await page.goto('/algorithms');
    await expect(page.getByRole('heading', { name: '算法可视化' })).toBeVisible();
    // 移动目录 details 展开
    const details = page.locator('details summary').first();
    await expect(details).toBeVisible();
    await details.click();
    // 点击目录项滚动到章节
    await page.locator('details button').first().click();
    await page.waitForTimeout(800);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(100);
  });

  test('移动端路线图节点可点（最小缩放保证点击目标）', async ({ page }) => {
    await page.goto('/roadmap');
    await expect(page.getByText('学习路线图')).toBeVisible();
    // 找一个视口内的节点并点击
    const nodes = page.locator('a[href^="/algorithms/"]');
    const count = await nodes.count();
    const viewport = page.viewportSize() ?? { width: 390, height: 844 };
    let clicked = false;
    for (let i = 0; i < count && !clicked; i += 1) {
      const box = await nodes.nth(i).boundingBox();
      // 节点大部分在视口内即可（修复后最小缩放保证 152px 宽）
      if (
        box &&
        box.width >= 100 &&
        box.x > -100 &&
        box.x < viewport.width &&
        box.y > 60 &&
        box.y < viewport.height
      ) {
        await nodes.nth(i).click({ force: true });
        await page.waitForTimeout(700);
        clicked = page.url().includes('/algorithms/');
        break;
      }
    }
    expect(clicked, `节点均不可点（count=${count}）`).toBe(true);
  });

  test('移动端控制栏核心按钮全部可见', async ({ page }) => {
    await page.goto('/algorithms/bubble-sort');
    // 移动端默认在"动画"tab，Monaco 需先切换到"代码"tab 才渲染
    await page.getByRole('tab', { name: '代码' }).click();
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 60_000 });
    await page.getByRole('tab', { name: '动画' }).click();
    for (const id of ['btn-prev', 'btn-play-pause', 'btn-next']) {
      await expect(page.getByTestId(id)).toBeVisible();
    }
    if ((page.viewportSize()?.width ?? 390) < 640) {
      for (const id of ['btn-reset', 'btn-jump-start', 'btn-jump-end']) {
        await expect(page.getByTestId(id)).toBeHidden();
      }
      await page.getByText('更多', { exact: true }).click();
      await expect(page.getByRole('button', { name: '重新开始' })).toBeVisible();
    } else {
      for (const id of ['btn-reset', 'btn-jump-start', 'btn-jump-end']) {
        await expect(page.getByTestId(id)).toBeVisible();
      }
    }
    await page.getByTestId('btn-next').click();
    await expect(page.getByTestId('step-counter')).toContainText('第 2 /');
  });

  test('手机与平板核心页面无横向溢出', async ({ page }) => {
    for (const path of ['/', '/algorithms', '/learn/cpp', '/roadmap', '/algorithms/bubble-sort']) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.content,
        `${path} 横向内容宽度 ${dimensions.content}px 超出视口 ${dimensions.viewport}px`,
      ).toBeLessThanOrEqual(dimensions.viewport + 1);
    }
  });
});
