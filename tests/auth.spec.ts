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

        // Verify landing - Login modal closed
        await expect(page.locator('input[type="password"]')).not.toBeVisible();
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

    /*
        test('Logout and State Clearing', async ({ page }) => {
            // ... Logout feature removed from streamlined UI ...
        });
    
        test('Design Team Grouping Expansion', async ({ page }) => {
            // ... Design Team grouping removed from streamlined UI ...
        });
    
        test('PIN Change and Persistence', async ({ page }) => {
            // ... Settings/PIN change feature removed from streamlined UI ...
        });
    */
});
