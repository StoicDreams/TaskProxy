import { test, expect, appFrame, webrtcChromium, FIXED_PUBLIC_KEY, FIXED_CODE } from '../support/remote.mjs';

// Remote Connections (webapp/root_files/remote/): signing in, listing the account's computers, connecting to one with
// a signed offer and answer, being approved, and running the computer's app in a frame through the service worker.
// The computer is the test computer in fixtures/remote/desktop.js, which follows the Remote Connections Protocol page
// on its own, and the app it serves is fixtures/remote/app.
test.use({
    serviceWorkers: 'allow',
    // Two pages in one browser connect over this computer's own addresses, which browsers hide without these.
    launchOptions: {
        executablePath: webrtcChromium(),
        args: ['--allow-loopback-in-peer-connection', '--disable-features=WebRtcHideLocalIpsWithMdns'],
    },
});

const message = page => page.locator('#message');
const detail = page => page.locator('#detail');
const computer = page => page.locator('#desktops li', { hasText: 'Test Desktop' });

/** Opens the page signed in, with the computers listed. */
async function openList(page, site, api) {
    api.signedIn = true;
    await page.goto(`${site.origin}/remote/`);
    await expect(page.locator('#desktops-section')).toBeVisible();
}

/** Connects to the test computer from the list. */
async function connectFromList(page, site, api) {
    await openList(page, site, api);
    await computer(page).getByRole('button', { name: 'Connect' }).click();
}

/** Connects a browser the computer approves, and waits for the app to open in the frame. */
async function connectAndOpen(page, site, api, desktop) {
    await desktop.evaluate(() => { window.desktop.approveFirst = true; });
    await connectFromList(page, site, api);
    await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
}

/**
 * Waits for something the page does on a timer: asking again every few seconds while it waits for approval, or
 * reading the browsers list every 5 seconds. The tests that use it install the page's clock first, and each look
 * moves that clock on a second, so no test waits for those seconds to pass. `read` gives the texts to compare.
 */
async function inTime(pages, read, expected) {
    await expect.poll(async () => {
        for (const page of pages) await page.clock.fastForward(1000);
        return read();
    }).toEqual(expected);
}
const projects = page => appFrame(page).locator('#projects').allTextContents();

/** This browser's own key, as the page keeps it. */
const ownKey = page => page.evaluate(async () => (await (await import('/remote/store.js')).identity()).publicKey);
/** The code a key gives, worked out by the test computer. */
const codeFor = (page, key) => page.evaluate(async key => {
    const text = key.replace(/-/g, '+').replace(/_/g, '/');
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', Uint8Array.from(atob(text), char => char.charCodeAt(0))));
    const letters = Array.from(hash.subarray(0, 6), byte => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[byte % 32]).join('');
    return `${letters.substring(0, 3)}-${letters.substring(3)}`;
}, key);

