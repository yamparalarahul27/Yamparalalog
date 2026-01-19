import { test, expect } from '@playwright/test';

test.describe('Wiki Knowledge Base - Management & Media', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Admin
        await page.goto('/');
        await page.getByText('Yamparala Rahul').click();
        await page.locator('input[type="password"]').fill('1234');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Logged in as:')).toBeVisible({ timeout: 15000 });

        // Switch to Wiki Tab
        await page.getByRole('button', { name: 'WIKI' }).click();
        await expect(page.getByText('Wiki Pages')).toBeVisible();
    });

    test('Create a new wiki page', async ({ page }) => {
        const pageTitle = `Wiki Title ${Date.now()}`;

        // 1. Click New Page (Plus icon)
        await page.locator('button:has(svg.lucide-plus)').first().click();

        // 2. Initial page is created with "New Page" title - we need to edit it
        await expect(page.getByText('New Page')).toBeVisible();

        // Fill Edit Form
        await page.locator('input').filter({ hasText: '' }).nth(1).fill(pageTitle); // Title input
        await page.locator('textarea').fill('This is the content of our automated wiki page.');

        // 3. Save
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // 4. Verify in sidebar and content
        await expect(page.locator('aside >> text=' + pageTitle)).toBeVisible();
        await expect(page.locator('h1', { hasText: pageTitle })).toBeVisible();
    });

    test('Edit wiki content and add YouTube video', async ({ page }) => {
        // 1. Select a page
        const firstPage = page.locator('aside .cursor-pointer').first();
        await firstPage.click();

        // 2. Click Edit (Edit icon)
        await page.locator('button:has(svg.lucide-edit-2)').first().click();

        // 3. Add YouTube Video
        const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        await page.getByPlaceholder('Enter YouTube URL').fill(videoUrl);
        await page.getByRole('button', { name: 'Add Video' }).click();

        // 4. Save
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // 5. Verify Video iframe exists
        await expect(page.locator('iframe[title*="YouTube"]')).toBeVisible();
    });

    test('Wiki Commenting Flow', async ({ page }) => {
        // 1. Select a page
        await page.locator('aside .cursor-pointer').first().click();

        // 2. Add Comment
        const commentMsg = `Wiki Comment ${Date.now()}`;
        await page.getByPlaceholder('Add a comment...').fill(commentMsg);
        await page.getByRole('button', { name: 'Send' }).click();

        // 3. Verify
        await expect(page.getByText(commentMsg)).toBeVisible();
    });

    test('Delete a wiki page (Admin Only)', async ({ page }) => {
        // 1. Select first page
        const firstPage = page.locator('aside .cursor-pointer').first();
        const pageTitle = await firstPage.locator('h3').innerText();
        await firstPage.click();

        // 2. Click Delete (Trash icon)
        await page.locator('button:has(svg.lucide-trash-2)').click();

        // 3. Verify gone from sidebar
        await expect(page.locator('aside >> text=' + pageTitle)).not.toBeVisible();
    });
});
