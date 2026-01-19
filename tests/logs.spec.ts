import { test, expect } from '@playwright/test';

test.describe('Design Logs - CRUD & Features', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Admin
        await page.goto('/');
        await page.getByText('Yamparala Rahul').click();
        await page.locator('input[type="password"]').fill('1234');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Logged in as:')).toBeVisible({ timeout: 15000 });
    });

    test('Create a new design log', async ({ page }) => {
        const logTitle = `Automated Log ${Date.now()}`;

        // 1. Open Add Log Dialog
        await page.getByRole('button', { name: /Add Log/i }).click();
        await expect(page.getByText('Add New Design Log')).toBeVisible();

        // 2. Fill form
        await page.locator('input#title').fill(logTitle);
        await page.locator('input#category').fill('UI Design');
        await page.locator('textarea#description').fill('This is a test log created by Playwright.');

        // 3. Save
        await page.getByRole('button', { name: /Add Log/i }).click();

        // 4. Verify card appears
        await expect(page.getByText(logTitle)).toBeVisible();
        await expect(page.getByText('UI Design')).toBeVisible();
    });

    test('Edit an existing design log', async ({ page }) => {
        const updatedTitle = `Revised Title ${Date.now()}`;

        // Find first log's edit button (Pencil icon)
        const firstLog = page.locator('.grid > div').first();
        await firstLog.locator('button:has(svg.lucide-pencil)').click();

        // Update title
        await page.locator('input#title').fill(updatedTitle);
        await page.getByRole('button', { name: 'Update Log' }).click();

        // Verify change
        await expect(page.getByText(updatedTitle)).toBeVisible();
    });

    test('Soft Delete (Move to Trash) and Restore', async ({ page }) => {
        // 1. Get initial trash count
        const trashBtn = page.getByRole('button', { name: /Trash \(\d+\)/ });
        const initialText = await trashBtn.innerText();
        const initialCount = parseInt(initialText.match(/\d+/)?.[0] || '0');

        // 2. Delete first log (Trash2 icon)
        const firstLog = page.locator('.grid > div').first();
        const logTitle = await firstLog.locator('h3').innerText();
        await firstLog.locator('button:has(svg.lucide-trash-2)').click();

        // 3. Verify trash count increased
        await expect(trashBtn).toHaveText(new RegExp(`Trash \\(${initialCount + 1}\\)`));

        // 4. Open Trash and Restore
        await trashBtn.click();
        await expect(page.getByText('Trash / Recycle Bin')).toBeVisible();

        const trashedLog = page.getByRole('dialog').getByText(logTitle);
        await expect(trashedLog).toBeVisible();

        // Click Restore button on the trashed log
        await page.getByRole('button', { name: 'Restore' }).first().click();

        // 5. Verify it's back in main list
        await page.keyboard.press('Escape'); // Close Trash dialog if not auto-closed
        await expect(page.getByText(logTitle)).toBeVisible();
    });

    test('Admin Comment Flow', async ({ page }) => {
        // 1. Switch to another user's logs
        await page.getByRole('button', { name: 'Praveen' }).click();

        // 2. Find a log and add comment
        const firstLog = page.locator('.grid > div').first();
        await expect(firstLog).toBeVisible();

        const commentText = `Admin Note: Checked this at ${new Date().toLocaleTimeString()}`;
        await firstLog.getByPlaceholder('Add a comment...').fill(commentText);
        await firstLog.locator('button:has(svg.lucide-send)').click();

        // 3. Verify comment appears
        await expect(page.getByText(commentText)).toBeVisible();
        await expect(page.getByText('Yamparala Rahul')).toBeVisible(); // Admin author name
    });
});
