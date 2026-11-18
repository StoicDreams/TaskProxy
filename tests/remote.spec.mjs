import { test, expect, appFrame, webrtcChromium } from './support/remote.mjs';

// Task Proxy Remote (webapp/root_files/remote/): signing in, pairing from a desktop's QR code, connecting, and
// running the desktop's app in a frame through the service worker. The desktop is the test desktop in
// fixtures/remote/desktop.js, and the app it serves is fixtures/remote/app.
test.use({
    serviceWorkers: 'allow',
    // Two pages in one browser connect over this computer's own addresses, which browsers hide without these.
    launchOptions: {
        executablePath: webrtcChromium(),
        args: ['--allow-loopback-in-peer-connection', '--disable-features=WebRtcHideLocalIpsWithMdns'],
    },
});

const message = page => page.locator('#message');
const signedIn = api => { api.signedIn = true; };

/** Opens the desktop's QR code link on the device, as scanning it does. */
async function scan(page, desktop, site, options = {}) {
    const link = await desktop.evaluate(options => window.desktop.openInvite(options), options);
    await page.goto(`${site.origin}${link}`);
}

/** Pairs the device and waits for the app to open in the frame. */
async function pairAndOpen(page, desktop, site, api, options) {
    signedIn(api);
    await scan(page, desktop, site, options);
    await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
}

test('signed out, the page keeps the pairing code through signing in, then pairs', async ({ page, site, api, desktop }) => {
    await scan(page, desktop, site);
    await expect(message(page)).toHaveText('Sign in to use Task Proxy from this device.');
    const signIn = page.getByRole('link', { name: 'Sign In' });
    const target = new URL(await signIn.getAttribute('href'));
    expect(`${target.origin}${target.pathname}`).toBe('https://www.stoicdreams.com/signin');
    expect(target.searchParams.get('domain')).toBe('localhost');
    expect(target.searchParams.get('return')).toBe('/remote/');
    // The code is off the address, so it isn't bookmarked or shared.
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('');
    // stoicdreams.com sends the browser back with a sign-in code.
    await page.goto(`${site.origin}/remote/#myfi-signin=good-code`);
    await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
    expect(api.calls.filter(call => call.path === 'user/signin/code')).toEqual([{ path: 'user/signin/code', body: { code: 'good-code' } }]);
    await expect.poll(() => desktop.evaluate(() => window.desktop.devices.map(device => [device.name, device.level]))).toEqual([['Phone', 'work']]);
});

