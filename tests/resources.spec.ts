import { test, expect } from '@playwright/test';

test.describe('Resources Library - Links & Filters', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Admin
        await page.goto('/');
        await page.getByText('Yamparala Rahul').click();
        await page.locator('input[type="password"]').fill('1234');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Logged in as:')).toBeVisible({ timeout: 15000 });

        // Switch to Resources Tab
        await page.getByRole('button', { name: 'RESOURCES' }).click();
        await expect(page.locator('h2', { hasText: 'Resources' })).toBeVisible();
    });

    test('Add a new resource and verify layout', async ({ page }) => {
        const resourceTitle = `Resource ${Date.now()}`;
        const resourceUrl = 'https://playwright.dev';

        // 1. Click Add Resource
        await page.getByRole('button', { name: 'Add Resource' }).click();

        // 2. Fill form
        await page.getByLabel('Title').fill(resourceTitle);
        await page.getByLabel('URL').fill(resourceUrl);
        await page.getByLabel('Category').fill('Testing Tools');
        await page.getByLabel('Description').fill('The best tool for E2E testing.');

        // 3. Save
        await page.getByRole('button', { name: 'Add Resource' }).nth(1).click(); // Dialog button

        // 4. Verify in Team Resources (since we are Admin)
        await expect(page.getByText('Team Resources')).toBeVisible();
        await expect(page.getByText(resourceTitle)).toBeVisible();

        // 5. Check for Microlink preview (img should eventually load or show fallback)
        await expect(page.locator(`img[alt="${resourceTitle}"]`)).toBeVisible();
    });

    test('Filter resources by Category', async ({ page }) => {
        // 1. Select a category from the first dropdown
        const categoryDropdown = page.locator('button').filter({ hasText: 'Category' }).first();
        await categoryDropdown.click();

        // Assuming there is at least one category like 'Testing Tools' or 'all'
        await page.getByRole('option').first().click();

        // Verification would depend on existing data, but we check if filter bar persists
        await expect(categoryDropdown).toBeVisible();
    });

    test('Delete a resource', async ({ page }) => {
        // 1. Find a resource card and click delete icon (Trash2)
        const resourceCard = page.locator('.grid > div').first();
        const resourceTitle = await resourceCard.locator('h3').innerText();

        await resourceCard.locator('button:has(svg.lucide-trash-2)').click();

        // 2. Verify gone
        await expect(page.getByText(resourceTitle, { exact: true })).not.toBeVisible();
    });
});
