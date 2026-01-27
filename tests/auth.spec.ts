import { test, expect } from '@playwright/test';

test.describe('Authentication & PIN Flow', () => {

    test('Successful Login with Admin PIN', async ({ page }) => {
        await page.goto('/');

        // Open Login Overlay
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // Select Admin User - using filter to avoid background matches
        await page.getByRole('button').filter({ hasText: 'Yamparala Rahul' }).click();

        // Enter correct PIN
        const pinInput = page.locator('input[type="password"]');
        await pinInput.fill('1234');

        // Login
        await page.getByRole('button', { name: 'Log In' }).click();

        // Verify landing on Dashboard
        await expect(page.getByText('Welcome')).toBeVisible({ timeout: 15000 });
        // LOGS tab is gone in current UI feedback implementation
    });

    test('Failed Login with Wrong PIN', async ({ page }) => {
        await page.goto('/');

        // Open Login Overlay
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        await page.getByRole('button').filter({ hasText: 'Yamparala Rahul' }).click();

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
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await page.getByText('Yamparala Rahul').click();
        await page.locator('input[type="password"]').fill('1234');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Welcome')).toBeVisible({ timeout: 15000 });

        // 2. Perform Logout via Options Menu (which is now called "Login" when logged in too)
        await page.getByRole('button', { name: 'Login' }).click();
        await page.getByRole('menuitem', { name: 'Logout' }).click();

        // 3. Verify back at Guest state (Welcome shown, Login button visible)
        await expect(page.getByText('Yamparala Dev App')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    });

    test('Design Team Grouping Expansion', async ({ page }) => {
        await page.goto('/');

        // Open Login Overlay
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // Design Team should be a button
        const teamBtn = page.getByRole('button').filter({ hasText: 'Design Team Users' });
        await expect(teamBtn).toBeVisible({ timeout: 15000 });

        // Click to expand
        await teamBtn.click();

        // Individual users should appear
        await expect(page.getByRole('button').filter({ hasText: 'Praveen' })).toBeVisible();
        await expect(page.getByRole('button').filter({ hasText: 'Shaina Mishra' })).toBeVisible();

        // Select one
        await page.getByRole('button').filter({ hasText: 'Praveen' }).click();
        await expect(page.getByText(/PIN/i)).toBeVisible();
    });

    test('PIN Change and Persistence', async ({ page }) => {
        // 1. Login
        await page.goto('/');
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await page.getByText('Yamparala Rahul').click();
        await page.locator('input[type="password"]').fill('1234');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Welcome')).toBeVisible({ timeout: 15000 });

        // 2. Open Settings and Change PIN to 4321
        await page.getByRole('button', { name: 'Login' }).click();
        await page.getByRole('menuitem', { name: 'Settings' }).click();

        await page.locator('input#current-pin').fill('1234');
        await page.locator('input#new-pin').fill('4321');
        await page.locator('input#confirm-pin').fill('4321');
        await page.getByRole('button', { name: 'Update PIN' }).click();
        await expect(page.getByText('Change PIN')).not.toBeVisible();

        // 3. Logout
        await page.getByRole('button', { name: 'Login' }).click();
        await page.getByRole('menuitem', { name: 'Logout' }).click();

        // 4. Try Login with NEW PIN (4321)
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await page.getByRole('button').filter({ hasText: 'Yamparala Rahul' }).click();
        await page.locator('input[type="password"]').fill('4321');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Welcome')).toBeVisible({ timeout: 15000 });

        // 5. RESTORE ORIGINAL PIN (1234)
        await page.getByRole('button', { name: 'Login' }).click();
        await page.getByRole('menuitem', { name: 'Settings' }).click();
        await page.locator('input#current-pin').fill('4321');
        await page.locator('input#new-pin').fill('1234');
        await page.locator('input#confirm-pin').fill('1234');
        await page.getByRole('button', { name: 'Update PIN' }).click();
        await expect(page.getByText('Change PIN')).not.toBeVisible();
    });
});