test.describe('keys, signatures and frames', () => {
    test('a public key is 87 base64url characters, a signature 86, and a fixed key gives its known code', async ({ page, site }) => {
        await page.goto(`${site.origin}/__fixtures/blank.html`);
        const result = await page.evaluate(async ({ fixedKey }) => {
            const crypt = await import('/remote/crypto.js');
            const keys = await crypt.generateKeys();
            const publicKey = await crypt.exportPublicKey(keys);
            const lines = await crypt.offerLines('11111111-2222-3333-4444-555555555555', 1795000000000, 'v=0\r\n');
            const signature = await crypt.sign(keys.privateKey, lines);
            // A signature the fixed key made of the same lines, in another program.
            const fixedSignature = '2wiT06nzIQdBaAR-vbS_1YHNntD1dplyl4TEwaD6RtUusFF5HU7yXqG55CDKU-Mi7K-_xSaq_H66ZEWkEPEtug';
            return {
                publicKey, signature, lines,
                extractable: keys.privateKey.extractable,
                verifies: await crypt.verify(publicKey, signature, lines),
                otherLines: await crypt.verify(publicKey, signature, [...lines.slice(0, 3), 'changed']),
                otherKey: await crypt.verify(fixedKey, signature, lines),
                fixedVerifies: await crypt.verify(fixedKey, fixedSignature, lines),
                malformed: await crypt.verify(fixedKey, 'not a signature', lines),
                fixedCode: await crypt.browserCode(fixedKey),
                answerLines: await crypt.answerLines('c0ffee', 'approval', 'v=0\r\n', undefined),
                isKey: [crypt.isPublicKey(fixedKey), crypt.isPublicKey(publicKey), crypt.isPublicKey(`${fixedKey}=`), crypt.isPublicKey(fixedKey.replace(/^B/, 'A')), crypt.isPublicKey('')],
            };
        }, { fixedKey: FIXED_PUBLIC_KEY });
        expect(result.publicKey).toMatch(/^[A-Za-z0-9_-]{87}$/);
        expect(result.signature).toMatch(/^[A-Za-z0-9_-]{86}$/);
        expect(result.extractable).toBe(false);
        expect(result.lines).toEqual([
            'taskproxy-remote-offer-v1', '11111111-2222-3333-4444-555555555555', '1795000000000',
            '4cf57627095fbc4886de378fcb3407917caca20bf078ca3f0fac3e5ca9b192d8',
        ]);
        // An answer with no SDP has an empty last line.
        expect(result.answerLines).toEqual([
            'taskproxy-remote-answer-v1', 'c0ffee', 'approval', '4cf57627095fbc4886de378fcb3407917caca20bf078ca3f0fac3e5ca9b192d8', '',
        ]);
        expect(result.verifies).toBe(true);
        expect(result.fixedVerifies).toBe(true);
        expect(result.otherLines).toBe(false);
        expect(result.otherKey).toBe(false);
        expect(result.malformed).toBe(false);
        expect(result.fixedCode).toBe(FIXED_CODE);
        expect(result.isKey).toEqual([true, true, false, false, false]);
    });

    test('this browser\'s key is made once, kept where it can be used but not read, and is the same after a reload', async ({ page, site }) => {
        await page.goto(`${site.origin}/__fixtures/blank.html`);
        const read = () => page.evaluate(async () => {
            const own = await (await import('/remote/store.js')).identity();
            const exported = await crypto.subtle.exportKey('jwk', own.privateKey).then(() => 'read', () => 'refused');
            return { publicKey: own.publicKey, type: own.privateKey.type, extractable: own.privateKey.extractable, exported };
        });
        const first = await read();
        expect(first.publicKey).toMatch(/^[A-Za-z0-9_-]{87}$/);
        expect(first).toMatchObject({ type: 'private', extractable: false, exported: 'refused' });
        await page.reload();
        expect((await read()).publicKey).toBe(first.publicKey);
    });

    test('a message is sent as frames of a flag byte and up to 16,383 bytes, the last flagged 1', async ({ page, site }) => {
        await page.goto(`${site.origin}/__fixtures/blank.html`);
        const shapes = await page.evaluate(async () => {
            const { frames } = await import('/remote/connection.js');
            return [0, 1, 16383, 16384, 40000].map(size => frames(new Uint8Array(size).fill(7)).map(frame => [frame[0], frame.length - 1]));
        });
        expect(shapes).toEqual([
            [[1, 0]],
            [[1, 1]],
            [[1, 16383]],
            [[0, 16383], [1, 1]],
            [[0, 16383], [0, 16383], [1, 7234]],
        ]);
    });
});

