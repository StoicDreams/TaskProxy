import { test, expect, openPage } from './support/site.mjs';

// The header's Account panel (webui-myfi-info in index.html), which is how a signed-in user finds Remote Connections.
test('signed in, the Account panel links to Remote Connections, which opens as its own page', async ({ page }) => {
    await openPage(page, '/');
    await page.evaluate(() => webui.setData('session-user-role', 1));
    await page.locator('header webui-myfi-info').click();
    const link = page.locator('webui-drawer.shared webui-link', { hasText: 'Connect to Your Computers' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/remote/');
    // /remote/ is outside the site's pages, so it replaces the site rather than opening as one of its pages.
    await expect(link).toHaveAttribute('target', '_top');
    await expect(page.locator('webui-drawer.shared')).not.toContainText('Example Account Panel');
});
