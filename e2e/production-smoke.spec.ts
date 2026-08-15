import { expect, test } from '@playwright/test';

const deployedUrl = process.env.PRODUCTION_SMOKE_URL;

test.describe('deployed GitHub Pages smoke', () => {
  test.skip(!deployedUrl, 'Runs only after a GitHub Pages deployment.');

  test('app shell and Python worker run from the production base path', async ({ page }) => {
    const root = deployedUrl!.replace(/\/$/, '');
    await page.goto(`${root}/lab`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/运行时就绪|Runtime ready/)).toBeVisible({ timeout: 90_000 });
    await page.getByRole('button', { name: /^运行$|^Run$/ }).click();
    await expect(page.getByText(/Hello, CodeVision Lab|你好，CodeVision Lab/)).toBeVisible({ timeout: 15_000 });
  });
});
