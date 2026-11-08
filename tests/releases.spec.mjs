import { test, expect, openPage } from './support/site.mjs';

// The release list comes from the CDN, so tests answer it with a fixed list instead.
const cdn = 'https://cdn.myfi.ws/apps/task-proxy';
const file = (platform, version, name) => ({ name, file: `${cdn}/${platform}/${version}/${encodeURIComponent(name)}`, version });
const releases = {
    versions: { '1.2.10': 'release-1.2.10.md' },
    win: [
        file('win', '1.2.9', 'Task Proxy_1.2.9_x64_en-US.msi'),
        file('win', '1.2.10', 'Task Proxy_1.2.10_x64_en-US.msi'),
        file('win', '1.2.10', 'Task Proxy_1.2.10_x64-setup.exe'),
    ],
    mac: [file('mac', '1.2.10', 'Task Proxy_1.2.10_aarch64.dmg')],
    ubu: [
        file('ubu', '1.1.0', 'task-proxy_1.1.0_amd64.deb'),
        file('ubu', '1.2.10', 'task-proxy_1.2.10_amd64.deb'),
        file('ubu', '1.2.10', 'task-proxy_1.2.10_amd64.AppImage'),
    ],
};

async function serveReleases(page, list = releases) {
    await page.route(`${cdn}/apps.json`, route => list ? route.fulfill({ json: list, headers: { 'access-control-allow-origin': '*' } }) : route.abort());
    await page.route(`${cdn}/release-*.md`, route => route.fulfill({ body: '# Notes for this release', contentType: 'text/markdown', headers: { 'access-control-allow-origin': '*' } }));
}
// The Windows, Mac, and Linux panels, in that order, of the tabs that follow the component's title.
const panel = (page, index) => page.locator('h2:is(:text("Latest Release"), :text("Task Proxy Desktop Releases")) + webui-tabs > [slot="content"]').nth(index);
const links = async locator => locator.locator('a').evaluateAll(anchors => anchors.map(a => [a.textContent.trim(), a.href]));

test.describe('app-latest', () => {
    test('shows the newest version, comparing versions as numbers', async ({ page }) => {
        await serveReleases(page);
        await openPage(page, '/');
        await expect(page.locator('h2', { hasText: 'Latest Release' })).toHaveText('Latest Release (Version 1.2.10)');
    });

    test('lists the newest files for each platform under a readable name', async ({ page }) => {
        await serveReleases(page);
        await openPage(page, '/');
        await expect(panel(page, 0).locator('a')).toHaveCount(2);
        expect(await links(panel(page, 0))).toEqual([
            ['Windows x64 MSI Installer', releases.win[1].file],
            ['Windows x64 EXE Installer', releases.win[2].file],
        ]);
        expect(await links(panel(page, 1))).toEqual([['Mac DMG', releases.mac[0].file]]);
        expect(await links(panel(page, 2))).toEqual([
            ['Linux amd64 DEB', releases.ubu[1].file],
            ['Linux amd64 AppImage', releases.ubu[2].file],
        ]);
    });

    test('shows the release notes for the newest version', async ({ page }) => {
        await serveReleases(page);
        await openPage(page, '/');
        await expect(page.locator(`webui-content[src="${cdn}/release-1.2.10.md"]`)).toHaveCount(1);
    });

    test('a platform with no releases says so', async ({ page }) => {
        await serveReleases(page, { ...releases, mac: [] });
        await openPage(page, '/');
        await expect(panel(page, 1)).toHaveText('There are currently no releases available for Mac.');
        await expect(panel(page, 0).locator('a')).toHaveCount(2);
    });

    test('when the release list cannot load, each platform says so', async ({ page }) => {
        await serveReleases(page, null);
        await openPage(page, '/');
        await expect(panel(page, 0)).toHaveText('Failed to load Windows release data.');
        await expect(panel(page, 1)).toHaveText('Failed to load Mac release data.');
        await expect(panel(page, 2)).toHaveText('Failed to load Linux release data.');
    });

    test('markup in a file name is shown as text', async ({ page }) => {
        test.fail(true, 'Known bug: file names from apps.json are inserted as HTML');
        await serveReleases(page, { ...releases, win: [file('win', '1.2.10', '<img src=x onerror="window.__xss=1">')] });
        await openPage(page, '/');
        await expect(panel(page, 0).locator('img')).toHaveCount(0);
    });
});

test.describe('app-all-versions', () => {
    // The version tabs inside a platform's panel.
    const versionTabs = (page, index) => panel(page, index).locator('webui-tabs webui-button[slot="tabs"]');
    const versionPanels = (page, index) => panel(page, index).locator('webui-tabs > [slot="content"]');

    test('lists every version for each platform, newest first', async ({ page }) => {
        await serveReleases(page);
        await openPage(page, '/versions');
        await expect(versionTabs(page, 0)).toHaveText(['1.2.10', '1.2.9']);
        await expect(versionTabs(page, 1)).toHaveText(['1.2.10']);
        await expect(versionTabs(page, 2)).toHaveText(['1.2.10', '1.1.0']);
    });

    test('each version lists its own files under a readable name', async ({ page }) => {
        await serveReleases(page);
        await openPage(page, '/versions');
        await expect(versionPanels(page, 0)).toHaveCount(2);
        expect(await links(versionPanels(page, 0).nth(0))).toEqual([
            ['Windows x64 MSI Installer', releases.win[1].file],
            ['Windows x64 EXE Installer', releases.win[2].file],
        ]);
        expect(await links(versionPanels(page, 0).nth(1))).toEqual([['Windows x64 MSI Installer', releases.win[0].file]]);
        expect(await links(versionPanels(page, 2).nth(1))).toEqual([['Linux amd64 DEB', releases.ubu[0].file]]);
    });

    test('a version with release notes shows them, and one without does not', async ({ page }) => {
        await serveReleases(page);
        await openPage(page, '/versions');
        await expect(versionPanels(page, 0).nth(0).locator(`webui-content[src="${cdn}/release-1.2.10.md"]`)).toHaveCount(1);
        await expect(versionPanels(page, 0).nth(1).locator('webui-content')).toHaveCount(0);
    });

    test('when the release list cannot load, it says so', async ({ page }) => {
        test.fail(true, 'Known bug: app-all-versions has no error handling, so it shows "Loading" forever');
        await serveReleases(page, null);
        await openPage(page, '/versions');
        await expect(panel(page, 0)).toContainText('Failed', { timeout: 3000 });
    });
});
