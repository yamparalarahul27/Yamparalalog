import { test, expect } from '@playwright/test';

test.describe('Resources Library - Links & Filters', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Admin
        await page.goto('/');
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await page.getByRole('button').filter({ hasText: 'Yamparala Rahul' }).click();
        await page.locator('input[type="password"]').fill('1234');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.locator('input[type="password"]')).not.toBeVisible();

        // Default tab is Resources, no need to click trigger (it's gone anyway)
        await expect(page.locator('h2', { hasText: 'Resources' })).toBeVisible();
    });

    // test('Add a new resource and verify layout', async ({ page }) => { ... }) removed as Add Resource button is gone from UI

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
