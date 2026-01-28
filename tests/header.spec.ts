import { test, expect } from '@playwright/test';

test.describe('Header & UI Verification', () => {
    test.beforeEach(async ({ page }) => {
        // Standard Login as Admin for Header tests
        await page.goto('/');
        await page.getByRole('button', { name: 'Login', exact: true }).click();
        await page.getByRole('button').filter({ hasText: 'Yamparala Rahul' }).click();
        await page.locator('input[type="password"]').fill('1234');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.locator('input[type="password"]')).not.toBeVisible();
    });

    test('Support Developer button styling and dialog', async ({ page }) => {
        const supportBtn = page.getByRole('button', { name: '₹ Support Developer' });

        // Check classes for rounded-full and white background
        await expect(supportBtn).toBeVisible();
        const className = await supportBtn.getAttribute('class') || '';
        expect(className).toContain('rounded-full');
        expect(className).toContain('bg-white');

        // Check for pulsing indigo dot
        const pulseDot = supportBtn.locator('div.animate-pulse');
        await expect(pulseDot).toBeVisible();
        expect(await pulseDot.getAttribute('class')).toContain('bg-indigo-500');

        // Click to open UPI Dialog
        await supportBtn.click();
        await expect(page.getByText('Support Developer via UPI')).toBeVisible();
        await expect(page.getByText('Yamparala Rahul')).toBeVisible();
        await expect(page.getByText('8897132717@pthdfc')).toBeVisible();

        // Close dialog
        await page.keyboard.press('Escape');
    });

    /*
        test('Login dropdown menu content and stability', async ({ page }) => {
            const loginTrigger = page.getByRole('button', { name: 'Login', exact: false }).filter({ has: page.locator('svg.lucide-chevron-down') });
            await expect(loginTrigger).toBeVisible();
    
            // Click to open
            await loginTrigger.click();
    
            // Verify Menu Items
            await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
            await expect(page.getByRole('menuitem', { name: 'Admin Panel' })).toBeVisible();
            await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
    
            // Verify Settings button opens dialog
            await page.getByRole('menuitem', { name: 'Settings' }).click();
            await expect(page.getByText('Change PIN')).toBeVisible();
        });
    */

    // Navbar tab switching tests removed as TabsList is gone

    test('Responsive Header UI (Mobile View)', async ({ page }) => {
        // Set viewport to a small mobile size
        await page.setViewportSize({ width: 375, height: 667 });

        // In mobile, Support button might be hidden or icon-only
        const loginBtn = page.getByRole('button', { name: 'Login' });
        await expect(loginBtn).toBeVisible();

        // Logo should be visible
        await expect(page.locator('img[alt="App Logo"]')).toBeVisible();
    });
});