test('on a phone, the signed-out page shows its message and Sign In, with nothing hidden over them', async ({ page, site, api }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${site.origin}/remote/`);
    await expect(message(page)).toHaveText('Sign in to use Task Proxy from this device.');
    await expect(page.getByRole('heading', { name: 'Task Proxy Remote' })).toBeInViewport({ ratio: 1 });
    // The app's frame and the desktop list stay hidden until they are used, whatever Web UI's stylesheet says.
    await expect(page.locator('#app')).toBeHidden();
    await expect(page.locator('#desktops-section')).toBeHidden();
    // A trial click checks that Sign In is the element a tap there reaches, without leaving the page.
    await page.getByRole('link', { name: 'Sign In' }).click({ trial: true });
});

test('the app runs in the frame from the desktop, and never from the website', async ({ page, site, api, desktop }) => {
    await pairAndOpen(page, desktop, site, api, { level: 'view' });
    const app = appFrame(page);
    // The frame's address is the app's own route, so the app's paths work as they do on the desktop.
    await expect(app.locator('#route')).toHaveText('/');
    await expect(app.locator('#remote')).toHaveText(JSON.stringify({ level: 'view', deviceName: 'Phone', desktopName: 'Test Desktop' }));
    // A command the desktop refuses rejects with its reason, as Tauri's invoke does.
    await expect(app.locator('#refused')).toHaveText('Only the desktop can do that.');
    // The app's worker starts from the desktop's script.
    await expect(app.locator('#worker')).toHaveText('42');
    // Events reach the app's listeners.
    await desktop.evaluate(() => window.desktop.emit('run-changed', { name: 'deploy.ps1' }));
    await expect(app.locator('#events li')).toHaveText(['run-changed: deploy.ps1']);
    // Moving to another page loads its markdown from the desktop.
    await app.locator('#second').click();
    await expect(app.locator('#route')).toHaveText('/second');
    await expect(app.locator('#page')).toHaveText('The second page, from the desktop.');
    // None of the app's files were asked of the website.
    const appPaths = ['/app.min.js', '/css/app.min.css', '/worker.min.js', '/d/second.md', '/second', '/remote/app/'];
    expect(site.requests.filter(path => appPaths.includes(path) || path.startsWith('/remote/app/'))).toEqual([]);
    await expect.poll(() => desktop.evaluate(() => window.desktop.log)).toEqual(expect.arrayContaining(['remote_app_file', 'get_projects', 'desktop_only_command']));
    // The app's own service worker isn't registered: only the remote page's.
    await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map(registration => new URL(registration.scope).pathname))).toEqual(['/remote/app/']);
});

test('reloading the page connects again, and opens the app where it was', async ({ page, site, api, desktop }) => {
    await pairAndOpen(page, desktop, site, api);
    await appFrame(page).locator('#second').click();
    await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
    await page.reload();
    await expect(appFrame(page).locator('#route')).toHaveText('/second');
    await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
    await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
});

test('reloading the frame alone opens the app again rather than the website', async ({ page, site, api, desktop }) => {
    await pairAndOpen(page, desktop, site, api);
    await appFrame(page).locator('#second').click();
    await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
    await page.locator('#app').evaluate(frame => frame.contentWindow.location.reload());
    await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
    await expect(appFrame(page).locator('#website')).toHaveCount(0);
});

test('when the desktop ends the connection, the page says so and can connect again', async ({ page, site, api, desktop }) => {
    await pairAndOpen(page, desktop, site, api);
    await desktop.evaluate(() => window.desktop.dropAll());
    await expect(page.locator('#app')).toBeHidden();
    await expect(message(page)).toHaveText(/closed the connection|was lost/);
    await page.getByRole('button', { name: 'Connect Again' }).click();
    await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
});

test('Disconnect closes the app and lists the desktops, where Connect opens it again', async ({ page, site, api, desktop }) => {
    await pairAndOpen(page, desktop, site, api);
    await page.getByRole('button', { name: 'Disconnect' }).click();
    await expect(page.locator('#app')).toBeHidden();
    await expect(message(page)).toHaveText('Disconnected.');
    await page.getByRole('button', { name: 'Your Desktops' }).click();
    const item = page.locator('#desktops li', { hasText: 'Test Desktop' });
    await expect(item).toContainText('Online');
    await item.getByRole('button', { name: 'Connect' }).click();
    await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
});

test('the desktop list shows this account\'s desktops, and Connect only for those paired here', async ({ page, site, api, desktop }) => {
    signedIn(api);
    api.desktops.push({ desktopId: '11111111-1111-1111-1111-111111111111', name: 'Laptop', account: api.account, online: false });
    api.desktops.push({ desktopId: '22222222-2222-2222-2222-222222222222', name: 'Someone Else', account: 2, online: true });
    await page.goto(`${site.origin}/remote/`);
    await expect(page.locator('#desktops li .name')).toHaveText(['Test Desktop', 'Laptop']);
    await expect(page.locator('#desktops li', { hasText: 'Laptop' })).toContainText('Offline · not paired with this device');
    await expect(page.getByRole('button', { name: 'Connect' })).toHaveCount(0);
    // Pairing adds Connect, and Forget takes it away again.
    await scan(page, desktop, site);
    await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
    await page.getByRole('button', { name: 'Disconnect' }).click();
    await page.getByRole('button', { name: 'Your Desktops' }).click();
    const paired = page.locator('#desktops li', { hasText: 'Test Desktop' });
    await expect(paired.getByRole('button', { name: 'Connect' })).toBeVisible();
    await paired.getByRole('button', { name: 'Forget' }).click();
    await expect(page.locator('#desktops li', { hasText: 'Test Desktop' })).toContainText('not paired with this device');
    await expect(page.getByRole('button', { name: 'Connect' })).toHaveCount(0);
});

test('a code that has expired says so, and pairs nothing', async ({ page, site, api, desktop }) => {
    signedIn(api);
    await scan(page, desktop, site, { expires: Date.now() - 1000 });
    await expect(message(page)).toHaveText('This pairing code has expired. Show a new QR code on the desktop.');
    expect(api.calls.filter(call => call.path === 'remote/message/send')).toEqual([]);
    await expect(page.locator('#desktops li', { hasText: 'Test Desktop' })).toContainText('not paired with this device');
});

test('a desktop on another account says so', async ({ page, site, api, desktop }) => {
    signedIn(api);
    api.refuseSend = { status: 403, reason: 'This desktop isn\'t on your account. Sign in to the account the desktop is signed in to.' };
    await scan(page, desktop, site);
    await expect(message(page)).toHaveText('Pairing with Test Desktop failed.');
    await expect(page.locator('#detail')).toHaveText('This desktop isn\'t on your account. Sign in to the account the desktop is signed in to.');
    await expect.poll(() => desktop.evaluate(() => window.desktop.devices.length)).toBe(0);
});

test('a code whose secret doesn\'t match is refused by the desktop', async ({ page, site, api, desktop }) => {
    signedIn(api);
    // The desktop's QR code holds one secret, and the link the device opened another.
    const link = await desktop.evaluate(() => window.desktop.openInvite());
    await desktop.evaluate(() => { window.desktop.invite.psk = crypto.getRandomValues(new Uint8Array(32)); });
    await page.goto(`${site.origin}${link}`);
    await expect(message(page)).toHaveText('The pairing code didn\'t match. Scan the QR code on the desktop again.');
    await expect.poll(() => desktop.evaluate(() => window.desktop.devices.length)).toBe(0);
});

test('a link that isn\'t a pairing code says so', async ({ page, site, api }) => {
    signedIn(api);
    await page.goto(`${site.origin}/remote/#pair=not-a-code`);
    await expect(message(page)).toHaveText('This link isn\'t a Task Proxy pairing code.');
});

test('a desktop on another version of the protocol says to update', async ({ page, site, api, desktop }) => {
    await desktop.evaluate(() => { window.desktop.version = 2; });
    signedIn(api);
    await scan(page, desktop, site);
    await expect(page.locator('#detail')).toHaveText('This page and Task Proxy on the desktop are different versions. Update Task Proxy on the desktop, or reload this page.');
    await expect(page.locator('#app')).toBeHidden();
});

test('the website\'s own service worker never answers the app\'s requests', async ({ page, site, api, desktop }) => {
    // A visitor who has been to the site has its service worker, which controls every page under /.
    await page.goto(`${site.origin}/__fixtures/blank.html`);
    await page.evaluate(async () => {
        await navigator.serviceWorker.register('/service-worker.js');
        await navigator.serviceWorker.ready;
    });
    await pairAndOpen(page, desktop, site, api);
    await appFrame(page).locator('#second').click();
    await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
    await expect.poll(() => page.locator('#app').evaluate(frame => frame.contentWindow.navigator.serviceWorker.controller?.scriptURL)).toBe(`${site.origin}/remote/sw.js`);
    expect(site.requests.filter(path => ['/app.min.js', '/worker.min.js', '/d/second.md'].includes(path))).toEqual([]);
});
