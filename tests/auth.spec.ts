import { test, expect } from '@playwright/test';

test.describe('Authentication & PIN Flow', () => {

    test('Successful Login with Admin PIN', async ({ page }) => {
        await page.goto('/');

        // Select Admin User
        await page.getByText('Yamparala Rahul').click();

        // Enter correct PIN
        const pinInput = page.locator('input[type="password"]');
        await pinInput.fill('1234');

        // Login
        await page.getByRole('button', { name: 'Log In' }).click();

        // Verify landing on Dashboard
        await expect(page.getByText('Logged in as:')).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('button', { name: 'LOGS' })).toBeVisible();
    });

    test('Failed Login with Wrong PIN', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Yamparala Rahul').click();

        const pinInput = page.locator('input[type="password"]');
        await pinInput.fill('0000'); // Wrong PIN

        await page.getByRole('button', { name: 'Log In' }).click();

        // Verify Error Message
        await expect(page.getByText('Invalid PIN')).toBeVisible();

        // Verify still on login screen
        await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
    });

    test('Logout and State Clearing', async ({ page }) => {
        // 1. Login
        await page.goto('/');
        await page.getByText('Yamparala Rahul').click();
        await page.locator('input[type="password"]').fill('1234');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Logged in as:')).toBeVisible({ timeout: 15000 });

        // 2. Perform Logout via Options Menu
        await page.getByRole('button', { name: /Options/i }).click();
        await page.getByRole('menuitem', { name: 'Logout' }).click();

        // 3. Verify back at login screen
        await expect(page.getByText('Yamparala Dev App')).toBeVisible();
        await expect(page.getByText('Please log in to continue')).toBeVisible();
    });

    test('Design Team Grouping Expansion', async ({ page }) => {
        await page.goto('/');

        // Design Team should be a button
        const teamBtn = page.getByText('Design Team Users');
        await expect(teamBtn).toBeVisible({ timeout: 15000 });

        // Click to expand
        await teamBtn.click();

        // Individual users should appear
        await expect(page.getByText('Praveen', { exact: true })).toBeVisible();
        await expect(page.getByText('Shaina Mishra', { exact: true })).toBeVisible();

        // Select one
        await page.getByText('Praveen', { exact: true }).click();
        await expect(page.getByText(/PIN/i)).toBeVisible();
    });

    test('PIN Change and Persistence', async ({ page }) => {
        // 1. Login
        await page.goto('/');
        await page.getByText('Yamparala Rahul').click();
        await page.locator('input[type="password"]').fill('1234');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Logged in as:')).toBeVisible({ timeout: 15000 });

        // 2. Open Settings and Change PIN to 4321
        await page.getByRole('button', { name: /Options/i }).click();
        await page.getByRole('menuitem', { name: 'Settings' }).click();

        await page.locator('input#current-pin').fill('1234');
        await page.locator('input#new-pin').fill('4321');
        await page.locator('input#confirm-pin').fill('4321');
        await page.getByRole('button', { name: 'Update PIN' }).click();
        await expect(page.getByText('Change PIN')).not.toBeVisible();

        // 3. Logout
        await page.getByRole('button', { name: /Options/i }).click();
        await page.getByRole('menuitem', { name: 'Logout' }).click();

        // 4. Try Login with NEW PIN (4321)
        await page.getByText('Yamparala Rahul').click();
        await page.locator('input[type="password"]').fill('4321');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Logged in as:')).toBeVisible({ timeout: 15000 });

        // 5. RESTORE ORIGINAL PIN (1234)
        await page.getByRole('button', { name: /Options/i }).click();
        await page.getByRole('menuitem', { name: 'Settings' }).click();
        await page.locator('input#current-pin').fill('4321');
        await page.locator('input#new-pin').fill('1234');
        await page.locator('input#confirm-pin').fill('1234');
        await page.getByRole('button', { name: 'Update PIN' }).click();
        await expect(page.getByText('Change PIN')).not.toBeVisible();
    });
});