test.describe('signing in', () => {
    test('signed out, the page offers signing in and comes back to connect', async ({ page, site, api, desktop }) => {
        await page.goto(`${site.origin}/remote/`);
        await expect(message(page)).toHaveText('Sign in to connect to your computers.');
        const signIn = page.getByRole('link', { name: 'Sign In' });
        const target = new URL(await signIn.getAttribute('href'));
        expect(`${target.origin}${target.pathname}`).toBe('https://www.stoicdreams.com/signin');
        expect(target.searchParams.get('domain')).toBe('localhost');
        expect(target.searchParams.get('return')).toBe('/remote/');
        // stoicdreams.com sends the browser back with a sign-in code.
        await page.goto(`${site.origin}/remote/#myfi-signin=good-code`);
        await expect(computer(page)).toBeVisible();
        // The code is off the address, so it isn't bookmarked or shared.
        await expect.poll(() => page.evaluate(() => location.hash)).toBe('');
        expect(api.callsTo('POST', 'user/signin/code').map(call => call.body)).toEqual([{ code: 'good-code' }]);
    });

    test('a refused sign-in code stays on the page with the reason, and offers signing in again', async ({ page, site, api }) => {
        await page.goto(`${site.origin}/remote/#myfi-signin=bad-code`);
        await expect(message(page)).toHaveText('Sign-in failed.');
        await expect(detail(page)).toHaveText('That sign-in code was refused.');
        await expect(page.getByRole('link', { name: 'Sign In Again' })).toHaveAttribute('href', /^https:\/\/www\.stoicdreams\.com\/signin\?/);
        await expect.poll(() => api.calls.map(call => call.path)).toEqual(['user/signin/code']);
    });

    test('a sign-in the browser keeps no session for says so, rather than asking to sign in as if nothing happened', async ({ page, site, api }) => {
        await page.goto(`${site.origin}/remote/#myfi-signin=cookie-blocked-code`);
        await expect(message(page)).toHaveText('Sign-in finished, but this browser is still signed out.');
        await expect(detail(page)).toContainText('blocking the sign-in cookie');
        await expect(page.getByRole('link', { name: 'Sign In Again' })).toBeVisible();
    });

    test('on a phone, the signed-out page shows its message and Sign In, with nothing hidden over them', async ({ page, site, api }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`${site.origin}/remote/`);
        await expect(message(page)).toHaveText('Sign in to connect to your computers.');
        await expect(page.getByRole('heading', { name: 'Remote Connections' })).toBeInViewport({ ratio: 1 });
        // The app's frame, the lists and the code stay hidden until they are used, whatever Web UI's stylesheet says.
        await expect(page.locator('#app')).toBeHidden();
        await expect(page.locator('#desktops-section')).toBeHidden();
        await expect(page.locator('#browsers')).toBeHidden();
        await expect(page.locator('#code-line')).toBeHidden();
        // A trial click checks that Sign In is the element a tap there reaches, without leaving the page.
        await page.getByRole('link', { name: 'Sign In' }).click({ trial: true });
    });
});

test.describe('the list of computers', () => {
    test('lists the account\'s computers by name, with which are active, and this browser\'s own code', async ({ page, site, api, desktop }) => {
        api.desktops.push({ desktopId: '11111111-1111-1111-1111-111111111111', name: 'Laptop', publicKey: FIXED_PUBLIC_KEY, active: false, lastSeen: 1795000000000 });
        await openList(page, site, api);
        await expect(message(page)).toHaveText('Choose a computer to connect to.');
        await expect(page.locator('#desktops li .name')).toHaveText(['Test Desktop', 'Laptop']);
        await expect(computer(page).locator('.state')).toHaveText('Active');
        await expect(page.locator('#desktops li', { hasText: 'Laptop' }).locator('.state')).toHaveText(/^Not active · last seen .*20\d\d/);
        await expect(page.getByRole('button', { name: 'Connect' })).toHaveCount(2);
        const code = await codeFor(desktop, await ownKey(page));
        await expect(page.locator('#own')).toHaveText(`This browser is Chrome on Linux, with the code ${code}.`);
    });

    test('with no computers, says none have Remote Connections on', async ({ page, site, api }) => {
        await openList(page, site, api);
        await expect(message(page)).toHaveText('None of your computers have Remote Connections on.');
        await expect(page.locator('#desktops li')).toHaveCount(0);
    });

    test('a computer\'s name is shown as text, never as markup', async ({ page, site, api }) => {
        api.desktops.push({ desktopId: '11111111-1111-1111-1111-111111111111', name: '<img src=x onerror="window.injected=1">', publicKey: FIXED_PUBLIC_KEY, active: true, lastSeen: Date.now() });
        await openList(page, site, api);
        await expect(page.locator('#desktops li .name')).toHaveText('<img src=x onerror="window.injected=1">');
        expect(await page.evaluate(() => window.injected)).toBeUndefined();
    });

    test('Turn Off asks first, then turns Remote Connections off for that computer', async ({ page, site, api, desktop }) => {
        await openList(page, site, api);
        const desktopId = api.desktops[0].desktopId;
        await computer(page).getByRole('button', { name: 'Turn Off' }).click();
        await expect(message(page)).toHaveText('Turn off Remote Connections on Test Desktop?');
        // Cancel leaves it on.
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(computer(page)).toBeVisible();
        expect(api.callsTo('DELETE', 'remote/desktop')).toEqual([]);
        await computer(page).getByRole('button', { name: 'Turn Off' }).click();
        await page.locator('#actions').getByRole('button', { name: 'Turn Off' }).click();
        await expect(message(page)).toHaveText('None of your computers have Remote Connections on.');
        expect(api.callsTo('DELETE', 'remote/desktop').map(call => call.body)).toEqual([{ desktopId }]);
    });
});

