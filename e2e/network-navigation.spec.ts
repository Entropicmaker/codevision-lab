import { expect, test } from '@playwright/test';

test.describe('LingeoCS 系列站点导航', () => {
  test('从 CodeVision 可返回博客主站', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      await page.locator('button[aria-controls="mobile-navigation"]').click();
    } else {
      await page.getByRole('button', { name: /LingeoCS/ }).click();
    }

    const homeLink = page.getByRole('link', { name: /选择性失忆/ });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', 'https://lingeocs.com/');
    await expect(homeLink).toContainText(/选择性失忆/);
    await expect(homeLink).toContainText(/返回主站|Back home/);

    await expect(page.getByText(/CodeVision Lab/, { exact: true }).last()).toBeVisible();
    await expect(page.getByText(/当前|Current/, { exact: true }).last()).toBeVisible();
  });
});
