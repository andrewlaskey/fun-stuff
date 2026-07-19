import { test, expect } from '@playwright/test';

test.describe('mellings main menu', () => {
  // Webcam + ml5 model setup can take a while, especially on machines
  // without hardware GPU acceleration available to the browser.
  test.setTimeout(60 * 1000);

  test('shows the three main menu options on load', async ({ page }) => {
    await page.goto('experiments/mellings/index.html');

    await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Level Editor' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Options' })).toBeVisible();
  });

  test('Start Game launches gameplay and Back to Menu returns', async ({ page }) => {
    await page.goto('experiments/mellings/index.html');

    await page.getByRole('button', { name: 'Start Game' }).click();
    await expect(page.locator('.pixi-container canvas')).toBeVisible();
    await expect(page.getByText('Level:')).toBeVisible();

    await page.getByRole('button', { name: '← Back to Menu' }).click();
    await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible();
  });

  test('Options shows a hand-tracking readout and a camera toggle, then returns', async ({ page }) => {
    await page.goto('experiments/mellings/index.html');

    await page.getByRole('button', { name: 'Options' }).click();
    await expect(page.getByText('Left hand:')).toBeVisible();
    await expect(page.getByText('Right hand:')).toBeVisible();

    const toggle = page.getByRole('button', { name: /Camera Feed/ });
    await expect(toggle).toHaveText('Hide Camera Feed');
    await toggle.click();
    await expect(toggle).toHaveText('Show Camera Feed');

    await page.getByRole('button', { name: '← Back to Menu' }).click();
    await expect(page.getByRole('button', { name: 'Options' })).toBeVisible();
  });

  test('Level Editor shows a placeholder and returns to the menu', async ({ page }) => {
    await page.goto('experiments/mellings/index.html');

    await page.getByRole('button', { name: 'Level Editor' }).click();
    await expect(page.getByRole('heading', { name: 'Level Editor' })).toBeVisible();
    await expect(page.getByText('Coming soon.')).toBeVisible();

    await page.getByRole('button', { name: '← Back to Menu' }).click();
    await expect(page.getByRole('button', { name: 'Level Editor' })).toBeVisible();
  });
});