test.describe('connecting', () => {
    test('an approved browser connects, and the app runs in the frame from the computer, never from the website', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        const app = appFrame(page);
        // The frame's address is the app's own route, so the app's paths work as they do on the computer.
        await expect(app.locator('#route')).toHaveText('/');
        await expect(app.locator('#remote')).toHaveText(JSON.stringify({ deviceName: 'Chrome on Linux', desktopName: 'Test Desktop' }));
        // A command the computer refuses rejects with its reason, as Tauri's invoke does.
        await expect(app.locator('#refused')).toHaveText('Only the desktop can do that.');
        // The app's worker starts from the computer's script.
        await expect(app.locator('#worker')).toHaveText('42');
        // A message too long for one frame arrives whole, each way.
        await expect(app.locator('#echo')).toHaveText('true');
        // Events reach the app's listeners.
        await desktop.evaluate(() => window.desktop.emit('run-changed', { name: 'deploy.ps1' }));
        await expect(app.locator('#events li')).toHaveText(['run-changed: deploy.ps1']);
        // Moving to another page loads its markdown from the computer.
        await app.locator('#second').click();
        await expect(app.locator('#route')).toHaveText('/second');
        await expect(app.locator('#page')).toHaveText('The second page, from the desktop.');
        // None of the app's files were asked of the website.
        const appPaths = ['/app.min.js', '/css/app.min.css', '/worker.min.js', '/d/second.md', '/second', '/remote/app/'];
        expect(site.requests.filter(path => appPaths.includes(path) || path.startsWith('/remote/app/'))).toEqual([]);
        await expect.poll(() => desktop.evaluate(() => window.desktop.log)).toEqual(expect.arrayContaining(['remote_app_file', 'get_projects', 'desktop_only_command', 'remote_browsers']));
        // The app's own service worker isn't registered: only the page's.
        await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).map(registration => new URL(registration.scope).pathname))).toEqual(['/remote/app/']);
    });

    test('the offer is the signed JSON the computer accepts, sent once, with the API\'s servers given to the connection', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        // The computer checked the version, the fields, the signature for its own id, and the time.
        const offers = await desktop.evaluate(() => window.desktop.offers);
        expect(offers.map(item => item.problem)).toEqual(['']);
        const offer = offers[0].offer;
        expect(Object.keys(offer).sort()).toEqual(['browserKey', 'browserName', 'sdp', 'sig', 'time', 'v']);
        expect(offer.v).toBe(1);
        expect(offer.browserName).toBe('Chrome on Linux');
        expect(offer.browserKey).toBe(await ownKey(page));
        expect(offer.browserKey).toMatch(/^[A-Za-z0-9_-]{87}$/);
        expect(offer.sig).toMatch(/^[A-Za-z0-9_-]{86}$/);
        // One data channel, named taskproxy, with every address already in the SDP.
        expect(offer.sdp).toContain('m=application');
        expect(offer.sdp).toContain('a=candidate:');
        await expect.poll(() => desktop.evaluate(() => window.desktop.connections.map(connection => connection.data.label))).toEqual(['taskproxy']);
        const sent = api.callsTo('POST', 'remote/connect');
        expect(sent.map(call => Object.keys(call.body).sort())).toEqual([['desktopId', 'offer']]);
        expect(sent[0].body.desktopId).toBe(api.desktops[0].desktopId);
        expect(JSON.parse(sent[0].body.offer)).toEqual(offer);
        // The servers are read before the connection is made, and passed to it.
        expect(api.callsTo('GET', 'remote/servers')).toHaveLength(1);
        expect(await page.evaluate(() => window.peerSettings)).toEqual([{ iceServers: [{ urls: 'stun:api.myfi.ws:3478' }] }]);
    });

    test('a browser the computer hasn\'t seen shows its own code and waits, then connects once approved on the computer', async ({ page, site, api, desktop }) => {
        await page.clock.install();
        await connectFromList(page, site, api);
        await expect(message(page)).toHaveText('Waiting for Test Desktop to approve this browser');
        const key = await ownKey(page);
        const code = await codeFor(desktop, key);
        await expect(page.locator('#browser-code')).toHaveText(code);
        await expect(page.locator('#app')).toBeHidden();
        // The computer kept the request, under the key and name the browser sent.
        expect(await desktop.evaluate(() => window.desktop.waiting.map(item => [item.key, item.name]))).toEqual([[key, 'Chrome on Linux']]);
        // It asks again with a new offer, which the computer answers the same way.
        await inTime([page], () => desktop.evaluate(() => window.desktop.offers.length > 1), true);
        const [first, second] = await desktop.evaluate(() => window.desktop.offers.map(item => item.offer));
        expect(second.sig).not.toBe(first.sig);
        expect(await desktop.evaluate(() => window.desktop.offers.map(item => item.problem).filter(Boolean))).toEqual([]);
        expect(await desktop.evaluate(() => window.desktop.waiting.length)).toBe(1);
        // Someone approves it in Task Proxy on the computer, and its next offer connects.
        expect(await desktop.evaluate(key => window.desktop.approve(key), key)).toBe(true);
        await inTime([page], () => projects(page), ['Storefront, Docs']);
        await expect(page.locator('#code-line')).toBeHidden();
    });

    test('Cancel stops waiting for approval and lists the computers again', async ({ page, site, api, desktop }) => {
        await connectFromList(page, site, api);
        await expect(message(page)).toHaveText('Waiting for Test Desktop to approve this browser');
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(message(page)).toHaveText('Choose a computer to connect to.');
        await expect(page.locator('#code-line')).toBeHidden();
        // Approved after that, it still doesn't connect until asked to.
        await desktop.evaluate(() => { window.desktop.approve(window.desktop.waiting[0].key); });
        await computer(page).getByRole('button', { name: 'Connect' }).click();
        await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
    });

    test('an answer signed with another key is treated as no answer, even when it says ok', async ({ page, site, api, desktop }) => {
        await desktop.evaluate(() => { window.desktop.approveFirst = true; window.desktop.signing = 'wrong'; });
        await connectFromList(page, site, api);
        await expect(message(page)).toHaveText('Test Desktop didn\'t answer.');
        await expect(detail(page)).toContainText('wasn\'t signed with the key this browser remembers');
        await expect(page.locator('#app')).toBeHidden();
        // The computer made its side ready, and nothing connected to it.
        expect(api.answersGiven).toBe(1);
        expect(await desktop.evaluate(() => window.desktop.connections.length)).toBe(0);
        // Signed properly, Try Again connects.
        await desktop.evaluate(() => { window.desktop.signing = 'own'; });
        await page.getByRole('button', { name: 'Try Again' }).click();
        await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
    });

    test('an answer with no signature is treated as no answer', async ({ page, site, api, desktop }) => {
        await desktop.evaluate(() => { window.desktop.approveFirst = true; window.desktop.signing = 'none'; });
        await connectFromList(page, site, api);
        await expect(message(page)).toHaveText('Test Desktop didn\'t answer.');
        await expect(detail(page)).toContainText('wasn\'t signed with the key this browser remembers');
        await expect(page.locator('#app')).toBeHidden();
    });

    test('an unsigned answer asking for approval doesn\'t start the wait for approval', async ({ page, site, api, desktop }) => {
        await desktop.evaluate(() => { window.desktop.signing = 'wrong'; });
        await connectFromList(page, site, api);
        await expect(message(page)).toHaveText('Test Desktop didn\'t answer.');
        await expect(page.locator('#code-line')).toBeHidden();
    });

    test('a computer whose listed key changed stops with a warning, and connects only once the new key is trusted', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        await page.getByRole('button', { name: 'Disconnect' }).click();
        await expect(message(page)).toHaveText('Disconnected.');
        // Task Proxy's data was removed from the computer, so it has a new key, which the API now lists.
        api.desktops[0].publicKey = await desktop.evaluate(() => window.desktop.newKey());
        await page.getByRole('button', { name: 'Your Computers' }).click();
        const asked = api.callsTo('POST', 'remote/connect').length;
        await computer(page).getByRole('button', { name: 'Connect' }).click();
        await expect(message(page)).toHaveText('Test Desktop\'s key has changed.');
        await expect(page.locator('#app')).toBeHidden();
        // Leaving the warning trusts nothing: connecting again warns again, and no offer was sent.
        await page.getByRole('button', { name: 'Your Computers' }).click();
        await computer(page).getByRole('button', { name: 'Connect' }).click();
        await expect(message(page)).toHaveText('Test Desktop\'s key has changed.');
        expect(api.callsTo('POST', 'remote/connect')).toHaveLength(asked);
        await page.getByRole('button', { name: 'Trust the New Key' }).click();
        await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
        // The new key is the remembered one from then on.
        await page.getByRole('button', { name: 'Disconnect' }).click();
        await page.getByRole('button', { name: 'Connect Again' }).click();
        await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
    });

    test('the remembered key is the one believed: a new key the API doesn\'t list yet is no answer', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        await page.getByRole('button', { name: 'Disconnect' }).click();
        await desktop.evaluate(() => window.desktop.newKey());
        await page.getByRole('button', { name: 'Connect Again' }).click();
        await expect(message(page)).toHaveText('Test Desktop didn\'t answer.');
        await expect(detail(page)).toContainText('wasn\'t signed with the key this browser remembers');
    });

    test('a browser the computer refuses is told so', async ({ page, site, api, desktop }) => {
        await page.clock.install();
        await connectFromList(page, site, api);
        await expect(message(page)).toHaveText('Waiting for Test Desktop to approve this browser');
        // Someone refuses it on the computer.
        await desktop.evaluate(() => { window.desktop.remove(window.desktop.waiting[0].key); });
        await inTime([page], () => message(page).textContent(), 'Test Desktop refused this browser.');
        await expect(page.locator('#code-line')).toBeHidden();
        await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
    });

    test('a computer that never answers says so', async ({ page, site, api, desktop }) => {
        api.requestsEnd = true;
        await connectFromList(page, site, api);
        await expect(message(page)).toHaveText('Test Desktop didn\'t answer.');
        await expect(detail(page)).toHaveText('Check that Task Proxy is open on it and signed in, then try again.');
        await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
    });

    test('a computer that has been turned off says so, with the API\'s reason', async ({ page, site, api, desktop }) => {
        await openList(page, site, api);
        api.desktops = [];
        await computer(page).getByRole('button', { name: 'Connect' }).click();
        await expect(message(page)).toHaveText('Couldn\'t connect to Test Desktop.');
        await expect(detail(page)).toHaveText('This computer isn\'t on your account, or Remote Connections is off on it.');
    });

    test('when the computer answers but the two can\'t reach each other, the page says so 30 seconds after asking', async ({ page, site, api, desktop }) => {
        await page.clock.install();
        await desktop.evaluate(() => { window.desktop.approveFirst = true; window.desktop.unreachable = true; });
        await connectFromList(page, site, api);
        // The browser has the computer's answer, and from here only waits for the channel to open.
        await expect.poll(() => api.answersGiven).toBe(1);
        await expect(message(page)).toHaveText('Connecting to Test Desktop');
        await page.clock.fastForward(30000);
        await expect(message(page)).toHaveText('This browser and Test Desktop couldn\'t reach each other.');
        await expect(detail(page)).toContainText('there is no relay');
        await expect(page.locator('#app')).toBeHidden();
    });

    test('a computer on another version of the protocol says to update', async ({ page, site, api, desktop }) => {
        await desktop.evaluate(() => { window.desktop.version = 3; window.desktop.approveFirst = true; });
        await connectFromList(page, site, api);
        await expect(detail(page)).toHaveText('This page and Task Proxy on the computer are different versions. Update Task Proxy on the computer, or reload this page.');
        await expect(page.locator('#app')).toBeHidden();
    });
});

test.describe('connected', () => {
    test('a connected browser sees another browser waiting, approves it by its code, and can remove it again', async ({ page, otherPage, site, api, desktop }) => {
        await page.clock.install();
        await otherPage.clock.install();
        await connectAndOpen(page, site, api, desktop);
        const toggle = page.locator('#browsers-button');
        await expect(toggle).toHaveText('Browsers');
        // A second browser, with its own key, asks to connect and shows its code.
        await connectFromList(otherPage, site, api);
        await expect(message(otherPage)).toHaveText('Waiting for Test Desktop to approve this browser');
        const otherCode = await otherPage.locator('#browser-code').textContent();
        expect(otherCode).toMatch(/^[A-HJ-NP-Z2-9]{3}-[A-HJ-NP-Z2-9]{3}$/);
        // The first browser hears of it, and lists it with the same code, worked out from its key.
        await inTime([page], () => toggle.textContent(), 'Browsers (1 waiting)');
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        const waiting = page.locator('#browsers-waiting li');
        await expect(waiting).toHaveCount(1);
        await expect(waiting.locator('.code')).toHaveText(otherCode);
        await expect(waiting.locator('.name')).toHaveText('Chrome on Linux');
        const approved = page.locator('#browsers-approved li');
        await expect(approved).toHaveCount(1);
        await expect(approved.locator('.state')).toContainText('This browser');
        await expect(approved.locator('.code')).toHaveText(await codeFor(desktop, await ownKey(page)));
        // Approved from here, the second browser's next offer connects.
        await waiting.getByRole('button', { name: 'Approve' }).click();
        await expect(waiting).toHaveCount(0);
        await expect(page.locator('#browsers-none')).toBeVisible();
        await expect(approved).toHaveCount(2);
        await expect(toggle).toHaveText('Browsers');
        await inTime([otherPage], () => projects(otherPage), ['Storefront, Docs']);
        expect(await desktop.evaluate(() => window.desktop.log)).toEqual(expect.arrayContaining(['remote_browsers', 'remote_browser_approve']));
        // Removing it ends its connection, and leaves this one open.
        await approved.filter({ hasText: otherCode }).getByRole('button', { name: 'Remove', exact: true }).click();
        await expect(approved).toHaveCount(1);
        await expect(message(otherPage)).toHaveText(/closed the connection|was lost/);
        await expect(otherPage.locator('#app')).toBeHidden();
        await toggle.click();
        await expect(page.locator('#browsers')).toBeHidden();
        await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
    });

    test('a connected browser refuses a waiting browser, which is then told it was refused', async ({ page, otherPage, site, api, desktop }) => {
        await page.clock.install();
        await otherPage.clock.install();
        await connectAndOpen(page, site, api, desktop);
        await connectFromList(otherPage, site, api);
        await expect(message(otherPage)).toHaveText('Waiting for Test Desktop to approve this browser');
        await inTime([page], () => page.locator('#browsers-button').textContent(), 'Browsers (1 waiting)');
        await page.locator('#browsers-button').click();
        await page.locator('#browsers-waiting li').getByRole('button', { name: 'Refuse' }).click();
        await expect(page.locator('#browsers-waiting li')).toHaveCount(0);
        await inTime([otherPage], () => message(otherPage).textContent(), 'Test Desktop refused this browser.');
    });

    test('a browser the computer lists is shown by the code its key gives, never a code or markup the computer sent', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        await desktop.evaluate(key => {
            window.desktop.browsers = async asking => ({
                approved: window.desktop.approved.map(item => ({ ...item, code: 'AAA-AAA', current: item.key === asking })),
                waiting: [{ key, name: '<b id="injected">Phone</b>', code: 'ZZZ-ZZZ', asked: Date.now() }, { key: 'not a key', name: 'Broken', code: 'BBB-BBB', asked: Date.now() }],
            });
        }, FIXED_PUBLIC_KEY);
        await page.locator('#browsers-button').click();
        const waiting = page.locator('#browsers-waiting li');
        await expect(waiting).toHaveCount(1);
        await expect(waiting.locator('.code')).toHaveText(FIXED_CODE);
        await expect(waiting.locator('.name')).toHaveText('<b id="injected">Phone</b>');
        await expect(page.locator('#injected')).toHaveCount(0);
        await expect(page.locator('#browsers-approved li .code')).not.toHaveText('AAA-AAA');
    });

    test('reloading the page connects again, and opens the app where it was', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        await appFrame(page).locator('#second').click();
        await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
        await page.reload();
        await expect(appFrame(page).locator('#route')).toHaveText('/second');
        await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
        await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
    });

    test('reloading the frame alone opens the app again rather than the website', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        await appFrame(page).locator('#second').click();
        await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
        await page.locator('#app').evaluate(frame => frame.contentWindow.location.reload());
        await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
        await expect(appFrame(page).locator('#website')).toHaveCount(0);
    });

    test('an event that never arrived opens the app again from the computer', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        await desktop.evaluate(() => window.desktop.emit('run-changed', { name: 'first.ps1' }));
        await expect(appFrame(page).locator('#events li')).toHaveText(['run-changed: first.ps1']);
        const files = await desktop.evaluate(() => window.desktop.log.filter(cmd => cmd === 'get_projects').length);
        // The event numbered 2 is lost, so what the app shows may be out of date.
        await desktop.evaluate(() => window.desktop.emit('run-changed', { name: 'third.ps1' }, { skip: true }));
        await expect.poll(() => desktop.evaluate(() => window.desktop.log.filter(cmd => cmd === 'get_projects').length)).toBe(files + 1);
        await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
        // It opens once, and hears the events that follow.
        await desktop.evaluate(() => window.desktop.emit('run-changed', { name: 'fourth.ps1' }));
        await expect(appFrame(page).locator('#events li')).toHaveText(['run-changed: fourth.ps1']);
        expect(await desktop.evaluate(() => window.desktop.log.filter(cmd => cmd === 'get_projects').length)).toBe(files + 1);
    });

    test('when the computer ends the connection, the page says so and can connect again', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        await desktop.evaluate(() => window.desktop.dropAll());
        await expect(page.locator('#app')).toBeHidden();
        await expect(page.locator('#connected-bar')).toBeHidden();
        await expect(message(page)).toHaveText(/closed the connection|was lost/);
        await page.getByRole('button', { name: 'Connect Again' }).click();
        await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
    });

    test('Disconnect closes the app and lists the computers, where Connect opens it again', async ({ page, site, api, desktop }) => {
        await connectAndOpen(page, site, api, desktop);
        await page.getByRole('button', { name: 'Disconnect' }).click();
        await expect(page.locator('#app')).toBeHidden();
        await expect(message(page)).toHaveText('Disconnected.');
        await page.getByRole('button', { name: 'Your Computers' }).click();
        await expect(computer(page).locator('.state')).toHaveText('Active');
        await computer(page).getByRole('button', { name: 'Connect' }).click();
        await expect(appFrame(page).locator('#projects')).toHaveText('Storefront, Docs');
    });

    test('the website\'s own service worker never answers the app\'s requests', async ({ page, site, api, desktop }) => {
        // A visitor who has been to the site has its service worker, which controls every page under /.
        await page.goto(`${site.origin}/__fixtures/blank.html`);
        await page.evaluate(async () => {
            await navigator.serviceWorker.register('/service-worker.js');
            await navigator.serviceWorker.ready;
        });
        await connectAndOpen(page, site, api, desktop);
        await appFrame(page).locator('#second').click();
        await expect(appFrame(page).locator('#page')).toHaveText('The second page, from the desktop.');
        await expect.poll(() => page.locator('#app').evaluate(frame => frame.contentWindow.navigator.serviceWorker.controller?.scriptURL)).toBe(`${site.origin}/remote/sw.js`);
        expect(site.requests.filter(path => ['/app.min.js', '/worker.min.js', '/d/second.md'].includes(path))).toEqual([]);
    });
});
